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

  const { email, name, username, temporaryPassword, appUrl } = request.body || {};

  if (!email || !username || !temporaryPassword) {
    return response.status(400).json({ error: "Missing required email fields" });
  }

  const learnerName = name || username;
  const loginUrl = appUrl || "https://aleph-five.vercel.app/";
  const text = [
    `Hi ${learnerName},`,
    "",
    "Your Aleph learning workspace is ready.",
    "",
    `Open: ${loginUrl}`,
    "",
    "Sign in with:",
    `Username: ${username}`,
    `Temporary password: ${temporaryPassword}`,
    "",
    "Please keep these credentials private.",
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
      subject: "Your Aleph learning workspace login",
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
