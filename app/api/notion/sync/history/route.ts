import { getPayload } from "payload";
import config from "@payload-config";
import { getSyncHistory } from "@/lib/sync-history";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const payload = await getPayload({ config });
  const auth = await payload.auth({ headers: request.headers });

  if (!auth.user) {
    return Response.json({ error: "Sesión administrativa requerida" }, { status: 401 });
  }

  try {
    const history = await getSyncHistory();
    return Response.json({ ok: true, history }, { status: 200 });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
