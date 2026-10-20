import {platinumProgressStoreStatus} from './_platinum-progress-store.js';
import {assertStore,validateIdentity,loadProgress,loadAttachment,saveDay} from './_math-diagnostic-store.js';
export default async function handler(request,response){
 response.setHeader('Cache-Control','no-store');
 try{
  assertStore();
  if(request.method==='GET'){
   const url=new URL(request.url,`https://${request.headers.host||'aleph.local'}`),learner=url.searchParams.get('learner');validateIdentity(learner);
   if(url.searchParams.has('attachment')){const day=Number(url.searchParams.get('day'));validateIdentity(learner,day);return response.status(200).json({ok:true,attachment:await loadAttachment(learner,day,url.searchParams.get('attachment'))})}
   return response.status(200).json({ok:true,store:platinumProgressStoreStatus(),...await loadProgress(learner)});
  }
  if(request.method!=='POST'){response.setHeader('Allow','GET, POST');return response.status(405).json({error:'Method not allowed'})}
  if(Buffer.byteLength(JSON.stringify(request.body||{}),'utf8')>4400000)return response.status(413).json({error:'Diagnostic upload exceeds the request limit. Use a file smaller than 3 MB.'});
  const record=await saveDay(request.body||{});return response.status(200).json({ok:true,store:platinumProgressStoreStatus(),record});
 }catch(error){return response.status(error.status||500).json({error:error.status?error.message:'The diagnostic could not be saved. Your browser copy is retained; retry sync.',...(error.current?{current:error.current}:{})})}
}
