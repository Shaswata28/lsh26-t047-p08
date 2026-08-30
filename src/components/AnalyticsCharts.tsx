'use client';

import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Award, 
  AlertTriangle, 
  UserX, 
  CheckCircle2, 
  XCircle, 
  Percent, 
  BookOpen, 
  Layers,
  Flame
} from 'lucide-react';
import { StudentCalculatedResult } from '@/lib/types';
import { calculateClassAnalytics } from '@/lib/gpaEngine';

interface AnalyticsChartsProps {
  results: StudentCalculatedResult[];
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ results }) => {
  const [selectedClass, setSelectedClass] = useState<'All' | 'Class 10' | 'Class 9'>('All');

  const filteredResults = useMemo(() => {
    if (selectedClass === 'All') return results;
    return results.filter(r => r.student.class === selectedClass);
  }, [results, selectedClass]);

  const analytics = useMemo(() => {
    return calculateClassAnalytics(filteredResults);
  }, [filteredResults]);

  const total = analytics.totalStudents;
  const worstSubject = analytics.worstPerformingSubjects[0];

  const gradeColors: Record<string, { bg: string; bar: string; text: string }> = {
    'A+': { bg: 'bg-emerald-50 text-emerald-900 border-emerald-200', bar: 'bg-emerald-500', text: 'text-emerald-700' },
    'A': { bg: 'bg-teal-50 text-teal-900 border-teal-200', bar: 'bg-teal-500', text: 'text-teal-700' },
    'A-': { bg: 'bg-blue-50 text-blue-900 border-blue-200', bar: 'bg-blue-500', text: 'text-blue-700' },
    'B': { bg: 'bg-cyan-50 text-cyan-900 border-cyan-200', bar: 'bg-cyan-600', text: 'text-cyan-700' },
    'C': { bg: 'bg-amber-50 text-amber-900 border-amber-200', bar: 'bg-amber-500', text: 'text-amber-700' },
    'D': { bg: 'bg-orange-50 text-orange-900 border-orange-200', bar: 'bg-orange-500', text: 'text-orange-700' },
    'F': { bg: 'bg-rose-50 text-rose-900 border-rose-200', bar: 'bg-rose-600', text: 'text-rose-700' },
  };

  return (
    <div className="space-y-6">
      {/* Header & Class Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <span>Academic Performance & Grade Distribution Analytics</span>
          </h2>
          <p className="text-xs text-slate-500">
            GPA Engine • Comprehensive statistical report
          </p>
        </div>

        {/* Class Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          {(['All', 'Class 10', 'Class 9'] as const).map((cls) => (
            <button
              key={cls}
              onClick={() => setSelectedClass(cls)}
              className={`px-3 py-1.5 rounded-lg transition ${
                selectedClass === cls
                  ? 'bg-white text-slate-900 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cls === 'All' ? 'All Classes' : cls}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Students */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Total Students</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">{analytics.totalStudents}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">{selectedClass} cohort</div>
        </div>

        {/* Pass Rate */}
        <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200 shadow-sm">
          <div className="text-[11px] font-semibold text-emerald-800 uppercase flex items-center justify-between">
            <span>Pass Rate</span>
            <Percent className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-950 mt-1 font-mono">{analytics.passRate}%</div>
          <div className="text-[10px] text-emerald-700 mt-0.5">{analytics.totalPassed} of {analytics.totalStudents} passed</div>
        </div>

        {/* Average GPA */}
        <div className="bg-teal-50/80 p-4 rounded-2xl border border-teal-200 shadow-sm">
          <div className="text-[11px] font-semibold text-teal-800 uppercase flex items-center justify-between">
            <span>Average GPA</span>
            <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <div className="text-2xl font-extrabold text-teal-950 mt-1 font-mono">{analytics.averageGPA.toFixed(2)}</div>
          <div className="text-[10px] text-teal-700 mt-0.5">Passing candidates avg</div>
        </div>

        {/* Golden A+ Count */}
        <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200 shadow-sm">
          <div className="text-[11px] font-semibold text-amber-800 uppercase flex items-center justify-between">
            <span>Golden A+</span>
            <Award className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-amber-950 mt-1 font-mono">{analytics.gradeDistribution['A+']}</div>
          <div className="text-[10px] text-amber-700 mt-0.5">GPA 5.00 achievers</div>
        </div>

        {/* Total Failed */}
        <div className="bg-rose-50/80 p-4 rounded-2xl border border-rose-200 shadow-sm">
          <div className="text-[11px] font-semibold text-rose-800 uppercase flex items-center justify-between">
            <span>Total Failed</span>
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-2xl font-extrabold text-rose-950 mt-1 font-mono">{analytics.totalFailed}</div>
          <div className="text-[10px] text-rose-700 mt-0.5">Overall Grade F</div>
        </div>

        {/* Absent */}
        <div className="bg-slate-100 p-4 rounded-2xl border border-slate-300 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-600 uppercase flex items-center justify-between">
            <span>Absent Count</span>
            <UserX className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">{analytics.totalAbsent}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Non-attendees</div>
        </div>
      </div>

      {/* Worst Performing Subject Banner (Required feature) */}
      {worstSubject && (
        <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-slate-900 p-5 rounded-2xl text-white border border-rose-900/60 shadow-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-rose-600/30 text-rose-400 rounded-xl border border-rose-500/40">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-rose-400">
                  Subject That Failed the Most Students
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  {worstSubject.subjectName} ({worstSubject.subjectCode})
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Responsible for <strong className="text-rose-400">{worstSubject.failCount}</strong> student failure(s) • Average Score: <strong className="text-white">{worstSubject.avgMarks}</strong>/100
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              {worstSubject.practicalFailCount > 0 && (
                <div className="bg-rose-900/50 border border-rose-700/50 px-2.5 py-1.5 rounded-lg text-rose-200 font-medium">
                  {worstSubject.practicalFailCount} Practical Fails
                </div>
              )}
              {worstSubject.theoryFailCount > 0 && (
                <div className="bg-amber-900/50 border border-amber-700/50 px-2.5 py-1.5 rounded-lg text-amber-200 font-medium">
                  {worstSubject.theoryFailCount} Theory Fails
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Grade Distribution & Subject Ranking Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Grade Distribution Histogram */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Grade Distribution Breakdown</span>
            </h3>
            <span className="text-xs text-slate-500">Total {total} students</span>
          </div>

          <div className="space-y-3">
            {(['A+', 'A', 'A-', 'B', 'C', 'D', 'F'] as const).map((grade) => {
              const count = analytics.gradeDistribution[grade];
              const pct = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
              const colors = gradeColors[grade];

              return (
                <div key={grade} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-800 w-7">{grade}</span>
                      <span className="text-[11px] text-slate-400">
                        {grade === 'A+' ? 'GP 5.00' : grade === 'A' ? 'GP 4.00' : grade === 'A-' ? 'GP 3.50' : grade === 'B' ? 'GP 3.00' : grade === 'C' ? 'GP 2.00' : grade === 'D' ? 'GP 1.00' : 'GP 0.00 (Fail)'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 font-mono">
                      <span className="font-bold text-slate-800">{count}</span>
                      <span className="text-slate-400 text-[11px]">({pct}%)</span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
                      style={{ width: `${Math.max(Number(pct), count > 0 ? 3 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subject Failure Ranking Table */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>Subject Failure & Difficulty Ranking</span>
            </h3>
            <span className="text-xs text-slate-500">Sorted by most fails</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="py-2 px-2.5">Subject</th>
                  <th className="py-2 px-2 text-center">Total Fails</th>
                  <th className="py-2 px-2 text-center">Practical Fail</th>
                  <th className="py-2 px-2 text-center">Theory Fail</th>
                  <th className="py-2 px-2 text-center">Avg Mark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analytics.worstPerformingSubjects.map((sub, idx) => (
                  <tr 
                    key={sub.subjectCode} 
                    className={`hover:bg-slate-50 ${idx === 0 ? 'bg-rose-50/40 font-semibold' : ''}`}
                  >
                    <td className="py-2.5 px-2.5">
                      <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                        {idx === 0 && <Flame className="w-3.5 h-3.5 text-rose-600" />}
                        <span>{sub.subjectName}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">{sub.subjectCode}</div>
                    </td>

                    <td className="py-2.5 px-2 text-center">
                      <span className={`px-2 py-0.5 rounded-full font-mono font-bold text-[11px] ${
                        sub.failCount > 0 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {sub.failCount}
                      </span>
                    </td>

                    <td className="py-2.5 px-2 text-center font-mono text-slate-600">
                      {sub.practicalFailCount > 0 ? (
                        <span className="text-rose-600 font-bold">{sub.practicalFailCount}</span>
                      ) : (
                        '0'
                      )}
                    </td>

                    <td className="py-2.5 px-2 text-center font-mono text-slate-600">
                      {sub.theoryFailCount > 0 ? (
                        <span className="text-amber-600 font-bold">{sub.theoryFailCount}</span>
                      ) : (
                        '0'
                      )}
                    </td>

                    <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-800">
                      {sub.avgMarks}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
