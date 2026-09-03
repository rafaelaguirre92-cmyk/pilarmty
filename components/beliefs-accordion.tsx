"use client";

import Link from "next/link";
import { Fragment, useState } from "react";

import { ScriptureTooltip } from "@/components/scripture-tooltip";

type Belief = {
  title: string;
  description: string;
  references: string[];
  link?: {
    href: string;
    label: string;
  };
};

export function BeliefsAccordion({
  beliefs,
  locale
}: {
  beliefs: Belief[];
  locale: "es" | "en";
}) {
  const [openItems, setOpenItems] = useState<number[]>([]);
  const allOpen = openItems.length === beliefs.length;

  function toggleItem(index: number) {
    setOpenItems((current) => (current.includes(index) ? [] : [index]));
  }

  function toggleAll() {
    setOpenItems(allOpen ? [] : beliefs.map((_, index) => index));
  }

  return (
    <div className="beliefs-accordion">
      <div className="beliefs-accordion-toolbar">
        <button type="button" onClick={toggleAll}>
          {allOpen
            ? locale === "es"
              ? "Cerrar todas"
              : "Close all"
            : locale === "es"
              ? "Mostrar todas"
              : "Show all"}
        </button>
      </div>

      <div className="beliefs-accordion-list">
        {beliefs.map((belief, index) => {
          const isOpen = openItems.includes(index);
          const panelId = `belief-panel-${index + 1}`;
          const buttonId = `belief-button-${index + 1}`;

          return (
            <article className="beliefs-accordion-item" key={belief.title}>
              <h3>
                <button
                  id={buttonId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggleItem(index)}
                >
                  <span className="beliefs-accordion-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="beliefs-accordion-title">{belief.title}</span>
                  <span className="beliefs-accordion-icon" aria-hidden="true">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
              </h3>
              <div
                id={panelId}
                className="beliefs-accordion-panel"
                aria-labelledby={buttonId}
                aria-hidden={!isOpen}
                data-open={isOpen}
              >
                <div className="beliefs-accordion-panel-inner">
                  <p>{belief.description}</p>
                  {belief.references.length > 0 && (
                    <p className="beliefs-accordion-references">
                      {belief.references.map((ref, i) => (
                        <Fragment key={ref}>
                          {i > 0 && " · "}
                          <ScriptureTooltip reference={ref} locale={locale} />
                        </Fragment>
                      ))}
                    </p>
                  )}
                  {belief.link && (
                    <div className="beliefs-accordion-panel-action">
                      <Link className="button secondary" href={belief.link.href}>
                        {belief.link.label}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
