/**
 * מודול הצלבת נתוני שעון נוכחות מול דיווחי ספק מחוץ לשעון
 * Clock Sync & Anti-Duplicate Reconciliation Engine
 */
export class ClockReconciler {
    /**
     * הצלבה בין רישומי השעון לדיווחי הספק
     */
    static reconcile(clockRecords, dailyOffClockReports, mealPriceNis = 26.0) {
        const results = [];
        // קיבוץ רישומי שעון לפי תאריך ומטבח
        const clockMap = new Map();
        for (const rec of clockRecords) {
            const dateKey = rec.scanTimestamp.substring(0, 10);
            const key = `${dateKey}_${rec.kitchenId}_${rec.mealTypeId}`;
            clockMap.set(key, (clockMap.get(key) || 0) + 1);
        }
        for (const report of dailyOffClockReports) {
            if (report.isSpecialEvent)
                continue;
            const key = `${report.reportDate}_${report.kitchenId}_${report.mealTypeId}`;
            const clockCount = clockMap.get(key) || 0;
            const manualCount = report.rawReportedQty || (report.diningHallQty + report.takeawayQty);
            // אם שניהם דיווחו כמות משמעותית באותו יום בחד"א
            let potentialOverlap = 0;
            let riskLevel = 'LOW';
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
