import {
  SubjectConfig,
  SubjectMarkInput,
  SubjectResult,
  Student,
  StudentCalculatedResult,
  AuditFlag,
  TraceStep,
  CalculationTrace,
  ClassAnalytics,
} from './types';

// Standard 6 Compulsory + 1 Optional Subject Configuration for Bogura Secondary School
export const DEFAULT_SUBJECT_CONFIGS: Record<string, SubjectConfig> = {
  BAN: {
    code: 'BAN',
    name: 'Bangla',
    type: 'theory_only',
    fullMarks: 100,
    theoryFullMarks: 100,
    practicalFullMarks: 0,
    theoryPassMarks: 33,
    practicalPassMarks: 0,
    isOptional: false,
  },
  ENG: {
    code: 'ENG',
    name: 'English',
    type: 'theory_only',
    fullMarks: 100,
    theoryFullMarks: 100,
    practicalFullMarks: 0,
    theoryPassMarks: 33,
    practicalPassMarks: 0,
    isOptional: false,
  },
  MAT: {
    code: 'MAT',
    name: 'General Mathematics',
    type: 'theory_only',
    fullMarks: 100,
    theoryFullMarks: 100,
    practicalFullMarks: 0,
    theoryPassMarks: 33,
    practicalPassMarks: 0,
    isOptional: false,
  },
  PHY: {
    code: 'PHY',
    name: 'Physics',
    type: 'theory_and_practical',
    fullMarks: 100,
    theoryFullMarks: 75,
    practicalFullMarks: 25,
    theoryPassMarks: 25,
    practicalPassMarks: 8,
    isOptional: false,
  },
  CHE: {
    code: 'CHE',
    name: 'Chemistry',
    type: 'theory_and_practical',
    fullMarks: 100,
    theoryFullMarks: 75,
    practicalFullMarks: 25,
    theoryPassMarks: 25,
    practicalPassMarks: 8,
    isOptional: false,
  },
  BIO: {
    code: 'BIO',
    name: 'Biology',
    type: 'theory_and_practical',
    fullMarks: 100,
    theoryFullMarks: 75,
    practicalFullMarks: 25,
    theoryPassMarks: 25,
    practicalPassMarks: 8,
    isOptional: false,
  },
  HMA: {
    code: 'HMA',
    name: 'Higher Mathematics (4th Optional)',
    type: 'theory_and_practical',
    fullMarks: 100,
    theoryFullMarks: 75,
    practicalFullMarks: 25,
    theoryPassMarks: 25,
    practicalPassMarks: 8,
    isOptional: true,
  },
};

/**
 * Maps raw marks to Grade Point and Letter Grade according to the exact rules:
 * - 80 and above: 5.0 (A+)
 * - 70 to 79: 4.0 (A)
 * - 60 to 69: 3.5 (A-)
 * - 50 to 59: 3.0 (B)
 * - 40 to 49: 2.0 (C)
 * - 33 to 39: 1.0 (D)
 * - Below 33: 0.0 (F)
 */
export function getGradePointFromMarks(mark: number): { gp: number; grade: 'A+' | 'A' | 'A-' | 'B' | 'C' | 'D' | 'F'; rule: string } {
  if (mark >= 80) return { gp: 5.0, grade: 'A+', rule: 'Score >= 80 -> GP 5.0 (A+)' };
  if (mark >= 70) return { gp: 4.0, grade: 'A', rule: '70 <= Score <= 79 -> GP 4.0 (A)' };
  if (mark >= 60) return { gp: 3.5, grade: 'A-', rule: '60 <= Score <= 69 -> GP 3.5 (A-)' };
  if (mark >= 50) return { gp: 3.0, grade: 'B', rule: '50 <= Score <= 59 -> GP 3.0 (B)' };
  if (mark >= 40) return { gp: 2.0, grade: 'C', rule: '40 <= Score <= 49 -> GP 2.0 (C)' };
  if (mark >= 33) return { gp: 1.0, grade: 'D', rule: '33 <= Score <= 39 -> GP 1.0 (D)' };
  return { gp: 0.0, grade: 'F', rule: 'Score < 33 -> GP 0.0 (F / Fail)' };
}

/**
 * Converts final overall GPA to Letter Grade:
 * 5.00 -> A+
 * 4.00 <= GPA < 5.00 -> A
 * 3.50 <= GPA < 4.00 -> A-
 * 3.00 <= GPA < 3.50 -> B
 * 2.00 <= GPA < 3.00 -> C
 * 1.00 <= GPA < 2.00 -> D
 * GPA = 0.00 -> F
 */
export function getOverallLetterGrade(gpa: number, isPassed: boolean): 'A+' | 'A' | 'A-' | 'B' | 'C' | 'D' | 'F' {
  if (!isPassed || gpa === 0) return 'F';
  if (gpa >= 5.0) return 'A+';
  if (gpa >= 4.0) return 'A';
  if (gpa >= 3.5) return 'A-';
  if (gpa >= 3.0) return 'B';
  if (gpa >= 2.0) return 'C';
  if (gpa >= 1.0) return 'D';
  return 'F';
}

/**
 * Calculate the result for an individual subject.
 * Handles:
 * 1. Absent flag (differentiated from 0)
 * 2. Dual passing requirement for practical subjects (Theory >= 25 AND Practical >= 8)
 * 3. Total calculation & Grade Point mapping
 * 4. Optional subject added points (max(0, GP - 2.0))
 */
export function calculateSubjectResult(
  config: SubjectConfig,
  input: SubjectMarkInput
): SubjectResult {
  const isAbsent = input.isAbsent || input.theoryMark === 'ABS' || input.practicalMark === 'ABS';

  if (isAbsent) {
    return {
      subjectCode: config.code,
      subjectName: config.name,
      isOptional: config.isOptional,
      isAbsent: true,
      theoryMark: null,
      practicalMark: null,
      totalMark: null,
      theoryPassed: false,
      practicalPassed: false,
      isPassed: false,
      letterGrade: 'F',
      gradePoint: 0.0,
      optionalAddedGP: 0.0,
      failReason: 'Student was ABSENT in this examination',
      ruleExplanation: 'Absent record -> GP 0.0 (F). Requires manual verification against physical attendance sheet.',
    };
  }

  const theory = typeof input.theoryMark === 'number' ? input.theoryMark : 0;
  const practical = config.type === 'theory_and_practical'
    ? (typeof input.practicalMark === 'number' ? input.practicalMark : 0)
    : 0;

  let theoryPassed = true;
  let practicalPassed = true;
  let failReason: string | undefined;

  if (config.type === 'theory_only') {
    theoryPassed = theory >= config.theoryPassMarks;
    practicalPassed = true;
    if (!theoryPassed) {
      failReason = `Theory score (${theory}/${config.theoryFullMarks}) is below pass mark of ${config.theoryPassMarks}`;
    }
  } else {
    // Theory and Practical dual-pass requirement
    theoryPassed = theory >= config.theoryPassMarks;
    practicalPassed = practical >= config.practicalPassMarks;

    if (!theoryPassed && !practicalPassed) {
      failReason = `Failed both Theory (${theory}/${config.theoryFullMarks}, min ${config.theoryPassMarks}) and Practical (${practical}/${config.practicalPassMarks}, min ${config.practicalPassMarks})`;
    } else if (!theoryPassed) {
      failReason = `Theory Failed: scored ${theory}/${config.theoryFullMarks} (minimum required ${config.theoryPassMarks}), despite Practical passing with ${practical}/${config.practicalPassMarks}`;
    } else if (!practicalPassed) {
      failReason = `Practical Failed: scored ${practical}/${config.practicalPassMarks} (minimum required ${config.practicalPassMarks}), despite Theory passing with ${theory}/${config.theoryFullMarks}`;
    }
  }

  const isPassed = theoryPassed && practicalPassed;
  const totalMark = theory + practical;

  let gradePoint = 0.0;
  let letterGrade: 'A+' | 'A' | 'A-' | 'B' | 'C' | 'D' | 'F' = 'F';
  let ruleExplanation = '';

  if (!isPassed) {
    gradePoint = 0.0;
    letterGrade = 'F';
    ruleExplanation = `Dual-Pass Rule triggered: ${failReason} -> Subject result is FAIL (GP 0.0, Grade F) regardless of total marks (${totalMark}).`;
  } else {
    const gpInfo = getGradePointFromMarks(totalMark);
    gradePoint = gpInfo.gp;
    letterGrade = gpInfo.grade;
    ruleExplanation = config.type === 'theory_and_practical'
      ? `Theory passed (${theory}/${config.theoryFullMarks} >= ${config.theoryPassMarks}) AND Practical passed (${practical}/${config.practicalPassMarks} >= ${config.practicalPassMarks}). Total ${totalMark} -> ${gpInfo.rule}.`
      : `Theory score ${totalMark}/${config.fullMarks} >= ${config.theoryPassMarks} -> ${gpInfo.rule}.`;
  }

  const optionalAddedGP = config.isOptional
    ? Math.max(0, +(gradePoint - 2.0).toFixed(2))
    : gradePoint;

  return {
    subjectCode: config.code,
    subjectName: config.name,
    isOptional: config.isOptional,
    isAbsent: false,
    theoryMark: theory,
    practicalMark: config.type === 'theory_and_practical' ? practical : null,
    totalMark,
    theoryPassed,
    practicalPassed,
    isPassed,
    letterGrade,
    gradePoint,
    optionalAddedGP,
    failReason,
    ruleExplanation,
  };
}

/**
 * Calculates complete student result with per-subject breakdown,
 * 4th subject addition, compulsory fail override, audit flags, and execution trace.
 */
export function calculateStudentResult(
  student: Student,
  subjectConfigs: Record<string, SubjectConfig> = DEFAULT_SUBJECT_CONFIGS
): StudentCalculatedResult {
  const subjectResults: SubjectResult[] = [];
  const subjectSteps: TraceStep[] = [];
  const failedCompulsorySubjects: string[] = [];
  const auditFlags: AuditFlag[] = [];

  let totalMarksObtained = 0;
  let maxMarksPossible = 0;
  let compulsoryGPSum = 0;
  let compulsoryCount = 0;
  let optionalGP = 0;
  let optionalBonusGP = 0;
  let hasAbsent = false;
  let hasPracticalFail = false;
  let hasTheoryFail = false;
  let hasOptionalBoost = false;

  // Evaluate each subject
  for (const [code, config] of Object.entries(subjectConfigs)) {
    const markInput: SubjectMarkInput = student.marks[code] || { theoryMark: 0, practicalMark: 0 };
    const res = calculateSubjectResult(config, markInput);
    subjectResults.push(res);

    if (res.isAbsent) {
      hasAbsent = true;
    }

    if (!res.isAbsent && res.totalMark !== null) {
      totalMarksObtained += res.totalMark;
    }
    maxMarksPossible += config.fullMarks;

    // Practical & Theory failure diagnostics
    if (!res.isPassed && !res.isAbsent && config.type === 'theory_and_practical') {
      if (res.theoryPassed && !res.practicalPassed) {
        hasPracticalFail = true;
        auditFlags.push({
          flagKey: 'PRACTICAL_FAIL',
          label: 'Practical Fail',
          severity: 'danger',
          description: `${config.name}: Passed theory (${res.theoryMark}/${config.theoryFullMarks}) but failed practical (${res.practicalMark}/${config.practicalFullMarks}, pass is ${config.practicalPassMarks}).`,
        });
      } else if (!res.theoryPassed && res.practicalPassed) {
        hasTheoryFail = true;
        auditFlags.push({
          flagKey: 'THEORY_FAIL',
          label: 'Theory Fail in Practical Subject',
          severity: 'danger',
          description: `${config.name}: Passed practical (${res.practicalMark}/${config.practicalFullMarks}) but failed theory (${res.theoryMark}/${config.theoryFullMarks}, pass is ${config.theoryPassMarks}).`,
        });
      }
    }

    if (res.isAbsent) {
      auditFlags.push({
        flagKey: 'ABSENT_RECORD',
        label: 'Absent in Subject',
        severity: 'warning',
        description: `Marked absent in ${config.name} (${config.isOptional ? 'Optional 4th' : 'Compulsory'}).`,
      });
    }

    // Trace step for subject
    const markText = res.isAbsent
      ? 'ABSENT'
      : config.type === 'theory_and_practical'
      ? `Theory: ${res.theoryMark}/${config.theoryFullMarks}, Practical: ${res.practicalMark}/${config.practicalFullMarks} (Total: ${res.totalMark})`
      : `Marks: ${res.totalMark}/${config.fullMarks}`;

    subjectSteps.push({
      stepNumber: subjectSteps.length + 1,
      category: 'SUBJECT_EVAL',
      title: `${config.name} (${config.isOptional ? '4th Subject' : 'Compulsory'})`,
      details: markText,
      ruleApplied: res.ruleExplanation,
      resultValue: res.isAbsent ? 'ABS -> GP 0.0 (F)' : `GP ${res.gradePoint.toFixed(2)} (${res.letterGrade})`,
      isFailingStep: !res.isPassed,
      isBonusStep: config.isOptional && res.optionalAddedGP > 0,
      mathExpression: config.isOptional
        ? `GP = ${res.gradePoint.toFixed(2)} -> Added Bonus = max(0, ${res.gradePoint.toFixed(2)} - 2.0) = ${res.optionalAddedGP.toFixed(2)}`
        : `GP = ${res.gradePoint.toFixed(2)}`,
    });

    if (config.isOptional) {
      optionalGP = res.gradePoint;
      optionalBonusGP = res.optionalAddedGP;

      if (res.optionalAddedGP > 0) {
        hasOptionalBoost = true;
        auditFlags.push({
          flagKey: 'OPTIONAL_BOOST',
          label: '4th Subject Bonus Applied',
          severity: 'success',
          description: `Optional ${config.name} scored GP ${res.gradePoint.toFixed(2)}. Added +${res.optionalAddedGP.toFixed(2)} points to GP sum.`,
        });
      } else if (!res.isAbsent && res.gradePoint > 0 && res.gradePoint <= 2.0) {
        auditFlags.push({
          flagKey: 'OPTIONAL_NO_BENEFIT',
          label: 'Optional Subject Below Threshold',
          severity: 'info',
          description: `Optional ${config.name} scored GP ${res.gradePoint.toFixed(2)} (<= 2.0), so 0.0 bonus was contributed.`,
        });
      }
    } else {
      compulsoryCount += 1;
      compulsoryGPSum += res.gradePoint;
      if (!res.isPassed) {
        failedCompulsorySubjects.push(config.name);
      }
    }
  }

  compulsoryGPSum = +compulsoryGPSum.toFixed(2);
  const rawAverageGP = +(compulsoryGPSum / (compulsoryCount || 6)).toFixed(2);
  const isOverallPassed = failedCompulsorySubjects.length === 0 && !subjectResults.some(s => !s.isOptional && s.isAbsent);

  let finalGPA = 0.0;
  let letterGrade: 'A+' | 'A' | 'A-' | 'B' | 'C' | 'D' | 'F' = 'F';
  let rootCauseFailure: string | undefined;

  // Compulsory step
  const compulsoryStep: TraceStep = {
    stepNumber: subjectSteps.length + 1,
    category: 'COMPULSORY_SUM',
    title: 'Compulsory Subjects Grade Point Sum',
    details: `Summing GP of all ${compulsoryCount} compulsory subjects`,
    ruleApplied: 'Sum GP of all 6 compulsory subjects. Divisor is fixed at 6.',
    resultValue: `Sum = ${compulsoryGPSum.toFixed(2)} (Avg = ${rawAverageGP.toFixed(2)})`,
    isFailingStep: failedCompulsorySubjects.length > 0,
    mathExpression: `Sum = ${compulsoryGPSum.toFixed(2)}`,
  };

  // Optional step
  const optionalStep: TraceStep = {
    stepNumber: subjectSteps.length + 2,
    category: 'OPTIONAL_CALC',
    title: '4th Subject Bonus Calculation',
    details: `4th Subject GP is ${optionalGP.toFixed(2)}`,
    ruleApplied: 'Bonus = max(0, GP_4th - 2.00). Divisor remains 6.',
    resultValue: `Bonus = +${optionalBonusGP.toFixed(2)}`,
    isBonusStep: optionalBonusGP > 0,
    mathExpression: `max(0, ${optionalGP.toFixed(2)} - 2.00) = ${optionalBonusGP.toFixed(2)}`,
  };

  let hasHighAvgCompulsoryFail = false;

  if (!isOverallPassed) {
    finalGPA = 0.0;
    letterGrade = 'F';
    rootCauseFailure = `Failed in compulsory subject(s): ${failedCompulsorySubjects.join(', ')}. Rule: A fail in any compulsory subject makes the whole result a FAIL (GPA 0.00 / F) regardless of average marks.`;

    if (totalMarksObtained >= 360 || rawAverageGP >= 3.0) {
      hasHighAvgCompulsoryFail = true;
      auditFlags.push({
        flagKey: 'HIGH_AVG_FAIL',
        label: 'High Average Compulsory Fail',
        severity: 'danger',
        description: `Student achieved total marks ${totalMarksObtained} (Compulsory GP sum ${compulsoryGPSum.toFixed(2)}), but failed due to: ${failedCompulsorySubjects.join(', ')}.`,
      });
    }
  } else {
    // Formula: GPA = min(5.00, (compulsoryGPSum + optionalBonusGP) / 6)
    const rawCalculatedGPA = (compulsoryGPSum + optionalBonusGP) / (compulsoryCount || 6);
    finalGPA = Math.min(5.0, +rawCalculatedGPA.toFixed(2));
    letterGrade = getOverallLetterGrade(finalGPA, true);
  }

  // Summary formula text
  const formulaText = isOverallPassed
    ? `GPA = min(5.00, (${compulsoryGPSum.toFixed(2)} [Compulsory GP Sum] + ${optionalBonusGP.toFixed(2)} [4th Subject Bonus]) / 6) = ${finalGPA.toFixed(2)} (${letterGrade})`
    : `GPA = 0.00 (F) [OVERRIDDEN BY COMPULSORY FAIL: ${failedCompulsorySubjects.join(', ')}]`;

  const finalStep: TraceStep = {
    stepNumber: subjectSteps.length + 3,
    category: 'GPA_FINAL',
    title: 'Final GPA & Letter Grade Determination',
    details: formulaText,
    ruleApplied: isOverallPassed
      ? 'Calculated GPA mapped to standard scale and capped at 5.00 maximum.'
      : 'Compulsory Failure Override Rule: 1 or more failed compulsory subjects forces GPA 0.00 (Grade F).',
    resultValue: `GPA ${finalGPA.toFixed(2)} (${letterGrade})`,
    isFailingStep: !isOverallPassed,
    isBonusStep: isOverallPassed && finalGPA >= 5.0,
    mathExpression: formulaText,
  };

  const trace: CalculationTrace = {
    studentName: student.name,
    roll: student.roll,
    studentClass: student.class,
    subjectSteps,
    compulsoryStep,
    optionalStep,
    finalStep,
    summaryFormula: formulaText,
    verdict: isOverallPassed ? `PASSED with GPA ${finalGPA.toFixed(2)} (${letterGrade})` : `FAILED (GPA 0.00 / F)`,
    rootCauseFailure,
  };

  return {
    student,
    subjectResults,
    totalMarksObtained,
    maxMarksPossible,
    compulsorySubjectCount: compulsoryCount,
    compulsoryGPSum,
    optionalGP,
    optionalBonusGP,
    rawAverageGP,
    finalGPA,
    letterGrade,
    isPassed: isOverallPassed,
    hasAbsent,
    hasPracticalFail,
    hasTheoryFail,
    hasOptionalBoost,
    hasHighAvgCompulsoryFail,
    failedCompulsorySubjects,
    auditFlags,
    trace,
  };
}

/**
 * Calculates analytics for a batch/class of students.
 */
export function calculateClassAnalytics(results: StudentCalculatedResult[]): ClassAnalytics {
  const total = results.length;
  if (total === 0) {
    return {
      totalStudents: 0,
      totalPassed: 0,
      totalFailed: 0,
      totalAbsent: 0,
      passRate: 0,
      averageGPA: 0,
      gradeDistribution: { 'A+': 0, 'A': 0, 'A-': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0 },
      worstPerformingSubjects: [],
    };
  }

  let passed = 0;
  let failed = 0;
  let absent = 0;
  let gpaSumOfPassed = 0;

  const gradeDistribution: Record<'A+' | 'A' | 'A-' | 'B' | 'C' | 'D' | 'F', number> = {
    'A+': 0,
    'A': 0,
    'A-': 0,
    'B': 0,
    'C': 0,
    'D': 0,
    'F': 0,
  };

  const subjectStats: Record<string, {
    subjectCode: string;
    subjectName: string;
    failCount: number;
    practicalFailCount: number;
    theoryFailCount: number;
    absentCount: number;
    totalMarks: number;
    studentCount: number;
  }> = {};

  for (const r of results) {
    if (r.isPassed) {
      passed += 1;
      gpaSumOfPassed += r.finalGPA;
    } else {
      failed += 1;
    }

    if (r.hasAbsent) {
      absent += 1;
    }

    gradeDistribution[r.letterGrade] = (gradeDistribution[r.letterGrade] || 0) + 1;

    for (const sub of r.subjectResults) {
      if (!subjectStats[sub.subjectCode]) {
        subjectStats[sub.subjectCode] = {
          subjectCode: sub.subjectCode,
          subjectName: sub.subjectName,
          failCount: 0,
          practicalFailCount: 0,
          theoryFailCount: 0,
          absentCount: 0,
          totalMarks: 0,
          studentCount: 0,
        };
      }

      const st = subjectStats[sub.subjectCode];
      st.studentCount += 1;
      if (sub.totalMark !== null) {
        st.totalMarks += sub.totalMark;
      }
      if (sub.isAbsent) {
        st.absentCount += 1;
        st.failCount += 1;
      } else if (!sub.isPassed) {
        st.failCount += 1;
        if (!sub.practicalPassed && sub.theoryPassed) {
          st.practicalFailCount += 1;
        } else if (!sub.theoryPassed && sub.practicalPassed) {
          st.theoryFailCount += 1;
        }
      }
    }
  }

  const passRate = +((passed / total) * 100).toFixed(1);
  const averageGPA = passed > 0 ? +(gpaSumOfPassed / passed).toFixed(2) : 0.0;

  const worstPerformingSubjects = Object.values(subjectStats)
    .map(s => ({
      subjectCode: s.subjectCode,
      subjectName: s.subjectName,
      failCount: s.failCount,
      practicalFailCount: s.practicalFailCount,
      theoryFailCount: s.theoryFailCount,
      absentCount: s.absentCount,
      avgMarks: s.studentCount > 0 ? +(s.totalMarks / s.studentCount).toFixed(1) : 0,
    }))
    .sort((a, b) => b.failCount - a.failCount);

  return {
    totalStudents: total,
    totalPassed: passed,
    totalFailed: failed,
    totalAbsent: absent,
    passRate,
    averageGPA,
    gradeDistribution,
    worstPerformingSubjects,
  };
}
