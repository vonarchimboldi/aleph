import {
  loadPlatinumProgressSnapshot,
  platinumProgressStoreStatus,
  saveLastWeeklyCheck
} from "../_platinum-progress-store.js";

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && request.headers.authorization !== `Bearer ${cronSecret}`) {
    return response.status(401).json({ error: "Unauthorized cron request" });
  }

  const snapshot = await loadPlatinumProgressSnapshot();
  if (!snapshot) {
    const result = {
      ok: true,
      status: "no_snapshot",
      message: "No Platinum progress snapshot has been synced yet.",
      checkedAt: new Date().toISOString(),
      store: platinumProgressStoreStatus()
    };
    await saveLastWeeklyCheck(result);
    return response.status(200).json(result);
  }

  const report = buildWeeklyReport(snapshot);
  const emailResult = await maybeSendWeeklyEmail(snapshot, report);
  const result = {
    ok: true,
    checkedAt: new Date().toISOString(),
    store: platinumProgressStoreStatus(),
    report,
    email: emailResult
  };
  await saveLastWeeklyCheck(result);
  return response.status(200).json(result);
}

function buildWeeklyReport(snapshot) {
  const pace = snapshot.pace || {};
  const dueTasks = snapshot.tasks?.due || [];
  const overdueTasks = dueTasks.filter((task) => task.dueState === "overdue");
  const dueTodayTasks = dueTasks.filter((task) => task.dueState === "due-today");
  const incompleteDueTasks = dueTasks.filter((task) => task.status !== "completed");
  const materialsDue = snapshot.materials?.due || [];
  const missingSubmissions = materialsDue.filter((material) => !material.submitted);
  const missingFeedback = materialsDue.filter((material) => material.submitted && !material.feedbackReady);
  const feedbackReady = materialsDue.filter((material) => material.feedbackReady);
  const latestFeedback = feedbackReady
    .slice()
    .sort((a, b) => (b.feedbackUpdatedAt || "").localeCompare(a.feedbackUpdatedAt || ""))
    .slice(0, 5);
  const severeFeedback = feedbackReady.filter((material) => {
    const verdict = String(material.feedbackVerdict || "").toLowerCase();
    return verdict.includes("revise") || verdict.includes("weak") || verdict.includes("incomplete");
  });

  const alerts = [];
  if (overdueTasks.length) alerts.push(`${overdueTasks.length} overdue task(s)`);
  if (missingSubmissions.length) alerts.push(`${missingSubmissions.length} missing submission(s)`);
  if (missingFeedback.length) alerts.push(`${missingFeedback.length} submitted item(s) waiting for feedback`);
  if (severeFeedback.length) alerts.push(`${severeFeedback.length} feedback item(s) need revision`);

  const status = alerts.length || pace.statusLabel === "Behind plan" || pace.statusLabel === "At risk"
    ? "action_needed"
    : "on_pace";

  return {
    status,
    statusLabel: status === "on_pace" ? "On pace" : "Action needed",
    currentWeek: pace.currentWeek || snapshot.currentWeek,
    completionRate: pace.completionRate ?? 100,
    expectedTaskCount: pace.expectedCount || dueTasks.length,
    completedExpectedTaskCount: pace.completedExpectedCount || dueTasks.filter((task) => task.status === "completed").length,
    overdueCount: overdueTasks.length,
    dueTodayCount: dueTodayTasks.length,
    incompleteDueTaskCount: incompleteDueTasks.length,
    materialDueCount: materialsDue.length,
    submittedMaterialCount: materialsDue.filter((material) => material.submitted).length,
    feedbackReadyCount: feedbackReady.length,
    missingSubmissionCount: missingSubmissions.length,
    missingFeedbackCount: missingFeedback.length,
    severeFeedbackCount: severeFeedback.length,
    alerts,
    nextTasks: incompleteDueTasks.slice(0, 8),
    missingSubmissions: missingSubmissions.slice(0, 8),
    missingFeedback: missingFeedback.slice(0, 8),
    latestFeedback
  };
}

async function maybeSendWeeklyEmail(snapshot, report) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.FROM_EMAIL;
  const monitorEmail = process.env.PLATINUM_MONITOR_EMAIL;
  const learnerEmail = snapshot.user?.email;
  const to = monitorEmail || learnerEmail;

  if (!apiKey || !from || !to) {
    return {
      sent: false,
      reason: !to ? "missing_recipient" : "email_not_configured"
    };
  }

  if (!monitorEmail && report.status === "on_pace") {
    return {
      sent: false,
      reason: "on_pace_without_monitor_recipient"
    };
  }

  const learnerName = snapshot.user?.displayName || snapshot.user?.name || "Learner";
  const text = weeklyEmailText(learnerName, snapshot, report);
  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to,
      subject: `Aleph Platinum weekly check: ${report.statusLabel}`,
      text
    })
  });

  if (!resendResponse.ok) {
    const details = await resendResponse.text();
    return {
      sent: false,
      reason: "provider_rejected",
      details
    };
  }

  const result = await resendResponse.json();
  return {
    sent: true,
    id: result.id,
    to
  };
}

function weeklyEmailText(learnerName, snapshot, report) {
  const lines = [
    `Weekly Platinum check for ${learnerName}`,
    "",
    `Status: ${report.statusLabel}`,
    `Week: ${report.currentWeek || "current"}`,
    `Task completion: ${report.completedExpectedTaskCount}/${report.expectedTaskCount} due tasks (${report.completionRate}%).`,
    `Open due work: ${report.overdueCount} overdue, ${report.dueTodayCount} due today.`,
    `Materials: ${report.submittedMaterialCount}/${report.materialDueCount} due materials submitted; ${report.feedbackReadyCount} have feedback.`,
    ""
  ];

  if (report.alerts.length) {
    lines.push("Alerts:", ...report.alerts.map((alert) => `- ${alert}`), "");
  }

  if (report.nextTasks.length) {
    lines.push("Next task recovery:", ...report.nextTasks.map((task) => `- ${task.title} (${task.type || "Task"}, due ${task.dueDate || "date not set"})`), "");
  }

  if (report.missingSubmissions.length) {
    lines.push("Missing submissions:", ...report.missingSubmissions.map((item) => `- ${item.materialTitle} (${item.date || "date not set"})`), "");
  }

  if (report.missingFeedback.length) {
    lines.push("Submitted, waiting for feedback:", ...report.missingFeedback.map((item) => `- ${item.materialTitle} (${item.date || "date not set"})`), "");
  }

  if (report.latestFeedback.length) {
    lines.push(
      "Latest feedback:",
      ...report.latestFeedback.map((item) => `- ${item.materialTitle}: ${item.feedbackSummary || "Feedback recorded."}`),
      ""
    );
  }

  lines.push(`Snapshot synced: ${snapshot.syncedAt || "unknown"}`, "Aleph");
  return lines.join("\n");
}
