import type { Collection } from "mongodb";
import type { StudentDoc } from "./types";

type Runner = (c: Collection<StudentDoc>) => Promise<unknown>;

export const mongoRunners: Record<string, Runner> = {
  profile: (c) => c.findOne({ _id: 1 }),

  econometrics: (c) =>
    c.find({ "courses.code": "C2" }).project({ name: 1, "courses.$": 1 }).toArray(),

  averages: (c) =>
    c.aggregate([
      { $unwind: "$courses" },
      { $group: { _id: "$courses.title", avgGrade: { $avg: "$courses.grade" }, students: { $sum: 1 } } },
      { $project: { _id: 0, course: "$_id", avgGrade: { $round: ["$avgGrade", 1] }, students: 1 } },
      { $sort: { avgGrade: -1 } },
    ]).toArray(),

  newField: (c) =>
    c.insertOne({ _id: 7, name: "Student G", email: "student.g@uni.ac.uk", year: 1, courses: [], scholarship: "Merit" }),

  migrate: (c) => c.find({}, { projection: { _id: 0, name: 1, scholarship: 1 } }).toArray(),

  rename: async (c) => {
    const r = await c.updateMany(
      { "courses.code": "C2" },
      { $set: { "courses.$.title": "Course 2 (Renamed)" } }
    );
    return { matched: r.matchedCount, modified: r.modifiedCount };
  },

  badRef: async (c) => {
    const r = await c.updateOne(
      { _id: 2 },
      { $push: { courses: { code: "XX999", title: "Made-up Course", credits: 15, grade: 70 } } }
    );
    return { matched: r.matchedCount, modified: r.modifiedCount };
  },
};