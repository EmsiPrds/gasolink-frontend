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
    collectors: ModuleLog | null;
    reconciliation: ModuleLog | null;
    dataQuality: ModuleLog | null;
  };
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

function useInvalidateIngestionQueries() {
  const qc = useQueryClient();

  return async function invalidateIngestionQueries() {
    await Promise.all([
      qc.invalidateQueries({ queryKey: ["admin", "ingestion", "health"] }),
      qc.invalidateQueries({ queryKey: ["admin", "ingestion", "raw", "failed"] }),
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
  const invalidateIngestionQueries = useInvalidateIngestionQueries();

  return useMutation({
    mutationFn: async () => {
      const res = await adminApi.post<ApiResponse<{ requested: boolean }>>("/admin/ingestion/reconcile");
      if (!res.data.ok) throw new Error(res.data.error.message);
      return res.data.data.requested;
    },
    onSuccess: invalidateIngestionQueries,
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
