import Database from "better-sqlite3";
import { courses, students } from "./data";

// Keep one database across hot reloads in dev
const g = globalThis as unknown as { sqlDb?: Database.Database };

const schema = `
  CREATE TABLE students (
    id    INTEGER PRIMARY KEY,
    name  TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    year  INTEGER NOT NULL CHECK (year BETWEEN 1 AND 4)
  );
  CREATE TABLE courses (
    code    TEXT PRIMARY KEY,
    title   TEXT NOT NULL,
    credits INTEGER NOT NULL
  );
  CREATE TABLE enrolments (
    student_id  INTEGER NOT NULL REFERENCES students(id),
    course_code TEXT    NOT NULL REFERENCES courses(code),
    grade       INTEGER CHECK (grade BETWEEN 0 AND 100),
    PRIMARY KEY (student_id, course_code)
  );
`;

function seed(db: Database.Database) {
  db.exec(schema);
  const addCourse = db.prepare("INSERT INTO courses VALUES (@code, @title, @credits)");
  const addStudent = db.prepare("INSERT INTO students VALUES (@id, @name, @email, @year)");
  const addEnrolment = db.prepare("INSERT INTO enrolments VALUES (?, ?, ?)");

  db.transaction(() => {
    courses.forEach((c) => addCourse.run(c));
    students.forEach(({ enrolments, ...s }) => {
      addStudent.run(s);
      enrolments.forEach((e) => addEnrolment.run(s.id, e.code, e.grade));
    });
  })();
}

export function getSql() {
  if (!g.sqlDb) {
    g.sqlDb = new Database(":memory:");
    g.sqlDb.pragma("foreign_keys = ON"); // SQLite only enforces foreign keys when this is on
    seed(g.sqlDb);
  }
  return g.sqlDb;
}

export function resetSql() {
  g.sqlDb?.close();
  g.sqlDb = undefined;
  getSql();
}