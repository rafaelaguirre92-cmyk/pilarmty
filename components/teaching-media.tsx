"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { Locale } from "@/lib/types";
import {
  loadSpotifyIframeApi,
  type SpotifyEmbedController
} from "@/lib/spotify-iframe-api";
import {
  loadYouTubeIframeApi,
  type YouTubePlayerInstance
} from "@/lib/youtube-iframe-api";

type MediaKind = "video" | "spotify";

export function TeachingMedia({
  title,
  youtubeEmbed,
  youtubePoster,
  spotifyEmbed,
  spotifyUri,
  locale
}: {
  title: string;
  youtubeEmbed?: string;
  youtubePoster?: string;
  spotifyEmbed?: string;
  spotifyUri?: string;
  locale: Locale;
}) {
  const [videoSrc, setVideoSrc] = useState<string>();
  const [spotifyFallback, setSpotifyFallback] = useState(false);
  const [spotifyReady, setSpotifyReady] = useState(false);
  const [activeMedia, setActiveMedia] = useState<MediaKind | null>(null);
  const [isFloating, setIsFloating] = useState(false);
  const mediaRef = useRef<HTMLDivElement>(null);
  const videoSlotRef = useRef<HTMLDivElement>(null);
  const audioSlotRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLIFrameElement>(null);
  const spotifyRef = useRef<HTMLDivElement>(null);
  const youtubePlayerRef = useRef<YouTubePlayerInstance | null>(null);
  const spotifyPlayerRef = useRef<SpotifyEmbedController | null>(null);
  const activeMediaRef = useRef<MediaKind | null>(null);

  const activateMedia = useCallback((kind: MediaKind) => {
    if (activeMediaRef.current === kind) return;
    if (kind === "video") spotifyPlayerRef.current?.pause();
    else youtubePlayerRef.current?.pauseVideo();
    activeMediaRef.current = kind;
    setActiveMedia(kind);
  }, []);

  useEffect(() => {
    if (!videoSrc) return;
    let cancelled = false;

    void loadYouTubeIframeApi().then((api) => {
      if (cancelled || !videoRef.current) return;
      youtubePlayerRef.current = new api.Player(videoRef.current, {
        events: {
          onReady: ({ target }) => {
            if (target.getPlayerState() === 1) activateMedia("video");
          },
          onStateChange: ({ data }) => {
            if (data === 1) activateMedia("video");
            if (data === 0 && activeMediaRef.current === "video") {
              activeMediaRef.current = null;
              setActiveMedia(null);
            }
          }
        }
      });
    }).catch(() => {
      // The video remains playable if YouTube's optional state API is blocked.
    });

    return () => {
      cancelled = true;
      youtubePlayerRef.current?.destroy();
      youtubePlayerRef.current = null;
    };
  }, [activateMedia, videoSrc]);

  useEffect(() => {
    if (!spotifyUri) return;
    let cancelled = false;

    void loadSpotifyIframeApi().then((api) => {
      if (cancelled || !spotifyRef.current) return;
      api.createController(
        spotifyRef.current,
        { uri: spotifyUri, width: "100%", height: 80 },
        (controller) => {
          if (cancelled) {
            controller.destroy();
            return;
          }
          spotifyPlayerRef.current = controller;
          setSpotifyReady(true);
          controller.addListener("playback_update", ({ data }) => {
            if (!data.isPaused) activateMedia("spotify");
          });
        }
      );
    }).catch(() => {
      if (!cancelled) setSpotifyFallback(true);
    });

    return () => {
      cancelled = true;
      spotifyPlayerRef.current?.destroy();
      spotifyPlayerRef.current = null;
    };
  }, [activateMedia, spotifyUri]);

  useEffect(() => {
    let frame = 0;
    const updateFloating = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!activeMedia) {
          setIsFloating(false);
          return;
        }

        if (window.innerWidth < 720) {
          const slot = activeMedia === "video" ? videoSlotRef.current : audioSlotRef.current;
          const slotTop = slot?.getBoundingClientRect().top;
          setIsFloating(slotTop !== undefined && slotTop <= 76);
          return;
        }

        const headerHeight = window.innerWidth >= 980 ? 96 : 80;
        const mediaBottom = mediaRef.current?.getBoundingClientRect().bottom;
        setIsFloating(mediaBottom !== undefined && mediaBottom <= headerHeight + 8);
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
  }, [activeMedia]);

  useEffect(() => {
    document.documentElement.classList.toggle("has-floating-teaching-video", isFloating && activeMedia === "video");
    document.documentElement.classList.toggle("has-floating-teaching-audio", isFloating && activeMedia === "spotify");
    return () => {
      document.documentElement.classList.remove("has-floating-teaching-video");
      document.documentElement.classList.remove("has-floating-teaching-audio");
    };
  }, [activeMedia, isFloating]);

  const startVideo = () => {
    if (!youtubeEmbed) return;
    const url = new URL(youtubeEmbed);
    url.searchParams.set("autoplay", "1");
    url.searchParams.set("enablejsapi", "1");
    url.searchParams.set("playsinline", "1");
    url.searchParams.set("origin", window.location.origin);
    setVideoSrc(url.toString());
  };

  return (
    <div className="teaching-media-group" ref={mediaRef}>
      {youtubeEmbed && (
        <section className="teaching-video-section">
          <div className="container teaching-video-container">
            <div className="teaching-video-wrapper" ref={videoSlotRef}>
              <div className={`teaching-video-frame${isFloating && activeMedia === "video" ? " is-floating" : ""}`}>
                {videoSrc ? (
                  <iframe
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    ref={videoRef}
                    src={videoSrc}
                    title={`${title} · YouTube`}
                  />
                ) : (
                  <button
                    aria-label={`${locale === "es" ? "Reproducir video" : "Play video"}: ${title}`}
                    className="teaching-video-facade"
                    onClick={startVideo}
                    style={youtubePoster ? { backgroundImage: `url("${youtubePoster}")` } : undefined}
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
          </div>
        </section>
      )}

      {spotifyEmbed && spotifyUri && (
        <section className="teaching-audio-section">
          <div className="container teaching-audio-container">
            <div className="teaching-audio-slot" ref={audioSlotRef}>
              <div className={`teaching-audio-frame${isFloating && activeMedia === "spotify" ? " is-floating" : ""}`}>
                {spotifyFallback ? (
                  <iframe
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    className="teaching-audio-iframe"
                    height="80"
                    loading="lazy"
                    src={spotifyEmbed}
                    title={`${title} · Spotify`}
                  />
                ) : (
                  <>
                    <div className="teaching-audio-controller" ref={spotifyRef} />
                    {!spotifyReady && (
                      <span className="teaching-audio-loading" role="status">
                        {locale === "es" ? "Cargando Spotify…" : "Loading Spotify…"}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {isFloating && <div aria-hidden="true" className="teaching-media-mobile-fade" data-media={activeMedia} />}
    </div>
  );
}
