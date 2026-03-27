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
import { ReportPriceModal } from "../components/modals/ReportPriceModal";
import { useAlerts } from "../hooks/useAlerts";
import { useCompanyPrices } from "../hooks/useCompanyPrices";
import { useForecast } from "../hooks/useForecast";
import { useGlobalHistory } from "../hooks/useGlobalHistory";
import { useGlobalLatest } from "../hooks/useGlobalLatest";
import { useInsights } from "../hooks/useInsights";
import { useObservedPrices, type ObservedRecord } from "../hooks/useObservedPrices";
import { usePhHistory } from "../hooks/usePhHistory";
import { usePhLatest } from "../hooks/usePhLatest";
import type { Alert, CompanyPrice, ForecastCard, FuelPricePH, GlobalPrice, Insight } from "../types/api";
import type { FuelType, Region } from "../types/domain";

type DashboardPanel = "overview" | "philippines" | "insights";
type TrendLine = { key: string; label: string; color: string };
type TrendConfig = {
  title: string;
  data: Array<Record<string, string | number | undefined>>;
  lines: TrendLine[];
  loading: boolean;
};
type GlobalCardItem = ReturnType<typeof toGlobalCards>[number];
type PhCardItem = ReturnType<typeof toPhCards>[number];

const regions: Region[] = ["NCR", "Luzon", "Visayas", "Mindanao"];
const fuels: FuelType[] = ["Gasoline", "Diesel", "Kerosene"];
const companies = ["Petron", "Shell", "Caltex", "SeaOil", "Phoenix", "Cleanfuel", "Unioil", "Jetti"];
const rangeSelectOptions = ["7", "30", "90"] as const;
const rangeSegmentOptions = rangeSelectOptions.map((value) => ({ label: `${value}d`, value }));
const panelOptions: Array<{ label: string; value: DashboardPanel }> = [
  { label: "Overview", value: "overview" },
  { label: "Philippines", value: "philippines" },
  { label: "Insights", value: "insights" },
];
const panelSelectOptions = panelOptions.map((option) => option.value);
const panelSelectLabels = panelOptions.map((option) => option.label);
const fuelFilterOptions = ["", ...fuels];
const fuelFilterLabels = ["All", ...fuels];
const companyFilterOptions = ["", ...companies];
const companyFilterLabels = ["All", ...companies];

export function DashboardPage() {
  const [region, setRegion] = useState<Region>("NCR");
  const [period, setPeriod] = useState<7 | 30 | 90>(30);
  const [company, setCompany] = useState("");
  const [fuelFilter, setFuelFilter] = useState<FuelType | "">("");
  const [panel, setPanel] = useState<DashboardPanel>("overview");
  const [sourceModalOpen, setSourceModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedPhRecord, setSelectedPhRecord] = useState<FuelPricePH | null>(null);
  const location = useLocation();

  const companyQuery = useMemo(
    () => ({
      region,
      fuelType: fuelFilter || undefined,
      company: company || undefined,
    }),
    [company, fuelFilter, region],
  );
  const observedQuery = useMemo(
    () => ({
      region,
      fuelType: fuelFilter || undefined,
    }),
    [fuelFilter, region],
  );

  const globalLatest = useGlobalLatest();
  const phLatest = usePhLatest(region);
  const companyPrices = useCompanyPrices(companyQuery);
  const insights = useInsights();
  const alerts = useAlerts();
  const forecast = useForecast(region);
  const observed = useObservedPrices(observedQuery);

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
    [gasHistory.data, wtiHistory.data],
  );

  const globalCards = useMemo(() => toGlobalCards(globalLatest.data ?? []), [globalLatest.data]);
  const phCards = useMemo(() => toPhCards(phLatest.data ?? []), [phLatest.data]);
  const alertItems = useMemo(() => (alerts.data ?? []).slice(0, 2), [alerts.data]);
  const insightItems = useMemo(() => (insights.data ?? []).slice(0, 6), [insights.data]);
  const forecastCards = useMemo(() => forecast.data ?? [], [forecast.data]);
  const observedRows = useMemo(() => (observed.data ?? []).slice(0, 20), [observed.data]);
  const chartConfigs = useMemo<TrendConfig[]>(
    () => [
      {
        title: "Brent vs Gasoline",
        data: chartBrentGas,
        lines: [
          { key: "brent", label: "Brent (USD)", color: "#60a5fa" },
          { key: "gasoline", label: "Gasoline (PHP/L)", color: "#facc15" },
        ],
        loading: brentHistory.isLoading || gasHistory.isLoading,
      },
      {
        title: "Brent vs Diesel",
        data: chartBrentDiesel,
        lines: [
          { key: "brent", label: "Brent (USD)", color: "#60a5fa" },
          { key: "diesel", label: "Diesel (PHP/L)", color: "#ef4444" },
        ],
        loading: brentHistory.isLoading || dieselHistory.isLoading,
      },
      {
        title: "WTI vs Gasoline",
        data: chartWtiGas,
        lines: [
          { key: "wti", label: "WTI (USD)", color: "#93c5fd" },
          { key: "gasoline", label: "Gasoline (PHP/L)", color: "#facc15" },
        ],
        loading: wtiHistory.isLoading || gasHistory.isLoading,
      },
    ],
    [
      brentHistory.isLoading,
      chartBrentDiesel,
      chartBrentGas,
      chartWtiGas,
      dieselHistory.isLoading,
      gasHistory.isLoading,
      wtiHistory.isLoading,
    ],
  );
  const bannerContent = useMemo(
    () => ({
      title: alerts.data?.[0]?.title ?? "Heads up",
      message:
        alerts.data?.[0]?.message ??
        forecast.data?.[0]?.message ??
        "Stay updated - price movements can change weekly. Check back for the latest verified updates.",
      footnote: forecast.data?.[0]?.label,
    }),
    [alerts.data, forecast.data],
  );

  useEffect(() => {
    if (location.pathname !== "/dashboard") return;
    const hash = location.hash.replace("#", "");
    if (hash === "philippines") {
      setPanel("philippines");
      return;
    }
    if (hash === "insights") {
      setPanel("insights");
      return;
    }
    setPanel("overview");
  }, [location.hash, location.pathname]);

  function openSourceModal(record: FuelPricePH) {
    setSelectedPhRecord(record);
    setSourceModalOpen(true);
  }

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
          <button
            type="button"
            onClick={() => setReportModalOpen(true)}
            className="mt-4 whitespace-nowrap rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-700 sm:mt-0"
          >
            Report Price
          </button>
          <Select label="Region" value={region} onChange={(value) => setRegion(value as Region)} options={regions} />
          <div className="sm:hidden">
            <Select
              label="Range"
              value={String(period)}
              onChange={(value) => setPeriod(Number(value) as 7 | 30 | 90)}
              options={rangeSelectOptions}
            />
          </div>
          <div className="hidden sm:block">
            <SegmentedControl
              label="Range"
              value={String(period) as (typeof rangeSelectOptions)[number]}
              onChange={(value) => setPeriod(Number(value) as 7 | 30 | 90)}
              options={rangeSegmentOptions}
            />
          </div>
        </div>
      </div>

      <section aria-label="Alerts banner" className="shrink-0">
        {alerts.isLoading || forecast.isLoading ? (
          <div className="h-[72px] animate-pulse rounded-2xl border border-slate-200/60 bg-white/70 dark:border-white/10 dark:bg-white/5" />
        ) : (
          <AlertBanner
            title={bannerContent.title}
            message={bannerContent.message}
            href="/dashboard#alerts"
            footnote={bannerContent.footnote}
          />
        )}
      </section>

      <div className="space-y-4">
        <GlobalReferenceSection loading={globalLatest.isLoading} isError={globalLatest.isError} cards={globalCards} />

        <Card>
          <CardHeader
            title="Details"
            subtitle="No scrolling needed - use the tabs to switch."
            right={
              <SegmentedControl
                label="Dashboard panels"
                value={panel}
                onChange={(value) => setPanel(value as DashboardPanel)}
                options={panelOptions}
                className="hidden sm:inline-flex"
              />
            }
          />
          <CardBody>
            <div className="mb-4 sm:hidden">
              <Select
                label="Section"
                value={panel}
                onChange={(value) => setPanel(value as DashboardPanel)}
                options={panelSelectOptions}
                optionLabels={panelSelectLabels}
              />
            </div>

            {panel === "overview" ? (
              <div className="grid gap-4 lg:grid-cols-12">
                <div className="space-y-4 pr-0 lg:col-span-8 lg:pr-2">
                  <PhPriceSection
                    title="Philippine Fuel Prices"
                    subtitle="Estimated headline price from DOE baseline, global indicators, scraping, and user reports."
                    loading={phLatest.isLoading}
                    isError={phLatest.isError}
                    cards={phCards}
                    onSelect={openSourceModal}
                  />
                  <CompanyComparisonSection
                    region={region}
                    fuelFilter={fuelFilter}
                    company={company}
                    onFuelFilterChange={setFuelFilter}
                    onCompanyChange={setCompany}
                    loading={companyPrices.isLoading}
                    isError={companyPrices.isError}
                    rows={companyPrices.data ?? []}
                  />
                </div>

                <aside className="space-y-4 pl-0 lg:col-span-4 lg:pl-2">
                  <TrendChartsSection charts={chartConfigs} />
                  <AlertsSection loading={alerts.isLoading} isError={alerts.isError} items={alertItems} />
                </aside>
              </div>
            ) : panel === "philippines" ? (
              <div className="space-y-4">
                <SectionHeader
                  title="Philippines"
                  subtitle="Fuel prices, company comparisons, and guidance in one place."
                />
                <PhPriceSection
                  title="Philippine Fuel Prices"
                  subtitle="Estimated headline price from DOE baseline, global indicators, scraping, and user reports."
                  loading={phLatest.isLoading}
                  isError={phLatest.isError}
                  cards={phCards}
                  onSelect={openSourceModal}
                />
                <ForecastSection loading={forecast.isLoading} isError={forecast.isError} items={forecastCards} />
                <ObservedPricesSection loading={observed.isLoading} isError={observed.isError} rows={observedRows} />
              </div>
            ) : (
              <InsightsSection loading={insights.isLoading} isError={insights.isError} items={insightItems} />
            )}
          </CardBody>
        </Card>
      </div>

      <DataSourceModal open={sourceModalOpen} onClose={() => setSourceModalOpen(false)} record={selectedPhRecord} />
      <ReportPriceModal isOpen={reportModalOpen} onClose={() => setReportModalOpen(false)} />
    </div>
  );
}

function GlobalReferenceSection(props: { loading: boolean; isError: boolean; cards: GlobalCardItem[] }) {
  if (props.loading) return <GridSkeleton />;
  if (props.isError) return <ErrorBox message="Failed to load global reference." />;

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {props.cards.map((card) => (
        <MetricCard
          key={card.label}
          metaLabel="Global Reference"
          label={card.label}
          value={card.value}
          changePercent={card.changePercent}
          lastUpdated={card.lastUpdated}
        />
      ))}
    </div>
  );
}

function PhPriceSection(props: {
  title: string;
  subtitle: string;
  loading: boolean;
  isError: boolean;
  cards: PhCardItem[];
  onSelect: (record: FuelPricePH) => void;
}) {
  return (
    <div className="space-y-4">
      <SectionHeader title={props.title} subtitle={props.subtitle} />
      {props.loading ? (
        <GridSkeleton />
      ) : props.isError ? (
        <ErrorBox message="Failed to load PH local prices." />
      ) : (
        <div className="grid gap-3 md:grid-cols-3">
          {props.cards.map((card) => {
            const record = card.record;
            return (
              <MetricCard
                key={card.label}
                metaLabel="PH Local Price"
                label={card.label}
                value={card.value}
                extraValue={card.extraValue}
                changePercent={card.changePercent}
                lastUpdated={card.lastUpdated}
                rightBadge={card.status ? <StatusBadge status={card.status} /> : undefined}
                onClick={record ? () => props.onSelect(record) : undefined}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function CompanyComparisonSection(props: {
  region: Region;
  fuelFilter: FuelType | "";
  company: string;
  onFuelFilterChange: (value: FuelType | "") => void;
  onCompanyChange: (value: string) => void;
  loading: boolean;
  isError: boolean;
  rows: CompanyPrice[];
}) {
  return (
    <div className="space-y-4">
      <SectionHeader title="Compare Fuel Prices by Company" subtitle="Use filters to narrow down results." />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <Select
          label="Fuel type"
          value={props.fuelFilter}
          onChange={(value) => props.onFuelFilterChange(value as FuelType | "")}
          options={fuelFilterOptions}
          optionLabels={fuelFilterLabels}
        />
        <Select
          label="Company"
          value={props.company}
          onChange={props.onCompanyChange}
          options={companyFilterOptions}
          optionLabels={companyFilterLabels}
        />
      </div>
      <Card className="overflow-hidden">
        <CardHeader title="Price per liter" subtitle={`Region: ${props.region}`} />
        <CardBody className="p-0">
          {props.loading ? (
            <TableSkeleton />
          ) : props.isError ? (
            <div className="p-4">
              <ErrorBox message="Failed to load company prices." />
            </div>
          ) : props.rows.length ? (
            <CompanyTable rows={props.rows} />
          ) : (
            <div className="p-4 text-sm text-slate-600 dark:text-slate-300">
              No records found for the selected filters.
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function TrendChartsSection(props: { charts: TrendConfig[] }) {
  return (
    <div className="space-y-4">
      <SectionHeader title="Charts & Trends" subtitle="Compare changes over time." />
      <div className="grid gap-4">
        {props.charts.map((chart) => (
          <TrendChart key={chart.title} title={chart.title} data={chart.data} lines={chart.lines} loading={chart.loading} />
        ))}
      </div>
    </div>
  );
}

function AlertsSection(props: { loading: boolean; isError: boolean; items: Alert[] }) {
  return (
    <div className="space-y-4">
      <SectionHeader title="Alerts" subtitle="Important notices." />
      {props.loading ? (
        <div className="grid gap-3">{Array.from({ length: 2 }).map((_, index) => <Skeleton key={index} />)}</div>
      ) : props.isError ? (
        <ErrorBox message="Failed to load alerts." />
      ) : (
        <div className="grid gap-3">
          {props.items.map((item) => (
            <Card key={item._id}>
              <CardBody>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</p>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {format(new Date(item.createdAt), "PP")}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">{item.message}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ForecastSection(props: { loading: boolean; isError: boolean; items: ForecastCard[] }) {
  return (
    <div className="space-y-4">
      <SectionHeader title="Estimated Trend (Guidance)" subtitle="Estimate only - not official. For awareness only." />
      {props.loading ? (
        <GridSkeleton />
      ) : props.isError ? (
        <ErrorBox message="Failed to load forecast guidance." />
      ) : (
        <div className="grid gap-3 md:grid-cols-3">
          {props.items.map((item) => (
            <Card key={item.fuelType}>
              <CardBody>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.fuelType}</p>
                  <span className="text-xs text-slate-600 dark:text-slate-300">{item.label}</span>
                </div>
                <p className="mt-3 text-2xl font-semibold text-slate-900 dark:text-white">
                  {item.estimatedWeeklyChange > 0 ? "+" : ""}
                  {item.estimatedWeeklyChange.toFixed(2)} /L
                </p>
                <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">{item.message}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ObservedPricesSection(props: { loading: boolean; isError: boolean; rows: ObservedRecord[] }) {
  return (
    <div className="space-y-4">
      <SectionHeader
        title="Observed Local Prices (Experimental)"
        subtitle="Observed only (low confidence). Shown for transparency and comparison, not as official pricing."
      />
      {props.loading ? (
        <TableSkeleton />
      ) : props.isError ? (
        <ErrorBox message="Failed to load observed local prices." />
      ) : props.rows.length ? (
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
              {props.rows.map((row) => (
                <tr key={row._id} className="border-b border-slate-200/60 dark:border-white/10">
                  <td className="p-3">{row.fuelType}</td>
                  <td className="p-3">
                    <div className="font-medium">{row.city ?? "N/A"}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-300">{row.region}</div>
                  </td>
                  <td className="p-3">
                    {formatPhpPrice(row.pricePerLiter)}
                  </td>
                  <td className="p-3">
                    <a
                      href={row.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-brand-700 hover:underline dark:text-brand-200"
                    >
                      {row.sourceName}
                    </a>
                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      {Math.round((row.confidenceScore ?? 0.5) * 100)}% | Observed
                    </div>
                  </td>
                  <td className="p-3 text-xs text-slate-600 dark:text-slate-300">
                    {format(new Date(row.scrapedAt), "PP p")}
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
  );
}

function InsightsSection(props: { loading: boolean; isError: boolean; items: Insight[] }) {
  return (
    <div className="space-y-4">
      <SectionHeader title="Insights" subtitle="Friendly explanations and quick takeaways." />
      {props.loading ? (
        <div className="grid gap-3 md:grid-cols-2">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} />)}</div>
      ) : props.isError ? (
        <ErrorBox message="Failed to load insights." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {props.items.map((item) => (
            <Card key={item._id}>
              <CardBody>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</p>
                <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">{item.message}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function Select(props: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: ReadonlyArray<string>;
  optionLabels?: ReadonlyArray<string>;
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{props.label}</span>
      <select
        className="w-full rounded-xl border border-slate-200/60 bg-white/70 px-3 py-2 text-sm text-slate-900 outline-none ring-brand-500/30 focus:ring-2 dark:border-white/10 dark:bg-white/5 dark:text-white"
        value={props.value}
        onChange={(event) => props.onChange(event.target.value)}
      >
        {props.options.map((option, index) => (
          <option key={option || index} value={option} className="bg-white dark:bg-slate-950">
            {props.optionLabels?.[index] ?? option}
          </option>
        ))}
      </select>
    </label>
  );
}

function TrendChart(props: {
  title: string;
  data: Array<Record<string, string | number | undefined>>;
  lines: TrendLine[];
  loading?: boolean;
}) {
  return (
    <Card>
      <CardHeader title={props.title} subtitle="Use the range selector above to change the view." />
      <CardBody className="h-64">
        {props.loading ? (
          <div className="grid h-full place-items-center text-sm text-slate-600 dark:text-slate-300">Loading chart...</div>
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
              {props.lines.map((line) => (
                <Line key={line.key} type="monotone" dataKey={line.key} name={line.label} stroke={line.color} dot={false} />
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
          {rows.slice(0, 80).map((row) => (
            <tr key={row._id} className="hover:bg-black/5 dark:hover:bg-white/5">
              <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{row.companyName}</td>
              <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{row.fuelType}</td>
              <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{formatPhpPrice(row.price)}</td>
              <td className="px-4 py-3 text-slate-700 dark:text-slate-200">
                {row.city ? `${row.region} | ${row.city}` : row.region}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={row.status} />
              </td>
              <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{format(new Date(row.updatedAt), "PP p")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function GridSkeleton() {
  return <div className="grid gap-3 md:grid-cols-3">{Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} />)}</div>;
}

function TableSkeleton() {
  return <div className="p-4 text-sm text-slate-600 dark:text-slate-300">Loading...</div>;
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
  const isFiniteNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);
  const byType = new Map(items.map((item) => [item.type, item]));

  return [
    {
      label: "Brent Crude (USD)",
      value: isFiniteNumber(byType.get("Brent")?.value) ? `$ ${byType.get("Brent")!.value.toFixed(2)}` : "N/A",
      changePercent: isFiniteNumber(byType.get("Brent")?.changePercent) ? byType.get("Brent")!.changePercent : undefined,
      lastUpdated: byType.get("Brent")?.timestamp,
    },
    {
      label: "WTI Crude (USD)",
      value: isFiniteNumber(byType.get("WTI")?.value) ? `$ ${byType.get("WTI")!.value.toFixed(2)}` : "N/A",
      changePercent: isFiniteNumber(byType.get("WTI")?.changePercent) ? byType.get("WTI")!.changePercent : undefined,
      lastUpdated: byType.get("WTI")?.timestamp,
    },
    {
      label: "USD/PHP",
      value: isFiniteNumber(byType.get("USDPHP")?.value) ? `PHP ${byType.get("USDPHP")!.value.toFixed(2)}` : "N/A",
      changePercent: isFiniteNumber(byType.get("USDPHP")?.changePercent) ? byType.get("USDPHP")!.changePercent : undefined,
      lastUpdated: byType.get("USDPHP")?.timestamp,
    },
  ];
}

function toPhCards(items: FuelPricePH[]) {
  const isFiniteNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);
  const byFuel = new Map(items.map((item) => [item.fuelType, item]));

  return fuels.map((fuel) => {
    const doc = byFuel.get(fuel);
    const priceNumber = isFiniteNumber(doc?.price) ? doc.price : null;
    const averagePriceNumber = isFiniteNumber(doc?.averagePrice) ? doc.averagePrice : null;
    const weeklyChangeNumber = isFiniteNumber(doc?.weeklyChange) ? doc.weeklyChange : null;
    const computedChangePercent =
      priceNumber !== null && weeklyChangeNumber !== null
        ? (weeklyChangeNumber / Math.max(1, priceNumber - weeklyChangeNumber)) * 100
        : 0;

    return {
      label: `${fuel} (PHP/L)`,
      value: priceNumber !== null ? `Estimated: ${formatPhpPrice(doc?.estimatedPrice ?? priceNumber)}` : "N/A",
      extraValue:
        typeof doc?.confidenceScore === "number"
          ? `${Math.round(doc.confidenceScore * 100)}% confidence${doc.confidenceLabel ? ` (${doc.confidenceLabel})` : ""}`
          : averagePriceNumber !== null
            ? `Average: ${formatPhpPrice(averagePriceNumber)}`
            : undefined,
      changePercent: priceNumber !== null && weeklyChangeNumber !== null ? computedChangePercent : undefined,
      lastUpdated: doc?.updatedAt,
      status: doc?.status,
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
  const map = new Map<
    string,
    {
      day: string;
      sortTime: number;
      [key: string]: string | number | undefined;
    }
  >();

  function upsertPoint(timestamp: string, valueKey: string, value?: number) {
    const date = new Date(timestamp);
    const pointKey = format(date, "yyyy-MM-dd");
    const existing = map.get(pointKey);

    map.set(pointKey, {
      ...(existing ?? {
        day: format(date, "MM-dd"),
        sortTime: date.getTime(),
      }),
      [valueKey]: value,
    });
  }

  for (const item of globalItems) {
    upsertPoint(item.timestamp, globalKey, item.value);
  }

  for (const item of phItems) {
    upsertPoint(item.updatedAt, phKey, item.price ?? undefined);
  }

  return Array.from(map.values())
    .sort((a, b) => a.sortTime - b.sortTime)
    .map(({ sortTime: _sortTime, ...point }) => point);
}

function formatPhpPrice(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? `PHP ${value.toFixed(2)}` : "N/A";
}
