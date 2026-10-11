import assert from 'node:assert/strict';
import fs from 'node:fs';
import {prepareEvidence,generateReview} from '../api/dbms-review.js';
import {emptyProgress,adaptiveEvidence,validateProgress} from '../gate-da-dbms/review-core.mjs';
const deck=JSON.parse(fs.readFileSync('gate-da-dbms/cards.json','utf8'));
const progress=emptyProgress();progress.completed=[1];progress.reviews=[{cardId:'R02a',recipe:'R02',answer:'A foreign key must be unique.',rating:'easy'}];
const evidence=prepareEvidence(adaptiveEvidence(deck,progress));
assert.equal(evidence.history[0].answer,'A foreign key must be unique.');
assert.equal(evidence.history[0].rating,'easy');
assert(evidence.concepts.every(c=>c.chapter===1));
assert.throws(()=>prepareEvidence({completed:[2]}));
const draft={summary:'Check foreign-key uniqueness.',diagnoses:[{recipe:'R02',status:'incorrect',evidence:'The learner wrote that a foreign key must be unique.',nextStep:'Test repeated references.'}],cards:[
 {chapter:1,recipe:'R02',front:'Can two purchases reference the same customer?',back:'Yes, unless another constraint forbids it.',reason:'The answer confused foreign keys with unique keys.'},
 {chapter:1,recipe:'R03',front:'Three purchases reference customer 7; 7 is a unique existing customer ID. How many inner join rows?',back:'3, one per purchase.',reason:'Check the same distinction in a join.'},
 {chapter:1,recipe:'R01',front:'A key has a redundant column. Is it a candidate key?',back:'No. A candidate key is minimal.',reason:'Check key terminology.'}
]};
const calls=[];
const askModel=async(...args)=>{calls.push(args);return calls.length===1?structuredClone(draft):{checks:[0,1,2].map(index=>({index,valid:true,reason:'Solved from the stated assumptions.'}))}};
const result=await generateReview(evidence,{askModel});
assert.equal(calls.length,2);assert(calls[0][2].includes('not just self-ratings'));
assert.equal(calls[0][3].history[0].answer,progress.reviews[0].answer);
assert.equal(result.cards.length,3);assert(result.cards.every(c=>c.generated&&c.id.startsWith('generated-')));
progress.generatedCards=result.cards;progress.cards[result.cards[0].id]={due:1,interval:1};
assert.equal(validateProgress(JSON.parse(JSON.stringify(progress)),deck).generatedCards.length,3);
let n=0;await assert.rejects(generateReview(evidence,{askModel:async()=>++n===1?draft:{checks:[{index:0,valid:false,reason:'Wrong answer'}]}}),/checking step/);
await assert.rejects(generateReview(evidence,{askModel:async()=>({...draft,cards:draft.cards.map(c=>({...c,chapter:8}))})}),/scope/);
await assert.rejects(generateReview({...evidence,seen:[draft.cards[0].front]},{askModel:async()=>draft}),/scope/);
console.log('PASS: written responses override self-rating evidence; completed-chapter scope, generation/check passes, rejected bad cards, fresh prompts and generated-card backups.');
