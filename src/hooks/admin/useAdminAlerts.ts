import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../services/adminApi";
import type { ApiResponse, Alert } from "../../types/api";
import type { AlertLevel } from "../../types/domain";

export function useAdminAlerts() {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ["admin", "alerts"],
    queryFn: async () => {
      const res = await adminApi.get<ApiResponse<{ items: Alert[] }>>("/admin/alerts");
      if (!res.data.ok) throw new Error(res.data.error.message);
      return res.data.data.items;
    },
  });

  const create = useMutation({
    mutationFn: async (body: { title: string; message: string; level?: AlertLevel; active?: boolean }) => {
      const res = await adminApi.post<ApiResponse<{ item: Alert }>>("/admin/alerts", body);
      if (!res.data.ok) throw new Error(res.data.error.message);
      return res.data.data.item;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "alerts"] });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const res = await adminApi.delete<ApiResponse<{ deleted: boolean }>>(`/admin/alerts/${id}`);
      if (!res.data.ok) throw new Error(res.data.error.message);
      return res.data.data.deleted;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "alerts"] });
    },
  });

  return { list, create, remove };
}

