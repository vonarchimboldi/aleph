import type { Chapter } from "./data";
import { umpNpTestsConceptGraph } from "./conceptGraphs";

export const umpNpTestsChapter: Chapter = {
  id: "chapter-2",
  slug: "ch2-ump-and-np-tests",
  number: 2,
  title: "UMP and Neyman-Pearson Tests",
  description:
    "Build tests from likelihood ratios: choose the rejection direction, calibrate the size under the null, then compute power under the alternative.",
  conceptGraph: umpNpTestsConceptGraph,
  sections: [
    {
      id: "sec-2-1",
      slug: "core-pattern",
      title: "Core Pattern",
      type: "read",
      estimatedMinutes: 15,
      content: `## The Neyman-Pearson test

The Neyman-Pearson test rejects where the alternative likelihood is large compared with the null likelihood.

\[
  \\Lambda(x)=\\frac{L_1(x)}{L_0(x)},\\qquad
  \\text{reject }H_0\\text{ for large }\\Lambda(x).
\]

For one-sided composite alternatives, look for a **monotone likelihood ratio**. Then the same tail test works uniformly over the one-sided alternative.

## Checklist

- Write \(L_1/L_0\) before choosing a critical region.
- Decide whether large or small values support the alternative.
- Set the critical value using probability under \(H_0\).
- Use randomization only when the boundary mass prevents exact size.
- Compute power using the alternative distribution.
- For UMP, name the statistic with monotone likelihood ratio.`,
      readingQuestions: [
        {
          question: "What does the likelihood ratio \(\Lambda(x)\) compare?",
          hint: "It compares the probability of the data under the alternative to the probability under the null.",
        },
        {
          question: "When can a one-sided test be UMP?",
          hint: "When the family of distributions has a monotone likelihood ratio in the test statistic.",
        },
      ],
    },
    {
      id: "sec-2-2",
      slug: "mechanics",
      title: "Mechanics: Problems 1–5",
      type: "mechanic",
      estimatedMinutes: 40,
      content: `## Practice problems

Solve the mechanics problems below before moving to applications.`,
      problems: [
        {
          id: "ump-p-1",
          label: "mechanic",
          conceptId: "simple-vs-simple",
          conceptName: "Simple versus simple NP",
          statement: `Observe \(X\\sim\\operatorname{Bernoulli}(p)\). Test \(H_0:p=0.3\) against \(H_1:p=0.7\). Use the Neyman-Pearson idea to choose the rejection point, then find the size and power.`,
          answer: "Reject at X=1; size 0.3, power 0.7",
          solution: `The likelihood ratio is largest where the observation is more likely under \(p=0.7\) than under \(p=0.3\). For \(X=1\),
\[
  \\frac{P_{0.7}(X=1)}{P_{0.3}(X=1)}=\\frac{0.7}{0.3}.
\]
For \(X=0\),
\[
  \\frac{P_{0.7}(X=0)}{P_{0.3}(X=0)}=\\frac{0.3}{0.7}.
\]
So the most supportive point for \(H_1\) is \(X=1\). Rejecting when \(X=1\) has size \(P_{0.3}(X=1)=0.3\) and power \(P_{0.7}(X=1)=0.7\).`,
        },
        {
          id: "ump-p-2",
          label: "mechanic",
          conceptId: "likelihood-ratio",
          conceptName: "Likelihood ratio",
          statement: `Let \(X_1,\\ldots,X_n\) be independent Normal\((\\mu,1)\). Test \(H_0:\\mu=0\) against \(H_1:\\mu=1\). Show that the NP test rejects for large \(\sum X_i\).`,
          answer: "NP test rejects for large \\sum X_i",
          solution: `The likelihood ratio is
\[
  \\frac{L_1}{L_0}=\\frac{\\prod_i \\exp[-(x_i-1)^2/2]}{\\prod_i \\exp[-x_i^2/2]}.
\]
Ignore constants shared by numerator and denominator. The exponent difference is
\[
  -\\frac12\\sum_i (x_i-1)^2+\\frac12\\sum_i x_i^2=\\sum_i x_i-\\frac n2.
\]
Thus \(L_1/L_0=\\exp(\\sum_i x_i-n/2)\). This increases as \(\sum_i X_i\) increases, so the NP rejection region has the form \(\sum_i X_i>c\).`,
        },
        {
          id: "ump-p-3",
          label: "mechanic",
          conceptId: "rejection-direction",
          conceptName: "Rejection direction",
          statement: `Let \(X_1,\\ldots,X_n\) be independent Exponential\((\\lambda)\), with density \(\lambda e^{-\\lambda x}\). Test \(H_0:\\lambda=\\lambda_0\) against \(H_1:\\lambda=\\lambda_1\), where \(\lambda_1>\\lambda_0\). Which values of \(\sum X_i\) support \(H_1\)?`,
          answer: "Small values of \\sum X_i support H_1",
          solution: `The likelihood ratio is
\[
  \\frac{L_1}{L_0}=\\left(\\frac{\\lambda_1}{\\lambda_0}\\right)^n\\exp[-(\\lambda_1-\\lambda_0)\\sum_i x_i].
\]
Since \(\lambda_1-\\lambda_0>0\), this ratio decreases as \(\sum_i x_i\) increases. A larger rate means shorter waits, so small total waiting time supports \(H_1\). The NP test therefore rejects \(H_0\) for \(\sum_i X_i<c\), with \(c\) chosen from the null distribution to get the desired size.`,
        },
        {
          id: "ump-p-4",
          label: "mechanic",
          conceptId: "size-calibration",
          conceptName: "Size calibration",
          statement: `Let \(X\\sim\\operatorname{Binomial}(2,p)\). Test \(H_0:p=0.5\) against \(H_1:p=0.8\). Use the rejection region \(X=2\). Find the size and the power.`,
          answer: "Size 0.25, power 0.64",
          solution: `For \(p=0.8\), larger \(X\) gives stronger support for the alternative, so \(X=2\) is the strongest two-success region.
The size is computed under \(H_0\):
\[
  P_{0.5}(X=2)=\\binom22(0.5)^2=0.25.
\]
The power is computed under \(H_1\):
\[
  P_{0.8}(X=2)=\\binom22(0.8)^2=0.64.
\]
So this test has size \(0.25\) and power \(0.64\).`,
        },
        {
          id: "ump-p-5",
          label: "mechanic",
          conceptId: "randomization",
          conceptName: "Randomization at the boundary",
          statement: `Let \(X\\sim\\operatorname{Binomial}(2,p)\). Test \(H_0:p=0.5\) against \(H_1:p=0.8\). Construct a size \(0.30\) test by rejecting always when \(X=2\) and rejecting with probability \(\gamma\) when \(X=1\). Find \(\gamma\) and the power.`,
          answer: "\\gamma=0.10, power=0.672",
          solution: `Under \(H_0\),
\[
  P_{0.5}(X=2)=0.25,\\qquad P_{0.5}(X=1)=0.5.
\]
The size of the randomized test is \(0.25+\\gamma(0.5)\). Set this equal to \(0.30\). Then \(\gamma=0.10\).
Under \(H_1\),
\[
  P_{0.8}(X=2)=0.64,\\qquad P_{0.8}(X=1)=2(0.8)(0.2)=0.32.
\]
The power is \(0.64+0.10(0.32)=0.672\).`,
        },
      ],
    },
    {
      id: "sec-2-3",
      slug: "applications",
      title: "Applications: Problems 6–8",
      type: "integration",
      estimatedMinutes: 40,
      content: `## Applications

These problems combine likelihood-ratio reasoning with common distributions.`,
      problems: [
        {
          id: "ump-p-6",
          label: "integration",
          conceptId: "one-sided-ump",
          conceptName: "One-sided UMP test",
          statement: `Let \(X_1,\\ldots,X_n\) be independent Normal\((\\mu,1)\). For testing \(H_0:\\mu\\le 0\) against \(H_1:\\mu>0\), give a level \(\alpha\) UMP test.`,
          answer: "Reject when \\sum X_i > \\sqrt n\\,z_{1-\\alpha}",
          solution: `The likelihood ratio for a larger mean increases with \(\sum_i X_i\). This is the monotone likelihood ratio structure in the statistic \(T=\\sum_i X_i\).
For the composite null \(\mu\\le0\), the largest rejection probability occurs at the boundary \(\mu=0\). Under \(\mu=0\),
\[
  T=\\sum_i X_i\\sim N(0,n).
\]
Choose \(c_\\alpha=\\sqrt n\\,z_{1-\\alpha}\). The test rejects when
\[
  \\sum_{i=1}^n X_i> \\sqrt n\\,z_{1-\\alpha}.
\]
This has level \(\alpha\) and is UMP for the one-sided alternative because the normal family has monotone likelihood ratio in \(\sum X_i\).`,
        },
        {
          id: "ump-p-7",
          label: "integration",
          conceptId: "likelihood-ratio",
          conceptName: "Likelihood ratio",
          statement: `Let \(X_1,\\ldots,X_n\) have density \(f_\\theta(x)=\\theta x^{\\theta-1}\), \(0<x<1\). Test \(H_0:\\theta=1\) against \(H_1:\\theta=2\). Show the NP test can be written using \(\sum \\log X_i\), and state the rejection direction.`,
          answer: "Reject for large \\sum \\log X_i (equivalently small \\sum(-\\log X_i))",
          solution: `The likelihood ratio is
\[
  \\frac{L_2}{L_1}=\\prod_{i=1}^n \\frac{2x_i}{1}=2^n\\prod_{i=1}^n x_i.
\]
Taking logs gives
\[
  \\log(L_2/L_1)=n\\log2+\\sum_i \\log x_i.
\]
The ratio is larger when \(\sum_i\\log X_i\) is larger. Since \(0<X_i<1\), these log values are negative; larger means closer to zero, so the sample is concentrated near 1.
The NP test rejects for \(\sum_i\\log X_i>c\). Equivalently, with \(Y_i=-\\log X_i\), reject for small \(\sum_i Y_i\).`,
        },
        {
          id: "ump-p-8",
          label: "integration",
          conceptId: "monotone-likelihood-ratio",
          conceptName: "Monotone likelihood ratio",
          statement: `Let \(X_1,\\ldots,X_n\) be independent Poisson\((\\lambda)\). For testing \(H_0:\\lambda\\le\\lambda_0\) against \(H_1:\\lambda>\\lambda_0\), explain why a large-\(\sum X_i\) test is UMP, and state how to choose the cutoff.`,
          answer: "Poisson family has MLR in \\sum X_i; calibrate cutoff at \\lambda_0",
          solution: `The joint likelihood, ignoring data-only factorials, is
\[
  L(\\lambda)\\propto e^{-n\\lambda}\\lambda^{\\sum_i x_i}.
\]
For \(\lambda_1>\\lambda_0\), the likelihood ratio is
\[
  \\frac{L(\\lambda_1)}{L(\\lambda_0)}=e^{-n(\\lambda_1-\\lambda_0)}\\left(\\frac{\\lambda_1}{\\lambda_0}\\right)^{\\sum_i x_i}.
\]
This increases with \(T=\\sum_iX_i\), so the family has monotone likelihood ratio in \(T\). By the one-sided MLR result, reject for large \(T\).
Choose the cutoff \(c\), and randomization if needed, so that
\[
  P_{\\lambda_0}(T>c)+\\gamma P_{\\lambda_0}(T=c)=\\alpha,
\]
where \(T\\sim\\operatorname{Poisson}(n\\lambda_0)\) under the boundary null.`,
        },
      ],
    },
    {
      id: "sec-2-4",
      slug: "challenges",
      title: "ISI-Style Challenges: Problems 9–10",
      type: "challenge",
      estimatedMinutes: 35,
      content: `## Challenge problems

These problems test conceptual depth and exam-style reasoning.`,
      problems: [
        {
          id: "ump-p-9",
          label: "challenge",
          conceptId: "no-two-sided-ump",
          conceptName: "No two-sided UMP",
          statement: `Let \(X\\sim N(\\mu,1)\). Explain why there is no nontrivial UMP level-\(\alpha\) test for \(H_0:\\mu=0\) against \(H_1:\\mu\\ne0\).`,
          answer: "Positive and negative alternatives require opposite NP tails",
          solution: `Against the simple alternative \(\mu=a>0\), the NP most powerful test rejects for large \(X\). Against the simple alternative \(\mu=-a<0\), the NP most powerful test rejects for small \(X\).
A single level-\(\alpha\) test cannot put all its rejection probability in the right tail and also put all its rejection probability in the left tail. The two simple alternatives demand different most-powerful critical regions.
Therefore a test that is most powerful for every \(\mu>0\) and every \(\mu<0\) at the same level cannot exist, except for degenerate cases. This is why two-sided normal testing uses other optimality ideas, such as unbiasedness or likelihood-ratio tests, rather than UMP over all two-sided alternatives.`,
        },
        {
          id: "ump-p-10",
          label: "challenge",
          conceptId: "randomization",
          conceptName: "Randomization at the boundary",
          statement: `Let \(X\\sim\\operatorname{Binomial}(3,p)\). Test \(H_0:p=0.5\) against \(H_1:p=0.75\). Construct a size \(0.20\) NP test using randomization, then compute its power.`,
          answer: "Reject at X=3, randomize at X=2 with \\gamma=0.2; power 0.50625",
          solution: `The likelihood ratio increases with \(X\), because the alternative has the larger success probability. Start from the largest value \(X=3\).
Under \(H_0\),
\[
  P_{0.5}(X=3)=\\frac18=0.125,\\qquad P_{0.5}(X=2)=\\frac38=0.375.
\]
To reach size \(0.20\), reject always at \(X=3\) and reject with probability \(\gamma\) at \(X=2\):
\[
  0.125+\\gamma(0.375)=0.20.
\]
Thus \(\gamma=0.075/0.375=0.2\).
Under \(H_1\),
\[
  P_{0.75}(X=3)=0.75^3=\\frac{27}{64},\\qquad P_{0.75}(X=2)=3(0.75)^2(0.25)=\\frac{27}{64}.
\]
The power is
\[
  \\frac{27}{64}+0.2\\cdot\\frac{27}{64}=\\frac{32.4}{64}=0.50625.
\]`,
        },
      ],
    },
    {
      id: "sec-2-5",
      slug: "conceptual-review",
      title: "Conceptual Review",
      type: "review",
      estimatedMinutes: 10,
      content: `## Quick review

Before taking the section quiz, review these key ideas:
- Likelihood ratio \(\Lambda=L_1/L_0\)
- Rejection direction for one-sided alternatives
- Size calibration under \(H_0\)
- Randomization at the boundary
- UMP via monotone likelihood ratio
- Why two-sided UMP tests usually do not exist`,
    },
    {
      id: "sec-2-6",
      slug: "section-quiz",
      title: "Section Quiz",
      type: "quiz",
      estimatedMinutes: 10,
      content: `## Section quiz

Answer all questions to unlock the next section.`,
      quiz: [
        {
          id: "ump-q-1",
          prompt: `For a simple-versus-simple test, the Neyman-Pearson lemma says the most powerful test rejects for:`,
          format: "mcq",
          options: [
            { id: "a", text: "Large values of the null likelihood" },
            { id: "b", text: "Large values of the alternative likelihood" },
            { id: "c", text: "Large values of the likelihood ratio L1/L0" },
            { id: "d", text: "Small values of the p-value" },
          ],
          correctAnswer: "c",
          explanation: "The NP lemma rejects for large values of the likelihood ratio \u003c\u003c?\u003e\u003e L_1/L_0.",
          conceptId: "simple-vs-simple",
          conceptName: "Simple versus simple NP",
        },
        {
          id: "ump-q-2",
          prompt: `When testing \(H_0:\\lambda=\\lambda_0\) vs \(H_1:\\lambda\u003e\\lambda_0\) for an Exponential sample, the UMP test rejects for:`,
          format: "mcq",
          options: [
            { id: "a", text: "Large \\sum X_i" },
            { id: "b", text: "Small \\sum X_i" },
            { id: "c", text: "Large \\sum \\log X_i" },
            { id: "d", text: "Either tail" },
          ],
          correctAnswer: "b",
          explanation: "A larger rate means shorter waiting times, so small \(\sum X_i\) supports the alternative.",
          conceptId: "rejection-direction",
          conceptName: "Rejection direction",
        },
        {
          id: "ump-q-3",
          prompt: `Why is there usually no UMP test for \(H_0:\\mu=0\) vs \(H_1:\\mu\\ne0\) with \(X\\sim N(\\mu,1)\)?`,
          format: "mcq",
          options: [
            { id: "a", text: "The normal distribution is symmetric" },
            { id: "b", text: "Positive and negative alternatives demand opposite NP tails" },
            { id: "c", text: "The likelihood ratio is not defined" },
            { id: "d", text: "UMP tests only exist for discrete distributions" },
          ],
          correctAnswer: "b",
          explanation: "The most powerful test for \(\mu=a\u003e0\) rejects for large \(X\); for \(\mu=-a\u003c0\) it rejects for small \(X\). A single test cannot be optimal for both.",
          conceptId: "no-two-sided-ump",
          conceptName: "No two-sided UMP",
        },
      ],
    },
    {
      id: "sec-2-7",
      slug: "chapter-summary",
      title: "Chapter Summary",
      type: "summary",
      estimatedMinutes: 5,
      content: `## Summary

In this chapter you learned:
- How to form the likelihood ratio for simple-versus-simple tests.
- How to choose the rejection direction from the likelihood ratio.
- How to calibrate size under \(H_0\) and compute power under \(H_1\).
- When randomization at the boundary is needed.
- Why one-sided UMP tests exist under monotone likelihood ratio.
- Why two-sided UMP tests usually do not exist.

## Next chapter

Chapter 3 introduces **estimation**: method of moments, maximum likelihood, and properties of estimators.`,
    },
  ],
};
