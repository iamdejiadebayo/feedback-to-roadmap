import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parseCSV,suggestThemes,moveFeedback,priorityScore,rankThemes,exportBrief,escapeHTML} from '../src/core.mjs';

test('CSV preserves quoted commas, escaped quotes and multiline customer evidence',()=>{
 const result=parseCSV('\uFEFFid,feedback,customer\r\nA,"Report says ""failed"", again\nplease fix",Acme\r\n');
 assert.equal(result[0].text,'Report says "failed", again\nplease fix');assert.equal(result[0].id,'A');
});
test('CSV allows a minimal feedback-only file and assigns stable IDs',()=>{
 const result=parseCSV('feedback\nSearch is slow\nExport is broken');assert.equal(result[1].id,'F002');assert.equal(result[0].customer,'Unspecified');
});
test('CSV rejects malformed or unusable records with actionable errors',()=>{
 for(const [csv,pattern] of [['comment\nhello',/feedback/],['feedback\n"unfinished',/closing quote/],['feedback,id\nhello,A\nthere,A',/Duplicate/],['feedback,id\n,A',/empty/],['feedback,id\nhello,A,extra',/fields/],['feedback,feedback\none,two',/unique/],['feedback\n"hello"x',/characters/]])assert.throws(()=>parseCSV(csv),pattern);
});
test('CSV bounds imported data to keep the browser responsive',()=>{
 assert.throws(()=>parseCSV('feedback\n'+Array(301).fill('hello').join('\n')),/300/);
 assert.throws(()=>parseCSV('feedback\n'+'a'.repeat(5001)),/5,000/);
});
test('theme suggestions are deterministic, cover each record once and do not turn frequency into reach',()=>{
 const records=parseCSV(readFileSync(new URL('../data/sample-feedback.csv',import.meta.url),'utf8'));
 const themes=suggestThemes(records);assert.deepEqual(themes,suggestThemes(records));
 const ids=themes.flatMap(t=>t.ids);assert.equal(new Set(ids).size,records.length);assert.equal(ids.length,records.length);
 assert.ok(themes.every(t=>t.reach===0 && !t.reviewed));
});
test('matching export feedback is grouped while unrelated billing feedback stays separate',()=>{
 const records=parseCSV('id,feedback\nA,Export report owner column\nB,Export report owner column missing\nC,Invoice payment failed');
 const themes=suggestThemes(records);assert.ok(themes.some(t=>t.ids.includes('A')&&t.ids.includes('B')));assert.ok(themes.some(t=>t.ids.length===1&&t.ids[0]==='C'));
});
test('moving evidence preserves single ownership and invalidates review status',()=>{
 const themes=[{id:'T1',ids:['A','B'],reviewed:true},{id:'T2',ids:['C'],reviewed:true}];
 const result=moveFeedback(themes,'A','T2');assert.deepEqual(result.map(t=>t.ids),[['B'],['C','A']]);assert.ok(result.every(t=>!t.reviewed));assert.equal(themes[0].ids.length,2);assert.throws(()=>moveFeedback(themes,'A','missing'));
});
test('RICE uses percentage confidence and effort; invalid estimates do not produce misleading scores',()=>{
 assert.equal(priorityScore({reach:100,impact:2,confidence:80,effort:4}),40);
 for(const effort of [0,-1,NaN])assert.equal(priorityScore({reach:100,impact:2,confidence:80,effort}),0);
 assert.equal(priorityScore({reach:100,impact:2,confidence:101,effort:4}),0);
 assert.equal(priorityScore({reach:0,impact:2,confidence:80,effort:4}),0);
});
test('ranking does not mutate the opportunity list',()=>{
 const themes=[{name:'B',reach:1,impact:1,confidence:100,effort:1},{name:'A',reach:20,impact:1,confidence:100,effort:1}];assert.equal(rankThemes(themes)[0].name,'A');assert.equal(themes[0].name,'B');
});
test('untrusted feedback is escaped in UI and Markdown exports',()=>{
 assert.equal(escapeHTML('<img src=x onerror="attack()">'),'&lt;img src=x onerror=&quot;attack()&quot;&gt;');
 const records=parseCSV('id,feedback\nA,<script>alert(1)</script>');const themes=suggestThemes(records);themes[0].name='[click](bad)';
 const report=exportBrief(records,themes);assert.ok(report.includes('\\<script\\>'));assert.ok(report.includes('\\[click\\]'));assert.ok(report.includes('Needs review'));assert.ok(report.includes('**A**'));assert.ok(report.includes('Local text-similarity'));
});
test('export includes scoring assumptions, notes, source references and reviewed status',()=>{
 const records=parseCSV('id,feedback,customer\nA,Need export,Acme');const themes=suggestThemes(records);Object.assign(themes[0],{reach:100,impact:2,confidence:80,effort:4,reviewed:true,notes:'Interview the finance lead.'});
 const report=exportBrief(records,themes);for(const phrase of ['Score: 40','Human reviewed','Interview the finance lead.','Acme','reach 100','effort 4'])assert.ok(report.includes(phrase));
});
