import {drainFeedback} from '../_diagnostic-feedback.js';
export default async function handler(request,response){
  response.setHeader('Cache-Control','no-store');
  if(request.method!=='GET'){response.setHeader('Allow','GET');return response.status(405).json({error:'Method not allowed'})}
  const secret=process.env.CRON_SECRET;
  if(secret&&request.headers.authorization!==`Bearer ${secret}`)return response.status(401).json({error:'Unauthorized cron request'});
  try{return response.status(200).json({ok:true,results:await drainFeedback()})}
  catch{return response.status(503).json({error:'Diagnostic feedback worker unavailable.'})}
}
