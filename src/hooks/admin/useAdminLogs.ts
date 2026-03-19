import { useQuery } from "@tanstack/react-query";
import { adminApi } from "../../services/adminApi";
import type { ApiResponse } from "../../types/api";

export type UpdateLog = {
  _id: string;
  module: string;
  status: "success" | "failure";
  message: string;
  timestamp: string;
};

export function useAdminLogs() {
  return useQuery({
    queryKey: ["admin", "logs"],
    queryFn: async () => {
      const res = await adminApi.get<ApiResponse<{ items: UpdateLog[] }>>("/admin/logs");
      if (!res.data.ok) throw new Error(res.data.error.message);
      return res.data.data.items;
    },
  });
}

