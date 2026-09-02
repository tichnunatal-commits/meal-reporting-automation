import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { ShieldCheck, KeyRound, AlertCircle, Lock, User as UserIcon, LogIn, Eye, EyeOff } from 'lucide-react';
import { mockUsers } from '../data/mockData';
// Supplier code mapping for flexible login
const SUPPLIER_CODE_ALIAS = {
    'sup-gourmet': 'David',
    'sup-mevushelet': 'Ronit',
    'sup-liber': 'Yossi',
    'sup-sodexo': 'Ilan'
};
export const PasswordGate = ({ onSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const handleLoginSubmit = (e) => {
        e.preventDefault();
        setErrorMessage(null);
        const uInput = username.trim();
        const uLower = uInput.toLowerCase();
        const pInput = password.trim();
        if (!uInput || !pInput) {
            setErrorMessage('נא להזין שם משתמש וסיסמה.');
            return;
        }
        setIsLoading(true);
        // Resolve user by username, email, or supplier code alias
        let targetUser = mockUsers.find(u => u.username.toLowerCase() === uLower || u.email.toLowerCase() === uLower);
        if (!targetUser && SUPPLIER_CODE_ALIAS[uLower]) {
            const aliasUsername = SUPPLIER_CODE_ALIAS[uLower];
            targetUser = mockUsers.find(u => u.username.toLowerCase() === aliasUsername.toLowerCase());
        }
        // Determine expected passwords
        const isValidPassword = (user, pass) => {
            const p = pass.toLowerCase();
            // Master admin password always works
            if (pass === 'meal123456')
                return true;
            if (user.role === 'system_admin' || user.username.toLowerCase() === 'zeev') {
                return p === 'meal123456' || p === '1234';
            }
            return p === '1234';
        };
        if (targetUser && isValidPassword(targetUser, pInput)) {
            const isSuperAdmin = targetUser.role === 'system_admin';
            onSuccess(targetUser, isSuperAdmin);
        }
        else {
            setIsLoading(false);
            setErrorMessage('שם משתמש או סיסמה שגויים. אנא נסה שנית.');
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-blue-600 selection:text-white font-heebo", dir: "rtl", children: [_jsx("div", { className: "fixed top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-sky-400 to-indigo-600 shadow-[0_0_15px_rgba(59,130,246,0.5)]" }), _jsxs("div", { className: "w-full max-w-md bg-slate-900/95 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl p-6 sm:p-8 relative overflow-hidden my-auto", children: [_jsx("div", { className: "absolute -top-20 -right-20 w-44 h-44 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" }), _jsx("div", { className: "absolute -bottom-20 -left-20 w-44 h-44 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" }), _jsxs("div", { className: "text-center mb-6", children: [_jsx("div", { className: "inline-flex p-3 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-2xl border border-blue-500/30 text-blue-400 shadow-inner mb-3", children: _jsx(ShieldCheck, { className: "w-9 h-9" }) }), _jsx("div", { className: "inline-block px-3 py-0.5 bg-blue-950/80 border border-blue-800/60 rounded-full text-blue-300 text-[11px] font-semibold tracking-wider mb-2", children: "\u05DE\u05E9\u05D8\u05E8\u05EA \u05D9\u05E9\u05E8\u05D0\u05DC \u2022 \u05D0\u05EA\"\u05DC \u2022 \u05DE\u05D3\u05D5\u05E8 \u05DE\u05D6\u05D5\u05DF" }), _jsx("h1", { className: "text-xl sm:text-2xl font-bold text-white tracking-tight", children: "\u05DB\u05E0\u05D9\u05E1\u05D4 \u05DE\u05D0\u05D5\u05D1\u05D8\u05D7\u05EA \u05DC\u05DE\u05E2\u05E8\u05DB\u05EA" }), _jsx("p", { className: "text-slate-400 text-xs mt-1", children: "\u05DE\u05D9\u05DB\u05D5\u05DF \u05D5\u05D1\u05E7\u05E8\u05EA \u05D3\u05D9\u05D5\u05D5\u05D7 \u05DB\u05DE\u05D5\u05D9\u05D5\u05EA \u05D0\u05E8\u05D5\u05D7\u05D5\u05EA \u05DE\u05D7\u05D5\u05E5 \u05DC\u05E9\u05E2\u05D5\u05DF" })] }), _jsxs("form", { onSubmit: handleLoginSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-slate-300 mb-1.5", children: "\u05E9\u05DD \u05DE\u05E9\u05EA\u05DE\u05E9" }), _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400", children: _jsx(UserIcon, { className: "w-4 h-4" }) }), _jsx("input", { type: "text", value: username, onChange: (e) => {
                                                    setUsername(e.target.value);
                                                    if (errorMessage)
                                                        setErrorMessage(null);
                                                }, placeholder: "\u05D4\u05D6\u05DF \u05E9\u05DD \u05DE\u05E9\u05EA\u05DE\u05E9...", autoFocus: true, required: true, className: "w-full bg-slate-950/90 border border-slate-700/80 rounded-xl py-3 pr-10 pl-4 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition placeholder:text-slate-500" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-slate-300 mb-1.5", children: "\u05E1\u05D9\u05E1\u05DE\u05D4" }), _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400", children: _jsx(KeyRound, { className: "w-4 h-4" }) }), _jsx("input", { type: showPassword ? 'text' : 'password', value: password, onChange: (e) => {
                                                    setPassword(e.target.value);
                                                    if (errorMessage)
                                                        setErrorMessage(null);
                                                }, placeholder: "\u05D4\u05D6\u05DF \u05E1\u05D9\u05E1\u05DE\u05D4...", required: true, className: `w-full bg-slate-950/90 border rounded-xl py-3 pr-10 pl-11 text-white text-sm focus:outline-none focus:ring-2 transition placeholder:text-slate-500 ${errorMessage
                                                    ? 'border-red-500/80 focus:ring-red-500/30'
                                                    : 'border-slate-700/80 focus:border-blue-500 focus:ring-blue-500/20'}` }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "absolute inset-y-0 left-0 pl-3.5 pr-2 flex items-center text-slate-400 hover:text-slate-200 transition cursor-pointer", title: showPassword ? 'הסתר סיסמה' : 'הצג סיסמה', children: showPassword ? _jsx(EyeOff, { className: "w-4 h-4" }) : _jsx(Eye, { className: "w-4 h-4" }) })] })] }), errorMessage && (_jsxs("div", { className: "bg-red-950/80 border border-red-800/80 text-red-200 p-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 animate-shake shadow-xs", children: [_jsx(AlertCircle, { className: "w-4 h-4 shrink-0 text-red-400" }), _jsx("span", { children: errorMessage })] })), _jsxs("button", { type: "submit", disabled: isLoading, className: "w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 transition duration-200 flex items-center justify-center gap-2 group cursor-pointer text-sm min-h-[48px] disabled:opacity-70 mt-2", children: [_jsx(LogIn, { className: "w-4 h-4 group-hover:translate-x-0.5 transition-transform" }), _jsx("span", { children: isLoading ? 'מתחבר...' : 'התחבר למערכת' })] })] }), _jsx("div", { className: "mt-6 pt-4 border-t border-slate-800/80 text-center", children: _jsxs("p", { className: "text-[11px] text-slate-500 flex items-center justify-center gap-1.5", children: [_jsx(Lock, { className: "w-3.5 h-3.5 text-slate-500 shrink-0" }), _jsx("span", { children: "\u05DE\u05E2\u05E8\u05DB\u05EA \u05DE\u05D5\u05D2\u05E0\u05EA \u05D5\u05DE\u05D0\u05D5\u05D1\u05D8\u05D7\u05EA \u2022 \u05D2\u05D9\u05E9\u05D4 \u05DE\u05D5\u05E8\u05E9\u05D9\u05EA \u05D1\u05DC\u05D1\u05D3" })] }) })] })] }));
};
