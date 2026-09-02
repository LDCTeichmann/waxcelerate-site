// Shared Resend helper, extracted from api/widerruf.ts (the first consumer)
// so api/rewax-request.ts doesn't have to re-copy the same fetch call.

// Fields interpolated into email HTML must be escaped first — a submitted
// form value could otherwise inject markup into the message Luca reads.
export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

// Returns whether the email actually sent, so callers can log a loud,
// distinguishable alert when the notice to the owner specifically fails —
// a missing/misconfigured RESEND_API_KEY should never fail silently for a
// notification the owner is depending on to act.
export async function sendEmail(to: string, subject: string, html: string, logTag: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error(`[${logTag}] RESEND_API_KEY not set — email not sent`, { to, subject });
    return false;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Waxcelerate <widerruf@waxcelerate.de>',
      to: [to],
      subject,
      html,
    }),
  });
  if (!res.ok) {
    console.error(`[${logTag}] Resend API error`, await res.text());
    return false;
  }
  return true;
}
