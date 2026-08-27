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
import { DailyReportRow, Kitchen, KitchenTariff, MonthlyKitchenSummary, User } from './types';
import { MealCalculationEngine } from './engine/calculator';
import {
  FileEdit,
  CheckCircle2,
  BarChart3,
  Settings,
  Clock,
  Sparkles,
  UserCheck,
  X
} from 'lucide-react';


const API_BASE = 'http://127.0.0.1:3001/api';

export type TabKey = 'supplier' | 'ramtal' | 'food_dept' | 'clock_sync' | 'admin';

export const getAllowedTabsForRole = (role: string): TabKey[] => {
  switch (role) {
    case 'supplier_reporter':
      return ['supplier'];
    case 'police_ramtal':
      return ['ramtal'];
    case 'food_dept_reviewer':
      return ['ramtal', 'food_dept', 'clock_sync'];
    case 'viewer_finance':
      return ['food_dept', 'clock_sync'];
    case 'system_admin':
    default:
      return ['supplier', 'ramtal', 'food_dept', 'clock_sync', 'admin'];
  }
};

const AUTH_STORAGE_KEY = 'police_meal_auth_session_v3';

interface AuthSessionState {
  isAuthenticated: boolean;
  currentUser: User;
  isSuperAdmin: boolean;
}

export const App: React.FC = () => {
  const [authSession, setAuthSession] = useState<AuthSessionState>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const user = mockUsers.find(u => u.id === parsed.userId);
        if (user) {
          return { isAuthenticated: true, currentUser: user, isSuperAdmin: !!parsed.isSuperAdmin };
        }
      }
    } catch (err) {
      console.error('Failed to parse saved auth session:', err);
    }
    return { isAuthenticated: false, currentUser: mockUsers[0], isSuperAdmin: false };
  });

  const { isAuthenticated, currentUser, isSuperAdmin } = authSession;

  const [kitchens, setKitchens] = useState<Kitchen[]>(mockKitchens);
  const [tariffs, setTariffs] = useState<KitchenTariff[]>(mockTariffs);
  const [dailyReports, setDailyReports] = useState<DailyReportRow[]>(initialDailyReports);
  const [monthlySummaries, setMonthlySummaries] = useState<MonthlyKitchenSummary[]>(initialMonthlySummaries);
  const [activeTab, setActiveTab] = useState<TabKey>('supplier');

  const allowedTabs = getAllowedTabsForRole(currentUser.role);

  // טעינה מיידית של נתוני 134 התחנות והתעריפים מהשרת
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resKitchens, resSummaries, resDaily, resTariffs] = await Promise.all([
          fetch(`${API_BASE}/kitchens`),
          fetch(`${API_BASE}/reports/monthly`),
          fetch(`${API_BASE}/reports/daily`),
          fetch(`${API_BASE}/tariffs`)
        ]);

        if (resKitchens.ok) {
          const kData = await resKitchens.json();
          if (Array.isArray(kData) && kData.length > 0) {
            const mapped = kData.map((k: any) => ({
              id: k.id,
              kitchenCode: k.kitchen_code,
              name: k.name,
              supplierId: 1,
              defaultRamtalUserId: k.default_ramtal_user_id,
              region: k.region || '',
              cluster: k.cluster_name || k.cluster || '',
              isActive: k.is_active === 1,
              activeStartDate: k.active_start_date,
              effectiveEndDate: k.effective_end_date,
              hasQuarterlyMinimum: k.has_quarterly_minimum === 1,
              quarterlyMinimumMeals: k.quarterly_minimum_meals,
              appliesR1Machmesh: k.applies_r1_machmesh === 1,
              appliesR2Tzohar: k.applies_r2_tzohar === 1
            }));

            mapped.sort((a: Kitchen, b: Kitchen) => {
              const compCluster = (a.cluster || a.region || '').localeCompare(b.cluster || b.region || '', 'he');
              if (compCluster !== 0) return compCluster;
              return a.name.localeCompare(b.name, 'he');
            });

            setKitchens(mapped);
          }
        }

        if (resSummaries.ok) {
          const sData = await resSummaries.json();
          if (Array.isArray(sData) && sData.length > 0) setMonthlySummaries(sData);
        }

        if (resDaily.ok) {
          const dData = await resDaily.json();
          if (Array.isArray(dData) && dData.length > 0) setDailyReports(dData);
        }

        if (resTariffs.ok) {
          const tData = await resTariffs.json();
          if (Array.isArray(tData) && tData.length > 0) {
            setTariffs(tData.map((t: any) => ({
              id: t.id,
              kitchenId: t.kitchen_id,
              kitchenName: t.kitchen_name,
              kitchenCode: t.kitchen_code,
              clusterName: t.cluster_name,
              region: t.region,
              mealTypeId: t.meal_type_id,
              mealTypeName: t.meal_type_name,
              priceNis: t.price_nis,
              effectiveFrom: '2026-06-01',
              isActive: t.is_active === 1
            })));
          }
        }
      } catch (err) {
        console.log('Backend fetch warning, preserving active state:', err);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  const [welcomeBanner, setWelcomeBanner] = useState<string | null>(null);

  // אכיפת הרשאות RBAC: העברה אוטומטית לטאב המורשה הראשון אם הטאב הנוכחי אינו מורשה
  useEffect(() => {
    if (isAuthenticated && !allowedTabs.includes(activeTab)) {
      if (allowedTabs.length > 0) {
        setActiveTab(allowedTabs[0]);
      }
    }
  }, [currentUser.role, activeTab, isAuthenticated]);

  const handleLoginSuccess = (user: User, superAdminFlag: boolean) => {
    setAuthSession({ isAuthenticated: true, currentUser: user, isSuperAdmin: superAdminFlag });
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ userId: user.id, isSuperAdmin: superAdminFlag }));
    const allowed = getAllowedTabsForRole(user.role);
    if (allowed.length > 0) {
      setActiveTab(allowed[0]);
    }

    // Clean user full name for greeting (e.g. 'דוד מלכה' out of 'דוד מלכה (נציג ספק הסעדה)')
    const cleanName = user.fullName.split(' (')[0];
    setWelcomeBanner(`ברוך הבא, ${cleanName}!`);
    setTimeout(() => setWelcomeBanner(null), 6000);
  };


  const handleLogout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem('police_meal_gate_session_v2');
    setAuthSession({ isAuthenticated: false, currentUser: mockUsers[0], isSuperAdmin: false });
  };

  const handleSelectUser = (user: User) => {
    setAuthSession(prev => ({ ...prev, currentUser: user }));
    if (isSuperAdmin) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ userId: user.id, isSuperAdmin: true }));
    }
    const userAllowed = getAllowedTabsForRole(user.role);
    if (userAllowed.length > 0) {
      setActiveTab(userAllowed[0]);
    }
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

  const handleUpdateDailyReport = (updatedRow: DailyReportRow) => {
    setDailyReports(prev => prev.map(r => r.id === updatedRow.id ? updatedRow : r));
    setMonthlySummaries(prev => prev.map(s => {
      if (s.kitchenId === updatedRow.kitchenId) {
        const kitchenRows = dailyReports.map(r => r.id === updatedRow.id ? updatedRow : r).filter(r => r.kitchenId === updatedRow.kitchenId);
        const sum = kitchenRows.reduce((acc, curr) => acc + (curr.rawReportedQty || 0), 0);
        return { ...s, totalReportedRaw: sum, totalRamtalApproved: sum };
      }
      return s;
    }));
  };

  const handleDuplicateDailyReport = (rowId: number) => {
    const target = dailyReports.find(r => r.id === rowId);
    if (!target) return;

    const duplicated: DailyReportRow = {
      ...target,
      id: Date.now(),
      reportDate: new Date().toISOString().split('T')[0],
      notes: target.notes ? `${target.notes} (משוכפל)` : 'משוכפל'
    };

    setDailyReports(prev => [duplicated, ...prev]);

    setMonthlySummaries(prev => prev.map(s => {
      if (s.kitchenId === target.kitchenId) {
        const sum = s.totalReportedRaw + duplicated.rawReportedQty;
        return { ...s, totalReportedRaw: sum, totalRamtalApproved: sum };
      }
      return s;
    }));
  };

  const handleDeleteDailyReport = (rowId: number) => {
    const target = dailyReports.find(r => r.id === rowId);
    if (!target) return;

    setDailyReports(prev => prev.filter(r => r.id !== rowId));

    setMonthlySummaries(prev => prev.map(s => {
      if (s.kitchenId === target.kitchenId) {
        const sum = Math.max(0, s.totalReportedRaw - target.rawReportedQty);
        return { ...s, totalReportedRaw: sum, totalRamtalApproved: sum };
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

  const handleUpdateTariff = async (tariffId: number, newPriceNis: number) => {
    try {
      await fetch(`${API_BASE}/tariffs/${tariffId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceNis: newPriceNis })
      });
    } catch (e) {
      console.error('API update tariff error, updating local state:', e);
    }

    setTariffs(prev => prev.map(t => t.id === tariffId ? { ...t, priceNis: newPriceNis } : t));
  };

  const handleUpdateGlobalTariff = async (mealTypeId: number, newPriceNis: number) => {
    try {
      await fetch(`${API_BASE}/global-tariffs/${mealTypeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceNis: newPriceNis })
      });
    } catch (e) {
      console.error('API update global tariff error, updating local state:', e);
    }

    setTariffs(prev => prev.map(t => t.mealTypeId === mealTypeId ? { ...t, priceNis: newPriceNis } : t));
  };

  const handleLockSystem = () => {
    handleLogout();
  };

  if (!isAuthenticated) {
    return <PasswordGate onSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-heebo" dir="rtl">

      {/* Top Header */}
      <Header
        currentUser={currentUser}
        onSelectUser={handleSelectUser}
        selectedPeriod={{ month: 8, year: 2026 }}
        onLockSystem={handleLogout}
        onLogout={handleLogout}
        isSuperAdmin={isSuperAdmin}
      />

      {/* Navigation Sub-Bar (rendered ONLY for Super-Admin or when user has multiple allowed tabs) */}
      {(isSuperAdmin || allowedTabs.length > 1) && (
        <nav className="bg-white border-b border-slate-200 sticky top-16 z-40 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-12">

              <div className="flex items-center space-x-1 space-x-reverse overflow-x-auto">
                {allowedTabs.includes('supplier') && (
                  <button
                    onClick={() => setActiveTab('supplier')}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      activeTab === 'supplier'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <FileEdit className="w-4 h-4" />
                    <span>1. דיווח ספק הסעדה</span>
                  </button>
                )}

                {allowedTabs.includes('ramtal') && (
                  <button
                    onClick={() => setActiveTab('ramtal')}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      activeTab === 'ramtal'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>2. אישור רמת"ל משטרתי</span>
                  </button>
                )}

                {allowedTabs.includes('food_dept') && (
                  <button
                    onClick={() => setActiveTab('food_dept')}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      activeTab === 'food_dept'
                        ? 'bg-indigo-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>3. בקרת מדור מזון (R1–R5)</span>
                  </button>
                )}

                {allowedTabs.includes('clock_sync') && (
                  <button
                    onClick={() => setActiveTab('clock_sync')}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      activeTab === 'clock_sync'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span>4. הצלבת שעון נוכחות</span>
                  </button>
                )}

                {allowedTabs.includes('admin') && (
                  <button
                    onClick={() => setActiveTab('admin')}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                      activeTab === 'admin'
                        ? 'bg-purple-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                    <span>5. הגדרות מערכת ואדמין</span>
                  </button>
                )}
              </div>

              {/* Role indicator tag */}
              <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500">
                <span>תפקידך הפעיל:</span>
                <strong className="text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {currentUser.fullName}
                </strong>
                {currentUser.role === 'viewer_finance' && (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    צפייה בלבד (Read-Only)
                  </span>
                )}
              </div>

            </div>
          </div>
        </nav>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 relative">
        {/* Welcome Toast Notification Banner */}
        {welcomeBanner && (
          <div className="fixed top-20 left-4 sm:left-8 z-50 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-blue-400/40 flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl shrink-0">
              <UserCheck className="w-5 h-5 text-blue-100" />
            </div>
            <div>
              <div className="text-[11px] text-blue-200 font-medium">התחברות מאובטחת בוצעה בהצלחה</div>
              <div className="text-sm font-bold">{welcomeBanner}</div>
            </div>
            <button
              onClick={() => setWelcomeBanner(null)}
              className="mr-2 text-blue-200 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {activeTab === 'supplier' && (

          <SupplierView
            currentUser={currentUser}
            kitchens={kitchens}
            mealTypes={mockMealTypes}
            dailyReports={dailyReports}
            monthlySummaries={monthlySummaries}
            onAddDailyReport={handleAddDailyReport}
            onUpdateDailyReport={handleUpdateDailyReport}
            onDuplicateDailyReport={handleDuplicateDailyReport}
            onDeleteDailyReport={handleDeleteDailyReport}
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
            tariffs={tariffs}
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
            tariffs={tariffs}
            users={mockUsers}
            onToggleKitchenActive={handleToggleKitchenActive}
            onUpdateTariff={handleUpdateTariff}
            onUpdateGlobalTariff={handleUpdateGlobalTariff}
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