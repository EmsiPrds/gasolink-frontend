import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import type { ApiResponse, GlobalPrice } from "../types/api";
import type { GlobalPriceType } from "../types/domain";

export function useGlobalHistory(type: GlobalPriceType, period: 7 | 30 | 90) {
  return useQuery({
    queryKey: ["global", "history", type, period],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ items: GlobalPrice[] }>>("/global/history", {
        params: { type, period },
      });
      if (!res.data.ok) throw new Error(res.data.error.message);
      return res.data.data.items;
    },
  });
}

