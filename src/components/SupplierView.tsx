import React, { useState } from 'react';
import { DailyReportRow, Kitchen, MealType, MonthlyKitchenSummary, User } from '../types';
import { Plus, Send, Upload, FileText, CheckCircle2, AlertTriangle, Clock, Trash2, Calendar, Utensils } from 'lucide-react';

interface SupplierViewProps {
  currentUser: User;
  kitchens: Kitchen[];
  mealTypes: MealType[];
  dailyReports: DailyReportRow[];
  monthlySummaries: MonthlyKitchenSummary[];
  onAddDailyReport: (report: Omit<DailyReportRow, 'id'>) => void;
  onSubmitMonth: (summaryId: number) => void;
}

export const SupplierView: React.FC<SupplierViewProps> = ({
  currentUser,
  kitchens,
  mealTypes,
  dailyReports,
  monthlySummaries,
  onAddDailyReport,
  onSubmitMonth,
}) => {
  const filteredKitchens = kitchens.filter(k => k.supplierId === currentUser.supplierId);
  const myKitchens = filteredKitchens.length > 0 ? filteredKitchens : kitchens;
  const [selectedKitchenId, setSelectedKitchenId] = useState<number>(myKitchens[0]?.id || 1);

  const selectedKitchen = kitchens.find(k => k.id === selectedKitchenId);
  const currentSummary = monthlySummaries.find(s => s.kitchenId === selectedKitchenId);
  const currentReports = dailyReports.filter(r => r.kitchenId === selectedKitchenId);

  // טופס הזנה יומית
  const [reportDate, setReportDate] = useState<string>('2026-08-11');
  const [mealTypeId, setMealTypeId] = useState<number>(2);
  const [diningHallQty, setDiningHallQty] = useState<number>(100);
  const [takeawayQty, setTakeawayQty] = useState<number>(30);
  const [isSpecialEvent, setIsSpecialEvent] = useState<boolean>(false);
  const [eventCostNis, setEventCostNis] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const handleAddRow = (e: React.FormEvent) => {
    e.preventDefault();
    const mealTypeObj = mealTypes.find(m => m.id === mealTypeId);
    const rawTotal = isSpecialEvent ? 0 : (Number(diningHallQty) + Number(takeawayQty));

    onAddDailyReport({
      monthlySummaryId: currentSummary?.id || 1,
      kitchenId: selectedKitchenId,
      reportDate,
      mealTypeId,
      mealTypeName: mealTypeObj?.nameHebrew || 'ארוחה',
      diningHallQty: isSpecialEvent ? 0 : Number(diningHallQty),
      takeawayQty: isSpecialEvent ? 0 : Number(takeawayQty),
      rawReportedQty: rawTotal,
      isSpecialEvent,
      eventCostNis: isSpecialEvent ? Number(eventCostNis) : undefined,
      notes: notes || undefined
    });

    setNotes('');
    if (isSpecialEvent) {
      setIsSpecialEvent(false);
      setEventCostNis(0);
    }
  };

  const totalReportedMeals = currentReports.reduce((sum, r) => sum + r.rawReportedQty, 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      
      {/* Top Banner: Kitchen selection & status */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
        <div>
          <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
            נציג ספק הסעדה
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 mt-1">יומן דיווח כמויות ארוחות</h2>
          <p className="text-xs text-slate-500">הזנת נתונים יומיים מחוץ לשעון וצירוף אסמכתאות</p>
        </div>

        <div className="w-full sm:w-auto">
          <label className="block text-[11px] font-medium text-slate-600 mb-1 sm:hidden">בחר מטבח מדווח:</label>
          <select
            value={selectedKitchenId}
            onChange={(e) => setSelectedKitchenId(Number(e.target.value))}
            className="w-full sm:w-auto bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {myKitchens.map(k => (
              <option key={k.id} value={k.id}>
                {k.name} ({k.kitchenCode})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Workflow Status Card */}
      {currentSummary && (
        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          currentSummary.status === 'draft' ? 'bg-amber-50/80 border-amber-200 text-amber-900' :
          currentSummary.status === 'submitted' ? 'bg-blue-50/80 border-blue-200 text-blue-900' :
          currentSummary.status === 'returned_for_revision' ? 'bg-rose-50/80 border-rose-200 text-rose-900' :
          'bg-emerald-50/80 border-emerald-200 text-emerald-900'
        }`}>
          <div className="flex items-start sm:items-center gap-3">
            <div className="mt-0.5 sm:mt-0 shrink-0">
              {currentSummary.status === 'submitted' && <Clock className="w-5 h-5 text-blue-600" />}
              {currentSummary.status === 'returned_for_revision' && <AlertTriangle className="w-5 h-5 text-rose-600" />}
              {currentSummary.status === 'ramtal_approved' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              {currentSummary.status === 'draft' && <FileText className="w-5 h-5 text-amber-600" />}
            </div>
            
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">סטטוס דוח חודשי:</div>
              <div className="font-bold text-xs sm:text-sm break-words">
                {currentSummary.status === 'draft' && 'טיוטה פתוחה להזנה (טרם הוגש לרמת"ל)'}
                {currentSummary.status === 'submitted' && 'הוגש לרמת"ל — ממתין לבדיקה ואישור משטרתי'}
                {currentSummary.status === 'returned_for_revision' && `הוחזר לעריכה ע"י הרמת"ל: "${currentSummary.revisionReason || 'נא לתקן כמויות'}"`}
                {currentSummary.status === 'ramtal_approved' && 'אושר ע"י רמת"ל — הועבר לבקרת מדור מזון'}
                {currentSummary.status === 'food_dept_approved' && 'אושר סופית לתשלום ע"י מדור מזון'}
              </div>
            </div>
          </div>

          {(currentSummary.status === 'draft' || currentSummary.status === 'returned_for_revision') && (
            <button
              onClick={() => onSubmitMonth(currentSummary.id)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-sm transition shrink-0"
            >
              <Send className="w-4 h-4" />
              הגש חודש לאישור רמת"ל
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
              <label className="text-[11px] font-medium text-slate-600">תאריך</label>
              <input
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-600">סוג ארוחה / דיווח</label>
              <select
                value={mealTypeId}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  setMealTypeId(id);
                  setIsSpecialEvent(id === 5);
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {mealTypes.map(m => (
                  <option key={m.id} value={m.id}>{m.nameHebrew}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Middle Row: Quantities or Event NIS */}
          {!isSpecialEvent ? (
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
                  onChange={(e) => setDiningHallQty(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600">משיכות קו / חוץ</label>
                <input
                  type="number"
                  min="0"
                  value={takeawayQty}
                  onChange={(e) => setTakeawayQty(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="col-span-2 sm:col-span-1 space-y-1">
                <label className="text-[11px] font-medium text-slate-500">סה"כ מנות שורה</label>
                <div className="w-full bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-blue-700 text-center">
                  {(Number(diningHallQty) || 0) + (Number(takeawayQty) || 0)} מנות
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-amber-800">סכום חשבונית אירוע בש"ח (R3)</label>
              <input
                type="number"
                min="0"
                value={eventCostNis}
                onChange={(e) => setEventCostNis(Number(e.target.value))}
                placeholder="סכום לתשלום בש''ח"
                className="w-full bg-amber-50 border border-amber-300 rounded-xl px-3 py-2 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none font-bold text-amber-900"
                required
              />
            </div>
          )}

          {/* Bottom Row: Notes, Attachment & Submit Button */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="הערה לשורה / מספר אסמכתא (אופציונלי)..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none"
              />

              <button
                type="button"
                onClick={() => setShowUploadModal(true)}
                className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 px-3 py-2 rounded-xl border border-slate-200 transition"
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="truncate max-w-[160px]">
                  {uploadedFile ? `צורף: ${uploadedFile}` : 'צרף אסמכתא (PDF)'}
                </span>
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 active:bg-black text-white font-bold text-xs sm:text-sm py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              הוסף שורת דיווח
            </button>
          </div>

        </form>
      </div>

      {/* Reports: Desktop Table + Mobile Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-3.5 sm:p-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-xs sm:text-sm">שורות דיווח שנרשמו לחודש הנוכחי</h3>
            <p className="text-[11px] text-slate-500">
              סה"כ מנות שדווחו: <strong className="text-blue-700">{totalReportedMeals.toLocaleString()}</strong> ({currentReports.length} שורות)
            </p>
          </div>
        </div>

        {/* Mobile View: Cards */}
        <div className="block md:hidden divide-y divide-slate-100">
          {currentReports.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              טרם הוזנו שורות דיווח למטבח זה.
            </div>
          ) : (
            currentReports.map((row) => (
              <div key={row.id} className="p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span className="font-bold text-slate-800">{row.reportDate}</span>
                  </div>
                  <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                    {row.mealTypeName}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs bg-slate-50 p-2 rounded-xl">
                  <div>
                    <div className="text-[10px] text-slate-400">חד"א</div>
                    <strong className="text-slate-700">{row.diningHallQty || '-'}</strong>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">משיכות</div>
                    <strong className="text-slate-700">{row.takeawayQty || '-'}</strong>
                  </div>
                  <div>
                    <div className="text-[10px] text-blue-600 font-bold">סה"כ מנות</div>
                    <strong className="text-blue-700 font-extrabold">{row.rawReportedQty || '-'}</strong>
                  </div>
                </div>

                {row.isSpecialEvent && (
                  <div className="text-xs bg-amber-50 text-amber-900 p-2 rounded-xl border border-amber-200">
                    אירוע מיוחד / חשבונית: <strong>₪{row.eventCostNis?.toLocaleString()}</strong>
                  </div>
                )}

                {row.ramtalAdjustedQty !== undefined && row.ramtalAdjustedQty !== row.rawReportedQty && (
                  <div className="text-[11px] bg-rose-50 text-rose-800 p-2 rounded-xl border border-rose-200 font-medium">
                    תוקן ע"י רמת"ל ל-<strong>{row.ramtalAdjustedQty} מנות</strong> (נימוק: {row.ramtalAdjustmentReason})
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Desktop View: Full Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-100/90 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">תאריך</th>
                <th className="p-3">סוג ארוחה</th>
                <th className="p-3 text-center">חד"א פנימי</th>
                <th className="p-3 text-center">משיכות חוץ</th>
                <th className="p-3 text-center">סה"כ מנות</th>
                <th className="p-3">אירוע / סכום בש"ח</th>
                <th className="p-3">הערות ואסמכתא</th>
                <th className="p-3 text-center">סטטוס רמת"ל</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentReports.map((row, idx) => (
                <tr key={row.id} className="hover:bg-slate-50 transition">
                  <td className="p-3 text-slate-400 font-mono">{idx + 1}</td>
                  <td className="p-3 font-medium text-slate-800">{row.reportDate}</td>
                  <td className="p-3 text-slate-700">{row.mealTypeName}</td>
                  <td className="p-3 text-center font-semibold text-slate-700">{row.diningHallQty || '-'}</td>
                  <td className="p-3 text-center font-semibold text-slate-700">{row.takeawayQty || '-'}</td>
                  <td className="p-3 text-center font-bold text-blue-600 bg-blue-50/40">{row.rawReportedQty || '-'}</td>
                  <td className="p-3">
                    {row.isSpecialEvent ? (
                      <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">
                        ₪{row.eventCostNis?.toLocaleString()}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="p-3 text-slate-500">{row.notes || '-'}</td>
                  <td className="p-3 text-center">
                    {row.ramtalAdjustedQty !== undefined && row.ramtalAdjustedQty !== row.rawReportedQty ? (
                      <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-medium text-[11px]">
                        תוקן ל-{row.ramtalAdjustedQty} ({row.ramtalAdjustmentReason})
                      </span>
                    ) : (
                      <span className="text-slate-400">ממתין לבדיקה</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h4 className="text-base sm:text-lg font-bold text-slate-800 mb-1.5">העלאת קובץ אסמכתא</h4>
            <p className="text-xs text-slate-500 mb-4">העלה חשבונית, דוח סריקה או מסמך חתום (PDF/JPG עד 15MB)</p>
            
            <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition bg-slate-50 hover:bg-blue-50/30">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <div className="text-xs font-bold text-slate-700">לחץ לבחירת קובץ מהמכשיר</div>
              <div className="text-[10px] text-slate-400 mt-1">PDF, JPG, PNG</div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                ביטול
              </button>
              <button
                type="button"
                onClick={() => {
                  setUploadedFile('asmachta_august_2026.pdf');
                  setShowUploadModal(false);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition"
              >
                אישור ושמירה
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
