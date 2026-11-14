"""Independent numerical checks for authored round-two examples. No learner data."""
import sqlite3,itertools,math,json
from collections import deque
D=json.load(open('review-round2/paper-analysis.json'));F={f['id']:f for f in D['families']}
def inv(a):return sum(a[i]>a[j] for i in range(len(a)) for j in range(i+1,len(a)))
assert [inv([1,3,x,5,4]) for x in [2,4,6]]==[2,1,3]
assert 'Only x=2' in F['dsa-sort-count']['problems'][4]['answer']
def insertion(a):
 a=a[:];comp=shifts=0
 for i in range(1,len(a)):
  key=a[i];j=i-1
  while j>=0:
   comp+=1
   if a[j]<=key:break
   a[j+1]=a[j];shifts+=1;j-=1
  a[j+1]=key
 return comp,shifts
assert insertion([1,2,4,3])==(4,1)
assert insertion([1,2,3,4])==(3,0)
def calls(n):return 1 if n<=0 else 1+calls(n-1)+calls(n-2)
assert [calls(i) for i in range(5)]==[1,3,5,9,15]
def probe(m,keys,h):
 table={};slots=[]
 for k in keys:
  slot=h(k)
  while slot in table:slot=(slot+1)%m
  table[slot]=k;slots.append(slot)
 return slots
assert probe(7,[2,9,16,3],lambda k:k%7)==[2,3,4,5]
assert probe(5,[1,6,11,2],lambda k:2*k%5)==[2,3,4,0]
def popsum(stack):
 total=0
 while stack:
  x=stack.pop()
  if x%2 and stack:stack.pop()
  total+=x
 return total
assert popsum(list(range(5)))==8 and popsum(list(range(6)))==9
Q=deque([1,2,3]);total=0
for _ in range(3):x=Q.popleft();total+=x;Q.append(x+2)
assert list(Q)==[3,4,5] and total==6
A={1,2};B={2,3};C={2,3,4};A,B,C=A-B,B-C,C-A
assert (A,B,C)==({1},set(),{3,4})
def dfs(v,seen,order):
 seen.add(v);order.append(v)
 for u in sorted([x for x in [v+1,v+2] if x<=6],reverse=True):
  if u not in seen:dfs(u,seen,order)
order=[];dfs(0,set(),order);assert order==[0,2,4,6,5,3,1]
def closure(attrs,fds):
 s=set(attrs)
 while True:
  old=s.copy()
  for lhs,rhs in fds:
   if set(lhs)<=s:s.update(rhs)
  if s==old:return s
def keys(universe,fds):
 found=[]
 for n in range(1,len(universe)+1):
  for s in itertools.combinations(universe,n):
   if any(set(k)<=set(s) for k in found):continue
   if closure(s,fds)==set(universe):found.append(''.join(s))
 return found
assert keys('ABCDE',[('A','BC'),('CD','E'),('E','A')])==['AD','CD','DE']
assert keys('ABCD',[('A','BC'),('C','D'),('B','A')])==['A','B']
assert max(p for p in range(1000) if 10*p+11*(p-1)<=4096)==195
assert max(p for p in range(1000) if 8*p+16*(p-1)<=256)==11
assert max(p for p in range(1000) if 8*p+16*(p-1)+16<=256)==10
con=sqlite3.connect(':memory:');con.execute('create table Account(balance integer)')
query='select A.balance from Account A where (select count(*) from Account B where A.balance<B.balance)>=(select count(*) from Account C where A.balance>C.balance)'
for balances,expected in [([10,10,20,30],[10,10]),([5,15,15,15,25],[5,15,15,15])]:
 con.execute('delete from Account');con.executemany('insert into Account values(?)',[(b,) for b in balances]);assert [r[0] for r in con.execute(query)]==expected
assert 3*4+3+4+1==20 and 3+2+2+1==8
assert math.isclose((98-80)/12,1.5) and math.isclose((98-20)/(140-20),.65)
print('PASS: original sorting, recursion, probing, stack/queue, Python state, DFS, closure/key, B+ capacity, SQL-tie and warehouse calculations checked independently.')
