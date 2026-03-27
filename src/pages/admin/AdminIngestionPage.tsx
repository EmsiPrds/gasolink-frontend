import { format } from "date-fns";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  useAdminRawSourcesFiltered,
  useAdminNormalizedRecords,
  useAdminPublishedRecords,
  useAdminIngestionHealth,
  useAdminTriggerCollectors,
  useAdminTriggerQuality,
} from "../../hooks/admin/useAdminIngestion";

export function AdminIngestionPage() {
  const [rawSourceTypeFilter, setRawSourceTypeFilter] = useState("");
  const [rawStatusFilter, setRawStatusFilter] = useState("");
  const [normalizedCategoryFilter, setNormalizedCategoryFilter] = useState("");
  const [fuelFilter, setFuelFilter] = useState("");
  const [regionFilter, setRegionFilter] = useState("");

  const health = useAdminIngestionHealth();
  const rawSources = useAdminRawSourcesFiltered({ sourceType: rawSourceTypeFilter, status: rawStatusFilter });
  const normalized = useAdminNormalizedRecords({ sourceCategory: normalizedCategoryFilter, fuelType: fuelFilter });
  const published = useAdminPublishedRecords({ fuelType: fuelFilter, region: regionFilter });
  const triggerCollectors = useAdminTriggerCollectors();
  const triggerQuality = useAdminTriggerQuality();
  const checklist = useMemo(() => {
    const h = health.data;
    const activeDoe = h?.activeDoeDocument ?? normalized.data?.activeDoeDocument ?? published.data?.activeDoeDocument ?? null;
    const rawReady = (h?.rawCount ?? 0) > 0;
    const normalizedReady = (h?.normalizedCount ?? 0) > 0;
    const outputReady = (h?.publishedCount ?? 0) > 0;
    const ingestionOk = h?.pipelineStatus.aiIngestion?.status === "success";
    const searchOk = h?.pipelineStatus.aiSearch?.status === "success";
    const estimationOk = h?.pipelineStatus.aiEstimation?.status === "success";
    return [
      { label: "Raw data gathered", ok: rawReady },
      { label: "Ingestion worker success", ok: Boolean(ingestionOk) },
      { label: "AI search extracted records", ok: Boolean(searchOk) },
      { label: "Latest DOE document resolved (this week or last week)", ok: Boolean(activeDoe) },
      { label: "Normalized records available", ok: normalizedReady && Boolean(activeDoe) },
      { label: "Fusion estimation success", ok: Boolean(estimationOk) },
      { label: "Published outputs available", ok: outputReady && Boolean(activeDoe) },
    ];
  }, [health.data, normalized.data?.activeDoeDocument, published.data?.activeDoeDocument]);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">AI Intelligence Control</h1>
          <p className="mt-1 text-sm text-slate-200">
            Monitor AI-native ingestion, publishing intelligence, and quality checks.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            className="rounded-xl bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-60"
            onClick={() => triggerCollectors.mutate()}
            disabled={triggerCollectors.isPending}
          >
            {triggerCollectors.isPending ? "Running..." : "Run AI ingestion now"}
          </button>
          <button
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-60"
            onClick={() => triggerQuality.mutate()}
            disabled={triggerQuality.isPending}
          >
            {triggerQuality.isPending ? "Analyzing..." : "Run accuracy check"}
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <Stat title="Intelligence sources" value={health.data ? String(health.data.rawCount) : "N/A"} />
        <Stat title="Unreliable flags" value={health.data ? String(health.data.rawFailed) : "N/A"} tone="warn" />
        <Stat title="Valid records" value={health.data ? String(health.data.normalizedCount) : "N/A"} />
        <Stat title="Market outputs" value={health.data ? String(health.data.publishedCount) : "N/A"} />
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-5">
        <p className="text-sm font-semibold text-white">Active DOE document</p>
        {health.data?.activeDoeDocument ? (
          <div className="mt-2 text-xs text-slate-200">
            <div>{health.data.activeDoeDocument.sourceUrl}</div>
            <div className="mt-1 text-slate-300">
              {format(new Date(health.data.activeDoeDocument.documentDate), "PP")} (latest-only, this week or last week)
            </div>
            {typeof health.data.activeDoeDocument.confidence === "number" ? (
              <div className="mt-1 text-slate-300">AI confidence: {Math.round(health.data.activeDoeDocument.confidence * 100)}%</div>
            ) : null}
            {health.data.activeDoeDocument.reason ? (
              <div className="mt-1 text-slate-300">Reason: {health.data.activeDoeDocument.reason}</div>
            ) : null}
          </div>
        ) : (
          <p className="mt-2 text-xs text-energy-200">No DOE document qualifies under strict latest weekly policy (this week/last week).</p>
        )}
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-5">
        <p className="text-sm font-semibold text-white">Pipeline stage checklist</p>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {checklist.map((item) => (
            <div
              key={item.label}
              className={
                "rounded-lg border px-3 py-2 text-sm " +
                (item.ok
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
                  : "border-energy-500/20 bg-energy-500/10 text-energy-200")
              }
            >
              {item.ok ? "PASS" : "BLOCKED"} - {item.label}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <PipelineStatusCard
          title="AI Ingestion"
          log={health.data?.pipelineStatus.aiIngestion ?? null}
          loading={health.isLoading}
        />
        <PipelineStatusCard
          title="AI Publish Layer"
          log={health.data?.pipelineStatus.aiIngestion ?? null}
          loading={health.isLoading}
        />
        <PipelineStatusCard
          title="AI Search"
          log={health.data?.pipelineStatus.aiSearch ?? null}
          loading={health.isLoading}
        />
        <PipelineStatusCard
          title="Fusion Estimation"
          log={health.data?.pipelineStatus.aiEstimation ?? null}
          loading={health.isLoading}
        />
        <PipelineStatusCard
          title="Data Intelligence"
          log={health.data?.pipelineStatus.dataQuality ?? null}
          loading={health.isLoading}
        />
      </div>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-5">
        <p className="text-sm font-semibold text-white">Latest system log</p>
        {health.isLoading ? (
          <p className="mt-2 text-sm text-slate-200">Loading...</p>
        ) : health.isError ? (
          <p className="mt-2 text-sm text-energy-200">Failed to load ingestion health.</p>
        ) : health.data?.latestLog ? (
          <div className="mt-2 text-sm text-slate-200">
            <div>
              <span className="font-semibold">{health.data.latestLog.module}</span> | {health.data.latestLog.status}
            </div>
            <div className="mt-1">{health.data.latestLog.message}</div>
            <div className="mt-1 text-xs text-slate-300">
              {format(new Date(health.data.latestLog.timestamp), "PP p")}
            </div>
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-200">No logs yet.</p>
        )}
      </div>

      <div className="mt-6 grid gap-4">
        <DataTableCard title="Raw gathered sources" subtitle="Direct scraped/search snapshots before normalization.">
          <div className="mb-3 grid gap-2 md:grid-cols-3">
            <FilterSelect
              label="Source type"
              value={rawSourceTypeFilter}
              onChange={setRawSourceTypeFilter}
              options={["", "official_local", "company_advisory", "observed_station", "estimate"]}
            />
            <FilterSelect
              label="Status"
              value={rawStatusFilter}
              onChange={setRawStatusFilter}
              options={["", "raw", "normalized", "failed"]}
            />
          </div>
          <SimpleTable
            headers={["Type", "Name", "Status", "Parser", "Scraped At", "Link"]}
            loading={rawSources.isLoading}
            error={rawSources.isError}
            emptyMessage="No raw sources yet."
            rows={(rawSources.data ?? []).slice(0, 50).map((row) => [
              row.sourceType,
              row.sourceName,
              row.processingStatus,
              row.parserId,
              format(new Date(row.scrapedAt), "PP p"),
              row.sourceUrl,
            ])}
            linkColumnIndex={5}
          />
        </DataTableCard>

        <DataTableCard title="Normalized records" subtitle="Validated records used by the fusion engine.">
          <div className="mb-3 grid gap-2 md:grid-cols-3">
            <FilterSelect
              label="Source category"
              value={normalizedCategoryFilter}
              onChange={setNormalizedCategoryFilter}
              options={["", "doe_official", "web_scrape", "user_report", "global_api"]}
            />
            <FilterSelect
              label="Fuel"
              value={fuelFilter}
              onChange={setFuelFilter}
              options={["", "Gasoline", "Diesel", "Kerosene"]}
            />
          </div>
          <SimpleTable
            headers={["Fuel", "Region", "Price/Delta", "Category", "Confidence", "Source"]}
            loading={normalized.isLoading}
            error={normalized.isError}
            emptyMessage="No normalized records yet."
            rows={(normalized.data?.items ?? []).slice(0, 50).map((row) => [
              row.fuelType,
              row.city ? `${row.region} / ${row.city}` : row.region,
              typeof row.pricePerLiter === "number"
                ? `PHP ${row.pricePerLiter.toFixed(2)}`
                : typeof row.priceChange === "number"
                  ? `${row.priceChange > 0 ? "+" : ""}${row.priceChange.toFixed(2)}`
                  : "n/a",
              row.sourceCategory ?? row.sourceType,
              `${Math.round((row.confidenceScore ?? 0) * 100)}%`,
              row.sourceUrl,
            ])}
            linkColumnIndex={5}
          />
        </DataTableCard>

        <DataTableCard title="Published market outputs" subtitle="Final records that the dashboard consumes.">
          <div className="mb-3 grid gap-2 md:grid-cols-3">
            <FilterSelect
              label="Fuel"
              value={fuelFilter}
              onChange={setFuelFilter}
              options={["", "Gasoline", "Diesel", "Kerosene"]}
            />
            <FilterSelect
              label="Region"
              value={regionFilter}
              onChange={setRegionFilter}
              options={["", "NCR", "Luzon", "Visayas", "Mindanao"]}
            />
          </div>
          <SimpleTable
            headers={["Fuel", "Region", "Estimated Price", "Confidence", "Status", "Updated"]}
            loading={published.isLoading}
            error={published.isError}
            emptyMessage="No published outputs yet."
            rows={(published.data?.items ?? []).slice(0, 50).map((row) => [
              row.fuelType,
              row.region,
              typeof row.finalPrice === "number" ? `PHP ${row.finalPrice.toFixed(2)}` : "n/a",
              `${Math.round((row.confidenceScore ?? 0) * 100)}%${row.confidenceLabel ? ` (${row.confidenceLabel})` : ""}`,
              row.finalStatus,
              format(new Date(row.updatedAt), "PP p"),
            ])}
          />
        </DataTableCard>
      </div>

    </div>
  );
}

function FilterSelect(props: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-slate-300">{props.label}</span>
      <select
        className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
      >
        {props.options.map((option) => (
          <option key={option || "all"} value={option}>
            {option || "All"}
          </option>
        ))}
      </select>
    </label>
  );
}

function DataTableCard(props: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <p className="text-sm font-semibold text-white">{props.title}</p>
      <p className="mt-1 text-xs text-slate-300">{props.subtitle}</p>
      <div className="mt-3">{props.children}</div>
    </div>
  );
}

function SimpleTable(props: {
  headers: string[];
  rows: Array<string[]>;
  loading?: boolean;
  error?: boolean;
  emptyMessage: string;
  linkColumnIndex?: number;
}) {
  if (props.loading) return <p className="text-sm text-slate-200">Loading...</p>;
  if (props.error) return <p className="text-sm text-energy-200">Failed to load data.</p>;
  if (!props.rows.length) return <p className="text-sm text-slate-200">{props.emptyMessage}</p>;

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="min-w-full text-left text-xs text-slate-100">
        <thead className="bg-white/10">
          <tr>
            {props.headers.map((header) => (
              <th key={header} className="px-3 py-2 font-semibold uppercase tracking-wide text-slate-200">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {props.rows.map((row, idx) => (
            <tr key={idx} className="border-t border-white/10">
              {row.map((value, cellIdx) => (
                <td key={`${idx}-${cellIdx}`} className="max-w-[360px] truncate px-3 py-2">
                  {props.linkColumnIndex === cellIdx ? (
                    <a href={value} target="_blank" rel="noreferrer" className="text-brand-300 hover:underline">
                      {value}
                    </a>
                  ) : (
                    value
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Stat(props: { title: string; value: string; tone?: "warn" }) {
  const tone =
    props.tone === "warn"
      ? "border-energy-500/20 bg-energy-500/10 text-energy-200"
      : "border-white/10 bg-white/5 text-white";

  return (
    <div className={"rounded-2xl border p-4 " + tone}>
      <div className="text-xs font-semibold uppercase tracking-wide opacity-90">{props.title}</div>
      <div className="mt-2 text-2xl font-semibold">{props.value}</div>
    </div>
  );
}

function PipelineStatusCard(props: {
  title: string;
  log: null | { lastRunAt: string; status: string; message: string };
  loading?: boolean;
}) {
  const status = props.loading ? "Loading..." : props.log ? props.log.status : "Not run";
  const time = props.log ? format(new Date(props.log.lastRunAt), "PP p") : "Not available";
  const tone =
    props.loading || !props.log
      ? "border-white/10 bg-white/5 text-white"
      : props.log.status === "success"
        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
        : "border-energy-500/20 bg-energy-500/10 text-energy-200";

  return (
    <div className={"rounded-2xl border p-4 " + tone}>
      <div className="text-xs font-semibold uppercase tracking-wide opacity-90">{props.title}</div>
      <div className="mt-2 text-lg font-semibold">{status}</div>
      <div className="mt-1 text-xs text-slate-300">{time}</div>
      {props.log ? <div className="mt-1 text-sm text-slate-200">{props.log.message}</div> : null}
    </div>
  );
}
