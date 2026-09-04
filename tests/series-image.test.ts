import assert from "node:assert/strict";
import test from "node:test";

import { seriesImage } from "../lib/series-image";
import type { Collection } from "../lib/types";

const collection: Collection = {
  slug: "marcos",
  name: "Marcos",
  kind: "serie",
  description: "",
  image: "/horizontal.jpg",
  imageSquare: "/square.jpg",
  imageVertical: "/vertical.jpg",
  locale: "es"
};

test("selects the requested series artwork format", () => {
  assert.equal(seriesImage(collection, "horizontal"), "/horizontal.jpg");
  assert.equal(seriesImage(collection, "square"), "/square.jpg");
  assert.equal(seriesImage(collection, "vertical"), "/vertical.jpg");
});

test("falls back to an available series artwork", () => {
  assert.equal(
    seriesImage({ ...collection, imageSquare: undefined }, "square"),
    "/horizontal.jpg"
  );
  assert.equal(
    seriesImage({ ...collection, image: undefined, imageSquare: undefined }, "horizontal"),
    "/vertical.jpg"
  );
});
