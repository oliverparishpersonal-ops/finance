import MacroChart from "@/components/MacroChart";
import StatCard from "@/components/StatCard";

async function getMacroData() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/macro`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function latest(series: Array<{ date: string; value: string }>) {
  return series?.[series.length - 1]?.value ?? "—";
}

function delta(series: Array<{ date: string; value: string }>) {
  if (!series || series.length < 2) return null;
  const last = parseFloat(series[series.length - 1].value);
  const prev = parseFloat(series[series.length - 2].value);
  const diff = last - prev;
  return { diff: Math.abs(diff).toFixed(2), positive: diff >= 0 };
}

export default async function MacroPage() {
  const data = await getMacroData();

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">API keys not configured</p>
          <p className="text-sm">Add your FRED, FMP, and Finnhub keys to <code className="bg-zinc-800 px-1 rounded">.env.local</code> to see live data.</p>
        </div>
      </div>
    );
  }

  const fedRate = latest(data.fedFunds);
  const cpiVal = latest(data.cpi);
  const unempVal = latest(data.unemployment);
  const y10 = latest(data.yield10y);
  const y2 = latest(data.yield2y);
  const spread = y10 !== "—" && y2 !== "—"
    ? (parseFloat(y10) - parseFloat(y2)).toFixed(2)
    : "—";
  const spreadPos = spread !== "—" ? parseFloat(spread) >= 0 : true;

  const fedDelta = delta(data.fedFunds);
  const cpiDelta = delta(data.cpi);
  const unempDelta = delta(data.unemployment);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-white mb-1">Macro Dashboard</h1>
        <p className="text-sm text-zinc-500">Live economic data from the Federal Reserve (FRED)</p>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Fed Funds Rate"
          value={`${fedRate}%`}
          delta={fedDelta ? `${fedDelta.diff}%` : undefined}
          positive={fedDelta?.positive}
        />
        <StatCard
          label="CPI (YoY Index)"
          value={cpiVal}
          delta={cpiDelta ? `${cpiDelta.diff}` : undefined}
          positive={cpiDelta?.positive}
        />
        <StatCard
          label="Unemployment"
          value={`${unempVal}%`}
          delta={unempDelta ? `${unempDelta.diff}%` : undefined}
          positive={!unempDelta?.positive}
        />
        <StatCard
          label="10Y–2Y Spread"
          value={`${spread}%`}
          delta={spreadPos ? "Normal curve" : "Inverted"}
          positive={spreadPos}
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MacroChart title="Federal Funds Rate" data={data.fedFunds} unit="%" color="#6366f1" />
        <MacroChart title="CPI Index" data={data.cpi} color="#f59e0b" />
      </div>

      {/* Yield curve */}
      <MacroChart
        title="Yield Curve — 10Y vs 2Y vs 3M"
        data={data.yield10y}
        unit="%"
        color="#6366f1"
        primaryLabel="10-Year"
        secondaryData={data.yield2y}
        secondaryLabel="2-Year"
        secondaryColor="#f59e0b"
      />

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MacroChart title="Unemployment Rate" data={data.unemployment} unit="%" color="#ef4444" />
        <MacroChart title="PCE Price Index" data={data.pce} color="#10b981" />
      </div>

      {/* Charts row 3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MacroChart title="Retail Sales ($M)" data={data.retail} color="#8b5cf6" />
        <MacroChart title="M2 Money Supply ($B)" data={data.m2} color="#06b6d4" />
      </div>

      <p className="text-xs text-zinc-600">Data sourced from Federal Reserve Economic Data (FRED). Refreshes every hour.</p>
    </div>
  );
}
