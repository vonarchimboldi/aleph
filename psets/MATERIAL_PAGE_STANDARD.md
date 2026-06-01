# Material Page Standard

Use this standard for every standalone Aleph material page.

## Required Files

- Include `../material-page.css` or the correct relative path to `psets/material-page.css`.
- Include KaTeX CSS and deferred KaTeX scripts from jsDelivr.
- Include `../material-page.js` or the correct relative path to `psets/material-page.js`.

## Required Structure

- Use `<main class="wrap">`.
- Start with `<section class="hero">` containing:
  - one `h1`
  - one `.sub` paragraph describing the learning objective
  - `.meta` chips for subject, date, problem count, and solution availability
  - `.math-fallback` message
- Use `.panel.accent` for the core pattern or theorem.
- Use `.section-label` to separate concept builders, integration problems, challenge/past-year problems, and answer summary.
- Use `<article class="problem">` for every problem.
- Use `<details><summary>Solution</summary>...</details>` for every solution.

## Math Rules

- Inline math uses `\( ... \)`.
- Display math uses `\[ ... \]`.
- Do not rely on raw `$...$` unless unavoidable.
- Long display equations must live inside `.formula`, `.math-block`, or normal KaTeX display blocks so horizontal scrolling is handled consistently.
- Use `\mathbf{1}` for indicators and `\operatorname{...}` for named operators.

## Explanation Rules

- Write for students who may not be native English speakers.
- Prefer short, direct sentences.
- Define every new symbol before using it heavily.
- Explain why a method is being used, not only what calculation is being done.
- Avoid terse textbook phrases such as "clearly", "trivially", "it follows", and "by inspection" unless the next sentence explains the step.
- In solutions, use a simple rhythm:
  - identify the useful pattern
  - write the known quantities
  - do the calculation
  - state the final answer
- Keep problem statements concise, but make solutions friendly and complete.

## Quality Checks

- Page must load at desktop and mobile widths without horizontal body overflow.
- Every problem must have a complete solution.
- Answer summary must agree with the detailed solutions.
- Run a local HTTP smoke test before deploy.
