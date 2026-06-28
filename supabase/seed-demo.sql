-- Demo seed for Aleph
-- Run after all migrations to populate a full end-to-end example.
-- All UUIDs are fixed so preview URLs are predictable.

-- ---------------------------------------------------------------------------
-- Catalog
-- ---------------------------------------------------------------------------
insert into exams (id, slug, title, description, month, year, is_active)
values (
  '11111111-1111-1111-1111-111111111111',
  'gate-da',
  'GATE DA',
  'Graduate Aptitude Test in Data Science and Artificial Intelligence',
  2,
  2026,
  true
)
on conflict (id) do nothing;

insert into courses (id, slug, exam_id, title, tagline, description, difficulty, duration, estimated_hours, is_active)
values (
  '22222222-2222-2222-2222-222222222222',
  'probability-and-statistics',
  '11111111-1111-1111-1111-111111111111',
  'Probability & Statistics',
  'From counting to conditioning',
  'A complete course covering probability foundations, random variables, expectation, and statistical inference for GATE DA.',
  'Beginner to Intermediate',
  '10 chapters · ~40 hours',
  40,
  true
)
on conflict (id) do nothing;

insert into subjects (id, slug, course_id, title, description, order_index, outcomes, prerequisites, weight_in_exam_percent, is_active)
values (
  '33333333-3333-3333-3333-333333333333',
  'probability-theory',
  '22222222-2222-2222-2222-222222222222',
  'Probability Theory',
  'Core probability concepts tested in GATE DA.',
  0,
  array['Compute probabilities using axioms and counting', 'Apply conditional probability and Bayes theorem', 'Work with random variables and expectation'],
  array['Basic calculus', 'Set theory'],
  25,
  true
)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Chapter
-- ---------------------------------------------------------------------------
insert into chapters (id, subject_id, slug, number, title, description, estimated_minutes)
values (
  '44444444-4444-4444-4444-444444444444',
  '33333333-3333-3333-3333-333333333333',
  'ch1-probability-foundations',
  1,
  'Probability Foundations',
  'Sample spaces, events, axioms, and counting.',
  120
)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Sections
-- ---------------------------------------------------------------------------
insert into sections (id, chapter_id, slug, title, type, order_index, estimated_minutes, content, content_path, reading_questions, is_locked)
values (
  '55555555-5555-5555-5555-555555555555',
  '44444444-4444-4444-4444-444444444444',
  'core-ideas',
  'Core Ideas',
  'read',
  0,
  30,
  '',
  'courses/probability/ch1/core-ideas.mdx',
  '[{"question": "What is the probability of the empty set?", "hint": "Use axiom 1 and axiom 2."}]'::jsonb,
  false
)
on conflict (id) do nothing;

insert into sections (id, chapter_id, slug, title, type, order_index, estimated_minutes, content, content_path, reading_questions, is_locked)
values (
  '66666666-6666-6666-6666-666666666666',
  '44444444-4444-4444-4444-444444444444',
  'problem-solving',
  'Problem Solving',
  'mechanic',
  1,
  60,
  'Practice applying the axioms and counting techniques.',
  null,
  '[]'::jsonb,
  false
)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Tasks / Problems
-- ---------------------------------------------------------------------------
insert into tasks (id, section_id, title, label, statement, answer, solution, hints, difficulty, estimated_minutes, order_index, concept_id, concept_name, tags)
values (
  '77777777-7777-7777-7777-777777777777',
  '66666666-6666-6666-6666-666666666666',
  'Axioms check',
  'concept',
  'If \( P(A) = 0.4 \), \( P(B) = 0.5 \), and \( A \) and \( B \) are mutually exclusive, find \( P(A \cup B) \).',
  '0.9',
  'Since \( A \) and \( B \) are mutually exclusive, \( P(A \cup B) = P(A) + P(B) = 0.4 + 0.5 = 0.9 \).',
  array['Recall the third axiom for disjoint events'],
  1,
  5,
  0,
  'probability-axioms',
  'Probability Axioms',
  array['axioms', 'easy']
)
on conflict (id) do nothing;

insert into tasks (id, section_id, title, label, statement, answer, solution, hints, difficulty, estimated_minutes, order_index, concept_id, concept_name, tags)
values (
  '88888888-8888-8888-8888-888888888888',
  '66666666-6666-6666-6666-666666666666',
  'Counting triples',
  'mechanic',
  'How many ordered triples \( (a,b,c) \) of positive integers satisfy \( a + b + c = 6 \)?',
  '10',
  'Using stars and bars, the number of positive integer solutions to \( a + b + c = 6 \) is \( \binom{6-1}{3-1} = \binom{5}{2} = 10 \).',
  array['Think of stars and bars', 'Each variable must be at least 1'],
  2,
  8,
  1,
  'counting',
  'Counting',
  array['counting', 'stars-and-bars']
)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Quiz
-- ---------------------------------------------------------------------------
insert into quizzes (id, section_id, passing_score, time_limit_minutes)
values (
  '99999999-9999-9999-9999-999999999999',
  '66666666-6666-6666-6666-666666666666',
  70,
  15
)
on conflict (id) do nothing;

insert into quiz_questions (id, quiz_id, prompt, format, options, correct_answer, explanation, difficulty, gate_weight, concept_id, concept_name, order_index)
values (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '99999999-9999-9999-9999-999999999999',
  'For any event \( A \), what is \( P(A^c) \)?',
  'mcq',
  '[{"id": "a", "text": "1 - P(A)"}, {"id": "b", "text": "P(A) - 1"}, {"id": "c", "text": "P(A)"}, {"id": "d", "text": "0"}]'::jsonb,
  'a',
  'By the complement rule, \( P(A^c) = 1 - P(A) \).',
  1,
  'high',
  'probability-axioms',
  'Probability Axioms',
  0
)
on conflict (id) do nothing;

insert into quiz_questions (id, quiz_id, prompt, format, options, correct_answer, explanation, difficulty, gate_weight, concept_id, concept_name, order_index)
values (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '99999999-9999-9999-9999-999999999999',
  'How many ways can 4 people be arranged in a line?',
  'mcq',
  '[{"id": "a", "text": "16"}, {"id": "b", "text": "24"}, {"id": "c", "text": "8"}, {"id": "d", "text": "12"}]'::jsonb,
  'b',
  'There are \( 4! = 24 \) permutations of 4 distinct people.',
  1,
  'medium',
  'counting',
  'Counting',
  1
)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Concept graph for chapter
-- ---------------------------------------------------------------------------
insert into concept_graphs (id, chapter_id, slug, title, gate_weight, fallback_concepts, fallback_difficulty_mix, fallback_instruction, stable_next_action)
values (
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  '44444444-4444-4444-4444-444444444444',
  'ch1-graph',
  'Chapter 1 Concept Graph',
  'medium',
  array['probability-axioms', 'counting'],
  array[5, 3, 2],
  'Review the axioms and counting techniques before attempting harder problems.',
  'Move to Chapter 2 once you score at least 70% on the review quiz.'
)
on conflict (id) do nothing;

insert into concept_nodes (id, graph_id, concept_id, label, prereqs, repair_material, repair_material_path, gate_weight)
values (
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'probability-axioms',
  'Probability Axioms',
  array[],
  'The three axioms define any probability measure. Start with axiom 2: \( P(\Omega) = 1 \).',
  null,
  'high'
)
on conflict (id) do nothing;

insert into concept_nodes (id, graph_id, concept_id, label, prereqs, repair_material, repair_material_path, gate_weight)
values (
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'counting',
  'Counting',
  array['probability-axioms'],
  'Counting is the art of sizing sets without listing elements. Use permutations when order matters and combinations when it does not.',
  null,
  'medium'
)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Material set
-- ---------------------------------------------------------------------------
insert into material_sets (id, subject_id, slug, title, subtitle, core_pattern, core_pattern_path, meta, answer_summary, is_active)
values (
  'ffffffff-ffff-ffff-ffff-ffffffffffff',
  '33333333-3333-3333-3333-333333333333',
  'counting-drill-week-1',
  'Counting Drill — Week 1',
  '10 problems on permutations, combinations, and stars and bars.',
  'Translate the word problem into a set, then decide whether order matters and whether repetition is allowed.',
  null,
  '{"problem_count": 10, "difficulty_mix": [5,3,2], "solutions_available": true}'::jsonb,
  '[{"range": "1-5", "answers": "A, B, C, D, E"}, {"range": "6-8", "answers": "10, 24, 56"}, {"range": "9-10", "answers": "120, 252"}]'::jsonb,
  true
)
on conflict (id) do nothing;
