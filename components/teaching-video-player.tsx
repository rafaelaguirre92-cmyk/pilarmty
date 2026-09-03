"use client";

import { useState } from "react";
import type { Locale } from "@/lib/types";

export function TeachingVideoPlayer({
  title,
  youtubeEmbed,
  youtubePoster,
  locale
}: {
  title: string;
  youtubeEmbed: string;
  youtubePoster?: string;
  locale: Locale;
}) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="teaching-video-wrapper">
      <div className="teaching-video-frame">
        {isPlaying ? (
          <iframe
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            src={`${youtubeEmbed}${youtubeEmbed.includes("?") ? "&" : "?"}autoplay=1`}
            title={`${title} · YouTube`}
          />
        ) : (
          <button
            aria-label={`${locale === "es" ? "Reproducir video" : "Play video"}: ${title}`}
            className="teaching-video-facade"
            onClick={() => setIsPlaying(true)}
            style={
              youtubePoster
                ? { backgroundImage: `url("${youtubePoster}")` }
                : undefined
            }
            type="button"
          >
            <span className="teaching-video-overlay" aria-hidden="true" />
            <span className="teaching-video-play" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="m9 7 8 5-8 5V7Z" fill="currentColor" />
              </svg>
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
