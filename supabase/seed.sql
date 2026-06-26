-- Generated seed for aleph v2
-- Run after 0001_schema.sql

begin;

insert into exams (id, slug, title, description) values ('05b3a1d7-e71b-4244-8e5b-adb409ef5302', 'gate-da', 'GATE DA', 'Graduate Aptitude Test in Engineering - Data Science and Artificial Intelligence.');

insert into courses (id, exam_id, slug, title, tagline, duration, difficulty) values ('a2e3d81f-fb15-40b9-bb01-a2c0d645504b', '05b3a1d7-e71b-4244-8e5b-adb409ef5302', 'probability', 'Probability & Statistics', 'Build exam-ready intuition for GATE DA and beyond.', '10 chapters · ~40 hours', 'Beginner to Intermediate');
insert into subjects (id, course_id, slug, title, description, order_index, outcomes, prerequisites) values ('f50fa0f8-3e5b-4e84-adc2-0d05d09ebb80', 'a2e3d81f-fb15-40b9-bb01-a2c0d645504b', 'probability', 'Probability & Statistics', 'Build exam-ready intuition for GATE DA and beyond.', 0, array['Translate word problems into precise probability models','Compute conditional probabilities and apply Bayes'' rule','Work with random variables, expectation, and variance','Solve past GATE DA problems using first principles']::text[], array['High school algebra','Basic calculus (derivatives and integrals)','Comfort with set notation']::text[]);
insert into chapters (id, subject_id, slug, number, title, description) values ('79359319-17f9-485c-b381-9d6f7bdc4036', 'f50fa0f8-3e5b-4e84-adc2-0d05d09ebb80', 'ch1-probability-foundations', 1, 'Probability Foundations', 'Sample spaces, events, axioms, and counting.');
insert into sections (id, chapter_id, slug, title, type, order_index, estimated_minutes, content, reading_questions, is_locked) values ('8003ee62-fe91-45ec-8513-20a78efe59cb', '79359319-17f9-485c-b381-9d6f7bdc4036', 'section-preview', 'Section Preview', 'read', 0, 5, '## What this section is about

This section introduces the building blocks of probability: sample spaces, events, and the three axioms that govern probability measures. We will also practice counting techniques that let us compute probabilities in finite sample spaces.

By the end you should be able to:
- Define a sample space and an event.
- Apply the axioms of probability.
- Use counting rules (permutations and combinations) to compute sizes of events.', '[{"question":"What is the difference between a sample space and an event?","hint":"A sample space is the set of all possible outcomes; an event is a subset of outcomes."},{"question":"Why must P(∅) = 0 follow from the axioms?","hint":"Use countable additivity with countably many disjoint copies of the empty set."}]'::jsonb, false);
insert into sections (id, chapter_id, slug, title, type, order_index, estimated_minutes, content, reading_questions, is_locked) values ('73385a5f-ae26-4395-b1a6-32369d295c5e', '79359319-17f9-485c-b381-9d6f7bdc4036', 'core-ideas', 'Core Ideas', 'read', 1, 20, '## Sample spaces

A **sample space** ( Omega ) is the set of all possible outcomes of a random experiment.

### Example
When rolling a fair six-sided die, ( Omega = {1,2,3,4,5,6} ).

## Events

An **event** is a subset of the sample space.

## Axioms of probability

A probability measure ( P ) satisfies:
1. ( P(A) geq 0 ) for every event ( A ).
2. ( P(Omega) = 1 ).
3. For countably many disjoint events ( A_1, A_2, dots ),
   [
   Pleft(igcup_{i=1}^{infty} A_iight) = sum_{i=1}^{infty} P(A_i).
   ]

## Counting

For a finite sample space with equally likely outcomes,
[
P(A) = rac{|A|}{|Omega|}.
]

Use permutations when order matters and combinations when it does not.', '[{"question":"If order matters, do you use permutations or combinations?","hint":"Permutations count ordered arrangements."}]'::jsonb, false);
insert into sections (id, chapter_id, slug, title, type, order_index, estimated_minutes, content, reading_questions, is_locked) values ('6b397efe-7808-4bc5-af3b-59819721ba0b', '79359319-17f9-485c-b381-9d6f7bdc4036', 'problem-solving-techniques', 'Problem-Solving Techniques', 'read', 2, 15, '## Technique: Draw the sample space

For small experiments, list all outcomes and circle the event of interest.

## Technique: Use complements

[
P(A^c) = 1 - P(A).
]

Complements are useful when "at least one" is easier to compute as ( 1 - ) "none".

## Technique: Count in two ways

If a set can be described two different ways, the two counts must agree. This often reveals a combinatorial identity.', '[]'::jsonb, false);
insert into sections (id, chapter_id, slug, title, type, order_index, estimated_minutes, content, reading_questions, is_locked) values ('9e8a0957-f6c7-47b4-95c4-4ffee21542e8', '79359319-17f9-485c-b381-9d6f7bdc4036', 'labelled-practice', 'Labelled Practice', 'mechanic', 3, 25, '## Practice problems

Solve the problems below. Try each one before revealing the solution.', '[]'::jsonb, false);
insert into tasks (id, section_id, label, statement, answer, solution, hints, order_index, concept_id, concept_name) values ('68a19f20-c750-4126-af24-2d2b6456fb72', '9e8a0957-f6c7-47b4-95c4-4ffee21542e8', 'concept', 'A fair die is rolled. What is the probability that the outcome is even?', '1/2', 'The event is ({2,4,6}). There are 3 favorable outcomes out of 6, so the probability is (3/6 = 1/2).', array['List the even outcomes.','Divide by the total number of outcomes.']::text[], 0, null, null);
insert into tasks (id, section_id, label, statement, answer, solution, hints, order_index, concept_id, concept_name) values ('99732d2d-f4e2-41ea-848a-649eedc81a7e', '9e8a0957-f6c7-47b4-95c4-4ffee21542e8', 'mechanic', 'How many ways can 4 people be seated in a row of 4 chairs?', '24', 'There are (4! = 24) permutations of 4 distinct people.', array['Use the multiplication principle.','There are 4 choices for the first seat, 3 for the second, etc.']::text[], 1, null, null);
insert into tasks (id, section_id, label, statement, answer, solution, hints, order_index, concept_id, concept_name) values ('914b8af2-b438-40e8-96f6-be48c2fba29b', '9e8a0957-f6c7-47b4-95c4-4ffee21542e8', 'integration', 'A 5-card hand is dealt from a standard 52-card deck. What is the probability that all 5 cards are hearts?', 'C(13,5)/C(52,5)', 'There are (inom{13}{5}) ways to choose 5 hearts and (inom{52}{5}) total 5-card hands. The probability is the ratio.', array['Does order matter in a 5-card hand?','Use combinations, not permutations.']::text[], 2, null, null);
insert into tasks (id, section_id, label, statement, answer, solution, hints, order_index, concept_id, concept_name) values ('cbda1388-c332-4203-9549-a1fb9c40f5ec', '9e8a0957-f6c7-47b4-95c4-4ffee21542e8', 'challenge', 'In a class of 30 students, what is the probability that at least two share a birthday? (Ignore leap years.)', '1 - (365!/335!)/365^30', 'Compute the complement: all 30 birthdays are distinct. The number of favorable outcomes for the complement is (365 \\times 364 \\times \\cdots \\times 336). Divide by (365^{30}) and subtract from 1.', array['Use the complement rule.','Count the number of ways to assign 30 distinct birthdays.']::text[], 3, null, null);
insert into tasks (id, section_id, label, statement, answer, solution, hints, order_index, concept_id, concept_name) values ('2681d2c1-fe7c-4976-aac1-5d5a5884be02', '9e8a0957-f6c7-47b4-95c4-4ffee21542e8', 'concept', 'If (P(A) = 0.4), (P(B) = 0.5), and (A) and (B) are disjoint, what is (P(A \\cup B))?', '0.9', 'For disjoint events, (P(A \\cup B) = P(A) + P(B) = 0.4 + 0.5 = 0.9).', array['Recall the addition rule for disjoint events.']::text[], 4, null, null);
insert into tasks (id, section_id, label, statement, answer, solution, hints, order_index, concept_id, concept_name) values ('137e5cff-2caa-4cf0-8cc8-e541646ecf1a', '9e8a0957-f6c7-47b4-95c4-4ffee21542e8', 'mechanic', 'A committee of 3 is chosen from 10 people. How many different committees are possible?', '120', '(inom{10}{3} = 120).', array['Order does not matter in a committee.','Use combinations.']::text[], 5, null, null);
insert into tasks (id, section_id, label, statement, answer, solution, hints, order_index, concept_id, concept_name) values ('bfdfb791-0205-4482-9373-b5874321a4b8', '9e8a0957-f6c7-47b4-95c4-4ffee21542e8', 'integration', 'Two fair dice are rolled. What is the probability that the sum is 7?', '1/6', 'There are 6 outcomes that give sum 7: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1). Out of 36 total outcomes, the probability is (6/36 = 1/6).', array['List all pairs that sum to 7.','There are 36 equally likely outcomes.']::text[], 6, null, null);
insert into tasks (id, section_id, label, statement, answer, solution, hints, order_index, concept_id, concept_name) values ('c4085576-2baf-4e74-b641-ac70915f41c5', '9e8a0957-f6c7-47b4-95c4-4ffee21542e8', 'challenge', 'A bag contains 4 red and 6 blue balls. Three balls are drawn without replacement. What is the probability that the first is red and the next two are blue?', '(4/10)*(6/9)*(5/8) = 1/6', 'Use conditional probability: (P(R_1 B_2 B_3) = P(R_1) P(B_2|R_1) P(B_3|R_1 B_2) = \\frac{4}{10} \\cdot \\frac{6}{9} \\cdot \\frac{5}{8} = \\frac{1}{6}).', array['Use the multiplication rule for conditional probabilities.','The composition of the bag changes after each draw.']::text[], 7, null, null);
insert into tasks (id, section_id, label, statement, answer, solution, hints, order_index, concept_id, concept_name) values ('ad5266c9-99d3-44b3-90f8-487c58c94027', '9e8a0957-f6c7-47b4-95c4-4ffee21542e8', 'concept', 'State the complement rule and give an example where it is useful.', 'P(A^c) = 1 - P(A)', 'The complement rule states (P(A^c) = 1 - P(A)). It is useful for ''at least one'' problems, e.g. probability of at least one head in 10 flips is (1 - (1/2)^{10}).', array['Think about when the complement is easier to count.']::text[], 8, null, null);
insert into tasks (id, section_id, label, statement, answer, solution, hints, order_index, concept_id, concept_name) values ('2e7bdaed-cb90-4cb6-b082-467c0c310d9b', '9e8a0957-f6c7-47b4-95c4-4ffee21542e8', 'mechanic', 'How many 4-letter codes can be formed from the letters A, B, C, D, E if repetition is not allowed?', '120', 'There are (5 \\times 4 \\times 3 \\times 2 = 120) such codes.', array['Use the multiplication principle with decreasing choices.']::text[], 9, null, null);
insert into sections (id, chapter_id, slug, title, type, order_index, estimated_minutes, content, reading_questions, is_locked) values ('0eafc467-b0d2-42cf-a2ae-4862def297c9', '79359319-17f9-485c-b381-9d6f7bdc4036', 'conceptual-review', 'Conceptual Review', 'review', 4, 10, '## Quick review

Before taking the section quiz, review these key ideas:
- Sample space vs event
- Probability axioms
- Counting with permutations and combinations
- Complement rule

## Self-check questions

1. Why is (P(Omega) = 1) required?
2. What goes wrong if you use permutations to count a 5-card hand?
3. When should you compute a probability via its complement?', '[]'::jsonb, false);
insert into sections (id, chapter_id, slug, title, type, order_index, estimated_minutes, content, reading_questions, is_locked) values ('5875b306-6ddc-4d35-9930-531a0754827b', '79359319-17f9-485c-b381-9d6f7bdc4036', 'section-quiz', 'Section Quiz', 'quiz', 5, 10, '## Section quiz

Answer all questions to unlock the next section.', '[]'::jsonb, false);
insert into quizzes (id, section_id, passing_score, time_limit_minutes) values ('5734a9f0-1a77-4caa-9917-2ab6cce0db8f', '5875b306-6ddc-4d35-9930-531a0754827b', 70, null);
insert into quiz_questions (id, quiz_id, prompt, format, options, correct_answer, explanation, order_index, concept_id, concept_name) values ('c310d176-1d72-43f8-9bb9-5a65ea2f0066', '5734a9f0-1a77-4caa-9917-2ab6cce0db8f', 'Which of the following is a valid probability measure?', 'mcq', '[{"id":"a","text":"P(A) = -0.2 for some event A"},{"id":"b","text":"P(Ω) = 0.5"},{"id":"c","text":"P(A) = 0.7 and P(A^c) = 0.3"},{"id":"d","text":"P(∅) = 1"}]'::jsonb, 'c', 'Probabilities must be non-negative, P(Ω)=1, and P(∅)=0. Only option C satisfies all requirements.', 0, null, null);
insert into quiz_questions (id, quiz_id, prompt, format, options, correct_answer, explanation, order_index, concept_id, concept_name) values ('72e5ac9e-3a24-4fe8-9939-b4ae6a77ecd6', '5734a9f0-1a77-4caa-9917-2ab6cce0db8f', 'A fair coin is flipped 3 times. What is the probability of getting exactly 2 heads?', 'mcq', '[{"id":"a","text":"1/8"},{"id":"b","text":"3/8"},{"id":"c","text":"1/2"},{"id":"d","text":"5/8"}]'::jsonb, 'b', 'There are 8 equally likely outcomes. The favorable outcomes are HHT, HTH, THH, so the probability is 3/8.', 1, null, null);
insert into quiz_questions (id, quiz_id, prompt, format, options, correct_answer, explanation, order_index, concept_id, concept_name) values ('6f43a3af-d450-4e0a-af53-ce163dcaa4dc', '5734a9f0-1a77-4caa-9917-2ab6cce0db8f', 'How many ways can 5 people be arranged in a line?', 'nat', '[]'::jsonb, '120', 'There are 5! = 120 permutations.', 2, null, null);
insert into quiz_questions (id, quiz_id, prompt, format, options, correct_answer, explanation, order_index, concept_id, concept_name) values ('56cb4d60-8006-4264-bc89-143b92ecf3a0', '5734a9f0-1a77-4caa-9917-2ab6cce0db8f', 'If P(A) = 0.3 and P(B) = 0.4, and A and B are disjoint, what is P(A ∪ B)?', 'nat', '[]'::jsonb, '0.7', 'For disjoint events, P(A ∪ B) = P(A) + P(B) = 0.7.', 3, null, null);
insert into sections (id, chapter_id, slug, title, type, order_index, estimated_minutes, content, reading_questions, is_locked) values ('88c837de-16e7-4908-8727-6885a4eae0f1', '79359319-17f9-485c-b381-9d6f7bdc4036', 'chapter-summary', 'Chapter Summary', 'summary', 6, 5, '## Summary

In this chapter you learned:
- How to define sample spaces and events.
- The three axioms of probability.
- How to count outcomes using permutations and combinations.
- How to use complements to simplify probability calculations.

## Next chapter

Chapter 2 introduces **conditional probability** and **Bayes'' rule**, the tools for updating probabilities when new information arrives.', '[]'::jsonb, false);
insert into chapters (id, subject_id, slug, number, title, description) values ('7fc85910-fee3-41a9-b4e6-e4cc2f86fbd1', 'f50fa0f8-3e5b-4e84-adc2-0d05d09ebb80', 'ch2-ump-and-np-tests', 2, 'UMP and Neyman-Pearson Tests', 'Build tests from likelihood ratios: choose the rejection direction, calibrate the size under the null, then compute power under the alternative.');
insert into sections (id, chapter_id, slug, title, type, order_index, estimated_minutes, content, reading_questions, is_locked) values ('e73fab04-4ac4-4f09-b148-38e4cc3c3113', '7fc85910-fee3-41a9-b4e6-e4cc2f86fbd1', 'core-pattern', 'Core Pattern', 'read', 0, 15, '## The Neyman-Pearson test

The Neyman-Pearson test rejects where the alternative likelihood is large compared with the null likelihood.

[
  \\Lambda(x)=\\frac{L_1(x)}{L_0(x)},\\qquad
  \\text{reject }H_0\\text{ for large }\\Lambda(x).
]

For one-sided composite alternatives, look for a **monotone likelihood ratio**. Then the same tail test works uniformly over the one-sided alternative.

## Checklist

- Write (L_1/L_0) before choosing a critical region.
- Decide whether large or small values support the alternative.
- Set the critical value using probability under (H_0).
- Use randomization only when the boundary mass prevents exact size.
- Compute power using the alternative distribution.
- For UMP, name the statistic with monotone likelihood ratio.', '[{"question":"What does the likelihood ratio (Lambda(x)) compare?","hint":"It compares the probability of the data under the alternative to the probability under the null."},{"question":"When can a one-sided test be UMP?","hint":"When the family of distributions has a monotone likelihood ratio in the test statistic."}]'::jsonb, false);
insert into sections (id, chapter_id, slug, title, type, order_index, estimated_minutes, content, reading_questions, is_locked) values ('d8b1433f-129c-4f5e-b60f-ba7818ef9b9f', '7fc85910-fee3-41a9-b4e6-e4cc2f86fbd1', 'mechanics', 'Mechanics: Problems 1–5', 'mechanic', 1, 40, '## Practice problems

Solve the mechanics problems below before moving to applications.', '[]'::jsonb, false);
insert into tasks (id, section_id, label, statement, answer, solution, hints, order_index, concept_id, concept_name) values ('ab72f430-63f9-4190-adf6-4a6b55a37875', 'd8b1433f-129c-4f5e-b60f-ba7818ef9b9f', 'mechanic', 'Observe (X\\sim\\operatorname{Bernoulli}(p)). Test (H_0:p=0.3) against (H_1:p=0.7). Use the Neyman-Pearson idea to choose the rejection point, then find the size and power.', 'Reject at X=1; size 0.3, power 0.7', 'The likelihood ratio is largest where the observation is more likely under (p=0.7) than under (p=0.3). For (X=1),
[
  \\frac{P_{0.7}(X=1)}{P_{0.3}(X=1)}=\\frac{0.7}{0.3}.
]
For (X=0),
[
  \\frac{P_{0.7}(X=0)}{P_{0.3}(X=0)}=\\frac{0.3}{0.7}.
]
So the most supportive point for (H_1) is (X=1). Rejecting when (X=1) has size (P_{0.3}(X=1)=0.3) and power (P_{0.7}(X=1)=0.7).', array[]::text[], 0, 'simple-vs-simple', 'Simple versus simple NP');
insert into tasks (id, section_id, label, statement, answer, solution, hints, order_index, concept_id, concept_name) values ('ebc866c9-b38e-4cdc-9a98-6e4b0b13c249', 'd8b1433f-129c-4f5e-b60f-ba7818ef9b9f', 'mechanic', 'Let (X_1,\\ldots,X_n) be independent Normal((\\mu,1)). Test (H_0:\\mu=0) against (H_1:\\mu=1). Show that the NP test rejects for large (sum X_i).', 'NP test rejects for large \\sum X_i', 'The likelihood ratio is
[
  \\frac{L_1}{L_0}=\\frac{\\prod_i \\exp[-(x_i-1)^2/2]}{\\prod_i \\exp[-x_i^2/2]}.
]
Ignore constants shared by numerator and denominator. The exponent difference is
[
  -\\frac12\\sum_i (x_i-1)^2+\\frac12\\sum_i x_i^2=\\sum_i x_i-\\frac n2.
]
Thus (L_1/L_0=\\exp(\\sum_i x_i-n/2)). This increases as (sum_i X_i) increases, so the NP rejection region has the form (sum_i X_i>c).', array[]::text[], 1, 'likelihood-ratio', 'Likelihood ratio');
insert into tasks (id, section_id, label, statement, answer, solution, hints, order_index, concept_id, concept_name) values ('a2bbc913-58ed-4dba-ba29-95ce5331dec5', 'd8b1433f-129c-4f5e-b60f-ba7818ef9b9f', 'mechanic', 'Let (X_1,\\ldots,X_n) be independent Exponential((\\lambda)), with density (lambda e^{-\\lambda x}). Test (H_0:\\lambda=\\lambda_0) against (H_1:\\lambda=\\lambda_1), where (lambda_1>\\lambda_0). Which values of (sum X_i) support (H_1)?', 'Small values of \\sum X_i support H_1', 'The likelihood ratio is
[
  \\frac{L_1}{L_0}=\\left(\\frac{\\lambda_1}{\\lambda_0}\\right)^n\\exp[-(\\lambda_1-\\lambda_0)\\sum_i x_i].
]
Since (lambda_1-\\lambda_0>0), this ratio decreases as (sum_i x_i) increases. A larger rate means shorter waits, so small total waiting time supports (H_1). The NP test therefore rejects (H_0) for (sum_i X_i<c), with (c) chosen from the null distribution to get the desired size.', array[]::text[], 2, 'rejection-direction', 'Rejection direction');
insert into tasks (id, section_id, label, statement, answer, solution, hints, order_index, concept_id, concept_name) values ('feed94d9-b566-4cef-b268-ecaec9809452', 'd8b1433f-129c-4f5e-b60f-ba7818ef9b9f', 'mechanic', 'Let (X\\sim\\operatorname{Binomial}(2,p)). Test (H_0:p=0.5) against (H_1:p=0.8). Use the rejection region (X=2). Find the size and the power.', 'Size 0.25, power 0.64', 'For (p=0.8), larger (X) gives stronger support for the alternative, so (X=2) is the strongest two-success region.
The size is computed under (H_0):
[
  P_{0.5}(X=2)=\\binom22(0.5)^2=0.25.
]
The power is computed under (H_1):
[
  P_{0.8}(X=2)=\\binom22(0.8)^2=0.64.
]
So this test has size (0.25) and power (0.64).', array[]::text[], 3, 'size-calibration', 'Size calibration');
insert into tasks (id, section_id, label, statement, answer, solution, hints, order_index, concept_id, concept_name) values ('88fdbf44-7306-47fe-89be-ee24a362ce46', 'd8b1433f-129c-4f5e-b60f-ba7818ef9b9f', 'mechanic', 'Let (X\\sim\\operatorname{Binomial}(2,p)). Test (H_0:p=0.5) against (H_1:p=0.8). Construct a size (0.30) test by rejecting always when (X=2) and rejecting with probability (gamma) when (X=1). Find (gamma) and the power.', '\\gamma=0.10, power=0.672', 'Under (H_0),
[
  P_{0.5}(X=2)=0.25,\\qquad P_{0.5}(X=1)=0.5.
]
The size of the randomized test is (0.25+\\gamma(0.5)). Set this equal to (0.30). Then (gamma=0.10).
Under (H_1),
[
  P_{0.8}(X=2)=0.64,\\qquad P_{0.8}(X=1)=2(0.8)(0.2)=0.32.
]
The power is (0.64+0.10(0.32)=0.672).', array[]::text[], 4, 'randomization', 'Randomization at the boundary');
insert into sections (id, chapter_id, slug, title, type, order_index, estimated_minutes, content, reading_questions, is_locked) values ('8c5d3c4e-e99e-42e2-8632-4ccce70990c8', '7fc85910-fee3-41a9-b4e6-e4cc2f86fbd1', 'applications', 'Applications: Problems 6–8', 'integration', 2, 40, '## Applications

These problems combine likelihood-ratio reasoning with common distributions.', '[]'::jsonb, false);
insert into tasks (id, section_id, label, statement, answer, solution, hints, order_index, concept_id, concept_name) values ('c85a6685-fbc9-40fe-b7c3-3243b6f0945c', '8c5d3c4e-e99e-42e2-8632-4ccce70990c8', 'integration', 'Let (X_1,\\ldots,X_n) be independent Normal((\\mu,1)). For testing (H_0:\\mu\\le 0) against (H_1:\\mu>0), give a level (alpha) UMP test.', 'Reject when \\sum X_i > \\sqrt n\\,z_{1-\\alpha}', 'The likelihood ratio for a larger mean increases with (sum_i X_i). This is the monotone likelihood ratio structure in the statistic (T=\\sum_i X_i).
For the composite null (mu\\le0), the largest rejection probability occurs at the boundary (mu=0). Under (mu=0),
[
  T=\\sum_i X_i\\sim N(0,n).
]
Choose (c_\\alpha=\\sqrt n\\,z_{1-\\alpha}). The test rejects when
[
  \\sum_{i=1}^n X_i> \\sqrt n\\,z_{1-\\alpha}.
]
This has level (alpha) and is UMP for the one-sided alternative because the normal family has monotone likelihood ratio in (sum X_i).', array[]::text[], 0, 'one-sided-ump', 'One-sided UMP test');
insert into tasks (id, section_id, label, statement, answer, solution, hints, order_index, concept_id, concept_name) values ('fecc4813-6c61-4851-a6ec-f69eae928703', '8c5d3c4e-e99e-42e2-8632-4ccce70990c8', 'integration', 'Let (X_1,\\ldots,X_n) have density (f_\\theta(x)=\\theta x^{\\theta-1}), (0<x<1). Test (H_0:\\theta=1) against (H_1:\\theta=2). Show the NP test can be written using (sum \\log X_i), and state the rejection direction.', 'Reject for large \\sum \\log X_i (equivalently small \\sum(-\\log X_i))', 'The likelihood ratio is
[
  \\frac{L_2}{L_1}=\\prod_{i=1}^n \\frac{2x_i}{1}=2^n\\prod_{i=1}^n x_i.
]
Taking logs gives
[
  \\log(L_2/L_1)=n\\log2+\\sum_i \\log x_i.
]
The ratio is larger when (sum_i\\log X_i) is larger. Since (0<X_i<1), these log values are negative; larger means closer to zero, so the sample is concentrated near 1.
The NP test rejects for (sum_i\\log X_i>c). Equivalently, with (Y_i=-\\log X_i), reject for small (sum_i Y_i).', array[]::text[], 1, 'likelihood-ratio', 'Likelihood ratio');
insert into tasks (id, section_id, label, statement, answer, solution, hints, order_index, concept_id, concept_name) values ('01405e61-03e3-4520-a39b-df9b54f43011', '8c5d3c4e-e99e-42e2-8632-4ccce70990c8', 'integration', 'Let (X_1,\\ldots,X_n) be independent Poisson((\\lambda)). For testing (H_0:\\lambda\\le\\lambda_0) against (H_1:\\lambda>\\lambda_0), explain why a large-(sum X_i) test is UMP, and state how to choose the cutoff.', 'Poisson family has MLR in \\sum X_i; calibrate cutoff at \\lambda_0', 'The joint likelihood, ignoring data-only factorials, is
[
  L(\\lambda)\\propto e^{-n\\lambda}\\lambda^{\\sum_i x_i}.
]
For (lambda_1>\\lambda_0), the likelihood ratio is
[
  \\frac{L(\\lambda_1)}{L(\\lambda_0)}=e^{-n(\\lambda_1-\\lambda_0)}\\left(\\frac{\\lambda_1}{\\lambda_0}\\right)^{\\sum_i x_i}.
]
This increases with (T=\\sum_iX_i), so the family has monotone likelihood ratio in (T). By the one-sided MLR result, reject for large (T).
Choose the cutoff (c), and randomization if needed, so that
[
  P_{\\lambda_0}(T>c)+\\gamma P_{\\lambda_0}(T=c)=\\alpha,
]
where (T\\sim\\operatorname{Poisson}(n\\lambda_0)) under the boundary null.', array[]::text[], 2, 'monotone-likelihood-ratio', 'Monotone likelihood ratio');
insert into sections (id, chapter_id, slug, title, type, order_index, estimated_minutes, content, reading_questions, is_locked) values ('dd275625-1abb-4ce9-8598-d18cf7076d9b', '7fc85910-fee3-41a9-b4e6-e4cc2f86fbd1', 'challenges', 'ISI-Style Challenges: Problems 9–10', 'challenge', 3, 35, '## Challenge problems

These problems test conceptual depth and exam-style reasoning.', '[]'::jsonb, false);
insert into tasks (id, section_id, label, statement, answer, solution, hints, order_index, concept_id, concept_name) values ('33b59172-17d9-43bb-a698-4567fb1256b5', 'dd275625-1abb-4ce9-8598-d18cf7076d9b', 'challenge', 'Let (X\\sim N(\\mu,1)). Explain why there is no nontrivial UMP level-(alpha) test for (H_0:\\mu=0) against (H_1:\\mu\\ne0).', 'Positive and negative alternatives require opposite NP tails', 'Against the simple alternative (mu=a>0), the NP most powerful test rejects for large (X). Against the simple alternative (mu=-a<0), the NP most powerful test rejects for small (X).
A single level-(alpha) test cannot put all its rejection probability in the right tail and also put all its rejection probability in the left tail. The two simple alternatives demand different most-powerful critical regions.
Therefore a test that is most powerful for every (mu>0) and every (mu<0) at the same level cannot exist, except for degenerate cases. This is why two-sided normal testing uses other optimality ideas, such as unbiasedness or likelihood-ratio tests, rather than UMP over all two-sided alternatives.', array[]::text[], 0, 'no-two-sided-ump', 'No two-sided UMP');
insert into tasks (id, section_id, label, statement, answer, solution, hints, order_index, concept_id, concept_name) values ('7cb04ca8-a90f-4642-b332-be1f508bd521', 'dd275625-1abb-4ce9-8598-d18cf7076d9b', 'challenge', 'Let (X\\sim\\operatorname{Binomial}(3,p)). Test (H_0:p=0.5) against (H_1:p=0.75). Construct a size (0.20) NP test using randomization, then compute its power.', 'Reject at X=3, randomize at X=2 with \\gamma=0.2; power 0.50625', 'The likelihood ratio increases with (X), because the alternative has the larger success probability. Start from the largest value (X=3).
Under (H_0),
[
  P_{0.5}(X=3)=\\frac18=0.125,\\qquad P_{0.5}(X=2)=\\frac38=0.375.
]
To reach size (0.20), reject always at (X=3) and reject with probability (gamma) at (X=2):
[
  0.125+\\gamma(0.375)=0.20.
]
Thus (gamma=0.075/0.375=0.2).
Under (H_1),
[
  P_{0.75}(X=3)=0.75^3=\\frac{27}{64},\\qquad P_{0.75}(X=2)=3(0.75)^2(0.25)=\\frac{27}{64}.
]
The power is
[
  \\frac{27}{64}+0.2\\cdot\\frac{27}{64}=\\frac{32.4}{64}=0.50625.
]', array[]::text[], 1, 'randomization', 'Randomization at the boundary');
insert into sections (id, chapter_id, slug, title, type, order_index, estimated_minutes, content, reading_questions, is_locked) values ('53b01d49-933b-4fdb-83cf-5f0b63e09e8b', '7fc85910-fee3-41a9-b4e6-e4cc2f86fbd1', 'conceptual-review', 'Conceptual Review', 'review', 4, 10, '## Quick review

Before taking the section quiz, review these key ideas:
- Likelihood ratio (Lambda=L_1/L_0)
- Rejection direction for one-sided alternatives
- Size calibration under (H_0)
- Randomization at the boundary
- UMP via monotone likelihood ratio
- Why two-sided UMP tests usually do not exist', '[]'::jsonb, false);
insert into sections (id, chapter_id, slug, title, type, order_index, estimated_minutes, content, reading_questions, is_locked) values ('ed918306-f04f-47c7-81b4-e23b4c8a590e', '7fc85910-fee3-41a9-b4e6-e4cc2f86fbd1', 'section-quiz', 'Section Quiz', 'quiz', 5, 10, '## Section quiz

Answer all questions to unlock the next section.', '[]'::jsonb, false);
insert into quizzes (id, section_id, passing_score, time_limit_minutes) values ('62f8c8fc-c8a9-40d4-84a6-5d4769b7a289', 'ed918306-f04f-47c7-81b4-e23b4c8a590e', 70, null);
insert into quiz_questions (id, quiz_id, prompt, format, options, correct_answer, explanation, order_index, concept_id, concept_name) values ('4de71c84-00a0-44ea-b168-e7f29fda0ab8', '62f8c8fc-c8a9-40d4-84a6-5d4769b7a289', 'For a simple-versus-simple test, the Neyman-Pearson lemma says the most powerful test rejects for:', 'mcq', '[{"id":"a","text":"Large values of the null likelihood"},{"id":"b","text":"Large values of the alternative likelihood"},{"id":"c","text":"Large values of the likelihood ratio L1/L0"},{"id":"d","text":"Small values of the p-value"}]'::jsonb, 'c', 'The NP lemma rejects for large values of the likelihood ratio <<?>> L_1/L_0.', 0, 'simple-vs-simple', 'Simple versus simple NP');
insert into quiz_questions (id, quiz_id, prompt, format, options, correct_answer, explanation, order_index, concept_id, concept_name) values ('59ca8dc2-56c2-40cb-8610-72322fd0ebc9', '62f8c8fc-c8a9-40d4-84a6-5d4769b7a289', 'When testing (H_0:\\lambda=\\lambda_0) vs (H_1:\\lambda>\\lambda_0) for an Exponential sample, the UMP test rejects for:', 'mcq', '[{"id":"a","text":"Large \\\\sum X_i"},{"id":"b","text":"Small \\\\sum X_i"},{"id":"c","text":"Large \\\\sum \\\\log X_i"},{"id":"d","text":"Either tail"}]'::jsonb, 'b', 'A larger rate means shorter waiting times, so small (sum X_i) supports the alternative.', 1, 'rejection-direction', 'Rejection direction');
insert into quiz_questions (id, quiz_id, prompt, format, options, correct_answer, explanation, order_index, concept_id, concept_name) values ('6b812a1c-8be0-41d8-ba5b-7bb03baddf85', '62f8c8fc-c8a9-40d4-84a6-5d4769b7a289', 'Why is there usually no UMP test for (H_0:\\mu=0) vs (H_1:\\mu\\ne0) with (X\\sim N(\\mu,1))?', 'mcq', '[{"id":"a","text":"The normal distribution is symmetric"},{"id":"b","text":"Positive and negative alternatives demand opposite NP tails"},{"id":"c","text":"The likelihood ratio is not defined"},{"id":"d","text":"UMP tests only exist for discrete distributions"}]'::jsonb, 'b', 'The most powerful test for (mu=a>0) rejects for large (X); for (mu=-a<0) it rejects for small (X). A single test cannot be optimal for both.', 2, 'no-two-sided-ump', 'No two-sided UMP');
insert into sections (id, chapter_id, slug, title, type, order_index, estimated_minutes, content, reading_questions, is_locked) values ('206e17b3-c7a5-4efa-b90a-9a513e5d76f5', '7fc85910-fee3-41a9-b4e6-e4cc2f86fbd1', 'chapter-summary', 'Chapter Summary', 'summary', 6, 5, '## Summary

In this chapter you learned:
- How to form the likelihood ratio for simple-versus-simple tests.
- How to choose the rejection direction from the likelihood ratio.
- How to calibrate size under (H_0) and compute power under (H_1).
- When randomization at the boundary is needed.
- Why one-sided UMP tests exist under monotone likelihood ratio.
- Why two-sided UMP tests usually do not exist.

## Next chapter

Chapter 3 introduces **estimation**: method of moments, maximum likelihood, and properties of estimators.', '[]'::jsonb, false);

commit;
