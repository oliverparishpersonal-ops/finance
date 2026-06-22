import NewsCard from "@/components/NewsCard";
import type { NewsItem } from "@/lib/finnhub";

async function getNews() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/news`, {
      next: { revalidate: 900 },
    });
    if (!res.ok) return null;
    return res.json() as Promise<Array<NewsItem & { tag: string }>>;
  } catch {
    return null;
  }
}

export default async function NewsPage() {
  const news = await getNews();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white mb-1">Business & Market News</h1>
        <p className="text-sm text-zinc-500">Live market and M&A news via Finnhub. Refreshes every 15 minutes.</p>
      </div>

      {!news ? (
        <div className="flex items-center justify-center h-64 text-zinc-500">
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">API key not configured</p>
            <p className="text-sm">Add <code className="bg-zinc-800 px-1 rounded">FINNHUB_API_KEY</code> to <code className="bg-zinc-800 px-1 rounded">.env.local</code></p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {news.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
