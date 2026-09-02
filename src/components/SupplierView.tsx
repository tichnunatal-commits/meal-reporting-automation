import React, { useState, useRef } from 'react';
import { DailyReportRow, Kitchen, MealType, MonthlyKitchenSummary, User } from '../types';
import {
  Plus,
  Send,
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trash2,
  Calendar,
  Utensils,
  Edit2,
  Copy,
  Check,
  X,
  Lock,
  Paperclip,
  RotateCcw,
  Shield
} from 'lucide-react';
import { SearchableKitchenSelect, formatKitchenDisplayName } from './SearchableKitchenSelect';
import { filterKitchensForSupplier } from '../data/supplierKitchenMap';

interface SupplierViewProps {
  currentUser: User;
  isSuperAdmin?: boolean;
  kitchens: Kitchen[];
  disabledKitchens?: number[];
  mealTypes: MealType[];
  dailyReports: DailyReportRow[];
  monthlySummaries: MonthlyKitchenSummary[];
  onAddDailyReport: (report: Omit<DailyReportRow, 'id'>) => void;
  onUpdateDailyReport?: (updatedRow: DailyReportRow) => void;
  onAutoSaveDailyReport?: (reportId: number, fields: Partial<DailyReportRow>) => void;
  onDuplicateDailyReport?: (rowId: number) => void;
  onDeleteDailyReport?: (rowId: number) => void;
  onSubmitMonth: (options: { kitchenId: number; month: number; year: number; summaryId?: number }) => void;
  onToggleKitchenActive?: (kitchenId: number) => void;
  onAdminResetDrafts?: (options: { scope?: 'current_kitchen' | 'current_supplier' | 'all_kitchens'; kitchenId?: number; supplierId?: number; filterType: 'today' | 'month' | 'all' }) => void;
  onAdminDeleteAllReports?: (options: { scope?: 'current_kitchen' | 'current_supplier' | 'all_kitchens'; kitchenId?: number; supplierId?: number; filterType: 'today' | 'month' | 'all' }) => void;
}

export const SupplierView: React.FC<SupplierViewProps> = ({
  currentUser,
  isSuperAdmin = false,
  kitchens,
  disabledKitchens = [],
  mealTypes,
  dailyReports,
  monthlySummaries,
  onAddDailyReport,
  onUpdateDailyReport,
  onAutoSaveDailyReport,
  onDuplicateDailyReport,
  onDeleteDailyReport,
  onSubmitMonth,
  onToggleKitchenActive,
  onAdminResetDrafts,
  onAdminDeleteAllReports
}) => {
  const isUserAdmin = isSuperAdmin || currentUser.role === 'system_admin';
  const [adminSupplierFilter, setAdminSupplierFilter] = useState<number | 'all'>('all');

  // 4. הרחבת הרשאות מטבחים למנהל מערכת (Admin / zeev): כל 124 המטבחים במערכת
  const allowedKitchens = isUserAdmin
    ? (adminSupplierFilter === 'all' ? kitchens : kitchens.filter(k => k.supplierId === adminSupplierFilter))
    : filterKitchensForSupplier(kitchens, currentUser.supplierId || 1);

  const myKitchens = [...allowedKitchens].sort((a, b) => {
    const clusterComp = (a.cluster || a.region || '').localeCompare(b.cluster || b.region || '', 'he');
    if (clusterComp !== 0) return clusterComp;
    return a.name.localeCompare(b.name, 'he');
  });

  const [selectedKitchenId, setSelectedKitchenId] = useState<number>(myKitchens[0]?.id || 1);

  // 1. סריקה חוצת-מטבחים של הספק המחובר (Cross-Kitchen Status Audit)
  const returnedKitchens = myKitchens.filter(k => {
    const summary = monthlySummaries.find(s => s.kitchenId === k.id);
    const kReports = dailyReports.filter(r => r.kitchenId === k.id && r.status !== 'deleted_by_supplier');
    // חוק ברזל: אם למטבח יש 0 שורות דיווח, אין להציג עבורו באנר חזרה לתיקון (מניעת Deadlock יתום)
    if (kReports.length === 0) return false;
    const isSummaryReturned = summary?.status === 'returned_for_revision' || summary?.status === 'rejected';
    const hasReturnedRows = kReports.some(r => r.status === 'returned_for_revision' || r.status === 'rejected');
    return isSummaryReturned || hasReturnedRows;
  });

  const approvedKitchens = myKitchens.filter(k => {
    if (returnedKitchens.some(rk => rk.id === k.id)) return false;
    const summary = monthlySummaries.find(s => s.kitchenId === k.id);
    return summary?.status === 'ramtal_approved' || summary?.status === 'approved' || summary?.status === 'food_dept_approved';
  });

  const [dismissedApprovedIds, setDismissedApprovedIds] = useState<number[]>(() => {
    try {
      const saved = sessionStorage.getItem('police_dismissed_approved_banners');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleDismissApprovedAlert = (kitchenIdsToDismiss?: number[]) => {
    setDismissedApprovedIds(prev => {
      const idsToAdd = kitchenIdsToDismiss || approvedKitchens.map(k => k.id);
      const updated = Array.from(new Set([...prev, ...idsToAdd]));
      try {
        sessionStorage.setItem('police_dismissed_approved_banners', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const activeApprovedKitchens = approvedKitchens.filter(k => !dismissedApprovedIds.includes(k.id));

  // Sync selectedKitchenId when supplier filter changes
  React.useEffect(() => {
    if (myKitchens.length > 0 && !myKitchens.some(k => k.id === selectedKitchenId)) {
      setSelectedKitchenId(myKitchens[0].id);
    }
  }, [adminSupplierFilter, myKitchens]);

  const selectedKitchen = kitchens.find(k => k.id === selectedKitchenId);
  const isKitchenDisabled = disabledKitchens.includes(selectedKitchenId) || selectedKitchen?.isActive === false;
  const currentSummary = monthlySummaries.find(s => s.kitchenId === selectedKitchenId);
  const currentReports = dailyReports.filter(r => r.kitchenId === selectedKitchenId && r.status !== 'deleted_by_supplier');
  const isMonthSubmitted = currentSummary?.status === 'submitted' || currentSummary?.status === 'ramtal_approved' || currentSummary?.status === 'food_dept_approved' || currentSummary?.status === 'locked';

  // Form states
  const [reportDate, setReportDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [mealTypeId, setMealTypeId] = useState<number>(2);
  const [diningHallQty, setDiningHallQty] = useState<number | ''>(100);
  const [takeawayQty, setTakeawayQty] = useState<number | ''>(30);
  const [transportKm, setTransportKm] = useState<number | ''>(45);
  const [isSpecialEvent, setIsSpecialEvent] = useState<boolean>(false);
  const [eventCostNis, setEventCostNis] = useState<number | ''>(0);
  const [notes, setNotes] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<string>('');
  const [successBannerMessage, setSuccessBannerMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Month & Year selection for submission
  const [selectedSubmitMonth, setSelectedSubmitMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedSubmitYear, setSelectedSubmitYear] = useState<number>(new Date().getFullYear());

  // Inline Row Editing states
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [editDate, setEditDate] = useState<string>('');
  const [editMealTypeId, setEditMealTypeId] = useState<number>(1);
  const [editDiningQty, setEditDiningQty] = useState<number | ''>(0);
  const [editTakeawayQty, setEditTakeawayQty] = useState<number | ''>(0);
  const [editTransportKm, setEditTransportKm] = useState<number | ''>(0);
  const [editEventCost, setEditEventCost] = useState<number | ''>(0);
  const [editNotes, setEditNotes] = useState<string>('');

  // Confirm Modals
  const [deleteConfirmRowId, setDeleteConfirmRowId] = useState<number | null>(null);
  const [showSubmitConfirmModal, setShowSubmitConfirmModal] = useState<boolean>(false);

  // Admin Panel states
  const [adminFilterScope, setAdminFilterScope] = useState<'current_kitchen' | 'current_supplier' | 'all_kitchens'>('current_kitchen');
  const [adminFilterTime, setAdminFilterTime] = useState<'today' | 'month' | 'all'>('month');
  const [showResetDraftsModal, setShowResetDraftsModal] = useState<boolean>(false);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState<boolean>(false);
  const [masterDeleteConfirmText, setMasterDeleteConfirmText] = useState<string>('');

  const isTransportMeal = (typeId: number) => typeId === 9 || typeId === 10;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file.name);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const [autoSavedRowId, setAutoSavedRowId] = useState<number | null>(null);

  const autoSaveRowField = (rowId: number, fields: Partial<DailyReportRow>) => {
    if (onAutoSaveDailyReport) {
      onAutoSaveDailyReport(rowId, fields);
      setAutoSavedRowId(rowId);
      setTimeout(() => setAutoSavedRowId(null), 2500);
    }
  };

  const startEditRow = (row: DailyReportRow) => {
    if (isKitchenDisabled) {
      alert('תחנה זו הושבתה ע"י מנהל המערכת (סוף חודש). עריכת שורות חסומה כעת!');
      return;
    }
    setEditingRowId(row.id);
    setEditDate(row.reportDate);
    setEditMealTypeId(row.mealTypeId);
    setEditDiningQty(row.diningHallQty);
    setEditTakeawayQty(row.takeawayQty);
    setEditTransportKm(isTransportMeal(row.mealTypeId) ? row.rawReportedQty : 0);
    setEditEventCost(row.eventCostNis || 0);
    setEditNotes(row.notes || '');
  };

  const cancelEditRow = () => {
    setEditingRowId(null);
  };

  const saveEditRow = (row: DailyReportRow) => {
    if (isKitchenDisabled) {
      alert('תחנה זו הושבתה ע"י מנהל המערכת (סוף חודש). עריכת שורות חסומה כעת!');
      return;
    }
    if (!editNotes.trim()) {
      alert('הערה לשורה / מספר אסמכתא הינו שדה חובה (*)!');
      return;
    }

    const isTr = isTransportMeal(editMealTypeId);
    const mType = mealTypes.find(m => m.id === editMealTypeId);

    let dQty = 0;
    let tQty = 0;
    let totalQty = 0;

    if (row.isSpecialEvent) {
      totalQty = 0;
    } else if (isTr) {
      const km = Number(editTransportKm) || 0;
      if (km <= 0) {
        alert('נא להזין כמות ק"מ גדולה מ-0 עבור שינוע!');
        return;
      }
      totalQty = km;
    } else {
      dQty = Number(editDiningQty) || 0;
      tQty = Number(editTakeawayQty) || 0;
      if (dQty <= 0 && tQty <= 0) {
        alert('חובה למלא לפחות אחד מהשדות: חד"א פנימי או משיכות קו/חוץ (כמות הגדולה מ-0)!');
        return;
      }
      totalQty = dQty + tQty;
    }

    const updated: DailyReportRow = {
      ...row,
      reportDate: editDate,
      mealTypeId: editMealTypeId,
      mealTypeName: mType?.nameHebrew || row.mealTypeName,
      diningHallQty: isTr ? 0 : dQty,
      takeawayQty: isTr ? 0 : tQty,
      rawReportedQty: totalQty,
      eventCostNis: row.isSpecialEvent ? Number(editEventCost) || 0 : undefined,
      notes: editNotes.trim(),
      status: row.status === 'returned_for_revision' ? 'draft' : row.status
    };

    if (onUpdateDailyReport) {
      onUpdateDailyReport(updated);
    }
    setEditingRowId(null);
  };

  const confirmDeleteRow = (rowId: number) => {
    if (isKitchenDisabled) {
      alert('תחנה זו הושבתה ע"י מנהל המערכת (סוף חודש). מחיקת שורות חסומה כעת!');
      return;
    }
    if (onDeleteDailyReport) {
      onDeleteDailyReport(rowId);
    }
    setDeleteConfirmRowId(null);
  };

  const handleAddRow = (e: React.FormEvent) => {
    e.preventDefault();

    if (isKitchenDisabled) {
      alert('תחנה זו הושבתה ע"י מנהל המערכת (סוף חודש). הזנת דיווחים, עריכה ושליחה לבדיקה חסומות כעת.');
      return;
    }

    // 1. Mandatory note validation
    if (!notes.trim()) {
      alert('הערה לשורה / מספר אסמכתא הינו שדה חובה (*)!');
      return;
    }

    const isTr = isTransportMeal(mealTypeId);
    let dQty = 0;
    let tQty = 0;
    let totalQty = 0;

    if (isSpecialEvent) {
      const cost = Number(eventCostNis) || 0;
      if (cost <= 0) {
        alert('נא להזין סכום תקין בש"ח עבור אירוע מיוחד!');
        return;
      }
    } else if (isTr) {
      const km = Number(transportKm) || 0;
      if (km <= 0) {
        alert('נא להזין סה"כ קילומטרים (ק"מ) גדול מ-0 עבור שינוע!');
        return;
      }
      totalQty = km;
    } else {
      dQty = Number(diningHallQty) || 0;
      tQty = Number(takeawayQty) || 0;
      // 4. At least one must be > 0
      if (dQty <= 0 && tQty <= 0) {
        alert('חובה למלא לפחות אחד מהשדות: חד"א פנימי או משיכות קו/חוץ (כמות הגדולה מ-0)!');
        return;
      }
      totalQty = dQty + tQty;
    }

    const mealType = mealTypes.find(m => m.id === mealTypeId);

    onAddDailyReport({
      monthlySummaryId: currentSummary?.id || 1,
      kitchenId: selectedKitchenId,
      reportDate,
      mealTypeId: mealTypeId,
      mealTypeName: mealType?.nameHebrew || 'ארוחה',
      diningHallQty: isTr ? 0 : dQty,
      takeawayQty: isTr ? 0 : tQty,
      rawReportedQty: totalQty,
      isSpecialEvent,
      eventCostNis: isSpecialEvent ? Number(eventCostNis) || 0 : undefined,
      notes: notes.trim(),
      attachmentFileName: uploadedFile || undefined,
      status: 'draft'
    });

    // Reset Form
    setDiningHallQty('');
    setTakeawayQty('');
    setTransportKm('');
    setNotes('');
    setUploadedFile('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (isSpecialEvent) {
      setIsSpecialEvent(false);
      setEventCostNis(0);
    }
  };

  const totalReportedMeals = currentReports.reduce((sum, r) => sum + r.rawReportedQty, 0);

  // Helper for 4 exact statuses
  const getStatusBadge = (row: DailyReportRow) => {
    const s = row.status || 'draft';

    if (s === 'returned_for_revision' || s === 'rejected') {
      return (
        <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 border border-rose-300 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
          <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
          <span>נדרש תיקון</span>
        </span>
      );
    }

    if (s === 'submitted') {
      return (
        <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 border border-blue-300 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
          <Clock className="w-3 h-3 text-blue-600 shrink-0" />
          <span>ממתין לאישור רמת"ל</span>
        </span>
      );
    }

    if (s === 'ramtal_approved' || s === 'approved' || s === 'food_dept_approved') {
      return (
        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
          <span>מאושר</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 border border-amber-300 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
        <FileText className="w-3 h-3 text-amber-600 shrink-0" />
        <span>טיוטה</span>
      </span>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Top Success Toast Banner */}
      {successBannerMessage && (
        <div className="bg-emerald-600 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2.5 font-bold text-xs sm:text-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-200" />
            <span>{successBannerMessage}</span>
          </div>
          <button
            onClick={() => setSuccessBannerMessage(null)}
            className="p-1 hover:bg-emerald-700 rounded-lg transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 4. פאנל ניהול ואיפוס למנהל מערכת בלבד (Admin / zeev) */}
      {(currentUser.role === 'system_admin' || isSuperAdmin) && (
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-4 sm:p-5 rounded-2xl border border-indigo-500/30 shadow-lg space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/60 pb-3">
            <div className="flex items-center gap-2.5">
              <Shield className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-white flex items-center gap-2">
                  <span>פאנל ניהול ואיפוס דיווחים</span>
                  <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] px-2 py-0.5 rounded-full font-mono">ADMIN ONLY</span>
                </h4>
                <p className="text-[11px] text-slate-300">פעולות איפוס ומחיקה גורפות של דיווחים (זאב נאורי / מנהל מערכת)</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <select
                value={adminFilterScope}
                onChange={(e) => setAdminFilterScope(e.target.value as any)}
                className="bg-slate-800 border border-slate-600 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400 font-medium"
              >
                <option value="current_kitchen">מטבח נוכחי בלבד ({selectedKitchen?.name})</option>
                <option value="current_supplier">כל המטבחים של הספק הנוכחי ({adminSupplierFilter !== 'all' ? (adminSupplierFilter === 1 ? 'קייטרינג גורמה (3 תחנות)' : adminSupplierFilter === 2 ? 'מבושלת בע"מ (79 תחנות)' : adminSupplierFilter === 3 ? 'קייטרינג ליבר (40 תחנות)' : 'סודקסו ישראל (2 תחנות)') : `${selectedKitchen?.supplierId === 1 ? 'קייטרינג גורמה (3 תחנות)' : selectedKitchen?.supplierId === 2 ? 'מבושלת בע"מ (79 תחנות)' : selectedKitchen?.supplierId === 3 ? 'קייטרינג ליבר (40 תחנות)' : 'סודקסו ישראל (2 תחנות)'}`})</option>
                <option value="all_kitchens">כל 124 המטבחים במערכת (גלובלי)</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setShowResetDraftsModal(true)}
                className="flex items-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-400/40 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <span>איפוס טיוטות</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteAllModal(true)}
                className="flex items-center gap-1.5 bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700/60 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>מאסטר: מחיקת כל הדיווחים</span>
              </button>

              <button
                type="button"
                onClick={() => onToggleKitchenActive && onToggleKitchenActive(selectedKitchenId)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs ${
                  isKitchenDisabled
                    ? 'bg-emerald-500/25 hover:bg-emerald-500/40 text-emerald-200 border border-emerald-400/50'
                    : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/40'
                }`}
                title="שינוי סטטוס פעילות התחנה הנבחרת"
              >
                <span>{isKitchenDisabled ? '✅ הפעל מטבח' : '⛔ השבת מטבח (סוף חודש)'}</span>
              </button>
            </div>

            <div className="text-[11px] text-slate-400">
              סה"כ דיווחים שמורים במערכת: <strong className="text-white">{dailyReports.length}</strong> שורות (מתוכם <strong className="text-amber-300">{dailyReports.filter(r => (r.status || 'draft') === 'draft').length}</strong> טיוטות)
            </div>
          </div>
        </div>
      )}

      {/* 2. באנר התראה חוצה-מטבחים: דיווחים שחזרו לתיקון מהרמת"ל (אדום/כתום) */}
      {returnedKitchens.length > 0 && (
        <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-amber-900 border-2 border-rose-500/80 text-white p-4 sm:p-5 rounded-2xl shadow-xl space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-rose-500/20 rounded-xl border border-rose-400/40 shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-300 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                  <span>⚠️ שים לב: התקבלו דיווחים שחזרו לתיקון מהרמת"ל בתחנות הבאות:</span>
                </h3>
                <p className="text-xs text-rose-200 mt-0.5">
                  קיימים דיווחים הדורשים תיקון והגשה מחדש ע"י הספק כדי לאפשר סגירת חודש ותשלום.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1 border-t border-rose-700/50">
            {returnedKitchens.map(k => (
              <div
                key={k.id}
                className="bg-rose-950/80 border border-rose-400/40 rounded-xl px-3 py-1.5 flex items-center justify-between gap-3 shadow-xs"
              >
                <span className="text-xs font-bold text-rose-100">{k.name}</span>
                <button
                  type="button"
                  onClick={() => setSelectedKitchenId(k.id)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                    selectedKitchenId === k.id
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : 'bg-rose-600 hover:bg-rose-500 text-white'
                  }`}
                >
                  <span>{selectedKitchenId === k.id ? '📍 בתצוגה כעת' : 'עבור לתיקון ➔'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. באנר התראה חוצה-מטבחים: דיווחים שאושרו ע"י הרמת"ל (ירוק) */}
      {activeApprovedKitchens.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 border-2 border-emerald-500/80 text-white p-4 sm:p-5 rounded-2xl shadow-xl space-y-3 relative">
          <button
            type="button"
            onClick={() => handleDismissApprovedAlert()}
            className="absolute top-3 left-3 text-emerald-200 hover:text-white bg-emerald-800/50 hover:bg-emerald-700/60 p-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer border border-emerald-500/30"
            title="הבנתי / סגור התראה"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">הבנתי / סגור</span>
          </button>

          <div className="flex items-start gap-2.5 pr-0 sm:pr-2">
            <div className="p-2 bg-emerald-500/20 rounded-xl border border-emerald-400/40 shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                <span>✅ עדכון: הדיווח החודשי אושר בהצלחה ע"י הרמת"ל בתחנות הבאות:</span>
              </h3>
              <p className="text-xs text-emerald-200 mt-0.5">
                הדוחות אושרו רשמית והועברו לבקרת מדור מזון (R1–R5).
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1 border-t border-emerald-800/50">
            {activeApprovedKitchens.map(k => (
              <div
                key={k.id}
                className="bg-emerald-950/80 border border-emerald-400/40 rounded-xl px-3 py-1.5 flex items-center justify-between gap-3 shadow-xs"
              >
                <span className="text-xs font-bold text-emerald-100">{k.name}</span>
                <button
                  type="button"
                  onClick={() => setSelectedKitchenId(k.id)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                    selectedKitchenId === k.id
                      ? 'bg-emerald-400 text-slate-950 shadow-xs'
                      : 'bg-emerald-700 hover:bg-emerald-600 text-white'
                  }`}
                >
                  <span>{selectedKitchenId === k.id ? '📍 בתצוגה כעת' : 'צפה באישור ➔'}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Banner: Kitchen selection & status */}
      <div className="space-y-3">
        {/* 4. הרחבת הרשאות מטבחים למנהל מערכת (Admin / zeev) */}
        {isUserAdmin && (
          <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white border border-indigo-500/30 rounded-2xl p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs shadow-md">
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-slate-950 font-extrabold px-2 py-0.5 rounded-full text-[10px] font-mono">ADMIN ACCESS</span>
              <span className="font-bold text-white text-xs">גישת מנהל לכל 124 המטבחים — סנן לפי ספק מורשה:</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setAdminSupplierFilter('all')}
                className={`px-3 py-1 rounded-xl font-bold text-xs transition cursor-pointer ${
                  adminSupplierFilter === 'all'
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                🏛️ כל 124 המטבחים
              </button>
              <button
                type="button"
                onClick={() => setAdminSupplierFilter(1)}
                className={`px-3 py-1 rounded-xl font-bold text-xs transition cursor-pointer ${
                  adminSupplierFilter === 1
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                קייטרינג גורמה ({kitchens.filter(k => k.supplierId === 1).length})
              </button>
              <button
                type="button"
                onClick={() => setAdminSupplierFilter(2)}
                className={`px-3 py-1 rounded-xl font-bold text-xs transition cursor-pointer ${
                  adminSupplierFilter === 2
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                מבושלת בע"מ ({kitchens.filter(k => k.supplierId === 2).length})
              </button>
              <button
                type="button"
                onClick={() => setAdminSupplierFilter(3)}
                className={`px-3 py-1 rounded-xl font-bold text-xs transition cursor-pointer ${
                  adminSupplierFilter === 3
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                קייטרינג ליבר ({kitchens.filter(k => k.supplierId === 3).length})
              </button>
              <button
                type="button"
                onClick={() => setAdminSupplierFilter(4)}
                className={`px-3 py-1 rounded-xl font-bold text-xs transition cursor-pointer ${
                  adminSupplierFilter === 4
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                סודקסו ישראל ({kitchens.filter(k => k.supplierId === 4).length})
              </button>
            </div>
          </div>
        )}

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
          <div>
            <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
              {isUserAdmin ? 'מנהל מערכת (זאב נאורי)' : 'נציג ספק הסעדה'}
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 mt-1">יומן דיווח כמויות ארוחות</h2>
            <p className="text-xs text-slate-500">
              {isUserAdmin ? `צפייה והזנה עבור ${myKitchens.length} מטבחים מורשים` : 'הזנת נתונים יומיים מחוץ לשעון וצירוף אסמכתאות'}
            </p>
          </div>

          <div className="w-full sm:w-80">
            <label className="block text-[11px] font-medium text-slate-600 mb-1 sm:hidden">בחר מטבח מדווח:</label>
            <SearchableKitchenSelect
              kitchens={myKitchens}
              selectedKitchenId={selectedKitchenId}
              onChange={setSelectedKitchenId}
              themeColor="blue"
            />
          </div>
        </div>
      </div>

      {/* Workflow Status Card - 1. סרגל חיווי מידעי ללא באנר רוח */}
      {(() => {
        if (currentReports.length === 0) {
          return (
            <div className="p-4 rounded-2xl border bg-slate-50 border-slate-200 text-slate-600 flex items-center gap-3">
              <div className="shrink-0">
                <FileText className="w-5 h-5 text-slate-400" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">סטטוס דוח חודשי:</div>
                <div className="font-bold text-xs sm:text-sm text-slate-700">
                  אין שורות דיווח שנרשמו לחודש זה
                </div>
              </div>
            </div>
          );
        }

        const hasReturnedRows = currentReports.some(r => r.status === 'returned_for_revision' || r.status === 'rejected');
        const hasSubmittedRows = currentReports.some(r => r.status === 'submitted');
        const allApproved = currentReports.length > 0 && currentReports.every(r => r.status === 'ramtal_approved' || r.status === 'approved' || r.status === 'food_dept_approved');

        let cardBg = 'bg-amber-50/80 border-amber-200 text-amber-900';
        let statusTitle = 'טיוטה פתוחה להזנה (טרם הוגש לרמת"ל)';
        let statusIcon = <FileText className="w-5 h-5 text-amber-600" />;

        if (hasReturnedRows) {
          cardBg = 'bg-rose-50/90 border-rose-300 text-rose-950';
          statusTitle = `🔴 לתשומת לבך: קיימות שורות שנדרשו לתיקון ע"י הרמת"ל${currentSummary?.revisionReason ? ` — "${currentSummary.revisionReason}"` : ''}`;
          statusIcon = <AlertTriangle className="w-5 h-5 text-rose-600" />;
        } else if (allApproved) {
          cardBg = 'bg-emerald-50/80 border-emerald-200 text-emerald-900';
          statusTitle = '🟢 הדו"ח אושר ע"י רמת"ל — הועבר לבקרת מדור מזון';
          statusIcon = <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
        } else if (hasSubmittedRows) {
          cardBg = 'bg-blue-50/80 border-blue-200 text-blue-900';
          const subCount = currentReports.filter(r => r.status === 'submitted').length;
          statusTitle = `🔵 ממתין לאישור רמת"ל (${subCount} שורות הוגשו וננעלו לבקרה משטרתית)`;
          statusIcon = <Clock className="w-5 h-5 text-blue-600" />;
        }

        return (
          <div className={`p-4 rounded-2xl border flex items-center gap-3 ${cardBg}`}>
            <div className="shrink-0">
              {statusIcon}
            </div>
            
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">סטטוס דוח חודשי:</div>
              <div className="font-bold text-xs sm:text-sm break-words">
                {statusTitle}
              </div>
            </div>
          </div>
        );
      })()}

      {/* 2. באנר אזהרה בולט כאשר התחנה מושבתת (סוף חודש) */}
      {isKitchenDisabled && (
        <div className="bg-rose-950/90 border-2 border-rose-500 text-rose-100 p-4 rounded-2xl shadow-lg flex items-center gap-3 text-xs sm:text-sm font-bold">
          <div className="p-2 bg-rose-900 rounded-xl border border-rose-400/50 shrink-0 text-xl">
            ⛔
          </div>
          <div className="space-y-0.5">
            <div className="text-white font-extrabold text-sm sm:text-base">
              ⛔ תחנה זו הושבתה ע"י מנהל המערכת (סוף חודש).
            </div>
            <div className="text-rose-200 text-xs font-normal">
              הזנת דיווחים, עריכה ושליחה לבדיקה חסומות כעת.
            </div>
          </div>
        </div>
      )}

      {/* Daily Input Form */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-sm sm:text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          הזנת שורת דיווח חדשה
        </h3>

        <form onSubmit={handleAddRow} className="space-y-3">
          
          {/* Top Row: Date & Meal Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-600">תאריך דיווח *</label>
              <input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-600">סוג ארוחה / דיווח *</label>
              <select
                value={mealTypeId}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  setMealTypeId(id);
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
              >
                <optgroup label="--- 7 ארוחות בסיס ומכרז (לפי אשכול התחנה) ---">
                  {mealTypes.filter(m => m.id <= 7).map(m => (
                    <option key={m.id} value={m.id}>{m.nameHebrew}</option>
                  ))}
                </optgroup>
                <optgroup label="--- 11 תוספות, נילווים ומארזים כלל-ארציים ---">
                  {mealTypes.filter(m => m.id >= 8).map(m => (
                    <option key={m.id} value={m.id}>{m.nameHebrew}</option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          {/* Middle Row: Quantities, Transport KM, or Special Event */}
          {isSpecialEvent ? (
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-amber-800">סכום חשבונית אירוע בש"ח (R3) *</label>
              <input
                type="number"
                min="1"
                value={eventCostNis}
                onChange={(e) => setEventCostNis(Number(e.target.value))}
                placeholder="סכום לתשלום בש''ח"
                className="w-full bg-amber-50 border border-amber-300 rounded-xl px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none font-bold text-amber-900"
                required
              />
            </div>
          ) : isTransportMeal(mealTypeId) ? (
            /* Transport as Kilometers (ק"מ) */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-blue-900 flex items-center justify-between">
                  <span>סה"כ קילומטרים (ק"מ) *</span>
                  <span className="text-[10px] text-blue-600 font-semibold">חיוב לפי מרחק נסיעה</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={transportKm}
                  onChange={(e) => setTransportKm(Number(e.target.value))}
                  placeholder="הזן מרחק בק''מ..."
                  className="w-full bg-blue-50/50 border border-blue-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-blue-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-500">סה"כ חיוב שורה</label>
                <div className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-slate-700 text-center">
                  {Number(transportKm) || 0} ק"מ
                </div>
              </div>
            </div>
          ) : (
            /* Regular Meals: Dining Hall + Takeaway */
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 items-end">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600 flex items-center justify-between">
                  <span>חד"א פנימי</span>
                  {selectedKitchen?.appliesR1Machmesh && (
                    <span className="text-[9px] text-amber-600 font-bold">10% קיצוץ</span>
                  )}
                </label>
                <input
                  type="number"
                  min="0"
                  value={diningHallQty}
                  onChange={(e) => setDiningHallQty(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600">משיכות קו / חוץ</label>
                <input
                  type="number"
                  min="0"
                  value={takeawayQty}
                  onChange={(e) => setTakeawayQty(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-semibold"
                />
              </div>

              <div className="col-span-2 sm:col-span-1 space-y-1">
                <label className="text-[11px] font-medium text-slate-500">סה"כ מנות שורה</label>
                <div className="w-full bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-blue-700 text-center">
                  {(Number(diningHallQty) || 0) + (Number(takeawayQty) || 0)} מנות
                </div>
              </div>
            </div>
          )}

          {/* Bottom Row: Mandatory Notes, Attachment Button with Removal & Submit */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="w-full relative">
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="הערה לשורה / מספר אסמכתא * (שדה חובה)"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* 1. Hidden file input & connected button with Remove button */}
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf,image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex items-center gap-1.5 w-full sm:w-auto shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full sm:w-auto shrink-0 flex items-center justify-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl border transition cursor-pointer min-h-[38px] ${
                    uploadedFile
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border-slate-200'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[170px]">
                    {uploadedFile ? `צורף: ${uploadedFile}` : 'צרף אסמכתא (PDF)'}
                  </span>
                  {uploadedFile && <Check className="w-3.5 h-3.5 text-emerald-600 ml-1" />}
                </button>

                {/* 1. כפתור הסרת קובץ מצורף */}
                {uploadedFile && (
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition flex items-center gap-1 border border-rose-200 cursor-pointer shrink-0 min-h-[38px]"
                    title="הסר קובץ מצורף"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">הסר קובץ</span>
                  </button>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isKitchenDisabled}
              title={isKitchenDisabled ? 'תחנה זו הושבתה ע"י מנהל המערכת (סוף חודש)' : ''}
              className={`w-full font-bold text-xs sm:text-sm py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition shadow-xs min-h-[44px] ${
                isKitchenDisabled
                  ? 'bg-slate-300 text-slate-500 border border-slate-300 cursor-not-allowed opacity-60'
                  : 'bg-slate-900 hover:bg-slate-800 active:bg-black text-white cursor-pointer'
              }`}
            >
              <Plus className="w-4 h-4" />
              {isKitchenDisabled ? 'הזנת שורה חסומה (תחנה מושבתת)' : 'הוסף שורת דיווח'}
            </button>
          </div>

        </form>
      </div>

      {/* Reports: Header + Submit Button + Mobile Cards + Desktop 10-Column Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Table Header & Monthly Submission Button */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-800 text-xs sm:text-sm">שורות דיווח שנרשמו לחודש הנוכחי</h3>
            <p className="text-[11px] text-slate-500">
              סה"כ מנות שדווחו: <strong className="text-blue-700">{totalReportedMeals.toLocaleString()}</strong> ({currentReports.length} שורות)
            </p>
          </div>

          {/* 6. כפתור סיום דיווח חודשי בראש הטבלה */}
          {(() => {
            if (isKitchenDisabled) {
              return (
                <button
                  type="button"
                  disabled
                  title={'תחנה זו הושבתה ע"י מנהל המערכת (סוף חודש)'}
                  className="inline-flex items-center justify-center gap-2 bg-rose-100 text-rose-700 border border-rose-300 font-bold text-xs px-4 py-2.5 rounded-xl cursor-not-allowed min-h-[44px]"
                >
                  <Lock className="w-4 h-4 text-rose-600" />
                  <span>⛔ הגשה חסומה (תחנה מושבתת)</span>
                </button>
              );
            }

            const hasUnsubmitted = currentReports.some(r => (r.status || 'draft') === 'draft' || r.status === 'returned_for_revision');
            const allApproved = currentReports.length > 0 && currentReports.every(r => r.status === 'ramtal_approved' || r.status === 'food_dept_approved');

            if (currentReports.length === 0) {
              return (
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center justify-center gap-2 bg-slate-200 text-slate-400 font-bold text-xs px-4 py-2.5 rounded-xl cursor-not-allowed min-h-[44px]"
                >
                  <Send className="w-4 h-4" />
                  <span>סיום דיווח חודשי והגשה לרמת״ל</span>
                </button>
              );
            }

            if (allApproved) {
              return (
                <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 px-3.5 py-2 rounded-xl text-xs font-bold shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>הדוח החודשי אושר במלואו ע"י רמת"ל</span>
                </div>
              );
            }

            if (!hasUnsubmitted) {
              return (
                <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 border border-blue-300 px-3.5 py-2 rounded-xl text-xs font-bold shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>כל השורות הוגשו וננעלו לבקרת רמת"ל</span>
                </div>
              );
            }

            return (
              <button
                type="button"
                onClick={() => setShowSubmitConfirmModal(true)}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-md cursor-pointer min-h-[44px]"
              >
                <Send className="w-4 h-4" />
                <span>סיום דיווח חודשי והגשה לרמת״ל</span>
              </button>
            );
          })()}
        </div>

        {/* Mobile View: Touch Cards */}
        <div className="block md:hidden divide-y divide-slate-100">
          {currentReports.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              טרם הוזנו שורות דיווח למטבח זה.
            </div>
          ) : (
            currentReports.map((row, idx) => {
              const isEditing = editingRowId === row.id;
              const isTr = isTransportMeal(row.mealTypeId);
              const rowStatus = row.status || 'draft';

              return (
                <div key={row.id} className={`p-3 space-y-2.5 ${isEditing ? 'bg-amber-50/70 border-r-4 border-amber-500' : ''}`}>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 font-mono text-[10px]">#{idx + 1}</span>
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      <span className="font-bold text-slate-800">{row.reportDate}</span>
                    </div>
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                      {row.mealTypeName}
                    </span>
                  </div>

                  {/* Quantities & Totals */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs bg-slate-50 p-2 rounded-xl">
                    <div>
                      <span className="text-[10px] text-slate-500 block">חד"א פנימי</span>
                      <span className="font-bold text-slate-700">{isTr ? '-' : (row.diningHallQty || '-')}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">משיכות</span>
                      <span className="font-bold text-slate-700">{isTr ? '-' : (row.takeawayQty || '-')}</span>
                    </div>
                    <div className="bg-blue-100/50 rounded-lg py-0.5">
                      <span className="text-[10px] text-blue-800 block font-semibold">סה"כ {isTr ? 'ק"מ' : 'מנות'}</span>
                      <span className="font-extrabold text-blue-700">{row.rawReportedQty}</span>
                    </div>
                  </div>

                  {/* Notes / Attachment */}
                  {(row.notes || row.attachmentFileName) && (
                    <div className="text-[11px] text-slate-600 space-y-1">
                      {row.notes && <div><strong>אסמכתא:</strong> {row.notes}</div>}
                      {row.attachmentFileName && (
                        <div className="text-blue-600 flex items-center gap-1">
                          <Paperclip className="w-3 h-3" />
                          <span>{row.attachmentFileName}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions Bar for Mobile */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-[11px]">
                      {getStatusBadge(row)}
                    </div>

                    <div>
                      {isKitchenDisabled ? (
                        <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-800 border border-rose-200 font-bold px-2.5 py-1 rounded-lg text-xs shadow-2xs">
                          <Lock className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>⛔ מושבת (מנהל)</span>
                        </span>
                      ) : rowStatus === 'returned_for_revision' || rowStatus === 'rejected' ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => startEditRow(row)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg text-xs font-bold transition flex items-center gap-1 min-h-[36px] px-2.5 cursor-pointer shadow-2xs"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>תקן שורה</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmRowId(row.id)}
                            className="p-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 rounded-lg text-xs font-bold transition flex items-center gap-1 min-h-[36px] px-2 cursor-pointer shadow-2xs"
                            title="מחק שורה שהוחזרה"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : rowStatus === 'submitted' || rowStatus === 'ramtal_approved' || rowStatus === 'approved' || rowStatus === 'food_dept_approved' ? (
                        <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 border border-slate-300 font-bold px-2.5 py-1 rounded-lg text-xs shadow-2xs">
                          <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>🔒 ננעל לעריכה (הוגש לרמת"ל)</span>
                        </span>
                      ) : (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => startEditRow(row)}
                            className="p-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition flex items-center gap-1 min-h-[36px] px-2 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>עריכה</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onDuplicateDailyReport && onDuplicateDailyReport(row.id)}
                            className="p-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-xs font-bold transition flex items-center gap-1 min-h-[36px] px-2 cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>שכפול</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmRowId(row.id)}
                            className="p-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-bold transition flex items-center gap-1 min-h-[36px] px-2 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop View: Full 10-Column Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-100/90 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">תאריך</th>
                <th className="p-3">סוג ארוחה</th>
                <th className="p-3 text-center">חד"א פנימי</th>
                <th className="p-3 text-center">משיכות חוץ</th>
                <th className="p-3 text-center">סה"כ מנות / כמות</th>
                <th className="p-3">אירוע / סכום בש"ח</th>
                <th className="p-3">הערות ואסמכתא *</th>
                <th className="p-3 text-center">סטטוס רמת"ל</th>
                <th className="p-3 text-center min-w-[130px]">פעולות</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentReports.map((row, idx) => {
                const isEditing = editingRowId === row.id;
                const isTr = isTransportMeal(row.mealTypeId);
                const rowStatus = row.status || 'draft';

                return (
                  <tr key={row.id} className={isEditing ? 'bg-amber-50/70' : 'hover:bg-slate-50 transition'}>
                    <td className="p-3 text-slate-400 font-mono">{idx + 1}</td>

                    {/* 2. תאריך */}
                    <td className="p-3 font-medium text-slate-800">
                      {isEditing ? (
                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => {
                            setEditDate(e.target.value);
                            autoSaveRowField(row.id, { reportDate: e.target.value });
                          }}
                          className="w-32 bg-white border border-slate-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500 font-mono"
                        />
                      ) : (
                        row.reportDate
                      )}
                    </td>

                    {/* 3. סוג ארוחה */}
                    <td className="p-3 text-slate-700">
                      {isEditing ? (
                        <select
                          value={editMealTypeId}
                          onChange={(e) => {
                            const newTypeId = Number(e.target.value);
                            setEditMealTypeId(newTypeId);
                            const m = mealTypes.find(mt => mt.id === newTypeId);
                            autoSaveRowField(row.id, { mealTypeId: newTypeId, mealTypeName: m?.nameHebrew || row.mealTypeName });
                          }}
                          className="w-36 bg-white border border-slate-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500"
                        >
                          {mealTypes.map(m => (
                            <option key={m.id} value={m.id}>{m.nameHebrew}</option>
                          ))}
                        </select>
                      ) : (
                        row.mealTypeName
                      )}
                    </td>

                    {/* 4. חד"א פנימי */}
                    <td className="p-3 text-center font-semibold text-slate-700">
                      {isEditing ? (
                        isTransportMeal(editMealTypeId) ? '-' : (
                          <input
                            type="number"
                            min="0"
                            value={editDiningQty}
                            onChange={(e) => {
                              const val = e.target.value === '' ? '' : Number(e.target.value);
                              setEditDiningQty(val);
                              const dNum = Number(val) || 0;
                              const tNum = Number(editTakeawayQty) || 0;
                              autoSaveRowField(row.id, { diningHallQty: dNum, rawReportedQty: dNum + tNum });
                            }}
                            className="w-16 bg-white border border-slate-300 rounded px-2 py-1 text-center font-bold text-xs focus:outline-none focus:border-blue-500"
                          />
                        )
                      ) : (
                        isTr ? '-' : (row.diningHallQty || '-')
                      )}
                    </td>

                    {/* 5. משיכות חוץ */}
                    <td className="p-3 text-center font-semibold text-slate-700">
                      {isEditing ? (
                        isTransportMeal(editMealTypeId) ? '-' : (
                          <input
                            type="number"
                            min="0"
                            value={editTakeawayQty}
                            onChange={(e) => {
                              const val = e.target.value === '' ? '' : Number(e.target.value);
                              setEditTakeawayQty(val);
                              const tNum = Number(val) || 0;
                              const dNum = Number(editDiningQty) || 0;
                              autoSaveRowField(row.id, { takeawayQty: tNum, rawReportedQty: dNum + tNum });
                            }}
                            className="w-16 bg-white border border-slate-300 rounded px-2 py-1 text-center font-bold text-xs focus:outline-none focus:border-blue-500"
                          />
                        )
                      ) : (
                        isTr ? '-' : (row.takeawayQty || '-')
                      )}
                    </td>

                    {/* 6. סה"כ מנות / ק"מ (חישוב אוטומטי בלייב) */}
                    <td className="p-3 text-center font-bold text-blue-600 bg-blue-50/40">
                      {isEditing ? (
                        isTransportMeal(editMealTypeId) ? (
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              min="1"
                              value={editTransportKm}
                              onChange={(e) => {
                                const val = e.target.value === '' ? '' : Number(e.target.value);
                                setEditTransportKm(val);
                                const km = Number(val) || 0;
                                autoSaveRowField(row.id, { rawReportedQty: km });
                              }}
                              className="w-16 bg-white border border-blue-400 rounded px-2 py-1 text-center font-bold text-xs"
                            />
                            <span>ק"מ</span>
                          </div>
                        ) : (
                          <span className="font-extrabold text-blue-800 text-sm">
                            {(Number(editDiningQty) || 0) + (Number(editTakeawayQty) || 0)}
                          </span>
                        )
                      ) : (
                        <span>
                          {row.rawReportedQty} {isTr ? 'ק"מ' : ''}
                        </span>
                      )}
                    </td>

                    {/* 7. אירוע / סכום בש"ח */}
                    <td className="p-3">
                      {isEditing ? (
                        row.isSpecialEvent ? (
                          <input
                            type="number"
                            min="0"
                            value={editEventCost}
                            onChange={(e) => {
                              const val = e.target.value === '' ? '' : Number(e.target.value);
                              setEditEventCost(val);
                              autoSaveRowField(row.id, { eventCostNis: Number(val) || 0 });
                            }}
                            placeholder="סכום בש''ח"
                            className="w-24 bg-white border border-amber-400 rounded px-2 py-1 text-xs font-bold text-amber-900 focus:outline-none"
                          />
                        ) : '-'
                      ) : (
                        row.isSpecialEvent ? (
                          <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">
                            ₪{row.eventCostNis?.toLocaleString()}
                          </span>
                        ) : '-'
                      )}
                    </td>

                    {/* 8. הערות ואסמכתא */}
                    <td className="p-3 text-slate-700">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editNotes}
                          onChange={(e) => {
                            setEditNotes(e.target.value);
                            autoSaveRowField(row.id, { notes: e.target.value });
                          }}
                          placeholder="הערה/אסמכתא *..."
                          required
                          className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-500"
                        />
                      ) : (
                        <div>
                          <span>{row.notes || '-'}</span>
                          {row.attachmentFileName && (
                            <span className="mr-2 text-blue-600 font-semibold inline-flex items-center gap-1 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                              <Paperclip className="w-3 h-3" />
                              {row.attachmentFileName}
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* 9. סטטוס רמת"ל */}
                    <td className="p-3 text-center">
                      {getStatusBadge(row)}
                    </td>

                    {/* 10. פעולות (5. נעילה הרמטית של שורות שהוגשו, חריג לנדרש תיקון) */}
                    <td className="p-3 text-center">
                      {isKitchenDisabled ? (
                        <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-800 border border-rose-200 font-bold px-2.5 py-1 rounded-lg text-[11px] shadow-2xs">
                          <Lock className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>⛔ תחנה מושבתת</span>
                        </span>
                      ) : isEditing ? (
                        <div className="flex flex-col items-center justify-center gap-1">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => saveEditRow(row)}
                              className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-2xs cursor-pointer"
                              title="שמור שינויים"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>שמור</span>
                            </button>
                            <button
                              type="button"
                              onClick={cancelEditRow}
                              className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs transition cursor-pointer"
                              title="בטל"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {autoSavedRowId === row.id && (
                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 animate-pulse">
                              נשמר בענן ✓
                            </span>
                          )}
                        </div>
                      ) : rowStatus === 'returned_for_revision' || rowStatus === 'rejected' ? (
                        /* 5. חריג: נדרש תיקון - פתוח לעריכה או מחיקה עבור הספק */
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => startEditRow(row)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                            title="תקן שורה והגש מחדש"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>תקן שורה</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmRowId(row.id)}
                            className="p-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                            title="מחק שורה שהוחזרה"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : rowStatus === 'submitted' || rowStatus === 'ramtal_approved' || rowStatus === 'approved' || rowStatus === 'food_dept_approved' ? (
                        /* 2. נעילה הרמטית ברמת השורה הבודדת בלבד */
                        <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 border border-slate-300 font-bold px-2.5 py-1 rounded-lg text-[11px] shadow-2xs">
                          <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>🔒 ננעל לעריכה (הוגש לרמת"ל)</span>
                        </span>
                      ) : (
                        /* טיוטה רגילה - כפתורי פעולות מלאים */
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => startEditRow(row)}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition cursor-pointer"
                            title="עריכת שורה"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDuplicateDailyReport && onDuplicateDailyReport(row.id)}
                            className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition cursor-pointer"
                            title="שכפול שורה"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmRowId(row.id)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg transition cursor-pointer"
                            title="מחיקת שורה"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

      {/* Delete Row Confirmation Modal */}
      {deleteConfirmRowId !== null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4" dir="rtl">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-900 text-sm">אישור מחיקת שורת דיווח</h4>
            <p className="text-xs text-slate-600">האם אתה בטוח שברצונך למחוק שורת דיווח זו מהמערכת?</p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmRowId(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                ביטול
              </button>
              <button
                type="button"
                onClick={() => confirmDeleteRow(deleteConfirmRowId)}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition cursor-pointer"
              >
                מחק שורה
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Month Lock Confirmation Modal with Month/Year selection */}
      {showSubmitConfirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" dir="rtl">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-fade-in">
            <div className="flex items-center gap-3 text-blue-700 bg-blue-50 p-3 rounded-xl border border-blue-200">
              <AlertTriangle className="w-6 h-6 shrink-0 text-blue-600" />
              <h4 className="font-bold text-sm text-slate-900">סיום דיווח חודשי והגשה לרמת״ל</h4>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                האם לנעול ולהגיש את הדיווחים לחודש זה? לאחר ההגשה לא ניתן יהיה לבצע שינויים נוספים בשורות הדיווח (השורות יינעלו לבקרה משטרתית).
              </p>

              {/* 6. Month / Year selector */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">חודש דיווח:</label>
                  <select
                    value={selectedSubmitMonth}
                    onChange={(e) => setSelectedSubmitMonth(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs font-semibold focus:outline-none"
                  >
                    {['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'].map((m, idx) => (
                      <option key={idx + 1} value={idx + 1}>{m} ({idx + 1})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">שנה:</label>
                  <select
                    value={selectedSubmitYear}
                    onChange={(e) => setSelectedSubmitYear(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs font-semibold focus:outline-none"
                  >
                    <option value={2025}>2025</option>
                    <option value={2026}>2026</option>
                    <option value={2027}>2027</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowSubmitConfirmModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                ביטול
              </button>
              <button
                type="button"
                onClick={() => {
                  onSubmitMonth({
                    kitchenId: selectedKitchenId,
                    month: selectedSubmitMonth,
                    year: selectedSubmitYear,
                    summaryId: currentSummary?.id
                  });
                  setShowSubmitConfirmModal(false);
                  setSuccessBannerMessage('הדיווח נשמר והועבר בהצלחה לבקרת הרמת״ל!');
                  setTimeout(() => setSuccessBannerMessage(null), 6000);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-xl shadow-md transition cursor-pointer"
              >
                אישור והגשה סופית
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Modal: איפוס טיוטות */}
      {showResetDraftsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" dir="rtl">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-fade-in">
            <div className="flex items-center gap-2.5 text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-200">
              <RotateCcw className="w-5 h-5 shrink-0 text-amber-600" />
              <h4 className="font-bold text-sm text-slate-900">איפוס ומחיקת שורות טיוטה</h4>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              פעולה זו תמחק <strong>אך ורק שורות בסטטוס טיוטה 🟡</strong> שטרם הוגשו לרמת"ל, בטווח שנבחר.
            </p>

            <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">בחר טווח לאיפוס:</label>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="resetTime"
                    checked={adminFilterTime === 'month'}
                    onChange={() => setAdminFilterTime('month')}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <span>כל הטיוטות של החודש הנוכחי</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="resetTime"
                    checked={adminFilterTime === 'today'}
                    onChange={() => setAdminFilterTime('today')}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <span>טיוטות של היום הנוכחי בלבד ({new Date().toISOString().split('T')[0]})</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="resetTime"
                    checked={adminFilterTime === 'all'}
                    onChange={() => setAdminFilterTime('all')}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <span>כל הטיוטות ללא הגבלת זמן</span>
                </label>
              </div>

              <div className="pt-2 mt-2 border-t border-slate-200 text-[11px] text-slate-500">
                היקף איפוס: <strong>{adminFilterScope === 'current_kitchen' ? `מטבח ${selectedKitchen?.name} בלבד` : adminFilterScope === 'current_supplier' ? `כל המטבחים של הספק הנוכחי` : 'כל 124 המטבחים במערכת'}</strong>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowResetDraftsModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                ביטול
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetSupplierId = adminSupplierFilter !== 'all' ? adminSupplierFilter : (selectedKitchen?.supplierId || 1);
                  if (onAdminResetDrafts) {
                    onAdminResetDrafts({
                      scope: adminFilterScope,
                      kitchenId: adminFilterScope === 'current_kitchen' ? selectedKitchenId : undefined,
                      supplierId: adminFilterScope === 'current_supplier' ? targetSupplierId : undefined,
                      filterType: adminFilterTime
                    });
                  }
                  setShowResetDraftsModal(false);
                  setSuccessBannerMessage('טיוטות הדיווח אופסו ונמחקו בהצלחה!');
                  setTimeout(() => setSuccessBannerMessage(null), 5000);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md transition cursor-pointer"
              >
                בצע איפוס טיוטות
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Modal: מאסטר מחיקת כל הדיווחים */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" dir="rtl">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-rose-300 space-y-4 animate-fade-in">
            <div className="flex items-center gap-2.5 text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-200">
              <Trash2 className="w-5 h-5 shrink-0 text-rose-600" />
              <h4 className="font-bold text-sm text-slate-900">מאסטר: מחיקת כל הדיווחים</h4>
            </div>

            <p className="text-xs text-rose-900 leading-relaxed font-semibold">
              ⚠️ אזהרה קריטית: פעולה זו תמחק את כל שורות הדיווח (כולל הוגשו, אושרו או נדחו) בטווח שנבחר!
            </p>

            <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">בחר טווח מחיקה גורף:</label>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="deleteAllTime"
                    checked={adminFilterTime === 'month'}
                    onChange={() => setAdminFilterTime('month')}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <span>כל הדיווחים של החודש הנוכחי</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="deleteAllTime"
                    checked={adminFilterTime === 'today'}
                    onChange={() => setAdminFilterTime('today')}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <span>כל הדיווחים של היום הנוכחי בלבד</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="deleteAllTime"
                    checked={adminFilterTime === 'all'}
                    onChange={() => setAdminFilterTime('all')}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <span>כל הדיווחים בכל הזמנים</span>
                </label>
              </div>

              <div className="pt-2 mt-2 border-t border-slate-200 text-[11px] text-slate-500">
                היקף מחיקה: <strong>{adminFilterScope === 'current_kitchen' ? `מטבח ${selectedKitchen?.name} בלבד` : adminFilterScope === 'current_supplier' ? `כל המטבחים של הספק הנוכחי` : 'כל 124 המטבחים במערכת'}</strong>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="block text-[11px] font-bold text-slate-700">
                הקלד <span className="text-rose-600 font-mono bg-rose-50 px-1 py-0.5 rounded">אישור</span> לאימות הפעולה:
              </label>
              <input
                type="text"
                value={masterDeleteConfirmText}
                onChange={(e) => setMasterDeleteConfirmText(e.target.value)}
                placeholder="הקלד אישור..."
                className="w-full bg-white border border-rose-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteAllModal(false);
                  setMasterDeleteConfirmText('');
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                ביטול
              </button>
              <button
                type="button"
                disabled={masterDeleteConfirmText.trim() !== 'אישור'}
                onClick={() => {
                  const targetSupplierId = adminSupplierFilter !== 'all' ? adminSupplierFilter : (selectedKitchen?.supplierId || 1);
                  if (onAdminDeleteAllReports) {
                    onAdminDeleteAllReports({
                      scope: adminFilterScope,
                      kitchenId: adminFilterScope === 'current_kitchen' ? selectedKitchenId : undefined,
                      supplierId: adminFilterScope === 'current_supplier' ? targetSupplierId : undefined,
                      filterType: adminFilterTime
                    });
                  }
                  setShowDeleteAllModal(false);
                  setMasterDeleteConfirmText('');
                  setSuccessBannerMessage('כל הדיווחים בטווח שנבחר נמחקו בהצלחה!');
                  setTimeout(() => setSuccessBannerMessage(null), 5000);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-md transition cursor-pointer"
              >
                מחק לצמיתות
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};


