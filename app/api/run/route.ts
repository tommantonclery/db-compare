import { NextResponse } from "next/server";
import { getSql } from "@/lib/sql";
import { getMongo } from "@/lib/mongo";
import { scenarios } from "@/lib/scenarios";
import { mongoRunners } from "@/lib/mongoRunners";

import type { StudentDoc } from "@/lib/types";

export const runtime = "nodejs";

async function timed(fn: () => unknown) {
  const start = performance.now();
  try {
    const output = await fn();
    return { ok: true, ms: performance.now() - start, output };
  } catch (e) {
    return { ok: false, ms: performance.now() - start, error: e instanceof Error ? e.message : String(e) };
  }
}

export async function POST(req: Request) {
  const { id } = await req.json();
  const scenario = scenarios.find((s) => s.id === id);
  if (!scenario) return NextResponse.json({ error: "Unknown scenario" }, { status: 400 });

  const sqlDb = getSql();
  const students = (await getMongo()).collection<StudentDoc>("students");

  const sql = await timed(() => {
    let last: unknown;
    for (const stmt of scenario.sql) {
      const prepared = sqlDb.prepare(stmt);
      last = prepared.reader ? prepared.all() : { rowsChanged: prepared.run().changes };
    }
    return last;
  });

  const mongo = await timed(() => mongoRunners[id](students));

  const state = {
    sql: {
      students: sqlDb.prepare("SELECT * FROM students").all(),
      courses: sqlDb.prepare("SELECT * FROM courses").all(),
      enrolments: sqlDb.prepare("SELECT * FROM enrolments").all(),
    },
    mongo: await students.find().toArray(),
  };

  return NextResponse.json({ sql, mongo, state });
}