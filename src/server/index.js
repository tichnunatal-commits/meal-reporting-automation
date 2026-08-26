import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import * as XLSX from 'xlsx';

import { db, initDatabase } from './db.js';
import { seedDatabase } from './seed.js';
import { MealCalculationEngine } from '../engine/calculator.js';
import { ClockReconciler } from '../engine/clockReconciler.js';

const app = express();
const PORT = 3001;

// Setup uploads folder
const uploadDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage, limits: { fileSize: 15 * 1024 * 1024 } }); // 15MB limit

app.use(cors());
app.use(express.json());

// Initialize and Seed Database
seedDatabase();

// --- Health Check ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- Suppliers ---
app.get('/api/suppliers', (req, res) => {
  const suppliers = db.prepare('SELECT * FROM suppliers WHERE is_active = 1').all();
  res.json(suppliers);
});

// --- Kitchens ---
app.get('/api/kitchens', (req, res) => {
  const kitchens = db.prepare('SELECT * FROM kitchens ORDER BY cluster_name ASC, name ASC').all();
  res.json(kitchens);
});

app.post('/api/kitchens/:id/toggle-active', (req, res) => {
  const { id } = req.params;
  const current = db.prepare('SELECT is_active FROM kitchens WHERE id = ?').get(id);
  if (!current) return res.status(404).json({ error: 'Kitchen not found' });

  const newStatus = current.is_active === 1 ? 0 : 1;
  db.prepare('UPDATE kitchens SET is_active = ? WHERE id = ?').run(newStatus, id);
  res.json({ success: true, newStatus });
});

// --- Users ---
app.get('/api/users', (req, res) => {
  const users = db.prepare('SELECT * FROM users WHERE is_active = 1').all();
  res.json(users);
});

// --- Tariffs ---
app.get('/api/tariffs', (req, res) => {
  const tariffs = db.prepare('SELECT * FROM kitchen_tariffs WHERE is_active = 1').all();
  res.json(tariffs);
});

// --- Monthly Summaries ---
app.get('/api/reports/monthly', (req, res) => {
  const summaries = db.prepare(`
    SELECT s.*, k.name as kitchen_name, k.kitchen_code, k.applies_r1_machmesh, k.applies_r2_tzohar, k.has_quarterly_minimum, k.quarterly_minimum_meals,
           sup.name as supplier_name, u.full_name as ramtal_user_name
    FROM monthly_kitchen_summaries s
    JOIN kitchens k ON s.kitchen_id = k.id
    JOIN suppliers sup ON s.supplier_id = sup.id
    LEFT JOIN users u ON s.ramtal_user_id = u.id
    ORDER BY s.id ASC
  `).all();

  const enriched = summaries.map(s => {
    const k = {
      id: s.kitchen_id,
      kitchenCode: s.kitchen_code,
      name: s.kitchen_name,
      supplierId: s.supplier_id,
      defaultRamtalUserId: s.ramtal_user_id,
      region: s.region || '',
      isActive: s.is_active === 1,
      activeStartDate: '2025-01-01',
      hasQuarterlyMinimum: s.has_quarterly_minimum === 1,
      quarterlyMinimumMeals: s.quarterly_minimum_meals,
      appliesR1Machmesh: s.applies_r1_machmesh === 1,
      appliesR2Tzohar: s.applies_r2_tzohar === 1,
      initialTotalReported: s.total_reported_raw,
      initialTotalApproved: s.total_ramtal_approved
    };

    const rows = db.prepare('SELECT * FROM daily_meal_reports WHERE monthly_summary_id = ?').all(s.id);
    const tariffs = db.prepare('SELECT * FROM kitchen_tariffs WHERE kitchen_id = ?').all(s.kitchen_id);

    const calc = MealCalculationEngine.calculateMonthlySummary(k, rows, tariffs, {
      isQuarterClosingMonth: true,
      quarterNumber: 3,
      priorMonthsActualMeals: 1800
    });

    return {
      id: s.id,
      periodYear: s.period_year,
      periodMonth: s.period_month,
      kitchenId: s.kitchen_id,
      kitchenName: s.kitchen_name,
      supplierId: s.supplier_id,
      supplierName: s.supplier_name,
      ramtalUserId: s.ramtal_user_id,
      ramtalUserName: s.ramtal_user_name,
      status: s.status,
      totalReportedRaw: s.total_reported_raw,
      totalRamtalApproved: s.total_ramtal_approved,
      calculatedNetMeals: calc.finalCalculatedMeals,
      calculatedTotalAmountNis: calc.finalTotalAmountNis,
      calculationAudit: calc.auditTrail,
      submittedAt: s.submitted_at,
      ramtalApprovedAt: s.ramtal_approved_at,
      foodDeptApprovedAt: s.food_dept_approved_at,
      revisionReason: s.revision_reason
    };
  });

  res.json(enriched);
});

// --- Daily Reports ---
app.get('/api/reports/daily', (req, res) => {
  const rows = db.prepare('SELECT * FROM daily_meal_reports ORDER BY report_date DESC, id DESC').all();
  res.json(rows.map(r => ({
    id: r.id,
    monthlySummaryId: r.monthly_summary_id,
    kitchenId: r.kitchen_id,
    reportDate: r.report_date,
    mealTypeId: r.meal_type_id,
    mealTypeName: r.meal_type_name,
    diningHallQty: r.dining_hall_qty,
    takeawayQty: r.takeaway_qty,
    rawReportedQty: r.raw_reported_qty,
    ramtalAdjustedQty: r.ramtal_adjusted_qty,
    ramtalAdjustmentReason: r.ramtal_adjustment_reason,
    isSpecialEvent: r.is_special_event === 1,
    eventCostNis: r.event_cost_nis,
    notes: r.notes
  })));
});

app.post('/api/reports/daily', (req, res) => {
  const {
    monthlySummaryId,
    kitchenId,
    reportDate,
    mealTypeId,
    mealTypeName,
    diningHallQty,
    takeawayQty,
    rawReportedQty,
    isSpecialEvent,
    eventCostNis,
    notes
  } = req.body;

  const result = db.prepare(`
    INSERT INTO daily_meal_reports 
      (monthly_summary_id, kitchen_id, report_date, meal_type_id, meal_type_name, dining_hall_qty, takeaway_qty, raw_reported_qty, ramtal_adjusted_qty, is_special_event, event_cost_nis, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    monthlySummaryId,
    kitchenId,
    reportDate,
    mealTypeId,
    mealTypeName,
    diningHallQty || 0,
    takeawayQty || 0,
    rawReportedQty || 0,
    rawReportedQty || 0,
    isSpecialEvent ? 1 : 0,
    eventCostNis || null,
    notes || null
  );

  // Update summary totals
  db.prepare(`
    UPDATE monthly_kitchen_summaries 
    SET total_reported_raw = total_reported_raw + ?,
        total_ramtal_approved = total_ramtal_approved + ?
    WHERE id = ?
  `).run(rawReportedQty || 0, rawReportedQty || 0, monthlySummaryId);

  res.json({ success: true, id: result.lastInsertRowid });
});

// --- Workflow Transitions ---
app.post('/api/reports/submit-month', (req, res) => {
  const { summaryId } = req.body;
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  db.prepare("UPDATE monthly_kitchen_summaries SET status = 'submitted', submitted_at = ? WHERE id = ?").run(now, summaryId);
  res.json({ success: true });
});

app.post('/api/reports/ramtal-approve', (req, res) => {
  const { summaryId } = req.body;
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  db.prepare("UPDATE monthly_kitchen_summaries SET status = 'ramtal_approved', ramtal_approved_at = ? WHERE id = ?").run(now, summaryId);
  res.json({ success: true });
});

app.post('/api/reports/ramtal-return', (req, res) => {
  const { summaryId, reason } = req.body;
  db.prepare("UPDATE monthly_kitchen_summaries SET status = 'returned_for_revision', revision_reason = ? WHERE id = ?").run(reason, summaryId);
  res.json({ success: true });
});

app.post('/api/reports/ramtal-adjust-row', (req, res) => {
  const { rowId, newQty, reason } = req.body;
  db.prepare("UPDATE daily_meal_reports SET ramtal_adjusted_qty = ?, ramtal_adjustment_reason = ? WHERE id = ?").run(newQty, reason, rowId);
  res.json({ success: true });
});

app.post('/api/reports/food-dept-approve', (req, res) => {
  const { summaryId } = req.body;
  const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
  db.prepare("UPDATE monthly_kitchen_summaries SET status = 'food_dept_approved', food_dept_approved_at = ? WHERE id = ?").run(now, summaryId);
  res.json({ success: true });
});

// --- Clock Sync Reconciliation ---
app.get('/api/clock/reconcile', (req, res) => {
  // Sample clock entries from badge reader
  const mockClockRegistrations = [
    { policeId: '8765432', badgeNumber: 'B-101', scanTimestamp: '2026-08-01 12:30:00', kitchenId: 1, mealTypeId: 2 },
    { policeId: '8765433', badgeNumber: 'B-102', scanTimestamp: '2026-08-01 12:35:00', kitchenId: 1, mealTypeId: 2 },
    { policeId: '8765434', badgeNumber: 'B-103', scanTimestamp: '2026-08-02 12:15:00', kitchenId: 1, mealTypeId: 2 },
    { policeId: '8765435', badgeNumber: 'B-104', scanTimestamp: '2026-08-03 13:00:00', kitchenId: 1, mealTypeId: 2 }
  ];

  const dailyReports = db.prepare(`
    SELECT d.*, k.name as kitchen_name
    FROM daily_meal_reports d
    JOIN kitchens k ON d.kitchen_id = k.id
  `).all();

  const results = ClockReconciler.reconcile(mockClockRegistrations, dailyReports);
  res.json(results);
});

// --- Excel Exporter ---
app.get('/api/export/excel', (req, res) => {
  const summaries = db.prepare(`
    SELECT s.id, k.name as kitchen_name, sup.name as supplier_name, s.status,
           s.total_reported_raw, s.total_ramtal_approved, s.calculated_net_meals, s.calculated_total_amount_nis
    FROM monthly_kitchen_summaries s
    JOIN kitchens k ON s.kitchen_id = k.id
    JOIN suppliers sup ON s.supplier_id = sup.id
  `).all();

  const wb = XLSX.utils.book_new();

  // Sheet 1: סיכום ארצי לתשלום
  const wsData = [
    ['משטרת ישראל - אגף התמיכה הלוגיסטית (את"ל) - מדור מזון'],
    ['דוח סיכום כמויות ארוחות וסכומים לתשלום לספקי הסעדה - חודש 08/2026'],
    [''],
    ['מזהה', 'שם המטבח', 'ספק מפעיל', 'סטטוס אישור', 'כמות גולמית ספק', 'כמות מאושרת רמת"ל', 'כמות סופית (R1-R5)', 'סה"כ לתשלום בש"ח'],
    ...summaries.map(s => [
      s.id,
      s.kitchen_name,
      s.supplier_name,
      s.status,
      s.total_reported_raw,
      s.total_ramtal_approved,
      s.calculated_net_meals,
      s.calculated_total_amount_nis
    ])
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);
// 1. הגדרת כיוון ימין-לשמאל (RTL) ברמת חוברת העבודה
  wb.Workbook = { Views: [{ RTL: true }] };

  // 2. יצירת "התאמה אוטומטית" (Auto-fit) לעמודות לפי התוכן בפועל
  // הקוד עובר על שורת הכותרות (שורה 3 במערך wsData) ומחשב את הרוחב המקסימלי הנדרש לכל עמודה
  const colWidths = wsData[3].map((col, index) => {
    const maxWidth = wsData.slice(3).reduce((max, row) => {
      const cellValue = row[index] ? row[index].toString() : "";
      return Math.max(max, cellValue.length);
    }, 10); // רוחב מינימלי של 10 תווים
    return { wch: maxWidth + 3 }; // תוספת של 3 תווים למרווח נשימה אסתטי
  });
  
  ws['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, 'סיכום לתשלום');

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  res.setHeader('Content-Disposition', 'attachment; filename="police_meals_summary_08_2026.xlsx"');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buffer);
});

// --- File Upload ---
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  res.json({
    success: true,
    fileName: req.file.originalname,
    filePath: req.file.path,
    fileSize: req.file.size
  });
});

app.listen(PORT, () => {
  console.log(`Meal Reporting API Server running on http://127.0.0.1:${PORT}`);
});
