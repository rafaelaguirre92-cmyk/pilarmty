import { ensureNotionSpotifyProperty } from "@/lib/notion";

async function main() {
  await ensureNotionSpotifyProperty();
  console.log('La propiedad "Spotify URL" está disponible en Notion.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
