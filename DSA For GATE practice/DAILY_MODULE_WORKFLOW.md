# Daily Module Production Workflow

## Purpose

This workflow supports a four-month DSA Special Prep program in which the instructor can arrive each day, name the intended topic, work through the instructional choices with Codex, and publish a complete learner module to Priyanka's Aleph archive.

The workflow is deliberately collaborative. Do not generate and publish a daily module immediately after receiving only a topic name. First establish the learning target, examples, invariant, and coding progression with the instructor.

## The instructor's minimum daily prompt

The instructor may begin with something as short as:

> Today we are making Month 1, Day 2 on binary-search boundaries.

Codex should recover the project memory, locate the four-week path, review earlier modules and learner feedback, and then begin the discovery brief.

## Phase 1: Recover context

Before planning the module:

1. Read this project's `AGENTS.md`.
2. Read the relevant month plan and prior day's module.
3. Check Aleph's durable submission and feedback records when learner adaptation is relevant.
4. Identify what the learner has already encountered and what must remain new.
5. Avoid repeating the same problem structure unless deliberate retrieval practice is needed.

## Phase 2: Build the discovery brief together

Confirm the following with the instructor through a short working discussion:

- Day and date
- Topic and intended depth
- Prerequisites
- One central question
- Motivating problem
- Direct or naive approach the learner should try first
- Limitation that motivates the new technique
- Core state representation
- Correctness invariant
- Important implementation details
- Likely misconceptions
- Target language, normally C++17
- Expected two-hour difficulty

Use `templates/DAILY_MODULE_BRIEF.md` to record the result.

## Phase 3: Select the coding progression

Choose three official LeetCode problems only after the instructional idea is clear.

### Problem A: direct application

- The target pattern should be visible.
- The main challenge should be implementing the idea correctly.
- The learner should be able to finish after the walkthrough.

### Problem B: implementation variation

Change one important dimension:

- output contract;
- duplicate or boundary behavior;
- in-place requirement;
- auxiliary-space constraint;
- stability or ordering requirement.

### Problem C: transfer or advanced variation

- Preserve the underlying idea but change its representation.
- Require the learner to recognize why the same invariant still works.
- Prefer a medium problem over an unrelated trick problem.

For every selection, record:

- official link and problem number;
- why it belongs today;
- target pattern;
- required invariant;
- expected time and space;
- trace cases;
- progressive hints;
- post-attempt questions.

Do not reproduce LeetCode's complete copyrighted problem statement. Link to it and provide an original short summary of the relevant task.

## Phase 4: Construct the two-hour learner module

Each weekday PDF should contain:

1. Session map and learning objectives.
2. Motivating problem.
3. Concrete examples and hand traces.
4. Naive solution and its limitation.
5. Guided derivation of the new technique.
6. State representation and invariant.
7. Incremental C++17 implementation walkthrough.
8. Correctness reasoning.
9. Complexity analysis.
10. Edge cases and a deliberately tempting wrong approach.
11. Coding Lab A, B, and C with official links and progressive hints.
12. Review questions and an exit ticket.
13. A clearly separated solution/hint appendix.

The learner must be prompted to attempt code before seeing a complete solution.

## Phase 5: Quality review

Before publication, check:

- Every pointer or boundary move is justified.
- Code compiles or passes an appropriate syntax check.
- Complexity statements match the implementation.
- Examples include normal, boundary, duplicate, and failure cases.
- Problem A is direct, B varies implementation, and C requires transfer.
- Difficulty rises through constraints or representation, not an unrelated trick.
- The PDF renders without clipped code, broken tables, or blank pages.
- The solution appendix is visually separated from student work.

## Phase 6: Publish to Aleph

For each new day:

1. Save editable source under `month-XX/`.
2. Generate the PDF under the same month directory.
3. Add an entry to the corresponding monthly workspace in `app.js`.
4. Add the day's task and schedule item.
5. Keep all previous daily materials in the workspace archive.
6. Attach the code-submission and feedback workflow.
7. Bump the service-worker cache name.
8. Run JavaScript and PDF verification.
9. Deploy to production.
10. Verify the live PDF URL and app bundle.
11. Commit and push only the scoped files.

## Phase 7: Feed results forward

After the learner submits work:

- Record the first incorrect assumption.
- Record the first implementation failure.
- Tag the broken invariant or data-structure operation.
- Note missed edge cases and complexity errors.
- Choose a near-transfer repair problem.
- Use this evidence when selecting the next day's examples and problems.

Previous modules must remain accessible so the learner can review explanations, reattempt exercises, and compare later implementations with earlier ones.
