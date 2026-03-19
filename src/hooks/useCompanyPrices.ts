import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import type { ApiResponse, CompanyPrice } from "../types/api";
import type { FuelType, Region } from "../types/domain";

export function useCompanyPrices(params: {
  fuelType?: FuelType;
  region?: Region;
  company?: string;
}) {
  return useQuery({
    queryKey: ["company", params],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ items: CompanyPrice[] }>>("/company", { params });
      if (!res.data.ok) throw new Error(res.data.error.message);
      return res.data.data.items;
    },
  });
}

