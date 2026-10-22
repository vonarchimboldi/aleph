// Seeing a notification is not reading a report. Only acknowledge its exact
// version when the report heading is visible in the learner's foreground tab.
export function observeFeedbackRead({element,learner,notification,canMarkRead=()=>false,fetcher=fetch,onRead=()=>{}}){
  if(!notification||!canMarkRead()||typeof IntersectionObserver==='undefined')return ()=>{};
  let visible=false,stopped=false,inFlight=false,retryTimer;
  function stop(){stopped=true;clearTimeout(retryTimer);observer.disconnect();document.removeEventListener('visibilitychange',attempt);window.removeEventListener('online',attempt)}
  async function attempt(){
    if(stopped||inFlight||!visible||document.visibilityState!=='visible'||!canMarkRead())return;
    inFlight=true;
    try{
      const response=await fetcher('/api/notifications',{method:'POST',keepalive:true,headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'read',learner,id:notification.id,version:notification.version}),signal:AbortSignal.timeout(12000)});
      if(response.status===409){stop();return}
      if(!response.ok)throw Error('Read status could not be saved');
      stop();onRead();
    }catch{if(!stopped){clearTimeout(retryTimer);retryTimer=setTimeout(attempt,30000)}}
    finally{inFlight=false}
  }
  const observer=new IntersectionObserver(entries=>{visible=entries.some(e=>e.isIntersecting&&e.intersectionRatio>=0.5);if(visible)attempt()},{threshold:0.5});
  observer.observe(element);document.addEventListener('visibilitychange',attempt);window.addEventListener('online',attempt);
  return stop;
}
