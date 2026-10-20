// Pure domain functions, shared by the browser and Node's built-in test runner.
export const MAX_ROWS = 300;
export const MAX_FILE_BYTES = 2 * 1024 * 1024;
const STOP = new Set('a an and are as at be been but by can could do for from had has have i if in into is it its me my of on or our so that the their them there these they this to us was we were when which with would you your please need want get use using able also not'.split(' '));
const ALIASES = { exports:'export', exporting:'export', exported:'export', reports:'report', reporting:'report', notifications:'notification', alerts:'notification', alert:'notification', permissions:'permission', roles:'role', searches:'search', searching:'search', searched:'search', invoices:'invoice', billing:'invoice', invites:'invite', inviting:'invite', integrations:'integration', loading:'load', loaded:'load', filters:'filter', filtering:'filter' };
export function tokens(text) {
  return (text.toLowerCase().match(/[\p{L}\p{N}]+/gu) || []).map(t => ALIASES[t] || t).filter(t => t.length > 2 && !STOP.has(t));
}
export function parseCSV(text) {
  text = text.replace(/^\uFEFF/, '');
  let rows = [], row = [], value = '', quoted = false, closed = false;
  for (let i=0;i<text.length;i++) {
    const c=text[i];
    if (quoted) {
      if(c==='"' && text[i+1]==='"') { value+='"'; i++; }
      else if(c==='"') { quoted=false; closed=true; }
      else value+=c;
    } else if(c===',') { row.push(value); value=''; closed=false; }
    else if(c==='\n' || c==='\r') {
      if(c==='\r' && text[i+1]==='\n') i++;
      row.push(value); if(row.some(v=>v.trim())) rows.push(row);
      row=[];value='';closed=false;
    } else if(c==='"') {
      if(value!=='' || closed) throw new Error('Unexpected quote in CSV. Wrap fields containing commas or quotes in double quotes.');
      quoted=true;
    } else {
      if(closed) throw new Error('Unexpected characters after a quoted CSV field.');
      value+=c;
    }
  }
  if(quoted) throw new Error('The CSV ends inside a quoted field. Check for a missing closing quote.');
  row.push(value); if(row.some(v=>v.trim())) rows.push(row);
  if(rows.length<2) throw new Error('Include a header row and at least one feedback record.');
  const headers=rows.shift().map(h=>h.trim().toLowerCase());
  if(new Set(headers).size!==headers.length) throw new Error('Column headers must be unique.');
  if(!headers.includes('feedback')) throw new Error('A column named feedback is required. Download the template for the supported format.');
  if(rows.length>MAX_ROWS) throw new Error(`This version supports up to ${MAX_ROWS} rows per import.`);
  const seen=new Set();
  return rows.map((r,index)=>{
    if(r.length!==headers.length) throw new Error(`Record ${index+1} has ${r.length} fields; expected ${headers.length}.`);
    const data=Object.fromEntries(headers.map((h,i)=>[h,r[i].trim()]));
    if(!data.feedback) throw new Error(`Record ${index+1} has empty feedback.`);
    if(data.feedback.length>5000) throw new Error(`Record ${index+1} exceeds 5,000 characters of feedback.`);
    const id=data.id || `F${String(index+1).padStart(3,'0')}`;
    if(seen.has(id)) throw new Error(`Duplicate feedback ID: ${id}. IDs must be unique.`);
    seen.add(id);
    return {id, text:data.feedback, customer:data.customer || 'Unspecified', source:data.source || 'Unspecified', date:data.date || '', segment:data.segment || 'Unspecified'};
  });
}
export function suggestThemes(records) {
  const docTokens=records.map(r=>tokens(r.text));
  const frequency=new Map();
  docTokens.forEach(ts=>new Set(ts).forEach(t=>frequency.set(t,(frequency.get(t)||0)+1)));
  const vectors=docTokens.map(ts=>{
    const counts=new Map(); ts.forEach(t=>counts.set(t,(counts.get(t)||0)+1));
    const vector=new Map([...counts].map(([t,n])=>[t,(1+Math.log(n))*(1+Math.log((records.length+1)/((frequency.get(t)||0)+1)))]));
    const norm=Math.sqrt([...vector.values()].reduce((a,b)=>a+b*b,0))||1;
    return new Map([...vector].map(([t,v])=>[t,v/norm]));
  });
  const cosine=(a,b)=>[...a].reduce((sum,[t,w])=>sum+w*(b.get(t)||0),0);
  // Compare to a fixed representative, avoiding transitive chains of weak matches.
  const groups=[];
  records.forEach((record,index)=>{
    let best=null,score=.16;
    for(const group of groups) { const similarity=cosine(vectors[index],vectors[group.representative]); if(similarity>score){score=similarity;best=group;} }
    if(best) best.ids.push(record.id);
    else groups.push({representative:index,ids:[record.id]});
  });
  return groups.map((g,index)=>{
    const counts=new Map();
    g.ids.forEach(id=>tokens(records.find(r=>r.id===id).text).forEach(t=>counts.set(t,(counts.get(t)||0)+1)));
    const top=[...counts].sort((a,b)=>b[1]-a[1] || a[0].localeCompare(b[0])).slice(0,3).map(([t])=>t);
    return {id:`T${index+1}`,name:top.length?top.join(' / '):'Needs review',ids:g.ids,reviewed:false,reach:0,impact:1,confidence:50,effort:1,notes:''};
  });
}
export function priorityScore(theme) {
  const {reach,impact,confidence,effort}=theme;
  if(![reach,impact,confidence,effort].every(Number.isFinite) || reach<0 || impact<0 || impact>3 || confidence<0 || confidence>100 || effort<=0) return 0;
  return Math.round((reach*impact*(confidence/100)/effort)*10)/10;
}
export function rankThemes(themes) { return [...themes].sort((a,b)=>priorityScore(b)-priorityScore(a) || a.name.localeCompare(b.name)); }
export function moveFeedback(themes,feedbackId,targetId) {
  if(!themes.some(t=>t.id===targetId)) throw new Error('Target theme not found.');
  return themes.map(t=>{
    const wasMember=t.ids.includes(feedbackId), isTarget=t.id===targetId;
    return {...t,ids:[...t.ids.filter(id=>id!==feedbackId),...(isTarget?[feedbackId]:[])],reviewed:(wasMember || isTarget)?false:t.reviewed};
  });
}
export function escapeHTML(value) { return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function markdown(value) { return String(value).replace(/[\\`*_{}\[\]<>#|]/g,'\\$&').replace(/\r?\n/g,' '); }
export function exportBrief(records,themes) {
  const lines=['# Feedback to Roadmap — decision brief','','## Context','',`Feedback records: ${records.length}. Themes: ${themes.length}. Reviewed themes: ${themes.filter(t=>t.reviewed).length}.`,'','This report supports human decisions. Local text-similarity suggestions are not validated customer findings. Scores use manually entered assumptions; a zero score may mean reach has not been estimated.','','## Scoring method','','RICE = estimated quarterly users reached × impact × confidence / effort in person-weeks. Impact: 0.25 minimal, 0.5 low, 1 medium, 2 high, 3 massive. Confidence is a percentage. Scores are relative priorities, not forecasts.',''];
  for(const t of rankThemes(themes)) {
    lines.push(`## ${markdown(t.name)}`,'',`Status: ${t.reviewed?'Human reviewed':'Needs review'} | Score: ${priorityScore(t)} | Evidence: ${t.ids.length} records`,'',`Assumptions: reach ${t.reach}; impact ${t.impact}; confidence ${t.confidence}%; effort ${t.effort} person-weeks.`,'','### Decision notes','',t.notes?markdown(t.notes):'No decision recorded. Validate the need and document the proposed action.','','### Source evidence','');
    for(const id of t.ids){const r=records.find(r=>r.id===id);if(r)lines.push(`- **${markdown(r.id)}** — ${markdown(r.customer)} · ${markdown(r.source)}: “${markdown(r.text)}”`);}
    lines.push('');
  }
  lines.push('## Before committing to a roadmap','','- Confirm these themes with customers, including customers who did not submit feedback.','- Check duplicate requests, account coverage, and contradictory evidence.','- Validate reach, confidence, impact, and effort with the team.','- Define an outcome metric and a test before committing to delivery.','');
  return lines.join('\n');
}
