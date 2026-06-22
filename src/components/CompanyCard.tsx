import type { ScoredCompany } from "@/lib/scoring";

function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
    </div>
  );
}

function Metric({ label, value, unit = "" }: { label: string; value: number | null; unit?: string }) {
  return (
    <div>
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="text-sm font-semibold text-zinc-200">
        {value !== null ? `${value}${unit}` : "—"}
      </p>
    </div>
  );
}

export default function CompanyCard({ company }: { company: ScoredCompany }) {
  const capLabel = company.marketCap >= 2_000_000_000
    ? `$${(company.marketCap / 1_000_000_000).toFixed(1)}B`
    : `$${(company.marketCap / 1_000_000).toFixed(0)}M`;

  const totalColor =
    company.scores.total >= 70
      ? "text-emerald-400"
      : company.scores.total >= 50
      ? "text-amber-400"
      : "text-zinc-400";

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-600 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-base font-bold text-white">{company.symbol}</span>
            <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">{capLabel}</span>
          </div>
          <p className="text-xs text-zinc-400">{company.name}</p>
          <p className="text-xs text-zinc-600">{company.industry}</p>
        </div>
        <div className="text-right">
          <p className={`text-2xl font-bold ${totalColor}`}>{company.scores.total}</p>
          <p className="text-xs text-zinc-600">/ 100</p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-zinc-500">Financial</span>
            <span className="text-zinc-400">{company.scores.financial}</span>
          </div>
          <ScoreBar value={company.scores.financial} color="bg-indigo-500" />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-zinc-500">Growth</span>
            <span className="text-zinc-400">{company.scores.growth}</span>
          </div>
          <ScoreBar value={company.scores.growth} color="bg-emerald-500" />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-zinc-500">Innovation</span>
            <span className="text-zinc-400">{company.scores.innovation}</span>
          </div>
          <ScoreBar value={company.scores.innovation} color="bg-amber-500" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4 pt-4 border-t border-zinc-800">
        <Metric label="Rev Growth" value={company.metrics.revenueGrowthYoY} unit="%" />
        <Metric label="Gross Margin" value={company.metrics.grossMargin} unit="%" />
        <Metric label="Op Margin" value={company.metrics.operatingMargin} unit="%" />
        <Metric label="ROE" value={company.metrics.roe} unit="%" />
        <Metric label="Debt Ratio" value={company.metrics.debtRatio} />
        <Metric label="R&D / Rev" value={company.metrics.rdToRevenue} unit="%" />
      </div>

      <p className="text-xs text-zinc-500 leading-relaxed border-t border-zinc-800 pt-3">
        {company.thesis}
      </p>
    </div>
  );
}
