# Round 2: submission-gated solutions and error review

The public catalogue contains references and original descriptions, not answer keys. All 200 worked solutions and canonical question transcriptions live in private KV records. Do not commit them or put them in static JSON, client bundles, service-worker caches or printed lesson pages.

The student stops the 60-minute attempt, submits actual working (text or a PDF/image), and receives a receipt only after durable storage succeeds. The receipt is bound to that learner, day and immutable attempt. Only then does the API return that day’s solutions. A local timer, filename, checkbox or draft is insufficient. Retry secrets preserve access after a lost network response without creating duplicate attempts. New uploads create separate attempts.

The review uses the canonical source question and checked worked solution, not the public description. It records question-level evidence, the first wrong step, category, confidence, a prerequisite hypothesis, a repair and a fresh check. Primary categories are calculation, misunderstood-question, concept and prerequisite; method, reasoning, time, unclassified and none cover other cases. Missing/unreadable work stays unclassified. AI analysis is not mentor verification or independent mastery.

The server retains the original answer text and uploaded files. Corrections submitted as a new upload do not overwrite the first attempt. Solutions exposure is timestamped. An hourly protected worker retries one pending review; immediate review starts after successful submission. A failed review leaves answers saved and exposes a retry control.

Mentor log: `review.html`, using a short-lived study-admin access file. It shows all Round 2 attempts, analysis and source evidence, plus labelled audits of earlier Calculus feedback. Earlier feedback audits are not regrades of missing original files. No learner notifications or email recipients are changed.

API: `api/calculus-round2.js`; private storage and analysis: `api/_calculus-round2.js`. Author, audit, publish and mentor actions require the existing Ed25519 study-admin grant. The original PDF crops are used at high detail for transcription and a separate mathematical check. Reviewed solutions are author-created and AI-assisted, not official examiner solutions.

Rebuild public pages: `python3 calculus-review/round2/build.py`. Run `node scripts/verify-calculus-submission-gate.mjs`, `node scripts/verify-calculus-round2.mjs`, and `node scripts/verify-calculus-review.mjs`. Gate tests use synthetic in-memory storage only. Browser checks must cover failed-save lockout, successful submit/unlock, immutable first work, preserved correction, retry, reload, exports and mobile layout.
