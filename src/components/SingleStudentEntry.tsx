'use client';

import React, { useState, useMemo } from 'react';
import { 
  UserPlus, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Calculator, 
  Save, 
  RotateCcw, 
  BookOpen, 
  FlaskConical,
  GraduationCap
} from 'lucide-react';
import { Student, SubjectMarkInput, StudentCalculatedResult } from '@/lib/types';
import { calculateStudentResult, DEFAULT_SUBJECT_CONFIGS } from '@/lib/gpaEngine';
import { upsertStudent } from '@/lib/supabaseClient';

interface SingleStudentEntryProps {
  onStudentAdded?: (newStudent: Student) => void;
}

export const SingleStudentEntry: React.FC<SingleStudentEntryProps> = ({ onStudentAdded }) => {
  // Demographic form state
  const [roll, setRoll] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [studentClass, setStudentClass] = useState<'Class 9' | 'Class 10'>('Class 10');
  const [section, setSection] = useState<'A' | 'B'>('A');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [registrationNo, setRegistrationNo] = useState<string>('');
  const [optionalSubject, setOptionalSubject] = useState<'HMT' | 'BIO'>('HMT');

  // Dynamic 3rd compulsory science subject:
  // If 4th optional is HMT -> Biology (BIO) is compulsory
  // If 4th optional is BIO -> Higher Mathematics (HMT) is compulsory
  const compulsoryScienceThird = optionalSubject === 'HMT' ? 'BIO' : 'HMT';

  // Subject marks state: { theory: string, practical: string, isAbsent: boolean }
  const [marksState, setMarksState] = useState<Record<string, { theory: string; practical: string; isAbsent: boolean }>>({
    BAN: { theory: '', practical: '', isAbsent: false },
    ENG: { theory: '', practical: '', isAbsent: false },
    MAT: { theory: '', practical: '', isAbsent: false },
    PHY: { theory: '', practical: '', isAbsent: false },
    CHE: { theory: '', practical: '', isAbsent: false },
    BIO: { theory: '', practical: '', isAbsent: false },
    HMT: { theory: '', practical: '', isAbsent: false },
  });

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Clean numeric input handler allowing direct typing without spinners
  const handleMarkChange = (code: string, field: 'theory' | 'practical', rawVal: string) => {
    const cleaned = rawVal.replace(/[^0-9]/g, '');
    setMarksState(prev => ({
      ...prev,
      [code]: {
        ...prev[code],
        [field]: cleaned,
      }
    }));
  };

  const handleAbsentToggle = (code: string) => {
    setMarksState(prev => ({
      ...prev,
      [code]: {
        ...prev[code],
        isAbsent: !prev[code].isAbsent,
      }
    }));
  };

  // Convert form state to student marks payload
  const formattedMarks: Record<string, SubjectMarkInput> = useMemo(() => {
    const res: Record<string, SubjectMarkInput> = {};
    const relevantCodes = ['BAN', 'ENG', 'MAT', 'PHY', 'CHE', compulsoryScienceThird, optionalSubject];

    for (const code of relevantCodes) {
      const state = marksState[code] || { theory: '', practical: '', isAbsent: false };
      const config = DEFAULT_SUBJECT_CONFIGS[code];

      if (state.isAbsent) {
        res[code] = { theoryMark: 'ABS', practicalMark: 'ABS', isAbsent: true };
      } else {
        const thNum = state.theory !== '' ? Number(state.theory) : null;
        const prNum = (config?.type === 'theory_and_practical' && state.practical !== '')
          ? Number(state.practical)
          : null;

        res[code] = {
          theoryMark: thNum,
          practicalMark: prNum,
          isAbsent: false,
        };
      }
    }
    return res;
  }, [marksState, compulsoryScienceThird, optionalSubject]);

  // Construct draft student object for real-time live calculations
  const draftStudent: Student = useMemo(() => {
    const numRoll = parseInt(roll, 10) || 1;
    return {
      id: `manual-${numRoll}-${studentClass.replace(/\s+/g, '')}`,
      roll: numRoll,
      registrationNo: registrationNo.trim() || `REG2026-${String(numRoll).padStart(3, '0')}`,
      name: name.trim() || 'Student Draft',
      gender,
      class: studentClass,
      section,
      group: 'Science',
      session: '2025-2026',
      optional: optionalSubject,
      marks: formattedMarks,
    };
  }, [roll, name, studentClass, section, gender, registrationNo, optionalSubject, formattedMarks]);

  // Live calculation results
  const calculationPreview: StudentCalculatedResult = useMemo(() => {
    return calculateStudentResult(draftStudent);
  }, [draftStudent]);

  // Reset form
  const handleReset = (nextRoll?: number) => {
    if (nextRoll !== undefined) {
      setRoll(String(nextRoll));
      setRegistrationNo(`REG2026-${String(nextRoll).padStart(3, '0')}`);
    } else {
      setRoll('');
      setRegistrationNo('');
    }
    setName('');
    setMarksState({
      BAN: { theory: '', practical: '', isAbsent: false },
      ENG: { theory: '', practical: '', isAbsent: false },
      MAT: { theory: '', practical: '', isAbsent: false },
      PHY: { theory: '', practical: '', isAbsent: false },
      CHE: { theory: '', practical: '', isAbsent: false },
      BIO: { theory: '', practical: '', isAbsent: false },
      HMT: { theory: '', practical: '', isAbsent: false },
    });
    setErrorMsg(null);
  };

  // Submit & Save
  const handleSaveStudent = async (addNext: boolean = false) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const rollNum = parseInt(roll, 10);
    if (!roll || isNaN(rollNum) || rollNum <= 0) {
      setErrorMsg('Please enter a valid positive roll number (e.g. 101).');
      return;
    }

    if (!name.trim() || name.trim().length < 2) {
      setErrorMsg('Please enter the full student name (minimum 2 characters).');
      return;
    }

    // Validate marks boundaries
    const relevantCodes = ['BAN', 'ENG', 'MAT', 'PHY', 'CHE', compulsoryScienceThird, optionalSubject];
    for (const code of relevantCodes) {
      const state = marksState[code];
      const cfg = DEFAULT_SUBJECT_CONFIGS[code];
      if (!state.isAbsent) {
        if (state.theory !== '') {
          const val = Number(state.theory);
          if (isNaN(val) || val < 0 || val > cfg.theoryFullMarks) {
            setErrorMsg(`${cfg.name} Theory mark must be between 0 and ${cfg.theoryFullMarks}.`);
            return;
          }
        }
        if (cfg.type === 'theory_and_practical' && state.practical !== '') {
          const val = Number(state.practical);
          if (isNaN(val) || val < 0 || val > cfg.practicalFullMarks) {
            setErrorMsg(`${cfg.name} Practical mark must be between 0 and ${cfg.practicalFullMarks}.`);
            return;
          }
        }
      }
    }

    setIsSaving(true);
    try {
      const studentPayload: Student = {
        ...draftStudent,
        id: `std-${studentClass.toLowerCase().replace(/\s+/g, '')}-${rollNum}`,
        roll: rollNum,
        name: name.trim(),
        registrationNo: registrationNo.trim() || `REG2026-${String(rollNum).padStart(3, '0')}`,
      };

      const res = await upsertStudent(studentPayload);
      if (res.success) {
        setSuccessMsg(`Student #${rollNum} (${name}) saved successfully with GPA ${calculationPreview.finalGPA.toFixed(2)} (${calculationPreview.letterGrade})!`);
        if (onStudentAdded) onStudentAdded(studentPayload);

        if (addNext) {
          handleReset(rollNum + 1);
        }
      } else {
        setErrorMsg(`Failed to save: ${res.error || 'Unknown error'}`);
      }
    } catch (e: any) {
      setErrorMsg(`Error saving student: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const getSubjectStatusBadge = (code: string) => {
    const sub = calculationPreview.subjectResults.find(s => s.subjectCode === code);
    if (!sub) return null;
    if (sub.isAbsent) {
      return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700">ABS</span>;
    }
    if (!sub.isPassed) {
      return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700">FAIL (0.0)</span>;
    }
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
        GP {sub.gradePoint.toFixed(1)} ({sub.letterGrade})
      </span>
    );
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-teal-950 text-white px-5 py-3.5 rounded-2xl border border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5">
          <span className="p-1.5 bg-teal-500/20 text-teal-300 rounded-lg border border-teal-500/30">
            <UserPlus className="w-4 h-4" />
          </span>
          <div>
            <h2 className="text-base font-bold text-slate-100">
              Single Student Mark Entry Desk
            </h2>
            <p className="text-[11px] text-slate-300">
              Enter individual student profile and marks with live dual-pass and 4th subject bonus verification.
            </p>
          </div>
        </div>

        <button
          onClick={() => handleReset()}
          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Form</span>
        </button>
      </div>

      {/* Notification Toasts */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-xs font-bold text-emerald-950">{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg(null)}
            className="text-xs text-emerald-700 hover:underline font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-300 rounded-xl p-3 flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center space-x-2.5">
            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="text-xs font-bold text-rose-950">{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-xs text-rose-700 hover:underline font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Left Form (8 Cols) & Right Result Bar (4 Cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        
        {/* Left Form: 8 Cols on XL */}
        <div className="xl:col-span-8 space-y-4">
          
          {/* Card 1: Student Demographics (Full Width Grid) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-teal-600" />
                <span>1. Student Profile Information</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-medium bg-slate-100 px-2 py-0.5 rounded">
                Science Group
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Roll */}
              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Roll <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g. 101"
                  value={roll}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setRoll(val);
                    if (val && !registrationNo) {
                      setRegistrationNo(`REG2026-${String(val).padStart(3, '0')}`);
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none transition"
                />
              </div>

              {/* Name */}
              <div className="sm:col-span-5">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Student Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tanvir Ahmed"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none transition"
                />
              </div>

              {/* Reg No */}
              <div className="sm:col-span-4">
                <label className="block text-xs font-bold text-slate-700 mb-1">Registration No</label>
                <input
                  type="text"
                  placeholder="REG2026-101"
                  value={registrationNo}
                  onChange={(e) => setRegistrationNo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none transition"
                />
              </div>

              {/* Class */}
              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">Class</label>
                <select
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value as 'Class 9' | 'Class 10')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none transition"
                >
                  <option value="Class 10">Class 10</option>
                  <option value="Class 9">Class 9</option>
                </select>
              </div>

              {/* Section */}
              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-700 mb-1">Section</label>
                <select
                  value={section}
                  onChange={(e) => setSection(e.target.value as 'A' | 'B')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none transition"
                >
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                </select>
              </div>

              {/* Gender */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'Male' | 'Female')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none transition"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              {/* 4th Optional Subject selector */}
              <div className="sm:col-span-4">
                <label className="block text-xs font-bold text-purple-900 mb-1 flex items-center justify-between">
                  <span>4th Optional Subject</span>
                  <span className="text-[10px] text-purple-600 font-semibold">Bonus &gt; 2.0</span>
                </label>
                <select
                  value={optionalSubject}
                  onChange={(e) => setOptionalSubject(e.target.value as 'HMT' | 'BIO')}
                  className="w-full px-3 py-2 bg-purple-50 border border-purple-300 rounded-xl text-xs font-bold text-purple-950 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition cursor-pointer"
                >
                  <option value="HMT">Higher Mathematics (HMT)</option>
                  <option value="BIO">Biology (BIO)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Card 2: Compulsory General Subjects (Bangla, English, Math) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-1.5">
                <Calculator className="w-4 h-4 text-emerald-600" />
                <span>2. Compulsory General Subjects (Theory 100, Pass 33)</span>
              </h3>
              <span className="text-[10px] text-slate-400">Direct Marks Input</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Bangla */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">Bangla (BAN)</span>
                  <label className="flex items-center space-x-1 cursor-pointer text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                    <input
                      type="checkbox"
                      checked={marksState.BAN.isAbsent}
                      onChange={() => handleAbsentToggle('BAN')}
                      className="rounded text-rose-600 focus:ring-0"
                    />
                    <span>ABS</span>
                  </label>
                </div>
                <div>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Enter mark 0-100"
                    disabled={marksState.BAN.isAbsent}
                    value={marksState.BAN.theory}
                    onChange={(e) => handleMarkChange('BAN', 'theory', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                  />
                </div>
                <div className="flex items-center justify-between pt-0.5 text-[11px]">
                  <span className="text-slate-500 font-mono">Max 100</span>
                  {getSubjectStatusBadge('BAN')}
                </div>
              </div>

              {/* English */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">English (ENG)</span>
                  <label className="flex items-center space-x-1 cursor-pointer text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                    <input
                      type="checkbox"
                      checked={marksState.ENG.isAbsent}
                      onChange={() => handleAbsentToggle('ENG')}
                      className="rounded text-rose-600 focus:ring-0"
                    />
                    <span>ABS</span>
                  </label>
                </div>
                <div>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Enter mark 0-100"
                    disabled={marksState.ENG.isAbsent}
                    value={marksState.ENG.theory}
                    onChange={(e) => handleMarkChange('ENG', 'theory', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                  />
                </div>
                <div className="flex items-center justify-between pt-0.5 text-[11px]">
                  <span className="text-slate-500 font-mono">Max 100</span>
                  {getSubjectStatusBadge('ENG')}
                </div>
              </div>

              {/* Mathematics */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">Mathematics (MAT)</span>
                  <label className="flex items-center space-x-1 cursor-pointer text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                    <input
                      type="checkbox"
                      checked={marksState.MAT.isAbsent}
                      onChange={() => handleAbsentToggle('MAT')}
                      className="rounded text-rose-600 focus:ring-0"
                    />
                    <span>ABS</span>
                  </label>
                </div>
                <div>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Enter mark 0-100"
                    disabled={marksState.MAT.isAbsent}
                    value={marksState.MAT.theory}
                    onChange={(e) => handleMarkChange('MAT', 'theory', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                  />
                </div>
                <div className="flex items-center justify-between pt-0.5 text-[11px]">
                  <span className="text-slate-500 font-mono">Max 100</span>
                  {getSubjectStatusBadge('MAT')}
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Science Practical Compulsory Subjects */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-teal-900 flex items-center space-x-1.5">
                <FlaskConical className="w-4 h-4 text-teal-600" />
                <span>3. Science Practical Compulsory (Theory $\ge$ 25 & Practical $\ge$ 8)</span>
              </h3>
              <span className="text-[10px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                Dual Pass Required
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Physics */}
              <div className="p-3.5 rounded-xl border border-teal-200 bg-teal-50/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">Physics (PHY)</span>
                  <label className="flex items-center space-x-1 cursor-pointer text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                    <input
                      type="checkbox"
                      checked={marksState.PHY.isAbsent}
                      onChange={() => handleAbsentToggle('PHY')}
                      className="rounded text-rose-600 focus:ring-0"
                    />
                    <span>ABS</span>
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="block text-[10px] text-slate-500 font-medium mb-0.5">Theory (0–75)</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="min 25"
                      disabled={marksState.PHY.isAbsent}
                      value={marksState.PHY.theory}
                      onChange={(e) => handleMarkChange('PHY', 'theory', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                    />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 font-medium mb-0.5">Prac (0–25)</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="min 8"
                      disabled={marksState.PHY.isAbsent}
                      value={marksState.PHY.practical}
                      onChange={(e) => handleMarkChange('PHY', 'practical', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-0.5 text-[11px]">
                  <span className="text-slate-500 font-mono">
                    Total: {Number(marksState.PHY.theory || 0) + Number(marksState.PHY.practical || 0)}/100
                  </span>
                  {getSubjectStatusBadge('PHY')}
                </div>
              </div>

              {/* Chemistry */}
              <div className="p-3.5 rounded-xl border border-teal-200 bg-teal-50/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900">Chemistry (CHE)</span>
                  <label className="flex items-center space-x-1 cursor-pointer text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                    <input
                      type="checkbox"
                      checked={marksState.CHE.isAbsent}
                      onChange={() => handleAbsentToggle('CHE')}
                      className="rounded text-rose-600 focus:ring-0"
                    />
                    <span>ABS</span>
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="block text-[10px] text-slate-500 font-medium mb-0.5">Theory (0–75)</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="min 25"
                      disabled={marksState.CHE.isAbsent}
                      value={marksState.CHE.theory}
                      onChange={(e) => handleMarkChange('CHE', 'theory', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                    />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 font-medium mb-0.5">Prac (0–25)</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="min 8"
                      disabled={marksState.CHE.isAbsent}
                      value={marksState.CHE.practical}
                      onChange={(e) => handleMarkChange('CHE', 'practical', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-0.5 text-[11px]">
                  <span className="text-slate-500 font-mono">
                    Total: {Number(marksState.CHE.theory || 0) + Number(marksState.CHE.practical || 0)}/100
                  </span>
                  {getSubjectStatusBadge('CHE')}
                </div>
              </div>

              {/* Swappable 3rd Compulsory: BIO or HMT */}
              <div className="p-3.5 rounded-xl border border-teal-300 bg-teal-50/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-xs text-slate-900">
                      {compulsoryScienceThird === 'BIO' ? 'Biology (BIO)' : 'Higher Math (HMT)'}
                    </span>
                    <span className="text-[9px] bg-teal-100 text-teal-900 font-bold px-1 py-0.5 rounded">
                      Compulsory
                    </span>
                  </div>
                  <label className="flex items-center space-x-1 cursor-pointer text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                    <input
                      type="checkbox"
                      checked={marksState[compulsoryScienceThird].isAbsent}
                      onChange={() => handleAbsentToggle(compulsoryScienceThird)}
                      className="rounded text-rose-600 focus:ring-0"
                    />
                    <span>ABS</span>
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="block text-[10px] text-slate-500 font-medium mb-0.5">Theory (0–75)</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="min 25"
                      disabled={marksState[compulsoryScienceThird].isAbsent}
                      value={marksState[compulsoryScienceThird].theory}
                      onChange={(e) => handleMarkChange(compulsoryScienceThird, 'theory', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                    />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-500 font-medium mb-0.5">Prac (0–25)</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="min 8"
                      disabled={marksState[compulsoryScienceThird].isAbsent}
                      value={marksState[compulsoryScienceThird].practical}
                      onChange={(e) => handleMarkChange(compulsoryScienceThird, 'practical', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-0.5 text-[11px]">
                  <span className="text-slate-500 font-mono">
                    Total: {Number(marksState[compulsoryScienceThird].theory || 0) + Number(marksState[compulsoryScienceThird].practical || 0)}/100
                  </span>
                  {getSubjectStatusBadge(compulsoryScienceThird)}
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: 4th Optional Subject (Highlighted Card) */}
          <div className="bg-white rounded-2xl p-5 border-2 border-purple-300 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between border-b border-purple-100 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-purple-900 flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>4. 4th Optional Subject: {optionalSubject === 'HMT' ? 'Higher Mathematics (HMT)' : 'Biology (BIO)'}</span>
              </h3>
              <span className="text-[10px] text-purple-800 font-bold bg-purple-100 px-2 py-0.5 rounded-full border border-purple-200">
                Bonus: max(0, GP − 2.00)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center">
              <div className="sm:col-span-4">
                <div className="text-sm font-bold text-purple-950">
                  {optionalSubject === 'HMT' ? 'Higher Mathematics' : 'Biology'}
                </div>
                <div className="text-[11px] text-purple-700">
                  Does not fail student overall. Points above GP 2.00 add bonus.
                </div>
              </div>

              <div className="sm:col-span-6 grid grid-cols-2 gap-2.5">
                <div>
                  <span className="block text-[10px] text-purple-900 font-bold mb-0.5">Theory (0–75)</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Theory mark"
                    disabled={marksState[optionalSubject]?.isAbsent}
                    value={marksState[optionalSubject]?.theory || ''}
                    onChange={(e) => handleMarkChange(optionalSubject, 'theory', e.target.value)}
                    className="w-full px-3 py-2 bg-purple-50/50 border border-purple-200 rounded-lg text-xs font-mono font-bold text-slate-900 disabled:opacity-40 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <span className="block text-[10px] text-purple-900 font-bold mb-0.5">Practical (0–25)</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Practical mark"
                    disabled={marksState[optionalSubject]?.isAbsent}
                    value={marksState[optionalSubject]?.practical || ''}
                    onChange={(e) => handleMarkChange(optionalSubject, 'practical', e.target.value)}
                    className="w-full px-3 py-2 bg-purple-50/50 border border-purple-200 rounded-lg text-xs font-mono font-bold text-slate-900 disabled:opacity-40 focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="sm:col-span-2 flex flex-col items-end justify-center space-y-1.5">
                <label className="flex items-center space-x-1 cursor-pointer text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded border border-rose-200">
                  <input
                    type="checkbox"
                    checked={marksState[optionalSubject]?.isAbsent}
                    onChange={() => handleAbsentToggle(optionalSubject)}
                    className="rounded text-rose-600 focus:ring-0"
                  />
                  <span>ABS</span>
                </label>
                {getSubjectStatusBadge(optionalSubject)}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => handleReset()}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center justify-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Fields</span>
            </button>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <button
                type="button"
                onClick={() => handleSaveStudent(false)}
                disabled={isSaving}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center space-x-2"
              >
                <Save className="w-4 h-4 text-emerald-400" />
                <span>{isSaving ? 'Saving...' : 'Save Student'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSaveStudent(true)}
                disabled={isSaving}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-700/20 transition flex items-center justify-center space-x-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save & Add Next Student (#)'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Right Result Bar: 4 Cols on XL */}
        <div className="xl:col-span-4 space-y-4 sticky top-6">
          <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-200">
                  Live Grading Verification
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/90 px-2 py-0.5 rounded-md border border-emerald-700/60 font-bold">
                Deterministic
              </span>
            </div>

            {/* Overall Verdict Banner */}
            <div className={`p-4 rounded-xl border-2 transition-all ${
              calculationPreview.isPassed
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Final Calculated GPA</div>
                  <div className="text-3xl font-black font-mono mt-0.5">
                    {calculationPreview.finalGPA.toFixed(2)}
                    <span className="text-sm ml-2 font-sans font-bold">
                      ({calculationPreview.letterGrade})
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-extrabold shadow-sm ${
                    calculationPreview.isPassed ? 'bg-emerald-400 text-slate-950' : 'bg-rose-500 text-white'
                  }`}>
                    {calculationPreview.isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>{calculationPreview.isPassed ? 'PASSED' : 'FAILED'}</span>
                  </span>
                </div>
              </div>

              {!calculationPreview.isPassed && calculationPreview.failedCompulsorySubjects.length > 0 && (
                <div className="mt-2.5 text-xs text-rose-300 border-t border-rose-800/60 pt-1.5 font-semibold">
                  ⚠️ Compulsory fail in: {calculationPreview.failedCompulsorySubjects.join(', ')}
                </div>
              )}
            </div>

            {/* Arithmetic Formula Breakdown */}
            <div className="space-y-2 text-xs font-mono bg-slate-950/90 p-3.5 rounded-xl border border-slate-800">
              <div className="flex justify-between text-slate-400">
                <span>Compulsory Sum (6 Sub):</span>
                <span className="text-slate-100 font-bold">{calculationPreview.compulsoryGPSum.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-purple-400">
                <span>4th Subject Bonus:</span>
                <span className="font-bold">+{calculationPreview.optionalBonusGP.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400 border-t border-slate-800 pt-1.5">
                <span>Total Marks:</span>
                <span className="text-slate-100 font-bold">{calculationPreview.totalMarksObtained} / {calculationPreview.maxMarksPossible}</span>
              </div>
              <div className="text-[11px] text-slate-400 pt-0.5 leading-relaxed">
                Formula: <span className="text-emerald-300 font-bold">({calculationPreview.compulsoryGPSum.toFixed(2)} + {calculationPreview.optionalBonusGP.toFixed(2)}) / 6</span>
              </div>
            </div>

            {/* Per-Subject Breakdown List */}
            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Subject Breakdown:
              </div>
              {calculationPreview.subjectResults.map((sub, idx) => (
                <div
                  key={`${sub.subjectCode}-${sub.isOptional ? 'opt' : 'comp'}-${idx}`}
                  className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-slate-800/70 border border-slate-700/60"
                >
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-slate-100">{sub.subjectCode}</span>
                    {sub.isOptional && (
                      <span className="text-[9px] text-purple-400 font-semibold bg-purple-950 px-1.5 py-0.5 rounded">4th</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-slate-400 text-[11px]">
                      {sub.isAbsent ? 'ABS' : `${sub.totalMark || 0} pts`}
                    </span>
                    <span className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
                      !sub.isPassed ? 'bg-rose-900 text-rose-200' : 'bg-emerald-900 text-emerald-200'
                    }`}>
                      GP {sub.gradePoint.toFixed(1)} ({sub.letterGrade})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
