import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const dbPath = path.resolve(process.cwd(), 'data', 'police_meals.sqlite');

// וודא שתיקיית data קיימת
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new DatabaseSync(dbPath);

/**
 * יצירת סכמת הטבלאות ואכיפת אילוצי DR-01..DR-05
 */
export function initDatabase() {
  db.exec(`
    PRAGMA foreign_keys = ON;

    -- טבלת ספקי הסעדה
    CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      supplier_code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      contact_person TEXT,
      contact_email TEXT,
      contact_phone TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- טבלת משתמשים והרשאות
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL, -- supplier_reporter, police_ramtal, food_dept_reviewer, system_admin, viewer_finance
      supplier_id INTEGER,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
    );

    -- טבלת מטבחים (אילוצי DR-01, DR-02, DR-03, DR-04, DR-05)
    CREATE TABLE IF NOT EXISTS kitchens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kitchen_code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      supplier_id INTEGER NOT NULL, -- DR-05: שייך לספק 1 בלבד
      default_ramtal_user_id INTEGER,
      region TEXT NOT NULL,
      is_active INTEGER DEFAULT 1, -- DR-02: אין מחיקה פיזית
      active_start_date DATE NOT NULL, -- DR-03
      effective_end_date DATE, -- DR-04 (סוף חודש פעיל)
      has_quarterly_minimum INTEGER DEFAULT 0,
      quarterly_minimum_meals INTEGER DEFAULT 0,
      applies_r1_machmesh INTEGER DEFAULT 0, -- קיצוץ 10% חד"א
      applies_r2_tzohar INTEGER DEFAULT 0, -- תוספת 30% כשרות מהודרת
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
      FOREIGN KEY (default_ramtal_user_id) REFERENCES users(id)
    );

    -- טבלת סוגי ארוחות
    CREATE TABLE IF NOT EXISTS meal_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name_hebrew TEXT NOT NULL,
      is_hot_meal INTEGER DEFAULT 1,
      sort_order INTEGER DEFAULT 1
    );

    -- טבלת מחירונים היסטוריים עם תוקף תאריכי
    CREATE TABLE IF NOT EXISTS kitchen_tariffs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kitchen_id INTEGER NOT NULL,
      meal_type_id INTEGER NOT NULL,
      price_nis REAL NOT NULL,
      effective_from DATE NOT NULL,
      effective_to DATE,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (kitchen_id) REFERENCES kitchens(id),
      FOREIGN KEY (meal_type_id) REFERENCES meal_types(id)
    );

    -- טבלת מחזורי דיווח חודשיים
    CREATE TABLE IF NOT EXISTS monthly_reporting_periods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      period_year INTEGER NOT NULL,
      period_month INTEGER NOT NULL,
      submission_deadline DATE NOT NULL,
      hard_lock_date DATE NOT NULL,
      status TEXT DEFAULT 'open',
      UNIQUE(period_year, period_month)
    );

    -- טבלת סיכום חודשי למטבח
    CREATE TABLE IF NOT EXISTS monthly_kitchen_summaries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      period_year INTEGER NOT NULL,
      period_month INTEGER NOT NULL,
      kitchen_id INTEGER NOT NULL,
      supplier_id INTEGER NOT NULL,
      ramtal_user_id INTEGER,
      status TEXT DEFAULT 'draft', -- draft, submitted, returned_for_revision, ramtal_approved, food_dept_approved, locked
      total_reported_raw INTEGER DEFAULT 0,
      total_ramtal_approved INTEGER DEFAULT 0,
      calculated_net_meals INTEGER DEFAULT 0,
      calculated_total_amount_nis REAL DEFAULT 0,
      ramtal_notes TEXT,
      revision_reason TEXT,
      submitted_at DATETIME,
      ramtal_approved_at DATETIME,
      food_dept_approved_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (kitchen_id) REFERENCES kitchens(id),
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
      FOREIGN KEY (ramtal_user_id) REFERENCES users(id),
      UNIQUE(period_year, period_month, kitchen_id)
    );

    -- טבלת שורות דיווח יומיות
    CREATE TABLE IF NOT EXISTS daily_meal_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      monthly_summary_id INTEGER NOT NULL,
      kitchen_id INTEGER NOT NULL,
      report_date DATE NOT NULL,
      meal_type_id INTEGER NOT NULL,
      meal_type_name TEXT NOT NULL,
      dining_hall_qty INTEGER DEFAULT 0, -- חד"א פנימי (מכמש)
      takeaway_qty INTEGER DEFAULT 0,    -- משיכות חוץ
      raw_reported_qty INTEGER DEFAULT 0,
      ramtal_adjusted_qty INTEGER,
      ramtal_adjustment_reason TEXT,
      is_special_event INTEGER DEFAULT 0,
      event_cost_nis REAL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (monthly_summary_id) REFERENCES monthly_kitchen_summaries(id),
      FOREIGN KEY (kitchen_id) REFERENCES kitchens(id),
      FOREIGN KEY (meal_type_id) REFERENCES meal_types(id)
    );

    -- טבלת אסמכתאות וקבצים מצורפים
    CREATE TABLE IF NOT EXISTS attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      monthly_summary_id INTEGER NOT NULL,
      daily_report_id INTEGER,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size_bytes INTEGER,
      mime_type TEXT,
      uploaded_by_user_id INTEGER,
      uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (monthly_summary_id) REFERENCES monthly_kitchen_summaries(id),
      FOREIGN KEY (daily_report_id) REFERENCES daily_meal_reports(id),
      FOREIGN KEY (uploaded_by_user_id) REFERENCES users(id)
    );

    -- טבלת הצלבות שעון נוכחות (Anti-Duplicate Records)
    CREATE TABLE IF NOT EXISTS clock_reconciliation_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      period_year INTEGER NOT NULL,
      period_month INTEGER NOT NULL,
      kitchen_id INTEGER NOT NULL,
      report_date DATE NOT NULL,
      meal_type_id INTEGER NOT NULL,
      clock_registered_count INTEGER DEFAULT 0,
      manual_off_clock_reported INTEGER DEFAULT 0,
      potential_overlap_count INTEGER DEFAULT 0,
      estimated_saving_nis REAL DEFAULT 0,
      status TEXT DEFAULT 'flagged',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (kitchen_id) REFERENCES kitchens(id)
    );
  `);

  console.log('Database initialized successfully with DR-01..DR-05 constraints.');
}
