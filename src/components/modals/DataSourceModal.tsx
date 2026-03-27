import { X } from "lucide-react";
import { format } from "date-fns";
import type { FuelPricePH } from "../../types/api";

export function DataSourceModal({
  open,
  onClose,
  record,
}: {
  open: boolean;
  onClose: () => void;
  record: FuelPricePH | null;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200/60 bg-white shadow-xl dark:border-white/10 dark:bg-slate-950">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200/60 px-5 py-4 dark:border-white/10">
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">Data source transparency</div>
            <div className="mt-0.5 text-xs text-slate-700 dark:text-slate-200">
              This shows where the displayed value came from (with timestamps and confidence).
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-4">
          {!record ? (
            <div className="text-sm text-slate-700 dark:text-slate-200">No record selected.</div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200/60 bg-slate-50 px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium text-slate-900 dark:text-white">
                    {record.fuelType} • {record.region}
                  </div>
                  {record.supportingSources?.some((s) => s.sourceType === "official_local" && /DOE/i.test(s.sourceName)) && (
                    <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-500">
                      DOE-verified
                    </span>
                  )}
                </div>
                <div className="mt-1 text-slate-700 dark:text-slate-200">
                  Status: <span className="font-medium">{record.status}</span>
                  {typeof record.confidenceScore === "number" ? (
                    <>
                      {" "}
                      • Confidence:{" "}
                      <span className="font-medium">
                        {Math.round(record.confidenceScore * 100)}%
                        {record.confidenceLabel ? ` (${record.confidenceLabel})` : ""}
                      </span>
                    </>
                  ) : null}
                </div>
                {record.explanation ? (
                  <div className="mt-2 text-xs text-slate-700 dark:text-slate-200">Why this estimate: {record.explanation}</div>
                ) : null}
                <div className="mt-1 text-xs text-slate-700 dark:text-slate-200">
                  {record.lastVerifiedAt ? (
                    <>
                      Last verified: <span className="font-medium">{format(new Date(record.lastVerifiedAt), "PP p")}</span>
                    </>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
                  Source breakdown
                </div>
                {record.sourceBreakdown?.length ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {record.sourceBreakdown.map((entry, idx) => (
                      <div
                        key={`${entry.sourceCategory}-${idx}`}
                        className="rounded-xl border border-slate-200/60 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-slate-950"
                      >
                        <div className="font-medium text-slate-900 dark:text-white">{entry.sourceCategory}</div>
                        <div className="mt-1 text-xs text-slate-700 dark:text-slate-200">
                          Samples: {entry.sampleSize} • Avg confidence: {Math.round(entry.avgConfidence * 100)}%
                        </div>
                        <div className="mt-1 text-xs text-slate-700 dark:text-slate-200">
                          Avg price: {typeof entry.avgPrice === "number" ? `PHP ${entry.avgPrice.toFixed(2)}` : "n/a"}
                          {" • "}
                          Freshness: {typeof entry.freshnessHours === "number" ? `${Math.round(entry.freshnessHours)}h` : "n/a"}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-slate-700 dark:text-slate-200">No source breakdown available yet.</div>
                )}
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
                  Supporting sources
                </div>
                {record.supportingSources?.length ? (
                  <div className="space-y-2">
                    {record.supportingSources.map((s, idx) => (
                      <a
                        key={`${s.sourceUrl}-${idx}`}
                        href={s.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="block rounded-xl border border-slate-200/60 bg-white px-4 py-3 text-sm hover:bg-slate-50 dark:border-white/10 dark:bg-slate-950 dark:hover:bg-white/5"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="font-medium text-slate-900 dark:text-white">{s.sourceName}</div>
                          <div className="text-xs text-slate-700 dark:text-slate-200">
                            {Math.round(s.confidenceScore * 100)}%
                          </div>
                        </div>
                        <div className="mt-1 text-xs text-slate-700 dark:text-slate-200">
                          {s.statusLabel} • {s.sourceType}
                          {" • "}
                          {s.sourcePublishedAt ? `Published: ${format(new Date(s.sourcePublishedAt), "PP p")}` : "Published: —"}
                          {" • "}
                          {s.scrapedAt ? `Scraped: ${format(new Date(s.scrapedAt), "PP p")}` : "Scraped: —"}
                        </div>
                        <div className="mt-1 text-xs text-slate-700 dark:text-slate-200 break-all">{s.sourceUrl}</div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-slate-700 dark:text-slate-200">
                    No supporting sources attached yet.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

