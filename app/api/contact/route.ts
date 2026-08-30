import { z } from "zod";

const payloadSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    lastName: z.string().trim().max(100).optional().default(""),
    email: z.union([z.email().max(254), z.literal("")]).optional().default(""),
    phone: z.string().trim().max(40).optional().default(""),
    zone: z.string().trim().max(100).optional().default(""),
    consent: z.string().trim().max(20).optional().default(""),
    formType: z.enum(["contact", "community"]).optional().default("contact"),
    message: z.string().trim().min(10).max(5000),
    website: z.string().max(0).optional().default("")
  })
  .superRefine((data, context) => {
    if (data.formType !== "community") return;

    if (
      !data.phone ||
      !data.zone ||
      data.consent !== "accepted" ||
      data.lastName.trim().length < 2 ||
      !/^\d{10,15}$/.test(data.phone)
    ) {
      context.addIssue({
        code: "custom",
        message: "Community form fields are incomplete"
      });
    }
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
  if (!apiKey || !to) {
    console.error("Contact email environment variables are missing.");
    return Response.json({ error: "mail_not_configured" }, { status: 503 });
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: [to],
      ...(parsed.email ? { reply_to: parsed.email } : {}),
      subject:
        parsed.formType === "community"
          ? `Interés en comunidades — ${parsed.name} ${parsed.lastName}`.trim()
          : `Nuevo mensaje del sitio — ${parsed.name} ${parsed.lastName}`.trim(),
      text: [
        `Nombre: ${parsed.name} ${parsed.lastName}`.trim(),
        `Correo: ${parsed.email || "No proporcionado"}`,
        `Teléfono: ${parsed.phone || "No proporcionado"}`,
        ...(parsed.zone ? [`Zona: ${parsed.zone}`] : []),
        ...(parsed.formType === "community"
          ? [`Consentimiento de contacto: ${parsed.consent === "accepted" ? "Sí" : "No"}`]
          : []),
        "",
        parsed.message
      ].join("\n")
    }),
    cache: "no-store"
  });

  if (!response.ok) {
    console.error("Resend failed:", response.status, await response.text());
    return Response.json({ error: "mail_failed" }, { status: 502 });
  }

  return Response.json({ ok: true });
}
