import json,bisect,itertools,heapq,random
from pathlib import Path
D=json.loads((Path(__file__).parent/'course.json').read_text())
ns={}
for i in [0,2,3,4,5,6]:exec(D[i]['implementation']['code'],ns)
for n in range(7):
 for values in itertools.product(range(3),repeat=n):
  a=sorted(values)
  for t in range(-1,4):assert ns['lower_bound'](a,t)==bisect.bisect_left(a,t)
  assert ns['insertion_sort'](list(values))==sorted(values)
  if values:
   b=list(values);pivot=b[-1];k=ns['partition'](b);assert b[k]==pivot and all(x<=pivot for x in b[:k]) and all(x>pivot for x in b[k+1:])
assert ns['partition'](a:=[3,1,4,2])==1 and a==[1,2,4,3]
class Node:
 def __init__(self,key,left=None,right=None):self.key=key;self.left=left;self.right=right
root=Node(4,Node(2,Node(1),Node(3)),Node(6,Node(5),Node(7)))
for k in range(9):assert ns['contains'](root,k)==(1<=k<=7)
adj={'A':['B','D'],'B':['A','C'],'C':['B','D','E'],'D':['A','C'],'E':['C']}
assert ns['bfs_distances'](adj,'A')=={'A':0,'B':1,'D':1,'C':2,'E':3}
w={'S':[('A',6),('B',2)],'B':[('A',1),('T',9)],'A':[('T',2)],'T':[]}
assert ns['dijkstra'](w,'S')=={'S':0,'B':2,'A':3,'T':5}
bad={'S':[('A',1),('B',4)],'A':[('T',1)],'B':[('A',-5)],'T':[]}
assert ns['dijkstra'](bad,'S')['T']==2 # Deliberate counterexample outside preconditions; true optimum is0.
heap=[1,3,2,8,5,4];assert heapq.heappop(heap)==1 and heap[0]==2
# Dijkstra cross-check against repeated relaxation on independent nonnegative graphs.
rng=random.Random(7)
for _ in range(80):
 adj={u:[] for u in range(5)}
 for u in adj:
  for v in adj:
   if u!=v and rng.random()<.3:adj[u].append((v,rng.randrange(6)))
 expected={u:float('inf') for u in adj};expected[0]=0
 for __ in range(4):
  for u in adj:
   for v,w in adj[u]:expected[v]=min(expected[v],expected[u]+w)
 assert ns['dijkstra'](adj,0)=={u:d for u,d in expected.items() if d<float('inf')}
print('PASS: lower_bound, insertion and partition boundaries checked exhaustively on small inputs; BST/BFS/heap traces and shortest paths independently checked; negative-weight counterexample reproduced.')
