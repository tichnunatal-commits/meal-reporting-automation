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
  seedInitialDataIfEmpty,
  subscribeToDailyReports,
  subscribeToMonthlySummaries,
  subscribeToAppConfig,
  saveDailyReportToFirestore,
  deleteDailyReportFromFirestore,
  saveMonthlySummaryToFirestore,
  saveDisabledKitchensToFirestore,
  batchDeleteReportsFromFirestore,
  batchUpdateReportsStatusInFirestore
} from './data/firebase';
import { getAllowedTabs } from './utils/permissions';
import { sanitizeText, sanitizeDailyReportInput, sanitizeReason } from './utils/sanitize';
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

// Delegates to centralized permissions module (src/utils/permissions.ts)
export const getAllowedTabsForRole = (role: string): TabKey[] => getAllowedTabs(role as any);

const AUTH_STORAGE_KEY = 'police_meal_auth_session_v3';
const REPORTS_STORAGE_KEY = 'police_daily_reports_v3';
const SUMMARIES_STORAGE_KEY = 'police_monthly_summaries_v3';
const DISABLED_KITCHENS_STORAGE_KEY = 'police_disabled_kitchens_v1';

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

  const [disabledKitchens, setDisabledKitchens] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(DISABLED_KITCHENS_STORAGE_KEY);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to load disabled kitchens from localStorage:', e);
    }
    return [];
  });

  const [kitchens, setKitchens] = useState<Kitchen[]>(() => {
    let savedDisabled: number[] = [];
    try {
      const saved = localStorage.getItem(DISABLED_KITCHENS_STORAGE_KEY);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) savedDisabled = parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return mockKitchens.map(k => ({
      ...k,
      isActive: savedDisabled.includes(k.id) ? false : k.isActive
    }));
  });
  const [tariffs, setTariffs] = useState<KitchenTariff[]>(mockTariffs);

  // 2. שמירת נתונים קבועה (LocalStorage Fallback + Firestore Real-Time)
  const [dailyReports, setDailyReports] = useState<DailyReportRow[]>(() => {
    try {
      const saved = localStorage.getItem(REPORTS_STORAGE_KEY);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to load daily reports from localStorage:', e);
    }
    return initialDailyReports;
  });

  const [monthlySummaries, setMonthlySummaries] = useState<MonthlyKitchenSummary[]>(() => {
    try {
      const saved = localStorage.getItem(SUMMARIES_STORAGE_KEY);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Failed to load monthly summaries from localStorage:', e);
    }
    return initialMonthlySummaries;
  });

  const [activeTab, setActiveTab] = useState<TabKey>('supplier');

  // שמירה ל-localStorage כגיבוי מקומי מהיר
  useEffect(() => {
    try {
      localStorage.setItem(DISABLED_KITCHENS_STORAGE_KEY, JSON.stringify(disabledKitchens));
    } catch (e) {
      console.error('Failed to persist disabled kitchens to localStorage:', e);
    }
  }, [disabledKitchens]);

  useEffect(() => {
    try {
      localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(dailyReports));
    } catch (e) {
      console.error('Failed to persist daily reports to localStorage:', e);
    }
  }, [dailyReports]);

  useEffect(() => {
    try {
      localStorage.setItem(SUMMARIES_STORAGE_KEY, JSON.stringify(monthlySummaries));
    } catch (e) {
      console.error('Failed to persist monthly summaries to localStorage:', e);
    }
  }, [monthlySummaries]);

  // 1. אתחול Firestore וסנכרון בזמן אמת (Real-time onSnapshot Listeners)
  useEffect(() => {
    // אתחול נתונים חכם (Data Seeding) אם הענן ריק
    seedInitialDataIfEmpty(dailyReports, monthlySummaries, disabledKitchens).catch(console.error);

    // האזנה בזמן אמת לכל שורות הדיווח (daily_reports)
    const unsubDaily = subscribeToDailyReports((reports) => {
      setDailyReports(reports);
    });

    // האזנה בזמן אמת לסיכומים החודשיים (monthly_summaries)
    const unsubSummaries = subscribeToMonthlySummaries((summaries) => {
      setMonthlySummaries(summaries);
    });

    // האזנה בזמן אמת להגדרות המערכת ולמטבחים מושבתים (app_config)
    const unsubConfig = subscribeToAppConfig((config) => {
      if (config && Array.isArray(config.disabledKitchens)) {
        setDisabledKitchens(config.disabledKitchens);
        setKitchens(prev => prev.map(k => ({
          ...k,
          isActive: !config.disabledKitchens.includes(k.id)
        })));
      }
    });

    return () => {
      unsubDaily();
      unsubSummaries();
      unsubConfig();
    };
  }, []);

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
    // Sanitize all text inputs before write
    const sanitizedRow = sanitizeDailyReportInput(newRow as Record<string, unknown>) as Omit<DailyReportRow, 'id'>;
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
      ...sanitizedRow,
      id: Date.now()
    };
    setDailyReports(prev => [created, ...prev]);
    saveDailyReportToFirestore(created).catch(console.error);

    setMonthlySummaries(prev => prev.map(s => {
      if (s.kitchenId === sanitizedRow.kitchenId) {
        const newTotalRaw = s.totalReportedRaw + sanitizedRow.rawReportedQty;
        const updatedSummary = {
          ...s,
          totalReportedRaw: newTotalRaw,
          totalRamtalApproved: newTotalRaw
        };
        saveMonthlySummaryToFirestore(updatedSummary).catch(console.error);
        return updatedSummary;
      }
      return s;
    }));
  };

  const handleUpdateDailyReport = (updatedRow: DailyReportRow) => {
    // Sanitize all text inputs before write
    const sanitized = sanitizeDailyReportInput(updatedRow as unknown as Record<string, unknown>) as unknown as DailyReportRow;
    // 4. כאשר ספק עורך ושומר שורה בסטטוס נדרש תיקון, עדכן אך ורק אותה לסטטוס ממתין לאישור רמת"ל
    const finalRow: DailyReportRow = sanitized.status === 'returned_for_revision'
      ? { ...sanitized, status: 'submitted' }
      : sanitized;

    setDailyReports(prev => prev.map(r => r.id === finalRow.id ? finalRow : r));
    saveDailyReportToFirestore(finalRow).catch(console.error);

    setMonthlySummaries(prev => prev.map(s => {
      if (s.kitchenId === finalRow.kitchenId) {
        const kitchenRows = dailyReports.map(r => r.id === finalRow.id ? finalRow : r).filter(r => r.kitchenId === finalRow.kitchenId);
        const sum = kitchenRows.reduce((acc, curr) => acc + (curr.rawReportedQty || 0), 0);
        const updatedSummary = { ...s, totalReportedRaw: sum, totalRamtalApproved: sum };
        saveMonthlySummaryToFirestore(updatedSummary).catch(console.error);
        return updatedSummary;
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
    saveDailyReportToFirestore(duplicated).catch(console.error);

    setMonthlySummaries(prev => prev.map(s => {
      if (s.kitchenId === target.kitchenId) {
        const sum = s.totalReportedRaw + duplicated.rawReportedQty;
        const updatedSummary = { ...s, totalReportedRaw: sum, totalRamtalApproved: sum };
        saveMonthlySummaryToFirestore(updatedSummary).catch(console.error);
        return updatedSummary;
      }
      return s;
    }));
  };

  const handleDeleteDailyReport = (rowId: number) => {
    const target = dailyReports.find(r => r.id === rowId);
    if (!target) return;

    const isRevision = target.status === 'returned_for_revision' || target.status === 'rejected';

    if (isRevision) {
      // 1. תיעוד מחיקת שורות שהוחזרו לתיקון (Audit Trail במסך הרמת"ל)
      const updatedTarget: DailyReportRow = { ...target, status: 'deleted_by_supplier' };
      setDailyReports(prev => prev.map(r => r.id === rowId ? updatedTarget : r));
      saveDailyReportToFirestore(updatedTarget).catch(console.error);
    } else {
      // טיוטה רגילה של ספק נמחקת לחלוטין
      setDailyReports(prev => prev.filter(r => r.id !== rowId));
      deleteDailyReportFromFirestore(rowId).catch(console.error);
    }

    setMonthlySummaries(prev => prev.map(s => {
      if (s.kitchenId === target.kitchenId) {
        const sum = Math.max(0, s.totalReportedRaw - target.rawReportedQty);
        const updatedSummary = { ...s, totalReportedRaw: sum, totalRamtalApproved: sum };
        saveMonthlySummaryToFirestore(updatedSummary).catch(console.error);
        return updatedSummary;
      }
      return s;
    }));
  };

  // 1. תיקון זיהוי תאריכים ושינוי סטטוס בהגשה לרמת"ל (Date Parsing הרמטי)
  const isRowInTargetPeriod = (reportDate: string, targetMonth: number, targetYear: number): boolean => {
    if (!reportDate) return true;
    const str = String(reportDate).trim();

    // 1. בדיקת פורמט YYYY-MM-DD או YYYY/MM/DD
    const isoMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (isoMatch) {
      const y = parseInt(isoMatch[1], 10);
      const m = parseInt(isoMatch[2], 10);
      return y === targetYear && m === targetMonth;
    }

    // 2. בדיקת פורמט ישראלי DD/MM/YYYY או DD-MM-YYYY
    const hebrewMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (hebrewMatch) {
      const m = parseInt(hebrewMatch[2], 10);
      const y = parseInt(hebrewMatch[3], 10);
      return y === targetYear && m === targetMonth;
    }

    // 3. Fallback: Parse via Date
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      return d.getFullYear() === targetYear && (d.getMonth() + 1) === targetMonth;
    }

    return true;
  };

  const handleSubmitMonth = async ({ kitchenId, month, year, summaryId }: { kitchenId: number; month: number; year: number; summaryId?: number }) => {
    const nowIso = new Date().toISOString().replace('T', ' ').substring(0, 16);

    try {
      await fetch(`${API_BASE}/reports/submit-month`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kitchenId, month, year, summaryId })
      });
    } catch (e) {
      console.error(e);
    }

    // 1. חוק ברזל: עדכון ל-submitted אך ורק עבור שורות בסטטוס draft!
    const updatedReports = dailyReports.map(r => {
      if (r.kitchenId === kitchenId) {
        const isDraft = (r.status || 'draft') === 'draft';
        if (isDraft && isRowInTargetPeriod(r.reportDate, month, year)) {
          const updated = { ...r, status: 'submitted' as const };
          saveDailyReportToFirestore(updated).catch(console.error);
          return updated;
        }
      }
      return r;
    });
    setDailyReports(updatedReports);

    // 2. עדכון / יצירת סיכום חודשי עבור המטבח
    const kitchenReports = updatedReports.filter(r => r.kitchenId === kitchenId);
    const totalRaw = kitchenReports.reduce((acc, curr) => acc + (curr.rawReportedQty || 0), 0);
    const existing = monthlySummaries.find(s => s.kitchenId === kitchenId || (summaryId && s.id === summaryId));

    let summaryToSave: MonthlyKitchenSummary;
    if (existing) {
      summaryToSave = {
        ...existing,
        status: 'submitted',
        submittedAt: nowIso,
        periodYear: year,
        periodMonth: month,
        totalReportedRaw: totalRaw > 0 ? totalRaw : existing.totalReportedRaw,
        totalRamtalApproved: totalRaw > 0 ? totalRaw : existing.totalRamtalApproved
      };
    } else {
      const k = kitchens.find(k => k.id === kitchenId);
      summaryToSave = {
        id: summaryId || Date.now(),
        kitchenId,
        kitchenName: k?.name || `מטבח #${kitchenId}`,
        supplierId: k?.supplierId || currentUser.supplierId || 1,
        supplierName: currentUser.fullName,
        periodYear: year,
        periodMonth: month,
        ramtalUserId: k?.defaultRamtalUserId || 2,
        ramtalUserName: 'רפ"ק אבי כהן (רמת"ל)',
        totalReportedRaw: totalRaw,
        totalRamtalApproved: totalRaw,
        calculatedNetMeals: totalRaw,
        calculatedTotalAmountNis: 0,
        calculationAudit: [],
        status: 'submitted',
        submittedAt: nowIso
      };
    }

    setMonthlySummaries(prev => {
      const idx = prev.findIndex(s => s.kitchenId === kitchenId || (summaryId && s.id === summaryId));
      if (idx >= 0) {
        const arr = [...prev];
        arr[idx] = summaryToSave;
        return arr;
      }
      return [summaryToSave, ...prev];
    });

    saveMonthlySummaryToFirestore(summaryToSave).catch(console.error);
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

    const targetSummary = monthlySummaries.find(s => s.id === summaryId);
    if (!targetSummary) return;

    const k = kitchens.find(item => item.id === targetSummary.kitchenId);
    const kReports = dailyReports.filter(r => r.kitchenId === targetSummary.kitchenId);
    const kTariffs = mockTariffs.filter(t => t.kitchenId === targetSummary.kitchenId);
    const calc = k ? MealCalculationEngine.calculateMonthlySummary(k, kReports, kTariffs) : null;

    const updatedSummary: MonthlyKitchenSummary = {
      ...targetSummary,
      status: 'ramtal_approved',
      ramtalApprovedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      calculatedNetMeals: calc?.finalCalculatedMeals || targetSummary.totalRamtalApproved,
      calculatedTotalAmountNis: calc?.finalTotalAmountNis || (targetSummary.totalRamtalApproved * 25)
    };

    setMonthlySummaries(prev => prev.map(s => s.id === summaryId ? updatedSummary : s));
    saveMonthlySummaryToFirestore(updatedSummary).catch(console.error);

    setDailyReports(prev => prev.map(r => {
      if (r.kitchenId === targetSummary.kitchenId) {
        const updated = { ...r, status: 'ramtal_approved' as const };
        saveDailyReportToFirestore(updated).catch(console.error);
        return updated;
      }
      return r;
    }));
  };

  const handleReturnSummary = async (summaryId: number, reason: string) => {
    const cleanReason = sanitizeReason(reason);
    try {
      await fetch(`${API_BASE}/reports/ramtal-return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summaryId, reason })
      });
    } catch (e) {
      console.error(e);
    }

    const targetSummary = monthlySummaries.find(s => s.id === summaryId);
    if (!targetSummary) return;

    const updatedSummary: MonthlyKitchenSummary = {
      ...targetSummary,
      status: 'returned_for_revision',
      revisionReason: cleanReason
    };

    setMonthlySummaries(prev => prev.map(s => s.id === summaryId ? updatedSummary : s));
    saveMonthlySummaryToFirestore(updatedSummary).catch(console.error);

    setDailyReports(prev => prev.map(r => {
      if (r.kitchenId === targetSummary.kitchenId) {
        const updated = { ...r, status: 'returned_for_revision' as const };
        saveDailyReportToFirestore(updated).catch(console.error);
        return updated;
      }
      return r;
    }));
  };

  const handleApproveDailyRow = (rowId: number) => {
    setDailyReports(prev => {
      const updated = prev.map(r => {
        if (r.id === rowId) {
          const u = { ...r, status: 'ramtal_approved' as const };
          saveDailyReportToFirestore(u).catch(console.error);
          return u;
        }
        return r;
      });
      const targetRow = prev.find(r => r.id === rowId);
      if (targetRow) {
        const kitchenRows = updated.filter(r => r.kitchenId === targetRow.kitchenId);
        const allApproved = kitchenRows.length > 0 && kitchenRows.every(r => r.status === 'ramtal_approved' || r.status === 'food_dept_approved');
        if (allApproved) {
          setMonthlySummaries(mPrev => mPrev.map(s => {
            if (s.kitchenId === targetRow.kitchenId) {
              const uSum = {
                ...s,
                status: 'ramtal_approved' as const,
                ramtalApprovedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
              };
              saveMonthlySummaryToFirestore(uSum).catch(console.error);
              return uSum;
            }
            return s;
          }));
        }
      }
      return updated;
    });
  };

  const handleReturnDailyRow = (rowId: number, reason: string) => {
    const cleanReason = sanitizeReason(reason);
    setDailyReports(prev => {
      const updated = prev.map(r => {
        if (r.id === rowId) {
          const u = {
            ...r,
            status: 'returned_for_revision' as const,
            ramtalAdjustmentReason: cleanReason
          };
          saveDailyReportToFirestore(u).catch(console.error);
          return u;
        }
        return r;
      });
      const targetRow = prev.find(r => r.id === rowId);
      if (targetRow) {
        setMonthlySummaries(mPrev => mPrev.map(s => {
          if (s.kitchenId === targetRow.kitchenId) {
            const uSum = {
              ...s,
              status: 'returned_for_revision' as const,
              revisionReason: cleanReason
            };
            saveMonthlySummaryToFirestore(uSum).catch(console.error);
            return uSum;
          }
          return s;
        }));
      }
      return updated;
    });
  };

  const handleAdjustDailyRow = async (rowId: number, newQty: number, reason: string) => {
    const cleanReason = sanitizeReason(reason);
    try {
      await fetch(`${API_BASE}/reports/ramtal-adjust-row`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rowId, newQty, reason: cleanReason })
      });
    } catch (e) {
      console.error(e);
    }

    setDailyReports(prev => {
      const updated = prev.map(r => {
        if (r.id === rowId) {
          const u = {
            ...r,
            ramtalAdjustedQty: newQty,
            ramtalAdjustmentReason: cleanReason,
            status: 'ramtal_approved' as const
          };
          saveDailyReportToFirestore(u).catch(console.error);
          return u;
        }
        return r;
      });
      const targetRow = prev.find(r => r.id === rowId);
      if (targetRow) {
        const kitchenRows = updated.filter(r => r.kitchenId === targetRow.kitchenId);
        const totalApproved = kitchenRows.reduce((acc, curr) => acc + (curr.ramtalAdjustedQty !== undefined ? curr.ramtalAdjustedQty : curr.rawReportedQty || 0), 0);
        setMonthlySummaries(mPrev => mPrev.map(s => {
          if (s.kitchenId === targetRow.kitchenId) {
            const uSum = { ...s, totalRamtalApproved: totalApproved };
            saveMonthlySummaryToFirestore(uSum).catch(console.error);
            return uSum;
          }
          return s;
        }));
      }
      return updated;
    });
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
        const uSum = {
          ...s,
          status: 'food_dept_approved' as const,
          foodDeptApprovedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
        saveMonthlySummaryToFirestore(uSum).catch(console.error);
        return uSum;
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

    setDisabledKitchens(prev => {
      const isCurrentlyDisabled = prev.includes(kitchenId);
      const updated = isCurrentlyDisabled
        ? prev.filter(id => id !== kitchenId)
        : [...prev, kitchenId];
      try {
        localStorage.setItem(DISABLED_KITCHENS_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }
      saveDisabledKitchensToFirestore(updated).catch(console.error);
      return updated;
    });

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

  // 4. פעולות איפוס ומחיקה של מנהל מערכת בלבד (Admin / zeev) - 3 היקפי פעולה מוגדרים
  const isKitchenInScope = (kId: number, scope: 'current_kitchen' | 'current_supplier' | 'all_kitchens', targetKitchenId?: number, targetSupplierId?: number) => {
    if (scope === 'all_kitchens') return true;
    if (scope === 'current_kitchen') return targetKitchenId !== undefined && kId === targetKitchenId;
    if (scope === 'current_supplier') {
      const k = kitchens.find(item => item.id === kId);
      return k?.supplierId === targetSupplierId;
    }
    return true;
  };

  const handleAdminResetDrafts = ({
    scope = 'all_kitchens',
    kitchenId,
    supplierId,
    filterType
  }: {
    scope?: 'current_kitchen' | 'current_supplier' | 'all_kitchens';
    kitchenId?: number;
    supplierId?: number;
    filterType: 'today' | 'month' | 'all';
  }) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const currentMonthPrefix = todayStr.substring(0, 7);
    const idsToDelete: number[] = [];

    setDailyReports(prev => {
      const filtered = prev.filter(row => {
        const isDraft = (row.status || 'draft') === 'draft';
        if (!isDraft) return true; // Keep submitted / approved rows
        if (!isKitchenInScope(row.kitchenId, scope, kitchenId, supplierId)) return true;
        if (filterType === 'today' && row.reportDate !== todayStr) return true;
        if (filterType === 'month' && !row.reportDate.startsWith(currentMonthPrefix)) return true;
        idsToDelete.push(row.id);
        return false; // Delete matching draft
      });
      try {
        localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(filtered));
      } catch (e) {
        console.error(e);
      }
      return filtered;
    });

    if (idsToDelete.length > 0) {
      batchDeleteReportsFromFirestore(idsToDelete).catch(console.error);
    }
  };

  const handleAdminDeleteAllReports = ({
    scope = 'all_kitchens',
    kitchenId,
    supplierId,
    filterType
  }: {
    scope?: 'current_kitchen' | 'current_supplier' | 'all_kitchens';
    kitchenId?: number;
    supplierId?: number;
    filterType: 'today' | 'month' | 'all';
  }) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const currentMonthPrefix = todayStr.substring(0, 7);

    if (scope === 'all_kitchens' && filterType === 'all') {
      // 1. איפוס מוחלט (Master Reset) ל-0 שורות ו-0 סיכומים במערכת
      const allReportIds = dailyReports.map(r => r.id);
      setDailyReports([]);
      setMonthlySummaries([]);
      try {
        localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify([]));
        localStorage.setItem(SUMMARIES_STORAGE_KEY, JSON.stringify([]));
      } catch (e) {
        console.error(e);
      }
      if (allReportIds.length > 0) {
        batchDeleteReportsFromFirestore(allReportIds).catch(console.error);
      }
      return;
    }

    const idsToDelete: number[] = [];
    setDailyReports(prev => {
      const filtered = prev.filter(row => {
        if (!isKitchenInScope(row.kitchenId, scope, kitchenId, supplierId)) return true;
        if (filterType === 'today' && row.reportDate !== todayStr) return true;
        if (filterType === 'month' && !row.reportDate.startsWith(currentMonthPrefix)) return true;
        idsToDelete.push(row.id);
        return false; // Delete matching report
      });
      try {
        localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(filtered));
      } catch (e) {
        console.error(e);
      }
      return filtered;
    });

    if (idsToDelete.length > 0) {
      batchDeleteReportsFromFirestore(idsToDelete).catch(console.error);
    }

    // Reset summaries for matching kitchens
    setMonthlySummaries(prev => {
      const updated = prev.filter(s => {
        if (isKitchenInScope(s.kitchenId, scope, kitchenId, supplierId)) {
          if (filterType === 'all') return false; // wipe summary for scope
        }
        return true;
      });
      try {
        localStorage.setItem(SUMMARIES_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
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
        selectedPeriod={{
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear()
        }}
        onLockSystem={handleLogout}
        onLogout={handleLogout}
        isSuperAdmin={isSuperAdmin}
      />

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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 relative">
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
            isSuperAdmin={isSuperAdmin}
            kitchens={kitchens}
            disabledKitchens={disabledKitchens}
            mealTypes={mockMealTypes}
            dailyReports={dailyReports}
            monthlySummaries={monthlySummaries}
            onAddDailyReport={handleAddDailyReport}
            onUpdateDailyReport={handleUpdateDailyReport}
            onDuplicateDailyReport={handleDuplicateDailyReport}
            onDeleteDailyReport={handleDeleteDailyReport}
            onSubmitMonth={handleSubmitMonth}
            onToggleKitchenActive={handleToggleKitchenActive}
            onAdminResetDrafts={handleAdminResetDrafts}
            onAdminDeleteAllReports={handleAdminDeleteAllReports}
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
            onApproveDailyRow={handleApproveDailyRow}
            onReturnDailyRow={handleReturnDailyRow}
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