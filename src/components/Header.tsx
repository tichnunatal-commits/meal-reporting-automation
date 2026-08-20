import React, { useState } from 'react';
import { User } from '../types';
import { mockUsers } from '../data/mockData';
import { ShieldCheck, UserCheck, Calendar, ChevronDown, Menu, X } from 'lucide-react';

interface HeaderProps {
  currentUser: User;
  onSelectUser: (user: User) => void;
  selectedPeriod: { month: number; year: number };
}

export const Header: React.FC<HeaderProps> = ({ currentUser, onSelectUser, selectedPeriod }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-[60px] py-2">
          
          {/* Logo & System Title */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="bg-blue-600 text-white p-1.5 sm:p-2 rounded-lg flex items-center justify-center shadow-inner shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-sm sm:text-base font-bold tracking-tight truncate">
                  משטרת ישראל • מדור מזון
                </h1>
                <span className="bg-blue-900/90 text-blue-300 text-[10px] px-1.5 py-0.5 rounded font-medium border border-blue-700/50 hidden xs:inline-block">
                  מחוץ לשעון
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 truncate">
                מיכון ובקרת כמויות ארוחות
              </p>
            </div>
          </div>

          {/* Desktop Controls */}
          <div className="hidden md:flex items-center space-x-3 space-x-reverse shrink-0">
            
            {/* Period Indicator */}
            <div className="flex items-center gap-1.5 bg-slate-800/90 px-2.5 py-1.5 rounded-lg border border-slate-700/70 text-xs text-slate-200">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>תקופה:</span>
              <strong className="text-white font-semibold">08/{selectedPeriod.year}</strong>
            </div>

            {/* Persona Switcher */}
            <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
              <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="text-xs text-right">
                <div className="text-slate-400 text-[10px] leading-tight">החלף תפקיד:</div>
                <select
                  value={currentUser.id}
                  onChange={(e) => {
                    const found = mockUsers.find(u => u.id === Number(e.target.value));
                    if (found) onSelectUser(found);
                  }}
                  className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer pr-1"
                >
                  {mockUsers.map((u) => (
                    <option key={u.id} value={u.id} className="bg-slate-800 text-white">
                      {u.fullName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

          </div>

          {/* Mobile Toggle Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg transition"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="max-w-[100px] truncate text-[11px] font-medium">{currentUser.fullName.split(' ')[0]}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Panel */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-800 space-y-2.5 bg-slate-900/95 animate-fade-in">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>תקופת דיווח: <strong className="text-white">אוגוסט {selectedPeriod.year} (08/{selectedPeriod.year})</strong></span>
              <span className="bg-blue-900 text-blue-300 text-[10px] px-2 py-0.5 rounded">בלמ"ס</span>
            </div>

            <div className="bg-slate-800/90 p-2.5 rounded-xl border border-slate-700">
              <label className="text-[11px] font-medium text-slate-400 block mb-1.5">
                בחר משתמש / תפקיד להתנסות:
              </label>
              <div className="space-y-1">
                {mockUsers.map((u) => {
                  const isSelected = u.id === currentUser.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => {
                        onSelectUser(u);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full text-right px-2.5 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition ${
                        isSelected 
                          ? 'bg-blue-600 text-white font-bold' 
                          : 'text-slate-300 hover:bg-slate-700/60'
                      }`}
                    >
                      <span className="truncate">{u.fullName}</span>
                      {isSelected && <span className="text-[10px] bg-blue-800 px-1.5 py-0.5 rounded">פעיל</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </header>
  );
};
