import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import type { ApiResponse, Alert } from "../types/api";

export function useAlerts() {
  return useQuery({
    queryKey: ["alerts"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ items: Alert[] }>>("/alerts", { params: { active: true } });
      if (!res.data.ok) throw new Error(res.data.error.message);
      return res.data.data.items;
    },
  });
}

