import {escapeText as esc} from './math-diagnostic/core.mjs';

export function createNotificationCenter({root=document,fetcher=fetch,onChange=()=>{},onOpenFeedback=()=>{}}={}){
  const toggle=root.querySelector('#notifications-toggle'),panel=root.querySelector('#notifications-panel');
  const dashboard=root.querySelector('#feedback-notice-card'),feedback=root.querySelector('#diagnostic-feedback-notices');
  let learner=null,items=[],epoch=0,timer,requestController=null,busy=false,error=false,loaded=false;
  const unread=()=>items.filter(n=>n.unread);
  function close(){panel.hidden=true;toggle.setAttribute('aria-expanded','false')}
  function rows(notices){return notices.map(n=>`<article class="notification-row${n.unread?' is-unread':''}"><div><a href="${esc(n.href)}">${esc(n.title)}</a><p>${esc(n.description)}</p><small>${esc(new Date(n.generatedAt).toLocaleString())}</small></div><span class="notification-state">${n.unread?'Unread':'Read'}</span></article>`).join('')}
  function draw(){
    const count=unread().length;
    root.querySelectorAll('[data-notification-count],#feedback-unread-count').forEach(b=>{b.textContent=String(count);b.hidden=!count});
    toggle.setAttribute('aria-label',`Notifications${count?`, ${count} unread`:''}`);
    const announcement=root.querySelector('#notifications-announcement');
    if(announcement)announcement.textContent=count?`${count} unread feedback ${count===1?'report is':'reports are'} available.`:'';
    panel.querySelector('[data-notification-list]').innerHTML=items.length?rows(items):`<p>${error?'Could not check for notifications.':loaded?"You're all caught up.":'Checking for new feedback…'}</p>`;
    const status=panel.querySelector('[data-notification-error]');status.hidden=!error;status.textContent=error&&items.length?'Could not refresh notifications. Showing the last successful check.':'';
    dashboard.hidden=!count;
    dashboard.innerHTML=count?`<h3>New feedback for you</h3><p>${count} unread ${count===1?'report':'reports'}. Open a report to see what you got right and what to work on next.</p>${rows(unread().slice(0,3))}<button type="button" class="text-btn" data-open-all-feedback>View all feedback</button>`:'';
    dashboard.querySelector('[data-open-all-feedback]')?.addEventListener('click',onOpenFeedback);
    feedback.hidden=!items.length;
    feedback.innerHTML=items.length?`<h3>Diagnostic feedback</h3><p>Your saved reports, newest first. Unread status follows you across devices.</p>${rows(items)}`:'';
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
        try{const url=new URL(n.href,location.origin);return url.origin===location.origin&&url.pathname==='/math-diagnostic/'}catch{return false}
      });
      const changed=!loaded||error||JSON.stringify(nextItems)!==JSON.stringify(items);
      items=nextItems;loaded=true;error=false;if(changed)draw();
    }catch{if(token===epoch){error=true;draw()}}
    finally{clearTimeout(timeout);if(token===epoch){busy=false;requestController=null}}
  }
  toggle.addEventListener('click',()=>{const open=panel.hidden;panel.hidden=!open;toggle.setAttribute('aria-expanded',String(open));if(open)refresh()});
  panel.querySelector('[data-close-notifications]').addEventListener('click',()=>{close();toggle.focus()});
  panel.querySelector('[data-refresh-notifications]').addEventListener('click',refresh);
  root.addEventListener('keydown',event=>{if(event.key==='Escape'&&!panel.hidden){close();toggle.focus()}});
  root.addEventListener('click',event=>{if(!panel.hidden&&!panel.contains(event.target)&&!toggle.contains(event.target))close()});
  window.addEventListener('focus',refresh);
  window.addEventListener('pageshow',refresh);
  window.addEventListener('online',refresh);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refresh()});
  return {
    get count(){return items.length},
    refresh,
    setLearner(next){
      if(next===learner)return;
      epoch++;requestController?.abort();clearInterval(timer);learner=next;items=[];loaded=false;error=false;busy=false;close();draw();
      toggle.hidden=!learner;
      if(learner){refresh();timer=setInterval(refresh,60000)}
    }
  };
}
