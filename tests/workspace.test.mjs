import test from 'node:test';
import assert from 'node:assert/strict';
import {parseCSV,suggestThemes,serializeWorkspace,parseWorkspace,mergeThemes,searchFeedback,moveFeedback,exportBrief} from '../src/core.mjs';
const fixture=()=>{
 const records=parseCSV('id,feedback,customer,source\nA,Export owner column,Linden,Support\nB,Need daily notification digest,Harbor,Interview');
 const themes=suggestThemes(records);
 themes[0].name='Reporting needs';themes[0].notes='Ask finance about monthly reporting.\nKeep owner details.';themes[0].reach=100;themes[0].confidence=80;themes[0].effort=2;themes[0].reviewed=true;
 return {dataset:'Customer interviews',records,themes,selected:themes[1].id};
};
test('workspace round trip preserves edits, source text, scores, review status and active theme',()=>{
 const state=fixture(),saved=parseWorkspace(serializeWorkspace(state));
 for(const key of Object.keys(state))assert.deepEqual(saved[key],state[key]);
 assert.equal(saved.version,1);assert.equal(exportBrief(saved.records,saved.themes),exportBrief(state.records,state.themes));
});
test('workspace validator rejects unsupported formats and malformed JSON',()=>{
 for(const value of ['null','[]','{}','{"format":"feedback-to-roadmap","version":2}', '{'])assert.throws(()=>parseWorkspace(value));
});
test('workspace validator enforces unique IDs and complete, exclusive evidence ownership',()=>{
 for(const mutate of [s=>s.records.push({...s.records[0]}),s=>s.themes.push({...s.themes[0]}),s=>s.themes[0].ids.push('missing'),s=>s.themes[1].ids.push('A'),s=>s.themes[0].ids=[]]){
  const state=fixture();mutate(state);assert.throws(()=>parseWorkspace(JSON.stringify({format:'feedback-to-roadmap',version:1,...state})),/Invalid workspace/);
 }
});
test('workspace rejects invalid numeric assumptions, types and oversized content',()=>{
 for(const [key,value] of [['reach',-1],['reach',1.5],['impact',4],['confidence',101],['effort',0],['effort',.3],['reviewed','true'],['name',''],['notes','a'.repeat(6001)]]){
  const state=fixture();state.themes[0][key]=value;assert.throws(()=>serializeWorkspace(state));
 }
});
test('unknown properties are discarded and unknown selection falls back safely',()=>{
 const state=fixture();state.selected='missing';state.themes[0].html='<script>bad()</script>';state.records[0].admin=true;
 const saved=parseWorkspace(serializeWorkspace(state));assert.equal(saved.selected,saved.themes[0].id);assert.ok(!('html' in saved.themes[0]));assert.ok(!('admin' in saved.records[0]));
});
test('workspace treats malicious-looking text as inert source text, not schema',()=>{
 const state=fixture();state.records[0].text='<script>bad()</script>';state.themes[0].id='__proto__';state.selected='__proto__';
 const saved=parseWorkspace(serializeWorkspace(state));assert.equal(saved.records[0].text,state.records[0].text);assert.equal(saved.selected,'__proto__');
});
test('merge combines evidence and notes without mutation and resets estimates for the new scope',()=>{
 const state=fixture();state.themes[1].notes='Retain urgent notifications.';const original=structuredClone(state.themes);
 const merged=mergeThemes(state.themes,state.themes[0].id,state.themes[1].id);
 assert.equal(merged.length,1);assert.deepEqual(new Set(merged[0].ids),new Set(['A','B']));assert.ok(merged[0].notes.includes('Ask finance'));assert.ok(merged[0].notes.includes('Retain urgent'));assert.equal(merged[0].reach,0);assert.equal(merged[0].reviewed,false);assert.deepEqual(state.themes,original);
 assert.doesNotThrow(()=>serializeWorkspace({...state,themes:merged}));
});
test('merge rejects self-merge, unknown target and note overflow without losing content',()=>{
 const {themes}=fixture();assert.throws(()=>mergeThemes(themes,'T1','T1'));assert.throws(()=>mergeThemes(themes,'T1','missing'));
 themes[0].notes='a'.repeat(4000);themes[1].notes='b'.repeat(4000);assert.throws(()=>mergeThemes(themes,'T1','T2'),/6,000/);assert.equal(themes[0].notes.length,4000);
});
test('search intersects terms and source filters across feedback metadata without changing input',()=>{
 const {records}=fixture();assert.deepEqual(searchFeedback(records,'LINDEN owner','Support').map(r=>r.id),['A']);assert.equal(searchFeedback(records,'Linden','Interview').length,0);assert.equal(searchFeedback(records,'Fictional').length,0);assert.equal(searchFeedback(records,'').length,2);assert.equal(records.length,2);
});
test('full review workflow survives save and reopen after a move and merge',()=>{
 const state=fixture();state.themes.push({id:'T3',name:'Custom theme',ids:[],notes:'Follow up',reviewed:false,reach:0,impact:1,confidence:50,effort:1});
 state.themes=moveFeedback(state.themes,'A','T3');state.themes=mergeThemes(state.themes,'T2','T3');state.selected='T3';
 const restored=parseWorkspace(serializeWorkspace(state));assert.equal(restored.selected,'T3');assert.equal(restored.themes.find(t=>t.id==='T3').ids.length,2);assert.equal(restored.themes.find(t=>t.id==='T1').ids.length,0);
});
test('CSV metadata and generated theme names remain compatible with workspace limits',()=>{
 assert.throws(()=>parseCSV('feedback,customer\nhello,'+'a'.repeat(301)),/metadata/);
 const records=parseCSV('feedback\n'+'word'.repeat(100));const themes=suggestThemes(records);assert.ok(themes[0].name.length<=120);assert.doesNotThrow(()=>serializeWorkspace({dataset:'test',records,themes,selected:themes[0].id}));
});
