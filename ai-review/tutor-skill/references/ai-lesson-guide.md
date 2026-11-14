# Apply the tutor skill to GATE DA AI

Use this guide when creating AI lessons. Follow the official GATE DA syllabus. Keep AI search and reasoning distinct from the separate Machine Learning section.

The syllabus source is the [official 2027 DA PDF](https://gate2027.iitm.ac.in/static/doc/GATE2027_Syllabus/DA_GATE2027_Syllabus.pdf). The planned content is uninformed, informed and adversarial search, propositional and predicate logic, conditional independence, variable elimination and sampling.

The outline below is our application of Skycak’s teaching principles. It is not a syllabus written by Skycak.

## Make each lesson a series of small teaching cycles

For each cycle, write:

1. A concrete question that gives the idea a purpose.
2. An explanation in ordinary language.
3. One worked example with the reasoning shown.
4. A similar problem the learner can attempt.
5. A worked check and a simpler repair if needed.

At the end, connect the pieces. Show how they solve a problem like those in the exam. Then arrange later practice with other familiar topics.

A document can contain the whole lesson. The learner should meet it one understandable idea at a time.

## Example: begin search with an actual choice

**Starting situation:** You want a route from S to G. There is a direct road costing 9. There is also a road S→A costing 2, followed by A→G costing 3.

### Cycle 1: count roads and count cost

Explain that the direct route uses one road and costs 9. The route through A uses two roads and costs 5.

Define a **path** as a sequence of connected steps. Define its **cost** as the sum of its step costs.

Ask: “Which route uses fewer roads? Which costs less?”

Check both answers. If the learner adds incorrectly, repair the addition before introducing an algorithm.

### Cycle 2: keep the routes still worth trying

Explain that search keeps a list of places or partial routes it has found but has not yet examined. This list is called the **frontier**.

After examining S, the frontier contains A and G. A search method needs a rule for choosing which to examine next.

Ask: “What information would help you choose if the goal is the cheapest route?”

Accept a reference to cost so far. Then explain how that information enters the next method.

### Cycle 3: breadth-first search

Explain that breadth-first search examines routes with fewer steps first. Show a queue with the nearest discovered states at the front. Explain how removing the front and adding new states at the back produces that order.

On the example, it can reach G directly at depth one. That route costs 9.

Give a second graph with equal step costs. Ask for the first two queue updates. Later ask why minimizing steps also minimizes cost on that graph.

### Cycle 4: uniform-cost search

Explain that uniform-cost search chooses the frontier route with the smallest cost so far. This cost is commonly written g.

Show each update:

| Action | Routes still under consideration |
| --- | --- |
| Examine S | A at cost 2, G at cost 9 |
| Examine A | G can now be reached at cost 5 |
| Examine the cheapest G route | Return cost 5 |

Explain why discovering G at cost 9 was not enough to stop. A cheaper route could still be found through A.

State the conditions behind the guarantee. Use the standard positive-cost setting for the first lesson. Explain goal testing when the cheapest route is removed from the frontier.

Ask a similar problem with different connections. Require the frontier after every step.

### Cycle 5: choose a method

Mix an equal-cost graph and a graph with unequal costs. Ask the learner to choose BFS or UCS and explain the choice.

Later, connect this to A*: teach “cost already paid” before adding “estimated cost remaining.” Give the learner a table with separate g, h and g+h columns.

## Build the other units through similarly small ideas

- **Adversarial search:** start with terminal scores. Show one player choosing the larger score and the opponent choosing the smaller score. Build a two-level tree before teaching bounds and pruning.
- **Logic:** begin with concrete statements and assignments of true or false. Teach implication before entailment. Use a two-person example to explain why quantifier order changes meaning.
- **Conditional independence:** begin with a small probability table. Explain what conditioning changes. Then connect tables to arrows and paths in a Bayesian network.
- **Variable elimination:** teach what one factor table represents. Show multiplication on one assignment. Then sum out one hidden variable and normalize a two-entry result.
- **Sampling:** explain one random draw and one estimated proportion. Then show what rejection discards and what a likelihood weight counts. Compare a small estimate with an exact result.

For each exam question, distinguish the fact needed, the representation to construct, the method to choose, and the calculation or argument to carry out. Use the existing paper analysis for the DSA/DBMS review. Extend that process to AI before claiming the AI practice mirrors the papers.

## Check the finished material

Read it as a beginner. Can the reader explain each new word before the next step depends on it? Can they see where every number comes from? Can they solve the next problem using what the lesson actually taught?

Use clear HTML tables, code and diagrams. Display mathematical notation reliably. Avoid raw LaTeX or unexplained symbols. Keep teacher notes separate from student instructions.
