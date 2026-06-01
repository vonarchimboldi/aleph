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

## Quality Checks

- Page must load at desktop and mobile widths without horizontal body overflow.
- Every problem must have a complete solution.
- Answer summary must agree with the detailed solutions.
- Run a local HTTP smoke test before deploy.
