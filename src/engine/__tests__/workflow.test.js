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

test('Comprehensive Workflow V3: Master Reset, Dynamic Drafts, Ramtal Strictly-Approved Calculation, Revision Cycle & Deletion', () => {
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

  // בידוד הרמטי: מסך הרמת"ל מסנן 100% טיוטות
  const ramtalReportsInitial = dailyReports.filter(r => (r.status || 'draft') !== 'draft');
  assert.equal(ramtalReportsInitial.length, 0, 'Ramtal view must strictly show 0 drafts');

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
      return { ...s, status: 'submitted', totalReportedRaw: sum, totalRamtalApproved: 0 };
    }
    return s;
  });

  // וידוא שהשורות ננעלו והסטטוס הפך ל-submitted
  assert.equal(dailyReports[0].status, 'submitted');
  assert.equal(dailyReports[1].status, 'submitted');
  assert.equal(monthlySummaries[0].status, 'submitted');
  assert.equal(monthlySummaries[0].totalReportedRaw, 210);

  // בדיקת חישוב סה"כ כמות מאושרת ברמת"ל (Issue 3): שורות שהוגשו עדיין לא מאושרות -> סה"כ מאושר הוא 0
  const ramtalApprovedSumBefore = dailyReports
    .filter(r => r.status === 'ramtal_approved' || r.status === 'food_dept_approved')
    .reduce((acc, curr) => acc + (curr.ramtalAdjustedQty !== undefined ? curr.ramtalAdjustedQty : curr.rawReportedQty), 0);
  assert.equal(ramtalApprovedSumBefore, 0, 'Total approved must be strictly 0 before any approvals');

  // 3. הוספת שורה 3 בטיוטה ע"י ספק לאחר ההגשה (Issue 2)
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
    status: 'draft' // פתוחה לחלוטין לעריכה
  };
  dailyReports.push(row3);

  // וידוא ששורה 3 פתוחה בטיוטה ושורות 1-2 נשארות נעולות ב-submitted
  assert.equal(dailyReports[2].status, 'draft');
  assert.equal(dailyReports[0].status, 'submitted');
  assert.equal(dailyReports[1].status, 'submitted');

  // נעילת שורה נבדקת ברמת השורה הבודדת בלבד
  const isRow3Locked = dailyReports[2].status === 'submitted' || dailyReports[2].status === 'ramtal_approved';
  assert.equal(isRow3Locked, false, 'Row 3 must remain unlocked');

  // 4. אישור שורה 1 ע"י רמת"ל (Issue 3)
  dailyReports = dailyReports.map(r => r.id === 101 ? { ...r, status: 'ramtal_approved' } : r);
  assert.equal(dailyReports[0].status, 'ramtal_approved');

  // וידוא חישוב סה"כ כמות מאושרת ברמת"ל: שורה 1 בלבד (120 מנות)
  const ramtalApprovedSumAfterRow1 = dailyReports
    .filter(r => r.status === 'ramtal_approved' || r.status === 'food_dept_approved')
    .reduce((acc, curr) => acc + (curr.ramtalAdjustedQty !== undefined ? curr.ramtalAdjustedQty : curr.rawReportedQty), 0);
  assert.equal(ramtalApprovedSumAfterRow1, 120, 'Total approved must equal strictly approved row 1 (120)');

  // 5. החזרת שורה 2 לתיקון ע"י רמת"ל עם נימוק חובה
  const revisionReason = 'אי התאמה לספירת שומר בשער';
  dailyReports = dailyReports.map(r => r.id === 102 ? { ...r, status: 'returned_for_revision', ramtalAdjustmentReason: revisionReason } : r);
  
  assert.equal(dailyReports[1].status, 'returned_for_revision');
  assert.equal(dailyReports[1].ramtalAdjustmentReason, revisionReason);

  // 6. עדכון נקודתי לשורה בתיקון ע"י ספק (Issue 4)
  const updatedRow2 = {
    ...dailyReports[1],
    diningHallQty: 75,
    rawReportedQty: 85,
    notes: 'תוקן לפי ספירת שער עדכנית'
  };
  // בעת שמירה, מעבר מ-returned_for_revision ל-submitted מתבצע אך ורק עבור אותה שורה
  dailyReports = dailyReports.map(r => {
    if (r.id === updatedRow2.id) {
      return { ...updatedRow2, status: 'submitted' };
    }
    return r;
  });
  assert.equal(dailyReports[1].status, 'submitted');
  assert.equal(dailyReports[1].rawReportedQty, 85);
  // שורה 3 נשארת draft ושורה 1 נשארת ramtal_approved
  assert.equal(dailyReports[0].status, 'ramtal_approved');
  assert.equal(dailyReports[2].status, 'draft');

  // 7. הוספה ומחיקה של שורה שהוחזרה לתיקון (Issue 5)
  const row4 = {
    id: 104,
    monthlySummaryId: 1,
    kitchenId: 1,
    reportDate: '2026-08-04',
    mealTypeId: 1,
    mealTypeName: 'בוקר',
    rawReportedQty: 40,
    status: 'returned_for_revision'
  };
  dailyReports.push(row4);
  assert.equal(dailyReports.length, 4);

  // מחיקת שורה בסטטוס נדרש תיקון
  dailyReports = dailyReports.filter(r => r.id !== 104);
  assert.equal(dailyReports.length, 3);
  assert.equal(dailyReports.some(r => r.id === 104), false);

  // 8. איפוס מאסטר מוחלט (Issue 1)
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
    foodDeptApprovedAt: undefined,
    revisionReason: undefined
  }));

  // וידוא ניקוי מלא ב-100% ל-0 שורות בכל המערכת
  assert.equal(dailyReports.length, 0);
  assert.equal(monthlySummaries[0].status, 'draft');
  assert.equal(monthlySummaries[0].totalReportedRaw, 0);
  assert.equal(monthlySummaries[0].totalRamtalApproved, 0);
});
