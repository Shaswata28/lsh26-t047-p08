// ─── GPA Engine — Mock Data Seeder ───────────────────────────────────────────
import type { Marks, Student, Subject } from "./types";

// ─── Constants ────────────────────────────────────────────────────────────────

const COMPULSORY_SUBJECTS: Omit<Subject, "marks" | "isAbsent">[] = [
  { name: "Bengali",   isCompulsory: true, hasPractical: false },
  { name: "English",   isCompulsory: true, hasPractical: false },
  { name: "Math",      isCompulsory: true, hasPractical: false },
  { name: "Physics",   isCompulsory: true, hasPractical: true  },
  { name: "Chemistry", isCompulsory: true, hasPractical: true  },
  { name: "Biology",   isCompulsory: true, hasPractical: true  },
];

const OPTIONAL_SUBJECTS: Omit<Subject, "marks" | "isAbsent">[] = [
  { name: "Higher Math", isCompulsory: false, hasPractical: false },
  { name: "Agriculture", isCompulsory: false, hasPractical: true  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Build a padded student ID string. */
const makeId = (n: number): string => `STU-${String(n).padStart(3, "0")}`;

/** Clamp a value to [min, max]. */
const clamp = (v: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, v));

/**
 * Pick a pseudo-random integer in [min, max] using a seeded index so the
 * output is deterministic across runs (determinism is achieved via Math.sin
 * as a simple LCG-like hash, NOT cryptographically secure).
 */
const seedRand = (seed: number, min: number, max: number): number => {
  const val = Math.abs(Math.sin(seed * 9301 + 49297) * 233280) % 1;
  return clamp(Math.floor(val * (max - min + 1)) + min, min, max);
};

/** Create a fully-specified absent subject. */
const makeAbsent = (
  base: Omit<Subject, "marks" | "isAbsent">
): Subject => ({
  ...base,
  marks: { theory: null, practical: null },
  isAbsent: true,
});

/** Create a present subject with explicit marks. */
const makeSubject = (
  base: Omit<Subject, "marks" | "isAbsent">,
  theory: number | null,
  practical: number | null = null
): Subject => ({
  ...base,
  marks: { theory, practical },
  isAbsent: false,
});

/**
 * Generate a random (but seeded) subject for the bulk students.
 * theory  → [33, 90]   (always passing)
 * practical → [33, 50] (passing but low-ish)
 * absent  → ~5% chance
 */
const makeRandomSubject = (
  base: Omit<Subject, "marks" | "isAbsent">,
  seed: number
): Subject => {
  const absentRoll = seedRand(seed * 7, 1, 20);
  if (absentRoll === 1) return makeAbsent(base);

  const theory = seedRand(seed, 33, 90);
  const practical = base.hasPractical ? seedRand(seed + 1000, 33, 50) : null;
  return makeSubject(base, theory, practical);
};

// ─── 8 Hardcoded Edge-Case Students ──────────────────────────────────────────

/** EC-1 · The Heartbreaker
 *  Scored 80+ in five compulsory subjects, exactly 32 in the sixth (Math).
 *  That single sub-pass score should break the student's overall result.
 */
const heartbreaker: Student = {
  id: makeId(1),
  name: "Arjun Heartbreaker",
  className: "Class 9",
  subjects: [
    makeSubject(COMPULSORY_SUBJECTS[0], 85),          // Bengali  — 85
    makeSubject(COMPULSORY_SUBJECTS[1], 82),          // English  — 82
    makeSubject(COMPULSORY_SUBJECTS[2], 32),          // Math     — 32 ← fail
    makeSubject(COMPULSORY_SUBJECTS[3], 80, 40),      // Physics  — 80 / 40
    makeSubject(COMPULSORY_SUBJECTS[4], 88, 45),      // Chemistry— 88 / 45
    makeSubject(COMPULSORY_SUBJECTS[5], 90, 48),      // Biology  — 90 / 48
    makeSubject(OPTIONAL_SUBJECTS[0],   75),          // Higher Math — 75
  ],
};

/** EC-2 · The Practical Trap
 *  Theory passed (45) but practical failed (10) in Chemistry.
 *  The practical failure alone should mark the subject as failed.
 */
const practicalTrap: Student = {
  id: makeId(2),
  name: "Priya Practical",
  className: "Class 9",
  subjects: [
    makeSubject(COMPULSORY_SUBJECTS[0], 60),          // Bengali  — 60
    makeSubject(COMPULSORY_SUBJECTS[1], 55),          // English  — 55
    makeSubject(COMPULSORY_SUBJECTS[2], 50),          // Math     — 50
    makeSubject(COMPULSORY_SUBJECTS[3], 60, 35),      // Physics  — 60 / 35
    makeSubject(COMPULSORY_SUBJECTS[4], 45, 10),      // Chemistry— 45 / 10 ← practical fail
    makeSubject(COMPULSORY_SUBJECTS[5], 55, 33),      // Biology  — 55 / 33
    makeSubject(OPTIONAL_SUBJECTS[0],   50),          // Higher Math — 50
  ],
};

/** EC-3 · The Neutral Optional
 *  All compulsory subjects passed. Optional (Agriculture) scored exactly 42
 *  → GP 2.0, providing zero bonus to overall GPA.
 */
const neutralOptional: Student = {
  id: makeId(3),
  name: "Rahul Neutral",
  className: "Class 9",
  subjects: [
    makeSubject(COMPULSORY_SUBJECTS[0], 65),          // Bengali  — 65
    makeSubject(COMPULSORY_SUBJECTS[1], 60),          // English  — 60
    makeSubject(COMPULSORY_SUBJECTS[2], 55),          // Math     — 55
    makeSubject(COMPULSORY_SUBJECTS[3], 58, 34),      // Physics  — 58 / 34
    makeSubject(COMPULSORY_SUBJECTS[4], 50, 33),      // Chemistry— 50 / 33
    makeSubject(COMPULSORY_SUBJECTS[5], 52, 35),      // Biology  — 52 / 35
    makeSubject(OPTIONAL_SUBJECTS[1],   42, 33),      // Agriculture — 42 / 33 (GP 2.0)
  ],
};

/** EC-4 · The Ghost
 *  Absent in one compulsory subject (Math), scored 80+ in the remaining five.
 *  Absence in a compulsory subject must fail the student.
 */
const ghost: Student = {
  id: makeId(4),
  name: "Sneha Ghost",
  className: "Class 9",
  subjects: [
    makeSubject(COMPULSORY_SUBJECTS[0], 82),          // Bengali  — 82
    makeSubject(COMPULSORY_SUBJECTS[1], 85),          // English  — 85
    makeAbsent(COMPULSORY_SUBJECTS[2]),               // Math     — ABSENT
    makeSubject(COMPULSORY_SUBJECTS[3], 88, 45),      // Physics  — 88 / 45
    makeSubject(COMPULSORY_SUBJECTS[4], 84, 44),      // Chemistry— 84 / 44
    makeSubject(COMPULSORY_SUBJECTS[5], 90, 48),      // Biology  — 90 / 48
    makeSubject(OPTIONAL_SUBJECTS[0],   80),          // Higher Math — 80
  ],
};

/** EC-5 · The Optional Savior
 *  Scraped through compulsory subjects at the lowest passing marks (33–35).
 *  Scored 85 in optional (Higher Math) → big GP boost should lift overall GPA.
 */
const optionalSavior: Student = {
  id: makeId(5),
  name: "Kiran Savior",
  className: "Class 10",
  subjects: [
    makeSubject(COMPULSORY_SUBJECTS[0], 35),          // Bengali  — 35
    makeSubject(COMPULSORY_SUBJECTS[1], 33),          // English  — 33
    makeSubject(COMPULSORY_SUBJECTS[2], 34),          // Math     — 34
    makeSubject(COMPULSORY_SUBJECTS[3], 33, 33),      // Physics  — 33 / 33
    makeSubject(COMPULSORY_SUBJECTS[4], 35, 33),      // Chemistry— 35 / 33
    makeSubject(COMPULSORY_SUBJECTS[5], 33, 33),      // Biology  — 33 / 33
    makeSubject(OPTIONAL_SUBJECTS[0],   85),          // Higher Math — 85 (GP 4.0)
  ],
};

/** EC-6 · The Optional Fail
 *  Passed all compulsory subjects comfortably. Scored 20 (fail) in optional.
 *  The optional failure must NOT fail the student overall; it is simply ignored.
 */
const optionalFail: Student = {
  id: makeId(6),
  name: "Meena Optional",
  className: "Class 10",
  subjects: [
    makeSubject(COMPULSORY_SUBJECTS[0], 70),          // Bengali  — 70
    makeSubject(COMPULSORY_SUBJECTS[1], 68),          // English  — 68
    makeSubject(COMPULSORY_SUBJECTS[2], 65),          // Math     — 65
    makeSubject(COMPULSORY_SUBJECTS[3], 72, 38),      // Physics  — 72 / 38
    makeSubject(COMPULSORY_SUBJECTS[4], 60, 36),      // Chemistry— 60 / 36
    makeSubject(COMPULSORY_SUBJECTS[5], 66, 37),      // Biology  — 66 / 37
    makeSubject(OPTIONAL_SUBJECTS[1],   20, 10),      // Agriculture — 20 / 10 (fail, ignored)
  ],
};

/** EC-7 · The Double Split Fail
 *  Both theory (20) AND practical (10) failed in Physics.
 *  Clear failure in a compulsory subject via both components.
 */
const doubleSplitFail: Student = {
  id: makeId(7),
  name: "Ravi DoubleSplit",
  className: "Class 10",
  subjects: [
    makeSubject(COMPULSORY_SUBJECTS[0], 55),          // Bengali  — 55
    makeSubject(COMPULSORY_SUBJECTS[1], 50),          // English  — 50
    makeSubject(COMPULSORY_SUBJECTS[2], 48),          // Math     — 48
    makeSubject(COMPULSORY_SUBJECTS[3], 20, 10),      // Physics  — 20 / 10 ← both fail
    makeSubject(COMPULSORY_SUBJECTS[4], 45, 33),      // Chemistry— 45 / 33
    makeSubject(COMPULSORY_SUBJECTS[5], 40, 33),      // Biology  — 40 / 33
    makeSubject(OPTIONAL_SUBJECTS[0],   55),          // Higher Math — 55
  ],
};

/** EC-8 · The Perfect Score
 *  Scored 80+ in all 6 compulsory subjects AND the optional subject.
 *  Should yield maximum GPA (5.0) across the board.
 */
const perfectScore: Student = {
  id: makeId(8),
  name: "Ananya Perfect",
  className: "Class 10",
  subjects: [
    makeSubject(COMPULSORY_SUBJECTS[0], 95),          // Bengali  — 95
    makeSubject(COMPULSORY_SUBJECTS[1], 92),          // English  — 92
    makeSubject(COMPULSORY_SUBJECTS[2], 98),          // Math     — 98
    makeSubject(COMPULSORY_SUBJECTS[3], 90, 49),      // Physics  — 90 / 49
    makeSubject(COMPULSORY_SUBJECTS[4], 88, 48),      // Chemistry— 88 / 48
    makeSubject(COMPULSORY_SUBJECTS[5], 85, 50),      // Biology  — 85 / 50
    makeSubject(OPTIONAL_SUBJECTS[0],   96),          // Higher Math — 96
  ],
};

const EDGE_CASES: Student[] = [
  heartbreaker,   // 1
  practicalTrap,  // 2
  neutralOptional,// 3
  ghost,          // 4
  optionalSavior, // 5
  optionalFail,   // 6
  doubleSplitFail,// 7
  perfectScore,   // 8
];

// ─── Bulk Student Generator ───────────────────────────────────────────────────

/** First names pool for random students. */
const FIRST_NAMES = [
  "Amir", "Bina", "Chirag", "Diya", "Elan", "Fatima", "Ganesh", "Hira",
  "Iqbal", "Jaya", "Kabir", "Lata", "Mohan", "Nisha", "Omar", "Puja",
  "Qasim", "Rita", "Suresh", "Tara", "Uday", "Vani", "Wasim", "Xena",
  "Yusuf", "Zara", "Alok", "Bhavna", "Chetan", "Deepa", "Emon", "Faria",
  "Gita", "Hemant", "Indira", "Jatin", "Kavya", "Lokesh", "Mina", "Nikhil",
  "Ojaswi", "Pallavi", "Qurrat", "Rohit", "Shweta", "Tarun", "Uma", "Vikram",
  "Wafa", "Yamini", "Zaheer", "Amara",
];

/** Last names pool for random students. */
const LAST_NAMES = [
  "Ahmed", "Bose", "Chatterjee", "Das", "Ghosh", "Hazra", "Islam", "Jana",
  "Khan", "Lal", "Mitra", "Nair", "Paul", "Roy", "Sen", "Sharma",
  "Talukdar", "Varma", "Yadav", "Zaman",
];

/**
 * Generate one bulk student.
 * @param index  Overall student index (1-based, after edge cases).
 * @param seed   Seed offset for deterministic pseudo-randomness.
 * @param cls    "Class 9" or "Class 10".
 */
function generateBulkStudent(index: number, seed: number, cls: string): Student {
  const firstName = FIRST_NAMES[seed % FIRST_NAMES.length];
  const lastName  = LAST_NAMES[(seed * 3 + 7) % LAST_NAMES.length];

  // Alternate optional subject
  const optBase = seed % 2 === 0 ? OPTIONAL_SUBJECTS[0] : OPTIONAL_SUBJECTS[1];

  const subjects: Subject[] = [
    ...COMPULSORY_SUBJECTS.map((base, si) =>
      makeRandomSubject(base, seed * 100 + si)
    ),
    makeRandomSubject(optBase, seed * 100 + 99),
  ];

  return {
    id: makeId(index),
    name: `${firstName} ${lastName}`,
    className: cls,
    subjects,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Generate the full mock dataset of exactly 60 students:
 * - Students 1–8:  hardcoded edge cases (4 × Class 9, 4 × Class 10)
 * - Students 9–34: 26 random Class 9 students
 * - Students 35–60: 26 random Class 10 students
 *
 * Total: 30 Class 9 + 30 Class 10 = 60 students.
 */
export function generateMockStudents(): Student[] {
  const bulk: Student[] = [];

  // Class 9 bulk: indices 9–34 (26 students, total Class 9 = 4 edge + 26 = 30)
  for (let i = 9; i <= 34; i++) {
    bulk.push(generateBulkStudent(i, i * 13 + 7, "Class 9"));
  }

  // Class 10 bulk: indices 35–60 (26 students, total Class 10 = 4 edge + 26 = 30)
  for (let i = 35; i <= 60; i++) {
    bulk.push(generateBulkStudent(i, i * 17 + 3, "Class 10"));
  }

  return [...EDGE_CASES, ...bulk];
}
