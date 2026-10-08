export const courses = [
  { code: "C1", title: "Course 1", credits: 15 },
  { code: "C2", title: "Course 2", credits: 20 },
  { code: "C3", title: "Course 3", credits: 15 },
  { code: "C4", title: "Course 4", credits: 15 },
];

export const students = [
  { id: 1, name: "Student A", email: "student.a@uni.ac.uk", year: 2,
    enrolments: [{ code: "C1", grade: 72 }, { code: "C3", grade: 65 }, { code: "C2", grade: 68 }] },
  { id: 2, name: "Student B", email: "student.b@uni.ac.uk", year: 1,
    enrolments: [{ code: "C1", grade: 58 }, { code: "C3", grade: 74 }] },
  { id: 3, name: "Student C", email: "student.c@uni.ac.uk", year: 3,
    enrolments: [{ code: "C2", grade: 81 }, { code: "C4", grade: 77 }, { code: "C3", grade: 88 }] },
  { id: 4, name: "Student D", email: "student.d@uni.ac.uk", year: 2,
    enrolments: [{ code: "C2", grade: 63 }, { code: "C4", grade: 70 }] },
  { id: 5, name: "Student E", email: "student.e@uni.ac.uk", year: 3,
    enrolments: [{ code: "C1", grade: 90 }, { code: "C2", grade: 85 }, { code: "C4", grade: 92 }] },
  { id: 6, name: "Student F", email: "student.f@uni.ac.uk", year: 1,
    enrolments: [{ code: "C3", grade: 55 }, { code: "C4", grade: 61 }] },
];