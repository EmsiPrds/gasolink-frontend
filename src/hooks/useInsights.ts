import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import type { ApiResponse, Insight } from "../types/api";

export function useInsights() {
  return useQuery({
    queryKey: ["insights"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ items: Insight[] }>>("/insights", { params: { active: true } });
      if (!res.data.ok) throw new Error(res.data.error.message);
      return res.data.data.items;
    },
  });
}

