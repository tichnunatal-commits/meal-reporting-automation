import React, { useState } from 'react';
import { ShieldCheck, KeyRound, AlertCircle, ArrowLeft, UserCheck, CheckCircle2, Lock } from 'lucide-react';
import { mockUsers } from '../data/mockData';
import { User } from '../types';

interface PasswordGateProps {
  onSuccess: (user: User, isSuperAdmin: boolean) => void;
}

export const PasswordGate: React.FC<PasswordGateProps> = ({ onSuccess }) => {
  const [selectedUserId, setSelectedUserId] = useState<number>(1);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const selectedUser = mockUsers.find(u => u.id === selectedUserId) || mockUsers[0];
  const isSelectedAdmin = selectedUser.role === 'system_admin';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // If selecting Super Admin or entering master password meal123456
    if (isSelectedAdmin || password === 'meal123456') {
      if (password === 'meal123456' || password === '') {
        const adminUser = mockUsers.find(u => u.role === 'system_admin') || selectedUser;
        onSuccess(adminUser, true);
        return;
      } else {
        setError(true);
        return;
      }
    }

    // End-User login
    onSuccess(selectedUser, false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-blue-600 selection:text-white font-heebo" dir="rtl">
      {/* Decorative Police Accent Line */}
      <div className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-sky-400 to-indigo-600 shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>

      <div className="w-full max-w-lg bg-slate-900/90 border border-blue-500/30 rounded-2xl shadow-2xl backdrop-blur-xl p-6 sm:p-8 relative overflow-hidden">
        {/* Glow effect in background */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="text-center mb-6">
          <div className="inline-flex p-3.5 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-2xl border border-blue-500/30 text-blue-400 shadow-inner mb-3">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <div className="inline-block px-3 py-1 bg-blue-950/80 border border-blue-800/60 rounded-full text-blue-300 text-xs font-semibold tracking-wider mb-2">
            משטרת ישראל • את"ל • מדור מזון
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            כניסה מאובטחת למערכת
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            מיכון ובקרת דיווח כמויות ארוחות מחוץ לשעון
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Persona Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
              <span>בחר בעל תפקיד להתחברות:</span>
              <span className="text-[11px] text-blue-400 font-normal">הרשאות RBAC לפי תפקיד</span>
            </label>
            <div className="space-y-2">
              {mockUsers.map(user => {
                const isSelected = user.id === selectedUserId;
                return (
                  <div
                    key={user.id}
                    onClick={() => {
                      setSelectedUserId(user.id);
                      setError(false);
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-950/60 border-blue-500 text-white shadow-md ring-1 ring-blue-500/50'
                        : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-100">{user.fullName}</div>
                        <div className="text-[10px] text-slate-400">
                          {user.role === 'supplier_reporter' && 'טאב 1: דיווח ספק בלבד'}
                          {user.role === 'police_ramtal' && 'טאב 2: אישור רמת"ל בלבד'}
                          {user.role === 'food_dept_reviewer' && 'טאבים 2, 3, 4: מדור מזון והצלבת שעון'}
                          {user.role === 'viewer_finance' && 'טאבים 3, 4: חשבות וגזברות (צפייה בלבד)'}
                          {user.role === 'system_admin' && 'כל 5 הטאבים + סרגל החלפת תפקידים (Super-Admin)'}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Password Input for Admin Mode */}
          {isSelectedAdmin && (
            <div className="animate-fade-in pt-2">
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
                <span>סיסמת מנהל / Super-Admin</span>
                <span className="text-[10px] text-slate-500 font-mono">meal123456</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(false);
                  }}
                  placeholder="הזן סיסמת מנהל (meal123456)..."
                  className={`w-full bg-slate-950 border rounded-xl py-2.5 pr-9 pl-20 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 ${
                    error ? 'border-red-500 focus:ring-red-500/30' : 'border-slate-700 focus:border-blue-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 pl-3 pr-2 flex items-center text-xs text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? 'הסתר' : 'הצג'}
                </button>
              </div>
              {error && (
                <div className="flex items-center gap-1 mt-1.5 text-red-400 text-xs">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>סיסמה שגויה (סיסמת מנהל: meal123456)</span>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 hover:from-blue-500 to-indigo-600 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition duration-200 flex items-center justify-center gap-2 group cursor-pointer text-xs sm:text-sm"
          >
            <span>התחבר כתפקיד {selectedUser.fullName.split(' ')[0]} {selectedUser.fullName.split(' ')[1]}</span>
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
          <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>גישה מורשית לגורמי משטרת ישראל וספקי ההסעדה בלבד</span>
          </p>
        </div>
      </div>
    </div>
  );
};
