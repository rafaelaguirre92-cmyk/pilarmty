import Image from "next/image";
import Link from "next/link";

import { CollectionCard } from "@/components/collection-card";
import { ResourceCatalogGrid } from "@/components/resource-catalog-grid";
import { ResourceFiltersDrawer } from "@/components/resource-filters-drawer";
import { ResourceTeachingSort } from "@/components/resource-teaching-sort";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TeachingCard } from "@/components/teaching-card";
import {
  getCollections,
  getResources,
  getTeachings
} from "@/lib/content";
import { formatDate, localePath } from "@/lib/site";
import { isScriptureTopic, topicSlug } from "@/lib/topics";
import type { Locale, Resource, Teaching } from "@/lib/types";

const filters = [
  "todo",
  "ensenanzas",
  "series",
  "eventos",
  "invitados",
  "articulos"
] as const;

type ResourceFilter = (typeof filters)[number];
const catalogTabs = [
  "todo",
  "ensenanzas",
  "articulos",
  "eventos",
  "invitados"
] as const;
type CatalogItem =
  | {
      kind: "teaching";
      date: string;
      teaching: Teaching;
    }
  | {
      kind: "resource";
      date: string;
      resource: Resource;
    };

const resourceImages = {
  hero: "/images/wix/visit/biblia.webp"
};

function getLatestTeaching(teachings: Teaching[]) {
  return [...teachings].sort((a, b) => (b.date || "").localeCompare(a.date || ""))[0];
}

function isResourceFilter(value?: string): value is ResourceFilter {
  return filters.includes(value as ResourceFilter);
}

export async function ResourcesPage({
  locale,
  query,
  filter,
  series,
  topic,
  speaker,
  order
}: {
  locale: Locale;
  query?: string;
  filter?: string;
  series?: string;
  topic?: string;
  speaker?: string;
  order?: string;
}) {
  const [resources, teachings, collections] = await Promise.all([
    getResources(locale),
    getTeachings(locale),
    getCollections(locale)
  ]);
  const selectedFilter: ResourceFilter = isResourceFilter(filter)
    ? filter
    : "todo";
  const normalizedQuery = query?.trim().toLocaleLowerCase() || "";
  const resourcePath = localePath(locale, "/recursos");
  const searchPath = localePath(locale, locale === "es" ? "/buscar" : "/search");
  const selectedOrder = order === "oldest" ? "oldest" : "newest";

  const matchesQuery = (values: Array<string | undefined>) =>
    !normalizedQuery ||
    values
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase()
      .includes(normalizedQuery);

  const latestTeaching = getLatestTeaching(teachings);
  const eventCollectionSlugs = new Set(
    collections
      .filter((collection) => collection.kind === "evento")
      .map((collection) => collection.slug)
  );
  const catalogTeachings = teachings.filter((teaching) => {
    if (selectedFilter === "todo" || selectedFilter === "ensenanzas") {
      return true;
    }
    if (selectedFilter === "invitados") {
      return teaching.collection === "orador-invitado";
    }
    if (selectedFilter === "eventos") {
      return eventCollectionSlugs.has(teaching.collection);
    }
    return false;
  });
  const catalogResources =
    selectedFilter === "todo" || selectedFilter === "articulos"
      ? resources
      : [];
  const catalogSeries = collections
    .filter((collection) =>
      catalogTeachings.some(
        (teaching) => teaching.collection === collection.slug
      )
    )
    .sort((a, b) => a.name.localeCompare(b.name, locale));
  const catalogTopics = Array.from(
    new Set([
      ...catalogTeachings.flatMap((teaching) => teaching.tags),
      ...catalogResources.flatMap((resource) => resource.tags)
    ])
  ).sort((a, b) => a.localeCompare(b, locale));
  const catalogSpeakers = Array.from(
    new Set(
      [...catalogTeachings, ...catalogResources]
        .map((item) => item.author)
        .filter((author): author is string => Boolean(author))
    )
  ).sort((a, b) => a.localeCompare(b, locale));
  const catalogFilterItems = [...catalogTeachings, ...catalogResources];
  const catalogTopicFrequency = catalogFilterItems
    .flatMap((item) => item.tags)
    .reduce((counts, item) => {
      counts.set(item, (counts.get(item) || 0) + 1);
      return counts;
    }, new Map<string, number>());
  const heroTopicFrequency = [...teachings, ...resources]
    .flatMap((item) => item.tags)
    .reduce((counts, item) => {
      counts.set(item, (counts.get(item) || 0) + 1);
      return counts;
    }, new Map<string, number>());
  const popularScriptureBooks = Array.from(catalogTopicFrequency)
    .filter(([name]) => isScriptureTopic(name))
    .sort(
      ([topicA, countA], [topicB, countB]) =>
        countB - countA || topicA.localeCompare(topicB, locale)
    )
    .slice(0, 10)
    .map(([item]) => item);
  const popularTopics = Array.from(catalogTopicFrequency)
    .filter(([name]) => !isScriptureTopic(name))
    .sort(
      ([topicA, countA], [topicB, countB]) =>
        countB - countA || topicA.localeCompare(topicB, locale)
    )
    .slice(0, 10)
    .map(([item]) => item);
  const heroPopularTopics = Array.from(heroTopicFrequency)
    .filter(([name]) => !isScriptureTopic(name))
    .sort(
      ([topicA, countA], [topicB, countB]) =>
        countB - countA || topicA.localeCompare(topicB, locale)
    )
    .slice(0, 10)
    .map(([item]) => item);

  const filteredCollections = collections.filter((collection) =>
    matchesQuery([
      collection.name,
      collection.description,
      collection.kind
    ])
  );

  const teachingItems: CatalogItem[] = catalogTeachings
    .filter((teaching) =>
      matchesQuery([
        teaching.title,
        teaching.excerpt,
        teaching.author,
        teaching.collection,
        ...teaching.tags
      ])
    )
    .filter((teaching) => !series || teaching.collection === series)
    .filter((teaching) => !topic || teaching.tags.includes(topic))
    .filter((teaching) => !speaker || teaching.author === speaker)
    .map((teaching) => ({
      kind: "teaching",
      teaching,
      date: teaching.date || ""
    }));

  const resourceItems: CatalogItem[] = catalogResources
    .filter((resource) =>
      matchesQuery([
        resource.title,
        resource.excerpt,
        resource.author,
        ...resource.tags
      ])
    )
    .filter(() => !series)
    .filter((resource) => !topic || resource.tags.includes(topic))
    .filter((resource) => !speaker || resource.author === speaker)
    .map((resource) => ({
      kind: "resource",
      resource,
      date: resource.date || ""
    }));

  const catalogItems = [...teachingItems, ...resourceItems].sort((a, b) =>
    selectedOrder === "oldest"
      ? a.date.localeCompare(b.date)
      : b.date.localeCompare(a.date)
  );
  const clearCatalogFiltersParams = new URLSearchParams();
  if (selectedFilter !== "todo") {
    clearCatalogFiltersParams.set("tipo", selectedFilter);
  }
  if (query?.trim()) clearCatalogFiltersParams.set("q", query.trim());
  const clearCatalogFiltersSearch = clearCatalogFiltersParams.toString();
  const clearCatalogFiltersPath = clearCatalogFiltersSearch
    ? `${resourcePath}?${clearCatalogFiltersSearch}`
    : resourcePath;
  const catalogPaginationKey = [
    selectedFilter,
    series || "",
    topic || "",
    speaker || "",
    selectedOrder,
    normalizedQuery
  ].join(":");

  const labels =
    locale === "es"
      ? {
          title: (
            <>
              <em>Recursos</em>
            </>
          ),
          intro:
            "Enseñanzas, series, eventos, artículos y contenidos para conocer a Cristo y vivir el evangelio.",
          search: "Buscar recursos",
          placeholder: "Ej. Efesios, familia, evangelio",
          action: "Buscar",
          latestTeaching: "Última Enseñanza",
          bibleBooks: "Libros de la Biblia",
          popularTopics: "Temas populares",
          allTopicsLink: "Ver todas las temáticas",
          filterLabel: "Filtrar recursos",
          filters: {
            todo: "Todos",
            ensenanzas: "Enseñanzas",
            series: "Series y eventos",
            eventos: "Eventos",
            invitados: "Oradores invitados",
            articulos: "Artículos"
          },
          sections: {
            series: "Series y eventos",
            ensenanzas: "Enseñanzas",
            articulos: "Artículos"
          },
          catalogTitle: "Catálogo",
          articleLabel: "Artículo",
          teachingFilters: "Filtrar",
          seriesLabel: "Serie o evento",
          allSeries: "Serie o evento",
          topicLabel: "Tema",
          allTopics: "Tema",
          speakerLabel: "Autor",
          allSpeakers: "Autor",
          orderLabel: "Ordenar por",
          orderNewest: "Orden: más recientes",
          orderOldest: "Orden: más antiguas",
          applyFilters: "Aplicar filtros",
          clearFilters: "Limpiar filtros",
          filterButton: "Filtrar",
          filterClose: "Cerrar filtros",
          activeFiltersLabel: "Filtros activos",
          removeFilter: "Quitar filtro",
          resultCount: (count: number) =>
            `${count} ${count === 1 ? "entrada" : "entradas"}`,
          noMaterials: "No hay materiales que coincidan con estos filtros.",
          loadMore: "Cargar más",
          empty: "No encontramos recursos",
          clear: "Ver todos los recursos",
          expositoryTitle: (
            <>
              Predicación <em>expositiva</em>
            </>
          ),
          expositoryParagraphs: [
            <>
              En Iglesia Pilar creemos que la <strong>Palabra de Dios</strong> debe
              ocupar el centro de la vida de la iglesia. Por eso practicamos la{" "}
              <strong>predicación expositiva</strong>: buscamos comprender cada pasaje
              en su contexto, explicar fielmente su mensaje y mostrar cómo el{" "}
              <strong>evangelio</strong> transforma nuestra vida cotidiana.
            </>,
            <>
              Predicar expositivamente no consiste solamente en estudiar un texto
              bíblico con profundidad. Significa permitir que la intención y el
              mensaje de la <strong>Escritura</strong> dirijan cada enseñanza, para
              conocer mejor a <strong>Dios</strong>, crecer como{" "}
              <strong>discípulos de Jesús</strong> y vivir nuestra{" "}
              <strong>fe en comunidad</strong>.
            </>
          ],
          expositoryCta: "Conoce más"
        }
      : {
          title: (
            <>
              <em>Resources</em>
            </>
          ),
          intro:
            "Teachings, series, events, articles, and content to know Christ and live the gospel.",
          search: "Search resources",
          placeholder: "E.g. Ephesians, family, gospel",
          action: "Search",
          latestTeaching: "Latest teaching",
          bibleBooks: "Books of the Bible",
          popularTopics: "Popular topics",
          allTopicsLink: "View all topics",
          filterLabel: "Filter resources",
          filters: {
            todo: "All",
            ensenanzas: "Teachings",
            series: "Series and events",
            eventos: "Events",
            invitados: "Guest speakers",
            articulos: "Articles"
          },
          sections: {
            series: "Series and events",
            ensenanzas: "Teachings",
            articulos: "Articles"
          },
          catalogTitle: "Catalog",
          articleLabel: "Article",
          teachingFilters: "Filter",
          seriesLabel: "Series or event",
          allSeries: "Series or event",
          topicLabel: "Topic",
          allTopics: "Topic",
          speakerLabel: "Author",
          allSpeakers: "Author",
          orderLabel: "Sort by",
          orderNewest: "Sort: newest",
          orderOldest: "Sort: oldest",
          applyFilters: "Apply filters",
          clearFilters: "Clear filters",
          filterButton: "Filter",
          filterClose: "Close filters",
          activeFiltersLabel: "Active filters",
          removeFilter: "Remove filter",
          resultCount: (count: number) =>
            `${count} ${count === 1 ? "entry" : "entries"}`,
          noMaterials: "No materials match these filters.",
          loadMore: "Load more",
          empty: "No resources found",
          clear: "View all resources",
          expositoryTitle: (
            <>
              Expository <em>preaching</em>
            </>
          ),
          expositoryParagraphs: [
            <>
              At Iglesia Pilar we believe <strong>God&apos;s Word</strong> must hold
              the center of the church&apos;s life. That is why we practice{" "}
              <strong>expository preaching</strong>: we seek to understand each passage
              in its context, explain its message faithfully, and show how the{" "}
              <strong>gospel</strong> transforms our everyday life.
            </>,
            <>
              Expository preaching is not only about studying a biblical text in depth.
              It means letting the intention and message of <strong>Scripture</strong>{" "}
              direct every teaching, so we may know <strong>God</strong> better, grow
              as <strong>disciples of Jesus</strong>, and live out our{" "}
              <strong>faith in community</strong>.
            </>
          ],
          expositoryCta: "Learn more"
        };

  const activeCatalogTab = selectedFilter;

  const activeFiltersCount =
    (series ? 1 : 0) + (topic ? 1 : 0) + (speaker ? 1 : 0);

  const activeFiltersList: Array<{
    id: string;
    label: string;
    removeHref: string;
  }> = [];

  if (series) {
    const seriesObj =
      catalogSeries.find((s) => s.slug === series) ||
      collections.find((c) => c.slug === series);
    const seriesName = seriesObj?.name || series;
    const p = new URLSearchParams();
    if (selectedFilter !== "todo") p.set("tipo", selectedFilter);
    if (query?.trim()) p.set("q", query.trim());
    if (topic) p.set("tema", topic);
    if (speaker) p.set("predicador", speaker);
    if (selectedOrder === "oldest") p.set("orden", "oldest");
    const search = p.toString();
    const href = search
      ? `${resourcePath}?${search}#catalogo`
      : `${resourcePath}#catalogo`;
    activeFiltersList.push({
      id: "series",
      label: `${labels.seriesLabel}: ${seriesName}`,
      removeHref: href
    });
  }

  if (topic) {
    const p = new URLSearchParams();
    if (selectedFilter !== "todo") p.set("tipo", selectedFilter);
    if (query?.trim()) p.set("q", query.trim());
    if (series) p.set("serie", series);
    if (speaker) p.set("predicador", speaker);
    if (selectedOrder === "oldest") p.set("orden", "oldest");
    const search = p.toString();
    const href = search
      ? `${resourcePath}?${search}#catalogo`
      : `${resourcePath}#catalogo`;
    activeFiltersList.push({
      id: "topic",
      label: `${labels.topicLabel}: ${topic}`,
      removeHref: href
    });
  }

  if (speaker) {
    const p = new URLSearchParams();
    if (selectedFilter !== "todo") p.set("tipo", selectedFilter);
    if (query?.trim()) p.set("q", query.trim());
    if (series) p.set("serie", series);
    if (topic) p.set("tema", topic);
    if (selectedOrder === "oldest") p.set("orden", "oldest");
    const search = p.toString();
    const href = search
      ? `${resourcePath}?${search}#catalogo`
      : `${resourcePath}#catalogo`;
    activeFiltersList.push({
      id: "speaker",
      label: `${labels.speakerLabel}: ${speaker}`,
      removeHref: href
    });
  }

  function catalogTabHref(nextFilter: (typeof catalogTabs)[number]) {
    const params = new URLSearchParams({ tipo: nextFilter });
    if (query?.trim()) params.set("q", query.trim());
    if (selectedOrder === "oldest") params.set("orden", "oldest");
    return `${resourcePath}?${params}`;
  }

  function popularTopicHref(nextTopic: string) {
    return localePath(
      locale,
      `/recursos/temas/${topicSlug(nextTopic)}`
    );
  }

  function filterTopicHref(nextTopic: string) {
    const params = new URLSearchParams({
      tipo: activeCatalogTab,
      tema: nextTopic
    });
    if (query?.trim()) params.set("q", query.trim());
    if (series) params.set("serie", series);
    if (speaker) params.set("predicador", speaker);
    if (selectedOrder === "oldest") params.set("orden", "oldest");
    return `${resourcePath}?${params.toString()}#catalogo`;
  }

  function renderCatalogItem(item: CatalogItem) {
    if (item.kind === "teaching") {
      return (
        <TeachingCard
          key={`teaching-${item.teaching.slug}`}
          teaching={item.teaching}
        />
      );
    }

    const resource = item.resource;
    return (
      <article
        className="resource-card catalog-resource-card"
        key={`resource-${resource.slug}`}
      >
        <p className="eyebrow">{labels.articleLabel}</p>
        <h2>
          <Link href={localePath(locale, `/recursos/${resource.slug}`)}>
            {resource.title}
          </Link>
        </h2>
        {resource.excerpt && <p>{resource.excerpt}</p>}
        <div className="card-meta">
          {resource.author && <span>{resource.author}</span>}
          {resource.date && (
            <time dateTime={resource.date}>
              {formatDate(resource.date, locale)}
            </time>
          )}
        </div>
      </article>
    );
  }

  return (
    <>
      <SiteHeader locale={locale} />
      <main>
        <section className="about-page-hero resources-hero">
          <div className="container about-page-hero-inner resources-hero-inner">
            <div className="about-page-hero-copy resources-hero-copy">
              <h1>
                <span className="about-intro-headline">{labels.title}</span>
              </h1>
              <div className="about-page-copy">
                <p>{labels.intro}</p>
              </div>
              <form
                action={searchPath}
                className="filter-bar resources-hero-search search-page-form"
                method="get"
              >
                <label htmlFor="resource-query">{labels.search}</label>
                <div>
                  <input
                    defaultValue={query}
                    id="resource-query"
                    name="q"
                    placeholder={labels.placeholder}
                    type="search"
                  />
                  <button className="button" type="submit">
                    {labels.action}
                  </button>
                </div>
              </form>
              {heroPopularTopics.length > 0 && (
                <div className="resources-popular-topics">
                  <div>
                    {heroPopularTopics.map((item) => (
                      <Link href={popularTopicHref(item)} key={item}>
                        {item}
                      </Link>
                    ))}
                  </div>
                  <Link
                    className="resources-topics-all"
                    href={localePath(locale, "/recursos/temas")}
                  >
                    {labels.allTopicsLink} →
                  </Link>
                </div>
              )}
            </div>

            <div className="about-page-hero-media resources-hero-media">
              {latestTeaching ? (
                <Link
                  aria-label={`${labels.latestTeaching}: ${latestTeaching.title}`}
                  className="resources-hero-latest"
                  href={localePath(
                    locale,
                    `/ensenanzas/${latestTeaching.collection}/${latestTeaching.slug}`
                  )}
                >
                  {latestTeaching.image && (
                    <span className="resources-hero-latest-image">
                      <span className="resources-hero-latest-badge">
                        {labels.latestTeaching}
                      </span>
                      <Image
                        src={latestTeaching.image}
                        alt=""
                        fill
                        priority
                        sizes="(max-width: 979px) 100vw, 50vw"
                      />
                    </span>
                  )}
                  <div className="resources-hero-latest-copy">
                    <h3>{latestTeaching.title}</h3>
                    <div className="card-meta">
                      {latestTeaching.author && (
                        <span>{latestTeaching.author}</span>
                      )}
                      {latestTeaching.date && (
                        <time dateTime={latestTeaching.date}>
                          {formatDate(latestTeaching.date, locale)}
                        </time>
                      )}
                    </div>
                  </div>
                </Link>
              ) : (
                <Image
                  src={resourceImages.hero}
                  alt={
                    locale === "es"
                      ? "Persona leyendo la Biblia en Iglesia Pilar"
                      : "Person reading the Bible at Iglesia Pilar"
                  }
                  fill
                  priority
                  sizes="(max-width: 979px) 100vw, 50vw"
                />
              )}
            </div>
          </div>
        </section>

        {filteredCollections.length > 0 && (
          <section className="section resource-hub-section" data-reveal>
            <div className="container">
              <div className="subsection-heading">
                <h2>{labels.sections.series}</h2>
              </div>
              <div className="collection-grid">
                {filteredCollections.map((collection) => (
                  <CollectionCard
                    compact
                    key={collection.slug}
                    collection={collection}
                    count={
                      teachings.filter(
                        (teaching) =>
                          teaching.collection === collection.slug
                      ).length
                    }
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {selectedFilter !== "series" && (
          <section
            className="section resource-hub-section resource-catalog-section"
            id="catalogo"
            data-reveal
          >
          <div className="container">
            <div className="subsection-heading resource-teachings-heading">
              <h2>{labels.catalogTitle}</h2>
              <div className="resource-teachings-heading-tools">
                <p>{labels.resultCount(catalogItems.length)}</p>
              </div>
            </div>
            <div className="resource-catalog-toolbar">
              <nav
                className="resource-catalog-tabs"
                aria-label={labels.filterLabel}
              >
                {catalogTabs.map((item) => (
                  <Link
                    aria-current={
                      activeCatalogTab === item ? "page" : undefined
                    }
                    className={
                      activeCatalogTab === item ? "active" : undefined
                    }
                    href={catalogTabHref(item)}
                    key={item}
                    scroll={false}
                  >
                    {labels.filters[item]}
                  </Link>
                ))}
              </nav>
              <div className="resource-catalog-toolbar-actions">
                <ResourceFiltersDrawer
                  activeCatalogTab={activeCatalogTab}
                  activeCount={activeFiltersCount}
                  allTopicsHref={localePath(locale, "/recursos/temas")}
                  catalogSeries={catalogSeries}
                  catalogSpeakers={catalogSpeakers}
                  catalogTopics={catalogTopics}
                  clearCatalogFiltersPath={clearCatalogFiltersPath}
                  labels={{
                    filterButton: labels.filterButton,
                    title: labels.teachingFilters,
                    close: labels.filterClose,
                    seriesLabel: labels.seriesLabel,
                    allSeries: labels.allSeries,
                    topicLabel: labels.topicLabel,
                    allTopics: labels.allTopics,
                    speakerLabel: labels.speakerLabel,
                    allSpeakers: labels.allSpeakers,
                    bibleBooks: labels.bibleBooks,
                    popularTopics: labels.popularTopics,
                    allTopicsLink: labels.allTopicsLink,
                    applyFilters: labels.applyFilters,
                    clearFilters: labels.clearFilters
                  }}
                  popularScriptureBooks={popularScriptureBooks}
                  popularTopics={popularTopics}
                  query={query}
                  resourcePath={resourcePath}
                  selectedOrder={selectedOrder}
                  series={series}
                  speaker={speaker}
                  topic={topic}
                />
                <ResourceTeachingSort
                  label={labels.orderLabel}
                  newestLabel={labels.orderNewest}
                  oldestLabel={labels.orderOldest}
                  selectedOrder={selectedOrder}
                />
              </div>
            </div>
            <div className="resource-teachings-layout">
              <aside className="resource-teaching-filters resource-teaching-filters-desktop">
                <h3>{labels.teachingFilters}</h3>
                <form action={resourcePath} method="get">
                  <input name="tipo" type="hidden" value={activeCatalogTab} />
                  {query?.trim() && (
                    <input name="q" type="hidden" value={query.trim()} />
                  )}
                  {selectedOrder === "oldest" && (
                    <input name="orden" type="hidden" value="oldest" />
                  )}

                  {catalogSeries.length > 0 && (
                    <label>
                      <select
                        aria-label={labels.seriesLabel}
                        name="serie"
                        defaultValue={series || ""}
                      >
                        <option value="">{labels.allSeries}</option>
                        {catalogSeries.map((collection) => (
                          <option key={collection.slug} value={collection.slug}>
                            {collection.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}

                  {catalogTopics.length > 0 && (
                    <label>
                      <select
                        aria-label={labels.topicLabel}
                        name="tema"
                        defaultValue={topic || ""}
                      >
                        <option value="">{labels.allTopics}</option>
                        {catalogTopics.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}

                  {catalogSpeakers.length > 0 && (
                    <label>
                      <select
                        aria-label={labels.speakerLabel}
                        name="predicador"
                        defaultValue={speaker || ""}
                      >
                        <option value="">{labels.allSpeakers}</option>
                        {catalogSpeakers.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}

                  {popularScriptureBooks.length > 0 && (
                    <div className="resource-filter-popular-topics">
                      <p>{labels.bibleBooks}</p>
                      <div>
                        {popularScriptureBooks.map((item) => (
                          <Link
                            aria-current={topic === item ? "true" : undefined}
                            className={topic === item ? "active" : undefined}
                            href={filterTopicHref(item)}
                            key={item}
                            scroll={false}
                          >
                            {item}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {popularTopics.length > 0 && (
                    <div className="resource-filter-popular-topics">
                      <p>{labels.popularTopics}</p>
                      <div>
                        {popularTopics.map((item) => (
                          <Link
                            aria-current={topic === item ? "true" : undefined}
                            className={topic === item ? "active" : undefined}
                            href={filterTopicHref(item)}
                            key={item}
                            scroll={false}
                          >
                            {item}
                          </Link>
                        ))}
                      </div>
                      <Link
                        className="resources-topics-all"
                        href={localePath(locale, "/recursos/temas")}
                      >
                        {labels.allTopicsLink} →
                      </Link>
                    </div>
                  )}

                  <div className="resource-filter-actions">
                    <button className="button" type="submit">
                      {labels.applyFilters}
                    </button>
                    <Link
                      className="resource-filter-clear"
                      href={clearCatalogFiltersPath}
                      scroll={false}
                    >
                      {labels.clearFilters}
                    </Link>
                  </div>
                </form>
              </aside>

              <div className="resource-teachings-results">
                {activeFiltersList.length > 0 && (
                  <div className="resource-active-filters">
                    <span className="resource-active-filters-label">
                      {labels.activeFiltersLabel}:
                    </span>
                    <div className="resource-active-filters-list">
                      {activeFiltersList.map((filterItem) => (
                        <Link
                          aria-label={`${labels.removeFilter}: ${filterItem.label}`}
                          className="resource-active-filter-chip"
                          href={filterItem.removeHref}
                          key={filterItem.id}
                          scroll={false}
                        >
                          <span>{filterItem.label}</span>
                          <span
                            aria-hidden="true"
                            className="resource-active-filter-remove"
                          >
                            ✕
                          </span>
                        </Link>
                      ))}
                      <Link
                        className="resource-active-filter-clear-all"
                        href={clearCatalogFiltersPath}
                        scroll={false}
                      >
                        {labels.clearFilters}
                      </Link>
                    </div>
                  </div>
                )}

                {catalogItems.length > 0 ? (
                  <ResourceCatalogGrid
                    key={catalogPaginationKey}
                    loadMoreLabel={labels.loadMore}
                  >
                    {catalogItems.map(renderCatalogItem)}
                  </ResourceCatalogGrid>
                ) : (
                  <div className="resource-filter-empty">
                    <p>{labels.noMaterials}</p>
                    <Link
                      className="button secondary"
                      href={clearCatalogFiltersPath}
                      scroll={false}
                    >
                      {labels.clearFilters}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
          </section>
        )}

        <section className="section resource-hub-section resources-expository-section">
          <div className="container">
            <div className="resources-expository-layout" data-reveal>
              <div className="resources-expository-heading">
                <h2>{labels.expositoryTitle}</h2>
              </div>
              <div className="resources-expository-body">
                <div className="about-page-copy">
                  {labels.expositoryParagraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
              <Link
                className="button secondary resources-expository-cta"
                href={localePath(locale, "/conocenos")}
              >
                {labels.expositoryCta}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
