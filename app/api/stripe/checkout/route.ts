import { z } from "zod";

import { onlineGivingIsEnabled } from "@/lib/give";

const checkoutSchema = z.object({
  amount: z.coerce.number().int().min(50).max(500_000),
  frequency: z.enum(["once", "monthly"]),
  locale: z.enum(["es", "en"])
});

const attempts = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const windowStart = now - 10 * 60 * 1000;
  const recent = (attempts.get(ip) || []).filter((time) => time > windowStart);
  recent.push(now);
  attempts.set(ip, recent);
  return recent.length > 10;
}

export async function POST(request: Request) {
  if (!onlineGivingIsEnabled()) {
    return Response.json({ error: "online_giving_disabled" }, { status: 404 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  if (rateLimited(ip)) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  let checkout: z.infer<typeof checkoutSchema>;
  try {
    checkout = checkoutSchema.parse(await request.json());
  } catch {
    return Response.json({ error: "invalid_checkout" }, { status: 400 });
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    console.error("STRIPE_SECRET_KEY is missing.");
    return Response.json({ error: "stripe_not_configured" }, { status: 503 });
  }

  const configuredSiteUrl =
    process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  const requestOrigin = new URL(request.url).origin;
  const siteUrl = (configuredSiteUrl || requestOrigin).replace(/\/$/, "");
  const givePath = checkout.locale === "en" ? "/en/dar" : "/dar";
  const successUrl =
    process.env.STRIPE_GIVE_SUCCESS_URL ||
    `${siteUrl}${givePath}?aportacion=gracias&session_id={CHECKOUT_SESSION_ID}`;
  const returnUrl =
    process.env.STRIPE_GIVE_RETURN_URL ||
    `${siteUrl}${givePath}?aportacion=resultado&session_id={CHECKOUT_SESSION_ID}`;
  const isRecurring = checkout.frequency === "monthly";
  const params = new URLSearchParams({
    mode: isRecurring ? "subscription" : "payment",
    ui_mode: "embedded",
    redirect_on_completion: "if_required",
    locale: checkout.locale,
    return_url: returnUrl,
    "line_items[0][price_data][currency]": "mxn",
    "line_items[0][price_data][unit_amount]": String(checkout.amount * 100),
    "line_items[0][price_data][product_data][name]":
      checkout.locale === "es"
        ? "Aportación a Iglesia Pilar"
        : "Contribution to Iglesia Pilar",
    "line_items[0][quantity]": "1",
    "metadata[frequency]": checkout.frequency,
    "metadata[locale]": checkout.locale,
    integration_identifier: `iglesia_pilar_give_${crypto
      .randomUUID()
      .replace(/[^a-z]/gi, "")
      .slice(0, 8)
      .padEnd(8, "a")}`
  });

  if (isRecurring) {
    params.set("line_items[0][price_data][recurring][interval]", "month");
  } else {
    params.set("submit_type", "donate");
  }

  const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Idempotency-Key": crypto.randomUUID()
    },
    body: params,
    cache: "no-store"
  });
  const stripeSession = (await stripeResponse.json()) as {
    error?: { message?: string };
    client_secret?: string;
  };

  if (!stripeResponse.ok || !stripeSession.client_secret) {
    console.error(
      "Stripe Checkout failed:",
      stripeResponse.status,
      stripeSession.error?.message || "unknown_error"
    );
    return Response.json({ error: "stripe_checkout_failed" }, { status: 502 });
  }

  const publishableKey =
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    process.env.STRIPE_PUBLISHABLE_KEY ||
    null;

  return Response.json({
    clientSecret: stripeSession.client_secret,
    publishableKey,
    returnUrl: successUrl
  });
}
