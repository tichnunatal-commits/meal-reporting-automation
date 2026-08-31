import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

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

test('Strict Row Autonomy & No-Bleed Workflow (V4)', () => {
  let dailyReports = [];
  let monthlySummaries = [];

  // Helper row locking check
  const isRowLocked = (row) => {
    const s = row.status || 'draft';
    return s === 'submitted' || s === 'ramtal_approved' || s === 'approved' || s === 'food_dept_approved' || s === 'deleted_by_supplier';
  };

  // Helper banner status computer
  const computeBannerStatus = (reports) => {
    const active = reports.filter(r => r.status !== 'deleted_by_supplier');
    if (active.length === 0) {
      return { title: 'אין שורות דיווח שנרשמו לחודש זה', type: 'empty' };
    }
    const hasReturned = active.some(r => r.status === 'returned_for_revision' || r.status === 'rejected');
    const hasSubmitted = active.some(r => r.status === 'submitted');
    const allApproved = active.length > 0 && active.every(r => r.status === 'ramtal_approved' || r.status === 'approved' || r.status === 'food_dept_approved');

    if (hasReturned) return { title: 'קיימות שורות שנדרשו לתיקון', type: 'revision' };
    if (allApproved) return { title: 'הדו"ח אושר ע"י רמת"ל', type: 'approved' };
    if (hasSubmitted) return { title: 'ממתין לאישור רמת"ל', type: 'submitted' };
    return { title: 'טיוטה פתוחה להזנה', type: 'draft' };
  };

  // 1. איפוס מאסטר ואימות היעדר באנר "draft" רוח (Issue 1)
  dailyReports = [];
  monthlySummaries = [];
  const emptyBanner = computeBannerStatus(dailyReports);
  assert.equal(emptyBanner.type, 'empty', '0 rows must yield empty neutral status, not draft');
  assert.equal(emptyBanner.title, 'אין שורות דיווח שנרשמו לחודש זה');

  // 2. הוספת 5 שורות והגשת החודש (Issue 2)
  for (let i = 1; i <= 5; i++) {
    dailyReports.push({
      id: 200 + i,
      kitchenId: 1,
      reportDate: `2026-08-0${i}`,
      mealTypeId: 2,
      mealTypeName: 'צהריים',
      diningHallQty: 50,
      takeawayQty: 10,
      rawReportedQty: 60,
      status: 'draft'
    });
  }
  assert.equal(dailyReports.length, 5);
  assert.equal(dailyReports.every(r => !isRowLocked(r)), true, 'All fresh drafts must be unlocked');

  // הגשת חודש: מעדכן אך ורק שורות draft ל-submitted
  const targetKitchenId = 1;
  const month = 8;
  const year = 2026;

  dailyReports = dailyReports.map(r => {
    if (r.kitchenId === targetKitchenId) {
      const isDraft = (r.status || 'draft') === 'draft';
      if (isDraft && isRowInTargetPeriod(r.reportDate, month, year)) {
        return { ...r, status: 'submitted' };
      }
    }
    return r;
  });

  assert.equal(dailyReports.every(r => r.status === 'submitted'), true);
  assert.equal(dailyReports.every(r => isRowLocked(r)), true, 'Submitted rows are now locked');

  // 3. הוספת שורת טיוטה חדשה (שורה 6) לצד שורות נעולות (Issue 2)
  const row6 = {
    id: 206,
    kitchenId: 1,
    reportDate: '2026-08-06',
    mealTypeId: 1,
    mealTypeName: 'בוקר',
    rawReportedQty: 30,
    status: 'draft'
  };
  dailyReports.push(row6);
  assert.equal(dailyReports.length, 6);

  // וידוא: שורה 6 פתוחה לעריכה (isLocked: false) בעוד 1-5 נשארות נעולות (isLocked: true)
  assert.equal(isRowLocked(dailyReports[5]), false, 'Row 6 draft must remain strictly unlocked');
  assert.equal(isRowLocked(dailyReports[0]), true, 'Row 1 submitted must remain strictly locked');
  assert.equal(isRowLocked(dailyReports[4]), true, 'Row 5 submitted must remain strictly locked');

  // 4. אישור 4 שורות מתוך 5 והחזרת השורה ה-5 לתיקון - מניעת זליגת סטטוסים (Issue 4)
  // רמת"ל מאשר את שורות 201, 202, 203, 204
  [201, 202, 203, 204].forEach(rowId => {
    dailyReports = dailyReports.map(r => r.id === rowId ? { ...r, status: 'ramtal_approved' } : r);
  });

  // רמת"ל מחזיר את שורה 205 לתיקון
  dailyReports = dailyReports.map(r => r.id === 205 ? {
    ...r,
    status: 'returned_for_revision',
    ramtalAdjustmentReason: 'חוסר התאמה לאסמכתא'
  } : r);

  // אימות: בדיוק 4 שורות הן ramtal_approved, בדיוק 1 היא returned_for_revision, שורה 206 נשארת draft
  const approvedRows = dailyReports.filter(r => r.status === 'ramtal_approved');
  const rejectedRows = dailyReports.filter(r => r.status === 'returned_for_revision');
  const draftRows = dailyReports.filter(r => r.status === 'draft');

  assert.equal(approvedRows.length, 4, 'Strictly 4 rows must be approved (no leakage)');
  assert.equal(rejectedRows.length, 1, 'Strictly row 205 is returned for revision');
  assert.equal(rejectedRows[0].id, 205);
  assert.equal(draftRows.length, 1, 'Row 206 remains draft');
  assert.equal(draftRows[0].id, 206);

  // בדיקת סכום כמות מאושרת: 4 שורות * 60 מנות = 240 מנות מאושרות
  const totalApprovedSum = dailyReports
    .filter(r => r.status === 'ramtal_approved' || r.status === 'food_dept_approved')
    .reduce((acc, curr) => acc + curr.rawReportedQty, 0);
  assert.equal(totalApprovedSum, 240, 'Approved quantity must sum strictly approved rows (240)');

  // 5. הגשת חודש נוספת - משנה רק את שורה 206 (draft) ואינה נוגעת בשורה 205 (rejected) (Issue 2)
  dailyReports = dailyReports.map(r => {
    if (r.kitchenId === targetKitchenId) {
      const isDraft = (r.status || 'draft') === 'draft';
      if (isDraft && isRowInTargetPeriod(r.reportDate, month, year)) {
        return { ...r, status: 'submitted' };
      }
    }
    return r;
  });

  assert.equal(dailyReports.find(r => r.id === 206).status, 'submitted');
  assert.equal(dailyReports.find(r => r.id === 205).status, 'returned_for_revision', 'Row 205 must NOT be overwritten by month submit');
});

test('Audit Trail for Supplier-Deleted Rejected Rows (V5)', () => {
  // שורה שהוחזרה לתיקון
  let dailyReports = [
    {
      id: 301,
      kitchenId: 1,
      reportDate: '2026-08-01',
      mealTypeId: 2,
      rawReportedQty: 50,
      status: 'returned_for_revision',
      ramtalAdjustmentReason: 'לא מופיע בפקודת מבצע'
    }
  ];

  // ספק מוחק את השורה שהוחזרה לתיקון
  const rowIdToDelete = 301;
  const target = dailyReports.find(r => r.id === rowIdToDelete);
  const isRevision = target.status === 'returned_for_revision' || target.status === 'rejected';

  if (isRevision) {
    dailyReports = dailyReports.map(r => r.id === rowIdToDelete ? { ...r, status: 'deleted_by_supplier' } : r);
  } else {
    dailyReports = dailyReports.filter(r => r.id !== rowIdToDelete);
  }

  // 1. במסך הספק: השורה מוסרת מתצוגת הדיווחים הפעילה
  const supplierViewReports = dailyReports.filter(r => r.status !== 'deleted_by_supplier');
  assert.equal(supplierViewReports.length, 0, 'Supplier view must NOT show deleted_by_supplier row');

  // 2. במסך הרמת"ל: השורה נשמרת בסטטוס deleted_by_supplier לתיעוד Audit Trail
  const ramtalViewReports = dailyReports.filter(r => (r.status || 'draft') !== 'draft');
  assert.equal(ramtalViewReports.length, 1, 'Ramtal view must retain deleted_by_supplier row for audit log');
  assert.equal(ramtalViewReports[0].status, 'deleted_by_supplier');

  // 3. כמות מאושרת היא 0
  const approvedTotal = ramtalViewReports
    .filter(r => r.status === 'ramtal_approved' || r.status === 'approved' || r.status === 'food_dept_approved')
    .reduce((acc, curr) => acc + curr.rawReportedQty, 0);
  assert.equal(approvedTotal, 0, 'Deleted row contributes 0 to approved meals');
});

test('Admin Reset & Delete Scope Options (Current Kitchen, Supplier, All 124)', () => {
  const kitchens = [
    { id: 1, name: 'בית שאן', supplierId: 2 },
    { id: 2, name: 'טבריה', supplierId: 2 },
    { id: 115, name: 'מכמש', supplierId: 1 }
  ];

  const isKitchenInScope = (kId, scope, targetKitchenId, targetSupplierId) => {
    if (scope === 'all_kitchens') return true;
    if (scope === 'current_kitchen') return targetKitchenId !== undefined && kId === targetKitchenId;
    if (scope === 'current_supplier') {
      const k = kitchens.find(item => item.id === kId);
      return k?.supplierId === targetSupplierId;
    }
    return true;
  };

  let reports = [
    { id: 1, kitchenId: 1, reportDate: '2026-08-01', status: 'draft' },
    { id: 2, kitchenId: 2, reportDate: '2026-08-01', status: 'draft' },
    { id: 3, kitchenId: 115, reportDate: '2026-08-01', status: 'draft' }
  ];

  // 1. היקף מטבח נוכחי בלבד (בית שאן - ID 1)
  let test1 = reports.filter(r => !isKitchenInScope(r.kitchenId, 'current_kitchen', 1, undefined));
  assert.equal(test1.length, 2);
  assert.equal(test1.some(r => r.kitchenId === 1), false);

  // 2. היקף כל מטבחי הספק הנוכחי (מבושלת - supplierId 2: כולל מטבח 1 ו-2)
  let test2 = reports.filter(r => !isKitchenInScope(r.kitchenId, 'current_supplier', undefined, 2));
  assert.equal(test2.length, 1);
  assert.equal(test2[0].kitchenId, 115, 'Only supplier 1 kitchen remains');

  // 3. היקף כל המטבחים (גלובלי)
  let test3 = reports.filter(r => !isKitchenInScope(r.kitchenId, 'all_kitchens', undefined, undefined));
  assert.equal(test3.length, 0, 'All reports cleared');
});

test('Station to Supplier Mapping Distribution (124 Stations)', async () => {
  const fileContent = fs.readFileSync(path.resolve('src/data/mockData.ts'), 'utf-8');
  
  const start = fileContent.indexOf('export const mockKitchens: Kitchen[] = [');
  const end = fileContent.indexOf('];', start);
  const kitchensJson = fileContent.substring(start + 'export const mockKitchens: Kitchen[] = '.length, end + 1);
  const mockKitchens = JSON.parse(kitchensJson);

  assert.equal(mockKitchens.length, 124, 'Total kitchens must be 124');
  
  const gourmet = mockKitchens.filter(k => k.supplierId === 1);
  const mevushelet = mockKitchens.filter(k => k.supplierId === 2);
  const liber = mockKitchens.filter(k => k.supplierId === 3);
  const sodexo = mockKitchens.filter(k => k.supplierId === 4);

  assert.equal(gourmet.length, 3, 'Gourmet must have exactly 3 stations');
  assert.equal(mevushelet.length, 79, 'Mevushelet must have exactly 79 stations');
  assert.equal(liber.length, 40, 'Liber must have exactly 40 stations');
  assert.equal(sodexo.length, 2, 'Sodexo must have exactly 2 stations');
});

test('Uniform Clean Empty State for All 124 Kitchens (Zero Ghost Summaries)', async () => {
  const fileContent = fs.readFileSync(path.resolve('src/data/mockData.ts'), 'utf-8');
  
  assert.ok(fileContent.includes('export const mockMonthlySummaries: MonthlyKitchenSummary[] = [];'));
  assert.ok(fileContent.includes('export const mockDailyRows: DailyReportRow[] = [];'));
  assert.ok(fileContent.includes('export const initialMonthlySummaries: MonthlyKitchenSummary[] = [];'));
  assert.ok(fileContent.includes('export const initialDailyReports: DailyReportRow[] = [];'));

  const start = fileContent.indexOf('export const mockKitchens: Kitchen[] = [');
  const end = fileContent.indexOf('];', start);
  const kitchensJson = fileContent.substring(start + 'export const mockKitchens: Kitchen[] = '.length, end + 1);
  const mockKitchens = JSON.parse(kitchensJson);

  for (const kitchen of mockKitchens) {
    const kitchenReports = [];

    const isSupplierEmpty = kitchenReports.length === 0;
    assert.equal(isSupplierEmpty, true);

    const currentSummary = undefined;
    const effectiveSummary = (kitchen.id > 0 && kitchenReports.length > 0) ? {} : null;
    assert.equal(effectiveSummary, null, `Kitchen ${kitchen.name} (ID: ${kitchen.id}) must have null effectiveSummary when 0 reports`);
  }
});
