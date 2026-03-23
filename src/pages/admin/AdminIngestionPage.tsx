import { format } from "date-fns";
import {
  useAdminFailedRawSources,
  useAdminIngestionHealth,
  useAdminTriggerCollectors,
  useAdminTriggerQuality,
  useAdminTriggerReconcile,
} from "../../hooks/admin/useAdminIngestion";

export function AdminIngestionPage() {
  const health = useAdminIngestionHealth();
  const failedRaw = useAdminFailedRawSources();
  const triggerReconcile = useAdminTriggerReconcile();
  const triggerQuality = useAdminTriggerQuality();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">AI Intelligence Control</h1>
          <p className="mt-1 text-sm text-slate-200">
            Monitor the autonomous AI-driven monitoring system and accuracy framework.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            className="rounded-xl bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-60"
            onClick={() => triggerReconcile.mutate()}
            disabled={triggerReconcile.isPending}
          >
            {triggerReconcile.isPending ? "Syncing…" : "Force system sync"}
          </button>
          <button
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-60"
            onClick={() => triggerQuality.mutate()}
            disabled={triggerQuality.isPending}
          >
            {triggerQuality.isPending ? "Analyzing…" : "Run accuracy check"}
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <Stat title="Intelligence sources" value={health.data ? String(health.data.rawCount) : "—"} />
        <Stat title="Unreliable flags" value={health.data ? String(health.data.rawFailed) : "—"} tone="warn" />
        <Stat title="Valid records" value={health.data ? String(health.data.normalizedCount) : "—"} />
        <Stat title="Market outputs" value={health.data ? String(health.data.publishedCount) : "—"} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <PipelineStatusCard
          title="AI Search Engine"
          log={health.data?.pipelineStatus.collectors ?? null}
          loading={health.isLoading}
        />
        <PipelineStatusCard
          title="Accuracy Layer"
          log={health.data?.pipelineStatus.reconciliation ?? null}
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
          <p className="mt-2 text-sm text-slate-200">Loading…</p>
        ) : health.isError ? (
          <p className="mt-2 text-sm text-energy-200">Failed to load ingestion health.</p>
        ) : health.data?.latestLog ? (
          <div className="mt-2 text-sm text-slate-200">
            <div>
              <span className="font-semibold">{health.data.latestLog.module}</span> • {health.data.latestLog.status}
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

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-5">
        <p className="text-sm font-semibold text-white">Recent failed raw snapshots</p>
        <p className="mt-1 text-xs text-slate-300">
          Fail-closed behavior: these are stored for review and are not published.
        </p>

        {failedRaw.isLoading ? (
          <p className="mt-3 text-sm text-slate-200">Loading…</p>
        ) : failedRaw.isError ? (
          <p className="mt-3 text-sm text-energy-200">Failed to load failed snapshots.</p>
        ) : failedRaw.data?.length ? (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs text-slate-300">
                <tr>
                  <th className="py-2 pr-3">Source</th>
                  <th className="py-2 pr-3">Parser</th>
                  <th className="py-2 pr-3">When</th>
                  <th className="py-2 pr-3">Error</th>
                </tr>
              </thead>
              <tbody className="text-slate-200">
                {failedRaw.data.slice(0, 20).map((r) => (
                  <tr key={r._id} className="border-t border-white/10">
                    <td className="py-2 pr-3">
                      <a className="hover:underline" href={r.sourceUrl} target="_blank" rel="noreferrer">
                        {r.sourceName}
                      </a>
                      <div className="text-xs text-slate-300">{r.sourceType}</div>
                    </td>
                    <td className="py-2 pr-3 text-xs text-slate-300">{r.parserId}</td>
                    <td className="py-2 pr-3 text-xs text-slate-300">{format(new Date(r.scrapedAt), "PP p")}</td>
                    <td className="py-2 pr-3 text-xs text-energy-200">{r.errorMessage ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-200">No failed snapshots found.</p>
        )}
      </div>
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
  const status = props.loading ? "Loading…" : props.log ? props.log.status : "Not run";
  const time = props.log ? format(new Date(props.log.lastRunAt), "PP p") : "—";
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

