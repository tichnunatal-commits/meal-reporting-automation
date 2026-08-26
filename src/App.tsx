import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SupplierView } from './components/SupplierView';
import { RamtalView } from './components/RamtalView';
import { FoodDeptView } from './components/FoodDeptView';
import { AdminView } from './components/AdminView';
import { ClockReconciliationView } from './components/ClockReconciliationView';
import { PasswordGate } from './components/PasswordGate';
import {
  mockUsers,
  mockSuppliers,
  mockKitchens,
  mockMealTypes,
  mockTariffs,
  initialDailyReports,
  initialMonthlySummaries
} from './data/mockData';
import { DailyReportRow, Kitchen, MonthlyKitchenSummary, User } from './types';
import { MealCalculationEngine } from './engine/calculator';
import {
  FileEdit,
  CheckCircle2,
  BarChart3,
  Settings,
  Clock,
  Sparkles
} from 'lucide-react';

const API_BASE = 'http://127.0.0.1:3001/api';

export const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('police_meal_gate_session_v2') === 'authenticated';
  });
  const [currentUser, setCurrentUser] = useState<User>(mockUsers[0]);

  // תיקון 1: מתחילים עם רשימה ריקה כדי לאלץ טעינה מהשרת
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [dailyReports, setDailyReports] = useState<DailyReportRow[]>(initialDailyReports);
  const [monthlySummaries, setMonthlySummaries] = useState<MonthlyKitchenSummary[]>(initialMonthlySummaries);
  const [activeTab, setActiveTab] = useState<'supplier' | 'ramtal' | 'food_dept' | 'clock_sync' | 'admin'>('supplier');

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
            setKitchens(kData.map((k: any) => ({
              id: k.id,
              kitchenCode: k.kitchen_code,
              name: k.name,
              // שיוך התחנות לספק הפעיל דוד מלכה (supplierId: 1)
              supplierId: 1,
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
          if (sData.length > 0) setMonthlySummaries(sData);
        }

        if (resDaily.ok) {
          const dData = await resDaily.json();
          if (dData.length > 0) setDailyReports(dData);
        }
      } catch (err) {
        console.log('Using local fallback state:', err);
      }
    };

    fetchData();
  }, []);

  const handleSelectUser = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'supplier_reporter') setActiveTab('supplier');
    else if (user.role === 'police_ramtal') setActiveTab('ramtal');
    else if (user.role === 'food_dept_reviewer') setActiveTab('food_dept');
    else if (user.role === 'viewer_finance') setActiveTab('clock_sync');
    else if (user.role === 'system_admin') setActiveTab('admin');
  };

  const handleAddDailyReport = async (newRow: Omit<DailyReportRow, 'id'>) => {
    try {
      await fetch(`${API_BASE}/reports/daily`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRow)
      });
    } catch (e) {
      console.error(e);
    }

    const created: DailyReportRow = {
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

  const handleSubmitMonth = async (summaryId: number) => {
    try {
      await fetch(`${API_BASE}/reports/submit-month`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summaryId })
      });
    } catch (e) {
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

  const handleApproveSummary = async (summaryId: number) => {
    try {
      await fetch(`${API_BASE}/reports/ramtal-approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summaryId })
      });
    } catch (e) {
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

  const handleReturnSummary = async (summaryId: number, reason: string) => {
    try {
      await fetch(`${API_BASE}/reports/ramtal-return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summaryId, reason })
      });
    } catch (e) {
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

  const handleAdjustDailyRow = async (rowId: number, newQty: number, reason: string) => {
    try {
      await fetch(`${API_BASE}/reports/ramtal-adjust-row`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rowId, newQty, reason })
      });
    } catch (e) {
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

  const handleFinalApproveSummary = async (summaryId: number) => {
    try {
      await fetch(`${API_BASE}/reports/food-dept-approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summaryId })
      });
    } catch (e) {
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

  const handleToggleKitchenActive = async (kitchenId: number) => {
    try {
      await fetch(`${API_BASE}/kitchens/${kitchenId}/toggle-active`, { method: 'POST' });
    } catch (e) {
      console.error(e);
    }

    setKitchens(prev => prev.map(k => {
      if (k.id === kitchenId) {
        return { ...k, isActive: !k.isActive };
      }
      return k;
    }));
  };

  const handleLockSystem = () => {
    sessionStorage.removeItem('police_meal_gate_session_v2');
    localStorage.removeItem('police_meal_gate_auth');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <PasswordGate onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-heebo">

      {/* Top Header */}
      <Header
        currentUser={currentUser}
        onSelectUser={handleSelectUser}
        selectedPeriod={{ month: 8, year: 2026 }}
        onLockSystem={handleLockSystem}
      />

      {/* Navigation Sub-Bar */}
      <nav className="bg-white border-b border-slate-200 sticky top-16 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">

            <div className="flex items-center space-x-1 space-x-reverse overflow-x-auto">
              <button
                onClick={() => setActiveTab('supplier')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === 'supplier'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <FileEdit className="w-4 h-4" />
                <span>1. דיווח ספק הסעדה</span>
              </button>

              <button
                onClick={() => setActiveTab('ramtal')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === 'ramtal'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>2. אישור רמת"ל משטרתי</span>
              </button>

              <button
                onClick={() => setActiveTab('food_dept')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === 'food_dept'
                    ? 'bg-indigo-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span>3. בקרת מדור מזון (R1–R5)</span>
              </button>

              <button
                onClick={() => setActiveTab('clock_sync')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === 'clock_sync'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>4. הצלבת שעון נוכחות</span>
              </button>

              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === 'admin'
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>5. הגדרות מערכת ואדמין</span>
              </button>
            </div>

            {/* Role indicator tag */}
            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500">
              <span>תפקידך הפעיל:</span>
              <strong className="text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {currentUser.fullName}
              </strong>
            </div>

          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'supplier' && (
          <SupplierView
            currentUser={currentUser}
            kitchens={kitchens}
            mealTypes={mockMealTypes}
            dailyReports={dailyReports}
            monthlySummaries={monthlySummaries}
            onAddDailyReport={handleAddDailyReport}
            onSubmitMonth={handleSubmitMonth}
          />
        )}

        {activeTab === 'ramtal' && (
          <RamtalView
            currentUser={currentUser}
            kitchens={kitchens}
            dailyReports={dailyReports}
            monthlySummaries={monthlySummaries}
            onApproveSummary={handleApproveSummary}
            onReturnSummary={handleReturnSummary}
            onAdjustDailyRow={handleAdjustDailyRow}
          />
        )}

        {activeTab === 'food_dept' && (
          <FoodDeptView
            currentUser={currentUser}
            kitchens={kitchens}
            tariffs={mockTariffs}
            dailyReports={dailyReports}
            monthlySummaries={monthlySummaries}
            onFinalApproveSummary={handleFinalApproveSummary}
          />
        )}

        {activeTab === 'clock_sync' && (
          <ClockReconciliationView />
        )}

        {activeTab === 'admin' && (
          <AdminView
            currentUser={currentUser}
            kitchens={kitchens}
            suppliers={mockSuppliers}
            tariffs={mockTariffs}
            users={mockUsers}
            onToggleKitchenActive={handleToggleKitchenActive}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        משטרת ישראל • אגף התמיכה הלוגיסטית (את"ל) • מדור מזון וחוליית התייעלות כלכלית © 2026
      </footer>

    </div>
  );
};

export default App;