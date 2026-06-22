import { NextResponse } from "next/server";
import { screenCompanies, getProfile, getRatios, getIncomeStatements } from "@/lib/fmp";
import { scoreCompany } from "@/lib/scoring";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sector = searchParams.get("sector") ?? undefined;
  const maxCap = Number(searchParams.get("maxCap") ?? 10_000_000_000);
  const minCap = Number(searchParams.get("minCap") ?? 100_000_000);

  try {
    const candidates = await screenCompanies({
      marketCapMoreThan: minCap,
      marketCapLowerThan: maxCap,
      sector,
      limit: 20,
    });

    if (!candidates.length) {
      return NextResponse.json([]);
    }

    // Fetch details for top candidates (limit to 10 to stay within free tier)
    const detailed = await Promise.allSettled(
      candidates.slice(0, 10).map(async (c) => {
        const [profile, ratios, income] = await Promise.all([
          getProfile(c.symbol),
          getRatios(c.symbol),
          getIncomeStatements(c.symbol, 4),
        ]);
        if (!profile || !ratios) return null;
        return scoreCompany(c.symbol, profile, ratios, income, c.marketCap, c.price);
      })
    );

    const results = detailed
      .filter((r) => r.status === "fulfilled" && r.value !== null)
      .map((r) => (r as PromiseFulfilledResult<ReturnType<typeof scoreCompany>>).value)
      .sort((a, b) => b.scores.total - a.scores.total);

    return NextResponse.json(results);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
