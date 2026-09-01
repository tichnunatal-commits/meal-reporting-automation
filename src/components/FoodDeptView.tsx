import React, { useState } from 'react';
import { DailyReportRow, Kitchen, KitchenTariff, MonthlyKitchenSummary, User } from '../types';
import { MealCalculationEngine } from '../engine/calculator';
import { 
  Calculator, 
  FileSpreadsheet, 
  FileText, 
  CheckCircle, 
  Lock, 
  TrendingUp, 
  Building2, 
  ShieldCheck,
  ChevronLeft,
  Sparkles
} from 'lucide-react';
import { formatKitchenDisplayName } from './SearchableKitchenSelect';

interface FoodDeptViewProps {
  currentUser: User;
  kitchens: Kitchen[];
  tariffs: KitchenTariff[];
  dailyReports: DailyReportRow[];
  monthlySummaries: MonthlyKitchenSummary[];
  onFinalApproveSummary: (summaryId: number) => void;
}

export const FoodDeptView: React.FC<FoodDeptViewProps> = ({
  currentUser,
  kitchens,
  tariffs,
  dailyReports,
  monthlySummaries,
  onFinalApproveSummary
}) => {
  const [selectedSummaryId, setSelectedSummaryId] = useState<number>(monthlySummaries[0]?.id || 1);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const selectedSummary = monthlySummaries.find(s => s.id === selectedSummaryId);
  const selectedKitchen = kitchens.find(k => k.id === selectedSummary?.kitchenId);
  const selectedKitchenReports = dailyReports.filter(r => r.kitchenId === selectedKitchen?.id);
  const selectedTariffs = tariffs.filter(t => t.kitchenId === selectedKitchen?.id);

  // הרצת מנוע החישוב R1-R5 על המטבח הנבחר
  const calcResult = selectedKitchen ? MealCalculationEngine.calculateMonthlySummary(
    selectedKitchen,
    selectedKitchenReports,
    selectedTariffs,
    {
      isQuarterClosingMonth: true,
      quarterNumber: 3,
      priorMonthsActualMeals: 1800
    }
  ) : null;

  const totalMealsAllKitchens = monthlySummaries.reduce((sum, s) => sum + s.calculatedNetMeals, 0);
  const totalAmountAllKitchens = monthlySummaries.reduce((sum, s) => sum + s.calculatedTotalAmountNis, 0);

  const handleExport = (type: 'excel' | 'pdf') => {
    const currentPeriodStr = `${String(new Date().getMonth() + 1).padStart(2, '0')}/${new Date().getFullYear()}`;
    setExportNotice(`הופק בהצלחה: דוח סיכום תשלום חודש ${currentPeriodStr} (${type.toUpperCase()}) עם פילוח חוקי R1-R5`);
    setTimeout(() => setExportNotice(null), 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Overall KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white p-5 rounded-2xl shadow-sm border border-blue-800 md:col-span-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-300 bg-blue-800/60 px-2.5 py-0.5 rounded-full border border-blue-700">
              מדור מזון • מנהלת בקרה
            </span>
            <ShieldCheck className="w-5 h-5 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold mt-2">דשבורד בקרת כמויות ואישור לתשלום</h2>
          <p className="text-xs text-blue-200 mt-1">ריכוז כלל ספקי ההסעדה, מנוע המרות R1–R5 והפקת קבצים לחשבות</p>
        </div>

        {/* KPI 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>סה"כ מנות לתשלום (ארצי)</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono mt-2">
            {totalMealsAllKitchens.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium">לאחר כללי המרות וקיזוזים</div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>אומדן כספי לתשלום</span>
            <Calculator className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 font-mono mt-2">
            ₪{totalAmountAllKitchens.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 font-medium">כולל אירועים והשלמות מינימום</div>
        </div>

      </div>

      {/* Export Alert Notification */}
      {exportNotice && (
        <div className="bg-emerald-600 text-white p-3 rounded-xl shadow-md text-xs font-semibold flex items-center justify-between animate-fade-in">
          <span>{exportNotice}</span>
          <button onClick={() => setExportNotice(null)} className="text-emerald-200 hover:text-white">✕</button>
        </div>
      )}

      {/* Kitchens Grid List & Actions */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-3">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">סטטוס מטבחים לחודש אוגוסט 2026</h3>
            <p className="text-xs text-slate-500">בחר מטבח לצפייה בצנרת החישוב המלאה של מדור מזון</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport('excel')}
              className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded-lg text-xs font-bold transition"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              ייצוא אקסל לתשלום
            </button>

            <button
              onClick={() => handleExport('pdf')}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold transition"
            >
              <FileText className="w-4 h-4 text-slate-600" />
              דוח PDF חתום
            </button>
          </div>
        </div>

        {/* Summaries Cards */}
        {monthlySummaries.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-2 bg-slate-50/60 rounded-xl border border-slate-200">
            <FileText className="w-8 h-8 text-slate-400 mx-auto" />
            <div className="text-xs font-bold text-slate-700">אין דוחות חודשיים הממתינים לבקרת מדור מזון</div>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              כאשר הרמת"ל יאשר דוח חודשי של תחנה, הוא יופיע כאן אוטומטית לבקרת המרות R1–R5 ואישור לתשלום.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {monthlySummaries.map(s => {
              const isSelected = s.id === selectedSummaryId;
              const kObj = kitchens.find(k => k.id === s.kitchenId);
              const displayName = kObj ? formatKitchenDisplayName(kObj) : s.kitchenName;

              return (
                <div
                  key={s.id}
                  onClick={() => setSelectedSummaryId(s.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition relative ${
                    isSelected 
                      ? 'border-blue-600 bg-blue-50/40 shadow-sm ring-2 ring-blue-500/20' 
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-slate-800">{displayName}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      s.status === 'food_dept_approved' ? 'bg-emerald-100 text-emerald-800' :
                      s.status === 'ramtal_approved' ? 'bg-blue-100 text-blue-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {s.status === 'food_dept_approved' ? 'מאושר סופית' :
                       s.status === 'ramtal_approved' ? 'ממתין למדור מזון' : 'בהמתנה'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 space-y-1">
                    <div>ספק: <span className="text-slate-700 font-medium">{s.supplierName}</span></div>
                    <div>רמת"ל מאשר: <span className="text-slate-700 font-medium">{s.ramtalUserName}</span></div>
                    <div className="pt-2 flex items-center justify-between border-t border-slate-100 mt-2 font-mono">
                      <span className="text-slate-400">כמות מחושבת:</span>
                      <strong className="text-blue-700 font-bold">{s.calculatedNetMeals.toLocaleString()} מנות</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Deep Dive: Calculation Pipeline Inspector for Selected Kitchen */}
      {selectedSummary && selectedKitchen && calcResult && (
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2.5 rounded-xl">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">{formatKitchenDisplayName(selectedKitchen)}</h3>
                </div>
                <p className="text-xs text-slate-400">צנרת הפעלת חוקי החישוב R1–R5 (מנוע אוטומטי שקוף)</p>
              </div>
            </div>

            {currentUser.role === 'viewer_finance' ? (
              <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 text-slate-300 text-xs px-4 py-2.5 rounded-xl">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>מצב צפייה בלבד (חשבות / גזברות)</span>
              </div>
            ) : selectedSummary.status !== 'food_dept_approved' ? (
              <button
                onClick={() => onFinalApproveSummary(selectedSummary.id)}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg transition"
              >
                <CheckCircle className="w-4 h-4" />
                אישור סופי לתשלום (מדור מזון)
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-xs px-4 py-2 rounded-xl">
                <Lock className="w-4 h-4" />
                <span>הדוח אושר סופית לתשלום וננעל</span>
              </div>
            )}
          </div>

          {/* Pipeline Visual Flow */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Step 1: Raw & Ramtal */}
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60">
              <div className="text-[11px] text-slate-400 font-bold uppercase">שלב 1: כמות פיזית בשטח</div>
              <div className="text-xl font-bold font-mono text-white mt-1">
                {calcResult.ramtalApprovedTotal.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">אושר ע"י הרמת"ל (מקור: {calcResult.rawReportedTotal})</div>
            </div>

            {/* Step 2: R1/R2 Factor */}
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60">
              <div className="text-[11px] text-slate-400 font-bold uppercase">שלב 2: כלל בסיס (R1 / R2)</div>
              <div className="text-xl font-bold font-mono text-blue-400 mt-1">
                {selectedKitchen.appliesR1Machmesh ? 'קיצוץ 10% חד"א' :
                 selectedKitchen.appliesR2Tzohar ? 'תוספת 30% צוחר' : 'תעריף רגיל'}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                {selectedKitchen.appliesR1Machmesh ? 'חד"א פנימי בלבד (משיכות 0%)' :
                 selectedKitchen.appliesR2Tzohar ? 'המרה לכשרות מהודרת' : 'ללא התאמת בסיס'}
              </div>
            </div>

            {/* Step 3: Converted Meals */}
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60">
              <div className="text-[11px] text-slate-400 font-bold uppercase">שלב 3: כמות סופית לתשלום</div>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                {calcResult.finalCalculatedMeals.toLocaleString()}
              </div>
              <div className="text-[10px] text-emerald-300/80 mt-1">כולל אירועים ומינימום חוזי</div>
            </div>

            {/* Step 4: Amount NIS */}
            <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/60">
              <div className="text-[11px] text-slate-400 font-bold uppercase">שלב 4: סך לתשלום לספק</div>
              <div className="text-xl font-bold font-mono text-amber-400 mt-1">
                ₪{calcResult.finalTotalAmountNis.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">לפי מחירון מאושר בחוזה</div>
            </div>

          </div>

          {/* Audit Trail Breakdown Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-400" />
              פירוט שלבי חישוב והמרות (Calculation Audit Trail):
            </h4>

            <div className="bg-slate-950/60 rounded-xl border border-slate-800 overflow-hidden">
              {calcResult.auditTrail.length === 0 ? (
                <div className="p-4 text-xs text-slate-400 text-center">
                  לא הופעלו חוקי המרה או קיזוזים מיוחדים על מטבח זה (חישוב ישיר של כמות מאושרת).
                </div>
              ) : (
                <div className="divide-y divide-slate-800/80">
                  {calcResult.auditTrail.map((entry, idx) => (
                    <div key={idx} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="bg-blue-900/60 text-blue-300 font-mono text-[10px] px-2 py-0.5 rounded border border-blue-800">
                            {entry.ruleCode}
                          </span>
                          <strong className="text-white">{entry.ruleNameHebrew}</strong>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-1">{entry.calculationDescription}</p>
                      </div>

                      <div className="flex items-center gap-4 font-mono text-left">
                        <span className={entry.adjustmentMeals >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                          {entry.adjustmentMeals >= 0 ? `+${entry.adjustmentMeals}` : entry.adjustmentMeals} מנות
                        </span>
                        <span className="text-slate-500">➜</span>
                        <strong className="text-white bg-slate-800 px-2 py-1 rounded">
                          {entry.outputQuantity.toLocaleString()} מנות
                        </strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
