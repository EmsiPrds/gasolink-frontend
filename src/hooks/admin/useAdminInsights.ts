import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../services/adminApi";
import type { ApiResponse, Insight } from "../../types/api";

export function useAdminInsights() {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ["admin", "insights"],
    queryFn: async () => {
      const res = await adminApi.get<ApiResponse<{ items: Insight[] }>>("/admin/insights");
      if (!res.data.ok) throw new Error(res.data.error.message);
      return res.data.data.items;
    },
  });

  const create = useMutation({
    mutationFn: async (body: { title: string; message: string; category: string; status?: "active" | "inactive" }) => {
      const res = await adminApi.post<ApiResponse<{ item: Insight }>>("/admin/insights", body);
      if (!res.data.ok) throw new Error(res.data.error.message);
      return res.data.data.item;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "insights"] });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const res = await adminApi.delete<ApiResponse<{ deleted: boolean }>>(`/admin/insights/${id}`);
      if (!res.data.ok) throw new Error(res.data.error.message);
      return res.data.data.deleted;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "insights"] });
    },
  });

  return { list, create, remove };
}

