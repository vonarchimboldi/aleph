// Learning notices contain no learner responses or assessment details.
export function learningNotices(learner) {
  if (learner !== 'user-priyanka') return [];
  return [{
    id: 'mandatory-daily-review-2026-11-09',
    version: '1',
    type: 'learning-material',
    title: 'Mandatory daily assignments: Calculus, DSA and DBMS',
    description: 'Admin policy: You MUST complete all three assigned materials each day: Calculus, DSA review and DBMS review (90 minutes each). Incomplete assigned material will trigger an email to admin once automatic alerts are activated. Repeated failure to complete assigned material will result in your account being locked by admin. Current status: automatic email activation is pending; account locking requires admin action and is not automatic.',
    href: '/',
    generatedAt: '2026-11-09T05:22:16.000Z'
  }, {
    id: 'logic-repair-2026-11-03',
    version: '1',
    type: 'learning-material',
    title: 'Please make time for this',
    description: 'Two focused 45-minute lessons on quantifiers, implication and proof. Please make time for this before continuing with Day 4. Keep your written work for tutor review.',
    href: '/math-remedial/logic-repair.html',
    generatedAt: '2026-11-04T04:05:05.681Z'
  }, ...[
    {id:'calculus-review-2026-11-08',title:'Calculus review · 90-minute session',href:'/calculus-review/'},
    {id:'skiena-review-2026-11-08',title:'DSA review · 90-minute session',href:'/dsa-review/'},
    {id:'dbms-review-2026-11-08',title:'DBMS review · 90-minute session',href:'/dbms-review/'}
  ].map(notice=>({...notice,version:'1',type:'learning-material',description:'Dedicate a 90 minute session for this.',generatedAt:'2026-11-09T02:09:47.000Z'}))];
}
