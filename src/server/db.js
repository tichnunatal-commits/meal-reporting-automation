import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

const dbPath = path.resolve(process.cwd(), 'meal_reporting.db');
const db = new DatabaseSync(dbPath);

export function initDatabase() {
  db.exec('PRAGMA foreign_keys = ON;');

  db.exec(`
    CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS kitchens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      kitchen_code TEXT,
      supplier_id INTEGER,
      region TEXT,
      cluster_name TEXT,
      is_active INTEGER DEFAULT 1,
      applies_r1_machmesh INTEGER DEFAULT 0,
      applies_r2_tzohar INTEGER DEFAULT 0,
      has_quarterly_minimum INTEGER DEFAULT 0,
      quarterly_minimum_meals INTEGER DEFAULT 0,
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
    );

    -- טבלת משתמשים מעודכנת עם הרשאות ושיוכים!
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      personal_number TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL, -- תפקידים: 'admin', 'food_dept', 'ramtal', 'supplier'
      kitchen_id INTEGER, -- רלוונטי רק לרמת"ל
      supplier_id INTEGER, -- רלוונטי רק לספק
      is_active INTEGER DEFAULT 1,
      FOREIGN KEY (kitchen_id) REFERENCES kitchens(id),
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
    );

    CREATE TABLE IF NOT EXISTS meal_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      item_type TEXT DEFAULT 'meal',
      is_fixed_price INTEGER DEFAULT 0,
      fixed_price_nis REAL DEFAULT NULL
    );

    CREATE TABLE IF NOT EXISTS kitchen_tariffs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kitchen_id INTEGER NOT NULL,
      meal_type_id INTEGER NOT NULL,
      price_nis REAL NOT NULL,
      is_active INTEGER DEFAULT 1,
      FOREIGN KEY (kitchen_id) REFERENCES kitchens(id),
      FOREIGN KEY (meal_type_id) REFERENCES meal_types(id)
    );

    CREATE TABLE IF NOT EXISTS monthly_kitchen_summaries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kitchen_id INTEGER NOT NULL,
      supplier_id INTEGER NOT NULL,
      ramtal_user_id INTEGER,
      period_year INTEGER NOT NULL,
      period_month INTEGER NOT NULL,
      status TEXT DEFAULT 'draft',
      total_reported_raw INTEGER DEFAULT 0,
      total_ramtal_approved INTEGER DEFAULT 0,
      calculated_net_meals INTEGER DEFAULT 0,
      calculated_total_amount_nis REAL DEFAULT 0,
      submitted_at TEXT,
      ramtal_approved_at TEXT,
      food_dept_approved_at TEXT,
      revision_reason TEXT,
      FOREIGN KEY (kitchen_id) REFERENCES kitchens(id),
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
    );

    CREATE TABLE IF NOT EXISTS daily_meal_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      monthly_summary_id INTEGER NOT NULL,
      kitchen_id INTEGER NOT NULL,
      report_date TEXT NOT NULL,
      meal_type_id INTEGER NOT NULL,
      meal_type_name TEXT NOT NULL,
      dining_hall_qty INTEGER DEFAULT 0,
      takeaway_qty INTEGER DEFAULT 0,
      raw_reported_qty INTEGER DEFAULT 0,
      ramtal_adjusted_qty INTEGER DEFAULT 0,
      ramtal_adjustment_reason TEXT,
      is_special_event INTEGER DEFAULT 0,
      event_cost_nis REAL,
      notes TEXT,
      FOREIGN KEY (monthly_summary_id) REFERENCES monthly_kitchen_summaries(id)
    );
  `);
}

initDatabase();
export { db };