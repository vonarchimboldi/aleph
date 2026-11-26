import {escapeText as esc} from './math-diagnostic/core.mjs';

export function createNotificationCenter({root=document,fetcher=fetch,onChange=()=>{},onOpenFeedback=()=>{}}={}){
  const toggle=root.querySelector('#notifications-toggle'),panel=root.querySelector('#notifications-panel');
  const dashboard=root.querySelector('#feedback-notice-card'),feedback=root.querySelector('#diagnostic-feedback-notices');
  let learner=null,items=[],epoch=0,timer,requestController=null,busy=false,error=false,loaded=false;
  const unread=()=>items.filter(n=>n.unread);
  function close(){panel.hidden=true;toggle.setAttribute('aria-expanded','false')}
  function rows(notices){return notices.map(n=>`<article class="notification-row${n.unread?' is-unread':''}"><div><a href="${esc(n.href)}" data-notice-id="${esc(n.id)}" data-notice-version="${esc(n.version)}">${esc(n.title)}</a><p>${esc(n.description)}</p><small>${esc(new Date(n.generatedAt).toLocaleString())}</small></div><span class="notification-state">${n.unread?'Unread':'Read'}</span></article>`).join('')}
  function draw(){
    const count=unread().length;
    root.querySelectorAll('[data-notification-count],#feedback-unread-count').forEach(b=>{b.textContent=String(count);b.hidden=!count});
    toggle.setAttribute('aria-label',error?'Notifications could not refresh':`Notifications${count?`, ${count} unread`:''}`);
    const announcement=root.querySelector('#notifications-announcement');
    if(announcement)announcement.textContent=count?`${count} unread ${count===1?'notification is':'notifications are'} available.`:'';
    panel.querySelector('[data-notification-list]').innerHTML=items.length?rows(items):`<p>${error?'Could not check for notifications.':loaded?"You're all caught up.":'Checking for notifications…'}</p>`;
    const status=panel.querySelector('[data-notification-error]');status.hidden=!error;status.textContent=error&&items.length?'Could not refresh notifications. Showing the last successful check.':'';
    const failure=`<p role="alert">Feedback and notifications could not be loaded. This does not mean there are no saved records. ${items.length?'Showing notices from the last successful check.':'Your saved notices cannot currently be checked.'}</p><button type="button" class="small-btn" data-retry-notifications>Retry notifications</button>`;
    dashboard.hidden=!count&&!error;
    dashboard.innerHTML=count?`<h3>New for you</h3><p>${count} unread ${count===1?'notification':'notifications'}. Open an item to see more.</p>${rows(unread().slice(0,3))}<button type="button" class="text-btn" data-open-all-feedback>View all notifications</button>${error?failure:''}`:error?`<h3>Feedback and notifications unavailable</h3>${failure}`:'';
    dashboard.querySelector('[data-open-all-feedback]')?.addEventListener('click',onOpenFeedback);
    dashboard.querySelector('[data-retry-notifications]')?.addEventListener('click',refresh);
    feedback.hidden=!items.length&&!error;
    feedback.innerHTML=items.length?`<h3>Feedback and learning notices</h3><p>Your saved notifications, newest first. Unread status follows you across devices.</p>${rows(items)}${error?failure:''}`:error?`<h3>Feedback and learning notices</h3>${failure}`:'';
    feedback.querySelector('[data-retry-notifications]')?.addEventListener('click',refresh);
    onChange({count:items.length,unreadCount:count});
  }
  async function refresh(){
    if(!learner||busy||document.visibilityState==='hidden')return;
    const token=epoch,who=learner,controller=new AbortController();busy=true;requestController=controller;
    const timeout=setTimeout(()=>controller.abort(),12000);
    try{
      const response=await fetcher('/api/notifications?learner='+encodeURIComponent(who),{cache:'no-store',signal:controller.signal});
      if(!response.ok)throw Error('Notifications unavailable');
      const data=await response.json();if(token!==epoch)return;
      if(!Array.isArray(data.notifications))throw Error('Invalid notification response');
      const nextItems=data.notifications.filter(n=>{
        try{const url=new URL(n.href,location.origin);return url.origin===location.origin&&(url.pathname==='/'||/^\/(?:math-diagnostic|math-remedial|calculus-review|dsa-review|dbms-review|ai-review|review-round2|psets|gate-da-dbms|DSA%20For%20GATE%20practice)\//.test(url.pathname))}catch{return false}
      });
      const changed=!loaded||error||JSON.stringify(nextItems)!==JSON.stringify(items);
      items=nextItems;loaded=true;error=false;if(changed)draw();
    }catch{if(token===epoch){error=true;draw()}}
    finally{clearTimeout(timeout);if(token===epoch){busy=false;requestController=null}}
  }
  toggle.addEventListener('click',()=>{const open=panel.hidden;panel.hidden=!open;toggle.setAttribute('aria-expanded',String(open));if(open)refresh()});
  panel.querySelector('[data-close-notifications]').addEventListener('click',()=>{close();toggle.focus()});
  panel.querySelector('[data-refresh-notifications]').addEventListener('click',refresh);
  root.addEventListener('click',event=>{
    const link=event.target.closest?.('[data-notice-id]');
    const notice=items.find(n=>n.id===link?.dataset.noticeId&&n.version===link?.dataset.noticeVersion);
    if(!learner||!notice||!['learning-material','material-assignment','study-workflow'].includes(notice.type)||!notice.unread)return;
    // Only explicitly opening a learning notice acknowledges it. Feedback
    // reports retain their separate visible-report acknowledgement flow.
    fetcher('/api/notifications',{method:'POST',headers:{'Content-Type':'application/json'},keepalive:true,
      body:JSON.stringify({action:'read',learner,id:notice.id,version:notice.version})}).catch(()=>{});
  });
  root.addEventListener('keydown',event=>{if(event.key==='Escape'&&!panel.hidden){close();toggle.focus()}});
  root.addEventListener('click',event=>{if(!panel.hidden&&!panel.contains(event.target)&&!toggle.contains(event.target))close()});
  window.addEventListener('focus',refresh);
  window.addEventListener('pageshow',refresh);
  window.addEventListener('online',refresh);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refresh()});
  return {
    get count(){return items.length},
    get unavailable(){return error},
    refresh,
    setLearner(next){
      if(next===learner)return;
      epoch++;requestController?.abort();clearInterval(timer);learner=next;items=[];loaded=false;error=false;busy=false;close();draw();
      toggle.hidden=!learner;
      if(learner){refresh();timer=setInterval(refresh,60000)}
    }
  };
}
