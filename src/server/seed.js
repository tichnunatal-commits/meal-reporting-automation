import { db, initDatabase } from './db.js';

export function seedDatabase() {
  initDatabase();

  // 1. ספקים
  const supplierCount = db.prepare('SELECT count(*) as count FROM suppliers').get();
  if (supplierCount.count === 0) {
    db.prepare(`
      INSERT INTO suppliers (id, supplier_code, name, contact_person, contact_email, contact_phone)
      VALUES 
        (1, 'SUP-01', 'שופרסל הסעדה וקייטרינג', 'יוסי כהן', 'yossi@shufersal-food.co.il', '050-1234567'),
        (2, 'SUP-02', 'עידית לוגיסטיקה והסעדה (מלונות דן)', 'רונית ששון', 'ronit@idit-catering.co.il', '054-2223344'),
        (3, 'SUP-03', 'סודקסו ישראל (Sodexo)', 'אילן מזרחי', 'ilan@sodexo.co.il', '052-4445566')
    `).run();
  }

  // 2. משתמשים
  const userCount = db.prepare('SELECT count(*) as count FROM users').get();
  if (userCount.count === 0) {
    db.prepare(`
      INSERT INTO users (id, username, full_name, role, supplier_id, email, phone)
      VALUES
        (1, 'supplier_shufersal', 'יוסי כהן (נציג שופרסל הסעדה)', 'supplier_reporter', 1, 'yossi@shufersal-food.co.il', '050-1234567'),
        (2, 'ramtal_jerusalem', 'רנ"ג אבי לוי (רמת"ל מרחב ציון / ירושלים)', 'police_ramtal', NULL, 'avi.levi@police.gov.il', '052-9876543'),
        (3, 'food_dept_arik', 'רס"ב אריק כרמי (נציג מדור מזון)', 'food_dept_reviewer', NULL, 'arik.karmi@police.gov.il', '050-5551234'),
        (4, 'admin_zeev', 'רפ"ק זאב נאורי (ר'' חוליית התייעלות - מנהל מערכת)', 'system_admin', NULL, 'zeev.neori@police.gov.il', '050-8889999'),
        (5, 'finance_gizbarut', 'דנה שפירא (חשבות וגזברות את"ל)', 'viewer_finance', NULL, 'dana.finance@police.gov.il', '050-7776655')
    `).run();
  }

  // 3. מטבחים
  const kitchenCount = db.prepare('SELECT count(*) as count FROM kitchens').get();
  if (kitchenCount.count === 0) {
    db.prepare(`
      INSERT INTO kitchens (id, kitchen_code, name, supplier_id, default_ramtal_user_id, region, is_active, active_start_date, has_quarterly_minimum, quarterly_minimum_meals, applies_r1_machmesh, applies_r2_tzohar)
      VALUES
        (1, 'MCH-01', 'מטבח מכמש (מג"ב איו"ש)', 1, 2, 'מחוז ש"י', 1, '2025-01-01', 0, 0, 1, 0),
        (2, 'TZH-02', 'מטבח צוחר / חולות', 1, 2, 'מחוז דרום', 1, '2025-01-01', 0, 0, 0, 1),
        (3, 'HQ-03', 'מטבח מטה ארצי (ירושלים)', 2, 2, 'מטא"ר', 1, '2025-01-01', 0, 0, 0, 0),
        (4, 'BSH-04', 'מטבח מרחב בית שמש', 3, 2, 'מחוז ירושלים', 1, '2025-01-01', 1, 3500, 0, 0)
    `).run();
  }

  // 4. סוגי ארוחות
  const mealTypeCount = db.prepare('SELECT count(*) as count FROM meal_types').get();
  if (mealTypeCount.count === 0) {
    db.prepare(`
      INSERT INTO meal_types (id, code, name_hebrew, is_hot_meal, sort_order)
      VALUES
        (1, 'breakfast', 'ארוחת בוקר', 0, 1),
        (2, 'lunch', 'ארוחת צהריים (בשרי)', 1, 2),
        (3, 'dinner', 'ארוחת ערב רגילה', 0, 3),
        (4, 'hot_dinner', 'ארוחת ערב חמה (R4)', 1, 4),
        (5, 'special_event', 'אירועים וכיבודים (R3)', 1, 5),
        (6, 'takeaway', 'משיכות מנות קו / שטח', 1, 6)
    `).run();
  }

  // 5. מחירונים
  const tariffCount = db.prepare('SELECT count(*) as count FROM kitchen_tariffs').get();
  if (tariffCount.count === 0) {
    db.prepare(`
      INSERT INTO kitchen_tariffs (id, kitchen_id, meal_type_id, price_nis, effective_from, is_active)
      VALUES
        (1, 1, 1, 14.50, '2026-01-01', 1),
        (2, 1, 2, 26.00, '2026-01-01', 1),
        (3, 1, 3, 16.00, '2026-01-01', 1),
        (4, 2, 2, 28.50, '2026-01-01', 1),
        (5, 3, 2, 25.00, '2026-01-01', 1),
        (6, 4, 2, 24.50, '2026-01-01', 1)
    `).run();
  }

  // 6. מחזור חודשי אוגוסט 2026
  const periodCount = db.prepare('SELECT count(*) as count FROM monthly_reporting_periods').get();
  if (periodCount.count === 0) {
    db.prepare(`
      INSERT INTO monthly_reporting_periods (period_year, period_month, submission_deadline, hard_lock_date, status)
      VALUES (2026, 8, '2026-09-05', '2026-09-10', 'open')
    `).run();
  }

  // 7. סיכומי חודש ושורות דיווח
  const summaryCount = db.prepare('SELECT count(*) as count FROM monthly_kitchen_summaries').get();
  if (summaryCount.count === 0) {
    db.prepare(`
      INSERT INTO monthly_kitchen_summaries (id, period_year, period_month, kitchen_id, supplier_id, ramtal_user_id, status, total_reported_raw, total_ramtal_approved, calculated_net_meals, calculated_total_amount_nis, submitted_at)
      VALUES
        (1, 2026, 8, 1, 1, 2, 'submitted', 525, 515, 476, 12376.0, '2026-08-05 10:30'),
        (2, 2026, 8, 2, 1, 2, 'ramtal_approved', 1200, 1200, 1560, 44460.0, '2026-08-04 16:20'),
        (3, 2026, 8, 3, 2, 2, 'food_dept_approved', 2850, 2850, 2850, 71250.0, '2026-08-03 11:00')
    `).run();

    db.prepare(`
      INSERT INTO daily_meal_reports (id, monthly_summary_id, kitchen_id, report_date, meal_type_id, meal_type_name, dining_hall_qty, takeaway_qty, raw_reported_qty, ramtal_adjusted_qty, ramtal_adjustment_reason, is_special_event, event_cost_nis, notes)
      VALUES
        (101, 1, 1, '2026-08-01', 2, 'ארוחת צהריים', 120, 45, 165, 165, NULL, 0, NULL, NULL),
        (102, 1, 1, '2026-08-02', 2, 'ארוחת צהריים', 130, 40, 170, 170, NULL, 0, NULL, NULL),
        (103, 1, 1, '2026-08-03', 2, 'ארוחת צהריים', 140, 50, 190, 180, 'קיזוז 10 מנות בגין אי-התייצבות של כוח תגבורת', 0, NULL, NULL),
        (104, 1, 1, '2026-08-10', 5, 'כיבוד אירוע מיוחד - ביקור מפקד מחוז', 0, 0, 0, 0, NULL, 1, 3900.0, 'חשבונית מס מס'' 8847')
    `).run();
  }

  console.log('Database seeded with police entities successfully.');
}
