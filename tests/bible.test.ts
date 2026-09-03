import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { parseReference, toPassageId } from "../lib/bible.js";

describe("parseReference", () => {
  it("parses simple verse reference", () => {
    const result = parseReference("Juan 3:16");
    assert.deepStrictEqual(result, {
      book: "JHN",
      chapter: 3,
      startVerse: 16,
    });
  });

  it("parses verse range with en-dash", () => {
    const result = parseReference("Romanos 3:21–26");
    assert.deepStrictEqual(result, {
      book: "ROM",
      chapter: 3,
      startVerse: 21,
      endVerse: 26,
    });
  });

  it("parses verse range with regular dash", () => {
    const result = parseReference("Romanos 3:21-26");
    assert.deepStrictEqual(result, {
      book: "ROM",
      chapter: 3,
      startVerse: 21,
      endVerse: 26,
    });
  });

  it("parses numbered book (2 Corintios)", () => {
    const result = parseReference("2 Corintios 9:7");
    assert.deepStrictEqual(result, {
      book: "2CO",
      chapter: 9,
      startVerse: 7,
    });
  });

  it("parses 1 Tesalonicenses range", () => {
    const result = parseReference("1 Tesalonicenses 4:13–18");
    assert.deepStrictEqual(result, {
      book: "1TH",
      chapter: 4,
      startVerse: 13,
      endVerse: 18,
    });
  });

  it("parses Salmo (Psalms)", () => {
    const result = parseReference("Salmo 19:7–10");
    assert.deepStrictEqual(result, {
      book: "PSA",
      chapter: 19,
      startVerse: 7,
      endVerse: 10,
    });
  });

  it("parses single-chapter book (Judas)", () => {
    const result = parseReference("Judas 24–25");
    assert.deepStrictEqual(result, {
      book: "JUD",
      chapter: 1,
      startVerse: 24,
      endVerse: 25,
    });
  });

  it("parses Apocalipsis", () => {
    const result = parseReference("Apocalipsis 20:11–12");
    assert.deepStrictEqual(result, {
      book: "REV",
      chapter: 20,
      startVerse: 11,
      endVerse: 12,
    });
  });

  it("parses Génesis with accent", () => {
    const result = parseReference("Génesis 3:6–24");
    assert.deepStrictEqual(result, {
      book: "GEN",
      chapter: 3,
      startVerse: 6,
      endVerse: 24,
    });
  });

  it("parses Efesios", () => {
    const result = parseReference("Efesios 2:1–3");
    assert.deepStrictEqual(result, {
      book: "EPH",
      chapter: 2,
      startVerse: 1,
      endVerse: 3,
    });
  });

  it("parses English references", () => {
    const result = parseReference("John 3:16");
    assert.deepStrictEqual(result, {
      book: "JHN",
      chapter: 3,
      startVerse: 16,
    });
  });

  it("parses Hebrews", () => {
    const result = parseReference("Hebrews 10:24–25");
    assert.deepStrictEqual(result, {
      book: "HEB",
      chapter: 10,
      startVerse: 24,
      endVerse: 25,
    });
  });

  it("parses Acts", () => {
    const result = parseReference("Acts 2:42–47");
    assert.deepStrictEqual(result, {
      book: "ACT",
      chapter: 2,
      startVerse: 42,
      endVerse: 47,
    });
  });

  it("parses 2 Corinthians in English", () => {
    const result = parseReference("2 Corinthians 9:7");
    assert.deepStrictEqual(result, {
      book: "2CO",
      chapter: 9,
      startVerse: 7,
    });
  });

  it("parses 1 Timoteo", () => {
    const result = parseReference("1 Timoteo 3:15");
    assert.deepStrictEqual(result, {
      book: "1TI",
      chapter: 3,
      startVerse: 15,
    });
  });

  it("parses Malaquías with accent", () => {
    const result = parseReference("Malaquías 3:18");
    assert.deepStrictEqual(result, {
      book: "MAL",
      chapter: 3,
      startVerse: 18,
    });
  });

  it("parses Filipenses", () => {
    const result = parseReference("Filipenses 3:7–9");
    assert.deepStrictEqual(result, {
      book: "PHP",
      chapter: 3,
      startVerse: 7,
      endVerse: 9,
    });
  });

  it("parses Isaías", () => {
    const result = parseReference("Isaías 55:1");
    assert.deepStrictEqual(result, {
      book: "ISA",
      chapter: 55,
      startVerse: 1,
    });
  });

  it("returns null for invalid reference", () => {
    assert.strictEqual(parseReference(""), null);
    assert.strictEqual(parseReference("not a reference"), null);
  });
});

describe("toPassageId", () => {
  it("converts single verse", () => {
    assert.strictEqual(toPassageId("Juan 3:16"), "JHN.3.16");
  });

  it("converts verse range", () => {
    assert.strictEqual(toPassageId("Romanos 3:21–26"), "ROM.3.21-ROM.3.26");
  });

  it("converts numbered book", () => {
    assert.strictEqual(toPassageId("2 Corintios 9:7"), "2CO.9.7");
  });

  it("converts single-chapter book", () => {
    assert.strictEqual(toPassageId("Judas 24–25"), "JUD.1.24-JUD.1.25");
  });

  it("returns null for invalid", () => {
    assert.strictEqual(toPassageId(""), null);
  });
});

describe("cross-chapter parsing", () => {
  it("parses cross chapter", () => {
    const result = parseReference("Marcos 8:22-9:1");
    assert.deepStrictEqual(result, {
      book: "MRK",
      chapter: 8,
      startVerse: 22,
      endChapter: 9,
      endVerse: 1
    });
  });

  it("generates correct passageId for cross chapter", () => {
    assert.strictEqual(toPassageId("Marcos 8:22-9:1"), "MRK.8.22-MRK.9.1");
  });
});
