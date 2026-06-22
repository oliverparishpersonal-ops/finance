import type { NewsItem } from "@/lib/finnhub";

export default function NewsCard({ item }: { item: NewsItem & { tag?: string } }) {
  const date = new Date(item.datetime * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-600 transition-colors group"
    >
      <div className="flex items-start gap-4">
        {item.image && (
          <img
            src={item.image}
            alt=""
            className="w-16 h-16 rounded-lg object-cover flex-shrink-0 bg-zinc-800"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-zinc-500">{item.source}</span>
            <span className="text-xs text-zinc-600">·</span>
            <span className="text-xs text-zinc-500">{date}</span>
            {item.tag === "merger" && (
              <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full">M&A</span>
            )}
          </div>
          <h4 className="text-sm font-semibold text-zinc-200 group-hover:text-white line-clamp-2 transition-colors">
            {item.headline}
          </h4>
          {item.summary && (
            <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{item.summary}</p>
          )}
        </div>
      </div>
    </a>
  );
}
