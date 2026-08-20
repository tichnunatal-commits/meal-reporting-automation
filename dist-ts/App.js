import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SupplierView } from './components/SupplierView';
import { RamtalView } from './components/RamtalView';
import { FoodDeptView } from './components/FoodDeptView';
import { AdminView } from './components/AdminView';
import { ClockReconciliationView } from './components/ClockReconciliationView';
import { mockUsers, mockSuppliers, mockKitchens, mockMealTypes, mockTariffs, initialDailyReports, initialMonthlySummaries } from './data/mockData';
import { MealCalculationEngine } from './engine/calculator';
import { FileEdit, CheckCircle2, BarChart3, Settings, Clock } from 'lucide-react';
const API_BASE = 'http://127.0.0.1:3001/api';
export const App = () => {
    const [currentUser, setCurrentUser] = useState(mockUsers[0]);
    const [kitchens, setKitchens] = useState(mockKitchens);
    const [dailyReports, setDailyReports] = useState(initialDailyReports);
    const [monthlySummaries, setMonthlySummaries] = useState(initialMonthlySummaries);
    const [activeTab, setActiveTab] = useState('supplier');
    // Load data from Backend API on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resKitchens, resSummaries, resDaily] = await Promise.all([
                    fetch(`${API_BASE}/kitchens`),
                    fetch(`${API_BASE}/reports/monthly`),
                    fetch(`${API_BASE}/reports/daily`)
                ]);
                if (resKitchens.ok) {
                    const kData = await resKitchens.json();
                    if (kData.length > 0) {
                        setKitchens(kData.map((k) => ({
                            id: k.id,
                            kitchenCode: k.kitchen_code,
                            name: k.name,
                            supplierId: k.supplier_id,
                            defaultRamtalUserId: k.default_ramtal_user_id,
                            region: k.region,
                            isActive: k.is_active === 1,
                            activeStartDate: k.active_start_date,
                            effectiveEndDate: k.effective_end_date,
                            hasQuarterlyMinimum: k.has_quarterly_minimum === 1,
                            quarterlyMinimumMeals: k.quarterly_minimum_meals,
                            appliesR1Machmesh: k.applies_r1_machmesh === 1,
                            appliesR2Tzohar: k.applies_r2_tzohar === 1
                        })));
                    }
                }
                if (resSummaries.ok) {
                    const sData = await resSummaries.json();
                    if (sData.length > 0)
                        setMonthlySummaries(sData);
                }
                if (resDaily.ok) {
                    const dData = await resDaily.json();
                    if (dData.length > 0)
                        setDailyReports(dData);
                }
            }
            catch (err) {
                console.log('Using local fallback state:', err);
            }
        };
        fetchData();
    }, []);
    // שינוי תפקיד אוטומטי לפי המשתמש שנבחר ב-Header
    const handleSelectUser = (user) => {
        setCurrentUser(user);
        if (user.role === 'supplier_reporter')
            setActiveTab('supplier');
        else if (user.role === 'police_ramtal')
            setActiveTab('ramtal');
        else if (user.role === 'food_dept_reviewer')
            setActiveTab('food_dept');
        else if (user.role === 'viewer_finance')
            setActiveTab('clock_sync');
        else if (user.role === 'system_admin')
            setActiveTab('admin');
    };
    // הוספת שורת דיווח יומית
    const handleAddDailyReport = async (newRow) => {
        try {
            await fetch(`${API_BASE}/reports/daily`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newRow)
            });
        }
        catch (e) {
            console.error(e);
        }
        const created = {
            ...newRow,
            id: Date.now()
        };
        setDailyReports(prev => [created, ...prev]);
        setMonthlySummaries(prev => prev.map(s => {
            if (s.kitchenId === newRow.kitchenId) {
                const newTotalRaw = s.totalReportedRaw + newRow.rawReportedQty;
                return {
                    ...s,
                    totalReportedRaw: newTotalRaw,
                    totalRamtalApproved: newTotalRaw
                };
            }
            return s;
        }));
    };
    // הגשת חודש לאישור רמת"ל
    const handleSubmitMonth = async (summaryId) => {
        try {
            await fetch(`${API_BASE}/reports/submit-month`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ summaryId })
            });
        }
        catch (e) {
            console.error(e);
        }
        setMonthlySummaries(prev => prev.map(s => {
            if (s.id === summaryId) {
                return {
                    ...s,
                    status: 'submitted',
                    submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
                };
            }
            return s;
        }));
    };
    // אישור חודש ע"י רמת"ל
    const handleApproveSummary = async (summaryId) => {
        try {
            await fetch(`${API_BASE}/reports/ramtal-approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ summaryId })
            });
        }
        catch (e) {
            console.error(e);
        }
        setMonthlySummaries(prev => prev.map(s => {
            if (s.id === summaryId) {
                const k = kitchens.find(item => item.id === s.kitchenId);
                const kReports = dailyReports.filter(r => r.kitchenId === s.kitchenId);
                const kTariffs = mockTariffs.filter(t => t.kitchenId === s.kitchenId);
                const calc = k ? MealCalculationEngine.calculateMonthlySummary(k, kReports, kTariffs) : null;
                return {
                    ...s,
                    status: 'ramtal_approved',
                    ramtalApprovedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
                    calculatedNetMeals: calc?.finalCalculatedMeals || s.totalRamtalApproved,
                    calculatedTotalAmountNis: calc?.finalTotalAmountNis || (s.totalRamtalApproved * 25)
                };
            }
            return s;
        }));
    };
    // החזרת חודש לעריכת הספק
    const handleReturnSummary = async (summaryId, reason) => {
        try {
            await fetch(`${API_BASE}/reports/ramtal-return`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ summaryId, reason })
            });
        }
        catch (e) {
            console.error(e);
        }
        setMonthlySummaries(prev => prev.map(s => {
            if (s.id === summaryId) {
                return {
                    ...s,
                    status: 'returned_for_revision',
                    revisionReason: reason
                };
            }
            return s;
        }));
    };
    // עריכת כמות נקודתית בשורה ע"י רמת"ל
    const handleAdjustDailyRow = async (rowId, newQty, reason) => {
        try {
            await fetch(`${API_BASE}/reports/ramtal-adjust-row`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rowId, newQty, reason })
            });
        }
        catch (e) {
            console.error(e);
        }
        setDailyReports(prev => prev.map(r => {
            if (r.id === rowId) {
                return {
                    ...r,
                    ramtalAdjustedQty: newQty,
                    ramtalAdjustmentReason: reason
                };
            }
            return r;
        }));
    };
    // אישור סופי ע"י מדור מזון
    const handleFinalApproveSummary = async (summaryId) => {
        try {
            await fetch(`${API_BASE}/reports/food-dept-approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ summaryId })
            });
        }
        catch (e) {
            console.error(e);
        }
        setMonthlySummaries(prev => prev.map(s => {
            if (s.id === summaryId) {
                return {
                    ...s,
                    status: 'food_dept_approved',
                    foodDeptApprovedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
                };
            }
            return s;
        }));
    };
    // השבתת / הפעלת מטבח (DR-02 / DR-04)
    const handleToggleKitchenActive = async (kitchenId) => {
        try {
            await fetch(`${API_BASE}/kitchens/${kitchenId}/toggle-active`, { method: 'POST' });
        }
        catch (e) {
            console.error(e);
        }
        setKitchens(prev => prev.map(k => {
            if (k.id === kitchenId) {
                return { ...k, isActive: !k.isActive };
            }
            return k;
        }));
    };
    return (_jsxs("div", { className: "min-h-screen bg-slate-100 flex flex-col font-heebo", children: [_jsx(Header, { currentUser: currentUser, onSelectUser: handleSelectUser, selectedPeriod: { month: 8, year: 2026 } }), _jsx("nav", { className: "bg-white border-b border-slate-200 sticky top-16 z-40 shadow-xs", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsxs("div", { className: "flex items-center justify-between h-12", children: [_jsxs("div", { className: "flex items-center space-x-1 space-x-reverse overflow-x-auto", children: [_jsxs("button", { onClick: () => setActiveTab('supplier'), className: `flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === 'supplier'
                                            ? 'bg-blue-600 text-white shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`, children: [_jsx(FileEdit, { className: "w-4 h-4" }), _jsx("span", { children: "1. \u05D3\u05D9\u05D5\u05D5\u05D7 \u05E1\u05E4\u05E7 \u05D4\u05E1\u05E2\u05D3\u05D4" })] }), _jsxs("button", { onClick: () => setActiveTab('ramtal'), className: `flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === 'ramtal'
                                            ? 'bg-emerald-600 text-white shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`, children: [_jsx(CheckCircle2, { className: "w-4 h-4" }), _jsx("span", { children: "2. \u05D0\u05D9\u05E9\u05D5\u05E8 \u05E8\u05DE\u05EA\"\u05DC \u05DE\u05E9\u05D8\u05E8\u05EA\u05D9" })] }), _jsxs("button", { onClick: () => setActiveTab('food_dept'), className: `flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === 'food_dept'
                                            ? 'bg-indigo-700 text-white shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`, children: [_jsx(BarChart3, { className: "w-4 h-4" }), _jsx("span", { children: "3. \u05D1\u05E7\u05E8\u05EA \u05DE\u05D3\u05D5\u05E8 \u05DE\u05D6\u05D5\u05DF (R1\u2013R5)" })] }), _jsxs("button", { onClick: () => setActiveTab('clock_sync'), className: `flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === 'clock_sync'
                                            ? 'bg-amber-600 text-white shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`, children: [_jsx(Clock, { className: "w-4 h-4" }), _jsx("span", { children: "4. \u05D4\u05E6\u05DC\u05D1\u05EA \u05E9\u05E2\u05D5\u05DF \u05E0\u05D5\u05DB\u05D7\u05D5\u05EA" })] }), _jsxs("button", { onClick: () => setActiveTab('admin'), className: `flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${activeTab === 'admin'
                                            ? 'bg-purple-700 text-white shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`, children: [_jsx(Settings, { className: "w-4 h-4" }), _jsx("span", { children: "5. \u05D4\u05D2\u05D3\u05E8\u05D5\u05EA \u05DE\u05E2\u05E8\u05DB\u05EA \u05D5\u05D0\u05D3\u05DE\u05D9\u05DF" })] })] }), _jsxs("div", { className: "hidden md:flex items-center gap-1.5 text-xs text-slate-500", children: [_jsx("span", { children: "\u05EA\u05E4\u05E7\u05D9\u05D3\u05DA \u05D4\u05E4\u05E2\u05D9\u05DC:" }), _jsx("strong", { className: "text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200", children: currentUser.fullName })] })] }) }) }), _jsxs("main", { className: "flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6", children: [activeTab === 'supplier' && (_jsx(SupplierView, { currentUser: currentUser, kitchens: kitchens, mealTypes: mockMealTypes, dailyReports: dailyReports, monthlySummaries: monthlySummaries, onAddDailyReport: handleAddDailyReport, onSubmitMonth: handleSubmitMonth })), activeTab === 'ramtal' && (_jsx(RamtalView, { currentUser: currentUser, kitchens: kitchens, dailyReports: dailyReports, monthlySummaries: monthlySummaries, onApproveSummary: handleApproveSummary, onReturnSummary: handleReturnSummary, onAdjustDailyRow: handleAdjustDailyRow })), activeTab === 'food_dept' && (_jsx(FoodDeptView, { currentUser: currentUser, kitchens: kitchens, tariffs: mockTariffs, dailyReports: dailyReports, monthlySummaries: monthlySummaries, onFinalApproveSummary: handleFinalApproveSummary })), activeTab === 'clock_sync' && (_jsx(ClockReconciliationView, {})), activeTab === 'admin' && (_jsx(AdminView, { currentUser: currentUser, kitchens: kitchens, suppliers: mockSuppliers, tariffs: mockTariffs, users: mockUsers, onToggleKitchenActive: handleToggleKitchenActive }))] }), _jsx("footer", { className: "bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500", children: "\u05DE\u05E9\u05D8\u05E8\u05EA \u05D9\u05E9\u05E8\u05D0\u05DC \u2022 \u05D0\u05D2\u05E3 \u05D4\u05EA\u05DE\u05D9\u05DB\u05D4 \u05D4\u05DC\u05D5\u05D2\u05D9\u05E1\u05D8\u05D9\u05EA (\u05D0\u05EA\"\u05DC) \u2022 \u05DE\u05D3\u05D5\u05E8 \u05DE\u05D6\u05D5\u05DF \u05D5\u05D7\u05D5\u05DC\u05D9\u05D9\u05EA \u05D4\u05EA\u05D9\u05D9\u05E2\u05DC\u05D5\u05EA \u05DB\u05DC\u05DB\u05DC\u05D9\u05EA \u00A9 2026" })] }));
};
