'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Award, 
  BarChart3, 
  FileCheck2, 
  UploadCloud, 
  Sparkles, 
  LayoutGrid,
  TableProperties,
  ArrowRight,
  FileSpreadsheet
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { StudentTable } from '@/components/StudentTable';
import { SimplifiedMarksheetGrid } from '@/components/SimplifiedMarksheetGrid';
import { TraceModal } from '@/components/TraceModal';
import { Student, StudentCalculatedResult } from '@/lib/types';
import { getAllStudents } from '@/lib/supabaseClient';
import { calculateStudentResult, calculateClassAnalytics } from '@/lib/gpaEngine';

export default function DashboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentForTrace, setSelectedStudentForTrace] = useState<StudentCalculatedResult | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getAllStudents();
      setStudents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const results: StudentCalculatedResult[] = useMemo(() => {
    return students.map((s) => calculateStudentResult(s));
  }, [students]);

  const analytics = useMemo(() => {
    return calculateClassAnalytics(results);
  }, [results]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Navbar studentCount={students.length} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Hero Welcome Banner */}
        <div className="no-print bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
          <div className="relative z-10 space-y-2 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-semibold border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bogura District Secondary Education System</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-100">
              School Result Processing & GPA Engine
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Deterministic, transparent grading for Bogura Secondary School. Enforces strict theory & practical dual-passing rules, exact 4th subject bonus arithmetic, and complete per-student trace audits.
            </p>
          </div>

          {/* Quick links pill row */}
          <div className="relative z-10 mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap gap-2 text-xs font-semibold">
            <Link
              href="/audit"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Office Checking Desk ({results.filter(r => r.auditFlags.length > 0).length} Flagged)</span>
            </Link>

            <Link
              href="/import?mode=batch"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition"
            >
              <UploadCloud className="w-3.5 h-3.5 text-teal-400" />
              <span>Spreadsheet Batch Import</span>
            </Link>

            <Link
              href="/import?mode=single"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 rounded-xl border border-emerald-700/80 transition font-semibold"
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>✍️ Add Single Student</span>
            </Link>

            <Link
              href="/analytics"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700 transition"
            >
              <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
              <span>Class Performance Analytics</span>
            </Link>
          </div>
        </div>

        {/* If database is empty, show clean prompt to import */}
        {students.length === 0 && !isLoading ? (
          <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-sm text-center max-w-2xl mx-auto space-y-4 my-8">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100 shadow-xs">
              <FileSpreadsheet className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">No Student Records in Database</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Your database is clean and ready. Paste or upload your student marks sheet to calculate final GPAs and letter grades with rule traces.
            </p>
            <div className="pt-2">
              <Link
                href="/import"
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/20 transition"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Go to Spreadsheet Import Desk</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* View Mode Switcher Header */}
            <div className="no-print flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Marksheet Display Style:</span>
              </div>

              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg transition-all ${
                    viewMode === 'grid'
                      ? 'bg-slate-900 text-white shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4 text-emerald-400" />
                  <span>Simplified Marksheet Grid</span>
                </button>

                <button
                  onClick={() => setViewMode('table')}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg transition-all ${
                    viewMode === 'table'
                      ? 'bg-slate-900 text-white shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <TableProperties className="w-4 h-4 text-teal-400" />
                  <span>Detailed Marks Table</span>
                </button>
              </div>
            </div>

            {/* Render View Mode */}
            {viewMode === 'grid' ? (
              <SimplifiedMarksheetGrid
                results={results}
                onSelectStudentForTrace={(res) => setSelectedStudentForTrace(res)}
              />
            ) : (
              <StudentTable
                results={results}
                onSelectStudentForTrace={(res) => setSelectedStudentForTrace(res)}
              />
            )}
          </>
        )}
      </main>

      {/* Per Student Trace Modal */}
      <TraceModal
        result={selectedStudentForTrace}
        onClose={() => setSelectedStudentForTrace(null)}
      />
    </div>
  );
}
