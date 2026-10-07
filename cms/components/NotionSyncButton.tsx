"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@payloadcms/ui";

type Summary = {
  runId: string;
  payloadToNotion: number;
  notionToPayload: number;
  createdInNotion: number;
  conflictsResolved?: number;
  unchanged: number;
  skipped: number;
  skippedReasons?: Record<string, number>;
  errors: Array<{
    collection?: string;
    id?: number | string;
    notionPageId?: string;
    title?: string;
    message: string;
  }>;
  finishedAt: string;
};

const skipLabels: Record<string, string> = {
  unsupported_type: "tipo no soportado",
  not_web: "sin Web",
  invalid_teaching: "enseñanza incompleta",
  invalid_resource: "artículo incompleto"
};

export function NotionSyncButton({ enabled }: { enabled: boolean }) {
  const [running, setRunning] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);

  async function synchronize() {
    setRunning(true);
    setError(null);
    setSessionExpired(false);
    setSummary(null);
    try {
      const response = await fetch("/api/notion/sync", { method: "POST" });
      const body = await response.json();
      if (response.status === 401) {
        setSessionExpired(true);
        throw new Error("Payload no pudo validar tu sesión para sincronizar. Recarga el panel o vuelve a iniciar sesión.");
      }
      if (!response.ok && response.status !== 207) {
        throw new Error(body.error || "No se pudo completar la sincronización.");
      }
      setSummary(body.result);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setRunning(false);
    }
  }

  const skipDetails = summary?.skippedReasons
    ? Object.entries(summary.skippedReasons)
        .map(([reason, count]) => `${count} ${skipLabels[reason] || reason}`)
        .join(", ")
    : null;

  return (
    <div className="creator-sync-action">
      <Button
        disabled={!enabled || running}
        onClick={synchronize}
        type="button"
      >
        {running ? "Sincronizando…" : "Sincronizar ahora"}
      </Button>
      {!enabled ? (
        <p className="creator-sync-message is-warning">
          Configura la conexión de Notion para activar esta función.
        </p>
      ) : null}
      {error ? <p className="creator-sync-message is-error">{error}</p> : null}
      {sessionExpired ? (
        <p className="creator-sync-message">
          <Link href="/admin/login?redirect=%2Fadmin">Ir a iniciar sesión</Link>
        </p>
      ) : null}
      {summary ? (
        <div className={`creator-sync-result${summary.errors.length ? " has-errors" : ""}`} aria-live="polite">
          <strong>{summary.errors.length ? "Sincronización terminada con avisos" : "Sincronización completada"}</strong>
          <p>
            {summary.notionToPayload} importados a Payload
            {summary.skipped ? ` · ${summary.skipped} omitidos` : ""}
          </p>
          {skipDetails ? <p>Omitidos: {skipDetails}.</p> : null}
          {summary.errors.length ? <p>{summary.errors.length} elementos requieren revisión.</p> : null}
          {summary.errors.length ? (
            <details className="creator-sync-errors">
              <summary>Ver detalle de errores</summary>
              <ul>
                {summary.errors.map((item, index) => (
                  <li key={`${item.notionPageId || item.id || "error"}-${index}`}>
                    <strong>{item.title || "Elemento sin título"}</strong>
                    <span>
                      {item.collection || ""}
                      {item.notionPageId ? ` · Notion ${item.notionPageId}` : ""}
                    </span>
                    <code>{item.message}</code>
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
