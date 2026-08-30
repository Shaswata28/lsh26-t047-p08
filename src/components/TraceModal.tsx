'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Sparkles, 
  Calculator, 
  BookOpen, 
  Award, 
  Printer, 
  ArrowRight,
  ShieldAlert,
  Info,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { StudentCalculatedResult, SubjectResult } from '@/lib/types';
import { DEFAULT_SUBJECT_CONFIGS } from '@/lib/gpaEngine';

interface TraceModalProps {
  result: StudentCalculatedResult | null;
  onClose: () => void;
}

export const TraceModal: React.FC<TraceModalProps> = ({ result, onClose }) => {
  useEffect(() => {
    if (result && result.finalGPA === 5.0 && result.isPassed) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [result]);

  if (!result) return null;

  const { student, subjectResults, trace } = result;

  const getGradeBadgeColor = (grade: string) => {
    switch (grade) {
      case 'A+': return 'bg-emerald-500 text-white';
      case 'A': return 'bg-teal-500 text-white';
      case 'A-': return 'bg-blue-500 text-white';
      case 'B': return 'bg-cyan-600 text-white';
      case 'C': return 'bg-amber-500 text-white';
      case 'D': return 'bg-orange-500 text-white';
      case 'F': return 'bg-rose-600 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Header Bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold flex items-center space-x-2">
                <span>Deterministic Calculation Trace</span>
                <span className="text-xs font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  Roll #{student.roll}
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Bogura Secondary School • Rule-by-rule arithmetic audit
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              href={`/marksheet/${student.id}`}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Marksheet</span>
            </Link>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Student Profile & Result Verdict Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Student Info */}
            <div className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">{student.name}</h3>
                  <span className="text-xs font-semibold px-2.5 py-1 bg-slate-200 text-slate-700 rounded-full">
                    {student.class} • Sec {student.section}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs text-slate-600">
                  <div><span className="font-semibold text-slate-800">Registration:</span> {student.registrationNo}</div>
                  <div><span className="font-semibold text-slate-800">Group:</span> {student.group}</div>
                  <div><span className="font-semibold text-slate-800">Session:</span> {student.session}</div>
                  <div><span className="font-semibold text-slate-800">Gender:</span> {student.gender}</div>
                </div>
              </div>

              {student.edgeCaseTag && (
                <div className="mt-3 pt-2.5 border-t border-slate-200">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-lg">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{student.edgeCaseTag}</span>
                  </div>
                  {student.edgeCaseDescription && (
                    <p className="text-[11px] text-amber-900 mt-1 pl-1">
                      {student.edgeCaseDescription}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* GPA Score Box */}
            <div className={`rounded-xl p-4 flex flex-col items-center justify-center text-center border ${
              result.isPassed 
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950' 
                : 'bg-rose-50/80 border-rose-200 text-rose-950'
            }`}>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Final Result
              </div>
              <div className="flex items-baseline space-x-2 my-1">
                <span className="text-4xl font-extrabold tracking-tight">
                  {result.finalGPA.toFixed(2)}
                </span>
                <span className={`text-base font-bold px-2.5 py-0.5 rounded-md shadow-sm ${getGradeBadgeColor(result.letterGrade)}`}>
                  {result.letterGrade}
                </span>
              </div>
              <div className={`mt-1 inline-flex items-center space-x-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                result.isPassed ? 'bg-emerald-200 text-emerald-800' : 'bg-rose-200 text-rose-800'
              }`}>
                {result.isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                <span>{result.isPassed ? 'PASSED' : 'FAILED'}</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-2">
                Total Marks: <span className="font-bold text-slate-700">{result.totalMarksObtained}</span> / {result.maxMarksPossible}
              </div>
            </div>
          </div>

          {/* Root Cause Failure Alert (If Student Failed) */}
          {!result.isPassed && (
            <div className="bg-rose-50 border-l-4 border-rose-600 p-4 rounded-r-xl shadow-sm">
              <div className="flex items-start space-x-3">
                <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-rose-900">
                    Compulsory Subject Failure Triggered
                  </h4>
                  <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                    {trace.rootCauseFailure || 'A fail in one or more compulsory subjects overrides average calculation, setting Final GPA to 0.00 (F).'}
                  </p>
                  {result.hasHighAvgCompulsoryFail && (
                    <div className="mt-2 text-xs bg-rose-100 text-rose-950 font-medium px-2.5 py-1 rounded border border-rose-300">
                      ⚠️ Note: This student obtained a high average ({result.totalMarksObtained} marks / Avg GP {result.rawAverageGP.toFixed(2)}), but failed solely due to: <strong className="underline">{result.failedCompulsorySubjects.join(', ')}</strong>.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Section: Subject-by-Subject Evaluation & Rules Applied */}
          <div>
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2 mb-3">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>1. Per-Subject Examination & Rule Trace</span>
            </h4>

            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Subject</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3 text-center">Theory Mark</th>
                      <th className="py-2.5 px-3 text-center">Practical Mark</th>
                      <th className="py-2.5 px-3 text-center">Total</th>
                      <th className="py-2.5 px-3 text-center">GP (Grade)</th>
                      <th className="py-2.5 px-3">Applied Rule & Explanation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {subjectResults.map((sub) => {
                      const cfg = DEFAULT_SUBJECT_CONFIGS[sub.subjectCode];
                      const isOpt = sub.isOptional;
                      return (
                        <tr 
                          key={sub.subjectCode} 
                          className={`hover:bg-slate-50 transition-colors ${
                            !sub.isPassed ? 'bg-rose-50/50' : isOpt && sub.optionalAddedGP > 0 ? 'bg-emerald-50/40' : ''
                          }`}
                        >
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900">{sub.subjectName}</div>
                            <div className="flex items-center space-x-1.5 mt-0.5">
                              <span className="text-[10px] text-slate-500 font-mono">{sub.subjectCode}</span>
                              {isOpt ? (
                                <span className="text-[10px] font-semibold text-purple-700 bg-purple-100 px-1.5 py-0.2 rounded">
                                  4th Optional
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold text-slate-600 bg-slate-200/70 px-1.5 py-0.2 rounded">
                                  Compulsory
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3 px-3 text-slate-600">
                            {cfg?.type === 'theory_and_practical' ? 'Theory + Practical' : 'Theory Only'}
                          </td>

                          {/* Theory */}
                          <td className="py-3 px-3 text-center">
                            {sub.isAbsent ? (
                              <span className="font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded text-[11px]">
                                ABSENT
                              </span>
                            ) : (
                              <div>
                                <span className={`font-mono font-bold ${!sub.theoryPassed ? 'text-rose-600' : 'text-slate-800'}`}>
                                  {sub.theoryMark}
                                </span>
                                <span className="text-slate-400 text-[10px]">/{cfg?.theoryFullMarks}</span>
                                <div className="text-[10px] text-slate-500">
                                  min {cfg?.theoryPassMarks}
                                </div>
                              </div>
                            )}
                          </td>

                          {/* Practical */}
                          <td className="py-3 px-3 text-center">
                            {cfg?.type === 'theory_and_practical' ? (
                              sub.isAbsent ? (
                                <span className="font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded text-[11px]">
                                  ABSENT
                                </span>
                              ) : (
                                <div>
                                  <span className={`font-mono font-bold ${!sub.practicalPassed ? 'text-rose-600' : 'text-slate-800'}`}>
                                    {sub.practicalMark}
                                  </span>
                                  <span className="text-slate-400 text-[10px]">/{cfg?.practicalFullMarks}</span>
                                  <div className="text-[10px] text-slate-500">
                                    min {cfg?.practicalPassMarks}
                                  </div>
                                </div>
                              )
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>

                          {/* Total */}
                          <td className="py-3 px-3 text-center">
                            {sub.isAbsent ? (
                              <span className="text-slate-400">—</span>
                            ) : (
                              <span className="font-mono font-bold text-slate-900 text-sm">
                                {sub.totalMark}
                              </span>
                            )}
                          </td>

                          {/* Grade Point & Grade */}
                          <td className="py-3 px-3 text-center">
                            <div className="inline-flex items-center space-x-1.5">
                              <span className="font-bold text-slate-900 font-mono">
                                {sub.gradePoint.toFixed(2)}
                              </span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getGradeBadgeColor(sub.letterGrade)}`}>
                                {sub.letterGrade}
                              </span>
                            </div>
                            {isOpt && (
                              <div className="text-[10px] text-purple-700 font-semibold mt-0.5">
                                Bonus: +{sub.optionalAddedGP.toFixed(2)}
                              </div>
                            )}
                          </td>

                          {/* Rule Explanation */}
                          <td className="py-3 px-3">
                            <p className="text-slate-700 leading-tight">
                              {sub.ruleExplanation}
                            </p>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Section: Step-by-Step Mathematical Calculation */}
          <div>
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-2 mb-3">
              <Calculator className="w-4 h-4 text-emerald-600" />
              <span>2. Mathematical Aggregation & Average Trace</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Step 1: Compulsory Sum */}
              <div className={`p-4 rounded-xl border ${
                result.failedCompulsorySubjects.length > 0
                  ? 'bg-rose-50 border-rose-200 text-rose-950'
                  : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}>
                <div className="text-xs font-bold uppercase text-slate-500 flex items-center justify-between">
                  <span>Step 1: Compulsory GP Sum</span>
                  <span className="text-[11px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-700 font-mono">6 Subjects</span>
                </div>
                <div className="text-2xl font-extrabold my-1 font-mono">
                  {result.compulsoryGPSum.toFixed(2)}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Sum of grade points across all 6 compulsory subjects. Raw avg = {(result.compulsoryGPSum / 6).toFixed(2)}.
                </p>
                {result.failedCompulsorySubjects.length > 0 && (
                  <div className="mt-2 text-[11px] font-bold text-rose-700 bg-rose-100 p-1.5 rounded">
                    ⚠️ Failed in: {result.failedCompulsorySubjects.join(', ')}
                  </div>
                )}
              </div>

              {/* Step 2: 4th Subject Bonus */}
              <div className={`p-4 rounded-xl border ${
                result.optionalBonusGP > 0
                  ? 'bg-purple-50 border-purple-200 text-purple-950'
                  : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}>
                <div className="text-xs font-bold uppercase text-slate-500 flex items-center justify-between">
                  <span>Step 2: 4th Subject Bonus</span>
                  <span className="text-[11px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-mono">
                    GP {result.optionalGP.toFixed(2)}
                  </span>
                </div>
                <div className="text-2xl font-extrabold my-1 font-mono text-purple-700">
                  +{result.optionalBonusGP.toFixed(2)}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Rule: <span className="font-mono text-purple-900">max(0, {result.optionalGP.toFixed(2)} - 2.00)</span> = +{result.optionalBonusGP.toFixed(2)} added to GP sum.
                </p>
                {result.optionalBonusGP === 0 && !result.hasAbsent && result.optionalGP > 0 && (
                  <div className="mt-2 text-[11px] text-slate-500 bg-slate-100 p-1.5 rounded">
                    Score was ≤ 2.0, so no bonus was contributed.
                  </div>
                )}
              </div>

              {/* Step 3: Final Division & Cap */}
              <div className={`p-4 rounded-xl border ${
                result.isPassed
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-rose-50 border-rose-200 text-rose-950'
              }`}>
                <div className="text-xs font-bold uppercase text-slate-500 flex items-center justify-between">
                  <span>Step 3: Division & Cap</span>
                  <span className="text-[11px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono">Divisor = 6</span>
                </div>
                <div className="text-2xl font-extrabold my-1 font-mono">
                  {result.finalGPA.toFixed(2)} <span className="text-sm font-bold">({result.letterGrade})</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-mono">
                  {result.isPassed 
                    ? `(${result.compulsoryGPSum.toFixed(2)} + ${result.optionalBonusGP.toFixed(2)}) / 6 = ${result.finalGPA.toFixed(2)}`
                    : 'GPA 0.00 (F) [Compulsory Fail Override]'}
                </p>
              </div>
            </div>
          </div>

          {/* Formula summary bar */}
          <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calculator className="w-4 h-4 text-emerald-400" />
              <span>Full Arithmetic Expression:</span>
            </div>
            <div className="text-emerald-400 font-bold">
              {trace.summaryFormula}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Bogura Secondary School Result Processing Engine • Verification Standard
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition"
          >
            Close Trace
          </button>
        </div>
      </div>
    </div>
  );
};
