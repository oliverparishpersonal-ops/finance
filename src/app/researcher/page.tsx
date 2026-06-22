"use client";

import { useState } from "react";
import CompanyCard from "@/components/CompanyCard";
import type { ScoredCompany } from "@/lib/scoring";

const SECTORS = [
  "All",
  "Technology",
  "Healthcare",
  "Consumer Cyclical",
  "Industrials",
  "Financial Services",
  "Communication Services",
  "Energy",
  "Basic Materials",
  "Real Estate",
];

const CAP_PRESETS = [
  { label: "Micro (<$300M)", min: 50_000_000, max: 300_000_000 },
  { label: "Small ($300M–$2B)", min: 300_000_000, max: 2_000_000_000 },
  { label: "Mid ($2B–$10B)", min: 2_000_000_000, max: 10_000_000_000 },
  { label: "Micro + Small", min: 50_000_000, max: 2_000_000_000 },
];

export default function ResearcherPage() {
  const [sector, setSector] = useState("All");
  const [capPreset, setCapPreset] = useState(1);
  const [results, setResults] = useState<ScoredCompany[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const preset = CAP_PRESETS[capPreset];
      const params = new URLSearchParams({
        minCap: String(preset.min),
        maxCap: String(preset.max),
        ...(sector !== "All" ? { sector } : {}),
      });
      const res = await fetch(`/api/researcher?${params}`);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data: ScoredCompany[] = await res.json();
      if (data && (data as unknown as { error: string }).error) {
        throw new Error((data as unknown as { error: string }).error);
      }
      setResults(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white mb-1">Company Researcher</h1>
        <p className="text-sm text-zinc-500">
          Screens mid/small-cap US companies and scores them on financial health, growth trajectory, and R&D intensity.
        </p>
      </div>

      {/* Scoring methodology */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-zinc-300 mb-3 uppercase tracking-wider">Scoring Model</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-zinc-400">
          <div>
            <p className="text-indigo-400 font-semibold mb-1">Financial Health (40%)</p>
            <ul className="space-y-0.5">
              <li>Gross profit margin</li>
              <li>Operating margin</li>
              <li>Return on equity</li>
              <li>Debt ratio (lower is better)</li>
            </ul>
          </div>
          <div>
            <p className="text-emerald-400 font-semibold mb-1">Growth (40%)</p>
            <ul className="space-y-0.5">
              <li>YoY revenue growth (60%)</li>
              <li>Free cash flow per share (40%)</li>
            </ul>
          </div>
          <div>
            <p className="text-amber-400 font-semibold mb-1">Innovation (20%)</p>
            <ul className="space-y-0.5">
              <li>R&D spend as % of revenue</li>
              <li>Higher = more future-focused</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-zinc-500 block mb-2">Market Cap Range</label>
            <div className="flex flex-wrap gap-2">
              {CAP_PRESETS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setCapPreset(i)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    capPreset === i
                      ? "bg-indigo-600 border-indigo-500 text-white"
                      : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-zinc-500 block mb-2">Sector</label>
            <div className="flex flex-wrap gap-2">
              {SECTORS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSector(s)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                    sector === s
                      ? "bg-indigo-600 border-indigo-500 text-white"
                      : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button
          onClick={run}
          disabled={loading}
          className="mt-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors"
        >
          {loading ? "Scanning..." : "Run Research Scan"}
        </button>
      </div>

      {/* Results */}
      {error && (
        <div className="bg-red-950/30 border border-red-800 rounded-xl p-4 text-red-400 text-sm">
          {error.includes("API key") || error.includes("401")
            ? "FMP API key not configured. Add FMP_API_KEY to .env.local"
            : error}
        </div>
      )}

      {results && results.length === 0 && (
        <div className="text-center py-12 text-zinc-500">No companies matched the current filters.</div>
      )}

      {results && results.length > 0 && (
        <div>
          <p className="text-xs text-zinc-500 mb-4">
            {results.length} companies ranked by total score — highest upside potential first.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {results.map((c) => (
              <CompanyCard key={c.symbol} company={c} />
            ))}
          </div>
          <p className="text-xs text-zinc-600 mt-6">
            Data from Financial Modeling Prep. Not financial advice — do your own due diligence.
          </p>
        </div>
      )}
    </div>
  );
}
