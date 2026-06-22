const BASE = "https://financialmodelingprep.com/api/v3";
const KEY = process.env.FMP_API_KEY;

async function fmpFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const qs = new URLSearchParams({ ...params, apikey: KEY! }).toString();
  const res = await fetch(`${BASE}${path}?${qs}`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`FMP error: ${res.status}`);
  return res.json();
}

export interface ScreenerResult {
  symbol: string;
  companyName: string;
  marketCap: number;
  price: number;
  sector: string;
  industry: string;
  country: string;
  exchange: string;
}

export interface CompanyProfile {
  symbol: string;
  companyName: string;
  description: string;
  ceo: string;
  sector: string;
  industry: string;
  website: string;
  mktCap: number;
  employees: number;
  image: string;
}

export interface Ratios {
  symbol: string;
  revenueGrowth: number;
  grossProfitMargin: number;
  operatingProfitMargin: number;
  netProfitMargin: number;
  returnOnEquity: number;
  returnOnCapitalEmployed: number;
  debtRatio: number;
  currentRatio: number;
  freeCashFlowPerShare: number;
  priceEarningsRatio: number;
  priceToBookRatio: number;
  researchAndDevelopmentToRevenue: number;
}

export interface IncomeStatement {
  date: string;
  revenue: number;
  grossProfit: number;
  operatingIncome: number;
  netIncome: number;
  researchAndDevelopmentExpenses: number;
}

// Screen for small/mid cap companies with growth characteristics
export async function screenCompanies(params: {
  marketCapMoreThan?: number;
  marketCapLowerThan?: number;
  sector?: string;
  revenueMoreThan?: number;
  limit?: number;
}): Promise<ScreenerResult[]> {
  return fmpFetch<ScreenerResult[]>("/stock-screener", {
    marketCapMoreThan: String(params.marketCapMoreThan ?? 100000000),
    marketCapLowerThan: String(params.marketCapLowerThan ?? 10000000000),
    country: "US",
    exchange: "NASDAQ,NYSE",
    limit: String(params.limit ?? 50),
    ...(params.sector ? { sector: params.sector } : {}),
    ...(params.revenueMoreThan ? { revenueMoreThan: String(params.revenueMoreThan) } : {}),
  });
}

export async function getProfile(symbol: string): Promise<CompanyProfile | null> {
  const data = await fmpFetch<CompanyProfile[]>(`/profile/${symbol}`);
  return data[0] ?? null;
}

export async function getRatios(symbol: string): Promise<Ratios | null> {
  const data = await fmpFetch<Ratios[]>(`/ratios-ttm/${symbol}`);
  return data[0] ?? null;
}

export async function getIncomeStatements(symbol: string, limit = 4): Promise<IncomeStatement[]> {
  return fmpFetch<IncomeStatement[]>(`/income-statement/${symbol}`, {
    limit: String(limit),
  });
}

export async function getQuote(symbol: string): Promise<{ price: number; changesPercentage: number } | null> {
  const data = await fmpFetch<Array<{ price: number; changesPercentage: number }>>(`/quote/${symbol}`);
  return data[0] ?? null;
}
