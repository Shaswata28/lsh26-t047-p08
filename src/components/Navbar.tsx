'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  GraduationCap, 
  LayoutDashboard, 
  FileCheck2, 
  UploadCloud, 
  BarChart3
} from 'lucide-react';

interface NavbarProps {
  studentCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  studentCount = 0 
}) => {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Master Results', icon: LayoutDashboard, badge: studentCount },
    { href: '/audit', label: 'Office Checking Desk', icon: FileCheck2 },
    { href: '/import', label: 'Spreadsheet Import', icon: UploadCloud },
    { href: '/analytics', label: 'Class Analytics', icon: BarChart3 },
  ];

  return (
    <header className="no-print sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* School Brand */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-900/30 group-hover:scale-105 transition-transform">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-base tracking-tight text-slate-100 group-hover:text-emerald-400 transition-colors">
                    Bogura Secondary School
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    GPA Engine
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Result Processing & Transparent Audit System
                </p>
              </div>
            </Link>
          </div>

          {/* Nav Items */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900/40'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-1 bg-slate-800 text-emerald-300 text-xs px-1.5 py-0.5 rounded-full font-bold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-800 text-xs">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center py-1 px-2 rounded ${
                  isActive ? 'text-emerald-400 font-semibold' : 'text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span>{item.label.split(' ')[0]}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
};
