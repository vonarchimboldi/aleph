const STORAGE_KEY = "learning-studio-data-v1";
const SESSION_KEY = "aleph-session";
const COURSE_PLAN_VERSION = "gate-da-basic-test-account-v1";

const state = loadState();
let deferredInstallPrompt = null;
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
  const lessonPlans = [
    {
      id: "lesson-platinum-demo",
      userId: "user-platinum-demo",
      title: "GATE DA Platinum learner plan",
      type: "personalized",
      subjects: ["Discrete Mathematics", "Data Structures and Algorithms", "Probability and Statistics"],
      startDate: "2026-06-01",
      endDate: "2026-08-30",
      status: "active",
      details: "Personalized June-August Platinum plan for the GATE DA exam. The learner workspace, subjects, tasks, schedules, tests, feedback, and resources live inside this GATE DA plan.",
      updatedAt: now
    }
  ];
  const enrollments = [
    {
      id: "enrollment-platinum-demo",
      userId: "user-platinum-demo",
      accountTypeId: "gate-da-platinum",
      planVariant: "Platinum",
      paymentStatus: "active",
      lessonPlanId: "lesson-platinum-demo",
      status: "active",
      updatedAt: now
    }
  ];
  const subjects = [
    {
      id: crypto.randomUUID(),
      title: "Discrete Mathematics",
      date: "2026-08-30",
      status: "Not started",
      details: "Learning plan: integrate CMU 21-228, MIT 6.1200J, and MIT 18.200 over 13 weeks. Each week has coursework milestones, one combined Sunday review quiz, and every other Sunday a cumulative spaced-review quiz.",
      updatedAt: now
    },
    {
      id: crypto.randomUUID(),
      title: "Data Structures and Algorithms",
      date: "2026-08-30",
      status: "Not started",
      details: "Learning plan: complexity analysis, arrays, linked lists, stacks, queues, hashing, trees, heaps, graphs, sorting, searching, dynamic programming basics, and implementation practice.",
      updatedAt: now
    },
    {
      id: crypto.randomUUID(),
      title: "Probability and Statistics",
      date: "2026-08-30",
      status: "Not started",
      details: "GATE DA Probability and Statistics. Basic content is being developed one section at a time; the enrolled learner plan is Platinum and can include custom pacing, feedback, and additional review.",
      updatedAt: now
    }
  ];

  const plans = [
    {
      key: "DM",
      label: "Discrete Math",
      resources: "CMU 21-228, MIT 6.1200J Math for CS, and MIT 18.200",
      milestones: discreteMathMilestones()
    },
    {
      key: "DSA",
      label: "Data Structures and Algorithms",
      resources: "Aho/Ullman Foundations of Computer Science and Cartesian",
      milestones: dsaMilestones()
    },
    {
      key: "PS",
      label: "Probability and Statistics",
      resources: "GATE DA Basic Probability sections and themed practice sets",
      milestones: probabilityStatsMilestones(),
      dailyProblemSets: true
    }
  ];

  const schedule = [];
  const tests = [];
  const tasks = [];
  const feedback = [];
  plans.forEach((plan) => {
    plan.milestones.forEach((milestone, index) => {
      const week = index + 1;
      const monday = addDays("2026-06-01", index * 7);
      const sunday = addDays(monday, 6);
      const spaced = spacedReviewDetails(week, plan.milestones, plan.label);
      const weekWindow = `${formatShortDate(monday)}-${formatShortDate(sunday)}`;

      if (plan.dailyProblemSets) {
        schedule.push({
          id: crypto.randomUUID(),
          title: `Week ${week}: ${plan.label} pattern cycle`,
          week,
          subject: plan.label,
          kind: "Milestone",
          date: monday,
          details: milestoneDetails(milestone),
          updatedAt: now
        });

        milestone.problemDays.forEach((dayPlan, dayIndex) => {
          const date = addDays(monday, dayIndex);
          const details = probabilityProblemSetDetails(dayPlan, week);

          schedule.push({
            id: crypto.randomUUID(),
            title: `Week ${week} ${dayPlan.day}: ${dayPlan.topic} problem set`,
            week,
            subject: plan.label,
            kind: "Problem set",
            date,
            details,
            updatedAt: now
          });

          tasks.push({
            id: crypto.randomUUID(),
            week,
            title: `${plan.key} W${week} ${dayPlan.day}: 5-problem ${dayPlan.topic} set`,
            type: "Problem set",
            date,
            status: "todo",
            done: false,
            details,
            updatedAt: now
          });
        });

        if (plan.key === "PS" && week === 1) {
          tasks.push({
            id: crypto.randomUUID(),
            week,
            title: "PS W1: Study Probability Foundations pilot section",
            type: "Section",
            date: monday,
            status: "todo",
            done: false,
            details: "Read the GATE DA Probability Foundations section, solve the labelled practice problems with solutions, and attempt the conceptual review prompts without solutions.",
            updatedAt: now
          });
        }

        schedule.push({
          id: crypto.randomUUID(),
          title: `Week ${week}: ${plan.label} Sunday PSB test`,
          week,
          subject: plan.label,
          kind: "Test",
          date: sunday,
          details: probabilitySundayTestDetails(milestone),
          updatedAt: now
        });

        tasks.push({
          id: crypto.randomUUID(),
          week,
          title: `${plan.key} W${week}: Take Sunday PSB pattern test`,
          type: "Test",
          date: sunday,
          status: "todo",
          done: false,
          details: probabilitySundayTestDetails(milestone),
          updatedAt: now
        });

        tests.push({
          id: crypto.randomUUID(),
          title: `Week ${week}: ${plan.label} Sunday PSB pattern test`,
          date: sunday,
          details: probabilitySundayTestDetails(milestone),
          updatedAt: now
        });

        feedback.push({
          id: crypto.randomUUID(),
          title: `Week ${week}: ${plan.label} default solution feedback`,
          date: sunday,
          details: probabilityDefaultFeedback(milestone),
          updatedAt: now
        });

        return;
      }

      schedule.push(
        {
          id: crypto.randomUUID(),
          title: `Week ${week}: ${plan.label} milestone`,
          week,
          subject: plan.label,
          kind: "Milestone",
          date: monday,
          details: milestoneDetails(milestone),
          updatedAt: now
        },
        {
          id: crypto.randomUUID(),
          title: `Week ${week}: ${plan.label} Sunday combined review`,
          week,
          subject: plan.label,
          kind: "Review",
          date: sunday,
          details: `One quiz covering the week's ${plan.label} material across ${plan.resources}. Focus: ${milestone.focus}.`,
          updatedAt: now
        }
      );

      if (week % 2 === 0) {
        schedule.push({
          id: crypto.randomUUID(),
          title: `Week ${week}: ${plan.label} Sunday cumulative spaced review`,
          week,
          subject: plan.label,
          kind: "Spaced review",
          date: sunday,
          details: spaced,
          updatedAt: now
        });
      }

      tasks.push(
        {
          id: crypto.randomUUID(),
          week,
          title: `${plan.key} W${week}: Watch lectures`,
          type: "Lecture",
          date: monday,
          status: "todo",
          done: false,
          details: milestoneDetails(milestone),
          updatedAt: now
        },
        {
          id: crypto.randomUUID(),
          week,
          title: `${plan.key} W${week}: Complete associated assignment`,
          type: "Assignment",
          date: addDays(monday, 4),
          status: "todo",
          done: false,
          details: `Do the related problem set/homework work for ${plan.label}, ${weekWindow}. Convert missed problems into correction notes before Sunday's quiz.`,
          updatedAt: now
        },
        {
          id: crypto.randomUUID(),
          week,
          title: `${plan.key} W${week}: Take Sunday combined review quiz`,
          type: "Review quiz",
          date: sunday,
          status: "todo",
          done: false,
          details: `One combined ${plan.label} quiz across ${plan.resources}. Focus: ${milestone.focus}.`,
          updatedAt: now
        }
      );

      if (week % 2 === 0) {
        tasks.push({
          id: crypto.randomUUID(),
          week,
          title: `${plan.key} W${week}: Take Sunday cumulative spaced review quiz`,
          type: "Spaced review",
          date: sunday,
          status: "todo",
          done: false,
          details: spaced,
          updatedAt: now
        });
      }

      tests.push(
        {
          id: crypto.randomUUID(),
          title: `Week ${week}: ${plan.label} Sunday combined review quiz`,
          date: sunday,
          details: `Single integrated quiz for ${plan.label}. Include implementation, proof/analysis, and application questions for: ${milestone.focus}.`,
          updatedAt: now
        }
      );

      if (week % 2 === 0) {
        tests.push({
          id: crypto.randomUUID(),
          title: `Week ${week}: ${plan.label} Sunday cumulative spaced review quiz`,
          date: sunday,
          details: spaced,
          updatedAt: now
        });
      }
    });
  });

  return {
    subjects,
    schedule,
    tests,
    tasks,
    accountTypes,
    enrollments,
    lessonPlans,
    gateDaSections: gateDaProbabilitySections(now),
    feedback: [
      {
        id: crypto.randomUUID(),
        title: "Three-subject 13-week plan created",
        date: "2026-06-01",
        details: "13-week plans map Discrete Math, Data Structures and Algorithms, and Probability and Statistics into weekly work. Discrete Math and DSA use weekly coursework with Sunday reviews; Probability and Statistics uses Monday-Saturday 5-problem sets with Sunday PSB-style tests and default solution feedback.",
        updatedAt: now
      }
    ].concat(feedback),
    resources: [
      {
        id: crypto.randomUUID(),
        title: "GATE DA Probability Foundations Pilot Section",
        date: "2026-06-01",
        details: "Section 1 pilot with concept teaching, 24 labelled practice problems with solutions, and conceptual review prompts without solutions.",
        updatedAt: now
      },
      {
        id: crypto.randomUUID(),
        title: "CMU 21-228 Discrete Mathematics - Po-Shen Loh",
        date: "2026-06-01",
        details: "Use the official CMU course page for Loh's Discrete Mathematics syllabus, homework rhythm, exams, and week-by-week topic sequence.",
        link: "https://www.math.cmu.edu/~ploh/2025-228.shtml",
        updatedAt: now
      },
      {
        id: crypto.randomUUID(),
        title: "MIT 6.1200J Mathematics for Computer Science - Spring 2024",
        date: "2026-06-01",
        details: "Use the OCW page for lecture videos, lecture notes, warm-up problems, readings, and problem sets.",
        link: "https://ocw.mit.edu/courses/6-1200j-mathematics-for-computer-science-spring-2024/",
        updatedAt: now
      },
      {
        id: crypto.randomUUID(),
        title: "MIT 18.200 Principles of Discrete Applied Mathematics - Spring 2024",
        date: "2026-06-01",
        details: "Use the OCW page for calendar, lecture videos, lecture notes, assignments, and writing resources.",
        link: "https://ocw.mit.edu/courses/18-200-principles-of-discrete-applied-mathematics-spring-2024/",
        updatedAt: now
      },
      {
        id: crypto.randomUUID(),
        title: "Aho/Ullman Foundations of Computer Science",
        date: "2026-06-01",
        details: "Use chapters 1-9, 12, and 14. Skip chapters 10, 11, and 13 as requested.",
        link: "http://infolab.stanford.edu/~ullman/focs.html",
        updatedAt: now
      },
      {
        id: crypto.randomUUID(),
        title: "Cartesian - Interactive Handbook on Data Structures and Algorithms",
        date: "2026-06-01",
        details: "Use Cartesian for interactive visualizations, code playback, Python practice, and end-of-topic challenges.",
        link: "https://cartesian.app/",
        updatedAt: now
      },
      {
        id: crypto.randomUUID(),
        title: "ISI MStat PSB Probability and Statistics Pattern Notes",
        date: "2026-06-01",
        details: "Use the local ISI pattern notes to drive daily 5-problem sets across NP/MP tests, MLE and estimation, conditional expectation with indicators, distributions and order statistics, and regression/OLS.",
        link: "",
        updatedAt: now
      },
      {
        id: crypto.randomUUID(),
        title: "Probability and Statistics Themed HTML Practice Sets",
        date: "2026-06-01",
        details: "Use the organized local practice folders as the problem bank: 01-np-mp-tests, 02-mle-estimation, 03-conditional-expectation-indicators, 04-distributions-order-statistics, 05-regression-ols, and 99-mixed-review.",
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
      concepts: [
        {
          name: "Sample space",
          description: "List the outcomes that are possible under the rules of the experiment.",
          cue: "The question asks what can happen before asking how likely it is."
        },
        {
          name: "Event",
          description: "An event is a set of favourable outcomes inside the sample space.",
          cue: "Translate words like at least, exactly, neither, or either into a set condition."
        },
        {
          name: "Complement",
          description: "Sometimes it is easier to count what you do not want and subtract from 1.",
          cue: "Use when the phrase is at least one, not all, or no repeated failure."
        },
        {
          name: "Inclusion-exclusion",
          description: "When two counts overlap, add both and subtract the overlap once.",
          cue: "Use for A or B when A and B can both happen."
        },
        {
          name: "Counting as deployment",
          description: "Use permutations, combinations, and multiplication rule only to count the numerator and denominator.",
          cue: "The probability is simple after the correct count is built."
        }
      ],
      techniques: [
        {
          name: "Count favourable over total",
          when: "all valid outcomes are equally likely.",
          move: "Define the sample space, count total outcomes, count favourable outcomes, then divide."
        },
        {
          name: "Use the complement",
          when: "the direct event has many cases, but its opposite is clean.",
          move: "Compute 1 - P(opposite event)."
        },
        {
          name: "Split into disjoint cases",
          when: "the event can happen in different non-overlapping ways.",
          move: "Count each case separately and add."
        },
        {
          name: "Apply inclusion-exclusion",
          when: "the event says A or B and A and B can overlap.",
          move: "Use P(A or B) = P(A) + P(B) - P(A and B)."
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
  return {
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
    defaultUser(),
    basic,
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

function collectionFor(type) {
  if (type === "subject") return state.subjects;
  return type === "test" ? state.tests : state[`${type}s`] || state[type];
}

function render() {
  document.querySelector("#learner-subtitle").textContent = `Learner: ${state.user.name}`;
  document.querySelector("#plan-count").textContent = state.accountTypes.length;
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
  renderList("subjects-list", state.subjects, "subject");
  renderSchedule();
  renderList("tests-list", state.tests, "test");
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
    <article class="section-card">
      <div class="section-title">
        <div>
          <p class="eyebrow">Exams -> ${escapeHtml(section.exam)} -> ${escapeHtml(section.accountTier)} -> Subjects -> ${escapeHtml(section.subject)} -> ${escapeHtml(section.chapter)}</p>
          <h4>${escapeHtml(section.title)}</h4>
          <p>${escapeHtml(section.summary)}</p>
        </div>
        <span class="tag">${section.practiceProblems.length} solved problems</span>
      </div>

      <section class="section-block">
        <h5>Subject</h5>
        <div class="subject-path">
          <span>${escapeHtml(section.exam)}</span>
          <span>${escapeHtml(section.accountTier)}</span>
          <span>${escapeHtml(section.subject)}</span>
          <span>${escapeHtml(section.chapter)}</span>
        </div>
      </section>

      <section class="section-block">
        <h5>Section Preview</h5>
        <p>${escapeHtml(section.sectionPreview)}</p>
      </section>

      <section class="section-block">
        <h5>Preview Activity</h5>
        <p>${escapeHtml(section.previewActivity)}</p>
      </section>

      <section class="section-block">
        <h5>Core Ideas</h5>
        <div class="concept-grid">
          ${section.concepts.map((concept) => `
            <article class="concept-card">
              <strong>${escapeHtml(concept.name)}</strong>
              <p>${escapeHtml(concept.description)}</p>
              <span>${escapeHtml(concept.cue)}</span>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="section-block">
        <h5>Problem-Solving Techniques</h5>
        <div class="technique-list">
          ${section.techniques.map((technique) => `
            <article>
              <strong>${escapeHtml(technique.name)}</strong>
              <p><b>Use when:</b> ${escapeHtml(technique.when)}</p>
              <p><b>Move:</b> ${escapeHtml(technique.move)}</p>
            </article>
          `).join("")}
        </div>
      </section>

      <section class="section-block">
        <h5>Reading Questions</h5>
        <ol class="review-list">
          ${section.readingQuestions.map((question) => `<li>${escapeHtml(question)}</li>`).join("")}
        </ol>
      </section>

      <section class="section-block">
        <h5>Labelled Practice Problems</h5>
        <div class="problem-list">
          ${section.practiceProblems.map(practiceProblemTemplate).join("")}
        </div>
      </section>

      <section class="section-block">
        <h5>Conceptual Review: No Solutions</h5>
        <p class="muted">These are meant to expose weak understanding. The student should answer in words and then discuss the reasoning with a teacher or reviewer.</p>
        <ol class="review-list">
          ${section.reviewPrompts.map((prompt) => `<li>${escapeHtml(prompt)}</li>`).join("")}
        </ol>
      </section>

      <section class="section-block">
        <h5>Chapter Summary</h5>
        <ul class="summary-list">
          ${section.chapterSummary.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
        </ul>
      </section>
    </article>
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
