import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { adminApi } from "../../services/adminApi";
import type { ApiResponse } from "../../types/api";

export function AdminHomePage() {
  const refreshNow = useMutation({
    mutationFn: async () => {
      const res = await adminApi.post<ApiResponse<{ requested: boolean }>>("/admin/global/refresh-now");
      if (!res.data.ok) throw new Error(res.data.error.message);
      return res.data.data.requested;
    },
  });

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
          <p className="mt-1 text-sm text-slate-200">Manage prices, insights, alerts, and update logs.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            className="rounded-xl bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-60"
            onClick={() => refreshNow.mutate()}
            disabled={refreshNow.isPending}
          >
            {refreshNow.isPending ? "Refreshing…" : "Refresh global now"}
          </button>
          <Link
            to="/dashboard"
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10"
          >
            View public dashboard
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card to="/admin/ingestion" title="Ingestion" desc="Scrapers, reconciliation, and data-quality monitoring." />
        <Card to="/admin/ph-prices" title="PH Fuel Prices" desc="Create and verify weekly local price records." />
        <Card to="/admin/company-prices" title="Company Prices" desc="Compare Petron, Shell, Caltex, and more by region." />
        <Card to="/admin/insights" title="Insights" desc="Write simple explanations in plain English / Taglish-friendly wording." />
        <Card to="/admin/alerts" title="Alerts" desc="Post notices and expected weekly updates." />
        <Card to="/admin/logs" title="Update Logs" desc="Monitor data source updates and cron job status." />
      </div>

      {refreshNow.isError ? (
        <div className="mt-4 rounded-2xl border border-energy-500/20 bg-energy-500/10 p-4 text-sm text-energy-200">
          Manual refresh failed.
        </div>
      ) : null}
    </div>
  );
}

function Card(props: { to: string; title: string; desc: string }) {
  return (
    <Link to={props.to} className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10">
      <p className="font-semibold text-white">{props.title}</p>
      <p className="mt-2 text-sm text-slate-200">{props.desc}</p>
    </Link>
  );
}

