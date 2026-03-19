import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import type { ApiResponse } from "../types/api";
import type { FuelType, Region } from "../types/domain";

export type ObservedRecord = {
  _id: string;
  sourceType: string;
  statusLabel: string;
  confidenceScore: number;
  companyName?: string;
  stationName?: string;
  fuelType: FuelType;
  region: Region;
  city?: string;
  pricePerLiter?: number;
  priceChange?: number;
  currency: string;
  sourceName: string;
  sourceUrl: string;
  sourcePublishedAt?: string;
  scrapedAt: string;
  effectiveAt?: string;
};

export function useObservedPrices(params: { region?: Region; fuelType?: FuelType }) {
  return useQuery({
    queryKey: ["ph", "observed", params],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ items: ObservedRecord[] }>>("/ph/observed", { params });
      if (!res.data.ok) throw new Error(res.data.error.message);
      return res.data.data.items;
    },
  });
}

