'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from '@/components/Navbar';
import { AnomalyChecker } from '@/components/AnomalyChecker';
import { TraceModal } from '@/components/TraceModal';
import { Student, StudentCalculatedResult } from '@/lib/types';
import { getAllStudents } from '@/lib/supabaseClient';
import { calculateStudentResult } from '@/lib/gpaEngine';

export default function AuditPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentForTrace, setSelectedStudentForTrace] = useState<StudentCalculatedResult | null>(null);

  const loadData = async () => {
    try {
      const data = await getAllStudents();
      setStudents(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const results: StudentCalculatedResult[] = useMemo(() => {
    return students.map((s) => calculateStudentResult(s));
  }, [students]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Navbar studentCount={students.length} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnomalyChecker
          results={results}
          onSelectStudentForTrace={(res) => setSelectedStudentForTrace(res)}
        />
      </main>

      <TraceModal
        result={selectedStudentForTrace}
        onClose={() => setSelectedStudentForTrace(null)}
      />
    </div>
  );
}
