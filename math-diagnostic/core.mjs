export function blank(){return {version:1,completed:[],days:{}}}
export function available(progress,n){return Number.isInteger(n)&&n>=1&&n<=10&&(n===1||progress.completed.includes(n-1))}
export function validate(progress){
 if(!progress||progress.version!==1||!Array.isArray(progress.completed)||!progress.days||Array.isArray(progress.days))throw Error('Invalid diagnostic backup.');
 const unique=[...new Set(progress.completed)].sort((a,b)=>a-b);
 if(unique.some((n,i)=>!Number.isInteger(n)||n<1||n>10||n!==i+1))throw Error('Completed days must form a sequence starting at Day 1.');
 for(const [n,d] of Object.entries(progress.days))if(!Number.isInteger(Number(n))||Number(n)<1||Number(n)>10||!d||!d.answers||!Array.isArray(d.selected)||d.selected.length>2)throw Error('Invalid day record.');
 return progress;
}
export function complete(progress,n){if(!available(progress,n))throw Error('Complete the previous day first.');progress.completed=[...new Set([...progress.completed,n])].sort((a,b)=>a-b)}
export function escapeText(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
export function math(s){return escapeText(s).replace(/([0-9]+|[A-Za-z])\^\(([^()]+)\)/g,'$1<sup>$2</sup>').replace(/([0-9]+|[A-Za-z])\^([A-Za-z0-9]+)/g,'$1<sup>$2</sup>').replace(/\b([A-Za-z])_\(([^()]+)\)/g,'$1<sub>$2</sub>').replace(/\b([A-Za-z])_([A-Za-z0-9]+)/g,'$1<sub>$2</sub>')}
