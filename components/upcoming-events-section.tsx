import Image from "next/image";

import { getUpcomingEvents } from "@/lib/content";
import type { Locale } from "@/lib/types";

function eventDate(startDate: string, endDate: string | undefined, locale: Locale) {
  const formatter = new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", {
    day: "numeric",
    month: "long",
    hour: "numeric",
    minute: "2-digit"
  });
  const start = new Date(startDate);
  if (!endDate) return formatter.format(start);
  const end = new Date(endDate);
  if (start.toDateString() === end.toDateString()) {
    const endTime = new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", {
      hour: "numeric",
      minute: "2-digit"
    }).format(end);
    return `${formatter.format(start)} – ${endTime}`;
  }
  return `${formatter.format(start)} – ${formatter.format(end)}`;
}

export async function UpcomingEventsSection({ locale }: { locale: Locale }) {
  const events = await getUpcomingEvents(locale);
  if (!events.length) return null;

  const copy = locale === "es"
    ? { eyebrow: "Iglesia Pilar", title: "Próximos eventos", location: "Lugar", more: "Conocer más" }
    : { eyebrow: "Iglesia Pilar", title: "Upcoming events", location: "Location", more: "Learn more" };

  return (
    <section aria-labelledby="upcoming-events-title" className="section upcoming-events-section">
      <div className="container upcoming-events-shell">
        <header className="upcoming-events-heading">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h2 id="upcoming-events-title">{copy.title}</h2>
        </header>
        <div className={`upcoming-events-grid upcoming-events-grid--${events.length}`}>
          {events.map((event) => (
            <article className={`upcoming-event-card${event.image ? "" : " is-without-image"}`} key={event.payloadId || `${event.locale}-${event.title}`}>
              {event.image && (
                <div className="upcoming-event-image">
                  <Image
                    alt={event.imageAlt || ""}
                    fill
                    sizes={events.length === 1 ? "(max-width: 760px) calc(100vw - 32px), 52vw" : "(max-width: 760px) calc(100vw - 32px), 33vw"}
                    src={event.image}
                  />
                </div>
              )}
              <div className="upcoming-event-copy">
                <time className="upcoming-event-date" dateTime={event.startDate}>{eventDate(event.startDate, event.endDate, locale)}</time>
                <h3>{event.title}</h3>
                {event.excerpt && <p>{event.excerpt}</p>}
                {event.location && <p className="upcoming-event-location"><strong>{copy.location}:</strong> {event.location}</p>}
                {event.registrationUrl && (
                  <a className="button secondary upcoming-event-action" href={event.registrationUrl} rel="noreferrer" target="_blank">
                    {event.registrationLabel || copy.more}
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
