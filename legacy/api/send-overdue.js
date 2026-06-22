export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.FROM_EMAIL;

  if (!apiKey || !from) {
    return response.status(501).json({ error: "Email service is not configured" });
  }

  const { email, name, overdueItems, appUrl } = request.body || {};

  if (!email || !Array.isArray(overdueItems) || !overdueItems.length) {
    return response.status(400).json({ error: "Missing overdue reminder fields" });
  }

  const learnerName = name || "Learner";
  const workspaceUrl = appUrl || "https://aleph-alpha.io/";
  const itemLines = overdueItems
    .slice(0, 12)
    .map((item) => {
      const type = item.type || "Task";
      const dueDate = item.dueDate || "date not set";
      return `- ${item.title} (${type}, due ${dueDate})`;
    });
  const text = [
    `Hi ${learnerName},`,
    "",
    "These Aleph tasks are overdue:",
    "",
    ...itemLines,
    "",
    `Open your workspace: ${workspaceUrl}`,
    "",
    "Aleph"
  ].join("\n");

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: email,
      subject: "Aleph overdue task reminder",
      text
    })
  });

  if (!resendResponse.ok) {
    const details = await resendResponse.text();
    return response.status(502).json({ error: "Email provider rejected the request", details });
  }

  const result = await resendResponse.json();
  return response.status(200).json({ id: result.id });
}
