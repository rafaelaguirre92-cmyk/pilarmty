"use client";

import { useState } from "react";
import { Button, Gutter, SetStepNav } from "@payloadcms/ui";
import type { SyncHistoryEntry } from "@/lib/sync-history";

interface SyncDashboardClientProps {
  initialHistory: SyncHistoryEntry[];
}

function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (Number.isNaN(seconds) || seconds < 0) return "Hace un momento";
  if (seconds < 60) return `Hace ${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `Hace ${days} d`;
}

function formatFullDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return d.toLocaleString("es-MX", {
      dateStyle: "medium",
      timeStyle: "medium"
    });
  } catch {
    return dateString;
  }
}

export function SyncDashboardClient({ initialHistory }: SyncDashboardClientProps) {
  const [history, setHistory] = useState<SyncHistoryEntry[]>(initialHistory);
  const [syncing, setSyncing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{
    type: "success" | "warning" | "error";
    message: string;
  } | null>(null);

  const latest = history[0] || null;

  async function handleSyncNow() {
    setSyncing(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/notion/sync", { method: "POST" });
      const data = await res.json();

      if (!res.ok && res.status !== 207) {
        throw new Error(data.error || "Error al ejecutar la sincronización.");
      }

      // Update history immediately from response, or fallback to cache-busted endpoint
      if (Array.isArray(data.history) && data.history.length > 0) {
        setHistory(data.history);
      } else if (data.entry) {
        setHistory((prev) => [data.entry, ...prev.filter((item) => item.id !== data.entry.id)]);
      } else {
        const historyRes = await fetch(`/api/notion/sync/history?t=${Date.now()}`, { cache: "no-store" });
        if (historyRes.ok) {
          const historyData = await historyRes.json();
          if (Array.isArray(historyData.history)) {
            setHistory(historyData.history);
          }
        }
      }

      const errorsCount = data.result?.errors?.length || 0;
      if (errorsCount > 0) {
        setFeedback({
          type: "warning",
          message: `Sincronización terminada con ${errorsCount} incidente(s). Revisa el reporte abajo.`
        });
      } else {
        setFeedback({
          type: "success",
          message: "Sincronización completada exitosamente sin incidentes."
        });
      }
    } catch (err) {
      setFeedback({
        type: "error",
        message: err instanceof Error ? err.message : String(err)
      });
    } finally {
      setSyncing(false);
    }
  }

  function toggleExpand(id: string) {
    setExpandedId((current) => (current === id ? null : id));
  }

  return (
    <Gutter className="pilar-sync-dashboard">
      <SetStepNav
        nav={[
          {
            label: "Sincronización",
            url: "/admin/sincronizacion"
          }
        ]}
      />

      {/* Header bar */}
      <div className="pilar-sync-header">
        <div className="pilar-sync-header__info">
          <div className="pilar-sync-header__badge">
            <span className="pilar-sync-header__badge-dot" />
            Notion ↔ Payload Reconcile
          </div>
          <h1 className="pilar-sync-header__title">Tablero de Sincronización</h1>
          <p className="pilar-sync-header__description">
            Notion es la fuente editorial. Importa autores y contenidos completos a Payload; Web determina si quedan publicados o como borradores.
          </p>
        </div>
        <div className="pilar-sync-header__actions">
          <Button
            buttonStyle="primary"
            disabled={syncing}
            onClick={handleSyncNow}
            type="button"
            className="pilar-sync-btn"
          >
            {syncing ? (
              <span className="pilar-sync-btn__spinner-wrap">
                <svg className="pilar-sync-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="4" opacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" strokeWidth="4" strokeLinecap="round" />
                </svg>
                Sincronizando…
              </span>
            ) : (
              <span className="pilar-sync-btn__label">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                </svg>
                Sincronizar ahora
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Real-time Feedback Banner */}
      {feedback && (
        <div className={`pilar-sync-alert pilar-sync-alert--${feedback.type}`} role="status">
          <div className="pilar-sync-alert__icon">
            {feedback.type === "success" && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
            )}
            {feedback.type === "warning" && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4m0 4h.01" /></svg>
            )}
            {feedback.type === "error" && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
            )}
          </div>
          <div className="pilar-sync-alert__text">{feedback.message}</div>
        </div>
      )}

      {/* Vercel-style Overview Status Hero Card */}
      <div className="pilar-sync-hero-card">
        <div className="pilar-sync-hero-card__main">
          <div className="pilar-sync-hero-card__status-line">
            <span
              className={`pilar-sync-dot ${
                syncing
                  ? "is-syncing"
                  : latest?.status === "ready"
                  ? "is-ready"
                  : latest?.status === "incident"
                  ? "is-incident"
                  : latest?.status === "error"
                  ? "is-error"
                  : "is-idle"
              }`}
            />
            <span className="pilar-sync-hero-card__status-text">
              {syncing
                ? "Sincronización en curso…"
                : latest?.status === "ready"
                ? "Sincronizado correctamente"
                : latest?.status === "incident"
                ? "Sincronizado con advertencias"
                : latest?.status === "error"
                ? "Error en la última sincronización"
                : "Esperando primera sincronización"}
            </span>
            {latest && (
              <span className="pilar-sync-badge pilar-sync-badge--trigger">
                {latest.trigger === "manual" ? "Manual" : "Cron"}
              </span>
            )}
          </div>

          <div className="pilar-sync-hero-card__meta">
            {latest ? (
              <>
                <span>Última sincronización: <strong>{timeAgo(latest.finishedAt)}</strong></span>
                <span className="pilar-sync-hero-card__separator">•</span>
                <span className="pilar-sync-hero-card__date">{formatFullDate(latest.finishedAt)}</span>
              </>
            ) : (
              <span>Pulsa "Sincronizar ahora" para registrar la primera sincronización.</span>
            )}
          </div>
        </div>

        {latest && (
          <div className="pilar-sync-hero-card__metrics">
            <div className="pilar-sync-stat">
              <span className="pilar-sync-stat__number">{latest.payloadToNotion + latest.createdInNotion}</span>
              <span className="pilar-sync-stat__label">A Notion</span>
            </div>
            <div className="pilar-sync-stat">
              <span className="pilar-sync-stat__number">{latest.notionToPayload}</span>
              <span className="pilar-sync-stat__label">A Payload</span>
            </div>
            <div className="pilar-sync-stat">
              <span className="pilar-sync-stat__number">{latest.unchanged}</span>
              <span className="pilar-sync-stat__label">Sin cambios</span>
            </div>
            <div className={`pilar-sync-stat ${latest.errors.length > 0 ? "has-errors" : ""}`}>
              <span className="pilar-sync-stat__number">{latest.errors.length}</span>
              <span className="pilar-sync-stat__label">Incidentes</span>
            </div>
          </div>
        )}
      </div>

      {/* Vercel-style Deployments / Sync History List */}
      <div className="pilar-sync-history-section">
        <div className="pilar-sync-history-section__header">
          <h2 className="pilar-sync-history-section__title">
            Historial de Sincronizaciones
          </h2>
          <span className="pilar-sync-history-section__count">
            {history.length} {history.length === 1 ? "ejecución" : "ejecuciones"}
          </span>
        </div>

        {history.length === 0 ? (
          <div className="pilar-sync-empty">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <h3>No hay registros de sincronización</h3>
            <p>Las sincronizaciones manuales o automáticas aparecerán aquí detalladas estilo Vercel.</p>
          </div>
        ) : (
          <div className="pilar-sync-table-wrap">
            <table className="pilar-sync-table">
              <thead>
                <tr>
                  <th>ESTADO</th>
                  <th>ID DE EJECUCIÓN</th>
                  <th>DISPARADOR</th>
                  <th>DOCUMENTOS</th>
                  <th>FECHA Y HORA</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry) => {
                  const isExpanded = expandedId === entry.id;
                  const hasErrors = entry.errors && entry.errors.length > 0;

                  return (
                    <tr
                      key={entry.id}
                      className={`pilar-sync-row ${isExpanded ? "is-expanded" : ""} ${
                        entry.status === "incident" ? "row-incident" : ""
                      }`}
                    >
                      {/* Status badge */}
                      <td className="pilar-sync-cell-status">
                        {entry.status === "ready" ? (
                          <span className="pilar-status-badge pilar-status-badge--ready">
                            <span className="pilar-status-badge__dot" />
                            Ready
                          </span>
                        ) : entry.status === "incident" ? (
                          <span className="pilar-status-badge pilar-status-badge--incident">
                            <span className="pilar-status-badge__dot" />
                            Incident ({entry.errors.length})
                          </span>
                        ) : (
                          <span className="pilar-status-badge pilar-status-badge--error">
                            <span className="pilar-status-badge__dot" />
                            Error
                          </span>
                        )}
                      </td>

                      {/* ID / Hash badge */}
                      <td className="pilar-sync-cell-id">
                        <code className="pilar-sync-hash" title={entry.id}>
                          {entry.id.slice(0, 11)}
                        </code>
                      </td>

                      {/* Trigger */}
                      <td className="pilar-sync-cell-trigger">
                        <span className="pilar-trigger-tag">
                          {entry.trigger === "manual" ? "Manual" : "Cron"}
                        </span>
                      </td>

                      {/* Document metrics */}
                      <td className="pilar-sync-cell-docs">
                        <div className="pilar-sync-pills">
                          <span className="pilar-pill pilar-pill--notion" title="Documentos actualizados en Notion">
                            +{entry.payloadToNotion + entry.createdInNotion} Notion
                          </span>
                          <span className="pilar-pill pilar-pill--payload" title="Documentos importados a Payload">
                            +{entry.notionToPayload} Payload
                          </span>
                          <span className="pilar-pill pilar-pill--neutral" title="Documentos sin cambios">
                            {entry.unchanged} idénticos
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="pilar-sync-cell-date">
                        <div className="pilar-sync-date-group">
                          <span className="pilar-sync-relative">{timeAgo(entry.finishedAt)}</span>
                          <span className="pilar-sync-absolute">{formatFullDate(entry.finishedAt)}</span>
                        </div>
                      </td>

                      {/* Expand / Actions */}
                      <td className="pilar-sync-cell-actions">
                        <button
                          type="button"
                          className="pilar-sync-detail-toggle"
                          onClick={() => toggleExpand(entry.id)}
                          aria-expanded={isExpanded}
                        >
                          {isExpanded ? "Ocultar" : hasErrors ? "Ver reporte" : "Detalles"}
                          <svg
                            className={`pilar-sync-chevron ${isExpanded ? "is-open" : ""}`}
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Render expanded detail card if active */}
        {expandedId && (
          <div className="pilar-sync-drawer">
            {(() => {
              const active = history.find((h) => h.id === expandedId);
              if (!active) return null;

              return (
                <div className="pilar-sync-drawer__inner">
                  <div className="pilar-sync-drawer__head">
                    <div>
                      <h4 className="pilar-sync-drawer__title">
                        Reporte detallado: <code>{active.id}</code>
                      </h4>
                      <p className="pilar-sync-drawer__subtitle">
                        Ejecución finalizada el {formatFullDate(active.finishedAt)} ({active.trigger === "manual" ? "Manual" : "Cron automático"}).
                      </p>
                    </div>
                    <button
                      type="button"
                      className="pilar-sync-drawer__close"
                      onClick={() => setExpandedId(null)}
                      aria-label="Cerrar reporte"
                    >
                      ×
                    </button>
                  </div>

                  {active.errors.length > 0 ? (
                    <div className="pilar-sync-drawer__errors">
                      <div className="pilar-sync-drawer__error-heading">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        Incidentes detectados ({active.errors.length})
                      </div>
                      <ul className="pilar-sync-drawer__error-list">
                        {active.errors.map((item, idx) => (
                          <li key={`${item.notionPageId || item.id || "err"}-${idx}`} className="pilar-sync-error-item">
                            <div className="pilar-sync-error-item__top">
                              <span className="pilar-sync-error-item__title">{item.title || "Elemento sin título"}</span>
                              <span className="pilar-sync-error-item__tag">{item.collection || "Colección"}</span>
                              {item.notionPageId && (
                                <span className="pilar-sync-error-item__notion-id">Notion: {item.notionPageId}</span>
                              )}
                            </div>
                            <div className="pilar-sync-error-item__msg">
                              <code>{item.message}</code>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="pilar-sync-drawer__clean">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <div>
                        <strong>Ejecución limpia y exitosa</strong>
                        <p>Todos los documentos evaluados se conciliaron correctamente sin fallos ni discrepancias.</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </Gutter>
  );
}
