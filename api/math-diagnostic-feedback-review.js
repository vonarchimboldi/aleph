import {verify} from 'node:crypto';
import {REVIEW_PUBLIC_KEY} from './_feedback-review-key.js';
import {publishReviewedFeedback} from './_diagnostic-feedback.js';

export function verifiedPayload(body,now=Date.now(),publicKey=REVIEW_PUBLIC_KEY){
  if(typeof body?.payload!=='string'||body.payload.length>250000||typeof body.signature!=='string'||body.signature.length>200)throw Object.assign(Error('Invalid signed review.'),{status:401});
  if(!verify(null,Buffer.from(body.payload),publicKey,Buffer.from(body.signature,'base64')))throw Object.assign(Error('Invalid signed review.'),{status:401});
  const data=JSON.parse(body.payload);
  if(!Number.isFinite(data.expiresAt)||data.expiresAt<now||data.expiresAt>now+300000)throw Object.assign(Error('Review signature expired.'),{status:401});
  return data;
}
export default async function handler(request,response){
  response.setHeader('Cache-Control','no-store');
  if(request.method!=='POST'){response.setHeader('Allow','POST');return response.status(405).json({error:'Method not allowed'});}
  try{return response.status(200).json(await publishReviewedFeedback(verifiedPayload(request.body)));}
  catch(error){return response.status(error.status||400).json({error:error.status?error.message:'Review did not pass validation.'});}
}
