import {listNotifications,markNotificationRead} from './_notifications.js';

export default async function handler(request,response){
  response.setHeader('Cache-Control','no-store');
  if(!['GET','POST'].includes(request.method)){response.setHeader('Allow','GET, POST');return response.status(405).json({error:'Method not allowed'})}
  try{
    if(request.method==='POST'){
      if(request.body?.action!=='read')return response.status(400).json({error:'Unknown notification action'});
      return response.status(200).json({ok:true,...await markNotificationRead(request.body)});
    }
    const url=new URL(request.url,`https://${request.headers.host||'aleph.local'}`);
    return response.status(200).json(await listNotifications(url.searchParams.get('learner')));
  }catch(error){return response.status(error.status||503).json({error:error.status?error.message:'Notifications are temporarily unavailable.'})}
}
