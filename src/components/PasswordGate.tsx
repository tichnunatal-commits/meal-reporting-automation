import React, { useState } from 'react';
import { Lock, ShieldCheck, KeyRound, AlertCircle, ArrowLeft } from 'lucide-react';

interface PasswordGateProps {
  onSuccess: () => void;
}

export const PasswordGate: React.FC<PasswordGateProps> = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'meal123456') {
      sessionStorage.setItem('police_meal_gate_session_v2', 'authenticated');
      localStorage.removeItem('police_meal_gate_auth');
      setError(false);
      onSuccess();
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-blue-600 selection:text-white font-heebo" dir="rtl">
      {/* Decorative Police Accent Line */}
      <div className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-sky-400 to-indigo-600 shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>

      <div className="w-full max-w-md bg-slate-900/90 border border-blue-500/30 rounded-2xl shadow-2xl backdrop-blur-xl p-8 relative overflow-hidden">
        {/* Glow effect in background */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-2xl border border-blue-500/30 text-blue-400 shadow-inner mb-4">
            <ShieldCheck className="w-12 h-12" />
          </div>
          <div className="inline-block px-3 py-1 bg-blue-950/80 border border-blue-800/60 rounded-full text-blue-300 text-xs font-semibold tracking-wider mb-2">
            משטרת ישראל • את"ל • מדור מזון
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            כניסה מאובטחת למערכת
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            מיכון ובקרת דיווח כמויות ארוחות מחוץ לשעון
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center justify-between">
              <span>סיסמת גישה למערכת</span>
              <span className="text-xs text-slate-500 font-normal">סיווג בלמ"ס</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="הזן סיסמת כניסה..."
                autoFocus
                className={`w-full bg-slate-950/80 border rounded-xl py-3 pr-11 pl-24 text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition duration-200 text-sm ${
                  error
                    ? 'border-red-500/80 focus:ring-red-500/30'
                    : 'border-slate-700/80 focus:border-blue-500 focus:ring-blue-500/30'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 left-0 pl-3.5 pr-2 flex items-center text-xs text-slate-400 hover:text-slate-200"
              >
                {showPassword ? 'הסתר' : 'הצג'}
              </button>
            </div>
            {error && (
              <div className="flex items-center gap-1.5 mt-2 text-red-400 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>סיסמה שגויה. אנא נסה שוב.</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 hover:from-blue-500 to-indigo-600 hover:to-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition duration-200 flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>כניסה למערכת</span>
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
          <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>גישה מורשית לגורמי משטרת ישראל וספקי ההסעדה בלבד</span>
          </p>
        </div>
      </div>
    </div>
  );
};
