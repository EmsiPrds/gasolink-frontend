import { useState } from "react";
import { format } from "date-fns";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { useAdminAlerts } from "../../hooks/admin/useAdminAlerts";
import type { AlertLevel } from "../../types/domain";

const levels: AlertLevel[] = ["info", "warning", "critical"];

export function AdminAlertsPage() {
  const api = useAdminAlerts();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [level, setLevel] = useState<AlertLevel>("info");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Alerts</h1>
        <p className="mt-1 text-sm text-slate-200">Post important notices that are noticeable but not intrusive.</p>
      </div>

      <Card>
        <CardHeader title="Add alert" subtitle="Use warning/critical only for meaningful events." />
        <CardBody className="grid gap-3 md:grid-cols-2">
          <Field label="Title" value={title} onChange={setTitle} />
          <Select label="Level" value={level} onChange={(v) => setLevel(v as AlertLevel)} options={levels} />
          <label className="md:col-span-2 block space-y-1">
            <span className="text-xs font-medium text-slate-300">Message</span>
            <textarea
              className="min-h-24 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white outline-none ring-brand-500/30 focus:ring-2"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Example: Official local update published."
            />
          </label>
          <div className="md:col-span-2">
            <button
              className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-60"
              onClick={() => api.create.mutate({ title, message, level, active: true })}
              disabled={api.create.isPending || !title || !message}
            >
              {api.create.isPending ? "Saving…" : "Save"}
            </button>
          </div>
        </CardBody>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader title="Alerts" subtitle="Newest first" />
        <CardBody className="p-0">
          {api.list.isLoading ? (
            <div className="p-4 text-sm text-slate-300">Loading…</div>
          ) : api.list.isError ? (
            <div className="p-4 text-sm text-energy-200">Failed to load alerts.</div>
          ) : (
            <div className="divide-y divide-white/10">
              {(api.list.data ?? []).slice(0, 100).map((a) => (
                <div key={a._id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white">{a.title}</p>
                      <p className="mt-1 text-xs text-slate-300">
                        {a.level.toUpperCase()} • {format(new Date(a.createdAt), "PP p")}
                      </p>
                    </div>
                    <button
                      className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs font-semibold text-white hover:bg-white/10"
                      onClick={() => api.remove.mutate(a._id)}
                    >
                      Delete
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-slate-200">{a.message}</p>
                </div>
              ))}
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

