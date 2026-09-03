export type ParsedReference = {
  book: string;
  chapter: number;
  startVerse?: number;
  endVerse?: number;
  endChapter?: number;
};

export const BIBLE_ID_ES = "ce11b813f9a27e20-01"; // NBLA
export const BIBLE_ID_EN = "06125adad2d5898a-01"; // ASV (placeholder)

const SINGLE_CHAPTER_BOOKS = new Set(["OBA", "PHM", "2JN", "3JN", "JUD"]);

function normalizeStr(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

export const BOOK_MAP: Record<string, string> = {
  // Old Testament
  "genesis": "GEN", "gn": "GEN",
  "exodo": "EXO", "exodus": "EXO", "ex": "EXO",
  "levitico": "LEV", "leviticus": "LEV", "lv": "LEV", "le": "LEV",
  "numeros": "NUM", "numbers": "NUM", "nm": "NUM", "nu": "NUM",
  "deuteronomio": "DEU", "deuteronomy": "DEU", "dt": "DEU",
  "josue": "JOS", "joshua": "JOS",
  "jueces": "JDG", "judges": "JDG", "jue": "JDG", "jg": "JDG",
  "rut": "RUT", "ruth": "RUT", "rt": "RUT", "ru": "RUT",
  "1 samuel": "1SA", "1s": "1SA", "1 sa": "1SA", "1 sam": "1SA",
  "2 samuel": "2SA", "2s": "2SA", "2 sa": "2SA", "2 sam": "2SA",
  "1 reyes": "1KI", "1 kings": "1KI", "1r": "1KI", "1 r": "1KI", "1 re": "1KI", "1 rey": "1KI", "1 ki": "1KI",
  "2 reyes": "2KI", "2 kings": "2KI", "2r": "2KI", "2 r": "2KI", "2 re": "2KI", "2 rey": "2KI", "2 ki": "2KI",
  "1 cronicas": "1CH", "1 chronicles": "1CH", "1 cr": "1CH", "1 cro": "1CH", "1 ch": "1CH", "1 chr": "1CH",
  "2 cronicas": "2CH", "2 chronicles": "2CH", "2 cr": "2CH", "2 cro": "2CH", "2 ch": "2CH", "2 chr": "2CH",
  "esdras": "EZR", "ezra": "EZR", "esd": "EZR",
  "nehemias": "NEH", "nehemiah": "NEH", "neh": "NEH", "ne": "NEH",
  "ester": "EST", "esther": "EST", "est": "EST",
  "job": "JOB", "jb": "JOB",
  "salmos": "PSA", "salmo": "PSA", "psalms": "PSA", "psalm": "PSA", "sal": "PSA", "ps": "PSA", "sl": "PSA",
  "proverbios": "PRO", "proverbs": "PRO", "pr": "PRO", "prov": "PRO",
  "eclesiastes": "ECC", "ecclesiastes": "ECC", "ec": "ECC", "ecl": "ECC",
  "cantares": "SNG", "cantar de los cantares": "SNG", "song of solomon": "SNG", "song of songs": "SNG", "cnt": "SNG", "so": "SNG", "ss": "SNG",
  "isaias": "ISA", "isaiah": "ISA", "is": "ISA",
  "jeremias": "JER", "jeremiah": "JER", "jer": "JER", "je": "JER",
  "lamentaciones": "LAM", "lamentations": "LAM", "lm": "LAM", "lam": "LAM",
  "ezequiel": "EZK", "ezekiel": "EZK", "ez": "EZK", "eze": "EZK",
  "daniel": "DAN", "dn": "DAN", "dan": "DAN",
  "oseas": "HOS", "hosea": "HOS", "os": "HOS", "ho": "HOS",
  "joel": "JOL", "jl": "JOL",
  "amos": "AMO", "am": "AMO",
  "abdias": "OBA", "obadiah": "OBA", "abd": "OBA", "ob": "OBA",
  "jonas": "JON", "jonah": "JON", "jon": "JON",
  "miqueas": "MIC", "micah": "MIC", "mi": "MIC", "miq": "MIC",
  "nahum": "NAM", "na": "NAM",
  "habacuc": "HAB", "habakkuk": "HAB", "hab": "HAB",
  "sofonias": "ZEP", "zephaniah": "ZEP", "sof": "ZEP", "zep": "ZEP",
  "hageo": "HAG", "haggai": "HAG", "hag": "HAG", "hg": "HAG",
  "zacarias": "ZEC", "zechariah": "ZEC", "zac": "ZEC", "zec": "ZEC",
  "malaquias": "MAL", "malachi": "MAL", "mal": "MAL",

  // New Testament
  "mateo": "MAT", "matthew": "MAT", "mt": "MAT",
  "marcos": "MRK", "mark": "MRK", "mr": "MRK", "mc": "MRK", "mk": "MRK",
  "lucas": "LUK", "luke": "LUK", "lc": "LUK", "lk": "LUK",
  "juan": "JHN", "john": "JHN", "jn": "JHN",
  "hechos": "ACT", "acts": "ACT", "hch": "ACT", "ac": "ACT",
  "romanos": "ROM", "romans": "ROM", "ro": "ROM", "rom": "ROM",
  "1 corintios": "1CO", "1 corinthians": "1CO", "1 co": "1CO", "1 cor": "1CO",
  "2 corintios": "2CO", "2 corinthians": "2CO", "2 co": "2CO", "2 cor": "2CO",
  "galatas": "GAL", "galatians": "GAL", "ga": "GAL", "gal": "GAL",
  "efesios": "EPH", "ephesians": "EPH", "ef": "EPH", "eph": "EPH",
  "filipenses": "PHP", "philippians": "PHP", "flp": "PHP", "php": "PHP", "phil": "PHP",
  "colosenses": "COL", "colossians": "COL", "col": "COL",
  "1 tesalonicenses": "1TH", "1 thessalonians": "1TH", "1 ts": "1TH", "1 tes": "1TH", "1 th": "1TH",
  "2 tesalonicenses": "2TH", "2 thessalonians": "2TH", "2 ts": "2TH", "2 tes": "2TH", "2 th": "2TH",
  "1 timoteo": "1TI", "1 timothy": "1TI", "1 tm": "1TI", "1 ti": "1TI", "1 tim": "1TI",
  "2 timoteo": "2TI", "2 timothy": "2TI", "2 tm": "2TI", "2 ti": "2TI", "2 tim": "2TI",
  "tito": "TIT", "titus": "TIT", "tit": "TIT", "ti": "TIT",
  "filemon": "PHM", "philemon": "PHM", "flm": "PHM", "phm": "PHM",
  "hebreos": "HEB", "hebrews": "HEB", "he": "HEB", "heb": "HEB",
  "santiago": "JAS", "james": "JAS", "stg": "JAS", "jas": "JAS", "st": "JAS",
  "1 pedro": "1PE", "1 peter": "1PE", "1 pe": "1PE", "1 p": "1PE", "1 pt": "1PE",
  "2 pedro": "2PE", "2 peter": "2PE", "2 pe": "2PE", "2 p": "2PE", "2 pt": "2PE",
  "1 juan": "1JN", "1 john": "1JN", "1 jn": "1JN",
  "2 juan": "2JN", "2 john": "2JN", "2 jn": "2JN",
  "3 juan": "3JN", "3 john": "3JN", "3 jn": "3JN",
  "judas": "JUD", "jude": "JUD", "jud": "JUD", "jd": "JUD",
  "apocalipsis": "REV", "revelation": "REV", "revelations": "REV", "ap": "REV", "apoc": "REV", "rev": "REV"
};

export function parseReference(ref: string): ParsedReference | null {
  if (!ref) return null;
  // Match book name and the rest (verses/chapters)
  const match = ref.trim().match(/^((?:\d\s*)?[a-zA-Z\u00C0-\u024F]+(?:[\s]+[a-zA-Z\u00C0-\u024F]+)*)\.?\s+(\d.*)$/);
  if (!match) return null;

  const bookPart = match[1];
  let rest = match[2];

  let normalizedBook = normalizeStr(bookPart).replace(/\s+/g, ' ');
  let usfmCode = BOOK_MAP[normalizedBook];

  // Try to fix missing space between number and book (e.g., "1juan")
  if (!usfmCode) {
     const numMatch = normalizedBook.match(/^(\d)(.*)/);
     if(numMatch) {
        normalizedBook = `${numMatch[1]} ${numMatch[2].trim()}`;
        usfmCode = BOOK_MAP[normalizedBook];
     }
  }

  if (!usfmCode) return null;

  // Normalize en-dash/em-dash to regular dash and remove spaces
  rest = rest.replace(/\s+/g, '').replace(/[–—]/g, '-');

  let chapter: number;
  let startVerse: number | undefined;
  let endVerse: number | undefined;
  let endChapter: number | undefined;

  const rangeParts = rest.split('-');
  const left = rangeParts[0];
  const right = rangeParts[1];

  if (SINGLE_CHAPTER_BOOKS.has(usfmCode)) {
    chapter = 1;
    const leftParts = left.split(':');
    startVerse = parseInt(leftParts[leftParts.length - 1], 10);

    if (right) {
      const rightParts = right.split(':');
      endVerse = parseInt(rightParts[rightParts.length - 1], 10);
    }
  } else {
    const leftParts = left.split(':');
    if (leftParts.length > 1) {
      chapter = parseInt(leftParts[0], 10);
      startVerse = parseInt(leftParts[1], 10);
    } else {
      chapter = parseInt(leftParts[0], 10);
    }

    if (right) {
      const rightParts = right.split(':');
      if (rightParts.length > 1) {
        endChapter = parseInt(rightParts[0], 10);
        endVerse = parseInt(rightParts[1], 10);
      } else {
        if (leftParts.length > 1) {
          endVerse = parseInt(rightParts[0], 10);
        } else {
          endChapter = parseInt(rightParts[0], 10);
        }
      }
    }
  }

  if (isNaN(chapter)) return null;

  return {
    book: usfmCode,
    chapter,
    ...(startVerse && !isNaN(startVerse) ? { startVerse } : {}),
    ...(endVerse && !isNaN(endVerse) ? { endVerse } : {}),
    ...(endChapter && !isNaN(endChapter) ? { endChapter } : {})
  };
}

export function toPassageId(ref: string): string | null {
  const parsed = parseReference(ref);
  if (!parsed) return null;

  if (!parsed.startVerse) {
    const startId = `${parsed.book}.${parsed.chapter}`;
    if (parsed.endChapter) {
      return `${startId}-${parsed.book}.${parsed.endChapter}`;
    }
    return startId;
  }

  const startId = `${parsed.book}.${parsed.chapter}.${parsed.startVerse}`;

  if (parsed.endChapter && parsed.endVerse) {
    return `${startId}-${parsed.book}.${parsed.endChapter}.${parsed.endVerse}`;
  } else if (parsed.endVerse) {
    return `${startId}-${parsed.book}.${parsed.chapter}.${parsed.endVerse}`;
  }

  return startId;
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const bookKeys = Object.keys(BOOK_MAP)
  .sort((a, b) => b.length - a.length)
  .map(escapeRegExp);

export const BIBLE_REFERENCE_REGEX = new RegExp(
  `\\b(?:${bookKeys.join("|")})\\.?\\s+\\d+(?::\\d+)?(?:[–-]\\d+(?::\\d+)?)?\\b`,
  "gi"
);

export function extractBibleReferences(text: string): { type: "text" | "reference", content: string }[] {
  if (!text) return [];

  const results: { type: "text" | "reference", content: string }[] = [];
  let lastIndex = 0;
  let match;

  BIBLE_REFERENCE_REGEX.lastIndex = 0; // reset

  while ((match = BIBLE_REFERENCE_REGEX.exec(text)) !== null) {
    // Only accept it if it actually parses
    if (parseReference(match[0])) {
      if (match.index > lastIndex) {
        results.push({ type: "text", content: text.slice(lastIndex, match.index) });
      }
      results.push({ type: "reference", content: match[0] });
      lastIndex = BIBLE_REFERENCE_REGEX.lastIndex;
    }
  }

  if (lastIndex < text.length) {
    results.push({ type: "text", content: text.slice(lastIndex) });
  }

  return results;
}
