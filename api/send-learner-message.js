const MAX_SUBJECT_LENGTH = 160;
const MAX_MESSAGE_LENGTH = 12000;

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

  const { email, subject, message } = request.body || {};
  const recipient = String(email || "").trim();
  const emailSubject = String(subject || "").trim().slice(0, MAX_SUBJECT_LENGTH);
  const text = String(message || "").trim().slice(0, MAX_MESSAGE_LENGTH);
  if (!recipient || !emailSubject || !text) {
    return response.status(400).json({ error: "Missing learner message fields" });
  }

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: recipient,
      subject: emailSubject,
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
