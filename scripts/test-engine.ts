import { calculateSubjectResult, calculateStudentResult, DEFAULT_SUBJECT_CONFIGS, getGradePointFromMarks } from '../src/lib/gpaEngine';
import { Student } from '../src/lib/types';

console.log('=== Testing Bogura GPA Engine ===\n');

// 1. Test Grade Point Mapping
console.log('1. Grade Point Scale Mapping:');
const markTests = [
  { mark: 95, expectedGP: 5.0, expectedGrade: 'A+' },
  { mark: 80, expectedGP: 5.0, expectedGrade: 'A+' },
  { mark: 79, expectedGP: 4.0, expectedGrade: 'A' },
  { mark: 70, expectedGP: 4.0, expectedGrade: 'A' },
  { mark: 69, expectedGP: 3.5, expectedGrade: 'A-' },
  { mark: 60, expectedGP: 3.5, expectedGrade: 'A-' },
  { mark: 59, expectedGP: 3.0, expectedGrade: 'B' },
  { mark: 50, expectedGP: 3.0, expectedGrade: 'B' },
  { mark: 49, expectedGP: 2.0, expectedGrade: 'C' },
  { mark: 40, expectedGP: 2.0, expectedGrade: 'C' },
  { mark: 39, expectedGP: 1.0, expectedGrade: 'D' },
  { mark: 33, expectedGP: 1.0, expectedGrade: 'D' },
  { mark: 32, expectedGP: 0.0, expectedGrade: 'F' },
  { mark: 0, expectedGP: 0.0, expectedGrade: 'F' },
];

for (const t of markTests) {
  const res = getGradePointFromMarks(t.mark);
  const ok = res.gp === t.expectedGP && res.grade === t.expectedGrade;
  console.log(`  Mark ${t.mark} -> GP ${res.gp} (${res.grade}) [${ok ? 'PASS' : 'FAIL'}]`);
  if (!ok) throw new Error(`Mark mapping failed for mark ${t.mark}`);
}

// 2. Test Dual-Passing for Practical Subjects (PHY, CHE, BIO, HMA)
console.log('\n2. Practical Dual-Pass Rules:');
const phyConfig = DEFAULT_SUBJECT_CONFIGS.PHY;

// Case A: Theory Pass (60/75), Practical Fail (6/25, pass 8)
const resA = calculateSubjectResult(phyConfig, { theoryMark: 60, practicalMark: 6 });
console.log(`  Theory 60, Practical 6 -> GP ${resA.gradePoint} (${resA.letterGrade}), Passed: ${resA.isPassed} [${resA.gradePoint === 0 && !resA.isPassed ? 'PASS' : 'FAIL'}]`);
if (resA.isPassed || resA.gradePoint !== 0) throw new Error('Practical fail should produce GP 0 and fail');

// Case B: Theory Fail (20/75, pass 25), Practical Pass (25/25) -> Total 45
const resB = calculateSubjectResult(phyConfig, { theoryMark: 20, practicalMark: 25 });
console.log(`  Theory 20, Practical 25 (Total 45) -> GP ${resB.gradePoint} (${resB.letterGrade}), Passed: ${resB.isPassed} [${resB.gradePoint === 0 && !resB.isPassed ? 'PASS' : 'FAIL'}]`);
if (resB.isPassed || resB.gradePoint !== 0) throw new Error('Theory fail should produce GP 0 and fail');

// Case C: Theory Pass (25/75), Practical Pass (8/25) -> Total 33 -> D (1.0)
const resC = calculateSubjectResult(phyConfig, { theoryMark: 25, practicalMark: 8 });
console.log(`  Theory 25, Practical 8 (Total 33) -> GP ${resC.gradePoint} (${resC.letterGrade}), Passed: ${resC.isPassed} [${resC.gradePoint === 1.0 && resC.isPassed ? 'PASS' : 'FAIL'}]`);
if (!resC.isPassed || resC.gradePoint !== 1.0) throw new Error('Boundary 33 with passed theory and practical should give GP 1.0');

// 3. Test Student Result: Optional 4th Subject Bonus and Compulsory Fail
console.log('\n3. Student GPA and 4th Subject Bonus Calculation:');
// Student with straight 4.0 in 6 compulsory + 5.0 in 4th subject
// GP sum = 24.0, 4th bonus = 5.0 - 2.0 = 3.0.
// Total GP sum = 24 + 3 = 27. GPA = 27 / 6 = 4.50.
const mockStudent1: Student = {
  id: 'test-1',
  roll: 1,
  registrationNo: 'REG-001',
  name: 'Bonus Test Student',
  gender: 'Male',
  class: 'Class 10',
  section: 'A',
  group: 'Science',
  session: '2026',
  marks: {
    BAN: { theoryMark: 75 }, // GP 4.0
    ENG: { theoryMark: 75 }, // GP 4.0
    MAT: { theoryMark: 75 }, // GP 4.0
    PHY: { theoryMark: 55, practicalMark: 20 }, // Total 75 -> GP 4.0
    CHE: { theoryMark: 55, practicalMark: 20 }, // Total 75 -> GP 4.0
    BIO: { theoryMark: 55, practicalMark: 20 }, // Total 75 -> GP 4.0
    HMA: { theoryMark: 65, practicalMark: 20 }, // Total 85 -> GP 5.0 -> Bonus: 3.0
  }
};

const result1 = calculateStudentResult(mockStudent1);
console.log(`  Compulsory GP Sum: ${result1.compulsoryGPSum}, Optional Bonus: ${result1.optionalBonusGP}, Final GPA: ${result1.finalGPA} (${result1.letterGrade})`);
if (result1.finalGPA !== 4.5 || result1.letterGrade !== 'A') throw new Error(`Expected GPA 4.50, got ${result1.finalGPA}`);

// 4. Test Student with High Average but 1 Compulsory Fail (EDGE-1)
console.log('\n4. High Average with 1 Compulsory Fail Test (EDGE-1):');
const mockStudent2: Student = {
  id: 'test-2',
  roll: 2,
  registrationNo: 'REG-002',
  name: 'High Average Fail Student',
  gender: 'Female',
  class: 'Class 10',
  section: 'A',
  group: 'Science',
  session: '2026',
  marks: {
    BAN: { theoryMark: 30 }, // Fail (GP 0)
    ENG: { theoryMark: 95 }, // GP 5.0
    MAT: { theoryMark: 95 }, // GP 5.0
    PHY: { theoryMark: 70, practicalMark: 25 }, // Total 95 -> GP 5.0
    CHE: { theoryMark: 70, practicalMark: 25 }, // Total 95 -> GP 5.0
    BIO: { theoryMark: 70, practicalMark: 25 }, // Total 95 -> GP 5.0
    HMA: { theoryMark: 70, practicalMark: 25 }, // Total 95 -> GP 5.0
  }
};

const result2 = calculateStudentResult(mockStudent2);
console.log(`  Total Marks: ${result2.totalMarksObtained}, Passed: ${result2.isPassed}, Final GPA: ${result2.finalGPA} (${result2.letterGrade}), Failed Subject: ${result2.failedCompulsorySubjects.join(', ')}`);
if (result2.isPassed || result2.finalGPA !== 0.0 || result2.letterGrade !== 'F') {
  throw new Error('Student with compulsory fail must receive GPA 0.00 / F');
}

// 5. Test Absent Handling
console.log('\n5. Absent Handling Differentiation:');
const mockStudentAbsent: Student = {
  id: 'test-absent',
  roll: 3,
  registrationNo: 'REG-003',
  name: 'Absent Student',
  gender: 'Male',
  class: 'Class 10',
  section: 'A',
  group: 'Science',
  session: '2026',
  marks: {
    BAN: { theoryMark: 'ABS', isAbsent: true },
    ENG: { theoryMark: 85 },
    MAT: { theoryMark: 85 },
    PHY: { theoryMark: 65, practicalMark: 20 },
    CHE: { theoryMark: 65, practicalMark: 20 },
    BIO: { theoryMark: 65, practicalMark: 20 },
    HMA: { theoryMark: 65, practicalMark: 20 },
  }
};

const resultAbsent = calculateStudentResult(mockStudentAbsent);
console.log(`  Absent Student: isAbsent: ${resultAbsent.hasAbsent}, isPassed: ${resultAbsent.isPassed}, Final GPA: ${resultAbsent.finalGPA} (${resultAbsent.letterGrade})`);
if (!resultAbsent.hasAbsent || resultAbsent.isPassed || resultAbsent.finalGPA !== 0) {
  throw new Error('Absent in compulsory subject must be correctly flagged and produce GPA 0.00 / F');
}

console.log('\n>>> ALL ENGINE UNIT TESTS PASSED PERFECTLY! <<<');
