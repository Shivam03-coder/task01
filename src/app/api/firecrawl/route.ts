import { NextRequest, NextResponse } from "next/server";
import FirecrawlApp from "@mendable/firecrawl-js";

const app = new FirecrawlApp({
  apiKey:
    process.env.FIRECRAWL_API_KEY ,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, limit } = body;

    if (!url) {
      return NextResponse.json({ error: "Missing URL" }, { status: 400 });
    }

    const crawlResult = await app.crawlUrl(url, {
      limit: limit ?? 10,
      scrapeOptions: {
        formats: ["markdown"],
        onlyMainContent: true,
        parsePDF: false,
        maxAge: 14400000,
      },
    });

    return NextResponse.json({ result: crawlResult });
  } catch (error) {
    console.error("Crawl error:", error);
    return NextResponse.json({ error: "Failed to crawl" }, { status: 500 });
  }
}
