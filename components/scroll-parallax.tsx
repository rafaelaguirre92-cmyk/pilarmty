"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ScrollParallax() {
  const pathname = usePathname();

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Smooth Scroll Reveals
    const revealElements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]")
    );

    if (reducedMotion.matches) {
      revealElements.forEach((el) => el.classList.add("is-revealed"));
      return;
    }

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -40px 0px",
        threshold: 0.08
      }
    );

    revealElements.forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight - 40) {
        el.classList.add("is-revealed");
      } else {
        revealObserver.observe(el);
      }
    });

    // Parallax Elements (inner image translation)
    const parallaxElements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-parallax]")
    ).map((element) => {
      const parsed = Number(element.dataset.parallax);
      return {
        element,
        speed: Number.isNaN(parsed) ? 0.04 : parsed,
        currentY: 0,
        targetY: 0,
        prop: "--parallax-y",
        max: 35
      };
    });

    // Card Motion Elements (outer card translation on scroll)
    const cardElements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-card-parallax]")
    ).map((element) => {
      const parsed = Number(element.dataset.cardParallax);
      return {
        element,
        speed: Number.isNaN(parsed) ? 0.03 : parsed,
        currentY: 0,
        targetY: 0,
        prop: "--card-offset-y",
        max: 28
      };
    });

    const allMotionElements = [...parallaxElements, ...cardElements];

    if (allMotionElements.length === 0) {
      return () => {
        revealObserver.disconnect();
      };
    }

    let isRunning = false;
    let frameId = 0;

    const calculateTargets = () => {
      const windowHeight = window.innerHeight;
      const viewportCenter = windowHeight / 2;

      for (const item of allMotionElements) {
        const bounds = item.element.getBoundingClientRect();
        if (bounds.bottom >= -150 && bounds.top <= windowHeight + 150) {
          const elementCenter = bounds.top + bounds.height / 2;
          const delta = (viewportCenter - elementCenter) * item.speed;
          item.targetY = Math.max(-item.max, Math.min(item.max, delta));
        }
      }
    };

    const animate = () => {
      let hasSignificantMovement = false;

      for (const item of allMotionElements) {
        const diff = item.targetY - item.currentY;
        if (Math.abs(diff) > 0.05) {
          item.currentY += diff * 0.12;
          item.element.style.setProperty(item.prop, `${item.currentY.toFixed(2)}px`);
          hasSignificantMovement = true;
        } else if (Math.abs(diff) > 0.001) {
          item.currentY = item.targetY;
          item.element.style.setProperty(item.prop, `${item.currentY.toFixed(2)}px`);
        }
      }

      if (hasSignificantMovement || isRunning) {
        frameId = window.requestAnimationFrame(animate);
      } else {
        isRunning = false;
      }
    };

    const onScroll = () => {
      calculateTargets();
      if (!isRunning) {
        isRunning = true;
        frameId = window.requestAnimationFrame(animate);
      }
    };

    // Initial calculation
    calculateTargets();
    for (const item of allMotionElements) {
      item.currentY = item.targetY;
      item.element.style.setProperty(item.prop, `${item.currentY.toFixed(2)}px`);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      revealObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, [pathname]);

  return null;
}
