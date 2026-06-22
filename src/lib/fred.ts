const BASE = "https://api.stlouisfed.org/fred";
const KEY = process.env.FRED_API_KEY;

export interface FredObservation {
  date: string;
  value: string;
}

export async function fetchSeries(
  seriesId: string,
  limit = 60,
  sortOrder: "asc" | "desc" = "asc"
): Promise<FredObservation[]> {
  const url = `${BASE}/series/observations?series_id=${seriesId}&api_key=${KEY}&file_type=json&sort_order=${sortOrder}&limit=${limit}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`FRED error: ${res.status}`);
  const data = await res.json();
  return data.observations.filter((o: FredObservation) => o.value !== ".");
}

export const SERIES = {
  GDP: "GDP",
  CPI: "CPIAUCSL",
  UNEMPLOYMENT: "UNRATE",
  FED_FUNDS: "FEDFUNDS",
  YIELD_10Y: "DGS10",
  YIELD_2Y: "DGS2",
  YIELD_3M: "DGS3MO",
  PCE: "PCEPI",
  RETAIL_SALES: "RSAFS",
  INDUSTRIAL: "INDPRO",
  M2: "M2SL",
} as const;
