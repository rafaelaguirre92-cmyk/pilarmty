import assert from "node:assert/strict";
import test from "node:test";

import { spotifyEpisodeEmbedUrl, spotifyEpisodeId } from "@/lib/spotify";

test("Spotify episode URLs produce an embeddable player", () => {
  const url = "https://open.spotify.com/episode/abc123?si=tracking";
  assert.equal(spotifyEpisodeId(url), "abc123");
  assert.equal(
    spotifyEpisodeEmbedUrl(url),
    "https://open.spotify.com/embed/episode/abc123?utm_source=generator"
  );
});

test("localized Spotify episode URLs are supported", () => {
  assert.equal(
    spotifyEpisodeId("https://open.spotify.com/intl-es/episode/episode456"),
    "episode456"
  );
});

test("non-episode and non-Spotify URLs are rejected", () => {
  assert.equal(spotifyEpisodeId("https://open.spotify.com/show/show123"), undefined);
  assert.equal(
    spotifyEpisodeId("https://podcasts.apple.com/mx/podcast/example/id123"),
    undefined
  );
});
