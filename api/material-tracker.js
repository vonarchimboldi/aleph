import {trackerState,mutateTracker} from './_material-tracker.js';
export default async function handler(request,response){
 response.setHeader('Cache-Control','no-store');
 if(!['GET','POST'].includes(request.method)){response.setHeader('Allow','GET, POST');return response.status(405).json({error:'Method not allowed'});}
 try{
  if(request.method==='GET'){const url=new URL(request.url,`https://${request.headers.host||'aleph.local'}`);return response.status(200).json(await trackerState(url.searchParams.get('learner')));}
  if(request.headers.origin&&new URL(request.headers.origin).host!==request.headers.host)return response.status(403).json({error:'Same-origin requests only'});
  if(Buffer.byteLength(JSON.stringify(request.body||{}))>12000)return response.status(413).json({error:'Assignment payload is too large.'});
  await mutateTracker(request.body||{});return response.status(200).json(await trackerState(request.body?.learner));
 }catch(error){return response.status(error.status||503).json({error:error.status?error.message:'The material tracker is unavailable. Retry without losing your work.'});}
}
