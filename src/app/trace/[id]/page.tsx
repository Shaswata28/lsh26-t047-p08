'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, RefreshCw, Calculator, Printer } from 'lucide-react';
import { StudentCalculatedResult } from '@/lib/types';
import { getAllStudents } from '@/lib/supabaseClient';
import { calculateStudentResult } from '@/lib/gpaEngine';
import { TraceModal } from '@/components/TraceModal';

export default function TracePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [studentResult, setStudentResult] = useState<StudentCalculatedResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStudent() {
      if (!id) return;
      try {
        const all = await getAllStudents();
        const found = all.find(s => s.id === id || String(s.roll) === id);
        if (found) {
          const res = calculateStudentResult(found);
          setStudentResult(res);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadStudent();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="flex items-center space-x-2 text-slate-600 text-sm font-semibold">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
          <span>Loading Deterministic Calculation Trace...</span>
        </div>
      </div>
    );
  }

  if (!studentResult) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-md text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Student Record Not Found</h2>
          <p className="text-xs text-slate-500">
            Could not find student calculation trace for identifier: <strong className="font-mono">{id}</strong>.
          </p>
          <Link
            href="/"
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <TraceModal
        result={studentResult}
        onClose={() => router.push('/')}
      />
    </div>
  );
}
