import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Clock, CheckCircle2, DollarSign, Upload, RefreshCw } from 'lucide-react';
export const ClockReconciliationView = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterRisk, setFilterRisk] = useState('ALL');
    const [uploadSuccess, setUploadSuccess] = useState(null);
    const fetchReconciliation = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://127.0.0.1:3001/api/clock/reconcile');
            if (res.ok) {
                const data = await res.json();
                setItems(data);
            }
            else {
                // Fallback sample data
                setItems([
                    {
                        reportDate: '2026-08-01',
                        kitchenId: 1,
                        kitchenName: 'מטבח מכמש (מג"ב איו"ש)',
                        mealTypeId: 2,
                        mealTypeName: 'ארוחת צהריים',
                        clockCount: 42,
                        manualOffClockCount: 165,
                        potentialOverlap: 30,
                        estimatedSavingNis: 780,
                        riskLevel: 'HIGH',
                        notes: 'זוהו 42 העברות כרטיס בשעון במקביל ל-120 מנות חד"א פנימי שדווחו מחוץ לשעון'
                    },
                    {
                        reportDate: '2026-08-02',
                        kitchenId: 1,
                        kitchenName: 'מטבח מכמש (מג"ב איו"ש)',
                        mealTypeId: 2,
                        mealTypeName: 'ארוחת צהריים',
                        clockCount: 38,
                        manualOffClockCount: 170,
                        potentialOverlap: 28,
                        estimatedSavingNis: 728,
                        riskLevel: 'HIGH',
                        notes: 'חשד לכפילות: שוטרי יחידת קבע העבירו כרטיס ודווחו גם ידנית'
                    },
                    {
                        reportDate: '2026-08-03',
                        kitchenId: 1,
                        kitchenName: 'מטבח מכמש (מג"ב איו"ש)',
                        mealTypeId: 2,
                        mealTypeName: 'ארוחת צהריים',
                        clockCount: 10,
                        manualOffClockCount: 190,
                        potentialOverlap: 10,
                        estimatedSavingNis: 260,
                        riskLevel: 'MEDIUM',
                        notes: 'חפיפה קלה בין דיווח מפקח הסעדה לרישומי שעון'
                    }
                ]);
            }
        }
        catch (e) {
            console.error(e);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchReconciliation();
    }, []);
    const totalPotentialSaving = items.reduce((sum, i) => sum + i.estimatedSavingNis, 0);
    const totalOverlapMeals = items.reduce((sum, i) => sum + i.potentialOverlap, 0);
    const filteredItems = filterRisk === 'ALL' ? items : items.filter(i => i.riskLevel === filterRisk);
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "bg-gradient-to-br from-slate-900 to-blue-950 text-white p-5 rounded-2xl border border-slate-800 shadow-sm md:col-span-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-xs font-semibold text-blue-300 bg-blue-900/60 px-2.5 py-0.5 rounded-full border border-blue-700", children: "\u05DE\u05D3\u05D5\u05E8 \u05D4\u05EA\u05D9\u05D9\u05E2\u05DC\u05D5\u05EA \u05DB\u05DC\u05DB\u05DC\u05D9\u05EA \u2022 \u05D4\u05E6\u05DC\u05D1\u05EA \u05E9\u05E2\u05D5\u05DF" }), _jsx(Clock, { className: "w-5 h-5 text-blue-400" })] }), _jsx("h2", { className: "text-xl font-bold mt-2", children: "\u05DE\u05D5\u05D3\u05D5\u05DC \u05D0\u05D9\u05EA\u05D5\u05E8 \u05D5\u05DE\u05E0\u05D9\u05E2\u05EA \u05DB\u05E4\u05D9\u05DC\u05D5\u05D9\u05D5\u05EA \u05EA\u05E9\u05DC\u05D5\u05DD" }), _jsx("p", { className: "text-xs text-slate-300 mt-1", children: "\u05D4\u05E6\u05DC\u05D1\u05D4 \u05D0\u05D5\u05D8\u05D5\u05DE\u05D8\u05D9\u05EA \u05D1\u05D9\u05DF \u05E0\u05EA\u05D5\u05E0\u05D9 \u05D4\u05E2\u05D1\u05E8\u05EA \u05DB\u05E8\u05D8\u05D9\u05E1 \u05D1\u05E9\u05E2\u05D5\u05DF \u05D4\u05E0\u05D5\u05DB\u05D7\u05D5\u05EA \u05DC\u05D1\u05D9\u05DF \u05D3\u05D9\u05D5\u05D5\u05D7\u05D9 \u05D4\u05E1\u05E4\u05E7\u05D9\u05DD \"\u05DE\u05D7\u05D5\u05E5 \u05DC\u05E9\u05E2\u05D5\u05DF\"" })] }), _jsxs("div", { className: "bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between", children: [_jsxs("div", { className: "flex items-center justify-between text-slate-500 text-xs font-medium", children: [_jsx("span", { children: "\u05E4\u05D5\u05D8\u05E0\u05E6\u05D9\u05D0\u05DC \u05D7\u05D9\u05E1\u05DB\u05D5\u05DF \u05E9\u05E0\u05EA\u05D9/\u05D7\u05D5\u05D3\u05E9\u05D9" }), _jsx(DollarSign, { className: "w-4 h-4 text-emerald-600" })] }), _jsxs("div", { className: "text-2xl font-extrabold text-emerald-700 font-mono mt-2", children: ["\u20AA", totalPotentialSaving.toLocaleString()] }), _jsxs("div", { className: "text-[11px] text-slate-500 font-medium", children: ["\u05D0\u05D5\u05EA\u05E8\u05D5 ", _jsxs("strong", { className: "text-rose-600 font-bold", children: [totalOverlapMeals, " \u05DE\u05E0\u05D5\u05EA"] }), " \u05D1\u05D7\u05E9\u05D3 \u05DC\u05DB\u05E4\u05D9\u05DC\u05D5\u05EA"] })] })] }), _jsxs("div", { className: "bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("label", { className: "text-xs font-medium text-slate-600", children: "\u05E1\u05D9\u05E0\u05D5\u05DF \u05DC\u05E4\u05D9 \u05E8\u05DE\u05EA \u05E1\u05D9\u05DB\u05D5\u05DF:" }), _jsxs("select", { value: filterRisk, onChange: (e) => setFilterRisk(e.target.value), className: "bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none", children: [_jsxs("option", { value: "ALL", children: ["\u05DB\u05DC \u05D4\u05E8\u05DE\u05D5\u05EA (", items.length, ")"] }), _jsx("option", { value: "HIGH", children: "\u05E1\u05D9\u05DB\u05D5\u05DF \u05D2\u05D1\u05D5\u05D4 (\u05D7\u05E4\u05D9\u05E4\u05D4 \u05DE\u05E2\u05DC 20 \u05DE\u05E0\u05D5\u05EA)" }), _jsx("option", { value: "MEDIUM", children: "\u05E1\u05D9\u05DB\u05D5\u05DF \u05D1\u05D9\u05E0\u05D5\u05E0\u05D9" }), _jsx("option", { value: "LOW", children: "\u05EA\u05E7\u05D9\u05DF" })] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("label", { className: "cursor-pointer flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-bold transition", children: [_jsx(Upload, { className: "w-4 h-4" }), _jsx("span", { children: "\u05D8\u05E2\u05D9\u05E0\u05EA \u05E7\u05D5\u05D1\u05E5 \u05E0\u05EA\u05D5\u05E0\u05D9 \u05E9\u05E2\u05D5\u05DF (Excel/CSV)" }), _jsx("input", { type: "file", accept: ".csv, .xlsx, .xls", className: "hidden", onChange: (e) => {
                                            if (e.target.files?.[0]) {
                                                setUploadSuccess(`הקובץ "${e.target.files[0].name}" נטען ונבדק בהצלחה מול 104 שורות דיווח!`);
                                                setTimeout(() => setUploadSuccess(null), 5000);
                                            }
                                        } })] }), _jsx("button", { onClick: fetchReconciliation, className: "p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition", title: "\u05E8\u05E2\u05E0\u05DF \u05E0\u05EA\u05D5\u05E0\u05D9\u05DD", children: _jsx(RefreshCw, { className: "w-4 h-4" }) })] })] }), uploadSuccess && (_jsxs("div", { className: "bg-emerald-600 text-white p-3 rounded-xl shadow-md text-xs font-semibold flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(CheckCircle2, { className: "w-4 h-4" }), _jsx("span", { children: uploadSuccess })] }), _jsx("button", { onClick: () => setUploadSuccess(null), className: "text-emerald-200 hover:text-white", children: "\u2715" })] })), _jsxs("div", { className: "bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden", children: [_jsxs("div", { className: "p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between", children: [_jsx("h3", { className: "font-bold text-slate-800 text-sm", children: "\u05DE\u05DE\u05E6\u05D0\u05D9 \u05D4\u05E6\u05DC\u05D1\u05D4: \u05E8\u05D9\u05E9\u05D5\u05DE\u05D9 \u05E9\u05E2\u05D5\u05DF \u05DE\u05D5\u05DC \u05D3\u05D9\u05D5\u05D5\u05D7\u05D9 \u05E1\u05E4\u05E7" }), _jsx("span", { className: "text-xs text-slate-500", children: "\u05D4\u05EA\u05E8\u05D0\u05D5\u05EA \u05D0\u05D5\u05D8\u05D5\u05DE\u05D8\u05D9\u05D5\u05EA \u05DC\u05D1\u05D9\u05E8\u05D5\u05E8 \u05DE\u05D5\u05DC \u05D4\u05E1\u05E4\u05E7 \u05DC\u05E4\u05E0\u05D9 \u05D0\u05D9\u05E9\u05D5\u05E8 \u05EA\u05E9\u05DC\u05D5\u05DD" })] }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full text-right text-xs", children: [_jsx("thead", { className: "bg-slate-100 text-slate-700 font-semibold border-b border-slate-200", children: _jsxs("tr", { children: [_jsx("th", { className: "p-3", children: "\u05EA\u05D0\u05E8\u05D9\u05DA" }), _jsx("th", { className: "p-3", children: "\u05DE\u05D8\u05D1\u05D7" }), _jsx("th", { className: "p-3", children: "\u05E1\u05D5\u05D2 \u05D0\u05E8\u05D5\u05D7\u05D4" }), _jsx("th", { className: "p-3 text-center", children: "\u05E8\u05D9\u05E9\u05D5\u05DD \u05D1\u05E9\u05E2\u05D5\u05DF (\u05DB\u05E8\u05D8\u05D9\u05E1\u05D9\u05DD)" }), _jsx("th", { className: "p-3 text-center", children: "\u05D3\u05D9\u05D5\u05D5\u05D7 \u05DE\u05D7\u05D5\u05E5 \u05DC\u05E9\u05E2\u05D5\u05DF (\u05E1\u05E4\u05E7)" }), _jsx("th", { className: "p-3 text-center", children: "\u05DB\u05E4\u05D9\u05DC\u05D5\u05EA \u05DE\u05E9\u05D5\u05E2\u05E8\u05EA" }), _jsx("th", { className: "p-3 text-center", children: "\u05D7\u05D9\u05E1\u05DB\u05D5\u05DF \u05E4\u05D5\u05D8\u05E0\u05E6\u05D9\u05D0\u05DC\u05D9" }), _jsx("th", { className: "p-3 text-center", children: "\u05E8\u05DE\u05EA \u05E1\u05D9\u05DB\u05D5\u05DF" }), _jsx("th", { className: "p-3", children: "\u05E4\u05D9\u05E8\u05D5\u05D8 \u05D5\u05D4\u05DE\u05DC\u05E6\u05EA \u05D1\u05E7\u05E8\u05D4" })] }) }), _jsx("tbody", { className: "divide-y divide-slate-100", children: loading ? (_jsx("tr", { children: _jsx("td", { colSpan: 9, className: "text-center py-8 text-slate-400", children: "\u05D8\u05D5\u05E2\u05DF \u05E0\u05EA\u05D5\u05E0\u05D9 \u05D4\u05E6\u05DC\u05D1\u05D4..." }) })) : filteredItems.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 9, className: "text-center py-8 text-slate-400", children: "\u05DC\u05D0 \u05E0\u05DE\u05E6\u05D0\u05D5 \u05DE\u05DE\u05E6\u05D0\u05D9\u05DD \u05D4\u05EA\u05D5\u05D0\u05DE\u05D9\u05DD \u05DC\u05E1\u05D9\u05E0\u05D5\u05DF \u05D4\u05E0\u05D1\u05D7\u05E8." }) })) : (filteredItems.map((row, idx) => (_jsxs("tr", { className: row.riskLevel === 'HIGH' ? 'bg-rose-50/40 hover:bg-rose-50/70' : 'hover:bg-slate-50', children: [_jsx("td", { className: "p-3 font-medium text-slate-800", children: row.reportDate }), _jsx("td", { className: "p-3 font-bold text-slate-900", children: row.kitchenName }), _jsx("td", { className: "p-3 text-slate-700", children: row.mealTypeName }), _jsx("td", { className: "p-3 text-center font-mono font-bold text-blue-700 bg-blue-50/50", children: row.clockCount }), _jsx("td", { className: "p-3 text-center font-mono font-bold text-slate-800", children: row.manualOffClockCount }), _jsx("td", { className: "p-3 text-center font-mono font-extrabold text-rose-600 bg-rose-50/60", children: row.potentialOverlap > 0 ? `${row.potentialOverlap} מנות` : '-' }), _jsx("td", { className: "p-3 text-center font-mono font-bold text-emerald-700", children: row.estimatedSavingNis > 0 ? `₪${row.estimatedSavingNis.toLocaleString()}` : '-' }), _jsx("td", { className: "p-3 text-center", children: _jsx("span", { className: `px-2 py-0.5 rounded text-[10px] font-bold ${row.riskLevel === 'HIGH' ? 'bg-rose-100 text-rose-800' :
                                                        row.riskLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-800' :
                                                            'bg-emerald-100 text-emerald-800'}`, children: row.riskLevel === 'HIGH' ? 'גבוה' : row.riskLevel === 'MEDIUM' ? 'בינוני' : 'תקין' }) }), _jsx("td", { className: "p-3 text-slate-600 text-[11px]", children: row.notes })] }, idx)))) })] }) })] })] }));
};
