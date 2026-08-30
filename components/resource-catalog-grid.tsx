"use client";

import { Children, useState, type ReactNode } from "react";

const PAGE_SIZE = 12;

export function ResourceCatalogGrid({
  children,
  loadMoreLabel
}: {
  children: ReactNode;
  loadMoreLabel: string;
}) {
  const items = Children.toArray(children);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const hasMore = visibleCount < items.length;

  return (
    <>
      <div className="resource-catalog-grid">
        {items.slice(0, visibleCount)}
      </div>
      {hasMore && (
        <div className="resource-catalog-load-more">
          <button
            className="button secondary"
            type="button"
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
          >
            {loadMoreLabel}
          </button>
        </div>
      )}
    </>
  );
}
