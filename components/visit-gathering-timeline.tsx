"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";

type GatheringMoment = {
  text: string;
  highlights: string[];
  image: string;
  width: number;
  height: number;
};

type VisitGatheringTimelineProps = {
  title: string;
  introduction: string;
  moments: GatheringMoment[];
};

function renderHighlightedText(text: string, highlights: string[]) {
  if (highlights.length === 0) return text;

  const pattern = new RegExp(
    `(${highlights.map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
    "gi"
  );

  return text.split(pattern).map((part, index) =>
    highlights.some((word) => word.toLowerCase() === part.toLowerCase()) ? (
      <em key={`${part}-${index}`}>{part}</em>
    ) : (
      part
    )
  );
}

export function VisitGatheringTimeline({
  title,
  introduction,
  moments
}: VisitGatheringTimelineProps) {
  const titleHighlights = title.includes("reunimos") ? ["reunimos"] : ["meet"];
  const timelineRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(-1);
  const [visibleSteps, setVisibleSteps] = useState<number[]>([0]);

  useEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline) return;

    const steps = Array.from(
      timeline.querySelectorAll<HTMLElement>(".visit-gathering-step")
    );

    let progressFrame = 0;

    const updateProgress = () => {
      const rect = timeline.getBoundingClientRect();
      const lineInset = 12;
      const lineLength = timeline.offsetHeight - lineInset * 2;
      const viewportAnchor = window.innerHeight * 0.5;
      const scrolled = viewportAnchor - rect.top - lineInset;
      const progressRatio = lineLength
        ? Math.min(Math.max(scrolled, 0), lineLength) / lineLength
        : 0;
      const nextActiveStep = steps.reduce(
        (activeIndex, step, index) => {
          const marker = step.querySelector<HTMLElement>(
            ".visit-gathering-marker"
          );
          const markerCenter = marker
            ? marker.getBoundingClientRect().top + marker.offsetHeight / 2
            : Number.POSITIVE_INFINITY;

          return markerCenter <= viewportAnchor ? index : activeIndex;
        },
        -1
      );

      timeline.style.setProperty(
        "--timeline-progress",
        `${progressRatio * 100}%`
      );
      setActiveStep((currentStep) =>
        currentStep === nextActiveStep ? currentStep : nextActiveStep
      );
    };

    const scheduleProgressUpdate = () => {
      cancelAnimationFrame(progressFrame);
      progressFrame = requestAnimationFrame(updateProgress);
    };

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const step = Number((entry.target as HTMLElement).dataset.step);
            setVisibleSteps((currentSteps) =>
              currentSteps.includes(step)
                ? currentSteps
                : [...currentSteps, step]
            );
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 }
    );

    steps.forEach((step) => {
      revealObserver.observe(step);
    });

    updateProgress();
    window.addEventListener("scroll", scheduleProgressUpdate, { passive: true });
    window.addEventListener("resize", scheduleProgressUpdate);

    return () => {
      revealObserver.disconnect();
      window.removeEventListener("scroll", scheduleProgressUpdate);
      window.removeEventListener("resize", scheduleProgressUpdate);
      cancelAnimationFrame(progressFrame);
    };
  }, [moments.length]);

  const timelineStyle = {
    "--timeline-progress": "0%"
  } as CSSProperties;

  return (
    <section className="section static-page-section visit-gathering-section">
      <div className="container visit-gathering-layout">
        <div className="visit-gathering-intro">
          <h2>{renderHighlightedText(title, titleHighlights)}</h2>
          <p>{introduction}</p>
        </div>

        <div
          className="visit-gathering-timeline"
          ref={timelineRef}
          style={timelineStyle}
        >
          {moments.map((moment, index) => (
            <article
              className={[
                "visit-gathering-step",
                visibleSteps.includes(index) ? "is-visible" : "",
                index <= activeStep ? "is-past" : "",
                index === activeStep ? "is-active" : ""
              ]
                .filter(Boolean)
                .join(" ")}
              data-step={index}
              key={moment.text}
            >
              <div className="visit-gathering-scene">
                <span className="visit-gathering-marker" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="visit-gathering-media">
                  <Image
                    src={moment.image}
                    alt=""
                    width={moment.width}
                    height={moment.height}
                    sizes="(max-width: 979px) 64vw, 480px"
                    style={{ width: "100%", height: "auto" }}
                  />
                </div>
                <p>{renderHighlightedText(moment.text, moment.highlights)}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
