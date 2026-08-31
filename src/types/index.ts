/**
 * Types and interfaces for the Meal Reporting Automation System
 * פרויקט מיכון דיווח ארוחות מחוץ לשעון - מדור מזון
 */

export type UserRole = 
  | 'supplier_reporter'     // נציג ספק הסעדה (מדווח)
  | 'police_ramtal'          // רמת"ל / מפקח הסעדה משטרתי (מאשר בשטח)
  | 'food_dept_reviewer'    // מדור מזון (בקרת R1-R5 ואישור סופי)
  | 'system_admin'          // מנהל מערכת (זאב/ישי/אור)
  | 'viewer_finance';       // צופה דוחות (גזברות / את"ל)

export interface User {
  id: number;
  username: string;
  fullName: string;
  role: UserRole;
  supplierId?: number;     // קיים רק עבור ספק
  email: string;
  phone?: string;
  isActive: boolean;
}

export interface Supplier {
  id: number;
  supplierCode: string;
  name: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  isActive: boolean;
}

export interface Kitchen {
  id: number;
  kitchenCode: string;
  name: string;
  supplierId: number;             // DR-05: שייך לספק יחיד
  defaultRamtalUserId: number;
  region: string;                 // מחוז / מרחב
  cluster?: string;               // אשכול מכרז (אשכול א-ח, לכיש, נגב, מכמש, אילת)
  isActive: boolean;              // DR-02: אין מחיקה
  activeStartDate: string;        // DR-03
  effectiveEndDate?: string;      // DR-04
  hasQuarterlyMinimum: boolean;
  quarterlyMinimumMeals?: number;
  appliesR1Machmesh: boolean;     // קיצוץ 10% חד"א פנימי
  appliesR2Tzohar: boolean;       // תוספת 30% כשרות מהודרת
}

export interface MealType {
  id: number;
  code: string;
  nameHebrew: string;
  isHotMeal: boolean;
  sortOrder: number;
}

export interface KitchenTariff {
  id: number;
  kitchenId: number;
  kitchenName?: string;
  kitchenCode?: string;
  clusterName?: string;
  region?: string;
  mealTypeId: number;
  mealTypeName?: string;
  priceNis: number;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
}

export type SummaryStatus = 
  | 'draft'                  // טיוטה בעריכת הספק
  | 'submitted'              // הוגש ע"י הספק, ממתין לרמת"ל
  | 'returned_for_revision'  // הוחזר ע"י הרמת"ל לתיקון
  | 'rejected'               // כינוי נרדף לנדרש תיקון
  | 'deleted_by_supplier'    // נמחק ע"י הספק לאחר דחיית רמת"ל (תיעוד Audit)
  | 'ramtal_approved'        // אושר ע"י הרמת"ל, עבר למדור מזון
  | 'approved'               // כינוי נרדף למאושר
  | 'food_dept_approved'     // אושר סופית ע"י מדור מזון
  | 'locked';                // נעול סופית לאחר מועד קשיח

export interface DailyReportRow {
  id: number;
  monthlySummaryId: number;
  kitchenId: number;
  reportDate: string;             // YYYY-MM-DD
  mealTypeId: number;
  mealTypeName: string;
  diningHallQty: number;          // כמות שנאכלה בחד"א פנימי (עבור מכמש)
  takeawayQty: number;            // כמות משיכות החוצה
  rawReportedQty: number;         // סה"כ כמות מדווחת
  ramtalAdjustedQty?: number;     // כמות מתוקנת ע"י רמת"ל
  ramtalAdjustmentReason?: string;// נימוק חובה אם תוקן
  isSpecialEvent: boolean;        // R3
  eventCostNis?: number;          // סכום בש"ח להמרה
  notes?: string;
  attachmentFileName?: string;    // שם קובץ אסמכתא שצורף
  status?: SummaryStatus;         // טיוטה / ממתין לאישור רמת"ל / מאושר
}

export interface CalculationAuditEntry {
  ruleCode: 'R1_MACHMESH' | 'R2_TZOHAR' | 'R3_EVENT' | 'R4_HOT_DINNER' | 'R5_MINIMUM';
  ruleNameHebrew: string;
  inputQuantity: number;
  calculationDescription: string;
  adjustmentMeals: number;        // כמות שהתווספה / קוצצה
  outputQuantity: number;
}

export interface MonthlyKitchenSummary {
  id: number;
  periodYear: number;
  periodMonth: number;
  kitchenId: number;
  kitchenName: string;
  supplierId: number;
  supplierName: string;
  ramtalUserId: number;
  ramtalUserName: string;
  status: SummaryStatus;
  
  totalReportedRaw: number;
  totalRamtalApproved: number;
  
  // תוצאות מנוע החישוב R1-R5
  calculatedNetMeals: number;
  calculatedTotalAmountNis: number;
  calculationAudit: CalculationAuditEntry[];
  
  ramtalNotes?: string;
  revisionReason?: string;
  submittedAt?: string;
  ramtalApprovedAt?: string;
  foodDeptApprovedAt?: string;
}
