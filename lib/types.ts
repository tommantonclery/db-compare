export type CourseEntry = {
  code: string;
  title: string;
  credits: number;
  grade: number;
};

export type StudentDoc = {
  _id: number;
  name: string;
  email: string;
  year: number;
  courses: CourseEntry[];
  scholarship?: string; // optional: only some documents have it (that's the point of demo 4)
};