import type { Ratios, IncomeStatement, CompanyProfile } from "./fmp";

export interface ScoredCompany {
  symbol: string;
  name: string;
  sector: string;
  industry: string;
  marketCap: number;
  price: number;
  scores: {
    financial: number;
    growth: number;
    innovation: number;
    total: number;
  };
  metrics: {
    revenueGrowthYoY: number | null;
    grossMargin: number | null;
    operatingMargin: number | null;
    roe: number | null;
    debtRatio: number | null;
    rdToRevenue: number | null;
    fcfPerShare: number | null;
  };
  thesis: string;
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

function score(val: number | null, low: number, high: number): number {
  if (val === null || isNaN(val)) return 0;
  return clamp(((val - low) / (high - low)) * 100, 0, 100);
}

export function scoreCompany(
  symbol: string,
  profile: CompanyProfile,
  ratios: Ratios,
  incomeStatements: IncomeStatement[],
  marketCap: number,
  price: number
): ScoredCompany {
  // Revenue growth YoY from income statements
  let revenueGrowthYoY: number | null = null;
  if (incomeStatements.length >= 2) {
    const latest = incomeStatements[0].revenue;
    const prior = incomeStatements[1].revenue;
    if (prior > 0) revenueGrowthYoY = ((latest - prior) / prior) * 100;
  }

  const grossMargin = ratios.grossProfitMargin != null ? ratios.grossProfitMargin * 100 : null;
  const opMargin = ratios.operatingProfitMargin != null ? ratios.operatingProfitMargin * 100 : null;
  const roe = ratios.returnOnEquity != null ? ratios.returnOnEquity * 100 : null;
  const debtRatio = ratios.debtRatio ?? null;
  const rdToRevenue = ratios.researchAndDevelopmentToRevenue != null
    ? ratios.researchAndDevelopmentToRevenue * 100
    : null;
  const fcfPerShare = ratios.freeCashFlowPerShare ?? null;

  // Financial score (40 pts)
  const grossMarginScore = score(grossMargin, 20, 70) * 0.25;
  const opMarginScore = score(opMargin, -10, 30) * 0.25;
  const roeScore = score(roe, 0, 30) * 0.25;
  const debtScore = score(debtRatio != null ? 1 - debtRatio : null, 0.3, 1) * 0.25;
  const financialScore = (grossMarginScore + opMarginScore + roeScore + debtScore);

  // Growth score (40 pts)
  const revGrowthScore = score(revenueGrowthYoY, 5, 50) * 0.6;
  const fcfScore = score(fcfPerShare, 0, 10) * 0.4;
  const growthScore = revGrowthScore + fcfScore;

  // Innovation score (20 pts)
  const innovationScore = score(rdToRevenue, 2, 20);

  const total = financialScore * 0.4 + growthScore * 0.4 + innovationScore * 0.2;

  const thesis = buildThesis(profile, revenueGrowthYoY, grossMargin, opMargin, rdToRevenue, roe);

  return {
    symbol,
    name: profile.companyName,
    sector: profile.sector,
    industry: profile.industry,
    marketCap,
    price,
    scores: {
      financial: Math.round(financialScore),
      growth: Math.round(growthScore),
      innovation: Math.round(innovationScore),
      total: Math.round(total),
    },
    metrics: {
      revenueGrowthYoY: revenueGrowthYoY !== null ? Math.round(revenueGrowthYoY * 10) / 10 : null,
      grossMargin: grossMargin !== null ? Math.round(grossMargin * 10) / 10 : null,
      operatingMargin: opMargin !== null ? Math.round(opMargin * 10) / 10 : null,
      roe: roe !== null ? Math.round(roe * 10) / 10 : null,
      debtRatio: debtRatio !== null ? Math.round(debtRatio * 100) / 100 : null,
      rdToRevenue: rdToRevenue !== null ? Math.round(rdToRevenue * 10) / 10 : null,
      fcfPerShare: fcfPerShare !== null ? Math.round(fcfPerShare * 100) / 100 : null,
    },
    thesis,
  };
}

function buildThesis(
  profile: CompanyProfile,
  revGrowth: number | null,
  grossMargin: number | null,
  opMargin: number | null,
  rdToRevenue: number | null,
  roe: number | null
): string {
  const parts: string[] = [];

  if (revGrowth !== null && revGrowth > 15) {
    parts.push(`growing revenue ${revGrowth.toFixed(0)}% YoY`);
  }
  if (grossMargin !== null && grossMargin > 50) {
    parts.push(`high-margin business (${grossMargin.toFixed(0)}% gross margin)`);
  }
  if (opMargin !== null && opMargin > 10) {
    parts.push(`operationally efficient (${opMargin.toFixed(0)}% op margin)`);
  }
  if (rdToRevenue !== null && rdToRevenue > 8) {
    parts.push(`heavy R&D reinvestment (${rdToRevenue.toFixed(0)}% of revenue)`);
  }
  if (roe !== null && roe > 15) {
    parts.push(`strong capital efficiency (${roe.toFixed(0)}% ROE)`);
  }

  const base = `${profile.companyName} operates in ${profile.industry}`;
  if (parts.length === 0) return `${base}. Further due diligence recommended.`;
  return `${base} — ${parts.join(", ")}.`;
}
