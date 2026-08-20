# אפיון ארכיטקטורה ומודל נתונים (Data Model & System Architecture)
## פרויקט מיכון דיווח כמויות ארוחות מחוץ לשעון — מדור מזון

| | |
|---|---|
| **סטטוס** | מסמך תכנון וארכיטקטורה מלא (Draft v1.0) |
| **תאריך** | 17/08/2026 |
| **סיווג** | **בלמ"ס** |
| **מחברים** | ישי + אור (חוליית התייעלות כלכלית) בשיתוף אריק (מדור מזון) ורפ"ק זאב נאורי |

---

## 1. ארכיטקטורת המערכת (System Architecture)

### 1.1 עקרונות הארכיטקטורה
1. **הפרדת רשתות ואבטחה (בלמ"ס):** המערכת מתוכננת לארח ממשק Web מאובטח (HTTPS) המאפשר כניסת ספקים חיצוניים מהאינטרנט עם אימות מאובטח, לצד חיבור שוטרים (רמת"לים, מדור מזון, מנהלי מערכת).
2. **שלמות נתונים והיסטוריוגרפיה (Auditability):** 
   - **אין מחיקה פיזית (Hard Delete)** של מטבחים, ספקים, מחירים או דיווחים (DR-02).
   - כל תיקון כמות של רמת"ל או מדור מזון שומר את הנתון המקורי של הספק ודורש שדה נימוק חובה.
   - מחירים וכללי חישוב מנוהלים עם תוקף תאריכי (Effective Dates) כדי ששינויי חוזים עתידיים לא יעוותו חודשי עבר סגורים.
3. **צנרת חישוב שקופה (Calculation Pipeline R1–R5):** הרמת"ל מאשר כמויות פיזיות; כללי ההמרה, הקיזוזים וההשלמות הרבעוניות מחושבים אוטומטית בצורה שקופה ומתועדת.

### 1.2 תרשים ארכיטקטורה ורכיבים

```mermaid
graph TD
    subgraph "Clients (Frontend - RTL React / Tailwind)"
        A[נציג ספק הסעדה<br/>(מובייל / דסקטופ)]
        B[רמת''ל / מפקח הסעדה<br/>(משטרתי / נייד)]
        C[מדור מזון ומנהל מערכת<br/>(דשבורד בקרה ואישורים)]
        D[צופים: גזברות / את''ל<br/>(דוחות ופלט לתשלום)]
    end

    subgraph "Application Layer (Node.js / Express / TypeScript)"
        API[API Gateway & Auth Service<br/>RBAC + JWT / Sessions]
        WF[Workflow & Validation Engine<br/>מחזור חודשי, נעילות, תאריכי יעד]
        CalcEngine[R1-R5 Calculation Engine<br/>מכמש, צוחר, אירועים, ערב, מינימום]
        AuditSvc[Audit & History Tracker<br/>רישום כל שינוי ופעולה]
        ClockSync[Clock Reconciliation<br/>הצלבה מול שעון נוכחות]
        ExportSvc[Reporting & Export<br/>Excel / PDF חתום לתשלום]
    end

    subgraph "Data & Storage Layer"
        DB[(PostgreSQL / SQLite<br/>Relational Database)]
        Storage[(Secure File Storage<br/>אסמכתאות וקבלות PDF/JPG)]
    end

    A -->|HTTPS / הזנת כמויות ואסמכתאות| API
    B -->|אישור / תיקון מנומק / החזרה| API
    C -->|בקרת עלויות, הרשאות, מחירונים| API
    D -->|הפקת דוחות וייצוא כספי| API

    API --> WF
    API --> CalcEngine
    API --> AuditSvc
    API --> ClockSync
    API --> ExportSvc

    WF --> DB
    CalcEngine --> DB
    AuditSvc --> DB
    ClockSync --> DB
    ExportSvc --> Storage
```

---

## 2. תהליך העבודה ומכונת המצבים (Workflow & State Machine)

```mermaid
stateDiagram-v2
    [*] --> Draft : 1. הספק מזין כמויות יומיות/חודשיות
    Draft --> Submitted : 2. הספק מגיש לאישור (עד ה-5 בחודש)
    
    Submitted --> Ramtal_Approved : 3א. הרמת''ל בודק ומאשר
    Submitted --> Returned_For_Revision : 3ב. הרמת''ל מחזיר לעריכה (עם נימוק)
    Submitted --> Ramtal_Approved : 3ג. הרמת''ל מתקן כמות נקודתית (שומר מקור + נימוק)
    
    Returned_For_Revision --> Submitted : הספק מתקן ומגיש מחדש
    
    Ramtal_Approved --> FoodDept_Review : 4. מדור מזון מקבל לבקרה ולהפעלת R1-R5
    FoodDept_Review --> Final_Approved : 5. מדור מזון מאשר סופית לתשלום
    
    Final_Approved --> Locked : 6. נעילה קשיחה (10-15 בחודש) והפקת פלט לתשלום
    Locked --> [*]
```

---

## 3. מודל הנתונים המלא (Entity Relationship Diagram - ERD)

```mermaid
erDiagram
    SUPPLIERS ||--o{ KITCHENS : "מפעיל"
    USERS ||--o{ KITCHENS : "רמת''ל אחראי"
    USERS ||--o{ RAMTAL_DELEGATIONS : "ממלא מקום"
    KITCHENS ||--o{ KITCHEN_TARIFFS : "מחירונים היסטוריים"
    MEAL_TYPES ||--o{ KITCHEN_TARIFFS : "מוגדר ב"
    
    PERIODS ||--o{ MONTHLY_SUMMARIES : "כולל"
    KITCHENS ||--o{ MONTHLY_SUMMARIES : "מדווח עבור"
    SUPPLIERS ||--o{ MONTHLY_SUMMARIES : "מוגש ע''י"
    
    MONTHLY_SUMMARIES ||--o{ DAILY_REPORTS : "מכיל שורות פירוט"
    MEAL_TYPES ||--o{ DAILY_REPORTS : "סוג מנה"
    MONTHLY_SUMMARIES ||--o{ ATTACHMENTS : "אסמכתאות"
    MONTHLY_SUMMARIES ||--o{ CALCULATION_AUDIT : "פירוט חישובי R1-R5"
    KITCHENS ||--o{ QUARTERLY_RECONCILIATIONS : "השלמות מינימום R5"
    MONTHLY_SUMMARIES ||--o{ CLOCK_RECONCILIATION : "הצלבות שעון"

    SUPPLIERS {
        int id PK
        string supplier_code UK
        string name
        string contact_person
        string contact_email
        string contact_phone
        boolean is_active
    }

    USERS {
        int id PK
        string username UK
        string email UK
        string full_name
        string role "supplier | ramtal | food_dept | admin | viewer"
        int supplier_id FK "nullable"
        string phone
        boolean is_active
    }

    KITCHENS {
        int id PK
        string kitchen_code UK
        string name
        int supplier_id FK "1 ספק בלבד לכל מטבח (DR-05)"
        int default_ramtal_user_id FK
        string region "מחוז/מרחב"
        boolean is_active "DR-02"
        date active_start_date "DR-03"
        date effective_end_date "DR-04 (תחילת חודש הבא)"
        boolean has_quarterly_minimum
        int quarterly_minimum_meals
        boolean applies_r1_machmesh "קיצוץ 10% חד''א"
        boolean applies_r2_tzohar "תוספת 30% כשרות מהודרת"
    }

    KITCHEN_TARIFFS {
        int id PK
        int kitchen_id FK
        int meal_type_id FK
        decimal price_nis
        date effective_from
        date effective_to "nullable"
        boolean is_active
    }

    MEAL_TYPES {
        int id PK
        string code UK "breakfast | lunch | dinner | hot_dinner | event | takeaway"
        string name_hebrew
        boolean is_hot_meal
        int sort_order
    }

    PERIODS {
        int id PK
        int period_month "1-12"
        int period_year "2026"
        date submission_deadline "5 בחודש"
        date hard_lock_date "10/15 בחודש"
        string status "open | submitting | reviewing | locked"
    }

    MONTHLY_SUMMARIES {
        int id PK
        int period_id FK
        int kitchen_id FK
        int supplier_id FK
        int ramtal_user_id FK
        string status "draft | submitted | returned | ramtal_approved | final_approved | locked"
        int total_reported_meals_raw
        int total_approved_meals_ramtal
        decimal total_calculated_meals_final "לאחר R1-R5"
        decimal total_amount_nis "סה''כ לתשלום"
        text ramtal_review_notes
        text revision_reason
        datetime submitted_at
        datetime ramtal_approved_at
        datetime final_approved_at
    }

    DAILY_REPORTS {
        int id PK
        int monthly_summary_id FK
        date report_date
        int meal_type_id FK
        int dining_hall_qty "חד''א פנימי (עבור מכמש R1)"
        int takeaway_qty "משיכות החוצה (ללא קיצוץ)"
        int reported_qty "כמות מדווחת ספק"
        int ramtal_adjusted_qty "כמות מתוקנת רמת''ל"
        text ramtal_adjustment_reason "נימוק חובה לשינוי"
        boolean is_special_event "R3 אירוע/כיבוד"
        decimal event_cost_nis "סכום בש''ח להמרה"
        text notes
    }

    ATTACHMENTS {
        int id PK
        int monthly_summary_id FK
        int daily_report_id FK "nullable"
        string file_name
        string storage_path
        int file_size_bytes
        string mime_type
        int uploaded_by_user_id FK
        datetime uploaded_at
    }

    CALCULATION_AUDIT {
        int id PK
        int monthly_summary_id FK
        string rule_applied "R1_MACHMESH | R2_TZOHAR | R3_EVENT | R4_HOT_DINNER | R5_MINIMUM"
        decimal input_val
        string formula_applied
        decimal output_val
        datetime calculated_at
    }
```

---

## 4. פירוט מנוע חוקי החישוב (R1–R5 Calculation Engine)

| קוד חוק | שם הכלל | יישום במודל ובנוסחה | סדר ביצוע |
|---|---|---|:-:|
| **R1** | **קיצוץ מכמש (10%)** | מופעל אך ורק על `dining_hall_qty` (חד"א פנימי). `takeaway_qty` (משיכות) אינו מקוצץ. נוסחה: `Net = (dining_hall × 0.90) + takeaway`. | 1 |
| **R2** | **תוספת צוחר/חולות (30%)** | מופעל על כמויות מנות בכשרות מהודרת. נוסחה: `Net = Raw_Qty × 1.30`. | 2 |
| **R3** | **המרת אירועים וכיבודים** | המרת סכום חשבונית בש"ח לכמות מנות אקוויוולנטית: `Meals = event_cost_nis / base_lunch_price`. | 3 |
| **R4** | **ארוחת ערב חמה** | המרת פער המחיר בין ארוחת ערב לצהריים לכמות מנות נוספת. | 4 |
| **R5** | **השלמה למינימום רבעוני** | מחושב בסוף רבעון קלנדרי (חודשים 3, 6, 9, 12): אם סך הארוחות ברבעון < `quarterly_minimum_meals`, מתווסף פער ההשלמה. | 5 |
| **Rounding** | **עיגול מתמטי** | עיגול מתמטי תקני (`Half Up`) בסיום חישוב כל חוק לשלם הקרוב, עם פירוט שקוף ב-`CALCULATION_AUDIT`. | 6 |

---

## 5. טבלת תפקידים והרשאות (RBAC Matrix)

| פעולה במערכת | נציג ספק | רמת"ל / מפקח | מדור מזון | מנהל מערכת (אדמין) | צופה (גזברות/את"ל) |
|---|:---:|:---:|:---:|:---:|:---:|
| הזנת כמויות יומיות/חודשיות | ✅ (למטבחי הספק) | ❌ | ❌ | ❌ | ❌ |
| העלאת אסמכתאות (PDF/סריקה) | ✅ | ❌ | ❌ | ❌ | ❌ |
| הגשת דיווח חודשי לאישור | ✅ | ❌ | ❌ | ❌ | ❌ |
| אישור כמויות חודשיות | ❌ | ✅ (למטבחיו) | ❌ | ❌ | ❌ |
| תיקון כמות עם נימוק חובה | ❌ | ✅ | ✅ | ❌ | ❌ |
| החזרת חודש לעריכת הספק | ❌ | ✅ | ✅ | ❌ | ❌ |
| בקרת חוקי חישוב R1-R5 | ❌ | צפייה בלבד | ✅ | ✅ | צפייה בלבד |
| אישור סופי והפקת פלט לתשלום | ❌ | ❌ | ✅ | ✅ | ❌ |
| ניהול מטבחים, ספקים ומחירונים | ❌ | ❌ | ❌ | ✅ (זאב/ישי/אור) | ❌ |
| ניהול משתמשים והרשאות | ❌ | ❌ | ❌ | ✅ | ❌ |
| ייצוא דוחות ופלט גזברות (Excel/PDF) | דוח ספק בלבד | דוח מרחבי | ✅ כלל צה"ל/משטרה | ✅ | ✅ |

---

## 6. תוכנית יישום ובדיקות (Implementation & Verification)

1. **שכבת מסד נתונים (Database Migrations & Seeders):**
   - יצירת סכמת הטבלאות, מפתחות זרים, אינדקסים ואילוצי שלמות (כולל מניעת מחיקות והגבלת ספק יחיד למטבח).
   - טעינת נתוני בסיס: סוגי ארוחות, 3 ספקים, רשימת מטבחים ומחירונים ראשוניים.
2. **שכבת מנוע החישוב וה-Workflow:**
   - בדיקות יחידה (Unit Tests) למנוע החישוב R1–R5 עבור כל מקרי הקצה.
   - מימוש מנגנון המעברים בין הסטטוסים (Draft -> Submitted -> Ramtal -> FoodDept -> Locked).
3. **שכבת ממשק משתמש (Responsive UI/UX):**
   - מסך יומן הזנה לספק (תואם מחשב ונייד).
   - מסך אישור מהיר לרמת"ל (השוואה, תיקון מנומק, אישור בלחיצה).
   - מסך שליטה, ניתוח ובקרה למדור מזון והפקת דוח לתשלום.
