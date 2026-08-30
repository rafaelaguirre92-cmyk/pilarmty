import { notFound, permanentRedirect, redirect } from "next/navigation";

import { getContentRedirect } from "@/lib/content";

export async function redirectOrNotFound(path: string): Promise<never> {
  const match = await getContentRedirect(path);
  if (!match) notFound();
  if (match.permanent) permanentRedirect(match.destination);
  redirect(match.destination);
}
