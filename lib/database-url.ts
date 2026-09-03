/** Vercel/Neon may inject POSTGRES_URL; Payload expects DATABASE_URL. */
export function resolveDatabaseUrl() {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    ""
  );
}

export function isDatabaseConfigured() {
  return Boolean(resolveDatabaseUrl());
}
