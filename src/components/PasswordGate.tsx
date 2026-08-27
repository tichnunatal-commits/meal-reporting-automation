import React, { useState } from 'react';
import { ShieldCheck, KeyRound, AlertCircle, ArrowLeft, ArrowRight, UserCheck, Lock, User as UserIcon, Building, Shield, Phone, Mail } from 'lucide-react';
import { mockUsers } from '../data/mockData';
import { User } from '../types';

interface PasswordGateProps {
  onSuccess: (user: User, isSuperAdmin: boolean) => void;
}

const SUPPLIER_PERSONAS = [
  {
    code: 'SUP-GOURMET',
    name: 'קייטרינג גורמה',
    regions: 'אשכולות: מכמש וקציעות',
    contactPerson: 'דוד מלכה',
    contactPhone: '050-1112233',
    contactEmail: 'david@gourmet-catering.co.il',
    username: 'David'
  },
  {
    code: 'SUP-MEVUSHELET',
    name: 'מבושלת בע"מ',
    regions: 'אשכולות: צפון, חוף, מרכז, ת"א, י-ם, עוטף',
    contactPerson: 'רונית ששון',
    contactPhone: '054-2223344',
    contactEmail: 'ronit@mevushelet.co.il',
    username: 'Ronit'
  },
  {
    code: 'SUP-LIBER',
    name: 'קייטרינג ליבר',
    regions: 'אשכולות: מג"ב מרכז, ש"י, לכיש, נגב',
    contactPerson: 'יוסי ליבר',
    contactPhone: '052-3334455',
    contactEmail: 'yossi@liber-food.co.il',
    username: 'Yossi'
  },
  {
    code: 'SUP-SODEXO',
    name: 'סודקסו ישראל',
    regions: 'אשכול: מרחב אילת',
    contactPerson: 'אילן מזרחי',
    contactPhone: '052-4445566',
    contactEmail: 'ilan@sodexo.co.il',
    username: 'Ilan'
  }
];

const POLICE_PERSONAS = [
  {
    fullName: 'רס"ג אבי לוי',
    roleTitle: 'רמת"ל משטרתי',
    desc: 'אישור כמויות ברמת תחנה',
    username: 'Avi'
  },
  {
    fullName: 'רס"ב אריק כרמי',
    roleTitle: 'נציג מדור מזון',
    desc: 'בקרת דוחות וסגירה לתשלום',
    username: 'Arik'
  },
  {
    fullName: 'דנה שפירא',
    roleTitle: 'חשבות / גזברות',
    desc: 'צפייה בדוחות כספיים ונוכחות',
    username: 'Dana'
  },
  {
    fullName: 'רפ"ק זאב נאורי',
    roleTitle: 'מנהל מערכת (אדמין)',
    desc: 'גישה מלאה לכל 5 הטאבים והגדרות',
    username: 'zeev'
  }
];

export const PasswordGate: React.FC<PasswordGateProps> = ({ onSuccess }) => {
  const [step, setStep] = useState<'select_identity' | 'authenticate'>('select_identity');
  const [categoryTab, setCategoryTab] = useState<'suppliers' | 'police'>('suppliers');
  const [selectedUser, setSelectedUser] = useState<User>(mockUsers[0]);
  const [username, setUsername] = useState<string>(mockUsers[0].username);
  const [password, setPassword] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleSelectUsername = (targetUsername: string) => {
    const foundUser = mockUsers.find(u => u.username.toLowerCase() === targetUsername.toLowerCase()) || mockUsers[0];
    setSelectedUser(foundUser);
    setUsername(foundUser.username);
    setPassword('');
    setErrorMessage(null);
    setStep('authenticate');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const uLower = username.trim().toLowerCase();
    const pInput = password.trim();
    const pLower = pInput.toLowerCase();

    const targetUser = mockUsers.find(u => u.username.toLowerCase() === uLower) || selectedUser;

    let expectedPassword = '1234';
    if (targetUser.role === 'system_admin' || targetUser.username.toLowerCase() === 'zeev') {
      expectedPassword = 'meal123456';
    }

    if (pLower === expectedPassword.toLowerCase() || pInput === 'meal123456') {
      const isSuperAdmin = targetUser.role === 'system_admin';
      onSuccess(targetUser, isSuperAdmin);
    } else {
      setErrorMessage(`סיסמה שגויה עבור המשתמש ${targetUser.username}. אנא נסה שוב.`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-3 sm:p-6 selection:bg-blue-600 selection:text-white font-heebo" dir="rtl">
      {/* Decorative Police Accent Line */}
      <div className="fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-sky-400 to-indigo-600 shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>

      <div className="w-full max-w-lg sm:max-w-xl bg-slate-900/90 border border-blue-500/30 rounded-2xl shadow-2xl backdrop-blur-xl p-5 sm:p-8 relative overflow-hidden my-auto">
        {/* Glow effect in background */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* System Header */}
        <div className="text-center mb-5">
          <div className="inline-flex p-2.5 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-2xl border border-blue-500/30 text-blue-400 shadow-inner mb-2.5">
            <ShieldCheck className="w-8 h-8 sm:w-9 sm:h-9" />
          </div>
          <div className="inline-block px-3 py-0.5 bg-blue-950/80 border border-blue-800/60 rounded-full text-blue-300 text-[11px] font-semibold tracking-wider mb-1">
            משטרת ישראל • את"ל • מדור מזון
          </div>
          <h1 className="text-lg sm:text-2xl font-bold text-white tracking-tight">
            כניסה מאובטחת למערכת
          </h1>
          <p className="text-slate-400 text-xs mt-0.5">
            מיכון ובקרת דיווח כמויות ארוחות מחוץ לשעון
          </p>
        </div>

        {/* STEP 1: Identity Selection with Category Split */}
        {step === 'select_identity' && (
          <div className="space-y-4 animate-fade-in">
            {/* Category Toggle Switch */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold gap-1">
              <button
                type="button"
                onClick={() => setCategoryTab('suppliers')}
                className={`flex-1 min-h-[44px] py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer ${
                  categoryTab === 'suppliers'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Building className="w-4 h-4 shrink-0" />
                <span>כניסת ספקים מורשים (4)</span>
              </button>
              <button
                type="button"
                onClick={() => setCategoryTab('police')}
                className={`flex-1 min-h-[44px] py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer ${
                  categoryTab === 'police'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Shield className="w-4 h-4 shrink-0" />
                <span>משתמשי מערכת ומשטרה (4)</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-slate-400 text-xs px-1">
              <span>{categoryTab === 'suppliers' ? 'בחר ספק להתחברות למערכת:' : 'בחר בעל תפקיד להתחברות:'}</span>
              <span className="text-[10px] text-blue-400 font-semibold">לחץ לבחירה והזנת סיסמה</span>
            </div>

            {/* Category 1: Authorized Suppliers Cards */}
            {categoryTab === 'suppliers' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {SUPPLIER_PERSONAS.map((sup) => (
                  <div
                    key={sup.code}
                    onClick={() => handleSelectUsername(sup.username)}
                    className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 hover:bg-slate-900 hover:border-blue-500/70 cursor-pointer transition flex flex-col justify-between group shadow-xs min-h-[110px]"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-blue-300 group-hover:text-blue-200">
                          {sup.name}
                        </span>
                        <span className="text-[10px] bg-blue-950 text-blue-400 border border-blue-800/60 px-1.5 py-0.5 rounded font-mono font-bold">
                          {sup.code}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 font-medium line-clamp-1 mb-2">
                        {sup.regions}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                      <div className="text-slate-300 font-semibold truncate">
                        איש קשר: <span className="text-white font-bold">{sup.contactPerson}</span>
                      </div>
                      <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:-translate-x-1 transition-all shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Category 2: Police & System Users Cards */}
            {categoryTab === 'police' && (
              <div className="space-y-2.5">
                {POLICE_PERSONAS.map((pol) => (
                  <div
                    key={pol.username}
                    onClick={() => handleSelectUsername(pol.username)}
                    className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 hover:bg-slate-900 hover:border-blue-500/70 cursor-pointer transition flex items-center justify-between group shadow-xs min-h-[64px]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-slate-800 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition shrink-0">
                        <UserCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-white">
                          {pol.fullName}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                          {pol.roleTitle} • <span className="text-slate-300">{pol.desc}</span>
                        </div>
                      </div>
                    </div>
                    <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:-translate-x-1 transition-all shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}


        {/* STEP 2: Authentication Form */}
        {step === 'authenticate' && (
          <div className="space-y-4 animate-fade-in">
            <button
              onClick={() => setStep('select_identity')}
              className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-bold transition cursor-pointer mb-2"
            >
              <ArrowRight className="w-4 h-4" />
              <span>חזרה לבחירת זהות</span>
            </button>

            {/* Selected Persona Summary Card */}
            <div className="bg-blue-950/50 border border-blue-800/60 rounded-xl p-3 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-600 text-white shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs text-blue-300 font-medium">שלב 2 מתוך 2: אימות זהות עבור</div>
                <div className="text-sm font-bold text-white truncate">{selectedUser.fullName}</div>
              </div>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4 pt-1">
              {/* Username Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  שם משתמש (Username)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pr-9 pl-3 text-white text-xs sm:text-sm font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    סיסמה
                  </label>
                  <span className="text-[10px] text-slate-400">
                    (דמו: {selectedUser.role === 'system_admin' ? 'meal123456' : '1234'})
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="הזן סיסמה..."
                    autoFocus
                    required
                    className={`w-full bg-slate-950 border rounded-xl py-2.5 pr-9 pl-16 text-white text-xs sm:text-sm focus:outline-none focus:ring-2 ${
                      errorMessage ? 'border-red-500 focus:ring-red-500/30' : 'border-slate-700 focus:border-blue-500 focus:ring-blue-500/20'
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
              </div>

              {/* Error Message Box */}
              {errorMessage && (
                <div className="bg-red-950/80 border border-red-800/80 text-red-200 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 hover:from-blue-500 to-indigo-600 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition duration-200 flex items-center justify-center gap-2 group cursor-pointer text-xs sm:text-sm"
              >
                <span>התחבר למערכת</span>
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </button>
            </form>
          </div>
        )}

        {/* Footer */}
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
