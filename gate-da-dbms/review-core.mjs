export const DAY = 86400000;
export function emptyProgress() { return {version:1,completed:[],cards:{},reviews:[],sessions:[],feedback:[]}; }
export function validateProgress(value, deck) {
  if (!value || value.version!==1 || !Array.isArray(value.completed) || !value.cards || !Array.isArray(value.reviews) || !Array.isArray(value.sessions) || !Array.isArray(value.feedback)) throw Error('This is not a DBMS review backup.');
  if(value.completed.some(n=>!Number.isInteger(n)||n<1||n>8)) throw Error('Invalid chapter progress.');
  const ids=new Set(deck.map(c=>c.id));
  for(const [id,c] of Object.entries(value.cards)) if(!ids.has(id)||!Number.isFinite(c.due)||!Number.isFinite(c.interval)||c.interval<0) throw Error('Invalid card schedule.');
  if(value.activeSession && (!Array.isArray(value.activeSession.ids)||value.activeSession.ids.some(id=>!ids.has(id))||!Number.isInteger(value.activeSession.index)||value.activeSession.index<0||value.activeSession.index>value.activeSession.ids.length||!Number.isInteger(value.activeSession.chapter)||value.activeSession.chapter<1||value.activeSession.chapter>8||!Number.isFinite(value.activeSession.reviewed))) throw Error('Invalid saved session.');
  return value;
}
export function eligible(deck, progress) { return progress.completed.includes(1) ? deck.filter(c=>progress.completed.includes(c.chapter)) : []; }
export function reviewQueue(deck,progress,now=Date.now(),limit=10) {
  const cards=eligible(deck,progress);
  const due=cards.filter(c=>progress.cards[c.id]?.due<=now).sort((a,b)=>progress.cards[a.id].due-progress.cards[b.id].due);
  const fresh=cards.filter(c=>!progress.cards[c.id]);
  return [...due.slice(0,limit),...fresh.slice(0,Math.min(2,limit-Math.min(due.length,limit)))];
}
export function rateCard(previous={},rating,now=Date.now()) {
  if(!['again','hard','good','easy'].includes(rating))throw Error('Unknown rating.');
  const old=previous.interval||0;
  const interval=rating==='again'?0:rating==='hard'?Math.max(1,old*1.2):rating==='good'?(old?Math.max(3,old*2):1):(old?Math.max(4,old*2.5):4);
  return {due:now+(rating==='again'?60000:Math.round(interval*DAY)),interval,repetitions:(previous.repetitions||0)+1,lapses:(previous.lapses||0)+(rating==='again'?1:0),lastRating:rating,lastReviewed:now};
}
export function ankiTsv(deck) {
  const clean=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('\t',' ').replaceAll('\n','<br>');
  return '#separator:Tab\n#html:true\n#columns:Front\tBack\tTags\n'+deck.map(c=>`${clean(c.front)}\t${clean(c.back)}<br>Chapter ${c.chapter}; ${c.recipe}\tDBMS chapter_${c.chapter} ${c.recipe}`).join('\n');
}
