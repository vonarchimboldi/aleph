# Sample Platinum Probability Submission

I used indicators. Let \(I_j = 1\) if box \(j\) is nonempty, so
\[
X = I_1 + \cdots + I_n.
\]

For expectation I used
\[
E[X] = nP(I_1=1).
\]

For the variance I treated the indicators as independent and multiplied the
single-box probabilities. So my pair term is just the product of the two
marginal probabilities, and then I simplified to get the answer.

I am not fully sure whether the independence step is allowed.
