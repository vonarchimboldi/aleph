const STORAGE_KEY = "learning-studio-data-v2";
const LEGACY_STORAGE_KEYS = ["learning-studio-data-v1"];
const SESSION_KEY = "aleph-session";
const COURSE_PLAN_VERSION = "plan-scoped-material-v48";

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
document.querySelector("#signup-form").addEventListener("submit", signup);
document.querySelector("#password-change-form").addEventListener("submit", changePassword);
document.querySelector("#forgot-password-form").addEventListener("submit", resetForgottenPassword);
document.querySelector("#show-signup-btn").addEventListener("click", showSignup);
document.querySelector("#show-password-change-btn").addEventListener("click", showPasswordChange);
document.querySelector("#show-forgot-password-btn").addEventListener("click", showForgotPassword);
document.querySelector("#back-to-login-btn").addEventListener("click", showLogin);
document.querySelector("#back-to-login-from-signup-btn").addEventListener("click", showLogin);
document.querySelector("#back-to-login-from-forgot-btn").addEventListener("click", showLogin);
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

LEGACY_STORAGE_KEYS.forEach((key) => {
  localStorage.removeItem(key);
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.unregister());
  });
}

if ("caches" in window) {
  caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
}

applyDemoLogin();
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
    const user = normalizeSeededUser({ ...defaultUser(), ...(parsed.user || {}) });
    const starter = {
      patternSubmissions: [],
      ...buildCoursePlan(user)
    };
    const shouldUseCanonicalPlan = isSeededPrototypeUser(user) || parsed.coursePlanVersion !== COURSE_PLAN_VERSION;
    user.password = user.password || user.tempPassword;
    user.mustChangePassword = false;
    return {
      user,
      subjects: shouldUseCanonicalPlan ? starter.subjects : parsed.subjects?.length ? parsed.subjects : starter.subjects,
      schedule: shouldUseCanonicalPlan ? starter.schedule : parsed.schedule?.length ? parsed.schedule : starter.schedule,
      tests: shouldUseCanonicalPlan ? starter.tests : parsed.tests || [],
      quizAttempts: parsed.quizAttempts || [],
      patternSubmissions: parsed.patternSubmissions || [],
      feedback: shouldUseCanonicalPlan ? starter.feedback : parsed.feedback || [],
      resources: shouldUseCanonicalPlan ? starter.resources : parsed.resources || [],
      tasks: shouldUseCanonicalPlan ? starter.tasks : parsed.tasks || [],
      accountTypes: shouldUseCanonicalPlan ? starter.accountTypes : parsed.accountTypes?.length ? parsed.accountTypes : parsed.products?.length ? parsed.products : starter.accountTypes,
      enrollments: shouldUseCanonicalPlan ? starter.enrollments : parsed.enrollments?.length ? parsed.enrollments : starter.enrollments,
      lessonPlans: shouldUseCanonicalPlan ? starter.lessonPlans : parsed.lessonPlans?.length ? parsed.lessonPlans : starter.lessonPlans,
      gateDaSections: shouldUseCanonicalPlan ? starter.gateDaSections : parsed.gateDaSections?.length ? parsed.gateDaSections : starter.gateDaSections,
      coursePlanVersion: parsed.coursePlanVersion || ""
    };
  } catch {
    return initialState();
  }
}

function initialState() {
  const user = defaultUser();
  return {
    user,
    patternSubmissions: [],
    ...buildCoursePlan(user)
  };
}

function ensureCoursePlan() {
  if (state.coursePlanVersion === COURSE_PLAN_VERSION) return;
  const user = normalizeSeededUser(state.user || defaultUser());
  Object.assign(state, buildCoursePlan(user), {
    user
  });
}

function buildCoursePlan(user = defaultUser()) {
  user = normalizeSeededUser(user);
  const now = new Date().toISOString();
  const accountTypes = accountTypeCatalog(now);
  const sections = gateDaProbabilitySections(now);
  if (isBasicPrototypeUser(user)) {
    return buildGateDaBasicPlan(now, accountTypes, sections, user);
  }
  return buildPriyankaPlatinumPlan(now, accountTypes, sections, user);
}

function isBasicPrototypeUser(user) {
  return user?.accountTypeId === "gate-da-basic" || user?.id === "user-basic-demo" || user?.name === "basic" || user?.name === "gate-basic";
}

function isPlatinumPrototypeUser(user) {
  return ["priyanka", "platinum", "platinum-demo", "reviewer"].includes(user?.name)
    || user?.accountTypeId === "gate-da-platinum";
}

function activeAccountTypeId() {
  const enrollment = state.enrollments.find((entry) => entry.userId === state.user.id);
  return enrollment?.accountTypeId || enrollment?.productId || state.user.accountTypeId || "";
}

function subjectAccountType(subject) {
  if (subject.accountTypeId) return subject.accountTypeId;
  if (subject.id === "subject-gate-da-probability" || subject.sectionIds?.length) return "gate-da-basic";
  return "gate-da-platinum";
}

function activeSubjects() {
  const accountTypeId = activeAccountTypeId();
  return state.subjects.filter((subject) => {
    const subjectType = subjectAccountType(subject);
    if (accountTypeId === "gate-da-basic") return subjectType === "gate-da-basic";
    if (accountTypeId === "gate-da-platinum") {
      return subjectType === "gate-da-platinum" && !subject.sectionIds?.length;
    }
    return subjectType === accountTypeId;
  });
}

function activeGateDaSections() {
  return activeAccountTypeId() === "gate-da-basic" ? state.gateDaSections : [];
}

function isLocalHost() {
  return ["localhost", "127.0.0.1", "0.0.0.0", "::1"].includes(window.location.hostname);
}

function slugify(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "learner";
}

function buildPriyankaPlatinumPlan(now, accountTypes, sections, user = defaultUser()) {
  const startDate = "2026-06-01";
  const endDate = "2026-08-30";
  const userSlug = slugify(user.name || user.id || "learner");
  const lessonPlanId = `lesson-${userSlug}-platinum`;
  const subjects = [
    {
      id: "subject-discrete-mathematics",
      accountTypeId: "gate-da-platinum",
      lessonPlanId,
      title: "Discrete Mathematics",
      date: endDate,
      status: "Not started",
      details: "Learning plan: integrate CMU 21-228, MIT 6.1200J, and MIT 18.200 over 13 weeks. Each week has coursework milestones, one combined Sunday review quiz, and every other Sunday a cumulative spaced-review quiz.",
      updatedAt: now
    },
    {
      id: "subject-data-structures-algorithms",
      accountTypeId: "gate-da-platinum",
      lessonPlanId,
      title: "Data Structures and Algorithms",
      date: endDate,
      status: "Not started",
      details: "Learning plan: complexity analysis, arrays, linked lists, stacks, queues, hashing, trees, heaps, graphs, sorting, searching, dynamic programming basics, and implementation practice.",
      updatedAt: now
    },
    {
      id: "subject-probability-statistics",
      accountTypeId: "gate-da-platinum",
      lessonPlanId,
      title: "Probability and Statistics",
      date: endDate,
      status: "Not started",
      details: "GATE DA Probability and Statistics with Priyanka's Platinum pacing: six recurring PSB patterns, daily 10-problem sets, Sunday mixed review, solution upload, correction notes, and feedback.",
      patternWorkspaces: probabilityStatsPatternWorkspaces(),
      updatedAt: now
    },
    {
      id: "subject-competition-math",
      accountTypeId: "gate-da-platinum",
      lessonPlanId,
      title: "Competition Math",
      date: endDate,
      status: "Not started",
      details: "June-August slice of the 9-10 month mathematical maturity track: one hour per day, technique journal, weekly written review, algebra foundations in weeks 1-8, then number theory foundations beginning in weeks 9-13. Combinatorics and analysis continue after the current app horizon.",
      materialWorkspaces: competitionMathMaterialWorkspaces(),
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
      resources: "ISI PSB pattern notes and published pattern practice material",
      milestones: probabilityStatsMilestones(),
      dailyProblemSets: true
    },
    {
      key: "CM",
      label: "Competition Math",
      resources: "Engel Problem-Solving Strategies, AoPS, Putnam and Beyond, and the Competition Math plan",
      milestones: competitionMathMilestones()
    }
  ];

  const schedule = [];
  const tests = [];
  const tasks = [];
  const feedback = [];

  plans.forEach((plan) => {
    plan.milestones.forEach((milestone, index) => {
      const week = index + 1;
      const monday = addDays(startDate, index * 7);
      const sunday = addDays(monday, 6);
      const spaced = spacedReviewDetails(week, plan.milestones, plan.label);
      const weekWindow = `${formatShortDate(monday)}-${formatShortDate(sunday)}`;

      if (plan.dailyProblemSets) {
        schedule.push({
          id: `schedule-${plan.key.toLowerCase()}-week-${week}-cycle`,
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
          const dayId = dayPlan.day.toLowerCase();
          schedule.push({
            id: `schedule-${plan.key.toLowerCase()}-week-${week}-${dayId}`,
            title: `Week ${week} ${dayPlan.day}: ${dayPlan.topic} problem set`,
            week,
            subject: plan.label,
            kind: "Problem set",
            date,
            details,
            updatedAt: now
          });
          tasks.push({
            id: `task-${plan.key.toLowerCase()}-week-${week}-${dayId}`,
            week,
            title: `${plan.key} W${week} ${dayPlan.day}: 10-problem ${dayPlan.topic} set`,
            type: "Problem set",
            date,
            status: "todo",
            done: false,
            details,
            updatedAt: now
          });
        });

        schedule.push({
          id: `schedule-${plan.key.toLowerCase()}-week-${week}-sunday-test`,
          title: `Week ${week}: ${plan.label} Sunday PSB test`,
          week,
          subject: plan.label,
          kind: "Test",
          date: sunday,
          details: probabilitySundayTestDetails(milestone),
          updatedAt: now
        });
        tasks.push({
          id: `task-${plan.key.toLowerCase()}-week-${week}-sunday-test`,
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
          id: `test-${plan.key.toLowerCase()}-week-${week}-sunday-test`,
          title: `Week ${week}: ${plan.label} Sunday PSB pattern test`,
          date: sunday,
          details: probabilitySundayTestDetails(milestone),
          updatedAt: now
        });
        feedback.push({
          id: `feedback-${plan.key.toLowerCase()}-week-${week}`,
          title: `Week ${week}: ${plan.label} default solution feedback`,
          date: sunday,
          details: probabilityDefaultFeedback(milestone),
          updatedAt: now
        });
        return;
      }

      schedule.push(
        {
          id: `schedule-${plan.key.toLowerCase()}-week-${week}-milestone`,
          title: `Week ${week}: ${plan.label} milestone`,
          week,
          subject: plan.label,
          kind: "Milestone",
          date: monday,
          details: milestoneDetails(milestone),
          updatedAt: now
        },
        {
          id: `schedule-${plan.key.toLowerCase()}-week-${week}-review`,
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
          id: `schedule-${plan.key.toLowerCase()}-week-${week}-spaced-review`,
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
          id: `task-${plan.key.toLowerCase()}-week-${week}-lectures`,
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
          id: `task-${plan.key.toLowerCase()}-week-${week}-assignment`,
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
          id: `task-${plan.key.toLowerCase()}-week-${week}-review`,
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
          id: `task-${plan.key.toLowerCase()}-week-${week}-spaced-review`,
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

      tests.push({
        id: `test-${plan.key.toLowerCase()}-week-${week}-review`,
        title: `Week ${week}: ${plan.label} Sunday combined review quiz`,
        date: sunday,
        details: `Single integrated quiz for ${plan.label}. Include implementation, proof/analysis, and application questions for: ${milestone.focus}.`,
        updatedAt: now
      });

      if (week % 2 === 0) {
        tests.push({
          id: `test-${plan.key.toLowerCase()}-week-${week}-spaced-review`,
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
    quizAttempts: [],
    tasks,
    accountTypes,
    enrollments: [
      {
        id: `enrollment-${userSlug}-platinum`,
        userId: user.id,
        accountTypeId: "gate-da-platinum",
        planVariant: "Platinum",
        paymentStatus: "active",
        lessonPlanId,
        status: "active",
        updatedAt: now
      }
    ],
    lessonPlans: [
      {
        id: lessonPlanId,
        userId: user.id,
        title: `${user.displayName || user.name} GATE DA Platinum plan`,
        type: "personalized",
        subjects: [
          "Discrete Mathematics",
          "Data Structures and Algorithms",
          "Probability and Statistics",
          "Competition Math"
        ],
        startDate,
        endDate,
        status: "active",
        details: "Personalized June-August Platinum plan for the GATE DA exam plus a Competition Math maturity track. The Probability and Statistics subject is organized as recurring PSB patterns with weekly material, solution upload, and feedback.",
        updatedAt: now
      }
    ],
    gateDaSections: [],
    feedback: [
      {
        id: "feedback-three-subject-plan-created",
        title: "Four-subject Platinum plan created",
        date: startDate,
        details: "June-August plans map Discrete Math, Data Structures and Algorithms, Probability and Statistics, and Competition Math into weekly work. Competition Math follows the long roadmap without force-fitting the whole track: algebra in weeks 1-8, then the start of number theory in weeks 9-13.",
        updatedAt: now
      }
    ].concat(feedback),
    resources: [
      {
        id: "resource-cmu-discrete-mathematics",
        title: "CMU 21-228 Discrete Mathematics - Po-Shen Loh",
        date: startDate,
        details: "Use the official CMU course page for Loh's Discrete Mathematics syllabus, homework rhythm, exams, and week-by-week topic sequence.",
        link: "https://www.math.cmu.edu/~ploh/2025-228.shtml",
        updatedAt: now
      },
      {
        id: "resource-mit-math-for-cs",
        title: "MIT 6.1200J Mathematics for Computer Science - Spring 2024",
        date: startDate,
        details: "Use the OCW page for lecture videos, lecture notes, warm-up problems, readings, and problem sets.",
        link: "https://ocw.mit.edu/courses/6-1200j-mathematics-for-computer-science-spring-2024/",
        updatedAt: now
      },
      {
        id: "resource-mit-discrete-applied",
        title: "MIT 18.200 Principles of Discrete Applied Mathematics - Spring 2024",
        date: startDate,
        details: "Use the OCW page for calendar, lecture videos, lecture notes, assignments, and writing resources.",
        link: "https://ocw.mit.edu/courses/18-200-principles-of-discrete-applied-mathematics-spring-2024/",
        updatedAt: now
      },
      {
        id: "resource-aho-ullman-focs",
        title: "Aho/Ullman Foundations of Computer Science",
        date: startDate,
        details: "Use chapters 1-9, 12, and 14. Skip chapters 10, 11, and 13 as requested.",
        link: "http://infolab.stanford.edu/~ullman/focs.html",
        updatedAt: now
      },
      {
        id: "resource-cartesian-dsa",
        title: "Cartesian - Interactive Handbook on Data Structures and Algorithms",
        date: startDate,
        details: "Use Cartesian for interactive visualizations, code playback, Python practice, and end-of-topic challenges.",
        link: "https://cartesian.app/",
        updatedAt: now
      },
      {
        id: "resource-isi-pattern-notes",
        title: "ISI MStat PSB Probability and Statistics Pattern Notes",
        date: startDate,
        details: "Use the local ISI pattern notes to drive daily 10-problem sets across indicators, conditional expectation, order statistics, MLE, UMP/NP tests, and regression/OLS.",
        link: "",
        updatedAt: now
      },
      {
        id: "resource-probability-themed-practice",
        title: "Probability and Statistics Themed HTML Practice Sets",
        date: startDate,
        details: "Use the organized local practice folders as the problem bank: 01-np-mp-tests, 02-mle-estimation, 03-conditional-expectation-indicators, 04-distributions-order-statistics, 05-regression-ols, and 99-mixed-review.",
        link: "",
        updatedAt: now
      },
      {
        id: "resource-competition-math-plan",
        title: "Competition Math 9-10 Month Plan",
        date: startDate,
        details: "Local planning note for Priyanka's high-school competition math maturity track. June-August uses the algebra and early number theory slice; the local markdown roadmap continues into combinatorics, analysis, olympiad rotation, timed mocks, technique journal, spaced review, and proof-writing practice.",
        link: "",
        updatedAt: now
      }
    ],
    coursePlanVersion: COURSE_PLAN_VERSION
  };
}

function buildGateDaBasicPlan(now, accountTypes, sections, user = basicGateDaUser()) {
  const probabilitySection = sections[0];
  const conditionalSection = sections[1];
  const monday = "2026-06-01";
  const sunday = addDays(monday, 6);
  const weekTwoMonday = addDays(monday, 7);
  const weekTwoSunday = addDays(weekTwoMonday, 6);
  const weekThreeMonday = addDays(monday, 14);
  const weekThreeSunday = addDays(weekThreeMonday, 6);
  const weekFourMonday = addDays(monday, 21);
  const weekFourSunday = addDays(weekFourMonday, 6);
  const weekFiveMonday = addDays(monday, 28);
  const weekFiveSunday = addDays(weekFiveMonday, 6);
  const weekSixMonday = addDays(monday, 35);
  const weekSixSunday = addDays(weekSixMonday, 6);
  const weekSevenMonday = addDays(monday, 42);
  const weekSevenSunday = addDays(weekSevenMonday, 6);
  const weekEightMonday = addDays(monday, 49);
  const weekEightSunday = addDays(weekEightMonday, 6);
  const weekNineMonday = addDays(monday, 56);
  const weekNineSunday = addDays(weekNineMonday, 6);
  const weekTenMonday = addDays(monday, 63);
  const weekTenSunday = addDays(weekTenMonday, 6);
  const userId = user.id || "user-basic-demo";
  const userSlug = slugify(user.name || userId);
  const enrollmentId = `enrollment-${userSlug}-gate-da-basic`;
  const lessonPlanId = `lesson-${userSlug}-gate-da-basic`;
  const isTrial = user.accountTypeId === "gate-da-basic" && user.trialEndsAt;
  const trialNote = isTrial ? ` One-week free trial active through ${formatDate(user.trialEndsAt)}.` : "";
  return {
    subjects: [
      {
        id: "subject-gate-da-probability",
        accountTypeId: "gate-da-basic",
        lessonPlanId,
        title: "Probability",
        date: "2026-08-30",
        status: "In progress",
        details: "GATE DA Basic Probability, aligned to the official GATE DA syllabus. Chapters 1-10 now cover foundations, conditioning, random variables, expectation, variance, tail bounds, joint distributions, covariance, correlation, conditional expectation, continuous distributions, order statistics, limit theorems, approximations, confidence intervals, and hypothesis tests.",
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
      },
      {
        id: "schedule-probability-chapter-4-study",
        title: "Probability Chapter 4: Variance, Standard Deviation, and Tail Bounds",
        week: 4,
        subject: "Probability",
        kind: "Study",
        date: weekFourMonday,
        details: "Study spread around the mean, variance shortcuts, distribution variances, and Markov, Chebyshev, and Chernoff tail bounds.",
        updatedAt: now
      },
      {
        id: "schedule-probability-chapter-4-practice",
        title: "Probability Chapter 4: Labelled Practice",
        week: 4,
        subject: "Probability",
        kind: "Practice",
        date: addDays(weekFourMonday, 2),
        details: "Solve the Chapter 4 variance and tail-bound practice problems before opening worked solutions.",
        updatedAt: now
      },
      {
        id: "schedule-probability-chapter-4-review",
        title: "Probability Chapter 4: Objective Review",
        week: 4,
        subject: "Probability",
        kind: "Review",
        date: weekFourSunday,
        details: "Take the variance objective quiz and use the logged feedback to review weak derivation techniques.",
        updatedAt: now
      },
      {
        id: "schedule-probability-chapter-5-study",
        title: "Probability Chapter 5: Joint Distributions",
        week: 5,
        subject: "Probability",
        kind: "Study",
        date: weekFiveMonday,
        details: "Study joint PMFs/PDFs, marginals, conditionals, independence, support regions, and simple transformations.",
        updatedAt: now
      },
      {
        id: "schedule-probability-chapter-5-practice",
        title: "Probability Chapter 5: Labelled Practice",
        week: 5,
        subject: "Probability",
        kind: "Practice",
        date: addDays(weekFiveMonday, 2),
        details: "Solve the Chapter 5 joint distribution practice problems before opening worked solutions.",
        updatedAt: now
      },
      {
        id: "schedule-probability-chapter-5-review",
        title: "Probability Chapter 5: Objective Review",
        week: 5,
        subject: "Probability",
        kind: "Review",
        date: weekFiveSunday,
        details: "Take the joint distributions objective quiz and use the logged feedback to review weak concepts.",
        updatedAt: now
      },
      {
        id: "schedule-probability-chapter-6-study",
        title: "Probability Chapter 6: Covariance and Correlation",
        week: 6,
        subject: "Probability",
        kind: "Study",
        date: weekSixMonday,
        details: "Study E[XY], covariance, correlation, independence versus zero covariance, variance of sums, and indicator-pair covariance.",
        updatedAt: now
      },
      {
        id: "schedule-probability-chapter-6-practice",
        title: "Probability Chapter 6: Labelled Practice",
        week: 6,
        subject: "Probability",
        kind: "Practice",
        date: addDays(weekSixMonday, 2),
        details: "Solve the Chapter 6 covariance and correlation practice problems before opening worked solutions.",
        updatedAt: now
      },
      {
        id: "schedule-probability-chapter-6-review",
        title: "Probability Chapter 6: Objective Review",
        week: 6,
        subject: "Probability",
        kind: "Review",
        date: weekSixSunday,
        details: "Take the covariance and correlation objective quiz and use the logged feedback to review weak concepts.",
        updatedAt: now
      },
      {
        id: "schedule-probability-chapter-7-study",
        title: "Probability Chapter 7: Conditional Expectation and Conditional Variance",
        week: 7,
        subject: "Probability",
        kind: "Study",
        date: weekSevenMonday,
        details: "Study conditional expectation as updated average, tower property, total expectation, conditional variance, total variance, prediction, and fair-game intuition.",
        updatedAt: now
      },
      {
        id: "schedule-probability-chapter-7-practice",
        title: "Probability Chapter 7: Labelled Practice",
        week: 7,
        subject: "Probability",
        kind: "Practice",
        date: addDays(weekSevenMonday, 2),
        details: "Solve the Chapter 7 conditional expectation and variance practice problems before opening worked solutions.",
        updatedAt: now
      },
      {
        id: "schedule-probability-chapter-7-review",
        title: "Probability Chapter 7: Objective Review",
        week: 7,
        subject: "Probability",
        kind: "Review",
        date: weekSevenSunday,
        details: "Take the conditional expectation objective quiz and use the logged feedback to review weak concepts.",
        updatedAt: now
      },
      {
        id: "schedule-probability-chapter-8-study",
        title: "Probability Chapter 8: Continuous Distributions and Order Statistics",
        week: 8,
        subject: "Probability",
        kind: "Study",
        date: weekEightMonday,
        details: "Study exponential, Poisson, gamma, normal, standard normal, order statistics, uniform spacings, beta, and the exponential-family overview.",
        updatedAt: now
      },
      {
        id: "schedule-probability-chapter-8-practice",
        title: "Probability Chapter 8: Labelled Practice",
        week: 8,
        subject: "Probability",
        kind: "Practice",
        date: addDays(weekEightMonday, 2),
        details: "Solve the Chapter 8 continuous-distribution and order-statistic practice problems before opening worked solutions.",
        updatedAt: now
      },
      {
        id: "schedule-probability-chapter-8-review",
        title: "Probability Chapter 8: Objective Review",
        week: 8,
        subject: "Probability",
        kind: "Review",
        date: weekEightSunday,
        details: "Take the continuous distributions objective quiz and use the logged feedback to review weak concepts.",
        updatedAt: now
      },
      {
        id: "schedule-probability-chapter-9-study",
        title: "Probability Chapter 9: Limit Theorems and Approximations",
        week: 9,
        subject: "Probability",
        kind: "Study",
        date: weekNineMonday,
        details: "Study sample means, standard errors, LLN, CLT, standardized sums, normal and Poisson approximations, continuity correction, and approximation diagnostics.",
        updatedAt: now
      },
      {
        id: "schedule-probability-chapter-9-practice",
        title: "Probability Chapter 9: Labelled Practice",
        week: 9,
        subject: "Probability",
        kind: "Practice",
        date: addDays(weekNineMonday, 2),
        details: "Solve the Chapter 9 limit-theorem and approximation practice problems before opening worked solutions.",
        updatedAt: now
      },
      {
        id: "schedule-probability-chapter-9-review",
        title: "Probability Chapter 9: Objective Review",
        week: 9,
        subject: "Probability",
        kind: "Review",
        date: weekNineSunday,
        details: "Take the limit theorems objective quiz and use the logged feedback to review weak concepts.",
        updatedAt: now
      },
      {
        id: "schedule-probability-chapter-10-study",
        title: "Probability Chapter 10: Confidence Intervals and Hypothesis Tests",
        week: 10,
        subject: "Probability",
        kind: "Study",
        date: weekTenMonday,
        details: "Study inference through a delivery-app matching case study: CIs, Wald and score methods, z-tests, t-tests, chi-squared tests, p-values, rejection regions, and power.",
        updatedAt: now
      },
      {
        id: "schedule-probability-chapter-10-practice",
        title: "Probability Chapter 10: Labelled Practice",
        week: 10,
        subject: "Probability",
        kind: "Practice",
        date: addDays(weekTenMonday, 2),
        details: "Solve the Chapter 10 confidence-interval and hypothesis-testing practice problems before opening worked solutions.",
        updatedAt: now
      },
      {
        id: "schedule-probability-chapter-10-review",
        title: "Probability Chapter 10: Objective Review",
        week: 10,
        subject: "Probability",
        kind: "Review",
        date: weekTenSunday,
        details: "Take the inference objective quiz and use the logged feedback to review weak concepts.",
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
      },
      {
        id: "test-probability-chapter-4-objective-review",
        title: "Probability Chapter 4 Objective Review",
        date: weekFourSunday,
        details: "Objective end-of-chapter quiz for variance, standard deviation, distribution variance derivations, and Markov/Chebyshev/Chernoff tail bounds. Attempts are logged in the learner record.",
        sectionId: sections[3]?.id,
        quizId: "quiz-probability-chapter-4-objective-review",
        updatedAt: now
      },
      {
        id: "test-probability-chapter-5-objective-review",
        title: "Probability Chapter 5 Objective Review",
        date: weekFiveSunday,
        details: "Objective end-of-chapter quiz for joint PMFs/PDFs, marginals, conditionals, independence, support regions, and transformations. Attempts are logged in the learner record.",
        sectionId: sections[4]?.id,
        quizId: "quiz-probability-chapter-5-objective-review",
        updatedAt: now
      },
      {
        id: "test-probability-chapter-6-objective-review",
        title: "Probability Chapter 6 Objective Review",
        date: weekSixSunday,
        details: "Objective end-of-chapter quiz for E[XY], covariance, correlation, variance of sums, independence, and indicator-pair covariance. Attempts are logged in the learner record.",
        sectionId: sections[5]?.id,
        quizId: "quiz-probability-chapter-6-objective-review",
        updatedAt: now
      },
      {
        id: "test-probability-chapter-7-objective-review",
        title: "Probability Chapter 7 Objective Review",
        date: weekSevenSunday,
        details: "Objective end-of-chapter quiz for conditional expectation, tower property, total expectation, conditional variance, total variance, prediction, and fair-game intuition. Attempts are logged in the learner record.",
        sectionId: sections[6]?.id,
        quizId: "quiz-probability-chapter-7-objective-review",
        updatedAt: now
      },
      {
        id: "test-probability-chapter-8-objective-review",
        title: "Probability Chapter 8 Objective Review",
        date: weekEightSunday,
        details: "Objective end-of-chapter quiz for exponential, Poisson, gamma, normal, standard normal, order statistics, uniform spacings, beta, and exponential-family recognition. Attempts are logged in the learner record.",
        sectionId: sections[7]?.id,
        quizId: "quiz-probability-chapter-8-objective-review",
        updatedAt: now
      },
      {
        id: "test-probability-chapter-9-objective-review",
        title: "Probability Chapter 9 Objective Review",
        date: weekNineSunday,
        details: "Objective end-of-chapter quiz for standard errors, LLN, CLT, standardized sums, normal approximation, continuity correction, Poisson approximation, and approximation diagnostics. Attempts are logged in the learner record.",
        sectionId: sections[8]?.id,
        quizId: "quiz-probability-chapter-9-objective-review",
        updatedAt: now
      },
      {
        id: "test-probability-chapter-10-objective-review",
        title: "Probability Chapter 10 Objective Review",
        date: weekTenSunday,
        details: "Objective end-of-chapter quiz for confidence intervals, z-tests, t-tests, chi-squared tests, p-values, rejection regions, and power. Attempts are logged in the learner record.",
        sectionId: sections[9]?.id,
        quizId: "quiz-probability-chapter-10-objective-review",
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
      },
      {
        id: "task-probability-chapter-4-read",
        week: 4,
        title: "Probability Ch 4: Read variance and spread",
        type: "Study",
        date: weekFourMonday,
        status: "todo",
        done: false,
        details: "Open Subjects -> Probability -> Chapter 4 and study variance, standard deviation, distribution derivations, and tail bounds.",
        updatedAt: now
      },
      {
        id: "task-probability-chapter-4-practice",
        week: 4,
        title: "Probability Ch 4: Solve variance practice",
        type: "Practice",
        date: addDays(weekFourMonday, 2),
        status: "todo",
        done: false,
        details: "Attempt the Chapter 4 labelled practice problems before reading worked solutions.",
        updatedAt: now
      },
      {
        id: "task-probability-chapter-4-review",
        week: 4,
        title: "Probability Ch 4: Take objective review",
        type: "Review",
        date: weekFourSunday,
        status: "todo",
        done: false,
        details: "Submit the Chapter 4 objective quiz so the learner record logs variance and tail-bound strengths and weaknesses.",
        updatedAt: now
      },
      {
        id: "task-probability-chapter-5-read",
        week: 5,
        title: "Probability Ch 5: Read joint distributions",
        type: "Study",
        date: weekFiveMonday,
        status: "todo",
        done: false,
        details: "Open Subjects -> Probability -> Chapter 5 and study joint PMFs/PDFs, marginals, conditionals, independence, and support regions.",
        updatedAt: now
      },
      {
        id: "task-probability-chapter-5-practice",
        week: 5,
        title: "Probability Ch 5: Solve joint practice",
        type: "Practice",
        date: addDays(weekFiveMonday, 2),
        status: "todo",
        done: false,
        details: "Attempt the Chapter 5 labelled practice problems before reading worked solutions.",
        updatedAt: now
      },
      {
        id: "task-probability-chapter-5-review",
        week: 5,
        title: "Probability Ch 5: Take objective review",
        type: "Review",
        date: weekFiveSunday,
        status: "todo",
        done: false,
        details: "Submit the Chapter 5 objective quiz so the learner record logs joint distribution strengths and weaknesses.",
        updatedAt: now
      },
      {
        id: "task-probability-chapter-6-read",
        week: 6,
        title: "Probability Ch 6: Read covariance and correlation",
        type: "Study",
        date: weekSixMonday,
        status: "todo",
        done: false,
        details: "Open Subjects -> Probability -> Chapter 6 and study E[XY], covariance, correlation, variance of sums, and indicator-pair covariance.",
        updatedAt: now
      },
      {
        id: "task-probability-chapter-6-practice",
        week: 6,
        title: "Probability Ch 6: Solve covariance practice",
        type: "Practice",
        date: addDays(weekSixMonday, 2),
        status: "todo",
        done: false,
        details: "Attempt the Chapter 6 labelled practice problems before reading worked solutions.",
        updatedAt: now
      },
      {
        id: "task-probability-chapter-6-review",
        week: 6,
        title: "Probability Ch 6: Take objective review",
        type: "Review",
        date: weekSixSunday,
        status: "todo",
        done: false,
        details: "Submit the Chapter 6 objective quiz so the learner record logs covariance and correlation strengths and weaknesses.",
        updatedAt: now
      },
      {
        id: "task-probability-chapter-7-read",
        week: 7,
        title: "Probability Ch 7: Read conditional expectation",
        type: "Study",
        date: weekSevenMonday,
        status: "todo",
        done: false,
        details: "Open Subjects -> Probability -> Chapter 7 and study conditional expectation, total expectation, conditional variance, and fair-game intuition.",
        updatedAt: now
      },
      {
        id: "task-probability-chapter-7-practice",
        week: 7,
        title: "Probability Ch 7: Solve conditional expectation practice",
        type: "Practice",
        date: addDays(weekSevenMonday, 2),
        status: "todo",
        done: false,
        details: "Attempt the Chapter 7 labelled practice problems before reading worked solutions.",
        updatedAt: now
      },
      {
        id: "task-probability-chapter-7-review",
        week: 7,
        title: "Probability Ch 7: Take objective review",
        type: "Review",
        date: weekSevenSunday,
        status: "todo",
        done: false,
        details: "Submit the Chapter 7 objective quiz so the learner record logs conditional expectation and variance strengths and weaknesses.",
        updatedAt: now
      },
      {
        id: "task-probability-chapter-8-read",
        week: 8,
        title: "Probability Ch 8: Read continuous distributions",
        type: "Study",
        date: weekEightMonday,
        status: "todo",
        done: false,
        details: "Open Subjects -> Probability -> Chapter 8 and study continuous distributions, order statistics, uniform spacings, and beta.",
        updatedAt: now
      },
      {
        id: "task-probability-chapter-8-practice",
        week: 8,
        title: "Probability Ch 8: Solve distribution practice",
        type: "Practice",
        date: addDays(weekEightMonday, 2),
        status: "todo",
        done: false,
        details: "Attempt the Chapter 8 labelled practice problems before reading worked solutions.",
        updatedAt: now
      },
      {
        id: "task-probability-chapter-8-review",
        week: 8,
        title: "Probability Ch 8: Take objective review",
        type: "Review",
        date: weekEightSunday,
        status: "todo",
        done: false,
        details: "Submit the Chapter 8 objective quiz so the learner record logs continuous distribution and order-statistic strengths and weaknesses.",
        updatedAt: now
      },
      {
        id: "task-probability-chapter-9-read",
        week: 9,
        title: "Probability Ch 9: Read limit theorems",
        type: "Study",
        date: weekNineMonday,
        status: "todo",
        done: false,
        details: "Open Subjects -> Probability -> Chapter 9 and study LLN, CLT, standard errors, normal approximations, Poisson approximations, and diagnostics.",
        updatedAt: now
      },
      {
        id: "task-probability-chapter-9-practice",
        week: 9,
        title: "Probability Ch 9: Solve approximation practice",
        type: "Practice",
        date: addDays(weekNineMonday, 2),
        status: "todo",
        done: false,
        details: "Attempt the Chapter 9 labelled practice problems before reading worked solutions.",
        updatedAt: now
      },
      {
        id: "task-probability-chapter-9-review",
        week: 9,
        title: "Probability Ch 9: Take objective review",
        type: "Review",
        date: weekNineSunday,
        status: "todo",
        done: false,
        details: "Submit the Chapter 9 objective quiz so the learner record logs limit-theorem and approximation strengths and weaknesses.",
        updatedAt: now
      },
      {
        id: "task-probability-chapter-10-read",
        week: 10,
        title: "Probability Ch 10: Read inference case study",
        type: "Study",
        date: weekTenMonday,
        status: "todo",
        done: false,
        details: "Open Subjects -> Probability -> Chapter 10 and study confidence intervals and hypothesis tests through the delivery-app matching case study.",
        updatedAt: now
      },
      {
        id: "task-probability-chapter-10-practice",
        week: 10,
        title: "Probability Ch 10: Solve inference practice",
        type: "Practice",
        date: addDays(weekTenMonday, 2),
        status: "todo",
        done: false,
        details: "Attempt the Chapter 10 labelled practice problems before reading worked solutions.",
        updatedAt: now
      },
      {
        id: "task-probability-chapter-10-review",
        week: 10,
        title: "Probability Ch 10: Take objective review",
        type: "Review",
        date: weekTenSunday,
        status: "todo",
        done: false,
        details: "Submit the Chapter 10 objective quiz so the learner record logs confidence-interval and hypothesis-testing strengths and weaknesses.",
        updatedAt: now
      }
    ],
    accountTypes,
    enrollments: [
      {
        id: enrollmentId,
        userId,
        accountTypeId: "gate-da-basic",
        planVariant: "Basic",
        paymentStatus: isTrial ? "trial" : "active",
        lessonPlanId,
        status: "active",
        trialEndsAt: user.trialEndsAt || "",
        updatedAt: now
      }
    ],
    lessonPlans: [
      {
        id: lessonPlanId,
        userId,
        title: "GATE DA Basic plan",
        type: "exam",
        subjects: ["Probability"],
        startDate: monday,
        endDate: "2026-08-30",
        status: "active",
        details: `GATE DA Basic plan surfaces: Subjects, Tasks, Schedule, Tests, Feedback, Resources, and Share. Current material build: Probability Chapters 1-10.${trialNote}`,
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
      },
      {
        id: "resource-probability-variance",
        title: "Probability Chapter 4: Variance, Standard Deviation, and Tail Bounds",
        date: weekFourMonday,
        details: "Open Subjects -> Probability to study Chapter 4 and then take the objective review in Tests.",
        link: "",
        updatedAt: now
      },
      {
        id: "resource-probability-joint-distributions",
        title: "Probability Chapter 5: Joint Distributions",
        date: weekFiveMonday,
        details: "Open Subjects -> Probability to study Chapter 5 and then take the objective review in Tests.",
        link: "",
        updatedAt: now
      },
      {
        id: "resource-probability-covariance-correlation",
        title: "Probability Chapter 6: Covariance and Correlation",
        date: weekSixMonday,
        details: "Open Subjects -> Probability to study Chapter 6 and then take the objective review in Tests.",
        link: "",
        updatedAt: now
      },
      {
        id: "resource-probability-conditional-expectation",
        title: "Probability Chapter 7: Conditional Expectation and Conditional Variance",
        date: weekSevenMonday,
        details: "Open Subjects -> Probability to study Chapter 7 and then take the objective review in Tests.",
        link: "",
        updatedAt: now
      },
      {
        id: "resource-probability-continuous-distributions",
        title: "Probability Chapter 8: Continuous Distributions and Order Statistics",
        date: weekEightMonday,
        details: "Open Subjects -> Probability to study Chapter 8 and then take the objective review in Tests.",
        link: "",
        updatedAt: now
      },
      {
        id: "resource-probability-limit-theorems",
        title: "Probability Chapter 9: Limit Theorems and Approximations",
        date: weekNineMonday,
        details: "Open Subjects -> Probability to study Chapter 9 and then take the objective review in Tests.",
        link: "",
        updatedAt: now
      },
      {
        id: "resource-probability-hypothesis-testing",
        title: "Probability Chapter 10: Confidence Intervals and Hypothesis Tests",
        date: weekTenMonday,
        details: "Open Subjects -> Probability to study Chapter 10 and then take the objective review in Tests.",
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
              type: "principle",
              title: "Closed forms to recognise",
              body: "These formulas are not separate tricks. Each one comes from the story of the experiment: one switch, many independent switches, waiting for first success, or sampling without replacement.",
              formulas: [
                {
                  label: "Bernoulli(p)",
                  formula: "P(X=1)=p, P(X=0)=1-p; E[X]=p",
                  note: "one yes/no trial"
                },
                {
                  label: "Binomial(n,p)",
                  formula: "P(X=k)=C(n,k)p^k(1-p)^(n-k); E[X]=np",
                  note: "k successes in n independent trials"
                },
                {
                  label: "Geometric(p)",
                  formula: "P(X=k)=(1-p)^(k-1)p; E[X]=1/p",
                  note: "first success happens on trial k"
                },
                {
                  label: "Hypergeometric(N,K,n)",
                  formula: "P(X=k)=C(K,k)C(N-K,n-k)/C(N,n); E[X]=nK/N",
                  note: "N total, K successes, n draws without replacement"
                }
              ]
            },
            {
              type: "example",
              title: "Picture: Binomial(4, 1/2)",
              body: "The PMF is a bar chart. For four fair coin tosses, the possible head counts are 0, 1, 2, 3, 4. The middle count is most likely because there are more ways to get two heads than zero heads.",
              visual: {
                type: "bars",
                caption: "Bar heights are proportional to 1, 4, 6, 4, 1 over 16.",
                bars: [
                  { label: "0", height: 14 },
                  { label: "1", height: 42 },
                  { label: "2", height: 64 },
                  { label: "3", height: 42 },
                  { label: "4", height: 14 }
                ]
              }
            },
            {
              type: "example",
              title: "Picture: CDF as running total",
              body: "The CDF adds PMF bars from the left. For Binomial(4, 1/2), F(2)=P(X<=2)=(1+4+6)/16=11/16. That is why CDF questions often say at most, no more than, or up to.",
              formulas: [
                { label: "F(0)", formula: "1/16", note: "only 0 heads" },
                { label: "F(1)", formula: "5/16", note: "0 or 1 head" },
                { label: "F(2)", formula: "11/16", note: "0, 1, or 2 heads" },
                { label: "F(3)", formula: "15/16", note: "all except 4 heads" },
                { label: "F(4)", formula: "1", note: "all possible values" }
              ]
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
              type: "example",
              title: "Picture: Uniform probability is length",
              body: "For Uniform(0,10), the density is flat. The interval from 4 to 7 takes 3 of the 10 equal-length units, so the area is 3/10.",
              visual: {
                type: "area",
                leftLabel: "0",
                rightLabel: "10",
                start: 40,
                width: 30,
                caption: "The shaded region is P(4 <= X <= 7)."
              }
            },
            {
              type: "principle",
              title: "Uniform formulas",
              body: "Uniform(a,b) is the simplest continuous distribution because every interval is judged only by its length.",
              formulas: [
                { label: "PDF", formula: "f(x)=1/(b-a), a <= x <= b", note: "flat height" },
                { label: "CDF", formula: "F(x)=(x-a)/(b-a), a <= x <= b", note: "running length divided by total length" },
                { label: "Mean", formula: "E[X]=(a+b)/2", note: "midpoint of the interval" }
              ]
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
              type: "principle",
              title: "Deriving the common expectations",
              body: "Do not treat these as magic formulas. Each mean comes from a small picture: a switch, a row of switches, a waiting ladder, a sample without replacement, or the middle of an interval.",
              formulas: [
                { label: "Bernoulli", formula: "E[X]=0(1-p)+1p=p", note: "a switch averages to its on-probability" },
                { label: "Binomial", formula: "X=I1+...+In, so E[X]=p+...+p=np", note: "n independent success switches" },
                { label: "Geometric", formula: "E[X]=sum P(X>=k)=1+(1-p)+(1-p)^2+...=1/p", note: "tail sum avoids k times a PMF" },
                { label: "Hypergeometric", formula: "X=I1+...+In, E[Ij]=K/N, so E[X]=nK/N", note: "draws are dependent, but linearity still works" },
                { label: "Uniform", formula: "E[X]=integral_a^b x/(b-a) dx=(a+b)/2", note: "the balance point is the midpoint" }
              ]
            },
            {
              type: "example",
              title: "Worked derivation: Bernoulli mean",
              body: "A Bernoulli variable is just a switch. It is off at 0 and on at 1. Since the zero value contributes nothing to the average, only the chance of being on remains.",
              steps: [
                { label: "Start from the definition", math: "E[X] = sum x P(X=x)", note: "There are only two possible values: 0 and 1." },
                { label: "Put in the two values", math: "E[X] = 0 P(X=0) + 1 P(X=1)", note: "The first term disappears because it is multiplied by 0." },
                { label: "Use the Bernoulli probabilities", math: "E[X] = 0(1-p) + 1(p) = p", note: "So the average of a 0-1 switch is the probability that it is 1." }
              ]
            },
            {
              type: "example",
              title: "Worked derivation: Binomial mean",
              body: "A binomial count is many Bernoulli switches added together. If each question, toss, or trial has the same success chance p, then each switch contributes p to the average count.",
              steps: [
                { label: "Split the count", math: "X = I1 + I2 + ... + In", note: "Here Ii is 1 if trial i succeeds, and 0 otherwise." },
                { label: "Average the pieces", math: "E[X] = E[I1] + E[I2] + ... + E[In]", note: "This is linearity of expectation." },
                { label: "Each switch has mean p", math: "E[X] = p + p + ... + p = np", note: "There are n copies of p." }
              ]
            },
            {
              type: "example",
              title: "Worked derivation: Geometric mean",
              body: "For a waiting time, asking exactly when success happens is a little heavy. Asking whether the wait reaches level k is simpler: to reach level k, the first k-1 attempts must fail.",
              steps: [
                { label: "Use tail sum", math: "E[X] = sum from k=1 to infinity P(X>=k)", note: "This works for positive integer waiting times." },
                { label: "Translate the tail", math: "P(X>=k) = (1-p)^(k-1)", note: "Reaching trial k means trials 1 through k-1 failed." },
                { label: "Add the geometric series", math: "E[X] = 1 + (1-p) + (1-p)^2 + ...", note: "The first term is 1 because X always reaches level 1." },
                { label: "Use the series sum", math: "E[X] = 1 / (1-(1-p)) = 1/p", note: "Small p means success is rare, so the average wait is large." }
              ]
            },
            {
              type: "example",
              title: "Worked derivation: Hypergeometric mean",
              body: "Sampling without replacement creates dependence. That makes the full PMF more annoying, but it does not hurt expectation. Each draw has the same success fraction K/N before you look at its position.",
              steps: [
                { label: "Name the sample positions", math: "X = I1 + I2 + ... + In", note: "Ij is 1 if draw j is a success." },
                { label: "Use symmetry", math: "P(Ij=1) = K/N", note: "Every draw position is equally likely to receive any of the N population items." },
                { label: "Average each switch", math: "E[Ij] = K/N", note: "A 0-1 switch averages to its on-probability." },
                { label: "Add n positions", math: "E[X] = n(K/N)", note: "Dependence changes variance and the PMF, but not this expectation calculation." }
              ]
            },
            {
              type: "example",
              title: "Worked derivation: Uniform mean",
              body: "Uniform(a,b) is a flat rectangle. The average point is the balance point of that rectangle, so we expect the midpoint. The integral confirms the picture.",
              steps: [
                { label: "Density height", math: "f(x) = 1/(b-a), for a <= x <= b", note: "The rectangle has width b-a and total area 1." },
                { label: "Set up expectation", math: "E[X] = integral from a to b of x/(b-a) dx", note: "For continuous variables, average means area-weighted average." },
                { label: "Integrate", math: "E[X] = [x^2/(2(b-a))] from a to b = (b^2-a^2)/(2(b-a))", note: "This is the algebraic balance point." },
                { label: "Factor", math: "E[X] = (b-a)(b+a)/(2(b-a)) = (a+b)/2", note: "So the mean is exactly the midpoint." }
              ]
            },
            {
              type: "example",
              title: "Application: expected wrong answers",
              body: "A student guesses on 12 four-option questions. This is a useful exam model because each question is a small success-or-failure trial. We can compute expected wrong answers without listing all possible scores.",
              steps: [
                { label: "Define the count", math: "X = number of wrong answers", note: "X counts wrong answers, not correct answers." },
                { label: "Find one-question probability", math: "P(wrong) = 3/4", note: "Three choices are wrong out of four." },
                { label: "Choose the model", math: "X ~ Binomial(12, 3/4)", note: "There are 12 independent guesses with the same wrong-answer probability." },
                { label: "Use the mean", math: "E[X] = np = 12 x 3/4 = 9", note: "On average, guessing gives 9 wrong and 3 correct." }
              ]
            },
            {
              type: "strategy",
              title: "Connection map",
              body: "First identify what X counts or measures. Then choose the probability description. After that, pick the easiest expectation route instead of doing unnecessary algebra.",
              visual: {
                type: "flow",
                steps: ["Story", "Random variable X", "PMF/PDF/CDF", "Expectation", "Shortcut if useful"],
                caption: "The goal is not to memorise isolated formulas. The goal is to move from a story to the simplest computation."
              }
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
              type: "example",
              title: "Hard way versus easy way",
              body: "For two cards, the full distribution of ace count needs P(X=0), P(X=1), and P(X=2). That is not wrong, but it is more work than the expectation needs. The easier question is: how many ace switches turn on?",
              formulas: [
                { label: "Hard way", formula: "E[X]=0P(X=0)+1P(X=1)+2P(X=2)", note: "requires the whole PMF" },
                { label: "Easy way", formula: "X=I1+I2, E[X]=4/52+4/52", note: "only needs two ace probabilities" }
              ],
              steps: [
                { label: "Define switches", math: "I1 = 1 if card 1 is an ace, I2 = 1 if card 2 is an ace", note: "The cards are dependent, but each position still has the same ace chance." },
                { label: "Write the count", math: "X = I1 + I2", note: "The number of aces is the number of ace switches that turn on." },
                { label: "Average the switches", math: "E[X] = E[I1] + E[I2] = 4/52 + 4/52", note: "No independence is being used here." },
                { label: "Simplify", math: "E[X] = 8/52 = 2/13", note: "This is much shorter than building the full distribution." }
              ]
            },
            {
              type: "example",
              title: "Application: sampled defectives",
              body: "A warehouse has 100 sensors, 7 defective. You test 10 without replacement. The tests are dependent, but for expectation each test position still has defective chance 7/100.",
              steps: [
                { label: "Split by test position", math: "X = I1 + I2 + ... + I10", note: "Ij is 1 if the jth tested sensor is defective." },
                { label: "Use the common chance", math: "E[Ij] = P(jth sensor is defective) = 7/100", note: "Before testing, each position is equally likely to be any of the 100 sensors." },
                { label: "Add", math: "E[X] = 10 x 7/100 = 0.7", note: "The expected count can be less than 1; it is a long-run average, not a promised observed value." }
              ]
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
            "The indicator method is for expected counts. The word count is the clue: number of matches, number of empty boxes, number of selected defective items, number of people who get their own item.",
            "The mistake many students make is to first try to find the full distribution of the count. That can be painful. The indicator method says: break the count into small yes/no switches. A switch is 1 if one particular thing happens and 0 otherwise.",
            "The kind part of the method is this: the average of a switch is just the chance it turns on. So the work becomes concrete. Define the switches, find each switch probability, and add."
          ],
          blocks: [
            {
              type: "definition",
              title: "Definition: indicator",
              body: "For an event A, the indicator IA equals 1 if A occurs and 0 if A does not occur. Its expectation is E[IA] = P(A). This is because 1 times P(A) plus 0 times P(not A) leaves only P(A).",
              steps: [
                { label: "Two possible values", math: "IA = 1 if A happens, IA = 0 if A does not happen", note: "It is a switch, not a complicated variable." },
                { label: "Take the average", math: "E[IA] = 1 P(A) + 0 P(not A)", note: "The off case contributes zero." },
                { label: "Simplify", math: "E[IA] = P(A)", note: "This is the whole reason indicators are useful." }
              ]
            },
            {
              type: "strategy",
              title: "Procedure",
              body: "Use the same four moves every time. First decide what objects could contribute to the count. Then give each object its own 0-1 switch.",
              visual: {
                type: "flow",
                steps: ["Count X", "Split into switches", "Find P(switch on)", "Add"],
                caption: "Indicator method replaces one hard count distribution with many small yes/no probabilities."
              }
            },
            {
              type: "example",
              title: "Example 3.16: fixed points",
              body: "Suppose n students submit phones, the phones are shuffled, and each student gets one phone back at random. Let X be the number of students who get their own phone. This is a count, so indicators are a natural fit.",
              steps: [
                { label: "Define the count", math: "X = number of students who get their own phone", note: "Finding the full distribution of X is hard because many matching patterns are possible." },
                { label: "Make one switch per student", math: "Ii = 1 if student i gets their own phone, otherwise Ii = 0", note: "Now each student only asks one yes/no question." },
                { label: "Write the count as switches", math: "X = I1 + I2 + ... + In", note: "Every student who matches contributes exactly 1." },
                { label: "Compute one switch probability", math: "P(Ii=1) = 1/n", note: "Student i is equally likely to receive any one of the n phones." },
                { label: "Average and add", math: "E[X] = n x (1/n) = 1", note: "No matter how large the class is, the expected number of exact matches is 1." }
              ]
            },
            {
              type: "example",
              title: "Example 3.17: nonempty boxes",
              body: "Five jobs are assigned independently to four servers, each server equally likely. What is the expected number of servers that receive at least one job? Again, this asks for an expected count.",
              steps: [
                { label: "Define the count", math: "X = number of nonempty servers", note: "A server is nonempty if at least one job lands there." },
                { label: "Make one switch per server", math: "Ii = 1 if server i is nonempty", note: "There are four switches: I1, I2, I3, I4." },
                { label: "Write the total", math: "X = I1 + I2 + I3 + I4", note: "Each used server contributes 1 to the count." },
                { label: "Use the complement", math: "P(Ii=1) = 1 - P(server i is empty)", note: "Nonempty is easier by subtracting empty from 1." },
                { label: "Compute empty", math: "P(server i is empty) = (3/4)^5", note: "Each of the 5 jobs must choose one of the other 3 servers." },
                { label: "Compute switch mean", math: "E[Ii] = P(Ii=1) = 1 - (3/4)^5", note: "This is the average contribution of one server." },
                { label: "Add four equal switches", math: "E[X] = 4[1 - (3/4)^5] = 4[1 - 243/1024] = 781/256", note: "That is about 3.05 used servers on average." }
              ]
            },
            {
              type: "example",
              title: "Example 3.18: matches in two lists",
              body: "A random permutation of 1 to n is compared with the original list. We want the expected number of positions that match. This is the same shape as the phone problem: one switch per position.",
              steps: [
                { label: "Define the switch", math: "Ii = 1 if position i matches", note: "For example, position 3 matches if the number 3 lands in position 3." },
                { label: "Probability of one match", math: "P(Ii=1) = 1/n", note: "Position i is equally likely to contain any of the n numbers." },
                { label: "Add positions", math: "E[X] = E[I1 + ... + In] = n x (1/n) = 1", note: "The expected number of matches is 1." }
              ]
            },
            {
              type: "example",
              title: "Application: expected occupied servers",
              body: "How do you know an indicator solution is coming? Look for a phrase like expected number of objects that satisfy a condition. Then choose the objects. Here the objects are servers; in a card problem they might be card positions; in a graph problem they might be edges or pairs.",
              items: [
                "Expected number of occupied boxes: one switch per box.",
                "Expected number of fixed points: one switch per position.",
                "Expected number of defective items in a sample: one switch per draw or per sampled item.",
                "Expected number of matching pairs: one switch per pair."
              ]
            },
            {
              type: "checkpoint",
              title: "Checkpoint",
              body: "If 8 balls are thrown independently into 5 boxes, and X is the number of nonempty boxes, define the indicators before doing any arithmetic. You should write Ii = 1 if box i is nonempty, then X = I1 + I2 + I3 + I4 + I5."
            }
          ]
        },
        {
          number: "3.7",
          title: "Tail-Sum Formula",
          paragraphs: [
            "Tail-sum is for nonnegative integer values: 0, 1, 2, 3, and so on, or waiting times 1, 2, 3, and so on. It finds an average by asking whether X reaches each level.",
            "The idea is visual. If X = 4, imagine a stack of four blocks. That stack contributes one block to level 1, one to level 2, one to level 3, and one to level 4. So the average height can be found by adding the chances that the stack reaches each level.",
            "For waiting-time problems this is often much easier than exact probabilities. Exact means 'fail, fail, fail, then succeed.' Tail means only 'fail, fail, fail.' Fewer conditions usually means cleaner computation."
          ],
          blocks: [
            {
              type: "principle",
              title: "Principle: tail-sum formula",
              body: "If X is nonnegative and integer-valued, then E[X] = sum from k = 1 to infinity of P(X >= k), whenever the expectation exists. Read P(X >= k) as: the value of X reaches level k.",
              steps: [
                { label: "Example value", math: "If X = 4, then X>=1, X>=2, X>=3, X>=4 are true", note: "The value 4 is counted once at each of the first four levels." },
                { label: "Counting by levels", math: "X = 1{X>=1} + 1{X>=2} + 1{X>=3} + ...", note: "Only the levels up to X turn on." },
                { label: "Take expectation", math: "E[X] = P(X>=1) + P(X>=2) + P(X>=3) + ...", note: "This is just the indicator idea applied to height levels." }
              ]
            },
            {
              type: "example",
              title: "Example 3.19: geometric expectation",
              body: "A request succeeds with probability p on each attempt, independently. Let X be the attempt number of the first success. We want E[X], the average number of attempts until success.",
              steps: [
                { label: "Understand X >= 1", math: "P(X>=1) = 1", note: "You always make at least one attempt." },
                { label: "Understand X >= 2", math: "P(X>=2) = 1-p", note: "To need a second attempt, the first attempt must fail." },
                { label: "Understand X >= 3", math: "P(X>=3) = (1-p)^2", note: "To need a third attempt, the first two attempts must fail." },
                { label: "General level", math: "P(X>=k) = (1-p)^(k-1)", note: "To reach attempt k, the first k-1 attempts must fail." },
                { label: "Add the tails", math: "E[X] = 1 + (1-p) + (1-p)^2 + ...", note: "This is an infinite geometric series." },
                { label: "Sum the series", math: "E[X] = 1 / (1-(1-p)) = 1/p", note: "If success chance is small, the average wait is large." }
              ]
            },
            {
              type: "example",
              title: "Example 3.20: first head",
              body: "Toss a fair coin until the first head. Let X be the toss number of the first head. We will compute the expectation slowly using tail sums.",
              steps: [
                { label: "Reach toss 1", math: "P(X>=1) = 1", note: "You must toss once." },
                { label: "Reach toss 2", math: "P(X>=2) = P(first toss is T) = 1/2", note: "You need a second toss only if the first toss failed to be H." },
                { label: "Reach toss 3", math: "P(X>=3) = P(first two tosses are TT) = 1/4", note: "Two failures are needed." },
                { label: "Reach toss 4", math: "P(X>=4) = P(first three tosses are TTT) = 1/8", note: "Three failures are needed." },
                { label: "Add the levels", math: "E[X] = 1 + 1/2 + 1/4 + 1/8 + ...", note: "Each term is the chance that the waiting time reaches that level." },
                { label: "Compute", math: "E[X] = 1/(1-1/2) = 2", note: "On average, the first head appears after 2 tosses." }
              ]
            },
            {
              type: "example",
              title: "Picture: shrinking tails",
              body: "Each row asks whether the waiting time reaches that level. For first head, reaching level 4 means the first three tosses were tails.",
              visual: {
                type: "tail",
                caption: "Tail probabilities for a fair coin: 1, 1/2, 1/4, 1/8, ...",
                levels: [
                  { label: "X >= 1", width: 100, value: "1" },
                  { label: "X >= 2", width: 50, value: "1/2" },
                  { label: "X >= 3", width: 25, value: "1/4" },
                  { label: "X >= 4", width: 13, value: "1/8" }
                ]
              }
            },
            {
              type: "example",
              title: "Example 3.21: why it is easier",
              body: "For waiting time, P(X = k) says fail k - 1 times and then succeed. P(X >= k) says only fail k - 1 times. The tail event has one less condition, so the algebra is usually cleaner.",
              steps: [
                { label: "Exact event", math: "P(X=k) = (1-p)^(k-1)p", note: "This includes the final success on trial k." },
                { label: "Tail event", math: "P(X>=k) = (1-p)^(k-1)", note: "This only says the first k-1 trials failed." },
                { label: "Why this helps", math: "E[X] = sum P(X>=k)", note: "The tail formula removes the extra p and the multiplier k." }
              ]
            },
            {
              type: "example",
              title: "Worked comparison with p = 1/5",
              body: "Suppose each attempt succeeds with probability 1/5. Direct PMF calculation is possible, but tail sums show the answer with less clutter.",
              steps: [
                { label: "Exact probabilities", math: "P(X=k) = (4/5)^(k-1)(1/5)", note: "This says fail k-1 times, then succeed." },
                { label: "Direct expectation", math: "E[X] = sum k(4/5)^(k-1)(1/5)", note: "This is correct, but the factor k makes the series harder to sum." },
                { label: "Tail probabilities", math: "P(X>=k) = (4/5)^(k-1)", note: "This says only that the first k-1 attempts failed." },
                { label: "Tail expectation", math: "E[X] = 1 + 4/5 + (4/5)^2 + (4/5)^3 + ...", note: "Now it is a plain geometric series." },
                { label: "Compute the sum", math: "E[X] = 1/(1-4/5) = 5", note: "With success chance 1/5, the average wait is 5 attempts." }
              ]
            },
            {
              type: "example",
              title: "Finite tail-sum example",
              body: "Tail sums are not only for infinite waiting times. They also work for a bounded count. Suppose X is the number of heads in three fair coin tosses.",
              steps: [
                { label: "Possible values", math: "X can be 0, 1, 2, or 3", note: "So the tail sum stops after level 3." },
                { label: "Reach level 1", math: "P(X>=1) = 1 - P(no heads) = 1 - 1/8 = 7/8", note: "At least one head." },
                { label: "Reach level 2", math: "P(X>=2) = P(exactly 2 heads) + P(3 heads) = 3/8 + 1/8 = 4/8", note: "Two or more heads." },
                { label: "Reach level 3", math: "P(X>=3) = P(3 heads) = 1/8", note: "All three tosses are heads." },
                { label: "Add tails", math: "E[X] = 7/8 + 4/8 + 1/8 = 12/8 = 3/2", note: "This matches the usual binomial mean np = 3 x 1/2." }
              ]
            },
            {
              type: "principle",
              title: "Direct PMF versus tail sum",
              body: "Both methods are correct. The direct PMF method asks for exact stopping times and then weights them by k. The tail-sum method stacks the waiting-time bars by height, which is often easier to add.",
              formulas: [
                { label: "Direct", formula: "E[X]=sum k(1-p)^(k-1)p", note: "correct, but algebra is heavier" },
                { label: "Tail", formula: "E[X]=sum (1-p)^(k-1)=1/p", note: "same answer, cleaner series" }
              ],
              steps: [
                { label: "Start with tails", math: "E[X] = P(X>=1) + P(X>=2) + P(X>=3) + ...", note: "Think of adding horizontal layers of the waiting time." },
                { label: "Substitute", math: "E[X] = 1 + (1-p) + (1-p)^2 + ...", note: "Each extra level requires one more failure." },
                { label: "Use geometric sum", math: "1 + r + r^2 + ... = 1/(1-r), where r=1-p", note: "This is the standard infinite geometric series." },
                { label: "Finish", math: "E[X] = 1/(1-(1-p)) = 1/p", note: "If p=1/5, the average wait is 5 attempts." }
              ]
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
            },
            {
              type: "example",
              title: "Picture: monotone and non-monotone",
              body: "For Y=2X+5, one X value gives one Y value and the order stays the same. For Y=X^2, both -2 and 2 give 4, so probability questions must collect pieces from both sides.",
              visual: {
                type: "flow",
                steps: ["Y=2X+5: one cutoff", "Y=X^2: split into cases", "translate back to X"],
                caption: "Transformations are solved by turning the Y question into an X question."
              }
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
    },
    {
      id: "gate-da-variance-standard-deviation-tail-bounds",
      exam: "GATE DA",
      accountTier: "Basic",
      subject: "Probability",
      chapter: "Chapter 4",
      section: "4",
      title: "Variance, Standard Deviation, and Tail Bounds",
      summary: "Variance and standard deviation as measures of spread, distribution variance derivations from Chapter 3 models, and Markov, Chebyshev, and Chernoff tail bounds.",
      sectionPreview: "Expectation tells us the centre of a random variable, but it does not tell us whether values usually stay near that centre. Variance measures average squared distance from the mean. Standard deviation turns that spread back into the original units. Tail bounds then ask: using only this limited information, how much can we say about being far from the mean?",
      previewActivity: "Two variables both have mean 5. Variable A is always 5. Variable B is 0 half the time and 10 half the time. Which one is more predictable? Try to describe the difference before using formulas. This chapter gives that difference a number.",
      chapterIntro: [
        "Chapter 3 built the language of random variables and expectation. Chapter 4 asks the next question: how much does the random variable move around its mean?",
        "The mean is one piece of information. It is the balance point, but many different distributions can share the same mean. Variance adds a second piece of information: the average squared distance from that balance point.",
        "This chapter keeps the focus concrete. We define variance and standard deviation, learn the main computational shortcut, derive the variance of the distributions from Chapter 3, and end with tail bounds that show how each guarantee depends on the information we know."
      ],
      bookSections: [
        {
          number: "4.1",
          title: "Why Spread Matters",
          paragraphs: [
            "A mean without a spread measure can be misleading. If X is always 5, then X has mean 5 and no uncertainty. If Y is 0 with probability 1/2 and 10 with probability 1/2, then Y also has mean 5, but it is never equal to 5.",
            "Both variables have the same centre. They do not have the same reliability. Spread measures how far values usually sit from the centre.",
            "For exam problems, this distinction matters whenever the question asks for risk, error, fluctuation, concentration, or probability of being far from the mean."
          ],
          blocks: [
            {
              type: "example",
              title: "Same mean, different spread",
              body: "Let X=5 always. Let Y be 0 or 10 with equal probability. E[X]=5 and E[Y]=5, but X is perfectly stable while Y is always 5 units away from its mean.",
              formulas: [
                { label: "Stable variable", formula: "E[X]=5, distance from mean is always 0", note: "no spread" },
                { label: "Variable with swings", formula: "E[Y]=5, distance from mean is always 5", note: "large spread" }
              ]
            },
            {
              type: "principle",
              title: "Information levels",
              body: "Mean, variance, and full distribution are different levels of information. Each extra level can answer sharper questions.",
              formulas: [
                { label: "Mean", formula: "E[X]", note: "centre only" },
                { label: "Mean plus variance", formula: "E[X], Var(X)", note: "centre plus average squared distance" },
                { label: "Full distribution", formula: "PMF/PDF/CDF", note: "exact probabilities when available" }
              ]
            }
          ]
        },
        {
          number: "4.2",
          title: "Variance and Standard Deviation",
          paragraphs: [
            "Variance is the expected squared distance from the mean. If mu = E[X], then Var(X) = E[(X-mu)^2].",
            "We square the distance for two reasons. First, positive and negative deviations should not cancel. Second, large deviations should count more heavily than small deviations.",
            "Because variance uses squared deviations, its unit is squared. If X is measured in marks, variance is in squared marks. Standard deviation is the square root of variance, so it returns to the original unit."
          ],
          blocks: [
            {
              type: "definition",
              title: "Definition: variance",
              body: "Variance is the average squared distance from the mean.",
              formulas: [
                { label: "Variance", formula: "Var(X)=E[(X-E[X])^2]", note: "average squared deviation" },
                { label: "Standard deviation", formula: "SD(X)=sqrt(Var(X))", note: "spread in the original unit" }
              ]
            },
            {
              type: "warning",
              title: "Common trap",
              body: "Variance cannot be negative. It is an average of squared quantities. If your answer is negative, the algebra has gone wrong."
            }
          ]
        },
        {
          number: "4.3",
          title: "The Computational Formula",
          paragraphs: [
            "The definition Var(X)=E[(X-mu)^2] explains the meaning, but the shortcut Var(X)=E[X^2]-(E[X])^2 is usually easier for computation.",
            "This formula says variance needs two moments: the first moment E[X] and the second moment E[X^2]. The mean alone is not enough.",
            "A good exam habit is to ask: do I know E[X] and E[X^2], or can I compute them quickly from the PMF, PDF, indicators, or tail-sum style identities?"
          ],
          blocks: [
            {
              type: "example",
              title: "Derivation of the shortcut",
              body: "Expand the squared deviation and use linearity of expectation.",
              steps: [
                { label: "Name the mean", math: "mu = E[X]", note: "Treat mu as a constant." },
                { label: "Start from definition", math: "Var(X)=E[(X-mu)^2]", note: "This is the meaning of variance." },
                { label: "Expand the square", math: "E[(X-mu)^2]=E[X^2-2mu X+mu^2]", note: "Ordinary algebra inside expectation." },
                { label: "Use linearity", math: "E[X^2]-2mu E[X]+mu^2", note: "Constants pull out of expectation." },
                { label: "Substitute E[X]=mu", math: "E[X^2]-2mu^2+mu^2=E[X^2]-mu^2", note: "So Var(X)=E[X^2]-(E[X])^2." }
              ]
            },
            {
              type: "principle",
              title: "Main computation route",
              body: "Most variance computations in this chapter follow the same path.",
              visual: {
                type: "flow",
                steps: ["Find E[X]", "Find E[X^2]", "Subtract (E[X])^2"],
                caption: "Variance uses second-moment information, not only the mean."
              }
            }
          ]
        },
        {
          number: "4.4",
          title: "Shifting and Scaling",
          paragraphs: [
            "Adding a constant moves every value by the same amount, so it changes the mean but not the spread. Multiplying by a constant stretches all distances from the mean.",
            "If Y=aX+b, then Var(Y)=a^2 Var(X). Standard deviation scales by |a|.",
            "This is a useful check on units. If marks are doubled, the standard deviation doubles, while the variance is multiplied by four."
          ],
          blocks: [
            {
              type: "example",
              title: "Derivation",
              body: "Use the definition of variance and the fact that E[aX+b]=aE[X]+b.",
              steps: [
                { label: "Mean of transformed variable", math: "E[aX+b]=aE[X]+b", note: "The centre shifts and scales." },
                { label: "Subtract the new mean", math: "(aX+b)-(aE[X]+b)=a(X-E[X])", note: "The b cancels." },
                { label: "Square the deviation", math: "[a(X-E[X])]^2=a^2(X-E[X])^2", note: "Distances are squared." },
                { label: "Take expectation", math: "Var(aX+b)=a^2 Var(X)", note: "Only the scale affects spread." }
              ]
            },
            {
              type: "principle",
              title: "Shortcut",
              body: "Location changes do not change variance. Scale changes variance by the square of the scale.",
              formulas: [
                { label: "Shift", formula: "Var(X+b)=Var(X)", note: "same spread" },
                { label: "Scale", formula: "Var(aX)=a^2 Var(X)", note: "squared scale" },
                { label: "Standard deviation", formula: "SD(aX+b)=|a| SD(X)", note: "original unit scale" }
              ]
            }
          ]
        },
        {
          number: "4.5",
          title: "Bernoulli and Binomial Variance",
          paragraphs: [
            "Bernoulli variance is the base case. Since a Bernoulli variable is only 0 or 1, X^2=X. That makes the second moment easy.",
            "A binomial variable is a sum of independent Bernoulli switches. For independent variables, variances add. This gives Var(X)=np(1-p).",
            "The result also makes sense: if p is near 0 or 1, the count is more predictable. The spread is largest around p=1/2."
          ],
          blocks: [
            {
              type: "example",
              title: "Bernoulli(p) derivation",
              body: "Use X^2=X for a 0-1 switch.",
              steps: [
                { label: "Mean", math: "E[X]=p", note: "From Chapter 3." },
                { label: "Second moment", math: "E[X^2]=0^2(1-p)+1^2p=p", note: "For 0 and 1 values, squaring changes nothing." },
                { label: "Subtract square of mean", math: "Var(X)=p-p^2=p(1-p)", note: "This is the variance of one switch." }
              ]
            },
            {
              type: "example",
              title: "Binomial(n,p) derivation",
              body: "Write the binomial count as independent Bernoulli switches.",
              steps: [
                { label: "Split the count", math: "X=I1+I2+...+In", note: "Each Ii is Bernoulli(p)." },
                { label: "Use independent variance addition", math: "Var(X)=Var(I1)+...+Var(In)", note: "Independence matters for variance." },
                { label: "Use Bernoulli variance", math: "Var(X)=p(1-p)+...+p(1-p)=np(1-p)", note: "There are n identical switches." }
              ]
            }
          ]
        },
        {
          number: "4.6",
          title: "Geometric Variance",
          paragraphs: [
            "For the geometric distribution in this course, X is the trial number of the first success. Its mean is 1/p.",
            "A direct computation from the PMF is possible, but the series with k^2 is heavy. A cleaner route is to compute E[X(X-1)] first, then use X^2=X(X-1)+X.",
            "The final answer Var(X)=(1-p)/p^2 shows that rare success creates large spread. When p is small, the waiting time is not only large on average; it also fluctuates a lot."
          ],
          blocks: [
            {
              type: "example",
              title: "Geometric(p) derivation",
              body: "Use the second factorial moment, then convert to E[X^2].",
              steps: [
                { label: "Known mean", math: "E[X]=1/p", note: "From the tail-sum formula in Chapter 3." },
                { label: "Use a series identity", math: "E[X(X-1)] = sum k(k-1)(1-p)^(k-1)p = 2(1-p)/p^2", note: "This follows from differentiating the geometric series twice." },
                { label: "Convert to second moment", math: "X^2=X(X-1)+X", note: "So E[X^2]=E[X(X-1)]+E[X]." },
                { label: "Compute E[X^2]", math: "E[X^2]=2(1-p)/p^2+1/p=(2-p)/p^2", note: "Put terms over p^2." },
                { label: "Subtract mean square", math: "Var(X)=(2-p)/p^2-1/p^2=(1-p)/p^2", note: "This is the waiting-time variance." }
              ]
            },
            {
              type: "warning",
              title: "Convention check",
              body: "This formula uses the convention X=1,2,3,... for the first success trial. If a book counts failures before first success, the mean and variance formulas look different."
            }
          ]
        },
        {
          number: "4.7",
          title: "Hypergeometric Variance",
          paragraphs: [
            "Hypergeometric counts successes when sampling without replacement. The mean n(K/N) came easily from indicators, even though the draws are dependent.",
            "Variance is more sensitive. Dependence now matters because two sampled positions are not independent. If one draw is a success, there are fewer successes left for another draw.",
            "The final variance is the binomial-looking term n p(1-p) multiplied by a finite population correction: (N-n)/(N-1), where p=K/N."
          ],
          blocks: [
            {
              type: "example",
              title: "Hypergeometric(N,K,n) derivation idea",
              body: "Use indicators and include pair terms. This shows exactly where dependence enters.",
              steps: [
                { label: "Split the count", math: "X=I1+I2+...+In", note: "Ij is 1 if draw j is a success." },
                { label: "One switch variance", math: "Var(Ij)=p(1-p), where p=K/N", note: "Each position has success probability K/N." },
                { label: "Pair dependence", math: "E[Ii Ij]=K(K-1)/(N(N-1)) for i not equal j", note: "Both positions must receive success items." },
                { label: "Covariance is negative", math: "E[Ii Ij]-p^2 = -p(1-p)/(N-1)", note: "Sampling without replacement creates negative dependence." },
                { label: "Add variances and pair terms", math: "Var(X)=n p(1-p)+n(n-1)[-p(1-p)/(N-1)]", note: "There are n(n-1) ordered pair terms." },
                { label: "Factor", math: "Var(X)=n p(1-p)(N-n)/(N-1)", note: "This is the finite population correction." }
              ]
            },
            {
              type: "principle",
              title: "Interpretation",
              body: "Without replacement reduces spread compared with independent sampling because successes get used up.",
              formulas: [
                { label: "Binomial-style part", formula: "n p(1-p)", note: "what independent draws would give" },
                { label: "Correction", formula: "(N-n)/(N-1)", note: "less than or equal to 1" }
              ]
            }
          ]
        },
        {
          number: "4.8",
          title: "Uniform Variance",
          paragraphs: [
            "Uniform(a,b) spreads probability evenly over an interval. Its mean is the midpoint (a+b)/2.",
            "The variance depends only on the interval length b-a, not on where the interval sits on the number line. This matches the shifting rule: moving an interval should not change its spread.",
            "The cleanest derivation computes E[X^2] by integration and subtracts the square of the mean."
          ],
          blocks: [
            {
              type: "example",
              title: "Uniform(a,b) derivation",
              body: "Use the density f(x)=1/(b-a) on [a,b].",
              steps: [
                { label: "Mean", math: "E[X]=(a+b)/2", note: "From Chapter 3." },
                { label: "Second moment", math: "E[X^2]=integral_a^b x^2/(b-a) dx", note: "Use LOTUS for a continuous variable." },
                { label: "Integrate", math: "E[X^2]=(b^3-a^3)/(3(b-a))=(a^2+ab+b^2)/3", note: "Factor b^3-a^3=(b-a)(b^2+ab+a^2)." },
                { label: "Subtract mean square", math: "Var(X)=(a^2+ab+b^2)/3 - (a+b)^2/4", note: "Put over denominator 12." },
                { label: "Simplify", math: "Var(X)=(b-a)^2/12", note: "Only interval length matters." }
              ]
            },
            {
              type: "example",
              title: "Uniform(0,1)",
              body: "For a random point on [0,1], the variance is 1/12 and the standard deviation is sqrt(1/12).",
              formulas: [
                { label: "Mean", formula: "1/2", note: "midpoint" },
                { label: "Variance", formula: "1/12", note: "unit interval spread" }
              ]
            }
          ]
        },
        {
          number: "4.9",
          title: "What Variance Can Tell Us",
          paragraphs: [
            "Variance does not give the whole distribution. It compresses spread into one number. That compression is useful, but it loses shape information.",
            "If we know the full PMF or PDF, we can compute exact tail probabilities such as P(|X-mu|>=t). If we know only mean and variance, we can still say something, but the statement must be more conservative.",
            "This is the idea behind tail bounds. A tail bound gives an upper limit on the probability that a random variable is far from its mean."
          ],
          blocks: [
            {
              type: "principle",
              title: "From information to guarantee",
              body: "Less information means weaker but more general guarantees.",
              visual: {
                type: "flow",
                steps: ["Mean only: centre", "Mean + variance: spread guarantee", "Full distribution: exact tail probability"],
                caption: "Tail bounds trade precision for generality."
              }
            }
          ]
        },
        {
          number: "4.10",
          title: "Markov Tail Bound",
          paragraphs: [
            "Markov's inequality is the first tail bound. It applies to nonnegative random variables and uses only the mean.",
            "If X is nonnegative, then P(X >= a) <= E[X]/a for a>0. The idea is simple: if the average amount is small, not too much probability can sit very far to the right.",
            "Markov is broad but weak. It knows only the mean, so it cannot see whether the distribution is tightly concentrated or very spread out."
          ],
          blocks: [
            {
              type: "principle",
              title: "Markov's inequality",
              body: "For a nonnegative random variable, the chance of being at least a is at most the mean divided by a.",
              formulas: [
                { label: "Markov", formula: "P(X >= a) <= E[X]/a", note: "requires X >= 0 and a > 0" },
                { label: "Mean-only information", formula: "uses E[X]", note: "no variance or distribution shape" }
              ]
            },
            {
              type: "example",
              title: "Example: waiting cost",
              body: "If a nonnegative cost X has mean 20, then Markov says the chance that X is at least 100 is at most 20/100.",
              steps: [
                { label: "Identify mean and cutoff", math: "E[X]=20, a=100", note: "X must be nonnegative." },
                { label: "Apply Markov", math: "P(X >= 100) <= 20/100 = 1/5", note: "This is a guarantee, not an exact probability." }
              ]
            },
            {
              type: "warning",
              title: "Use condition",
              body: "Do not apply Markov directly to a variable that can be negative. For distance from the mean, apply Markov to a nonnegative transformed variable such as (X-mu)^2. That gives Chebyshev."
            }
          ]
        },
        {
          number: "4.11",
          title: "Chebyshev Tail Bound",
          paragraphs: [
            "Chebyshev's inequality says that any random variable with finite variance is unlikely to be many standard deviations away from its mean. It does not require normality, symmetry, or a known distribution shape.",
            "If mu=E[X] and sigma=SD(X), then P(|X-mu| >= k sigma) <= 1/k^2 for k>0.",
            "The strength is that the result uses only mean and variance. The weakness is that the bound can be loose because it must work for many possible distributions with the same mean and variance."
          ],
          blocks: [
            {
              type: "principle",
              title: "Chebyshev's inequality",
              body: "At least 1 - 1/k^2 of the probability lies within k standard deviations of the mean.",
              formulas: [
                { label: "Tail form", formula: "P(|X-mu| >= k sigma) <= 1/k^2", note: "outside k standard deviations" },
                { label: "Inside form", formula: "P(|X-mu| < k sigma) >= 1 - 1/k^2", note: "within k standard deviations" }
              ]
            },
            {
              type: "example",
              title: "Derivation from Markov",
              body: "Chebyshev is Markov applied to squared distance from the mean.",
              steps: [
                { label: "Make a nonnegative variable", math: "Y=(X-mu)^2", note: "Squared distance is always nonnegative." },
                { label: "Apply Markov", math: "P(Y >= a^2) <= E[Y]/a^2", note: "Use cutoff a^2." },
                { label: "Translate back", math: "P(|X-mu| >= a) <= Var(X)/a^2", note: "The event Y >= a^2 is the same as distance at least a." },
                { label: "Use standard deviations", math: "a=k sigma", note: "Then Var(X)/a^2 = sigma^2/(k^2 sigma^2)=1/k^2." }
              ]
            },
            {
              type: "example",
              title: "Example: two standard deviations",
              body: "For any distribution with finite variance, the chance of being at least 2 standard deviations from the mean is at most 1/4.",
              steps: [
                { label: "Use k=2", math: "P(|X-mu| >= 2sigma) <= 1/2^2", note: "Chebyshev uses standard-deviation units." },
                { label: "Compute", math: "P(|X-mu| >= 2sigma) <= 1/4", note: "So at least 3/4 lies within 2 standard deviations." }
              ]
            },
            {
              type: "warning",
              title: "Interpretation trap",
              body: "Chebyshev gives an upper bound, not the exact probability. If the bound says at most 1/4, the true probability might be much smaller."
            }
          ]
        },
        {
          number: "4.12",
          title: "Chernoff Bounds for Independent Counts",
          paragraphs: [
            "Chernoff bounds are sharper tail bounds for sums of independent Bernoulli variables. They use more information than Chebyshev: not only the mean and variance, but also the independence and bounded 0-1 structure of the summands.",
            "For GATE-style probability, the main idea is more important than memorising every version. Markov uses the mean of X. Chebyshev uses the mean and variance of X. Chernoff applies Markov to an exponential transform and uses independence to multiply moment-generating pieces.",
            "When X is a binomial-style count with mean mu=np, Chernoff gives exponentially small upper bounds for large deviations. This is why it is much stronger than Chebyshev for many independent-trial counts."
          ],
          blocks: [
            {
              type: "principle",
              title: "Multiplicative Chernoff forms",
              body: "If X is a sum of independent Bernoulli variables with mean mu, then these common forms bound upper and lower tails.",
              formulas: [
                { label: "Upper tail", formula: "P(X >= (1+delta)mu) <= exp(-mu delta^2/3)", note: "for 0 < delta <= 1" },
                { label: "Lower tail", formula: "P(X <= (1-delta)mu) <= exp(-mu delta^2/2)", note: "for 0 < delta < 1" }
              ]
            },
            {
              type: "example",
              title: "Why exponentials appear",
              body: "Chernoff uses Markov on exp(tX), which is nonnegative. Independence lets us factor E[exp(tX)] across the Bernoulli pieces.",
              steps: [
                { label: "Start from a tail", math: "P(X >= a)", note: "Hard to bound directly." },
                { label: "Exponentiate", math: "P(exp(tX) >= exp(ta))", note: "For t>0, this is the same upper-tail event." },
                { label: "Apply Markov", math: "P(exp(tX) >= exp(ta)) <= E[exp(tX)]/exp(ta)", note: "Now Markov can be used." },
                { label: "Use independence", math: "E[exp(tX)] = product E[exp(tIi)]", note: "This is where independent Bernoulli structure enters." },
                { label: "Optimise t", math: "choose t to make the bound smallest", note: "The simplified result becomes an exponential tail bound." }
              ]
            },
            {
              type: "example",
              title: "Example: independent successes",
              body: "Suppose X counts successes in 100 independent trials with p=0.2, so mu=20. Bound the chance of seeing at least 30 successes.",
              steps: [
                { label: "Find relative deviation", math: "30=(1+delta)20", note: "So delta=1/2." },
                { label: "Apply upper-tail Chernoff", math: "P(X >= 30) <= exp(-20(1/2)^2/3)", note: "Use the 0 < delta <= 1 form." },
                { label: "Simplify exponent", math: "exp(-20/12)=exp(-5/3)", note: "The bound is about 0.19. It is not exact, but it decays exponentially as mu grows." }
              ]
            },
            {
              type: "warning",
              title: "Use condition",
              body: "Chernoff is not a generic variance bound. Use it for sums of independent bounded variables, especially Bernoulli indicators. If you only know mean and variance, use Chebyshev instead."
            }
          ]
        }
      ],
      concepts: [
        {
          name: "Variance",
          description: "Average squared distance from the mean.",
          cue: "Use when the question asks about spread, fluctuation, or distance from the expected value."
        },
        {
          name: "Standard deviation",
          description: "Square root of variance, measured in the original units.",
          cue: "Use when spread needs to be interpreted in the same unit as X."
        },
        {
          name: "Second moment",
          description: "The value E[X^2], used with E[X] to compute variance.",
          cue: "Use the shortcut Var(X)=E[X^2]-(E[X])^2."
        },
        {
          name: "Independent variance addition",
          description: "For independent variables, variance of a sum is the sum of variances.",
          cue: "Use for binomial counts built from independent Bernoulli switches."
        },
        {
          name: "Dependence in variance",
          description: "Dependence affects variance even when it did not affect expectation.",
          cue: "Use pair terms for hypergeometric or without-replacement counts."
        },
        {
          name: "Tail bound",
          description: "A guarantee about the probability of being far from the mean.",
          cue: "Use when exact tail probabilities are unavailable or unnecessary."
        },
        {
          name: "Markov's inequality",
          description: "A mean-only upper-tail bound for nonnegative random variables.",
          cue: "Use P(X >= a) <= E[X]/a when X cannot be negative."
        },
        {
          name: "Chebyshev's inequality",
          description: "A distribution-free bound based on mean and variance.",
          cue: "Use P(|X-mu| >= k sigma) <= 1/k^2."
        },
        {
          name: "Chernoff bound",
          description: "An exponential tail bound for sums of independent Bernoulli variables.",
          cue: "Use for binomial-style counts when independence and 0-1 structure are known."
        }
      ],
      techniques: [
        {
          name: "Compute by second moment",
          when: "you know or can compute E[X] and E[X^2].",
          move: "Use Var(X)=E[X^2]-(E[X])^2."
        },
        {
          name: "Use 0-1 simplification",
          when: "X is Bernoulli or an indicator.",
          move: "Use X^2=X, so E[X^2]=E[X]=P(X=1)."
        },
        {
          name: "Split independent counts",
          when: "X is a sum of independent switches.",
          move: "Add the switch variances to get the variance of the total."
        },
        {
          name: "Track pair terms",
          when: "the count is built from dependent indicators.",
          move: "Compute E[Ii Ij] or the covariance contribution instead of assuming variance adds."
        },
        {
          name: "Use integration for continuous variables",
          when: "X has a PDF and the question asks for variance.",
          move: "Integrate x^2 f(x) to get E[X^2], then subtract the square of the mean."
        },
        {
          name: "Apply scaling rules",
          when: "the variable is transformed as aX+b.",
          move: "Use Var(aX+b)=a^2 Var(X) and SD(aX+b)=|a| SD(X)."
        },
        {
          name: "Use Markov",
          when: "X is nonnegative and only its mean is known.",
          move: "Bound P(X >= a) by E[X]/a."
        },
        {
          name: "Use Chebyshev",
          when: "you only know mean and variance but need a far-from-mean probability bound.",
          move: "Convert the distance to k standard deviations, then bound the tail by 1/k^2."
        },
        {
          name: "Use Chernoff",
          when: "X is a sum of independent Bernoulli indicators and the deviation is from a binomial-style mean.",
          move: "Convert the cutoff to (1+delta)mu or (1-delta)mu, then apply the matching exponential bound."
        }
      ],
      practiceProblems: variancePracticeProblems(),
      reviewPrompts: [
        "Give two random variables with the same mean but different variance, and explain the difference in words.",
        "Why does Var(X+c)=Var(X), but Var(cX)=c^2 Var(X)?",
        "Derive Bernoulli variance without memorising the formula.",
        "Explain why binomial variance uses independence but binomial expectation did not need to emphasise it.",
        "In hypergeometric sampling, why should the variance be smaller than the corresponding binomial variance?",
        "What information does Markov use, and why is it usually weak?",
        "What information does Chebyshev use, and what information does it ignore?",
        "Why can Chernoff be much sharper than Chebyshev for independent Bernoulli sums?"
      ],
      reviewQuiz: {
        id: "quiz-probability-chapter-4-objective-review",
        title: "Probability Chapter 4 Objective Review",
        instructions: "Complete this after finishing Chapter 4 exposition and labelled practice. The quiz logs objective answers and diagnoses variance, standard deviation, distribution derivations, and tail-bound reasoning.",
        questions: varianceReviewQuestions()
      },
      readingQuestions: [
        "What does variance measure that expectation does not?",
        "Why is standard deviation often easier to interpret than variance?",
        "What are the two quantities needed for Var(X)=E[X^2]-(E[X])^2?",
        "Where does independence enter the binomial variance derivation?",
        "How does Markov lead to Chebyshev?",
        "Why is Chebyshev useful even when it is not sharp?",
        "What extra information does Chernoff use beyond mean and variance?"
      ],
      chapterSummary: [
        "Variance is the average squared distance from the mean.",
        "Standard deviation is the square root of variance and has the same unit as X.",
        "The main computational shortcut is Var(X)=E[X^2]-(E[X])^2.",
        "Shifting a random variable does not change variance; scaling by a changes variance by a^2.",
        "Bernoulli(p) has variance p(1-p).",
        "Binomial(n,p) has variance np(1-p), using independent Bernoulli switches.",
        "Geometric(p), counting the first success trial, has variance (1-p)/p^2.",
        "Hypergeometric(N,K,n) has variance n p(1-p)(N-n)/(N-1), where p=K/N.",
        "Uniform(a,b) has variance (b-a)^2/12.",
        "Markov's inequality bounds a nonnegative upper tail using only the mean.",
        "Chebyshev's inequality bounds distance from the mean using only mean and variance.",
        "Chernoff bounds use independent Bernoulli structure to give exponential tail bounds."
      ],
      updatedAt
    },
    {
      id: "gate-da-joint-distributions",
      exam: "GATE DA",
      accountTier: "Basic",
      subject: "Probability",
      chapter: "Chapter 5",
      section: "5",
      title: "Joint Distributions",
      summary: "Joint PMFs and PDFs, marginals, conditional distributions, independence of random variables, support regions, and simple transformations from joint laws.",
      sectionPreview: "A single random variable tells one part of a story. Many probability questions need two quantities at once: two dice, height and weight, score and time, two component lifetimes, or two measurements from the same experiment. A joint distribution describes how two random variables behave together.",
      previewActivity: "Two fair dice are rolled. Let X be the first die and S be the sum. If you know S=10, what values can X take? Is X still uniform on {1,2,3,4,5,6}? Try this before reading. The point is that information about one variable changes the distribution of another.",
      chapterIntro: [
        "Chapters 3 and 4 mostly studied one random variable at a time. Chapter 5 starts the two-variable language needed for covariance, correlation, and conditional expectation.",
        "A joint distribution is the full probability description for a pair. From it, we can recover each variable's own distribution, ask conditional questions, check independence, and find probabilities over regions.",
        "The most important habit in this chapter is to respect the support. For discrete variables, the support is the set of allowed pairs. For continuous variables, it is the region where the density lives."
      ],
      bookSections: [
        {
          number: "5.1",
          title: "Why One Random Variable Is Not Enough",
          paragraphs: [
            "Many experiments produce more than one useful number. In two dice, we may care about the first die and the sum. In a data problem, we may care about study time and score. In reliability, we may care about the lifetimes of two components.",
            "Knowing the distribution of each variable separately is not always enough. Two variables can have the same individual distributions but very different relationships.",
            "The joint distribution records probabilities for pairs. It is the object that lets us ask how variables interact."
          ],
          blocks: [
            {
              type: "example",
              title: "Example: first die and sum",
              body: "Roll two fair dice. Let X be the first die and S be the sum. X alone is uniform on 1 through 6. S alone has a triangular distribution. Their joint distribution answers questions like P(X=4 and S=9).",
              steps: [
                { label: "Translate the pair", math: "X=4 and S=9", note: "The first die is 4 and the total is 9." },
                { label: "Find second die", math: "second die = 5", note: "Only outcome (4,5) works." },
                { label: "Compute probability", math: "P(X=4, S=9)=1/36", note: "There are 36 ordered dice outcomes." }
              ]
            },
            {
              type: "principle",
              title: "Joint information",
              body: "The joint distribution is stronger than the two marginal distributions because it keeps the pairing information.",
              visual: {
                type: "flow",
                steps: ["Experiment", "Pair (X,Y)", "Joint law", "Marginals and conditionals"],
                caption: "The joint law is the source; marginals and conditionals are derived from it."
              }
            }
          ]
        },
        {
          number: "5.2",
          title: "Joint PMF for Discrete Random Variables",
          paragraphs: [
            "For discrete random variables X and Y, the joint PMF is p(x,y)=P(X=x and Y=y). It gives a probability for each allowed pair.",
            "All entries must be nonnegative, and the probabilities over all allowed pairs must add to 1.",
            "A joint PMF is often easiest to read as a table. Rows are values of X, columns are values of Y, and each cell is the probability of that pair."
          ],
          blocks: [
            {
              type: "definition",
              title: "Definition: joint PMF",
              body: "For discrete X and Y, the joint PMF is p(x,y)=P(X=x, Y=y).",
              formulas: [
                { label: "Nonnegative", formula: "p(x,y) >= 0", note: "each cell is a probability" },
                { label: "Total mass", formula: "sum_x sum_y p(x,y)=1", note: "all allowed pairs together" }
              ]
            },
            {
              type: "example",
              title: "Small joint table",
              body: "Suppose X and Y each take values 0 and 1, with p(0,0)=0.2, p(0,1)=0.3, p(1,0)=0.1, p(1,1)=0.4. The probabilities add to 1, so this is a valid joint PMF.",
              formulas: [
                { label: "Check", formula: "0.2+0.3+0.1+0.4=1", note: "valid total probability" },
                { label: "One pair", formula: "P(X=1,Y=1)=0.4", note: "read from the cell" }
              ]
            }
          ]
        },
        {
          number: "5.3",
          title: "Joint PDF for Continuous Random Variables",
          paragraphs: [
            "For continuous random variables, probabilities come from area under a surface. The joint PDF f(x,y) is a density over the plane or over a smaller support region.",
            "The probability of a region A is the double integral of f(x,y) over that region. The total integral over the full support must be 1.",
            "The density value f(x,y) is not itself a probability. Probability is volume under the density surface above a region."
          ],
          blocks: [
            {
              type: "definition",
              title: "Definition: joint PDF",
              body: "For continuous X and Y with joint density f, probabilities are found by integrating over regions.",
              formulas: [
                { label: "Region probability", formula: "P((X,Y) in A)=integral integral_A f(x,y) dx dy", note: "area in the xy-plane, volume under density" },
                { label: "Total mass", formula: "integral integral_support f(x,y) dx dy = 1", note: "valid density" }
              ]
            },
            {
              type: "example",
              title: "Uniform on a square",
              body: "If (X,Y) is uniform on the unit square 0<=x<=1, 0<=y<=1, then f(x,y)=1 on the square. The probability of any rectangle is its area.",
              steps: [
                { label: "Region", math: "0 <= X <= 1/2, 0 <= Y <= 1/3", note: "This is a rectangle inside the unit square." },
                { label: "Area", math: "(1/2)(1/3)=1/6", note: "Density is 1, so probability equals area." }
              ]
            }
          ]
        },
        {
          number: "5.4",
          title: "Marginal Distributions",
          paragraphs: [
            "A marginal distribution is the distribution of one variable after ignoring the other variable.",
            "For a joint PMF, add across the other variable. For a joint PDF, integrate out the other variable.",
            "The word marginal comes from table margins: row totals and column totals."
          ],
          blocks: [
            {
              type: "principle",
              title: "Marginal formulas",
              body: "Recover one-variable distributions from the joint law by summing or integrating out the other variable.",
              formulas: [
                { label: "Discrete X marginal", formula: "p_X(x)=sum_y p(x,y)", note: "add across y" },
                { label: "Discrete Y marginal", formula: "p_Y(y)=sum_x p(x,y)", note: "add across x" },
                { label: "Continuous X marginal", formula: "f_X(x)=integral f(x,y) dy", note: "integrate over allowed y" },
                { label: "Continuous Y marginal", formula: "f_Y(y)=integral f(x,y) dx", note: "integrate over allowed x" }
              ]
            },
            {
              type: "example",
              title: "Marginal from a table",
              body: "Using the small table from Section 5.2, P(X=0)=p(0,0)+p(0,1)=0.2+0.3=0.5. P(Y=1)=p(0,1)+p(1,1)=0.3+0.4=0.7.",
              steps: [
                { label: "Row total", math: "p_X(0)=0.2+0.3=0.5", note: "fix X=0, add over Y." },
                { label: "Column total", math: "p_Y(1)=0.3+0.4=0.7", note: "fix Y=1, add over X." }
              ]
            }
          ]
        },
        {
          number: "5.5",
          title: "Conditional Distributions",
          paragraphs: [
            "A conditional distribution tells us how one variable behaves after the other variable is known.",
            "For discrete variables, condition by dividing the joint probability by the marginal probability of the given value.",
            "For continuous variables, divide the joint density by the marginal density, within values where the marginal density is positive."
          ],
          blocks: [
            {
              type: "definition",
              title: "Conditional distribution",
              body: "Conditioning restricts the joint law to the slice where the observed variable has the given value, then renormalizes.",
              formulas: [
                { label: "Discrete", formula: "P(X=x | Y=y)=p(x,y)/p_Y(y)", note: "when p_Y(y)>0" },
                { label: "Continuous", formula: "f_{X|Y}(x|y)=f(x,y)/f_Y(y)", note: "when f_Y(y)>0" }
              ]
            },
            {
              type: "example",
              title: "Dice conditional distribution",
              body: "Roll two dice. Let X be the first die and S be the sum. Given S=10, the possible ordered outcomes are (4,6), (5,5), and (6,4). Therefore X can be 4, 5, or 6, each with conditional probability 1/3.",
              formulas: [
                { label: "Conditional support", formula: "X in {4,5,6} given S=10", note: "not all six values remain possible" },
                { label: "One value", formula: "P(X=4 | S=10)=1/3", note: "one of three equally likely sum-10 outcomes" }
              ]
            }
          ]
        },
        {
          number: "5.6",
          title: "Independence of Random Variables",
          paragraphs: [
            "Random variables X and Y are independent when knowing one gives no probability information about the other.",
            "For discrete variables, the joint PMF must factor into the product of marginals for every pair. For continuous variables, the joint PDF must factor on the support.",
            "Independence is a strong statement about the whole joint distribution, not just one event or one pair of values."
          ],
          blocks: [
            {
              type: "principle",
              title: "Factorization test",
              body: "Independence means the joint law is exactly the product of the marginal laws.",
              formulas: [
                { label: "Discrete", formula: "p(x,y)=p_X(x)p_Y(y) for all x,y", note: "all cells must match" },
                { label: "Continuous", formula: "f(x,y)=f_X(x)f_Y(y) on support", note: "density factorization" }
              ]
            },
            {
              type: "warning",
              title: "Common trap",
              body: "Checking one pair is not enough to prove independence. One failed pair can disprove independence, but proving independence requires the factorization to hold everywhere."
            }
          ]
        },
        {
          number: "5.7",
          title: "Support Regions and Bounds",
          paragraphs: [
            "For continuous joint densities, the support region is often the hardest part of the problem. The formula may be simple, but the integration bounds carry the real information.",
            "A rectangular support is usually easier because x and y bounds are independent. A triangular support or curved support forces one bound to depend on the other variable.",
            "Always draw or describe the support before integrating. This prevents using impossible pairs."
          ],
          blocks: [
            {
              type: "example",
              title: "Triangular support",
              body: "Suppose f(x,y)=2 on the triangle 0<y<x<1. To find f_X(x), hold x fixed and integrate y from 0 to x.",
              steps: [
                { label: "Support", math: "0 < y < x < 1", note: "For each x, y runs from 0 to x." },
                { label: "Marginal", math: "f_X(x)=integral_0^x 2 dy = 2x", note: "valid for 0<x<1." },
                { label: "Check", math: "integral_0^1 2x dx = 1", note: "The marginal integrates to 1." }
              ]
            },
            {
              type: "strategy",
              title: "Support-first procedure",
              body: "Before doing calculus, identify the allowed region and choose the easier order of integration.",
              visual: {
                type: "flow",
                steps: ["Write inequalities", "Sketch region", "Choose bounds", "Integrate"],
                caption: "Most joint-density mistakes are support mistakes."
              }
            }
          ]
        },
        {
          number: "5.8",
          title: "Sums, Min, Max, and Simple Transformations",
          paragraphs: [
            "A joint distribution lets us compute probabilities for new variables made from X and Y, such as X+Y, min(X,Y), max(X,Y), or X/Y.",
            "For discrete variables, collect all pairs that produce the target value. For continuous variables, CDF methods are often cleaner for min and max.",
            "The main idea is always translation: rewrite the event about the new variable as a region or set of pairs in the original (X,Y) space."
          ],
          blocks: [
            {
              type: "example",
              title: "Sum from pairs",
              body: "For two dice, P(X+Y=7) is found by collecting all ordered pairs on the line x+y=7.",
              formulas: [
                { label: "Pairs", formula: "(1,6),(2,5),(3,4),(4,3),(5,2),(6,1)", note: "six ordered pairs" },
                { label: "Probability", formula: "P(X+Y=7)=6/36=1/6", note: "sum event as a set of pairs" }
              ]
            },
            {
              type: "example",
              title: "Maximum of independent uniforms",
              body: "If X and Y are independent Uniform(0,1), then M=max(X,Y). The event M<=m means both X<=m and Y<=m.",
              steps: [
                { label: "Translate event", math: "M <= m means X <= m and Y <= m", note: "Both variables must be below m." },
                { label: "Use independence", math: "P(M<=m)=P(X<=m)P(Y<=m)", note: "For 0<=m<=1." },
                { label: "Compute", math: "P(M<=m)=m^2", note: "This is the CDF of the maximum." }
              ]
            }
          ]
        }
      ],
      concepts: [
        { name: "Joint distribution", description: "The probability law for a pair of random variables.", cue: "Use when a problem asks about two quantities together." },
        { name: "Joint PMF", description: "A probability table for discrete pairs.", cue: "Use P(X=x,Y=y) cells and make sure all cells add to 1." },
        { name: "Joint PDF", description: "A density over a two-dimensional support region.", cue: "Use double integrals over regions." },
        { name: "Marginal distribution", description: "The distribution of one variable after ignoring the other.", cue: "Sum or integrate out the other variable." },
        { name: "Conditional distribution", description: "The distribution of one variable after the other is known.", cue: "Divide joint by the relevant marginal." },
        { name: "Independence", description: "Knowing one variable does not change the law of the other.", cue: "Check whether the joint law factors into marginals." },
        { name: "Support region", description: "The allowed set of (x,y) pairs.", cue: "Draw or describe it before integrating." },
        { name: "Transformation", description: "A new variable made from X and Y.", cue: "Translate the new-variable event back to pairs or regions." }
      ],
      techniques: [
        { name: "Read a joint table", when: "X and Y are discrete.", move: "Use cells for joint probabilities, row totals for one marginal, and column totals for the other." },
        { name: "Integrate over a region", when: "X and Y are continuous.", move: "Write the support inequalities, choose bounds, and integrate the density over the target region." },
        { name: "Find marginals", when: "you need the distribution of one variable alone.", move: "Sum or integrate out the other variable." },
        { name: "Condition from the joint law", when: "one variable is observed.", move: "Divide the joint probability or density by the marginal of the observed value." },
        { name: "Test independence", when: "you need to decide whether variables interact.", move: "Check whether joint equals product of marginals everywhere." },
        { name: "Use support first", when: "the density has non-rectangular bounds.", move: "Draw the region and decide bounds before doing algebra." },
        { name: "Translate transformations", when: "the question asks about X+Y, min, max, or another function.", move: "Rewrite the event as a set of original (X,Y) pairs." }
      ],
      practiceProblems: jointDistributionPracticeProblems(),
      reviewPrompts: [
        "Why do marginal distributions not always determine the joint distribution?",
        "How do you recover p_X(x) from p(x,y)?",
        "What does f(x,y) represent in a continuous joint density?",
        "Why must support regions be handled before integration?",
        "How is a conditional distribution different from a marginal distribution?",
        "What does independence require beyond one matching probability?"
      ],
      reviewQuiz: {
        id: "quiz-probability-chapter-5-objective-review",
        title: "Probability Chapter 5 Objective Review",
        instructions: "Complete this after finishing Chapter 5 exposition and labelled practice. The quiz logs objective answers and diagnoses joint PMF/PDF, marginal, conditional, independence, support, and transformation reasoning.",
        questions: jointDistributionReviewQuestions()
      },
      readingQuestions: [
        "What information is present in a joint distribution but missing from two separate marginals?",
        "How do row and column totals connect to marginal distributions?",
        "Why is f(x,y) not itself a probability in the continuous case?",
        "How do you condition one random variable on another?",
        "What does independence look like as a factorization statement?",
        "Why are min and max problems often solved using CDF events?"
      ],
      chapterSummary: [
        "A joint distribution describes two random variables together.",
        "A joint PMF assigns probabilities to discrete pairs and all probabilities sum to 1.",
        "A joint PDF assigns density over a support region; probabilities are double integrals.",
        "Marginals are found by summing or integrating out the other variable.",
        "Conditional distributions divide the joint law by the relevant marginal law.",
        "Independence means the joint law factors into the product of the marginal laws.",
        "Support regions determine integration bounds and must be handled before calculation.",
        "Transformations such as sums, minima, and maxima are solved by translating events back to pairs or regions."
      ],
      updatedAt
    },
    {
      id: "gate-da-covariance-correlation",
      exam: "GATE DA",
      accountTier: "Basic",
      subject: "Probability",
      chapter: "Chapter 6",
      section: "6",
      title: "Covariance and Correlation",
      summary: "E[XY], covariance, correlation, independence versus zero covariance, variance of sums, and indicator-pair covariance.",
      sectionPreview: "A joint distribution tells us how two random variables behave together. Covariance turns that joint information into one number: do the variables tend to move in the same direction, in opposite directions, or not linearly together? Correlation scales covariance so the answer is easier to compare.",
      previewActivity: "Let X be 1 if a randomly chosen student studies at least two hours and 0 otherwise. Let Y be 1 if the student scores above 80 and 0 otherwise. What would positive covariance mean in words? What would negative covariance mean? Try answering before using formulas.",
      chapterIntro: [
        "Chapter 5 built joint distributions. Chapter 6 uses joint distributions to measure paired movement.",
        "The central quantity is E[XY]. It is not just another expectation; it measures how products behave under the joint law. From E[XY], we build covariance.",
        "Covariance has units and scale, so correlation standardizes it. This chapter also explains why independence is stronger than zero covariance, and why variance of a sum needs covariance terms."
      ],
      bookSections: [
        {
          number: "6.1",
          title: "Why Paired Movement Matters",
          paragraphs: [
            "Two variables can each have a clear individual distribution, but the useful question may be how they move together. Higher study time may come with higher score. More waiting time may come with more total cost. One component failing early may or may not tell us about another component.",
            "Covariance measures direction of paired movement around the two means. It is positive when high values of X tend to appear with high values of Y, negative when high values of X tend to appear with low values of Y, and near zero when there is no linear paired movement.",
            "The word linear matters. Covariance is designed to detect linear association, not every possible relationship."
          ],
          blocks: [
            {
              type: "principle",
              title: "Direction of movement",
              body: "Covariance watches the signs of deviations from the two means.",
              formulas: [
                { label: "Same direction", formula: "(X-E[X])(Y-E[Y]) positive", note: "both above mean or both below mean" },
                { label: "Opposite direction", formula: "(X-E[X])(Y-E[Y]) negative", note: "one above mean, one below mean" }
              ]
            }
          ]
        },
        {
          number: "6.2",
          title: "Computing E[XY] from a Joint Distribution",
          paragraphs: [
            "Before covariance, we need E[XY]. The product XY is a function of the pair (X,Y), so we average xy using the joint distribution.",
            "For a discrete joint PMF, sum xy p(x,y). For a continuous joint PDF, integrate xy f(x,y) over the support.",
            "This is the same LOTUS idea from Chapter 3, now applied to a function of two variables."
          ],
          blocks: [
            {
              type: "definition",
              title: "Product expectation",
              body: "E[XY] is computed from the joint law, not from the two marginals alone unless independence is known.",
              formulas: [
                { label: "Discrete", formula: "E[XY]=sum_x sum_y xy p(x,y)", note: "sum over allowed pairs" },
                { label: "Continuous", formula: "E[XY]=integral integral xy f(x,y) dx dy", note: "integrate over support" }
              ]
            },
            {
              type: "example",
              title: "Joint table example",
              body: "Suppose p(0,0)=0.2, p(0,1)=0.3, p(1,0)=0.1, p(1,1)=0.4. Since xy is 1 only at (1,1), E[XY]=0.4.",
              steps: [
                { label: "Products", math: "xy=0 except at (1,1)", note: "The variables are 0-1 switches." },
                { label: "Average", math: "E[XY]=1 x p(1,1)=0.4", note: "Only the both-on cell contributes." }
              ]
            }
          ]
        },
        {
          number: "6.3",
          title: "Covariance Definition and Shortcut",
          paragraphs: [
            "Covariance is the expected product of the two deviations from their means.",
            "The definition explains the meaning. The shortcut Cov(X,Y)=E[XY]-E[X]E[Y] is usually easier for computation.",
            "Covariance can be positive, negative, or zero. Its size depends on the units of X and Y, which is why correlation is introduced next."
          ],
          blocks: [
            {
              type: "definition",
              title: "Definition: covariance",
              body: "Covariance measures average paired deviation from the two means.",
              formulas: [
                { label: "Definition", formula: "Cov(X,Y)=E[(X-E[X])(Y-E[Y])]", note: "meaning" },
                { label: "Shortcut", formula: "Cov(X,Y)=E[XY]-E[X]E[Y]", note: "calculation" }
              ]
            },
            {
              type: "example",
              title: "Deriving the shortcut",
              body: "Expand the product of deviations and use linearity of expectation.",
              steps: [
                { label: "Name means", math: "mu_X=E[X], mu_Y=E[Y]", note: "These are constants." },
                { label: "Expand", math: "E[(X-mu_X)(Y-mu_Y)]", note: "Start from definition." },
                { label: "Multiply out", math: "E[XY - mu_X Y - mu_Y X + mu_X mu_Y]", note: "Ordinary algebra." },
                { label: "Take expectation", math: "E[XY]-mu_X E[Y]-mu_Y E[X]+mu_X mu_Y", note: "Constants pull out." },
                { label: "Simplify", math: "Cov(X,Y)=E[XY]-E[X]E[Y]", note: "The middle terms combine." }
              ]
            }
          ]
        },
        {
          number: "6.4",
          title: "Correlation as Unit-Free Covariance",
          paragraphs: [
            "Covariance depends on the units of X and Y. If X is measured in rupees instead of thousands of rupees, the covariance changes scale.",
            "Correlation divides covariance by the product of standard deviations. This removes units and gives a number between -1 and 1.",
            "Correlation near 1 means strong positive linear association. Near -1 means strong negative linear association. Near 0 means little linear association, not necessarily no relationship."
          ],
          blocks: [
            {
              type: "definition",
              title: "Definition: correlation",
              body: "Correlation is covariance measured in standard-deviation units.",
              formulas: [
                { label: "Correlation", formula: "rho = Cov(X,Y)/(SD(X)SD(Y))", note: "when both standard deviations are positive" },
                { label: "Range", formula: "-1 <= rho <= 1", note: "unit-free linear association" }
              ]
            },
            {
              type: "warning",
              title: "Common trap",
              body: "Correlation near zero does not prove there is no relationship. It only says there is little linear relationship."
            }
          ]
        },
        {
          number: "6.5",
          title: "Independence Versus Zero Covariance",
          paragraphs: [
            "If X and Y are independent, then E[XY]=E[X]E[Y], provided the expectations exist. Therefore independent variables have zero covariance.",
            "The converse is false: zero covariance does not always imply independence. Variables can have a curved relationship that covariance misses.",
            "This distinction is important for exams. Independence is a statement about the full joint law. Zero covariance is only one moment equation."
          ],
          blocks: [
            {
              type: "principle",
              title: "Independence implies zero covariance",
              body: "Under independence, the expectation of a product factors.",
              steps: [
                { label: "Independence gives factorization", math: "E[XY]=E[X]E[Y]", note: "This uses the joint law." },
                { label: "Substitute into covariance", math: "Cov(X,Y)=E[X]E[Y]-E[X]E[Y]=0", note: "So covariance is zero." }
              ]
            },
            {
              type: "example",
              title: "Zero covariance without independence",
              body: "Let X be equally likely to be -1, 0, or 1, and let Y=X^2. Then Y is determined by X, so they are not independent. But E[X]=0 and E[XY]=E[X^3]=0, so Cov(X,Y)=0.",
              formulas: [
                { label: "Dependence", formula: "Y=X^2", note: "Y is fully determined by X" },
                { label: "Covariance", formula: "Cov(X,Y)=0", note: "curved relationship missed by covariance" }
              ]
            }
          ]
        },
        {
          number: "6.6",
          title: "Variance of Sums",
          paragraphs: [
            "Variance of a sum is not always the sum of variances. The missing piece is covariance.",
            "For two variables, Var(X+Y)=Var(X)+Var(Y)+2Cov(X,Y). Positive covariance increases spread of the sum. Negative covariance reduces spread of the sum.",
            "For many variables, every pair covariance matters. This is why dependence matters so much for totals."
          ],
          blocks: [
            {
              type: "principle",
              title: "Variance of a sum",
              body: "The covariance term records whether the variables move together inside the total.",
              formulas: [
                { label: "Two variables", formula: "Var(X+Y)=Var(X)+Var(Y)+2Cov(X,Y)", note: "general formula" },
                { label: "Independent case", formula: "Var(X+Y)=Var(X)+Var(Y)", note: "because covariance is zero" }
              ]
            },
            {
              type: "example",
              title: "Derivation",
              body: "Use the shortcut for variance and expand the square.",
              steps: [
                { label: "Center the sum", math: "(X+Y)-E[X+Y]=(X-E[X])+(Y-E[Y])", note: "Deviation of total is total of deviations." },
                { label: "Square", math: "[(X-E[X])+(Y-E[Y])]^2", note: "Expand a plus b squared." },
                { label: "Average", math: "Var(X)+Var(Y)+2Cov(X,Y)", note: "The cross term is covariance." }
              ]
            }
          ]
        },
        {
          number: "6.7",
          title: "Indicator-Pair Covariance",
          paragraphs: [
            "Many exam problems ask for the variance of a count. A count can often be written as a sum of indicators. Chapter 4 used this for expectation and variance in simple cases.",
            "When the indicators are dependent, variance needs pair terms. For indicators I and J, Cov(I,J)=P(I=1 and J=1)-P(I=1)P(J=1).",
            "This method is useful for matching problems, collisions, occupied boxes, and sampling without replacement."
          ],
          blocks: [
            {
              type: "principle",
              title: "Indicator covariance",
              body: "For 0-1 indicators, the product IJ is 1 exactly when both events happen.",
              formulas: [
                { label: "Product expectation", formula: "E[IJ]=P(I=1 and J=1)", note: "both switches on" },
                { label: "Covariance", formula: "Cov(I,J)=P(I=1,J=1)-P(I=1)P(J=1)", note: "compare joint chance with independent product" }
              ]
            },
            {
              type: "example",
              title: "Without replacement gives negative covariance",
              body: "Draw two cards without replacement. Let I be 1 if the first card is an ace and J be 1 if the second card is an ace. Since seeing an ace first leaves fewer aces, the covariance is negative.",
              steps: [
                { label: "Single chances", math: "P(I=1)=4/52, P(J=1)=4/52", note: "Before drawing, each position has ace chance 4/52." },
                { label: "Both aces", math: "P(I=1,J=1)=(4/52)(3/51)", note: "After first ace, only 3 aces remain." },
                { label: "Compare", math: "(4/52)(3/51) < (4/52)(4/52)", note: "So covariance is negative." }
              ]
            }
          ]
        },
        {
          number: "6.8",
          title: "Common Covariance Traps",
          paragraphs: [
            "The first trap is treating zero covariance as independence. That is only safe in special families, not in general probability.",
            "The second trap is adding variances without checking dependence. Expectation always adds; variance only adds cleanly when covariance terms vanish.",
            "The third trap is interpreting covariance size without units. Use correlation when you need a scale-free comparison."
          ],
          blocks: [
            {
              type: "strategy",
              title: "Decision checklist",
              body: "Use this quick sequence before calculating.",
              visual: {
                type: "flow",
                steps: ["Need paired movement?", "Compute E[XY]", "Find covariance", "Scale to correlation if needed", "Check dependence before summing variances"],
                caption: "Covariance problems usually start from the joint law."
              }
            }
          ]
        }
      ],
      concepts: [
        { name: "Product expectation", description: "The joint average E[XY].", cue: "Compute it from the joint PMF/PDF before covariance." },
        { name: "Covariance", description: "Average product of deviations from the two means.", cue: "Use to measure direction of paired linear movement." },
        { name: "Correlation", description: "Unit-free covariance scaled by standard deviations.", cue: "Use to compare strength and direction across different units." },
        { name: "Zero covariance", description: "No linear paired movement by this moment measure.", cue: "Do not automatically treat it as independence." },
        { name: "Variance of sums", description: "Variance of a total includes covariance terms.", cue: "Use when dependent variables are added." },
        { name: "Indicator-pair covariance", description: "Covariance between two 0-1 switches.", cue: "Use for variance of counts with dependent pieces." }
      ],
      techniques: [
        { name: "Compute E[XY]", when: "a joint law is given.", move: "Average xy over all pairs or integrate xy over the support." },
        { name: "Use covariance shortcut", when: "E[X], E[Y], and E[XY] are available.", move: "Compute Cov(X,Y)=E[XY]-E[X]E[Y]." },
        { name: "Scale to correlation", when: "you need a unit-free measure.", move: "Divide covariance by SD(X)SD(Y)." },
        { name: "Separate independence from zero covariance", when: "a problem asks whether variables are independent.", move: "Use joint factorization for independence; covariance alone is not enough." },
        { name: "Use variance of sums", when: "a total contains dependent variables.", move: "Add individual variances and all covariance cross terms." },
        { name: "Use indicator covariance", when: "a count is a sum of dependent indicators.", move: "Compute P(both on)-P(first on)P(second on) for pair terms." }
      ],
      practiceProblems: covariancePracticeProblems(),
      reviewPrompts: [
        "Why does covariance need the joint distribution?",
        "Explain the sign of covariance in words.",
        "Why is correlation easier to compare than covariance?",
        "Give an example where independence implies zero covariance.",
        "Why does zero covariance not always imply independence?",
        "When does Var(X+Y)=Var(X)+Var(Y) fail?"
      ],
      reviewQuiz: {
        id: "quiz-probability-chapter-6-objective-review",
        title: "Probability Chapter 6 Objective Review",
        instructions: "Complete this after finishing Chapter 6 exposition and labelled practice. The quiz logs objective answers and diagnoses product expectation, covariance, correlation, independence, variance of sums, and indicator-pair covariance.",
        questions: covarianceReviewQuestions()
      },
      readingQuestions: [
        "What does E[XY] measure that E[X] and E[Y] alone do not?",
        "How does the shortcut Cov(X,Y)=E[XY]-E[X]E[Y] come from the definition?",
        "Why does correlation always lie between -1 and 1?",
        "What is the difference between no linear association and independence?",
        "Why do covariance terms appear in variance of sums?",
        "How do indicators turn count-variance problems into pair-probability problems?"
      ],
      chapterSummary: [
        "E[XY] is computed from the joint distribution.",
        "Covariance is E[(X-E[X])(Y-E[Y])] and equals E[XY]-E[X]E[Y].",
        "Positive covariance means variables tend to move in the same direction; negative covariance means opposite directions.",
        "Correlation is covariance divided by the product of standard deviations.",
        "Independence implies zero covariance when moments exist, but zero covariance does not imply independence in general.",
        "Var(X+Y)=Var(X)+Var(Y)+2Cov(X,Y).",
        "For dependent indicator counts, covariance pair terms are often the key to variance."
      ],
      updatedAt
    },
    {
      id: "gate-da-conditional-expectation-variance",
      exam: "GATE DA",
      accountTier: "Basic",
      subject: "Probability",
      chapter: "Chapter 7",
      section: "7",
      title: "Conditional Expectation and Conditional Variance",
      summary: "Conditional expectation as updated average, E[X|Y=y] versus E[X|Y], tower property, total expectation, conditional variance, total variance, prediction, and fair-game intuition.",
      sectionPreview: "Conditional expectation is what an average becomes after information arrives. Before seeing the information, you use one average. After seeing the group, source, score band, queue, box, or first-stage result, you update the average inside that smaller world.",
      previewActivity: "A learner can receive an easy test or a hard test. Easy-test average score is 80. Hard-test average score is 55. Before knowing the test type, can one number describe the expected score? After knowing the test type, should the expected score change? This is the idea of conditional expectation.",
      chapterIntro: [
        "Chapter 5 taught us how to condition a distribution. Chapter 7 asks what happens to an average after conditioning.",
        "The main question is always: what information do we know now? If we know the group, source, queue, box, or first-stage result, we average inside that information.",
        "This chapter moves from concrete grouped averages to the abstract notation E[X|Y]. We will also measure how much uncertainty remains after the information is known."
      ],
      bookSections: [
        {
          number: "7.1",
          title: "Conditional Expectation as Updated Average",
          paragraphs: [
            "Start with a plain example. A class has two test versions. Students who get the easy version average 80. Students who get the hard version average 55. If you do not know which version a student received, you use a blended average. If you do know the version, you use the group average.",
            "Conditional expectation is this group average idea written in probability language. It is not a new kind of magic average. It is the average after information is known.",
            "In the wild, look for phrases like given the source, after observing Y, among people in this group, if the first draw is red, or after the first stage."
          ],
          blocks: [
            {
              type: "example",
              title: "Demonstration: easy or hard test",
              body: "Suppose P(easy)=0.6 and P(hard)=0.4. The expected score is 80 after easy is known and 55 after hard is known. Before knowing the version, average the two group averages.",
              steps: [
                { label: "Conditional averages", math: "E[Score | easy]=80, E[Score | hard]=55", note: "These are averages inside groups." },
                { label: "Blend groups", math: "E[Score]=0.6(80)+0.4(55)", note: "Average the group averages using group probabilities." },
                { label: "Compute", math: "E[Score]=48+22=70", note: "The overall average is 70." }
              ]
            },
            {
              type: "strategy",
              title: "How to recognise it",
              body: "A conditional expectation problem usually gives information that sorts outcomes into groups, then asks for an average.",
              visual: {
                type: "flow",
                steps: ["What is being averaged?", "What information is known?", "Average inside that information", "Blend later if needed"],
                caption: "Conditional expectation is average after information."
              }
            }
          ]
        },
        {
          number: "7.2",
          title: "E[X|Y=y] in Discrete and Continuous Problems",
          paragraphs: [
            "The expression E[X|Y=y] is a number. It means: once Y has the value y, average X using the conditional distribution of X given that value.",
            "For discrete variables, use the conditional PMF from the joint table. For continuous variables, use the conditional density.",
            "The calculation looks like ordinary expectation, but the probabilities or density are conditional."
          ],
          blocks: [
            {
              type: "definition",
              title: "Conditional expectation at a value",
              body: "After Y=y is known, average X inside the conditional law of X given Y=y.",
              formulas: [
                { label: "Discrete", formula: "E[X|Y=y]=sum_x x P(X=x|Y=y)", note: "conditional PMF" },
                { label: "Continuous", formula: "E[X|Y=y]=integral x f_{X|Y}(x|y) dx", note: "conditional density" }
              ]
            },
            {
              type: "example",
              title: "Demonstration: dice sum",
              body: "Roll two dice. Let X be the first die and S be the sum. Given S=10, the possible first die values are 4, 5, and 6 equally likely.",
              steps: [
                { label: "Conditional support", math: "X in {4,5,6} given S=10", note: "Only sum-10 outcomes remain." },
                { label: "Average inside support", math: "E[X|S=10]=(4+5+6)/3", note: "Use conditional probabilities." },
                { label: "Compute", math: "E[X|S=10]=5", note: "The updated average first die is 5." }
              ]
            },
            {
              type: "example",
              title: "Continuous demonstration",
              body: "For the triangular density f(x,y)=2 on 0<y<x<1, Chapter 5 found that given X=x, Y is uniform on (0,x). So the conditional average of Y is the midpoint.",
              steps: [
                { label: "Conditional density", math: "f_{Y|X}(y|x)=1/x, 0<y<x", note: "Uniform on the interval (0,x)." },
                { label: "Average", math: "E[Y|X=x]=x/2", note: "The midpoint of 0 and x." }
              ]
            }
          ]
        },
        {
          number: "7.3",
          title: "E[X|Y] as a Random Variable",
          paragraphs: [
            "E[X|Y=y] is a number for one fixed value y. E[X|Y] is different: it is a random variable because Y is random.",
            "Before Y is observed, you do not know which conditional average you will use. After Y is observed, E[X|Y] takes the corresponding value.",
            "In problems, this appears when the answer changes depending on the observed group or first-stage result."
          ],
          blocks: [
            {
              type: "example",
              title: "Demonstration: random test version",
              body: "If Y is the test version, then E[Score|Y] is 80 when Y=easy and 55 when Y=hard. Since Y is random before observation, E[Score|Y] is also random.",
              formulas: [
                { label: "If Y=easy", formula: "E[Score|Y]=80", note: "one conditional average" },
                { label: "If Y=hard", formula: "E[Score|Y]=55", note: "another conditional average" }
              ]
            },
            {
              type: "warning",
              title: "Common trap",
              body: "Do not confuse E[X|Y=y] with E[X|Y]. The first is a number after fixing y. The second is a random variable whose value depends on Y."
            }
          ]
        },
        {
          number: "7.4",
          title: "Tower Property",
          paragraphs: [
            "The tower property says that if you average after information, then average those conditional averages, you return to the original average.",
            "Plain language: average the subgroup averages using the subgroup weights.",
            "This is one of the most useful simplification tools in probability. It lets us compute a hard expectation by conditioning on a helpful first piece of information."
          ],
          blocks: [
            {
              type: "principle",
              title: "Tower property",
              body: "Averaging the conditional average gives the unconditional average.",
              formulas: [
                { label: "Tower", formula: "E[E[X|Y]]=E[X]", note: "average after averaging within Y" }
              ]
            },
            {
              type: "example",
              title: "Demonstration: subgroup averages",
              body: "Using the test example, E[Score|Y] is 80 with probability 0.6 and 55 with probability 0.4. Averaging those conditional averages gives the original mean.",
              steps: [
                { label: "Random conditional average", math: "E[Score|Y] is 80 or 55", note: "depending on test version." },
                { label: "Average it", math: "E[E[Score|Y]]=0.6(80)+0.4(55)", note: "Average the conditional averages." },
                { label: "Same result", math: "E[E[Score|Y]]=70=E[Score]", note: "This is the tower property." }
              ]
            }
          ]
        },
        {
          number: "7.5",
          title: "Law of Total Expectation",
          paragraphs: [
            "The law of total expectation is the tower property written for cases. Split the experiment into useful cases, compute the expected value inside each case, then average over cases.",
            "Use it when direct averaging is messy but the problem becomes simple after knowing a source, box, group, first draw, first stage, or hidden type.",
            "The key skill is choosing the conditioning variable. Good conditioning makes the inside expectation easy."
          ],
          blocks: [
            {
              type: "principle",
              title: "Total expectation over cases",
              body: "If Y splits the world into cases, average the conditional means over those cases.",
              formulas: [
                { label: "Discrete cases", formula: "E[X]=sum_y E[X|Y=y]P(Y=y)", note: "weighted average of case averages" }
              ]
            },
            {
              type: "example",
              title: "Demonstration: choose a box first",
              body: "A box is chosen. Box A is chosen with probability 0.7 and has expected red draws 3. Box B is chosen with probability 0.3 and has expected red draws 8. The overall expected red count is the weighted average.",
              steps: [
                { label: "Condition on box", math: "E[R|A]=3, E[R|B]=8", note: "Inside each box, the average is simple." },
                { label: "Weight by box probabilities", math: "E[R]=0.7(3)+0.3(8)", note: "Total expectation." },
                { label: "Compute", math: "E[R]=2.1+2.4=4.5", note: "Overall expected red count." }
              ]
            },
            {
              type: "strategy",
              title: "How to identify it",
              body: "Look for a first-stage random choice that changes the later average.",
              items: [
                "A source is chosen, then an item is observed.",
                "A box, machine, model, group, or queue is chosen first.",
                "The expected value is hard globally but easy inside cases.",
                "The problem asks for an overall average after describing subgroups."
              ]
            }
          ]
        },
        {
          number: "7.6",
          title: "Conditional Variance",
          paragraphs: [
            "Conditional expectation asks for the updated centre after information. Conditional variance asks how much uncertainty remains after information.",
            "If the group is known but values still vary inside the group, the conditional variance measures that within-group spread.",
            "In notation, Var(X|Y=y) is a number for fixed y. Var(X|Y) is a random variable whose value depends on Y."
          ],
          blocks: [
            {
              type: "definition",
              title: "Conditional variance",
              body: "Conditional variance is variance computed inside the conditional distribution.",
              formulas: [
                { label: "At a value", formula: "Var(X|Y=y)=E[(X-E[X|Y=y])^2 | Y=y]", note: "remaining spread after Y=y" },
                { label: "Shortcut", formula: "Var(X|Y=y)=E[X^2|Y=y]-(E[X|Y=y])^2", note: "same variance shortcut, inside the condition" }
              ]
            },
            {
              type: "example",
              title: "Demonstration: dice sum again",
              body: "Given S=10, X is equally likely to be 4, 5, or 6. The conditional mean is 5. The remaining spread is the variance of {4,5,6}.",
              steps: [
                { label: "Mean", math: "E[X|S=10]=5", note: "From Section 7.2." },
                { label: "Squared deviations", math: "(4-5)^2, (5-5)^2, (6-5)^2", note: "These are 1, 0, 1." },
                { label: "Average", math: "Var(X|S=10)=(1+0+1)/3=2/3", note: "Some uncertainty remains." }
              ]
            }
          ]
        },
        {
          number: "7.7",
          title: "Law of Total Variance",
          paragraphs: [
            "Total variance splits uncertainty into two parts. First, how much spread remains inside each group? Second, how much do the group means themselves move?",
            "Plain language: total uncertainty equals average within-group uncertainty plus between-group uncertainty.",
            "This is useful when the population is a mixture of groups, boxes, sources, machines, or difficulty levels."
          ],
          blocks: [
            {
              type: "principle",
              title: "Law of total variance",
              body: "Total variance is within-group variance plus variance of group means.",
              formulas: [
                { label: "Formula", formula: "Var(X)=E[Var(X|Y)] + Var(E[X|Y])", note: "within plus between" }
              ]
            },
            {
              type: "example",
              title: "Demonstration: test versions",
              body: "Suppose easy tests have mean 80 and variance 25. Hard tests have mean 55 and variance 16. Easy occurs with probability 0.6 and hard with probability 0.4.",
              steps: [
                { label: "Within-group part", math: "E[Var(Score|Y)]=0.6(25)+0.4(16)=21.4", note: "Average remaining uncertainty inside versions." },
                { label: "Group means", math: "E[Score|Y] is 80 or 55", note: "These group means vary." },
                { label: "Between-group part", math: "Var(E[Score|Y])=0.6(80-70)^2+0.4(55-70)^2=150", note: "Overall mean is 70." },
                { label: "Total", math: "Var(Score)=21.4+150=171.4", note: "Most uncertainty here comes from test-version difference." }
              ]
            }
          ]
        },
        {
          number: "7.8",
          title: "Prediction and Mean Squared Error",
          paragraphs: [
            "Conditional expectation is also a prediction tool. If you must predict X after seeing Y, the best prediction under mean squared error is E[X|Y].",
            "This gives a practical interpretation: conditional expectation is the best updated average prediction after the information Y is known.",
            "You do not need the proof for most exam problems, but the idea helps you identify the concept in data and modelling questions."
          ],
          blocks: [
            {
              type: "principle",
              title: "Best squared-error prediction",
              body: "Among predictions that use Y, the conditional expectation has the smallest mean squared error.",
              formulas: [
                { label: "Best prediction", formula: "prediction of X after seeing Y = E[X|Y]", note: "under squared loss" }
              ]
            },
            {
              type: "example",
              title: "Demonstration: score prediction",
              body: "If you know the test version, predicting 80 for easy and 55 for hard beats using the same overall prediction 70 for everyone, when squared error is the scoring rule.",
              items: [
                "No information: predict the overall average.",
                "Version known: predict the version average.",
                "More useful information usually means a sharper prediction."
              ]
            }
          ]
        },
        {
          number: "7.9",
          title: "Fair-Game Intuition",
          paragraphs: [
            "A game is fair when its expected gain, after the current information is known, is zero. Fair does not mean safe. You can still win or lose money on the next step. Fair means there is no average advantage.",
            "For example, suppose you pay nothing to play a coin game. Heads gives Rs. 10 and tails takes Rs. 10. The expected change is 0.5(10)+0.5(-10)=0, so the game is fair. If heads gave Rs. 15 and tails took Rs. 10, the expected change would be positive, so it would favour the player.",
            "A fair-game process has the pattern: expected next value equals current value after current information. This is the intuition behind martingales. We mention the name so you can recognise it later, but this chapter only needs the conditional expected-value idea."
          ],
          blocks: [
            {
              type: "example",
              title: "Demonstration: why the coin game is fair",
              body: "The fairness check is done on the increment, not on whether every outcome is harmless. A fair coin game can still move your fortune up or down.",
              steps: [
                { label: "Name the increment", math: "Delta = +10 on heads, -10 on tails", note: "This is the change in fortune." },
                { label: "Average the increment", math: "E[Delta]=0.5(10)+0.5(-10)", note: "Heads and tails are equally likely." },
                { label: "Compute", math: "E[Delta]=0", note: "Zero expected gain means fair." },
                { label: "Connect to fortune", math: "E[next fortune | current fortune] = current fortune + E[Delta]", note: "So the expected next fortune equals the current fortune." }
              ]
            },
            {
              type: "example",
              title: "Demonstration: fair coin fortune",
              body: "You currently have Rs. 100. A fair coin gives +Rs. 10 on heads and -Rs. 10 on tails. After seeing your current fortune, the expected next fortune is still Rs. 100.",
              steps: [
                { label: "Next values", math: "110 with probability 1/2, 90 with probability 1/2", note: "Fair up or down move." },
                { label: "Conditional average", math: "E[next fortune | current fortune=100]=0.5(110)+0.5(90)", note: "Average after current information." },
                { label: "Compute", math: "E[next fortune | current fortune=100]=100", note: "No expected gain from the fair step." }
              ]
            },
            {
              type: "strategy",
              title: "How to recognise fair-game expectation",
              body: "Look for zero-mean future increments after the present information is known.",
              items: [
                "The next change is fair after conditioning on current information.",
                "Expected future increment is 0.",
                "Expected next value equals current value.",
                "This is martingale intuition, but no formal martingale machinery is needed here."
              ]
            }
          ]
        }
      ],
      concepts: [
        { name: "Conditional expectation", description: "Average after information is known.", cue: "Look for grouped averages, observed sources, given information, or first-stage outcomes." },
        { name: "E[X|Y=y]", description: "A number: the average of X after fixing Y=y.", cue: "Use when the condition gives a specific value or case." },
        { name: "E[X|Y]", description: "A random variable: the conditional average as Y varies.", cue: "Use when the answer depends on the observed value of Y." },
        { name: "Tower property", description: "Average the conditional averages to get the original average.", cue: "Use E[E[X|Y]]=E[X]." },
        { name: "Total expectation", description: "Weighted average of case-specific expected values.", cue: "Use when a problem becomes easy after splitting by source, group, or first stage." },
        { name: "Conditional variance", description: "Spread that remains after information is known.", cue: "Use when asked how much uncertainty remains inside a group." },
        { name: "Total variance", description: "Within-group uncertainty plus between-group uncertainty.", cue: "Use Var(X)=E[Var(X|Y)]+Var(E[X|Y])." },
        { name: "Fair-game intuition", description: "Expected future value equals current value after current information.", cue: "Look for zero-mean future increments." }
      ],
      techniques: [
        { name: "Condition on useful information", when: "the direct expectation is messy.", move: "Choose a group/source/stage that makes the inside average simple." },
        { name: "Compute E[X|Y=y]", when: "a specific condition is given.", move: "Use the conditional PMF/PDF and compute an ordinary expectation inside it." },
        { name: "Build E[X|Y]", when: "the conditional mean changes with Y.", move: "Write the rule that maps each Y value to the corresponding average." },
        { name: "Use tower property", when: "you have conditional means and need the overall mean.", move: "Average the conditional means over Y." },
        { name: "Use total expectation", when: "cases are clear.", move: "Multiply each case mean by its case probability and add." },
        { name: "Use conditional variance shortcut", when: "you need remaining spread after information.", move: "Compute E[X^2|Y=y]-(E[X|Y=y])^2 inside the condition." },
        { name: "Use total variance", when: "uncertainty has within-group and between-group parts.", move: "Add E[Var(X|Y)] and Var(E[X|Y])." },
        { name: "Check fair-game structure", when: "a process evolves by future increments.", move: "Ask whether the expected next increment is zero after current information." }
      ],
      practiceProblems: conditionalExpectationPracticeProblems(),
      reviewPrompts: [
        "Explain conditional expectation without using symbols.",
        "Give one example where E[X|Y=y] changes as y changes.",
        "Why is E[X|Y] a random variable?",
        "Describe the tower property as a grouped-average statement.",
        "What are the two parts in the law of total variance?",
        "Give a fair-game example where the expected next value equals the current value."
      ],
      reviewQuiz: {
        id: "quiz-probability-chapter-7-objective-review",
        title: "Probability Chapter 7 Objective Review",
        instructions: "Complete this after finishing Chapter 7 exposition and labelled practice. The quiz logs objective answers and diagnoses conditional expectation, tower property, total expectation, conditional variance, total variance, prediction, and fair-game intuition.",
        questions: conditionalExpectationReviewQuestions()
      },
      readingQuestions: [
        "What information is known when you compute a conditional expectation?",
        "What is the difference between E[X|Y=y] and E[X|Y]?",
        "How does the tower property average subgroup averages?",
        "When is total expectation easier than direct expectation?",
        "What uncertainty remains after conditioning?",
        "How does the fair-game example connect to conditional expectation?"
      ],
      chapterSummary: [
        "Conditional expectation is the average after information is known.",
        "E[X|Y=y] is a number; E[X|Y] is a random variable.",
        "The tower property says E[E[X|Y]]=E[X].",
        "The law of total expectation averages case-specific expectations.",
        "Conditional variance measures remaining spread after information is known.",
        "The law of total variance splits uncertainty into within-group and between-group parts.",
        "Conditional expectation is the best squared-error prediction after observing Y.",
        "Fair-game intuition says expected future value equals current value when future increments have conditional mean zero."
      ],
      updatedAt
    },
    {
      id: "gate-da-continuous-distributions-order-statistics",
      exam: "GATE DA",
      accountTier: "Basic",
      subject: "Probability",
      chapter: "Chapter 8",
      section: "8",
      title: "Continuous Distributions and Order Statistics",
      summary: "Continuous distributions and order statistics derived from first-principles stories: counts, waits, accumulated waits, measurement error, sorted samples, spacings, beta laws, and the exponential-family pattern.",
      sectionPreview: "This chapter is not a table of distributions to memorise. Each distribution appears because a simple experiment forces it to appear. We start from the experiment, derive the useful probability statement, and only then keep the result as a reusable fact.",
      previewActivity: "A help desk receives calls randomly at an average rate of 3 per hour. In a tiny time interval of length h, the chance of one call is about 3h and the chance of two or more calls is tiny. From that small-interval story, what should the chance of no calls for one hour look like? Try to reason before seeing the formula.",
      chapterIntro: [
        "This chapter builds a practical distribution toolkit from first principles. The point is not to carry a bag of formulas. The point is to see why the formulas are true enough to trust and use.",
        "Poisson counts come from many tiny chances of an event. Exponential waits come from the probability of seeing no event for a while. Gamma waits come from adding several exponential waits. Normal variables come from standardising measurement error and, later, from sums of many small effects.",
        "Order statistics come from sorting. Beta appears when a sorted uniform point lands at a certain position. Uniform spacing problems often become simple multinomial count problems."
      ],
      bookSections: [
        {
          number: "8.1",
          title: "First-Principles Distribution Stories",
          paragraphs: [
            "A distribution is a compressed description of an experiment. To understand it, ask what operation creates the random variable: are we counting, waiting, adding waits, measuring error, sorting observations, or cutting an interval into gaps?",
            "Once the operation is clear, many facts can be derived instead of memorised. If no event has happened by time t, the first waiting time is bigger than t. If the maximum is below m, every observation is below m. If points are thrown into fixed intervals, the counts must be multinomial.",
            "The formulas in this chapter are reusable facts, but the reasoning behind them is the real tool."
          ],
          blocks: [
            {
              type: "strategy",
              title: "Recognition map",
              body: "Start by asking what the random variable represents.",
              visual: {
                type: "flow",
                steps: ["Count events", "Wait for events", "Measure error", "Sort sample", "Model proportion"],
                caption: "The story usually chooses the distribution before the formula does."
              }
            },
            {
              type: "principle",
              title: "Reasoning cues",
              body: "Use the cue to choose the first-principles argument, not merely to recall a formula.",
              items: [
                "Count in a fixed interval: split time into many tiny pieces and count rare successes.",
                "Wait until the next event: no event has happened yet.",
                "Wait until the kth event: at least k events have happened by time t.",
                "Measurement error or standardized value: compare distance from mean in standard-deviation units.",
                "Minimum or maximum: translate into all observations being above or below a cutoff.",
                "Uniform order statistic: count how many sample points fall to the left of a cutoff.",
                "Fixed intervals: count how many points land in each interval."
              ]
            }
          ]
        },
        {
          number: "8.2",
          title: "Exponential Distribution: Waiting for One Event",
          paragraphs: [
            "Start from the event, not the formula. Let T be the time until the next call. The statement T>t means no call has arrived during the first t units of time.",
            "If arrivals have a steady rate lambda and disjoint time intervals behave independently, the chance of no arrival for time t should shrink like repeated multiplication over tiny intervals. That repeated multiplication becomes exp(-lambda t).",
            "Once we know P(T>t)=exp(-lambda t), the CDF and PDF follow by complement and differentiation."
          ],
          blocks: [
            {
              type: "example",
              title: "Derivation: no arrival becomes exponential survival",
              body: "Split time t into n tiny pieces. In each small piece, the chance of no event is about 1-lambda t/n. No event in the whole interval means no event in every tiny piece.",
              steps: [
                { label: "Tiny interval", math: "P(no event in length t/n) about 1-lambda t/n", note: "Rate times length gives approximate event chance." },
                { label: "All tiny intervals empty", math: "P(T>t) about (1-lambda t/n)^n", note: "Multiply because disjoint tiny intervals act independently." },
                { label: "Take the limit", math: "lim_n (1-lambda t/n)^n = exp(-lambda t)", note: "This is where the exponential function appears." },
                { label: "Reusable fact", math: "P(T>t)=exp(-lambda t)", note: "The formula is a consequence of the no-arrival story." }
              ]
            },
            {
              type: "principle",
              title: "Facts derived from survival",
              body: "Once the survival function is known, the rest follows.",
              formulas: [
                { label: "PDF", formula: "f(t)=lambda exp(-lambda t), t>=0", note: "waiting-time density" },
                { label: "CDF", formula: "P(T<=t)=1-exp(-lambda t)", note: "event arrives by time t" },
                { label: "Survival", formula: "P(T>t)=exp(-lambda t)", note: "no event by time t" },
                { label: "Mean", formula: "E[T]=1/lambda", note: "average wait" }
              ]
            },
            {
              type: "example",
              title: "Demonstration: next call",
              body: "Calls arrive at rate 3 per hour. Let T be the waiting time in hours until the next call.",
              steps: [
                { label: "Recognise story", math: "T = waiting time until next event", note: "Use exponential." },
                { label: "Use survival", math: "P(T>1)=exp(-3)", note: "No call in the next hour." },
                { label: "Mean wait", math: "E[T]=1/3 hour", note: "About 20 minutes." }
              ]
            },
            {
              type: "principle",
              title: "Memorylessness",
              body: "Exponential waiting time does not age. If no event has happened yet, the remaining wait has the same distribution as a fresh wait. This is not a separate fact to memorize; it falls directly out of the survival function.",
              formulas: [
                { label: "Memoryless property", formula: "P(T>s+t | T>s)=P(T>t)", note: "future wait ignores elapsed wait" }
              ]
            },
            {
              type: "example",
              title: "Derivation: why memorylessness follows",
              body: "Conditioning on T>s means we already know the event did not happen during the first s units. To wait at least t more units is the same as waiting past s+t in total.",
              steps: [
                { label: "Start with conditional probability", math: "P(T>s+t | T>s)=P(T>s+t and T>s)/P(T>s)", note: "Use the definition of conditional probability." },
                { label: "Simplify the event", math: "T>s+t implies T>s", note: "If the wait is longer than s+t, it is automatically longer than s." },
                { label: "Use survival", math: "P(T>s+t | T>s)=exp(-lambda(s+t))/exp(-lambda s)", note: "Substitute P(T>u)=exp(-lambda u)." },
                { label: "Cancel elapsed time", math: "exp(-lambda(s+t))/exp(-lambda s)=exp(-lambda t)=P(T>t)", note: "The old waiting time s disappears." }
              ]
            },
            {
              type: "example",
              title: "Why it matters: already waiting at a help desk",
              body: "Suppose support calls arrive like a Poisson process at rate 3 per hour. You have waited 20 minutes with no call. The chance that you wait at least 10 more minutes is still exp(-3 x 1/6), the same as the chance of waiting 10 minutes from a fresh start.",
              steps: [
                { label: "Translate the question", math: "P(T>30 minutes | T>20 minutes)", note: "Already waited 20 minutes; waiting 10 more means total wait exceeds 30 minutes." },
                { label: "Use memorylessness", math: "P(T>30 | T>20)=P(T>10)", note: "Use consistent time units." },
                { label: "Compute in hours", math: "P(T>1/6)=exp(-3/6)=exp(-1/2)", note: "The previous 20 minutes do not make a call due." },
                { label: "Model warning", math: "Memoryless means no aging", note: "It is plausible for idealized arrivals or radioactive decay, but not for lifetimes of machines that wear out." }
              ]
            }
          ]
        },
        {
          number: "8.3",
          title: "Poisson Distribution: Counts in a Fixed Interval",
          paragraphs: [
            "Poisson counts come from a rare-event limit. Split a fixed interval into many tiny pieces. Each piece has a tiny chance of one event and almost no chance of two or more.",
            "Counting events across the whole interval is approximately binomial: many tiny trials, each with small success probability. When the number of tiny trials grows and the expected count stays fixed, the binomial probabilities become Poisson.",
            "So Poisson is not a random formula. It is the limiting count law for many tiny independent opportunities."
          ],
          blocks: [
            {
              type: "example",
              title: "Derivation idea: binomial rare-event limit",
              body: "Suppose the expected number of events in the interval is lambda. Split the interval into n tiny pieces. Each tiny piece has event chance about lambda/n.",
              steps: [
                { label: "Approximate count", math: "N_n ~ Binomial(n, lambda/n)", note: "n tiny opportunities, tiny success chance." },
                { label: "Exactly k events", math: "P(N_n=k)=C(n,k)(lambda/n)^k(1-lambda/n)^(n-k)", note: "Binomial probability." },
                { label: "Let n grow", math: "P(N=k)=exp(-lambda)lambda^k/k!", note: "The rare-event limit is Poisson." }
              ]
            },
            {
              type: "principle",
              title: "Poisson(lambda) facts",
              body: "The parameter lambda is the expected count in the interval.",
              formulas: [
                { label: "PMF", formula: "P(N=k)=exp(-lambda)lambda^k/k!", note: "k=0,1,2,..." },
                { label: "Mean", formula: "E[N]=lambda", note: "average count" },
                { label: "Variance", formula: "Var(N)=lambda", note: "count variability" }
              ]
            },
            {
              type: "example",
              title: "Demonstration: calls per hour",
              body: "If calls arrive at average rate 3 per hour, then the number of calls in one hour can be modelled as Poisson(3).",
              steps: [
                { label: "Recognise story", math: "N = number of calls in one hour", note: "Use Poisson count." },
                { label: "Exactly two calls", math: "P(N=2)=exp(-3)3^2/2!", note: "Plug into the PMF." },
                { label: "No calls", math: "P(N=0)=exp(-3)", note: "Same as exponential survival for one hour." }
              ]
            }
          ]
        },
        {
          number: "8.4",
          title: "Poisson Process: Counts and Waiting Times Together",
          paragraphs: [
            "Counts and waits are not separate memorisation boxes. They are two questions about the same arrival process.",
            "If T_1 is the first arrival time, then T_1>t means no arrivals by time t. If N(t) is the count by time t, that same event is N(t)=0.",
            "This identity lets us derive the exponential waiting-time survival from the Poisson count model and move between count and wait questions."
          ],
          blocks: [
            {
              type: "principle",
              title: "Poisson process connection",
              body: "One rate controls both counts and waits.",
              formulas: [
                { label: "Count by time t", formula: "N(t) ~ Poisson(lambda t)", note: "events in interval length t" },
                { label: "First wait", formula: "T_1 ~ Exponential(lambda)", note: "time to first event" }
              ]
            },
            {
              type: "example",
              title: "Demonstration: no event means wait is long",
              body: "The event T_1>t means the first arrival has not happened by time t. That is the same as N(t)=0.",
              steps: [
                { label: "Translate waiting to count", math: "T_1>t is same as N(t)=0", note: "No arrival by time t." },
                { label: "Use Poisson zero count", math: "P(N(t)=0)=exp(-lambda t)", note: "Poisson(lambda t) at k=0." },
                { label: "Get exponential survival", math: "P(T_1>t)=exp(-lambda t)", note: "The two stories agree." }
              ]
            }
          ]
        },
        {
          number: "8.5",
          title: "Gamma Distribution: Waiting for Several Events",
          paragraphs: [
            "Gamma is what appears when one wait is not enough. If the first waiting time is exponential, the waiting time until the kth event is the sum of k exponential gaps.",
            "There is another first-principles view: T_k<=t means at least k events have arrived by time t. So gamma waiting probabilities can be reasoned about through Poisson counts.",
            "The formula is less important than the two identities: wait to kth event equals sum of k gaps, and T_k<=t equals N(t)>=k."
          ],
          blocks: [
            {
              type: "principle",
              title: "Gamma from first principles",
              body: "The kth waiting time can be built from exponential gaps or from Poisson counts.",
              formulas: [
                { label: "As a sum", formula: "T_k = E_1+...+E_k", note: "independent Exponential(lambda) waits" },
                { label: "As a count event", formula: "P(T_k<=t)=P(N(t)>=k)", note: "kth event has arrived by t" },
                { label: "Mean", formula: "E[T_k]=k/lambda", note: "k average waits" },
                { label: "Variance", formula: "Var(T_k)=k/lambda^2", note: "sum of k exponential variances" }
              ]
            },
            {
              type: "example",
              title: "Demonstration: third call",
              body: "Calls arrive at rate 3 per hour. The waiting time until the third call is Gamma(3,3).",
              steps: [
                { label: "Recognise story", math: "wait until 3rd event", note: "Use gamma." },
                { label: "Mean wait", math: "E[T_3]=3/3=1 hour", note: "Average time to third call." },
                { label: "Count connection", math: "P(T_3<=t)=P(N(t)>=3)", note: "Third call by time t means at least three calls by time t." }
              ]
            }
          ]
        },
        {
          number: "8.6",
          title: "Normal and Standard Normal",
          paragraphs: [
            "The normal distribution is the language of deviations from a centre when many small sources of variation are blended. Chapter 9 will give the limit-theorem reason. Here we learn how to reason with a normal once it is a good model.",
            "The first-principles move is standardisation. Instead of asking where 85 sits on the raw score scale, ask how many standard deviations it is from the mean.",
            "A z-score is a unit conversion: raw distance from the mean divided by the standard deviation."
          ],
          blocks: [
            {
              type: "principle",
              title: "Standardisation is unit conversion",
              body: "Subtract the centre, then measure distance in standard-deviation units.",
              formulas: [
                { label: "Normal", formula: "X ~ Normal(mu, sigma^2)", note: "mean mu, variance sigma^2" },
                { label: "Standardise", formula: "Z=(X-mu)/sigma", note: "Z has standard normal distribution" },
                { label: "CDF notation", formula: "Phi(z)=P(Z<=z)", note: "standard normal table/CDF" }
              ]
            },
            {
              type: "example",
              title: "Demonstration: z-score",
              body: "Suppose exam scores are approximately Normal(70,10^2). Find the probability a score is at most 85.",
              steps: [
                { label: "Standardise", math: "Z=(85-70)/10=1.5", note: "85 is 1.5 standard deviations above mean." },
                { label: "Use CDF", math: "P(X<=85)=P(Z<=1.5)=Phi(1.5)", note: "Look up or compute standard normal CDF." },
                { label: "Interpret", math: "Phi(1.5) is about 0.933", note: "About 93.3 percent are below 85." }
              ]
            }
          ]
        },
        {
          number: "8.7",
          title: "Order Statistics",
          paragraphs: [
            "Order statistics come from sorting. The smallest, largest, and kth smallest are not new random mechanisms; they are functions of the sample.",
            "The first-principles trick is to translate order statements into count statements. The maximum is at most m exactly when all observations are at most m. The kth smallest is at most x exactly when at least k observations are at most x.",
            "This count translation is the engine behind order-statistic formulas."
          ],
          blocks: [
            {
              type: "definition",
              title: "Order statistics",
              body: "Sort the sample from smallest to largest.",
              formulas: [
                { label: "Sorted sample", formula: "X_(1) <= X_(2) <= ... <= X_(n)", note: "parentheses mean order statistic" },
                { label: "Minimum", formula: "X_(1)", note: "smallest value" },
                { label: "Maximum", formula: "X_(n)", note: "largest value" }
              ]
            },
            {
              type: "example",
              title: "Demonstration: maximum by CDF",
              body: "If M=X_(n), then M<=m means every sample value is at most m.",
              steps: [
                { label: "Translate", math: "M<=m means X_1<=m, ..., X_n<=m", note: "All observations must be below m." },
                { label: "Use independence", math: "P(M<=m)=F(m)^n", note: "For iid samples." },
                { label: "Uniform case", math: "P(M<=m)=m^n, 0<=m<=1", note: "If F(m)=m." }
              ]
            }
            ,
            {
              type: "example",
              title: "Demonstration: kth smallest by counting",
              body: "For iid observations with CDF F, the event X_(k)<=x means at least k of the n observations are <=x.",
              steps: [
                { label: "Turn order into count", math: "X_(k)<=x means count{X_i<=x} >= k", note: "The kth smallest is below x if enough points are below x." },
                { label: "Use binomial count", math: "count{X_i<=x} ~ Binomial(n,F(x))", note: "Each observation lands left of x with probability F(x)." },
                { label: "CDF setup", math: "P(X_(k)<=x)=sum_{j=k}^n C(n,j)F(x)^j(1-F(x))^(n-j)", note: "This is derived from counting, not memorised." }
              ]
            }
          ]
        },
        {
          number: "8.8",
          title: "Uniform Order Statistics and Beta",
          paragraphs: [
            "Uniform order statistics make the count argument especially visible because F(x)=x on [0,1].",
            "The kth uniform order statistic is connected to the beta distribution because the event U_(k)<=u is a binomial count event: at least k points landed in [0,u].",
            "Beta is therefore not introduced as an arbitrary density. It appears as the law of a random sorted position inside the unit interval."
          ],
          blocks: [
            {
              type: "principle",
              title: "Beta from counting left of u",
              body: "For U_(k), count how many sample points fall in [0,u]. Differentiating that CDF gives the beta density.",
              formulas: [
                { label: "Law", formula: "U_(k) ~ Beta(k, n+1-k)", note: "iid Uniform(0,1) sample" },
                { label: "Minimum", formula: "U_(1) ~ Beta(1,n)", note: "first order statistic" },
                { label: "Maximum", formula: "U_(n) ~ Beta(n,1)", note: "last order statistic" }
              ]
            },
            {
              type: "example",
              title: "Demonstration: maximum of uniforms",
              body: "For n uniform points, the maximum M has CDF m^n, so its density is n m^(n-1). That is Beta(n,1).",
              steps: [
                { label: "CDF", math: "P(M<=m)=m^n", note: "All n points are <=m." },
                { label: "Differentiate", math: "f_M(m)=n m^(n-1)", note: "Density on 0<m<1." },
                { label: "Recognise", math: "M ~ Beta(n,1)", note: "Maximum is a beta order statistic." }
              ]
            }
          ]
        },
        {
          number: "8.9",
          title: "Uniform Spacings and Interval Counts",
          paragraphs: [
            "Sorted uniform points cut [0,1] into gaps called spacings. Some spacing questions are hard if we try to write every ordered density directly.",
            "A powerful first-principles move is to replace exact positions by counts in fixed intervals. Each point independently chooses an interval, with probability equal to the interval length.",
            "That is why fixed interval counts are multinomial. The deeper law of all random spacings is Dirichlet, but many exam-style interval problems only need the multinomial count view."
          ],
          blocks: [
            {
              type: "principle",
              title: "Fixed interval count pattern",
              body: "If n independent uniform points are thrown into intervals of lengths p1, ..., pk, the interval counts are multinomial.",
              formulas: [
                { label: "Counts", formula: "(N_1,...,N_k) ~ Multinomial(n; p_1,...,p_k)", note: "fixed intervals" },
                { label: "One interval", formula: "N_i ~ Binomial(n,p_i)", note: "count in a chosen interval" }
              ]
            },
            {
              type: "example",
              title: "Demonstration: points in intervals",
              body: "Five random points are placed uniformly on [0,1]. What is the probability exactly two fall in [0,0.3]?",
              steps: [
                { label: "Recognise count", math: "N = number in interval length 0.3", note: "Each point independently lands there with probability 0.3." },
                { label: "Use binomial", math: "N ~ Binomial(5,0.3)", note: "Single interval count from multinomial." },
                { label: "Compute setup", math: "P(N=2)=C(5,2)(0.3)^2(0.7)^3", note: "No order-statistic density needed." }
              ]
            }
          ]
        },
        {
          number: "8.10",
          title: "Exponential Family: Why These Keep Appearing",
          paragraphs: [
            "After deriving these distributions from different stories, it is useful to notice a second pattern: many of their formulas have a shared algebraic shape. This shared shape is called the exponential family.",
            "The practical meaning is that the same distributions that arise from clean probability stories also behave well when we do statistics with data. Their likelihoods simplify, and a few summary quantities often carry the important information.",
            "No heavy theory is needed here. The point is that these models are important twice: they describe natural random mechanisms, and they are mathematically convenient for inference."
          ],
          blocks: [
            {
              type: "principle",
              title: "Big picture",
              body: "The exponential family is a unifying language for common probability models.",
              items: [
                "Poisson: count model.",
                "Exponential and gamma: waiting-time models.",
                "Normal: measurement and aggregate-noise model.",
                "Beta: proportion/order-statistic model.",
                "Shared structure makes inference cleaner later."
              ]
            }
          ]
        }
      ],
      concepts: [
        { name: "Exponential", description: "Waiting time until the next event.", cue: "Look for time until first/next arrival." },
        { name: "Poisson", description: "Count of events in a fixed interval.", cue: "Look for number of arrivals, defects, or calls in a fixed time/area/length." },
        { name: "Gamma", description: "Waiting time until several events.", cue: "Look for time until the kth event or sum of exponential waits." },
        { name: "Normal", description: "Bell-shaped measurement or aggregate-noise model.", cue: "Look for z-scores, measurement error, or approximate normality." },
        { name: "Standard normal", description: "Normal with mean 0 and variance 1.", cue: "Standardise using Z=(X-mu)/sigma." },
        { name: "Order statistic", description: "A sorted sample value.", cue: "Look for min, max, kth smallest, kth largest, median, or rank." },
        { name: "Uniform spacing", description: "A gap between sorted uniform points.", cue: "Use interval counts when fixed intervals matter." },
        { name: "Beta", description: "Distribution on [0,1] for proportions and uniform order statistics.", cue: "Look for U_(k), random proportions, or values constrained to [0,1]." }
      ],
      techniques: [
        { name: "Match story to distribution", when: "a named distribution might apply.", move: "Identify whether the variable is a count, wait, measurement, order, gap, or proportion." },
        { name: "Use exponential survival", when: "waiting beyond time t is asked.", move: "Use P(T>t)=exp(-lambda t)." },
        { name: "Use Poisson count PMF", when: "the number of events in a fixed interval is asked.", move: "Use exp(-lambda)lambda^k/k! with the interval's expected count." },
        { name: "Connect counts and waits", when: "a Poisson-process waiting question is easier as a count.", move: "Translate T_k<=t into N(t)>=k." },
        { name: "Standardise normal values", when: "a normal probability is asked.", move: "Convert X to Z=(X-mu)/sigma and use Phi." },
        { name: "Use CDF method for order statistics", when: "min or max is asked.", move: "Translate max<=m to all observations <=m, and min>m to all observations >m." },
        { name: "Use multinomial interval counts", when: "uniform points fall into fixed intervals.", move: "Use interval lengths as cell probabilities." },
        { name: "Recognise beta from uniform order stats", when: "the kth sorted uniform value appears.", move: "Use U_(k) ~ Beta(k,n+1-k)." }
      ],
      practiceProblems: continuousDistributionPracticeProblems(),
      reviewPrompts: [
        "Explain the difference between a Poisson count and an exponential wait.",
        "Give a real situation where gamma is more natural than exponential.",
        "Why do we standardise a normal variable?",
        "How do you recognise an order-statistic problem?",
        "When should fixed-interval counts replace direct order-statistic calculation?",
        "Why does beta naturally appear from uniform order statistics?"
      ],
      reviewQuiz: {
        id: "quiz-probability-chapter-8-objective-review",
        title: "Probability Chapter 8 Objective Review",
        instructions: "Complete this after finishing Chapter 8 exposition and labelled practice. The quiz logs objective answers and diagnoses continuous distribution recognition, Poisson/exponential/gamma use, normal standardisation, order statistics, spacings, beta, and exponential-family recognition.",
        questions: continuousDistributionReviewQuestions()
      },
      readingQuestions: [
        "What phrase tells you to use exponential rather than Poisson?",
        "How are Poisson counts and exponential waits connected?",
        "Why is gamma a waiting-time distribution?",
        "What does a z-score measure?",
        "What event is equivalent to max(X1,...,Xn)<=m?",
        "How do fixed interval counts lead to a multinomial distribution?",
        "Why does the beta distribution live on [0,1]?"
      ],
      chapterSummary: [
        "Exponential models waiting time until the next event.",
        "Poisson models event counts in fixed intervals.",
        "In a Poisson process, counts and waiting times are two views of the same arrival story.",
        "Gamma models waiting time until the kth event or sums of exponential waits.",
        "Normal variables are standardised with Z=(X-mu)/sigma.",
        "Order statistics are sorted sample values such as minimum, maximum, and kth smallest.",
        "Uniform order statistics lead to beta distributions.",
        "Fixed interval counts for uniform points are multinomial.",
        "The exponential family is a unifying structure behind many common models."
      ],
      updatedAt
    },
    {
      id: "gate-da-limit-theorems-approximations",
      exam: "GATE DA",
      accountTier: "Basic",
      subject: "Probability",
      chapter: "Chapter 9",
      section: "9",
      title: "Limit Theorems and Approximations",
      summary: "Why averages stabilize, why standardized sums become nearly normal, and how to choose between exact probability, tail bounds, normal approximations, and Poisson approximations.",
      sectionPreview: "This chapter turns the earlier tools into judgement. We derive the ideas behind LLN and CLT from mean and variance, then use them to decide when an approximation is trustworthy.",
      previewActivity: "Imagine flipping a coin 1000 times. The exact number of heads moves around, but the proportion of heads usually stays close to 0.5. Why does the proportion stabilize while the raw count keeps growing?",
      chapterIntro: [
        "Limit theorems explain why probability becomes useful at scale. One trial can be noisy. Many independent trials have structure.",
        "The law of large numbers says averages settle near the mean. The central limit theorem says many standardized sums have an approximately normal shape.",
        "Approximations are not shortcuts for laziness. They are controlled replacements for exact calculations when the exact calculation is bulky or when the problem asks for insight."
      ],
      bookSections: [
        {
          number: "9.1",
          title: "Why Approximation Is Needed",
          paragraphs: [
            "Exact probability is the starting point. But exact binomial tails, long convolutions, and large sums can become tedious.",
            "A bound gives guaranteed safety but may be loose. An approximation gives a numerical estimate but needs conditions. Chapter 9 is about knowing which tool is being used and what information it consumes.",
            "The same question can have three answers: exact, bounded, and approximate. They are not interchangeable."
          ],
          blocks: [
            {
              type: "strategy",
              title: "Three levels of information",
              body: "Ask how much of the random variable's structure you are using.",
              items: [
                "Exact distribution: uses the full model and gives the sharpest answer.",
                "Tail bound: often uses only mean, variance, or independence and gives a guaranteed inequality.",
                "Approximation: uses limiting shape and gives a fast estimate when conditions are good."
              ]
            }
          ]
        },
        {
          number: "9.2",
          title: "Sample Means and Standard Error",
          paragraphs: [
            "Let X_1,...,X_n be independent observations with mean mu and variance sigma^2. The sample mean is Xbar=(X_1+...+X_n)/n.",
            "Linearity gives E[Xbar]=mu. Independence gives Var(Xbar)=sigma^2/n. Therefore the standard deviation of Xbar is sigma/sqrt(n). This is called the standard error.",
            "The important lesson is square-root improvement: to cut standard error in half, you need four times as much data."
          ],
          blocks: [
            {
              type: "example",
              title: "Derivation: why averages stabilize",
              body: "The average divides the sum by n. The mean stays at mu, but the variance shrinks because independent fluctuations partially cancel.",
              steps: [
                { label: "Mean", math: "E[Xbar]=E[(X_1+...+X_n)/n]=mu", note: "Averages target the population mean." },
                { label: "Variance of sum", math: "Var(X_1+...+X_n)=n sigma^2", note: "Use independence." },
                { label: "Scale by 1/n", math: "Var(Xbar)=n sigma^2/n^2=sigma^2/n", note: "Scaling by 1/n squares inside variance." },
                { label: "Standard error", math: "SD(Xbar)=sigma/sqrt(n)", note: "This measures typical error of the sample mean." }
              ]
            },
            {
              type: "example",
              title: "Demonstration: average marks",
              body: "If individual scores have mean 70 and standard deviation 12, the average of 36 independent scores has standard error 12/sqrt(36)=2.",
              steps: [
                { label: "One score", math: "SD(X)=12", note: "A single score is noisy." },
                { label: "Average of 36", math: "SE(Xbar)=12/6=2", note: "The average is much more stable." },
                { label: "Interpretation", math: "typical error about 2 marks", note: "Not because every student is close to 70, but because averaging cancels noise." }
              ]
            }
          ]
        },
        {
          number: "9.3",
          title: "Law of Large Numbers",
          paragraphs: [
            "The law of large numbers is the formal version of averages stabilizing. It says that Xbar gets close to mu with high probability as n grows.",
            "One way to see the idea is through Chebyshev's inequality. Since Var(Xbar)=sigma^2/n, the probability of being far from mu must shrink.",
            "LLN is about the average, not the raw sum. The sum grows, but the average settles."
          ],
          blocks: [
            {
              type: "example",
              title: "Derivation idea from Chebyshev",
              body: "For any epsilon>0, Chebyshev gives a direct bound on the chance that the sample mean is more than epsilon away from mu.",
              steps: [
                { label: "Start with Chebyshev", math: "P(|Xbar-mu|>=epsilon)<=Var(Xbar)/epsilon^2", note: "Use Chapter 4." },
                { label: "Substitute variance", math: "P(|Xbar-mu|>=epsilon)<=sigma^2/(n epsilon^2)", note: "The numerator is fixed; n grows." },
                { label: "Let n grow", math: "sigma^2/(n epsilon^2) -> 0", note: "Large samples make persistent average error unlikely." }
              ]
            }
          ]
        },
        {
          number: "9.4",
          title: "Central Limit Theorem",
          paragraphs: [
            "LLN says the average gets close to the mean. CLT says what the remaining error looks like after we zoom in by the standard error.",
            "For many independent observations with finite variance, the standardized sum or sample mean is approximately standard normal when n is large.",
            "The CLT is why normal probabilities appear even when the original observations are not normal."
          ],
          blocks: [
            {
              type: "principle",
              title: "CLT forms",
              body: "These are the same statement written for sums and averages.",
              formulas: [
                { label: "Sum", formula: "(S_n-n mu)/(sigma sqrt(n)) approximately N(0,1)", note: "S_n=X_1+...+X_n" },
                { label: "Average", formula: "(Xbar-mu)/(sigma/sqrt(n)) approximately N(0,1)", note: "standardize by standard error" }
              ]
            },
            {
              type: "example",
              title: "Demonstration: average waiting time",
              body: "Suppose service times have mean 10 minutes and standard deviation 4 minutes. For 64 independent services, approximate P(Xbar>11).",
              steps: [
                { label: "Standard error", math: "SE=4/sqrt(64)=0.5", note: "Average of 64 service times." },
                { label: "Standardize", math: "z=(11-10)/0.5=2", note: "Two standard errors above the mean." },
                { label: "Use normal", math: "P(Xbar>11) about P(Z>2)=1-Phi(2)", note: "CLT approximation." }
              ]
            }
          ]
        },
        {
          number: "9.5",
          title: "Normal Approximation to Binomial",
          paragraphs: [
            "A binomial count is a sum of independent Bernoulli variables. That makes it a direct CLT target.",
            "If X~Binomial(n,p), then E[X]=np and Var(X)=np(1-p). When both np and n(1-p) are reasonably large, the count is approximately normal.",
            "The normal is continuous while the binomial is discrete, so a continuity correction often improves tail estimates."
          ],
          blocks: [
            {
              type: "principle",
              title: "Binomial to normal",
              body: "Use when successes and failures both have enough expected count.",
              formulas: [
                { label: "Approximation", formula: "X approximately Normal(np, np(1-p))", note: "for X~Binomial(n,p)" },
                { label: "Standardize", formula: "Z=(X-np)/sqrt(np(1-p))", note: "convert to standard normal" },
                { label: "Rule of thumb", formula: "np>=10 and n(1-p)>=10", note: "diagnostic, not a theorem" }
              ]
            },
            {
              type: "example",
              title: "Demonstration: at least 55 heads",
              body: "Let X~Binomial(100,0.5). Approximate P(X>=55).",
              steps: [
                { label: "Mean and SD", math: "mu=50, sigma=sqrt(25)=5", note: "Binomial mean and standard deviation." },
                { label: "Continuity correction", math: "P(X>=55) becomes P(Y>=54.5)", note: "The normal interval starts halfway before 55." },
                { label: "Standardize", math: "z=(54.5-50)/5=0.9", note: "Use Y~Normal(50,25)." },
                { label: "Approximate", math: "P(X>=55) about P(Z>=0.9)=1-Phi(0.9)", note: "A fast tail estimate." }
              ]
            }
          ]
        },
        {
          number: "9.6",
          title: "Poisson Approximation to Binomial",
          paragraphs: [
            "When n is large and p is small, a binomial count is many trials with rare success. That is exactly the rare-event story behind the Poisson distribution.",
            "Keep lambda=np moderate. Then Binomial(n,p) can be approximated by Poisson(lambda).",
            "This approximation is for rare counts, not for balanced coin flips."
          ],
          blocks: [
            {
              type: "example",
              title: "Derivation idea: rare successes",
              body: "For fixed lambda=np, the binomial probability starts to look Poisson as n grows and p=lambda/n shrinks.",
              steps: [
                { label: "Binomial setup", math: "P(X=k)=C(n,k)(lambda/n)^k(1-lambda/n)^(n-k)", note: "Write p=lambda/n." },
                { label: "Limit pieces", math: "C(n,k)(lambda/n)^k -> lambda^k/k!", note: "The combinatorial part settles." },
                { label: "No-success mass", math: "(1-lambda/n)^n -> exp(-lambda)", note: "The exponential appears again." },
                { label: "Poisson result", math: "P(X=k) about exp(-lambda)lambda^k/k!", note: "Use lambda=np." }
              ]
            },
            {
              type: "example",
              title: "Demonstration: rare defective items",
              body: "A factory has defect probability 0.01 per item. In 200 independent items, approximate the probability of exactly 3 defects.",
              steps: [
                { label: "Check story", math: "n=200, p=0.01, lambda=np=2", note: "Many trials, rare success." },
                { label: "Approximate model", math: "X approximately Poisson(2)", note: "Use rare-event approximation." },
                { label: "Compute", math: "P(X=3) about exp(-2)2^3/3!", note: "Avoid a bulky binomial calculation." }
              ]
            }
          ]
        },
        {
          number: "9.7",
          title: "Exact, Bound, or Approximation",
          paragraphs: [
            "A good solution begins by naming the kind of answer being produced. Exact answers use the model directly. Bounds guarantee an inequality. Approximations estimate the numerical value.",
            "In exams, exact small cases are often best. For large binomial tails, normal or Poisson approximations can be faster. For guarantee-style questions, use Markov, Chebyshev, or Chernoff.",
            "Do not use a normal approximation just because a normal table is available. Check the story and the expected counts."
          ],
          blocks: [
            {
              type: "strategy",
              title: "Method choice checklist",
              body: "Choose the method by reading the problem, not by hunting for a formula.",
              items: [
                "Small exact count: compute directly with binomial, Poisson, or distribution rules.",
                "Average of many independent observations: use standard error and CLT.",
                "Binomial with many expected successes and failures: use normal approximation, usually with continuity correction.",
                "Binomial with many trials and rare success: use Poisson approximation with lambda=np.",
                "Need a guaranteed upper bound or only mean/variance is known: use a tail bound."
              ]
            },
            {
              type: "example",
              title: "Diagnostic comparison",
              body: "For X~Binomial(1000,0.002), the expected count is 2. A normal approximation is poor because expected failures are large but expected successes are tiny. Poisson(2) matches the rare-event structure.",
              steps: [
                { label: "Expected successes", math: "np=2", note: "Too small for normal." },
                { label: "Expected failures", math: "n(1-p)=998", note: "Large failures alone are not enough." },
                { label: "Choose approximation", math: "X approximately Poisson(2)", note: "Rare-event count." }
              ]
            }
          ]
        }
      ],
      concepts: [
        { name: "Standard error", description: "The standard deviation of an estimator such as the sample mean.", cue: "Look for variability of an average." },
        { name: "Law of large numbers", description: "Sample averages get close to the population mean with high probability.", cue: "Look for long-run average or stability." },
        { name: "Central limit theorem", description: "Standardized sums and averages become approximately normal.", cue: "Look for many independent contributions with finite variance." },
        { name: "Normal approximation", description: "Approximate a large binomial or standardized average using a normal distribution.", cue: "Check expected successes and failures." },
        { name: "Continuity correction", description: "Adjust a discrete cutoff by 0.5 before using a continuous normal.", cue: "Use when a binomial count is approximated by normal." },
        { name: "Poisson approximation", description: "Approximate many rare independent successes by Poisson(np).", cue: "Look for large n, small p, and moderate np." },
        { name: "Approximation diagnostics", description: "Conditions that tell whether an approximation is plausible.", cue: "Check independence, sample size, expected counts, and rare-event structure." }
      ],
      techniques: [
        { name: "Compute standard error", when: "a sample mean appears.", move: "Use sigma/sqrt(n), or sqrt(p(1-p)/n) for a sample proportion." },
        { name: "Use LLN reasoning", when: "a problem asks why averages stabilize.", move: "Show Var(Xbar)=sigma^2/n and apply Chebyshev if needed." },
        { name: "Use CLT for averages", when: "many independent observations are averaged.", move: "Standardize by the standard error and use Phi." },
        { name: "Use normal approximation to binomial", when: "X~Binomial(n,p) and np, n(1-p) are both large.", move: "Approximate by Normal(np,np(1-p)) and apply continuity correction." },
        { name: "Use Poisson approximation to binomial", when: "n is large, p is small, and lambda=np is moderate.", move: "Approximate by Poisson(lambda)." },
        { name: "Compare tools", when: "exact, bound, and approximation methods all seem possible.", move: "State whether the answer is exact, guaranteed, or approximate." }
      ],
      practiceProblems: limitTheoremPracticeProblems(),
      reviewPrompts: [
        "Why does the standard error of an average shrink like 1/sqrt(n)?",
        "What is the difference between LLN and CLT?",
        "When is normal approximation to binomial reasonable?",
        "Why do we use continuity correction?",
        "When is Poisson approximation better than normal approximation?",
        "How do exact answers, bounds, and approximations differ?"
      ],
      reviewQuiz: {
        id: "quiz-probability-chapter-9-objective-review",
        title: "Probability Chapter 9 Objective Review",
        instructions: "Complete this after finishing Chapter 9 exposition and labelled practice. The quiz logs objective answers and diagnoses LLN, CLT, standard error, normal approximation, continuity correction, Poisson approximation, and method choice.",
        questions: limitTheoremReviewQuestions()
      },
      readingQuestions: [
        "What quantity becomes stable in the law of large numbers?",
        "Why is standard error smaller than the standard deviation of one observation?",
        "What does the CLT say after standardization?",
        "Why is a binomial count a sum of Bernoulli variables?",
        "What does continuity correction fix?",
        "What rare-event pattern leads to Poisson approximation?",
        "How can you tell whether a requested answer is exact, bounded, or approximate?"
      ],
      chapterSummary: [
        "Sample averages target mu and have standard error sigma/sqrt(n).",
        "LLN says averages become close to the mean with high probability.",
        "CLT says standardized sums and averages are approximately normal in many large-sample settings.",
        "Binomial counts can be approximated by normal when expected successes and failures are both large.",
        "Continuity correction improves normal approximations to discrete counts.",
        "Binomial counts can be approximated by Poisson(lambda=np) when successes are rare.",
        "Exact probabilities, tail bounds, and approximations answer different kinds of questions."
      ],
      updatedAt
    },
    {
      id: "gate-da-confidence-intervals-hypothesis-tests",
      exam: "GATE DA",
      accountTier: "Basic",
      subject: "Probability",
      chapter: "Chapter 10",
      section: "10",
      title: "Confidence Intervals and Hypothesis Tests",
      summary: "Inference built from one delivery-app matching case study: compatible parameter values, Wald and score intervals, z-tests, t-tests, chi-squared tests, p-values, rejection regions, and power.",
      sectionPreview: "We are designing a matching algorithm for a delivery app. Every test is a product question: did the new algorithm reduce delivery time, improve acceptance, change category mix, or create dependence between region and delay?",
      previewActivity: "A new matcher reduces average observed delivery time from 32.0 to 30.8 minutes in a sample. Is that proof, noise, or evidence? What extra information do you need before making a launch decision?",
      chapterIntro: [
        "Hypothesis testing is organized skepticism. The null hypothesis is the boring baseline: no improvement, no difference, no dependence, no mismatch. The alternative is the product claim we are investigating.",
        "A test statistic is chosen by asking: under the null, what standardized quantity should have a known reference distribution? z-statistics use normal standard errors, t-statistics repair unknown sigma, and chi-squared statistics add squared standardized count discrepancies.",
        "The significance level alpha controls false alarms. The p-value measures how surprising the observed statistic would be under the null. Power measures how often the test catches a real effect."
      ],
      bookSections: [
        {
          number: "10.1",
          title: "The Delivery Matching Case Study",
          paragraphs: [
            "The app matches delivery persons to restaurants and then to customer homes. A new matching algorithm claims to reduce delay, increase driver acceptance, and keep assignments fair across restaurant types and regions.",
            "Each data question has the same hypothesis-testing skeleton: define a parameter, state H0 and H1, choose alpha, choose a statistic whose null distribution we understand, compute the statistic, compare to a rejection region or p-value, and interpret the decision.",
            "The test does not prove the product claim true. It tells us whether the observed data are difficult to reconcile with the null model."
          ],
          blocks: [
            {
              type: "strategy",
              title: "Hypothesis-test skeleton",
              body: "Use this structure every time.",
              items: [
                "Parameter: what unknown population quantity is being studied?",
                "Null H0: the baseline claim, usually no improvement or no difference.",
                "Alternative H1: the direction or difference the product team cares about.",
                "Significance alpha: the tolerated Type I error rate before seeing the data.",
                "Statistic: a standardized estimate or discrepancy with a known null reference distribution.",
                "Decision: reject H0 if the statistic falls in the rejection region, or if p-value <= alpha.",
                "Power: probability of rejecting H0 when a specific alternative is true."
              ]
            }
          ]
        },
        {
          number: "10.2",
          title: "Confidence Intervals: Compatible Values",
          paragraphs: [
            "A confidence interval lists parameter values that are compatible with the data at a chosen confidence level. For the delivery app, we might estimate the mean delivery time or the driver acceptance probability.",
            "The common Wald pattern is estimator plus or minus critical value times standard error. It comes from standardizing the estimator around the true parameter.",
            "A confidence interval and a two-sided test are two views of the same idea: values outside the interval would be rejected by the matching two-sided test."
          ],
          blocks: [
            {
              type: "example",
              title: "Derivation: Wald interval for mean delivery time",
              body: "Let Xbar estimate the true mean delivery time mu. If n is large, (Xbar-mu)/SE is approximately N(0,1).",
              steps: [
                { label: "Start from reference event", math: "P(-z* <= (Xbar-mu)/SE <= z*) about 1-alpha", note: "z* is the normal critical value." },
                { label: "Solve for mu", math: "Xbar-z*SE <= mu <= Xbar+z*SE", note: "Rearrange the inequality." },
                { label: "Wald interval", math: "estimate +/- critical value x SE", note: "This is the reusable pattern." }
              ]
            },
            {
              type: "example",
              title: "Case question: average delivery time",
              body: "For 100 deliveries under the new matcher, Xbar=30.8 minutes and sample standard deviation is 8 minutes. A 95% large-sample interval is 30.8 +/- 1.96(8/sqrt(100)).",
              steps: [
                { label: "Standard error", math: "SE=8/10=0.8", note: "Estimated variability of the sample mean." },
                { label: "Margin", math: "1.96 x 0.8=1.568", note: "95% normal critical value." },
                { label: "Interval", math: "(29.232, 32.368)", note: "Compatible mean delivery times under this approximation." }
              ]
            }
          ]
        },
        {
          number: "10.3",
          title: "Wald and Score for Acceptance Rates",
          paragraphs: [
            "Acceptance rate is a proportion. If 420 out of 600 offered deliveries are accepted, phat=0.70 estimates the true acceptance probability p.",
            "The Wald interval plugs phat into the standard error sqrt(p(1-p)/n). This is simple, but near 0 or 1, or for small samples, it can behave badly.",
            "The score interval asks a better question: for which null values p0 would the standardized score (phat-p0)/sqrt(p0(1-p0)/n) not be too extreme? It uses the null value inside the standard error and then solves the inequality."
          ],
          blocks: [
            {
              type: "example",
              title: "Derivation: score idea",
              body: "Instead of centering uncertainty at phat, test each possible p0 and keep values that are not rejected.",
              steps: [
                { label: "Score statistic", math: "Z(p0)=(phat-p0)/sqrt(p0(1-p0)/n)", note: "Use standard error under the hypothesized p0." },
                { label: "Keep compatible p0", math: "|Z(p0)| <= z*", note: "These values survive the two-sided test." },
                { label: "Score interval", math: "solve (phat-p0)^2 <= z*^2 p0(1-p0)/n", note: "The interval is obtained by inverting the test." }
              ]
            },
            {
              type: "principle",
              title: "When to remember which",
              body: "Wald is the quick estimator-centered method. Score is the test-inversion method and is often more stable for proportions.",
              formulas: [
                { label: "Wald proportion", formula: "phat +/- z*sqrt(phat(1-phat)/n)", note: "simple large-sample interval" },
                { label: "Score test statistic", formula: "(phat-p0)/sqrt(p0(1-p0)/n)", note: "uses null standard error" }
              ]
            }
          ]
        },
        {
          number: "10.4",
          title: "z-Test: Did Mean Delivery Time Improve?",
          paragraphs: [
            "The old average delivery time is 32 minutes. The product claim is that the new matcher reduces mean delivery time. So H0: mu=32 and H1: mu<32.",
            "The statistic is chosen by the same standardization logic as the confidence interval. If H0 is true, Xbar should be near 32, with standard error sigma/sqrt(n) if sigma is known or a large-sample estimate if not.",
            "A left-tailed test rejects for very negative z-values."
          ],
          blocks: [
            {
              type: "example",
              title: "Derivation and test",
              body: "Suppose n=100, Xbar=30.8, and historical sigma=8 is trusted. Test at alpha=0.05.",
              steps: [
                { label: "Hypotheses", math: "H0: mu=32, H1: mu<32", note: "The claim is improvement, so use left tail." },
                { label: "Statistic choice", math: "Z=(Xbar-mu0)/(sigma/sqrt(n))", note: "Under H0 this is approximately N(0,1)." },
                { label: "Compute", math: "Z=(30.8-32)/(8/10)=-1.5", note: "Observed mean is 1.5 SEs below the null mean." },
                { label: "Rejection rule", math: "reject if Z<=-1.645", note: "5% left-tail normal cutoff." },
                { label: "Decision", math: "-1.5>-1.645", note: "Do not reject at 5%; evidence is not strong enough by this rule." }
              ]
            }
          ]
        },
        {
          number: "10.5",
          title: "t-Test: When sigma Is Unknown",
          paragraphs: [
            "In real app experiments, the true standard deviation of delivery time is usually unknown. Replacing sigma by the sample standard deviation s adds uncertainty.",
            "For normal data, (Xbar-mu0)/(s/sqrt(n)) follows a t distribution with n-1 degrees of freedom under H0. For large n, t looks close to normal.",
            "The t-test is the mean test that accounts for estimating sigma from the same sample."
          ],
          blocks: [
            {
              type: "example",
              title: "Derivation: why t appears",
              body: "If sigma were known, standardization gives Z. If sigma is replaced by random s, the denominator is noisier, so the reference distribution has heavier tails.",
              steps: [
                { label: "Known sigma", math: "(Xbar-mu0)/(sigma/sqrt(n)) ~ N(0,1)", note: "Normal reference." },
                { label: "Unknown sigma", math: "T=(Xbar-mu0)/(s/sqrt(n))", note: "Estimated standard error." },
                { label: "Reference", math: "T ~ t_(n-1) under H0", note: "Assuming normal population, or approximately for large samples." }
              ]
            },
            {
              type: "example",
              title: "Case question: paired driver routes",
              body: "The same 20 restaurants are tested with old and new matching on comparable evenings. Let D=old time minus new time. Positive D means improvement. Test H0: mu_D=0 vs H1: mu_D>0.",
              steps: [
                { label: "Why paired", math: "D_i=old_i-new_i", note: "Pairing removes restaurant-specific baseline difficulty." },
                { label: "Statistic", math: "T=(Dbar-0)/(s_D/sqrt(20))", note: "One-sample t-test on differences." },
                { label: "Reject", math: "large positive T", note: "Right-tailed because positive difference means faster delivery." }
              ]
            }
          ]
        },
        {
          number: "10.6",
          title: "p-Values, Critical Regions, and Power",
          paragraphs: [
            "A critical region is the set of statistic values that cause rejection. It is chosen so that, under H0, the probability of landing there is alpha.",
            "A p-value is the probability under H0 of a result at least as extreme as what was observed. Small p-values mean the observed statistic is unusual under H0.",
            "Power is P(reject H0 when the alternative is true). Power increases when the effect is larger, sample size is larger, noise is smaller, or alpha is larger."
          ],
          blocks: [
            {
              type: "example",
              title: "Case question: power for launch detection",
              body: "Suppose the team will launch if a one-sided z-test rejects H0: mu=32 at alpha=0.05. If the true mean under the new matcher is 30.4, power is the probability the test statistic crosses the rejection cutoff under mu=30.4.",
              steps: [
                { label: "Cutoff in Xbar units", math: "reject if Xbar <= 32-1.645(sigma/sqrt(n))", note: "Translate statistic rule back to the observed average." },
                { label: "Power", math: "P_mu=30.4(Xbar <= cutoff)", note: "Compute probability under the alternative distribution." },
                { label: "Levers", math: "larger n or smaller sigma increases power", note: "The distributions under H0 and H1 overlap less." }
              ]
            }
          ]
        },
        {
          number: "10.7",
          title: "Chi-Squared Distribution",
          paragraphs: [
            "The chi-squared distribution appears when squared standardized normal errors are added.",
            "If Z_1,...,Z_k are independent standard normals, then Z_1^2+...+Z_k^2 has a chi-squared distribution with k degrees of freedom.",
            "Degrees of freedom count how many independent pieces of squared discrepancy remain after constraints are used."
          ],
          blocks: [
            {
              type: "principle",
              title: "Why squared discrepancies",
              body: "Counts can be above or below expectation. Squaring makes both directions contribute positive evidence against the null.",
              formulas: [
                { label: "Chi-squared variable", formula: "Z_1^2+...+Z_k^2 ~ chi-square_k", note: "sum of squared independent standard normals" },
                { label: "Count discrepancy", formula: "(observed-expected)^2/expected", note: "squared standardized count gap" }
              ]
            }
          ]
        },
        {
          number: "10.8",
          title: "Chi-Squared Goodness-of-Fit",
          paragraphs: [
            "Suppose the matcher promises restaurant assignments in the mix 50% quick-service, 30% casual, and 20% grocery. In 200 assignments, we observe counts 120, 50, and 30.",
            "The null says the category probabilities are 0.5, 0.3, and 0.2. The expected counts are 100, 60, and 40. The statistic adds squared standardized gaps.",
            "Large chi-squared values mean observed counts are too far from expected counts to fit the null mix comfortably."
          ],
          blocks: [
            {
              type: "example",
              title: "Derivation and test",
              body: "Use X^2=sum (O-E)^2/E with degrees of freedom categories minus one.",
              steps: [
                { label: "Hypotheses", math: "H0: p=(0.5,0.3,0.2), H1: not this mix", note: "Goodness-of-fit test." },
                { label: "Expected counts", math: "E=(100,60,40)", note: "Multiply probabilities by 200." },
                { label: "Statistic", math: "X^2=(120-100)^2/100+(50-60)^2/60+(30-40)^2/40", note: "Add standardized squared count gaps." },
                { label: "Degrees of freedom", math: "df=3-1=2", note: "Three counts constrained by total 200." },
                { label: "Decision", math: "reject for large X^2", note: "Compare to chi-square_2 critical value or p-value." }
              ]
            }
          ]
        },
        {
          number: "10.9",
          title: "Chi-Squared Test of Independence",
          paragraphs: [
            "Now ask whether late delivery is independent of city region. The data form a contingency table: rows are regions, columns are on-time/late.",
            "Under independence, expected count in a cell equals row total times column total divided by grand total.",
            "The same chi-squared discrepancy statistic applies, but degrees of freedom become (rows-1)(columns-1)."
          ],
          blocks: [
            {
              type: "example",
              title: "Case question: region and lateness",
              body: "For 2 regions and 2 outcomes, observed counts are North: 90 on-time, 30 late; South: 70 on-time, 10 late. Test whether region and lateness are independent.",
              steps: [
                { label: "Hypotheses", math: "H0: region and lateness are independent", note: "H1: they are associated." },
                { label: "Expected counts", math: "E_ij=(row total)(column total)/(grand total)", note: "Use marginal totals under independence." },
                { label: "Statistic", math: "X^2=sum over cells (O_ij-E_ij)^2/E_ij", note: "Add all four cell discrepancies." },
                { label: "Degrees of freedom", math: "df=(2-1)(2-1)=1", note: "One independent association direction." },
                { label: "Decision", math: "reject for large X^2", note: "Large discrepancy suggests dependence." }
              ]
            }
          ]
        },
        {
          number: "10.10",
          title: "Choosing the Right Test",
          paragraphs: [
            "The test statistic is picked from the data type and the null model. Means lead to standardized averages. Proportions lead to standardized Bernoulli averages. Paired before/after designs lead to differences. Count patterns lead to chi-squared discrepancies.",
            "A one-sided alternative is used only when the direction is decided before seeing data. Otherwise use a two-sided alternative.",
            "The final answer should always include the product interpretation: what the data say about the matching algorithm, and what they do not say."
          ],
          blocks: [
            {
              type: "strategy",
              title: "Test chooser",
              body: "Use the product question to choose the statistic.",
              items: [
                "Mean with known sigma or large sample: z statistic.",
                "Mean with unknown sigma: t statistic.",
                "Same unit measured old and new: paired t on differences.",
                "One proportion or large-sample rate: z statistic or score statistic.",
                "Observed counts versus promised category mix: chi-squared goodness-of-fit.",
                "Two categorical variables in a table: chi-squared independence test.",
                "Need an interval: invert the same standardized statistic to get compatible parameter values."
              ]
            }
          ]
        }
      ],
      concepts: [
        { name: "Null hypothesis", description: "The baseline model used to judge surprise.", cue: "Look for no improvement, no difference, no dependence, or promised mix." },
        { name: "Alternative hypothesis", description: "The claim that would make the statistic extreme.", cue: "Check whether the product question is one-sided or two-sided." },
        { name: "Significance level", description: "The planned Type I error probability.", cue: "Usually alpha=0.05 unless stated otherwise." },
        { name: "Test statistic", description: "A standardized estimate or discrepancy with a known null distribution.", cue: "Ask what would be predictable under H0." },
        { name: "p-value", description: "Under H0, probability of a result at least as extreme as observed.", cue: "Small p-values are evidence against H0." },
        { name: "Power", description: "Probability of rejecting H0 under a specified alternative.", cue: "Depends on effect size, n, noise, and alpha." },
        { name: "Wald interval", description: "Estimate plus/minus critical value times standard error.", cue: "Quick large-sample interval." },
        { name: "Score method", description: "Invert a null-based standardized statistic.", cue: "Especially useful for proportions." },
        { name: "z-test", description: "Normal-reference test for standardized estimates.", cue: "Known sigma or large-sample mean/proportion." },
        { name: "t-test", description: "Mean test using sample standard deviation and t reference.", cue: "Unknown sigma for mean, especially small samples." },
        { name: "Chi-squared test", description: "Test based on summed squared standardized count discrepancies.", cue: "Observed versus expected counts." }
      ],
      techniques: [
        { name: "Build a CI from a statistic", when: "a compatible range is asked.", move: "Start with a central probability statement and solve for the parameter." },
        { name: "Derive a z-statistic", when: "an estimator is approximately normal under H0.", move: "Subtract the null value and divide by the null standard error." },
        { name: "Derive a t-statistic", when: "testing a mean with unknown sigma.", move: "Replace sigma with sample s and use t degrees of freedom." },
        { name: "Use paired differences", when: "old and new are measured on the same restaurant, driver, or route.", move: "Convert each pair to a difference and run a one-sample t-test." },
        { name: "Compute chi-squared GOF", when: "counts are compared to a promised distribution.", move: "Compute expected counts and sum (O-E)^2/E." },
        { name: "Compute chi-squared independence", when: "two categorical variables are in a table.", move: "Use row total times column total divided by grand total for expected counts." },
        { name: "Interpret p-values and power", when: "making a launch decision.", move: "Separate evidence against H0 from probability of detecting a real effect." }
      ],
      practiceProblems: inferencePracticeProblems(),
      reviewPrompts: [
        "For each delivery-app question, identify the parameter, null, alternative, statistic, and decision rule.",
        "Explain how a confidence interval is built by solving a probability statement for the parameter.",
        "Explain why a t-test is different from a z-test.",
        "Explain how the score method differs from the Wald method for proportions.",
        "Explain why chi-squared tests add squared standardized count differences.",
        "Explain what power changes when sample size increases."
      ],
      reviewQuiz: {
        id: "quiz-probability-chapter-10-objective-review",
        title: "Probability Chapter 10 Objective Review",
        instructions: "Complete this after finishing Chapter 10 exposition and labelled practice. The quiz logs objective answers and diagnoses confidence intervals, z-tests, t-tests, score methods, chi-squared tests, p-values, rejection regions, and power.",
        questions: inferenceReviewQuestions()
      },
      readingQuestions: [
        "What is the null hypothesis in the delivery-time improvement test?",
        "How is a test statistic chosen from the null model?",
        "Why does unknown sigma lead to a t statistic?",
        "Why does a score interval put p0 inside the standard error?",
        "What makes a p-value small?",
        "Why do chi-squared tests reject for large values?",
        "What is the difference between significance and power?"
      ],
      chapterSummary: [
        "Hypothesis tests compare observed data to a null model.",
        "The significance level alpha controls Type I error probability.",
        "A test statistic is chosen so its null distribution is known or approximately known.",
        "Wald intervals use estimate plus/minus critical value times standard error.",
        "Score intervals invert a null-based test statistic.",
        "z-tests standardize estimates using known or large-sample standard errors.",
        "t-tests handle unknown sigma by using the sample standard deviation and t reference.",
        "Chi-squared tests add squared standardized count discrepancies.",
        "p-values measure surprise under H0; power measures detection probability under an alternative."
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

function jointDistributionPracticeProblems() {
  return [
    {
      label: "Concept Problem 1: Read a joint PMF",
      concept: "Joint PMF",
      technique: "Read table cells",
      difficulty: "intro",
      prompt: "Suppose p(0,0)=0.2, p(0,1)=0.3, p(1,0)=0.1, and p(1,1)=0.4. Find P(X=1,Y=0) and P(X=0).",
      solution: "P(X=1,Y=0) is the cell p(1,0)=0.1. For P(X=0), add across Y: p(0,0)+p(0,1)=0.2+0.3=0.5."
    },
    {
      label: "Concept Problem 2: Conditional from a table",
      concept: "Conditional distribution",
      technique: "Divide joint by marginal",
      difficulty: "intro",
      prompt: "Using the same table, find P(Y=1 | X=0).",
      solution: "P(Y=1 | X=0)=P(X=0,Y=1)/P(X=0)=0.3/0.5=0.6."
    },
    {
      label: "Concept Problem 3: Independence check",
      concept: "Independence",
      technique: "Compare joint with product of marginals",
      difficulty: "intro",
      prompt: "Using the same table, are X and Y independent?",
      solution: "P(X=1)=0.1+0.4=0.5 and P(Y=1)=0.3+0.4=0.7. If independent, p(1,1) would be 0.5 x 0.7=0.35. But p(1,1)=0.4, so X and Y are not independent."
    },
    {
      label: "Problem 4: Dice joint probability",
      concept: "Joint distribution",
      technique: "Translate pair events",
      difficulty: "warmup",
      prompt: "Two fair dice are rolled. Let X be the first die and S be the sum. Find P(X=3,S=8).",
      solution: "X=3 and S=8 means the second die must be 5. Only ordered outcome (3,5) works, so the probability is 1/36."
    },
    {
      label: "Problem 5: Dice conditional distribution",
      concept: "Conditional distribution",
      technique: "Restrict to compatible pairs",
      difficulty: "warmup",
      prompt: "Two fair dice are rolled. Given that the sum is 9, what is P(first die is 4)?",
      solution: "Sum 9 outcomes are (3,6),(4,5),(5,4),(6,3). Exactly one has first die 4, so the conditional probability is 1/4."
    },
    {
      label: "Problem 6: Continuous rectangle",
      concept: "Joint PDF",
      technique: "Integrate density over a region",
      difficulty: "warmup",
      prompt: "Let (X,Y) be uniform on the unit square. Find P(X<=1/2, Y<=3/4).",
      solution: "The density is 1 on the unit square. The region is a rectangle with area (1/2)(3/4)=3/8, so the probability is 3/8."
    },
    {
      label: "Problem 7: Marginal from triangular support",
      concept: "Support region",
      technique: "Choose correct bounds",
      difficulty: "standard",
      prompt: "Let f(x,y)=2 on 0<y<x<1. Find f_X(x).",
      solution: "For fixed x between 0 and 1, y runs from 0 to x. Therefore f_X(x)=integral_0^x 2 dy = 2x for 0<x<1."
    },
    {
      label: "Problem 8: Conditional density from triangle",
      concept: "Conditional PDF",
      technique: "Divide joint by marginal",
      difficulty: "standard",
      prompt: "For f(x,y)=2 on 0<y<x<1, find f_{Y|X}(y|x).",
      solution: "From Problem 7, f_X(x)=2x. So f_{Y|X}(y|x)=f(x,y)/f_X(x)=2/(2x)=1/x for 0<y<x. Given X=x, Y is uniform on (0,x)."
    },
    {
      label: "Problem 9: Independent joint density",
      concept: "Independence",
      technique: "Factor the joint density",
      difficulty: "standard",
      prompt: "Let f(x,y)=6xy^2 on 0<x<1, 0<y<1. Are X and Y independent?",
      solution: "Compute marginals: f_X(x)=integral_0^1 6xy^2 dy = 2x, and f_Y(y)=integral_0^1 6xy^2 dx = 3y^2. Their product is (2x)(3y^2)=6xy^2=f(x,y), so X and Y are independent."
    },
    {
      label: "Problem 10: Non-independent support",
      concept: "Independence",
      technique: "Use support shape",
      difficulty: "standard",
      prompt: "Let f(x,y)=2 on 0<y<x<1. Can X and Y be independent?",
      solution: "No. The support is triangular: if X is small, Y must be even smaller. Independence would require a rectangular-style support after factoring marginals. The allowed values of Y depend on X."
    },
    {
      label: "Problem 11: Sum of two dice",
      concept: "Transformation",
      technique: "Collect pairs",
      difficulty: "standard",
      prompt: "Two fair dice are rolled. Find P(X+Y=5).",
      solution: "The ordered pairs are (1,4),(2,3),(3,2),(4,1), so there are 4 favourable outcomes out of 36. Probability = 4/36 = 1/9."
    },
    {
      label: "Problem 12: Maximum of two uniforms",
      concept: "Max transformation",
      technique: "Use CDF event",
      difficulty: "standard",
      prompt: "Let X and Y be independent Uniform(0,1). If M=max(X,Y), find P(M<=m) for 0<=m<=1.",
      solution: "M<=m means both X<=m and Y<=m. By independence, P(M<=m)=P(X<=m)P(Y<=m)=m x m = m^2."
    },
    {
      label: "Problem 13: Minimum of two uniforms",
      concept: "Min transformation",
      technique: "Use complement",
      difficulty: "standard",
      prompt: "Let X and Y be independent Uniform(0,1). If L=min(X,Y), find P(L>t) for 0<=t<=1.",
      solution: "L>t means both X>t and Y>t. By independence, P(L>t)=(1-t)^2."
    },
    {
      label: "Problem 14: Region probability",
      concept: "Joint PDF",
      technique: "Integrate over triangle",
      difficulty: "challenging",
      prompt: "Let (X,Y) be uniform on the unit square. Find P(X+Y<=1).",
      solution: "The region X+Y<=1 inside the unit square is a right triangle with area 1/2. Since the density is 1, the probability is 1/2."
    },
    {
      label: "Problem 15: Marginal does not determine joint",
      concept: "Joint versus marginal",
      technique: "Compare relationship structures",
      difficulty: "challenging",
      prompt: "Give an example idea showing why knowing the marginal distributions of X and Y does not determine their joint distribution.",
      solution: "Let X be a fair 0/1 variable. In one model, set Y=X. In another model, choose Y independently fair 0/1. In both models, X and Y each have marginal probabilities 1/2 and 1/2, but the joint behaviour is different."
    }
  ];
}

function jointDistributionReviewQuestions() {
  return [
    {
      id: "joint-review-1",
      kind: "single concept",
      tags: ["joint-distribution"],
      prompt: "What does a joint distribution describe?",
      options: [
        { id: "a", text: "Only the mean of one random variable" },
        { id: "b", text: "How two or more random variables behave together" },
        { id: "c", text: "Only the variance of a random variable" },
        { id: "d", text: "Only independent events" }
      ],
      answer: "b"
    },
    {
      id: "joint-review-2",
      kind: "single concept",
      tags: ["joint-pmf"],
      prompt: "For discrete X and Y, what is p(x,y)?",
      options: [
        { id: "a", text: "P(X=x and Y=y)" },
        { id: "b", text: "P(X=x) + P(Y=y)" },
        { id: "c", text: "E[X+Y]" },
        { id: "d", text: "Var(XY)" }
      ],
      answer: "a"
    },
    {
      id: "joint-review-3",
      kind: "single concept",
      tags: ["marginal"],
      prompt: "How do you find p_X(x) from a joint PMF p(x,y)?",
      options: [
        { id: "a", text: "Multiply over all y" },
        { id: "b", text: "Sum p(x,y) over all y" },
        { id: "c", text: "Divide by p_Y(y)" },
        { id: "d", text: "Take a square root" }
      ],
      answer: "b"
    },
    {
      id: "joint-review-4",
      kind: "single concept",
      tags: ["conditional-distribution"],
      prompt: "For discrete variables, which formula gives P(X=x | Y=y)?",
      options: [
        { id: "a", text: "p(x,y)p_Y(y)" },
        { id: "b", text: "p(x,y)/p_Y(y)" },
        { id: "c", text: "p_X(x)/p(x,y)" },
        { id: "d", text: "p_X(x)+p_Y(y)" }
      ],
      answer: "b"
    },
    {
      id: "joint-review-5",
      kind: "single concept",
      tags: ["independence"],
      prompt: "Which condition expresses independence of discrete X and Y?",
      options: [
        { id: "a", text: "p(x,y)=p_X(x)p_Y(y) for all x,y" },
        { id: "b", text: "p(x,y)=p_X(x)+p_Y(y) for all x,y" },
        { id: "c", text: "E[X]=E[Y]" },
        { id: "d", text: "X and Y have the same support" }
      ],
      answer: "a"
    },
    {
      id: "joint-review-6",
      kind: "mixed: two concepts",
      tags: ["joint-pdf", "support-region"],
      prompt: "For continuous random variables, how is P((X,Y) in A) computed?",
      options: [
        { id: "a", text: "By reading f(x,y) at one point" },
        { id: "b", text: "By integrating the joint density over A" },
        { id: "c", text: "By adding x and y" },
        { id: "d", text: "By taking only the marginal of X" }
      ],
      answer: "b"
    },
    {
      id: "joint-review-7",
      kind: "mixed: two concepts",
      tags: ["support-region", "marginal"],
      prompt: "For f(x,y)=2 on 0<y<x<1, what are the y-bounds when finding f_X(x)?",
      options: [
        { id: "a", text: "0<y<1" },
        { id: "b", text: "0<y<x" },
        { id: "c", text: "x<y<1" },
        { id: "d", text: "-infinity<y<infinity" }
      ],
      answer: "b"
    },
    {
      id: "joint-review-8",
      kind: "mixed: three concepts",
      tags: ["transformation", "independence", "cdf"],
      prompt: "If M=max(X,Y), what event is equivalent to M<=m?",
      options: [
        { id: "a", text: "X<=m or Y<=m" },
        { id: "b", text: "X<=m and Y<=m" },
        { id: "c", text: "X+Y<=m" },
        { id: "d", text: "X=Y=m" }
      ],
      answer: "b"
    },
    {
      id: "joint-review-9",
      kind: "mixed: two concepts",
      tags: ["joint-versus-marginal", "independence"],
      prompt: "Why do marginals alone usually not determine the joint distribution?",
      options: [
        { id: "a", text: "They do not record how the variables are paired together" },
        { id: "b", text: "They always imply independence" },
        { id: "c", text: "They are never valid probabilities" },
        { id: "d", text: "They only work for continuous variables" }
      ],
      answer: "a"
    },
    {
      id: "joint-review-10",
      kind: "mixed: two concepts",
      tags: ["conditional-distribution", "support-region"],
      prompt: "Given a condition such as S=10 for two dice, what happens to the possible values of another variable?",
      options: [
        { id: "a", text: "They may be restricted to values compatible with the condition" },
        { id: "b", text: "They must stay uniformly distributed over all original values" },
        { id: "c", text: "They become impossible" },
        { id: "d", text: "They no longer have probabilities" }
      ],
      answer: "a"
    }
  ];
}

function continuousDistributionPracticeProblems() {
  return [
    {
      label: "Concept Problem 1: Count or wait",
      concept: "Distribution recognition",
      technique: "Match story to variable type",
      difficulty: "intro",
      prompt: "Calls arrive at rate 3 per hour. Which distribution models the number of calls in one hour? Which models the waiting time until the next call?",
      solution: "The number of calls in one hour is Poisson(3). The waiting time until the next call is Exponential(3), measured in hours."
    },
    {
      label: "Concept Problem 2: Exponential survival",
      concept: "Exponential",
      technique: "Derive from no-event story",
      difficulty: "intro",
      prompt: "Events arrive at rate 4 per unit time. Explain why P(T>0.5) is a no-event probability, then compute it.",
      solution: "T>0.5 means no event occurs in the first 0.5 units. The no-event probability for rate lambda over time t is exp(-lambda t), so P(T>0.5)=exp(-4 x 0.5)=exp(-2)."
    },
    {
      label: "Concept Problem 3: Poisson count",
      concept: "Poisson",
      technique: "Reason from rare-event count",
      difficulty: "intro",
      prompt: "A one-hour interval has expected count 3. Why is Poisson a reasonable model, and what is P(N=2)?",
      solution: "Poisson is reasonable when the count comes from many tiny independent event opportunities with total expected count 3. Then P(N=2)=exp(-3)3^2/2!."
    },
    {
      label: "Problem 4: Rate scaling",
      concept: "Poisson",
      technique: "Scale lambda by interval length",
      difficulty: "warmup",
      prompt: "Defects occur at average rate 2 per metre. What is the distribution of the number of defects in 3 metres?",
      solution: "The expected count in 3 metres is 2 x 3 = 6. The count is Poisson(6)."
    },
    {
      label: "Problem 5: Memorylessness after waiting",
      concept: "Memorylessness",
      technique: "Use conditional survival",
      difficulty: "warmup",
      prompt: "Calls arrive at rate 3 per hour. You have already waited 20 minutes with no call. What is the probability you wait at least 10 more minutes, and why does the first 20 minutes disappear from the final answer?",
      solution: "The question is P(T>30 minutes | T>20 minutes). With hours as units, this is exp(-3 x 1/2)/exp(-3 x 1/3)=exp(-3 x 1/6)=exp(-1/2). The first 20 minutes disappear because exponential survival ratios cancel elapsed time."
    },
    {
      label: "Problem 6: Gamma waiting time",
      concept: "Gamma",
      technique: "Build from exponential gaps",
      difficulty: "standard",
      prompt: "Calls arrive at rate 5 per hour. Let T_4 be the waiting time until the fourth call. Explain why T_4 is a sum of four waiting gaps, then find E[T_4].",
      solution: "The time to the fourth call is the sum of the waits between call 0 and 1, 1 and 2, 2 and 3, and 3 and 4. Each gap has mean 1/5 hour, so E[T_4]=4(1/5)=4/5 hour."
    },
    {
      label: "Problem 7: Gamma-count connection",
      concept: "Gamma",
      technique: "Translate kth wait to count",
      difficulty: "standard",
      prompt: "For a Poisson process, express P(T_3<=t) using N(t).",
      solution: "T_3<=t means the third event has happened by time t, so at least 3 events occurred by t. Thus P(T_3<=t)=P(N(t)>=3)."
    },
    {
      label: "Problem 8: Standard normal conversion",
      concept: "Standard normal",
      technique: "Measure distance in standard-deviation units",
      difficulty: "standard",
      prompt: "If X is Normal(70,10^2), explain what the z-score of X=85 means and compute it.",
      solution: "A z-score is raw distance from the mean measured in standard deviations. Here 85 is 15 above the mean and the standard deviation is 10, so z=(85-70)/10=1.5."
    },
    {
      label: "Problem 9: Normal probability setup",
      concept: "Normal",
      technique: "Standardise and use Phi",
      difficulty: "standard",
      prompt: "If X is Normal(100,15^2), write P(X<=130) using the standard normal CDF Phi.",
      solution: "Z=(130-100)/15=2. Therefore P(X<=130)=P(Z<=2)=Phi(2)."
    },
    {
      label: "Problem 10: Maximum order statistic",
      concept: "Order statistics",
      technique: "Use CDF method",
      difficulty: "standard",
      prompt: "Let U_1,...,U_5 be independent Uniform(0,1). If M is the maximum, find P(M<=m) for 0<=m<=1.",
      solution: "M<=m means all five uniforms are <=m. By independence, P(M<=m)=m^5."
    },
    {
      label: "Problem 11: Minimum order statistic",
      concept: "Order statistics",
      technique: "Use survival method",
      difficulty: "standard",
      prompt: "Let U_1,...,U_5 be independent Uniform(0,1). If L is the minimum, find P(L>m) for 0<=m<=1.",
      solution: "L>m means all five uniforms are >m. This has probability (1-m)^5."
    },
    {
      label: "Problem 12: Beta from order statistics",
      concept: "Beta",
      technique: "Derive from counting points to the left",
      difficulty: "standard",
      prompt: "If U_(3) is the third smallest of 7 independent Uniform(0,1) samples, explain why the event U_(3)<=u is a counting event. What beta distribution does U_(3) have?",
      solution: "U_(3)<=u means at least 3 of the 7 sample points landed in [0,u]. That count is Binomial(7,u). This count-derived CDF leads to U_(3) ~ Beta(3,5)."
    },
    {
      label: "Problem 13: Fixed interval count",
      concept: "Uniform spacings",
      technique: "Use binomial interval count",
      difficulty: "challenging",
      prompt: "Ten independent uniform points are placed on [0,1]. What is the probability exactly 3 fall in [0.2,0.5]?",
      solution: "The interval length is 0.3. The count in that interval is Binomial(10,0.3). Probability = C(10,3)(0.3)^3(0.7)^7."
    },
    {
      label: "Problem 14: Multinomial interval counts",
      concept: "Multinomial counts",
      technique: "Use interval lengths as probabilities",
      difficulty: "challenging",
      prompt: "Six uniform points are placed on [0,1]. Intervals have lengths 0.2, 0.5, and 0.3. What is the probability the counts are 1, 3, and 2?",
      solution: "Use multinomial counts: probability = 6!/(1!3!2!) (0.2)^1(0.5)^3(0.3)^2."
    },
    {
      label: "Problem 15: Exponential family recognition",
      concept: "Exponential family",
      technique: "Identify shared model family",
      difficulty: "stretch",
      prompt: "We derived Poisson from counts, exponential/gamma from waits, normal from standardized measurement error, and beta from sorted uniforms. Why is it still useful to notice that many of them share an exponential-family algebraic form?",
      solution: "The derivations explain why the models describe the world. The shared algebra explains why they are useful for inference: likelihoods simplify, summary statistics often matter, and the same models reappear in estimation and testing."
    }
  ];
}

function continuousDistributionReviewQuestions() {
  return [
    {
      id: "cd-review-1",
      kind: "single concept",
      tags: ["exponential"],
      prompt: "Which story naturally suggests an exponential distribution?",
      options: [
        { id: "a", text: "Waiting time until the next event" },
        { id: "b", text: "Number of events in one hour" },
        { id: "c", text: "The third smallest sample value" },
        { id: "d", text: "A sample correlation" }
      ],
      answer: "a"
    },
    {
      id: "cd-review-2",
      kind: "single concept",
      tags: ["poisson"],
      prompt: "Which story naturally suggests a Poisson distribution?",
      options: [
        { id: "a", text: "A count of events in a fixed interval" },
        { id: "b", text: "A z-score" },
        { id: "c", text: "A sorted sample value" },
        { id: "d", text: "A conditional variance" }
      ],
      answer: "a"
    },
    {
      id: "cd-review-3",
      kind: "single concept",
      tags: ["gamma"],
      prompt: "Gamma is especially natural for:",
      options: [
        { id: "a", text: "Waiting time until the kth event" },
        { id: "b", text: "A single Bernoulli trial" },
        { id: "c", text: "A finite sample without replacement" },
        { id: "d", text: "A row total in a joint table" }
      ],
      answer: "a"
    },
    {
      id: "cd-review-4",
      kind: "single concept",
      tags: ["standard-normal"],
      prompt: "How do you standardise X ~ Normal(mu, sigma^2)?",
      options: [
        { id: "a", text: "Z=(X-mu)/sigma" },
        { id: "b", text: "Z=X+mu" },
        { id: "c", text: "Z=sigma/X" },
        { id: "d", text: "Z=X^2" }
      ],
      answer: "a"
    },
    {
      id: "cd-review-5",
      kind: "single concept",
      tags: ["order-statistics"],
      prompt: "What is X_(1)?",
      options: [
        { id: "a", text: "The smallest sample value" },
        { id: "b", text: "The largest sample value" },
        { id: "c", text: "The sample mean" },
        { id: "d", text: "The sample variance" }
      ],
      answer: "a"
    },
    {
      id: "cd-review-6",
      kind: "mixed: two concepts",
      tags: ["poisson-process", "exponential"],
      prompt: "In a Poisson process, what is equivalent to T_1>t?",
      options: [
        { id: "a", text: "N(t)=0" },
        { id: "b", text: "N(t)=1 always" },
        { id: "c", text: "T_1<=t" },
        { id: "d", text: "The rate is zero" }
      ],
      answer: "a"
    },
    {
      id: "cd-review-7",
      kind: "mixed: two concepts",
      tags: ["order-statistics", "cdf"],
      prompt: "If M=max(X_1,...,X_n), what event equals M<=m?",
      options: [
        { id: "a", text: "All X_i are <= m" },
        { id: "b", text: "At least one X_i is > m" },
        { id: "c", text: "Exactly one X_i equals m" },
        { id: "d", text: "The mean is m" }
      ],
      answer: "a"
    },
    {
      id: "cd-review-8",
      kind: "mixed: two concepts",
      tags: ["beta", "order-statistics"],
      prompt: "If U_(k) is the kth smallest of n iid Uniform(0,1) samples, what is its distribution?",
      options: [
        { id: "a", text: "Beta(k, n+1-k)" },
        { id: "b", text: "Poisson(k)" },
        { id: "c", text: "Exponential(k)" },
        { id: "d", text: "Normal(0,1)" }
      ],
      answer: "a"
    },
    {
      id: "cd-review-9",
      kind: "mixed: three concepts",
      tags: ["uniform-spacings", "multinomial"],
      prompt: "Counts of iid uniform points falling into fixed intervals follow which distribution?",
      options: [
        { id: "a", text: "Multinomial with interval lengths as probabilities" },
        { id: "b", text: "Always standard normal" },
        { id: "c", text: "Always geometric" },
        { id: "d", text: "Always beta" }
      ],
      answer: "a"
    },
    {
      id: "cd-review-10",
      kind: "mixed: two concepts",
      tags: ["exponential-family"],
      prompt: "Why mention the exponential family here?",
      options: [
        { id: "a", text: "It explains why many common models reappear in inference" },
        { id: "b", text: "It means every distribution is exponential" },
        { id: "c", text: "It replaces all probability calculations" },
        { id: "d", text: "It only applies to dice" }
      ],
      answer: "a"
    },
    {
      id: "cd-review-11",
      kind: "mixed: two concepts",
      tags: ["memorylessness", "exponential"],
      prompt: "If T is exponential, what does P(T>s+t | T>s) equal?",
      options: [
        { id: "a", text: "P(T>t)" },
        { id: "b", text: "P(T>s)" },
        { id: "c", text: "P(T>s)P(T>t)" },
        { id: "d", text: "0" }
      ],
      answer: "a"
    }
  ];
}

function limitTheoremPracticeProblems() {
  return [
    {
      label: "Concept Problem 1: Standard error",
      concept: "Standard error",
      technique: "Derive variability of an average",
      difficulty: "intro",
      prompt: "Independent observations have mean 40 and standard deviation 10. For n=25 observations, what are E[Xbar] and SD(Xbar)? Explain why the average is less noisy than one observation.",
      solution: "E[Xbar]=40. SD(Xbar)=10/sqrt(25)=2. The average is less noisy because independent positive and negative fluctuations partly cancel, and Var(Xbar)=sigma^2/n."
    },
    {
      label: "Concept Problem 2: LLN from variance",
      concept: "Law of large numbers",
      technique: "Use Chebyshev on the sample mean",
      difficulty: "intro",
      prompt: "Let X_1,...,X_n be iid with mean mu and variance 9. Use Chebyshev to bound P(|Xbar-mu|>=1). What happens as n grows?",
      solution: "Var(Xbar)=9/n. Chebyshev gives P(|Xbar-mu|>=1)<=9/n. This bound goes to 0, so large-sample averages are unlikely to stay at least 1 unit away from mu."
    },
    {
      label: "Concept Problem 3: CLT standardization",
      concept: "Central limit theorem",
      technique: "Standardize a sample mean",
      difficulty: "intro",
      prompt: "A population has mean 100 and standard deviation 15. For n=36 independent observations, write the CLT z-score for Xbar=105.",
      solution: "The standard error is 15/sqrt(36)=2.5. The z-score is (105-100)/2.5=2. CLT says this standardized average is approximately standard normal."
    },
    {
      label: "Problem 4: CLT probability for an average",
      concept: "CLT for averages",
      technique: "Use Phi after standardization",
      difficulty: "standard",
      prompt: "Service times have mean 10 minutes and standard deviation 4 minutes. For 64 independent services, approximate P(Xbar>11).",
      solution: "SE=4/sqrt(64)=0.5. z=(11-10)/0.5=2. Therefore P(Xbar>11) is approximately P(Z>2)=1-Phi(2)."
    },
    {
      label: "Problem 5: Normal approximation conditions",
      concept: "Normal approximation",
      technique: "Check expected successes and failures",
      difficulty: "warmup",
      prompt: "For X~Binomial(80,0.25), check whether the normal approximation is reasonable using np and n(1-p).",
      solution: "np=80(0.25)=20 and n(1-p)=80(0.75)=60. Both are at least 10, so the normal approximation is reasonable."
    },
    {
      label: "Problem 6: Normal approximation with continuity correction",
      concept: "Continuity correction",
      technique: "Move the cutoff by 0.5",
      difficulty: "standard",
      prompt: "Let X~Binomial(100,0.5). Approximate P(X>=55) using a normal approximation with continuity correction.",
      solution: "Use Y~Normal(50,25). Since X>=55 becomes Y>=54.5, z=(54.5-50)/5=0.9. The probability is approximately P(Z>=0.9)=1-Phi(0.9)."
    },
    {
      label: "Problem 7: Below-or-equal continuity correction",
      concept: "Continuity correction",
      technique: "Translate a discrete tail",
      difficulty: "standard",
      prompt: "Let X~Binomial(200,0.4). Set up a normal approximation for P(X<=70) with continuity correction.",
      solution: "Mean np=80 and variance np(1-p)=48. Use Y~Normal(80,48). The event X<=70 becomes Y<=70.5, so use Phi((70.5-80)/sqrt(48))."
    },
    {
      label: "Problem 8: Poisson approximation",
      concept: "Poisson approximation",
      technique: "Use lambda=np",
      difficulty: "standard",
      prompt: "A defect occurs with probability 0.01 independently for each item. In 200 items, approximate P(exactly 3 defects).",
      solution: "Here n=200, p=0.01, lambda=np=2. Since this is many trials with rare success, X is approximately Poisson(2). P(X=3) about exp(-2)2^3/3!."
    },
    {
      label: "Problem 9: Choose Poisson instead of normal",
      concept: "Approximation diagnostics",
      technique: "Read the rare-event structure",
      difficulty: "standard",
      prompt: "For X~Binomial(1000,0.002), should you use normal approximation or Poisson approximation for P(X=0)? Explain.",
      solution: "Use Poisson approximation. np=2 is too small for normal approximation, while n is large and p is small. So X is approximately Poisson(2), and P(X=0) about exp(-2)."
    },
    {
      label: "Problem 10: Exact versus approximation",
      concept: "Method choice",
      technique: "Classify the answer type",
      difficulty: "standard",
      prompt: "For X~Binomial(10,0.5), should P(X=7) be computed exactly or approximated by normal? Why?",
      solution: "Compute exactly. The sample size is small and the exact binomial formula is easy: P(X=7)=C(10,7)(0.5)^10. Approximation is unnecessary."
    },
    {
      label: "Problem 11: Bound versus approximation",
      concept: "Tail bounds",
      technique: "Distinguish guarantee from estimate",
      difficulty: "challenging",
      prompt: "A random variable has mean 50 and variance 16, but no distribution is given. Can you compute P(|X-50|>=8) exactly? What can Chebyshev say?",
      solution: "Without the distribution, the exact probability cannot be computed. Chebyshev gives P(|X-50|>=8)<=16/8^2=1/4. This is a guaranteed bound, not an estimate."
    },
    {
      label: "Problem 12: Sample proportion standard error",
      concept: "Standard error",
      technique: "Use Bernoulli variance",
      difficulty: "standard",
      prompt: "A sample proportion is the average of n Bernoulli(p) variables. Derive its standard error.",
      solution: "For Bernoulli(p), variance is p(1-p). The sample proportion phat is the average, so Var(phat)=p(1-p)/n and SE(phat)=sqrt(p(1-p)/n)."
    },
    {
      label: "Problem 13: LLN interpretation",
      concept: "Law of large numbers",
      technique: "Separate average from count",
      difficulty: "warmup",
      prompt: "In repeated fair coin flips, does LLN say the number of heads gets close to 1/2? State the correct version.",
      solution: "No. The number of heads grows with n. LLN says the proportion of heads, H_n/n, gets close to 1/2 with high probability."
    },
    {
      label: "Problem 14: CLT interpretation",
      concept: "Central limit theorem",
      technique: "Identify the standardized quantity",
      difficulty: "standard",
      prompt: "Does CLT say Xbar itself becomes N(0,1)? If not, what becomes approximately N(0,1)?",
      solution: "No. The standardized average becomes approximately standard normal: (Xbar-mu)/(sigma/sqrt(n)) approximately N(0,1). Xbar is centered near mu and has standard error sigma/sqrt(n)."
    },
    {
      label: "Problem 15: Approximation trap",
      concept: "Approximation diagnostics",
      technique: "Check assumptions before calculating",
      difficulty: "stretch",
      prompt: "A sum of 50 measurements is strongly dependent because each measurement reuses the same faulty sensor shift. Why should you be cautious about a direct CLT approximation?",
      solution: "The basic CLT used here relies on independent observations, or at least weak dependence under extra theory. A shared sensor shift creates dependence, so the usual sigma/sqrt(n) cancellation can be misleading."
    }
  ];
}

function limitTheoremReviewQuestions() {
  return [
    {
      id: "lt-review-1",
      kind: "single concept",
      tags: ["standard-error"],
      prompt: "If iid observations have standard deviation sigma, what is the standard error of Xbar?",
      options: [
        { id: "a", text: "sigma/sqrt(n)" },
        { id: "b", text: "sigma n" },
        { id: "c", text: "sigma^2/n" },
        { id: "d", text: "sqrt(n)/sigma" }
      ],
      answer: "a"
    },
    {
      id: "lt-review-2",
      kind: "single concept",
      tags: ["law-of-large-numbers"],
      prompt: "What does the law of large numbers describe?",
      options: [
        { id: "a", text: "Sample averages getting close to the population mean" },
        { id: "b", text: "Every sample value becoming equal" },
        { id: "c", text: "The raw sum staying bounded" },
        { id: "d", text: "Every distribution becoming Poisson" }
      ],
      answer: "a"
    },
    {
      id: "lt-review-3",
      kind: "single concept",
      tags: ["central-limit-theorem"],
      prompt: "What does the basic CLT make approximately normal?",
      options: [
        { id: "a", text: "Standardized sums or averages" },
        { id: "b", text: "Only individual observations" },
        { id: "c", text: "Only maximum values" },
        { id: "d", text: "Only conditional probabilities" }
      ],
      answer: "a"
    },
    {
      id: "lt-review-4",
      kind: "mixed: two concepts",
      tags: ["normal-approximation", "binomial"],
      prompt: "For X~Binomial(n,p), when is normal approximation usually reasonable?",
      options: [
        { id: "a", text: "When np and n(1-p) are both reasonably large" },
        { id: "b", text: "Whenever p is tiny" },
        { id: "c", text: "Only when n=1" },
        { id: "d", text: "Only when p=0" }
      ],
      answer: "a"
    },
    {
      id: "lt-review-5",
      kind: "mixed: two concepts",
      tags: ["continuity-correction", "normal-approximation"],
      prompt: "When approximating P(X>=55) for a binomial count by a normal, which cutoff is used with continuity correction?",
      options: [
        { id: "a", text: "54.5" },
        { id: "b", text: "55.5" },
        { id: "c", text: "55 exactly" },
        { id: "d", text: "0.55" }
      ],
      answer: "a"
    },
    {
      id: "lt-review-6",
      kind: "mixed: two concepts",
      tags: ["poisson-approximation", "binomial"],
      prompt: "For a binomial with large n and small p, which parameter is used for the Poisson approximation?",
      options: [
        { id: "a", text: "lambda=np" },
        { id: "b", text: "lambda=n+p" },
        { id: "c", text: "lambda=p/n" },
        { id: "d", text: "lambda=1-p" }
      ],
      answer: "a"
    },
    {
      id: "lt-review-7",
      kind: "mixed: two concepts",
      tags: ["tail-bound", "approximation"],
      prompt: "How is a Chebyshev answer different from a normal approximation?",
      options: [
        { id: "a", text: "Chebyshev gives a guaranteed bound; normal approximation gives an estimate" },
        { id: "b", text: "Chebyshev is always exact" },
        { id: "c", text: "Normal approximation never uses mean or variance" },
        { id: "d", text: "They are the same calculation" }
      ],
      answer: "a"
    },
    {
      id: "lt-review-8",
      kind: "mixed: two concepts",
      tags: ["approximation-diagnostics", "poisson-approximation"],
      prompt: "For X~Binomial(1000,0.002), which approximation is more natural?",
      options: [
        { id: "a", text: "Poisson approximation with lambda=2" },
        { id: "b", text: "Normal approximation because n is large" },
        { id: "c", text: "Uniform approximation" },
        { id: "d", text: "No probability model applies" }
      ],
      answer: "a"
    },
    {
      id: "lt-review-9",
      kind: "single concept",
      tags: ["sample-proportion"],
      prompt: "A sample proportion is best viewed as:",
      options: [
        { id: "a", text: "An average of Bernoulli variables" },
        { id: "b", text: "A maximum order statistic" },
        { id: "c", text: "A fixed constant with no variability" },
        { id: "d", text: "A covariance" }
      ],
      answer: "a"
    },
    {
      id: "lt-review-10",
      kind: "mixed: three concepts",
      tags: ["method-choice", "exact-probability", "approximation"],
      prompt: "For X~Binomial(10,0.5), what is the best way to compute P(X=7)?",
      options: [
        { id: "a", text: "Use the exact binomial formula" },
        { id: "b", text: "Use Poisson approximation" },
        { id: "c", text: "Use CLT because every binomial is large" },
        { id: "d", text: "Use Markov inequality for the exact value" }
      ],
      answer: "a"
    }
  ];
}

function inferencePracticeProblems() {
  return [
    {
      label: "Concept Problem 1: State the hypotheses",
      concept: "Hypothesis setup",
      technique: "Translate product claim to H0 and H1",
      difficulty: "intro",
      prompt: "The old mean delivery time is 32 minutes. The new matcher claims to reduce mean time. State H0 and H1 for the population mean mu under the new matcher.",
      solution: "Use H0: mu=32 as the no-improvement baseline and H1: mu<32 as the one-sided improvement claim."
    },
    {
      label: "Concept Problem 2: Choose the statistic",
      concept: "Test statistic",
      technique: "Standardize the estimator under H0",
      difficulty: "intro",
      prompt: "For n deliveries, Xbar estimates mu and sigma is known. Why is Z=(Xbar-mu0)/(sigma/sqrt(n)) the natural statistic for testing H0: mu=mu0?",
      solution: "Under H0, Xbar is centered at mu0 and has standard error sigma/sqrt(n). Subtracting mu0 and dividing by the standard error creates a quantity with standard normal reference distribution."
    },
    {
      label: "Problem 3: z-test for delivery time",
      concept: "z-test",
      technique: "Compute statistic and compare to rejection region",
      difficulty: "standard",
      prompt: "Old mean delivery time is 32. For n=100 new deliveries, Xbar=30.8 and known sigma=8. Test H0: mu=32 vs H1: mu<32 at alpha=0.05.",
      solution: "Z=(30.8-32)/(8/sqrt(100))=-1.5. The 5% left-tail cutoff is -1.645. Since -1.5>-1.645, do not reject H0 at 5%."
    },
    {
      label: "Problem 4: Wald CI for mean time",
      concept: "Wald interval",
      technique: "Estimator plus/minus critical value times SE",
      difficulty: "standard",
      prompt: "For the same sample, build a 95% large-sample CI for mean delivery time using Xbar=30.8, s=8, n=100.",
      solution: "SE=8/sqrt(100)=0.8. The interval is 30.8 +/- 1.96(0.8) = 30.8 +/- 1.568, or (29.232,32.368)."
    },
    {
      label: "Problem 5: Acceptance-rate Wald interval",
      concept: "Wald interval",
      technique: "Proportion standard error",
      difficulty: "standard",
      prompt: "In 600 offered deliveries, 420 are accepted. Build the Wald 95% CI for acceptance probability p.",
      solution: "phat=420/600=0.70. SE=sqrt(0.70(0.30)/600). The 95% Wald interval is 0.70 +/- 1.96 sqrt(0.21/600)."
    },
    {
      label: "Problem 6: Score test statistic for a rate",
      concept: "Score method",
      technique: "Use null standard error",
      difficulty: "standard",
      prompt: "The old acceptance rate is p0=0.65. In the new matcher, phat=0.70 from n=600 offers. Write the score z-statistic for testing H0: p=0.65.",
      solution: "The score statistic uses the null standard error: Z=(0.70-0.65)/sqrt(0.65(0.35)/600)."
    },
    {
      label: "Problem 7: One-sided proportion test",
      concept: "z-test",
      technique: "Right-tail score/proportion test",
      difficulty: "standard",
      prompt: "Using the statistic from Problem 6, what is the rejection direction for H1: p>0.65 at alpha=0.05?",
      solution: "Reject for large positive Z because the alternative says the new acceptance probability is higher than 0.65. The 5% right-tail cutoff is about 1.645."
    },
    {
      label: "Problem 8: t-test for paired routes",
      concept: "Paired t-test",
      technique: "Convert pairs to differences",
      difficulty: "standard",
      prompt: "For 20 restaurants, define D=old delivery time minus new delivery time. If Dbar=1.4 and s_D=3.5, test H0: mu_D=0 vs H1: mu_D>0. Write the statistic and degrees of freedom.",
      solution: "Use T=(Dbar-0)/(s_D/sqrt(20))=1.4/(3.5/sqrt(20)). Degrees of freedom are 19. Reject for large positive T."
    },
    {
      label: "Problem 9: Why paired instead of two-sample",
      concept: "Test choice",
      technique: "Identify matched design",
      difficulty: "intermediate",
      prompt: "The old and new algorithms are compared on the same restaurants at similar times. Why should we use paired differences instead of treating the two samples as unrelated?",
      solution: "The same restaurants share baseline difficulty. Pairing subtracts that restaurant-specific effect and focuses on old-new difference, usually reducing noise and increasing power."
    },
    {
      label: "Problem 10: p-value interpretation",
      concept: "p-value",
      technique: "Interpret under H0",
      difficulty: "standard",
      prompt: "A one-sided z-test for mean delivery time gives p-value 0.03. Interpret this in the delivery-app setting.",
      solution: "If the new matcher truly had mean 32 minutes, the probability of seeing a result at least this favorable to a lower mean is 0.03. At alpha=0.05, reject H0."
    },
    {
      label: "Problem 11: Power interpretation",
      concept: "Power",
      technique: "Connect to alternative distribution",
      difficulty: "intermediate",
      prompt: "What does 80% power mean for detecting a true reduction from 32 minutes to 30.5 minutes?",
      solution: "If the true mean under the new matcher is 30.5 and the test is repeated many times under the same design, the test rejects H0 about 80% of the time."
    },
    {
      label: "Problem 12: Power levers",
      concept: "Power",
      technique: "Reason without calculation",
      difficulty: "intermediate",
      prompt: "Name three changes that increase power for detecting a delivery-time improvement.",
      solution: "Increase sample size, reduce delivery-time variability, or test for a larger true effect. Increasing alpha also increases power but raises Type I error risk."
    },
    {
      label: "Problem 13: Chi-squared goodness-of-fit",
      concept: "Chi-squared goodness-of-fit",
      technique: "Observed versus expected counts",
      difficulty: "standard",
      prompt: "Promised restaurant mix is 50% quick-service, 30% casual, 20% grocery. In 200 matches, observed counts are 120, 50, 30. Compute expected counts and the chi-squared statistic setup.",
      solution: "Expected counts are 100, 60, 40. X^2=(120-100)^2/100+(50-60)^2/60+(30-40)^2/40 with df=3-1=2."
    },
    {
      label: "Problem 14: Chi-squared independence expected count",
      concept: "Chi-squared independence",
      technique: "Use row and column totals",
      difficulty: "standard",
      prompt: "A 2x2 table has North: 90 on-time, 30 late; South: 70 on-time, 10 late. What is the expected count for North-late under independence?",
      solution: "North row total is 120, late column total is 40, grand total is 200. Expected North-late count is 120*40/200=24."
    },
    {
      label: "Problem 15: Independence test degrees of freedom",
      concept: "Chi-squared independence",
      technique: "Compute df from table shape",
      difficulty: "warmup",
      prompt: "For a table with 3 regions and 2 lateness outcomes, what are the degrees of freedom for a chi-squared independence test?",
      solution: "df=(rows-1)(columns-1)=(3-1)(2-1)=2."
    },
    {
      label: "Problem 16: Pick the correct test",
      concept: "Test choice",
      technique: "Match data shape to statistic",
      difficulty: "challenging",
      prompt: "You want to know whether restaurant category and driver cancellation status are associated. The data are counts in a category-by-cancelled table. Which test structure fits and why?",
      solution: "Use a chi-squared test of independence because both variables are categorical and the data are contingency-table counts. Expected counts come from row and column totals under independence."
    },
    {
      label: "Problem 17: Mixed inference decision",
      concept: "Method choice",
      technique: "Separate CI and test evidence",
      difficulty: "challenging",
      prompt: "A 95% CI for mean delivery time under the new matcher is (29.2,32.4). Can we reject H0: mu=32 against a two-sided alternative at alpha=0.05? What about H0: mu=33?",
      solution: "For a two-sided 5% test, null values inside the 95% CI are not rejected and values outside are rejected. Since 32 is inside, do not reject H0: mu=32. Since 33 is outside, reject H0: mu=33."
    },
    {
      label: "Problem 18: One-sided trap",
      concept: "Alternative hypothesis",
      technique: "Choose direction before seeing data",
      difficulty: "challenging",
      prompt: "After seeing data, the team notices the new matcher changed average delivery time, but they had not specified direction. Should they switch to a one-sided test because the observed mean is lower?",
      solution: "No. The alternative direction should be chosen before seeing the data. If the pre-specified question was any change, use a two-sided test."
    }
  ];
}

function inferenceReviewQuestions() {
  return [
    {
      id: "inf-review-1",
      kind: "single concept",
      tags: ["null-hypothesis"],
      prompt: "In the delivery-time improvement test, what is the usual role of H0?",
      options: [
        { id: "a", text: "The no-improvement baseline model" },
        { id: "b", text: "The result the team wants to prove true" },
        { id: "c", text: "The sample mean" },
        { id: "d", text: "The observed p-value" }
      ],
      answer: "a"
    },
    {
      id: "inf-review-2",
      kind: "single concept",
      tags: ["test-statistic"],
      prompt: "Why do many test statistics subtract the null value and divide by a standard error?",
      options: [
        { id: "a", text: "To measure how many standard errors the estimate is from H0" },
        { id: "b", text: "To make every p-value equal alpha" },
        { id: "c", text: "To remove the need for assumptions" },
        { id: "d", text: "To turn counts into probabilities without a model" }
      ],
      answer: "a"
    },
    {
      id: "inf-review-3",
      kind: "mixed: two concepts",
      tags: ["z-test", "rejection-region"],
      prompt: "For H1: mu<32 in a z-test at alpha=0.05, where is the rejection region?",
      options: [
        { id: "a", text: "In the far left tail" },
        { id: "b", text: "In the far right tail" },
        { id: "c", text: "Only at Z=0" },
        { id: "d", text: "Everywhere outside the sample" }
      ],
      answer: "a"
    },
    {
      id: "inf-review-4",
      kind: "mixed: two concepts",
      tags: ["t-test", "unknown-sigma"],
      prompt: "Why does a one-sample t-test use a t reference distribution instead of standard normal?",
      options: [
        { id: "a", text: "Because sigma is replaced by the sample standard deviation" },
        { id: "b", text: "Because the null hypothesis is always false" },
        { id: "c", text: "Because the sample mean is categorical" },
        { id: "d", text: "Because t-tests never use standard errors" }
      ],
      answer: "a"
    },
    {
      id: "inf-review-5",
      kind: "mixed: two concepts",
      tags: ["paired-t-test", "test-choice"],
      prompt: "Old and new matchers are tested on the same restaurants. What is the right first move?",
      options: [
        { id: "a", text: "Form old-new differences and test their mean" },
        { id: "b", text: "Ignore the pairing" },
        { id: "c", text: "Use a chi-squared goodness-of-fit test" },
        { id: "d", text: "Use only the largest delivery time" }
      ],
      answer: "a"
    },
    {
      id: "inf-review-6",
      kind: "mixed: two concepts",
      tags: ["score-method", "proportion-test"],
      prompt: "In a score test for H0: p=p0, which standard error is used?",
      options: [
        { id: "a", text: "sqrt(p0(1-p0)/n)" },
        { id: "b", text: "sqrt(phat(1-phat)/n) only" },
        { id: "c", text: "sigma/sqrt(n)" },
        { id: "d", text: "n p0" }
      ],
      answer: "a"
    },
    {
      id: "inf-review-7",
      kind: "single concept",
      tags: ["p-value"],
      prompt: "What is a p-value?",
      options: [
        { id: "a", text: "Under H0, probability of a result at least as extreme as observed" },
        { id: "b", text: "Probability that H0 is true" },
        { id: "c", text: "Probability that H1 is true" },
        { id: "d", text: "The chosen significance level" }
      ],
      answer: "a"
    },
    {
      id: "inf-review-8",
      kind: "mixed: two concepts",
      tags: ["power", "sample-size"],
      prompt: "Holding effect size and noise fixed, what usually happens to power when sample size increases?",
      options: [
        { id: "a", text: "Power increases" },
        { id: "b", text: "Power must decrease" },
        { id: "c", text: "Power becomes the p-value" },
        { id: "d", text: "Power becomes alpha exactly" }
      ],
      answer: "a"
    },
    {
      id: "inf-review-9",
      kind: "single concept",
      tags: ["chi-squared-distribution"],
      prompt: "A chi-squared variable can be built by:",
      options: [
        { id: "a", text: "Adding squares of independent standard normals" },
        { id: "b", text: "Adding raw categorical labels" },
        { id: "c", text: "Taking the median of Bernoulli trials" },
        { id: "d", text: "Subtracting two p-values" }
      ],
      answer: "a"
    },
    {
      id: "inf-review-10",
      kind: "mixed: two concepts",
      tags: ["chi-squared-goodness-of-fit", "expected-counts"],
      prompt: "In a chi-squared goodness-of-fit test, expected counts come from:",
      options: [
        { id: "a", text: "The null category probabilities times total sample size" },
        { id: "b", text: "The observed counts copied exactly" },
        { id: "c", text: "The sample mean divided by alpha" },
        { id: "d", text: "The p-value" }
      ],
      answer: "a"
    },
    {
      id: "inf-review-11",
      kind: "mixed: three concepts",
      tags: ["chi-squared-independence", "expected-counts", "test-choice"],
      prompt: "For a region-by-late contingency table, what expected count is used under independence?",
      options: [
        { id: "a", text: "row total times column total divided by grand total" },
        { id: "b", text: "row total plus column total" },
        { id: "c", text: "observed count minus alpha" },
        { id: "d", text: "sample standard deviation" }
      ],
      answer: "a"
    },
    {
      id: "inf-review-12",
      kind: "mixed: three concepts",
      tags: ["wald-interval", "hypothesis-test", "confidence-interval"],
      prompt: "A two-sided 95% CI for mu is (29.2,32.4). What happens to H0: mu=33 at alpha=0.05?",
      options: [
        { id: "a", text: "Reject it because 33 is outside the interval" },
        { id: "b", text: "Do not reject it because 33 is larger" },
        { id: "c", text: "Reject only if alpha is 0" },
        { id: "d", text: "No test is related to the interval" }
      ],
      answer: "a"
    }
  ];
}

function conditionalExpectationPracticeProblems() {
  return [
    {
      label: "Concept Problem 1: Updated average",
      concept: "Conditional expectation",
      technique: "Average inside the known group",
      difficulty: "intro",
      prompt: "A test is easy with probability 0.6 and hard with probability 0.4. E[Score|easy]=80 and E[Score|hard]=55. What is E[Score]?",
      solution: "Use total expectation: E[Score]=0.6(80)+0.4(55)=70. We average the group averages using group probabilities."
    },
    {
      label: "Concept Problem 2: Identify the condition",
      concept: "Recognition",
      technique: "Find the information being used",
      difficulty: "intro",
      prompt: "A machine is chosen first, then a part is produced. The expected defect count depends on which machine was chosen. What should you condition on?",
      solution: "Condition on the machine. The phrase 'depends on which machine was chosen' tells us the machine is the useful information."
    },
    {
      label: "Concept Problem 3: E[X|Y=y] is a number",
      concept: "E[X|Y=y]",
      technique: "Average over conditional support",
      difficulty: "intro",
      prompt: "Two dice are rolled. Let X be the first die and S be the sum. Find E[X|S=10].",
      solution: "Given S=10, the possible first die values are 4, 5, 6 equally likely. E[X|S=10]=(4+5+6)/3=5."
    },
    {
      label: "Problem 4: E[X|Y] as a random variable",
      concept: "E[X|Y]",
      technique: "Write the conditional mean rule",
      difficulty: "warmup",
      prompt: "A box type Y is A or B. E[X|Y=A]=3 and E[X|Y=B]=8. What values can E[X|Y] take?",
      solution: "E[X|Y] is 3 when Y=A and 8 when Y=B. It is random before Y is observed because Y is random."
    },
    {
      label: "Problem 5: Tower property",
      concept: "Tower property",
      technique: "Average conditional averages",
      difficulty: "warmup",
      prompt: "In Problem 4, suppose P(Y=A)=0.7 and P(Y=B)=0.3. Find E[X].",
      solution: "By tower property, E[X]=E[E[X|Y]]=0.7(3)+0.3(8)=4.5."
    },
    {
      label: "Problem 6: Conditional expectation from table",
      concept: "Conditional expectation",
      technique: "Use conditional PMF",
      difficulty: "standard",
      prompt: "Suppose P(X=0,Y=0)=0.2, P(X=2,Y=0)=0.3, P(X=0,Y=1)=0.1, P(X=2,Y=1)=0.4. Find E[X|Y=1].",
      solution: "Given Y=1, total probability is 0.1+0.4=0.5. P(X=0|Y=1)=0.1/0.5=0.2 and P(X=2|Y=1)=0.4/0.5=0.8. E[X|Y=1]=0(0.2)+2(0.8)=1.6."
    },
    {
      label: "Problem 7: Continuous conditional mean",
      concept: "Conditional density",
      technique: "Average inside conditional density",
      difficulty: "standard",
      prompt: "For f(x,y)=2 on 0<y<x<1, Chapter 5 showed Y|X=x is Uniform(0,x). Find E[Y|X=x].",
      solution: "Uniform(0,x) has midpoint x/2, so E[Y|X=x]=x/2."
    },
    {
      label: "Problem 8: Total expectation with first draw",
      concept: "Total expectation",
      technique: "Condition on first-stage result",
      difficulty: "standard",
      prompt: "An urn has 2 red and 3 blue balls. One ball is drawn and not replaced. Let X be the number of red balls in the next two draws. What information should you condition on to compute E[X] easily?",
      solution: "Condition on the colour of the first draw. After a red first draw, the urn has 1 red and 3 blue; after a blue first draw, it has 2 red and 2 blue. The first-stage result changes the later average."
    },
    {
      label: "Problem 9: Finish the first-draw expectation",
      concept: "Total expectation",
      technique: "Blend case expectations",
      difficulty: "standard",
      prompt: "Continue Problem 8. Compute E[X], where X is the number of red balls in the next two draws.",
      solution: "P(first red)=2/5 and P(first blue)=3/5. If first red, expected reds in next two draws is 2(1/4)=1/2. If first blue, expected reds is 2(2/4)=1. Thus E[X]=(2/5)(1/2)+(3/5)(1)=1/5+3/5=4/5."
    },
    {
      label: "Problem 10: Conditional variance from dice",
      concept: "Conditional variance",
      technique: "Compute spread inside condition",
      difficulty: "standard",
      prompt: "Two dice are rolled. Let X be the first die and S be the sum. Find Var(X|S=10).",
      solution: "Given S=10, X is equally likely to be 4, 5, 6. The mean is 5. Variance is [(4-5)^2+(5-5)^2+(6-5)^2]/3=2/3."
    },
    {
      label: "Problem 11: Total variance pieces",
      concept: "Total variance",
      technique: "Identify within and between parts",
      difficulty: "standard",
      prompt: "A score has Var(Score|easy)=25, Var(Score|hard)=16, E[Score|easy]=80, E[Score|hard]=55, and P(easy)=0.6. Which part measures within-version uncertainty?",
      solution: "The within-version part is E[Var(Score|Y)]=0.6(25)+0.4(16). It averages the remaining spread inside each test version."
    },
    {
      label: "Problem 12: Law of total variance",
      concept: "Total variance",
      technique: "Add within and between uncertainty",
      difficulty: "challenging",
      prompt: "Using Problem 11, the overall mean is 70. Compute Var(Score).",
      solution: "Within part: 0.6(25)+0.4(16)=21.4. Between part: Var(E[Score|Y])=0.6(80-70)^2+0.4(55-70)^2=60+90=150. Total variance = 21.4+150=171.4."
    },
    {
      label: "Problem 13: Prediction",
      concept: "Prediction",
      technique: "Use conditional expectation as best average prediction",
      difficulty: "challenging",
      prompt: "If you must predict Score after learning the test is hard, should you use the overall mean 70 or E[Score|hard]=55 under squared-error thinking?",
      solution: "Use E[Score|hard]=55. Conditional expectation is the best updated average prediction after the information is known."
    },
    {
      label: "Problem 14: Fair game",
      concept: "Fair-game intuition",
      technique: "Check zero-mean increment",
      difficulty: "challenging",
      prompt: "You have Rs. 200. A fair step adds Rs. 20 with probability 1/2 and subtracts Rs. 20 with probability 1/2. What is the expected next fortune given the current fortune?",
      solution: "Expected next fortune = 0.5(220)+0.5(180)=200. The expected future value equals the current value because the next increment has conditional mean 0."
    },
    {
      label: "Problem 15: Fair or favourable game",
      concept: "Fair-game intuition",
      technique: "Compute conditional expected increment",
      difficulty: "stretch",
      prompt: "Your current fortune is Rs. 200. A coin has P(heads)=0.4. Heads adds Rs. 30 and tails subtracts Rs. 20. Is this step fair? What is the expected next fortune given the current fortune?",
      solution: "The expected increment is 0.4(30)+0.6(-20)=12-12=0. So the step is fair even though the coin is not fair. The expected next fortune given the current fortune is 200+0=Rs. 200."
    }
  ];
}

function conditionalExpectationReviewQuestions() {
  return [
    {
      id: "ce-review-1",
      kind: "single concept",
      tags: ["conditional-expectation"],
      prompt: "What is conditional expectation in plain language?",
      options: [
        { id: "a", text: "Average after information is known" },
        { id: "b", text: "The largest possible value" },
        { id: "c", text: "A probability that must equal 1" },
        { id: "d", text: "Variance before observing anything" }
      ],
      answer: "a"
    },
    {
      id: "ce-review-2",
      kind: "single concept",
      tags: ["conditional-expectation-value"],
      prompt: "What kind of object is E[X|Y=y]?",
      options: [
        { id: "a", text: "A number after y is fixed" },
        { id: "b", text: "Always a variance" },
        { id: "c", text: "Always a full joint table" },
        { id: "d", text: "An impossible event" }
      ],
      answer: "a"
    },
    {
      id: "ce-review-3",
      kind: "single concept",
      tags: ["conditional-expectation-random-variable"],
      prompt: "Why is E[X|Y] a random variable?",
      options: [
        { id: "a", text: "Because its value depends on the random value of Y" },
        { id: "b", text: "Because it is always equal to X" },
        { id: "c", text: "Because it has no possible values" },
        { id: "d", text: "Because it ignores Y" }
      ],
      answer: "a"
    },
    {
      id: "ce-review-4",
      kind: "single concept",
      tags: ["tower-property"],
      prompt: "Which identity is the tower property?",
      options: [
        { id: "a", text: "E[E[X|Y]]=E[X]" },
        { id: "b", text: "E[X|Y]=E[Y|X] always" },
        { id: "c", text: "Var(X)=E[X]" },
        { id: "d", text: "P(X)=E[Y]" }
      ],
      answer: "a"
    },
    {
      id: "ce-review-5",
      kind: "single concept",
      tags: ["total-expectation"],
      prompt: "When is total expectation useful?",
      options: [
        { id: "a", text: "When cases make the inside expectation easier" },
        { id: "b", text: "Only when all variables are independent" },
        { id: "c", text: "Only when variance is zero" },
        { id: "d", text: "When no information is given" }
      ],
      answer: "a"
    },
    {
      id: "ce-review-6",
      kind: "mixed: two concepts",
      tags: ["conditional-variance"],
      prompt: "What does conditional variance measure?",
      options: [
        { id: "a", text: "Spread remaining after information is known" },
        { id: "b", text: "Only the overall mean" },
        { id: "c", text: "The maximum of Y" },
        { id: "d", text: "A probability of exactly one event" }
      ],
      answer: "a"
    },
    {
      id: "ce-review-7",
      kind: "mixed: two concepts",
      tags: ["total-variance"],
      prompt: "What is the law of total variance?",
      options: [
        { id: "a", text: "Var(X)=E[Var(X|Y)]+Var(E[X|Y])" },
        { id: "b", text: "Var(X)=E[X|Y]" },
        { id: "c", text: "Var(X)=P(X|Y)" },
        { id: "d", text: "Var(X)=0 always" }
      ],
      answer: "a"
    },
    {
      id: "ce-review-8",
      kind: "mixed: two concepts",
      tags: ["prediction", "conditional-expectation"],
      prompt: "Under mean squared error, what is the best prediction of X after observing Y?",
      options: [
        { id: "a", text: "E[X|Y]" },
        { id: "b", text: "Var(Y)" },
        { id: "c", text: "The largest value of X" },
        { id: "d", text: "P(Y)" }
      ],
      answer: "a"
    },
    {
      id: "ce-review-9",
      kind: "mixed: three concepts",
      tags: ["fair-game", "conditional-expectation"],
      prompt: "What is the fair-game conditional expectation pattern?",
      options: [
        { id: "a", text: "Expected next value equals current value after current information" },
        { id: "b", text: "The next value is always larger" },
        { id: "c", text: "Variance is always negative" },
        { id: "d", text: "Conditioning is forbidden" }
      ],
      answer: "a"
    },
    {
      id: "ce-review-10",
      kind: "mixed: three concepts",
      tags: ["recognition", "total-expectation"],
      prompt: "Which phrase most strongly suggests conditioning on a first-stage variable?",
      options: [
        { id: "a", text: "A box is chosen first, then a ball is drawn" },
        { id: "b", text: "There is only one possible outcome" },
        { id: "c", text: "The variable has no mean" },
        { id: "d", text: "No information is observed" }
      ],
      answer: "a"
    }
  ];
}

function covariancePracticeProblems() {
  return [
    {
      label: "Concept Problem 1: Product expectation from a table",
      concept: "E[XY]",
      technique: "Average products using joint cells",
      difficulty: "intro",
      prompt: "Suppose p(0,0)=0.2, p(0,1)=0.3, p(1,0)=0.1, and p(1,1)=0.4. Find E[X], E[Y], and E[XY].",
      solution: "E[X]=P(X=1)=0.1+0.4=0.5. E[Y]=P(Y=1)=0.3+0.4=0.7. Since XY=1 only at (1,1), E[XY]=0.4."
    },
    {
      label: "Concept Problem 2: Covariance from a table",
      concept: "Covariance",
      technique: "Use E[XY]-E[X]E[Y]",
      difficulty: "intro",
      prompt: "Using the table from Problem 1, find Cov(X,Y).",
      solution: "Cov(X,Y)=E[XY]-E[X]E[Y]=0.4-(0.5)(0.7)=0.05. The covariance is positive."
    },
    {
      label: "Concept Problem 3: Correlation",
      concept: "Correlation",
      technique: "Scale covariance by standard deviations",
      difficulty: "intro",
      prompt: "If Cov(X,Y)=6, SD(X)=2, and SD(Y)=5, find Corr(X,Y).",
      solution: "Corr(X,Y)=Cov(X,Y)/(SD(X)SD(Y))=6/(2 x 5)=0.6."
    },
    {
      label: "Problem 4: Sign of covariance",
      concept: "Covariance meaning",
      technique: "Interpret paired deviations",
      difficulty: "warmup",
      prompt: "If high values of X tend to appear with low values of Y, what sign should covariance have?",
      solution: "The covariance should be negative. When X is above its mean, Y tends to be below its mean, so the product of deviations is negative."
    },
    {
      label: "Problem 5: Independent dice",
      concept: "Independence",
      technique: "Use product expectation factorization",
      difficulty: "warmup",
      prompt: "Let X and Y be the two results from two independent fair dice. What is Cov(X,Y)?",
      solution: "The dice are independent, so E[XY]=E[X]E[Y]. Therefore Cov(X,Y)=E[XY]-E[X]E[Y]=0."
    },
    {
      label: "Problem 6: Variance of a sum",
      concept: "Variance of sums",
      technique: "Include covariance term",
      difficulty: "warmup",
      prompt: "If Var(X)=4, Var(Y)=9, and Cov(X,Y)=2, find Var(X+Y).",
      solution: "Var(X+Y)=Var(X)+Var(Y)+2Cov(X,Y)=4+9+2(2)=17."
    },
    {
      label: "Problem 7: Negative covariance in a sum",
      concept: "Variance of sums",
      technique: "Use covariance sign",
      difficulty: "standard",
      prompt: "If Var(X)=10, Var(Y)=6, and Cov(X,Y)=-3, find Var(X+Y).",
      solution: "Var(X+Y)=10+6+2(-3)=10. Negative covariance reduces the spread of the sum."
    },
    {
      label: "Problem 8: Correlation from covariance",
      concept: "Correlation",
      technique: "Compute standard deviations first",
      difficulty: "standard",
      prompt: "If Var(X)=16, Var(Y)=25, and Cov(X,Y)=-12, find Corr(X,Y).",
      solution: "SD(X)=4 and SD(Y)=5. Corr(X,Y)=-12/(4 x 5)=-3/5."
    },
    {
      label: "Problem 9: Zero covariance but not independent",
      concept: "Zero covariance",
      technique: "Use nonlinear dependence example",
      difficulty: "standard",
      prompt: "Let X be equally likely to be -1, 0, or 1, and let Y=X^2. Explain why X and Y are not independent but have zero covariance.",
      solution: "Y is determined by X, so they are not independent. But E[X]=0, E[XY]=E[X^3]=0, and E[X]E[Y]=0, so Cov(X,Y)=0."
    },
    {
      label: "Problem 10: Indicator covariance",
      concept: "Indicator-pair covariance",
      technique: "Use P(both)-product",
      difficulty: "standard",
      prompt: "Events A and B have P(A)=0.4, P(B)=0.5, and P(A and B)=0.3. Let I and J be their indicators. Find Cov(I,J).",
      solution: "Cov(I,J)=P(A and B)-P(A)P(B)=0.3-(0.4)(0.5)=0.1."
    },
    {
      label: "Problem 11: Cards without replacement",
      concept: "Indicator covariance",
      technique: "Compare joint chance with product",
      difficulty: "standard",
      prompt: "Two cards are drawn without replacement. Let I be 1 if the first is an ace and J be 1 if the second is an ace. Find Cov(I,J).",
      solution: "P(I=1)=P(J=1)=4/52. P(I=1,J=1)=(4/52)(3/51). Cov(I,J)=(4/52)(3/51)-(4/52)^2, which is negative."
    },
    {
      label: "Problem 12: Continuous E[XY]",
      concept: "E[XY]",
      technique: "Integrate over support",
      difficulty: "challenging",
      prompt: "Let X and Y be independent Uniform(0,1). Find E[XY] and Cov(X,Y).",
      solution: "By independence, E[XY]=E[X]E[Y]=(1/2)(1/2)=1/4. Therefore Cov(X,Y)=0."
    },
    {
      label: "Problem 13: Perfect positive correlation",
      concept: "Correlation",
      technique: "Recognise linear relationship",
      difficulty: "challenging",
      prompt: "If Y=3X+2 and Var(X)>0, what is Corr(X,Y)?",
      solution: "Y is an increasing linear function of X, so Corr(X,Y)=1. The +2 shift does not affect correlation, and positive scaling preserves direction."
    },
    {
      label: "Problem 14: Perfect negative correlation",
      concept: "Correlation",
      technique: "Recognise decreasing linear relationship",
      difficulty: "challenging",
      prompt: "If Y=-4X+7 and Var(X)>0, what is Corr(X,Y)?",
      solution: "Y is a decreasing linear function of X, so Corr(X,Y)=-1."
    },
    {
      label: "Problem 15: Dependent total",
      concept: "Variance of sums",
      technique: "Use all pair terms",
      difficulty: "stretch",
      prompt: "Let X=I1+I2+I3 where each indicator has variance v and every pair has covariance c. Find Var(X).",
      solution: "Var(X)=Var(I1)+Var(I2)+Var(I3)+2[Cov(I1,I2)+Cov(I1,I3)+Cov(I2,I3)] = 3v+6c."
    }
  ];
}

function covarianceReviewQuestions() {
  return [
    {
      id: "cov-review-1",
      kind: "single concept",
      tags: ["product-expectation"],
      prompt: "Which quantity must usually be computed before covariance?",
      options: [
        { id: "a", text: "E[XY]" },
        { id: "b", text: "Only E[X]" },
        { id: "c", text: "Only Var(X)" },
        { id: "d", text: "The maximum of X" }
      ],
      answer: "a"
    },
    {
      id: "cov-review-2",
      kind: "single concept",
      tags: ["covariance"],
      prompt: "Which formula is the covariance shortcut?",
      options: [
        { id: "a", text: "Cov(X,Y)=E[XY]-E[X]E[Y]" },
        { id: "b", text: "Cov(X,Y)=E[X]+E[Y]" },
        { id: "c", text: "Cov(X,Y)=Var(X)+Var(Y)" },
        { id: "d", text: "Cov(X,Y)=E[X]/E[Y]" }
      ],
      answer: "a"
    },
    {
      id: "cov-review-3",
      kind: "single concept",
      tags: ["correlation"],
      prompt: "Why is correlation easier to compare than covariance?",
      options: [
        { id: "a", text: "It is unit-free and lies between -1 and 1" },
        { id: "b", text: "It is always positive" },
        { id: "c", text: "It proves independence" },
        { id: "d", text: "It ignores standard deviations" }
      ],
      answer: "a"
    },
    {
      id: "cov-review-4",
      kind: "single concept",
      tags: ["variance-of-sums"],
      prompt: "What is Var(X+Y) in general?",
      options: [
        { id: "a", text: "Var(X)+Var(Y)" },
        { id: "b", text: "Var(X)+Var(Y)+2Cov(X,Y)" },
        { id: "c", text: "E[X]+E[Y]" },
        { id: "d", text: "Cov(X,Y)" }
      ],
      answer: "b"
    },
    {
      id: "cov-review-5",
      kind: "mixed: two concepts",
      tags: ["independence", "covariance"],
      prompt: "If X and Y are independent and the needed moments exist, what is Cov(X,Y)?",
      options: [
        { id: "a", text: "0" },
        { id: "b", text: "1" },
        { id: "c", text: "E[X]+E[Y]" },
        { id: "d", text: "Always positive" }
      ],
      answer: "a"
    },
    {
      id: "cov-review-6",
      kind: "mixed: two concepts",
      tags: ["zero-covariance", "independence"],
      prompt: "What is true in general if Cov(X,Y)=0?",
      options: [
        { id: "a", text: "X and Y must be independent" },
        { id: "b", text: "There is no linear association measured by covariance" },
        { id: "c", text: "Y must equal X" },
        { id: "d", text: "X and Y cannot be related in any way" }
      ],
      answer: "b"
    },
    {
      id: "cov-review-7",
      kind: "mixed: two concepts",
      tags: ["indicator-covariance"],
      prompt: "For indicators I and J, what is E[IJ]?",
      options: [
        { id: "a", text: "P(I=1 and J=1)" },
        { id: "b", text: "P(I=1)+P(J=1)" },
        { id: "c", text: "Var(I)+Var(J)" },
        { id: "d", text: "Always 0" }
      ],
      answer: "a"
    },
    {
      id: "cov-review-8",
      kind: "mixed: three concepts",
      tags: ["correlation", "linear-relationship"],
      prompt: "If Y=aX+b with a<0 and Var(X)>0, what is Corr(X,Y)?",
      options: [
        { id: "a", text: "1" },
        { id: "b", text: "-1" },
        { id: "c", text: "0" },
        { id: "d", text: "b" }
      ],
      answer: "b"
    },
    {
      id: "cov-review-9",
      kind: "mixed: two concepts",
      tags: ["covariance", "interpretation"],
      prompt: "What does negative covariance usually indicate?",
      options: [
        { id: "a", text: "High X tends to appear with low Y" },
        { id: "b", text: "High X tends to appear with high Y" },
        { id: "c", text: "X and Y are impossible" },
        { id: "d", text: "X and Y have no variance" }
      ],
      answer: "a"
    },
    {
      id: "cov-review-10",
      kind: "mixed: two concepts",
      tags: ["indicator-covariance", "dependence"],
      prompt: "For two draws without replacement, why are ace indicators negatively correlated?",
      options: [
        { id: "a", text: "An ace on the first draw leaves fewer aces for the second draw" },
        { id: "b", text: "The two draws are independent" },
        { id: "c", text: "Aces cannot appear in a deck" },
        { id: "d", text: "The indicators are continuous variables" }
      ],
      answer: "a"
    }
  ];
}

function variancePracticeProblems() {
  return [
    {
      label: "Concept Problem 1: Same mean, different spread",
      concept: "Variance meaning",
      technique: "Compare squared deviations",
      difficulty: "intro",
      prompt: "Let X=5 always. Let Y be 0 with probability 1/2 and 10 with probability 1/2. Find E[X], E[Y], Var(X), and Var(Y).",
      solution: "E[X]=5 and Var(X)=0 because X never moves from its mean. E[Y]=0(1/2)+10(1/2)=5. Var(Y)=E[(Y-5)^2]=25(1/2)+25(1/2)=25. The same mean can hide very different spread."
    },
    {
      label: "Concept Problem 2: Use the shortcut",
      concept: "Computational formula",
      technique: "Use E[X^2] - (E[X])^2",
      difficulty: "intro",
      prompt: "A random variable has E[X]=3 and E[X^2]=13. Find Var(X) and SD(X).",
      solution: "Var(X)=E[X^2]-(E[X])^2=13-9=4. SD(X)=sqrt(4)=2."
    },
    {
      label: "Concept Problem 3: Bernoulli variance",
      concept: "Bernoulli",
      technique: "Use X^2 = X",
      difficulty: "intro",
      prompt: "If X is Bernoulli(0.2), find E[X], E[X^2], and Var(X).",
      solution: "For Bernoulli, X is 0 or 1, so X^2=X. E[X]=0.2 and E[X^2]=0.2. Var(X)=0.2-(0.2)^2=0.16."
    },
    {
      label: "Problem 4: Standard deviation units",
      concept: "Standard deviation",
      technique: "Take square root of variance",
      difficulty: "warmup",
      prompt: "A score variable has variance 9 marks squared. What is its standard deviation, and what unit does it use?",
      solution: "SD=sqrt(9)=3 marks. Variance uses squared marks, but standard deviation returns to the original unit."
    },
    {
      label: "Problem 5: Shift and scale",
      concept: "Transformation",
      technique: "Use Var(aX+b)",
      difficulty: "warmup",
      prompt: "If Var(X)=6, find Var(3X+10) and SD(3X+10).",
      solution: "Var(3X+10)=3^2 Var(X)=9 x 6=54. SD(3X+10)=|3|SD(X)=3sqrt(6). The +10 shift does not change spread."
    },
    {
      label: "Problem 6: Binomial variance",
      concept: "Binomial",
      technique: "Independent Bernoulli switches",
      difficulty: "warmup",
      prompt: "A fair coin is tossed 12 times. Let X be the number of heads. Find E[X], Var(X), and SD(X).",
      solution: "X is Binomial(12,1/2). E[X]=np=6. Var(X)=np(1-p)=12(1/2)(1/2)=3. SD(X)=sqrt(3)."
    },
    {
      label: "Problem 7: Binomial with guessing",
      concept: "Binomial",
      technique: "Recognise independent trials",
      difficulty: "standard",
      prompt: "A student guesses on 20 four-option questions. Let X be the number correct. Find the variance of X.",
      solution: "Each question has success probability p=1/4, independently. X is Binomial(20,1/4). Var(X)=20(1/4)(3/4)=15/4."
    },
    {
      label: "Problem 8: Geometric waiting time",
      concept: "Geometric",
      technique: "Use first-success variance",
      difficulty: "standard",
      prompt: "A request succeeds independently with probability 0.25 on each attempt. Let X be the attempt number of the first success. Find E[X] and Var(X).",
      solution: "For the first-success convention, E[X]=1/p=4. Var(X)=(1-p)/p^2=0.75/(0.25)^2=12."
    },
    {
      label: "Problem 9: Hypergeometric variance",
      concept: "Hypergeometric",
      technique: "Use finite population correction",
      difficulty: "standard",
      prompt: "A batch has N=50 items, K=10 defective. You inspect n=5 without replacement. Let X be the number of defectives. Find Var(X).",
      solution: "Here p=K/N=10/50=1/5. Var(X)=n p(1-p)(N-n)/(N-1)=5(1/5)(4/5)(45/49)=36/49."
    },
    {
      label: "Problem 10: Uniform variance",
      concept: "Uniform",
      technique: "Use interval length",
      difficulty: "standard",
      prompt: "If X is Uniform(2,8), find E[X], Var(X), and SD(X).",
      solution: "E[X]=(2+8)/2=5. Var(X)=(8-2)^2/12=36/12=3. SD(X)=sqrt(3)."
    },
    {
      label: "Problem 11: Compute from a small PMF",
      concept: "Second moment",
      technique: "Build E[X] and E[X^2]",
      difficulty: "standard",
      prompt: "X takes values 0, 1, 2 with probabilities 1/4, 1/2, 1/4. Find Var(X).",
      solution: "E[X]=0(1/4)+1(1/2)+2(1/4)=1. E[X^2]=0+1(1/2)+4(1/4)=3/2. Var(X)=3/2-1^2=1/2."
    },
    {
      label: "Problem 12: Chebyshev with standard deviations",
      concept: "Chebyshev",
      technique: "Convert to k standard deviations",
      difficulty: "standard",
      prompt: "A random variable has mean 100 and standard deviation 15. Use Chebyshev to bound P(|X-100| >= 45).",
      solution: "The distance 45 is 3 standard deviations because 45=3 x 15. Chebyshev gives P(|X-100| >= 45) <= 1/3^2 = 1/9."
    },
    {
      label: "Problem 13: Chebyshev inside interval",
      concept: "Tail bound",
      technique: "Use inside form",
      difficulty: "standard",
      prompt: "A random variable has mean 50 and variance 16. What can Chebyshev guarantee about P(42 < X < 58)?",
      solution: "SD=4. The interval from 42 to 58 is within 8 of the mean, i.e. within 2 standard deviations. Chebyshev says P(|X-50| < 8) >= 1 - 1/2^2 = 3/4."
    },
    {
      label: "Problem 14: Why dependence matters",
      concept: "Variance of dependent counts",
      technique: "Compare binomial and hypergeometric",
      difficulty: "challenging",
      prompt: "Compare the variance of drawing 10 items from a population with success fraction p=0.3 with replacement versus without replacement from N=100.",
      solution: "With replacement, the binomial variance is n p(1-p)=10(0.3)(0.7)=2.1. Without replacement, multiply by (N-n)/(N-1)=90/99, giving 2.1 x 90/99 = 21/11. The without-replacement variance is smaller."
    },
    {
      label: "Problem 15: Bound from limited information",
      concept: "Information level",
      technique: "Explain exact versus bounded probability",
      difficulty: "challenging",
      prompt: "Suppose you know only E[X]=20 and Var(X)=25. Can you find the exact value of P(|X-20| >= 10)? What can you say using Chebyshev?",
      solution: "The exact probability cannot be found from only mean and variance; different distributions can share those values. Since SD=5 and distance 10 is 2 SDs, Chebyshev gives P(|X-20| >= 10) <= 1/4."
    },
    {
      label: "Problem 16: Markov mean-only bound",
      concept: "Markov",
      technique: "Use nonnegative mean information",
      difficulty: "challenging",
      prompt: "A nonnegative random variable X has E[X]=12. Use Markov to bound P(X >= 60).",
      solution: "Markov applies because X is nonnegative. P(X >= 60) <= E[X]/60 = 12/60 = 1/5."
    },
    {
      label: "Problem 17: Chernoff for independent trials",
      concept: "Chernoff",
      technique: "Use multiplicative upper tail",
      difficulty: "stretch",
      prompt: "Let X be Binomial(200,0.1). Use the simple Chernoff upper-tail bound to bound P(X >= 30).",
      solution: "The mean is mu=np=20. The cutoff 30 equals (1+delta)mu, so delta=1/2. Chernoff gives P(X >= 30) <= exp(-mu delta^2/3)=exp(-20(1/2)^2/3)=exp(-5/3)."
    }
  ];
}

function varianceReviewQuestions() {
  return [
    {
      id: "var-review-1",
      kind: "single concept",
      tags: ["variance"],
      prompt: "What does variance measure?",
      options: [
        { id: "a", text: "The largest possible value of X" },
        { id: "b", text: "Average squared distance from the mean" },
        { id: "c", text: "The probability that X equals its mean" },
        { id: "d", text: "The median of X" }
      ],
      answer: "b"
    },
    {
      id: "var-review-2",
      kind: "single concept",
      tags: ["standard-deviation"],
      prompt: "Why is standard deviation often easier to interpret than variance?",
      options: [
        { id: "a", text: "It is always smaller than the mean" },
        { id: "b", text: "It uses the original unit of X" },
        { id: "c", text: "It gives the exact tail probability" },
        { id: "d", text: "It ignores spread" }
      ],
      answer: "b"
    },
    {
      id: "var-review-3",
      kind: "single concept",
      tags: ["second-moment"],
      prompt: "Which formula is the computational shortcut for variance?",
      options: [
        { id: "a", text: "Var(X)=E[X^2]-(E[X])^2" },
        { id: "b", text: "Var(X)=E[X^2]+(E[X])^2" },
        { id: "c", text: "Var(X)=E[X]-E[X^2]" },
        { id: "d", text: "Var(X)=sqrt(E[X])" }
      ],
      answer: "a"
    },
    {
      id: "var-review-4",
      kind: "single concept",
      tags: ["transformation"],
      prompt: "If Var(X)=4, what is Var(5X+7)?",
      options: [
        { id: "a", text: "20" },
        { id: "b", text: "27" },
        { id: "c", text: "100" },
        { id: "d", text: "107" }
      ],
      answer: "c"
    },
    {
      id: "var-review-5",
      kind: "single concept",
      tags: ["bernoulli"],
      prompt: "Why is E[X^2]=E[X] for a Bernoulli random variable?",
      options: [
        { id: "a", text: "Because X only takes values 0 and 1" },
        { id: "b", text: "Because all variables have this property" },
        { id: "c", text: "Because variance is zero" },
        { id: "d", text: "Because Bernoulli variables are continuous" }
      ],
      answer: "a"
    },
    {
      id: "var-review-6",
      kind: "mixed: two concepts",
      tags: ["binomial", "independence"],
      prompt: "What is the variance of a Binomial(n,p) random variable?",
      options: [
        { id: "a", text: "np" },
        { id: "b", text: "p(1-p)" },
        { id: "c", text: "np(1-p)" },
        { id: "d", text: "n/p" }
      ],
      answer: "c"
    },
    {
      id: "var-review-7",
      kind: "mixed: two concepts",
      tags: ["geometric", "convention"],
      prompt: "For the first-success convention X=1,2,3,..., what is Var(X) for Geometric(p)?",
      options: [
        { id: "a", text: "p(1-p)" },
        { id: "b", text: "(1-p)/p^2" },
        { id: "c", text: "1/p" },
        { id: "d", text: "p^2/(1-p)" }
      ],
      answer: "b"
    },
    {
      id: "var-review-8",
      kind: "mixed: two concepts",
      tags: ["hypergeometric", "dependence"],
      prompt: "Why is hypergeometric variance smaller than the corresponding binomial variance?",
      options: [
        { id: "a", text: "Sampling without replacement creates negative dependence" },
        { id: "b", text: "The mean is always zero" },
        { id: "c", text: "Hypergeometric variables are continuous" },
        { id: "d", text: "Variance never depends on dependence" }
      ],
      answer: "a"
    },
    {
      id: "var-review-9",
      kind: "mixed: two concepts",
      tags: ["uniform", "second-moment"],
      prompt: "What is Var(X) for X Uniform(a,b)?",
      options: [
        { id: "a", text: "(a+b)/2" },
        { id: "b", text: "(b-a)^2/12" },
        { id: "c", text: "1/(b-a)" },
        { id: "d", text: "(a^2+b^2)/2" }
      ],
      answer: "b"
    },
    {
      id: "var-review-10",
      kind: "mixed: three concepts",
      tags: ["chebyshev", "tail-bound", "standard-deviation"],
      prompt: "If a distance is 4 standard deviations from the mean, what does Chebyshev guarantee for the probability of being at least that far away?",
      options: [
        { id: "a", text: "At most 1/4" },
        { id: "b", text: "At most 1/8" },
        { id: "c", text: "At most 1/16" },
        { id: "d", text: "Exactly 1/16" }
      ],
      answer: "c"
    },
    {
      id: "var-review-11",
      kind: "mixed: two concepts",
      tags: ["markov", "tail-bound"],
      prompt: "When can Markov's inequality be applied directly?",
      options: [
        { id: "a", text: "When X is nonnegative and E[X] is known" },
        { id: "b", text: "Only when X is normal" },
        { id: "c", text: "Only when Var(X)=0" },
        { id: "d", text: "When X can be negative with unknown mean" }
      ],
      answer: "a"
    },
    {
      id: "var-review-12",
      kind: "mixed: three concepts",
      tags: ["chernoff", "tail-bound", "independence"],
      prompt: "What extra structure does a basic Chernoff bound use compared with Chebyshev?",
      options: [
        { id: "a", text: "Only the median" },
        { id: "b", text: "Independent bounded summands such as Bernoulli indicators" },
        { id: "c", text: "Only the maximum value of X" },
        { id: "d", text: "No information beyond the mean" }
      ],
      answer: "b"
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
      topic: "method of indicators",
      pattern: "count decomposition into indicator variables with linearity, symmetry, and pairwise products",
      variations: "fixed points; occupancy; dependent indicators; variance by pairs; exchangeability; conditioning bridge"
    },
    {
      topic: "conditional expectation and tower property",
      pattern: "conditioning choice, tower property, total variance, and stopping-time counts",
      variations: "condition on the simplifying variable; law of total expectation; law of total variance; geometric stopping; conditional distributions"
    },
    {
      topic: "order statistics",
      pattern: "exact distribution from CDF/PDF transformations and order-statistic identities",
      variations: "uniform/beta order statistics; exponential spacings; min/max scaling; joint order statistics; conditional laws"
    },
    {
      topic: "MLE and estimation",
      pattern: "likelihood setup, optimizer location, and estimator quality",
      variations: "regular families; support-dependent likelihoods; boundary MLEs; constrained MLEs; bias, MSE, sufficiency, UMVUE"
    },
    {
      topic: "UMP/NP tests",
      pattern: "likelihood-ratio construction with size calibration",
      variations: "simple vs simple; one-sided UMP; transformed samples; monotone likelihood ratios; power under the alternative"
    },
    {
      topic: "regression and OLS",
      pattern: "normal equations, projection geometry, and estimator interpretation",
      variations: "simple regression; matrix OLS; constrained OLS; slope invariance; non-Gaussian errors; residual and fitted-value identities"
    }
  ];

  const weeklyFocus = [
    "baseline diagnostic cycle across all six patterns",
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
    "final cumulative synthesis across all six recurring patterns"
  ];

  return weeklyFocus.map((focus, weekIndex) => ({
    focus,
    problemDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day, dayIndex) => {
      const theme = cycle[dayIndex % cycle.length];
      const intensity = dayIndex < 3 ? "core drill" : dayIndex < 5 ? "variation drill" : "mixed PSB-style drill";
      return {
        day,
        intensity,
        ...theme
      };
    })
  }));
}

function probabilityStatsPatternWorkspaces() {
  return [
    {
      id: "pattern-indicators",
      title: "Method of Indicators",
      day: "Monday",
      focus: "Convert random counts into sums of yes/no variables, then use linearity, symmetry, and pairwise products.",
      weeks: [
        {
          id: "ps-w1-indicators",
          week: 1,
          date: "2026-06-01",
          materialTitle: "June 1: Method of Indicators Pset",
          materialUrl: "psets/week-01/june-01-indicators.html",
          status: "Published",
          expectedWork: "10 problems: 5 concept builders, 3 integration problems, 2 ISI past-year/reconstructed problems."
        }
      ]
    },
    {
      id: "pattern-conditional-expectation",
      title: "Conditional Expectation and Tower Property",
      day: "Tuesday",
      focus: "Choose the simplifying variable, compute the inner expectation, and average back out.",
      weeks: [
        {
          id: "ps-w1-conditional-expectation",
          week: 1,
          date: "2026-06-02",
          materialTitle: "June 2: Conditional Expectation and Tower Property Pset",
          materialUrl: "psets/week-01/june-02-conditional-expectation-tower.html",
          status: "Published",
          expectedWork: "10 problems: 5 mechanics drills, 3 application problems, and 2 hard hidden-pattern problems."
        }
      ]
    },
    {
      id: "pattern-order-statistics",
      title: "Order Statistics",
      day: "Wednesday",
      focus: "Derive exact min/max/kth-order laws, joint laws, spacings, and scaling limits.",
      weeks: [
        {
          id: "ps-w1-order-statistics",
          week: 1,
          date: "2026-06-03",
          materialTitle: "June 3: Order Statistics Pset",
          materialUrl: "",
          status: "Pending",
          expectedWork: "Planned 10-problem set: CDF/PDF method, uniform-beta links, min/max, spacings, and ISI-style applications."
        }
      ]
    },
    {
      id: "pattern-mle",
      title: "MLE and Estimation",
      day: "Thursday",
      focus: "Set up likelihoods, identify optimizer location, and evaluate estimator quality.",
      weeks: [
        {
          id: "ps-w1-mle",
          week: 1,
          date: "2026-06-04",
          materialTitle: "June 4: MLE and Estimation Pset",
          materialUrl: "",
          status: "Pending",
          expectedWork: "Planned 10-problem set: regular MLE, support-dependent MLE, constraints, bias, MSE, sufficiency, and UMVUE cues."
        }
      ]
    },
    {
      id: "pattern-ump-np",
      title: "UMP/NP Tests",
      day: "Friday",
      focus: "Construct likelihood-ratio tests, calibrate size, and compute power under alternatives.",
      weeks: [
        {
          id: "ps-w1-ump-np",
          week: 1,
          date: "2026-06-05",
          materialTitle: "June 5: UMP/NP Tests Pset",
          materialUrl: "",
          status: "Pending",
          expectedWork: "Planned 10-problem set: simple-vs-simple NP, one-sided UMP, transformed samples, monotone likelihood ratios, and power."
        }
      ]
    },
    {
      id: "pattern-regression-ols",
      title: "Regression and OLS",
      day: "Saturday",
      focus: "Use normal equations, projection geometry, and estimator interpretation in regression problems.",
      weeks: [
        {
          id: "ps-w1-regression-ols",
          week: 1,
          date: "2026-06-06",
          materialTitle: "June 6: Regression and OLS Pset",
          materialUrl: "",
          status: "Pending",
          expectedWork: "Planned 10-problem set: simple OLS, matrix OLS, constrained OLS, slope invariance, residual identities, and L1 contrast."
        }
      ]
    }
  ];
}

function competitionMathMaterialWorkspaces() {
  return [
    {
      id: "competition-algebra-foundations",
      title: "Algebra Foundations",
      day: "Week 1",
      focus: "Vieta's formulas, polynomial manipulation, factor theorem, rational roots, and root transformations.",
      weeks: [
        {
          id: "cm-w1-vietas-polynomials",
          week: 1,
          date: "2026-06-01",
          materialTitle: "June 1: Vieta and Polynomial Fundamentals",
          materialUrl: "psets/week-01/june-01-competition-math-vietas-polynomials.html",
          expectedWork: "One-hour session: review the core Vieta pattern, solve 10 scaffolded problems, then write technique-journal notes for missed triggers.",
          status: "Published"
        }
      ]
    }
  ];
}

function competitionMathMilestones() {
  return [
    {
      focus: "Algebra: Vieta's formulas and polynomial fundamentals",
      competition: "Symmetric functions of roots, Newton's identities lightly, factor theorem, and rational root theorem used aggressively.",
      practice: "12-15 AIME polynomial/Vieta problems, difficulty 4-8.",
      journal: "Record root-symmetry transformations, common Vieta substitutions, and polynomial factor cues."
    },
    {
      focus: "Algebra: identities and factoring tricks",
      competition: "Sophie Germain, sum/difference of cubes and powers, Simon's Favorite Factoring Trick, and telescoping.",
      practice: "12-15 AIME algebra problems across multiple years.",
      journal: "Log each factoring pattern by trigger phrase and transformation."
    },
    {
      focus: "Algebra: sequences and recurrences",
      competition: "Linear recurrences, characteristic polynomials, telescoping sums, and Fibonacci-like manipulation.",
      practice: "10-12 AIME recurrence problems plus a few Putnam A1 sequence problems.",
      journal: "Connect recurrence roots to eigenvalue intuition and note when telescoping is available."
    },
    {
      focus: "Algebra: inequalities, part 1",
      competition: "AM-GM, weighted AM-GM, Cauchy-Schwarz, Engel form, and Titu's lemma as a practical workhorse.",
      practice: "12-15 AIME inequality problems plus easy USAMO inequalities.",
      journal: "Track which inequality was chosen and why the expression suggested it."
    },
    {
      focus: "Algebra: inequalities, part 2",
      competition: "Power mean, rearrangement, Jensen preview, tangent-line method, and sum-of-squares decompositions.",
      practice: "12-15 inequality problems with at least two full written solutions.",
      journal: "Record tangent-line and SOS transformations as reusable moves."
    },
    {
      focus: "Algebra: functional equations",
      competition: "Standard substitutions, x=0, x=y, x=1/y, injectivity/surjectivity, and Cauchy variants.",
      practice: "10-12 Engel/AIME/USAMO functional equation problems.",
      journal: "List substitution attempts and the structural reason each worked or failed."
    },
    {
      focus: "Algebra: complex numbers as a tool",
      competition: "Roots of unity, roots-of-unity filters, e^(i theta) for trigonometric identities and sums.",
      practice: "10-12 problems connecting algebra, trig, and coefficient extraction.",
      journal: "Flag overlap with future combinatorics and record roots-of-unity filters."
    },
    {
      focus: "Algebra synthesis and review",
      competition: "Mixed algebra across Vieta, identities, recurrences, inequalities, functional equations, and complex numbers.",
      practice: "20-25 mixed algebra problems pulled randomly from the prior seven weeks.",
      journal: "Review the algebra technique journal end to end and mark unstable patterns."
    },
    {
      focus: "Number theory: divisibility, Euclidean algorithm, Bezout, and linear Diophantine equations",
      competition: "GCD/LCM relationships, Bezout as a proof tool, and integer-solution parametrization.",
      practice: "12-15 AIME number theory problems, difficulty 4-8.",
      journal: "Track standard gcd transformations and Diophantine solvability conditions."
    },
    {
      focus: "Number theory: modular arithmetic, Fermat, and Euler",
      competition: "Working mod n fluently, choosing useful moduli, standard mod 3/4/8/9 checks, Fermat's little theorem, and Euler's theorem.",
      practice: "12-15 modular arithmetic problems.",
      journal: "Record first-try moduli and why each modulus kills the problem."
    },
    {
      focus: "Number theory: CRT and Wilson's theorem",
      competition: "CRT computationally and structurally, systems of congruences, and Wilson's theorem.",
      practice: "10-12 congruence-system problems, including CRT decoupling.",
      journal: "Record when a problem decomposes naturally into prime-power cases."
    },
    {
      focus: "Number theory: v_p, Legendre, and LTE",
      competition: "Exponent of a prime in n!, Legendre's formula, and lifting the exponent for a^n +/- b^n.",
      practice: "10-12 factorial-related, valuation, and Putnam-style number theory problems.",
      journal: "Memorize LTE conditions and write one complete valuation proof."
    },
    {
      focus: "Number theory: quadratic residues",
      competition: "Squares modulo small numbers, Legendre symbol, Euler's criterion, and a brief quadratic reciprocity preview.",
      practice: "10-12 residue problems; keep algebra review alive with 1-2 algebra problems.",
      journal: "End August by reviewing algebra plus the first number theory entries and building the September continuation queue."
    }
  ];
}

function milestoneDetails(milestone) {
  if (milestone.problemDays) {
    const topics = milestone.problemDays.map((day) => `${day.day}: ${day.topic}`).join(" | ");
    return `Daily 10-problem PSB practice sets. Weekly focus: ${milestone.focus}. Pattern rotation: ${topics}. Sunday is mixed review.`;
  }
  if (milestone.focs) {
    return `FOCS: ${milestone.focs} Cartesian: ${milestone.cartesian}`;
  }
  if (milestone.competition) {
    return `One hour per day. Focus: ${milestone.focus}. Toolkit: ${milestone.competition} Practice: ${milestone.practice} Technique journal: ${milestone.journal}`;
  }
  return `CMU 21-228: ${milestone.cmu} MIT 6.1200J: ${milestone.mitMcs} MIT 18.200: ${milestone.mitApplied}`;
}

function probabilityProblemSetDetails(dayPlan, week) {
  const weekOneMonday = week === 1 && dayPlan.day === "Monday" && dayPlan.topic === "method of indicators";
  const resource = weekOneMonday ? " Material: psets/week-01/june-01-indicators.html." : "";
  return `Complete a 10-problem PSB practice set for Week ${week} ${dayPlan.day}. Theme: ${dayPlan.topic}. Structure: 5 concept builders, 3 pattern-integration problems, 2 ISI past-year or ISI-style problems. Pattern: ${dayPlan.pattern}. Variations to include: ${dayPlan.variations}. Mode: ${dayPlan.intensity}.${resource} After solving, write a short correction note for every missed setup, wrong statistic, algebra slip, or unsupported conclusion.`;
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
    id: "user-priyanka",
    name: "priyanka",
    email: "priyankakatoch95@gmail.com",
    accountTypeId: "gate-da-platinum",
    planVariant: "Platinum",
    tempPassword: "l!pschitz",
    password: "l!pschitz",
    mustChangePassword: false,
    passwordStatus: "Prototype login enabled",
    registeredAt: new Date().toISOString()
  };
}

function platinumDemoUser() {
  return {
    ...defaultUser(),
    name: "platinum-demo",
    email: "platinum.demo@aleph.local",
    accountTypeId: "gate-da-platinum",
    planVariant: "Platinum",
    tempPassword: "platinum!demo",
    password: "platinum!demo"
  };
}

function platinumAccountUser() {
  return {
    ...defaultUser(),
    id: "user-platinum-demo",
    name: "platinum",
    displayName: "Priyanka Platinum",
    email: "platinum@aleph.local",
    accountTypeId: "gate-da-platinum",
    planVariant: "Platinum",
    tempPassword: "platinum",
    password: "platinum",
    passwordStatus: "GATE DA Platinum seeded prototype login"
  };
}

function reviewerUser() {
  return {
    ...defaultUser(),
    id: "user-reviewer",
    name: "reviewer",
    email: "reviewer@aleph.local",
    tempPassword: "reviewer",
    password: "reviewer",
    passwordStatus: "Platinum reviewer prototype login"
  };
}

function basicGateDaUser() {
  return {
    id: "user-basic-demo",
    name: "basic",
    email: "basic.demo@aleph.local",
    accountTypeId: "gate-da-basic",
    planVariant: "Basic",
    tempPassword: "basic",
    password: "basic",
    mustChangePassword: false,
    passwordStatus: "GATE DA Basic prototype login",
    registeredAt: new Date().toISOString()
  };
}

function seededPrototypeUsers() {
  const basic = basicGateDaUser();
  return [
    defaultUser(),
    basic,
    platinumAccountUser(),
    platinumDemoUser(),
    reviewerUser(),
    {
      ...basic,
      name: "gate-basic",
      tempPassword: "basic!gate",
      password: "basic!gate"
    }
  ];
}

function normalizeSeededUser(user) {
  if (!user?.name) return defaultUser();
  const seededUser = seededPrototypeUsers().find((entry) => entry.name === user.name);
  return seededUser ? { ...seededUser } : user;
}

function isSeededPrototypeUser(user) {
  return Boolean(user?.name && seededPrototypeUsers().some((entry) => entry.name === user.name));
}

function prototypeUsers() {
  const seededUsers = [
    ...seededPrototypeUsers()
  ];
  if (!state?.user?.name || !state.user.password) {
    return seededUsers;
  }
  const matchingIndex = seededUsers.findIndex((user) => user.name === state.user.name);
  if (matchingIndex === -1) {
    return [...seededUsers, state.user];
  }
  return seededUsers;
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function enforceActivePlanIntegrity() {
  if (!isPlatinumPrototypeUser(state.user)) return;
  const probabilitySubject = state.subjects.find((subject) => subject.id === "subject-probability-statistics");
  const hasBasicProbabilitySubject = state.subjects.some((subject) =>
    subject.id === "subject-gate-da-probability" || subject.sectionIds?.length
  );
  const hasBasicSections = Boolean(state.gateDaSections?.length);
  const missingPatternWorkspace = !probabilitySubject?.patternWorkspaces?.length;

  if (!hasBasicProbabilitySubject && !hasBasicSections && !missingPatternWorkspace) return;

  const canonicalUser = normalizeSeededUser(state.user);
  Object.assign(state, buildPriyankaPlatinumPlan(
    new Date().toISOString(),
    accountTypeCatalog(new Date().toISOString()),
    [],
    canonicalUser
  ), {
    user: canonicalUser,
    quizAttempts: state.quizAttempts || [],
    patternSubmissions: state.patternSubmissions || []
  });
  persist();
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
  const matchedUser = prototypeUsers().find((user) => {
    if (user.name !== name) return false;
    if (user.name === "reviewer") return true;
    return password === (user.password || user.tempPassword);
  });

  if (matchedUser) {
    Object.assign(state, buildCoursePlan(matchedUser), {
      user: { ...matchedUser }
    });
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

function applyDemoLogin() {
  const demoName = new URLSearchParams(window.location.search).get("demo")?.trim().toLowerCase();
  if (!demoName) return;
  if (demoName !== "reviewer") return;
  const matchedUser = prototypeUsers().find((user) => user.name === demoName);
  if (!matchedUser) return;
  Object.assign(state, buildCoursePlan(matchedUser), {
    user: { ...matchedUser }
  });
  sessionStorage.setItem(SESSION_KEY, matchedUser.name);
  window.history.replaceState({}, document.title, window.location.pathname);
}

function signup(event) {
  event.preventDefault();
  const nameInput = document.querySelector("#signup-name");
  const emailInput = document.querySelector("#signup-email");
  const passwordInput = document.querySelector("#signup-password");
  const error = document.querySelector("#signup-error");
  const displayName = nameInput.value.trim();
  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;
  const username = slugify(email.split("@")[0] || displayName);

  if (prototypeUsers().some((user) => user.name === username)) {
    error.textContent = "An account with this email prefix already exists. Use sign in or choose a different email.";
    return;
  }

  const trialUser = {
    id: `user-${username}-${Date.now()}`,
    name: username,
    displayName,
    email,
    accountTypeId: "gate-da-basic",
    planVariant: "Basic",
    tempPassword: password,
    password,
    mustChangePassword: false,
    passwordStatus: "GATE DA Basic one-week trial",
    registeredAt: new Date().toISOString(),
    trialStartedAt: new Date().toISOString().slice(0, 10),
    trialEndsAt: addDays(new Date().toISOString().slice(0, 10), 7)
  };

  Object.assign(state, buildCoursePlan(trialUser), {
    user: trialUser
  });
  persist();
  sessionStorage.setItem(SESSION_KEY, trialUser.name);
  error.textContent = "";
  document.querySelector("#signup-form").reset();
  render();
  applyAuthState();
  showView("plans");
}

function changePassword(event) {
  event.preventDefault();
  const name = document.querySelector("#change-name").value.trim();
  const currentPassword = document.querySelector("#current-password").value;
  const password = document.querySelector("#new-password").value;
  const confirmation = document.querySelector("#confirm-password").value;
  const error = document.querySelector("#password-error");
  const matchedUser = prototypeUsers().find((user) => user.name === name);
  const storedPassword = matchedUser?.password || matchedUser?.tempPassword;
  const validationError = validateNewPassword(password, confirmation, matchedUser?.tempPassword);

  if (!matchedUser || currentPassword !== storedPassword) {
    error.textContent = "Username or current password is incorrect.";
    return;
  }

  if (validationError) {
    error.textContent = validationError;
    return;
  }

  const updatedUser = {
    ...matchedUser,
    password,
    mustChangePassword: false,
    passwordStatus: "Password changed"
  };
  Object.assign(state, buildCoursePlan(updatedUser), {
    user: updatedUser
  });
  persist();
  sessionStorage.setItem(SESSION_KEY, updatedUser.name);
  error.textContent = "";
  document.querySelector("#password-change-form").reset();
  render();
  applyAuthState();
}

function resetForgottenPassword(event) {
  event.preventDefault();
  const identifier = document.querySelector("#forgot-identifier").value.trim().toLowerCase();
  const password = document.querySelector("#forgot-new-password").value;
  const confirmation = document.querySelector("#forgot-confirm-password").value;
  const error = document.querySelector("#forgot-password-error");
  const matchedUser = prototypeUsers().find((user) =>
    user.name === identifier || (user.email || "").toLowerCase() === identifier
  );
  const validationError = validateNewPassword(password, confirmation, matchedUser?.tempPassword);

  if (!matchedUser) {
    error.textContent = "No account matches that username or email.";
    return;
  }

  if (validationError) {
    error.textContent = validationError;
    return;
  }

  const updatedUser = {
    ...matchedUser,
    password,
    mustChangePassword: false,
    passwordStatus: "Password reset"
  };
  Object.assign(state, buildCoursePlan(updatedUser), {
    user: updatedUser
  });
  persist();
  sessionStorage.setItem(SESSION_KEY, updatedUser.name);
  error.textContent = "";
  document.querySelector("#forgot-password-form").reset();
  render();
  applyAuthState();
}

function validateNewPassword(password, confirmation, temporaryPassword = "") {
  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }

  if (password !== confirmation) {
    return "Passwords do not match.";
  }

  if (temporaryPassword && password === temporaryPassword) {
    return "Choose a password different from the temporary password.";
  }

  return "";
}

function showPasswordChange() {
  document.querySelector("#login-form").classList.add("hidden");
  document.querySelector("#signup-form").classList.remove("active");
  document.querySelector("#forgot-password-form").classList.remove("active");
  document.querySelector("#password-change-form").classList.add("active");
  document.querySelector("#change-name").value = document.querySelector("#login-name").value.trim() || state.user.name;
}

function showSignup() {
  document.querySelector("#login-form").classList.add("hidden");
  document.querySelector("#password-change-form").classList.remove("active");
  document.querySelector("#forgot-password-form").classList.remove("active");
  document.querySelector("#signup-form").classList.add("active");
  document.querySelector("#signup-error").textContent = "";
}

function showForgotPassword() {
  document.querySelector("#login-form").classList.add("hidden");
  document.querySelector("#signup-form").classList.remove("active");
  document.querySelector("#password-change-form").classList.remove("active");
  document.querySelector("#forgot-password-form").classList.add("active");
  document.querySelector("#forgot-identifier").value = document.querySelector("#login-name").value.trim();
  document.querySelector("#forgot-password-error").textContent = "";
}

function showLogin() {
  document.querySelector("#password-change-form").classList.remove("active");
  document.querySelector("#signup-form").classList.remove("active");
  document.querySelector("#forgot-password-form").classList.remove("active");
  document.querySelector("#login-form").classList.remove("hidden");
  document.querySelector("#password-error").textContent = "";
  document.querySelector("#signup-error").textContent = "";
  document.querySelector("#forgot-password-error").textContent = "";
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
  document.querySelector("#signup-form").classList.toggle("active", false);
  document.querySelector("#forgot-password-form").classList.toggle("active", false);
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
  const section = activeGateDaSections().find((entry) => entry.id === test?.sectionId);
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
    "mutual-exclusivity": "mutual exclusivity",
    variance: "variance",
    "standard-deviation": "standard deviation",
    "second-moment": "second moments",
    transformation: "transformations",
    bernoulli: "Bernoulli variance",
    binomial: "binomial variance",
    independence: "independence",
    geometric: "geometric variance",
    convention: "distribution conventions",
    hypergeometric: "hypergeometric variance",
    dependence: "dependence",
    uniform: "uniform variance",
    chebyshev: "Chebyshev bounds",
    markov: "Markov bounds",
    chernoff: "Chernoff bounds",
    "tail-bound": "tail bounds",
    "joint-distribution": "joint distributions",
    "joint-pmf": "joint PMFs",
    "joint-pdf": "joint PDFs",
    marginal: "marginal distributions",
    "conditional-distribution": "conditional distributions",
    "support-region": "support regions",
    cdf: "CDF methods",
    "joint-versus-marginal": "joint versus marginal information",
    "product-expectation": "product expectations",
    covariance: "covariance",
    correlation: "correlation",
    "variance-of-sums": "variance of sums",
    "zero-covariance": "zero covariance",
    "indicator-covariance": "indicator covariance",
    "linear-relationship": "linear relationships",
    interpretation: "interpretation",
    "dependent-counts": "dependent counts",
    "conditional-expectation-value": "conditional expectation at a value",
    "conditional-expectation-random-variable": "conditional expectation as a random variable",
    "tower-property": "tower property",
    "total-expectation": "total expectation",
    "conditional-variance": "conditional variance",
    "total-variance": "total variance",
    prediction: "prediction",
    "fair-game": "fair-game intuition",
    recognition: "concept recognition",
    exponential: "exponential distribution",
    memorylessness: "memorylessness",
    poisson: "Poisson distribution",
    gamma: "gamma distribution",
    normal: "normal distribution",
    "standard-normal": "standard normal",
    "order-statistics": "order statistics",
    "poisson-process": "Poisson process",
    beta: "beta distribution",
    "uniform-spacings": "uniform spacings",
    multinomial: "multinomial counts",
    "exponential-family": "exponential family",
    "standard-error": "standard error",
    "law-of-large-numbers": "law of large numbers",
    "central-limit-theorem": "central limit theorem",
    "clt-for-averages": "CLT for averages",
    "normal-approximation": "normal approximation",
    binomial: "binomial distribution",
    "continuity-correction": "continuity correction",
    "poisson-approximation": "Poisson approximation",
    "approximation-diagnostics": "approximation diagnostics",
    "method-choice": "method choice",
    "exact-probability": "exact probability",
    "sample-proportion": "sample proportions",
    "hypothesis-setup": "hypothesis setup",
    "null-hypothesis": "null hypotheses",
    "alternative-hypothesis": "alternative hypotheses",
    "significance-level": "significance levels",
    "test-statistic": "test statistics",
    "rejection-region": "rejection regions",
    "p-value": "p-values",
    power: "power",
    "wald-interval": "Wald intervals",
    "score-method": "score methods",
    "proportion-test": "proportion tests",
    "z-test": "z-tests",
    "t-test": "t-tests",
    "unknown-sigma": "unknown sigma",
    "paired-t-test": "paired t-tests",
    "test-choice": "test choice",
    "chi-squared-distribution": "chi-squared distribution",
    "chi-squared-goodness-of-fit": "chi-squared goodness-of-fit",
    "chi-squared-independence": "chi-squared independence",
    "expected-counts": "expected counts",
    "confidence-interval": "confidence intervals",
    "hypothesis-test": "hypothesis tests",
    "sample-size": "sample size"
  };
  return labels[tag] || tag;
}

function collectionFor(type) {
  if (type === "subject") return activeSubjects();
  return type === "test" ? state.tests : state[`${type}s`] || state[type];
}

function render() {
  enforceActivePlanIntegrity();
  const subjects = activeSubjects();
  const isBasicPlan = isBasicPrototypeUser(state.user);
  const planLabel = isBasicPlan ? "Basic" : "Platinum";
  document.querySelector("#seed-btn").textContent = `Load ${planLabel} plan`;
  document.querySelector("#reset-plan-btn").textContent = `Reset ${planLabel} data`;
  document.querySelector("#subjects-panel-title").textContent = `GATE DA ${planLabel} Subjects`;
  document.querySelector("#subjects-panel-copy").textContent = isBasicPlan
    ? "Open a subject to read its textbook chapters and practice sets."
    : "Open a subject to work through Priyanka's pattern workspaces and weekly material.";
  document.querySelector("#build-stamp").textContent = `Build ${COURSE_PLAN_VERSION}`;
  document.querySelector("#learner-subtitle").textContent = `Learner: ${state.user.name}`;
  document.querySelector("#subject-count").textContent = subjects.length;
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
  const subjects = activeSubjects();
  if (!subjects.length) {
    container.innerHTML = '<div class="empty">No subjects are available for this plan yet.</div>';
    return;
  }

  const selectedSubject = subjects.find((subject) => subject.id === selectedSubjectId);
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
    container.querySelectorAll("[data-solution-upload]").forEach((input) => {
      input.addEventListener("change", () => savePatternSolutionUpload(input));
    });
    container.querySelectorAll("[data-save-pattern-feedback]").forEach((button) => {
      button.addEventListener("click", () => savePatternFeedback(button));
    });
    return;
  }

  container.innerHTML = `
    <div class="subject-menu">
      ${subjects.map(subjectMenuCardTemplate).join("")}
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
  const section = activeGateDaSections().find((entry) => entry.id === test?.sectionId);
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
  const patternCount = (subject.patternWorkspaces || []).length;
  const materialCount = (subject.materialWorkspaces || []).reduce((count, workspace) => count + (workspace.weeks || []).length, 0);
  const countLabel = patternCount
    ? `${patternCount} patterns`
    : materialCount
      ? `${materialCount} material${materialCount === 1 ? "" : "s"}`
      : `${chapterCount} chapter${chapterCount === 1 ? "" : "s"}`;
  return `
    <article class="subject-menu-card">
      <div>
        <h4>${escapeHtml(subject.title)}</h4>
        <p>${escapeHtml(subject.details || "No subject details added.")}</p>
      </div>
      <div class="subject-menu-footer">
        <span class="tag">${countLabel}</span>
        <button class="primary-btn" data-open-subject="${subject.id}" type="button">Open subject</button>
      </div>
    </article>
  `;
}

function subjectReaderTemplate(subject) {
  if (subject.patternWorkspaces?.length) {
    return subjectPatternWorkspaceTemplate(subject);
  }
  if (subject.materialWorkspaces?.length) {
    return subjectMaterialWorkspaceTemplate(subject);
  }

  const sections = (subject.sectionIds || [])
    .map((sectionId) => activeGateDaSections().find((section) => section.id === sectionId))
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

function subjectPatternWorkspaceTemplate(subject) {
  return `
    <article class="subject-reader pattern-workspace">
      <div class="subject-reader-header">
        <button class="text-btn" data-subject-back type="button">Back to subjects</button>
      </div>
      <section class="chapter-menu">
        <div class="chapter-menu-header">
          <p class="eyebrow">${escapeHtml(subject.title)} pattern workspace</p>
          <h4>Recurring PSB Patterns</h4>
          <p>${escapeHtml(subject.details || "Choose a pattern to work through weekly material, submit solutions, and record feedback.")}</p>
        </div>
        <div class="pattern-grid">
          ${subject.patternWorkspaces.map(patternWorkspaceTemplate).join("")}
        </div>
      </section>
    </article>
  `;
}

function subjectMaterialWorkspaceTemplate(subject) {
  return `
    <article class="subject-reader pattern-workspace">
      <div class="subject-reader-header">
        <button class="text-btn" data-subject-back type="button">Back to subjects</button>
      </div>
      <section class="chapter-menu">
        <div class="chapter-menu-header">
          <p class="eyebrow">${escapeHtml(subject.title)} material workspace</p>
          <h4>Weekly Materials</h4>
          <p>${escapeHtml(subject.details || "Choose a week to work through material, submit solutions, and record feedback.")}</p>
        </div>
        <div class="pattern-grid">
          ${subject.materialWorkspaces.map(materialWorkspaceTemplate).join("")}
        </div>
      </section>
    </article>
  `;
}

function patternWorkspaceTemplate(pattern) {
  return `
    <article class="pattern-card">
      <div class="pattern-card-header">
        <div>
          <p class="eyebrow">${escapeHtml(pattern.day)}</p>
          <h5>${escapeHtml(pattern.title)}</h5>
          <p>${escapeHtml(pattern.focus)}</p>
        </div>
        <span class="tag">${pattern.weeks.length} week${pattern.weeks.length === 1 ? "" : "s"}</span>
      </div>
      <div class="pattern-week-list">
        ${pattern.weeks.map((week) => patternWeekTemplate(pattern, week)).join("")}
      </div>
    </article>
  `;
}

function materialWorkspaceTemplate(workspace) {
  return `
    <article class="pattern-card">
      <div class="pattern-card-header">
        <div>
          <p class="eyebrow">${escapeHtml(workspace.day || "Material")}</p>
          <h5>${escapeHtml(workspace.title)}</h5>
          <p>${escapeHtml(workspace.focus)}</p>
        </div>
        <span class="tag">${workspace.weeks.length} material${workspace.weeks.length === 1 ? "" : "s"}</span>
      </div>
      <div class="pattern-week-list">
        ${workspace.weeks.map((week) => patternWeekTemplate(workspace, week)).join("")}
      </div>
    </article>
  `;
}

function patternWeekTemplate(pattern, week) {
  const submission = patternSubmission(week.id);
  const uploadLabel = submission?.fileName
    ? `Uploaded: ${submission.fileName}`
    : "No solution uploaded";
  return `
    <section class="pattern-week" data-material-card="${escapeHtml(week.id)}">
      <div class="pattern-week-top">
        <div>
          <strong>Week ${week.week}: ${escapeHtml(week.materialTitle)}</strong>
          <p>${formatDate(week.date)} - ${escapeHtml(week.expectedWork)}</p>
        </div>
        <span class="tag">${escapeHtml(week.status)}</span>
      </div>
      <div class="pattern-material-row">
        ${week.materialUrl
          ? `<a class="primary-btn inline-link" href="${escapeHtml(week.materialUrl)}" target="_blank" rel="noreferrer">Open material</a>`
          : '<span class="tag">Material pending</span>'}
        <label class="solution-upload">
          <span>Upload solution</span>
          <input type="file" data-solution-upload="${escapeHtml(week.id)}" accept=".pdf,.txt,.md,.png,.jpg,.jpeg">
        </label>
      </div>
      <p class="fine-print">${escapeHtml(uploadLabel)}</p>
      <label class="feedback-note">
        <span>Feedback</span>
        <textarea data-pattern-feedback rows="3" placeholder="Record review notes, score, or correction feedback.">${escapeHtml(submission?.feedback || "")}</textarea>
      </label>
      <button class="small-btn" data-save-pattern-feedback type="button">Save feedback</button>
    </section>
  `;
}

function patternSubmission(materialId) {
  return (state.patternSubmissions || []).find((entry) => entry.materialId === materialId);
}

function upsertPatternSubmission(materialId, updates) {
  if (!state.patternSubmissions) state.patternSubmissions = [];
  const existing = state.patternSubmissions.find((entry) => entry.materialId === materialId);
  if (existing) {
    Object.assign(existing, updates, { updatedAt: new Date().toISOString() });
    return existing;
  }
  const entry = {
    materialId,
    ...updates,
    updatedAt: new Date().toISOString()
  };
  state.patternSubmissions.push(entry);
  return entry;
}

function savePatternSolutionUpload(input) {
  const file = input.files?.[0];
  if (!file) return;
  upsertPatternSubmission(input.dataset.solutionUpload, {
    fileName: file.name,
    fileType: file.type || "unknown",
    uploadedAt: new Date().toISOString()
  });
  persist();
  renderSubjects();
}

function savePatternFeedback(button) {
  const card = button.closest("[data-material-card]");
  if (!card) return;
  const materialId = card.dataset.materialCard;
  const feedback = card.querySelector("[data-pattern-feedback]")?.value.trim() || "";
  upsertPatternSubmission(materialId, {
    feedback,
    feedbackUpdatedAt: new Date().toISOString()
  });
  persist();
  renderSubjects();
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
  const sections = activeGateDaSections();
  if (!sections.length) {
    const probabilitySubject = activeSubjects().find((subject) => subject.id === "subject-probability-statistics");
    const patterns = probabilitySubject?.patternWorkspaces || [];
    if (patterns.length) {
      container.innerHTML = patterns.slice(0, 3).map((pattern) => `
        <article class="item">
          <div class="item-top">
            <div>
              <h4>${escapeHtml(pattern.title)}</h4>
              <p>${escapeHtml(pattern.focus)}</p>
            </div>
            <span class="tag">${escapeHtml(pattern.day)}</span>
          </div>
        </article>
      `).join("");
      return;
    }
    container.innerHTML = '<div class="empty">No subject material seeded yet.</div>';
    return;
  }

  container.innerHTML = sections.slice(0, 3).map((section) => `
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
  const subjects = activeSubjects();
  const sections = activeGateDaSections();
  const gateDaEnrollment = state.enrollments.find((enrollment) => {
    const accountTypeId = enrollment.accountTypeId || enrollment.productId;
    return accountTypeId?.startsWith("gate-da-") && enrollment.userId === state.user.id;
  });
  const activeAccountTypeId = gateDaEnrollment?.accountTypeId || gateDaEnrollment?.productId;

  if (activeAccountTypeId === "gate-da-basic") {
    container.innerHTML = `
      <article class="item workspace-summary">
        <div class="item-top">
          <div>
            <h4>GATE DA Basic Workspace</h4>
            <p>Basic account workspace for the current GATE DA material. Use this plan to inspect Subjects -> Probability -> Chapters 1-10, practice, and objective reviews.</p>
          </div>
          <span class="tag">${escapeHtml(gateDaEnrollment.paymentStatus || "active")}</span>
        </div>
        <div class="workspace-counts">
          <span>${sections.length} chapters</span>
          <span>${sections[0]?.practiceProblems.length || 0} practice problems</span>
          <span>conceptual review</span>
          <span>worked solutions</span>
        </div>
      </article>
    `;
    return;
  }

  const lessonPlan = state.lessonPlans.find((entry) => entry.id === gateDaEnrollment?.lessonPlanId);

  container.innerHTML = `
    <article class="item workspace-summary">
      <div class="item-top">
        <div>
          <h4>GATE DA Platinum Learner Workspace</h4>
          <p>${escapeHtml(lessonPlan?.details || "Personalized GATE DA Platinum learner workspace.")}</p>
        </div>
        <span class="tag">${escapeHtml(gateDaEnrollment?.paymentStatus || "active")}</span>
      </div>
      <div class="workspace-counts">
        <span>${subjects.length} subjects</span>
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
  const sections = activeGateDaSections();
  if (!sections.length) {
    const probabilitySubject = activeSubjects().find((subject) => subject.id === "subject-probability-statistics");
    const patterns = probabilitySubject?.patternWorkspaces || [];
    if (patterns.length) {
      container.innerHTML = `
        <article class="item">
          <div class="item-top">
            <div>
              <h4>Probability and Statistics Pattern Workspace</h4>
              <p>Open Subjects -> Probability and Statistics to work through pattern -> week -> material -> solution upload -> feedback.</p>
            </div>
            <span class="tag">${patterns.length} patterns</span>
          </div>
        </article>
      `;
      return;
    }
    container.innerHTML = '<div class="empty">No GATE DA sections are available yet.</div>';
    return;
  }

  container.innerHTML = sections.map(sectionTemplate).join("");
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
      ${block.items ? `<ul class="callout-list">${block.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}
      ${block.formulas ? formulaRowsTemplate(block.formulas) : ""}
      ${block.steps ? workedStepsTemplate(block.steps) : ""}
      ${block.visual ? visualTemplate(block.visual) : ""}
    </div>
  `;
}

function formulaRowsTemplate(rows) {
  return `
    <div class="formula-list">
      ${rows.map((row) => `
        <div class="formula-row">
          <span>${escapeHtml(row.label)}</span>
          <span class="math-expr">${mathHtml(row.formula)}</span>
          ${row.note ? `<em>${escapeHtml(row.note)}</em>` : ""}
        </div>
      `).join("")}
    </div>
  `;
}

function workedStepsTemplate(steps) {
  return `
    <ol class="worked-steps">
      ${steps.map((step) => `
        <li>
          ${step.label ? `<span>${escapeHtml(step.label)}</span>` : ""}
          <div class="math-expr">${mathHtml(step.math)}</div>
          ${step.note ? `<p>${escapeHtml(step.note)}</p>` : ""}
        </li>
      `).join("")}
    </ol>
  `;
}

function visualTemplate(visual) {
  if (visual.type === "bars") return barDiagramTemplate(visual);
  if (visual.type === "area") return areaDiagramTemplate(visual);
  if (visual.type === "flow") return flowDiagramTemplate(visual);
  if (visual.type === "tail") return tailDiagramTemplate(visual);
  return "";
}

function barDiagramTemplate(visual) {
  const bars = visual.bars || [];
  const maxHeight = Math.max(...bars.map((bar) => Number(bar.height) || 1), 1);
  const chartWidth = 420;
  const chartHeight = 170;
  const leftPad = 40;
  const bottomPad = 34;
  const topPad = 16;
  const gap = 14;
  const barWidth = bars.length ? (chartWidth - leftPad - 20 - gap * (bars.length - 1)) / bars.length : 32;
  return `
    <div class="mini-diagram">
      <svg class="diagram-svg" viewBox="0 0 ${chartWidth} ${chartHeight}" role="img" aria-label="${escapeHtml(visual.caption || "Bar diagram")}">
        <line x1="${leftPad}" y1="${chartHeight - bottomPad}" x2="${chartWidth - 10}" y2="${chartHeight - bottomPad}" class="diagram-axis"></line>
        <line x1="${leftPad}" y1="${topPad}" x2="${leftPad}" y2="${chartHeight - bottomPad}" class="diagram-axis"></line>
        ${bars.map((bar, index) => {
          const height = Math.max(8, ((Number(bar.height) || 1) / maxHeight) * 105);
          const x = leftPad + 12 + index * (barWidth + gap);
          const y = chartHeight - bottomPad - height;
          return `
            <rect x="${x}" y="${y}" width="${barWidth}" height="${height}" rx="4" class="diagram-bar"></rect>
            <text x="${x + barWidth / 2}" y="${chartHeight - 11}" text-anchor="middle" class="diagram-label">${escapeHtml(bar.label)}</text>
          `;
        }).join("")}
        <text x="${leftPad - 8}" y="${topPad + 8}" text-anchor="end" class="diagram-label">chance</text>
        <text x="${chartWidth - 10}" y="${chartHeight - 11}" text-anchor="end" class="diagram-label">X</text>
      </svg>
      ${visual.caption ? `<small>${escapeHtml(visual.caption)}</small>` : ""}
    </div>
  `;
}

function areaDiagramTemplate(visual) {
  const start = Math.max(0, Number(visual.start) || 0);
  const width = Math.min(100 - start, Math.max(0, Number(visual.width) || 0));
  const x = 42 + start * 3.36;
  const w = width * 3.36;
  return `
    <div class="mini-diagram">
      <svg class="diagram-svg" viewBox="0 0 420 150" role="img" aria-label="${escapeHtml(visual.caption || "Area diagram")}">
        <line x1="42" y1="116" x2="378" y2="116" class="diagram-axis"></line>
        <rect x="42" y="42" width="336" height="74" rx="5" class="diagram-area"></rect>
        <rect x="${x}" y="42" width="${w}" height="74" rx="3" class="diagram-shade"></rect>
        <text x="42" y="136" text-anchor="middle" class="diagram-label">${escapeHtml(visual.leftLabel || "")}</text>
        <text x="378" y="136" text-anchor="middle" class="diagram-label">${escapeHtml(visual.rightLabel || "")}</text>
        <text x="210" y="29" text-anchor="middle" class="diagram-label">flat density</text>
      </svg>
      ${visual.caption ? `<small>${escapeHtml(visual.caption)}</small>` : ""}
    </div>
  `;
}

function flowDiagramTemplate(visual) {
  const steps = visual.steps || [];
  return `
    <div class="mini-diagram">
      <div class="flow-diagram" role="img" aria-label="${escapeHtml(visual.caption || "Flow diagram")}">
        ${steps.map((step) => `<span>${escapeHtml(step)}</span>`).join("")}
      </div>
      ${visual.caption ? `<small>${escapeHtml(visual.caption)}</small>` : ""}
    </div>
  `;
}

function tailDiagramTemplate(visual) {
  const levels = visual.levels || [];
  return `
    <div class="mini-diagram">
      <svg class="diagram-svg" viewBox="0 0 420 ${70 + levels.length * 34}" role="img" aria-label="${escapeHtml(visual.caption || "Tail diagram")}">
        ${levels.map((level, index) => {
          const y = 30 + index * 34;
          const width = Math.max(18, Math.min(260, (Number(level.width) || 10) * 2.6));
          return `
            <text x="22" y="${y + 5}" class="diagram-label">${escapeHtml(level.label)}</text>
            <rect x="110" y="${y - 8}" width="${width}" height="16" rx="8" class="diagram-bar"></rect>
            <text x="385" y="${y + 5}" text-anchor="end" class="diagram-label">${escapeHtml(level.value)}</text>
          `;
        }).join("")}
      </svg>
      ${visual.caption ? `<small>${escapeHtml(visual.caption)}</small>` : ""}
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
      <p>${mathHtml(problem.prompt)}</p>
      <details>
        <summary>Show solution</summary>
        <p>${mathHtml(problem.solution)}</p>
      </details>
    </article>
  `;
}

function renderEnrollments() {
  const container = document.querySelector("#enrollment-list");
  const userEnrollments = state.enrollments.filter((enrollment) => enrollment.userId === state.user.id);
  if (!userEnrollments.length) {
    container.innerHTML = '<div class="empty">No active enrollments yet.</div>';
    return;
  }

  container.innerHTML = userEnrollments.map((enrollment) => {
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
  const subjects = activeSubjects();
  if (!subjects.length) {
    container.innerHTML = '<div class="empty">No subjects have learning plans yet.</div>';
    return;
  }
  container.innerHTML = subjects
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
  Object.assign(state, buildCoursePlan(user));
  state.user = user;
  persist();
  render();
}

function resetPlanData() {
  const user = state.user || defaultUser();
  Object.assign(state, buildCoursePlan(user), {
    user
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
      state.patternSubmissions = imported.patternSubmissions || [];
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

function mathHtml(value) {
  let html = escapeHtml(value);

  const replacements = [
    [/&lt;=/g, "&le;"],
    [/&gt;=/g, "&ge;"],
    [/!=/g, "&ne;"],
    [/\.\.\./g, "&hellip;"],
    [/\+ &hellip; \+/g, "+ &ctdot; +"],
    [/-&gt;/g, "&rarr;"],
    [/\+\/-/g, "&plusmn;"],
    [/\bapproximately\b/g, "&asymp;"],
    [/\bimplies\b/g, "&rArr;"],
    [/\bsqrt(?=\()/g, "&radic;"],
    [/\binfinity\b/g, "&infin;"],
    [/\bnot equal\b/g, "&ne;"],
    [/\bless than or equal\b/g, "&le;"],
    [/\bgreater than or equal\b/g, "&ge;"],
    [/\bchi-square(?=_|\b)/g, "@@CHI@@<sup>2</sup>"],
    [/\bP_mu=([0-9.]+)/g, "P<sub>@@MU@@=$1</sub>"],
    [/\bP_mu\b/g, "P<sub>@@MU@@</sub>"],
    [/\bmu0\b/g, "@@MU@@<sub>0</sub>"],
    [/\bphat\b/g, "<span class=\"math-hat\">p</span>"],
    [/\bXbar\b/g, "<span class=\"math-overline\">X</span>"],
    [/\bDbar\b/g, "<span class=\"math-overline\">D</span>"],
    [/\bH0\b/g, "H<sub>0</sub>"],
    [/\bH1\b/g, "H<sub>1</sub>"],
    [/\bp0\b/g, "p<sub>0</sub>"],
    [/\bz\*/g, "z<sup>*</sup>"],
    [/\bZ\*/g, "Z<sup>*</sup>"],
    [/\bPhi\b/g, "@@PHI@@"],
    [/\balpha\b/g, "@@ALPHA@@"],
    [/\bepsilon\b/g, "@@EPSILON@@"],
    [/\blambda\b/g, "@@LAMBDA@@"],
    [/\bsigma\b/g, "@@SIGMA@@"],
    [/\bmu\b/g, "@@MU@@"],
    [/\bN\(0,1\)/g, "N(0, 1)"],
    [/\bN\(([^)]+)\)/g, "N($1)"],
    [/\bdf\b/g, "df"],
    [/\bsum\b/g, "@@SUM@@"],
    [/\bintegral\b/g, "@@INTEGRAL@@"],
    [/ x /g, " &times; "]
  ];

  replacements.forEach(([pattern, replacement]) => {
    html = html.replace(pattern, replacement);
  });

  html = html.replace(/_\(([^)]+)\)|_\{([^}]+)\}|_([A-Za-z0-9.+-]+)/g, (_, paren, braced, simple) => {
    const subscript = paren || braced || simple || "";
    return `<sub>${subscript}</sub>`;
  });
  html = html.replace(/\^(\([^)]+\)|[A-Za-z0-9.]+)/g, (_, exponent) => `<sup>${exponent.replace(/^\((.*)\)$/, "$1")}</sup>`);

  html = html
    .replaceAll("@@ALPHA@@", "&alpha;")
    .replaceAll("@@CHI@@", "&chi;")
    .replaceAll("@@EPSILON@@", "&epsilon;")
    .replaceAll("@@INTEGRAL@@", "&int;")
    .replaceAll("@@LAMBDA@@", "&lambda;")
    .replaceAll("@@MU@@", "&mu;")
    .replaceAll("@@PHI@@", "&Phi;")
    .replaceAll("@@SIGMA@@", "&sigma;")
    .replaceAll("@@SUM@@", "&Sigma;");
  return html;
}
