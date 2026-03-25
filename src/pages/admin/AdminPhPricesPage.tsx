import { useState } from "react";
import { format } from "date-fns";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { StatusBadge } from "../../components/badges/StatusBadge";
import { useAdminPhPrices } from "../../hooks/admin/useAdminPhPrices";
import type { FuelType, PriceStatus, Region } from "../../types/domain";

const regions: Region[] = ["NCR", "Luzon", "Visayas", "Mindanao"];
const fuels: FuelType[] = ["Gasoline", "Diesel", "Kerosene"];
const statuses: PriceStatus[] = ["Verified", "Advisory", "Estimate"];

export function AdminPhPricesPage() {
  const api = useAdminPhPrices();
  const [region, setRegion] = useState<Region>("NCR");
  const [fuelType, setFuelType] = useState<FuelType>("Gasoline");
  const [price, setPrice] = useState("0");
  const [weeklyChange, setWeeklyChange] = useState("0");
  const [status, setStatus] = useState<PriceStatus>("Verified");
  const [source, setSource] = useState("Manual admin update");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">PH Fuel Prices</h1>
        <p className="mt-1 text-sm text-slate-200">Create and verify local fuel price records (per region).</p>
      </div>

      <Card>
        <CardHeader title="Add record" subtitle="Use clear status labels: Verified, Advisory, Estimate." />
        <CardBody className="grid gap-3 md:grid-cols-6">
          <Select label="Region" value={region} onChange={(v) => setRegion(v as Region)} options={regions} />
          <Select label="Fuel" value={fuelType} onChange={(v) => setFuelType(v as FuelType)} options={fuels} />
          <Field label="Price (PHP/L)" value={price} onChange={setPrice} />
          <Field label="Weekly change" value={weeklyChange} onChange={setWeeklyChange} />
          <Select label="Status" value={status} onChange={(v) => setStatus(v as PriceStatus)} options={statuses} />
          <Field label="Source" value={source} onChange={setSource} />
          <div className="md:col-span-6">
            <button
              className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-60"
              onClick={() =>
                api.create.mutate({
                  region,
                  fuelType,
                  price: Number(price),
                  weeklyChange: Number(weeklyChange),
                  status,
                  source,
                })
              }
              disabled={api.create.isPending}
            >
              {api.create.isPending ? "Saving…" : "Save"}
            </button>
            {api.create.isError ? <p className="mt-2 text-sm text-energy-200">Failed to save.</p> : null}
          </div>
        </CardBody>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader title="Records" subtitle="Newest first" />
        <CardBody className="p-0">
          {api.list.isLoading ? (
            <div className="p-4 text-sm text-slate-300">Loading…</div>
          ) : api.list.isError ? (
            <div className="p-4 text-sm text-energy-200">Failed to load records.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[860px] w-full text-left text-sm">
                <thead className="bg-white/5 text-xs text-slate-300">
                  <tr>
                    <th className="px-4 py-3">Region</th>
                    <th className="px-4 py-3">Fuel</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Weekly</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Updated</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {(api.list.data ?? []).slice(0, 200).map((r) => (
                    <tr key={r._id} className="hover:bg-white/5">
                      <td className="px-4 py-3 text-white">{r.region}</td>
                      <td className="px-4 py-3 text-slate-200">{r.fuelType}</td>
                      <td className="px-4 py-3 text-slate-200">{formatPhpPrice(r.price)}</td>
                      <td className="px-4 py-3 text-slate-200">
                        {r.weeklyChange > 0 ? "+" : ""}
                        {r.weeklyChange.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-4 py-3 text-slate-300">{format(new Date(r.updatedAt), "PP p")}</td>
                      <td className="px-4 py-3">
                        <button
                          className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs font-semibold text-white hover:bg-white/10"
                          onClick={() => api.remove.mutate(r._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

function Select(props: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-slate-300">{props.label}</span>
      <select
        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none ring-brand-500/30 focus:ring-2"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
      >
        {props.options.map((o) => (
          <option key={o} value={o} className="bg-slate-950">
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function Field(props: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block space-y-1 md:col-span-1">
      <span className="text-xs font-medium text-slate-300">{props.label}</span>
      <input
        className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white outline-none ring-brand-500/30 focus:ring-2"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
      />
    </label>
  );
}

function formatPhpPrice(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? `₱ ${value.toFixed(2)}` : "—";
}
