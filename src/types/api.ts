import type { AlertLevel, FuelType, GlobalPriceType, PriceStatus, Region } from "./domain";

export type ApiOk<T> = { ok: true; data: T };
export type ApiFail = { ok: false; error: { code: string; message: string; details?: unknown } };
export type ApiResponse<T> = ApiOk<T> | ApiFail;

export type GlobalPrice = {
  _id: string;
  type: GlobalPriceType;
  value: number;
  changePercent: number;
  timestamp: string;
};

export type FuelPricePH = {
  _id: string;
  fuelType: FuelType;
  price: number;
  averagePrice?: number;
  weeklyChange: number;
  region: Region;
  source: string;
  status: PriceStatus;
  updatedAt: string;

  // Accuracy-first fields (optional until backend fully populates everywhere)
  confidenceScore?: number;
  lastVerifiedAt?: string;
  supportingSources?: Array<{
    sourceType: string;
    sourceName: string;
    sourceUrl: string;
    sourcePublishedAt?: string;
    scrapedAt: string;
    confidenceScore: number;
    statusLabel: string;
  }>;
};

export type CompanyPrice = {
  _id: string;
  companyName: string;
  fuelType: FuelType;
  price: number;
  region: Region;
  city?: string;
  status: PriceStatus;
  source: string;
  updatedAt: string;
};

export type Insight = {
  _id: string;
  title: string;
  message: string;
  category: string;
  status: "active" | "inactive";
  createdAt: string;
};

export type Alert = {
  _id: string;
  title: string;
  message: string;
  level: AlertLevel;
  active: boolean;
  createdAt: string;
};

export type ForecastCard = {
  fuelType: FuelType;
  estimatedWeeklyChange: number;
  direction: "up" | "down" | "flat";
  label: string;
  message: string;
  basedOn: { brent7dPct: number; wti7dPct: number; usdphp7dPct: number };
};

