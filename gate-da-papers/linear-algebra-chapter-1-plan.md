# GATE DA Basic Linear Algebra Chapter 1 Plan

Chapter title: Vector Spaces and Coordinates

## Job of the Chapter

Train the learner to see vectors as objects that can be combined, reused, and measured by degrees of freedom.

By the end of the chapter, the learner should be able to answer:

- What can be built from a given set of vectors?
- Is a set closed enough to be a subspace?
- Is one vector redundant because it can be made from the others?
- How many independent directions are really available?
- How do coordinates describe the same vector after a basis is chosen?

This chapter should prepare the learner for later GATE DA questions about rank, nullity, projections, PCA, Gram matrices, and transformations.

## Running Examples

Use these examples throughout the chapter. Do not introduce a new toy example for every definition unless it repairs a specific misconception.

### 1. Movement on a Map

Vector meaning: a move such as `[3, 2]`, meaning 3 units east and 2 units north.

Use for:

- vector addition as two moves in sequence
- scalar multiplication as repeating or reversing a move
- span as all reachable locations from available moves
- independence as non-redundant directions
- basis as the smallest set of directions needed to describe every location on the map
- dimension as number of free movement directions

Physical intuition:

- A single eastward move only reaches a line.
- East and north together reach the whole plane.
- Adding northeast when east and north already exist is redundant.

### 2. Recipe / Mixture Profiles

Vector meaning: a recipe profile such as `[flour, sugar, salt]`.

Use for:

- linear combinations as mixing batches with positive, zero, or negative coefficients in the mathematical model
- span as all recipes buildable from base recipes
- dependence as one recipe being recreated from others
- subspace traps, because real-world recipes cannot have negative ingredients but mathematical vector spaces allow negative coefficients

Physical intuition:

- If recipe C is exactly recipe A plus twice recipe B, then C adds no new direction.
- A constrained recipe family can be a plane through the origin in ingredient space.
- If a recipe rule requires "always 1 cup of salt," it fails to be a subspace because zero is missing.

### 3. Data Feature Vectors

Vector meaning: a data point such as `[hours studied, quizzes attempted, accuracy]`.

Use for:

- coordinates as feature values
- span as synthetic profiles buildable from basis profiles
- dimension as number of independent signals/features
- previewing PCA and rank later

Physical intuition:

- Some features may be redundant if one is forced by others.
- A dataset can live in a lower-dimensional plane even inside a high-dimensional feature space.
- Choosing features is choosing coordinates, not changing the underlying learner behavior.

## Chapter Structure

### Section 1: What Is a Vector?

Goal:

- Break the habit of treating a vector as only a column of numbers.
- Present vectors as moves, ingredient profiles, and feature records.

Explain:

- A vector can be represented by coordinates after we choose axes/features.
- The same vector idea appears in geometry, physical quantities, recipes, and data.

Must-test ideas:

- Vectors are not tied to where they are drawn.
- Coordinates depend on chosen axes/features.

Quick check:

- If a move `[2, 3]` is drawn starting at two different points, is it the same vector or a different vector?

### Section 2: Addition and Scalar Multiplication

Goal:

- Make the two operations of a vector space feel inevitable.

Explain:

- Addition combines two allowed objects.
- Scalar multiplication stretches, shrinks, repeats, or reverses an object.
- Closure means the result remains inside the set being studied.

Running examples:

- Movement: `[2, 1] + [-1, 3] = [1, 4]`.
- Recipe: twice a recipe doubles each ingredient.
- Data: adding feature vectors is mathematically legal, even if not always directly meaningful as a real person.

Must-test ideas:

- Negative scalars matter.
- Zero vector matters.
- Closure is about all allowed scalars and all allowed pairs, not just one example.

### Section 3: Linear Combinations

Goal:

- Establish the core question of the chapter: what can be built?

Explain:

- A linear combination of `v1, ..., vk` is `a1 v1 + ... + ak vk`.
- Coefficients are the controls.
- Different coefficients may or may not produce the same vector.

Running examples:

- Map: build destinations from available moves.
- Recipe: build new profiles from base recipes.
- Data: build synthetic feature vectors from prototypes.

Must-test ideas:

- Linear combinations allow zero coefficients.
- Linear combinations allow negative coefficients in vector-space math.
- A vector being in a span means it can be built exactly, not approximately.

### Section 4: Span

Goal:

- Define span as the set of all buildable vectors.

Explain:

- `span(v1, ..., vk)` is every vector reachable by linear combinations of those vectors.
- Span can be a line, plane, whole space, or a higher-dimensional analogue.

Running examples:

- One nonzero map direction spans a line.
- Two non-parallel map directions span the plane.
- Two recipe vectors may span a plane inside 3D ingredient space.

Must-test ideas:

- More vectors do not always mean a larger span.
- A vector can be outside a span.
- If a vector is added that already lies in the span, the span does not change.

GATE-style direction:

- Given small vectors in `R2` or `R3`, decide whether a target vector lies in their span.

### Section 5: Subspaces

Goal:

- Teach the mechanical and intuitive subspace test.

Explain:

- A subspace is a set of vectors that contains zero and is closed under addition and scalar multiplication.
- Equivalent shortcut: every linear combination of vectors in the set stays in the set.

Running examples:

- A line through the origin is a subspace of the plane.
- A line not through the origin is not a subspace.
- Recipe rule `flour = 2 sugar` can be a subspace; recipe rule `flour = 2 sugar + 1` is not.

Must-test ideas:

- Zero vector is mandatory.
- Passing through the origin is mandatory for geometric linear sets.
- Inequality constraints usually fail scalar closure.
- A finite set is usually not a subspace unless it is just `{0}`.

GATE-style direction:

- MSQ: select all subsets of `R3` that are subspaces.

### Section 6: Linear Dependence and Independence

Goal:

- Teach redundancy.

Explain:

- A set is dependent if one vector can be built from the others.
- A set is independent if no vector is redundant.
- Algebraic test: `a1 v1 + ... + ak vk = 0` has only the all-zero solution for independence.

Running examples:

- East, north, and northeast are dependent in the map example.
- A recipe that is the sum of two others adds no new ingredient direction.
- A data feature that is always twice another feature is redundant.

Must-test ideas:

- Any set containing the zero vector is dependent.
- More than `n` vectors in `R^n` are automatically dependent.
- Two nonzero vectors are dependent exactly when one is a scalar multiple of the other.

GATE-style direction:

- Ask whether a vector set is independent without solving a long system.

### Section 7: Basis and Coordinates

Goal:

- Connect independence and span.

Explain:

- A basis is an independent set that spans the space.
- Coordinates are the coefficients of a vector in a chosen basis.
- Coordinates are basis-dependent.

Running examples:

- East/north is a basis for map movement.
- East/north/northeast is not a basis because it is redundant.
- Two different recipe bases can describe the same recipe profile with different coefficients.

Must-test ideas:

- A basis must be both independent and spanning.
- A vector has unique coordinates only after a basis is fixed.
- Changing the basis changes coordinates, not the underlying vector.

GATE-style direction:

- Given a nonstandard basis in `R2`, find coordinates of a simple vector.

### Section 8: Dimension

Goal:

- Define dimension as number of independent degrees of freedom.

Explain:

- Dimension is the number of vectors in any basis.
- Lines through origin have dimension 1, planes through origin have dimension 2, `R3` has dimension 3.
- Dimension counts freedom, not the number of equations or number of vectors listed.

Running examples:

- Map: line motion has one degree of freedom; plane motion has two.
- Recipe: a rule like `flour = 2 sugar` removes one degree of freedom.
- Data: three recorded features may still have only two independent degrees of freedom.

Must-test ideas:

- A plane in `R3` has dimension 2, not 3.
- Adding redundant vectors does not increase dimension.
- Constraints through the origin reduce degrees of freedom.

## Review Quiz Shape

Keep the Chapter 1 review quiz compact. It does not need ten questions.

Recommended sequence:

1. One concept: identify whether a set is a subspace.
2. One concept: identify dependence/redundancy.
3. Two-concept mix: span plus membership.
4. Two-concept mix: basis equals independent plus spanning.
5. Three-concept mix: subspace, dimension, and basis.
6. Three-concept data-style mix: feature vectors, redundancy, and dimension.

Question formats:

- MCQ for single misconception checks.
- MSQ for subspace/basis selection.
- NAT for coordinates or dimension.

## Feedback Requirements

Every quiz question must have:

- concept tags
- prerequisite tags
- misconception tags
- repair feedback
- dashboard feedback summary

Feedback should diagnose structure, for example:

- "You checked one example of closure, but a subspace must be closed for every pair of vectors and every scalar."
- "You treated three listed vectors in R3 as automatically three-dimensional. One vector may be built from the others."
- "You found coordinates without first fixing a basis. Coordinates are not intrinsic."
- "You forgot to test whether the zero vector belongs to the set."

## Concept Graph Nodes

Use these nodes for Chapter 1:

- `vector-as-object`
- `coordinate-representation`
- `vector-addition`
- `scalar-multiplication`
- `linear-combination`
- `span`
- `subspace-zero`
- `subspace-closure`
- `linear-dependence`
- `linear-independence`
- `basis`
- `coordinates-in-basis`
- `dimension`

Prerequisite edges:

- `vector-as-object` -> `coordinate-representation`
- `vector-addition` -> `linear-combination`
- `scalar-multiplication` -> `linear-combination`
- `linear-combination` -> `span`
- `linear-combination` -> `subspace-closure`
- `span` -> `basis`
- `linear-independence` -> `basis`
- `basis` -> `coordinates-in-basis`
- `basis` -> `dimension`

## Authoring Standard

Each section should follow this local pattern:

1. Concrete running example.
2. Plain-English idea.
3. Formal definition.
4. Small worked example.
5. Common trap.
6. Quick check.
7. GATE-style practice item.

Do not let notation arrive before need. Introduce notation only after the learner has seen the physical action it names.

## Implementation Notes

When this chapter is added to the app:

- Put it under GATE DA Basic -> Linear Algebra -> Chapter 1.
- Match the current Basic Probability chapter pattern: reading section, labelled practice, objective review quiz, graph-backed grading, dashboard feedback.
- Use the chapter concept graph above for the review quiz.
- Include at least one visual/map example and one data-vector example.
- Keep arithmetic small; the assessment target is structural reasoning.
