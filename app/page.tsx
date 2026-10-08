"use client";
import { useState } from "react";
import { scenarios } from "@/lib/scenarios";

type Side = { ok: boolean; ms: number; output?: unknown; error?: string };
type RunResponse = { sql: Side; mongo: Side; state: { sql: Record<string, unknown[]>; mongo: unknown[] } };
type View = "result" | "stored";

export default function Home() {
  const [activeId, setActiveId] = useState(scenarios[0].id);
  const [result, setResult] = useState<RunResponse | null>(null);
  const [view, setView] = useState<View>("result");
  const [busy, setBusy] = useState(false);
  const scenario = scenarios.find((s) => s.id === activeId)!;

  async function run() {
    setBusy(true);
    const res = await fetch("/api/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: activeId }),
    });
    setResult(await res.json());
    setView("result");
    setBusy(false);
  }

  async function reset() {
    setBusy(true);
    await fetch("/api/reset", { method: "POST" });
    setResult(null);
    setBusy(false);
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <header>
        <h1 className="text-3xl font-bold">Tables vs Documents</h1>
        <p className="opacity-70">The same university data in SQLite (relational) and MongoDB (document).</p>
      </header>

      <nav className="flex flex-wrap gap-2">
        {scenarios.map((s, i) => (
          <button
            key={s.id}
            onClick={() => { setActiveId(s.id); setResult(null); }}
            className={`rounded border px-3 py-1.5 text-sm ${s.id === activeId ? "bg-blue-600 text-white" : ""}`}
          >
            {i + 1}. {s.title}
          </button>
        ))}
      </nav>

      <section className="rounded border p-4">
        <h2 className="font-semibold">{scenario.title}</h2>
        <p className="mt-1 text-sm opacity-80">{scenario.notice}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={run} disabled={busy} className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50">
            Run on both
          </button>
          <button onClick={reset} disabled={busy} className="rounded border px-4 py-2">Reset data</button>
          {result && (
            <button onClick={() => setView(view === "result" ? "stored" : "result")} className="rounded border px-4 py-2">
              {view === "result" ? "Show stored data" : "Show query result"}
            </button>
          )}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <Panel label="SQL · SQLite" code={scenario.sql.join("\n\n")} side={result?.sql} stored={result?.state.sql} view={view} />
        <Panel label="NoSQL · MongoDB" code={scenario.mongo} side={result?.mongo} stored={result?.state.mongo} view={view} />
      </div>
    </main>
  );
}

function Panel({ label, code, side, stored, view }: { label: string; code: string; side?: Side; stored?: unknown; view: View }) {
  return (
    <div className="min-w-0 space-y-3 rounded border p-4">
      <h3 className="font-semibold">{label}</h3>
      <pre className="overflow-x-auto rounded bg-gray-900 p-3 text-sm text-gray-100">{code}</pre>
      {side && (side.ok
        ? <p className="text-sm text-green-600">Succeeded in {side.ms.toFixed(1)} ms</p>
        : <p className="text-sm text-red-600">Error: {side.error}</p>)}
      {side && <DataView data={view === "result" ? side.output : stored} />}
    </div>
  );
}

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);
const isFlatRow = (v: unknown) =>
  isPlainObject(v) && Object.values(v).every((x) => x === null || typeof x !== "object");

function DataView({ data }: { data: unknown }) {
  if (data === undefined || data === null) return null;

  // A set of tables, e.g. { students: [...], courses: [...] }
  if (isPlainObject(data) && Object.values(data).length > 0 && Object.values(data).every(Array.isArray)) {
    return (
      <div className="space-y-3">
        {Object.entries(data).map(([name, rows]) => (
          <div key={name}>
            <h4 className="text-sm font-medium">{name}</h4>
            <DataView data={rows} />
          </div>
        ))}
      </div>
    );
  }

  // Flat rows → table
  const rows = Array.isArray(data) ? data : [data];
  if (rows.length > 0 && rows.every(isFlatRow)) {
    const cols = Array.from(new Set(rows.flatMap((r) => Object.keys(r as object))));
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead><tr>{cols.map((c) => <th key={c} className="border-b px-2 py-1">{c}</th>)}</tr></thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                {cols.map((c) => (
                  <td key={c} className="border-b px-2 py-1">{String((r as Record<string, unknown>)[c] ?? "NULL")}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Anything nested → JSON
  return <pre className="overflow-x-auto rounded border p-3 text-xs">{JSON.stringify(data, null, 2)}</pre>;
}