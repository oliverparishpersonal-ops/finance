import { NextResponse } from "next/server";
import { getMarketNews } from "@/lib/finnhub";

export async function GET() {
  try {
    const [general, mergers] = await Promise.all([
      getMarketNews("general"),
      getMarketNews("merger"),
    ]);

    const combined = [
      ...general.map((n) => ({ ...n, tag: "general" })),
      ...mergers.map((n) => ({ ...n, tag: "merger" })),
    ].sort((a, b) => b.datetime - a.datetime);

    return NextResponse.json(combined);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
