"use client";

import React, { useState } from "react";
import { AlertCircle, CheckCircle2, Download, FileSpreadsheet, Loader2, Upload, X } from "lucide-react";
import { parseDelimitedText, TEAM_IMPORT_TEMPLATE, type ImportField } from "@/lib/hackathon/team-import";

interface ClientRow {
  row: number;
  teamCode: string;
  teamName: string;
  leaderName: string;
  leaderEmail: string;
  leaderPhone: string;
  members: string[];
  passkeyProvided: boolean;
  codeGenerated: boolean;
  errors: string[];
  warnings: string[];
}
interface Analysis {
  columns: Partial<Record<ImportField, string>>;
  memberColumns: string[];
  ignoredColumns: string[];
  rows: ClientRow[];
  summary: { total: number; valid: number; invalid: number; generatedCodes: number; generatedPasskeys: number; withWarnings: number };
}

const FIELD_LABELS: Record<ImportField, string> = {
  teamCode: "Team Code",
  teamName: "Team Name",
  leaderName: "Leader Name",
  leaderEmail: "Leader Email",
  leaderPhone: "Leader Phone",
  members: "Members",
  passkey: "Passkey",
};
const PREVIEW_LIMIT = 300;

/** Spreadsheet import: read the file or paste, let the server analyse every row, then import. */
export function TeamImportModal({
  eventId,
  onClose,
  onImported,
  onDownloadCredentials,
}: {
  eventId: string;
  onClose: () => void;
  onImported: (message: string) => void;
  onDownloadCredentials: () => void;
}) {
  const [text, setText] = useState("");
  const [grid, setGrid] = useState<string[][] | null>(null);
  const [fileName, setFileName] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [busy, setBusy] = useState<"" | "reading" | "analysing" | "importing">("");
  const [error, setError] = useState("");
  const [imported, setImported] = useState<string>("");

  const send = async (rows: string[][], extra: Record<string, unknown>) => {
    const res = await fetch("/api/admin/hackathon/teams/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId, rows, ...extra }),
    });
    const data = await res.json().catch(() => ({}));
    if (data.analysis) setAnalysis(data.analysis);
    if (!res.ok) throw new Error(data.error || "Import failed.");
    return data;
  };

  const analyse = async (rows: string[][]) => {
    setGrid(rows);
    setBusy("analysing");
    setError("");
    setImported("");
    try {
      await send(rows, { dryRun: true });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  };

  const handleFile = async (file: File) => {
    setFileName(file.name);
    setAnalysis(null);
    setBusy("reading");
    setError("");
    try {
      if (/\.(xlsx|xls|ods)$/i.test(file.name)) {
        const XLSX = await import("xlsx"); // loaded only when a workbook is chosen
        const wb = XLSX.read(await file.arrayBuffer(), { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: false, defval: "", blankrows: false });
        setText("");
        await analyse(rows.map((r) => r.map((c) => String(c ?? ""))));
      } else {
        const content = await file.text();
        setText(content);
        await analyse(parseDelimitedText(content));
      }
    } catch (err: any) {
      setError(`Couldn't read ${file.name}: ${err.message || "unsupported file"}`);
      setBusy("");
    }
  };

  const handleImport = async (skipInvalid: boolean) => {
    if (!grid) return;
    setBusy("importing");
    setError("");
    try {
      const data = await send(grid, { skipInvalid });
      setImported(data.message);
      onImported(data.message);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy("");
    }
  };

  const s = analysis?.summary;
  const sortedRows = analysis
    ? [...analysis.rows].sort((a, b) => b.errors.length - a.errors.length || b.warnings.length - a.warnings.length || a.row - b.row)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs" role="dialog" aria-modal="true" aria-labelledby="team-import-title">
      <div className="glass-card rounded-3xl p-5 sm:p-7 border border-white/80 bg-white max-w-4xl w-full shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto text-xs">
        <div className="flex items-center justify-between">
          <h3 id="team-import-title" className="text-base font-black text-slate-900">Import Teams from a Sheet</h3>
          <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="size-5" />
          </button>
        </div>

        <div className="text-slate-600 space-y-1.5 leading-relaxed">
          <p>
            Upload <b>Excel (.xlsx)</b>, <b>CSV</b> or <b>TSV</b>, or paste rows copied from Excel / Google Sheets. The first row must be
            headers. Only <b>Team Name</b> is required: empty team codes become <code>TEAM-001</code>…, empty passkeys get a random
            8-character code. Members can be one column (comma or semicolon separated) or <code>Member 1</code>, <code>Member 2</code>… columns.
          </p>
          <a
            href={`data:text/csv;charset=utf-8,${encodeURIComponent(TEAM_IMPORT_TEMPLATE)}`}
            download="team-import-template.csv"
            className="inline-flex items-center gap-1.5 font-bold text-cyan-700 hover:underline"
          >
            <Download className="size-3.5" /> Download template
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="flex flex-col items-center justify-center gap-2 p-5 rounded-2xl border-2 border-dashed border-slate-300 hover:border-cyan-500 bg-slate-50 cursor-pointer text-center">
            <Upload className="size-5 text-cyan-600" aria-hidden="true" />
            <span className="font-bold text-slate-800">{fileName || "Choose a file"}</span>
            <span className="text-slate-500">.xlsx, .xls, .csv, .tsv, .txt</span>
            <input
              type="file"
              accept=".xlsx,.xls,.ods,.csv,.tsv,.txt"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleFile(file);
                e.target.value = "";
              }}
            />
          </label>
          <div className="flex flex-col gap-2">
            <label htmlFor="team-import-paste" className="font-bold text-slate-700">…or paste rows</label>
            <textarea
              id="team-import-paste"
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={"Team Code\tTeam Name\tLeader Name\tLeader Email\nT-101\tNeural Nexus\tAlex Chen\talex@uni.edu"}
              className="w-full p-3 rounded-2xl border border-slate-200 text-slate-900 font-mono text-[11px]"
            />
            <button
              type="button"
              disabled={!text.trim() || !!busy}
              onClick={() => {
                setFileName("");
                void analyse(parseDelimitedText(text));
              }}
              className="self-end px-4 py-2 rounded-xl bg-slate-900 text-white font-bold disabled:opacity-40 cursor-pointer"
            >
              Analyse pasted rows
            </button>
          </div>
        </div>

        <div aria-live="polite" className="space-y-2">
          {busy && busy !== "importing" && (
            <p className="flex items-center gap-2 text-slate-500">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" /> {busy === "reading" ? "Reading file…" : "Analysing every row…"}
            </p>
          )}
          {error && (
            <p className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 font-semibold">
              <AlertCircle className="size-4 shrink-0" aria-hidden="true" /> {error}
            </p>
          )}
          {imported && (
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="size-4" aria-hidden="true" /> {imported}
              </span>
              <button
                type="button"
                onClick={onDownloadCredentials}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold cursor-pointer"
              >
                <FileSpreadsheet className="size-3.5" /> Download team passkeys (Excel)
              </button>
            </div>
          )}
        </div>

        {analysis && s && !imported && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 font-bold">
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">{s.total} rows</span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">{s.valid} ready</span>
              {s.invalid > 0 && <span className="px-2.5 py-1 rounded-lg bg-red-50 text-red-800 border border-red-200">{s.invalid} with errors</span>}
              {s.withWarnings > 0 && <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">{s.withWarnings} with warnings</span>}
              {s.generatedCodes > 0 && <span className="px-2.5 py-1 rounded-lg bg-cyan-50 text-cyan-800 border border-cyan-200">{s.generatedCodes} codes generated</span>}
              {s.generatedPasskeys > 0 && <span className="px-2.5 py-1 rounded-lg bg-cyan-50 text-cyan-800 border border-cyan-200">{s.generatedPasskeys} passkeys generated</span>}
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <p className="font-bold text-slate-700">Columns detected</p>
              <p className="text-slate-600">
                {(Object.keys(FIELD_LABELS) as ImportField[]).map((f) => (
                  <span key={f} className="mr-3 inline-block">
                    {FIELD_LABELS[f]}: <b className={analysis.columns[f] ? "text-slate-900" : "text-slate-400"}>{analysis.columns[f] || "—"}</b>
                  </span>
                ))}
                {analysis.memberColumns.length > 0 && <span className="mr-3 inline-block">Member columns: <b>{analysis.memberColumns.join(", ")}</b></span>}
              </p>
              {analysis.ignoredColumns.length > 0 && (
                <p className="text-amber-700">Ignored (not recognised): {analysis.ignoredColumns.join(", ")}</p>
              )}
            </div>

            <div className="overflow-x-auto max-h-80 overflow-y-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left border-collapse">
                <caption className="sr-only">Row by row import analysis</caption>
                <thead className="sticky top-0 bg-slate-50">
                  <tr className="text-slate-500 font-extrabold uppercase text-[10px]">
                    <th scope="col" className="py-2 px-2.5">Row</th>
                    <th scope="col" className="py-2 px-2.5">Code</th>
                    <th scope="col" className="py-2 px-2.5">Team</th>
                    <th scope="col" className="py-2 px-2.5">Leader</th>
                    <th scope="col" className="py-2 px-2.5">Members</th>
                    <th scope="col" className="py-2 px-2.5">Passkey</th>
                    <th scope="col" className="py-2 px-2.5">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedRows.slice(0, PREVIEW_LIMIT).map((r) => (
                    <tr key={r.row} className={r.errors.length ? "bg-red-50/60" : r.warnings.length ? "bg-amber-50/50" : ""}>
                      <td className="py-1.5 px-2.5 font-mono text-slate-500">{r.row}</td>
                      <td className="py-1.5 px-2.5 font-mono font-bold text-slate-900">
                        {r.teamCode || "—"}
                        {r.codeGenerated && <span className="ml-1 text-[10px] font-bold text-cyan-700">new</span>}
                      </td>
                      <td className="py-1.5 px-2.5 font-bold text-slate-900">{r.teamName || "—"}</td>
                      <td className="py-1.5 px-2.5 text-slate-700">
                        {r.leaderName || "—"}
                        {r.leaderEmail && <span className="block text-[10px] text-slate-400">{r.leaderEmail}</span>}
                      </td>
                      <td className="py-1.5 px-2.5 text-slate-700">{r.members.length}</td>
                      <td className="py-1.5 px-2.5 text-slate-700">{r.passkeyProvided ? "from sheet" : "generated"}</td>
                      <td className="py-1.5 px-2.5">
                        {r.errors.map((m) => (
                          <span key={m} className="block font-semibold text-red-700">{m}</span>
                        ))}
                        {r.warnings.map((m) => (
                          <span key={m} className="block text-amber-700">{m}</span>
                        ))}
                        {!r.errors.length && !r.warnings.length && <span className="text-emerald-700 font-bold">OK</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {sortedRows.length > PREVIEW_LIMIT && (
                <p className="p-2 text-center text-slate-500">Showing rows with problems first; {sortedRows.length - PREVIEW_LIMIT} more not shown.</p>
              )}
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-600 cursor-pointer">
                Cancel
              </button>
              {s.invalid > 0 && s.valid > 0 && (
                <button
                  type="button"
                  disabled={!!busy}
                  onClick={() => void handleImport(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold disabled:opacity-50 cursor-pointer"
                >
                  Import {s.valid} valid, skip {s.invalid}
                </button>
              )}
              <button
                type="button"
                disabled={!!busy || s.invalid > 0 || s.valid === 0}
                onClick={() => void handleImport(false)}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold disabled:opacity-40 cursor-pointer"
              >
                {busy === "importing" ? "Importing…" : `Import ${s.valid} team${s.valid === 1 ? "" : "s"}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
