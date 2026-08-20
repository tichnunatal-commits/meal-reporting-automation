/**
 * מודול הצלבת נתוני שעון נוכחות מול דיווחי ספק מחוץ לשעון
 * Clock Sync & Anti-Duplicate Reconciliation Engine
 */

export interface ClockRegistration {
  policeId: string;       // מספר אישי / ת"ז
  badgeNumber: string;    // מספר תג
  scanTimestamp: string;  // YYYY-MM-DD HH:mm:ss
  kitchenId: number;
  mealTypeId: number;
}

export interface ReconcileResult {
  reportDate: string;
  kitchenId: number;
  kitchenName: string;
  mealTypeId: number;
  mealTypeName: string;
  clockCount: number;         // כמות שנרשמה בשעון
  manualOffClockCount: number;// כמות שדווחה מחוץ לשעון ע"י הספק
  potentialOverlap: number;   // כמות חריגה/כפילות חשודה
  estimatedSavingNis: number; // חיסכון כספי פוטנציאלי
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  notes: string;
}

export class ClockReconciler {

  /**
   * הצלבה בין רישומי השעון לדיווחי הספק
   */
  public static reconcile(
    clockRecords: ClockRegistration[],
    dailyOffClockReports: any[],
    mealPriceNis: number = 26.0
  ): ReconcileResult[] {
    const results: ReconcileResult[] = [];

    // קיבוץ רישומי שעון לפי תאריך ומטבח
    const clockMap = new Map<string, number>();
    for (const rec of clockRecords) {
      const dateKey = rec.scanTimestamp.substring(0, 10);
      const key = `${dateKey}_${rec.kitchenId}_${rec.mealTypeId}`;
      clockMap.set(key, (clockMap.get(key) || 0) + 1);
    }

    for (const report of dailyOffClockReports) {
      if (report.isSpecialEvent) continue;

      const key = `${report.reportDate}_${report.kitchenId}_${report.mealTypeId}`;
      const clockCount = clockMap.get(key) || 0;
      const manualCount = report.rawReportedQty || (report.diningHallQty + report.takeawayQty);

      // אם שניהם דיווחו כמות משמעותית באותו יום בחד"א
      let potentialOverlap = 0;
      let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
      let notes = 'תקין - אין אינדיקציה לכפילות';

      if (clockCount > 0 && report.diningHallQty > 50) {
        // חשד לכפילות ברישום שוטרי חד"א פנימי שגם העבירו כרטיס
        potentialOverlap = Math.min(clockCount, Math.round(report.diningHallQty * 0.25));
        riskLevel = potentialOverlap > 20 ? 'HIGH' : 'MEDIUM';
        notes = `זוהו ${clockCount} העברות כרטיס בשעון במקביל ל-${report.diningHallQty} מנות חד"א מחוץ לשעון`;
      }

      const estimatedSavingNis = potentialOverlap * mealPriceNis;

      results.push({
        reportDate: report.reportDate,
        kitchenId: report.kitchenId,
        kitchenName: report.kitchenName || 'מטבח',
        mealTypeId: report.mealTypeId,
        mealTypeName: report.mealTypeName || 'ארוחה',
        clockCount,
        manualOffClockCount: manualCount,
        potentialOverlap,
        estimatedSavingNis,
        riskLevel,
        notes
      });
    }

    return results;
  }
}
