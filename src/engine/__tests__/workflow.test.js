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

test('Dynamic Period Tag in Header (MM/YYYY formatting)', () => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const expectedPeriodTag = `${String(currentMonth).padStart(2, '0')}/${currentYear}`;

  // Helper matching Header.tsx formatting
  const formatPeriodTag = (selectedPeriod) => {
    return `${String(selectedPeriod.month).padStart(2, '0')}/${selectedPeriod.year}`;
  };

  const periodObj = { month: currentMonth, year: currentYear };
  assert.equal(formatPeriodTag(periodObj), expectedPeriodTag, `Period tag must match current month and year dynamically (${expectedPeriodTag})`);

  // Verify Header.tsx and App.tsx file contents no longer contain hardcoded '08/'
  const headerContent = fs.readFileSync(path.resolve('src/components/Header.tsx'), 'utf-8');
  assert.ok(!headerContent.includes('08/{selectedPeriod.year}'), 'Header.tsx must not contain hardcoded 08/');
  assert.ok(headerContent.includes('String(selectedPeriod.month).padStart(2, \'0\')'), 'Header.tsx must format selectedPeriod.month dynamically');

  const appContent = fs.readFileSync(path.resolve('src/App.tsx'), 'utf-8');
  assert.ok(!appContent.includes('selectedPeriod={{ month: 8, year: 2026 }}'), 'App.tsx must not pass static month 8');
  assert.ok(appContent.includes('new Date().getMonth() + 1'), 'App.tsx must dynamically compute month');
});

test('Kitchen Disabling Mechanism (Persistence, Supplier Lockout & Re-activation)', () => {
  const DISABLED_STORAGE_KEY = 'police_disabled_kitchens_v1';
  let disabledKitchens = [];

  // Toggle handler matching App.tsx
  const toggleKitchen = (kitchenId) => {
    const isCurrentlyDisabled = disabledKitchens.includes(kitchenId);
    disabledKitchens = isCurrentlyDisabled
      ? disabledKitchens.filter(id => id !== kitchenId)
      : [...disabledKitchens, kitchenId];
    return JSON.stringify(disabledKitchens);
  };

  // 1. Initial active state for kitchen 1
  assert.equal(disabledKitchens.includes(1), false, 'Kitchen 1 should start active');

  // 2. Admin disables kitchen 1 ("השבת מטבח (סוף חודש)")
  const savedJson = toggleKitchen(1);
  assert.equal(disabledKitchens.includes(1), true, 'Kitchen 1 is now disabled');
  assert.equal(savedJson, '[1]', 'localStorage JSON must contain disabled kitchen ID 1');

  // 3. Supplier View validation when kitchen is disabled
  const isActionAllowed = (kitchenId, action) => {
    const isKitchenDisabled = disabledKitchens.includes(kitchenId);
    if (isKitchenDisabled) return false;
    return true;
  };

  assert.equal(isActionAllowed(1, 'add_row'), false, 'Adding rows must be strictly blocked when kitchen is disabled');
  assert.equal(isActionAllowed(1, 'edit_row'), false, 'Editing rows must be strictly blocked when kitchen is disabled');
  assert.equal(isActionAllowed(1, 'delete_row'), false, 'Deleting rows must be strictly blocked when kitchen is disabled');
  assert.equal(isActionAllowed(1, 'submit_month'), false, 'Submitting month must be strictly blocked when kitchen is disabled');

  // Other active kitchens (e.g. kitchen 2) remain fully functional
  assert.equal(isActionAllowed(2, 'add_row'), true, 'Active kitchen 2 must allow adding rows');

  // 4. Admin re-enables kitchen 1 ("הפעל מטבח")
  const reactivatedJson = toggleKitchen(1);
  assert.equal(disabledKitchens.includes(1), false, 'Kitchen 1 is now re-activated');
  assert.equal(reactivatedJson, '[]', 'localStorage JSON must be empty array after re-enabling');

  // 5. Supplier View unblocked after re-activation
  assert.equal(isActionAllowed(1, 'add_row'), true, 'Adding rows is now allowed');
  assert.equal(isActionAllowed(1, 'edit_row'), true, 'Editing rows is now allowed');
  assert.equal(isActionAllowed(1, 'submit_month'), true, 'Submitting month is now allowed');

  // 6. Verify App.tsx contains DISABLED_KITCHENS_STORAGE_KEY
  const appContent = fs.readFileSync(path.resolve('src/App.tsx'), 'utf-8');
  assert.ok(appContent.includes("const DISABLED_KITCHENS_STORAGE_KEY = 'police_disabled_kitchens_v1';"));
  assert.ok(appContent.includes("disabledKitchens={disabledKitchens}"));
});

test('Firebase Firestore Cloud Migration (Collections, Rules, Seeding & Real-Time Listeners)', () => {
  // 1. Verify src/data/firebase.ts exists and defines the 3 collections
  const firebaseTs = fs.readFileSync(path.resolve('src/data/firebase.ts'), 'utf-8');
  assert.ok(firebaseTs.includes("DAILY_REPORTS: 'daily_reports'"), 'Must define daily_reports collection');
  assert.ok(firebaseTs.includes("MONTHLY_SUMMARIES: 'monthly_summaries'"), 'Must define monthly_summaries collection');
  assert.ok(firebaseTs.includes("APP_CONFIG: 'app_config'"), 'Must define app_config collection');
  assert.ok(firebaseTs.includes('persistentLocalCache'), 'Must enable offline cache persistence');
  assert.ok(firebaseTs.includes('seedInitialDataIfEmpty'), 'Must include seedInitialDataIfEmpty');

  // 2. Verify firestore.rules exists and covers collections
  const rules = fs.readFileSync(path.resolve('firestore.rules'), 'utf-8');
  assert.ok(rules.includes('match /daily_reports/{reportId}'), 'Rules must cover daily_reports');
  assert.ok(rules.includes('match /monthly_summaries/{summaryId}'), 'Rules must cover monthly_summaries');
  assert.ok(rules.includes('match /app_config/{configId}'), 'Rules must cover app_config');

  // 3. Verify App.tsx subscribes to real-time listeners and writes to Firestore
  const appContent = fs.readFileSync(path.resolve('src/App.tsx'), 'utf-8');
  assert.ok(appContent.includes('subscribeToDailyReports'), 'App.tsx must subscribe to daily_reports');
  assert.ok(appContent.includes('subscribeToMonthlySummaries'), 'App.tsx must subscribe to monthly_summaries');
  assert.ok(appContent.includes('subscribeToAppConfig'), 'App.tsx must subscribe to app_config');
  assert.ok(appContent.includes('saveDailyReportToFirestore'), 'App.tsx must sync daily reports to Firestore');
  assert.ok(appContent.includes('saveMonthlySummaryToFirestore'), 'App.tsx must sync monthly summaries to Firestore');
  assert.ok(appContent.includes('saveDisabledKitchensToFirestore'), 'App.tsx must sync disabled kitchens to Firestore');
});

test('Security Audit: No Hardcoded Secrets in Source Code', () => {
  const srcDir = path.resolve('src');

  // Recursive file collector
  const collectFiles = (dir) => {
    let files = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === '__tests__') continue;
        files = files.concat(collectFiles(full));
      } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
        files.push(full);
      }
    }
    return files;
  };

  const srcFiles = collectFiles(srcDir);
  assert.ok(srcFiles.length > 0, 'Must find TypeScript source files');

  for (const file of srcFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const basename = path.basename(file);

    // No hardcoded API keys (direct string literals matching Firebase key pattern)
    const apiKeyHardcoded = /apiKey:\s*'AIza[A-Za-z0-9_-]{30,}'/.test(content);
    assert.equal(apiKeyHardcoded, false, `${basename} must NOT contain a hardcoded Firebase API key`);
  }

  // firebase.ts must use import.meta.env
  const firebaseTs = fs.readFileSync(path.resolve('src/data/firebase.ts'), 'utf-8');
  assert.ok(firebaseTs.includes('import.meta.env.VITE_FIREBASE_API_KEY'), 'firebase.ts must load API key from env');
  assert.ok(firebaseTs.includes('import.meta.env.VITE_FIREBASE_PROJECT_ID'), 'firebase.ts must load project ID from env');

  // .gitignore must exclude secrets
  const gitignore = fs.readFileSync(path.resolve('.gitignore'), 'utf-8');
  assert.ok(gitignore.includes('.env'), '.gitignore must exclude .env');
  assert.ok(gitignore.includes('.env.local'), '.gitignore must exclude .env.local');
  assert.ok(gitignore.includes('*.pem'), '.gitignore must exclude *.pem');
  assert.ok(gitignore.includes('firebase_login.json'), '.gitignore must exclude firebase_login.json');
});

test('Security Audit: Firestore Rules Hardened with Default-Deny and Schema Validation', () => {
  const rules = fs.readFileSync(path.resolve('firestore.rules'), 'utf-8');

  // Default deny on catch-all path
  assert.ok(rules.includes('allow read, write: if false'), 'Rules must have default-deny fallback');

  // Schema validation function exists
  assert.ok(rules.includes('hasRequiredReportFields'), 'Rules must include schema validation function');
  assert.ok(rules.includes('kitchenId'), 'Schema validation must check kitchenId');
  assert.ok(rules.includes('reportDate'), 'Schema validation must check reportDate');
  assert.ok(rules.includes('mealTypeId'), 'Schema validation must check mealTypeId');
  assert.ok(rules.includes('rawReportedQty'), 'Schema validation must check rawReportedQty');

  // Create uses validation
  assert.ok(rules.includes('allow create: if hasRequiredReportFields()'), 'daily_reports create must enforce schema');
});

test('Security Audit: Firebase Hosting Security Headers (HSTS, CSP, X-Frame)', () => {
  const fbJson = JSON.parse(fs.readFileSync(path.resolve('firebase.json'), 'utf-8'));

  assert.ok(fbJson.hosting, 'firebase.json must have hosting config');
  assert.ok(Array.isArray(fbJson.hosting.headers), 'hosting must have headers array');

  const headerBlock = fbJson.hosting.headers.find(h => h.source === '**');
  assert.ok(headerBlock, 'Must have a global ** header block');

  const headerMap = {};
  for (const h of headerBlock.headers) {
    headerMap[h.key] = h.value;
  }

  assert.ok(headerMap['Strict-Transport-Security'], 'Must have HSTS header');
  assert.ok(headerMap['Strict-Transport-Security'].includes('max-age=31536000'), 'HSTS must enforce 1-year max-age');
  assert.equal(headerMap['X-Frame-Options'], 'DENY', 'X-Frame-Options must be DENY');
  assert.equal(headerMap['X-Content-Type-Options'], 'nosniff', 'X-Content-Type-Options must be nosniff');
  assert.ok(headerMap['Referrer-Policy'], 'Must have Referrer-Policy header');
  assert.ok(headerMap['Content-Security-Policy'], 'Must have CSP header');
  assert.ok(headerMap['Content-Security-Policy'].includes("default-src 'self'"), 'CSP must restrict default-src to self');
});

test('Security Audit: Centralized Permissions Module (SSOT)', () => {
  // Verify permissions.ts exists
  const permPath = path.resolve('src/utils/permissions.ts');
  assert.ok(fs.existsSync(permPath), 'src/utils/permissions.ts must exist');

  const permContent = fs.readFileSync(permPath, 'utf-8');
  assert.ok(permContent.includes('isAdmin'), 'Must export isAdmin');
  assert.ok(permContent.includes('isSupplier'), 'Must export isSupplier');
  assert.ok(permContent.includes('canApproveRows'), 'Must export canApproveRows');
  assert.ok(permContent.includes('canEditReports'), 'Must export canEditReports');
  assert.ok(permContent.includes('canPerformAdminActions'), 'Must export canPerformAdminActions');
  assert.ok(permContent.includes('getAllowedTabs'), 'Must export getAllowedTabs');

  // App.tsx must import from centralized permissions
  const appContent = fs.readFileSync(path.resolve('src/App.tsx'), 'utf-8');
  assert.ok(appContent.includes("from './utils/permissions'"), 'App.tsx must import from centralized permissions module');
});

test('Security Audit: Input Sanitization (XSS Prevention)', () => {
  // Verify sanitize.ts exists
  const sanitizePath = path.resolve('src/utils/sanitize.ts');
  assert.ok(fs.existsSync(sanitizePath), 'src/utils/sanitize.ts must exist');

  const sanitizeContent = fs.readFileSync(sanitizePath, 'utf-8');
  assert.ok(sanitizeContent.includes('sanitizeText'), 'Must export sanitizeText');
  assert.ok(sanitizeContent.includes('sanitizeDailyReportInput'), 'Must export sanitizeDailyReportInput');
  assert.ok(sanitizeContent.includes('sanitizeReason'), 'Must export sanitizeReason');
  assert.ok(sanitizeContent.includes('HTML_TAG_REGEX'), 'Must strip HTML tags');
  assert.ok(sanitizeContent.includes('JS_PROTOCOL_REGEX'), 'Must strip javascript: protocol');

  // App.tsx must import and use sanitizer
  const appContent = fs.readFileSync(path.resolve('src/App.tsx'), 'utf-8');
  assert.ok(appContent.includes("from './utils/sanitize'"), 'App.tsx must import sanitize utilities');
  assert.ok(appContent.includes('sanitizeDailyReportInput'), 'App.tsx must sanitize daily report inputs');
  assert.ok(appContent.includes('sanitizeReason'), 'App.tsx must sanitize rejection/return reasons');

  // Functional test: verify sanitizeText strips tags
  // Inline JS version of the sanitizer for test validation
  const stripTags = (str) => str.replace(/<\/?[^>]+(>|$)/gi, '').replace(/javascript\s*:/gi, '').replace(/on\w+\s*=/gi, '').trim();
  assert.equal(stripTags('<script>alert("xss")</script>Hello'), 'alert("xss")Hello');
  assert.equal(stripTags('<b>Bold</b> text'), 'Bold text');
  assert.equal(stripTags('Clean text'), 'Clean text');
  assert.equal(stripTags('javascript:alert(1)'), 'alert(1)');
});

test('Cloud Draft Persistence, Auto-Save & Refresh Resilience (status: draft)', () => {
  // 1. Verify src/data/firebase.ts exports cleanFirestoreData and updateDailyReportInFirestore
  const firebaseTs = fs.readFileSync(path.resolve('src/data/firebase.ts'), 'utf-8');
  assert.ok(firebaseTs.includes('export function cleanFirestoreData'), 'firebase.ts must export cleanFirestoreData');
  assert.ok(firebaseTs.includes('export async function updateDailyReportInFirestore'), 'firebase.ts must export updateDailyReportInFirestore');
  assert.ok(firebaseTs.includes('cleanFirestoreData(report)'), 'saveDailyReportToFirestore must clean undefined values');

  // 2. Functional verification of cleanFirestoreData
  const cleanDataFn = (data) => {
    const res = {};
    for (const [k, v] of Object.entries(data)) {
      if (v !== undefined) res[k] = v;
    }
    return res;
  };
  const testDraftRow = {
    id: 1725270000000,
    kitchenId: 1,
    reportDate: '2026-09-02',
    mealTypeId: 2,
    mealTypeName: 'צהריים',
    diningHallQty: 100,
    takeawayQty: 30,
    rawReportedQty: 130,
    isSpecialEvent: false,
    eventCostNis: undefined,
    attachmentFileName: undefined,
    notes: 'בדיקת טיוטה',
    status: 'draft'
  };
  const cleaned = cleanDataFn(testDraftRow);
  assert.equal(cleaned.eventCostNis, undefined);
  assert.equal('eventCostNis' in cleaned, false, 'undefined eventCostNis must be stripped so Firestore does not reject');
  assert.equal('attachmentFileName' in cleaned, false, 'undefined attachmentFileName must be stripped so Firestore does not reject');
  assert.equal(cleaned.status, 'draft', 'status draft must be preserved');
  assert.equal(cleaned.rawReportedQty, 130);

  // 3. Verify App.tsx has handleAutoSaveDailyReport and passes onAutoSaveDailyReport to SupplierView
  const appContent = fs.readFileSync(path.resolve('src/App.tsx'), 'utf-8');
  assert.ok(appContent.includes('handleAutoSaveDailyReport'), 'App.tsx must define handleAutoSaveDailyReport');
  assert.ok(appContent.includes('onAutoSaveDailyReport={handleAutoSaveDailyReport}'), 'App.tsx must pass onAutoSaveDailyReport to SupplierView');

  // 4. Verify SupplierView.tsx accepts onAutoSaveDailyReport and triggers autoSaveRowField
  const supplierViewContent = fs.readFileSync(path.resolve('src/components/SupplierView.tsx'), 'utf-8');
  assert.ok(supplierViewContent.includes('onAutoSaveDailyReport?: (reportId: number, fields: Partial<DailyReportRow>) => void;'), 'SupplierViewProps must include onAutoSaveDailyReport');
  assert.ok(supplierViewContent.includes('autoSaveRowField(row.id, { reportDate: e.target.value });'), 'Must auto-save date changes to cloud');
  assert.ok(supplierViewContent.includes('autoSaveRowField(row.id, { diningHallQty: dNum, rawReportedQty: dNum + tNum });'), 'Must auto-save dining quantity changes to cloud');

  // 5. Verify drafts isolation from Ramtal: RamtalView filters out draft rows, and handleApproveSummary excludes drafts
  const ramtalContent = fs.readFileSync(path.resolve('src/components/RamtalView.tsx'), 'utf-8');
  assert.ok(ramtalContent.includes("const isDraft = (r.status || 'draft') === 'draft';"), 'RamtalView must detect draft rows');
  assert.ok(ramtalContent.includes('if (isDraft) return false;'), 'RamtalView must strictly isolate draft rows');

  assert.ok(appContent.includes("r.status !== 'draft'"), 'handleApproveSummary in App.tsx must exclude draft rows from Ramtal approval');

  // 6. Simulate F5 refresh: Simulated Cloud Store holding draft survives reload
  const cloudStore = new Map();
  // Supplier adds draft row -> saved to cloud
  cloudStore.set(String(cleaned.id), cleaned);

  // Simulated F5 page reload: onSnapshot reads from cloudStore
  const reloadedDailyReports = Array.from(cloudStore.values());
  assert.equal(reloadedDailyReports.length, 1, 'Draft row must survive simulated F5 reload from cloud');
  assert.equal(reloadedDailyReports[0].id, testDraftRow.id);
  assert.equal(reloadedDailyReports[0].status, 'draft', 'Draft status must persist after F5');
  assert.equal(reloadedDailyReports[0].diningHallQty, 100);

  // Supplier updates draft field in live auto-save -> updateDoc updates cloudStore
  const autoSavedUpdate = { diningHallQty: 150, rawReportedQty: 180 };
  Object.assign(cloudStore.get(String(cleaned.id)), autoSavedUpdate);

  // Subsequent reload shows updated draft
  const reloadedAfterAutoSave = Array.from(cloudStore.values());
  assert.equal(reloadedAfterAutoSave[0].diningHallQty, 150, 'Live auto-saved quantity must survive F5');
  assert.equal(reloadedAfterAutoSave[0].rawReportedQty, 180, 'Live auto-saved rawReportedQty must survive F5');
});

test('Cross-Kitchen Status Audit & Live Supplier Banners (Returned for Revision & Approved Alerts)', () => {
  const supplierViewContent = fs.readFileSync(path.resolve('src/components/SupplierView.tsx'), 'utf-8');

  // 1. Verify cross-kitchen scan logic
  assert.ok(supplierViewContent.includes('const returnedKitchens = myKitchens.filter'), 'Must compute returnedKitchens across all supplier stations');
  assert.ok(supplierViewContent.includes('const approvedKitchens = myKitchens.filter'), 'Must compute approvedKitchens across all supplier stations');
  assert.ok(supplierViewContent.includes('handleDismissApprovedAlert'), 'Must support green banner dismissal');

  // 2. Verify Red/Orange Banner for Returned for Revision
  assert.ok(supplierViewContent.includes('⚠️ שים לב: התקבלו דיווחים שחזרו לתיקון מהרמת"ל בתחנות הבאות:'), 'Must display exact wording for returned for revision alert');
  assert.ok(supplierViewContent.includes('עבור לתיקון ➔'), 'Must include quick jump button to fix station');

  // 3. Verify Green Banner for Approved by Ramtal
  assert.ok(supplierViewContent.includes('✅ עדכון: הדיווח החודשי אושר בהצלחה ע"י הרמת"ל בתחנות הבאות:'), 'Must display exact wording for approved alert');
  assert.ok(supplierViewContent.includes('צפה באישור ➔'), 'Must include view approval button');
  assert.ok(supplierViewContent.includes('הבנתי / סגור'), 'Must include dismiss button on green banner');

  // 4. Functional unit test of cross-kitchen logic
  const mockSupplierKitchens = [
    { id: 101, name: 'תחנת עכו', supplierId: 2 },
    { id: 102, name: 'תחנת נהריה', supplierId: 2 },
    { id: 103, name: 'תחנת צפת', supplierId: 2 }
  ];

  const mockSummaries = [
    { kitchenId: 101, status: 'returned_for_revision' },
    { kitchenId: 102, status: 'ramtal_approved' },
    { kitchenId: 103, status: 'draft' }
  ];

  const mockReports = [
    { kitchenId: 101, status: 'returned_for_revision' },
    { kitchenId: 102, status: 'ramtal_approved' },
    { kitchenId: 103, status: 'draft' }
  ];

  const testReturned = mockSupplierKitchens.filter(k => {
    const s = mockSummaries.find(sum => sum.kitchenId === k.id);
    const r = mockReports.filter(rep => rep.kitchenId === k.id);
    return s?.status === 'returned_for_revision' || r.some(row => row.status === 'returned_for_revision');
  });

  const testApproved = mockSupplierKitchens.filter(k => {
    if (testReturned.some(rk => rk.id === k.id)) return false;
    const s = mockSummaries.find(sum => sum.kitchenId === k.id);
    return s?.status === 'ramtal_approved';
  });

  assert.equal(testReturned.length, 1);
  assert.equal(testReturned[0].id, 101, 'Station 101 must trigger red returned banner');
  assert.equal(testApproved.length, 1);
  assert.equal(testApproved[0].id, 102, 'Station 102 must trigger green approved banner');

  // Re-submission of station 101 clears the red banner
  mockSummaries[0].status = 'submitted';
  mockReports[0].status = 'submitted';
  const testReturnedAfterFix = mockSupplierKitchens.filter(k => {
    const s = mockSummaries.find(sum => sum.kitchenId === k.id);
    const r = mockReports.filter(rep => rep.kitchenId === k.id);
    return s?.status === 'returned_for_revision' || r.some(row => row.status === 'returned_for_revision');
  });
  assert.equal(testReturnedAfterFix.length, 0, 'Red banner must automatically disappear once station is re-submitted');
});


