# Three-week DBMS review

The first seven relative study days are authored. Week2 is mixed exam applications; Week3 is evidence-driven review/remedy. The recorded prerequisite is DBMS Round1; no completion or calendar date is inferred.

## Chosen references and evidence

Database System Concepts7e (Silberschatz/Korth/Sudarshan) supplies selected relational/SQL/ER/design/file/index/analytics material. The authors' online Chapter27 supplies formal relational languages. The previously selected Han/Kamber/Pei Data Mining3e is a limited preprocessing/warehouse supplement. The course index maps these to GATE DA2027 Section5 and selected official2024–2026 question families. `evidence.json` records question numbers, pages and links.

All exposition/examples/practice are original, not reproduced book questions or mislabeled PYQs. Daily paper references establish topic-family evidence; they are not asserted as provenance for every individual practice technique. In particular, sampling/compression is explicit-syllabus supplemental coverage; selected paper evidence directly supports scaling. Existing DA2026 Q59 accepted-range ambiguity is not inherited by the new finite-set calculus example.

## Build and verify

```
python3 dbms-review/build.py
python3 dbms-review/sync_catalog.py
python3 dbms-review/verify_examples.py
node scripts/verify-dbms-threeweek.mjs
```

Every day includes exposition, two worked examples, five diagnostic problems, worked review, repair/fresh check, big-picture view and an accessible SVG/text mind map. Schemas, instances, assumptions, layouts and numerical conventions are explicit. The normalized content/keys/metadata live in `course.json`.

The diagnostic uses the shared DSA review runner with a separate configured storage namespace, title, export name and upload destination. Default DSA behavior remains unchanged. Two exact-set multi-selects plus three short responses,10 learning points, not official exam marking. Solutions and consolidation stay hidden until explicit local attempt recording. Original attempt and later corrections remain separate. Browser-local records are exportable, not server submissions. Seven new subject slots use Aleph's existing upload/AI feedback workflow. The original DBMS pack and its separate review/flashcard functionality are preserved.

Tests use synthetic data only. SQL outputs are executed in an in-memory SQLite database; FD keys are enumerated independently. Structural/integration checks preserve old progress and avoid assigning schedules. No learner message/notification is created.
