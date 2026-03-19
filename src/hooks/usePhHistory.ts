import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import type { ApiResponse, FuelPricePH } from "../types/api";
import type { FuelType, Region } from "../types/domain";

export function usePhHistory(fuelType: FuelType, region: Region, period: 7 | 30 | 90) {
  return useQuery({
    queryKey: ["ph", "history", fuelType, region, period],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ items: FuelPricePH[] }>>("/ph/history", {
        params: { fuelType, region, period },
      });
      if (!res.data.ok) throw new Error(res.data.error.message);
      return res.data.data.items;
    },
  });
}

