'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Printer, 
  ArrowLeft, 
  GraduationCap, 
  Award, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck,
  QrCode
} from 'lucide-react';
import { StudentCalculatedResult } from '@/lib/types';
import { DEFAULT_SUBJECT_CONFIGS } from '@/lib/gpaEngine';

interface MarksheetViewProps {
  result: StudentCalculatedResult;
}

export const MarksheetView: React.FC<MarksheetViewProps> = ({ result }) => {
  const { student, subjectResults } = result;

  const handlePrint = () => {
    window.print();
  };

  const getGradeBadge = (grade: string) => {
    switch (grade) {
      case 'A+': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'A': return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'A-': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'B': return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'C': return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'D': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'F': return 'bg-rose-100 text-rose-800 border-rose-300';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Action Bar (hidden on print) */}
      <div className="no-print flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Master Dashboard</span>
        </Link>

        <button
          onClick={handlePrint}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/20 transition"
        >
          <Printer className="w-4 h-4" />
          <span>Print Official Transcript (A4)</span>
        </button>
      </div>

      {/* Official Marksheet Document (Paper A4 representation) */}
      <div className="bg-white rounded-2xl border-2 border-slate-300 p-8 sm:p-12 shadow-xl print:border-none print:shadow-none print:p-0 print:m-0 space-y-6 text-slate-900 relative overflow-hidden">
        
        {/* Subtle Watermark in background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
          <GraduationCap className="w-96 h-96 text-slate-900" />
        </div>

        {/* Institution Header */}
        <div className="text-center border-b-2 border-slate-900 pb-5 space-y-1">
          <div className="flex items-center justify-center space-x-3 mb-1">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md">
              <GraduationCap className="w-7 h-7 text-emerald-400" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-slate-950 font-serif">
            GPA Engine
          </h1>
          <p className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
            Bogura Sadar, Bogura • Established 1968 • Board of Intermediate & Secondary Education, Rajshahi
          </p>
          <div className="pt-2">
            <span className="inline-block bg-slate-900 text-white text-xs font-bold uppercase tracking-widest px-4 py-1 rounded-md">
              Academic Transcript & Statement of Marks
            </span>
          </div>
        </div>

        {/* Top Grid: Student Demographic & Official Scale */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          
          {/* Student Info Card (2 cols) */}
          <div className="md:col-span-2 border border-slate-300 rounded-xl p-4 bg-slate-50/50 space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <span className="text-slate-500 font-medium">Student&apos;s Name:</span>
                <div className="font-extrabold text-sm text-slate-950">{student.name}</div>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Roll Number:</span>
                <div className="font-bold font-mono text-sm text-slate-950">#{student.roll}</div>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Registration No:</span>
                <div className="font-bold font-mono text-slate-900">{student.registrationNo}</div>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Class & Section:</span>
                <div className="font-bold text-slate-900">{student.class} (Section {student.section})</div>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Group:</span>
                <div className="font-bold text-slate-900">{student.group}</div>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Academic Session:</span>
                <div className="font-bold text-slate-900">{student.session}</div>
              </div>
            </div>
          </div>

          {/* Grading System Reference Table (1 col) */}
          <div className="border border-slate-300 rounded-xl p-2.5 bg-slate-50/50 text-[10px]">
            <div className="font-bold uppercase tracking-wider text-slate-700 text-center mb-1 pb-1 border-b border-slate-200">
              Grading Scale Key
            </div>
            <table className="w-full text-center">
              <thead className="text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-0.5">Range</th>
                  <th className="py-0.5">Grade</th>
                  <th className="py-0.5">GP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                <tr><td>80-100</td><td className="font-bold text-emerald-700">A+</td><td>5.0</td></tr>
                <tr><td>70-79</td><td className="font-bold text-teal-700">A</td><td>4.0</td></tr>
                <tr><td>60-69</td><td className="font-bold text-blue-700">A-</td><td>3.5</td></tr>
                <tr><td>50-59</td><td className="font-bold text-cyan-700">B</td><td>3.0</td></tr>
                <tr><td>40-49</td><td className="font-bold text-amber-700">C</td><td>2.0</td></tr>
                <tr><td>33-39</td><td className="font-bold text-orange-700">D</td><td>1.0</td></tr>
                <tr><td>0-32</td><td className="font-bold text-rose-700">F</td><td>0.0</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Subject-wise Marks Table */}
        <div className="border-2 border-slate-900 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Subject Code & Name</th>
                <th className="py-2.5 px-2 text-center">Full Marks</th>
                <th className="py-2.5 px-2 text-center">Theory (Pass 25/33)</th>
                <th className="py-2.5 px-2 text-center">Practical (Pass 8)</th>
                <th className="py-2.5 px-2 text-center">Total Marks</th>
                <th className="py-2.5 px-2 text-center">Letter Grade</th>
                <th className="py-2.5 px-3 text-center">Grade Point (GP)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              {subjectResults.map((sub) => {
                const cfg = DEFAULT_SUBJECT_CONFIGS[sub.subjectCode];
                const isOpt = sub.isOptional;

                return (
                  <tr 
                    key={sub.subjectCode} 
                    className={isOpt ? 'bg-purple-50/60 font-semibold' : ''}
                  >
                    <td className="py-2 px-3">
                      <div className="font-bold text-slate-950">
                        {sub.subjectName}
                        {isOpt && <span className="ml-1 text-[10px] text-purple-700">(4th Optional)</span>}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">{sub.subjectCode}</div>
                    </td>

                    <td className="py-2 px-2 text-center font-mono text-slate-700">
                      {cfg?.fullMarks || 100}
                    </td>

                    {/* Theory */}
                    <td className="py-2 px-2 text-center font-mono font-bold">
                      {sub.isAbsent ? (
                        <span className="text-rose-700">ABSENT</span>
                      ) : (
                        <span className={!sub.theoryPassed ? 'text-rose-600' : 'text-slate-900'}>
                          {sub.theoryMark}
                        </span>
                      )}
                    </td>

                    {/* Practical */}
                    <td className="py-2 px-2 text-center font-mono font-bold">
                      {cfg?.type === 'theory_and_practical' ? (
                        sub.isAbsent ? (
                          <span className="text-rose-700">ABSENT</span>
                        ) : (
                          <span className={!sub.practicalPassed ? 'text-rose-600' : 'text-slate-900'}>
                            {sub.practicalMark}
                          </span>
                        )
                      ) : (
                        <span className="text-slate-400 font-normal">—</span>
                      )}
                    </td>

                    {/* Total */}
                    <td className="py-2 px-2 text-center font-mono font-extrabold text-slate-950">
                      {sub.isAbsent ? '—' : sub.totalMark}
                    </td>

                    {/* Grade */}
                    <td className="py-2 px-2 text-center font-bold">
                      <span className={`px-2 py-0.5 rounded text-[11px] border ${getGradeBadge(sub.letterGrade)}`}>
                        {sub.letterGrade}
                      </span>
                    </td>

                    {/* GP */}
                    <td className="py-2 px-3 text-center font-mono font-bold text-slate-950">
                      {sub.gradePoint.toFixed(2)}
                      {isOpt && sub.optionalAddedGP > 0 && (
                        <div className="text-[9px] text-purple-700">
                          (Adds +{sub.optionalAddedGP.toFixed(2)})
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Final Result Summary Box */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 border-2 border-slate-900 rounded-xl bg-slate-50">
          <div className="text-center sm:text-left">
            <div className="text-[11px] text-slate-500 font-semibold uppercase">Total Marks Obtained</div>
            <div className="text-2xl font-extrabold text-slate-950 font-mono mt-0.5">
              {result.totalMarksObtained} <span className="text-xs font-normal text-slate-500">/ {result.maxMarksPossible}</span>
            </div>
          </div>

          <div className="text-center sm:text-left">
            <div className="text-[11px] text-slate-500 font-semibold uppercase">Grade Point Average</div>
            <div className="text-2xl font-black text-slate-950 font-mono mt-0.5">
              GPA {result.finalGPA.toFixed(2)}
            </div>
          </div>

          <div className="text-center sm:text-left">
            <div className="text-[11px] text-slate-500 font-semibold uppercase">Overall Letter Grade</div>
            <div className="text-2xl font-black text-slate-950 mt-0.5">
              {result.letterGrade}
            </div>
          </div>

          <div className="text-center sm:text-right flex flex-col items-center sm:items-end justify-center">
            <div className="text-[11px] text-slate-500 font-semibold uppercase mb-1">Result Status</div>
            <div className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
              result.isPassed
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-rose-600 text-white shadow-sm'
            }`}>
              {result.isPassed ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              <span>{result.isPassed ? 'PASSED' : 'FAILED'}</span>
            </div>
          </div>
        </div>

        {/* Failure Remark or High Average Note */}
        {!result.isPassed && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 leading-relaxed font-medium">
            <strong>Examination Notice:</strong> {result.trace.rootCauseFailure}
          </div>
        )}

        {/* Signatures & Seal Section */}
        <div className="pt-12 grid grid-cols-3 gap-6 text-center text-xs">
          <div className="space-y-1">
            <div className="border-b border-slate-400 w-3/4 mx-auto pb-1 font-serif italic text-slate-500">
              M. A. Hashem
            </div>
            <div className="font-bold text-slate-800">Class Teacher</div>
            <div className="text-[10px] text-slate-400">GPA Engine</div>
          </div>

          <div className="flex flex-col items-center justify-end">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-[9px] text-slate-400 font-semibold uppercase text-center p-1">
              Institutional Seal
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Bogura, Bangladesh</div>
          </div>

          <div className="space-y-1">
            <div className="border-b border-slate-400 w-3/4 mx-auto pb-1 font-serif italic text-slate-500">
              Prof. Dr. K. M. Rahman
            </div>
            <div className="font-bold text-slate-800">Headmaster</div>
            <div className="text-[10px] text-slate-400">Controller of Examinations</div>
          </div>
        </div>

        {/* Footer Verification Code */}
        <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
          <div>
            System Generated Document • Bogura GPA Engine v2.0 • Deterministic Evaluation
          </div>
          <div className="font-mono">
            VERIFY-ID: BSS-{student.roll}-{student.registrationNo.slice(-4)}
          </div>
        </div>
      </div>
    </div>
  );
};
