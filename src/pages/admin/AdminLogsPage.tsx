import { format } from "date-fns";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { useAdminLogs } from "../../hooks/admin/useAdminLogs";

export function AdminLogsPage() {
  const logs = useAdminLogs();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Update Logs</h1>
        <p className="mt-1 text-sm text-slate-200">Monitor update jobs and manual refresh attempts.</p>
      </div>

      <Card className="overflow-hidden">
        <CardHeader title="Logs" subtitle="Newest first" />
        <CardBody className="p-0">
          {logs.isLoading ? (
            <div className="p-4 text-sm text-slate-300">Loading…</div>
          ) : logs.isError ? (
            <div className="p-4 text-sm text-energy-200">Failed to load logs.</div>
          ) : (
            <div className="divide-y divide-white/10">
              {(logs.data ?? []).slice(0, 200).map((l) => (
                <div key={l._id} className="p-4">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-semibold text-white">
                      {l.module} •{" "}
                      <span className={l.status === "success" ? "text-emerald-200" : "text-energy-200"}>
                        {l.status.toUpperCase()}
                      </span>
                    </p>
                    <p className="text-xs text-slate-400">{format(new Date(l.timestamp), "PP p")}</p>
                  </div>
                  <p className="mt-2 text-sm text-slate-200">{l.message}</p>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

