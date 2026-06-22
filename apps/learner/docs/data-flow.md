# aleph — Data Flow

> **Purpose:** How data moves through the core learning loop, dashboard, tests, tasks, and feedback systems.

---

## 1. Core Learning Loop

```mermaid
flowchart TD
    A[Student opens Section Workspace] --> B[Read material / theory]
    B --> C[Solve section tasks: concept → mechanic → integration → challenge]
    C --> D{All current tasks done?}
    D -->|No| C
    D -->|Yes| E[Start Section Quiz]
    E --> F[Submit answers]
    F --> G[Grade & update concept mastery]
    G --> H{Pass?}
    H -->|Yes| I[Unlock next section]
    H -->|No| J[Generate Review Quiz]
    J --> K[Complete Review Quiz]
    K --> L{Review Pass?}
    L -->|Yes| I
    L -->|No| J
    I --> M[Regenerate user tasks]
    G --> N[Generate feedback record]
    N --> M
```

---

## 2. Problem Solving Flow

```mermaid
sequenceDiagram
    participant Student
    participant WS as SectionWorkspace
    participant TA as task_attempts
    participant WS_STATE as workspace_states

    Student->>WS: Navigate to /learn/[subject]/[chapter]/[section]
    WS->>WS: Load content + tasks from DB / static seed
    Student->>WS: Submit answer for task N
    WS->>TA: INSERT { user_id, task_id, answer, is_correct, time_spent }
    WS->>WS_STATE: UPDATE completed_task_ids / current_task_ids
    alt Correct
        WS-->>Student: Green check + next task
    else Incorrect
        WS-->>Student: Red X + hint
    end
    Student->>WS: View solution
    WS->>WS_STATE: UPDATE viewed_solution_task_ids
```

### Mutations

| Table | Operation | When |
|-------|-----------|------|
| `task_attempts` | INSERT | Answer submitted |
| `workspace_states` | UPDATE | Task completed / solution viewed |
| `concept_mastery` | UPSERT | Correct/incorrect updates strength |

---

## 3. Section Quiz Flow

```mermaid
sequenceDiagram
    participant Student
    participant QP as QuizPlayer
    participant QA as quiz_attempts
    participant CM as concept_mastery
    participant FB as feedback_records
    participant WS_STATE as workspace_states
    participant S as sections

    Student->>QP: Start quiz
    QP->>QP: Load questions from quiz_questions
    Student->>QP: Select answers
    Student->>QP: Submit
    QP->>QA: INSERT { score, max_score, passed, answers }
    QA->>CM: Update per-concept strength
    QA->>FB: Generate feedback record + items
    alt Passed
        QA->>S: Unlock next section
        QA->>WS_STATE: Advance current_section_id
    else Failed
        QA->>QP: Show "Start Review" button
    end
```

### Mutations

| Table | Operation | When |
|-------|-----------|------|
| `quiz_attempts` | INSERT | Quiz submitted |
| `concept_mastery` | UPSERT | Strength updated |
| `feedback_records` / `feedback_items` | INSERT | Feedback generated |
| `sections` | UPDATE | Next section unlocked |
| `workspace_states` | UPDATE | Current section advances |
| `enrollments` | UPDATE | progress_percentage recalculated |

---

## 4. Review Quiz Flow

```mermaid
sequenceDiagram
    participant Student
    participant QP as QuizPlayer
    participant QA as quiz_attempts
    participant RQA as review_quiz_attempts
    participant CM as concept_mastery
    participant FB as feedback_records

    Student->>QP: Fails section quiz
    QP->>RQA: INSERT review attempt { section_id, triggered_by_attempt_id }
    Student->>QP: Answers review questions
    QP->>RQA: UPDATE { score, passed, answers }
    RQA->>CM: Update weak concept strengths
    RQA->>FB: Generate feedback record
    alt Passed
        RQA-->>Student: Next section unlocked
    else Failed
        RQA-->>Student: New review quiz generated
    end
```

---

## 5. Feedback Generation Flow

```mermaid
sequenceDiagram
    participant ATT as QuizAttempt / ReviewAttempt
    participant FB as FeedbackGenerator
    participant FR as feedback_records
    participant FI as feedback_items
    participant CM as concept_mastery

    ATT->>FB: Trigger after grading
    FB->>CM: Read strengths/weaknesses
    FB->>FB: Map answers to concept tags
    FB->>FB: Classify: correct / partial / incorrect
    FB->>FB: Build next_actions[] from incorrect items
    FB->>FR: INSERT { verdict, summary, next_actions }
    FB->>FI: INSERT items[] { concept_id, status, misconception, repair_action }
```

### Feedback → Tasks

Each `feedback_record.next_actions` entry becomes a `user_tasks` row with:

- `type = 'repair'`
- `priority = high`
- `section_id` / `task_id` pointing to the repair problem

---

## 6. Dashboard Tasks / Next-Actions Flow

The **Tasks** page is not a static list. It is rebuilt from the user’s live workspace.

```mermaid
sequenceDiagram
    participant D as /tasks
    participant UT as user_tasks
    participant WS as workspace_states
    participant E as enrollments
    participant S as sections
    participant T as tasks
    participant Q as quizzes
    participant RQA as review_quiz_attempts

    D->>E: SELECT active enrollments
    E-->>D: enrollments[]
    loop For each enrollment
        D->>WS: SELECT workspace state
        WS-->>D: completed_task_ids, current_task_ids, current_section_id
        D->>S: SELECT sections/chapters for subject
        S-->>D: sections[]
        D->>UT: DELETE auto tasks + re-insert derived tasks
        alt Current section has active review
            D->>UT: INSERT { type: 'review', quiz_id/review_attempt_id, priority: 100 }
        else Current section quiz ready
            D->>Q: SELECT section quiz
            Q-->>D: quiz
            D->>UT: INSERT { type: 'quiz', quiz_id, priority: 90 }
        else Current section tasks remain
            D->>T: SELECT undone tasks in section
            T-->>D: tasks[]
            D->>UT: INSERT { type: 'problem', task_id, priority: 80..50 }
        else Next section available
            D->>UT: INSERT { type: 'summary' or 'problem', section_id, priority: 40 }
        end
    end
    D->>UT: SELECT * WHERE status = 'pending' ORDER BY priority DESC, due_at
    UT-->>D: prioritized task list
    D-->>Student: Render top-down task board
```

### Priority rules

1. `review` — blocks progress, highest priority
2. `quiz` — section quiz ready
3. `problem` — current section tasks, ordered by label
4. `summary` — next unread section
5. `spaced_review` — due review items
6. `repair` — from latest feedback

---

## 7. Tests Flow

The **Tests** page shows every quiz-like activity for the user.

```mermaid
sequenceDiagram
    participant D as /tests
    participant E as enrollments
    participant S as sections
    participant Q as quizzes
    participant QA as quiz_attempts
    participant RQA as review_quiz_attempts

    D->>E: SELECT active enrollments
    E-->>D: enrollments[]
    D->>S: SELECT sections + quizzes for subjects
    S-->>D: sections[]
    D->>Q: SELECT quizzes
    Q-->>D: quizzes[]
    D->>QA: SELECT latest attempt per quiz
    QA-->>D: attempts[]
    D->>RQA: SELECT active review attempts
    RQA-->>D: reviews[]
    D-->>Student: Render tests grouped by status
```

### Test status rules

| Status | Condition |
|--------|-----------|
| `available` | Section unlocked + quiz not yet passed |
| `in_review` | Failed section quiz → review quiz active |
| `completed` | Quiz passed |
| `locked` | Section still locked |

---

## 8. Feedback Flow

```mermaid
sequenceDiagram
    participant D as /feedback
    participant FB as feedback_records
    participant FI as feedback_items
    participant CM as concept_mastery

    D->>FB: SELECT recent records for user
    FB-->>D: records[]
    D->>FI: SELECT items per record
    FI-->>D: items[]
    D->>CM: SELECT weak concepts for user
    CM-->>D: weaknesses[]
    D-->>Student: Render feedback + repair actions
```

---

## 9. Resources Flow

```mermaid
sequenceDiagram
    participant D as /resources
    participant R as resources

    D->>R: SELECT active resources
    R-->>D: resources[]
    D-->>Student: Render cards by type (video, pdf, cheatsheet, article, link)
```

---

## 10. Dashboard Update Flow

```mermaid
sequenceDiagram
    participant D as /dashboard
    participant E as enrollments
    participant S as subjects
    participant WS as workspace_states
    participant UT as user_tasks
    participant FB as feedback_records
    participant CM as concept_mastery

    D->>E: SELECT enrollments with progress
    E-->>D: enrolled subjects
    D->>S: SELECT course metadata
    S-->>D: subject details
    D->>WS: SELECT current section per enrollment
    WS-->>D: resume state
    D->>UT: SELECT top pending tasks
    UT-->>D: next actions
    D->>FB: SELECT latest feedback
    FB-->>D: repair actions
    D->>CM: SELECT weak concepts
    CM-->>D: strengths/weaknesses
    D-->>Student: Render dashboard
```

---

## Mutation Summary

| User Action | Tables Modified | Side Effects |
|-------------|-----------------|--------------|
| Submit task answer | `task_attempts`, `workspace_states` | Update `concept_mastery` |
| View solution | `workspace_states` | Mark viewed |
| Submit section quiz | `quiz_attempts`, `feedback_records`, `feedback_items` | Unlock next section, update mastery, regenerate `user_tasks` |
| Submit review quiz | `review_quiz_attempts`, `feedback_records` | Update mastery, unlock if passed |
| Complete task | `workspace_states` | Regenerate `user_tasks` |
| Skip task | `workspace_states` | Move to next task |
| Enroll in subject | `enrollments`, `workspace_states` | Seed initial `user_tasks` |
| Update profile | `profiles` | — |

---

*Last updated: 2026-06-19*
*See also: [schema.md](schema.md), [class-diagram.md](class-diagram.md).*
