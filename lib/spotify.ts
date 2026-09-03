export function spotifyEpisodeId(value?: string) {
  if (!value) return undefined;

  try {
    const url = new URL(value);
    if (url.hostname.replace(/^www\./, "") !== "open.spotify.com") {
      return undefined;
    }

    const segments = url.pathname.split("/").filter(Boolean);
    const episodeIndex = segments.indexOf("episode");
    const episodeId = episodeIndex >= 0 ? segments[episodeIndex + 1] : undefined;
    return episodeId || undefined;
  } catch {
    return undefined;
  }
}

export function spotifyEpisodeEmbedUrl(value?: string) {
  const episodeId = spotifyEpisodeId(value);
  return episodeId
    ? `https://open.spotify.com/embed/episode/${encodeURIComponent(episodeId)}?utm_source=generator`
    : undefined;
}
