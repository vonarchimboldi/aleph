export interface ConceptNode {
  label: string;
  prereqs: string[];
  repairMaterial: string;
  gateWeight?: "high" | "medium" | "low";
}

export interface ConceptGraph {
  chapterId: string;
  chapterTitle: string;
  gateWeight: "high" | "medium" | "low";
  fallbackConcepts: string[];
  fallbackDifficultyMix: number[];
  fallbackInstruction: string;
  stableNextAction: string;
  nodes: Record<string, ConceptNode>;
}

export const conditionalExpectationConceptGraph: ConceptGraph = {
  chapterId: "gate-da-conditional-expectation-variance",
  chapterTitle: "Conditional Expectation and Conditional Variance",
  gateWeight: "high",
  fallbackConcepts: ["conditional-expectation", "tower-property", "total-expectation"],
  fallbackDifficultyMix: [1, 2, 2, 3],
  fallbackInstruction:
    "Move to a compact Chapter 7 review set that starts with conditional averages, then mixes tower property, variance decomposition, prediction, and fair-game recognition.",
  stableNextAction: "Next: try a mixed Chapter 7 review set at difficulty 3.",
  nodes: {
    expectation: {
      label: "Expectation prerequisite",
      prereqs: [],
      repairMaterial:
        "Review Chapter 3 expectation as a weighted average before conditioning on information.",
      gateWeight: "high",
    },
    variance: {
      label: "Variance prerequisite",
      prereqs: [],
      repairMaterial:
        "Review Chapter 4 variance and the shortcut Var(X)=E[X^2]-(E[X])^2 before using conditional variance.",
      gateWeight: "high",
    },
    "case-splitting": {
      label: "Case splitting",
      prereqs: [],
      repairMaterial:
        "Review total probability and split by the first-stage source, group, or observed value before averaging.",
      gateWeight: "high",
    },
    "conditional-expectation": {
      label: "Conditional expectation",
      prereqs: ["expectation", "case-splitting"],
      repairMaterial:
        "Review Chapter 7.1 and explain conditional expectation as the average after information is known.",
      gateWeight: "high",
    },
    "conditional-expectation-value": {
      label: "Conditional expectation at Y=y",
      prereqs: ["conditional-expectation"],
      repairMaterial:
        "Practice computing E[X|Y=y] from one conditional distribution after fixing the observed value y.",
      gateWeight: "high",
    },
    "conditional-expectation-random-variable": {
      label: "Conditional expectation as a random variable",
      prereqs: ["conditional-expectation-value"],
      repairMaterial:
        "Review the difference between E[X|Y=y] as a number and E[X|Y] as the rule that changes with Y.",
      gateWeight: "high",
    },
    "tower-property": {
      label: "Tower property",
      prereqs: ["conditional-expectation-random-variable", "expectation"],
      repairMaterial:
        "Redo one grouped-average example and verify that averaging E[X|Y] over Y gives E[X].",
      gateWeight: "high",
    },
    "total-expectation": {
      label: "Total expectation",
      prereqs: ["case-splitting", "tower-property"],
      repairMaterial:
        "Review Chapter 7.3 and compute an overall mean from case probabilities times case means.",
      gateWeight: "high",
    },
    "conditional-variance": {
      label: "Conditional variance",
      prereqs: ["conditional-expectation", "variance"],
      repairMaterial:
        "Compute E[X^2|Y=y]-(E[X|Y=y])^2 inside one condition before moving to total variance.",
      gateWeight: "high",
    },
    "total-variance": {
      label: "Total variance",
      prereqs: ["conditional-variance", "total-expectation"],
      repairMaterial:
        "Review Var(X)=E[Var(X|Y)]+Var(E[X|Y]) and label within-group and between-group spread.",
      gateWeight: "high",
    },
    prediction: {
      label: "Best prediction",
      prereqs: ["conditional-expectation-random-variable"],
      repairMaterial:
        "Review why E[X|Y] is the best squared-error prediction after observing Y.",
      gateWeight: "medium",
    },
    "zero-mean-increment": {
      label: "Zero-mean increment",
      prereqs: ["conditional-expectation"],
      repairMaterial:
        "Check whether the next change has conditional mean 0 after the current information is known.",
      gateWeight: "medium",
    },
    "fair-game": {
      label: "Fair-game intuition",
      prereqs: ["conditional-expectation-random-variable", "zero-mean-increment"],
      repairMaterial:
        "Review the fair-game example and state why the expected next value equals the current value.",
      gateWeight: "medium",
    },
    "conditioning-choice": {
      label: "Conditioning choice",
      prereqs: ["case-splitting", "total-expectation"],
      repairMaterial:
        "Look for first-stage language such as chosen box, source, group, or observed signal, then condition on that variable.",
      gateWeight: "high",
    },
  },
};

export const continuousDistributionsOrderStatisticsConceptGraph: ConceptGraph = {
  chapterId: "gate-da-continuous-distributions-order-statistics",
  chapterTitle: "Continuous Distributions and Order Statistics",
  gateWeight: "high",
  fallbackConcepts: ["exponential", "poisson", "order-statistics"],
  fallbackDifficultyMix: [1, 2, 2, 3],
  fallbackInstruction:
    "Move to a compact Chapter 8 review set that starts with distribution stories, then mixes Poisson-process links, normal standardisation, order-statistic CDFs, beta, and interval-count reasoning.",
  stableNextAction: "Next: try a mixed Chapter 8 review set at difficulty 3.",
  nodes: {
    "distribution-recognition": {
      label: "Distribution recognition",
      prereqs: [],
      repairMaterial:
        "Review Chapter 8.1 and classify each variable as a count, wait, measurement, sorted value, gap, or proportion.",
      gateWeight: "high",
    },
    "conditional-probability": {
      label: "Conditional-probability prerequisite",
      prereqs: [],
      repairMaterial:
        "Review Chapter 2 conditional probability before deriving exponential memorylessness.",
      gateWeight: "medium",
    },
    cdf: {
      label: "CDF prerequisite",
      prereqs: [],
      repairMaterial:
        "Review CDF statements as events of the form X<=x before translating order-statistic events.",
      gateWeight: "high",
    },
    independence: {
      label: "Independence prerequisite",
      prereqs: [],
      repairMaterial:
        "Review multiplying probabilities for iid observations before deriving min, max, or kth-order CDFs.",
      gateWeight: "high",
    },
    uniform: {
      label: "Uniform prerequisite",
      prereqs: [],
      repairMaterial:
        "Review Uniform(0,1) probabilities as interval lengths before using beta and spacing facts.",
      gateWeight: "medium",
    },
    "sample-sorting": {
      label: "Sample sorting",
      prereqs: [],
      repairMaterial:
        "Sort a five-value sample by hand and label X_(1), X_(2), ..., X_(n) before using formulas.",
      gateWeight: "high",
    },
    exponential: {
      label: "Exponential waiting time",
      prereqs: ["distribution-recognition"],
      repairMaterial:
        "Review Chapter 8.2 and translate T>t into 'no event has arrived by time t'.",
      gateWeight: "high",
    },
    memorylessness: {
      label: "Memorylessness",
      prereqs: ["exponential", "conditional-probability"],
      repairMaterial:
        "Redo the Chapter 8.2 derivation of P(T>s+t | T>s)=P(T>t) using exponential survival.",
      gateWeight: "high",
    },
    poisson: {
      label: "Poisson count",
      prereqs: ["distribution-recognition"],
      repairMaterial:
        "Review Chapter 8.3 and identify the fixed interval and its expected count before using the Poisson PMF.",
      gateWeight: "high",
    },
    "poisson-process": {
      label: "Poisson-process count/wait link",
      prereqs: ["poisson", "exponential"],
      repairMaterial:
        "Review Chapter 8.4 and practice translating T_1>t to N(t)=0 and T_k<=t to N(t)>=k.",
      gateWeight: "high",
    },
    gamma: {
      label: "Gamma waiting time",
      prereqs: ["exponential", "poisson-process"],
      repairMaterial:
        "Review Chapter 8.5 and explain why the kth-event wait is a sum of k exponential gaps.",
      gateWeight: "medium",
    },
    normal: {
      label: "Normal distribution",
      prereqs: ["distribution-recognition"],
      repairMaterial:
        "Review Chapter 8.6 and identify the mean and standard deviation before standardising.",
      gateWeight: "high",
    },
    standardisation: {
      label: "Standardisation",
      prereqs: [],
      repairMaterial:
        "Practice computing z=(x-mu)/sigma and interpret it as standard-deviation units from the mean.",
      gateWeight: "high",
    },
    "standard-normal": {
      label: "Standard normal",
      prereqs: ["normal", "standardisation"],
      repairMaterial:
        "Review Chapter 8.6 and convert one Normal(mu, sigma^2) probability into a Phi statement.",
      gateWeight: "high",
    },
    "order-statistics": {
      label: "Order statistics",
      prereqs: ["sample-sorting"],
      repairMaterial:
        "Review Chapter 8.7 and translate minimum, maximum, and kth-smallest language into sorted sample notation.",
      gateWeight: "high",
    },
    "order-statistic-cdf": {
      label: "Order-statistic CDF method",
      prereqs: ["order-statistics", "cdf", "independence"],
      repairMaterial:
        "Practice deriving P(max<=m)=F(m)^n and P(X_(k)<=x) by counting observations at or below x.",
      gateWeight: "high",
    },
    beta: {
      label: "Beta from uniform order statistics",
      prereqs: ["order-statistics", "uniform"],
      repairMaterial:
        "Review Chapter 8.8 and connect U_(k) to Beta(k,n+1-k) by counting points left of u.",
      gateWeight: "medium",
    },
    multinomial: {
      label: "Multinomial interval counts",
      prereqs: ["uniform"],
      repairMaterial:
        "Review fixed interval counts and use interval lengths as cell probabilities.",
      gateWeight: "medium",
    },
    "uniform-spacings": {
      label: "Uniform spacings and fixed intervals",
      prereqs: ["uniform", "multinomial"],
      repairMaterial:
        "Review Chapter 8.9 and replace fixed-interval spacing questions with multinomial counts when possible.",
      gateWeight: "medium",
    },
    "exponential-family": {
      label: "Exponential-family recognition",
      prereqs: ["distribution-recognition"],
      repairMaterial:
        "Review Chapter 8.10 and list why Poisson, exponential, gamma, normal, and beta models reappear in inference.",
      gateWeight: "medium",
    },
  },
};

export const umpNpTestsConceptGraph: ConceptGraph = {
  chapterId: "gate-da-ump-np-tests",
  chapterTitle: "UMP and Neyman-Pearson Tests",
  gateWeight: "high",
  fallbackConcepts: ["likelihood-ratio", "rejection-direction", "size-calibration"],
  fallbackDifficultyMix: [1, 2, 2, 3],
  fallbackInstruction:
    "Move to a compact review set that starts with simple-versus-simple likelihood ratios, then adds one-sided UMP tests, randomization at boundaries, and two-sided limitations.",
  stableNextAction: "Next: try a mixed UMP/NP review set at difficulty 3.",
  nodes: {
    "likelihood-ratio": {
      label: "Likelihood ratio",
      prereqs: [],
      repairMaterial:
        "Write L1/L0 and identify where the alternative is much more likely than the null.",
      gateWeight: "high",
    },
    "rejection-direction": {
      label: "Rejection direction",
      prereqs: ["likelihood-ratio"],
      repairMaterial:
        "Decide whether large or small values of the test statistic support the alternative.",
      gateWeight: "high",
    },
    "size-calibration": {
      label: "Size calibration",
      prereqs: ["rejection-direction"],
      repairMaterial:
        "Set the critical value using probability under H0, and randomize at the boundary if needed.",
      gateWeight: "high",
    },
    "simple-vs-simple": {
      label: "Simple versus simple NP",
      prereqs: ["likelihood-ratio", "size-calibration"],
      repairMaterial:
        "Apply the Neyman-Pearson lemma: the most powerful test rejects for large values of L1/L0.",
      gateWeight: "high",
    },
    "monotone-likelihood-ratio": {
      label: "Monotone likelihood ratio",
      prereqs: ["simple-vs-simple"],
      repairMaterial:
        "Check that the likelihood ratio is monotone in a one-dimensional statistic.",
      gateWeight: "high",
    },
    "one-sided-ump": {
      label: "One-sided UMP test",
      prereqs: ["monotone-likelihood-ratio", "size-calibration"],
      repairMaterial:
        "For one-sided composite alternatives, use the MLR statistic and calibrate at the boundary null.",
      gateWeight: "high",
    },
    randomization: {
      label: "Randomization at the boundary",
      prereqs: ["size-calibration"],
      repairMaterial:
        "When exact size is impossible with pure rejection, randomize at the boundary mass.",
      gateWeight: "medium",
    },
    power: {
      label: "Power computation",
      prereqs: ["size-calibration"],
      repairMaterial:
        "Compute the rejection probability under the alternative using the chosen critical region.",
      gateWeight: "high",
    },
    "no-two-sided-ump": {
      label: "No two-sided UMP",
      prereqs: ["simple-vs-simple"],
      repairMaterial:
        "Explain why positive and negative alternatives demand opposite NP tails.",
      gateWeight: "medium",
    },
  },
};

export const conceptGraphsByChapterId: Record<string, ConceptGraph> = {
  [conditionalExpectationConceptGraph.chapterId]: conditionalExpectationConceptGraph,
  [continuousDistributionsOrderStatisticsConceptGraph.chapterId]:
    continuousDistributionsOrderStatisticsConceptGraph,
  [umpNpTestsConceptGraph.chapterId]: umpNpTestsConceptGraph,
};

export function getConceptGraph(chapterId: string): ConceptGraph | undefined {
  return conceptGraphsByChapterId[chapterId];
}
