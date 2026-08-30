'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { SheetImporter } from '@/components/SheetImporter';
import { Student } from '@/lib/types';
import { getAllStudents } from '@/lib/supabaseClient';

export default function ImportPage() {
  const [students, setStudents] = useState<Student[]>([]);

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

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Navbar studentCount={students.length} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SheetImporter onImportComplete={loadData} />
      </main>
    </div>
  );
}
