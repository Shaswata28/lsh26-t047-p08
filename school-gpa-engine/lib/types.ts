// ─── GPA Engine — Core Data Types ────────────────────────────────────────────

/**
 * Raw marks for a single subject.
 * Null values indicate the student was absent or the component does not apply.
 */
export interface Marks {
  /** Theory/written exam score (0–100). Null when absent or not applicable. */
  theory: number | null;
  /** Practical exam score (0–100). Null when absent or the subject has no practical. */
  practical: number | null;
}

/**
 * A single subject entry on a student's result sheet.
 */
export interface Subject {
  /** Human-readable subject name, e.g. "Mathematics", "Physics". */
  name: string;
  /** Whether this subject is compulsory for the student's class. */
  isCompulsory: boolean;
  /** Whether this subject has a separate practical component. */
  hasPractical: boolean;
  /** The student's raw marks for this subject. */
  marks: Marks;
  /**
   * True when the student was absent for the entire subject examination.
   * When true, both marks.theory and marks.practical must be null.
   */
  isAbsent: boolean;
}

/**
 * A single student record as stored in the master roster.
 */
export interface Student {
  /** Unique identifier, e.g. "STU-001". */
  id: string;
  /** Full name of the student. */
  name: string;
  /** Class / year group, e.g. "Class 9" or "Class 10". */
  className: string;
  /**
   * Ordered list of subjects — compulsory subjects first, optional subject last.
   * Every student should have exactly 6 compulsory + 1 optional subject.
   */
  subjects: Subject[];
}
