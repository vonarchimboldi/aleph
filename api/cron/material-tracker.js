import {checkTrackerReminders} from '../_material-tracker.js';
export default async function handler(request,response){
 response.setHeader('Cache-Control','no-store');
 if(request.method!=='GET'){response.setHeader('Allow','GET');return response.status(405).json({error:'Method not allowed'});}
 if(!process.env.CRON_SECRET)return response.status(503).json({error:'Reminder scheduler authentication is not configured.'});
 if(request.headers.authorization!==`Bearer ${process.env.CRON_SECRET}`)return response.status(401).json({error:'Unauthorized cron request'});
 try{return response.status(200).json(await checkTrackerReminders());}catch{return response.status(503).json({error:'Material reminder check could not finish.'});}
}
