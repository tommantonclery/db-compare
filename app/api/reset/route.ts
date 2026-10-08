import { NextResponse } from "next/server";
import { resetSql } from "@/lib/sql";
import { resetMongo } from "@/lib/mongo";

export const runtime = "nodejs";

export async function POST() {
  resetSql();
  await resetMongo();
  return NextResponse.json({ ok: true });
}