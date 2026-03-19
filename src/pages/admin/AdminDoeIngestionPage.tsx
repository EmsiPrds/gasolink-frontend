import { useState } from "react";
import {
  useDoeCommit,
  useDoeLink,
  useDoeUpload,
  useDoeUploadDetails,
  useDoeUploads,
  type DoePreviewRow,
} from "../../hooks/admin/useAdminDoeIngestion";

type EditableRow = DoePreviewRow & { include: boolean };

export function AdminDoeIngestionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [preview, setPreview] = useState<{
    rawSourceId: string;
    rows: EditableRow[];
    rawTextSample: string;
  } | null>(null);
  const [selectedUploadId, setSelectedUploadId] = useState<string | null>(null);

  const uploadMutation = useDoeUpload();
  const linkMutation = useDoeLink();
  const uploadsQuery = useDoeUploads();
  const detailsQuery = useDoeUploadDetails(selectedUploadId);
  const commitMutation = useDoeCommit(preview?.rawSourceId ?? "");

  const hasPreview = !!preview;

  const handleUpload = async () => {
    if (!file) return;
    const res = await uploadMutation.mutateAsync({ file, note: note || undefined });
    setPreview({
      rawSourceId: res.rawSourceId,
      rows: res.rows.map((r) => ({ ...r, include: true })),
      rawTextSample: res.rawTextSample,
    });
  };

  const handleLinkSubmit = async () => {
    if (!linkUrl.trim()) return;
    const res = await linkMutation.mutateAsync({ url: linkUrl.trim(), note: note || undefined });
    setPreview({
      rawSourceId: res.rawSourceId,
      rows: res.rows.map((r) => ({ ...r, include: true })),
      rawTextSample: res.rawTextSample,
    });
  };

  const handleCommit = async () => {
    if (!preview) return;
    const payload = preview.rows.map((r) => ({
      tempId: r.tempId,
      include: r.include,
      fuelType: r.fuelType,
      pricePerLiter: r.pricePerLiter,
      priceChange: r.priceChange,
      effectiveAt: r.effectiveAt,
      region: r.region,
      area: r.area,
      companyName: r.companyName,
    }));
    await commitMutation.mutateAsync(payload);
  };

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-white">DOE ingestion</h1>
        <p className="text-sm text-slate-300">
          Upload official DOE PDFs or paste DOE links. The system will parse fuel prices, let you review and edit them,
          then publish only approved data to the dashboard.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-sm font-semibold text-white">Source input</h2>
          <div className="space-y-4 text-sm">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300">Upload DOE PDF</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="block w-full text-xs text-slate-200 file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-white/20"
              />
              <button
                type="button"
                onClick={handleUpload}
                disabled={!file || uploadMutation.isPending}
                className="rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-500/50"
              >
                {uploadMutation.isPending ? "Uploading…" : "Upload and parse"}
              </button>
            </div>

            <div className="space-y-2 border-t border-white/10 pt-4">
              <label className="block text-xs font-medium text-slate-300">Paste DOE link</label>
              <input
                type="url"
                placeholder="https://www.doe.gov.ph/..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full rounded-md border border-white/10 bg-slate-900 px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleLinkSubmit}
                disabled={!linkUrl.trim() || linkMutation.isPending}
                className="rounded-md bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-sky-500/50"
              >
                {linkMutation.isPending ? "Parsing link…" : "Parse link"}
              </button>
            </div>

            <div className="space-y-2 border-t border-white/10 pt-4">
              <label className="block text-xs font-medium text-slate-300">Admin note (optional)</label>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
                placeholder="Short description of this DOE advisory (e.g. week of March 18, regional pump prices)."
              />
            </div>
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Parsed data & raw text</h2>
            {hasPreview && (
              <button
                type="button"
                onClick={handleCommit}
                disabled={commitMutation.isPending}
                className="rounded-md bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-500/50"
              >
                {commitMutation.isPending ? "Committing…" : "Commit approved rows"}
              </button>
            )}
          </div>

          {!hasPreview && (
            <p className="text-xs text-slate-300">
              Upload a DOE PDF or paste a DOE link to see extracted fuel prices and raw text here before saving.
            </p>
          )}

          {hasPreview && (
            <div className="grid gap-4 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
              <div className="max-h-80 overflow-auto rounded-xl border border-white/10 bg-slate-950/60">
                <table className="min-w-full border-collapse text-xs">
                  <thead className="bg-white/5 text-slate-200">
                    <tr>
                      <th className="px-3 py-2 text-left">Include</th>
                      <th className="px-3 py-2 text-left">Fuel</th>
                      <th className="px-3 py-2 text-left">Region</th>
                      <th className="px-3 py-2 text-left">Area</th>
                      <th className="px-3 py-2 text-right">Price</th>
                      <th className="px-3 py-2 text-right">Change</th>
                      <th className="px-3 py-2 text-left">Effective</th>
                      <th className="px-3 py-2 text-left">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.map((row, idx) => (
                      <tr key={row.tempId} className="border-t border-white/5">
                      <td className="px-3 py-1.5 align-top">
                        <input
                          type="checkbox"
                          checked={row.include}
                          onChange={(e) => {
                            const next = [...preview.rows];
                            next[idx] = { ...next[idx], include: e.target.checked };
                            setPreview({ ...preview, rows: next });
                          }}
                        />
                      </td>
                      <td className="px-3 py-1.5 align-top">
                        <input
                          value={row.fuelType}
                          onChange={(e) => {
                            const next = [...preview.rows];
                            next[idx] = { ...next[idx], fuelType: e.target.value };
                            setPreview({ ...preview, rows: next });
                          }}
                          className="w-24 rounded border border-white/10 bg-slate-900 px-2 py-1 text-[11px] text-slate-100"
                        />
                      </td>
                      <td className="px-3 py-1.5 align-top">
                        <input
                          value={row.region ?? ""}
                          onChange={(e) => {
                            const next = [...preview.rows];
                            next[idx] = { ...next[idx], region: e.target.value };
                            setPreview({ ...preview, rows: next });
                          }}
                          className="w-20 rounded border border-white/10 bg-slate-900 px-2 py-1 text-[11px] text-slate-100"
                        />
                      </td>
                      <td className="px-3 py-1.5 align-top">
                        <input
                          value={row.area ?? ""}
                          onChange={(e) => {
                            const next = [...preview.rows];
                            next[idx] = { ...next[idx], area: e.target.value };
                            setPreview({ ...preview, rows: next });
                          }}
                          className="w-24 rounded border border-white/10 bg-slate-900 px-2 py-1 text-[11px] text-slate-100"
                        />
                      </td>
                      <td className="px-3 py-1.5 align-top text-right">
                        <input
                          type="number"
                          step="0.01"
                          value={row.pricePerLiter ?? ""}
                          onChange={(e) => {
                            const v = e.target.value === "" ? undefined : Number(e.target.value);
                            const next = [...preview.rows];
                            next[idx] = { ...next[idx], pricePerLiter: v };
                            setPreview({ ...preview, rows: next });
                          }}
                          className="w-20 rounded border border-white/10 bg-slate-900 px-2 py-1 text-[11px] text-slate-100 text-right"
                        />
                      </td>
                      <td className="px-3 py-1.5 align-top text-right">
                        <input
                          type="number"
                          step="0.01"
                          value={row.priceChange ?? ""}
                          onChange={(e) => {
                            const v = e.target.value === "" ? undefined : Number(e.target.value);
                            const next = [...preview.rows];
                            next[idx] = { ...next[idx], priceChange: v };
                            setPreview({ ...preview, rows: next });
                          }}
                          className="w-20 rounded border border-white/10 bg-slate-900 px-2 py-1 text-[11px] text-slate-100 text-right"
                        />
                      </td>
                      <td className="px-3 py-1.5 align-top">
                        <input
                          type="datetime-local"
                          value={row.effectiveAt ? row.effectiveAt.slice(0, 16) : ""}
                          onChange={(e) => {
                            const v = e.target.value ? new Date(e.target.value).toISOString() : undefined;
                            const next = [...preview.rows];
                            next[idx] = { ...next[idx], effectiveAt: v };
                            setPreview({ ...preview, rows: next });
                          }}
                          className="w-40 rounded border border-white/10 bg-slate-900 px-2 py-1 text-[11px] text-slate-100"
                        />
                      </td>
                      <td className="px-3 py-1.5 align-top max-w-[160px]">
                        <a
                          href={row.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="break-all text-[11px] text-sky-400 hover:underline"
                        >
                          {row.sourceUrl}
                        </a>
                      </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="max-h-80 overflow-auto rounded-xl border border-white/10 bg-slate-950/60 p-3">
                <div className="mb-2 text-xs font-semibold text-slate-200">Raw DOE text (first ~4000 chars)</div>
                <pre className="whitespace-pre-wrap break-words text-[11px] text-slate-200">
                  {preview.rawTextSample || "No text extracted from this source."}
                </pre>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between pb-2">
          <h2 className="text-sm font-semibold text-white">Upload history</h2>
        </div>
        {uploadsQuery.isLoading && <p className="text-xs text-slate-300">Loading uploads…</p>}
        {uploadsQuery.data && uploadsQuery.data.length === 0 && (
          <p className="text-xs text-slate-300">No DOE uploads yet.</p>
        )}
        {uploadsQuery.data && uploadsQuery.data.length > 0 && (
          <div className="max-h-64 overflow-auto rounded-xl border border-white/10 bg-slate-950/60">
            <table className="min-w-full border-collapse text-xs">
              <thead className="bg-white/5 text-slate-200">
                <tr>
                  <th className="px-3 py-2 text-left">When</th>
                  <th className="px-3 py-2 text-left">Type</th>
                  <th className="px-3 py-2 text-left">Source</th>
                  <th className="px-3 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {uploadsQuery.data.map((u) => (
                  <tr
                    key={u._id}
                    className={`cursor-pointer border-t border-white/5 ${
                      selectedUploadId === u._id ? "bg-white/5" : "hover:bg-white/5"
                    }`}
                    onClick={() => setSelectedUploadId(u._id)}
                  >
                    <td className="px-3 py-1.5 align-top text-xs text-slate-200">
                      {new Date(u.scrapedAt).toLocaleString()}
                    </td>
                    <td className="px-3 py-1.5 align-top text-xs text-slate-200">
                      {u.uploadContext?.uploadType ?? "n/a"}
                    </td>
                    <td className="px-3 py-1.5 align-top text-xs text-slate-300">
                      {u.uploadContext?.originalFilename || u.uploadContext?.originalUrl || u.sourceUrl}
                    </td>
                    <td className="px-3 py-1.5 align-top text-xs">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          u.processingStatus === "normalized"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : u.processingStatus === "failed"
                              ? "bg-rose-500/20 text-rose-300"
                              : "bg-slate-500/20 text-slate-200"
                        }`}
                      >
                        {u.processingStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedUploadId && detailsQuery.data && (
          <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/60 p-3 text-xs text-slate-200">
            <p className="mb-2 font-medium">Selected upload details</p>
            <p className="text-slate-300">
              Source:{" "}
              {detailsQuery.data.item.uploadContext?.originalFilename ||
                detailsQuery.data.item.uploadContext?.originalUrl ||
                detailsQuery.data.item.sourceUrl}
            </p>
            {detailsQuery.data.item.uploadContext?.note && (
              <p className="mt-1 text-slate-300">Note: {detailsQuery.data.item.uploadContext.note}</p>
            )}
            {detailsQuery.data.preview && (
              <p className="mt-1 text-slate-300">
                Parsed rows: {detailsQuery.data.preview.rows.length} (rawSourceId:{" "}
                {detailsQuery.data.preview.rawSourceId})
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

