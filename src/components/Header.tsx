import React, { useState } from 'react';
import { User } from '../types';
import { mockUsers } from '../data/mockData';
import { ShieldCheck, UserCheck, Calendar, Lock, LogOut } from 'lucide-react';

interface HeaderProps {
  currentUser: User;
  onSelectUser: (user: User) => void;
  selectedPeriod: { month: number; year: number };
  onLockSystem?: () => void;
  onLogout: () => void;
  isSuperAdmin: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentUser, 
  onSelectUser, 
  selectedPeriod, 
  onLockSystem,
  onLogout,
  isSuperAdmin
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50 shadow-md" dir="rtl">
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
                {isSuperAdmin && (
                  <span className="bg-purple-900/90 text-purple-200 text-[10px] px-2 py-0.5 rounded font-bold border border-purple-700">
                    Super-Admin (מצב הדגמה)
                  </span>
                )}
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

            {/* Role Switcher Dropdown — ONLY rendered in Super-Admin mode */}
            {isSuperAdmin ? (
              <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="text-xs text-right">
                  <div className="text-slate-400 text-[10px] leading-tight">החלף תפקיד (בלייב):</div>
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
            ) : (
              /* Single User Display Badge for End Users (No Role Switcher in DOM) */
              <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-200">
                <UserCheck className="w-4 h-4 text-blue-400 shrink-0" />
                <span>מחובר כעת:</span>
                <strong className="text-white font-bold">{currentUser.fullName}</strong>
              </div>
            )}

            {/* Logout Button */}
            <button
              onClick={onLogout}
              title="התנתקות מהמערכת וחזרה למסך הכניסה"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/60 hover:bg-red-900 border border-red-800/80 hover:border-red-600 text-red-200 text-xs font-bold rounded-lg transition cursor-pointer shadow-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>התנתק</span>
            </button>

          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={onLogout}
              title="התנתק"
              className="p-1.5 bg-red-950/80 border border-red-800 text-red-300 rounded-lg text-xs font-bold flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>התנתק</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
