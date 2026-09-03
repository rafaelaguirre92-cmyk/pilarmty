import assert from "node:assert/strict";
import test from "node:test";

import { getTopicSummaries, isTopicIndexable } from "../lib/topics";
import type { Teaching } from "../lib/types";

function teaching(slug: string, tag: string): Teaching {
  return {
    slug,
    collection: "pruebas",
    title: slug,
    locale: "es",
    tags: [tag],
    legacy: false
  };
}

test("a topic page is published automatically from three contents", () => {
  const [topic] = getTopicSummaries([
    teaching("uno", "Gracia"),
    teaching("dos", "Gracia"),
    teaching("tres", "Gracia")
  ], []);

  assert.equal(topic.count, 3);
  assert.equal(isTopicIndexable(topic), true);
});

test("a topic with fewer than three contents can be published manually", () => {
  const [topic] = getTopicSummaries(
    [teaching("uno", "Gracia")],
    [],
    new Set(["gracia"])
  );

  assert.equal(topic.manuallyPublished, true);
  assert.equal(isTopicIndexable(topic), true);
});

test("a topic with fewer than three contents stays unpublished by default", () => {
  const [topic] = getTopicSummaries([teaching("uno", "Gracia")], []);

  assert.equal(isTopicIndexable(topic), false);
});

test("a manual unpublish overrides automatic publication", () => {
  const [topic] = getTopicSummaries(
    [
      teaching("uno", "Gracia"),
      teaching("dos", "Gracia"),
      teaching("tres", "Gracia")
    ],
    [],
    new Set(),
    new Set(["gracia"])
  );

  assert.equal(topic.count, 3);
  assert.equal(topic.manuallyUnpublished, true);
  assert.equal(isTopicIndexable(topic), false);
});
