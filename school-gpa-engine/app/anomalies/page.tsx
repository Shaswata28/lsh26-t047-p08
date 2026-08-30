import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anomaly Dashboard",
  description: "Detect and review GPA anomalies, outliers, and alerts across the student population.",
};

// ─── Severity badge ───────────────────────────────────────────────────────────
function SeverityBadge({ level }: { level: "critical" | "warning" | "info" }) {
  const styles = {
    critical: "bg-rose-600/15 text-rose-400 border-rose-500/25",
    warning: "bg-amber-500/15 text-amber-400 border-amber-500/25",
    info: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${styles[level]}`}
    >
      {level}
    </span>
  );
}

// ─── Anomaly type card ────────────────────────────────────────────────────────
function AnomalyTypeCard({
  icon,
  label,
  count,
  desc,
  severity,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  desc: string;
  severity: "critical" | "warning" | "info";
}) {
  const borderAccent = {
    critical: "border-rose-500/30 hover:border-rose-500/60",
    warning: "border-amber-500/30 hover:border-amber-500/60",
    info: "border-blue-500/30 hover:border-blue-500/60",
  };
  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl border bg-slate-900 p-6 transition-all duration-200 ${borderAccent[severity]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-2xl" aria-hidden="true">{icon}</span>
        <SeverityBadge level={severity} />
      </div>
      <div>
        <p className="font-semibold text-slate-100">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
      </div>
      <p className="text-3xl font-bold text-slate-100 tabular-nums">{count}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AnomalyDashboardPage() {
  return (
    <div className="min-h-full px-4 py-8 sm:px-8 lg:px-12">
      {/* Page header */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/30">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-rose-400"
              aria-hidden="true"
            >
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </span>
          <span className="inline-flex items-center rounded-full bg-rose-600/10 border border-rose-500/20 px-3 py-1 text-xs font-semibold text-rose-400 uppercase tracking-wider">
            Requires Review
          </span>
        </div>
        <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Anomaly Dashboard</h1>
        <p className="mt-1.5 text-slate-400 text-sm max-w-xl">
          Automated detection of GPA anomalies, sudden grade drops, missing records, and statistical
          outliers across the student population.
        </p>
      </header>

      {/* Anomaly type cards */}
      <section aria-label="Anomaly categories" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        <AnomalyTypeCard
          icon="📉"
          label="Sudden GPA Drop"
          count={23}
          desc="Students with ≥ 0.5 GPA decline in a single term"
          severity="critical"
        />
        <AnomalyTypeCard
          icon="🚫"
          label="Missing Records"
          count={41}
          desc="Students with incomplete or absent GPA data"
          severity="warning"
        />
        <AnomalyTypeCard
          icon="📊"
          label="Statistical Outliers"
          count={12}
          desc="GPAs more than 2σ from the cohort mean"
          severity="info"
        />
      </section>

      {/* Flagged students table placeholder */}
      <section
        aria-label="Flagged students list"
        className="rounded-2xl border border-slate-800/60 bg-slate-900 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-slate-800/60">
          <p className="text-sm font-semibold text-slate-300">Flagged Students</p>
          <div className="flex items-center gap-2">
            {/* Severity filter */}
            <select
              id="anomaly-severity-filter"
              aria-label="Filter by severity"
              className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700/60 text-xs font-medium text-slate-400
                         focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>

            {/* Export button */}
            <button
              id="anomaly-export-btn"
              type="button"
              aria-label="Export anomaly report"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-xs font-semibold text-white
                         hover:bg-indigo-500 transition-all shadow-md shadow-indigo-900/50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-3.5 h-3.5"
                aria-hidden="true"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export
            </button>
          </div>
        </div>

        {/* Empty state */}
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <div className="relative mb-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700/60 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-8 h-8 text-slate-600"
                aria-hidden="true"
              >
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            {/* Pulse indicator */}
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
            </span>
          </div>
          <p className="text-slate-400 font-medium">No anomalies flagged yet</p>
          <p className="text-slate-600 text-sm mt-1 max-w-xs">
            Connect your GPA data source and run the anomaly detection engine to see flagged students here.
          </p>
          <button
            id="anomaly-run-btn"
            type="button"
            className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600/20 border border-rose-500/30
                       text-rose-400 text-sm font-semibold hover:bg-rose-600/30 hover:border-rose-500/50 transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
              aria-hidden="true"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Run Detection Engine
          </button>
        </div>
      </section>
    </div>
  );
}
