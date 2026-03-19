import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../services/adminApi";
import type { ApiResponse, FuelPricePH } from "../../types/api";
import type { FuelType, PriceStatus, Region } from "../../types/domain";

export function useAdminPhPrices() {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ["admin", "ph-prices"],
    queryFn: async () => {
      const res = await adminApi.get<ApiResponse<{ items: FuelPricePH[] }>>("/admin/ph-prices");
      if (!res.data.ok) throw new Error(res.data.error.message);
      return res.data.data.items;
    },
  });

  const create = useMutation({
    mutationFn: async (body: {
      fuelType: FuelType;
      price: number;
      weeklyChange: number;
      region: Region;
      source: string;
      status: PriceStatus;
    }) => {
      const res = await adminApi.post<ApiResponse<{ item: FuelPricePH }>>("/admin/ph-prices", body);
      if (!res.data.ok) throw new Error(res.data.error.message);
      return res.data.data.item;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "ph-prices"] });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const res = await adminApi.delete<ApiResponse<{ deleted: boolean }>>(`/admin/ph-prices/${id}`);
      if (!res.data.ok) throw new Error(res.data.error.message);
      return res.data.data.deleted;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "ph-prices"] });
    },
  });

  return { list, create, remove };
}

