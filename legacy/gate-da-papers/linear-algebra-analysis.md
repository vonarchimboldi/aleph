# GATE DA Linear Algebra Paper Analysis

Source archive: official GATE DA question papers and answer keys downloaded from the IIT Guwahati GATE 2026 downloads pages.

Local files:

- `gate-da-2024-question-paper.pdf`
- `gate-da-2024-answer-key.pdf`
- `gate-da-2025-question-paper.pdf`
- `gate-da-2025-answer-key.pdf`
- `gate-da-2026-question-paper.pdf`
- `gate-da-2026-answer-key.pdf`

Official source URLs:

- 2024 question paper: https://gate2026.iitg.ac.in/doc/download/2024/DA24S1.pdf
- 2024 answer key: https://gate2026.iitg.ac.in/doc/download/2024/DAFinalAnswerKey.pdf
- 2025 question paper: https://gate2026.iitg.ac.in/doc/download/2025/DA2025.pdf
- 2025 answer key: https://gate2026.iitg.ac.in/doc/download/2025_Key/DA_Keys.pdf
- 2026 question paper: https://gate2026.iitg.ac.in/doc/download/2026/QPs/DA.pdf
- 2026 answer key: https://gate2026.iitg.ac.in/doc/download/2026/Keys/DA_Keys.pdf
- 2026 syllabus: https://gate2026.iitg.ac.in/doc/GATE2026_Syllabus/DA_2026_Syllabus.pdf

## Official Syllabus Scope

The official DA syllabus lists:

- vector spaces and subspaces
- linear dependence and independence
- matrices
- projection, orthogonal, idempotent, and partition matrices and their properties
- quadratic forms
- systems of linear equations and solutions
- Gaussian elimination
- eigenvalues and eigenvectors
- determinant
- rank and nullity
- projections
- LU decomposition
- singular value decomposition

## What Actually Shows Up

### 2024

Core Linear Algebra:

- Q13: eigenvalue signs for a 2 by 2 matrix.
- Q35: determinant of a polynomial expression in a 3 by 3 matrix.
- Q47: recognizing subspaces of R3 from parametric and equation descriptions.
- Q48: existence/solution-count reasoning for linear systems with different matrix shapes.
- Q49: projection matrix properties, null space dimension, and idempotence.
- Q61: singular values of a rank-one outer product matrix.

Linear Algebra inside ML:

- Q22: Fisher linear discriminant as a generalized eigenvalue/Rayleigh quotient condition.

Pattern:

- Heavy emphasis on structure over arithmetic.
- Projection, subspace, rank/nullity, systems, eigenvalues, determinants, and SVD are all directly tested.
- ML-facing LA appears as LDA/scatter matrix reasoning.

### 2025

Core Linear Algebra:

- Q12: operation count for Gaussian elimination on an upper triangular matrix.
- Q13: row-stochastic matrix property leading to a nontrivial null-space conclusion.
- Q25: orthonormal bases and linear independence.
- Q28: rank, invertibility, and eigenvalues of `I + xx^T`.
- Q37: rank relation for a matrix satisfying `A^3 = A`.
- Q38: Gram matrix of linearly independent vectors; invertibility/positive definiteness.
- Q50: projection matrix formed from orthonormal vectors; singular/eigenvalue properties.
- Q52: norm-preserving matrix; orthogonality, full rank, eigenvalue caveat.

Linear Algebra inside ML:

- Q34: one-parameter linear least-squares regression.
- Q60: PCA/covariance eigenvalue interpretation and maximum-variance direction.

Pattern:

- 2025 is the strongest evidence that Basic DA Linear Algebra must be concept-first.
- Questions repeatedly ask whether a matrix is full rank, invertible, orthogonal, a projection, or has a zero eigenvalue/singular value.
- Gram matrices, rank-one updates, and projection operators are central.

### 2026

Core Linear Algebra:

- Q11: PCA principal components are orthogonal.
- Q21: powers of a 2 by 2 rotation matrix.
- Q22: intersection of a ball with a 2D subspace; geometric subspace reasoning.
- Q46: eigenvalues/trace of a block rotation matrix.
- Q52: centering/projection matrix properties: symmetry, idempotence, trace, projection.
- Q65: quadratic form maximum over the unit sphere for the centering matrix.

Linear Algebra inside ML:

- Q55: ridge regression prediction and regularized loss using dot products and norms.

Borderline/vector geometry:

- Q36: Manhattan distances between 3D points for hierarchical clustering.
- Q64: random 5 by 5 Bernoulli matrix row/column sums, primarily probability rather than LA.

Pattern:

- 2026 leans even harder into geometric LA: PCA orthogonality, rotations, subspaces, projection/centering matrices, quadratic forms.
- The centering matrix appears twice, once as conceptual MSQ and once as a quadratic-form optimization NAT.

## Aggregate Topic Frequency

Approximate count across 2024-2026, counting direct LA questions only:

- Projection/idempotent/centering matrices: 5
- Eigenvalues/eigenvectors/trace/spectral reasoning: 5
- Rank, nullity, invertibility, singular values: 6
- Subspaces, bases, orthogonality, linear independence: 5
- Linear systems/Gaussian elimination: 3
- Determinants and matrix polynomial identities: 2
- SVD/singular values: 2
- Quadratic forms and constrained spectral optimization: 1-2
- LA embedded in ML/PCA/LDA/ridge/least squares: 5

## Implications for Basic DA Content

The Basic Linear Algebra track should not look like a generic college LA course. It should be an exam-facing structural reasoning track.

Priorities:

1. Build geometric meaning first: vectors, spans, subspaces, bases, dimension, orthogonality.
2. Treat matrices as transformations: rank, nullity, column space, null space, invertibility, projections.
3. Drill special matrices because GATE DA likes them: projection, idempotent, orthogonal, symmetric, Gram, centering, rank-one update.
4. Teach eigenvalues through invariants and behavior: trace, determinant, powers, rotations, projections, quadratic forms.
5. Include computational methods only to the level tested: Gaussian elimination, systems, LU basics, determinant shortcuts.
6. Connect LA to data science from the start: PCA, covariance matrices, least squares, ridge regression, Fisher/LDA.

## Recommended Chapter Shape

1. Vectors, geometry, dot products, norms
2. Span, subspace, basis, dimension, independence
3. Matrices as maps, matrix multiplication, transpose, inverse
4. Linear systems, Gaussian elimination, rank, nullity
5. Orthogonality, projections, projection matrices
6. Determinants, trace, matrix identities
7. Eigenvalues and eigenvectors
8. Symmetric matrices, quadratic forms, positive definiteness
9. Special matrices: orthogonal, idempotent, Gram, centering, rank-one updates
10. SVD and singular values
11. Linear least squares and ridge regression
12. PCA and covariance matrices
13. Mixed GATE DA review: structural MSQs and NATs

## Content Generation Rules for This Track

- Every lesson needs one concrete geometric interpretation and one exam-style algebraic interpretation.
- Every problem must declare the concept graph nodes it tests: e.g. `subspace`, `rank-nullity`, `projection-idempotent`, `eigenvalue-invariant`.
- Review quizzes should be short when appropriate: one clean concept check, then two-concept mixes, then three-concept mixes.
- Feedback must diagnose the missing structure, not just the wrong answer. Example: "You treated every idempotent matrix as identity; repair projection eigenvalues 0/1."
- Use GATE-style formats: MCQ, MSQ, NAT. MSQs must avoid partial-credit ambiguity in the explanation.
- Avoid long arithmetic unless it teaches a shortcut that actually appears in papers.
- Mix standalone LA and data-science LA. PCA/least-squares/ridge/LDA should appear as applications after the core property is taught.
