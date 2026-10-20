import {parseWorkspace,serializeWorkspace,mergeThemes,searchFeedback,MAX_WORKSPACE_BYTES,MAX_THEMES,parseCSV,suggestThemes,priorityScore,rankThemes,moveFeedback,escapeHTML as e,exportBrief,MAX_FILE_BYTES} from './core.mjs';
const $=selector=>document.querySelector(selector);
let records=[],themes=[],selected='',dataset='',nextTheme=1,changed=false;
function announce(text,error=false){const node=$('#message');node.textContent=text;node.className=error?'error':'success';}
function confirmReplace(){
  if(!records.length)return Promise.resolve(true);
  const dialog=$('#replace-dialog');dialog.returnValue='cancel';
  return new Promise(resolve=>{dialog.addEventListener('close',()=>resolve(dialog.returnValue==='confirm'),{once:true});dialog.showModal();});
}
async function load(text,name){
  const parsed=parseCSV(text); // Validate before asking to replace existing work.
  if(!await confirmReplace())return;
  records=parsed;themes=suggestThemes(records);selected=themes[0].id;dataset=name.slice(0,255);nextTheme=themes.length+1;changed=true;
  $('#search-feedback').value='';$('#source-filter').value='';render();announce(`Imported ${records.length} records. ${themes.length} suggested themes are ready for your review.`);
}
$('#csv-file').addEventListener('change',async event=>{
  const file=event.target.files[0];if(!file)return;
  try {if(file.size>MAX_FILE_BYTES)throw new Error('Choose a CSV file smaller than 2 MB.');await load(await file.text(),file.name);}
  catch(error){announce(error.message,true);}finally{event.target.value='';}
});
$('#sample').addEventListener('click',async()=>{
  try{const response=await fetch('data/sample-feedback.csv');if(!response.ok)throw new Error('Could not load sample data.');await load(await response.text(),'Fictional demo · 16 sample comments');}
  catch(error){announce(`${error.message} Follow the README’s local preview instructions if you opened the HTML directly.`,true);}
});
function render(){
  $('#empty').hidden=!!records.length;$('#populated').hidden=!records.length;
  if(!records.length)return;
  $('#dataset-label').textContent=dataset;renderStats();renderThemes();renderDetail();renderPriorities();renderSearch();
}
function renderStats(){
  const customers=new Set(records.filter(r=>r.customer!=='Unspecified').map(r=>r.customer)).size;
  const reviewed=themes.filter(t=>t.reviewed).length;
  $('#stats').innerHTML=[[records.length,'Feedback records'],[customers,'Named customers'],[themes.length,'Opportunity themes'],[`${reviewed}/${themes.length}`,'Themes reviewed']].map(([n,label])=>`<div><strong>${n}</strong><span>${label}</span></div>`).join('');
}
function renderThemes(){
  $('#themes').innerHTML=themes.map(t=>`<button class="theme-button ${t.id===selected?'selected':''}" data-theme="${e(t.id)}" aria-pressed="${t.id===selected}"><span class="theme-name">${e(t.name)}</span><span class="theme-meta">${t.ids.length} records <span>${t.reviewed?'Reviewed':'Needs review'}</span></span></button>`).join('');
}
$('#themes').addEventListener('click',event=>{
  const button=event.target.closest('[data-theme]');if(!button)return;
  selected=button.dataset.theme;renderThemes();renderDetail();$('#theme-name').focus();
});
function renderDetail(){
  const t=themes.find(t=>t.id===selected);if(!t)return;
  const evidence=t.ids.map(id=>records.find(r=>r.id===id));
  $('#theme-detail').innerHTML=`<div class="theme-detail-head"><p class="eyebrow">${e(t.id)} / SOURCE EVIDENCE</p><form id="rename"><label for="theme-name">Opportunity name</label><div class="inline-form"><input id="theme-name" name="themeName" value="${e(t.name)}" maxlength="120" required><button class="button" type="submit">Save name</button></div></form><label class="review-check"><input type="checkbox" id="reviewed" ${t.reviewed?'checked':''}> I have reviewed this theme and its source evidence</label><div class="merge-controls"><label for="merge-target">Combine this opportunity with</label><select id="merge-target" ${themes.length<2?'disabled':''}><option value="">Choose another theme</option>${themes.filter(other=>other.id!==t.id).map(other=>`<option value="${e(other.id)}">${e(other.name)}</option>`).join('')}</select><button id="merge-theme" class="button" type="button" ${themes.length<2?'disabled':''}>Merge into selected</button></div></div>
  <div class="decision-notes"><label for="notes">Decision notes</label><p class="hint">Capture the problem, proposed action, supporting evidence, and open questions.</p><textarea id="notes" rows="3" maxlength="6000" placeholder="What should we investigate or change—and why?">${e(t.notes)}</textarea></div>
  <div class="evidence-heading"><h3>What customers actually said</h3><span>${evidence.length} records</span></div>
  <div class="evidence-list">${evidence.length?evidence.map(r=>`<article class="feedback-card"><div class="feedback-meta"><span>${e(r.id)} · ${e(r.source)}</span><span>${e(r.date || 'Date not provided')}</span></div><blockquote>${e(r.text)}</blockquote><p class="customer">${e(r.customer)} <span>· ${e(r.segment)}</span></p><label class="move-label">Move to theme<select data-move="${e(r.id)}" aria-label="Move feedback ${e(r.id)} to theme">${themes.map(option=>`<option value="${e(option.id)}" ${option.id===selected?'selected':''}>${e(option.name)}</option>`).join('')}</select></label></article>`).join(''):'<p class="empty-theme">No feedback here yet. Move evidence from another theme to start building this opportunity.</p>'}</div>`;
}
$('#theme-detail').addEventListener('submit',event=>{
  if(event.target.id!=='rename')return;event.preventDefault();
  const name=$('#theme-name').value.trim();if(!name){announce('Enter a theme name.',true);return;}
  themes.find(t=>t.id===selected).name=name;changed=true;renderThemes();renderPriorities();renderDetail();$('#theme-name').focus();renderSearch();announce('Theme renamed.');
});
$('#theme-detail').addEventListener('input',event=>{
  if(event.target.id==='notes'){themes.find(t=>t.id===selected).notes=event.target.value;changed=true;}
});
$('#theme-detail').addEventListener('change',event=>{
  const t=themes.find(t=>t.id===selected);
  if(event.target.id==='reviewed'){t.reviewed=event.target.checked;changed=true;renderStats();renderThemes();renderPriorities();}
  if(event.target.dataset.move){themes=moveFeedback(themes,event.target.dataset.move,event.target.value);changed=true;render();$('#theme-name').focus();announce('Feedback moved. Review status was reset for the affected themes.');}
});
$('#add-theme').addEventListener('click',()=>{
  if(themes.length>=MAX_THEMES){announce('This workspace supports up to 600 themes.',true);return;}
  while(themes.some(t=>t.id===`T${nextTheme}`))nextTheme++;
  const id=`T${nextTheme++}`;themes.push({id,name:'New opportunity',ids:[],reviewed:false,reach:0,impact:1,confidence:50,effort:1,notes:''});selected=id;changed=true;render();$('#theme-name').focus();$('#theme-name').select();
});
function renderPriorities(){
  $('#priorities').innerHTML=rankThemes(themes).map(t=>`<tr><th scope="row"><button class="table-theme" data-select="${e(t.id)}">${e(t.name)}</button><span class="review-label">${t.reviewed?'Reviewed':'Needs review'}</span></th><td>${t.ids.length}</td><td><input type="number" min="0" max="10000000" step="1" value="${t.reach}" data-id="${e(t.id)}" data-score="reach" aria-label="Quarterly users reached for ${e(t.name)}"></td><td><select data-id="${e(t.id)}" data-score="impact" aria-label="Impact for ${e(t.name)}">${[[.25,'Minimal'],[.5,'Low'],[1,'Medium'],[2,'High'],[3,'Massive']].map(([v,label])=>`<option value="${v}" ${t.impact===v?'selected':''}>${label} (${v})</option>`).join('')}</select></td><td><input type="number" min="0" max="100" step="1" value="${t.confidence}" data-id="${e(t.id)}" data-score="confidence" aria-label="Confidence percent for ${e(t.name)}"><span class="unit">%</span></td><td><input type="number" min="0.25" max="10000" step="0.25" value="${t.effort}" data-id="${e(t.id)}" data-score="effort" aria-label="Effort in person-weeks for ${e(t.name)}"></td><td><strong class="score">${priorityScore(t)}</strong></td></tr>`).join('');
}
$('#priorities').addEventListener('change',event=>{
  const input=event.target;if(!input.dataset.score)return;
  const value=Number(input.value);
  if(input.value==='' || !Number.isFinite(value) || !input.checkValidity()){input.reportValidity();announce('Enter a valid scoring value within the allowed range.',true);return;}
  const t=themes.find(t=>t.id===input.dataset.id);t[input.dataset.score]=value;changed=true;
  // Do not re-order while typing. Re-rank on a committed change, then restore focus.
  const id=input.dataset.id,field=input.dataset.score;renderPriorities();
  [...$('#priorities').querySelectorAll('[data-score]')].find(el=>el.dataset.id===id&&el.dataset.score===field)?.focus();
  announce('Priority score updated. Rankings use your estimates.');
});
$('#priorities').addEventListener('click',event=>{
  const button=event.target.closest('[data-select]');if(!button)return;
  selected=button.dataset.select;renderThemes();renderDetail();$('#theme-name').focus();
});
$('#export').addEventListener('click',()=>{
  const text=exportBrief(records,themes);const url=URL.createObjectURL(new Blob([text],{type:'text/markdown;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download='feedback-decision-brief.md';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  announce('Decision brief exported. It includes customer quotes; review it before sharing. Use Download workspace to preserve an editable copy as well.');
});
$('#reset').addEventListener('click',async()=>{if(!await confirmReplace())return;records=[];themes=[];selected='';changed=false;render();announce('Workspace cleared.');$('#sample').focus();});
window.addEventListener('beforeunload',event=>{if(changed){event.preventDefault();event.returnValue='';}});

function downloadFile(text,name,type){
  const url=URL.createObjectURL(new Blob([text],{type}));
  const link=document.createElement('a');link.href=url;link.download=name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
$('#save-workspace').addEventListener('click',()=>{
  try{downloadFile(serializeWorkspace({records,themes,selected,dataset}),'feedback-workspace.json','application/json');announce('Workspace download requested. Keep the JSON file to reopen your edits. It contains the original customer feedback.');}
  catch(error){announce(error.message,true);}
});
$('#workspace-file').addEventListener('change',async event=>{
  const file=event.target.files[0];if(!file)return;
  try{
    if(file.size>MAX_WORKSPACE_BYTES)throw new Error('Choose a workspace file smaller than 16 MB.');
    const saved=parseWorkspace(await file.text());
    if(!await confirmReplace())return;
    ({records,themes,selected,dataset}=saved);nextTheme=1;changed=true;
    $('#search-feedback').value='';$('#source-filter').value='';render();announce('Workspace reopened. Your themes, notes, review decisions, and estimates have been restored.');
  }catch(error){announce(error.message,true);}finally{event.target.value='';}
});
$('#theme-detail').addEventListener('click',async event=>{
  if(event.target.id!=='merge-theme')return;
  const targetId=$('#merge-target').value;
  if(!targetId){announce('Choose a destination theme first.',true);$('#merge-target').focus();return;}
  const source=themes.find(t=>t.id===selected),target=themes.find(t=>t.id===targetId);
  const dialog=$('#merge-dialog');dialog.returnValue='cancel';$('#merge-description').textContent=`Merge “${source.name}” into “${target.name}”?`;
  const confirmed=await new Promise(resolve=>{dialog.addEventListener('close',()=>resolve(dialog.returnValue==='confirm'),{once:true});dialog.showModal();});
  if(!confirmed)return;
  try{themes=mergeThemes(themes,source.id,targetId);selected=targetId;changed=true;render();$('#theme-name').focus();announce('Themes merged. Review the combined evidence and re-estimate the scope before prioritizing.');}
  catch(error){announce(error.message,true);}
});
function renderSearch(){
  const sourceSelect=$('#source-filter'),previous=sourceSelect.value;
  sourceSelect.innerHTML='<option value="">All sources</option>'+[...new Set(records.map(r=>r.source))].sort().map(source=>`<option value="${e(source)}">${e(source)}</option>`).join('');
  if([...sourceSelect.options].some(option=>option.value===previous))sourceSelect.value=previous;
  const query=$('#search-feedback').value,source=sourceSelect.value;
  if(!query.trim()&&!source){$('#search-count').textContent='Enter a search or select a source. Search does not change your theme assignments or scores.';$('#search-results').innerHTML='';return;}
  const found=searchFeedback(records,query,source);
  $('#search-count').textContent=`${found.length} matching records. ${found.length>50?'Showing the first 50; narrow your search for more specific results.':''}`;
  $('#search-results').innerHTML=found.slice(0,50).map(record=>{
    const owner=themes.find(t=>t.ids.includes(record.id));
    return `<article class="search-result"><p>${e(record.text)}</p><div><span>${e(record.id)} · ${e(record.customer)} · ${e(record.source)}</span><button class="small-button" data-open-theme="${e(owner.id)}">Open ${e(owner.name)} →</button></div></article>`;
  }).join('');
}
$('#search-feedback').addEventListener('input',renderSearch);
$('#source-filter').addEventListener('change',renderSearch);
$('#clear-search').addEventListener('click',()=>{$('#search-feedback').value='';$('#source-filter').value='';renderSearch();$('#search-feedback').focus();});
$('#search-results').addEventListener('click',event=>{
  const button=event.target.closest('[data-open-theme]');if(!button)return;
  selected=button.dataset.openTheme;renderThemes();renderDetail();$('#theme-name').focus();
});
