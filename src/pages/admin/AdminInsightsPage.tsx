import { useState } from "react";
import { format } from "date-fns";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { useAdminInsights } from "../../hooks/admin/useAdminInsights";

export function AdminInsightsPage() {
  const api = useAdminInsights();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("weekly");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Insights</h1>
        <p className="mt-1 text-sm text-slate-200">Write simple explanations (plain English / Taglish-friendly).</p>
      </div>

      <Card>
        <CardHeader title="Add insight" subtitle="Avoid technical market jargon. Keep it easy to understand." />
        <CardBody className="grid gap-3 md:grid-cols-2">
          <Field label="Title" value={title} onChange={setTitle} />
          <Field label="Category" value={category} onChange={setCategory} />
          <label className="md:col-span-2 block space-y-1">
            <span className="text-xs font-medium text-slate-300">Message</span>
            <textarea
              className="min-h-24 w-full rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white outline-none ring-brand-500/30 focus:ring-2"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Example: Global oil prices increased this week, which may affect local fuel prices."
            />
          </label>
          <div className="md:col-span-2">
            <button
              className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-60"
              onClick={() => api.create.mutate({ title, message, category })}
              disabled={api.create.isPending || !title || !message}
            >
              {api.create.isPending ? "Saving…" : "Save"}
            </button>
          </div>
        </CardBody>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader title="Insights" subtitle="Newest first" />
        <CardBody className="p-0">
          {api.list.isLoading ? (
            <div className="p-4 text-sm text-slate-300">Loading…</div>
          ) : api.list.isError ? (
            <div className="p-4 text-sm text-energy-200">Failed to load insights.</div>
          ) : (
            <div className="divide-y divide-white/10">
              {(api.list.data ?? []).slice(0, 100).map((i) => (
                <div key={i._id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white">{i.title}</p>
                      <p className="mt-1 text-xs text-slate-300">
                        {i.category} • {format(new Date(i.createdAt), "PP p")}
                      </p>
                    </div>
                    <button
                      className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs font-semibold text-white hover:bg-white/10"
                      onClick={() => api.remove.mutate(i._id)}
                    >
                      Delete
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-slate-200">{i.message}</p>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
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

