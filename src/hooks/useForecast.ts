import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import type { ApiResponse, ForecastCard } from "../types/api";
import type { Region } from "../types/domain";

export function useForecast(region: Region) {
  return useQuery({
    queryKey: ["forecast", region],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ cards: ForecastCard[] }>>("/forecast", { params: { region } });
      if (!res.data.ok) throw new Error(res.data.error.message);
      return res.data.data.cards;
    },
  });
}

