import assert from "node:assert/strict";
import test from "node:test";

import {
  collections,
  englishTeachings,
  spanishTeachings,
  translationPairs
} from "../lib/content/fallback";
import { legacyRedirects } from "../lib/redirects";

test("all legacy teachings belong to an existing collection", () => {
  const collectionKeys = new Set(
    collections.map((collection) => `${collection.locale}:${collection.slug}`)
  );
  for (const teaching of [...spanishTeachings, ...englishTeachings]) {
    assert.ok(
      collectionKeys.has(`${teaching.locale}:${teaching.collection}`),
      `${teaching.slug} has an unknown collection`
    );
  }
});

test("the public migration inventory contains 42 Spanish and 12 English teachings", () => {
  assert.equal(
    spanishTeachings.filter((teaching) => teaching.legacy).length,
    42
  );
  assert.equal(englishTeachings.length, 12);
});

test("legacy teaching redirects use a single direct destination", () => {
  const redirectSources = new Set(legacyRedirects.map((item) => item.source));
  assert.equal(redirectSources.size, legacyRedirects.length);

  for (const redirect of legacyRedirects) {
    assert.equal(redirect.permanent, true);
    assert.ok(!redirectSources.has(redirect.destination));
  }
});

test("no teaching is published at /ensenanzas/:slug", () => {
  for (const teaching of spanishTeachings) {
    const destination = `/ensenanzas/${teaching.collection}/${teaching.slug}`;
    assert.equal(destination.split("/").filter(Boolean).length, 3);
  }
});

test("all translation pairs resolve to known teachings", () => {
  const es = new Set(
    spanishTeachings.map(
      (teaching) => `${teaching.collection}/${teaching.slug}`
    )
  );
  const en = new Set(
    englishTeachings.map(
      (teaching) => `${teaching.collection}/${teaching.slug}`
    )
  );

  for (const pair of Object.values(translationPairs)) {
    assert.ok(es.has(`${pair.es.collection}/${pair.es.slug}`));
    assert.ok(en.has(`${pair.en.collection}/${pair.en.slug}`));
  }
});
