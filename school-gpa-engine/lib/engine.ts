// ─── GPA Engine — Core Calculation Module ────────────────────────────────────
// Pure, side-effect-free functions only. No I/O, no state, no external deps.

import type { Student, Subject } from "./types";

// ─── Return Types ─────────────────────────────────────────────────────────────

/** Computed result and audit trace for a single subject. */
export interface SubjectResult {
  /** Human-readable subject name (mirrors Subject.name). */
  subjectName: string;
  /**
   * Raw combined score used for grading.
   * 0 when the student was absent or failed a split component.
   */
  rawTotal: number;
  /** Grade Point awarded for this subject (0.0 – 5.0). */
  gp: number;
  /**
   * Step-by-step human-readable explanation of exactly which rule fired
   * and how the GP was derived. Intended for the office audit trail.
   */
  ruleTrace: string;
  /** True when this subject counts as a failure (GP === 0.0 due to a rule). */
  isFail: boolean;
  /** Mirrors Subject.isCompulsory === false. */
  isOptional: boolean;
}

/** Fully computed result and anomaly flags for a single student. */
export interface StudentResult {
  /** Mirrors Student.id. */
  studentId: string;
  /**
   * Final GPA on the 0.0 – 5.0 scale.
   * Forced to 0.0 when any compulsory subject is failed.
   */
  finalGPA: number;
  /** Letter grade mapped from finalGPA: A+, A, A-, B, C, D, or F. */
  letterGrade: string;
  /** One SubjectResult per subject, in the same order as Student.subjects. */
  subjectResults: SubjectResult[];
  /**
   * True when at least one anomaly condition was detected.
   * These cases should be surfaced on the Anomaly Dashboard.
   */
  isAnomaly: boolean;
  /** Plain-English descriptions of every anomaly found (may be empty). */
  anomalyReasons: string[];
}

// ─── Internal Constants ───────────────────────────────────────────────────────

/** Theory pass mark when a subject uses the 75/25 split (out of ~75 marks). */
const SPLIT_THEORY_PASS = 25;

/** Practical pass mark when a subject uses the 75/25 split (out of ~25 marks). */
const SPLIT_PRACTICAL_PASS = 8;

/** Pass mark for theory-only subjects (out of 100). */
const THEORY_ONLY_PASS = 33;

/** Index of the optional subject in Student.subjects (0-based, position 6). */
const OPTIONAL_SUBJECT_INDEX = 6;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Map a combined raw score to a Grade Point.
 * Returns { gp, band } where band is a human-readable label for the trace.
 */
function scoreToGP(total: number): { gp: number; band: string } {
  if (total >= 80) return { gp: 5.0, band: "80–100 → GP 5.0" };
  if (total >= 70) return { gp: 4.0, band: "70–79 → GP 4.0" };
  if (total >= 60) return { gp: 3.5, band: "60–69 → GP 3.5" };
  if (total >= 50) return { gp: 3.0, band: "50–59 → GP 3.0" };
  if (total >= 40) return { gp: 2.0, band: "40–49 → GP 2.0" };
  return { gp: 1.0, band: "33–39 → GP 1.0" };
}

/**
 * Map a final GPA value to its letter-grade string.
 */
function gpToLetterGrade(gpa: number): string {
  if (gpa >= 5.0) return "A+";
  if (gpa >= 4.0) return "A";
  if (gpa >= 3.5) return "A-";
  if (gpa >= 3.0) return "B";
  if (gpa >= 2.0) return "C";
  if (gpa >= 1.0) return "D";
  return "F";
}

// ─── Subject Calculator ───────────────────────────────────────────────────────

/**
 * Apply Bogura grading rules to a single Subject and return a fully-traced result.
 *
 * Rule priority (first matching rule wins):
 *   1. Absence         → GP 0.0, isFail true
 *   2. Split practical → GP 0.0, isFail true (if theory < 25 OR practical < 8)
 *   3. Theory-only fail → GP 0.0, isFail true (if theory < 33)
 *   4. Grading scale   → GP 1.0 – 5.0 based on combined raw total
 */
function calculateSubjectGP(subject: Subject): SubjectResult {
  const isOptional = !subject.isCompulsory;

  // ── Rule 1: Absence ───────────────────────────────────────────────────────
  if (subject.isAbsent) {
    return {
      subjectName: subject.name,
      rawTotal: 0,
      gp: 0.0,
      ruleTrace:
        "Rule 1 — Absence: Student was absent. Automatic 0.0 GP.",
      isFail: true,
      isOptional,
    };
  }

  const theory    = subject.marks.theory    ?? 0;
  const practical = subject.marks.practical ?? 0;

  // ── Rule 2: Split practical (75/25) ───────────────────────────────────────
  if (subject.hasPractical) {
    const theoryFailed    = theory    < SPLIT_THEORY_PASS;
    const practicalFailed = practical < SPLIT_PRACTICAL_PASS;

    if (theoryFailed || practicalFailed) {
      const parts: string[] = [];
      if (theoryFailed) {
        parts.push(
          `Failed theory part (Score: ${theory} < ${SPLIT_THEORY_PASS})`
        );
      }
      if (practicalFailed) {
        parts.push(
          `Failed practical part (Score: ${practical} < ${SPLIT_PRACTICAL_PASS})`
        );
      }
      return {
        subjectName: subject.name,
        rawTotal: 0,
        gp: 0.0,
        ruleTrace: `Rule 2 — Split Practical: ${parts.join(" AND ")}. GP is 0.0.`,
        isFail: true,
        isOptional,
      };
    }

    // Both split components passed — compute combined total and grade it
    const rawTotal = theory + practical;
    const { gp, band } = scoreToGP(rawTotal);
    return {
      subjectName: subject.name,
      rawTotal,
      gp,
      ruleTrace:
        `Rule 4 — Grading Scale (split subject): ` +
        `Theory ${theory} + Practical ${practical} = ${rawTotal}. ` +
        `Scale: ${band}.`,
      isFail: false,
      isOptional,
    };
  }

  // ── Rule 3: Theory-only fail ──────────────────────────────────────────────
  if (theory < THEORY_ONLY_PASS) {
    return {
      subjectName: subject.name,
      rawTotal: theory,
      gp: 0.0,
      ruleTrace:
        `Rule 3 — Standard Fail: Theory score ${theory} < ${THEORY_ONLY_PASS}. GP is 0.0.`,
      isFail: true,
      isOptional,
    };
  }

  // ── Rule 4: Grading scale (theory-only, passing) ──────────────────────────
  const rawTotal = theory;
  const { gp, band } = scoreToGP(rawTotal);
  return {
    subjectName: subject.name,
    rawTotal,
    gp,
    ruleTrace:
      `Rule 4 — Grading Scale (theory-only): Score ${rawTotal}. Scale: ${band}.`,
    isFail: false,
    isOptional,
  };
}

// ─── Main Engine Function ─────────────────────────────────────────────────────

/**
 * Process a single Student through the full Bogura GPA ruleset.
 *
 * Algorithm summary:
 *   1. Score every subject via calculateSubjectGP.
 *   2. If any compulsory subject fails → GPA 0.0, grade "F".
 *   3. Optional bonus = max(0, optionalGP − 2.0).
 *   4. finalGPA = (Σ compulsory GPs + optionalBonus) / 6, capped at 5.0.
 *   5. Detect and label anomalies.
 */
export function calculateStudentResult(student: Student): StudentResult {
  const anomalyReasons: string[] = [];

  // ── Step 1: Score every subject ───────────────────────────────────────────
  const subjectResults: SubjectResult[] = student.subjects.map((s) =>
    calculateSubjectGP(s)
  );

  const compulsoryResults = subjectResults.filter((r) => !r.isOptional);
  const optionalResult    = subjectResults[OPTIONAL_SUBJECT_INDEX] ?? null;

  // ── Step 2: Compulsory failure check ─────────────────────────────────────
  const failedCompulsory = compulsoryResults.filter((r) => r.isFail);
  if (failedCompulsory.length > 0) {
    // Record anomaly reasons before short-circuiting
    _detectAnomalies(student, subjectResults, anomalyReasons);

    return {
      studentId: student.id,
      finalGPA: 0.0,
      letterGrade: "F",
      subjectResults,
      isAnomaly: anomalyReasons.length > 0,
      anomalyReasons,
    };
  }

  // ── Step 3: Optional bonus ────────────────────────────────────────────────
  const optionalGP    = optionalResult?.gp ?? 0;
  const optionalBonus = optionalGP > 2.0 ? optionalGP - 2.0 : 0;

  // ── Step 4: Final GPA ─────────────────────────────────────────────────────
  const compulsoryGPSum = compulsoryResults.reduce((acc, r) => acc + r.gp, 0);
  const rawGPA          = (compulsoryGPSum + optionalBonus) / 6;
  const finalGPA        = Math.min(5.0, Math.round(rawGPA * 100) / 100);

  // ── Step 5: Letter grade ──────────────────────────────────────────────────
  const letterGrade = gpToLetterGrade(finalGPA);

  // ── Step 6: Anomaly detection (including grade-threshold crossing) ─────────
  _detectAnomalies(
    student,
    subjectResults,
    anomalyReasons,
    optionalBonus,
    compulsoryGPSum
  );

  return {
    studentId: student.id,
    finalGPA,
    letterGrade,
    subjectResults,
    isAnomaly: anomalyReasons.length > 0,
    anomalyReasons,
  };
}

// ─── Anomaly Detection (private) ─────────────────────────────────────────────

/**
 * Populate anomalyReasons in-place with every applicable anomaly.
 *
 * Anomaly A — Absence in any subject (compulsory or optional).
 * Anomaly B — Practical failed while theory passed in the same subject.
 * Anomaly C — Optional bonus caused the result to cross a meaningful threshold:
 *               • "F → passing"  (would have been 0.0 without bonus, now > 0)
 *               • Any letter-grade band jump (e.g., A → A+, B → A, …)
 *
 * @param optionalBonus   Pass undefined/0 when called from the early-fail path.
 * @param compulsoryGPSum Pass undefined when called from the early-fail path.
 */
function _detectAnomalies(
  student: Student,
  subjectResults: SubjectResult[],
  reasons: string[],
  optionalBonus = 0,
  compulsoryGPSum = 0
): void {

  // ── Anomaly A: Absent subject ─────────────────────────────────────────────
  student.subjects.forEach((s, i) => {
    if (s.isAbsent) {
      reasons.push(
        `Absent in ${s.isCompulsory ? "compulsory" : "optional"} subject ` +
        `"${s.name}" (index ${i}).`
      );
    }
  });

  // ── Anomaly B: Practical failed but theory passed ─────────────────────────
  student.subjects.forEach((s) => {
    if (!s.hasPractical || s.isAbsent) return;

    const theory    = s.marks.theory    ?? 0;
    const practical = s.marks.practical ?? 0;

    // Theory passes the split threshold but practical does not
    if (theory >= SPLIT_THEORY_PASS && practical < SPLIT_PRACTICAL_PASS) {
      reasons.push(
        `"${s.name}": Theory passed (${theory} ≥ ${SPLIT_THEORY_PASS}) ` +
        `but practical failed (${practical} < ${SPLIT_PRACTICAL_PASS}). ` +
        `Manual verification recommended.`
      );
    }
  });

  // ── Anomaly C: Optional bonus caused a grade-threshold crossing ───────────
  if (optionalBonus > 0) {
    const rawGPAWithout = compulsoryGPSum / 6;
    const rawGPAWith    = Math.min(5.0, (compulsoryGPSum + optionalBonus) / 6);

    const gradeWithout = gpToLetterGrade(Math.round(rawGPAWithout * 100) / 100);
    const gradeWith    = gpToLetterGrade(rawGPAWith);

    const crossedThreshold = gradeWithout !== gradeWith;

    if (crossedThreshold) {
      const optSubject = student.subjects[OPTIONAL_SUBJECT_INDEX];
      reasons.push(
        `Optional subject "${optSubject?.name ?? "unknown"}" bonus ` +
        `(+${optionalBonus.toFixed(2)} GP) caused letter grade to cross ` +
        `from "${gradeWithout}" to "${gradeWith}". ` +
        `GPA without bonus: ${(Math.round(rawGPAWithout * 100) / 100).toFixed(2)}, ` +
        `GPA with bonus: ${rawGPAWith.toFixed(2)}.`
      );
    }
  }
}
