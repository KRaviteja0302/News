type AdvertiserLoginEmail = {
  name: string;
  email: string;
  password: string;
};

const escapeHtml = (value: string) =>
  value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character]!);

export async function sendAdvertiserLoginEmail({
  name,
  email,
  password,
}: AdvertiserLoginEmail) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const siteUrl = (
    process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL
  )?.replace(/\/$/, "");

  if (!apiKey || !from || !siteUrl) {
    return { sent: false, reason: "not-configured" } as const;
  }

  const loginUrl = `${siteUrl}/advertiser/login`;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Your advertisement CMS login",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#173244">
          <h1 style="font-size:26px">Your advertisement is approved</h1>
          <p>Hello ${escapeHtml(name)},</p>
          <p>Your advertisement subscription has been approved. Use these details to manage your advertisement:</p>
          <div style="background:#f3f7f8;padding:18px;border-radius:10px;line-height:1.8">
            <strong>Username:</strong> ${escapeHtml(email)}<br>
            <strong>Temporary password:</strong> ${escapeHtml(password)}
          </div>
          <p style="margin:24px 0">
            <a href="${loginUrl}" style="background:#0878b7;color:white;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:bold">Open advertiser login</a>
          </p>
          <p style="font-size:13px;color:#687984">Advertiser login URL: ${loginUrl}</p>
          <p style="font-size:13px;color:#687984">For security, please sign in and change your temporary password.</p>
        </div>`,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    console.error("Advertiser login email failed:", response.status, details);
    return { sent: false, reason: "provider-error" } as const;
  }

  return { sent: true } as const;
}
