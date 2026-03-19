import { useMutation, useQuery } from "@tanstack/react-query";
import { adminApi } from "../../services/adminApi";
import type { ApiResponse } from "../../types/api";

export type DoePreviewRow = {
  tempId: string;
  fuelType: string;
  pricePerLiter?: number;
  priceChange?: number;
  priceAdjustmentDirection?: "up" | "down";
  previousPrice?: number;
  latestPrice?: number;
  effectiveAt?: string;
  region?: string;
  area?: string;
  companyName?: string;
  sourceUrl: string;
  warnings?: string[];
};

export type DoePreviewPayload = {
  rawSourceId: string;
  rows: DoePreviewRow[];
  warnings: string[];
  rawTextSample: string;
};

export function useDoeUpload() {
  return useMutation({
    mutationFn: async (params: { file: File; note?: string }) => {
      const form = new FormData();
      form.append("pdf", params.file);
      if (params.note) form.append("note", params.note);
      const res = await adminApi.post<ApiResponse<DoePreviewPayload>>("/admin/doe/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (!res.data.ok) throw new Error(res.data.error.message);
      return res.data.data;
    },
  });
}

export function useDoeLink() {
  return useMutation({
    mutationFn: async (params: { url: string; note?: string }) => {
      const res = await adminApi.post<ApiResponse<DoePreviewPayload>>("/admin/doe/link", params);
      if (!res.data.ok) throw new Error(res.data.error.message);
      return res.data.data;
    },
  });
}

export function useDoeCommit(rawSourceId: string) {
  return useMutation({
    mutationFn: async (rows: any[]) => {
      const res = await adminApi.post<ApiResponse<{ ok: boolean; createdOrUpdated: number }>>(
        `/admin/doe/preview/${rawSourceId}/commit`,
        { rows },
      );
      if (!res.data.ok) throw new Error(res.data.error.message);
      return res.data.data;
    },
  });
}

export type DoeUploadRow = {
  _id: string;
  sourceUrl: string;
  scrapedAt: string;
  processingStatus: string;
  uploadContext?: {
    uploadType?: "file" | "link";
    originalFilename?: string;
    originalUrl?: string;
    note?: string;
  };
};

export function useDoeUploads() {
  return useQuery({
    queryKey: ["admin", "doe", "uploads"],
    queryFn: async () => {
      const res = await adminApi.get<ApiResponse<{ items: DoeUploadRow[] }>>("/admin/doe/uploads");
      if (!res.data.ok) throw new Error(res.data.error.message);
      return res.data.data.items;
    },
  });
}

export function useDoeUploadDetails(rawSourceId: string | null) {
  return useQuery({
    queryKey: ["admin", "doe", "uploads", rawSourceId],
    enabled: !!rawSourceId,
    queryFn: async () => {
      const res = await adminApi.get<ApiResponse<{ item: DoeUploadRow; preview: DoePreviewPayload | null }>>(
        `/admin/doe/uploads/${rawSourceId}`,
      );
      if (!res.data.ok) throw new Error(res.data.error.message);
      return res.data.data;
    },
  });
}

