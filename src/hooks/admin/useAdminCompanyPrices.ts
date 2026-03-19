import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../services/adminApi";
import type { ApiResponse, CompanyPrice } from "../../types/api";
import type { FuelType, PriceStatus, Region } from "../../types/domain";

export function useAdminCompanyPrices() {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: ["admin", "company-prices"],
    queryFn: async () => {
      const res = await adminApi.get<ApiResponse<{ items: CompanyPrice[] }>>("/admin/company-prices");
      if (!res.data.ok) throw new Error(res.data.error.message);
      return res.data.data.items;
    },
  });

  const create = useMutation({
    mutationFn: async (body: {
      companyName: string;
      fuelType: FuelType;
      price: number;
      region: Region;
      city?: string;
      status: PriceStatus;
      source: string;
    }) => {
      const res = await adminApi.post<ApiResponse<{ item: CompanyPrice }>>("/admin/company-prices", body);
      if (!res.data.ok) throw new Error(res.data.error.message);
      return res.data.data.item;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "company-prices"] });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const res = await adminApi.delete<ApiResponse<{ deleted: boolean }>>(`/admin/company-prices/${id}`);
      if (!res.data.ok) throw new Error(res.data.error.message);
      return res.data.data.deleted;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["admin", "company-prices"] });
    },
  });

  return { list, create, remove };
}

