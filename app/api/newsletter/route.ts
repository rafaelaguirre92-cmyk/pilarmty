import { z } from "zod";

const payloadSchema = z.object({
  email: z.string().trim().email().max(254),
  locale: z.enum(["es", "en"]).optional().default("es"),
});

const attempts = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const windowStart = now - 10 * 60 * 1000;
  const recent = (attempts.get(ip) || []).filter((time) => time > windowStart);
  recent.push(now);
  attempts.set(ip, recent);
  return recent.length > 5;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  if (rateLimited(ip)) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  let parsed: z.infer<typeof payloadSchema>;
  try {
    parsed = payloadSchema.parse(await request.json());
  } catch {
    return Response.json({ error: "invalid_form" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from =
    process.env.CONTACT_FROM_EMAIL ||
    "Iglesia Pilar <sitio@iglesiapilar.mx>";

  if (apiKey && to) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [to],
          reply_to: parsed.email,
          subject: `Nueva suscripción al boletín — ${parsed.email}`,
          text: `Se ha suscrito una nueva persona al boletín desde el sitio web:\n\nCorreo: ${parsed.email}\nIdioma: ${parsed.locale}`,
        }),
        cache: "no-store",
      });
    } catch (err) {
      console.error("Failed to send newsletter notification:", err);
    }
  }

  return Response.json({ ok: true });
}
