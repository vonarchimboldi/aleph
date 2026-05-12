const STORAGE_KEY = "learning-studio-data-v1";
const SESSION_KEY = "aleph-session";
const COURSE_PLAN_VERSION = "gate-da-basic-probability-chapter-3-expanded-v9";

const state = loadState();
let deferredInstallPrompt = null;
let selectedSubjectId = null;
let selectedSectionId = null;
let activeTestId = null;
ensureCoursePlan();

const views = {
  dashboard: document.querySelector("#dashboard-view"),
  plans: document.querySelector("#plans-view"),
  subjects: document.querySelector("#subjects-view"),
  tasks: document.querySelector("#tasks-view"),
  schedule: document.querySelector("#schedule-view"),
  tests: document.querySelector("#tests-view"),
  feedback: document.querySelector("#feedback-view"),
  resources: document.querySelector("#resources-view"),
  settings: document.querySelector("#settings-view")
};

const titles = {
  dashboard: "Dashboard",
  plans: "Exams",
  subjects: "Subjects",
  tasks: "Tasks",
  schedule: "Schedule",
  tests: "Tests",
  feedback: "Feedback",
  resources: "Resources",
  settings: "Share and Install"
};

const typeLabels = {
  subject: "subject",
  schedule: "session",
  test: "test",
  feedback: "feedback",
  resource: "resource"
};

document.querySelectorAll("[data-view]").forEach((button) => {
  button.addEventListener("click", () => showView(button.dataset.view));
});

document.querySelectorAll("[data-view-link]").forEach((button) => {
  button.addEventListener("click", () => showView(button.dataset.viewLink));
});

document.querySelectorAll("[data-open-form]").forEach((button) => {
  button.addEventListener("click", () => openForm(button.dataset.openForm));
});

document.querySelector("#quick-add-btn").addEventListener("click", () => {
  const activeView = document.querySelector(".nav-item.active").dataset.view;
  const type = activeView === "tests" ? "test" : activeView;
  openForm(["subject", "schedule", "test", "feedback", "resource"].includes(type) ? type : "schedule");
});

document.querySelector("#seed-btn").addEventListener("click", loadSampleData);
document.querySelector("#reset-plan-btn").addEventListener("click", resetPlanData);
document.querySelector("#logout-btn").addEventListener("click", logout);
document.querySelector("#export-btn").addEventListener("click", exportData);
document.querySelector("#import-input").addEventListener("change", importData);
document.querySelector("#week-select").addEventListener("change", renderTaskList);
document.querySelector("#login-form").addEventListener("submit", login);
document.querySelector("#password-change-form").addEventListener("submit", changePassword);
document.querySelector("#show-password-change-btn").addEventListener("click", showPasswordChange);
document.querySelector("#back-to-login-btn").addEventListener("click", showLogin);
document.querySelector("#user-email-form").addEventListener("submit", saveUserEmail);
document.querySelector("#send-credentials-btn").addEventListener("click", sendCredentialEmail);

document.querySelector("#item-form").addEventListener("submit", (event) => {
  if (event.submitter?.value === "cancel") return;
  event.preventDefault();
  saveItem();
});

document.querySelector("#install-btn").addEventListener("click", async () => {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  updateInstallState();
});

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  updateInstallState();
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}

persist();
render();
applyAuthState();

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return initialState();
  }
  try {
    const parsed = JSON.parse(saved);
    const starter = initialState();
    const user = { ...defaultUser(), ...(parsed.user || {}) };
    user.password = user.password || user.tempPassword;
    user.mustChangePassword = false;
    return {
      user,
      subjects: parsed.subjects?.length ? parsed.subjects : starter.subjects,
      schedule: parsed.schedule?.length ? parsed.schedule : starter.schedule,
      tests: parsed.tests || [],
      quizAttempts: parsed.quizAttempts || [],
      feedback: parsed.feedback || [],
      resources: parsed.resources || [],
      tasks: parsed.tasks || [],
      accountTypes: parsed.accountTypes?.length ? parsed.accountTypes : parsed.products?.length ? parsed.products : starter.accountTypes,
      enrollments: parsed.enrollments?.length ? parsed.enrollments : starter.enrollments,
      lessonPlans: parsed.lessonPlans?.length ? parsed.lessonPlans : starter.lessonPlans,
      gateDaSections: parsed.gateDaSections?.length ? parsed.gateDaSections : starter.gateDaSections,
      coursePlanVersion: parsed.coursePlanVersion || ""
    };
  } catch {
    return initialState();
  }
}

function initialState() {
  return {
    user: defaultUser(),
    ...buildCoursePlan()
  };
}

function ensureCoursePlan() {
  if (state.coursePlanVersion === COURSE_PLAN_VERSION) return;
  Object.assign(state, buildCoursePlan(), {
    user: state.user || defaultUser()
  });
}

function buildCoursePlan() {
  const now = new Date().toISOString();
  const accountTypes = accountTypeCatalog(now);
  const sections = gateDaProbabilitySections(now);
  return buildGateDaBasicPlan(now, accountTypes, sections);
}

function buildGateDaBasicPlan(now, accountTypes, sections) {
  const probabilitySection = sections[0];
  const conditionalSection = sections[1];
  const monday = "2026-06-01";
  const sunday = addDays(monday, 6);
  const weekTwoMonday = addDays(monday, 7);
  const weekTwoSunday = addDays(weekTwoMonday, 6);
  const weekThreeMonday = addDays(monday, 14);
  return {
    subjects: [
      {
        id: "subject-gate-da-probability",
        title: "Probability",
        date: "2026-08-30",
        status: "In progress",
        details: "GATE DA Basic Probability, aligned to the official GATE DA syllabus. Chapters 1-3 now cover foundations, conditioning, random variables, expectation, and core expectation techniques.",
        sectionIds: sections.map((section) => section.id),
        updatedAt: now
      }
    ],
    schedule: [
      {
        id: "schedule-probability-chapter-1-study",
        title: "Probability Chapter 1: Section Preview and Core Ideas",
        week: 1,
        subject: "Probability",
        kind: "Study",
        date: monday,
        details: "Read Section Preview, attempt the Preview Activity, and study Core Ideas for Probability Foundations.",
        updatedAt: now
      },
      {
        id: "schedule-probability-chapter-1-practice",
        title: "Probability Chapter 1: Labelled Practice",
        week: 1,
        subject: "Probability",
        kind: "Practice",
        date: addDays(monday, 2),
        details: "Solve the labelled Probability Foundations practice problems. Reveal worked solutions only after attempting.",
        updatedAt: now
      },
      {
        id: "schedule-probability-chapter-1-review",
        title: "Probability Chapter 1: Conceptual Review",
        week: 1,
        subject: "Probability",
        kind: "Review",
        date: sunday,
        details: "Answer the conceptual review prompts without solutions. Use misses to identify weak understanding.",
        updatedAt: now
      },
      {
        id: "schedule-probability-chapter-2-study",
        title: "Probability Chapter 2: Conditional Probability",
        week: 2,
        subject: "Probability",
        kind: "Study",
        date: weekTwoMonday,
        details: "Study conditional probability, total probability, Bayes' theorem, and independence.",
        updatedAt: now
      },
      {
        id: "schedule-probability-chapter-2-practice",
        title: "Probability Chapter 2: Labelled Practice",
        week: 2,
        subject: "Probability",
        kind: "Practice",
        date: addDays(weekTwoMonday, 2),
        details: "Solve the Chapter 2 practice problems before opening worked solutions.",
        updatedAt: now
      },
      {
        id: "schedule-probability-chapter-2-review",
        title: "Probability Chapter 2: Objective Review",
        week: 2,
        subject: "Probability",
        kind: "Review",
        date: weekTwoSunday,
        details: "Take the conditional probability objective quiz and use the logged feedback to review weak concepts.",
        updatedAt: now
      },
      {
        id: "schedule-probability-chapter-3-study-1",
        title: "Probability Chapter 3: Random Variables, PMF/CDF, PDF/CDF, Expectation",
        week: 3,
        subject: "Probability",
        kind: "Study",
        date: weekThreeMonday,
        details: "Study Chapter 3 parts 1-8: random variables, distributions, expectation, linearity, indicators, tail sums, and transformations.",
        updatedAt: now
      }
    ],
    tests: [
      {
        id: "test-probability-chapter-1-conceptual-review",
        title: "Probability Chapter 1 Conceptual Review",
        date: sunday,
        details: "Objective end-of-chapter quiz for sample spaces, events, equal likelihood, counting, complements, and inclusion-exclusion. Attempts are logged in the learner record.",
        sectionId: probabilitySection.id,
        quizId: "quiz-probability-chapter-1-conceptual-review",
        updatedAt: now
      },
      {
        id: "test-probability-chapter-2-objective-review",
        title: "Probability Chapter 2 Objective Review",
        date: weekTwoSunday,
        details: "Objective end-of-chapter quiz for conditional probability, Bayes' theorem, total probability, and independence. Attempts are logged in the learner record.",
        sectionId: conditionalSection.id,
        quizId: "quiz-probability-chapter-2-objective-review",
        updatedAt: now
      }
    ],
    quizAttempts: [],
    tasks: [
      {
        id: "task-probability-chapter-1-read",
        week: 1,
        title: "Probability Ch 1: Read preview and core ideas",
        type: "Study",
        date: monday,
        status: "todo",
        done: false,
        details: "Open Subjects -> Probability -> Chapter 1 and read the Section Preview, Preview Activity, and Core Ideas.",
        updatedAt: now
      },
      {
        id: "task-probability-chapter-1-practice",
        week: 1,
        title: "Probability Ch 1: Solve labelled practice",
        type: "Practice",
        date: addDays(monday, 2),
        status: "todo",
        done: false,
        details: "Attempt the labelled practice problems before opening the worked solutions.",
        updatedAt: now
      },
      {
        id: "task-probability-chapter-1-review",
        week: 1,
        title: "Probability Ch 1: Complete conceptual review",
        type: "Review",
        date: sunday,
        status: "todo",
        done: false,
        details: "Answer the conceptual review prompts without solutions.",
        updatedAt: now
      },
      {
        id: "task-probability-chapter-2-read",
        week: 2,
        title: "Probability Ch 2: Read conditional probability",
        type: "Study",
        date: weekTwoMonday,
        status: "todo",
        done: false,
        details: "Open Subjects -> Probability -> Chapter 2 and study the exposition through Bayes' theorem.",
        updatedAt: now
      },
      {
        id: "task-probability-chapter-2-practice",
        week: 2,
        title: "Probability Ch 2: Solve labelled practice",
        type: "Practice",
        date: addDays(weekTwoMonday, 2),
        status: "todo",
        done: false,
        details: "Attempt the conditional probability practice problems before reading worked solutions.",
        updatedAt: now
      },
      {
        id: "task-probability-chapter-2-review",
        week: 2,
        title: "Probability Ch 2: Take objective review",
        type: "Review",
        date: weekTwoSunday,
        status: "todo",
        done: false,
        details: "Submit the Chapter 2 objective quiz so the learner record logs strengths and weaknesses.",
        updatedAt: now
      },
      {
        id: "task-probability-chapter-3-read-1",
        week: 3,
        title: "Probability Ch 3: Read parts 1-4",
        type: "Study",
        date: weekThreeMonday,
        status: "todo",
        done: false,
        details: "Open Subjects -> Probability -> Chapter 3 and study random variables, expectation, linearity, indicators, tail sums, and transformations. Review problems and quiz will be added separately.",
        updatedAt: now
      }
    ],
    accountTypes,
    enrollments: [
      {
        id: "enrollment-gate-da-basic-demo",
        userId: "user-basic-demo",
        accountTypeId: "gate-da-basic",
        planVariant: "Basic",
        paymentStatus: "active",
        lessonPlanId: "lesson-gate-da-basic-demo",
        status: "active",
        updatedAt: now
      }
    ],
    lessonPlans: [
      {
        id: "lesson-gate-da-basic-demo",
        userId: "user-basic-demo",
        title: "GATE DA Basic plan",
        type: "exam",
        subjects: ["Probability"],
        startDate: monday,
        endDate: "2026-08-30",
        status: "active",
        details: "GATE DA Basic plan surfaces: Subjects, Tasks, Schedule, Tests, Feedback, Resources, and Share. Current material build: Probability Chapters 1-2 and Chapter 3 parts 1-8.",
        updatedAt: now
      }
    ],
    gateDaSections: sections,
    feedback: [
      {
        id: "feedback-probability-chapter-1",
        title: "Probability Chapter 1 feedback focus",
        date: sunday,
        details: "Review conceptual answers for sample-space choice, complement use, overlap in A or B, and confusion between permutations and combinations.",
        updatedAt: now
      }
    ],
    resources: [
      {
        id: "resource-gate-da-2026-syllabus",
        title: "Official GATE 2026 DA Syllabus",
        date: "2026-06-01",
        details: "Official GATE DA syllabus. Use the Probability and Statistics portion to organize the Basic content build.",
        link: "https://gate2026.iitg.ac.in/doc/GATE2026_Syllabus/DA_2026_Syllabus.pdf",
        updatedAt: now
      },
      {
        id: "resource-probability-foundations",
        title: "Probability Chapter 1: Probability Foundations",
        date: "2026-06-01",
        details: "Open Subjects -> Probability to study Chapter 1 in Open Math-style format.",
        link: "",
        updatedAt: now
      },
      {
        id: "resource-probability-conditional",
        title: "Probability Chapter 2: Conditional Probability",
        date: weekTwoMonday,
        details: "Open Subjects -> Probability to study Chapter 2 and then take the objective review in Tests.",
        link: "",
        updatedAt: now
      },
      {
        id: "resource-probability-random-variables",
        title: "Probability Chapter 3: Random Variables and Expectation",
        date: weekThreeMonday,
        details: "Open Subjects -> Probability to study Chapter 3 parts 1-8. Review problems and quiz are pending.",
        link: "",
        updatedAt: now
      }
    ],
    coursePlanVersion: COURSE_PLAN_VERSION
  };
}

function accountTypeCatalog(updatedAt = new Date().toISOString()) {
  const tiers = [
    ["gate-da-basic", "GATE DA Basic", "Core GATE DA study material, chapter practice, and conceptual review.", ["Basic"]],
    ["gate-da-advanced", "GATE DA Advanced", "Basic material plus additional practice, quizzes, and deeper review sets.", ["Advanced"]],
    ["gate-da-premium", "GATE DA Premium", "Advanced preparation plus mocks, analytics, and stronger feedback workflows.", ["Premium"]],
    ["gate-da-platinum", "GATE DA Platinum", "Premium preparation plus personalized planning, custom feedback, and learner-specific review.", ["Platinum"]]
  ];

  return tiers.map(([id, title, description, planVariants]) => ({
    id,
    title,
    description,
    variants: planVariants,
    status: id === "gate-da-basic" || id === "gate-da-platinum" ? "active" : "planned",
    updatedAt
  }));
}

function gateDaProbabilitySections(updatedAt = new Date().toISOString()) {
  return [
    {
      id: "gate-da-probability-foundations",
      exam: "GATE DA",
      accountTier: "Basic",
      subject: "Probability",
      chapter: "Chapter 1",
      section: "1",
      title: "Probability Foundations",
      summary: "Sample spaces, events, counting, complements, inclusion-exclusion, and the basic probability moves needed before conditional probability.",
      sectionPreview: "Probability begins by making the experiment precise. Before using any formula, decide what the outcomes are, which outcomes are favourable, and whether all outcomes are equally likely. Most mistakes in basic probability come from counting the numerator and denominator from different sample spaces.",
      previewActivity: "A password is formed using two distinct letters followed by two distinct digits. How many passwords are possible, and what is the probability that a randomly chosen valid password starts with a vowel? Try it before reading the formulas. The point is to see that probability is often counting divided by counting.",
      chapterIntro: [
        "This chapter builds the small set of habits that make probability problems reliable. The first habit is to describe the experiment before doing arithmetic. A die roll, a card draw, a password, and a committee selection all produce outcomes, but the outcomes are not shaped the same way.",
        "For GATE DA, many early probability questions are counting questions in disguise. Once the sample space is chosen correctly, the probability is often a ratio. The hard part is deciding whether order matters, whether repetition is allowed, and whether the event is easier to count directly or by its complement.",
        "Read this chapter as a toolkit. Each numbered section introduces one decision a problem solver must make, then the practice set labels the technique being used."
      ],
      bookSections: [
        {
          number: "1.1",
          title: "Sample Spaces and Events",
          paragraphs: [
            "A random experiment is a process whose outcome is not known in advance, even though the set of possible outcomes can be described. The sample space is the set of all outcomes we agree to consider. An event is any subset of that sample space.",
            "The phrase we agree to consider matters. If two dice are rolled, the natural sample space for most questions is the 36 ordered pairs. If the question only records the sum, the possible values are 2 through 12, but those values are not equally likely. Confusing those two sample spaces is a common source of wrong answers."
          ],
          blocks: [
            {
              type: "definition",
              title: "Definition: sample space and event",
              body: "The sample space S is the set of all possible outcomes of the experiment. An event A is a subset of S. The event occurs exactly when the observed outcome lies in A."
            },
            {
              type: "example",
              title: "Example 1.1: two dice",
              body: "Roll two fair dice. If outcomes are ordered pairs, then S has 36 outcomes. The event 'sum is 7' is {(1,6), (2,5), (3,4), (4,3), (5,2), (6,1)}."
            },
            {
              type: "checkpoint",
              title: "Checkpoint",
              body: "If one card is drawn from a deck, describe the event 'king or heart' as a set operation before counting it."
            }
          ]
        },
        {
          number: "1.2",
          title: "Equally Likely Outcomes",
          paragraphs: [
            "The formula favourable outcomes divided by total outcomes is valid only when the outcomes in the chosen sample space are equally likely. This is automatic for a fair die if the outcomes are faces, and for a well-shuffled deck if the outcomes are cards. It is not automatic when outcomes are summaries such as sums, maximum values, or categories.",
            "A useful test is to ask whether the experiment gives every listed outcome the same number of ways to occur. For two dice, the sum 7 has six ordered pairs, while the sum 2 has one ordered pair. So the sums 2 through 12 are not an equally likely sample space."
          ],
          blocks: [
            {
              type: "principle",
              title: "Principle: ratio rule",
              body: "If every outcome in S is equally likely, then P(A) = |A| / |S|. Use this only after defining S and checking equal likelihood."
            },
            {
              type: "warning",
              title: "Common trap",
              body: "Do not count possible values of a statistic unless those values are equally likely. Count the underlying outcomes instead."
            },
            {
              type: "checkpoint",
              title: "Checkpoint",
              body: "For two dice, why is the probability that the maximum is 4 not simply 1/6?"
            }
          ]
        },
        {
          number: "1.3",
          title: "Counting for Probability",
          paragraphs: [
            "Counting enters probability through the numerator and denominator. Use the multiplication rule for staged choices, permutations when order matters, and combinations when order does not matter. The probability step comes after the count is organized.",
            "When the sample space has constraints, count only valid outcomes. For a password with two distinct letters followed by two distinct digits, the denominator is not 26^2 x 10^2 because repetition is disallowed inside each block."
          ],
          blocks: [
            {
              type: "example",
              title: "Example 1.2: password count",
              body: "Two distinct letters followed by two distinct digits can be formed in 26 x 25 x 10 x 9 ways. If the first letter must be a vowel, the favourable count is 5 x 25 x 10 x 9, so the probability is 5/26."
            },
            {
              type: "strategy",
              title: "Strategy",
              body: "Write the denominator first. Then write the numerator using the same kind of object: ordered sequences with ordered sequences, committees with committees, subsets with subsets."
            }
          ]
        },
        {
          number: "1.4",
          title: "Complements and At Least One",
          paragraphs: [
            "The complement of an event A is the event that A does not occur. Since every outcome is either in A or outside A, P(A) + P(A complement) = 1. This is often the shortest route when a direct count splits into many cases.",
            "Phrases such as at least one, not all, no repeated value, and neither often signal a complement. For example, counting at least one head in five tosses directly requires five cases. Counting no heads takes one case."
          ],
          blocks: [
            {
              type: "principle",
              title: "Principle: complement rule",
              body: "P(A) = 1 - P(A complement). Use it when the opposite event is sharper than the original event."
            },
            {
              type: "example",
              title: "Example 1.3: repeated birthday-style count",
              body: "If four people choose a favourite weekday, the event 'at least two match' is easier by complement. Count all different choices, then subtract that probability from 1."
            }
          ]
        },
        {
          number: "1.5",
          title: "Inclusion-Exclusion",
          paragraphs: [
            "When a question says A or B, first decide whether A and B can happen together. If they cannot overlap, add the probabilities. If they can overlap, adding P(A) and P(B) counts the intersection twice.",
            "Inclusion-exclusion corrects that double count. For two events, P(A union B) = P(A) + P(B) - P(A intersection B). The same idea works for counts: count A, count B, subtract the objects counted in both."
          ],
          blocks: [
            {
              type: "example",
              title: "Example 1.4: card event",
              body: "For one card, 'king or heart' has 4 kings and 13 hearts, but the king of hearts is in both groups. The favourable count is 4 + 13 - 1."
            },
            {
              type: "checkpoint",
              title: "Checkpoint",
              body: "An integer from 1 to 100 is chosen. Which numbers are counted twice if you count multiples of 2 and multiples of 5 separately?"
            }
          ]
        }
      ],
      concepts: [
        {
          name: "Sample space",
          description: "The full list of things that can happen.",
          cue: "First ask: what are all the possible results?"
        },
        {
          name: "Event",
          description: "The outcomes you want from the full list.",
          cue: "Words like at least, exactly, neither, and either describe the event."
        },
        {
          name: "Complement",
          description: "Count the opposite case, then subtract from 1.",
          cue: "Look for phrases like at least one, none, not all, or no repeat."
        },
        {
          name: "Inclusion-exclusion",
          description: "When two groups overlap, do not count the middle twice.",
          cue: "Use for A or B when A and B can both happen together."
        },
        {
          name: "Counting as deployment",
          description: "Use counting to find total cases and good cases.",
          cue: "After the counting is right, probability is good cases divided by total cases."
        }
      ],
      techniques: [
        {
          name: "Count favourable over total",
          when: "every outcome has the same chance.",
          move: "Count all outcomes. Count the outcomes you want. Divide."
        },
        {
          name: "Use the complement",
          when: "the wanted case has many parts, but the opposite is simple.",
          move: "Find the probability of the opposite. Subtract it from 1."
        },
        {
          name: "Split into disjoint cases",
          when: "the event can happen in separate ways that do not overlap.",
          move: "Count each way separately. Then add."
        },
        {
          name: "Apply inclusion-exclusion",
          when: "the event says A or B, and both can happen together.",
          move: "Add A and B. Then subtract the overlap once."
        }
      ],
      practiceProblems: probabilityFoundationProblems(),
      reviewPrompts: [
        "Explain in your own words why probability is not always the same as counting favourable-looking cases.",
        "When should you use the complement instead of direct counting?",
        "A and B are mutually exclusive. What does that say about P(A and B)? What does it not say?",
        "Why is P(A or B) not always P(A) + P(B)?",
        "Give one example where order matters and one example where order does not matter.",
        "In a problem with at least one success, what is usually the opposite event?",
        "What mistake happens if the numerator and denominator are counted from different sample spaces?",
        "Why must disjoint cases be genuinely non-overlapping before you add their counts?",
        "Create a two-dice event whose probability is easiest by complement.",
        "Create a card problem where inclusion-exclusion is necessary."
      ],
      reviewQuiz: {
        id: "quiz-probability-chapter-1-conceptual-review",
        title: "Probability Chapter 1 Objective Review",
        instructions: "Complete this after finishing the chapter exposition and labelled practice. The quiz is objective so the app can log what happened and diagnose concept strengths and weaknesses.",
        questions: probabilityFoundationReviewQuestions()
      },
      readingQuestions: [
        "What is the sample space in a probability problem?",
        "What is the difference between an outcome and an event?",
        "Why does at least one usually suggest using the complement?",
        "When can P(A or B) be computed by simple addition?",
        "Why must equally likely outcomes be checked before using favourable over total?"
      ],
      chapterSummary: [
        "Define the sample space before counting.",
        "An event is a set of outcomes.",
        "For equally likely outcomes, probability = favourable outcomes / total outcomes.",
        "Use complements for at least one, none, not all, and similar phrases.",
        "Use inclusion-exclusion when A or B has overlap.",
        "Use permutations when order matters and combinations when order does not matter."
      ],
      updatedAt
    },
    {
      id: "gate-da-conditional-probability",
      exam: "GATE DA",
      accountTier: "Basic",
      subject: "Probability",
      chapter: "Chapter 2",
      section: "2",
      title: "Conditional Probability",
      summary: "Conditional probability, Bayes' theorem, total probability, independence, and the exam moves needed when information changes the sample space.",
      sectionPreview: "Conditional probability starts when the question gives extra information. The denominator changes from the whole sample space to the event you are conditioning on. Many wrong answers come from keeping the old denominator after new information has arrived.",
      previewActivity: "A disease affects 3% of a population. A test is positive for 95% of diseased people and false positive for 4% of healthy people. A randomly chosen person tests positive. What is the probability the person actually has the disease? Try this before reading Bayes' theorem; the answer is not 95%.",
      chapterIntro: [
        "In Chapter 1, probability was mostly counting inside a fixed sample space. In this chapter, the sample space changes after information is given. That is the whole point of conditional probability.",
        "When you are told that B has happened, outcomes outside B are no longer possible. The probability of A given B is therefore the fraction of B in which A also happens. This is why the denominator is P(B), not P(A).",
        "GATE-style questions use this idea in four common ways: direct conditioning, Bayes inversion, total probability over cases, and independence checks."
      ],
      bookSections: [
        {
          number: "2.1",
          title: "Conditioning Changes the Denominator",
          paragraphs: [
            "The notation P(A|B) means the probability that A occurs given that B has occurred. Once B is known, only outcomes in B remain relevant. The event A occurs under this new information exactly when the outcome lies in A and B.",
            "So the numerator is P(A and B), and the denominator is P(B). This is not a trick formula. It is just the ratio rule applied inside the smaller sample space B."
          ],
          blocks: [
            {
              type: "definition",
              title: "Definition: conditional probability",
              body: "If P(B) > 0, then P(A|B) = P(A intersection B) / P(B). Read this as probability of A after restricting attention to B."
            },
            {
              type: "example",
              title: "Example 2.1: one die with information",
              body: "A fair die is rolled. Let A be 'number is even' and B be 'number is at least 4'. Inside B = {4,5,6}, the favourable outcomes for A are {4,6}. Therefore P(A|B) = 2/3."
            },
            {
              type: "warning",
              title: "Common trap",
              body: "Do not divide by P(A). The denominator is the event after the word given."
            }
          ]
        },
        {
          number: "2.2",
          title: "Multiplication Rule and Probability Trees",
          paragraphs: [
            "The conditional probability formula can be rearranged as P(A and B) = P(B)P(A|B). This is the multiplication rule. It is useful when a process happens in stages.",
            "A probability tree is just the multiplication rule drawn as branches. Multiply along a path. Add paths only when they are disjoint ways for the required event to occur."
          ],
          blocks: [
            {
              type: "principle",
              title: "Principle: multiplication rule",
              body: "P(A intersection B) = P(A)P(B|A) = P(B)P(A|B). Choose the order that matches the story."
            },
            {
              type: "example",
              title: "Example 2.2: drawing without replacement",
              body: "A box has 5 red and 3 blue balls. Two balls are drawn without replacement. P(first red and second red) = (5/8)(4/7) = 5/14."
            }
          ]
        },
        {
          number: "2.3",
          title: "Total Probability",
          paragraphs: [
            "Sometimes an event can happen through several cases. If the cases are disjoint and cover all possibilities, compute the probability inside each case and add.",
            "This is called the law of total probability. It is the formal version of splitting a problem by source, box, machine, urn, or prior class."
          ],
          blocks: [
            {
              type: "principle",
              title: "Principle: total probability",
              body: "If B1, B2, ..., Bk form a partition, then P(A) = P(A|B1)P(B1) + P(A|B2)P(B2) + ... + P(A|Bk)P(Bk)."
            },
            {
              type: "strategy",
              title: "Recognition cue",
              body: "Use total probability when the problem gives several sources with different success rates, such as factories, boxes, tests, or groups."
            }
          ]
        },
        {
          number: "2.4",
          title: "Bayes' Theorem",
          paragraphs: [
            "Bayes' theorem reverses the direction of conditioning. It is used when the question asks for the probability of a cause after seeing an effect.",
            "The denominator is found by total probability: all ways the observed evidence could have happened. This is why medical-test and defective-item questions often have surprisingly small posterior probabilities."
          ],
          blocks: [
            {
              type: "principle",
              title: "Principle: Bayes' theorem",
              body: "P(Bi|A) = P(A|Bi)P(Bi) / [P(A|B1)P(B1) + ... + P(A|Bk)P(Bk)]."
            },
            {
              type: "example",
              title: "Example 2.3: test positive",
              body: "If disease prevalence is 3%, sensitivity is 95%, and false positive rate is 4%, then P(disease|positive) = (0.95)(0.03) / [(0.95)(0.03) + (0.04)(0.97)]."
            },
            {
              type: "checkpoint",
              title: "Checkpoint",
              body: "In Bayes' theorem, identify which event is evidence and which event is the hidden cause before substituting."
            }
          ]
        },
        {
          number: "2.5",
          title: "Independence",
          paragraphs: [
            "Events A and B are independent when knowing B does not change the probability of A. In notation, P(A|B) = P(A), provided P(B) > 0.",
            "Independence is not the same as mutual exclusivity. Mutually exclusive events cannot occur together. Independent events can occur together, but one gives no probability information about the other."
          ],
          blocks: [
            {
              type: "definition",
              title: "Definition: independence",
              body: "A and B are independent if P(A intersection B) = P(A)P(B). Equivalently, P(A|B) = P(A) when P(B) > 0."
            },
            {
              type: "warning",
              title: "Common trap",
              body: "If A and B are mutually exclusive and both have positive probability, they are not independent."
            }
          ]
        }
      ],
      concepts: [
        {
          name: "Conditional probability",
          description: "Probability after some information is already known.",
          cue: "Look for given, among, known that, or selected from."
        },
        {
          name: "Multiplication rule",
          description: "Multiply probabilities along one step-by-step path.",
          cue: "Use when the story happens in stages, like first draw then second draw."
        },
        {
          name: "Total probability",
          description: "Break one probability into cases, then add the case answers.",
          cue: "Use when there are different boxes, factories, groups, or sources."
        },
        {
          name: "Bayes' theorem",
          description: "Use evidence to guess which cause was likely.",
          cue: "The problem gives cause to evidence, but asks evidence to cause."
        },
        {
          name: "Independence",
          description: "Knowing one thing happened does not change the chance of the other.",
          cue: "Check if P(A and B) is the same as P(A) times P(B)."
        }
      ],
      techniques: [
        {
          name: "Restrict the sample space",
          when: "the problem tells you something has already happened.",
          move: "Keep only the given event B. Divide by P(B)."
        },
        {
          name: "Draw a probability tree",
          when: "the process has steps or cases.",
          move: "Multiply along one branch. Add branches that lead to the answer."
        },
        {
          name: "Use total probability",
          when: "the same result can come from different sources.",
          move: "For each source, multiply source chance by success chance. Add."
        },
        {
          name: "Apply Bayes inversion",
          when: "you see the result and need to find the likely source.",
          move: "For each source, compute source chance times result chance. Divide by the total result chance."
        },
        {
          name: "Test independence",
          when: "the problem asks whether two events affect each other.",
          move: "Compare P(A and B) with P(A)P(B). If they match, independent."
        }
      ],
      practiceProblems: conditionalProbabilityProblems(),
      reviewPrompts: [
        "What changes when you condition on an event?",
        "In P(A|B), which event belongs in the denominator?",
        "When is a probability tree better than a direct formula?",
        "Why does Bayes' theorem need total probability in the denominator?",
        "Give an example where P(A|B) and P(B|A) are very different.",
        "Why are mutually exclusive positive-probability events not independent?"
      ],
      reviewQuiz: {
        id: "quiz-probability-chapter-2-objective-review",
        title: "Probability Chapter 2 Objective Review",
        instructions: "Complete this after finishing Chapter 2 exposition and labelled practice. The quiz logs objective answers and diagnoses conditional probability, Bayes, total probability, and independence.",
        questions: conditionalProbabilityReviewQuestions()
      },
      readingQuestions: [
        "What does P(A|B) mean in words?",
        "Why does conditioning change the denominator?",
        "State the multiplication rule.",
        "When do you use total probability?",
        "What does Bayes' theorem reverse?",
        "How can you test whether two events are independent?"
      ],
      chapterSummary: [
        "Conditional probability restricts the sample space to the given event.",
        "P(A|B) = P(A and B) / P(B), provided P(B) > 0.",
        "The multiplication rule handles staged events: P(A and B) = P(A)P(B|A).",
        "Total probability splits an event across complete disjoint cases.",
        "Bayes' theorem reverses conditioning from evidence to cause.",
        "Independence means P(A and B) = P(A)P(B), not that the events cannot occur together."
      ],
      updatedAt
    },
    {
      id: "gate-da-random-variables-expectation",
      exam: "GATE DA",
      accountTier: "Basic",
      subject: "Probability",
      chapter: "Chapter 3",
      section: "3",
      title: "Random Variables and Expectation",
      summary: "Random variables, PMF/CDF, first discrete distributions, PDF/CDF through uniform, and expectation as the tool that turns probability models into numbers.",
      sectionPreview: "A probability problem often asks for a number, not just whether an event happens. The number of heads, the waiting time for the first success, the number of selected defective items, or a random point on an interval are all random variables. This chapter starts building the language for those quantities.",
      previewActivity: "A fair coin is tossed 10 times. Let X be the number of heads. What values can X take? What is P(X = 3)? What is P(X <= 3)? Try to answer these three questions before reading. You are already using a random variable, a PMF, and a CDF.",
      chapterIntro: [
        "In Chapters 1 and 2, most questions were about events. In Chapter 3, the object of study becomes a number produced by the experiment. That number is a random variable.",
        "Random variables let us ask sharper questions. Instead of only asking whether a selected item is defective, we can ask how many defectives appear in a sample. Instead of asking whether the first toss is heads, we can ask how long we wait for the first heads.",
        "This chapter introduces the basic language and the first expectation techniques: random variables, PMFs, CDFs, PDFs, a few essential distributions, expectation, linearity, indicators, tail sums, and transformations."
      ],
      bookSections: [
        {
          number: "3.1",
          title: "What Is a Random Variable?",
          paragraphs: [
            "A random variable is a numerical value determined by the outcome of a random experiment. It is not the outcome itself. It is a function that takes an outcome and returns a number.",
            "For example, if three coins are tossed, the outcome could be HTH. The random variable X = number of heads gives X = 2 for this outcome. The outcome is HTH, the event could be 'at least two heads', and the random variable is the number X.",
            "This distinction matters. Events are true or false after the experiment. Random variables take numerical values. Once we have numbers, we can discuss distributions, averages, variances, and transformations."
          ],
          blocks: [
            {
              type: "definition",
              title: "Definition: random variable",
              body: "A random variable X assigns a real number X(s) to each outcome s in the sample space."
            },
            {
              type: "example",
              title: "Example 3.1: two dice",
              body: "Roll two dice. The ordered pair (2,5) is an outcome. The event 'sum is 7' is a set of outcomes. The random variable S = sum of the two dice gives S(2,5) = 7."
            },
            {
              type: "warning",
              title: "Common trap",
              body: "Do not confuse X with an event such as X = 3. The random variable is X. The statement X = 3 is an event."
            }
          ]
        },
        {
          number: "3.2",
          title: "PMF, CDF, and First Discrete Distributions",
          paragraphs: [
            "A discrete random variable takes separated values like 0, 1, 2, 3. Think of counts: number of heads, number of defectives, number of calls received, number of attempts until success.",
            "The PMF is a value-by-value chance table. It answers questions like P(X = 3). The CDF is the running total of the PMF. It answers questions like P(X <= 3).",
            "We introduce four simple distributions here because they give names to common stories. Bernoulli is one yes/no trial. Binomial is many independent yes/no trials. Geometric is waiting for the first success. Hypergeometric is counting successes when you sample without replacement."
          ],
          blocks: [
            {
              type: "definition",
              title: "Bernoulli",
              body: "A Bernoulli(p) random variable takes value 1 with probability p and 0 with probability 1 - p. It is the indicator of one success event."
            },
            {
              type: "example",
              title: "Example 3.2: one item check",
              body: "A factory item is defective with probability 0.04. Let X = 1 if the item is defective and X = 0 otherwise. Then X is Bernoulli(0.04). Its PMF is P(X = 1) = 0.04 and P(X = 0) = 0.96."
            },
            {
              type: "definition",
              title: "Binomial",
              body: "A Binomial(n, p) random variable counts successes in n independent identical Bernoulli(p) trials."
            },
            {
              type: "example",
              title: "Example 3.3: repeated calls",
              body: "A candidate answers each multiple-choice question correctly with probability 1/4 by guessing. If there are 8 independent questions and X is the number correct, then X is Binomial(8, 1/4)."
            },
            {
              type: "definition",
              title: "Geometric",
              body: "A Geometric(p) random variable counts the trial on which the first success occurs in repeated independent Bernoulli(p) trials."
            },
            {
              type: "example",
              title: "Example 3.4: first success",
              body: "A server request succeeds with probability 0.8 each time. If X is the attempt number on which the first success happens, then X is Geometric(0.8)."
            },
            {
              type: "definition",
              title: "Hypergeometric",
              body: "A Hypergeometric random variable counts successes in a sample drawn without replacement from a finite population."
            },
            {
              type: "example",
              title: "Example 3.5: no replacement",
              body: "A batch has 20 items, 5 defective. You inspect 4 items without replacement. If X is the number of defectives inspected, then X is hypergeometric. The draws affect each other because the item is not put back."
            },
            {
              type: "checkpoint",
              title: "Checkpoint",
              body: "A coin is tossed until the first head appears. Is this binomial or geometric? What is X counting?"
            }
          ]
        },
        {
          number: "3.3",
          title: "PDF, CDF, and the Uniform Distribution",
          paragraphs: [
            "A continuous random variable measures something on a line: time, distance, weight, voltage, or a randomly chosen point in an interval. There are too many possible exact values to list one by one.",
            "For a continuous variable, the chance of one exact value is usually 0. So we ask for interval chances: P(2 <= X <= 5), P(X > 10), or P(X <= x).",
            "The PDF is a height curve. Probability is area under the curve. The CDF is still the running probability F(x) = P(X <= x). The first useful example is Uniform(a, b), where every interval of the same length has the same chance."
          ],
          blocks: [
            {
              type: "definition",
              title: "PDF",
              body: "For a continuous random variable X with density f, P(a <= X <= b) is the integral of f(x) from a to b. A point has zero probability; an interval has area."
            },
            {
              type: "definition",
              title: "Uniform(a, b)",
              body: "X is Uniform(a, b) if its density is constant on [a, b]. Its CDF rises linearly from 0 to 1 across that interval."
            },
            {
              type: "example",
              title: "Example 3.6: bus arrival",
              body: "A bus arrives at a random time between 0 and 10 minutes from now, equally likely across the interval. If X is the waiting time, then X is Uniform(0,10). P(X <= 3) = 3/10, and P(4 <= X <= 7) = 3/10."
            },
            {
              type: "example",
              title: "Example 3.7: random point",
              body: "Choose a point uniformly from the interval [2, 8]. The chance it lies between 5 and 6 is length 1 divided by total length 6, so the probability is 1/6."
            },
            {
              type: "warning",
              title: "Common trap",
              body: "For a continuous random variable, f(x) is not P(X = x). It is density. Probability is area."
            }
          ]
        },
        {
          number: "3.4",
          title: "Expectation",
          paragraphs: [
            "Expectation is the average value you would see if the same experiment were repeated many times. It is not a guarantee for the next trial. It is the long-run balance point.",
            "For a discrete random variable, multiply each value by its chance and add. For a continuous random variable, multiply x by the density and integrate. In this chapter, focus first on what the average means.",
            "The distributions above have useful expectations. Bernoulli(p) has mean p. Binomial(n, p) has mean np. Geometric(p), when it counts the trial of first success, has mean 1/p. Hypergeometric has mean sample size times population success fraction. Uniform(a, b) has mean (a + b)/2."
          ],
          blocks: [
            {
              type: "principle",
              title: "Discrete expectation",
              body: "For a discrete random variable X, E[X] = sum over x of x P(X = x)."
            },
            {
              type: "principle",
              title: "Continuous expectation",
              body: "For a continuous random variable X with density f, E[X] = integral of x f(x) over the support."
            },
            {
              type: "example",
              title: "Example 3.8: Bernoulli expectation",
              body: "If X is 1 when an item is defective and 0 otherwise, with P(defective) = 0.04, then E[X] = 1(0.04) + 0(0.96) = 0.04. A 0-1 variable averages to the chance it is 1."
            },
            {
              type: "example",
              title: "Example 3.9: binomial expectation",
              body: "If X counts heads in 10 fair coin tosses, then X is Binomial(10, 1/2), so E[X] = 10 x 1/2 = 5."
            },
            {
              type: "example",
              title: "Example 3.10: geometric expectation",
              body: "If each attempt succeeds with probability 0.2 and X is the attempt number of the first success, then E[X] = 1/0.2 = 5. On average, success takes 5 attempts."
            },
            {
              type: "example",
              title: "Example 3.11: hypergeometric expectation",
              body: "A batch has 20 items, 5 defective. You inspect 4 without replacement. The expected number of defectives is 4 x (5/20) = 1. Even though the draws are dependent, the average count is sample size times defective fraction."
            },
            {
              type: "example",
              title: "Example 3.12: uniform expectation",
              body: "If a bus arrives uniformly between 0 and 10 minutes, the average waiting time is the midpoint: (0 + 10)/2 = 5 minutes."
            },
            {
              type: "checkpoint",
              title: "Checkpoint",
              body: "A box has 8 good and 2 defective items. You sample 3 without replacement. What should the expectation of the number of defectives look like before doing any heavy counting?"
            }
          ]
        },
        {
          number: "3.5",
          title: "Linearity of Expectation",
          paragraphs: [
            "Linearity of expectation says: average of a total equals total of the averages. If X is made from smaller pieces, find the average of each piece and add.",
            "The important point is that the pieces do not need to be independent. This is surprising at first. But it is exactly what makes expectation easier than full distribution finding.",
            "Use this when a problem asks for an expected count or expected total and direct distribution is messy."
          ],
          blocks: [
            {
              type: "principle",
              title: "Principle: linearity",
              body: "For random variables X1, X2, ..., Xn with finite expectations, E[X1 + X2 + ... + Xn] = E[X1] + E[X2] + ... + E[Xn]. No independence is required."
            },
            {
              type: "example",
              title: "Example 3.13: dependent draws still work",
              body: "If 3 items are sampled from 10 items of which 2 are defective, let Xi indicate whether the ith draw is defective. Then X = X1 + X2 + X3 and E[Xi] = 2/10, so E[X] = 3 x 2/10 = 3/5."
            },
            {
              type: "example",
              title: "Example 3.14: total marks",
              body: "A test has 10 one-mark questions. For question i, let Xi be the mark obtained. Total score S = X1 + ... + X10. Even if the questions are not independent, E[S] = E[X1] + ... + E[X10]."
            },
            {
              type: "example",
              title: "Example 3.15: two dependent cards",
              body: "Draw 2 cards without replacement. Let X be the number of aces. Write X = X1 + X2, where Xi is 1 if draw i is an ace. E[X1] = 4/52 and E[X2] = 4/52, so E[X] = 8/52 = 2/13. The draws are dependent, but expectation still adds."
            },
            {
              type: "warning",
              title: "Common trap",
              body: "Do not wait for independence before using linearity. Even dependent random variables have additive expectations."
            }
          ]
        },
        {
          number: "3.6",
          title: "Indicator Method",
          paragraphs: [
            "An indicator is a small switch. It is 1 if a particular thing happens, and 0 if it does not. The average value of this switch is just the chance that it turns on.",
            "This turns many hard expected-count problems into easy probability problems. Do not try to find the full distribution of the count. Count by switches.",
            "Use one switch per person, card, box, position, component, or pair. Then add the switch averages."
          ],
          blocks: [
            {
              type: "definition",
              title: "Definition: indicator",
              body: "For an event A, the indicator IA equals 1 if A occurs and 0 if A does not occur. Its expectation is E[IA] = P(A)."
            },
            {
              type: "strategy",
              title: "Procedure",
              body: "To find the expected count, define one indicator per object, write total count as their sum, compute each indicator expectation, and add."
            },
            {
              type: "example",
              title: "Example 3.16: fixed points",
              body: "In a random permutation of n people, let Xi indicate whether person i gets their own item. P(Xi = 1) = 1/n, so the expected number of fixed points is n x 1/n = 1."
            },
            {
              type: "example",
              title: "Example 3.17: nonempty boxes",
              body: "Throw 5 balls independently into 4 boxes. Let Ii be 1 if box i is nonempty. P(box i is empty) = (3/4)^5, so E[Ii] = 1 - (3/4)^5. Expected nonempty boxes = 4[1 - (3/4)^5]."
            },
            {
              type: "example",
              title: "Example 3.18: matches in two lists",
              body: "A random permutation of 1 to n is compared with the original list. Let Ii be 1 if position i matches. Each position matches with probability 1/n. Expected matches = n x 1/n = 1."
            },
            {
              type: "checkpoint",
              title: "Checkpoint",
              body: "If 5 balls are thrown independently into 4 boxes, what indicator would you define to find the expected number of nonempty boxes?"
            }
          ]
        },
        {
          number: "3.7",
          title: "Tail-Sum Formula",
          paragraphs: [
            "Tail-sum is another shortcut for averages. Instead of asking exactly where X stops, ask whether X reaches level 1, level 2, level 3, and so on.",
            "This is vivid for waiting time. If X is the number of attempts until first success, then X >= 4 means the first 3 attempts all failed. That is often simpler than writing P(X = 4).",
            "Use tail sums when X is 0, 1, 2, ... or 1, 2, 3, ... and the question 'does X reach this level?' is easy."
          ],
          blocks: [
            {
              type: "principle",
              title: "Principle: tail-sum formula",
              body: "If X is nonnegative and integer-valued, then E[X] = sum from k = 1 to infinity of P(X >= k), whenever the expectation exists."
            },
            {
              type: "example",
              title: "Example 3.19: geometric expectation",
              body: "If X is the trial number of the first success with success probability p, then P(X >= k) = (1 - p)^(k - 1). Summing the geometric series gives E[X] = 1/p."
            },
            {
              type: "example",
              title: "Example 3.20: first head",
              body: "Toss a fair coin until the first head. P(X >= 1)=1, P(X >= 2)=1/2, P(X >= 3)=1/4, and so on. The average waiting time is 1 + 1/2 + 1/4 + ... = 2 tosses."
            },
            {
              type: "example",
              title: "Example 3.21: why it is easier",
              body: "For waiting time, P(X = k) says fail k - 1 times and then succeed. P(X >= k) says only fail k - 1 times. The tail event has one less condition."
            },
            {
              type: "warning",
              title: "Common trap",
              body: "Use P(X >= k), not P(X = k), in the tail-sum formula."
            }
          ]
        },
        {
          number: "3.8",
          title: "Functions of Random Variables",
          paragraphs: [
            "Often the number you need is made from another random variable. If X is waiting time, then X^2, 2X + 5, |X - 5|, and max(X, 3) are also random variables.",
            "For averages, do not first find the full distribution of the new variable unless you must. If you need E[g(X)], average g(x) using the probabilities of X.",
            "For probabilities, translate the event about Y back into an event about X. Monotone transformations keep the order simple. Non-monotone transformations need cases because two different X values can give the same Y."
          ],
          blocks: [
            {
              type: "principle",
              title: "LOTUS",
              body: "To find E[g(X)], use the values of X directly: add g(x)P(X = x) in the discrete case, or integrate g(x)f(x) in the continuous case."
            },
            {
              type: "strategy",
              title: "Monotone transformation",
              body: "If g only goes up, then Y <= y is the same as X <= the matching cutoff. If g only goes down, the inequality flips."
            },
            {
              type: "strategy",
              title: "Non-monotone transformation",
              body: "If g goes down and then up, or gives the same Y from two X values, split into cases. For Y = X^2, both X = 2 and X = -2 give Y = 4."
            },
            {
              type: "example",
              title: "Example 3.22: cost from number of attempts",
              body: "If each attempt costs Rs. 50 and X is the number of attempts, then total cost is Y = 50X. So E[Y] = 50E[X]. You do not need a new distribution."
            },
            {
              type: "example",
              title: "Example 3.23: square of a uniform variable",
              body: "If X is Uniform(0,1) and Y = X^2, then for 0 <= y <= 1, FY(y) = P(X^2 <= y) = P(X <= sqrt(y)) = sqrt(y)."
            },
            {
              type: "example",
              title: "Example 3.24: absolute error",
              body: "If X is an error that can be positive or negative, |X| is the size of the error. To find P(|X| <= 2), translate it to -2 <= X <= 2."
            }
          ]
        }
      ],
      concepts: [
        {
          name: "Random variable",
          description: "A number you get after the experiment happens.",
          cue: "Look for a count, sum, waiting time, score, maximum, or measurement."
        },
        {
          name: "PMF",
          description: "A table of chances for each possible value.",
          cue: "Use when the question asks for an exact value, like P(X = k)."
        },
        {
          name: "CDF",
          description: "The chance that X is up to a value.",
          cue: "Use when the question asks at most, no more than, or P(X <= k)."
        },
        {
          name: "PDF",
          description: "A curve for continuous values. Probability is area under the curve.",
          cue: "Use when X is a measurement, like time, length, or a point on an interval."
        },
        {
          name: "Expectation",
          description: "The long-run average value of X.",
          cue: "Look for expected value, mean, average count, or long-run average."
        },
        {
          name: "Linearity of expectation",
          description: "Average of a total equals total of the averages.",
          cue: "Use when the total can be split into small pieces."
        },
        {
          name: "Indicator variable",
          description: "A switch: 1 if the thing happens, 0 if it does not.",
          cue: "Use when you need the expected number of things that satisfy a condition."
        },
        {
          name: "Tail-sum formula",
          description: "Find an average by adding the chances that X reaches each level.",
          cue: "Use when P(X >= k) is easier than P(X = k), often for waiting time."
        },
        {
          name: "Function of a random variable",
          description: "Make a new random variable from X, like X squared or |X|.",
          cue: "Use when the question changes X into another quantity."
        }
      ],
      techniques: [
        {
          name: "Identify the random variable",
          when: "the experiment gives a number, not just yes or no.",
          move: "Say what X counts or measures. List possible values. Decide discrete or continuous."
        },
        {
          name: "Choose the distribution family",
          when: "the story matches a familiar pattern.",
          move: "One success switch is Bernoulli. Many independent tries is binomial. First success time is geometric. Sampling without replacement is hypergeometric."
        },
        {
          name: "Use PMF or CDF deliberately",
          when: "the question asks exact value or at most value.",
          move: "Use PMF for P(X = k). Use CDF for P(X <= k). Use complement for at least."
        },
        {
          name: "Compute expectation from the model",
          when: "you know which distribution X follows.",
          move: "Use the known mean, or multiply each value by its chance and add."
        },
        {
          name: "Apply linearity",
          when: "X is a total made from many small parts.",
          move: "Find the average of each part. Add those averages. Independence is not needed."
        },
        {
          name: "Use indicators",
          when: "X counts how many objects pass a test.",
          move: "Give each object a 0-1 switch. The average of that switch is the chance it turns on."
        },
        {
          name: "Use tail sums",
          when: "X is 0, 1, 2, ... and it is easy to ask whether X reaches level k.",
          move: "Add P(X >= 1), P(X >= 2), P(X >= 3), and so on."
        },
        {
          name: "Transform using CDF or LOTUS",
          when: "the question asks about a changed version of X.",
          move: "For average, plug g(X) into the expectation. For distribution, write the event in terms of X and solve."
        }
      ],
      practiceProblems: [],
      reviewPrompts: [],
      reviewQuiz: null,
      readingQuestions: [],
      chapterSummary: [
        "A random variable is a numerical function of the outcome.",
        "For discrete random variables, the PMF gives P(X = x).",
        "The CDF is F(x) = P(X <= x) for both discrete and continuous random variables.",
        "For continuous random variables, probabilities are areas under a PDF.",
        "Bernoulli, binomial, geometric, and hypergeometric are the first discrete models to recognise.",
        "Uniform(a, b) is the first continuous model to recognise.",
        "Expectation is a weighted average, not necessarily a possible observed value.",
        "Linearity of expectation does not require independence.",
        "Indicators turn expected-count problems into probability problems.",
        "Tail sums compute expectations from survival probabilities.",
        "Functions of random variables can be handled by LOTUS for expectation and by the CDF method for distributions."
      ],
      buildStatus: "Parts 1-8 complete. Review problems, practice set, and objective quiz pending.",
      updatedAt
    }
  ];
}

function probabilityFoundationProblems() {
  return [
    {
      label: "Concept Problem 1: Build the sample space",
      concept: "Sample space",
      technique: "Count favourable over total",
      difficulty: "intro",
      prompt: "A fair die is rolled twice. What is the probability that the ordered pair has sum 7?",
      solution: "There are 6 x 6 = 36 ordered outcomes. Sum 7 occurs in (1,6), (2,5), (3,4), (4,3), (5,2), (6,1), so there are 6 favourable outcomes. Probability = 6/36 = 1/6."
    },
    {
      label: "Concept Problem 2: Event translation",
      concept: "Events",
      technique: "Count favourable over total",
      difficulty: "intro",
      prompt: "One card is drawn from a standard 52-card deck. What is the probability that it is a king or a heart?",
      solution: "There are 4 kings and 13 hearts. The king of hearts is counted in both, so subtract it once. Favourable = 4 + 13 - 1 = 16. Probability = 16/52 = 4/13."
    },
    {
      label: "Concept Problem 3: Complement",
      concept: "Complement",
      technique: "Use the complement",
      difficulty: "intro",
      prompt: "A coin is tossed 5 times. What is the probability of getting at least one head?",
      solution: "The opposite of at least one head is no heads, i.e. all tails. P(all tails) = (1/2)^5 = 1/32. Required probability = 1 - 1/32 = 31/32."
    },
    {
      label: "Problem 4: Exactly one condition",
      concept: "Counting",
      technique: "Split into disjoint cases",
      difficulty: "warmup",
      prompt: "A two-digit number is chosen uniformly from 10 to 99. What is the probability that exactly one digit is 7?",
      solution: "There are 90 two-digit numbers. Tens digit 7 and units not 7 gives 9 numbers: 70-76 and 78-79. Units digit 7 and tens not 7 gives 8 numbers because tens can be 1-9 except 7. Total = 17. Probability = 17/90."
    },
    {
      label: "Problem 5: Without replacement",
      concept: "Counting",
      technique: "Count favourable over total",
      difficulty: "warmup",
      prompt: "Two balls are drawn without replacement from a box with 5 red and 3 blue balls. What is the probability both are red?",
      solution: "Total ways to choose 2 balls from 8 is C(8,2) = 28. Favourable ways are C(5,2) = 10. Probability = 10/28 = 5/14."
    },
    {
      label: "Problem 6: With replacement",
      concept: "Counting",
      technique: "Multiply independent stages",
      difficulty: "warmup",
      prompt: "Two balls are drawn with replacement from a box with 5 red and 3 blue balls. What is the probability both are red?",
      solution: "Each draw has P(red) = 5/8. Replacement keeps the second probability the same. Probability = (5/8)(5/8) = 25/64."
    },
    {
      label: "Problem 7: At least one repeat",
      concept: "Complement",
      technique: "Use the complement",
      difficulty: "standard",
      prompt: "Four people independently choose one day of the week as their favourite. What is the probability that at least two people choose the same day?",
      solution: "Use the complement: all four choose different days. Total choices = 7^4. Different choices = 7 x 6 x 5 x 4. Probability = 1 - (7 x 6 x 5 x 4)/7^4 = 1 - 840/2401 = 1561/2401."
    },
    {
      label: "Problem 8: Ordered arrangement",
      concept: "Permutations",
      technique: "Count favourable over total",
      difficulty: "standard",
      prompt: "The letters of GATE are arranged randomly. What is the probability that the vowels are adjacent?",
      solution: "Total arrangements = 4! = 24. Treat A and E as one block. Then we arrange the block, G, T in 3! ways, and A/E inside the block in 2! ways. Favourable = 12. Probability = 12/24 = 1/2."
    },
    {
      label: "Problem 9: Committee count",
      concept: "Combinations",
      technique: "Count favourable over total",
      difficulty: "standard",
      prompt: "From 6 men and 4 women, a committee of 3 is chosen. What is the probability that the committee has at least one woman?",
      solution: "Total committees = C(10,3) = 120. Opposite event: no woman, so all 3 from 6 men = C(6,3) = 20. Probability = 1 - 20/120 = 5/6."
    },
    {
      label: "Problem 10: Inclusion-exclusion with numbers",
      concept: "Inclusion-exclusion",
      technique: "Apply inclusion-exclusion",
      difficulty: "standard",
      prompt: "An integer is chosen uniformly from 1 to 100. What is the probability it is divisible by 2 or 5?",
      solution: "Multiples of 2: 50. Multiples of 5: 20. Multiples of both, i.e. 10: 10. Favourable = 50 + 20 - 10 = 60. Probability = 60/100 = 3/5."
    },
    {
      label: "Problem 11: Neither event",
      concept: "Complement",
      technique: "Use inclusion-exclusion then complement",
      difficulty: "standard",
      prompt: "An integer is chosen uniformly from 1 to 60. What is the probability it is divisible by neither 3 nor 4?",
      solution: "Divisible by 3: 20. Divisible by 4: 15. Divisible by both, i.e. 12: 5. Divisible by 3 or 4 = 20 + 15 - 5 = 30. Neither = 60 - 30 = 30. Probability = 30/60 = 1/2."
    },
    {
      label: "Problem 12: Exactly two heads",
      concept: "Binomial counting",
      technique: "Choose positions",
      difficulty: "standard",
      prompt: "A fair coin is tossed 6 times. What is the probability of exactly two heads?",
      solution: "Choose the 2 head positions from 6: C(6,2) = 15. Each sequence has probability (1/2)^6. Probability = 15/64."
    },
    {
      label: "Problem 13: Dice maximum",
      concept: "Complement",
      technique: "Count by maximum",
      difficulty: "standard",
      prompt: "Two fair dice are rolled. What is the probability that the maximum of the two numbers is 4?",
      solution: "Both dice must be at most 4, and at least one must be 4. Count pairs with both at most 4: 4^2 = 16. Count pairs with both at most 3: 3^2 = 9. Favourable = 16 - 9 = 7. Probability = 7/36."
    },
    {
      label: "Problem 14: Password restriction",
      concept: "Multiplication rule",
      technique: "Count favourable over total",
      difficulty: "standard",
      prompt: "A 4-digit PIN is formed from digits 0-9, repetition allowed. What is the probability that it has no repeated digit?",
      solution: "Total PINs = 10^4. No repeated digit: 10 x 9 x 8 x 7. Probability = 5040/10000 = 63/125."
    },
    {
      label: "Problem 15: First and last condition",
      concept: "Permutations",
      technique: "Count positions",
      difficulty: "standard",
      prompt: "A 5-letter word is made by arranging A, B, C, D, E. What is the probability that A appears before B?",
      solution: "By symmetry, in exactly half of all arrangements A appears before B and in the other half B appears before A. Probability = 1/2."
    },
    {
      label: "Problem 16: Non-overlapping cases",
      concept: "Disjoint cases",
      technique: "Split into disjoint cases",
      difficulty: "challenging",
      prompt: "Three fair dice are rolled. What is the probability that the sum is 5?",
      solution: "Positive triples adding to 5 are permutations of (3,1,1) and (2,2,1). The first gives 3 arrangements, the second gives 3 arrangements. Favourable = 6. Total = 216. Probability = 6/216 = 1/36."
    },
    {
      label: "Problem 17: At least two sixes",
      concept: "Complement",
      technique: "Subtract zero and one success",
      difficulty: "challenging",
      prompt: "A die is rolled 5 times. What is the probability of getting at least two sixes?",
      solution: "Use complement: zero sixes or exactly one six. P(0) = (5/6)^5. P(1) = C(5,1)(1/6)(5/6)^4. Required probability = 1 - (5/6)^5 - 5(1/6)(5/6)^4 = 1 - 3125/7776 - 3125/7776 = 763/3888."
    },
    {
      label: "Problem 18: Two constraints in cards",
      concept: "Inclusion-exclusion",
      technique: "Apply inclusion-exclusion",
      difficulty: "challenging",
      prompt: "A 5-card hand is drawn from a standard deck. What is the probability that it contains at least one ace or at least one king?",
      solution: "Total hands = C(52,5). No ace hands = C(48,5). No king hands = C(48,5). No ace and no king hands = C(44,5). By complement/inclusion-exclusion, favourable = C(52,5) - C(48,5) - C(48,5) + C(44,5). Divide by C(52,5)."
    },
    {
      label: "Problem 19: Divisibility with overlap",
      concept: "Inclusion-exclusion",
      technique: "Apply inclusion-exclusion",
      difficulty: "challenging",
      prompt: "A number is chosen uniformly from 1 to 1000. What is the probability that it is divisible by 6, 10, or 15?",
      solution: "Counts: by 6 is 166, by 10 is 100, by 15 is 66. Pair overlaps: lcm(6,10)=30 gives 33, lcm(6,15)=30 gives 33, lcm(10,15)=30 gives 33. Triple overlap lcm is 30, also 33. Favourable = 166 + 100 + 66 - 33 - 33 - 33 + 33 = 266. Probability = 266/1000 = 133/500."
    },
    {
      label: "Problem 20: Seating with adjacency",
      concept: "Permutations",
      technique: "Block method",
      difficulty: "challenging",
      prompt: "Five people A, B, C, D, E sit in a row randomly. What is the probability that A and B are not adjacent?",
      solution: "Total arrangements = 5! = 120. Adjacent A and B: treat AB as a block, arrange block, C, D, E in 4! ways and order A/B inside in 2 ways. Adjacent = 48. Not adjacent = 72. Probability = 72/120 = 3/5."
    },
    {
      label: "Problem 21: Distribution of balls",
      concept: "Sample space choice",
      technique: "Count assignments",
      difficulty: "challenging",
      prompt: "Three distinct balls are placed independently and uniformly into three distinct boxes. What is the probability that no box is empty?",
      solution: "Total assignments = 3^3 = 27. No box empty with 3 balls and 3 boxes means one ball in each box. Assign balls to boxes in 3! = 6 ways. Probability = 6/27 = 2/9."
    },
    {
      label: "Problem 22: Matching positions",
      concept: "Complement and cases",
      technique: "Derangement count",
      difficulty: "stretch",
      prompt: "A random permutation of 1, 2, 3, 4 is chosen. What is the probability that no number remains in its original position?",
      solution: "Total permutations = 4! = 24. Derangements of 4 can be counted by inclusion-exclusion: 24 - C(4,1)3! + C(4,2)2! - C(4,3)1! + C(4,4)0! = 24 - 24 + 12 - 4 + 1 = 9. Probability = 9/24 = 3/8."
    },
    {
      label: "Problem 23: Mixed complement",
      concept: "Complement",
      technique: "Avoid repeated casework",
      difficulty: "stretch",
      prompt: "A fair die is rolled 8 times. What is the probability that every face appears at least once?",
      solution: "Use inclusion-exclusion on missing faces. Favourable sequences = 6^8 - C(6,1)5^8 + C(6,2)4^8 - C(6,3)3^8 + C(6,4)2^8 - C(6,5)1^8. Probability is this quantity divided by 6^8."
    },
    {
      label: "Problem 24: Conditional-looking but foundational",
      concept: "Sample space restriction",
      technique: "Count within the stated universe",
      difficulty: "stretch",
      prompt: "A number is chosen uniformly from all three-digit numbers with distinct digits. What is the probability that it is even?",
      solution: "Total distinct-digit three-digit numbers: hundreds has 9 choices, tens then 9 choices including 0 except the hundreds digit, units then 8 choices, total 648. Even units: if units is 0, hundreds has 9 choices and tens 8 choices, giving 72. If units is 2,4,6,8, choose units in 4 ways, hundreds in 8 ways because it cannot be 0 or the units digit, tens in 8 ways, giving 256. Favourable = 328. Probability = 328/648 = 41/81."
    }
  ];
}

function conditionalProbabilityProblems() {
  return [
    {
      label: "Concept Problem 1: Direct conditioning",
      concept: "Conditional probability",
      technique: "Restrict the sample space",
      difficulty: "intro",
      prompt: "A fair die is rolled. Given that the result is at least 4, what is the probability that it is even?",
      solution: "The given event is {4,5,6}. Inside this restricted sample space, the even outcomes are {4,6}. Probability = 2/3."
    },
    {
      label: "Concept Problem 2: Conditional denominator",
      concept: "Conditional probability",
      technique: "Use P(A|B)",
      difficulty: "intro",
      prompt: "For events A and B, P(A and B) = 0.18 and P(B) = 0.30. Find P(A|B).",
      solution: "P(A|B) = P(A and B)/P(B) = 0.18/0.30 = 0.6."
    },
    {
      label: "Concept Problem 3: Bayes inversion",
      concept: "Bayes' theorem",
      technique: "Reverse conditioning",
      difficulty: "intro",
      prompt: "A box is chosen at random. Box 1 has 2 red and 3 blue balls. Box 2 has 4 red and 1 blue ball. One ball drawn from the chosen box is red. What is the probability that Box 2 was chosen?",
      solution: "P(red|Box1)=2/5, P(red|Box2)=4/5, and each box has prior 1/2. P(Box2|red) = (4/5)(1/2) / [(2/5)(1/2) + (4/5)(1/2)] = 4/(2+4) = 2/3."
    },
    {
      label: "Problem 4: Card conditioning",
      concept: "Conditional probability",
      technique: "Restrict the sample space",
      difficulty: "warmup",
      prompt: "One card is drawn from a standard deck. Given that it is a face card, what is the probability that it is a king?",
      solution: "There are 12 face cards: J, Q, K in four suits. There are 4 kings among them. Probability = 4/12 = 1/3."
    },
    {
      label: "Problem 5: Two draws without replacement",
      concept: "Multiplication rule",
      technique: "Multiply staged probabilities",
      difficulty: "warmup",
      prompt: "A box has 5 red and 3 blue balls. Two balls are drawn without replacement. What is the probability both are blue?",
      solution: "P(first blue) = 3/8. Given first blue, P(second blue) = 2/7. Probability = (3/8)(2/7) = 3/28."
    },
    {
      label: "Problem 6: At least one by complement",
      concept: "Conditional probability",
      technique: "Use complement with stages",
      difficulty: "warmup",
      prompt: "A box has 4 defective and 6 good items. Two items are selected without replacement. What is the probability that at least one is defective?",
      solution: "Use complement: no defective means both good. P(both good) = (6/10)(5/9) = 1/3. Required probability = 1 - 1/3 = 2/3."
    },
    {
      label: "Problem 7: Total probability with machines",
      concept: "Total probability",
      technique: "Split by source",
      difficulty: "standard",
      prompt: "Machine A produces 60% of items and has 2% defective rate. Machine B produces 40% and has 5% defective rate. What is the probability that a randomly chosen item is defective?",
      solution: "P(defective) = P(def|A)P(A) + P(def|B)P(B) = (0.02)(0.60) + (0.05)(0.40) = 0.012 + 0.020 = 0.032."
    },
    {
      label: "Problem 8: Bayes with machines",
      concept: "Bayes' theorem",
      technique: "Source after evidence",
      difficulty: "standard",
      prompt: "Using the machines in Problem 7, an item is found defective. What is the probability it came from Machine B?",
      solution: "P(B|def) = P(def|B)P(B)/P(def) = (0.05)(0.40)/0.032 = 0.020/0.032 = 5/8."
    },
    {
      label: "Problem 9: Independence check",
      concept: "Independence",
      technique: "Compare product",
      difficulty: "standard",
      prompt: "Suppose P(A)=0.4, P(B)=0.5, and P(A and B)=0.2. Are A and B independent?",
      solution: "P(A)P(B) = 0.4 x 0.5 = 0.2, which equals P(A and B). Therefore A and B are independent."
    },
    {
      label: "Problem 10: Not independent",
      concept: "Independence",
      technique: "Compare conditional probability",
      difficulty: "standard",
      prompt: "Suppose P(A)=0.6, P(B)=0.5, and P(A|B)=0.8. Are A and B independent?",
      solution: "If independent, P(A|B) would equal P(A). Here 0.8 is not 0.6, so the events are not independent."
    },
    {
      label: "Problem 11: Conditional probability from a table",
      concept: "Conditional probability",
      technique: "Restrict to row or column",
      difficulty: "standard",
      prompt: "In a class, 30 students take Python, 20 take R, and 10 take both. A student is chosen at random from those who take Python. What is the probability the student also takes R?",
      solution: "Condition on Python. Among 30 Python students, 10 also take R. Probability = 10/30 = 1/3."
    },
    {
      label: "Problem 12: Total probability with boxes",
      concept: "Total probability",
      technique: "Partition by box",
      difficulty: "standard",
      prompt: "Box A has 3 red and 2 blue balls. Box B has 1 red and 4 blue balls. A box is chosen with probabilities 2/3 for A and 1/3 for B. What is the probability of drawing a red ball?",
      solution: "P(red) = P(red|A)P(A) + P(red|B)P(B) = (3/5)(2/3) + (1/5)(1/3) = 2/5 + 1/15 = 7/15."
    },
    {
      label: "Problem 13: Bayes with boxes",
      concept: "Bayes' theorem",
      technique: "Reverse box choice",
      difficulty: "standard",
      prompt: "Using the boxes in Problem 12, a red ball is drawn. What is the probability that Box A was chosen?",
      solution: "P(A|red) = P(red|A)P(A)/P(red) = (3/5)(2/3)/(7/15) = (2/5)/(7/15) = 6/7."
    },
    {
      label: "Problem 14: Medical test",
      concept: "Bayes' theorem",
      technique: "Likelihood times prior",
      difficulty: "standard",
      prompt: "A disease has prevalence 1%. A test has sensitivity 90% and false positive rate 5%. If a person tests positive, what is the probability the person has the disease?",
      solution: "P(D|+) = (0.90)(0.01) / [(0.90)(0.01) + (0.05)(0.99)] = 0.009 / 0.0585 = 2/13."
    },
    {
      label: "Problem 15: Conditional dice event",
      concept: "Conditional probability",
      technique: "Count inside the given event",
      difficulty: "standard",
      prompt: "Two fair dice are rolled. Given that their sum is at least 10, what is the probability that at least one die shows 6?",
      solution: "Sum at least 10 has outcomes: sum 10 gives 3, sum 11 gives 2, sum 12 gives 1, total 6 outcomes. Outcomes among these with at least one 6 are (4,6),(6,4),(5,6),(6,5),(6,6), total 5. Probability = 5/6."
    },
    {
      label: "Problem 16: Conditional complement",
      concept: "Conditional probability",
      technique: "Complement after conditioning",
      difficulty: "challenging",
      prompt: "Three cards are drawn without replacement from a deck. Given that the first card is an ace, what is the probability that at least one of the next two cards is also an ace?",
      solution: "After the first ace, 51 cards remain with 3 aces and 48 non-aces. Use complement: no ace in next two cards has probability (48/51)(47/50). Required probability = 1 - (48 x 47)/(51 x 50) = 49/425."
    },
    {
      label: "Problem 17: Bayes with three sources",
      concept: "Bayes' theorem",
      technique: "Total probability denominator",
      difficulty: "challenging",
      prompt: "A file is generated by model A, B, or C with probabilities 0.5, 0.3, and 0.2. The probability of an error is 0.01, 0.03, and 0.08 respectively. If an error is observed, what is the probability model C generated the file?",
      solution: "P(error) = (0.01)(0.5) + (0.03)(0.3) + (0.08)(0.2) = 0.005 + 0.009 + 0.016 = 0.030. P(C|error) = 0.016/0.030 = 8/15."
    },
    {
      label: "Problem 18: Conditional independence trap",
      concept: "Independence",
      technique: "Check after conditioning",
      difficulty: "challenging",
      prompt: "Two fair dice are rolled. Let A be 'first die is 6' and B be 'sum is 7'. Are A and B independent?",
      solution: "P(A)=1/6. P(B)=1/6. A and B together means (6,1), so P(A and B)=1/36. Since P(A)P(B)=1/36, A and B are independent."
    },
    {
      label: "Problem 19: Mutually exclusive vs independent",
      concept: "Independence",
      technique: "Use product criterion",
      difficulty: "challenging",
      prompt: "A fair die is rolled. Let A be 'roll is 1' and B be 'roll is 2'. Are A and B independent?",
      solution: "P(A and B)=0 because both cannot occur. But P(A)P(B)=(1/6)(1/6)=1/36. Since 0 is not 1/36, they are not independent."
    },
    {
      label: "Problem 20: Mixed Bayes and complement",
      concept: "Bayes' theorem",
      technique: "Reverse after a negative result",
      difficulty: "stretch",
      prompt: "A disease affects 2% of people. A test has sensitivity 95% and specificity 90%. A person tests negative. What is the probability the person still has the disease?",
      solution: "Specificity 90% means P(-|no disease)=0.90. Sensitivity 95% means P(-|disease)=0.05. P(D|-) = (0.05)(0.02) / [(0.05)(0.02) + (0.90)(0.98)] = 0.001 / 0.883 = 1/883."
    }
  ];
}

function conditionalProbabilityReviewQuestions() {
  return [
    {
      id: "cp-review-1",
      kind: "single concept",
      tags: ["conditional-probability"],
      prompt: "In P(A|B), which event determines the denominator?",
      options: [
        { id: "a", text: "A" },
        { id: "b", text: "B" },
        { id: "c", text: "A union B" },
        { id: "d", text: "The complement of B" }
      ],
      answer: "b"
    },
    {
      id: "cp-review-2",
      kind: "single concept",
      tags: ["multiplication-rule"],
      prompt: "Which identity is the multiplication rule?",
      options: [
        { id: "a", text: "P(A and B) = P(A) + P(B)" },
        { id: "b", text: "P(A and B) = P(A)P(B|A)" },
        { id: "c", text: "P(A|B) = P(B|A)" },
        { id: "d", text: "P(A or B) = P(A)P(B)" }
      ],
      answer: "b"
    },
    {
      id: "cp-review-3",
      kind: "single concept",
      tags: ["total-probability"],
      prompt: "When is total probability the natural method?",
      options: [
        { id: "a", text: "When an event can occur through complete disjoint cases" },
        { id: "b", text: "Only when events are independent" },
        { id: "c", text: "Only when outcomes are equally likely" },
        { id: "d", text: "When two events are mutually exclusive and positive" }
      ],
      answer: "a"
    },
    {
      id: "cp-review-4",
      kind: "single concept",
      tags: ["bayes-theorem"],
      prompt: "Bayes' theorem is mainly used to:",
      options: [
        { id: "a", text: "Reverse conditioning from evidence back to cause" },
        { id: "b", text: "Count permutations" },
        { id: "c", text: "Avoid using priors" },
        { id: "d", text: "Prove events are mutually exclusive" }
      ],
      answer: "a"
    },
    {
      id: "cp-review-5",
      kind: "single concept",
      tags: ["independence"],
      prompt: "Which condition is equivalent to independence of A and B?",
      options: [
        { id: "a", text: "P(A and B) = 0" },
        { id: "b", text: "P(A or B) = P(A) + P(B)" },
        { id: "c", text: "P(A and B) = P(A)P(B)" },
        { id: "d", text: "P(A|B) = P(B|A)" }
      ],
      answer: "c"
    },
    {
      id: "cp-review-6",
      kind: "mixed: two concepts",
      tags: ["conditional-probability", "sample-space"],
      prompt: "A die is rolled. Given the result is at least 4, what sample space should be used?",
      options: [
        { id: "a", text: "{1,2,3,4,5,6}" },
        { id: "b", text: "{4,5,6}" },
        { id: "c", text: "{2,4,6}" },
        { id: "d", text: "{1,2,3}" }
      ],
      answer: "b"
    },
    {
      id: "cp-review-7",
      kind: "mixed: two concepts",
      tags: ["bayes-theorem", "total-probability"],
      prompt: "In a medical-test Bayes problem, what belongs in the denominator?",
      options: [
        { id: "a", text: "Only the true positive probability" },
        { id: "b", text: "Only the disease prevalence" },
        { id: "c", text: "The total probability of the observed test result" },
        { id: "d", text: "The false positive rate alone" }
      ],
      answer: "c"
    },
    {
      id: "cp-review-8",
      kind: "mixed: two concepts",
      tags: ["independence", "conditional-probability"],
      prompt: "If P(A|B) = P(A), with P(B)>0, what can you conclude?",
      options: [
        { id: "a", text: "A and B are mutually exclusive" },
        { id: "b", text: "A and B are independent" },
        { id: "c", text: "A is impossible" },
        { id: "d", text: "B is certain" }
      ],
      answer: "b"
    },
    {
      id: "cp-review-9",
      kind: "mixed: three concepts",
      tags: ["bayes-theorem", "total-probability", "multiplication-rule"],
      prompt: "A source is chosen, then an item is observed defective. Which expression is the numerator for P(Source A | defective)?",
      options: [
        { id: "a", text: "P(Source A) + P(defective|Source A)" },
        { id: "b", text: "P(defective|Source A)P(Source A)" },
        { id: "c", text: "P(defective)" },
        { id: "d", text: "P(Source A|defective)P(defective)" }
      ],
      answer: "b"
    },
    {
      id: "cp-review-10",
      kind: "mixed: two concepts",
      tags: ["independence", "mutual-exclusivity"],
      prompt: "If A and B are mutually exclusive and both have positive probability, what is true?",
      options: [
        { id: "a", text: "They must be independent." },
        { id: "b", text: "They cannot be independent." },
        { id: "c", text: "P(A|B) = P(A)." },
        { id: "d", text: "P(A and B) = P(A)P(B)." }
      ],
      answer: "b"
    }
  ];
}

function probabilityFoundationReviewQuestions() {
  return [
    {
      id: "pf-review-1",
      kind: "single concept",
      tags: ["sample-space"],
      prompt: "Two fair dice are rolled and the ordered pair is recorded. Which sample space is appropriate for computing the probability that the sum is 7?",
      options: [
        { id: "a", text: "{2, 3, 4, ..., 12}" },
        { id: "b", text: "All 36 ordered pairs (i, j), where i and j are in {1, 2, ..., 6}" },
        { id: "c", text: "{1, 2, 3, 4, 5, 6}" },
        { id: "d", text: "Only the pairs whose sum is 7" }
      ],
      answer: "b"
    },
    {
      id: "pf-review-2",
      kind: "single concept",
      tags: ["event-translation", "inclusion-exclusion"],
      prompt: "One card is drawn from a standard deck. Which expression counts the event 'king or heart' correctly?",
      options: [
        { id: "a", text: "4 + 13" },
        { id: "b", text: "4 + 13 - 1" },
        { id: "c", text: "4 x 13" },
        { id: "d", text: "52 - 4 - 13" }
      ],
      answer: "b"
    },
    {
      id: "pf-review-3",
      kind: "single concept",
      tags: ["equally-likely"],
      prompt: "For two fair dice, why is it invalid to say P(sum is 7) = 1/11 because there are 11 possible sums?",
      options: [
        { id: "a", text: "The sums are not equally likely." },
        { id: "b", text: "There are only 6 possible sums." },
        { id: "c", text: "The dice are independent." },
        { id: "d", text: "The answer must always use combinations." }
      ],
      answer: "a"
    },
    {
      id: "pf-review-4",
      kind: "single concept",
      tags: ["complement"],
      prompt: "A fair coin is tossed 5 times. Which event is the complement of 'at least one head'?",
      options: [
        { id: "a", text: "Exactly one head" },
        { id: "b", text: "At least one tail" },
        { id: "c", text: "No heads" },
        { id: "d", text: "No tails" }
      ],
      answer: "c"
    },
    {
      id: "pf-review-5",
      kind: "single concept",
      tags: ["counting"],
      prompt: "A password has two distinct letters followed by two distinct digits. Which denominator counts all valid passwords?",
      options: [
        { id: "a", text: "26^2 x 10^2" },
        { id: "b", text: "26 x 25 x 10 x 9" },
        { id: "c", text: "C(26,2) x C(10,2)" },
        { id: "d", text: "26 x 10" }
      ],
      answer: "b"
    },
    {
      id: "pf-review-6",
      kind: "mixed: two concepts",
      tags: ["counting", "complement"],
      prompt: "From 6 men and 4 women, a committee of 3 is chosen. Which setup gives the probability of at least one woman?",
      options: [
        { id: "a", text: "C(4,1) / C(10,3)" },
        { id: "b", text: "1 - C(6,3) / C(10,3)" },
        { id: "c", text: "C(6,3) / C(10,3)" },
        { id: "d", text: "1 - C(4,3) / C(10,3)" }
      ],
      answer: "b"
    },
    {
      id: "pf-review-7",
      kind: "mixed: two concepts",
      tags: ["event-translation", "inclusion-exclusion"],
      prompt: "An integer is chosen from 1 to 100. Which count gives numbers divisible by 2 or 5?",
      options: [
        { id: "a", text: "50 + 20" },
        { id: "b", text: "50 + 20 - 10" },
        { id: "c", text: "100 - 50 - 20" },
        { id: "d", text: "10" }
      ],
      answer: "b"
    },
    {
      id: "pf-review-8",
      kind: "mixed: three concepts",
      tags: ["sample-space", "equally-likely", "counting"],
      prompt: "Two fair dice are rolled. Which method correctly computes P(maximum is 4)?",
      options: [
        { id: "a", text: "Use 1/6 because the maximum can be 1 through 6." },
        { id: "b", text: "Count ordered pairs with both dice at most 4, then subtract ordered pairs with both dice at most 3, and divide by 36." },
        { id: "c", text: "Count sums equal to 4 and divide by 11." },
        { id: "d", text: "Use C(6,2) because there are two dice." }
      ],
      answer: "b"
    },
    {
      id: "pf-review-9",
      kind: "mixed: three concepts",
      tags: ["counting", "complement", "equally-likely"],
      prompt: "Four people independently choose one weekday as their favourite. Which expression gives the probability that at least two people choose the same day?",
      options: [
        { id: "a", text: "1 - (7 x 6 x 5 x 4) / 7^4" },
        { id: "b", text: "(7 x 6 x 5 x 4) / 7^4" },
        { id: "c", text: "1 - 4 / 7" },
        { id: "d", text: "C(7,4) / 7^4" }
      ],
      answer: "a"
    },
    {
      id: "pf-review-10",
      kind: "mixed: two concepts",
      tags: ["sample-space", "event-translation"],
      prompt: "A two-digit number is chosen uniformly from 10 to 99. Which denominator should be used for probabilities over this experiment?",
      options: [
        { id: "a", text: "100" },
        { id: "b", text: "99" },
        { id: "c", text: "90" },
        { id: "d", text: "9" }
      ],
      answer: "c"
    }
  ];
}

function discreteMathMilestones() {
  return [
    {
      focus: "proof foundations, predicates, sets, basic counting, pigeonhole principle, and induction",
      cmu: "Basic counting and induction; begin pigeonhole principle.",
      mitMcs: "Lectures 1-2: predicates, sets, proofs, contradiction, and induction.",
      mitApplied: "Lecture 1: pigeonhole principle."
    },
    {
      focus: "casework, strong induction, inclusion-exclusion, probability independence, and conditioning",
      cmu: "Inclusion-exclusion and pigeonhole principle.",
      mitMcs: "Lecture 3: casework and strong induction.",
      mitApplied: "Lectures 2-3: independence, conditioning, and inclusion-exclusion."
    },
    {
      focus: "counting, binomial coefficients, relations, state machines, and permutations/combinations",
      cmu: "Binomial coefficients and combinatorial identities.",
      mitMcs: "Lectures 4 and 15-16: state machines, relations, and counting techniques.",
      mitApplied: "Lecture 4: counting."
    },
    {
      focus: "generating functions, sums, recurrences, and Catalan-style counting",
      cmu: "Linear recurrences and generating functions.",
      mitMcs: "Lectures 5 and 7: sums and recurrences.",
      mitApplied: "Lectures 5-7: generating functions and Catalan numbers."
    },
    {
      focus: "asymptotics, tail bounds, modular arithmetic, divisibility, and number theory basics",
      cmu: "More generating functions and transition to graph topics.",
      mitMcs: "Lectures 6, 8, and 9: asymptotics, divisibility, modular arithmetic.",
      mitApplied: "Lectures 8-10: tail bounds, Chernoff bounds, and modular arithmetic."
    },
    {
      focus: "cryptography, algebraic structures, basic group theory, and proof fluency",
      cmu: "Proof-heavy consolidation before graph theory.",
      mitMcs: "Lecture 10: cryptography.",
      mitApplied: "Lecture 11: basic group theory."
    },
    {
      focus: "graphs, graph coloring, connectivity, trees, and graph traversal ideas",
      cmu: "Introduction to graphs and trees.",
      mitMcs: "Lectures 11 and 13: graphs, coloring, connectivity, and trees.",
      mitApplied: "Bridge week: apply proof and counting tools to graph examples."
    },
    {
      focus: "matching, bipartite graphs, network flows, and max-flow min-cut",
      cmu: "Matchings and bipartite graphs.",
      mitMcs: "Lecture 12: matching.",
      mitApplied: "Lecture 15: max-flow min-cut theorem."
    },
    {
      focus: "directed graphs, DAGs, linear programming, duality, and optimization language",
      cmu: "Cycles, spanning trees, and graph proof techniques.",
      mitMcs: "Lecture 14: digraphs and DAGs.",
      mitApplied: "Lectures 12-13: linear programming and duality."
    },
    {
      focus: "probability, random variables, expectation, variance, and large deviations",
      cmu: "Ramsey/probabilistic-method style reasoning where useful.",
      mitMcs: "Lectures 18-24: probability through large deviations.",
      mitApplied: "Review probability lectures and tail bounds."
    },
    {
      focus: "information theory, compression, entropy, Huffman coding, and zero-sum games",
      cmu: "Advanced combinatorial reasoning and proof practice.",
      mitMcs: "Connect counting and probability to information-theoretic examples.",
      mitApplied: "Lectures 14, 16, and 17: zero-sum games, entropy, and Huffman coding."
    },
    {
      focus: "error-correcting codes, Hamming codes, Reed-Solomon codes, and modular algebra review",
      cmu: "Planar graphs, coloring, and cumulative graph review.",
      mitMcs: "Review modular arithmetic, graphs, and probability problem sets.",
      mitApplied: "Lectures 18-20: noisy-channel coding, Hamming codes, and Reed-Solomon codes."
    },
    {
      focus: "final cumulative synthesis across proofs, counting, recurrences, graphs, probability, optimization, and coding",
      cmu: "Cumulative final-style proof set.",
      mitMcs: "Cumulative Math for CS problem-set review.",
      mitApplied: "Cumulative Discrete Applied Mathematics review."
    }
  ];
}

function dsaMilestones() {
  return [
    {
      focus: "algorithmic abstraction, complexity analysis, arrays, and search",
      focs: "FOCS chapter 1 and chapter 3: mechanization of abstraction, algorithms, Big-O, and running-time measurement.",
      cartesian: "Complexity Analysis, Arrays, and Search."
    },
    {
      focus: "iteration, recursion, induction, strings, and basic sorting",
      focs: "FOCS chapter 2 plus chapter 3 merge-sort analysis: iteration, induction, recursion, recursive procedures, and recurrences.",
      cartesian: "Recursion, Strings, and Sorting."
    },
    {
      focus: "lists, linked lists, stacks, queues, and implementation invariants",
      focs: "FOCS chapter 6: the list data model, list operations, and data-structure representation.",
      cartesian: "LinkedLists, Stacks, and Queues."
    },
    {
      focus: "sets, hash tables, dictionaries, and collision handling",
      focs: "FOCS chapter 7: the set data model and set operations.",
      cartesian: "Hash Tables plus set/dictionary practice problems."
    },
    {
      focus: "trees, binary trees, traversal, and structural induction",
      focs: "FOCS chapter 5: tree terminology, tree data structures, recursions on trees, and structural induction.",
      cartesian: "Trees and tree traversal visualizations."
    },
    {
      focus: "binary search trees, heaps, priority queues, and heapsort",
      focs: "FOCS chapter 5: binary search trees, priority queues, partially ordered trees, and heapsort.",
      cartesian: "Binary Search Trees and Heaps."
    },
    {
      focus: "matrices, relational data modeling, and table-oriented operations",
      focs: "FOCS chapter 8: relational model, keys, storage structures, indexes, relational algebra, and implementation costs.",
      cartesian: "Matrices and implementation exercises for tabular data."
    },
    {
      focus: "graphs, graph representation, connectivity, BFS, and DFS",
      focs: "FOCS chapter 9: graph concepts, graph implementation, connected components, and depth-first search.",
      cartesian: "Graphs and Graph Algorithms: BFS, DFS, and cycle finding."
    },
    {
      focus: "minimum spanning trees, shortest paths, and graph algorithm analysis",
      focs: "FOCS chapter 9: minimal spanning trees, Dijkstra's algorithm, Floyd's algorithm, and graph-theory applications.",
      cartesian: "Minimum Spanning Trees and shortest-path practice."
    },
    {
      focus: "dynamic programming, backtracking, and recurrence-driven design",
      focs: "FOCS chapters 2 and 3 review: recursive definitions, recurrence relations, and analysis of recursive procedures.",
      cartesian: "Dynamic Programming and Backtracking."
    },
    {
      focus: "tries, string indexes, union-find, and graph connectivity applications",
      focs: "FOCS chapter 7 and chapter 9 review: set operations and graph connectivity.",
      cartesian: "Tries and Union-Find Structure."
    },
    {
      focus: "logic for correctness, specifications, predicates, and program reasoning",
      focs: "FOCS chapters 12 and 14: propositional logic, predicates, quantifiers, and proof rules. Chapters 10, 11, and 13 remain skipped.",
      cartesian: "Bit Operations plus correctness-oriented implementation review."
    },
    {
      focus: "final cumulative DSA synthesis across analysis, data structures, graph algorithms, recursion, DP, and correctness",
      focs: "Cumulative review of FOCS chapters 1-9, 12, and 14, excluding chapters 10, 11, and 13.",
      cartesian: "Cumulative review across Cartesian chapters 1-22 with emphasis on weak areas and solved problems."
    }
  ];
}

function probabilityStatsMilestones() {
  const cycle = [
    {
      topic: "NP/MP tests",
      pattern: "likelihood-ratio construction with size calibration",
      variations: "simple vs simple; one-sided UMP; two-sided non-UMP; transformed samples; mixed sufficient statistics"
    },
    {
      topic: "MLE and estimation",
      pattern: "likelihood setup, optimizer location, and estimator quality",
      variations: "regular families; support-dependent likelihoods; boundary MLEs; constrained MLEs; bias, MSE, sufficiency, UMVUE"
    },
    {
      topic: "conditional expectation and indicators",
      pattern: "conditioning choice, tower property, and decomposition into indicators",
      variations: "law of total expectation; law of total variance; stopping-time counts; exchangeability; non-overlap indicators"
    },
    {
      topic: "distributions and order statistics",
      pattern: "exact distribution from CDF/PDF transformations and order-statistic identities",
      variations: "uniform/beta order statistics; exponential spacings; min/max scaling; joint order statistics; Bayes and geometric/Poisson drills"
    },
    {
      topic: "regression and OLS",
      pattern: "normal equations, projection geometry, and estimator interpretation",
      variations: "simple regression; matrix OLS; constrained OLS; slope invariance; non-Gaussian errors; residual and fitted-value identities"
    }
  ];

  const weeklyFocus = [
    "baseline diagnostic cycle across all five patterns",
    "conditioning and LR-statistic selection under time pressure",
    "support-dependent likelihoods plus exact distribution calculations",
    "indicator decompositions and OLS algebra fluency",
    "NP/MP tests with composite alternatives and one-sided UMP arguments",
    "MLE edge cases, sufficiency, Rao-Blackwell improvement, and UMVUE recognition",
    "order-statistic joint laws, conditional laws, and asymptotic scaling",
    "conditional expectation, stopping-time counts, and variance decomposition",
    "regression/OLS plus mixed estimation and testing arguments",
    "full PSB reconstruction: identify the pattern before calculating",
    "weak-area rotation using errors from the first ten weeks",
    "timed mixed PSB sets with written-solution discipline",
    "final cumulative synthesis across all five recurring patterns"
  ];

  return weeklyFocus.map((focus, weekIndex) => ({
    focus,
    problemDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day, dayIndex) => {
      const theme = cycle[(weekIndex + dayIndex) % cycle.length];
      const intensity = dayIndex < 2 ? "core drill" : dayIndex < 4 ? "variation drill" : "mixed PSB-style drill";
      return {
        day,
        intensity,
        ...theme
      };
    })
  }));
}

function milestoneDetails(milestone) {
  if (milestone.problemDays) {
    const topics = milestone.problemDays.map((day) => `${day.day}: ${day.topic}`).join(" | ");
    return `Daily 5-problem PSB practice sets. Weekly focus: ${milestone.focus}. Pattern rotation: ${topics}`;
  }
  if (milestone.focs) {
    return `FOCS: ${milestone.focs} Cartesian: ${milestone.cartesian}`;
  }
  return `CMU 21-228: ${milestone.cmu} MIT 6.1200J: ${milestone.mitMcs} MIT 18.200: ${milestone.mitApplied}`;
}

function probabilityProblemSetDetails(dayPlan, week) {
  return `Complete 5 problems for Week ${week} ${dayPlan.day}. Theme: ${dayPlan.topic}. Pattern: ${dayPlan.pattern}. Variations to include: ${dayPlan.variations}. Mode: ${dayPlan.intensity}. After solving, write a short correction note for every missed setup, wrong statistic, algebra slip, or unsupported conclusion.`;
}

function probabilitySundayTestDetails(milestone) {
  const topics = [...new Set(milestone.problemDays.map((day) => day.topic))].join(", ");
  return `Sunday test covering the week's Probability and Statistics pattern cycle: ${topics}. Use 5-7 PSB-style questions, require full written solutions, and include one cumulative question that combines at least two patterns. Default feedback should mark: pattern recognition, setup, calculation, justification, final answer, and correction note quality.`;
}

function probabilityDefaultFeedback(milestone) {
  return `Default feedback template for the Sunday Probability and Statistics test. Weekly focus: ${milestone.focus}. For each produced solution, score: 1) did the learner identify the recurring pattern, 2) did they choose the right statistic/conditioning/event, 3) is the calculation correct, 4) is the argument justified, 5) is the final answer clearly stated, and 6) does the correction note explain the fix. Tag each miss by theme so the next week's daily sets can repeat the weak pattern.`;
}

function spacedReviewDetails(week, milestones, label = "subject") {
  const covered = milestones
    .slice(0, week)
    .map((milestone, index) => `W${index + 1}: ${milestone.focus}`)
    .join(" | ");
  return `Cumulative spaced review for ${label}. Re-test everything covered so far across the resources, not separate resource-specific quizzes. Covered material: ${covered}`;
}

function addDays(dateValue, days) {
  const date = new Date(`${dateValue}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function formatShortDate(value) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(`${value}T00:00:00`));
}

function defaultUser() {
  return basicGateDaUser();
}

function platinumDemoUser() {
  return {
    id: "user-platinum-demo",
    name: "platinum-demo",
    email: "platinum.demo@aleph.local",
    tempPassword: "platinum!demo",
    password: "platinum!demo",
    mustChangePassword: false,
    passwordStatus: "Prototype login enabled",
    registeredAt: new Date().toISOString()
  };
}

function basicGateDaUser() {
  return {
    id: "user-basic-demo",
    name: "basic",
    email: "basic.demo@aleph.local",
    tempPassword: "basic",
    password: "basic",
    mustChangePassword: false,
    passwordStatus: "GATE DA Basic prototype login",
    registeredAt: new Date().toISOString()
  };
}

function prototypeUsers() {
  const basic = basicGateDaUser();
  return [
    basic,
    platinumDemoUser(),
    {
      ...basic,
      name: "gate-basic",
      tempPassword: "basic!gate",
      password: "basic!gate"
    }
  ];
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function showView(name) {
  Object.values(views).forEach((view) => view.classList.remove("active"));
  views[name].classList.add("active");
  document.querySelector("#view-title").textContent = titles[name];
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === name);
  });
  if (name !== "subjects") {
    selectedSubjectId = null;
    selectedSectionId = null;
  }
}

function login(event) {
  event.preventDefault();
  const name = document.querySelector("#login-name").value.trim().toLowerCase();
  const password = document.querySelector("#login-password").value.trim();
  const error = document.querySelector("#login-error");
  const matchedUser = prototypeUsers().find((user) => user.name === name && password === (user.password || user.tempPassword));

  if (matchedUser) {
    state.user = { ...matchedUser };
    persist();
    sessionStorage.setItem(SESSION_KEY, matchedUser.name);
    error.textContent = "";
    document.querySelector("#login-form").reset();
    render();
    applyAuthState();
    return;
  }

  error.textContent = "Username or password is incorrect.";
}

function changePassword(event) {
  event.preventDefault();
  const name = document.querySelector("#change-name").value.trim();
  const currentPassword = document.querySelector("#current-password").value;
  const password = document.querySelector("#new-password").value;
  const confirmation = document.querySelector("#confirm-password").value;
  const error = document.querySelector("#password-error");
  const storedPassword = state.user.password || state.user.tempPassword;

  if (name !== state.user.name || currentPassword !== storedPassword) {
    error.textContent = "Username or current password is incorrect.";
    return;
  }

  if (password.length < 8) {
    error.textContent = "Password must be at least 8 characters.";
    return;
  }

  if (password !== confirmation) {
    error.textContent = "Passwords do not match.";
    return;
  }

  if (password === state.user.tempPassword) {
    error.textContent = "Choose a password different from the temporary password.";
    return;
  }

  state.user.password = password;
  state.user.mustChangePassword = false;
  state.user.passwordStatus = "Password changed";
  persist();
  sessionStorage.setItem(SESSION_KEY, state.user.name);
  error.textContent = "";
  document.querySelector("#password-change-form").reset();
  applyAuthState();
}

function showPasswordChange() {
  document.querySelector("#login-form").classList.add("hidden");
  document.querySelector("#password-change-form").classList.add("active");
  document.querySelector("#change-name").value = document.querySelector("#login-name").value.trim() || state.user.name;
}

function showLogin() {
  document.querySelector("#password-change-form").classList.remove("active");
  document.querySelector("#login-form").classList.remove("hidden");
  document.querySelector("#password-error").textContent = "";
}

function logout() {
  sessionStorage.removeItem(SESSION_KEY);
  applyAuthState();
}

function applyAuthState() {
  const sessionUser = sessionStorage.getItem(SESSION_KEY);
  const signedIn = sessionUser === state.user.name;
  const mustChangePassword = signedIn && state.user.mustChangePassword;
  document.body.classList.toggle("is-authenticated", signedIn && !mustChangePassword);
  document.querySelector("#landing-view").classList.toggle("active", !signedIn || mustChangePassword);
  document.querySelector("#login-form").classList.toggle("hidden", signedIn);
  document.querySelector("#password-change-form").classList.toggle("active", mustChangePassword);
  if (mustChangePassword) {
    document.querySelector("#change-name").value = state.user.name;
    document.querySelector("#current-password").value = state.user.tempPassword;
  }
}

function openForm(type, item = null) {
  const dialog = document.querySelector("#item-dialog");
  document.querySelector("#item-type").value = type;
  document.querySelector("#dialog-title").textContent = item ? `Edit ${typeLabels[type]}` : `New ${typeLabels[type]}`;
  document.querySelector("#save-item-btn").dataset.id = item?.id || "";
  document.querySelector("#item-title").value = item?.title || "";
  document.querySelector("#item-date").value = item?.date || "";
  document.querySelector("#item-details").value = item?.details || "";
  document.querySelector("#item-link").value = item?.link || "";
  document.querySelector("#item-status").value = item?.status || "Not started";
  document.querySelector("#link-field").style.display = type === "resource" ? "grid" : "none";
  document.querySelector("#status-field").style.display = type === "subject" ? "grid" : "none";
  document.querySelector("#details-label").textContent = type === "subject" ? "Learning plan" : "Details";
  dialog.showModal();
}

function saveItem() {
  const type = document.querySelector("#item-type").value;
  const collection = collectionFor(type);
  const existingId = document.querySelector("#save-item-btn").dataset.id;
  const item = {
    id: existingId || crypto.randomUUID(),
    title: document.querySelector("#item-title").value.trim(),
    date: document.querySelector("#item-date").value,
    status: document.querySelector("#item-status").value,
    details: document.querySelector("#item-details").value.trim(),
    link: document.querySelector("#item-link").value.trim(),
    updatedAt: new Date().toISOString()
  };

  if (existingId) {
    const index = collection.findIndex((entry) => entry.id === existingId);
    collection[index] = item;
  } else {
    collection.unshift(item);
  }

  persist();
  document.querySelector("#item-dialog").close();
  render();
}

function submitQuizAttempt(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const test = state.tests.find((entry) => entry.id === form.dataset.testId);
  const section = state.gateDaSections.find((entry) => entry.id === test?.sectionId);
  const quiz = section?.reviewQuiz;
  if (!test || !quiz) return;

  const formData = new FormData(form);
  const answers = quiz.questions.map((question) => {
    const selected = formData.get(question.id);
    return {
      questionId: question.id,
      selected,
      correctAnswer: question.answer,
      isCorrect: selected === question.answer,
      tags: question.tags,
      kind: question.kind
    };
  });
  const score = answers.filter((answer) => answer.isCorrect).length;
  const total = quiz.questions.length;
  const feedback = buildQuizFeedback(answers);
  const attempt = {
    id: `attempt-${quiz.id}-${Date.now()}`,
    userId: state.user.id,
    testId: test.id,
    quizId: quiz.id,
    sectionId: section.id,
    subject: section.subject,
    title: quiz.title,
    date: new Date().toISOString(),
    score,
    total,
    percent: Math.round((score / total) * 100),
    answers,
    feedback
  };

  state.quizAttempts.push(attempt);
  state.feedback.unshift({
    id: `feedback-${attempt.id}`,
    title: `${quiz.title}: Attempt ${state.quizAttempts.filter((entry) => entry.quizId === quiz.id).length}`,
    date: new Date().toISOString().slice(0, 10),
    details: `${score}/${total} (${attempt.percent}%). ${feedback.summary} Strong: ${feedback.strong.join(", ") || "none yet"}. Review: ${feedback.weak.join(", ") || "none flagged"}.`,
    attemptId: attempt.id,
    updatedAt: attempt.date
  });

  activeTestId = null;
  persist();
  render();
}

function buildQuizFeedback(answers) {
  const conceptScores = {};
  answers.forEach((answer) => {
    answer.tags.forEach((tag) => {
      if (!conceptScores[tag]) conceptScores[tag] = { correct: 0, total: 0 };
      conceptScores[tag].total += 1;
      if (answer.isCorrect) conceptScores[tag].correct += 1;
    });
  });

  const strong = [];
  const weak = [];
  const developing = [];
  Object.entries(conceptScores).forEach(([tag, score]) => {
    const percent = score.correct / score.total;
    if (percent >= 0.8) strong.push(conceptLabel(tag));
    else if (percent < 0.6) weak.push(conceptLabel(tag));
    else developing.push(conceptLabel(tag));
  });

  const missedMixed = answers.filter((answer) => !answer.isCorrect && answer.tags.length > 1).length;
  const summary = missedMixed
    ? "Mixed-concept misses suggest practising event translation before choosing a counting method."
    : "Misses are mostly isolated concept checks; review the flagged concepts and retake.";

  return { summary, strong, developing, weak, conceptScores };
}

function conceptLabel(tag) {
  const labels = {
    "sample-space": "sample spaces",
    "event-translation": "event translation",
    "equally-likely": "equally likely outcomes",
    counting: "counting setup",
    complement: "complements",
    "inclusion-exclusion": "inclusion-exclusion",
    "conditional-probability": "conditional probability",
    "multiplication-rule": "multiplication rule",
    "total-probability": "total probability",
    "bayes-theorem": "Bayes' theorem",
    "mutual-exclusivity": "mutual exclusivity"
  };
  return labels[tag] || tag;
}

function collectionFor(type) {
  if (type === "subject") return state.subjects;
  return type === "test" ? state.tests : state[`${type}s`] || state[type];
}

function render() {
  document.querySelector("#learner-subtitle").textContent = `Learner: ${state.user.name}`;
  document.querySelector("#subject-count").textContent = state.subjects.length;
  document.querySelector("#task-count").textContent = state.tasks.length;
  document.querySelector("#schedule-count").textContent = state.schedule.length;
  document.querySelector("#test-count").textContent = state.tests.length;
  document.querySelector("#feedback-count").textContent = state.feedback.length;
  document.querySelector("#resource-count").textContent = state.resources.length;

  renderProfile();
  renderPlanCatalog();
  renderGateDaSummary();
  renderGateDaWorkspace();
  renderGateDaSections();
  renderEnrollments();
  renderSubjects();
  renderSchedule();
  renderTests();
  renderList("feedback-list", state.feedback, "feedback");
  renderList("resources-list", state.resources, "resource");
  renderUpcoming();
  renderActivity();
  renderPlans();
  renderCourseLinks();
  renderWeekOptions();
  normalizeTaskStatuses();
  renderTaskList();
  renderCurrentTasks();
}

function renderSubjects() {
  const container = document.querySelector("#subjects-list");
  if (!state.subjects.length) {
    container.innerHTML = '<div class="empty">No subjects are available for this plan yet.</div>';
    return;
  }

  const selectedSubject = state.subjects.find((subject) => subject.id === selectedSubjectId);
  if (selectedSubject) {
    container.innerHTML = subjectReaderTemplate(selectedSubject);
    container.querySelector("[data-subject-back]")?.addEventListener("click", () => {
      selectedSubjectId = null;
      selectedSectionId = null;
      renderSubjects();
    });
    container.querySelector("[data-chapter-back]")?.addEventListener("click", () => {
      selectedSectionId = null;
      renderSubjects();
    });
    container.querySelectorAll("[data-open-section]").forEach((button) => {
      button.addEventListener("click", () => {
        selectedSectionId = button.dataset.openSection;
        renderSubjects();
      });
    });
    container.querySelector("[data-open-section-quiz]")?.addEventListener("click", (event) => {
      activeTestId = event.currentTarget.dataset.openSectionQuiz;
      showView("tests");
      renderTests();
    });
    return;
  }

  container.innerHTML = `
    <div class="subject-menu">
      ${state.subjects.map(subjectMenuCardTemplate).join("")}
    </div>
  `;

  container.querySelectorAll("[data-open-subject]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedSubjectId = button.dataset.openSubject;
      selectedSectionId = null;
      renderSubjects();
    });
  });
}

function renderTests() {
  const container = document.querySelector("#tests-list");
  if (!state.tests.length) {
    container.innerHTML = '<div class="empty">No test items yet.</div>';
    return;
  }

  container.innerHTML = `
    ${state.tests.map(testTemplate).join("")}
    ${activeTestId ? activeQuizTemplate(activeTestId) : ""}
  `;

  container.querySelectorAll("[data-start-test]").forEach((button) => {
    button.addEventListener("click", () => {
      activeTestId = button.dataset.startTest;
      renderTests();
    });
  });

  container.querySelectorAll("[data-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      const item = state.tests.find((entry) => entry.id === button.dataset.edit);
      openForm("test", item);
    });
  });

  container.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = state.tests.findIndex((entry) => entry.id === button.dataset.delete);
      state.tests.splice(index, 1);
      persist();
      render();
    });
  });

  container.querySelector("[data-quiz-form]")?.addEventListener("submit", submitQuizAttempt);
}

function testTemplate(test) {
  const attempts = state.quizAttempts.filter((attempt) => attempt.testId === test.id);
  const latestAttempt = attempts[attempts.length - 1];
  const quizAction = test.quizId
    ? `<button class="primary-btn" data-start-test="${test.id}" type="button">${latestAttempt ? "Retake objective quiz" : "Start objective quiz"}</button>`
    : "";
  const attemptSummary = latestAttempt
    ? `<p class="muted">Latest logged score: ${latestAttempt.score}/${latestAttempt.total} (${latestAttempt.percent}%). ${escapeHtml(latestAttempt.feedback.summary)}</p>`
    : test.quizId ? '<p class="muted">No attempt logged yet.</p>' : "";

  return `
    <article class="item">
      <div class="item-top">
        <div>
          <h4>${escapeHtml(test.title)}</h4>
          <p>${escapeHtml(test.details || "No details added.")}</p>
          ${attemptSummary}
        </div>
        <span class="tag">${test.date ? formatDate(test.date) : "No date"}</span>
      </div>
      <div class="item-actions">
        ${quizAction}
        <button class="small-btn" data-edit="${test.id}" type="button">Edit</button>
        <button class="small-btn" data-delete="${test.id}" type="button">Delete</button>
      </div>
    </article>
  `;
}

function activeQuizTemplate(testId) {
  const test = state.tests.find((entry) => entry.id === testId);
  const section = state.gateDaSections.find((entry) => entry.id === test?.sectionId);
  const quiz = section?.reviewQuiz;
  if (!test || !quiz) return "";

  return `
    <form class="quiz-form" data-quiz-form data-test-id="${test.id}">
      <div class="quiz-header">
        <div>
          <p class="eyebrow">Objective review</p>
          <h4>${escapeHtml(quiz.title)}</h4>
          <p>${escapeHtml(quiz.instructions)}</p>
        </div>
        <span class="tag">${quiz.questions.length} questions</span>
      </div>
      ${quiz.questions.map((question, index) => quizQuestionTemplate(question, index)).join("")}
      <div class="quiz-actions">
        <button class="primary-btn" type="submit">Submit and log attempt</button>
      </div>
    </form>
  `;
}

function quizQuestionTemplate(question, index) {
  return `
    <fieldset class="quiz-question">
      <legend>
        <span>Question ${index + 1}</span>
        ${escapeHtml(question.prompt)}
      </legend>
      <p>${escapeHtml(question.kind)} - ${question.tags.map(escapeHtml).join(", ")}</p>
      <div class="quiz-options">
        ${question.options.map((option) => `
          <label>
            <input type="radio" name="${question.id}" value="${option.id}" required>
            <span>${escapeHtml(option.text)}</span>
          </label>
        `).join("")}
      </div>
    </fieldset>
  `;
}

function subjectMenuCardTemplate(subject) {
  const chapterCount = (subject.sectionIds || []).length;
  return `
    <article class="subject-menu-card">
      <div>
        <h4>${escapeHtml(subject.title)}</h4>
        <p>${escapeHtml(subject.details || "No subject details added.")}</p>
      </div>
      <div class="subject-menu-footer">
        <span class="tag">${chapterCount} chapter${chapterCount === 1 ? "" : "s"}</span>
        <button class="primary-btn" data-open-subject="${subject.id}" type="button">Open subject</button>
      </div>
    </article>
  `;
}

function subjectReaderTemplate(subject) {
  const sections = (subject.sectionIds || [])
    .map((sectionId) => state.gateDaSections.find((section) => section.id === sectionId))
    .filter(Boolean);
  const selectedSection = sections.find((section) => section.id === selectedSectionId);

  return `
    <article class="subject-reader">
      <div class="subject-reader-header">
        <button class="text-btn" data-subject-back type="button">Back to subjects</button>
        ${selectedSection ? '<button class="text-btn" data-chapter-back type="button">Back to chapters</button>' : ""}
      </div>
      ${selectedSection ? sectionTemplate(selectedSection) : chapterMenuTemplate(subject, sections)}
    </article>
  `;
}

function chapterMenuTemplate(subject, sections) {
  if (!sections.length) return '<div class="empty small-empty">No chapters added yet.</div>';
  return `
    <section class="chapter-menu">
      <div class="chapter-menu-header">
        <p class="eyebrow">${escapeHtml(subject.title)} textbook</p>
        <h4>Chapters</h4>
        <p>${escapeHtml(subject.details || "Choose a chapter to begin.")}</p>
      </div>
      <div class="chapter-card-list">
        ${sections.map(chapterCardTemplate).join("")}
      </div>
    </section>
  `;
}

function chapterCardTemplate(section) {
  const test = state.tests.find((entry) => entry.sectionId === section.id);
  const attempts = state.quizAttempts.filter((attempt) => attempt.testId === test?.id);
  const latestAttempt = attempts[attempts.length - 1];
  return `
    <article class="chapter-card">
      <div>
        <p class="eyebrow">${escapeHtml(section.chapter)}</p>
        <h5>${escapeHtml(section.title)}</h5>
        <p>${escapeHtml(section.summary)}</p>
      </div>
      <div class="chapter-card-meta">
        <span>${section.practiceProblems.length ? `${section.practiceProblems.length} practice` : "Practice pending"}</span>
        <span>${section.reviewQuiz ? `${section.reviewQuiz.questions.length} quiz questions` : "Quiz pending"}</span>
        <span>${latestAttempt ? `Latest quiz ${latestAttempt.percent}%` : section.reviewQuiz ? "No quiz attempt" : "In progress"}</span>
      </div>
      <button class="primary-btn" data-open-section="${section.id}" type="button">Open chapter</button>
    </article>
  `;
}

function renderPlanCatalog() {
  const container = document.querySelector("#account-type-list");
  container.innerHTML = state.accountTypes.map((accountType) => `
    <article class="catalog-card">
      <div class="catalog-card-header">
        <h4>${escapeHtml(accountType.title)}</h4>
        <span class="tag">${escapeHtml(accountType.status)}</span>
      </div>
      <p>${escapeHtml(accountType.description)}</p>
      <div class="variant-list">
        ${accountType.variants.map((variant) => `<span>${escapeHtml(variant)}</span>`).join("")}
      </div>
    </article>
  `).join("");
}

function renderGateDaSummary() {
  const container = document.querySelector("#gate-da-summary-list");
  if (!state.gateDaSections?.length) {
    container.innerHTML = '<div class="empty">No GATE DA material seeded yet.</div>';
    return;
  }

  container.innerHTML = state.gateDaSections.slice(0, 3).map((section) => `
    <article class="item">
      <div class="item-top">
        <div>
          <h4>${escapeHtml(section.title)}</h4>
          <p>${escapeHtml(section.summary)}</p>
        </div>
        <span class="tag">${section.practiceProblems.length} practice</span>
      </div>
    </article>
  `).join("");
}

function renderGateDaWorkspace() {
  const container = document.querySelector("#gate-da-workspace-list");
  if (!container) return;

  if (state.user.name === "basic" || state.user.name === "gate-basic") {
    container.innerHTML = `
      <article class="item workspace-summary">
        <div class="item-top">
          <div>
            <h4>GATE DA Basic Demo Workspace</h4>
            <p>Basic account preview for the GATE DA material currently under development. Use this account to inspect Subjects -> Probability -> Chapter 1.</p>
          </div>
          <span class="tag">Basic</span>
        </div>
        <div class="workspace-counts">
          <span>${state.gateDaSections.length} chapter</span>
          <span>${state.gateDaSections[0]?.practiceProblems.length || 0} practice problems</span>
          <span>conceptual review</span>
          <span>worked solutions</span>
        </div>
      </article>
    `;
    return;
  }

  const platinumEnrollment = state.enrollments.find((enrollment) => {
    const accountTypeId = enrollment.accountTypeId || enrollment.productId;
    return accountTypeId === "gate-da-platinum";
  });
  const lessonPlan = state.lessonPlans.find((entry) => entry.id === platinumEnrollment?.lessonPlanId);

  container.innerHTML = `
    <article class="item workspace-summary">
      <div class="item-top">
        <div>
          <h4>GATE DA Platinum Learner Workspace</h4>
          <p>${escapeHtml(lessonPlan?.details || "Personalized GATE DA Platinum learner workspace.")}</p>
        </div>
        <span class="tag">${escapeHtml(platinumEnrollment?.paymentStatus || "active")}</span>
      </div>
      <div class="workspace-counts">
        <span>${state.subjects.length} subjects</span>
        <span>${state.tasks.length} tasks</span>
        <span>${state.schedule.length} schedule items</span>
        <span>${state.tests.length} tests</span>
        <span>${state.feedback.length} feedback notes</span>
        <span>${state.resources.length} resources</span>
      </div>
    </article>
  `;
}

function renderGateDaSections() {
  const container = document.querySelector("#gate-da-section-list");
  if (!state.gateDaSections?.length) {
    container.innerHTML = '<div class="empty">No GATE DA sections are available yet.</div>';
    return;
  }

  container.innerHTML = state.gateDaSections.map(sectionTemplate).join("");
}

function sectionTemplate(section) {
  return `
    <article class="book-reader">
      <header class="book-header">
        <p class="eyebrow">${escapeHtml(section.subject)} textbook</p>
        <h4>${escapeHtml(section.chapter)}. ${escapeHtml(section.title)}</h4>
        <p>${escapeHtml(section.summary)}</p>
        <div class="book-meta">
          <span>${escapeHtml(section.accountTier)}</span>
          <span>${section.practiceProblems.length} practice problems</span>
          <span>${section.reviewQuiz ? "Objective quiz included" : "Partial chapter"}</span>
        </div>
      </header>

      <div class="book-page">
        <nav class="book-contents" aria-label="Chapter contents">
          <p>Contents</p>
          <div>
            <a href="#${section.id}-preview">Preview</a>
            ${(section.bookSections || []).map((bookSection) => `
              <a href="#${section.id}-${bookSection.number.replace(".", "-")}">${escapeHtml(bookSection.number)}</a>
            `).join("")}
            ${section.readingQuestions?.length ? `<a href="#${section.id}-reading">Reading</a>` : ""}
            ${section.practiceProblems?.length ? `<a href="#${section.id}-practice">Practice</a>` : ""}
            ${section.reviewPrompts?.length ? `<a href="#${section.id}-review">Review</a>` : ""}
            ${section.reviewQuiz ? `<a href="#${section.id}-quiz">Quiz</a>` : ""}
            <a href="#${section.id}-summary">Summary</a>
          </div>
        </nav>

          <section class="book-section book-intro" id="${section.id}-preview">
            <p class="book-kicker">Section Preview</p>
            ${paragraphListTemplate(section.chapterIntro || [section.sectionPreview])}
            <div class="math-callout preview">
              <strong>Preview Activity</strong>
              <p>${escapeHtml(section.previewActivity)}</p>
            </div>
          </section>

          ${(section.bookSections || []).map((bookSection) => bookSectionTemplate(section, bookSection)).join("")}

          <section class="book-section" id="${section.id}-concepts">
            <p class="book-kicker">Core Ideas</p>
            <div class="concept-strip">
              ${section.concepts.map((concept) => `
                <article>
                  <strong>${escapeHtml(concept.name)}</strong>
                  <p>${escapeHtml(concept.description)}</p>
                  <span>${escapeHtml(concept.cue)}</span>
                </article>
              `).join("")}
            </div>
          </section>

          <section class="book-section" id="${section.id}-techniques">
            <p class="book-kicker">Problem-Solving Techniques</p>
            <div class="technique-list book-techniques">
              ${section.techniques.map((technique) => `
                <article>
                  <strong>${escapeHtml(technique.name)}</strong>
                  <p><b>Use when:</b> ${escapeHtml(technique.when)}</p>
                  <p><b>Move:</b> ${escapeHtml(technique.move)}</p>
                </article>
              `).join("")}
            </div>
          </section>

          ${section.readingQuestions?.length ? `<section class="book-section" id="${section.id}-reading">
            <p class="book-kicker">Reading Questions</p>
            <ol class="review-list">
              ${section.readingQuestions.map((question) => `<li>${escapeHtml(question)}</li>`).join("")}
            </ol>
          </section>` : ""}

          ${section.practiceProblems?.length ? `<section class="book-section" id="${section.id}-practice">
            <p class="book-kicker">Labelled Practice Problems</p>
            <div class="problem-list book-problems">
              ${section.practiceProblems.map(practiceProblemTemplate).join("")}
            </div>
          </section>` : ""}

          ${section.reviewPrompts?.length ? `<section class="book-section" id="${section.id}-review">
            <p class="book-kicker">Review Problems: No Solutions</p>
            <p class="muted">Do these after finishing the chapter and practice set. These are meant to expose conceptual weaknesses before the objective quiz.</p>
            <ol class="review-list">
              ${section.reviewPrompts.map((prompt) => `<li>${escapeHtml(prompt)}</li>`).join("")}
            </ol>
          </section>` : ""}

          ${section.reviewQuiz ? `<section class="book-section" id="${section.id}-quiz">
            <p class="book-kicker">Objective Review Quiz</p>
            <p class="muted">${escapeHtml(section.reviewQuiz.instructions)}</p>
            <ul class="summary-list">
              <li>Single-concept questions check each key concept in this chapter.</li>
              <li>Mixed questions combine two or three concepts so feedback can identify where reasoning breaks.</li>
              <li>Attempts are logged in Tests with concept-level feedback in the learner record.</li>
            </ul>
            <div class="book-action-row">
              <button class="primary-btn" data-open-section-quiz="${escapeHtml(sectionTestId(section.id))}" type="button">Open review quiz</button>
            </div>
          </section>` : ""}

          <section class="book-section" id="${section.id}-summary">
            <p class="book-kicker">Chapter Summary</p>
            <ul class="summary-list">
              ${section.chapterSummary.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
            </ul>
          </section>
      </div>
    </article>
  `;
}

function sectionTestId(sectionId) {
  return state.tests.find((test) => test.sectionId === sectionId)?.id || "";
}

function paragraphListTemplate(paragraphs) {
  return paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("");
}

function bookSectionTemplate(chapter, bookSection) {
  return `
    <section class="book-section" id="${chapter.id}-${bookSection.number.replace(".", "-")}">
      <h5>${escapeHtml(bookSection.number)} ${escapeHtml(bookSection.title)}</h5>
      ${paragraphListTemplate(bookSection.paragraphs)}
      ${(bookSection.blocks || []).map(bookBlockTemplate).join("")}
    </section>
  `;
}

function bookBlockTemplate(block) {
  return `
    <div class="math-callout ${escapeHtml(block.type)}">
      <strong>${escapeHtml(block.title)}</strong>
      <p>${escapeHtml(block.body)}</p>
    </div>
  `;
}

function practiceProblemTemplate(problem) {
  return `
    <article class="practice-problem">
      <div class="problem-heading">
        <div>
          <strong>${escapeHtml(problem.label)}</strong>
          <p>${escapeHtml(problem.technique)} - ${escapeHtml(problem.difficulty)}</p>
        </div>
        <span class="tag">${escapeHtml(problem.concept)}</span>
      </div>
      <p>${escapeHtml(problem.prompt)}</p>
      <details>
        <summary>Show solution</summary>
        <p>${escapeHtml(problem.solution)}</p>
      </details>
    </article>
  `;
}

function renderEnrollments() {
  const container = document.querySelector("#enrollment-list");
  if (!state.enrollments.length) {
    container.innerHTML = '<div class="empty">No active enrollments yet.</div>';
    return;
  }

  container.innerHTML = state.enrollments.map((enrollment) => {
    const accountTypeId = enrollment.accountTypeId || enrollment.productId;
    const accountType = state.accountTypes.find((entry) => entry.id === accountTypeId);
    const lessonPlan = state.lessonPlans.find((entry) => entry.id === enrollment.lessonPlanId);
    return `
      <article class="item">
        <div class="item-top">
          <div>
            <h4>${escapeHtml(accountType?.title || "Account")}</h4>
            <p>${escapeHtml(enrollment.planVariant)} - ${escapeHtml(lessonPlan?.details || "No lesson plan attached.")}</p>
          </div>
          <span class="tag">${escapeHtml(enrollment.paymentStatus)}</span>
        </div>
      </article>
    `;
  }).join("");
}

function renderList(containerId, items, type) {
  const container = document.querySelector(`#${containerId}`);
  if (!items.length) {
    container.innerHTML = `<div class="empty">No ${typeLabels[type]} items yet.</div>`;
    return;
  }

  container.innerHTML = items
    .map((item) => itemTemplate(item, type))
    .join("");

  container.querySelectorAll("[data-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      const item = items.find((entry) => entry.id === button.dataset.edit);
      openForm(type, item);
    });
  });

  container.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = items.findIndex((entry) => entry.id === button.dataset.delete);
      items.splice(index, 1);
      persist();
      render();
    });
  });
}

function renderSchedule() {
  const container = document.querySelector("#schedule-list");
  const items = [...state.schedule].sort((a, b) => {
    const weekCompare = (a.week || weekFromDate(a.date)) - (b.week || weekFromDate(b.date));
    if (weekCompare !== 0) return weekCompare;
    return (a.date || "").localeCompare(b.date || "");
  });

  if (!items.length) {
    container.innerHTML = '<div class="empty">No scheduled sessions yet.</div>';
    return;
  }

  const weeks = [...new Set(items.map((item) => item.week || weekFromDate(item.date)))].sort((a, b) => a - b);
  container.innerHTML = weeks.map((week) => weekScheduleTemplate(week, items.filter((item) => (item.week || weekFromDate(item.date)) === week))).join("");
}

function weekScheduleTemplate(week, items) {
  const monday = addDays("2026-06-01", (week - 1) * 7);
  const sunday = addDays(monday, 6);
  const subjects = [...new Set(items.map((item) => item.subject || subjectFromTitle(item.title)))];
  return `
    <section class="week-schedule">
      <div class="week-schedule-header">
        <div>
          <h4>Week ${week}</h4>
          <p>${formatDate(monday)} - ${formatDate(sunday)}</p>
        </div>
        <span class="tag">${items.length} items</span>
      </div>
      <div class="subject-schedule-grid">
        ${subjects.map((subject) => subjectScheduleTemplate(subject, items.filter((item) => (item.subject || subjectFromTitle(item.title)) === subject))).join("")}
      </div>
    </section>
  `;
}

function subjectScheduleTemplate(subject, items) {
  return `
    <section class="subject-schedule">
      <h5>${escapeHtml(subject)}</h5>
      <div class="list">
        ${items.map((item) => `
          <article class="schedule-row">
            <div>
              <strong>${escapeHtml(item.kind || kindFromTitle(item.title))}</strong>
              <p>${escapeHtml(item.details || "No details added.")}</p>
            </div>
            <span class="tag">${formatDate(item.date)}</span>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function subjectFromTitle(title) {
  if (title.includes("Data Structures")) return "Data Structures and Algorithms";
  if (title.includes("Discrete Math")) return "Discrete Math";
  return "General";
}

function kindFromTitle(title) {
  if (title.includes("spaced")) return "Spaced review";
  if (title.includes("review")) return "Review";
  return "Milestone";
}

function itemTemplate(item, type) {
  const date = item.date ? formatDate(item.date) : type === "subject" ? "No target date" : "No date";
  const tag = type === "subject" ? escapeHtml(item.status || "Not started") : date;
  const meta = type === "subject" && item.date ? `<p>Target date: ${date}</p>` : "";
  const link = type === "resource" && item.link
    ? `<a href="${escapeHtml(item.link)}" target="_blank" rel="noreferrer">Open resource</a>`
    : "";

  return `
    <article class="item">
      <div class="item-top">
        <div>
          <h4>${escapeHtml(item.title)}</h4>
          <p>${escapeHtml(item.details || "No details added.")}</p>
          ${meta}
        </div>
        <span class="tag">${tag}</span>
      </div>
      ${link}
      <div class="item-actions">
        <button class="small-btn" data-edit="${item.id}" type="button">Edit</button>
        <button class="small-btn" data-delete="${item.id}" type="button">Delete</button>
      </div>
    </article>
  `;
}

function renderProfile() {
  document.querySelector("#user-email").value = state.user.email || "";
  const passwordRow = state.user.mustChangePassword
    ? `<div><dt>Temp password</dt><dd><code>${escapeHtml(state.user.tempPassword)}</code></dd></div>`
    : "";
  document.querySelector("#profile-card").innerHTML = `
    <dl>
      <div><dt>Name</dt><dd>${escapeHtml(state.user.name)}</dd></div>
      <div><dt>Email</dt><dd>${escapeHtml(state.user.email || "Not set")}</dd></div>
      ${passwordRow}
      <div><dt>Status</dt><dd>${escapeHtml(state.user.passwordStatus)}</dd></div>
    </dl>
    <p class="fine-print">This prototype stores profile data locally in this browser. Use a real authentication backend before sharing sensitive learner data publicly.</p>
  `;
}

function saveUserEmail(event) {
  event.preventDefault();
  state.user.email = document.querySelector("#user-email").value.trim();
  persist();
  renderProfile();
}

async function sendCredentialEmail() {
  const email = state.user.email || document.querySelector("#user-email").value.trim();
  const status = document.querySelector("#email-status");
  if (!email) {
    alert("Add an email address first.");
    return;
  }

  state.user.email = email;
  persist();
  renderProfile();

  status.textContent = "Sending login email...";

  try {
    const result = await fetch("/api/send-credentials", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        name: state.user.name,
        username: state.user.name,
        temporaryPassword: state.user.password || state.user.tempPassword,
        appUrl: window.location.origin
      })
    });

    if (result.ok) {
      status.textContent = `Login email sent to ${email}.`;
      return;
    }

    const payload = await result.json().catch(() => ({}));
    status.textContent = payload.error || "Email API is not available. Opening a mail draft instead.";
    draftCredentialEmail(email);
  } catch {
    status.textContent = "Email API is not available locally. Opening a mail draft instead.";
    draftCredentialEmail(email);
  }
}

function draftCredentialEmail(email) {
  const subject = "Your Aleph learning workspace login";
  const body = [
    `Hi ${state.user.name},`,
    "",
    "Your Aleph learning workspace is ready.",
    "",
    "Sign in with:",
    `Username: ${state.user.name}`,
    `Temporary password: ${state.user.password || state.user.tempPassword}`,
    "",
    "Please keep these credentials private.",
    "",
    "Aleph"
  ].join("\n");

  window.location.href = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function renderPlans() {
  const container = document.querySelector("#plan-list");
  if (!state.subjects.length) {
    container.innerHTML = '<div class="empty">No subjects have learning plans yet.</div>';
    return;
  }
  container.innerHTML = state.subjects
    .slice(0, 4)
    .map((subject) => `
      <article class="item">
        <div class="item-top">
          <div>
            <h4>${escapeHtml(subject.title)}</h4>
            <p>${escapeHtml(subject.details || "No learning plan added.")}</p>
          </div>
          <span class="tag">${escapeHtml(subject.status || "Not started")}</span>
        </div>
      </article>
    `)
    .join("");
}

function renderCourseLinks() {
  const container = document.querySelector("#course-links-list");
  const links = state.resources.filter((resource) => resource.link);
  if (!links.length) {
    container.innerHTML = '<div class="empty">No course links added yet.</div>';
    return;
  }
  container.innerHTML = links
    .map((resource) => `
      <article class="item">
        <div class="item-top">
          <div>
            <h4>${escapeHtml(resource.title)}</h4>
            <p>${escapeHtml(resource.details || "Course resource.")}</p>
          </div>
          <span class="tag">Course page</span>
        </div>
        <a href="${escapeHtml(resource.link)}" target="_blank" rel="noreferrer">Open course page</a>
      </article>
    `)
    .join("");
}

function renderWeekOptions() {
  const select = document.querySelector("#week-select");
  const selected = select.value || "1";
  const weeks = [...new Set(state.tasks.map((task) => task.week))].sort((a, b) => a - b);
  select.innerHTML = weeks
    .map((week) => `<option value="${week}">Week ${week}</option>`)
    .join("");
  select.value = weeks.includes(Number(selected)) ? selected : String(weeks[0] || 1);
}

function renderTaskList() {
  const board = document.querySelector("#task-list-board");
  const selectedWeek = Number(document.querySelector("#week-select").value || 1);
  const groups = [
    ["todo", "To do"],
    ["completed", "Completed"],
    ["not-completed", "Not completed"]
  ];
  const weekTasks = state.tasks.filter((task) => task.week === selectedWeek);

  if (!weekTasks.length) {
    board.innerHTML = '<div class="empty">No tasks for this week.</div>';
    return;
  }

  board.innerHTML = groups
    .map(([status, label]) => {
      const tasks = weekTasks.filter((task) => task.status === status);
      return `
        <section class="task-group" data-drop-status="${status}">
          <div class="task-group-header">
            <h4>${label}</h4>
            <span>${tasks.length}</span>
          </div>
          <div class="checklist">
            ${tasks.length ? tasks.map(taskRowTemplate).join("") : '<div class="empty small-empty">No tasks</div>'}
          </div>
        </section>
      `;
    })
    .join("");

  board.querySelectorAll("[data-task-done]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => setTaskDone(checkbox.dataset.taskDone, checkbox.checked));
  });

  board.querySelectorAll("[data-task-incomplete]").forEach((button) => {
    button.addEventListener("click", () => setTaskStatus(button.dataset.taskIncomplete, "not-completed"));
  });

  board.querySelectorAll("[data-task-reset]").forEach((button) => {
    button.addEventListener("click", () => setTaskStatus(button.dataset.taskReset, "todo"));
  });

  board.querySelectorAll("[data-task-complete]").forEach((button) => {
    button.addEventListener("click", () => setTaskStatus(button.dataset.taskComplete, "completed"));
  });

  board.querySelectorAll("[data-task-id]").forEach((tile) => {
    tile.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/plain", tile.dataset.taskId);
    });
  });

  board.querySelectorAll("[data-drop-status]").forEach((column) => {
    column.addEventListener("dragover", (event) => event.preventDefault());
    column.addEventListener("drop", (event) => {
      event.preventDefault();
      setTaskStatus(event.dataTransfer.getData("text/plain"), column.dataset.dropStatus);
    });
  });
}

function renderCurrentTasks() {
  const container = document.querySelector("#current-task-list");
  const week = currentWeekNumber();
  const tasks = state.tasks
    .filter((task) => task.week === week)
    .slice(0, 6);

  if (!tasks.length) {
    container.innerHTML = '<div class="empty">No current-week tasks yet.</div>';
    return;
  }

  container.innerHTML = tasks.map(taskSummaryTemplate).join("");
}

function taskRowTemplate(task) {
  const checked = task.done ? "checked" : "";
  const completeButton = task.status === "completed"
    ? ""
    : `<button class="small-btn" data-task-complete="${task.id}" type="button">Move to completed</button>`;
  const incompleteButton = task.status === "not-completed"
    ? `<button class="small-btn" data-task-reset="${task.id}" type="button">Move to to do</button>`
    : `<button class="small-btn" data-task-incomplete="${task.id}" type="button">Not completed</button>`;
  return `
    <article class="task-row task-tile" draggable="true" data-task-id="${task.id}">
      <label class="task-check">
        <input type="checkbox" data-task-done="${task.id}" ${checked}>
        <span>
          <strong>${escapeHtml(task.title)}</strong>
          <small>${escapeHtml(task.type)} - ${formatDate(task.date)}</small>
        </span>
      </label>
      <p>${escapeHtml(task.details)}</p>
      <div class="task-row-actions">
        <span class="tag">${escapeHtml(statusLabel(task.status))}</span>
        ${completeButton}
        ${incompleteButton}
      </div>
    </article>
  `;
}

function taskSummaryTemplate(task) {
  return `
    <article class="item">
      <div class="item-top">
        <div>
          <h4>${escapeHtml(task.title)}</h4>
          <p>${escapeHtml(task.type)} - ${escapeHtml(statusLabel(task.status))}</p>
        </div>
        <span class="tag">${formatDate(task.date)}</span>
      </div>
    </article>
  `;
}

function setTaskStatus(id, status) {
  const task = state.tasks.find((entry) => entry.id === id);
  if (!task) return;
  if (status === "completed" && !task.done) {
    alert("Check Done before moving this task to Completed.");
    return;
  }
  task.status = status;
  task.updatedAt = new Date().toISOString();
  persist();
  render();
}

function setTaskDone(id, done) {
  const task = state.tasks.find((entry) => entry.id === id);
  if (!task) return;
  task.done = done;
  if (!done && task.status === "completed") task.status = "todo";
  task.updatedAt = new Date().toISOString();
  persist();
  render();
}

function normalizeTaskStatuses() {
  state.tasks.forEach((task) => {
    if (task.status === "done") task.status = "completed";
    if (task.status === "doing") task.status = "todo";
    if (!["todo", "completed", "not-completed"].includes(task.status)) task.status = "todo";
    if (typeof task.done !== "boolean") task.done = task.status === "completed";
  });
}

function statusLabel(status) {
  if (status === "todo") return "To do";
  if (status === "completed") return "Completed";
  return "Not completed";
}

function currentWeekNumber() {
  const today = new Date();
  const start = new Date("2026-06-01T00:00:00");
  const diff = Math.floor((today - start) / 604800000) + 1;
  return Math.min(Math.max(diff, 1), 13);
}

function renderUpcoming() {
  const upcoming = state.schedule
    .filter((item) => item.date)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);
  renderList("upcoming-list", upcoming, "schedule");
}

function renderActivity() {
  const activity = [...state.feedback, ...state.tests, ...state.resources]
    .sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""))
    .slice(0, 5);
  const container = document.querySelector("#activity-list");
  if (!activity.length) {
    container.innerHTML = '<div class="empty">No recent activity yet.</div>';
    return;
  }
  container.innerHTML = activity
    .map((item) => `
      <article class="item">
        <div class="item-top">
          <div>
            <h4>${escapeHtml(item.title)}</h4>
            <p>${escapeHtml(item.details || "No details added.")}</p>
          </div>
          <span class="tag">${item.date ? formatDate(item.date) : "Updated"}</span>
        </div>
      </article>
    `)
    .join("");
}

function loadSampleData() {
  const user = state.user || defaultUser();
  Object.assign(state, buildCoursePlan());
  state.user = user;
  persist();
  render();
}

function resetPlanData() {
  Object.assign(state, buildCoursePlan(), {
    user: state.user || defaultUser()
  });
  persist();
  render();
}

function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `learning-studio-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      state.user = imported.user || defaultUser();
      state.subjects = imported.subjects || [];
      state.schedule = imported.schedule || [];
      state.tests = imported.tests || [];
      state.quizAttempts = imported.quizAttempts || [];
      state.feedback = imported.feedback || [];
      state.resources = imported.resources || [];
      state.tasks = imported.tasks || [];
      state.accountTypes = imported.accountTypes || imported.products || accountTypeCatalog();
      state.enrollments = imported.enrollments || [];
      state.lessonPlans = imported.lessonPlans || [];
      state.gateDaSections = imported.gateDaSections || gateDaProbabilitySections();
      state.coursePlanVersion = imported.coursePlanVersion || "";
      persist();
      render();
    } catch {
      alert("That file could not be imported.");
    }
  };
  reader.readAsText(file);
  event.target.value = "";
}

function updateInstallState() {
  const button = document.querySelector("#install-btn");
  const status = document.querySelector("#install-status");
  button.disabled = !deferredInstallPrompt;
  status.textContent = deferredInstallPrompt
    ? "This browser is ready to install the app."
    : "Installation appears when the browser supports it.";
}

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${value}T00:00:00`));
}

function todayOffset(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
