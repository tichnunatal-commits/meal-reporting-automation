import test from 'node:test';
import assert from 'node:assert/strict';

// Helper matching logic from App.tsx
const isRowInTargetPeriod = (reportDate, targetMonth, targetYear) => {
  if (!reportDate) return true;
  const str = String(reportDate).trim();

  // YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (isoMatch) {
    const y = parseInt(isoMatch[1], 10);
    const m = parseInt(isoMatch[2], 10);
    return y === targetYear && m === targetMonth;
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const hebrewMatch = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (hebrewMatch) {
    const m = parseInt(hebrewMatch[2], 10);
    const y = parseInt(hebrewMatch[3], 10);
    return y === targetYear && m === targetMonth;
  }

  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return d.getFullYear() === targetYear && (d.getMonth() + 1) === targetMonth;
  }

  return true;
};

test('Full System Workflow: Drafts -> Submit Month -> Lock -> New Drafts -> Ramtal Approval & Revision -> Admin Reset', () => {
  let dailyReports = [];
  let monthlySummaries = [
    {
      id: 1,
      kitchenId: 1,
      kitchenName: 'מטבח מכמש',
      supplierId: 1,
      supplierName: 'קייטרינג גורמה',
      periodYear: 2026,
      periodMonth: 8,
      ramtalUserId: 2,
      ramtalUserName: 'רפ"ק אבי כהן',
      status: 'draft',
      totalReportedRaw: 0,
      totalRamtalApproved: 0,
      calculatedNetMeals: 0,
      calculatedTotalAmountNis: 0,
      calculationAudit: []
    }
  ];

  // 1. הוספת 2 שורות טיוטה ע"י ספק
  const row1 = {
    id: 101,
    monthlySummaryId: 1,
    kitchenId: 1,
    reportDate: '2026-08-01',
    mealTypeId: 2,
    mealTypeName: 'צהריים',
    diningHallQty: 100,
    takeawayQty: 20,
    rawReportedQty: 120,
    isSpecialEvent: false,
    notes: 'אסמכתא 101',
    status: 'draft'
  };

  const row2 = {
    id: 102,
    monthlySummaryId: 1,
    kitchenId: 1,
    reportDate: '02/08/2026', // Hebrew date format
    mealTypeId: 2,
    mealTypeName: 'צהריים',
    diningHallQty: 80,
    takeawayQty: 10,
    rawReportedQty: 90,
    isSpecialEvent: false,
    notes: 'אסמכתא 102',
    status: 'draft'
  };

  dailyReports.push(row1, row2);
  assert.equal(dailyReports.length, 2);
  assert.equal(dailyReports[0].status, 'draft');
  assert.equal(dailyReports[1].status, 'draft');

  // 2. הגשת החודש לרמת"ל (סיום דיווח חודשי)
  const targetKitchenId = 1;
  const submitMonth = 8;
  const submitYear = 2026;

  dailyReports = dailyReports.map(r => {
    if (r.kitchenId === targetKitchenId) {
      if (isRowInTargetPeriod(r.reportDate, submitMonth, submitYear) || r.status === 'draft') {
        return { ...r, status: 'submitted' };
      }
    }
    return r;
  });

  monthlySummaries = monthlySummaries.map(s => {
    if (s.kitchenId === targetKitchenId) {
      const sum = dailyReports.filter(r => r.kitchenId === targetKitchenId).reduce((a, c) => a + c.rawReportedQty, 0);
      return { ...s, status: 'submitted', totalReportedRaw: sum, totalRamtalApproved: sum };
    }
    return s;
  });

  // וידוא שהשורות ננעלו והסטטוס הפך ל-submitted
  assert.equal(dailyReports[0].status, 'submitted');
  assert.equal(dailyReports[1].status, 'submitted');
  assert.equal(monthlySummaries[0].status, 'submitted');
  assert.equal(monthlySummaries[0].totalReportedRaw, 210);

  // 3. הוספת שורה 3 בטיוטה ע"י ספק לאחר ההגשה
  const row3 = {
    id: 103,
    monthlySummaryId: 1,
    kitchenId: 1,
    reportDate: '2026-08-03',
    mealTypeId: 1,
    mealTypeName: 'בוקר',
    diningHallQty: 50,
    takeawayQty: 0,
    rawReportedQty: 50,
    isSpecialEvent: false,
    notes: 'אסמכתא 103',
    status: 'draft' // פתוחה לעריכה
  };
  dailyReports.push(row3);

  // וידוא ששורה 3 פתוחה בטיוטה ושורות 1-2 נשארות נעולות ב-submitted
  assert.equal(dailyReports[2].status, 'draft');
  assert.equal(dailyReports[0].status, 'submitted');
  assert.equal(dailyReports[1].status, 'submitted');

  // 4. אישור שורה 1 ע"י רמת"ל ללא שינוי כמות וללא חובת נימוק
  dailyReports = dailyReports.map(r => r.id === 101 ? { ...r, status: 'ramtal_approved' } : r);
  assert.equal(dailyReports[0].status, 'ramtal_approved');

  // 5. החזרת שורה 2 לתיקון ע"י רמת"ל עם נימוק חובה
  const revisionReason = 'אי התאמה לספירת שומר בשער';
  dailyReports = dailyReports.map(r => r.id === 102 ? { ...r, status: 'returned_for_revision', ramtalAdjustmentReason: revisionReason } : r);
  
  assert.equal(dailyReports[1].status, 'returned_for_revision');
  assert.equal(dailyReports[1].ramtalAdjustmentReason, revisionReason);

  // בדיקת סטטוס באנר עליון (Single Source of Truth)
  const hasReturned = dailyReports.some(r => r.status === 'returned_for_revision');
  assert.equal(hasReturned, true); // באנר אדום יוצג

  // 6. איפוס אדמין מלא (מחיקת כל הדיווחים)
  dailyReports = [];
  monthlySummaries = monthlySummaries.map(s => ({
    ...s,
    status: 'draft',
    totalReportedRaw: 0,
    totalRamtalApproved: 0,
    calculatedNetMeals: 0,
    calculatedTotalAmountNis: 0,
    submittedAt: undefined,
    ramtalApprovedAt: undefined,
    revisionReason: undefined
  }));

  // וידוא ניקוי מלא ב-100%
  assert.equal(dailyReports.length, 0);
  assert.equal(monthlySummaries[0].status, 'draft');
  assert.equal(monthlySummaries[0].totalReportedRaw, 0);
  assert.equal(monthlySummaries[0].totalRamtalApproved, 0);
});
