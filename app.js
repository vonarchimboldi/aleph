const STORAGE_KEY = "learning-studio-data-v1";
const SESSION_KEY = "aleph-session";
const COURSE_PLAN_VERSION = "product-catalog-priyanka-plan-v1";

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
  plans: "Plans",
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
    if (typeof user.mustChangePassword !== "boolean") {
      user.mustChangePassword = user.password === user.tempPassword;
    }
    return {
      user,
      subjects: parsed.subjects?.length ? parsed.subjects : starter.subjects,
      schedule: parsed.schedule?.length ? parsed.schedule : starter.schedule,
      tests: parsed.tests || [],
      feedback: parsed.feedback || [],
      resources: parsed.resources || [],
      tasks: parsed.tasks || [],
      products: parsed.products?.length ? parsed.products : starter.products,
      enrollments: parsed.enrollments?.length ? parsed.enrollments : starter.enrollments,
      lessonPlans: parsed.lessonPlans?.length ? parsed.lessonPlans : starter.lessonPlans,
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
  const products = productCatalog(now);
  const lessonPlans = [
    {
      id: "lesson-priyanka-custom",
      userId: "user-priyanka",
      title: "Priyanka personalized lesson plan",
      type: "personalized",
      subjects: ["Discrete Mathematics", "Data Structures and Algorithms"],
      startDate: "2026-06-01",
      endDate: "2026-08-30",
      status: "active",
      details: "Personalized June-August plan. This is separate from the public exam prep catalog.",
      updatedAt: now
    }
  ];
  const enrollments = [
    {
      id: "enrollment-priyanka-custom",
      userId: "user-priyanka",
      productId: "custom-personalized",
      planVariant: "Personalized lesson plan",
      paymentStatus: "active",
      lessonPlanId: "lesson-priyanka-custom",
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
      details: "Learning plan: descriptive statistics, probability rules, random variables, distributions, expectation, variance, sampling, estimation, hypothesis testing, and applied review.",
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
    }
  ];

  const schedule = [];
  const tests = [];
  const tasks = [];
  plans.forEach((plan) => {
    plan.milestones.forEach((milestone, index) => {
      const week = index + 1;
      const monday = addDays("2026-06-01", index * 7);
      const sunday = addDays(monday, 6);
      const spaced = spacedReviewDetails(week, plan.milestones, plan.label);
      const weekWindow = `${formatShortDate(monday)}-${formatShortDate(sunday)}`;

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
    products,
    enrollments,
    lessonPlans,
    feedback: [
      {
        id: crypto.randomUUID(),
        title: "Discrete Math and DSA 13-week plans created",
        date: "2026-06-01",
        details: "13-week plans map Discrete Math and Data Structures and Algorithms into weekly milestones with one Sunday combined review quiz and every-other-week cumulative spaced review per subject.",
        updatedAt: now
      }
    ],
    resources: [
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
      }
    ],
    coursePlanVersion: COURSE_PLAN_VERSION
  };
}

function productCatalog(updatedAt = new Date().toISOString()) {
  const variants = ["Study material + mocks", "Mocks only"];
  return [
    ["gate-da", "GATE DA", "Data science and AI entrance preparation.", variants],
    ["iit-jam-statistics", "IIT JAM Statistics", "Statistics entrance preparation with topic practice and mocks.", variants],
    ["gate-statistics", "GATE Statistics", "Statistics-focused GATE preparation.", variants],
    ["cmi-ms-data-science", "CMI MS Data Science", "CMI entrance preparation for data science.", variants],
    ["isi-msqe", "ISI MSQE", "Quantitative economics entrance preparation.", variants],
    ["dse-economics", "DSE Masters in Economics", "Delhi School of Economics masters entrance preparation.", variants],
    ["isi-mstat", "ISI MStat", "ISI MStat entrance preparation.", variants],
    ["dsa-interview", "DSA Interview Prep", "Data structures and algorithms interview preparation for coding roles.", ["Study material + mocks", "Mocks only", "Interview practice"]],
    ["hybrid-general", "Hybrid General Study + Mock Tests", "Access to general study material and mock tests across supported exams.", ["Hybrid access"]]
  ].map(([id, title, description, planVariants]) => ({
    id,
    title,
    description,
    variants: planVariants,
    status: "planned",
    updatedAt
  })).concat({
    id: "custom-personalized",
    title: "Personalized Lesson Plan",
    description: "Private learner-specific schedule, resources, tasks, reviews, and spaced review.",
    variants: ["Personalized lesson plan"],
    status: "active",
    updatedAt
  });
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

function milestoneDetails(milestone) {
  if (milestone.focs) {
    return `FOCS: ${milestone.focs} Cartesian: ${milestone.cartesian}`;
  }
  return `CMU 21-228: ${milestone.cmu} MIT 6.1200J: ${milestone.mitMcs} MIT 18.200: ${milestone.mitApplied}`;
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
    name: "priyanka",
    email: "priyankakatoch95@gmail.com",
    tempPassword: "l!pschitz",
    password: "l!pschitz",
    mustChangePassword: true,
    passwordStatus: "Temporary password set",
    registeredAt: new Date().toISOString()
  };
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
  const name = document.querySelector("#login-name").value.trim();
  const password = document.querySelector("#login-password").value;
  const error = document.querySelector("#login-error");
  const currentPassword = state.user.password || state.user.tempPassword;

  if (name === state.user.name && password === currentPassword) {
    sessionStorage.setItem(SESSION_KEY, state.user.name);
    error.textContent = "";
    document.querySelector("#login-form").reset();
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
  const signedIn = sessionStorage.getItem(SESSION_KEY) === state.user.name;
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
  document.querySelector("#plan-count").textContent = state.products.length;
  document.querySelector("#subject-count").textContent = state.subjects.length;
  document.querySelector("#task-count").textContent = state.tasks.length;
  document.querySelector("#schedule-count").textContent = state.schedule.length;
  document.querySelector("#test-count").textContent = state.tests.length;
  document.querySelector("#feedback-count").textContent = state.feedback.length;
  document.querySelector("#resource-count").textContent = state.resources.length;

  renderProfile();
  renderPlanCatalog();
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
  const container = document.querySelector("#plan-catalog-list");
  container.innerHTML = state.products.map((product) => `
    <article class="catalog-card">
      <div class="catalog-card-header">
        <h4>${escapeHtml(product.title)}</h4>
        <span class="tag">${escapeHtml(product.status)}</span>
      </div>
      <p>${escapeHtml(product.description)}</p>
      <div class="variant-list">
        ${product.variants.map((variant) => `<span>${escapeHtml(variant)}</span>`).join("")}
      </div>
    </article>
  `).join("");
}

function renderEnrollments() {
  const container = document.querySelector("#enrollment-list");
  if (!state.enrollments.length) {
    container.innerHTML = '<div class="empty">No active enrollments yet.</div>';
    return;
  }

  container.innerHTML = state.enrollments.map((enrollment) => {
    const product = state.products.find((entry) => entry.id === enrollment.productId);
    const lessonPlan = state.lessonPlans.find((entry) => entry.id === enrollment.lessonPlanId);
    return `
      <article class="item">
        <div class="item-top">
          <div>
            <h4>${escapeHtml(product?.title || "Enrollment")}</h4>
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
      state.products = imported.products || productCatalog();
      state.enrollments = imported.enrollments || [];
      state.lessonPlans = imported.lessonPlans || [];
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
