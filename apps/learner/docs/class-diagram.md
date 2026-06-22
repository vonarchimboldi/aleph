# aleph — TypeScript / Database Class Diagram

> **Purpose:** Visual reference for the entities used by aleph v2. Derived from `src/lib/data-models.ts` and the current Supabase schema.

---

## Complete Domain Model (Mermaid)

```mermaid
classDiagram
    direction TB

    %% Auth & User
    class User {
        +string id
        +string email
        +string full_name
        +UserRole role
        +string account_type
        +string created_at
        +string updated_at
    }

    class UserRole {
        <<enum>>
        student
        instructor
        admin
    }

    class AccountType {
        <<enum>>
        gate-da-basic
        gate-da-advanced
        gate-da-premium
        gate-da-platinum
    }

    %% Content hierarchy
    class Exam {
        +string id
        +string slug
        +string title
        +string description
    }

    class Course {
        +string id
        +string slug
        +string exam_id
        +string title
        +string tagline
        +string duration
        +string difficulty
    }

    class Subject {
        +string id
        +string slug
        +string course_id
        +string title
        +string description
        +number order_index
        +string[] outcomes
        +string[] prerequisites
    }

    class Chapter {
        +string id
        +string subject_id
        +string slug
        +number number
        +string title
        +string description
    }

    class Section {
        +string id
        +string chapter_id
        +string slug
        +string title
        +SectionType type
        +number order_index
        +number estimated_minutes
        +string content
        +boolean is_locked
    }

    class SectionType {
        <<enum>>
        read
        concept
        mechanic
        integration
        challenge
        quiz
        review
        summary
    }

    %% Tasks & problems
    class Task {
        +string id
        +string section_id
        +TaskLabel label
        +string statement
        +string answer
        +string solution
        +string[] hints
        +number order_index
        +string concept_id
        +string concept_name
    }

    class TaskLabel {
        <<enum>>
        concept
        mechanic
        integration
        challenge
        isi
    }

    %% Quizzes
    class Quiz {
        +string id
        +string section_id
        +number passing_score
        +number time_limit_minutes
    }

    class QuizQuestion {
        +string id
        +string quiz_id
        +string prompt
        +QuestionFormat format
        +object[] options
        +string correct_answer
        +string explanation
        +number order_index
        +string concept_id
        +string concept_name
    }

    class QuestionFormat {
        <<enum>>
        mcq
        msq
        nat
    }

    class QuizAttempt {
        +string id
        +string user_id
        +string quiz_id
        +number score
        +number max_score
        +boolean passed
        +object answers
        +string submitted_at
    }

    class ReviewQuizAttempt {
        +string id
        +string user_id
        +string section_id
        +string triggered_by_attempt_id
        +number score
        +number max_score
        +boolean passed
        +object answers
        +string submitted_at
    }

    %% Workspace & progress
    class Enrollment {
        +string id
        +string user_id
        +string subject_id
        +string status
        +number progress_percentage
        +string current_section_id
        +string created_at
        +string updated_at
    }

    class WorkspaceState {
        +string id
        +string user_id
        +string enrollment_id
        +string current_section_id
        +object current_task_ids
        +string[] completed_task_ids
        +string[] skipped_task_ids
        +string[] viewed_solution_task_ids
        +string updated_at
    }

    %% Feedback & mastery
    class ConceptMastery {
        +string id
        +string user_id
        +string concept_id
        +string concept_name
        +string subject_id
        +number strength
        +number questions_attempted
        +number questions_correct
        +string last_reviewed_at
        +string next_review_at
        +boolean is_weak
    }

    class FeedbackRecord {
        +string id
        +string user_id
        +string quiz_attempt_id
        +string review_attempt_id
        +string title
        +Verdict verdict
        +number overall_score_percent
        +string summary
        +string[] what_they_got_right
        +string[] still_not_understood
        +string[] correct_approach
        +string minimal_correction
        +object[] next_actions
    }

    class Verdict {
        <<enum>>
        green
        yellow
        red
    }

    class FeedbackItem {
        +string id
        +string feedback_record_id
        +string concept_id
        +string concept_name
        +string status
        +string misconception
        +string repair_action
        +string[] practice_task_ids
    }

    %% Next-actions
    class UserTask {
        +string id
        +string user_id
        +string enrollment_id
        +UserTaskType type
        +string section_id
        +string task_id
        +string quiz_id
        +string review_attempt_id
        +string title
        +string description
        +number priority
        +string due_at
        +UserTaskStatus status
        +string completed_at
        +string source
    }

    class UserTaskType {
        <<enum>>
        problem
        quiz
        review
        summary
        spaced_review
        repair
    }

    class UserTaskStatus {
        <<enum>>
        pending
        completed
        skipped
    }

    %% Resources
    class Resource {
        +string id
        +string exam_id
        +string course_id
        +string subject_id
        +string chapter_id
        +string title
        +string description
        +string url
        +ResourceType type
        +string[] tags
        +number order_index
        +boolean is_active
    }

    class ResourceType {
        <<enum>>
        video
        pdf
        article
        link
        cheatsheet
    }

    %% Relationships
    User "1" --> "1" UserRole : has
    User "1" --> "1" AccountType : has
    User "1" --> "0..*" Enrollment : enrolled
    User "1" --> "0..*" WorkspaceState : owns
    User "1" --> "0..*" QuizAttempt : takes
    User "1" --> "0..*" ReviewQuizAttempt : takes
    User "1" --> "0..*" ConceptMastery : tracks
    User "1" --> "0..*" FeedbackRecord : receives
    User "1" --> "0..*" UserTask : assigned

    Exam "1" --> "0..*" Course : contains
    Course "1" --> "0..*" Subject : contains
    Subject "1" --> "0..*" Chapter : has
    Subject "1" --> "0..*" Enrollment : enrolled
    Subject "1" --> "0..*" ConceptMastery : measured_for
    Subject "1" --> "0..*" Resource : has

    Chapter "1" --> "0..*" Section : has
    Chapter "1" --> "0..*" Resource : has

    Section "1" --> "0..*" Task : contains
    Section "1" --> "0..1" Quiz : has
    Section "1" --> "0..*" Resource : has
    Section "1" --> "0..*" UserTask : referenced

    Task "1" --> "0..*" UserTask : referenced

    Quiz "1" --> "0..*" QuizQuestion : has
    Quiz "1" --> "0..*" QuizAttempt : attempted
    Quiz "1" --> "0..*" UserTask : referenced

    QuizAttempt "1" --> "0..1" ReviewQuizAttempt : triggers
    QuizAttempt "1" --> "0..1" FeedbackRecord : generates
    ReviewQuizAttempt "1" --> "0..1" FeedbackRecord : generates
    FeedbackRecord "1" --> "0..*" FeedbackItem : contains
```

---

## Simplified Learning Loop

```mermaid
classDiagram
    direction LR

    class User {
        +id
        +email
    }

    class Subject {
        +id
        +slug
        +title
    }

    class Enrollment {
        +id
        +progress_percentage
        +status
    }

    class Section {
        +id
        +title
        +type
        +is_locked
    }

    class Task {
        +id
        +statement
        +label
    }

    class Quiz {
        +id
        +passing_score
    }

    class QuizAttempt {
        +id
        +score
        +passed
    }

    class UserTask {
        +id
        +type
        +priority
        +status
    }

    class ConceptMastery {
        +concept_id
        +strength
        +is_weak
    }

    class FeedbackRecord {
        +verdict
        +next_actions
    }

    User --> Subject : enrolls via
    Enrollment --> Subject : tracks
    User --> Enrollment : has
    Subject --> Section : contains
    Section --> Task : has
    Section --> Quiz : ends_with
    User --> QuizAttempt : takes
    QuizAttempt --> FeedbackRecord : generates
    User --> ConceptMastery : tracks
    User --> UserTask : assigned
    Enrollment --> WorkspaceState : has
```

---

## Key Relationships Summary

| From | To | Cardinality | Meaning |
|------|-----|-------------|---------|
| `User` | `Enrollment` | 1:N | A user enrolls in many subjects |
| `User` | `WorkspaceState` | 1:N | One workspace state per enrollment |
| `User` | `QuizAttempt` | 1:N | Many section quiz attempts |
| `User` | `ReviewQuizAttempt` | 1:N | Many review attempts |
| `User` | `ConceptMastery` | 1:N | Per-concept strength |
| `User` | `FeedbackRecord` | 1:N | Feedback per attempt |
| `User` | `UserTask` | 1:N | Dashboard next-actions |
| `Exam` | `Course` | 1:N | Exam contains courses |
| `Course` | `Subject` | 1:N | Course contains subjects |
| `Subject` | `Chapter` | 1:N | Subject has chapters |
| `Chapter` | `Section` | 1:N | Chapter has sections |
| `Section` | `Task` | 1:N | Section has problems |
| `Section` | `Quiz` | 1:1 | Gated section ends with one quiz |
| `Quiz` | `QuizQuestion` | 1:N | Quiz has questions |
| `Quiz` | `QuizAttempt` | 1:N | Quiz is attempted |
| `QuizAttempt` | `ReviewQuizAttempt` | 1:0..1 | Failed attempt triggers review |
| `QuizAttempt` / `ReviewQuizAttempt` | `FeedbackRecord` | 1:1 | Each attempt generates feedback |
| `FeedbackRecord` | `FeedbackItem` | 1:N | Per-concept repair actions |
| `Subject` | `Resource` | 1:N | Reference material |

---

*Last updated: 2026-06-19*
*See also: [schema.md](schema.md) for SQL definitions, [data-flow.md](data-flow.md) for interaction flows.*
