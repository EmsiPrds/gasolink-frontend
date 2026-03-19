import { useState } from "react";
import { format } from "date-fns";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { StatusBadge } from "../../components/badges/StatusBadge";
import { useAdminCompanyPrices } from "../../hooks/admin/useAdminCompanyPrices";
import type { FuelType, PriceStatus, Region } from "../../types/domain";

const regions: Region[] = ["NCR", "Luzon", "Visayas", "Mindanao"];
const fuels: FuelType[] = ["Gasoline", "Diesel", "Kerosene"];
const statuses: PriceStatus[] = ["Verified", "Advisory", "Estimate"];
const companies = ["Petron", "Shell", "Caltex", "SeaOil", "Phoenix", "Cleanfuel", "Unioil", "Jetti"];

export function AdminCompanyPricesPage() {
  const api = useAdminCompanyPrices();
  const [companyName, setCompanyName] = useState(companies[0]);
  const [region, setRegion] = useState<Region>("NCR");
  const [fuelType, setFuelType] = useState<FuelType>("Gasoline");
  const [price, setPrice] = useState("0");
  const [status, setStatus] = useState<PriceStatus>("Advisory");
  const [source, setSource] = useState("Manual admin entry");
  const [city, setCity] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Company Prices</h1>
        <p className="mt-1 text-sm text-slate-200">Manage per-company prices for comparisons by region.</p>
      </div>

      <Card>
        <CardHeader title="Add record" subtitle="Verified entries will be tagged to the current admin user." />
        <CardBody className="grid gap-3 md:grid-cols-6">
          <Select label="Company" value={companyName} onChange={setCompanyName} options={companies} />
          <Select label="Region" value={region} onChange={(v) => setRegion(v as Region)} options={regions} />
          <Select label="Fuel" value={fuelType} onChange={(v) => setFuelType(v as FuelType)} options={fuels} />
          <Field label="Price (PHP/L)" value={price} onChange={setPrice} />
          <Select label="Status" value={status} onChange={(v) => setStatus(v as PriceStatus)} options={statuses} />
          <Field label="Source" value={source} onChange={setSource} />
          <div className="md:col-span-3">
            <Field label="City (optional)" value={city} onChange={setCity} />
          </div>
          <div className="md:col-span-6">
            <button
              className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-60"
              onClick={() =>
                api.create.mutate({
                  companyName,
                  region,
                  fuelType,
                  price: Number(price),
                  status,
                  source,
                  city: city || undefined,
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
              <table className="min-w-[920px] w-full text-left text-sm">
                <thead className="bg-white/5 text-xs text-slate-300">
                  <tr>
                    <th className="px-4 py-3">Company</th>
                    <th className="px-4 py-3">Fuel</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Updated</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {(api.list.data ?? []).slice(0, 200).map((r) => (
                    <tr key={r._id} className="hover:bg-white/5">
                      <td className="px-4 py-3 font-medium text-white">{r.companyName}</td>
                      <td className="px-4 py-3 text-slate-200">{r.fuelType}</td>
                      <td className="px-4 py-3 text-slate-200">₱ {r.price.toFixed(2)}</td>
                      <td className="px-4 py-3 text-slate-200">{r.city ? `${r.region} • ${r.city}` : r.region}</td>
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
    <label className="block space-y-1">
      <span className="text-xs font-medium text-slate-300">{props.label}</span>
      <input
        className="w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white outline-none ring-brand-500/30 focus:ring-2"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
      />
    </label>
  );
}

