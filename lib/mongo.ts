import { MongoClient, Db } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import { courses, students } from "./data";

import type { StudentDoc } from "./types";

const g = globalThis as unknown as { mongoDb?: Promise<Db> };

async function seed(db: Db) {
  const col = db.collection<StudentDoc>("students");
  await col.deleteMany({});
  await col.insertMany(
    students.map((s) => ({
      _id: s.id,
      name: s.name,
      email: s.email,
      year: s.year,
      courses: s.enrolments.map((e) => {
        const c = courses.find((c) => c.code === e.code)!;
        return { code: c.code, title: c.title, credits: c.credits, grade: e.grade };
      }),
    }))
  );
}

async function connect() {
  // Use a real MongoDB if you set MONGODB_URI in .env.local, otherwise start a temporary one
  let uri = process.env.MONGODB_URI;
  if (!uri) uri = (await MongoMemoryServer.create()).getUri();
  const client = await new MongoClient(uri).connect();
  const db = client.db("university");
  await seed(db);
  return db;
}

export function getMongo() {
  if (!g.mongoDb) g.mongoDb = connect();
  return g.mongoDb;
}

export async function resetMongo() {
  await seed(await getMongo());
}