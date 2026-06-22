import { NextResponse } from "next/server";
import { fetchSeries, SERIES } from "@/lib/fred";

export async function GET() {
  try {
    const [gdp, cpi, unemployment, fedFunds, yield10y, yield2y, yield3m, pce, retail, m2] =
      await Promise.all([
        fetchSeries(SERIES.GDP, 20),
        fetchSeries(SERIES.CPI, 24),
        fetchSeries(SERIES.UNEMPLOYMENT, 24),
        fetchSeries(SERIES.FED_FUNDS, 24),
        fetchSeries(SERIES.YIELD_10Y, 60),
        fetchSeries(SERIES.YIELD_2Y, 60),
        fetchSeries(SERIES.YIELD_3M, 60),
        fetchSeries(SERIES.PCE, 24),
        fetchSeries(SERIES.RETAIL_SALES, 24),
        fetchSeries(SERIES.M2, 24),
      ]);

    return NextResponse.json({ gdp, cpi, unemployment, fedFunds, yield10y, yield2y, yield3m, pce, retail, m2 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
