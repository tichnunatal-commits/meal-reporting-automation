import path from 'node:path';
import fs from 'node:fs';
import * as XLSX from 'xlsx';
import { db } from './db.js';

const excelFilePath = path.resolve(process.cwd(), 'אשכולות ומטבחים סופי למערכת.xlsx');

const MEAL_TYPES_DEF = [
  [1, "breakfast", "ארוחת בוקר (א'-ו')", 0, 1],
  [2, "lunch", "ארוחת צהריים (א'-ו')", 1, 2],
  [3, "dinner", "ארוחת ערב (א'-ה')", 0, 3],
  [4, "friday_dinner", "ערב שישי בשרית", 1, 4],
  [5, "shabbat_lunch", "שבת צהריים (בשרית)", 1, 5],
  [6, "shabbat_breakfast", "ארוחת בוקר שבת", 0, 6],
  [7, "motzash_dinner", "ארוחת ערב מוצאי שבת", 1, 7],
  [8, "stamps", "בולים (בולי מזון)", 0, 8],
  [9, "hot_transport", "שינוע חם", 0, 9],
  [10, "cold_transport", "שינוע קר", 0, 10],
  [11, "protein_addon", "תוספת חלבון", 0, 11],
  [12, "meal_box_3", "חמגשית (3 תאים)", 1, 12],
  [13, "box_side", "נלווה לחמגשית", 0, 13],
  [14, "snack_night", "ארוחת ביניים ולילה", 0, 14],
  [15, "detainee_box", "חמגשית עצור", 1, 15],
  [16, "pack_breakfast", "מארז בוקר", 0, 16],
  [17, "pack_meat_parve", "מארז בשרי / פרווה", 1, 17],
  [18, "holiday_kit", "ערכות סימני חג", 0, 18]
];

const EXACT_CLUSTER_TARIFFS = {
  "אשכול א": { 1: 20.00, 2: 40.60, 3: 20.00, 4: 44.00, 5: 44.00, 6: 20.00, 7: 20.00 },
  "אשכול ב": { 1: 19.00, 2: 35.60, 3: 19.00, 4: 39.00, 5: 39.00, 6: 19.00, 7: 19.00 },
  "אשכול ג": { 1: 20.00, 2: 38.60, 3: 20.00, 4: 42.00, 5: 42.00, 6: 20.00, 7: 20.00 },
  "אשכול ד": { 1: 25.00, 2: 47.60, 3: 25.00, 4: 53.00, 5: 48.00, 6: 25.00, 7: 25.00 },
  "אשכול ה": { 1: 35.84, 2: 48.72, 3: 38.08, 4: 48.16, 5: 44.80, 6: 38.00, 7: 42.56 },
  "אשכול ו": { 1: 31.36, 2: 47.48, 3: 33.60, 4: 48.16, 5: 44.80, 6: 40.32, 7: 41.44 },
  "אשכול ז": { 1: 19.00, 2: 34.37, 3: 19.00, 4: 37.77, 5: 34.77, 6: 19.00, 7: 19.00 },
  "אשכול ח": { 1: 25.00, 2: 44.60, 3: 25.00, 4: 50.00, 5: 45.00, 6: 25.00, 7: 25.00 },
  "אשכול ט": { 1: 31.36, 2: 47.48, 3: 33.60, 4: 48.16, 5: 44.80, 6: 40.32, 7: 41.44 },
  "לכיש -אשכול א": { 1: 48.16, 2: 56.00, 3: 50.40, 4: 64.96, 5: 61.60, 6: 59.36, 7: 59.36 },
  "נגב -אשכול ב": { 1: 43.68, 2: 45.92, 3: 43.68, 4: 64.96, 5: 61.60, 6: 59.36, 7: 59.36 },
  "מכמש": { 1: 13.85, 2: 25.25, 3: 13.90, 4: 32.00, 5: 30.00, 6: 30.00, 7: 13.90 },
  "מרחב אילת": { 1: 22.00, 2: 42.00, 3: 22.00, 4: 46.00, 5: 42.00, 6: 22.00, 7: 22.00 }
};

const FIXED_PRICES = {
  8: 37.77, 9: 8.31, 10: 14.83, 11: 6.00, 12: 20.00, 13: 12.00, 14: 5.00,
  15: 25.00, 16: 17.00, 17: 25.00, 18: 80.00
};

export function runImport() {
  console.log('מתחיל בטעינת 124 התחנות ותעריפי המכרז המדויקים מ-Excel...');

  try {
    db.exec('PRAGMA foreign_keys = OFF;');

    const fileBuffer = fs.readFileSync(excelFilePath);
    const workbook = XLSX.read(fileBuffer);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

    db.exec(`
      DELETE FROM daily_meal_reports;
      DELETE FROM monthly_kitchen_summaries;
      DELETE FROM kitchen_tariffs;
      DELETE FROM kitchens;
      DELETE FROM meal_types;
    `);

    // Insert Meal Types
    const stmtMT = db.prepare('INSERT INTO meal_types (id, name, item_type, is_fixed_price, fixed_price_nis) VALUES (?, ?, ?, ?, ?)');
    for (const mt of MEAL_TYPES_DEF) {
      const fixedVal = mt[0] >= 8 ? FIXED_PRICES[mt[0]] : null;
      stmtMT.run(mt[0], mt[2], mt[0] >= 8 ? 'addon' : 'meal', mt[0] >= 8 ? 1 : 0, fixedVal);
    }

    const stmtInsertKitchen = db.prepare(`
      INSERT INTO kitchens (id, name, kitchen_code, supplier_id, region, cluster_name, is_active, applies_r1_machmesh, applies_r2_tzohar, has_quarterly_minimum, quarterly_minimum_meals)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const stmtTariff = db.prepare(`
      INSERT INTO kitchen_tariffs (kitchen_id, meal_type_id, price_nis)
      VALUES (?, ?, ?)
    `);

    let addedCount = 0;
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row || row.length < 2) continue;

      const clusterName = String(row[0]).trim();
      const stationName = String(row[1]).trim();
      if (!stationName || stationName === 'שם תחנה') continue;

      addedCount++;
      const kitchenId = addedCount;
      const kitchenCode = `KTC-${String(kitchenId).padStart(3, '0')}`;

      let supplierId = 2;
      if (clusterName === 'מכמש') supplierId = 1;
      else if (clusterName === 'מרחב אילת') supplierId = 4;
      else if (clusterName.includes('לכיש') || clusterName.includes('נגב')) supplierId = 3;

      const isMachmesh = stationName === 'מכמש' ? 1 : 0;
      const isTzohar = (stationName.includes('צוחר') || stationName.includes('קציעות')) ? 1 : 0;
      const hasQuarterlyMin = (stationName.includes('קציעות') || stationName.includes('חרדים עופר')) ? 1 : 0;
      const qMinMeals = hasQuarterlyMin ? 3500 : 0;

      stmtInsertKitchen.run(
        kitchenId,
        stationName,
        kitchenCode,
        supplierId,
        clusterName,
        clusterName,
        1,
        isMachmesh,
        isTzohar,
        hasQuarterlyMin,
        qMinMeals
      );

      const clusterRates = EXACT_CLUSTER_TARIFFS[clusterName] || EXACT_CLUSTER_TARIFFS["אשכול א"];

      for (const mt of MEAL_TYPES_DEF) {
        const mtId = mt[0];
        const price = mtId >= 8 ? FIXED_PRICES[mtId] : (clusterRates[mtId] || 20.00);
        stmtTariff.run(kitchenId, mtId, price);
      }
    }

    db.exec('PRAGMA foreign_keys = ON;');
    console.log('-----------------------------------');
    console.log(`סיום ייבוא! הוכנסו ${addedCount} תחנות סופיות ו-${addedCount * 18} תעריפי מכרז רשמיים מדויקים בהצלחה.`);
  } catch (error) {
    db.exec('PRAGMA foreign_keys = ON;');
    console.error('שגיאה בתהליך הייבוא:', error);
  }
}

if (process.argv[1] && process.argv[1].endsWith('importData.js')) {
  runImport();
}
