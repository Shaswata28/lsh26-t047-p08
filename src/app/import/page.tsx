'use client';

import React, { useState, useEffect } from 'react';
import { 
  UploadCloud, 
  UserPlus
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { SheetImporter } from '@/components/SheetImporter';
import { SingleStudentEntry } from '@/components/SingleStudentEntry';
import { Student } from '@/lib/types';
import { getAllStudents } from '@/lib/supabaseClient';

export default function ImportPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [activeTab, setActiveTab] = useState<'BATCH' | 'SINGLE'>('SINGLE');

  // Load students data
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

    // Safely parse URL search params or localStorage on client mount
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const modeParam = params.get('mode');
      if (modeParam === 'batch') {
        setActiveTab('BATCH');
      } else if (modeParam === 'single') {
        setActiveTab('SINGLE');
      } else {
        const savedTab = localStorage.getItem('bogura_active_import_tab');
        if (savedTab === 'BATCH' || savedTab === 'SINGLE') {
          setActiveTab(savedTab);
        }
      }
    }
  }, []);

  const handleTabChange = (tab: 'BATCH' | 'SINGLE') => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bogura_active_import_tab', tab);
      const url = new URL(window.location.href);
      url.searchParams.set('mode', tab.toLowerCase());
      window.history.replaceState({}, '', url.toString());
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Navbar studentCount={students.length} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Mode Selector Tabs */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold w-full sm:w-auto">
            <button
              onClick={() => handleTabChange('SINGLE')}
              className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition ${
                activeTab === 'SINGLE'
                  ? 'bg-white text-slate-900 shadow-sm font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-4 h-4 text-emerald-600" />
              <span>✍️ Single Student Mark Entry (One-by-One)</span>
            </button>

            <button
              onClick={() => handleTabChange('BATCH')}
              className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition ${
                activeTab === 'BATCH'
                  ? 'bg-white text-slate-900 shadow-sm font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UploadCloud className="w-4 h-4 text-teal-600" />
              <span>📄 Batch CSV / TSV / JSON Ingestion</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 font-semibold px-2">
            Currently Enrolled: <span className="font-mono font-bold text-slate-900">{students.length} students</span>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'SINGLE' ? (
          <SingleStudentEntry onStudentAdded={() => loadData()} />
        ) : (
          <SheetImporter onImportComplete={loadData} />
        )}
      </main>
    </div>
  );
}
