export type Scenario = { id: string; title: string; notice: string; sql: string[]; mongo: string };

export const scenarios: Scenario[] = [
  {
    id: "profile",
    title: "One student's profile",
    notice: "SQL rebuilds the profile by JOINing three tables and returns one flat row per course. MongoDB returns one nested document because the data was stored in the shape it is read.",
    sql: [`SELECT s.name, s.year, c.code, c.title, e.grade
FROM students s
JOIN enrolments e ON e.student_id = s.id
JOIN courses c    ON c.code = e.course_code
WHERE s.id = 1;`],
    mongo: `db.students.findOne({ _id: 1 })`,
  },
  {
    id: "econometrics",
    title: "Who takes Course 2?",
    notice: "Both answer it easily. SQL filters the join table. MongoDB searches inside each document's embedded array with a dotted path.",
    sql: [`SELECT s.name, e.grade
FROM students s
JOIN enrolments e ON e.student_id = s.id
WHERE e.course_code = 'C2'
ORDER BY e.grade DESC;`],
    mongo: `db.students.find(
  { "courses.code": "C2" },
  { name: 1, "courses.$": 1 }
)`,
  },
  {
    id: "averages",
    title: "Average grade per course",
    notice: "Analytics across entities is where SQL shines: GROUP BY is short and declarative. MongoDB needs a pipeline that first $unwinds the embedded arrays.",
    sql: [`SELECT c.title AS course,
       ROUND(AVG(e.grade), 1) AS avgGrade,
       COUNT(*) AS students
FROM enrolments e
JOIN courses c ON c.code = e.course_code
GROUP BY c.code
ORDER BY avgGrade DESC;`],
    mongo: `db.students.aggregate([
  { $unwind: "$courses" },
  { $group: { _id: "$courses.title",
              avgGrade: { $avg: "$courses.grade" },
              students: { $sum: 1 } } },
  { $project: { _id: 0, course: "$_id",
                avgGrade: { $round: ["$avgGrade", 1] }, students: 1 } },
  { $sort: { avgGrade: -1 } }
])`,
  },
  {
    id: "newField",
    title: "Add a new field (try)",
    notice: "Student G has a scholarship. SQL rejects the insert because the schema has no such column. MongoDB accepts it, because each document can have its own shape.",
    sql: [`INSERT INTO students (id, name, email, year, scholarship)
VALUES (7, 'Student G', 'student.g@uni.ac.uk', 1, 'Merit');`],
    mongo: `db.students.insertOne({
  _id: 7, name: "Student G", email: "student.g@uni.ac.uk",
  year: 1, courses: [], scholarship: "Merit"
})`,
  },
  {
    id: "migrate",
    title: "Add a new field (migrate)",
    notice: "SQL needs a schema migration first, and then every row gets the column (NULL by default). In MongoDB only Student G's document has the field, so the shape of your data is now inconsistent and your app code has to cope with that.",
    sql: [
      `ALTER TABLE students ADD COLUMN scholarship TEXT;`,
      `INSERT INTO students (id, name, email, year, scholarship)
VALUES (7, 'Student G', 'student.g@uni.ac.uk', 1, 'Merit');`,
      `SELECT name, scholarship FROM students;`,
    ],
    mongo: `db.students.find({}, { _id: 0, name: 1, scholarship: 1 })`,
  },
  {
    id: "rename",
    title: "Rename a course",
    notice: "SQL stores the title once, so it changes 1 row. MongoDB copied the title into every student who takes the course, so it must change 4 documents. Miss one and your data contradicts itself. Click 'Show stored data' after running.",
    sql: [`UPDATE courses SET title = 'Course 2 (Renamed)' WHERE code = 'C2';`],
    mongo: `db.students.updateMany(
  { "courses.code": "C2" },
  { $set: { "courses.$.title": "Course 2 (Renamed)" } }
)`,
  },
  {
    id: "badRef",
    title: "Enrol in a course that doesn't exist",
    notice: "The foreign key makes SQL refuse a course code that isn't in the courses table. MongoDB has no foreign keys, so the bad data goes in silently.",
    sql: [`INSERT INTO enrolments (student_id, course_code, grade)
VALUES (2, 'XX999', 70);`],
    mongo: `db.students.updateOne(
  { _id: 2 },
  { $push: { courses: { code: "XX999", title: "Made-up Course",
                        credits: 15, grade: 70 } } }
)`,
  },
];