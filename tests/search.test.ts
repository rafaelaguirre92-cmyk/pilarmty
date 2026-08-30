import assert from "node:assert/strict";
import test from "node:test";

import {
  normalizeSearchText,
  rankSearchItems,
  type IndexedSearchItem
} from "../lib/search";

const items: IndexedSearchItem[] = [
  {
    kind: "teaching",
    label: "Enseñanza",
    title: "La gracia de Dios",
    excerpt: "Una enseñanza sobre el evangelio.",
    href: "/ensenanzas/gracia",
    keywords: "evangelio Romanos"
  },
  {
    kind: "resource",
    label: "Recurso",
    title: "Vivir con esperanza",
    excerpt: "La gracia aparece en el contenido.",
    href: "/recursos/esperanza",
    keywords: "vida cristiana"
  }
];

test("search normalization ignores accents and punctuation", () => {
  assert.equal(normalizeSearchText("  Parábolas: Jesús  "), "parabolas jesus");
});

test("search ranking prioritizes title matches", () => {
  const results = rankSearchItems(items, "gracia");
  assert.equal(results[0]?.href, "/ensenanzas/gracia");
});

test("search tolerates a single missing character", () => {
  const results = rankSearchItems(items, "evanglio");
  assert.equal(results[0]?.href, "/ensenanzas/gracia");
});
