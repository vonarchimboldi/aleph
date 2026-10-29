import {remedialState,saveRemedial,remedialAttachment} from './_math-remedial-store.js';
export default async function handler(request,response){
 response.setHeader('Cache-Control','no-store');
 try{
  if(request.method==='GET'){
   const url=new URL(request.url,`https://${request.headers.host||'aleph.local'}`),learner=url.searchParams.get('learner'),day=Number(url.searchParams.get('day')||1);
   if(url.searchParams.has('attachment'))return response.status(200).json({attachment:await remedialAttachment(learner,day,url.searchParams.get('attachment'))});
   return response.status(200).json(await remedialState(learner,day));
  }
  if(request.method!=='POST'){response.setHeader('Allow','GET, POST');return response.status(405).json({error:'Method not allowed'});}
  if(request.headers.origin&&new URL(request.headers.origin).host!==request.headers.host)return response.status(403).json({error:'Same-origin requests only'});
  if(Buffer.byteLength(JSON.stringify(request.body||{}),'utf8')>4400000)return response.status(413).json({error:'Upload limit exceeded.'});
  return response.status(200).json({record:await saveRemedial(request.body||{})});
 }catch(error){return response.status(error.status||500).json({error:error.status?error.message:'The session could not be loaded or saved. Copy your unsaved text and retry.'});}
}
