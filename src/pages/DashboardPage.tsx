import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useLocation } from "react-router-dom";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { MetricCard } from "../components/cards/MetricCard";
import { StatusBadge } from "../components/badges/StatusBadge";
import { AlertBanner } from "../components/banners/AlertBanner";
import { SectionHeader } from "../components/ui/SectionHeader";
import { SegmentedControl } from "../components/ui/SegmentedControl";
import { DataSourceModal } from "../components/modals/DataSourceModal";
import { useAlerts } from "../hooks/useAlerts";
import { useCompanyPrices } from "../hooks/useCompanyPrices";
import { useForecast } from "../hooks/useForecast";
import { useGlobalHistory } from "../hooks/useGlobalHistory";
import { useGlobalLatest } from "../hooks/useGlobalLatest";
import { useInsights } from "../hooks/useInsights";
import { usePhHistory } from "../hooks/usePhHistory";
import { usePhLatest } from "../hooks/usePhLatest";
import { useObservedPrices } from "../hooks/useObservedPrices";
import type { CompanyPrice, FuelPricePH, GlobalPrice } from "../types/api";
import type { FuelType, Region } from "../types/domain";

const regions: Region[] = ["NCR", "Luzon", "Visayas", "Mindanao"];
const fuels: FuelType[] = ["Gasoline", "Diesel", "Kerosene"];
const companies = ["Petron", "Shell", "Caltex", "SeaOil", "Phoenix", "Cleanfuel", "Unioil", "Jetti"];

export function DashboardPage() {
  const [region, setRegion] = useState<Region>("NCR");
  const [period, setPeriod] = useState<7 | 30 | 90>(30);
  const [company, setCompany] = useState<string>("");
  const [fuelFilter, setFuelFilter] = useState<FuelType | "">("");
  const location = useLocation();
  const [panel, setPanel] = useState<"overview" | "philippines" | "insights">("overview");
  const [sourceModalOpen, setSourceModalOpen] = useState(false);
  const [selectedPhRecord, setSelectedPhRecord] = useState<FuelPricePH | null>(null);

  const globalLatest = useGlobalLatest();
  const phLatest = usePhLatest(region);
  const companyPrices = useCompanyPrices({
    region,
    fuelType: fuelFilter || undefined,
    company: company || undefined,
  });
  const insights = useInsights();
  const alerts = useAlerts();
  const forecast = useForecast(region);
  const observed = useObservedPrices({ region, fuelType: fuelFilter || undefined });

  const brentHistory = useGlobalHistory("Brent", period);
  const wtiHistory = useGlobalHistory("WTI", period);
  const gasHistory = usePhHistory("Gasoline", region, period);
  const dieselHistory = usePhHistory("Diesel", region, period);

  const chartBrentGas = useMemo(
    () => mergeByDay(brentHistory.data ?? [], gasHistory.data ?? [], "brent", "gasoline"),
    [brentHistory.data, gasHistory.data],
  );
  const chartBrentDiesel = useMemo(
    () => mergeByDay(brentHistory.data ?? [], dieselHistory.data ?? [], "brent", "diesel"),
    [brentHistory.data, dieselHistory.data],
  );
  const chartWtiGas = useMemo(
    () => mergeByDay(wtiHistory.data ?? [], gasHistory.data ?? [], "wti", "gasoline"),
    [wtiHistory.data, gasHistory.data],
  );

  const globalCards = toGlobalCards(globalLatest.data ?? []);
  const phCards = toPhCards(phLatest.data ?? []);

  useEffect(() => {
    if (location.pathname !== "/dashboard") return;
    const h = (location.hash || "").replace("#", "");
    if (h === "philippines") setPanel("philippines");
    else if (h === "insights") setPanel("insights");
    else setPanel("overview");
  }, [location.pathname, location.hash]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Dashboard</h2>
          <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">
            Simple, transparent monitoring for global oil reference and PH pump prices.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Select label="Region" value={region} onChange={(v) => setRegion(v as Region)} options={regions} />
          <div className="sm:hidden">
            <Select
              label="Range"
              value={String(period)}
              onChange={(v) => setPeriod(Number(v) as 7 | 30 | 90)}
              options={["7", "30", "90"]}
            />
          </div>
          <div className="hidden sm:block">
            <SegmentedControl
              label="Range"
              value={String(period) as "7" | "30" | "90"}
              onChange={(v) => setPeriod(Number(v) as 7 | 30 | 90)}
              options={[
                { label: "7d", value: "7" },
                { label: "30d", value: "30" },
                { label: "90d", value: "90" },
              ]}
            />
          </div>
        </div>
      </div>

      <section aria-label="Alerts banner" className="shrink-0">
        {alerts.isLoading || forecast.isLoading ? (
          <div className="h-[72px] animate-pulse rounded-2xl border border-slate-200/60 bg-white/70 dark:border-white/10 dark:bg-white/5" />
        ) : (
          <AlertBanner
            title={(alerts.data?.[0]?.title as string | undefined) ?? "Heads up"}
            message={
              (alerts.data?.[0]?.message as string | undefined) ??
              (forecast.data?.[0]?.message as string | undefined) ??
              "Stay updated—price movements can change weekly. Check back for the latest verified updates."
            }
            href="/dashboard#alerts"
            footnote={forecast.data?.[0]?.label}
          />
        )}
      </section>

      {/* One-screen layout: no page scroll. Use tabs instead. */}
      <div className="space-y-4">
        <div>
          {globalLatest.isLoading ? (
            <GridSkeleton />
          ) : globalLatest.isError ? (
            <ErrorBox message="Failed to load global reference." />
          ) : (
            <div className="grid gap-3 md:grid-cols-3">
              {globalCards.map((c) => (
                <MetricCard
                  key={c.label}
                  metaLabel="Global Reference"
                  label={c.label}
                  value={c.value}
                  changePercent={c.changePercent}
                  lastUpdated={c.lastUpdated}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <Card>
            <CardHeader
              title="Details"
              subtitle="No scrolling needed—use the tabs to switch."
              right={
                <SegmentedControl
                  label="Dashboard panels"
                  value={panel}
                  onChange={(v) => setPanel(v as any)}
                  options={[
                    { label: "Overview", value: "overview" },
                    { label: "Philippines", value: "philippines" },
                    { label: "Insights", value: "insights" },
                  ]}
                  className="hidden sm:inline-flex"
                />
              }
            />
            <CardBody>
              <div className="mb-4 sm:hidden">
                <Select
                  label="Section"
                  value={panel}
                  onChange={(v) => setPanel(v as any)}
                  options={["overview", "philippines", "insights"]}
                  optionLabels={["Overview", "Philippines", "Insights"]}
                />
              </div>

              <div>
                {panel === "overview" ? (
                  <div className="grid gap-4 lg:grid-cols-12">
                    <div className="space-y-4 lg:col-span-8 pr-0 lg:pr-2">
                      <SectionHeader
                        title="Philippine Fuel Prices"
                        subtitle="Latest PH prices (₱/liter) with weekly adjustments and clear status."
                      />
                      {phLatest.isLoading ? (
                        <GridSkeleton />
                      ) : phLatest.isError ? (
                        <ErrorBox message="Failed to load PH local prices." />
                      ) : (
                        <div className="grid gap-3 md:grid-cols-3">
                          {phCards.map((c) => (
                            <MetricCard
                              key={c.label}
                              metaLabel="PH Local Price"
                              label={c.label}
                              value={c.value}
                              changePercent={c.changePercent}
                              lastUpdated={c.lastUpdated}
                              rightBadge={<StatusBadge status={c.status} />}
                              onClick={
                                c.record
                                  ? () => {
                                      setSelectedPhRecord(c.record);
                                      setSourceModalOpen(true);
                                    }
                                  : undefined
                              }
                            />
                          ))}
                        </div>
                      )}

                      <SectionHeader title="Compare Fuel Prices by Company" subtitle="Use filters to narrow down results." />
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                        <Select
                          label="Fuel type"
                          value={fuelFilter}
                          onChange={(v) => setFuelFilter(v as FuelType | "")}
                          options={["", ...fuels]}
                          optionLabels={["All", ...fuels]}
                        />
                        <Select
                          label="Company"
                          value={company}
                          onChange={(v) => setCompany(v)}
                          options={["", ...companies]}
                          optionLabels={["All", ...companies]}
                        />
                      </div>
                      <Card className="overflow-hidden">
                        <CardHeader title="Price per liter" subtitle={`Region: ${region}`} />
                        <CardBody className="p-0">
                          {companyPrices.isLoading ? (
                            <TableSkeleton />
                          ) : companyPrices.isError ? (
                            <div className="p-4">
                              <ErrorBox message="Failed to load company prices." />
                            </div>
                          ) : companyPrices.data?.length ? (
                            <CompanyTable rows={companyPrices.data} />
                          ) : (
                            <div className="p-4 text-sm text-slate-600 dark:text-slate-300">
                              No records found for the selected filters.
                            </div>
                          )}
                        </CardBody>
                      </Card>
                    </div>

                    <aside className="space-y-4 lg:col-span-4 pl-0 lg:pl-2">
                      <SectionHeader title="Charts & Trends" subtitle="Compare changes over time." />
                      <div className="grid gap-4">
                        <TrendChart
                          title="Brent vs Gasoline"
                          data={chartBrentGas}
                          lines={[
                            { key: "brent", label: "Brent (USD)", color: "#60a5fa" },
                            { key: "gasoline", label: "Gasoline (PHP/L)", color: "#facc15" },
                          ]}
                          loading={brentHistory.isLoading || gasHistory.isLoading}
                        />
                        <TrendChart
                          title="Brent vs Diesel"
                          data={chartBrentDiesel}
                          lines={[
                            { key: "brent", label: "Brent (USD)", color: "#60a5fa" },
                            { key: "diesel", label: "Diesel (PHP/L)", color: "#ef4444" },
                          ]}
                          loading={brentHistory.isLoading || dieselHistory.isLoading}
                        />
                        <TrendChart
                          title="WTI vs Gasoline"
                          data={chartWtiGas}
                          lines={[
                            { key: "wti", label: "WTI (USD)", color: "#93c5fd" },
                            { key: "gasoline", label: "Gasoline (PHP/L)", color: "#facc15" },
                          ]}
                          loading={wtiHistory.isLoading || gasHistory.isLoading}
                        />
                      </div>

                      <SectionHeader title="Alerts" subtitle="Important notices." />
                      {alerts.isLoading ? (
                        <div className="grid gap-3">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} />)}</div>
                      ) : alerts.isError ? (
                        <ErrorBox message="Failed to load alerts." />
                      ) : (
                        <div className="grid gap-3">
                          {(alerts.data ?? []).slice(0, 2).map((a) => (
                            <Card key={a._id}>
                              <CardBody>
                                <div className="flex items-center justify-between gap-3">
                                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{a.title}</p>
                                  <span className="text-xs text-slate-500 dark:text-slate-400">
                                    {format(new Date(a.createdAt), "PP")}
                                  </span>
                                </div>
                                <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">{a.message}</p>
                              </CardBody>
                            </Card>
                          ))}
                        </div>
                      )}
                    </aside>
                  </div>
                ) : panel === "philippines" ? (
                  <div className="space-y-4">
                    <SectionHeader
                      title="Philippines"
                      subtitle="Fuel prices, company comparisons, and guidance in one place."
                    />
                    <SectionHeader
                      title="Philippine Fuel Prices"
                      subtitle="Latest PH prices (₱/liter) with weekly adjustments and clear status."
                    />
                    {phLatest.isLoading ? (
                      <GridSkeleton />
                    ) : phLatest.isError ? (
                      <ErrorBox message="Failed to load PH local prices." />
                    ) : (
                      <div className="grid gap-3 md:grid-cols-3">
                        {phCards.map((c) => (
                          <MetricCard
                            key={c.label}
                            metaLabel="PH Local Price"
                            label={c.label}
                            value={c.value}
                            changePercent={c.changePercent}
                            lastUpdated={c.lastUpdated}
                            rightBadge={<StatusBadge status={c.status} />}
                            onClick={
                              c.record
                                ? () => {
                                    setSelectedPhRecord(c.record);
                                    setSourceModalOpen(true);
                                  }
                                : undefined
                            }
                          />
                        ))}
                      </div>
                    )}

                    <SectionHeader title="Estimated Trend (Guidance)" subtitle="Estimate only – not official. For awareness only." />
                    {forecast.isLoading ? (
                      <GridSkeleton />
                    ) : forecast.isError ? (
                      <ErrorBox message="Failed to load forecast guidance." />
                    ) : (
                      <div className="grid gap-3 md:grid-cols-3">
                        {(forecast.data ?? []).map((c) => (
                          <Card key={c.fuelType}>
                            <CardBody>
                              <div className="flex items-center justify-between gap-3">
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">{c.fuelType}</p>
                                <span className="text-xs text-slate-600 dark:text-slate-300">{c.label}</span>
                              </div>
                              <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">
                                {c.estimatedWeeklyChange > 0 ? "+" : ""}
                                {c.estimatedWeeklyChange.toFixed(2)} /L
                              </p>
                              <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">{c.message}</p>
                            </CardBody>
                          </Card>
                        ))}
                      </div>
                    )}

                    <SectionHeader
                      title="Observed Local Prices (Experimental)"
                      subtitle="Observed only (low confidence). Shown for transparency and comparison, not as official pricing."
                    />
                    {observed.isLoading ? (
                      <TableSkeleton />
                    ) : observed.isError ? (
                      <ErrorBox message="Failed to load observed local prices." />
                    ) : observed.data?.length ? (
                      <div className="overflow-x-auto rounded-2xl border border-slate-200/60 bg-white/70 dark:border-white/10 dark:bg-white/5">
                        <table className="w-full text-left text-sm">
                          <thead className="text-xs text-slate-600 dark:text-slate-300">
                            <tr className="border-b border-slate-200/60 dark:border-white/10">
                              <th className="p-3">Fuel</th>
                              <th className="p-3">Location</th>
                              <th className="p-3">Price</th>
                              <th className="p-3">Source</th>
                              <th className="p-3">Observed</th>
                            </tr>
                          </thead>
                          <tbody className="text-slate-800 dark:text-slate-100">
                            {observed.data.slice(0, 20).map((r) => (
                              <tr key={r._id} className="border-b border-slate-200/60 dark:border-white/10">
                                <td className="p-3">{r.fuelType}</td>
                                <td className="p-3">
                                  <div className="font-medium">{r.city ?? "—"}</div>
                                  <div className="text-xs text-slate-600 dark:text-slate-300">{r.region}</div>
                                </td>
                                <td className="p-3">
                                  {typeof r.pricePerLiter === "number" ? `₱ ${r.pricePerLiter.toFixed(2)}` : "—"}
                                </td>
                                <td className="p-3">
                                  <a
                                    href={r.sourceUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sm font-medium text-brand-700 hover:underline dark:text-brand-200"
                                  >
                                    {r.sourceName}
                                  </a>
                                  <div className="text-xs text-slate-600 dark:text-slate-300">
                                    {Math.round((r.confidenceScore ?? 0.5) * 100)}% • Observed
                                  </div>
                                </td>
                                <td className="p-3 text-xs text-slate-600 dark:text-slate-300">
                                  {format(new Date(r.scrapedAt), "PP p")}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-sm text-slate-600 dark:text-slate-300">No observed records yet.</div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <SectionHeader title="Insights" subtitle="Friendly explanations and quick takeaways." />
                    {insights.isLoading ? (
                      <div className="grid gap-3 md:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} />)}</div>
                    ) : insights.isError ? (
                      <ErrorBox message="Failed to load insights." />
                    ) : (
                      <div className="grid gap-3 md:grid-cols-2">
                        {(insights.data ?? []).slice(0, 6).map((i) => (
                          <Card key={i._id}>
                            <CardBody>
                              <p className="text-sm font-semibold text-slate-900 dark:text-white">{i.title}</p>
                              <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">{i.message}</p>
                            </CardBody>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      <DataSourceModal
        open={sourceModalOpen}
        onClose={() => setSourceModalOpen(false)}
        record={selectedPhRecord}
      />
    </div>
  );
}

function Select(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  optionLabels?: string[];
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{props.label}</span>
      <select
        className="w-full rounded-xl border border-slate-200/60 bg-white/70 px-3 py-2 text-sm text-slate-900 outline-none ring-brand-500/30 focus:ring-2 dark:border-white/10 dark:bg-white/5 dark:text-white"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
      >
        {props.options.map((o, idx) => (
          <option key={o || idx} value={o} className="bg-white dark:bg-slate-950">
            {props.optionLabels?.[idx] ?? o}
          </option>
        ))}
      </select>
    </label>
  );
}

function TrendChart(props: {
  title: string;
  data: Array<Record<string, any>>;
  lines: Array<{ key: string; label: string; color: string }>;
  loading?: boolean;
}) {
  return (
    <Card>
      <CardHeader title={props.title} subtitle="Use the range selector above to change the view." />
      <CardBody className="h-64">
        {props.loading ? (
          <div className="grid h-full place-items-center text-sm text-slate-600 dark:text-slate-300">Loading chart…</div>
        ) : props.data.length === 0 ? (
          <div className="grid h-full place-items-center text-sm text-slate-600 dark:text-slate-300">No data yet.</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={props.data}>
              <CartesianGrid stroke="rgba(148,163,184,0.35)" />
              <XAxis dataKey="day" tick={{ fill: "rgba(51,65,85,0.85)", fontSize: 12 }} />
              <YAxis tick={{ fill: "rgba(51,65,85,0.85)", fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: "rgba(255,255,255,0.95)", border: "1px solid rgba(15,23,42,0.12)" }}
                labelStyle={{ color: "rgba(15,23,42,0.9)" }}
              />
              <Legend />
              {props.lines.map((l) => (
                <Line key={l.key} type="monotone" dataKey={l.key} name={l.label} stroke={l.color} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardBody>
    </Card>
  );
}

function CompanyTable({ rows }: { rows: CompanyPrice[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[820px] w-full text-left text-sm">
        <thead className="bg-black/5 text-xs text-slate-600 dark:bg-white/5 dark:text-slate-300">
          <tr>
            <th className="px-4 py-3">Company</th>
            <th className="px-4 py-3">Fuel</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3">Region</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Updated</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200/60 dark:divide-white/10">
          {rows.slice(0, 80).map((r) => (
            <tr key={r._id} className="hover:bg-black/5 dark:hover:bg-white/5">
              <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{r.companyName}</td>
              <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{r.fuelType}</td>
              <td className="px-4 py-3 text-slate-700 dark:text-slate-200">₱ {r.price.toFixed(2)}</td>
              <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{r.city ? `${r.region} • ${r.city}` : r.region}</td>
              <td className="px-4 py-3">
                <StatusBadge status={r.status} />
              </td>
              <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{format(new Date(r.updatedAt), "PP p")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GridSkeleton() {
  return <div className="grid gap-3 md:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} />)}</div>;
}

function TableSkeleton() {
  return <div className="p-4 text-sm text-slate-600 dark:text-slate-300">Loading…</div>;
}

function Skeleton() {
  return <div className="h-[118px] animate-pulse rounded-2xl border border-slate-200/60 bg-white/70 dark:border-white/10 dark:bg-white/5" />;
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-energy-600/20 bg-energy-500/10 p-4 text-sm text-energy-800 dark:border-energy-500/20 dark:text-energy-200">
      {message}
    </div>
  );
}

function toGlobalCards(items: GlobalPrice[]) {
  const isFiniteNumber = (v: unknown): v is number =>
    typeof v === "number" && Number.isFinite(v);
  const byType = new Map(items.map((i) => [i.type, i]));
  return [
    {
      label: "Brent Crude (USD)",
      value: isFiniteNumber(byType.get("Brent")?.value) ? `$ ${byType.get("Brent")!.value.toFixed(2)}` : "—",
      changePercent: isFiniteNumber(byType.get("Brent")?.changePercent) ? byType.get("Brent")!.changePercent : 0,
      lastUpdated: byType.get("Brent")?.timestamp,
    },
    {
      label: "WTI Crude (USD)",
      value: isFiniteNumber(byType.get("WTI")?.value) ? `$ ${byType.get("WTI")!.value.toFixed(2)}` : "—",
      changePercent: isFiniteNumber(byType.get("WTI")?.changePercent) ? byType.get("WTI")!.changePercent : 0,
      lastUpdated: byType.get("WTI")?.timestamp,
    },
    {
      label: "USD/PHP",
      value: isFiniteNumber(byType.get("USDPHP")?.value) ? `₱ ${byType.get("USDPHP")!.value.toFixed(2)}` : "—",
      changePercent: isFiniteNumber(byType.get("USDPHP")?.changePercent) ? byType.get("USDPHP")!.changePercent : 0,
      lastUpdated: byType.get("USDPHP")?.timestamp,
    },
  ];
}

function toPhCards(items: FuelPricePH[]) {
  const isFiniteNumber = (v: unknown): v is number =>
    typeof v === "number" && Number.isFinite(v);
  const byFuel = new Map(items.map((i) => [i.fuelType, i]));
  return ["Gasoline", "Diesel", "Kerosene"].map((fuel) => {
    const doc = byFuel.get(fuel as FuelType);
    const price = doc?.price;
    const weeklyChange = doc?.weeklyChange;
    const priceNumber = isFiniteNumber(price) ? price : null;
    const weeklyChangeNumber = isFiniteNumber(weeklyChange) ? weeklyChange : null;
    const computedChangePercent =
      priceNumber !== null && weeklyChangeNumber !== null
        ? (weeklyChangeNumber / Math.max(1, priceNumber - weeklyChangeNumber)) * 100
        : 0;
    return {
      label: `${fuel} (PHP/L)`,
      value: priceNumber !== null ? `₱ ${priceNumber.toFixed(2)}` : "—",
      changePercent: computedChangePercent,
      lastUpdated: doc?.updatedAt,
      status: doc?.status ?? "Estimate",
      record: doc ?? null,
    };
  });
}

function mergeByDay(
  globalItems: GlobalPrice[],
  phItems: FuelPricePH[],
  globalKey: string,
  phKey: string,
) {
  const map = new Map<string, any>();

  for (const g of globalItems) {
    const day = format(new Date(g.timestamp), "MM-dd");
    map.set(day, { ...(map.get(day) ?? {}), day, [globalKey]: g.value });
  }
  for (const p of phItems) {
    const day = format(new Date(p.updatedAt), "MM-dd");
    map.set(day, { ...(map.get(day) ?? {}), day, [phKey]: p.price });
  }

  return Array.from(map.values()).sort((a, b) => a.day.localeCompare(b.day));
}

