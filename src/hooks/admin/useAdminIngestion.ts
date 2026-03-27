import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "../../services/adminApi";
import type { ApiResponse } from "../../types/api";

export type ModuleLog = {
  lastRunAt: string;
  status: string;
  message: string;
};

export type IngestionHealth = {
  rawCount: number;
  rawFailed: number;
  normalizedCount: number;
  publishedCount: number;
  latestLog: null | { module: string; status: string; message: string; timestamp: string };
  pipelineStatus: {
    aiIngestion: ModuleLog | null;
    aiSearch: ModuleLog | null;
    aiEstimation: ModuleLog | null;
    dataQuality: ModuleLog | null;
  };
  activeDoeDocument: null | { sourceUrl: string; documentDate: string; confidence?: number; reason?: string };
};

export function useAdminIngestionHealth() {
  return useQuery({
    queryKey: ["admin", "ingestion", "health"],
    queryFn: async () => {
      const res = await adminApi.get<ApiResponse<IngestionHealth>>("/admin/ingestion/health");
      if (!res.data.ok) throw new Error(res.data.error.message);
      return res.data.data;
    },
    refetchInterval: 15_000,
  });
}

export type RawSourceRow = {
  _id: string;
  sourceType: string;
  sourceName: string;
  sourceUrl: string;
  parserId: string;
  scrapedAt: string;
  processingStatus: string;
  errorMessage?: string;
};

export function useAdminFailedRawSources() {
  return useQuery({
    queryKey: ["admin", "ingestion", "raw", "failed"],
    queryFn: async () => {
      const res = await adminApi.get<ApiResponse<{ items: RawSourceRow[] }>>("/admin/ingestion/raw-sources", {
        params: { status: "failed" },
      });
      if (!res.data.ok) throw new Error(res.data.error.message);
      return res.data.data.items;
    },
    refetchInterval: 20_000,
  });
}

export type NormalizedRecordRow = {
  _id: string;
  sourceType: string;
  sourceCategory?: "global_api" | "doe_official" | "web_scrape" | "user_report";
  statusLabel: string;
  confidenceScore: number;
  fuelType: string;
  region: string;
  city?: string;
  pricePerLiter?: number;
  priceChange?: number;
  sourceName: string;
  sourceUrl: string;
  scrapedAt: string;
};

export type PublishedPriceRow = {
  _id: string;
  fuelType: string;
  region: string;
  finalPrice?: number;
  averagePrice?: number;
  priceChange?: number;
  finalStatus: string;
  confidenceScore: number;
  confidenceLabel?: string;
  estimateExplanation?: string;
  updatedAt: string;
};

export function useAdminRawSources() {
  const sourceType = "";
  const status = "";
  return useQuery({
    queryKey: ["admin", "ingestion", "raw", "all", sourceType, status],
    queryFn: async () => {
      const res = await adminApi.get<ApiResponse<{ items: RawSourceRow[] }>>("/admin/ingestion/raw-sources", {
        params: { sourceType: sourceType || undefined, status: status || undefined },
      });
      if (!res.data.ok) throw new Error(res.data.error.message);
      return res.data.data.items;
    },
    refetchInterval: 15_000,
  });
}

export function useAdminRawSourcesFiltered(filters: { sourceType?: string; status?: string }) {
  return useQuery({
    queryKey: ["admin", "ingestion", "raw", "filtered", filters.sourceType ?? "", filters.status ?? ""],
    queryFn: async () => {
      const res = await adminApi.get<ApiResponse<{ items: RawSourceRow[] }>>("/admin/ingestion/raw-sources", {
        params: { sourceType: filters.sourceType || undefined, status: filters.status || undefined },
      });
      if (!res.data.ok) throw new Error(res.data.error.message);
      return res.data.data.items;
    },
    refetchInterval: 15_000,
  });
}

export function useAdminNormalizedRecords(filters?: { sourceCategory?: string; fuelType?: string }) {
  return useQuery({
    queryKey: ["admin", "ingestion", "normalized", filters?.sourceCategory ?? "", filters?.fuelType ?? ""],
    queryFn: async () => {
      const res = await adminApi.get<
        ApiResponse<{
          items: NormalizedRecordRow[];
          activeDoeDocument: null | { sourceUrl: string; documentDate: string; confidence?: number; reason?: string };
        }>
      >("/admin/ingestion/normalized", {
        params: {
          sourceCategory: filters?.sourceCategory || undefined,
          fuelType: filters?.fuelType || undefined,
        },
      });
      if (!res.data.ok) throw new Error(res.data.error.message);
      return res.data.data;
    },
    refetchInterval: 15_000,
  });
}

export function useAdminPublishedRecords(filters?: { fuelType?: string; region?: string }) {
  return useQuery({
    queryKey: ["admin", "ingestion", "published", filters?.fuelType ?? "", filters?.region ?? ""],
    queryFn: async () => {
      const res = await adminApi.get<
        ApiResponse<{
          items: PublishedPriceRow[];
          activeDoeDocument: null | { sourceUrl: string; documentDate: string; confidence?: number; reason?: string };
        }>
      >("/admin/ingestion/published", {
        params: { fuelType: filters?.fuelType || undefined, region: filters?.region || undefined },
      });
      if (!res.data.ok) throw new Error(res.data.error.message);
      return res.data.data;
    },
    refetchInterval: 15_000,
  });
}

function useInvalidateIngestionQueries() {
  const qc = useQueryClient();

  return async function invalidateIngestionQueries() {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ["admin", "ingestion", "health"] }),
      qc.invalidateQueries({ queryKey: ["admin", "ingestion", "raw", "failed"] }),
      qc.invalidateQueries({ queryKey: ["admin", "ingestion", "raw", "all"] }),
      qc.invalidateQueries({ queryKey: ["admin", "ingestion", "normalized"] }),
      qc.invalidateQueries({ queryKey: ["admin", "ingestion", "published"] }),
    ]);
  };
}

export function useAdminTriggerCollectors() {
  const invalidateIngestionQueries = useInvalidateIngestionQueries();

  return useMutation({
    mutationFn: async () => {
      const res = await adminApi.post<ApiResponse<{ requested: boolean }>>("/admin/ingestion/collect");
      if (!res.data.ok) throw new Error(res.data.error.message);
      return res.data.data.requested;
    },
    onSuccess: invalidateIngestionQueries,
  });
}

export function useAdminTriggerReconcile() {
  return useMutation({
    mutationFn: async () => {
      const res = await adminApi.post<ApiResponse<{ requested: boolean; message?: string }>>("/admin/ingestion/reconcile");
      if (!res.data.ok) throw new Error(res.data.error.message);
      return res.data.data;
    },
  });
}

export function useAdminTriggerQuality() {
  const invalidateIngestionQueries = useInvalidateIngestionQueries();

  return useMutation({
    mutationFn: async () => {
      const res = await adminApi.post<ApiResponse<{ requested: boolean }>>("/admin/ingestion/quality");
      if (!res.data.ok) throw new Error(res.data.error.message);
      return res.data.data.requested;
    },
    onSuccess: invalidateIngestionQueries,
  });
}
