// Eight-week adaptation of Rebecca Willett's Fall 2025 course listing.
// Exercises and experiments below are original Aleph assignments, not official homework.
function platinumMachineLearningCurriculum() {
  const courseUrl = "https://willett.psd.uchicago.edu/teaching/mathematical-foundations-of-machine-learning/";
  const titles = [
    "Introduction", "Vectors and matrices", "Least squares", "Least squares and optimization",
    "Subspaces and bases", "Orthogonal bases", "SVD introduction", "SVD",
    "PCA", "Data leakage and matrix completion", "PageRank and ridge regression",
    "Pseudoinverse and kernel ridge regression", "Support vector machines",
    "Gradient descent and SGD", "Backpropagation", "Clustering and k-means", "Gaussian mixtures and EM"
  ];
  const lectures = titles.map((title, index) => {
    const number = index + 1;
    const month = number <= 9 ? "10" : number <= 15 ? "11" : "12";
    const suffix = number === 16 ? "-k-means" : number === 17 ? "-EM-Algorithm" : "";
    return { number, title: `Lecture ${number}: ${title}`, url: `https://willett.psd.uchicago.edu/files/2025/${month}/Lecture-${number}-Fall-2025${suffix}.pdf` };
  });
  const weeks = [
    {
      lectureNumbers: [1, 2], title: "From measurements to a learning problem",
      goals: "Define observations, features, labels, predictions, loss, and held-out evaluation. Track the dimensions of every array before fitting a model.",
      prerequisite: "Vectors, matrix multiplication, functions, and basic calculus. Check that you can multiply a 3×2 matrix by a length-2 vector. LA Week 1 supplies vector and system intuition; probability ideas are introduced when needed.",
      physicalModel: "A sensor reports voltage as a function of temperature. A sample is one measurement; a calibration session can contain many correlated samples. The goal is to predict temperature for a new session, not memorize repeated readings from an old one.",
      bridge: "The design matrix encodes how the instrument was observed. The choice of validation split encodes where the model is expected to work. A low training loss answers neither question by itself.",
      experiment: "Generate 120 observations in six sessions: 20 temperatures evenly spaced from 0 to 40 °C per session, with voltage v=0.5+0.02T+session_offset+noise V. Use independent Gaussian offsets with SD 0.03 V and noise with SD 0.01 V, with a fixed seed. Fit T from [1,v], compare random-row and held-out-session splits, and report the mean-predictor baseline. Keep one session untouched until the final comparison.",
      practice: [
        "P1. For three calibration pairs (v,T)=(0.5,0),(0.7,10),(0.9,20), write X, y, and a coefficient vector that fits exactly. Give the dimensions and units of the intercept and slope. Explain what one row and one column represent.",
        "P2. A learner randomly splits repeated readings from all sessions and reports excellent accuracy. Explain the deployment question this split answers, why it may overstate performance on a new session, and design a more appropriate evaluation."
      ],
      review: [
        "R1. A new sensor has a voltage offset of 0.1 V. Predict the temperature error using the exact calibration relation from P1 before running a simulation.",
        "R2. Contrast a coefficient, feature, label, prediction, training loss, and test error using the calibration model. Identify which quantities can be known before training."
      ],
      skills: ["design-matrix", "dimensions-units", "loss-risk", "grouped-split", "baseline"],
      repair: "If model and data are conflated, label one row and derive one prediction by hand. If the split is wrong, redraw the data-generating process and separate calibration sessions before fitting."
    },
    {
      lectureNumbers: [3, 4], title: "Least squares as fitting an instrument",
      goals: "Derive squared-error gradients and normal equations, interpret the residual geometrically, and compare a direct numerical solve with an iterative update.",
      prerequisite: "Differentiate a quadratic and compute dot products. Projections appear here before LA Chapter 4: work a two-vector projection example from these notes first; revisit it in LA Week 4. Do not wait for the parallel subject to supply the prerequisite.",
      physicalModel: "Measure extension x in metres under force F in newtons for a spring in its approximately linear regime. Model x=b+cF, where compliance c has units m/N. Measurement noise makes the equations inconsistent.",
      bridge: "A best fit chooses the achievable prediction vector nearest to the observations. Orthogonality of the residual is the stationarity condition of the same optimization problem.",
      experiment: "Generate forces evenly spaced over 0–10 N and extensions x=0.002+0.01F+Gaussian noise with SD 0.002 m. Fit [1,F] with a stable least-squares solver, then gradient descent. Compare coefficients, residuals, and loss versus iteration. Rescale force from N to mN and explain the change in coefficients and optimization behavior while predictions stay comparable. Split data before fitting.",
      practice: [
        "P1. Fit x=b+cF to F=(0,1,2) N and x=(0,1,1) mm. Derive the normal equations from the squared residual loss, solve them, and verify Xᵀ(Xβ−y)=0. Interpret the residual in observation space.",
        "P2. For L(β)=||Xβ−y||²/(2n), derive the gradient and perform one update from β=0 with a stated positive learning rate. State how you would detect a learning rate that is too large."
      ],
      review: [
        "R1. Add a duplicate force feature to the spring model. Can fitted predictions remain unique while coefficients cease to be unique? Explain using a concrete nullspace direction.",
        "R2. Why can a small training residual coexist with poor prediction on a spring loaded beyond its linear regime? Separate optimization error from model error and distribution shift."
      ],
      skills: ["least-squares", "gradient", "normal-equations", "residual-orthogonality", "conditioning"],
      repair: "If the gradient is wrong, check dimensions and a finite difference. If coefficient accuracy is confused with prediction accuracy, duplicate one feature and inspect unchanged predictions."
    },
    {
      lectureNumbers: [5, 6], title: "Redundant sensors and useful coordinates",
      goals: "Identify rank, image, nullspace, basis, and orthogonal coordinates in a data matrix; connect redundancy to identifiability and stable fitting.",
      prerequisite: "Linear combinations and independence from LA Weeks 1–3. Learn the required orthogonalization here before LA Chapter 4; check one Gram–Schmidt step by hand.",
      physicalModel: "Three sensors observe two latent signals s and t as y=(s,t,s+t). Measurements live in a plane in R³. Adding sensor noise moves them away from that plane.",
      bridge: "The number of recorded channels need not equal the number of independent physical degrees of freedom. A basis is a coordinate choice for those degrees of freedom, not a new physical signal.",
      experiment: "Generate 100 pairs (s,t) uniformly over [−1,1]², form y=(s,t,s+t), and add independent zero-mean noise with SD 0.02 per channel. Build an orthonormal basis from the two known mixing columns and project noisy observations onto their span. Plot residual norms as noise changes; compare with a nearly redundant pair of mixing columns and discuss numerical tolerance.",
      practice: [
        "P1. For A=[[1,0],[0,1],[1,1]], find its rank and a basis for its image. Find a nonzero normal to the measurement plane, orthonormalize the columns, and recover (s,t) from the noiseless reading (2,3,5).",
        "P2. A recorded reading is (2,3,5.3). Derive its closest point on the measurement plane and explain why it is generally preferable to correcting only the third channel under equal independent noise."
      ],
      review: [
        "R1. If all three sensors instead report multiples of s+t, can both latent signals be recovered? Exhibit two distinct latent states with identical readings.",
        "R2. Revisit Week 2: explain why rotating an orthonormal feature basis preserves the prediction subspace and least-squares residual norm, even though coefficients change."
      ],
      skills: ["rank", "subspace", "basis", "orthogonalization", "identifiability"],
      repair: "If sensor count is mistaken for rank, write the mixing columns and exhibit a dependence. If orthogonality is only numerical, derive the inner product in a small exact example."
    },
    {
      lectureNumbers: [7, 8, 9], title: "SVD and PCA for vibration measurements",
      goals: "Interpret left/right singular vectors, low-rank approximation, and PCA scores. Separate centering, fitting, and transformation of held-out data.",
      prerequisite: "Orthogonal coordinates from Week 3. ML reaches SVD one week before LA Chapter 5: use the course's introductory SVD notes and a diagonal 2×2 example before the experiment. This three-lecture week uses one small shared dataset.",
      physicalModel: "Several accelerometers observe mixtures of two oscillatory components. After centering, a low-rank data model may capture the main variation. Principal components need not be physical normal modes without additional assumptions.",
      bridge: "SVD describes how a data map stretches independent directions. PCA uses that geometry to summarize observed variability; it cannot establish a physical cause from variance alone.",
      experiment: "Construct 200 time samples and four channels from sin(t) and 0.3 cos(2t), t evenly spaced on [0,8π], mixed by columns a=(1,1,0,1) and b=(0,1,1,−1), plus Gaussian noise SD 0.05. Split by time block, center using only training means, and compare rank-1 and rank-2 reconstruction on held-out rows. Plot singular values, scores, and error as noise increases. Explain sign ambiguity and any temporal shift.",
      practice: [
        "P1. For A=diag(3,1), give its SVD and its best rank-one approximation in the Frobenius norm. Draw the image of the unit circle and compute the approximation error. Connect the discarded direction to lost measurement information.",
        "P2. Explain why PCA of uncentered temperature readings can mostly encode a common baseline. Design a train-only centering procedure, then state how to transform a new observation without refitting PCA."
      ],
      review: [
        "R1. Two PCA implementations return opposite signs for a component. Must their reconstructions disagree? Prove your answer using one rank-one term.",
        "R2. A low-variance direction predicts a rare but important failure. Does retaining 99% of variance guarantee a useful classifier? Construct a simple counterexample or data-generation sketch."
      ],
      skills: ["svd", "pca", "low-rank", "centering", "train-only-preprocessing"],
      repair: "If PCA is treated as supervised feature selection, separate variance from predictive signal. If held-out data influenced the mean or basis, rerun the entire pipeline with a clean split."
    },
    {
      lectureNumbers: [10, 11], title: "Missing measurements, ranking, and regularization",
      goals: "Handle missing entries without leaking evaluation data; connect low-rank completion, PageRank iteration, ridge penalties, and model selection.",
      prerequisite: "SVD from Week 4 and quadratic optimization from Week 2. LA Chapter 5 now reinforces spectral ideas. Review column-stochastic matrices and sum-to-one vectors before PageRank.",
      physicalModel: "A network of environmental stations records correlated daily signals with missing observations. A separate tiny directed graph models movement or attention between stations. Completion, ranking, and regression answer distinct questions about these data.",
      bridge: "A structural assumption can make an underdetermined problem useful, but it must be checked. Low rank does not identify arbitrary missing data, and a regularization parameter must be chosen using held-out evidence.",
      experiment: "Generate a 30×8 rank-two station matrix M=UVᵀ plus Gaussian noise SD 0.05 using a fixed seed. Mask 30% of entries, splitting observed entries into fit/validation/test masks before tuning rank; compare low-rank completion with a training-only column-mean baseline. Never treat unknown entries as observed zeros. Separately compare ridge strengths on Week 2's duplicated/noisy features and run a three-node PageRank iteration with damping 0.85 and uniform teleportation.",
      practice: [
        "P1. In a 2×2 rank-one matrix, entries M₁₁=1, M₁₂=2, M₂₁=3 are observed. Infer M₂₂ under the rank assumption. Explain why an entirely unobserved column is a different identifiability problem. Describe which entries may be used to choose a completion rank.",
        "P2. Derive the ridge normal equations for ||Xβ−y||²+λ||β||² and interpret λ. For a column-stochastic P, show that p↦0.85Pp+0.15·1/3 preserves nonnegativity and total mass when p is a probability vector. Explain why this update is a different problem from fitting β."
      ],
      review: [
        "R1. A completion method fills missing entries, chooses its rank using test error, and reports that minimum as final performance. Identify the leakage and redesign the experiment.",
        "R2. For one singular direction of X with singular value σ, compare the pseudoinverse factor 1/σ with the ridge factor σ/(σ²+λ). Predict the effect on a weak, noisy measurement direction."
      ],
      skills: ["matrix-completion", "missingness", "pagerank", "ridge", "validation"],
      repair: "If fitting and selection are mixed, draw three disjoint masks and label their roles. If regularization is only a formula, plot its effect on one small singular value."
    },
    {
      lectureNumbers: [12, 13], title: "Nonlinear features and classification margins",
      goals: "Connect pseudoinverse, kernel ridge, and SVM geometry. Distinguish a kernel from a distance, and a margin from a calibrated probability. Compare hinge and logistic losses as a syllabus bridge.",
      prerequisite: "Inner products, ridge regression, and feature dimensions. LA Chapter 6 is concurrent; revisit Week 4 projections if the Gram matrix is unclear.",
      physicalModel: "Two operating states of a machine produce overlapping rings in a two-sensor feature plane. A linear boundary in raw coordinates is inadequate, but an appropriate nonlinear feature can expose radial structure.",
      bridge: "Feature design changes the geometry in which a separator is linear. Kernel evaluation computes an inner product in that geometry without explicitly storing all feature coordinates.",
      experiment: "Generate two noisy rings with radii 1 and 2, angles uniform on [0,2π), and radial noise SD 0.15. Use fixed stratified train/validation/test splits. Compare a linear classifier, a radius-squared feature model, and an RBF SVM. Tune only on validation data and plot decision boundaries and errors. Add an outlier to show how margin penalties affect the fit; document scaling learned only from training data.",
      practice: [
        "P1. For φ(x)=(1,x₁,x₂,x₁²+x₂²), specify a linear score separating noiseless radius-1 and radius-2 rings. Explain why the corresponding boundary is nonlinear in the original plane.",
        "P2. Given a positive semidefinite Gram matrix K, write the kernel-ridge coefficient system for squared loss with λ>0. For binary labels y∈{−1,1}, compare hinge loss max(0,1−yf) and logistic loss log(1+exp(−yf)) at yf=−1,0,2, and explain the geometric meaning."
      ],
      review: [
        "R1. An SVM score is 4. Does that mean an 80% or 98% probability? Explain what the score establishes and what extra procedure would be needed for probabilities.",
        "R2. Revisit ridge: why does increasing model flexibility while tuning on the final test set invalidate a fair comparison with a simple baseline? Give a concrete correction to the pipeline."
      ],
      skills: ["kernel", "gram-matrix", "feature-map", "svm", "hinge-logistic-loss"],
      repair: "If a kernel is treated as an arbitrary similarity, verify the inner-product or positive-semidefinite requirement. If scores become probabilities without justification, separate classification from calibration."
    },
    {
      lectureNumbers: [14, 15], title: "Optimization and gradients through a network",
      goals: "Implement gradient descent and minibatch SGD, derive chain-rule gradients, and check backpropagation numerically before increasing model size.",
      prerequisite: "Quadratic gradients from Week 2 and chain rule from H&H Chapter 1, completed in October. Revisit a scalar composition before a network computation graph.",
      physicalModel: "A nonlinear sensor has response y=sin(x)+noise. A small neural network approximates the response over its calibration interval. Optimization error, generalization error, and extrapolation error must be reported separately.",
      bridge: "Backpropagation is organized chain-rule calculation; SGD is a way to estimate parameter updates from sampled data. Neither guarantees that the learned response obeys physical laws outside the observed interval.",
      experiment: "Generate 120 evenly spaced x values on [−π,π] with y=sin(x)+Gaussian noise SD 0.05. Hold out data before fitting. Implement a one-hidden-layer tanh network with 8 units, full-batch gradients, and minibatch SGD. Compare loss curves for two learning rates and two seeds. Check selected parameters with central finite differences; show a separate extrapolation plot outside the training interval.",
      practice: [
        "P1. For ŷ=w₂ tanh(w₁x+b₁)+b₂ and L=(ŷ−y)²/2, derive all four parameter derivatives and annotate the computation graph. Check one derivative at a concrete nonzero parameter setting by finite differences.",
        "P2. Explain when a uniformly sampled minibatch gradient is an unbiased estimate of the full empirical-loss gradient. Specify the averaging convention and predict how batch size affects noise without claiming that it guarantees better generalization."
      ],
      review: [
        "R1. Training loss becomes NaN after a learning-rate increase. List a sequence of checks that distinguishes a gradient bug, unstable step size, and an input-scaling problem.",
        "R2. A larger network fits every noisy calibration point but predicts badly outside [−π,π]. Identify which observed facts concern optimization, overfitting, and extrapolation, and propose an appropriate evaluation."
      ],
      skills: ["gradient-descent", "sgd", "chain-rule", "backpropagation", "gradient-check"],
      repair: "If gradients fail, reduce to one observation and one hidden unit, then compare analytic and finite-difference derivatives. If loss curves are interpreted causally, repeat with multiple seeds and a fixed evaluation protocol."
    },
    {
      lectureNumbers: [16, 17], title: "Clustering, latent states, and cumulative review",
      goals: "Contrast hard assignments in k-means with probabilistic responsibilities in Gaussian mixtures; derive an EM update and evaluate sensitivity to initialization and covariance assumptions.",
      prerequisite: "Mean, variance, Gaussian density, conditional probability, and likelihood. Use a one-dimensional mixture to repair probability gaps before the two-dimensional experiment; do not assume a completed statistics syllabus.",
      physicalModel: "Two unlabelled operating regimes produce overlapping sensor clouds with different shapes. The regimes are latent; assigning a cluster number does not establish a physical mechanism.",
      bridge: "Clustering imposes a model of similarity. K-means favors Euclidean centroid geometry; a Gaussian mixture can represent different covariance shapes but introduces assumptions and degeneracies that need explicit checks.",
      experiment: "Generate 300 observations from each of two 2D Gaussians with means (−1,0),(1,0), covariances diag(0.15,1),diag(1,0.15), and fixed seeds. Hide generating labels during fitting. Compare k-means with a two-component full-covariance GMM across five initializations. Track k-means objective or GMM likelihood, document covariance regularization, and use held-out likelihood for the GMM. Reveal true labels only for post-fit diagnostics, not tuning.",
      practice: [
        "P1. In a one-dimensional equal-weight Gaussian mixture with means −1 and 1 and variances 1, compute the responsibilities for x=0 and x=1. Write the EM mean update and explain how it differs from a hard assignment.",
        "P2. Construct an elongated two-cloud example where Euclidean distance is a poor description of cluster shape. Explain which covariance assumption could help, and why Gaussian-mixture likelihood can become unbounded without constraints or regularization."
      ],
      review: [
        "R1. Compare two fits with permuted cluster labels. Explain why raw label equality is not an appropriate comparison, and give a prediction or likelihood quantity that is unaffected.",
        "R2. Cumulative task: choose one earlier sensor problem and propose a complete pipeline with split, baseline, representation, model, optimization, metric, and leakage checks. Explain a failure mode and demonstrate one fresh recheck of a previously weak concept."
      ],
      skills: ["k-means", "gaussian-mixture", "responsibilities", "em", "likelihood", "evaluation"],
      repair: "Recheck one incorrect EM update and one earlier pipeline mistake. Use November 26–30 for corrections and the final evidence ledger; there is no ninth course-content week."
    }
  ];
  const day = (offset) => new Date(Date.UTC(2026, 9, 1 + offset)).toISOString().slice(0, 10);
  return {
    id: "priyanka-machine-learning", taskPrefix: "ml", materialRevision: "oct-nov-2026",
    startDate: "2026-10-01", endDate: "2026-11-25", followupEndDate: "2026-11-30",
    heading: "October–November: Mathematical Foundations of Machine Learning",
    assumptions: "Eight Thursday–Wednesday study weeks, October 1–November 25, 2026, based on the course's Fall 2025 list. November 26–30 is for repairs and wrap-up. Use the linked lecture notes; video selection remains deferred. Prior calculus and basic numerical programming are needed. Weekly hours are not yet set.",
    pacing: "Cover all 17 published Fall 2025 lectures in order across eight weeks: 2, 2, 2, 3, 2, 2, 2, 2 lectures. Each week includes prerequisite preparation, notes, a numerical experiment, practice, a Tuesday review, and a Thursday recheck. Reviews are offset from Linear Algebra's Wednesday reviews.",
    teachingApproach: "Start with a measurable problem, predict a result, derive the model, implement a small experiment, and explain failure cases. Reuse sensor and physical examples while distinguishing mathematical guarantees from empirical evidence.",
    exercisePolicy: "Read the linked notes and work through their examples. Complete the two original Aleph practice problems and the weekly experiment; these are not the course's official homework. Submit derivations and a short report with code excerpts, data-generation rules, random seeds, split definitions, plots, metrics, and failure cases. Use a baseline and keep final-test data out of fitting and model selection.",
    feedbackPolicy: "Submit practice and review separately. Feedback must check the derivation, implementation evidence, evaluation design, and interpretation. Classify gaps as prerequisite, modeling, optimization, statistics, or execution errors. Prescribe one repair and one fresh transfer problem, recheck after 48 hours, and carry unresolved gaps into the next review. The learner or course designer chooses follow-up work; the system does not automatically rewrite the syllabus.",
    sources: [{title:"Rebecca Willett — course and Fall 2025 lecture notes",url:courseUrl}],
    weeks: weeks.map((entry,index) => ({
      ...entry, week:index+1, startDate:day(index*7), endDate:day(index*7+6),
      monthLabel:index<4?"October":index===4?"October / November":"November",
      prerequisiteDue:day(index*7), readingDue:day(index*7+2), experimentDue:day(index*7+3),
      practiceDue:day(index*7+4), reviewDue:day(index*7+5), repairDue:day(index*7+7),
      readings:entry.lectureNumbers.map((number)=>lectures[number-1]), resources:[]
    }))
  };
}
