'use client';

import React, { useState, useMemo } from 'react';
import { 
  User, 
  ChevronDown, 
  Sparkles, 
  Printer, 
  Search, 
  Eye, 
  Award,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Layers,
  GraduationCap
} from 'lucide-react';
import { StudentCalculatedResult } from '@/lib/types';

interface SimplifiedMarksheetGridProps {
  results: StudentCalculatedResult[];
  onSelectStudentForTrace: (result: StudentCalculatedResult) => void;
}

export const SimplifiedMarksheetGrid: React.FC<SimplifiedMarksheetGridProps> = ({
  results,
  onSelectStudentForTrace,
}) => {
  const [selectedClassSection, setSelectedClassSection] = useState<string>('Class 10 (Sec A)');
  const [selectedTeacher, setSelectedTeacher] = useState<{ name: string; role: string }>({
    name: 'Anika Rahman',
    role: 'Lecturer / Class Teacher',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState('All');

  // Filter students based on class/section, search, and grade
  const filteredStudents = useMemo(() => {
    return results.filter((res) => {
      const { student } = res;

      // Class / Section filter
      if (selectedClassSection === 'Class 10 (Sec A)' && !(student.class === 'Class 10' && student.section === 'A')) return false;
      if (selectedClassSection === 'Class 10 (Sec B)' && !(student.class === 'Class 10' && student.section === 'B')) return false;
      if (selectedClassSection === 'Class 9 (Sec A)' && !(student.class === 'Class 9' && student.section === 'A')) return false;
      if (selectedClassSection === 'Class 9 (Sec B)' && !(student.class === 'Class 9' && student.section === 'B')) return false;
      if (selectedClassSection === 'Class 10 (All)' && student.class !== 'Class 10') return false;
      if (selectedClassSection === 'Class 9 (All)' && student.class !== 'Class 9') return false;

      // Grade Filter
      if (selectedGradeFilter !== 'All' && res.letterGrade !== selectedGradeFilter) return false;

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = student.name.toLowerCase().includes(q);
        const matchesRoll = String(student.roll).includes(q);
        const matchesReg = student.registrationNo.toLowerCase().includes(q);
        if (!matchesName && !matchesRoll && !matchesReg) return false;
      }

      return true;
    });
  }, [results, selectedClassSection, selectedGradeFilter, searchQuery]);

  const getGradePillStyle = (grade: string) => {
    switch (grade) {
      case 'A+':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-emerald-200';
      case 'A':
        return 'bg-teal-50 text-teal-800 border-teal-300 ring-teal-200';
      case 'A-':
        return 'bg-blue-50 text-blue-800 border-blue-300 ring-blue-200';
      case 'B':
        return 'bg-cyan-50 text-cyan-800 border-cyan-300 ring-cyan-200';
      case 'C':
        return 'bg-amber-50 text-amber-800 border-amber-300 ring-amber-200';
      case 'D':
        return 'bg-orange-50 text-orange-800 border-orange-300 ring-orange-200';
      case 'F':
        return 'bg-rose-50 text-rose-800 border-rose-300 ring-rose-200';
      default:
        return 'bg-slate-50 text-slate-800 border-slate-300';
    }
  };

  const getAvatarInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-300/80 shadow-md p-6 sm:p-10 space-y-6">
      
      {/* Top Header Bar (Matching Wireframe Style) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-300">
        
        {/* Left: Teacher / Lecturer Avatar & Info */}
        <div className="flex items-center space-x-3.5">
          <div className="w-14 h-14 rounded-full border-2 border-slate-800 bg-slate-100 flex items-center justify-center text-slate-800 font-bold shadow-inner text-base">
            <User className="w-7 h-7 text-slate-700" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 leading-tight">
              {selectedTeacher.name}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {selectedTeacher.role} • Bogura Secondary School
            </p>
          </div>
        </div>

        {/* Right: Controls & Class Selector */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-start sm:justify-end">
          
          {/* Search box */}
          <div className="relative min-w-[180px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search student..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-800"
            />
          </div>

          {/* Class Dropdown Box (Exact Wireframe Style: "Class A v") */}
          <div className="relative">
            <select
              value={selectedClassSection}
              onChange={(e) => setSelectedClassSection(e.target.value)}
              className="appearance-none bg-white border-2 border-slate-800 text-slate-900 font-bold text-xs rounded-xl px-4 py-2 pr-8 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer shadow-sm"
            >
              <option value="Class 10 (Sec A)">Class 10 - Section A</option>
              <option value="Class 10 (Sec B)">Class 10 - Section B</option>
              <option value="Class 9 (Sec A)">Class 9 - Section A</option>
              <option value="Class 9 (Sec B)">Class 9 - Section B</option>
              <option value="Class 10 (All)">Class 10 (All Sections)</option>
              <option value="Class 9 (All)">Class 9 (All Sections)</option>
              <option value="All">All Classes & Sections</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-800 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Print Button */}
          <button
            onClick={() => window.print()}
            title="Print Simplified Marksheet Grid"
            className="p-2 border-2 border-slate-800 hover:bg-slate-900 hover:text-white text-slate-800 rounded-xl transition shadow-sm"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid Sub-header with Count */}
      <div className="flex items-center justify-between text-xs text-slate-600 px-1">
        <div>
          Showing <span className="font-bold text-slate-900">{filteredStudents.length}</span> students in{' '}
          <strong className="text-slate-900">{selectedClassSection}</strong>
        </div>

        {/* Grade Quick Filter Pills */}
        <div className="hidden md:flex items-center space-x-1 text-[11px]">
          <span className="text-slate-400 mr-1 font-medium">Filter Grade:</span>
          {['All', 'A+', 'A', 'A-', 'B', 'C', 'D', 'F'].map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGradeFilter(g)}
              className={`px-2 py-0.5 rounded-md font-semibold transition ${
                selectedGradeFilter === g
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* 3-Column Simplified Student Cards Grid (Matching Wireframe) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredStudents.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
            <p className="font-semibold text-sm text-slate-600">No students found in this category.</p>
            <p className="text-xs text-slate-400 mt-1">Try changing the class or clearing the search query.</p>
          </div>
        ) : (
          filteredStudents.map((res) => {
            const { student } = res;
            const initials = getAvatarInitials(student.name);

            return (
              <div
                key={student.id}
                onClick={() => onSelectStudentForTrace(res)}
                className="group relative bg-white hover:bg-slate-50/80 border-2 border-slate-800 rounded-2xl p-4 sm:p-5 transition-all duration-200 hover:shadow-lg cursor-pointer flex items-center justify-between"
              >
                {/* Left: Avatar Circle + Student Info */}
                <div className="flex items-center space-x-3.5 min-w-0 pr-2">
                  {/* Circle Avatar (Wireframe circle) */}
                  <div className={`w-12 h-12 rounded-full border-2 border-slate-800 shrink-0 flex items-center justify-center font-bold text-xs transition-transform group-hover:scale-105 ${
                    res.isPassed ? 'bg-slate-100 text-slate-900' : 'bg-rose-50 text-rose-900 border-rose-900'
                  }`}>
                    {initials}
                  </div>

                  {/* Middle Text: Name, Roll/ID, GPA */}
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-950 text-sm truncate group-hover:text-emerald-700 transition-colors">
                      {student.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {student.registrationNo.replace('REG2026-', '2230')}
                      <span className="text-slate-400 mx-1">•</span>
                      <span>Roll #{student.roll}</span>
                    </p>
                    <p className="text-xs font-extrabold text-slate-900 mt-0.5 font-mono flex items-center space-x-1">
                      <span>GPA {res.finalGPA.toFixed(2)}</span>
                      {res.optionalBonusGP > 0 && res.isPassed && (
                        <span className="text-[10px] text-purple-700 font-semibold">(+{res.optionalBonusGP.toFixed(1)})</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Right / Top-Right: Letter Grade Pill (e.g. "A+" in pill) */}
                <div className="shrink-0 flex flex-col items-end justify-between self-stretch">
                  <div className={`px-3 py-1 rounded-full border-2 text-xs font-black tracking-wider uppercase shadow-sm transition-transform group-hover:scale-110 ${
                    res.letterGrade === 'F' 
                      ? 'border-rose-900 text-rose-900 bg-rose-50' 
                      : 'border-slate-800 text-slate-900 bg-white'
                  }`}>
                    {res.letterGrade}
                  </div>

                  {/* Status Indicator */}
                  <div className="text-[10px] font-bold text-slate-400 mt-auto pt-2">
                    {res.isPassed ? (
                      <span className="text-emerald-700">PASS</span>
                    ) : res.hasAbsent ? (
                      <span className="text-slate-600">ABS</span>
                    ) : (
                      <span className="text-rose-600">FAIL</span>
                    )}
                  </div>
                </div>

                {/* Edge Case Sparkle */}
                {student.edgeCaseTag && (
                  <div className="absolute -top-2.5 left-4 px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-[9px] font-bold shadow-xs">
                    {student.edgeCaseTag.split(':')[0]}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center space-x-2">
          <GraduationCap className="w-4 h-4 text-slate-700" />
          <span>Click any student card to open the complete deterministic calculation trace.</span>
        </div>
        <div className="text-[11px] font-mono text-slate-400">
          Bogura GPA Engine • Simplified Layout
        </div>
      </div>
    </div>
  );
};
