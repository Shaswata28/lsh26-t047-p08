import { Student, SubjectMarkInput, RejectionReason, ImportValidationResult } from './types';

export interface RawRowData {
  [key: string]: string | number | undefined | null;
}

/**
 * Parses and validates raw CSV/TSV text (e.g. pasted from Excel/Google Sheets).
 * Returns both valid parsed students and detailed rejection reasons.
 */
export function parseAndValidateSpreadsheetText(
  rawText: string,
  targetClass: 'Class 9' | 'Class 10' = 'Class 10'
): ImportValidationResult {
  const lines = rawText.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) {
    return { totalRows: 0, validRows: [], rejectedRows: [] };
  }

  // Detect delimiter (comma, tab, semicolon, pipe)
  const firstLine = lines[0];
  let delimiter = ',';
  if (firstLine.includes('\t')) delimiter = '\t';
  else if (firstLine.includes(';') && !firstLine.includes(',')) delimiter = ';';
  else if (firstLine.includes('|')) delimiter = '|';

  const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
  const validRows: Student[] = [];
  const rejectedRows: RejectionReason[] = [];

  const existingRolls = new Set<number>();

  for (let i = 1; i < lines.length; i++) {
    const rowNum = i + 1; // 1-indexed for human readability
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(delimiter).map(v => v.trim().replace(/^["']|["']$/g, ''));

    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] !== undefined ? values[idx] : '';
    });

    // 1. Validate Roll
    const rawRoll = row['roll'] || row['roll_no'] || row['id'] || values[0];
    const rollNum = parseInt(rawRoll, 10);
    if (!rawRoll || isNaN(rollNum) || rollNum <= 0) {
      rejectedRows.push({
        rowNumber: rowNum,
        studentRoll: rawRoll || 'N/A',
        studentName: row['name'] || values[1] || 'Unknown',
        field: 'roll',
        invalidValue: rawRoll,
        reason: 'Roll number is missing, non-numeric, or <= 0.',
        suggestion: 'Provide a valid positive integer for student roll (e.g. 101).',
      });
      continue;
    }

    if (existingRolls.has(rollNum)) {
      rejectedRows.push({
        rowNumber: rowNum,
        studentRoll: rollNum,
        studentName: row['name'] || values[1] || 'Unknown',
        field: 'roll',
        invalidValue: rollNum,
        reason: `Duplicate roll number ${rollNum} found in the import sheet.`,
        suggestion: 'Ensure all student rolls within the class are unique.',
      });
      continue;
    }

    // 2. Validate Name
    const name = row['name'] || row['student_name'] || values[1];
    if (!name || name.trim().length < 2) {
      rejectedRows.push({
        rowNumber: rowNum,
        studentRoll: rollNum,
        studentName: name || 'N/A',
        field: 'name',
        invalidValue: name,
        reason: 'Student name is missing or shorter than 2 characters.',
        suggestion: 'Enter full student name (e.g. "Tanvir Ahmed").',
      });
      continue;
    }

    // 3. Extract and Validate Marks
    let rowHasError = false;

    const parseMarkField = (
      val: string | undefined,
      fieldName: string,
      maxMarks: number
    ): { mark: number | 'ABS' | null; error?: string } => {
      if (val === undefined || val === null || val === '') {
        return { mark: null }; // treated as zero or absent based on context
      }
      const upper = String(val).trim().toUpperCase();
      if (upper === 'ABS' || upper === 'ABSENT' || upper === 'A') {
        return { mark: 'ABS' };
      }
      const num = Number(val);
      if (isNaN(num)) {
        return { mark: null, error: `Invalid non-numeric mark '${val}'. Expected a number 0-${maxMarks} or 'ABS'.` };
      }
      if (num < 0) {
        return { mark: null, error: `Negative mark ${num} is not allowed.` };
      }
      if (num > maxMarks) {
        return { mark: null, error: `Mark ${num} exceeds maximum possible mark of ${maxMarks}.` };
      }
      return { mark: num };
    };

    // Subject extractions
    // Bangla (Max 100)
    const banRaw = row['ban'] || row['bangla'] || row['ban_th'] || values[2];
    const banParsed = parseMarkField(banRaw, 'Bangla', 100);
    if (banParsed.error) {
      rejectedRows.push({
        rowNumber: rowNum,
        studentRoll: rollNum,
        studentName: name,
        field: 'Bangla (BAN)',
        invalidValue: banRaw,
        reason: banParsed.error,
        suggestion: 'Enter a valid Bangla mark between 0 and 100 or ABS.',
      });
      rowHasError = true;
    }

    // English (Max 100)
    const engRaw = row['eng'] || row['english'] || row['eng_th'] || values[3];
    const engParsed = parseMarkField(engRaw, 'English', 100);
    if (engParsed.error) {
      rejectedRows.push({
        rowNumber: rowNum,
        studentRoll: rollNum,
        studentName: name,
        field: 'English (ENG)',
        invalidValue: engRaw,
        reason: engParsed.error,
        suggestion: 'Enter a valid English mark between 0 and 100 or ABS.',
      });
      rowHasError = true;
    }

    // Mathematics (Max 100)
    const matRaw = row['mat'] || row['math'] || row['mathematics'] || values[4];
    const matParsed = parseMarkField(matRaw, 'General Mathematics', 100);
    if (matParsed.error) {
      rejectedRows.push({
        rowNumber: rowNum,
        studentRoll: rollNum,
        studentName: name,
        field: 'Mathematics (MAT)',
        invalidValue: matRaw,
        reason: matParsed.error,
        suggestion: 'Enter a valid Mathematics mark between 0 and 100 or ABS.',
      });
      rowHasError = true;
    }

    // Physics (Theory 75, Practical 25)
    const phyThRaw = row['phy_th'] || row['physics_theory'] || values[5];
    const phyPrRaw = row['phy_pr'] || row['physics_practical'] || values[6];
    const phyTh = parseMarkField(phyThRaw, 'Physics Theory', 75);
    const phyPr = parseMarkField(phyPrRaw, 'Physics Practical', 25);
    if (phyTh.error) {
      rejectedRows.push({
        rowNumber: rowNum, studentRoll: rollNum, studentName: name, field: 'Physics Theory (PHY_TH)',
        invalidValue: phyThRaw, reason: phyTh.error, suggestion: 'Physics Theory must be between 0 and 75.',
      });
      rowHasError = true;
    }
    if (phyPr.error) {
      rejectedRows.push({
        rowNumber: rowNum, studentRoll: rollNum, studentName: name, field: 'Physics Practical (PHY_PR)',
        invalidValue: phyPrRaw, reason: phyPr.error, suggestion: 'Physics Practical must be between 0 and 25.',
      });
      rowHasError = true;
    }

    // Chemistry (Theory 75, Practical 25)
    const cheThRaw = row['che_th'] || row['chemistry_theory'] || values[7];
    const chePrRaw = row['che_pr'] || row['chemistry_practical'] || values[8];
    const cheTh = parseMarkField(cheThRaw, 'Chemistry Theory', 75);
    const chePr = parseMarkField(chePrRaw, 'Chemistry Practical', 25);
    if (cheTh.error) {
      rejectedRows.push({
        rowNumber: rowNum, studentRoll: rollNum, studentName: name, field: 'Chemistry Theory (CHE_TH)',
        invalidValue: cheThRaw, reason: cheTh.error, suggestion: 'Chemistry Theory must be between 0 and 75.',
      });
      rowHasError = true;
    }
    if (chePr.error) {
      rejectedRows.push({
        rowNumber: rowNum, studentRoll: rollNum, studentName: name, field: 'Chemistry Practical (CHE_PR)',
        invalidValue: chePrRaw, reason: chePr.error, suggestion: 'Chemistry Practical must be between 0 and 25.',
      });
      rowHasError = true;
    }

    // Biology (Theory 75, Practical 25)
    const bioThRaw = row['bio_th'] || row['biology_theory'] || values[9];
    const bioPrRaw = row['bio_pr'] || row['biology_practical'] || values[10];
    const bioTh = parseMarkField(bioThRaw, 'Biology Theory', 75);
    const bioPr = parseMarkField(bioPrRaw, 'Biology Practical', 25);
    if (bioTh.error) {
      rejectedRows.push({
        rowNumber: rowNum, studentRoll: rollNum, studentName: name, field: 'Biology Theory (BIO_TH)',
        invalidValue: bioThRaw, reason: bioTh.error, suggestion: 'Biology Theory must be between 0 and 75.',
      });
      rowHasError = true;
    }
    if (bioPr.error) {
      rejectedRows.push({
        rowNumber: rowNum, studentRoll: rollNum, studentName: name, field: 'Biology Practical (BIO_PR)',
        invalidValue: bioPrRaw, reason: bioPr.error, suggestion: 'Biology Practical must be between 0 and 25.',
      });
      rowHasError = true;
    }

    // Higher Math / 4th Optional (Theory 75, Practical 25)
    const hmaThRaw = row['hma_th'] || row['higher_math_theory'] || row['opt_th'] || values[11];
    const hmaPrRaw = row['hma_pr'] || row['higher_math_practical'] || row['opt_pr'] || values[12];
    const hmaTh = parseMarkField(hmaThRaw, 'Higher Math Theory', 75);
    const hmaPr = parseMarkField(hmaPrRaw, 'Higher Math Practical', 25);
    if (hmaTh.error) {
      rejectedRows.push({
        rowNumber: rowNum, studentRoll: rollNum, studentName: name, field: 'Higher Math Theory (HMA_TH)',
        invalidValue: hmaThRaw, reason: hmaTh.error, suggestion: 'Higher Math Theory must be between 0 and 75.',
      });
      rowHasError = true;
    }
    if (hmaPr.error) {
      rejectedRows.push({
        rowNumber: rowNum, studentRoll: rollNum, studentName: name, field: 'Higher Math Practical (HMA_PR)',
        invalidValue: hmaPrRaw, reason: hmaPr.error, suggestion: 'Higher Math Practical must be between 0 and 25.',
      });
      rowHasError = true;
    }

    if (rowHasError) {
      continue;
    }

    existingRolls.add(rollNum);

    const studentMarks: Record<string, SubjectMarkInput> = {
      BAN: { theoryMark: banParsed.mark, isAbsent: banParsed.mark === 'ABS' },
      ENG: { theoryMark: engParsed.mark, isAbsent: engParsed.mark === 'ABS' },
      MAT: { theoryMark: matParsed.mark, isAbsent: matParsed.mark === 'ABS' },
      PHY: { theoryMark: phyTh.mark, practicalMark: phyPr.mark, isAbsent: phyTh.mark === 'ABS' || phyPr.mark === 'ABS' },
      CHE: { theoryMark: cheTh.mark, practicalMark: chePr.mark, isAbsent: cheTh.mark === 'ABS' || chePr.mark === 'ABS' },
      BIO: { theoryMark: bioTh.mark, practicalMark: bioPr.mark, isAbsent: bioTh.mark === 'ABS' || bioPr.mark === 'ABS' },
      HMA: { theoryMark: hmaTh.mark, practicalMark: hmaPr.mark, isAbsent: hmaTh.mark === 'ABS' || hmaPr.mark === 'ABS' },
    };

    const studentObj: Student = {
      id: `imported-${rollNum}-${Date.now()}`,
      roll: rollNum,
      registrationNo: row['reg'] || row['registration'] || `REG2026-${rollNum}`,
      name: name.trim(),
      gender: (row['gender']?.toLowerCase().startsWith('f') ? 'Female' : 'Male') as 'Male' | 'Female',
      class: (row['class'] || targetClass) as 'Class 9' | 'Class 10',
      section: (row['section']?.toUpperCase() === 'B' ? 'B' : 'A') as 'A' | 'B',
      group: 'Science',
      session: '2025-2026',
      marks: studentMarks,
    };

    validRows.push(studentObj);
  }

  return {
    totalRows: lines.length - 1,
    validRows,
    rejectedRows,
  };
}

/**
 * Converts a raw student object from P08_school_results_public.json case into a typed Student
 */
export function convertPublicStudentToStudent(
  rawStudent: any,
  index: number,
  caseId?: string
): Student {
  const roll = rawStudent.id && /^S(\d+)$/i.test(rawStudent.id)
    ? parseInt(rawStudent.id.replace(/^S/i, ''), 10)
    : (rawStudent.roll || index + 1);

  const studentMarks: Record<string, SubjectMarkInput> = {};

  if (rawStudent.marks && typeof rawStudent.marks === 'object') {
    for (const [code, val] of Object.entries(rawStudent.marks)) {
      if (val === 'AB' || val === 'ABS' || val === 'ABSENT') {
        studentMarks[code] = { theoryMark: 'ABS', practicalMark: 'ABS', isAbsent: true };
      } else if (typeof val === 'number') {
        studentMarks[code] = { theoryMark: val, isAbsent: false };
      } else if (typeof val === 'object' && val !== null) {
        const obj = val as any;
        const th = typeof obj.theory === 'number' ? obj.theory : 0;
        const pr = typeof obj.practical === 'number' ? obj.practical : 0;
        studentMarks[code] = {
          theoryMark: th,
          practicalMark: pr,
          isAbsent: false,
        };
      }
    }
  }

  return {
    id: rawStudent.id || `S${String(roll).padStart(3, '0')}`,
    roll,
    registrationNo: `REG2026-${String(roll).padStart(3, '0')}`,
    name: rawStudent.name || `Student ${roll}`,
    gender: (roll % 2 === 0 ? 'Female' : 'Male'),
    class: (rawStudent.class === 'Class 9' ? 'Class 9' : 'Class 10'),
    section: (roll % 2 === 0 ? 'B' : 'A'),
    group: 'Science',
    session: '2025-2026',
    optional: rawStudent.optional || undefined,
    marks: studentMarks,
  };
}

/**
 * Converts a case object from P08_school_results_public.json to an array of Students
 */
export function convertPublicCaseToStudents(caseData: any): Student[] {
  if (!caseData || !Array.isArray(caseData.students)) return [];
  return caseData.students.map((s: any, idx: number) =>
    convertPublicStudentToStudent(s, idx, caseData.case_id)
  );
}

/**
 * Parses and validates either CSV text or JSON cases format
 */
export function parseAndValidateAnyInput(
  rawInput: string,
  targetClass: 'Class 9' | 'Class 10' = 'Class 10'
): ImportValidationResult {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return { totalRows: 0, validRows: [], rejectedRows: [] };
  }

  // Check if input is JSON
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      let students: any[] = [];

      if (parsed.cases && Array.isArray(parsed.cases)) {
        // Full P08 JSON file: extract all students from all cases or first case
        for (const c of parsed.cases) {
          if (Array.isArray(c.students)) {
            students.push(...c.students);
          }
        }
      } else if (parsed.students && Array.isArray(parsed.students)) {
        // Single case format: { case_id: 'PUB-01', students: [...] }
        students = parsed.students;
      } else if (Array.isArray(parsed)) {
        // Array of students: [...]
        students = parsed;
      } else if (parsed.id && parsed.marks) {
        // Single student object
        students = [parsed];
      }

      const validRows: Student[] = students.map((s, idx) => convertPublicStudentToStudent(s, idx));
      return {
        totalRows: students.length,
        validRows,
        rejectedRows: [],
      };
    } catch (e: any) {
      return {
        totalRows: 1,
        validRows: [],
        rejectedRows: [{
          rowNumber: 1,
          field: 'JSON Payload',
          invalidValue: 'Malformed JSON',
          reason: `Failed to parse JSON: ${e.message}`,
          suggestion: 'Ensure valid JSON format matching P08 specification or CSV/TSV format.',
        }],
      };
    }
  }

  // Fallback to CSV / TSV parser
  return parseAndValidateSpreadsheetText(trimmed, targetClass);
}

/**
 * Returns sample CSV template text for users to copy/paste or download.
 */
export function getSampleCsvTemplate(): string {
  return `roll,name,gender,section,ban,eng,mat,phy_th,phy_pr,che_th,che_pr,bio_th,bio_pr,hma_th,hma_pr
301,Tanvir Hassan,Male,A,82,75,90,65,24,60,22,64,23,68,24
302,Sultana Jahan,Female,A,74,70,85,58,22,54,20,58,21,62,23
303,Invalid Mark Demo,Male,A,85,80,95,78,28,60,22,64,23,65,24
304,Absent Demo,Female,B,ABS,75,80,50,20,52,21,55,20,60,22`;
}
