"use client";

import { useState } from "react";

type Summary = {
  payloadToNotion: number;
  notionToPayload: number;
  createdInNotion: number;
  unchanged: number;
  skipped: number;
  errors: Array<{ message: string }>;
  finishedAt: string;
};

export function NotionSyncButton({ enabled }: { enabled: boolean }) {
  const [running, setRunning] = useState(false);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function synchronize() {
    setRunning(true);
    setError(null);
    setSummary(null);
    try {
      const response = await fetch("/api/notion/sync", { method: "POST" });
      const body = await response.json();
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

  return (
    <div className="creator-sync-action">
      <button
        className="creator-primary-action"
        disabled={!enabled || running}
        onClick={synchronize}
        type="button"
      >
        {running ? "Sincronizando…" : "Sincronizar ahora"}
      </button>
      {!enabled ? (
        <p className="creator-sync-message is-warning">
          Configura el token de Notion y habilita la escritura para activar esta función.
        </p>
      ) : null}
      {error ? <p className="creator-sync-message is-error">{error}</p> : null}
      {summary ? (
        <div className={`creator-sync-result${summary.errors.length ? " has-errors" : ""}`} aria-live="polite">
          <strong>{summary.errors.length ? "Sincronización terminada con avisos" : "Sincronización completada"}</strong>
          <p>
            {summary.payloadToNotion + summary.createdInNotion} enviados a Notion · {summary.notionToPayload} importados a Payload · {summary.unchanged} sin cambios
          </p>
          {summary.errors.length ? <p>{summary.errors.length} elementos requieren revisión.</p> : null}
        </div>
      ) : null}
    </div>
  );
}
