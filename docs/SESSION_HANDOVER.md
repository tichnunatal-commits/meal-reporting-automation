# 📋 העברת מקל מקיפה (Session Handover & Context)
## פרויקט מיכון דיווח ארוחות מחוץ לשעון — מדור מזון / את"ל

| | |
|---|---|
| **שיחת מקור** | `34648636-a06c-44fe-9428-58f4d681fc15` ("פרויקט מיכון ארוחות") |
| **שיחת יעד** | `f8672228-3812-42c3-be09-d699af2f0f12` ("Moving Meal Automation Project") |
| **נתיב הפרויקט** | `c:\Users\Owner\.gemini\antigravity\scratch\meal-reporting-automation` |
| **אתר חי בענן** | [https://pol-meal-reporting.web.app](https://pol-meal-reporting.web.app) |
| **תאריך העברה** | 20/08/2026 |

---

## 1. מהות הפרויקט והרקע
מיכון תהליך איסוף, בקרה, חישוב ואישור כמויות ארוחות שנאכלו **מחוץ לשעון** במשטרת ישראל:
- **הספקים המדווחים (3 ספקים עיקריים):** שופרסל, עידית, סודקסו.
- **המאשרים בשטח (~30 רמת"לים ומפקחי הסעדה):** בדיקת שורות, תיקון כמות עם **נימוק חובה** ואישור/החזרה לספק.
- **הגורם הסוגר לתשלום (מדור מזון / את"ל):** הפעלת צנרת חוקי החישוב (R1–R5), אישור סופי והפקת קבצי תשלום לגזברות.
- **מדור התייעלות כלכלית (רפ"ק זאב נאורי, ישי ואור):** ניהול מערכת והצלבת שעון נוכחות למניעת כפילויות תשלום.

---

## 2. מה נבנה, נבדק ורץ עד כה

### א. מסמכי אפיון וארכיטקטורה
- 📄 [`docs/SPEC-B.md`](file:///c:/Users/Owner/.gemini/antigravity/scratch/meal-reporting-automation/docs/SPEC-B.md) – מסמך האפיון הסופי הרשמי (16 פרקים מלאים, מילון מונחים, מכונת מצבים, RBAC, חוקי R1-R5).
- 📄 [`docs/06-data-model-and-architecture.md`](file:///c:/Users/Owner/.gemini/antigravity/scratch/meal-reporting-automation/docs/06-data-model-and-architecture.md) – מודל נתונים מלא (ERD), טבלאות ואילוצי DR-01..DR-05 (מניעת מחיקות, שיוך ספק יחיד למטבח, תוקף תאריכי).
- 📄 [`STATUS.md`](file:///c:/Users/Owner/.gemini/antigravity/scratch/meal-reporting-automation/STATUS.md) – סטטוס פרויקט ויומן פעולות.

### ב. מנוע חישוב חוקי המרות ובקרה (R1–R5 Engine)
- 💻 [`src/engine/calculator.ts`](file:///c:/Users/Owner/.gemini/antigravity/scratch/meal-reporting-automation/src/engine/calculator.ts)
  - **R1 (מכמש):** קיצוץ 10% מחד"א פנימי בלבד (`dining_hall_qty`); משיכות חוץ ללא קיצוץ.
  - **R2 (צוחר / חולות):** תוספת 30% בגין המרה לכשרות מהודרת.
  - **R3 (אירועים וכיבודים):** המרת סכום חשבונית בש"ח למנות שוות-ערך לפי תעריף מנת ייחוס (צהריים).
  - **R4 (ערב חמה):** המרת פערי מחירים.
  - **R5 (השלמה למינימום רבעוני):** בדיקה רבעונית והשלמת פער מינימום חוזי.
  - **עיגול Half-Up:** עיגול מתמטי תקני ותיעוד שקוף ב-Audit Trail.
  - **בדיקות יחידה:** 100% מעבר ב-`npm test` (4/4 בדיקות עברו).

### ג. מסד נתונים ושרת Backend
- **Database:** SQLite מוטמע עם PRAGMA foreign_keys ([`src/server/db.js`](file:///c:/Users/Owner/.gemini/antigravity/scratch/meal-reporting-automation/src/server/db.js)).
- **Seed Data:** ספקים, מטבחים (מכמש, צוחר, מטא"ר, בית שמש), מחירונים, משתמשים ודיווחים ראשוניים ([`src/server/seed.js`](file:///c:/Users/Owner/.gemini/antigravity/scratch/meal-reporting-automation/src/server/seed.js)).
- **REST API:** שרת Express בפורט `3001` ([`src/server/index.js`](file:///c:/Users/Owner/.gemini/antigravity/scratch/meal-reporting-automation/src/server/index.js)) הכולל ניהול העלאות קבצי אסמכתאות (עד 15MB) וייצוא קבצי Excel.

### ד. מודול הצלבת שעון נוכחות (Anti-Duplicate Clock Sync)
- 💻 [`src/engine/clockReconciler.ts`](file:///c:/Users/Owner/.gemini/antigravity/scratch/meal-reporting-automation/src/engine/clockReconciler.ts)
  - איתור חפיפות בין רישומי כרטיס מגנטי בשעון לדיווחי ספק "מחוץ לשעון".
  - הערכת חיסכון כספי למניעת תשלום כפול.

### ה. ממשק משתמש Web (React + Tailwind + RTL)
- **כתובת חיה בענן:** **[https://pol-meal-reporting.web.app](https://pol-meal-reporting.web.app)**
- 5 מסכים מובנים:
  1. 📝 **דיווח ספק הסעדה:** הזנה יומית (חד"א/משיכות/אירועים), צירוף אסמכתאות והגשה לרמת"ל.
  2. 👮‍♂️ **אישור רמת"ל משטרתי:** בדיקת שורות, עריכת כמות עם **נימוק חובה** ואישור/החזרה.
  3. 📊 **בקרת מדור מזון (R1–R5):** צנרת חישוב שקופה (Pipeline Inspector) ואישור סופי לתשלום.
  4. ⏱️ **הצלבת שעון נוכחות:** דשבורד חפיפות וטעינת קבצי שעון.
  5. ⚙️ **הגדרות מערכת ואדמין:** ניהול מטבחים, ספקים, מחירונים והרשאות RBAC.

---

## 3. השלבים הבאים המומלצים לעבודה בשיחה החדשה
1. **תיקוף שאלות פתוחות:** עדכון מחירונים סופיים ושיוכי מטבחים במסד הנתונים.
2. **הפקת דוח PDF משטרתי רשמי לתשלום:** טופס מעוצב עם סמליל המשטרה ובלוק לחתימת מדור מזון.
3. **התאמות Mobile/UX ספציפיות:** ליטוש תצוגת המובייל למפקחי השטח.
4. **סקריפט ייבוא נתוני עבר:** טעינת קבצי אקסל היסטוריים מ-12 החודשים האחרונים.
