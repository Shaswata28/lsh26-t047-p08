import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

// ─── Font ─────────────────────────────────────────────────────────────────────
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// ─── Metadata ─────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: {
    default: "School GPA Engine",
    template: "%s | School GPA Engine",
  },
  description:
    "A progressive web app for managing school GPA data, student rosters, and anomaly detection.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GPA Engine",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

// ─── Navigation links ─────────────────────────────────────────────────────────
const NAV_LINKS = [
  {
    href: "/",
    label: "Master Roster",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5 flex-shrink-0"
        aria-hidden="true"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: "/anomalies",
    label: "Anomaly Dashboard",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5 flex-shrink-0"
        aria-hidden="true"
      >
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
];

// ─── SW Registration Script ───────────────────────────────────────────────────
// Inline script injected into <head> to register the service worker.
const SW_REGISTRATION_SCRIPT = `
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker
      .register('/sw.js')
      .then(function(reg) {
        console.log('[SW] Registered, scope:', reg.scope);
      })
      .catch(function(err) {
        console.warn('[SW] Registration failed:', err);
      });
  });
}
`;

// ─── Layout ───────────────────────────────────────────────────────────────────
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <head>
        {/* PWA meta tags */}
        <meta name="application-name" content="School GPA Engine" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="GPA Engine" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#6366f1" />
        <meta name="msapplication-tap-highlight" content="no" />
        {/* Manifest */}
        <link rel="manifest" href="/manifest.json" />
        {/* Service Worker registration */}
        <script dangerouslySetInnerHTML={{ __html: SW_REGISTRATION_SCRIPT }} />
      </head>

      <body className="h-full bg-slate-950 text-slate-100 antialiased flex flex-col font-[family-name:var(--font-inter)]">
        {/*
         * ── App Shell ─────────────────────────────────────────────────────────
         * On mobile  : top navigation bar (sticky)
         * On desktop : left sidebar (fixed) + content area beside it
         */}
        <div className="flex flex-col md:flex-row h-full">

          {/* ── Sidebar (md+) ─────────────────────────────────────────────── */}
          <aside
            className="hidden md:flex flex-col w-64 shrink-0 border-r border-slate-800/60 bg-slate-900 fixed inset-y-0 left-0 z-40"
            aria-label="Primary navigation"
          >
            {/* Brand */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-800/60">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-600 shadow-lg shadow-indigo-900/50">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5 text-white"
                  aria-hidden="true"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-100 leading-none">GPA Engine</p>
                <p className="text-xs text-slate-500 mt-0.5">School Analytics</p>
              </div>
            </div>

            {/* Nav links */}
            <nav className="flex flex-col gap-1 p-3 flex-1" aria-label="Sidebar navigation">
              {NAV_LINKS.map(({ href, label, icon }) => (
                <Link
                  key={href}
                  href={href}
                  id={`sidebar-link-${label.toLowerCase().replace(/\s+/g, "-")}`}
                  className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400
                             transition-all duration-150
                             hover:bg-slate-800 hover:text-slate-100
                             aria-[current=page]:bg-indigo-600/20 aria-[current=page]:text-indigo-300"
                >
                  {icon}
                  <span>{label}</span>
                </Link>
              ))}
            </nav>

            {/* Footer badge */}
            <div className="px-5 py-4 border-t border-slate-800/60">
              <p className="text-xs text-slate-600">School GPA Engine v1.0</p>
            </div>
          </aside>

          {/* ── Top Bar (mobile) ──────────────────────────────────────────── */}
          <header
            className="md:hidden sticky top-0 z-40 flex items-center gap-3 px-4 py-3
                        bg-slate-900/80 backdrop-blur-md border-b border-slate-800/60"
            aria-label="Top navigation"
          >
            {/* Brand mark */}
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 shadow-md shadow-indigo-900/50">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 text-white"
                aria-hidden="true"
              >
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
            </span>
            <span className="text-sm font-semibold text-slate-100 flex-1">GPA Engine</span>

            {/* Nav links (horizontal) */}
            <nav className="flex items-center gap-1" aria-label="Top navigation links">
              {NAV_LINKS.map(({ href, label, icon }) => (
                <Link
                  key={href}
                  href={href}
                  id={`topbar-link-${label.toLowerCase().replace(/\s+/g, "-")}`}
                  title={label}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400
                             transition-all duration-150
                             hover:bg-slate-800 hover:text-slate-100
                             aria-[current=page]:bg-indigo-600/20 aria-[current=page]:text-indigo-300"
                >
                  {icon}
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              ))}
            </nav>
          </header>

          {/* ── Main Content ──────────────────────────────────────────────── */}
          <main
            className="flex-1 md:ml-64 overflow-y-auto"
            id="main-content"
            tabIndex={-1}
            aria-label="Main content"
          >
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
