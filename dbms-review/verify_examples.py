from pathlib import Path
import json,sqlite3,itertools,math
D=json.loads((Path(__file__).parent/'course.json').read_text());assert len(D)==7
# SQL is executed against synthetic in-memory tables, never learner storage.
db=sqlite3.connect(':memory:');db.execute('PRAGMA foreign_keys=ON')
db.executescript('CREATE TABLE P(ID INTEGER PRIMARY KEY);CREATE TABLE C(CID INTEGER PRIMARY KEY,PID INTEGER NOT NULL REFERENCES P(ID) ON DELETE RESTRICT);INSERT INTO P VALUES(4),(8);INSERT INTO C VALUES(1,4),(2,4);')
try:db.execute('DELETE FROM P WHERE ID=4');raise AssertionError('Referenced parent unexpectedly deleted')
except sqlite3.IntegrityError:pass
db.execute('INSERT INTO P VALUES(12)');db.execute('DELETE FROM C WHERE CID=1');db.execute('DELETE FROM P WHERE ID=8')
db.executescript("CREATE TABLE Sale(ID INTEGER,Dept TEXT,Amount REAL);INSERT INTO Sale VALUES(1,'A',10),(2,'A',20),(3,'B',20),(4,'B',NULL),(5,'C',5);")
assert db.execute('SELECT COUNT(*),COUNT(Amount),SUM(Amount),AVG(Amount) FROM Sale').fetchone()==(5,4,55.0,13.75)
assert db.execute('SELECT Dept,COUNT(*),SUM(Amount) FROM Sale GROUP BY Dept HAVING SUM(Amount)>=20 ORDER BY Dept').fetchall()==[('A',2,30.0),('B',2,20.0)]
assert db.execute('SELECT s.ID FROM Sale s WHERE s.Amount>(SELECT AVG(t.Amount) FROM Sale t WHERE t.Dept=s.Dept)').fetchall()==[(2,)]
db.executescript('CREATE TABLE V(x INTEGER);INSERT INTO V VALUES(1),(2);CREATE TABLE W(y INTEGER);INSERT INTO W VALUES(2),(NULL);')
assert db.execute('SELECT x FROM V WHERE x NOT IN(SELECT y FROM W)').fetchall()==[]
assert db.execute('SELECT x FROM V WHERE NOT EXISTS(SELECT 1 FROM W WHERE W.y=V.x)').fetchall()==[(1,)]
db.executescript('CREATE TABLE Customer(ID INTEGER);INSERT INTO Customer VALUES(1),(2);CREATE TABLE Orders(OID INTEGER,CID INTEGER);INSERT INTO Orders VALUES(10,1),(11,1);')
assert db.execute('SELECT COUNT(*),COUNT(Orders.OID) FROM Customer LEFT JOIN Orders ON Customer.ID=Orders.CID').fetchone()==(3,2)
# Set relational semantics, quantified candidate filtering and natural join.
R={(1,'x'),(2,'y')};S={(1,'z',7),(2,'y',9)}
assert {(a,b,c) for a,b in R for aa,bb,c in S if (a,b)==(aa,bb)}=={(2,'y',9)}
students={'Ada','Ben','Cy'};required={'DB','AI'};enrol={('Ada','DB'),('Ada','AI'),('Ben','DB'),('Cy','AI')}
assert {s for s in students if all((s,c) in enrol for c in required)}=={'Ada'}
assert {s for s in students if all((s,c) in enrol for c in set())}==students
assert {s for s in students if any((s,c) in enrol for c in set())}==set()
def closure(X,F):
 out=set(X)
 while True:
  nxt=out|set().union(*(set(rhs) for lhs,rhs in F if set(lhs)<=out))
  if nxt==out:return out
  out=nxt
def keys(attrs,F):
 result=[]
 for n in range(len(attrs)+1):
  for xs in itertools.combinations(attrs,n):
   x=set(xs)
   if closure(x,F)==set(attrs) and not any(k<=x for k in result):result.append(x)
 return result
assert keys('ABCD',[('A','B'),('B','C')])==[{'A','D'}]
assert keys('ABCDE',[('A','B'),('B','C'),('CD','E')])==[{'A','D'}]
assert keys('ABC',[('AB','C'),('C','B')])==[{'A','B'},{'A','C'}]
# Counterexample showing projected constraints need not enforce original AB→C.
cb={('c1','b1'),('c2','b1')};ac={('a1','c1'),('a1','c2')}
joined={(a,b,c) for a,c in ac for cc,b in cb if c==cc};assert len(joined)==2
assert len({c for a,b,c in joined if (a,b)==('a1','b1')})==2
# Layout arithmetic and density/cube row counts.
assert max(p for p in range(1,200) if 8*p+12*(p-1)<=1024)==51
assert math.ceil(26//1/math.floor(1000/180))==6
assert max(m for m in range(100) if 16*m+8<=512)==31
facts=list(itertools.product(range(2),range(4)));groups=[set(facts),{(a,)for a,b in facts},{(b,)for a,b in facts},{()}];assert sum(map(len,groups))==15
assert 4*3==12 and (100+600)/(5+15)==35
assert (80-20)/(100-20)==.75 and (80-60)/20==1 and (120-20)/80==1.25
def rle_bytes(s):return 2*sum(1 for _ in itertools.groupby(s))
assert rle_bytes('AAAABBBBCC')==6 and rle_bytes('ABAB')==8
print('PASS: synthetic SQL/null/join/group results, FK actions, relational quantifiers, exhaustive FD-key search, preservation counterexample, index/file layouts, cube counts and preprocessing arithmetic.')
