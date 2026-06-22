/**
 * Probability Chapters 5-10 Content Roadmap
 * Extracted from: /Users/akshat/Documents/Code/Personal/aleph/probability_chapters_5_10_notes.md
 *
 * This is the canonical content plan for Probability and Statistics.
 * Style: textbook-first — motivate with practical problems, derive formulas, then practice.
 */

export interface ChapterRoadmap {
  number: number;
  title: string;
  slug: string;
  purpose: string;
  prerequisites: string[];
  coreSections: string[];
  teachingNotes: string[];
  practiceThemes: string[];
}

export const PROBABILITY_ROADMAP: ChapterRoadmap[] = [
  {
    number: 5,
    title: "Joint Distributions",
    slug: "joint-distributions",
    purpose:
      "Build the two-variable language needed before covariance, correlation, and conditional expectation. Covariance and conditional expectation should not appear as isolated formulas before the learner understands joint, marginal, and conditional laws.",
    prerequisites: ["chapter-4"],
    coreSections: [
      "Why one random variable is not enough",
      "Joint PMF for discrete random variables",
      "Joint PDF for continuous random variables",
      "Marginal distributions",
      "Conditional distributions",
      "Independence of random variables",
      "Support regions and why bounds matter",
      "Sums, min, max, and simple transformations from joint laws",
    ],
    teachingNotes: [
      "Start from concrete paired data: score and time spent, two dice, two component lifetimes, height and weight, two sensor readings.",
      "Emphasize that a joint distribution tells us how variables move together, not just what each variable does alone.",
      "For discrete joint PMFs, use tables heavily.",
      "For continuous joint PDFs, spend time on support regions. Many errors come from integrating over the wrong region.",
      "Independence should be presented as a factorization property: f(x,y)=f_X(x)f_Y(y) or p(x,y)=p_X(x)p_Y(y).",
      "Keep early transformation examples simple: sum of two dice, max/min of uniforms, and rectangular support examples.",
    ],
    practiceThemes: [
      "Recover marginals from a joint table.",
      "Compute conditional probabilities from joint tables.",
      "Check independence from joint tables and PDFs.",
      "Integrate over triangular and rectangular regions.",
      "Find distributions of X+Y, min(X,Y), and max(X,Y) in simple cases.",
    ],
  },
  {
    number: 6,
    title: "Covariance and Correlation",
    slug: "covariance-correlation",
    purpose:
      "Use joint distributions to quantify how two random variables move together. This chapter should feel like the natural next step after joint PMF/PDF, not a disconnected descriptive-statistics topic.",
    prerequisites: ["chapter-5"],
    coreSections: [
      "Why paired movement matters",
      "E[XY] from a joint distribution",
      "Covariance definition and interpretation",
      "Correlation as unit-free covariance",
      "Independence versus zero covariance",
      "Variance of sums",
      "Indicator-pair covariance",
      "Common covariance traps",
    ],
    teachingNotes: [
      "Define covariance as Cov(X,Y)=E[(X-E[X])(Y-E[Y])].",
      "Derive the computational form Cov(X,Y)=E[XY]-E[X]E[Y].",
      "Explain sign: positive covariance means high values of one tend to come with high values of the other; negative means high values of one tend to come with low values of the other.",
      "Correlation should be introduced as scaled covariance: rho=Cov(X,Y)/(SD(X)SD(Y)).",
      "Make clear: independence implies zero covariance when moments exist, but zero covariance does not imply independence in general.",
      "Use indicator-pair covariance to revisit without-replacement sampling and collision/counting problems.",
    ],
    practiceThemes: [
      "Compute E[XY], covariance, and correlation from a joint table.",
      "Decide whether two variables are independent.",
      "Compare zero covariance and independence with examples.",
      "Use Var(X+Y)=Var(X)+Var(Y)+2Cov(X,Y).",
      "Use indicator covariance in pair-counting problems.",
    ],
  },
  {
    number: 7,
    title: "Conditional Expectation and Conditional Variance",
    slug: "conditional-expectation",
    purpose:
      "Develop conditional expectation as average after information is observed. This chapter should also introduce conditional variance, tower property, law of total expectation, law of total variance, and fair-game intuition that naturally points toward martingales without requiring martingale theory.",
    prerequisites: ["chapter-5", "chapter-6"],
    coreSections: [
      "Conditional expectation as updated average",
      "E[X|Y=y] for discrete and continuous examples",
      "E[X|Y] as a random variable",
      "Tower property: E[E[X|Y]]=E[X]",
      "Law of total expectation",
      "Conditional variance",
      "Law of total variance",
      "Prediction and mean squared error intuition",
      "Fair-game examples and martingale intuition",
    ],
    teachingNotes: [
      "Start with grouped averages. Example: expected score after knowing difficulty level, expected waiting time after knowing which queue was chosen.",
      "Make the distinction clear: E[X|Y=y] is a number; E[X|Y] is a random variable depending on Y.",
      "The tower property should feel like averaging subgroup averages.",
      "Conditional variance should answer: after observing Y, how much uncertainty remains about X?",
      "Law of total variance should be explained as: remaining within-group uncertainty, plus variation between group means.",
      "Fair-game examples: expected future fortune in a fair coin betting game equals current fortune; expected next value after fair noise equals current value; expected sum of future fair increments stays at the current sum.",
      "Mention that this fair-game pattern is the intuition behind martingales, but do not develop martingale theory.",
    ],
    practiceThemes: [
      "Compute conditional expectations from joint tables.",
      "Compute conditional expectations from simple conditional PDFs.",
      "Apply tower property to two-stage experiments.",
      "Decompose variance using law of total variance.",
      "Use conditional expectation to simplify hard unconditional expectations.",
      "Identify fair-game expected-value invariance in simple processes.",
    ],
  },
  {
    number: 8,
    title: "Continuous Distributions and Order Statistics",
    slug: "continuous-distributions",
    purpose:
      "Build a practical continuous-distribution toolkit motivated by real modeling problems, then introduce order statistics and uniform spacings. This chapter should connect distributions to stories rather than present formulas as a catalogue.",
    prerequisites: ["chapter-5"],
    coreSections: [
      "Continuous distributions as models for time, size, error, and proportion",
      "Exponential distribution: waiting time until one event",
      "Poisson distribution: counts in a fixed interval",
      "Poisson process connection: counts and waiting times",
      "Gamma distribution: waiting time until several events",
      "Normal distribution: measurement error and aggregate noise",
      "Standard normal: z-scores, CDF values, and table use",
      "Order statistics: min, max, and kth ordered value",
      "Uniform order statistics",
      "Uniform spacings and interval-count problems",
      "Beta distribution from order statistics and proportions on [0,1]",
      "Short overview of the exponential family",
    ],
    teachingNotes: [
      "Exponential should be motivated by waiting times.",
      "Poisson should be motivated by counts: calls per hour, defects per length, events per interval.",
      "Gamma should be motivated as waiting time until the kth event, or as a sum of exponential waiting times.",
      "Normal should be motivated by measurement error, repeated small effects, and later CLT connections.",
      "Standard normal should be practical: z-values, table/CDF lookup, tail areas, and symmetry.",
      "Introduce order statistics before beta: X_(1) as minimum, X_(n) as maximum, X_(k) as kth smallest.",
      "Uniform spacings principle: sorted uniform points cut [0,1] into random gaps; fixed-interval counts are multinomial; random-gap lengths connect to beta/Dirichlet ideas.",
      "Beta should be introduced through uniform order statistics and proportions.",
      "Exponential family overview should be conceptual: many important distributions share a common algebraic structure; this helps explain why they appear in statistics, estimation, conjugacy, and generalized linear models; no heavy theory needed.",
    ],
    practiceThemes: [
      "Exponential waiting-time probabilities and memorylessness.",
      "Poisson count probabilities and rate scaling.",
      "Gamma waiting-time calculations for kth event.",
      "Normal z-score and tail probability calculations.",
      "Convert raw values to standard normal values.",
      "Derive min/max distributions using CDF methods.",
      "Use order-statistic density for uniform samples.",
      "Use multinomial counts for fixed interval occupancy.",
      "Recognize beta as a uniform order-statistic law.",
    ],
  },
  {
    number: 9,
    title: "Limit Theorems and Approximations",
    slug: "limit-theorems",
    purpose:
      "Explain why averages stabilize and why normal/Poisson approximations work. This chapter should connect exact probability, tail bounds, and approximation-based answers.",
    prerequisites: ["chapter-4", "chapter-8"],
    coreSections: [
      "Why approximation is needed",
      "Sample means and standard errors",
      "Law of large numbers",
      "Central limit theorem",
      "Standardized sums",
      "Normal approximation to binomial",
      "Continuity correction",
      "Poisson approximation to binomial",
      "Exact probability versus tail bound versus approximation",
      "Approximation diagnostics and common traps",
    ],
    teachingNotes: [
      "Start with simulation-style intuition: averages become stable, sums become bell-shaped under broad conditions.",
      "LLN should answer: why does the sample average approach the population mean?",
      "CLT should answer: why do standardized sums and averages become approximately normal?",
      "Normal approximation to binomial should be motivated by many independent Bernoulli trials with not-too-small np and n(1-p).",
      "Poisson approximation to binomial should be motivated by many trials with rare success and moderate np.",
      "Compare: exact binomial calculation, Chebyshev/Chernoff bound, normal approximation, Poisson approximation.",
      "Make approximation conditions explicit. The learner should know when an approximation is a bad idea.",
    ],
    practiceThemes: [
      "Compute standard errors for sample means.",
      "Use CLT to approximate probabilities for sums and averages.",
      "Approximate binomial tails by normal with continuity correction.",
      "Approximate rare-event binomial probabilities by Poisson.",
      "Compare exact, bounded, and approximate answers.",
      "Choose the correct method under exam time pressure.",
    ],
  },
  {
    number: 10,
    title: "Confidence Intervals and Hypothesis Tests",
    slug: "confidence-intervals-hypothesis-tests",
    purpose:
      "Cover inference topics: confidence intervals, z-tests, t-tests, and chi-squared tests. The chapter should emphasize methodology and interpretation, not rote formula memorization.",
    prerequisites: ["chapter-8", "chapter-9"],
    coreSections: [
      "The inference setup",
      "Parameters, estimators, and sampling variability",
      "Standard errors and reference distributions",
      "Confidence intervals as compatible parameter values",
      "Wald intervals",
      "Score intervals",
      "Null and alternative hypotheses",
      "Test statistics",
      "z-tests",
      "t-tests",
      "Chi-squared distribution",
      "Chi-squared tests",
      "p-values, critical values, and rejection regions",
      "Type I error, Type II error, and power",
      "Choosing the right test",
    ],
    teachingNotes: [
      "Confidence intervals should be built from the general idea: which parameter values are compatible with the observed data?",
      "Wald interval: estimator plus/minus critical value times standard error; simple and common; can behave poorly near boundaries or with small samples.",
      "Score interval: invert a score/test equation; especially useful to explain why proportion intervals can be better than naive Wald intervals.",
      "z-tests: derive Z=(estimator-null value)/standard error; use when the statistic is normal or approximately normal; examples: known-variance mean test, large-sample mean test, proportion test.",
      "t-tests: derive the need from unknown population standard deviation; replacing sigma by sample s adds uncertainty; the reference distribution becomes t rather than standard normal; examples: one-sample mean, paired differences, basic two-sample comparison if needed.",
      "Chi-squared distribution: explain as sum of squares of independent standard normals; degrees of freedom count how many independent squared normal components are being added.",
      "Chi-squared tests: goodness-of-fit; independence in contingency tables; variance test for normal samples if useful.",
      "For count tests, emphasize observed versus expected counts and why squared standardized discrepancies are added.",
      "Decision language: p-value is probability under the null of a result at least as extreme as observed; critical value is cutoff from the reference distribution; critical/rejection region leads to rejection; significance level alpha is allowed Type I error rate; power is probability of rejecting when the alternative is true.",
      "Power should be connected to effect size, sample size, variance, and alpha.",
    ],
    practiceThemes: [
      "Construct Wald confidence intervals for means and proportions.",
      "Compare Wald and score interval behavior for proportions.",
      "Derive and apply z-test statistics.",
      "Derive and apply t-test statistics.",
      "Use t tables or CDF values conceptually.",
      "Compute chi-squared goodness-of-fit statistics.",
      "Compute chi-squared independence statistics from contingency tables.",
      "Interpret p-values and rejection regions.",
      "Compare two tests by power in simple scenarios.",
    ],
  },
];

// ─── CROSS-CHAPTER DEPENDENCIES ────────────────────────────────

export const CROSS_CHAPTER_RULES = [
  "Chapter 5 must come before Chapters 6 and 7.",
  "Chapter 6 should rely on joint distributions rather than treating covariance as purely descriptive.",
  "Chapter 7 should rely on conditional distributions from Chapter 5.",
  "Chapter 8 should use Chapter 5 methods for order statistics and continuous transformations.",
  "Chapter 9 should reuse Chapter 4 tail bounds and Chapter 8 distributions.",
  "Chapter 10 should rely on Chapter 8 distributions and Chapter 9 CLT/approximation ideas.",
];

// ─── CHAPTER DELIVERABLES CHECKLIST ────────────────────────────

export const CHAPTER_REQUIRED_DELIVERABLES = [
  "Separate chapter page",
  "Labelled practice problems (10 problems, 5-3-2 progression)",
  "Objective review quiz",
  "Logged feedback tags",
  "Reading questions",
  "Chapter summary",
];

// ─── HELPER FUNCTIONS ──────────────────────────────────────────

export function getChapterBySlug(slug: string): ChapterRoadmap | undefined {
  return PROBABILITY_ROADMAP.find((c) => c.slug === slug);
}

export function getChapterByNumber(number: number): ChapterRoadmap | undefined {
  return PROBABILITY_ROADMAP.find((c) => c.number === number);
}

export function getChaptersByPrerequisite(prereqSlug: string): ChapterRoadmap[] {
  return PROBABILITY_ROADMAP.filter((c) =>
    c.prerequisites.includes(prereqSlug)
  );
}
