import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import type { ApiResponse, FuelPricePH } from "../types/api";
import type { Region } from "../types/domain";

export function usePhLatest(region: Region) {
  return useQuery({
    queryKey: ["ph", "latest", region],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ items: FuelPricePH[] }>>("/ph/latest", { params: { region } });
      if (!res.data.ok) throw new Error(res.data.error.message);
      return res.data.data.items;
    },
  });
}

