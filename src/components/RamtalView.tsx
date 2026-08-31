import React, { useState } from 'react';
import { DailyReportRow, Kitchen, MonthlyKitchenSummary, User } from '../types';
import {
  CheckCircle2,
  RotateCcw,
  AlertCircle,
  Edit3,
  ShieldAlert,
  FileText,
  Check,
  X,
  Bell,
  Paperclip,
  Clock,
  AlertTriangle,
  Building2
} from 'lucide-react';
import { SearchableKitchenSelect, formatKitchenDisplayName } from './SearchableKitchenSelect';

interface RamtalViewProps {
  currentUser: User;
  kitchens: Kitchen[];
  dailyReports: DailyReportRow[];
  monthlySummaries: MonthlyKitchenSummary[];
  onApproveSummary: (summaryId: number) => void;
  onReturnSummary: (summaryId: number, reason: string) => void;
  onAdjustDailyRow: (rowId: number, newQty: number, reason: string) => void;
  onApproveDailyRow?: (rowId: number) => void;
  onReturnDailyRow?: (rowId: number, reason: string) => void;
}

export const RamtalView: React.FC<RamtalViewProps> = ({
  currentUser,
  kitchens,
  dailyReports,
  monthlySummaries,
  onApproveSummary,
  onReturnSummary,
  onAdjustDailyRow,
  onApproveDailyRow,
  onReturnDailyRow
}) => {
  const sortedKitchens = [...kitchens].sort((a, b) => {
    const clusterComp = (a.cluster || a.region || '').localeCompare(b.cluster || b.region || '', 'he');
    if (clusterComp !== 0) return clusterComp;
    return a.name.localeCompare(b.name, 'he');
  });

  // Default to 0 (All Kitchens) or first pending kitchen
  const [selectedKitchenId, setSelectedKitchenId] = useState<number>(() => {
    const firstPending = monthlySummaries.find(s => s.status === 'submitted');
    return firstPending ? firstPending.kitchenId : 0;
  });

  const [returnReasonModal, setReturnReasonModal] = useState<boolean>(false);
  const [returnText, setReturnText] = useState<string>('');

  // Row Return Modal State
  const [returnRowModalId, setReturnRowModalId] = useState<number | null>(null);
  const [rowReturnReason, setRowReturnReason] = useState<string>('');

  // Toast Feedback Banner
  const [toastFeedback, setToastFeedback] = useState<{ message: string; type: 'success' | 'danger' } | null>(null);

  const showToast = (message: string, type: 'success' | 'danger' = 'success') => {
    setToastFeedback({ message, type });
    setTimeout(() => setToastFeedback(null), 5000);
  };

  // Inline Row Editing states
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [tempAdjustedQty, setTempAdjustedQty] = useState<number>(0);
  const [tempAdjustmentReason, setTempAdjustmentReason] = useState<string>('');

  const currentSummary = monthlySummaries.find(s => s.kitchenId === selectedKitchenId);
  const selectedKitchen = kitchens.find(k => k.id === selectedKitchenId);

  // 6. סינון דיווחים מדויק (כולל קריאה מלאה ישירות מ-dailyReports ו-localStorage)
  const isSummarySubmitted = currentSummary?.status === 'submitted' || currentSummary?.status === 'ramtal_approved' || currentSummary?.status === 'food_dept_approved' || currentSummary?.status === 'returned_for_revision';

  const currentReports = dailyReports.filter(r => {
    const isSubmittedRow = r.status === 'submitted' || r.status === 'ramtal_approved' || r.status === 'food_dept_approved' || r.status === 'returned_for_revision';
    const isKitchenSummarySubmitted = monthlySummaries.some(s => s.kitchenId === r.kitchenId && s.status !== 'draft');

    if (selectedKitchenId === 0) {
      return isSubmittedRow || isKitchenSummarySubmitted;
    }
    return r.kitchenId === selectedKitchenId && (isSubmittedRow || isSummarySubmitted || (r.status !== 'draft'));
  });

  // Effective summary to always display summary card even for dynamic kitchens
  const effectiveSummary: MonthlyKitchenSummary | null = currentSummary || (selectedKitchenId > 0 && currentReports.length > 0 ? {
    id: selectedKitchenId,
    kitchenId: selectedKitchenId,
    kitchenName: selectedKitchen ? selectedKitchen.name : `מטבח #${selectedKitchenId}`,
    supplierId: selectedKitchen?.supplierId || 1,
    supplierName: 'ספק מורשה',
    periodYear: new Date().getFullYear(),
    periodMonth: new Date().getMonth() + 1,
    ramtalUserId: currentUser.id,
    ramtalUserName: currentUser.fullName,
    totalReportedRaw: currentReports.reduce((s, r) => s + (r.rawReportedQty || 0), 0),
    totalRamtalApproved: currentReports.reduce((s, r) => s + (r.ramtalAdjustedQty !== undefined ? r.ramtalAdjustedQty : r.rawReportedQty || 0), 0),
    calculatedNetMeals: 0,
    calculatedTotalAmountNis: 0,
    calculationAudit: [],
    status: currentReports.some(r => r.status === 'submitted') ? 'submitted' : (currentReports[0]?.status || 'submitted')
  } : null);

  // באנר עדכונים חדשים עם נקודה זוהרת
  const newlySubmittedSummaries = monthlySummaries.filter(s => s.status === 'submitted');

  const isTransportMeal = (typeId: number, typeName?: string) => 
    typeId === 9 || typeId === 10 || (typeName || '').includes('שינוע');

  const startEditRow = (row: DailyReportRow) => {
    setEditingRowId(row.id);
    setTempAdjustedQty(row.ramtalAdjustedQty !== undefined ? row.ramtalAdjustedQty : row.rawReportedQty);
    setTempAdjustmentReason(row.ramtalAdjustmentReason || '');
  };

  const saveEditRow = (rowId: number) => {
    if (!tempAdjustmentReason.trim()) {
      alert('חובה להזין נימוק לשינוי כמות!');
      return;
    }
    onAdjustDailyRow(rowId, tempAdjustedQty, tempAdjustmentReason);
    setEditingRowId(null);
  };

  // 3. איפוס ודיוק 4 הסטטוסים
  const getStatusBadge = (row: DailyReportRow) => {
    const s = row.status || 'submitted';

    if (s === 'returned_for_revision') {
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

    if (s === 'ramtal_approved' || s === 'food_dept_approved') {
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

  const getKitchenName = (kId: number) => {
    const k = kitchens.find(k => k.id === kId);
    return k ? formatKitchenDisplayName(k) : `מטבח #${kId}`;
  };

  const totalReportedAll = currentReports.reduce((acc, curr) => acc + (curr.rawReportedQty || 0), 0);
  const totalApprovedAll = currentReports.reduce((acc, curr) => acc + (curr.ramtalAdjustedQty !== undefined ? curr.ramtalAdjustedQty : curr.rawReportedQty), 0);

  return (
    <div className="space-y-6">
      
      {/* Toast Feedback Notification Banner */}
      {toastFeedback && (
        <div className={`p-4 rounded-2xl shadow-lg flex items-center justify-between text-white font-bold text-xs sm:text-sm animate-fade-in ${
          toastFeedback.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
        }`}>
          <div className="flex items-center gap-2">
            {toastFeedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-200" />
            )}
            <span>{toastFeedback.message}</span>
          </div>
          <button
            onClick={() => setToastFeedback(null)}
            className="p-1 hover:opacity-80 rounded-lg transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {/* 8. באנר עדכונים חדשים עם נקודה זוהרת (Glowing Dot) */}
      {newlySubmittedSummaries.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-950/95 via-slate-900 to-slate-900 border border-emerald-500/40 rounded-2xl p-4 text-white flex items-center justify-between shadow-lg animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="relative flex h-3.5 w-3.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.9)]"></span>
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-300 flex items-center gap-2">
                <span>דיווחים חודשיים חדשים שהתקבלו מספקים וממתינים לבדיקתך ({newlySubmittedSummaries.length} מטבחים)</span>
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5 flex flex-wrap items-center gap-2">
                {newlySubmittedSummaries.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedKitchenId(s.kitchenId)}
                    className="hover:underline hover:text-emerald-300 text-slate-200 cursor-pointer font-medium bg-emerald-900/40 border border-emerald-700/50 px-2 py-0.5 rounded-lg transition"
                  >
                    • {s.kitchenName} ({s.supplierName})
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            ממשק רמת"ל / מפקח הסעדה משטרתי
          </span>
          <h2 className="text-xl font-bold text-slate-800 mt-1">בדיקה ואישור דיווחי כמויות חודשיים</h2>
          <p className="text-xs text-slate-500">הצלבת נתונים מול פעילות השטח, תיקון אי-התאמות ואישור מנומק</p>
        </div>

        {/* Kitchen Select */}
        <div className="w-full md:w-80">
          <label className="text-xs font-medium text-slate-600 block mb-1">מטבח בטיפולך:</label>
          <SearchableKitchenSelect
            kitchens={sortedKitchens}
            selectedKitchenId={selectedKitchenId}
            onChange={setSelectedKitchenId}
            themeColor="emerald"
            allowAllOption={true}
            allOptionLabel="כל המטבחים שבטיפולי"
          />
        </div>
      </div>

      {/* Summary KPI & Action Header */}
      {selectedKitchenId === 0 ? (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold">כלל המטבחים והתחנות שבטיפולך ({kitchens.length} תחנות)</h3>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300 pt-2">
              <div>סה"כ שורות שהוגשו לבדיקה: <strong className="text-white text-sm">{currentReports.length}</strong></div>
              <div>סה"כ מנות שדווחו ע"י ספקים: <strong className="text-white text-sm">{totalReportedAll.toLocaleString()}</strong></div>
              <div>סה"כ כמות מאושרת: <strong className="text-emerald-400 text-sm">{totalApprovedAll.toLocaleString()}</strong></div>
              <div>מטבחים הממתינים לאישור סופי: <strong className="text-blue-300 text-sm">{newlySubmittedSummaries.length}</strong></div>
            </div>
          </div>
          <div className="text-xs text-slate-300 bg-slate-800/80 border border-slate-700 px-4 py-2 rounded-xl">
            בחר תחנה ספציפית בתפריט לעיל לאישור/החזרה של דוח חודשי שלם
          </div>
        </div>
      ) : effectiveSummary ? (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold">
                {selectedKitchen ? formatKitchenDisplayName(selectedKitchen) : effectiveSummary.kitchenName}
              </h3>
              <span className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded font-mono">
                {effectiveSummary.supplierName}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300 pt-2">
              <div>כמות שדווחה ע"י ספק: <strong className="text-white text-sm">{effectiveSummary.totalReportedRaw.toLocaleString()}</strong></div>
              <div>כמות מאושרת רמת"ל: <strong className="text-emerald-400 text-sm">{effectiveSummary.totalRamtalApproved.toLocaleString()}</strong></div>
              <div>סטטוס: <strong className="text-blue-300">
                {effectiveSummary.status === 'submitted' ? '🔵 ממתין לאישור רמת"ל' :
                 effectiveSummary.status === 'ramtal_approved' ? '🟢 אושר רמת"ל' :
                 effectiveSummary.status === 'food_dept_approved' ? '🟢 אושר מדור מזון' :
                 effectiveSummary.status === 'returned_for_revision' ? '🔴 נדרש תיקון' :
                 effectiveSummary.status === 'draft' ? '🟡 טיוטת ספק' : effectiveSummary.status}
              </strong></div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {effectiveSummary.status === 'submitted' ? (
              <>
                <button
                  onClick={() => setReturnReasonModal(true)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-rose-900/80 hover:bg-rose-900 text-rose-200 border border-rose-700/60 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  החזר לעריכת הספק
                </button>
                <button
                  onClick={() => onApproveSummary(effectiveSummary.id)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-lg transition cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  אשר חודש והעבר למדור מזון
                </button>
              </>
            ) : (
              <div className="bg-slate-800/80 border border-slate-700 px-4 py-2 rounded-xl text-xs text-slate-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>הדוח בסטטוס <strong>{effectiveSummary.status}</strong></span>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Daily Verification Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-slate-600" />
            <h3 className="font-bold text-slate-800 text-sm">
              בדיקת שורות הדיווח היומיות (רמת"ל) {selectedKitchenId === 0 ? '— כל המטבחים' : `— ${selectedKitchen?.name}`}
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            {currentReports.length} שורות דיווח שהוגשו לבקרה
          </span>
        </div>

        {currentReports.length === 0 ? (
          <div className="text-center py-10 px-4 space-y-2 bg-slate-50/50">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
            <div className="text-xs font-bold text-slate-700">אין דיווחים שהוגשו לאישור עבור בחירה זו</div>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              {currentSummary?.status === 'draft'
                ? 'הספק עדיין עורך את הדיווח כטיוטה וטרם ביצע סיום והגשה לרמת"ל.'
                : 'טרם נקלטו דיווחים חודשיים בסטטוס ממתין לאישור עבור מטבח זה.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">תאריך</th>
                  {selectedKitchenId === 0 && <th className="p-3">מטבח / תחנה</th>}
                  <th className="p-3">סוג ארוחה</th>
                  <th className="p-3 text-center">חד"א</th>
                  <th className="p-3 text-center">משיכות</th>
                  <th className="p-3 text-center">כמות מדווחת ספק</th>
                  <th className="p-3 text-center">כמות מאושרת רמת"ל</th>
                  <th className="p-3">נימוק שינוי / הערה / אסמכתא</th>
                  <th className="p-3 text-center">סטטוס</th>
                  <th className="p-3 text-center">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentReports.map(row => {
                  const isEditing = editingRowId === row.id;
                  const isTr = isTransportMeal(row.mealTypeId, row.mealTypeName);
                  const hasDiscrepancy = row.ramtalAdjustedQty !== undefined && row.ramtalAdjustedQty !== row.rawReportedQty;

                  return (
                    <tr key={row.id} className={hasDiscrepancy ? 'bg-amber-50/60' : 'hover:bg-slate-50 transition'}>
                      <td className="p-3 font-medium text-slate-800">{row.reportDate}</td>
                      
                      {selectedKitchenId === 0 && (
                        <td className="p-3 font-semibold text-slate-700">
                          {getKitchenName(row.kitchenId)}
                        </td>
                      )}

                      <td className="p-3 text-slate-700">{row.mealTypeName}</td>
                      <td className="p-3 text-center text-slate-600">{isTr ? '-' : (row.diningHallQty || '-')}</td>
                      <td className="p-3 text-center text-slate-600">{isTr ? '-' : (row.takeawayQty || '-')}</td>
                      
                      {/* כמות מדווחת ספק */}
                      <td className="p-3 text-center font-bold text-slate-700">
                        {row.rawReportedQty} {isTr ? 'ק"מ' : ''}
                      </td>
                      
                      {/* Ramtal Adjusted Qty */}
                      <td className="p-3 text-center font-bold">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              value={tempAdjustedQty}
                              onChange={(e) => setTempAdjustedQty(Number(e.target.value))}
                              className="w-20 bg-white border border-blue-500 rounded px-2 py-1 text-center font-bold text-slate-900"
                            />
                            {isTr && <span>ק"מ</span>}
                          </div>
                        ) : (
                          <span className={hasDiscrepancy ? 'text-rose-600 font-extrabold' : 'text-emerald-700'}>
                            {row.ramtalAdjustedQty !== undefined ? row.ramtalAdjustedQty : row.rawReportedQty} {isTr ? 'ק"מ' : ''}
                          </span>
                        )}
                      </td>

                      {/* Reason / Notes & File Attachment */}
                      <td className="p-3">
                        {isEditing ? (
                          <input
                            type="text"
                            placeholder="נימוק חובה לשינוי כמות..."
                            value={tempAdjustmentReason}
                            onChange={(e) => setTempAdjustmentReason(e.target.value)}
                            className="w-full bg-white border border-blue-500 rounded px-2 py-1 text-xs"
                          />
                        ) : (
                          <div>
                            <span className="text-slate-700 font-medium">
                              {row.ramtalAdjustmentReason || row.notes || '-'}
                            </span>
                            {row.attachmentFileName && (
                              <span className="mr-2 text-blue-600 font-semibold inline-flex items-center gap-1 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 text-[10px]">
                                <Paperclip className="w-3 h-3" />
                                {row.attachmentFileName}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* 3. סטטוס */}
                      <td className="p-3 text-center">
                        {getStatusBadge(row)}
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-center">
                        {row.status === 'ramtal_approved' || row.status === 'food_dept_approved' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-2xs">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>מאושר (ננעל)</span>
                          </span>
                        ) : row.status === 'returned_for_revision' ? (
                          <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-2xs">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                            <span>הוחזר לתיקון</span>
                          </span>
                        ) : isEditing ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => {
                                if (tempAdjustedQty !== row.rawReportedQty && !tempAdjustmentReason.trim()) {
                                  alert('חובה להזין נימוק לשינוי כמות!');
                                  return;
                                }
                                onAdjustDailyRow(row.id, tempAdjustedQty, tempAdjustmentReason);
                                setEditingRowId(null);
                                showToast('השורה עודכנה ונשמרה בהצלחה!', 'success');
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-xs flex items-center gap-1"
                              title="שמור שינוי"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>שמור</span>
                            </button>
                            <button
                              onClick={() => setEditingRowId(null)}
                              className="p-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs transition cursor-pointer"
                              title="בטל"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                if (onApproveDailyRow) {
                                  onApproveDailyRow(row.id);
                                } else {
                                  onAdjustDailyRow(row.id, row.rawReportedQty, row.notes || 'אושר ע"י רמת"ל');
                                }
                                showToast('השורה אושרה ונשמרה בהצלחה! 🟢', 'success');
                              }}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition shadow-xs cursor-pointer min-h-[32px]"
                              title="אשר שורה זו ללא שינוי"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-100" />
                              <span>🟢 אשר שורה</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setReturnRowModalId(row.id);
                                setRowReturnReason('');
                              }}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 rounded-xl text-xs font-bold flex items-center gap-1 transition shadow-2xs cursor-pointer min-h-[32px]"
                              title="החזר שורה זו לתיקון הספק עם נימוק חובה"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                              <span>🔴 החזר לתיקון</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => startEditRow(row)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition cursor-pointer"
                              title="ערוך כמות מנומקת"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
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
        )}
      </div>

      {/* Single Row Return Reason Modal */}
      {returnRowModalId !== null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4" dir="rtl">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 animate-fade-in">
            <div className="flex items-center gap-2 text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-200">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <h4 className="text-sm font-bold text-slate-900">החזרת שורת דיווח לתיקון הספק</h4>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                נימוק חובה להחזרה לתיקון (*):
              </label>
              <textarea
                value={rowReturnReason}
                onChange={(e) => setRowReturnReason(e.target.value)}
                placeholder="פרט מדוע השורה נדרשת לתיקון (לדוגמה: אי התאמה לאסמכתא המצורפת / חוסר במנות)..."
                rows={3}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none font-medium"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReturnRowModalId(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                ביטול
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!rowReturnReason.trim()) {
                    alert('חובה להזין נימוק להחזרה לתיקון!');
                    return;
                  }
                  if (onReturnDailyRow) {
                    onReturnDailyRow(returnRowModalId, rowReturnReason);
                  }
                  setReturnRowModalId(null);
                  showToast('השורה הוחזרה לתיקון הספק בהצלחה! 🔴', 'danger');
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition cursor-pointer"
              >
                אישור והחזרה לתיקון
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Reason Modal for Month */}
      {returnReasonModal && (effectiveSummary || currentSummary) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <div className="flex items-center gap-2 text-rose-600 mb-2">
              <ShieldAlert className="w-5 h-5" />
              <h4 className="text-lg font-bold text-slate-800">החזרת דוח חודשי לעריכת הספק</h4>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              הזן נימוק ברור ומפורט מדוע הדוח מוחזר, כדי שהספק יתקן את הנתונים ויגיש מחדש.
            </p>
            
            <textarea
              value={returnText}
              onChange={(e) => setReturnText(e.target.value)}
              placeholder="רשום נימוק (לדוגמה: אי התאמה בין שורות 3-5 לאסמכתאות הסריקה)..."
              rows={3}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
              required
            />

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setReturnReasonModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              >
                ביטול
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!returnText.trim()) {
                    alert('נא להזין נימוק להחזרה!');
                    return;
                  }
                  const targetId = effectiveSummary?.id || currentSummary?.id;
                  if (targetId) {
                    onReturnSummary(targetId, returnText);
                  }
                  setReturnReasonModal(false);
                  setReturnText('');
                  showToast('הדוח החודשי הוחזר לעריכת הספק! 🔴', 'danger');
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow transition cursor-pointer"
              >
                בצע החזרה לספק
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};


