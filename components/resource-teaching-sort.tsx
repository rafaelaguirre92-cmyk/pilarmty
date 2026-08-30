"use client";

import { useRouter } from "next/navigation";
import type { ChangeEvent } from "react";

export function ResourceTeachingSort({
  label,
  newestLabel,
  oldestLabel,
  selectedOrder
}: {
  label: string;
  newestLabel: string;
  oldestLabel: string;
  selectedOrder: "newest" | "oldest";
}) {
  const router = useRouter();

  function updateOrder(event: ChangeEvent<HTMLSelectElement>) {
    const nextOrder = event.target.value;
    const url = new URL(window.location.href);

    if (nextOrder === "oldest") {
      url.searchParams.set("orden", "oldest");
    } else {
      url.searchParams.delete("orden");
    }

    router.push(`${url.pathname}${url.search}`, { scroll: false });
  }

  return (
    <select
      aria-label={label}
      className="resource-teaching-sort"
      onChange={updateOrder}
      value={selectedOrder}
    >
      <option value="newest">{newestLabel}</option>
      <option value="oldest">{oldestLabel}</option>
    </select>
  );
}
