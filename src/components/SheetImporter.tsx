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
  Database
} from 'lucide-react';
import { parseAndValidateAnyInput, getSampleCsvTemplate } from '@/lib/validator';
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
  const [fileName, setFileName] = useState<string | null>(null);

  const handleValidate = () => {
    if (!pastedText.trim()) {
      alert('Please upload or paste a CSV/Excel file first.');
      return;
    }

    const res = parseAndValidateAnyInput(pastedText, selectedClass);
    setValidationResult(res);
    setSuccessMessage(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        setPastedText(content);
        setValidationResult(null); // Clear previous validation until Validate button is clicked
        setSuccessMessage(null);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCommitImport = async () => {
    if (!validationResult || validationResult.validRows.length === 0) return;

    setIsImporting(true);
    try {
      const existing = await getAllStudents();
      
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
        setSuccessMessage(`Successfully saved ${validationResult.validRows.length} valid students to the database!`);
        if (onImportComplete) onImportComplete();
      } else {
        alert(`Database error: ${saveRes.error || 'Could not save students'}`);
      }
    } catch (e: any) {
      console.error(e);
      alert(`Failed to save students: ${e.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([getSampleCsvTemplate()], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'school_marks_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Simplified Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
            <UploadCloud className="w-5 h-5 text-teal-600" />
            <span>Upload Student Marks (CSV / Spreadsheet)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload your student marks sheet, validate for errors, and save directly to the system.
          </p>
        </div>

        {/* Download CSV Format Button */}
        <button
          onClick={downloadTemplate}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition shrink-0"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Download CSV Format</span>
        </button>
      </div>

      {/* Main Upload & Validate Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-bold text-slate-700">Target Class:</span>
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

          {fileName && (
            <div className="flex items-center space-x-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Loaded: {fileName}</span>
            </div>
          )}
        </div>

        {/* File Drop / Upload Box */}
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-2xl p-6 bg-slate-50/60 hover:bg-teal-50/30 transition text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center shadow-xs">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-800">
              Select or Drop your CSV / Excel File
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Supports .csv, .tsv, .txt formatted spreadsheet data
            </div>
          </div>

          <label className="cursor-pointer inline-flex items-center space-x-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-700/20 transition">
            <UploadCloud className="w-4 h-4" />
            <span>Choose CSV / Excel File</span>
            <input
              type="file"
              accept=".csv, .tsv, .txt, .xlsx, .xls"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Textarea for viewing or pasting */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            Spreadsheet Data Preview / Manual Paste:
          </label>
          <textarea
            rows={5}
            value={pastedText}
            onChange={(e) => {
              setPastedText(e.target.value);
              setValidationResult(null);
              setSuccessMessage(null);
            }}
            placeholder={`roll,name,gender,section,ban,eng,mat,phy_th,phy_pr,che_th,che_pr,bio_th,bio_pr,hma_th,hma_pr\n301,Tanvir Hassan,Male,A,82,75,90,65,24,60,22,64,23,68,24`}
            className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
          />
        </div>

        {/* Validate & Check Errors Action Button */}
        <div className="flex items-center justify-end pt-1">
          <button
            onClick={handleValidate}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/20 transition flex items-center space-x-2"
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
        <div className="space-y-5 animate-in fade-in">
          
          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase">Total Rows</div>
                <div className="text-2xl font-bold text-slate-900 mt-0.5">{validationResult.totalRows}</div>
              </div>
              <div className="p-2.5 bg-slate-100 rounded-xl text-slate-700 font-mono font-bold text-sm">
                {validationResult.totalRows}
              </div>
            </div>

            <div className="bg-emerald-50/90 rounded-2xl p-4 border border-emerald-200 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-emerald-700 uppercase">Valid Rows Ready</div>
                <div className="text-2xl font-bold text-emerald-900 mt-0.5">{validationResult.validRows.length}</div>
              </div>
              <div className="p-2.5 bg-emerald-100 rounded-xl text-emerald-700 font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-rose-50/90 rounded-2xl p-4 border border-rose-200 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-rose-700 uppercase">Rejected Rows</div>
                <div className="text-2xl font-bold text-rose-900 mt-0.5">{validationResult.rejectedRows.length}</div>
              </div>
              <div className="p-2.5 bg-rose-100 rounded-xl text-rose-700 font-bold">
                <XCircle className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Rejection Report */}
          {validationResult.rejectedRows.length > 0 && (
            <div className="bg-white rounded-2xl border border-rose-200 shadow-sm overflow-hidden">
              <div className="bg-rose-600 text-white px-5 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4" />
                  <h3 className="font-bold text-xs">
                    Rejection Report ({validationResult.rejectedRows.length} Errors Found)
                  </h3>
                </div>
                <span className="text-[11px] bg-rose-700 px-2 py-0.5 rounded-full font-semibold">
                  Blocked from Import
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-rose-50 text-rose-900 font-semibold uppercase tracking-wider text-[10px] border-b border-rose-200">
                    <tr>
                      <th className="py-2.5 px-3 text-center">Row #</th>
                      <th className="py-2.5 px-3">Student Roll / Name</th>
                      <th className="py-2.5 px-3">Field</th>
                      <th className="py-2.5 px-3">Invalid Value</th>
                      <th className="py-2.5 px-4">Exact Reason for Rejection</th>
                      <th className="py-2.5 px-4">Actionable Fix</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-100 font-sans">
                    {validationResult.rejectedRows.map((rej, idx) => (
                      <tr key={idx} className="hover:bg-rose-50/50">
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-rose-700">
                          #{rej.rowNumber}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-900">{rej.studentName || 'N/A'}</div>
                          <div className="text-[10px] text-slate-500 font-mono">Roll: {rej.studentRoll || 'N/A'}</div>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-700">
                          {rej.field}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-rose-700">
                          {String(rej.invalidValue)}
                        </td>
                        <td className="py-2.5 px-4 text-rose-950 font-medium">
                          {rej.reason}
                        </td>
                        <td className="py-2.5 px-4 text-slate-600">
                          {rej.suggestion}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Valid Rows Actions */}
          {validationResult.validRows.length > 0 && (
            <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div>
                <h4 className="text-sm font-bold text-emerald-950">
                  {validationResult.validRows.length} Valid Students Ready to Save
                </h4>
                <p className="text-xs text-emerald-700 mt-0.5">
                  All marks comply with theory/practical caps and Bangladeshi secondary curriculum rules.
                </p>
              </div>

              <button
                onClick={handleCommitImport}
                disabled={isImporting}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/20 transition flex items-center space-x-2 shrink-0"
              >
                <Database className="w-4 h-4" />
                <span>{isImporting ? 'Saving to Database...' : 'Save Valid Students to Database'}</span>
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
};
