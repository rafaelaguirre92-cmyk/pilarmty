"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";

export type CreatorPublication = {
  date?: string;
  editHref: string;
  id: number | string;
  image?: string;
  metadataScore: number;
  status: "draft" | "published";
  title: string;
  type: "post" | "teaching";
  updatedAt: string;
};

function prettyDate(value?: string) {
  if (!value) return "Sin fecha";
  return new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

export function CreatorPublicationsTable({
  publications,
  totalDocs,
  hasMore,
  initialType = "all",
  initialStatus = "all",
  initialQuery = "",
}: {
  publications: CreatorPublication[];
  totalDocs: number;
  hasMore: boolean;
  initialType?: "all" | "post" | "teaching";
  initialStatus?: "all" | "draft" | "published";
  initialQuery?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const isFirstRender = useRef(true);

  // Push search query to URL with debounce on user typing
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query.trim()) params.set("q", query.trim());
      else params.delete("q");
      router.push(`/admin/publicaciones?${params.toString()}`);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  function pushFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "all") params.delete(key);
    else params.set(key, value);
    // Preserve current search query
    if (query.trim()) params.set("q", query.trim());
    else params.delete("q");
    router.push(`/admin/publicaciones?${params.toString()}`);
  }

  return (
    <main className="creator-publications">
      <header className="creator-page-header">
        <div><p className="creator-eyebrow">Biblioteca editorial</p><h1>Publicaciones</h1><p className="creator-lede">Busca, filtra y continúa trabajando en enseñanzas y posts.</p></div>
        <Link className="creator-primary-action" href="/admin/crear">＋ Nuevo</Link>
      </header>
      <section className="creator-publication-tools" aria-label="Filtros de publicaciones">
        <label className="creator-search"><span className="sr-only">Buscar publicaciones</span><span aria-hidden="true">⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por título" /></label>
        <div className="creator-filter-group" aria-label="Filtrar por estado">
          {(["all", "draft", "published"] as const).map((value) => (
            <button aria-pressed={initialStatus === value} key={value} onClick={() => pushFilter("estado", value)}>
              {value === "all" ? "Todos" : value === "draft" ? "Borradores" : "Publicados"}
            </button>
          ))}
        </div>
        <div className="creator-filter-group creator-filter-group--type" aria-label="Filtrar por tipo">
          {(["all", "teaching", "post"] as const).map((value) => (
            <button aria-pressed={initialType === value} key={value} onClick={() => pushFilter("tipo", value)}>
              {value === "all" ? "Todo" : value === "teaching" ? "Enseñanzas" : "Posts"}
            </button>
          ))}
        </div>
      </section>
      <div className="creator-table-wrap">
        <table className="creator-publication-table">
          <thead><tr><th>Publicación</th><th>Estado</th><th>Fecha</th><th>Metadatos</th><th><span className="sr-only">Abrir</span></th></tr></thead>
          <tbody>
            {publications.map((item) => <tr key={`${item.type}-${item.id}`}>
              <td><Link href={item.editHref} className="creator-publication-title">{item.image ? <Image src={item.image} alt="" width={60} height={42} unoptimized /> : <span className={`creator-type-mark creator-type-mark--${item.type}`}>{item.type === "post" ? "P" : "E"}</span>}<span><strong>{item.title}</strong><small>{item.type === "post" ? "Post" : "Enseñanza"}</small></span></Link></td>
              <td><span className={`creator-status creator-status--${item.status}`}>{item.status === "published" ? "Publicado" : "Borrador"}</span></td>
              <td>{prettyDate(item.date || item.updatedAt)}</td>
              <td><span className={`creator-metadata-score ${item.metadataScore >= 80 ? "is-good" : item.metadataScore >= 55 ? "is-medium" : "is-low"}`}><i style={{ "--score": `${item.metadataScore}%` } as CSSProperties} />{item.metadataScore}%</span></td>
              <td><Link href={item.editHref} aria-label={`Editar ${item.title}`} className="creator-row-arrow">→</Link></td>
            </tr>)}
          </tbody>
        </table>
        {!publications.length && <div className="creator-empty">No encontramos publicaciones con estos filtros.</div>}
      </div>
      <p className="creator-results-count">
        {hasMore ? `Mostrando ${publications.length} de ${totalDocs}` : `${publications.length} de ${totalDocs}`} publicaciones
      </p>
    </main>
  );
}
