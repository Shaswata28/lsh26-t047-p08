'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  FileCheck2, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  UserX, 
  ShieldAlert, 
  Printer, 
  Search, 
  Eye,
  CheckSquare,
  Square,
  HelpCircle,
  TrendingUp,
  Award
} from 'lucide-react';
import { StudentCalculatedResult } from '@/lib/types';

interface AnomalyCheckerProps {
  results: StudentCalculatedResult[];
  onSelectStudentForTrace: (result: StudentCalculatedResult) => void;
}

export const AnomalyChecker: React.FC<AnomalyCheckerProps> = ({
  results,
  onSelectStudentForTrace,
}) => {
  const [activeTab, setActiveTab] = useState<
    'ALL' | 'OPTIONAL_BOOST' | 'PRACTICAL_FAIL' | 'THEORY_FAIL' | 'ABSENT_RECORD' | 'HIGH_AVG_FAIL'
  >('ALL');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [verifiedStudentIds, setVerifiedStudentIds] = useState<Set<string>>(new Set());
  const [teacherNotes, setTeacherNotes] = useState<Record<string, string>>({});

  // Filter students with anomalies
  const flaggedResults = results.filter(r => r.auditFlags.length > 0);

  const filteredItems = flaggedResults.filter((res) => {
    // Filter by tab
    if (activeTab === 'OPTIONAL_BOOST' && !res.hasOptionalBoost) return false;
    if (activeTab === 'PRACTICAL_FAIL' && !res.hasPracticalFail) return false;
    if (activeTab === 'THEORY_FAIL' && !res.hasTheoryFail) return false;
    if (activeTab === 'ABSENT_RECORD' && !res.hasAbsent) return false;
    if (activeTab === 'HIGH_AVG_FAIL' && !res.hasHighAvgCompulsoryFail) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesName = res.student.name.toLowerCase().includes(q);
      const matchesRoll = String(res.student.roll).includes(q);
      if (!matchesName && !matchesRoll) return false;
    }

    return true;
  });

  const toggleVerified = (id: string) => {
    setVerifiedStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handlePrintAudit = () => {
    window.print();
  };

  const counts = {
    all: flaggedResults.length,
    optionalBoost: results.filter(r => r.hasOptionalBoost).length,
    practicalFail: results.filter(r => r.hasPracticalFail).length,
    theoryFail: results.filter(r => r.hasTheoryFail).length,
    absent: results.filter(r => r.hasAbsent).length,
    highAvgFail: results.filter(r => r.hasHighAvgCompulsoryFail).length,
  };

  const verifiedCount = flaggedResults.filter(r => verifiedStudentIds.has(r.student.id)).length;
  const pendingCount = flaggedResults.length - verifiedCount;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 text-white shadow-lg border border-slate-700">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
                <FileCheck2 className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-extrabold tracking-tight">
                Pre-Publication Office Checking Desk
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Every student whose result was affected by the optional subject rule, practical dual-pass failure, absent mark, or high-average compulsory fail is flagged here for manual teacher sign-off before results publication.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrintAudit}
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-semibold shadow-sm transition border border-slate-600"
            >
              <Printer className="w-4 h-4" />
              <span>Print Audit Sheet</span>
            </button>
          </div>
        </div>

        {/* Verification Progress Bar */}
        <div className="mt-6 pt-4 border-t border-slate-700/80 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700">
            <div className="text-[11px] text-slate-400 uppercase font-semibold">Total Flagged Cases</div>
            <div className="text-xl font-bold text-white mt-0.5">{counts.all}</div>
          </div>
          <div className="bg-emerald-950/40 rounded-xl p-3 border border-emerald-800/40">
            <div className="text-[11px] text-emerald-300 uppercase font-semibold">Verified by Teachers</div>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">{verifiedCount}</div>
          </div>
          <div className="bg-amber-950/40 rounded-xl p-3 border border-amber-800/40">
            <div className="text-[11px] text-amber-300 uppercase font-semibold">Pending Verification</div>
            <div className="text-xl font-bold text-amber-400 mt-0.5">{pendingCount}</div>
          </div>
          <div className="bg-purple-950/40 rounded-xl p-3 border border-purple-800/40">
            <div className="text-[11px] text-purple-300 uppercase font-semibold">4th Subject Boosts</div>
            <div className="text-xl font-bold text-purple-400 mt-0.5">{counts.optionalBoost}</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 text-xs">
            {[
              { key: 'ALL', label: 'All Flagged', count: counts.all, icon: AlertTriangle },
              { key: 'OPTIONAL_BOOST', label: '4th Subject Boost', count: counts.optionalBoost, icon: Sparkles },
              { key: 'PRACTICAL_FAIL', label: 'Practical Fails', count: counts.practicalFail, icon: ShieldAlert },
              { key: 'THEORY_FAIL', label: 'Theory Fails', count: counts.theoryFail, icon: AlertTriangle },
              { key: 'ABSENT_RECORD', label: 'Absent Records', count: counts.absent, icon: UserX },
              { key: 'HIGH_AVG_FAIL', label: 'High Avg Compulsory Fail', count: counts.highAvgFail, icon: ShieldAlert },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-emerald-500 text-slate-950' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search flagged roll or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Verification Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-200 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3 text-center">Verify</th>
                <th className="py-3 px-3">Roll & Student</th>
                <th className="py-3 px-3">Class / Group</th>
                <th className="py-3 px-4">Triggered Anomaly & Explanation</th>
                <th className="py-3 px-3 text-center">GPA Impact</th>
                <th className="py-3 px-3 text-center">Result Status</th>
                <th className="py-3 px-3">Teacher Audit Note</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="font-semibold text-sm">No flagged cases in this category.</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((res) => {
                  const isVerified = verifiedStudentIds.has(res.student.id);

                  return (
                    <tr 
                      key={res.student.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isVerified ? 'bg-emerald-50/20' : ''
                      }`}
                    >
                      {/* Verify Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => toggleVerified(res.student.id)}
                          className="text-slate-400 hover:text-emerald-600 transition"
                        >
                          {isVerified ? (
                            <CheckSquare className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-300" />
                          )}
                        </button>
                      </td>

                      {/* Roll & Student */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">
                          #{res.student.roll} {res.student.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {res.student.registrationNo}
                        </div>
                      </td>

                      {/* Class */}
                      <td className="py-3 px-3 text-slate-600">
                        <div>{res.student.class} ({res.student.section})</div>
                        <div className="text-[10px] text-slate-400">{res.student.group}</div>
                      </td>

                      {/* Anomaly Details */}
                      <td className="py-3 px-4">
                        <div className="space-y-1.5">
                          {res.auditFlags.map((flag, idx) => (
                            <div 
                              key={idx}
                              className={`p-2 rounded-lg text-[11px] border leading-tight ${
                                flag.severity === 'danger'
                                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                                  : flag.severity === 'warning'
                                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                                  : flag.severity === 'success'
                                  ? 'bg-purple-50 border-purple-200 text-purple-900'
                                  : 'bg-slate-50 border-slate-200 text-slate-800'
                              }`}
                            >
                              <div className="font-bold flex items-center space-x-1">
                                <span>{flag.label}</span>
                              </div>
                              <div className="mt-0.5">{flag.description}</div>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* GPA Impact */}
                      <td className="py-3 px-3 text-center">
                        <div className="font-mono font-extrabold text-sm text-slate-900">
                          {res.finalGPA.toFixed(2)}
                        </div>
                        <div className="text-[10px] font-bold text-slate-600">
                          Grade {res.letterGrade}
                        </div>
                        {res.optionalBonusGP > 0 && res.isPassed && (
                          <div className="text-[9px] text-purple-700 font-semibold mt-0.5">
                            +{res.optionalBonusGP.toFixed(2)} 4th bonus
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        {res.isPassed ? (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Passed
                          </span>
                        ) : res.hasAbsent ? (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-800">
                            Absent
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                            Failed
                          </span>
                        )}
                      </td>

                      {/* Teacher Audit Note */}
                      <td className="py-3 px-3">
                        <input
                          type="text"
                          placeholder="Add teacher verification notes..."
                          value={teacherNotes[res.student.id] || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setTeacherNotes(prev => ({ ...prev, [res.student.id]: val }));
                          }}
                          className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => onSelectStudentForTrace(res)}
                          title="Open Full Trace"
                          className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition border border-slate-200"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
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
