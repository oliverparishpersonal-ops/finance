const BASE = "https://finnhub.io/api/v1";
const KEY = process.env.FINNHUB_API_KEY;

export interface NewsItem {
  id: number;
  headline: string;
  summary: string;
  source: string;
  url: string;
  image: string;
  datetime: number;
  category: string;
  related: string;
}

export async function getMarketNews(category: "general" | "forex" | "crypto" | "merger" = "general"): Promise<NewsItem[]> {
  const res = await fetch(
    `${BASE}/news?category=${category}&token=${KEY}`,
    { next: { revalidate: 900 } }
  );
  if (!res.ok) throw new Error(`Finnhub error: ${res.status}`);
  const data: NewsItem[] = await res.json();
  return data.slice(0, 40);
}

export async function getCompanyNews(symbol: string, from: string, to: string): Promise<NewsItem[]> {
  const res = await fetch(
    `${BASE}/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${KEY}`,
    { next: { revalidate: 900 } }
  );
  if (!res.ok) throw new Error(`Finnhub news error: ${res.status}`);
  return res.json();
}
