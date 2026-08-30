import React, { useState } from 'react';
import { DailyReportRow, Kitchen, MonthlyKitchenSummary, User } from '../types';
import { CheckCircle2, RotateCcw, AlertCircle, Edit3, ShieldAlert, FileText, Check, X, Bell, Paperclip } from 'lucide-react';
import { SearchableKitchenSelect, formatKitchenDisplayName } from './SearchableKitchenSelect';

interface RamtalViewProps {
  currentUser: User;
  kitchens: Kitchen[];
  dailyReports: DailyReportRow[];
  monthlySummaries: MonthlyKitchenSummary[];
  onApproveSummary: (summaryId: number) => void;
  onReturnSummary: (summaryId: number, reason: string) => void;
  onAdjustDailyRow: (rowId: number, newQty: number, reason: string) => void;
}

export const RamtalView: React.FC<RamtalViewProps> = ({
  currentUser,
  kitchens,
  dailyReports,
  monthlySummaries,
  onApproveSummary,
  onReturnSummary,
  onAdjustDailyRow
}) => {
  const sortedKitchens = [...kitchens].sort((a, b) => {
    const clusterComp = (a.cluster || a.region || '').localeCompare(b.cluster || b.region || '', 'he');
    if (clusterComp !== 0) return clusterComp;
    return a.name.localeCompare(b.name, 'he');
  });
  const [selectedKitchenId, setSelectedKitchenId] = useState<number>(sortedKitchens[0]?.id || 1);
  const [returnReasonModal, setReturnReasonModal] = useState<boolean>(false);
  const [returnText, setReturnText] = useState<string>('');

  // עריכת כמות נקודתית בשורה
  const [editingRowId, setEditingRowId] = useState<number | null>(null);
  const [tempAdjustedQty, setTempAdjustedQty] = useState<number>(0);
  const [tempAdjustmentReason, setTempAdjustmentReason] = useState<string>('');

  const currentSummary = monthlySummaries.find(s => s.kitchenId === selectedKitchenId);
  const selectedKitchen = kitchens.find(k => k.id === selectedKitchenId);

  // 8. הסתרת טיוטות: מסך הרמת"ל יציג רק שורות שהוגשו (ממתין לאישור רמת"ל / מאושר / לתקן)
  const isSummarySubmitted = currentSummary?.status === 'submitted' || currentSummary?.status === 'ramtal_approved' || currentSummary?.status === 'food_dept_approved' || currentSummary?.status === 'returned_for_revision';
  const currentReports = dailyReports.filter(r => 
    r.kitchenId === selectedKitchenId && 
    (r.status === 'submitted' || r.status === 'ramtal_approved' || r.status === 'food_dept_approved' || r.status === 'returned_for_revision' || isSummarySubmitted)
  );

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

  return (
    <div className="space-y-6">
      
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
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
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
          />
        </div>
      </div>

      {/* Summary KPI & Action Header */}
      {currentSummary && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold">
                {selectedKitchen ? formatKitchenDisplayName(selectedKitchen) : currentSummary.kitchenName}
              </h3>
              <span className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded font-mono">
                {currentSummary.supplierName}
              </span>
            </div>
            <div className="flex items-center gap-6 text-xs text-slate-300 pt-2">
              <div>כמות שדווחה ע"י ספק: <strong className="text-white text-sm">{currentSummary.totalReportedRaw.toLocaleString()}</strong></div>
              <div>כמות מאושרת רמת"ל: <strong className="text-emerald-400 text-sm">{currentSummary.totalRamtalApproved.toLocaleString()}</strong></div>
              <div>סטטוס: <strong className="text-blue-300">
                {currentSummary.status === 'submitted' ? '🟢 ממתין לאישור רמת"ל' :
                 currentSummary.status === 'ramtal_approved' ? 'אושר רמת"ל' :
                 currentSummary.status === 'draft' ? 'טיוטת ספק' : currentSummary.status}
              </strong></div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {currentSummary.status === 'submitted' ? (
              <>
                <button
                  onClick={() => setReturnReasonModal(true)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-rose-900/80 hover:bg-rose-900 text-rose-200 border border-rose-700/60 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  החזר לעריכת הספק
                </button>
                <button
                  onClick={() => onApproveSummary(currentSummary.id)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-lg transition cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  אשר חודש והעבר למדור מזון
                </button>
              </>
            ) : (
              <div className="bg-slate-800/80 border border-slate-700 px-4 py-2 rounded-xl text-xs text-slate-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>הדוח בסטטוס <strong>{currentSummary.status}</strong> (מאושר או ממתין לספק)</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Daily Verification Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-slate-600" />
            <h3 className="font-bold text-slate-800 text-sm">בדיקת שורות הדיווח היומיות (רמת"ל)</h3>
          </div>
          <span className="text-xs text-slate-500">
            לחץ על כפתור העריכה בכל שורה לתיקון כמות עם נימוק
          </span>
        </div>

        {currentReports.length === 0 ? (
          <div className="text-center py-10 px-4 space-y-2 bg-slate-50/50">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
            <div className="text-xs font-bold text-slate-700">אין דיווחים שהוגשו לאישור עבור מטבח זה</div>
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
                  <th className="p-3">סוג ארוחה</th>
                  <th className="p-3 text-center">חד"א</th>
                  <th className="p-3 text-center">משיכות</th>
                  <th className="p-3 text-center">כמות מדווחת ספק</th>
                  <th className="p-3 text-center">כמות מאושרת רמת"ל</th>
                  <th className="p-3">נימוק שינוי / הערה / אסמכתא</th>
                  <th className="p-3 text-center">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentReports.map(row => {
                  const isEditing = editingRowId === row.id;
                  const isTr = isTransportMeal(row.mealTypeId, row.mealTypeName);
                  const hasDiscrepancy = row.ramtalAdjustedQty !== undefined && row.ramtalAdjustedQty !== row.rawReportedQty;

                  return (
                    <tr key={row.id} className={hasDiscrepancy ? 'bg-amber-50/60' : 'hover:bg-slate-50'}>
                      <td className="p-3 font-medium text-slate-800">{row.reportDate}</td>
                      <td className="p-3 text-slate-700">{row.mealTypeName}</td>
                      <td className="p-3 text-center text-slate-600">{isTr ? '-' : (row.diningHallQty || '-')}</td>
                      <td className="p-3 text-center text-slate-600">{isTr ? '-' : (row.takeawayQty || '-')}</td>
                      
                      {/* 5. כמות מדווחת ספק */}
                      <td className="p-3 text-center font-bold text-slate-700">
                        {row.rawReportedQty} {isTr ? 'ק"מ' : ''}
                      </td>
                      
                      {/* 5. Ramtal Adjusted Qty */}
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

                      {/* Actions */}
                      <td className="p-3 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => saveEditRow(row.id)}
                              className="p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded transition cursor-pointer"
                              title="שמור שינוי"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingRowId(null)}
                              className="p-1 bg-slate-400 hover:bg-slate-500 text-white rounded transition cursor-pointer"
                              title="בטל"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEditRow(row)}
                            className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition cursor-pointer"
                            title="ערוך כמות מנומקת"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
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

      {/* Return Reason Modal */}
      {returnReasonModal && currentSummary && (
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
                  onReturnSummary(currentSummary.id, returnText);
                  setReturnReasonModal(false);
                  setReturnText('');
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

