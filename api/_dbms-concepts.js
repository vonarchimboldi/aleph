export const concepts = [
  {
    "id": "R01a",
    "chapter": 1,
    "recipe": "R01",
    "front": "What makes a candidate key different from a superkey?",
    "back": "A superkey identifies each row. A candidate key is a minimal superkey: removing any attribute destroys that guarantee. Minimal does not mean shortest."
  },
  {
    "id": "R01b",
    "chapter": 1,
    "recipe": "R01",
    "front": "Names happen to be unique in today's table. Does that make Name a schema key?",
    "back": "No. A schema key must identify rows in every permitted instance. Today's data alone cannot establish that constraint."
  },
  {
    "id": "R01c",
    "chapter": 1,
    "recipe": "R01",
    "front": "A relation has 4 columns and 7 rows. What are its degree and cardinality?",
    "back": "Degree = 4 attributes. Cardinality = 7 tuples. Adding a row changes cardinality, not degree."
  },
  {
    "id": "R02a",
    "chapter": 1,
    "recipe": "R02",
    "front": "A child column references a parent's primary key. Must the child column be unique or non-null?",
    "back": "Neither follows from the foreign key alone. Many children can reference the same parent. NULL may be permitted unless a separate constraint forbids it."
  },
  {
    "id": "R02b",
    "chapter": 1,
    "recipe": "R02",
    "front": "Which operations cannot create a dangling reference for a given foreign key: inserting a parent, deleting a child, inserting a child, deleting a parent?",
    "back": "Inserting a parent and deleting a child cannot create a dangling reference. The other two can. This concerns that foreign key alone; other constraints may still fail."
  },
  {
    "id": "R03",
    "chapter": 1,
    "recipe": "R03",
    "front": "Four purchases reference customer IDs 1,1,2,NULL. Customers 1 and 2 exist and IDs are unique. Count the inner join and Purchase LEFT JOIN Customer rows.",
    "back": "Inner join: 3. Left join: 4. Each non-null reference has one match; the NULL purchase survives only in the left join. Customer 1 appears twice."
  },
  {
    "id": "R04",
    "chapter": 2,
    "recipe": "R04",
    "front": "In relational algebra, what happens if projection produces duplicate tuples?",
    "back": "Duplicates are removed under set semantics. SQL SELECT normally keeps duplicates unless DISTINCT is requested."
  },
  {
    "id": "R05",
    "chapter": 2,
    "recipe": "R05",
    "front": "How do you count the rows in a join without guessing from the input sizes?",
    "back": "For each join value, multiply its frequency on the left by its frequency on the right, then sum. First apply the stated join condition and any filters."
  },
  {
    "id": "R06",
    "chapter": 2,
    "recipe": "R06",
    "front": "To find students who passed every required course, what kind of condition are you testing?",
    "back": "A universal condition: no required course is missing for that student. Division or a double NOT EXISTS can express it. State the candidate student set; an empty requirement set makes the condition true for every candidate."
  },
  {
    "id": "R07",
    "chapter": 2,
    "recipe": "R07",
    "front": "Before taking R minus S or their union, what must you check?",
    "back": "Union compatibility: the same number of attributes and compatible corresponding domains. Align attribute meaning and order first."
  },
  {
    "id": "R08",
    "chapter": 2,
    "recipe": "R08",
    "front": "What does an existential variable mean in a tuple-calculus query?",
    "back": "It asks whether at least one witness tuple satisfies the condition. Several witnesses do not create several copies of an output tuple under set semantics. Keep free output variables distinct from bound witness variables."
  },
  {
    "id": "R09",
    "chapter": 3,
    "recipe": "R09",
    "front": "A SQL equality condition compares NULL with 5. Is it true or false?",
    "back": "It is UNKNOWN. WHERE keeps only TRUE rows. Use IS NULL to test for NULL; NULL = NULL is also UNKNOWN."
  },
  {
    "id": "R10",
    "chapter": 3,
    "recipe": "R10",
    "front": "What is the difference between COUNT(*), COUNT(x) and COUNT(DISTINCT x)?",
    "back": "COUNT(*) counts rows. COUNT(x) counts non-null x values. COUNT(DISTINCT x) counts distinct non-null x values."
  },
  {
    "id": "R11",
    "chapter": 3,
    "recipe": "R11",
    "front": "Where do WHERE and HAVING act in a grouped SQL query?",
    "back": "WHERE filters input rows before grouping. HAVING filters groups after aggregation. Work through FROM/JOIN, WHERE, GROUP BY, HAVING, SELECT, then DISTINCT when tracing a query."
  },
  {
    "id": "R12",
    "chapter": 3,
    "recipe": "R12",
    "front": "Why can NOT IN unexpectedly discard rows when its subquery returns NULL?",
    "back": "An otherwise unmatched comparison can become UNKNOWN because the list contains NULL. WHERE discards UNKNOWN. A correctly correlated NOT EXISTS tests for absence of matching rows without this NOT IN trap."
  },
  {
    "id": "R13",
    "chapter": 3,
    "recipe": "R13",
    "front": "How should you trace a correlated subquery on a small table?",
    "back": "Fix one outer row, substitute its values into the inner condition, evaluate the inner result, then decide whether the outer row passes. Repeat for each outer row."
  },
  {
    "id": "R14",
    "chapter": 3,
    "recipe": "R14",
    "front": "Does EXISTS return one output row for each matching inner row?",
    "back": "No. EXISTS is a truth test for an outer row. A join can multiply that row by its number of matches. DISTINCT or a uniqueness constraint may be needed for equivalence."
  },
  {
    "id": "R15",
    "chapter": 4,
    "recipe": "R15",
    "front": "How do you compute the closure X+ under functional dependencies?",
    "back": "Start with X. Whenever a dependency's left side is contained in the current set, add its right side. Repeat until nothing changes. X is a superkey if its closure contains every attribute."
  },
  {
    "id": "R16",
    "chapter": 4,
    "recipe": "R16",
    "front": "How do you confirm that a superkey is a candidate key?",
    "back": "Remove each attribute in turn and compute the smaller set's closure. None may remain a superkey. When finding all keys, do not stop after the first one."
  },
  {
    "id": "R17",
    "chapter": 4,
    "recipe": "R17",
    "front": "What does it mean for a set of functional dependencies to be a minimal cover?",
    "back": "Use single-attribute right sides, remove extraneous left-side attributes, and remove redundant dependencies while preserving all implications. A minimal cover need not be unique."
  },
  {
    "id": "R18",
    "chapter": 4,
    "recipe": "R18",
    "front": "What is a partial dependency relevant to 2NF?",
    "back": "A non-prime attribute depends on a proper subset of a candidate key. Check every candidate key, not just the chosen primary key. A prime attribute belongs to at least one candidate key."
  },
  {
    "id": "R19",
    "chapter": 4,
    "recipe": "R19",
    "front": "For a nontrivial dependency X → A, what does 3NF allow that BCNF does not?",
    "back": "3NF allows X to be a superkey OR A to be prime. BCNF requires X to be a superkey. Apply the condition to dependencies implied by the schema, not just a convenient subset."
  },
  {
    "id": "R20",
    "chapter": 4,
    "recipe": "R20",
    "front": "What is the binary lossless-join test for a decomposition into R1 and R2?",
    "back": "Under the dependencies, their intersection must determine all of R1 or all of R2. Lossless means joining projections reconstructs every permitted original relation without spurious tuples."
  },
  {
    "id": "R21",
    "chapter": 4,
    "recipe": "R21",
    "front": "Why isn't a binary intersection check enough for every multi-relation decomposition?",
    "back": "A decomposition with several relations needs an appropriate full test, such as the chase. Dependencies can propagate through several rows. Look for an all-distinguished row in the chase."
  },
  {
    "id": "R22",
    "chapter": 4,
    "recipe": "R22",
    "front": "How do you test dependency preservation after decomposition?",
    "back": "Project the implied dependencies onto each component, combine those projected dependencies, then test whether they imply the original dependencies. Lossless join and dependency preservation are different properties."
  },
  {
    "id": "R23",
    "chapter": 4,
    "recipe": "R23",
    "front": "Why might a 3NF synthesis add a relation containing a candidate key?",
    "back": "If none of the synthesized relations contains a candidate key, adding one gives the standard synthesis its lossless-join guarantee. The construction also preserves the dependencies represented by the minimal cover."
  },
  {
    "id": "R24",
    "chapter": 5,
    "recipe": "R24",
    "front": "In an ER relationship, how are cardinality and participation different?",
    "back": "Cardinality constrains how many partners an entity can have. Participation says whether an entity must have a partner. One-to-many does not itself say that everyone participates."
  },
  {
    "id": "R25",
    "chapter": 5,
    "recipe": "R25",
    "front": "How is an ordinary many-to-many relationship represented in relational tables?",
    "back": "Use a relationship table containing foreign keys to both entities and any relationship attributes. For a simple binary relationship without repeated relationship instances, the two entity keys together identify a relationship row."
  },
  {
    "id": "R26",
    "chapter": 5,
    "recipe": "R26",
    "front": "How do a weak entity and a multivalued attribute change the table mapping?",
    "back": "A weak entity's key combines the owner's key with its partial key. A multivalued attribute normally gets a separate table with the entity key and the attribute value. State any allowed merging conventions before counting tables."
  },
  {
    "id": "R27",
    "chapter": 6,
    "recipe": "R27",
    "front": "For fixed-size unspanned records, how many fit in one block?",
    "back": "floor(usable block bytes / record bytes). The number of blocks is ceil(record count / records per block). Account for any stated header or reserved space before dividing."
  },
  {
    "id": "R28",
    "chapter": 6,
    "recipe": "R28",
    "front": "What distinction matters between a dense and a sparse index?",
    "back": "A dense index has entries for every search-key value, or every record under the stated convention. A sparse index has selected entries, commonly one per data block, and normally needs the data ordered by that key."
  },
  {
    "id": "R29",
    "chapter": 6,
    "recipe": "R29",
    "front": "A B+ internal node holds p pointers and p−1 keys. How do you find maximum p?",
    "back": "Solve p × pointer bytes + (p−1) × key bytes + stated overhead ≤ block bytes. Take the largest valid integer p. Compute leaf capacity separately: leaf entries and sibling pointers have a different layout."
  },
  {
    "id": "R30",
    "chapter": 6,
    "recipe": "R30",
    "front": "What must you clarify before counting index-search block accesses?",
    "back": "Which levels are cached, whether height counts edges or levels, and whether the data-block fetch is included. For a multilevel index, repeatedly divide entry counts by the relevant capacity and round up."
  },
  {
    "id": "R31",
    "chapter": 6,
    "recipe": "R31",
    "front": "After a B+ leaf split, which key goes into the parent?",
    "back": "It depends on the stated separator convention. With right-child-minimum separators, copy the new right leaf's minimum into the parent; keep it in the leaf. Internal splits usually promote a separator. Do not assume a convention from an unrelated diagram."
  },
  {
    "id": "R32",
    "chapter": 6,
    "recipe": "R32",
    "front": "After deletion makes a B+ node underfull, what do you try?",
    "back": "Redistribute from a sibling with spare entries if permitted; otherwise merge and repair the parent. Update affected separators. Underflow can propagate upward, and a root with one child may collapse."
  },
  {
    "id": "R33",
    "chapter": 7,
    "recipe": "R33",
    "front": "What is the grain of a warehouse fact table?",
    "back": "Exactly what one fact row represents, such as one product sold in one transaction. Declare that first. Dimensions describe the row; measures quantify it. Joining at inconsistent grains can double-count measures."
  },
  {
    "id": "R34",
    "chapter": 7,
    "recipe": "R34",
    "front": "What is the difference between OLAP roll-up and drill-down?",
    "back": "Roll-up aggregates to a coarser level, such as city to state. Drill-down moves to a finer level. Slice fixes one dimension value; dice selects a subcube using several conditions."
  },
  {
    "id": "R35",
    "chapter": 7,
    "recipe": "R35",
    "front": "Which dimensions can you sum account balances over?",
    "back": "Balances are typically semi-additive: summable across accounts at the same time, but not across successive times. Ratios are generally non-additive. SUM/COUNT are distributive, AVG is algebraic, and an exact median is holistic."
  },
  {
    "id": "R36",
    "chapter": 7,
    "recipe": "R36",
    "front": "For d dimensions, how many grouping sets are in a full cube? In an ordered rollup?",
    "back": "Cube: 2^d. Rollup: d+1. Those count grouping sets, not output rows. To count rows, count distinct groups at each included level, with stated data and NULL conventions."
  },
  {
    "id": "R37",
    "chapter": 8,
    "recipe": "R37",
    "front": "Why doesn't storing categories as numbers make them quantitative?",
    "back": "Numeric labels may be nominal: arithmetic on them has no meaning. Ordinal values have order without meaningful equal spacing. Interval scales support differences; ratio scales also have a meaningful zero."
  },
  {
    "id": "R38",
    "chapter": 8,
    "recipe": "R38",
    "front": "Give min–max scaling to [0,1] and z-score normalization.",
    "back": "Min–max: (x−minimum)/(maximum−minimum). Z-score: (x−mean)/standard deviation. Use the stated statistics and sample/population convention. A zero denominator needs an explicit handling rule."
  },
  {
    "id": "R39",
    "chapter": 8,
    "recipe": "R39",
    "front": "How do equal-width and equal-frequency bins differ?",
    "back": "Equal-width bins split the value range into equal intervals. Equal-frequency bins aim for similar counts of observations. State endpoint and tie rules. Mean or median smoothing replaces values within each bin with that bin's statistic."
  },
  {
    "id": "R40",
    "chapter": 8,
    "recipe": "R40",
    "front": "What assumptions must be checked in sampling and compression calculations?",
    "back": "For sampling: with or without replacement, and the selection probabilities. For compression: whether size means bits or bytes, the numerator convention for the ratio, and any codebook or metadata overhead. Lossless reconstruction preserves every original value."
  }
];
