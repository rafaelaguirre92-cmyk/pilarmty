import assert from "node:assert/strict";
import test from "node:test";

import { normalizeColumnsParam } from "../lib/admin-list-query";

test("keeps a correctly serialized list of columns unchanged", () => {
  const params = new URLSearchParams({
    columns: JSON.stringify(["title", "author", "teachingDate"])
  });

  assert.equal(normalizeColumnsParam(params), false);
  assert.equal(params.get("columns"), '["title","author","teachingDate"]');
});

test("repairs columns that were serialized twice", () => {
  const columns = ["-image", "title", "series", "author", "teachingDate", "_status"];
  const params = new URLSearchParams({
    columns: JSON.stringify(JSON.stringify(columns))
  });

  assert.equal(normalizeColumnsParam(params), true);
  assert.equal(params.get("columns"), JSON.stringify(columns));
});

test("does not alter an invalid columns value", () => {
  const params = new URLSearchParams({ columns: "not-json" });

  assert.equal(normalizeColumnsParam(params), false);
  assert.equal(params.get("columns"), "not-json");
});
