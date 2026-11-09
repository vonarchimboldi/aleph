import fs from 'node:fs';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';

// Explicit operator action only; importing this file never assigns live work.
export function reviewWeekAssignments(startDate='2026-11-09') {
  const context=vm.createContext({console,URL,selectedPatternMaterialId:null,pendingUploadFiles:new Map()});
  for(const name of ['platinum-linear-algebra.js','platinum-machine-learning.js'])vm.runInContext(fs.readFileSync(new URL('../'+name,import.meta.url),'utf8'),context);
  const source=fs.readFileSync(new URL('../app.js',import.meta.url),'utf8');
  vm.runInContext(source.slice(0,source.indexOf('const state = loadState();'))+source.slice(source.indexOf('function loadState()')),context);
  const plan=context.buildCoursePlan();
  const subjects=['subject-platinum-calculus-review','subject-platinum-skiena-review','subject-platinum-dbms-review'].map(id=>plan.subjects.find(s=>s.id===id));
  const assignments=[];
  for(let day=1;day<=7;day++){
    const due=new Date(startDate+'T12:00:00Z');due.setUTCDate(due.getUTCDate()+day-1);
    for(const subject of subjects){
      const material=subject.materialWorkspaces.flatMap(w=>w.weeks)[day-1];
      if(!material?.materialUrl)throw Error('Missing published review material.');
      assignments.push({day,dueDate:due.toISOString().slice(0,10),materialId:material.id,title:material.materialTitle,subject:subject.title,href:'/'+material.materialUrl,minutes:90});
    }
  }
  return assignments;
}
async function apply(assignments){
 const endpoint='https://aleph-alpha.io/api/material-tracker',learner='user-priyanka';
 async function request(options){const response=await fetch(endpoint+'?learner='+learner,{...options,signal:AbortSignal.timeout(20000)});const body=await response.json();if(!response.ok)throw Error(body.error||'Assignment request failed.');return body;}
 let state=await request();let added=0,existing=0;
 for(const assignment of assignments){
   const match=state.assignments.find(a=>a.materialId===assignment.materialId&&a.dueDate===assignment.dueDate);
   if(match){existing++;continue;}
   const other=state.assignments.find(a=>a.materialId===assignment.materialId&&a.status!=='completed');
   if(other)throw Error(`Material already has an unfinished assignment on ${other.dueDate}; resolve it before adding another.`);
   const {day,...input}=assignment;
   state=await request({method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({learner,expectedRevision:state.revision,action:'assign',...input})});added++;
 }
 for(const a of assignments)if(!state.assignments.some(s=>s.materialId===a.materialId&&s.dueDate===a.dueDate))throw Error('Saved assignment verification failed.');
 console.log(JSON.stringify({added,existing,verified:assignments.length,revision:state.revision,alertsReady:state.alerts.ready}));
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const assignments=reviewWeekAssignments();
 if(process.argv.includes('--apply'))await apply(assignments);
 else console.log(JSON.stringify(assignments,null,2));
}
