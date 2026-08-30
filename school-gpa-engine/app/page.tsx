import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Master Roster",
  description: "Browse and manage the complete student roster with GPA records.",
};

// ─── Stat card component ──────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-900 p-6">
      <div className={`absolute inset-x-0 top-0 h-1 ${accent} rounded-t-2xl`} />
      <p className="text-xs font-medium uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-100">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{sub}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function MasterRosterPage() {
  return (
    <div className="min-h-full px-4 py-8 sm:px-8 lg:px-12">
      {/* Page header */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-indigo-400"
              aria-hidden="true"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </span>
          <span className="inline-flex items-center rounded-full bg-indigo-600/10 border border-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            Live
          </span>
        </div>
        <h1 className="text-3xl font-bold text-slate-100 tracking-tight">Master Roster</h1>
        <p className="mt-1.5 text-slate-400 text-sm max-w-xl">
          A complete view of all enrolled students, their GPA records, and academic standing across
          every grade and department.
        </p>
      </header>

      {/* Stats row */}
      <section aria-label="Summary statistics" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard label="Total Students" value="2,481" sub="Active enrollments" accent="bg-indigo-500" />
        <StatCard label="Avg. GPA" value="3.24" sub="School-wide average" accent="bg-emerald-500" />
        <StatCard label="Honor Roll" value="312" sub="GPA ≥ 3.75" accent="bg-amber-500" />
        <StatCard label="At-Risk" value="89" sub="GPA &lt; 2.00" accent="bg-rose-500" />
      </section>

      {/* Placeholder table card */}
      <section
        aria-label="Student roster table"
        className="rounded-2xl border border-slate-800/60 bg-slate-900 overflow-hidden"
      >
        {/* Table header bar */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-slate-800/60">
          <p className="text-sm font-semibold text-slate-300">All Students</p>
          <div className="flex items-center gap-2">
            {/* Search input */}
            <div className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                id="roster-search"
                type="search"
                placeholder="Search students…"
                aria-label="Search students"
                className="pl-9 pr-4 py-1.5 rounded-lg bg-slate-800 border border-slate-700/60 text-sm text-slate-300 placeholder-slate-600
                           focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all w-48"
              />
            </div>
            {/* Filter button */}
            <button
              id="roster-filter-btn"
              type="button"
              aria-label="Filter roster"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700/60 text-xs font-medium text-slate-400
                         hover:bg-slate-700 hover:text-slate-200 transition-all"
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
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              Filter
            </button>
          </div>
        </div>

        {/* Placeholder empty state */}
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700/60 flex items-center justify-center mb-4">
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
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="3" y1="15" x2="21" y2="15" />
              <line x1="9" y1="9" x2="9" y2="21" />
            </svg>
          </div>
          <p className="text-slate-400 font-medium">Roster data will appear here</p>
          <p className="text-slate-600 text-sm mt-1 max-w-xs">
            Connect a data source to populate the student roster table with real GPA records.
          </p>
        </div>
      </section>
    </div>
  );
}
