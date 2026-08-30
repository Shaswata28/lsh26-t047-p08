'use client';

import React, { useState } from 'react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Sparkles, 
  Download, 
  RefreshCw,
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import { parseAndValidateSpreadsheetText, getSampleCsvTemplate } from '@/lib/validator';
import { ImportValidationResult, Student } from '@/lib/types';
import { saveAllStudents, getAllStudents } from '@/lib/supabaseClient';

interface SheetImporterProps {
  onImportComplete?: () => void;
}

export const SheetImporter: React.FC<SheetImporterProps> = ({ onImportComplete }) => {
  const [pastedText, setPastedText] = useState('');
  const [selectedClass, setSelectedClass] = useState<'Class 10' | 'Class 9'>('Class 10');
  const [validationResult, setValidationResult] = useState<ImportValidationResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const sampleValidCsv = `roll,name,gender,section,ban,eng,mat,phy_th,phy_pr,che_th,che_pr,bio_th,bio_pr,hma_th,hma_pr
301,Muntasir Billah,Male,A,85,78,92,64,24,62,23,66,24,70,25
302,Sumaiya Akter,Female,A,74,70,82,58,22,54,20,58,21,62,23
303,Abdur Rahman,Male,B,65,60,75,48,19,45,18,50,20,55,21
304,Fahmida Sultana,Female,B,88,84,95,70,25,68,24,71,25,72,25`;

  const sampleErrorProneCsv = `roll,name,gender,section,ban,eng,mat,phy_th,phy_pr,che_th,che_pr,bio_th,bio_pr,hma_th,hma_pr
305,Valid Student One,Male,A,82,75,88,60,22,58,21,62,23,65,24
,Missing Roll Student,Female,A,70,68,75,50,20,48,19,52,20,55,21
307,,Male,A,65,60,70,45,18,44,17,48,19,50,20
308,Impossible Physics Practical,Male,A,80,78,90,65,35,60,22,64,23,68,24
309,Negative Mark Student,Female,B,75,-10,85,55,20,52,21,56,22,60,22
310,Text in Mark Field,Male,B,80,PASS,90,60,22,58,21,62,23,65,24
305,Duplicate Roll Student,Male,B,78,72,84,56,21,54,20,58,22,62,23`;

  const handleValidate = () => {
    if (!pastedText.trim()) {
      alert('Please paste or upload spreadsheet data first.');
      return;
    }

    const res = parseAndValidateSpreadsheetText(pastedText, selectedClass);
    setValidationResult(res);
    setSuccessMessage(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        setPastedText(content);
        const res = parseAndValidateSpreadsheetText(content, selectedClass);
        setValidationResult(res);
        setSuccessMessage(null);
      }
    };
    reader.readAsText(file);
  };

  const handleCommitImport = async () => {
    if (!validationResult || validationResult.validRows.length === 0) return;

    setIsImporting(true);
    try {
      const existing = await getAllStudents();
      
      // Merge or append valid students
      const updatedList = [...existing];
      for (const newStudent of validationResult.validRows) {
        const idx = updatedList.findIndex(s => s.roll === newStudent.roll && s.class === newStudent.class);
        if (idx >= 0) {
          updatedList[idx] = newStudent;
        } else {
          updatedList.push(newStudent);
        }
      }

      const saveRes = await saveAllStudents(updatedList);
      if (saveRes.success) {
        setSuccessMessage(`Successfully saved ${validationResult.validRows.length} students to connected Supabase database!`);
        if (onImportComplete) onImportComplete();
      } else {
        alert(`Supabase error: ${saveRes.error || 'Could not save to Supabase'}. Ensure the 'students' table exists in your Supabase project.`);
      }
    } catch (e: any) {
      console.error(e);
      alert(`Failed to save students to Supabase: ${e.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([getSampleCsvTemplate()], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'bogura_school_marks_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
                <UploadCloud className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold">
                Spreadsheet Marks Ingestion & Rejection Desk
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Paste raw data directly from Microsoft Excel or Google Sheets, or upload a CSV file. The engine validates every mark against maximum limits (Theory 75, Practical 25, Total 100), detects missing entries, and reports exact reasons for rejected rows.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={downloadTemplate}
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Download CSV Template</span>
            </button>
          </div>
        </div>

        {/* Quick Demo Presets */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Load Preset Demos:</span>
          <button
            onClick={() => {
              setPastedText(sampleValidCsv);
              setValidationResult(parseAndValidateSpreadsheetText(sampleValidCsv, selectedClass));
              setSuccessMessage(null);
            }}
            className="px-2.5 py-1 bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 rounded-lg border border-emerald-800/60 transition font-medium"
          >
            ✅ Load 100% Valid Sample (4 Students)
          </button>
          <button
            onClick={() => {
              setPastedText(sampleErrorProneCsv);
              setValidationResult(parseAndValidateSpreadsheetText(sampleErrorProneCsv, selectedClass));
              setSuccessMessage(null);
            }}
            className="px-2.5 py-1 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded-lg border border-rose-800/60 transition font-medium"
          >
            ⚠️ Load Error-Prone Sample (Rejections Demo)
          </button>
        </div>
      </div>

      {/* Main Input Grid */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Target Class:
            </label>
            <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
              {(['Class 10', 'Class 9'] as const).map((cls) => (
                <button
                  key={cls}
                  onClick={() => setSelectedClass(cls)}
                  className={`px-3 py-1 rounded-md transition ${
                    selectedClass === cls
                      ? 'bg-white text-slate-900 shadow-sm font-bold'
                      : 'text-slate-600'
                  }`}
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>

          {/* File Upload Input */}
          <div className="flex items-center space-x-2">
            <label className="cursor-pointer inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-medium border border-slate-300 transition">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Choose CSV / TSV File</span>
              <input
                type="file"
                accept=".csv, .tsv, .txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Textarea */}
        <div>
          <textarea
            rows={8}
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder={`Paste raw spreadsheet rows here...\nExample format:\nroll,name,gender,section,ban,eng,mat,phy_th,phy_pr,che_th,che_pr,bio_th,bio_pr,hma_th,hma_pr\n301,Tanvir Hassan,Male,A,82,75,90,65,24,60,22,64,23,68,24`}
            className="w-full p-4 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          />
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Accepts comma-separated, tab-separated, or pipe-delimited text.
          </span>

          <button
            onClick={handleValidate}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/20 transition flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Validate & Check Errors</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-xs font-bold text-emerald-900">{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-xs text-emerald-700 hover:underline font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Validation Results Display */}
      {validationResult && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase">Total Rows Scanned</div>
                <div className="text-2xl font-bold text-slate-900 mt-0.5">{validationResult.totalRows}</div>
              </div>
              <div className="p-3 bg-slate-100 rounded-xl text-slate-600 font-mono">
                {validationResult.totalRows}
              </div>
            </div>

            <div className="bg-emerald-50/80 rounded-2xl p-4 border border-emerald-200 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-emerald-700 uppercase">Valid Rows Ready</div>
                <div className="text-2xl font-bold text-emerald-900 mt-0.5">{validationResult.validRows.length}</div>
              </div>
              <div className="p-3 bg-emerald-100 rounded-xl text-emerald-700 font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-rose-50/80 rounded-2xl p-4 border border-rose-200 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-rose-700 uppercase">Rejected Rows</div>
                <div className="text-2xl font-bold text-rose-900 mt-0.5">{validationResult.rejectedRows.length}</div>
              </div>
              <div className="p-3 bg-rose-100 rounded-xl text-rose-700 font-bold">
                <XCircle className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* REJECTED ROWS REPORT (Bonus requirement) */}
          {validationResult.rejectedRows.length > 0 && (
            <div className="bg-white rounded-2xl border border-rose-200 shadow-sm overflow-hidden">
              <div className="bg-rose-600 text-white px-6 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="font-bold text-sm">
                    Rejection Report ({validationResult.rejectedRows.length} issues found)
                  </h3>
                </div>
                <span className="text-xs bg-rose-700 px-2.5 py-0.5 rounded-full font-semibold">
                  These rows were blocked from import
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-rose-50 text-rose-900 font-semibold uppercase tracking-wider text-[11px] border-b border-rose-200">
                    <tr>
                      <th className="py-2.5 px-3 text-center">Row #</th>
                      <th className="py-2.5 px-3">Student Roll / Name</th>
                      <th className="py-2.5 px-3">Field</th>
                      <th className="py-2.5 px-3">Invalid Value</th>
                      <th className="py-2.5 px-4">Exact Reason for Rejection</th>
                      <th className="py-2.5 px-4">Actionable Fix</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-100">
                    {validationResult.rejectedRows.map((rej, idx) => (
                      <tr key={idx} className="hover:bg-rose-50/50">
                        <td className="py-3 px-3 text-center font-mono font-bold text-rose-700">
                          #{rej.rowNumber}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-900">{rej.studentName || 'N/A'}</div>
                          <div className="text-[10px] text-slate-500 font-mono">Roll: {rej.studentRoll || 'N/A'}</div>
                        </td>
                        <td className="py-3 px-3 font-semibold text-slate-700">
                          {rej.field}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-rose-700">
                          {String(rej.invalidValue)}
                        </td>
                        <td className="py-3 px-4 text-rose-950 font-medium">
                          {rej.reason}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {rej.suggestion}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VALID ROWS PREVIEW & COMMIT ACTION */}
          {validationResult.validRows.length > 0 && (
            <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm overflow-hidden">
              <div className="bg-emerald-700 text-white px-6 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <h3 className="font-bold text-sm">
                    Valid Students Ready for Import ({validationResult.validRows.length})
                  </h3>
                </div>

                <button
                  onClick={handleCommitImport}
                  disabled={isImporting}
                  className="inline-flex items-center space-x-1.5 px-4 py-1.5 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl text-xs font-bold shadow transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{isImporting ? 'Saving...' : `Import ${validationResult.validRows.length} Students Now`}</span>
                </button>
              </div>

              <div className="overflow-x-auto max-h-72">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Roll</th>
                      <th className="py-2.5 px-4">Name</th>
                      <th className="py-2.5 px-3">Class</th>
                      <th className="py-2.5 px-2 text-center">BAN</th>
                      <th className="py-2.5 px-2 text-center">ENG</th>
                      <th className="py-2.5 px-2 text-center">MAT</th>
                      <th className="py-2.5 px-2 text-center">PHY (T+P)</th>
                      <th className="py-2.5 px-2 text-center">CHE (T+P)</th>
                      <th className="py-2.5 px-2 text-center">BIO (T+P)</th>
                      <th className="py-2.5 px-2 text-center">HMA (4th)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {validationResult.validRows.map((s) => (
                      <tr key={s.id} className="hover:bg-emerald-50/30 font-mono">
                        <td className="py-2.5 px-3 font-bold text-slate-900 font-sans">#{s.roll}</td>
                        <td className="py-2.5 px-4 font-sans font-semibold text-slate-800">{s.name}</td>
                        <td className="py-2.5 px-3 font-sans text-slate-600">{s.class} ({s.section})</td>
                        <td className="py-2.5 px-2 text-center">{s.marks.BAN?.theoryMark ?? '-'}</td>
                        <td className="py-2.5 px-2 text-center">{s.marks.ENG?.theoryMark ?? '-'}</td>
                        <td className="py-2.5 px-2 text-center">{s.marks.MAT?.theoryMark ?? '-'}</td>
                        <td className="py-2.5 px-2 text-center">{s.marks.PHY?.theoryMark}/{s.marks.PHY?.practicalMark}</td>
                        <td className="py-2.5 px-2 text-center">{s.marks.CHE?.theoryMark}/{s.marks.CHE?.practicalMark}</td>
                        <td className="py-2.5 px-2 text-center">{s.marks.BIO?.theoryMark}/{s.marks.BIO?.practicalMark}</td>
                        <td className="py-2.5 px-2 text-center text-purple-700 font-bold">{s.marks.HMA?.theoryMark}/{s.marks.HMA?.practicalMark}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
