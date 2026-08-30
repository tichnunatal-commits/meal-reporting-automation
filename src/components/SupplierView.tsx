import React, { useState, useRef } from 'react';
import { DailyReportRow, Kitchen, MealType, MonthlyKitchenSummary, User } from '../types';
import { Plus, Send, Upload, FileText, CheckCircle2, AlertTriangle, Clock, Trash2, Calendar, Utensils, Edit2, Copy, Check, X, Lock, Paperclip } from 'lucide-react';
import { SearchableKitchenSelect, formatKitchenDisplayName } from './SearchableKitchenSelect';
import { filterKitchensForSupplier } from '../data/supplierKitchenMap';

interface SupplierViewProps {
  currentUser: User;
  kitchens: Kitchen[];
  mealTypes: MealType[];
  dailyReports: DailyReportRow[];
  monthlySummaries: MonthlyKitchenSummary[];
  onAddDailyReport: (report: Omit<DailyReportRow, 'id'>) => void;
  onUpdateDailyReport?: (updatedRow: DailyReportRow) => void;
  onDuplicateDailyReport?: (rowId: number) => void;
  onDeleteDailyReport?: (rowId: number) => void;
  onSubmitMonth: (summaryId: number) => void;
}

export const SupplierView: React.FC<SupplierViewProps> = ({
  currentUser,
  kitchens,
  mealTypes,
  dailyReports,
  monthlySummaries,
  onAddDailyReport,
  onUpdateDailyReport,
  onDuplicateDailyReport,
  onDeleteDailyReport,
  onSubmitMonth,
}) => {
  // 1. הרשאות ספקים דינמיות מקובץ האקסל
  const allowedKitchens = filterKitchensForSupplier(kitchens, currentUser.supplierId || 1);
  const myKitchens = [...allowedKitchens].sort((a, b) => {
    const clusterComp = (a.cluster || a.region || '').localeCompare(b.cluster || b.region || '', 'he');
    if (clusterComp !== 0) return clusterComp;
    return a.name.localeCompare(b.name, 'he');
  });
  const [selectedKitchenId, setSelectedKitchenId] = useState<number>(myKitchens[0]?.id || 1);

  const selectedKitchen = kitchens.find(k => k.id === selectedKitchenId);
  const currentSummary = monthlySummaries.find(s => s.kitchenId === selectedKitchenId);
  const currentReports = dailyReports.filter(r => r.kitchenId === selectedKitchenId);
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

  const isTransportMeal = (typeId: number) => typeId === 9 || typeId === 10;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file.name);
    }
  };

  const startEditRow = (row: DailyReportRow) => {
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
      notes: editNotes.trim()
    };

    if (onUpdateDailyReport) {
      onUpdateDailyReport(updated);
    }
    setEditingRowId(null);
  };

  const confirmDeleteRow = (rowId: number) => {
    if (onDeleteDailyReport) {
      onDeleteDailyReport(rowId);
    }
    setDeleteConfirmRowId(null);
  };

  const handleAddRow = (e: React.FormEvent) => {
    e.preventDefault();

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
    if (isSpecialEvent) {
      setIsSpecialEvent(false);
      setEventCostNis(0);
    }
  };

  const totalReportedMeals = currentReports.reduce((sum, r) => sum + r.rawReportedQty, 0);

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

      {/* Top Banner: Kitchen selection & status */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
        <div>
          <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
            נציג ספק הסעדה
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 mt-1">יומן דיווח כמויות ארוחות</h2>
          <p className="text-xs text-slate-500">הזנת נתונים יומיים מחוץ לשעון וצירוף אסמכתאות</p>
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

      {/* Workflow Status Card */}
      {currentSummary && (
        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          currentSummary.status === 'draft' ? 'bg-amber-50/80 border-amber-200 text-amber-900' :
          currentSummary.status === 'submitted' ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' :
          currentSummary.status === 'returned_for_revision' ? 'bg-rose-50/80 border-rose-200 text-rose-900' :
          'bg-emerald-50/80 border-emerald-200 text-emerald-900'
        }`}>
          <div className="flex items-start sm:items-center gap-3">
            <div className="mt-0.5 sm:mt-0 shrink-0">
              {currentSummary.status === 'submitted' && <Clock className="w-5 h-5 text-emerald-600" />}
              {currentSummary.status === 'returned_for_revision' && <AlertTriangle className="w-5 h-5 text-rose-600" />}
              {currentSummary.status === 'ramtal_approved' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              {currentSummary.status === 'draft' && <FileText className="w-5 h-5 text-amber-600" />}
            </div>
            
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">סטטוס דוח חודשי:</div>
              <div className="font-bold text-xs sm:text-sm break-words">
                {currentSummary.status === 'draft' && 'טיוטה פתוחה להזנה (טרם הוגש לרמת"ל)'}
                {currentSummary.status === 'submitted' && '🟢 ממתין לאישור רמת"ל (הדוח ננעל לבקרה משטרתית)'}
                {currentSummary.status === 'returned_for_revision' && `הוחזר לעריכה ע"י הרמת"ל: "${currentSummary.revisionReason || 'נא לתקן כמויות'}"`}
                {currentSummary.status === 'ramtal_approved' && 'אושר ע"י רמת"ל — הועבר לבקרת מדור מזון'}
                {currentSummary.status === 'food_dept_approved' && 'אושר סופית לתשלום ע"י מדור מזון'}
              </div>
            </div>
          </div>

          {(currentSummary.status === 'draft' || currentSummary.status === 'returned_for_revision') && (
            <button
              onClick={() => setShowSubmitConfirmModal(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md transition shrink-0 cursor-pointer min-h-[44px]"
            >
              <Send className="w-4 h-4" />
              סיום דיווח חודשי והגשה לרמת״ל
            </button>
          )}
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
            /* 5. Transport as Kilometers (ק"מ) */
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

          {/* Bottom Row: Mandatory Notes, Attachment Button & Submit */}
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

              {/* 2. Hidden file input & connected button */}
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf,image/*"
                onChange={handleFileChange}
                className="hidden"
              />

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
                <span className="truncate max-w-[180px]">
                  {uploadedFile ? `צורף: ${uploadedFile}` : 'צרף אסמכתא (PDF)'}
                </span>
                {uploadedFile && <Check className="w-3.5 h-3.5 text-emerald-600 ml-1" />}
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 active:bg-black text-white font-bold text-xs sm:text-sm py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              הוסף שורת דיווח
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

          {isMonthSubmitted ? (
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 px-3.5 py-2 rounded-xl text-xs font-bold shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>הדיווחים ננעלו והוגשו בהצלחה לרמת"ל</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowSubmitConfirmModal(true)}
              disabled={currentReports.length === 0}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-md cursor-pointer disabled:opacity-50 min-h-[44px]"
            >
              <Send className="w-4 h-4" />
              <span>סיום דיווח חודשי והגשה לרמת״ל</span>
            </button>
          )}
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

                  <div className="grid grid-cols-3 gap-2 text-center text-xs bg-slate-50 p-2 rounded-xl border border-slate-200/60">
                    <div>
                      <div className="text-[10px] text-slate-400">חד"א</div>
                      <strong className="text-slate-700">{isTr ? '-' : (row.diningHallQty || '-')}</strong>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">משיכות</div>
                      <strong className="text-slate-700">{isTr ? '-' : (row.takeawayQty || '-')}</strong>
                    </div>
                    <div>
                      <div className="text-[10px] text-blue-600 font-bold">סה"כ כמות</div>
                      <strong className="text-blue-700 font-extrabold">
                        {row.rawReportedQty} {isTr ? 'ק"מ' : 'מנות'}
                      </strong>
                    </div>
                  </div>

                  {/* Notes & Attachment in Card */}
                  <div className="text-[11px] text-slate-600 bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                    <div><strong>הערה/אסמכתא:</strong> {row.notes || '-'}</div>
                    {row.attachmentFileName && (
                      <div className="text-blue-600 font-medium flex items-center gap-1 mt-0.5">
                        <Paperclip className="w-3 h-3" />
                        <span>{row.attachmentFileName}</span>
                      </div>
                    )}
                  </div>

                  {row.isSpecialEvent && (
                    <div className="text-xs bg-amber-50 text-amber-900 p-2 rounded-xl border border-amber-200">
                      אירוע מיוחד / חשבונית: <strong>₪{row.eventCostNis?.toLocaleString()}</strong>
                    </div>
                  )}

                  {/* Actions Bar for Mobile */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-[11px]">
                      {isMonthSubmitted || row.status === 'submitted' ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> ממתין לאישור רמת"ל
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px] font-bold">
                          טיוטה
                        </span>
                      )}
                    </div>

                    {!isMonthSubmitted && (
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

                return (
                  <tr key={row.id} className={isEditing ? 'bg-amber-50/70' : 'hover:bg-slate-50 transition'}>
                    <td className="p-3 text-slate-400 font-mono">{idx + 1}</td>

                    {/* 2. תאריך */}
                    <td className="p-3 font-medium text-slate-800">
                      {isEditing ? (
                        <input
                          type="date"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
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
                          onChange={(e) => setEditMealTypeId(Number(e.target.value))}
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
                            onChange={(e) => setEditDiningQty(e.target.value === '' ? '' : Number(e.target.value))}
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
                            onChange={(e) => setEditTakeawayQty(e.target.value === '' ? '' : Number(e.target.value))}
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
                              onChange={(e) => setEditTransportKm(e.target.value === '' ? '' : Number(e.target.value))}
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
                            onChange={(e) => setEditEventCost(e.target.value === '' ? '' : Number(e.target.value))}
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
                          onChange={(e) => setEditNotes(e.target.value)}
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
                      {isMonthSubmitted || row.status === 'submitted' ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" /> ממתין לאישור רמת"ל
                        </span>
                      ) : row.ramtalAdjustedQty !== undefined && row.ramtalAdjustedQty !== row.rawReportedQty ? (
                        <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-medium text-[11px]">
                          תוקן ל-{row.ramtalAdjustedQty}
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                          טיוטה
                        </span>
                      )}
                    </td>

                    {/* 10. פעולות (עריכה, שכפול, מחיקה, שמירה) */}
                    <td className="p-3 text-center">
                      {isMonthSubmitted ? (
                        <span className="text-slate-400 font-medium text-[11px] inline-flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5 text-slate-400" /> ננעל
                        </span>
                      ) : isEditing ? (
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
                      ) : (
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
                האם לנעול ולהגיש את הדיווחים לחודש זה? לאחר ההגשה לא ניתן יהיה לבצע שינויים נוספים בשורות הדיווח.
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
                  if (currentSummary) {
                    onSubmitMonth(currentSummary.id);
                  }
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

    </div>
  );
};


