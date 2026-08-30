import { Receiver } from "@upstash/qstash";
import { getPayload } from "payload";

import config from "@payload-config";

export async function POST(request: Request) {
  const currentSigningKey = process.env.QSTASH_CURRENT_SIGNING_KEY;
  const nextSigningKey = process.env.QSTASH_NEXT_SIGNING_KEY;
  const signature = request.headers.get("upstash-signature");
  if (!currentSigningKey || !nextSigningKey || !signature) {
    return Response.json({ error: "Programador no configurado" }, { status: 503 });
  }

  const body = await request.text();
  try {
    const receiver = new Receiver({ currentSigningKey, nextSigningKey });
    await receiver.verify({ signature, body });
  } catch {
    return Response.json({ error: "Firma inválida" }, { status: 401 });
  }

  const payload = await getPayload({ config });
  const result = await payload.jobs.run({
    allQueues: true,
    limit: 50,
    overrideAccess: true,
    sequential: true
  });
  return Response.json({ ok: true, result });
}
