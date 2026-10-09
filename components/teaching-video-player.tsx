"use client";

import { useEffect, useRef, useState } from "react";

import type { Locale } from "@/lib/types";
import {
  loadYouTubeIframeApi,
  type YouTubePlayerInstance
} from "@/lib/youtube-iframe-api";

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
  const [playerSrc, setPlayerSrc] = useState<string>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFloating, setIsFloating] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<YouTubePlayerInstance | null>(null);

  useEffect(() => {
    if (!playerSrc) return;
    let cancelled = false;

    void loadYouTubeIframeApi().then((api) => {
      if (cancelled || !iframeRef.current) return;
      playerRef.current = new api.Player(iframeRef.current, {
        events: {
          onReady: ({ target }) => {
            const playing = target.getPlayerState() === 1;
            setIsPlaying(playing);
            if (!playing) setIsFloating(false);
          },
          onStateChange: ({ data }) => {
            if (data === 1) setIsPlaying(true);
            else if (data === 0 || data === 2 || data === 5 || data === -1) {
              setIsPlaying(false);
              setIsFloating(false);
            }
          },
          onAutoplayBlocked: () => {
            setIsPlaying(false);
            setIsFloating(false);
          }
        }
      });
    }).catch(() => {
      // The iframe still works normally if the optional state API is blocked.
    });

    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [playerSrc]);

  useEffect(() => {
    if (!isPlaying) return;

    let frame = 0;
    const updateFloating = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const headerHeight = window.innerWidth >= 720 ? 80 : 64;
        const videoBottom = wrapperRef.current?.getBoundingClientRect().bottom;
        setIsFloating(videoBottom !== undefined && videoBottom <= headerHeight + 8);
      });
    };

    updateFloating();
    window.addEventListener("scroll", updateFloating, { passive: true });
    window.addEventListener("resize", updateFloating);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateFloating);
      window.removeEventListener("resize", updateFloating);
    };
  }, [isPlaying]);

  useEffect(() => {
    document.documentElement.classList.toggle("has-floating-teaching-video", isFloating);
    return () => document.documentElement.classList.remove("has-floating-teaching-video");
  }, [isFloating]);

  const startVideo = () => {
    const url = new URL(youtubeEmbed);
    url.searchParams.set("autoplay", "1");
    url.searchParams.set("enablejsapi", "1");
    url.searchParams.set("playsinline", "1");
    url.searchParams.set("origin", window.location.origin);
    setPlayerSrc(url.toString());
  };

  return (
    <div className="teaching-video-wrapper" ref={wrapperRef}>
      <div className={`teaching-video-frame${isFloating ? " is-floating" : ""}`}>
        {playerSrc ? (
          <iframe
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            ref={iframeRef}
            src={playerSrc}
            title={`${title} · YouTube`}
          />
        ) : (
          <button
            aria-label={`${locale === "es" ? "Reproducir video" : "Play video"}: ${title}`}
            className="teaching-video-facade"
            onClick={startVideo}
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
        {isFloating && (
          <button
            aria-label={locale === "es" ? "Pausar y cerrar video flotante" : "Pause and close floating video"}
            className="teaching-video-floating-dismiss"
            onClick={() => {
              playerRef.current?.pauseVideo();
              setIsPlaying(false);
              setIsFloating(false);
            }}
            type="button"
          >
            <span aria-hidden="true">×</span>
          </button>
        )}
      </div>
    </div>
  );
}
