import {feedbackStatus,processFeedback} from './_diagnostic-feedback.js';
export default async function handler(request,response){
  response.setHeader('Cache-Control','no-store');
  if(!['GET','POST'].includes(request.method)){response.setHeader('Allow','GET, POST');return response.status(405).json({error:'Method not allowed'})}
  try{
    const url=new URL(request.url,`https://${request.headers.host||'aleph.local'}`);
    const learner=request.method==='GET'?url.searchParams.get('learner'):request.body?.learner;
    const day=Number(request.method==='GET'?url.searchParams.get('day'):request.body?.day);
    if(request.method==='POST')await processFeedback(learner,day);
    return response.status(200).json(await feedbackStatus(learner,day));
  }catch(error){return response.status(error.status||500).json({error:error.status?error.message:'Feedback could not be loaded. Your submission is safe.'})}
}
