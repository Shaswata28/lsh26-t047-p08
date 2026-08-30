'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Sparkles,
  Eye,
  Printer,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  UserX,
  FileSpreadsheet
} from 'lucide-react';
import { StudentCalculatedResult, Student } from '@/lib/types';
import { DEFAULT_SUBJECT_CONFIGS } from '@/lib/gpaEngine';

interface StudentTableProps {
  results: StudentCalculatedResult[];
  onSelectStudentForTrace: (result: StudentCalculatedResult) => void;
}

export const StudentTable: React.FC<StudentTableProps> = ({
  results,
  onSelectStudentForTrace,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<'All' | 'Class 9' | 'Class 10'>('All');
  const [selectedGrade, setSelectedGrade] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedEdgeFilter, setSelectedEdgeFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<'roll' | 'name' | 'gpa' | 'marks'>('roll');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filter & Search Logic
  const filteredResults = useMemo(() => {
    return results.filter((res) => {
      const { student } = res;

      // Class Filter
      if (selectedClass !== 'All' && student.class !== selectedClass) return false;

      // Grade Filter
      if (selectedGrade !== 'All' && res.letterGrade !== selectedGrade) return false;

      // Status Filter
      if (selectedStatus === 'PASSED' && !res.isPassed) return false;
      if (selectedStatus === 'FAILED' && res.isPassed) return false;
      if (selectedStatus === 'ABSENT' && !res.hasAbsent) return false;
      if (selectedStatus === 'EDGE_CASES' && !student.edgeCaseTag) return false;

      // Edge Case specific filter
      if (selectedEdgeFilter !== 'All') {
        if (selectedEdgeFilter === 'HIGH_AVG_FAIL' && !res.hasHighAvgCompulsoryFail) return false;
        if (selectedEdgeFilter === 'PRACTICAL_FAIL' && !res.hasPracticalFail) return false;
        if (selectedEdgeFilter === 'THEORY_FAIL' && !res.hasTheoryFail) return false;
        if (selectedEdgeFilter === 'OPTIONAL_BOOST' && !res.hasOptionalBoost) return false;
        if (selectedEdgeFilter === 'ABSENT_COMPULSORY' && !(res.hasAbsent && !res.isPassed)) return false;
        if (selectedEdgeFilter === 'ALL_EDGE' && !student.edgeCaseTag) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = student.name.toLowerCase().includes(q);
        const matchesRoll = String(student.roll).includes(q);
        const matchesReg = student.registrationNo.toLowerCase().includes(q);
        const matchesEdge = student.edgeCaseTag?.toLowerCase().includes(q);
        if (!matchesName && !matchesRoll && !matchesReg && !matchesEdge) return false;
      }

      return true;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortField === 'roll') {
        comparison = a.student.roll - b.student.roll;
      } else if (sortField === 'name') {
        comparison = a.student.name.localeCompare(b.student.name);
      } else if (sortField === 'gpa') {
        comparison = a.finalGPA - b.finalGPA;
      } else if (sortField === 'marks') {
        comparison = a.totalMarksObtained - b.totalMarksObtained;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [results, searchQuery, selectedClass, selectedGrade, selectedStatus, selectedEdgeFilter, sortField, sortDirection]);

  const handleSort = (field: 'roll' | 'name' | 'gpa' | 'marks') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getGradeBadge = (grade: string) => {
    const map: Record<string, string> = {
      'A+': 'bg-emerald-100 text-emerald-800 border-emerald-300',
      'A': 'bg-teal-100 text-teal-800 border-teal-300',
      'A-': 'bg-blue-100 text-blue-800 border-blue-300',
      'B': 'bg-cyan-100 text-cyan-800 border-cyan-300',
      'C': 'bg-amber-100 text-amber-800 border-amber-300',
      'D': 'bg-orange-100 text-orange-800 border-orange-300',
      'F': 'bg-rose-100 text-rose-800 border-rose-300',
    };
    return map[grade] || 'bg-slate-100 text-slate-800 border-slate-300';
  };

  return (
    <div className="space-y-4">
      {/* Search & Main Filter Controls */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">

          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name, roll #, registration or edge tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-semibold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Class Switcher Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600">
            {(['All', 'Class 10', 'Class 9'] as const).map((cls) => {
              const count = cls === 'All'
                ? results.length
                : results.filter(r => r.student.class === cls).length;
              return (
                <button
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${selectedClass === cls
                      ? 'bg-white text-slate-900 shadow-sm font-bold'
                      : 'hover:text-slate-900'
                    }`}
                >
                  {cls === 'All' ? 'All Classes' : cls} ({count})
                </button>
              );
            })}
          </div>

          {/* Status & Grade Dropdowns */}
          <div className="flex items-center space-x-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Statuses</option>
              <option value="PASSED">Passed Only</option>
              <option value="FAILED">Failed Only</option>
              <option value="ABSENT">Absent Entries</option>
              <option value="EDGE_CASES">Edge Cases Only</option>
            </select>

            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">All Grades</option>
              <option value="A+">Grade A+ (5.0)</option>
              <option value="A">Grade A (4.0)</option>
              <option value="A-">Grade A- (3.5)</option>
              <option value="B">Grade B (3.0)</option>
              <option value="C">Grade C (2.0)</option>
              <option value="D">Grade D (1.0)</option>
              <option value="F">Grade F (Fail)</option>
            </select>
          </div>
        </div>

        {/* Hard Edge Cases Quick Filter Bar */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
            <span className="font-semibold text-slate-500 flex items-center space-x-1 shrink-0 mr-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Hard Edge Filters:</span>
            </span>

            {[
              { key: 'All', label: 'All Students' },
              { key: 'ALL_EDGE', label: 'All Edge Cases' },
              { key: 'HIGH_AVG_FAIL', label: 'High Avg Fail (EDGE-1)' },
              { key: 'PRACTICAL_FAIL', label: 'Practical Fail (EDGE-2)' },
              { key: 'THEORY_FAIL', label: 'Theory Fail (EDGE-3)' },
              { key: 'OPTIONAL_BOOST', label: '4th Subject Boost (EDGE-5)' },
              { key: 'ABSENT_COMPULSORY', label: 'Absent Record (EDGE-6)' },
            ].map((filter) => {
              const isSelected = selectedEdgeFilter === filter.key;
              return (
                <button
                  key={filter.key}
                  onClick={() => setSelectedEdgeFilter(filter.key)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium shrink-0 transition-all border ${isSelected
                      ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                    }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-600">
        <div>
          Showing <span className="font-bold text-slate-900">{filteredResults.length}</span> of {results.length} students
          {selectedClass !== 'All' && ` in ${selectedClass}`}
        </div>
        <div className="text-[11px] text-slate-400">
          Click on any row or Trace button to inspect exact rule calculation
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-200 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th
                  onClick={() => handleSort('roll')}
                  className="py-3 px-3 cursor-pointer hover:text-emerald-400 transition"
                >
                  <div className="flex items-center space-x-1">
                    <span>Roll</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-4 cursor-pointer hover:text-emerald-400 transition"
                >
                  <div className="flex items-center space-x-1">
                    <span>Student Info</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th className="py-3 px-2 text-center">Bangla</th>
                <th className="py-3 px-2 text-center">English</th>
                <th className="py-3 px-2 text-center">Math</th>
                <th className="py-3 px-2 text-center">Physics (T+P)</th>
                <th className="py-3 px-2 text-center">Chem (T+P)</th>
                <th className="py-3 px-2 text-center">Bio (T+P)</th>
                <th className="py-3 px-2 text-center bg-purple-900/30 text-purple-200">4th Optional (HMT/AGR/REL)</th>
                <th
                  onClick={() => handleSort('marks')}
                  className="py-3 px-3 text-center cursor-pointer hover:text-emerald-400 transition"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>Total</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('gpa')}
                  className="py-3 px-3 text-center cursor-pointer hover:text-emerald-400 transition"
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span>GPA (Grade)</span>
                    <ArrowUpDown className="w-3 h-3 opacity-60" />
                  </div>
                </th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-4 text-center">Audit Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-12 text-center text-slate-500">
                    <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-sm">No students match your filter criteria.</p>
                    <p className="text-xs text-slate-400 mt-1">Try clearing filters or search query.</p>
                  </td>
                </tr>
              ) : (
                filteredResults.map((res) => {
                  const { student, subjectResults } = res;
                  const getSub = (code: string) => subjectResults.find(s => s.subjectCode === code);

                  const ban = getSub('BAN');
                  const eng = getSub('ENG');
                  const mat = getSub('MAT');
                  const phy = getSub('PHY');
                  const che = getSub('CHE');
                  const bio = getSub('BIO');
                  const opt = subjectResults.find(s => s.isOptional) || getSub('HMT') || getSub('AGR') || getSub('REL') || getSub('HMA');

                  const renderSubjectPill = (sub?: (typeof subjectResults)[0], isOpt = false) => {
                    if (!sub) return <span>-</span>;
                    if (sub.isAbsent) {
                      return (
                        <span className="inline-block px-1.5 py-0.5 bg-rose-100 text-rose-700 font-bold rounded text-[10px]" title="Absent">
                          ABS
                        </span>
                      );
                    }

                    const isFail = !sub.isPassed;
                    return (
                      <div className="inline-flex flex-col items-center">
                        <div className="flex items-center space-x-0.5">
                          <span className={`font-mono font-semibold text-[11px] ${isFail ? 'text-rose-600 font-bold' : 'text-slate-800'
                            }`}>
                            {sub.totalMark}
                          </span>
                          {isOpt && (
                            <span className="text-[9px] font-mono text-purple-700 font-semibold">
                              ({sub.subjectCode})
                            </span>
                          )}
                        </div>
                        <span className={`text-[9px] px-1 rounded font-mono ${isFail ? 'bg-rose-100 text-rose-700 font-bold' : isOpt && sub.optionalAddedGP > 0 ? 'bg-purple-100 text-purple-700 font-bold' : 'text-slate-500'
                          }`}>
                          {isOpt && sub.optionalAddedGP > 0 ? `+${sub.optionalAddedGP.toFixed(1)}` : `${sub.gradePoint.toFixed(1)}`}
                        </span>
                      </div>
                    );
                  };

                  return (
                    <tr
                      key={student.id}
                      className={`hover:bg-slate-50/80 transition-colors ${!res.isPassed ? 'bg-rose-50/30' : res.finalGPA === 5.0 ? 'bg-emerald-50/30' : ''
                        }`}
                    >
                      {/* Roll */}
                      <td className="py-3 px-3 font-mono font-bold text-slate-800">
                        #{student.roll}
                      </td>

                      {/* Student Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => onSelectStudentForTrace(res)}
                            className="font-bold text-slate-900 hover:text-emerald-600 transition text-left"
                          >
                            {student.name}
                          </button>
                        </div>
                        <div className="flex items-center space-x-2 mt-0.5 text-[10px] text-slate-500">
                          <span>{student.class} ({student.section})</span>
                          <span>•</span>
                          <span>{student.gender}</span>
                          <span>•</span>
                          <span className="font-mono">{student.registrationNo}</span>
                        </div>
                        {student.edgeCaseTag && (
                          <div className="mt-1">
                            <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-200">
                              <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                              <span>{student.edgeCaseTag.split(':')[0]}</span>
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Marks */}
                      <td className="py-3 px-2 text-center">{renderSubjectPill(ban)}</td>
                      <td className="py-3 px-2 text-center">{renderSubjectPill(eng)}</td>
                      <td className="py-3 px-2 text-center">{renderSubjectPill(mat)}</td>
                      <td className="py-3 px-2 text-center">{renderSubjectPill(phy)}</td>
                      <td className="py-3 px-2 text-center">{renderSubjectPill(che)}</td>
                      <td className="py-3 px-2 text-center">{renderSubjectPill(bio)}</td>
                      <td className="py-3 px-2 text-center bg-purple-50/40">{renderSubjectPill(opt, true)}</td>

                      {/* Total Marks */}
                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-700">
                        {res.totalMarksObtained}
                      </td>

                      {/* GPA & Letter Grade */}
                      <td className="py-3 px-3 text-center">
                        <div className="inline-flex items-center space-x-1.5">
                          <span className="font-mono font-extrabold text-sm text-slate-900">
                            {res.finalGPA.toFixed(2)}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getGradeBadge(res.letterGrade)}`}>
                            {res.letterGrade}
                          </span>
                        </div>
                        {res.optionalBonusGP > 0 && res.isPassed && (
                          <div className="text-[9px] text-purple-700 font-semibold">
                            (incl +{res.optionalBonusGP.toFixed(2)} 4th bonus)
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        {res.isPassed ? (
                          <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Passed</span>
                          </span>
                        ) : res.hasAbsent ? (
                          <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded-full">
                            <UserX className="w-3 h-3" />
                            <span>Absent</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                            <XCircle className="w-3 h-3" />
                            <span>Failed</span>
                          </span>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => onSelectStudentForTrace(res)}
                            title="Inspect Rule-by-rule Trace"
                            className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition border border-slate-200"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <Link
                            href={`/marksheet/${student.id}`}
                            title="Print Official Marksheet"
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition border border-slate-200"
                          >
                            <Printer className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
