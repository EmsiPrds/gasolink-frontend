import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import type { ApiResponse, GlobalPrice } from "../types/api";

export function useGlobalLatest() {
  return useQuery({
    queryKey: ["global", "latest"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<{ items: GlobalPrice[] }>>("/global/latest");
      if (!res.data.ok) throw new Error(res.data.error.message);
      return res.data.data.items;
    },
  });
}

