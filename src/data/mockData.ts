import { Kitchen, Supplier, User, MealType, KitchenTariff, MonthlyKitchenSummary, DailyReportRow } from '../types/index.js';

export const mockUsers: User[] = [
  {
    id: 1,
    username: 'supplier_shufersal',
    fullName: 'יוסי כהן (נציג שופרסל הסעדה)',
    role: 'supplier_reporter',
    supplierId: 1,
    email: 'yossi@shufersal-food.co.il',
    phone: '050-1234567',
    isActive: true
  },
  {
    id: 2,
    username: 'ramtal_jerusalem',
    fullName: 'רנ"ג אבי לוי (רמת"ל מרחב ציון / ירושלים)',
    role: 'police_ramtal',
    email: 'avi.levi@police.gov.il',
    phone: '052-9876543',
    isActive: true
  },
  {
    id: 3,
    username: 'food_dept_arik',
    fullName: 'רס"ב אריק כרמי (נציג מדור מזון)',
    role: 'food_dept_reviewer',
    email: 'arik.karmi@police.gov.il',
    phone: '050-5551234',
    isActive: true
  },
  {
    id: 4,
    username: 'admin_zeev',
    fullName: 'רפ"ק זאב נאורי (ר\' חוליית התייעלות - מנהל מערכת)',
    role: 'system_admin',
    email: 'zeev.neori@police.gov.il',
    phone: '050-8889999',
    isActive: true
  },
  {
    id: 5,
    username: 'finance_gizbarut',
    fullName: 'דנה שפירא (חשבות וגזברות את"ל)',
    role: 'viewer_finance',
    email: 'dana.finance@police.gov.il',
    isActive: true
  }
];

export const mockSuppliers: Supplier[] = [
  {
    id: 1,
    supplierCode: 'SUP-01',
    name: 'שופרסל הסעדה וקייטרינג',
    contactPerson: 'יוסי כהן',
    contactEmail: 'yossi@shufersal-food.co.il',
    contactPhone: '050-1234567',
    isActive: true
  },
  {
    id: 2,
    supplierCode: 'SUP-02',
    name: 'עידית לוגיסטיקה והסעדה (מלונות דן)',
    contactPerson: 'רונית ששון',
    contactEmail: 'ronit@idit-catering.co.il',
    contactPhone: '054-2223344',
    isActive: true
  },
  {
    id: 3,
    supplierCode: 'SUP-03',
    name: 'סודקסו ישראל (Sodexo)',
    contactPerson: 'אילן מזרחי',
    contactEmail: 'ilan@sodexo.co.il',
    contactPhone: '052-4445566',
    isActive: true
  }
];

export const mockKitchens: Kitchen[] = [
  {
    id: 1,
    kitchenCode: 'MCH-01',
    name: 'מטבח מכמש (מג"ב איו"ש)',
    supplierId: 1,
    defaultRamtalUserId: 2,
    region: 'מחוז ש"י',
    isActive: true,
    activeStartDate: '2025-01-01',
    hasQuarterlyMinimum: false,
    appliesR1Machmesh: true, // קיצוץ 10% חד"א פנימי
    appliesR2Tzohar: false
  },
  {
    id: 2,
    kitchenCode: 'TZH-02',
    name: 'מטבח צוחר / חולות',
    supplierId: 1,
    defaultRamtalUserId: 2,
    region: 'מחוז דרום',
    isActive: true,
    activeStartDate: '2025-01-01',
    hasQuarterlyMinimum: false,
    appliesR1Machmesh: false,
    appliesR2Tzohar: true // תוספת 30% כשרות מהודרת
  },
  {
    id: 3,
    kitchenCode: 'HQ-03',
    name: 'מטבח מטה ארצי (ירושלים)',
    supplierId: 2,
    defaultRamtalUserId: 2,
    region: 'מטא"ר',
    isActive: true,
    activeStartDate: '2025-01-01',
    hasQuarterlyMinimum: false,
    appliesR1Machmesh: false,
    appliesR2Tzohar: false
  },
  {
    id: 4,
    kitchenCode: 'BSH-04',
    name: 'מטבח מרחב בית שמש',
    supplierId: 3,
    defaultRamtalUserId: 2,
    region: 'מחוז ירושלים',
    isActive: true,
    activeStartDate: '2025-01-01',
    hasQuarterlyMinimum: true, // השלמה רבעונית R5
    quarterlyMinimumMeals: 3500,
    appliesR1Machmesh: false,
    appliesR2Tzohar: false
  }
];

export const mockMealTypes: MealType[] = [
  { id: 1, code: 'breakfast', nameHebrew: 'ארוחת בוקר', isHotMeal: false, sortOrder: 1 },
  { id: 2, code: 'lunch', nameHebrew: 'ארוחת צהריים (בשרי)', isHotMeal: true, sortOrder: 2 },
  { id: 3, code: 'dinner', nameHebrew: 'ארוחת ערב רגילה', isHotMeal: false, sortOrder: 3 },
  { id: 4, code: 'hot_dinner', nameHebrew: 'ארוחת ערב חמה (R4)', isHotMeal: true, sortOrder: 4 },
  { id: 5, code: 'special_event', nameHebrew: 'אירועים וכיבודים (R3)', isHotMeal: true, sortOrder: 5 },
  { id: 6, code: 'takeaway', nameHebrew: 'משיכות מנות קו / שטח', isHotMeal: true, sortOrder: 6 },
];

export const mockTariffs: KitchenTariff[] = [
  { id: 1, kitchenId: 1, mealTypeId: 1, priceNis: 14.50, effectiveFrom: '2026-01-01', isActive: true },
  { id: 2, kitchenId: 1, mealTypeId: 2, priceNis: 26.00, effectiveFrom: '2026-01-01', isActive: true },
  { id: 3, kitchenId: 1, mealTypeId: 3, priceNis: 16.00, effectiveFrom: '2026-01-01', isActive: true },
  
  { id: 4, kitchenId: 2, mealTypeId: 2, priceNis: 28.50, effectiveFrom: '2026-01-01', isActive: true },
  { id: 5, kitchenId: 3, mealTypeId: 2, priceNis: 25.00, effectiveFrom: '2026-01-01', isActive: true },
  { id: 6, kitchenId: 4, mealTypeId: 2, priceNis: 24.50, effectiveFrom: '2026-01-01', isActive: true },
];

export const initialDailyReports: DailyReportRow[] = [
  // מכמש - כולל פיצול חד"א פנימי מול משיכות
  {
    id: 101,
    monthlySummaryId: 1,
    kitchenId: 1,
    reportDate: '2026-08-01',
    mealTypeId: 2,
    mealTypeName: 'ארוחת צהריים',
    diningHallQty: 120,
    takeawayQty: 45,
    rawReportedQty: 165,
    ramtalAdjustedQty: 165,
    isSpecialEvent: false
  },
  {
    id: 102,
    monthlySummaryId: 1,
    kitchenId: 1,
    reportDate: '2026-08-02',
    mealTypeId: 2,
    mealTypeName: 'ארוחת צהריים',
    diningHallQty: 130,
    takeawayQty: 40,
    rawReportedQty: 170,
    ramtalAdjustedQty: 170,
    isSpecialEvent: false
  },
  {
    id: 103,
    monthlySummaryId: 1,
    kitchenId: 1,
    reportDate: '2026-08-03',
    mealTypeId: 2,
    mealTypeName: 'ארוחת צהריים',
    diningHallQty: 140,
    takeawayQty: 50,
    rawReportedQty: 190,
    ramtalAdjustedQty: 180, // תוקן ע"י רמת"ל בגלל אי התאמה
    ramtalAdjustmentReason: 'קיזוז 10 מנות בגין אי-התייצבות של כוח תגבורת',
    isSpecialEvent: false
  },
  {
    id: 104,
    monthlySummaryId: 1,
    kitchenId: 1,
    reportDate: '2026-08-10',
    mealTypeId: 5,
    mealTypeName: 'כיבוד אירוע מיוחד - ביקור מפקד מחוז',
    diningHallQty: 0,
    takeawayQty: 0,
    rawReportedQty: 0,
    ramtalAdjustedQty: 0,
    isSpecialEvent: true,
    eventCostNis: 3900, // 3900 / 26 = 150 מנות
    notes: 'חשבונית מס מס\' 8847 מאושרת רמת"ל'
  }
];

export const initialMonthlySummaries: MonthlyKitchenSummary[] = [
  {
    id: 1,
    periodYear: 2026,
    periodMonth: 8,
    kitchenId: 1,
    kitchenName: 'מטבח מכמש (מג"ב איו"ש)',
    supplierId: 1,
    supplierName: 'שופרסל הסעדה וקייטרינג',
    ramtalUserId: 2,
    ramtalUserName: 'רנ"ג אבי לוי',
    status: 'submitted',
    totalReportedRaw: 525,
    totalRamtalApproved: 515,
    calculatedNetMeals: 476,
    calculatedTotalAmountNis: 12376,
    calculationAudit: [],
    submittedAt: '2026-08-05 10:30'
  },
  {
    id: 2,
    periodYear: 2026,
    periodMonth: 8,
    kitchenId: 2,
    kitchenName: 'מטבח צוחר / חולות',
    supplierId: 1,
    supplierName: 'שופרסל הסעדה וקייטרינג',
    ramtalUserId: 2,
    ramtalUserName: 'רנ"ג אבי לוי',
    status: 'ramtal_approved',
    totalReportedRaw: 1200,
    totalRamtalApproved: 1200,
    calculatedNetMeals: 1560,
    calculatedTotalAmountNis: 44460,
    calculationAudit: [],
    submittedAt: '2026-08-04 16:20',
    ramtalApprovedAt: '2026-08-06 09:15'
  },
  {
    id: 3,
    periodYear: 2026,
    periodMonth: 8,
    kitchenId: 3,
    kitchenName: 'מטבח מטה ארצי (ירושלים)',
    supplierId: 2,
    supplierName: 'עידית לוגיסטיקה והסעדה',
    ramtalUserId: 2,
    ramtalUserName: 'רנ"ג אבי לוי',
    status: 'food_dept_approved',
    totalReportedRaw: 2850,
    totalRamtalApproved: 2850,
    calculatedNetMeals: 2850,
    calculatedTotalAmountNis: 71250,
    calculationAudit: [],
    submittedAt: '2026-08-03 11:00',
    ramtalApprovedAt: '2026-08-05 14:00',
    foodDeptApprovedAt: '2026-08-08 12:30'
  }
];
