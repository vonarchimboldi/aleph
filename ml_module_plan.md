# GATE DA Basic Machine Learning Module Plan

This is the official structure for the GATE DA Basic Machine Learning module. The course uses a single organizing frame throughout:

```text
Data -> Model -> Loss/Objective -> Training/Fit -> Prediction -> Evaluation -> Failure Modes -> GATE-style hand problems
```

The module excludes the GATE DA Artificial Intelligence syllabus topics: search, adversarial search, logic, Bayesian-network inference, variable elimination, and approximate inference. Probability, linear algebra, calculus, and optimization are used only as prerequisites for ML questions.

## Exam Calibration

The course is calibrated from:

- Official GATE DA ML syllabus: supervised learning, unsupervised learning, PCA, and feed-forward neural networks.
- Local GATE DA papers from 2024, 2025, and 2026 in `gate-da-papers/`.

Observed ML question style:

- Small datasets, hand computation, and exact simulation.
- Decision boundaries, linear versus nonlinear separability, margins, losses, distances, metrics, and parameter counts.
- Linear algebra links: PCA eigenvalues, LDA scatter matrices, SVM geometry, ridge shrinkage.
- Probability links: Naive Bayes, priors/likelihoods/posteriors, misclassification probability.
- Evaluation links: confusion-matrix metrics, train/test/validation splits, LOOCV.
- Neural-network links: MLP architecture, activations, forward pass, backpropagation, and gradient descent updates.

## Chapter Structure

### Chapter 1: Data, Models, and Loss Functions

Purpose: Build the mental model that ML is the interaction of data, model class, and loss/objective.

Core questions:

1. What is the unit of data in a learning problem: row, feature vector, label, target, distance table, or graph-like object?
2. Which parts of the data are inputs and which part, if any, is the target?
3. Is the task supervised, unsupervised, or model-selection/evaluation?
4. What kind of prediction object is needed: real number, class label, probability, score, cluster id, or lower-dimensional representation?
5. What is a model in this setting: a line, hyperplane, tree, distance rule, probability table, projection direction, or neural network?
6. Which loss/objective makes "good fit" precise?
7. Which quantities are learned from data and which are fixed choices made by the user?
8. What does it mean for the model to fail: wrong prediction, high loss, poor generalization, unstable boundary, bad distance metric, or misleading representation?
9. How does a GATE question reveal the data-model-loss triad in one or two lines?
10. What should the learner write first before calculating: data type, model rule, objective/loss, and requested quantity?

Required GATE-style outcomes:

- Identify supervised vs unsupervised tasks.
- Match task to model family.
- Identify the objective for regression, ridge, classification, clustering, and PCA.
- Compute a simple loss value from a given prediction and target.
- Explain why changing the loss changes what the model prefers.

### Chapter 2: Evaluation, Metrics, and Validation Methodology

Purpose: Make evaluation coherent before introducing many classifiers.

Core questions:

1. What data is used for training, validation, and testing?
2. Why must the test set remain untouched during model selection?
3. What does cross-validation estimate, and what does it not prove?
4. How many splits does k-fold cross-validation create?
5. How many validation splits does LOOCV create after a held-out test set is removed?
6. Which metric matches the task: accuracy, precision, recall, MAE, MSE, RMSE, or loss?
7. Which class is positive, and how does that affect precision/recall?
8. What is the difference between training error, validation error, and test error?
9. How do bias and variance show up as underfitting and overfitting?
10. What small table or split-count calculation is GATE likely to ask?

Required GATE-style outcomes:

- Compute accuracy, precision, and recall from a verbal confusion-matrix description.
- Count validation splits for k-fold CV and LOOCV.
- Distinguish training, validation, and test roles.
- Compute MAE/MSE for a single instance or tiny dataset.
- Explain the bias-variance effect of regularization.

### Chapter 3: Linear Regression and Ridge Regression

Purpose: Treat regression as the first full data-model-loss example.

Core questions:

1. What is the prediction rule: with intercept, without intercept, or vector form \(w^Tx\)?
2. What loss is being minimized: squared error, absolute error, or regularized loss?
3. Is the question asking for a fitted parameter, a prediction, or a loss value?
4. How do feature scaling and intercept choice change the calculation?
5. How does ridge add an \(L_2\) penalty to the data-fit term?
6. Why can ridge increase bias while reducing variance?
7. What is the difference between \(L_1\) and \(L_2\) regularization in GATE wording?
8. When can least squares be solved by one derivative?
9. What failure modes matter: multicollinearity, extrapolation, outliers, over-regularization, and scale sensitivity?
10. What should a learner compute first: prediction, residual, loss, penalty, or total objective?

Required GATE-style outcomes:

- Fit \(y=wx\) by least squares on a tiny dataset.
- Compute a ridge/regularized loss for one instance.
- Identify ridge's \(L_2\) penalty and bias-variance tradeoff.
- Interpret the difference between data loss and penalty.

### Chapter 4: Classification as Scores, Boundaries, and Margins

Purpose: Introduce classifiers before individual algorithms, using linear versus nonlinear decision boundaries as the central diagnostic.

Core questions:

1. What does the classifier output: score, sign, probability, or class label?
2. What is the decision boundary?
3. Is the decision boundary linear or nonlinear?
4. What does the sign of \(w^Tx+b\) mean?
5. What is a margin, and how is it different from merely being correctly classified?
6. Can a single straight line separate the positive and negative examples?
7. Why does XOR prove that some datasets are not linearly separable in the original features?
8. What happens to a point exactly on the boundary?
9. What failure modes matter: non-separability, outliers, class imbalance, bad feature scaling, and ambiguous boundary points?
10. Which questions require geometric drawing versus algebraic substitution?
11. How do one-vs-rest or multi-class settings change the output rule?
12. What is the fastest way to test a candidate classifier on a tiny dataset?

Required GATE-style outcomes:

- Evaluate a linear classifier on a point.
- Convert a squared-distance classifier into a linear score.
- Identify decision boundary and side of boundary.
- Decide whether a tiny 2D classification dataset is linearly separable.
- Use XOR as the canonical example where linear classifiers fail without feature transformation or hidden layers.
- Explain functional and geometric margin at a basic level.

### Chapter 5: Perceptron and Linear Classifier Updates

Purpose: Teach mistake-driven linear classifier training and its dependence on linear separability.

Core questions:

1. When does the algorithm update?
2. What happens to \(w\) and \(b\) after a misclassified positive point?
3. What happens after a misclassified negative point?
4. Does the update increase the score of the misclassified point?
5. How does the update move the decision boundary geometrically?
6. What is assumed for perceptron convergence?
7. Why does perceptron fail to converge on XOR in the original two features?
8. What failure modes matter: non-separable data, order dependence, and cycling?
9. Which quantities are old versus new?
10. How do sign conventions affect the answer?
11. What single algebraic comparison is GATE likely to ask?

Required GATE-style outcomes:

- Simulate one perceptron-style update.
- Prove whether the updated score increases or decreases.
- Track \(w\), \(b\), and \(f(x)\) after a mistake.
- Explain why the convergence guarantee needs linear separability.

### Chapter 6: Logistic Regression

Purpose: Show discriminative probabilistic classification with a linear decision boundary under the standard feature representation.

Core questions:

1. What is the linear score before the sigmoid?
2. Why is the linear score the log odds: \(w^Tx+b=\log(p/(1-p))\)?
3. What are odds, log odds, and probability, and how are they different?
4. What does the sigmoid turn log odds into?
5. How should a coefficient be interpreted: change in log odds, odds multiplier \(e^{w_j}\), or probability change?
6. Why is it wrong to say a coefficient is a fixed additive probability change?
7. What is the decision boundary for a probability threshold of \(1/2\)?
8. Why is logistic regression discriminative?
9. What loss is used for probabilistic classification?
10. How is logistic regression different from Naive Bayes?
11. What does model confidence mean?
12. Why does standard logistic regression fail on XOR without nonlinear features?
13. What failure modes matter: linear boundary limitation, separability instability, calibration, coefficient misinterpretation, and threshold choice?
14. Which GATE questions are likely classification-model identity questions?
15. What calculations should stay light for Basic: score, log odds, odds multiplier, probability, decision, and model category?

Required GATE-style outcomes:

- Identify logistic regression as discriminative.
- Convert a linear score into a classification decision.
- Interpret the linear score as log odds and \(e^{w_j}\) as an odds multiplier.
- Avoid the common mistake of reading coefficients as fixed probability changes.
- Recognize when the boundary is linear even though the output is probabilistic.
- Explain cross-entropy/log-loss at an intuitive and computational level.

### Chapter 7: Naive Bayes and Generative Classification

Purpose: Teach probabilistic classification through priors and likelihoods.

Core questions:

1. What are the classes and priors?
2. What is the feature likelihood under each class?
3. Which independence assumptions are being made?
4. How many parameters must be estimated for binary features and two classes?
5. How do you compute an unnormalized posterior score?
6. What is the probability of misclassifying a given feature vector?
7. Why is Naive Bayes generative?
8. What failure modes matter: correlated features, zero counts, smoothing, poor calibration?
9. How does MAP classification differ from estimating a probability?
10. What data-model-loss frame applies when training is parameter counting rather than gradient fitting?

Required GATE-style outcomes:

- Compute posterior class probabilities from priors and likelihoods.
- Compute misclassification probability for a single \(x\).
- Count Naive Bayes parameters for binary attributes.
- Distinguish generative and discriminative models.

### Chapter 8: kNN and Prototype Classifiers

Purpose: Teach distance-based classification where the data itself acts as the model.

Core questions:

1. What distance metric is being used?
2. What is the value of \(k\), and why is odd \(k\) often chosen in binary classification?
3. Which neighbors are closest, in sorted order?
4. How does changing \(k\) change the decision?
5. What is the nearest-centroid/prototype rule?
6. Why can a squared-distance-to-centroid classifier be linear?
7. When can kNN represent a nonlinear decision boundary?
8. Why can kNN handle XOR-like local structure while a single linear classifier cannot?
9. What failure modes matter: scaling, high dimension, noisy labels, class imbalance, and ties?
10. What does the model store: all points, centroids, or medoids?
11. How do train-time and test-time costs differ?
12. What diagram or distance table is GATE likely to give?

Required GATE-style outcomes:

- Run kNN by hand on a small diagram.
- Find the minimum odd \(k\) that changes a label.
- Expand squared-distance classifier into a linear score.
- Distinguish local nonlinear boundaries from global linear boundaries.
- Distinguish nearest neighbor, nearest centroid, and k-medoids.

### Chapter 9: SVM and Margin-Based Classification

Purpose: Make support vectors and margins concrete.

Core questions:

1. Is the data linearly separable?
2. Which points lie closest to the separating boundary?
3. Which points determine the margin?
4. What is the relationship between \(w\), \(b\), margin, and support vectors?
5. How does hard-margin SVM differ from perceptron?
6. How do outliers affect hard-margin SVM?
7. Why does a linear SVM fail on XOR in the original feature space?
8. What does a nonlinear feature map or kernel change about the boundary?
9. What does "support vector" mean geometrically?
10. Which candidate support-vector set is possible?
11. How do scaling \(w,b\) and geometric margin interact?
12. What can GATE ask without requiring full quadratic programming?

Required GATE-style outcomes:

- Identify possible support vectors from a small 2D dataset.
- Compute or compare margins in simple cases.
- Check whether a proposed \(w,b\) separates the data.
- Explain the role of feature transformations/kernels for nonlinear separability at a conceptual level.
- Explain hard-margin failure modes.

### Chapter 10: LDA and Scatter-Based Classification

Purpose: Connect classification to projections and scatter matrices.

Core questions:

1. What are within-class and between-class scatter?
2. What projection direction makes class separation large?
3. Why is the Fisher criterion a ratio?
4. How does maximizing a Rayleigh quotient become an eigenvalue problem?
5. What does \(S_W\) being non-singular allow?
6. What does LDA assume about class structure?
7. How is LDA different from logistic regression and SVM?
8. What failure modes matter: singular \(S_W\), overlap, bad covariance assumption, and outliers?
9. How much linear algebra does GATE expect here?
10. What equation should the learner recognize immediately?

Required GATE-style outcomes:

- Recognize the Fisher criterion.
- Derive or identify the generalized eigenvalue equation.
- Interpret \(S_B\), \(S_W\), and projection direction.

### Chapter 11: Decision Trees

Purpose: Teach tree splits as loss/objective reduction and as axis-aligned nonlinear decision regions.

Core questions:

1. What is the target variable?
2. What are the candidate split attributes?
3. What impurity measure is used: entropy, Gini, or classification error?
4. How is information gain computed?
5. Which split is selected first?
6. What happens with categorical versus numerical features?
7. Why are decision trees greedy?
8. How can a shallow tree solve XOR by combining multiple axis-aligned splits?
9. What failure modes matter: overfitting, unstable splits, high-cardinality bias, and shallow-tree underfitting?
10. What table summaries reduce calculation time?
11. What precision does GATE expect for entropy/information-gain NAT questions?

Required GATE-style outcomes:

- Compute entropy and information gain for a small categorical table.
- Select the first split of a decision tree.
- Explain why decision-tree regions can be nonlinear even when each split is simple.
- Explain overfitting and why pruning/validation matters.

### Chapter 12: Clustering

Purpose: Teach unsupervised grouping through distance objectives.

Core questions:

1. What is the data representation: coordinates or distance matrix?
2. What distance metric is used?
3. Is the method partitional or hierarchical?
4. For k-means, what objective is minimized?
5. For k-medoids, why must the center be a data point?
6. For agglomerative clustering, which pair merges first?
7. What is single linkage versus complete linkage?
8. What failure modes matter: scale sensitivity, chaining, non-spherical clusters, wrong \(k\), and outliers?
9. How do Manhattan and Euclidean distances change the first merge?
10. What simulation trace should the learner write in a GATE problem?

Required GATE-style outcomes:

- Simulate first merge in hierarchical clustering.
- Distinguish single and complete linkage.
- Reason about k-means cluster geometry.
- Identify k-medoids as a clustering algorithm.

### Chapter 13: PCA, SVD, and Dimensionality Reduction

Purpose: Teach representation learning through variance and reconstruction.

Core questions:

1. Is the data centered?
2. What covariance matrix or scatter matrix is being used?
3. Which direction has maximum variance?
4. How do eigenvalues correspond to variances along principal components?
5. Why are distinct principal components orthogonal?
6. What variance is retained or discarded after dimensionality reduction?
7. How is PCA related to SVD?
8. How is PCA different from LDA?
9. What failure modes matter: scale dependence, outlier sensitivity, linear structure only, and variance not equal to predictive usefulness?
10. How can a GATE question hide PCA inside a linear algebra eigenvalue problem?

Required GATE-style outcomes:

- State that principal components are orthogonal.
- Compute retained/discarded variance from eigenvalues.
- Identify the first principal direction as maximum variance.
- Link PCA to dimensionality reduction and feature extraction.

### Chapter 14: Multilayer Perceptrons and Neural Networks

Purpose: Cover the GATE DA neural-network requirement through the Data -> Model -> Loss/Objective frame, with MLPs as nonlinear classifiers and regressors.

Core questions:

1. What is the input layer, and how many input features enter the network?
2. How many hidden layers are present, and how many units are in each hidden layer?
3. What does each weight matrix and bias vector connect?
4. Which activation function is used: sigmoid, tanh, ReLU, or linear?
5. Why do hidden nonlinear activations let an MLP represent XOR-like decision boundaries?
6. What happens if all activation functions are linear?
7. What is the output layer for regression, binary classification, and multi-class classification?
8. What loss/objective is being minimized: squared error, binary cross-entropy, or multi-class cross-entropy?
9. What quantities are computed in the forward pass?
10. What error signal is propagated backward during backpropagation?
11. How does the chain rule determine gradients for earlier layers?
12. How does gradient descent update weights and biases?
13. How do learning rate, initialization, saturation, vanishing gradients, and overfitting affect training?
14. What small hand-computation can GATE reasonably ask: parameter count, one forward pass, one activation output, one gradient-descent update, or architecture recognition?

Required GATE-style outcomes:

- Count parameters in a small fully connected MLP.
- Compute one forward pass through a tiny network.
- Identify the role of hidden layers and nonlinear activations.
- Explain why a purely linear network collapses to a linear model.
- Explain backpropagation as chain-rule gradient computation.
- Perform or recognize one gradient-descent weight update.
- Use XOR to explain why MLPs can solve nonlinear classification problems that single linear classifiers cannot.

## Build Rules For Each Chapter

Each chapter must include:

1. A short conceptual narrative using the Data -> Model -> Loss/Objective frame.
2. A "What GATE gives you" section that identifies the typical input format.
3. A "What you must decide" checklist.
4. Worked examples with tiny datasets.
5. Failure modes and traps.
6. End-of-chapter problems that mix calculation, recognition, and simulation.
7. A graph-backed objective review quiz with prerequisite repair feedback.
8. For classifier chapters, an explicit linear/nonlinear decision-boundary diagnostic, with XOR used wherever it clarifies representational limits.

## Global Failure-Mode Checklist

Every chapter should train students to ask:

1. Is the data scaled appropriately for a distance, margin, or penalty question?
2. Is the model linear, nonlinear, distance-based, probabilistic, tree-based, projection-based, or neural-network-based?
3. Is the objective a data-fit loss, a regularized loss, an impurity reduction, a margin maximization, a variance objective, a within-cluster distance objective, or a neural-network training loss?
4. Is the question asking about training, validation, testing, prediction, or interpretation?
5. Is the answer a number, a class label, a model category, a parameter count, a boundary, or a failure-mode diagnosis?
