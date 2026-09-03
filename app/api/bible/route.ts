import { NextResponse } from "next/server";

const BIBLE_VERSIONS = {
  es: "ce11b813f9a27e20-01", // NBLA
  en: "06125adad2d5898a-01", // ASV
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ref = searchParams.get("ref");
    const lang = searchParams.get("lang") === "en" ? "en" : "es";

    if (!ref) {
      return NextResponse.json(
        { error: "Missing ref parameter" },
        { status: 400 }
      );
    }

    const apiKey = process.env.BIBLE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Bible API not configured" },
        { status: 500 }
      );
    }

    const bibleId = BIBLE_VERSIONS[lang];
    const url = new URL(`https://rest.api.bible/v1/bibles/${bibleId}/passages/${ref}`);
    url.searchParams.set("content-type", "text");
    url.searchParams.set("include-verse-numbers", "false");
    url.searchParams.set("include-titles", "false");

    const response = await fetch(url.toString(), {
      headers: {
        "api-key": apiKey,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch verse" },
        { status: 502 }
      );
    }

    const json = await response.json();
    const data = json.data;

    if (!data) {
      return NextResponse.json(
        { error: "Failed to fetch verse" },
        { status: 502 }
      );
    }

    const content = data.content ? data.content.trim() : "";

    return NextResponse.json(
      {
        reference: data.reference,
        content: content,
        copyright: data.copyright,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
        },
      }
    );
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to fetch verse" },
      { status: 502 }
    );
  }
}
