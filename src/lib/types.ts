export type SubjectType = 'theory_only' | 'theory_and_practical';

export interface SubjectConfig {
  code: string;
  name: string;
  type: SubjectType;
  fullMarks: number;
  theoryFullMarks: number;
  practicalFullMarks: number;
  theoryPassMarks: number;
  practicalPassMarks: number;
  isOptional: boolean;
}

export interface SubjectMarkInput {
  theoryMark: number | 'ABS' | null;
  practicalMark?: number | 'ABS' | null;
  isAbsent?: boolean;
}

export interface SubjectMark {
  subjectCode: string;
  theoryMark: number | null; // null represents Absent
  practicalMark: number | null; // null represents Absent or N/A
  isAbsent: boolean;
  isOptional: boolean;
}

export interface SubjectResult {
  subjectCode: string;
  subjectName: string;
  isOptional: boolean;
  isAbsent: boolean;
  theoryMark: number | null;
  practicalMark: number | null;
  totalMark: number | null;
  theoryPassed: boolean;
  practicalPassed: boolean;
  isPassed: boolean;
  letterGrade: 'A+' | 'A' | 'A-' | 'B' | 'C' | 'D' | 'F';
  gradePoint: number;
  optionalAddedGP: number; // for 4th subject: max(0, GP - 2.0)
  failReason?: string;
  ruleExplanation: string;
}

export interface Student {
  id: string;
  roll: number;
  registrationNo: string;
  name: string;
  gender: 'Male' | 'Female';
  class: 'Class 9' | 'Class 10';
  section: 'A' | 'B';
  group: 'Science' | 'Humanities' | 'Business Studies';
  session: string;
  optional?: string; // Optional subject code: 'HMT' | 'AGR' | 'REL' | 'HMA'
  edgeCaseTag?: string;
  edgeCaseDescription?: string;
  marks: Record<string, SubjectMarkInput>;
}

export interface AuditFlag {
  flagKey: 'OPTIONAL_BOOST' | 'PRACTICAL_FAIL' | 'THEORY_FAIL' | 'ABSENT_RECORD' | 'HIGH_AVG_FAIL' | 'BOUNDARY_MARK' | 'OPTIONAL_NO_BENEFIT';
  label: string;
  severity: 'danger' | 'warning' | 'info' | 'success';
  description: string;
}

export interface TraceStep {
  stepNumber: number;
  category: 'SUBJECT_EVAL' | 'OPTIONAL_CALC' | 'COMPULSORY_SUM' | 'GPA_FINAL';
  title: string;
  details: string;
  ruleApplied: string;
  resultValue: string;
  isFailingStep?: boolean;
  isBonusStep?: boolean;
  mathExpression?: string;
}

export interface CalculationTrace {
  studentName: string;
  roll: number;
  studentClass: string;
  subjectSteps: TraceStep[];
  compulsoryStep: TraceStep;
  optionalStep: TraceStep;
  finalStep: TraceStep;
  summaryFormula: string;
  verdict: string;
  rootCauseFailure?: string;
}

export interface StudentCalculatedResult {
  student: Student;
  subjectResults: SubjectResult[];
  totalMarksObtained: number;
  maxMarksPossible: number;
  compulsorySubjectCount: number;
  compulsoryGPSum: number;
  optionalGP: number;
  optionalBonusGP: number;
  rawAverageGP: number;
  finalGPA: number;
  letterGrade: 'A+' | 'A' | 'A-' | 'B' | 'C' | 'D' | 'F';
  isPassed: boolean;
  hasAbsent: boolean;
  hasPracticalFail: boolean;
  hasTheoryFail: boolean;
  hasOptionalBoost: boolean;
  hasHighAvgCompulsoryFail: boolean;
  failedCompulsorySubjects: string[];
  auditFlags: AuditFlag[];
  trace: CalculationTrace;
}

export interface ClassAnalytics {
  totalStudents: number;
  totalPassed: number;
  totalFailed: number;
  totalAbsent: number;
  passRate: number;
  averageGPA: number;
  gradeDistribution: Record<'A+' | 'A' | 'A-' | 'B' | 'C' | 'D' | 'F', number>;
  worstPerformingSubjects: {
    subjectCode: string;
    subjectName: string;
    failCount: number;
    practicalFailCount: number;
    theoryFailCount: number;
    absentCount: number;
    avgMarks: number;
  }[];
}

export interface RejectionReason {
  rowNumber: number;
  studentRoll?: string | number;
  studentName?: string;
  field: string;
  invalidValue: any;
  reason: string;
  suggestion: string;
}

export interface ImportValidationResult {
  totalRows: number;
  validRows: Student[];
  rejectedRows: RejectionReason[];
}
