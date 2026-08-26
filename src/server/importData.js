import path from 'node:path';
import fs from 'node:fs';
import * as XLSX from 'xlsx';
import { db } from './db.js';

// נתיב לקובץ האקסל
const excelFilePath = path.resolve(process.cwd(), 'data', 'עותק של טבלת ניהול מחוץ לשעון- עותק.xlsx');

const CLUSTER_PRICES = {
  "אשכול א (צפון)": { boker: 20.00, tzoharayim: 40.60, erev: 20.00, shishi: 44.00, region: "צפון", supplier_id: 2 },
  "אשכול ב (חוף)": { boker: 19.00, tzoharayim: 35.60, erev: 19.00, shishi: 39.00, region: "חוף", supplier_id: 2 },
  "אשכול ג (מרכז)": { boker: 20.00, tzoharayim: 38.60, erev: 20.00, shishi: 42.00, region: "מרכז", supplier_id: 2 },
  "אשכול ד (תל אביב)": { boker: 25.00, tzoharayim: 47.60, erev: 25.00, shishi: 53.00, region: "תל אביב", supplier_id: 2 },
  "אשכול ה (מגב מרכז)": { boker: 35.84, tzoharayim: 48.72, erev: 38.08, shishi: 48.16, region: "מרכז", supplier_id: 3 },
  "אשכול ו (שומרון ויהודה)": { boker: 31.36, tzoharayim: 47.48, erev: 33.60, shishi: 48.16, region: 'איו"ש', supplier_id: 3 },
  "אשכול ז (ירושלים)": { boker: 19.00, tzoharayim: 34.37, erev: 19.00, shishi: 37.77, region: "ירושלים", supplier_id: 2 },
  "אשכול ח (עוטף ירושלים)": { boker: 25.00, tzoharayim: 44.60, erev: 25.00, shishi: 50.00, region: "ירושלים", supplier_id: 2 },
  "אשכול לכיש (דרום)": { boker: 48.16, tzoharayim: 56.00, erev: 50.40, shishi: 64.96, region: "דרום", supplier_id: 3 },
  "אשכול נגב (דרום)": { boker: 43.68, tzoharayim: 45.92, erev: 43.68, shishi: 64.96, region: "דרום", supplier_id: 3 },
  "אשכול מכמש (גורמה)": { boker: 13.85, tzoharayim: 25.25, erev: 13.90, shishi: 32.00, region: 'איו"ש', supplier_id: 1 },
  "אשכול אילת (סודקסו)": { boker: 22.00, tzoharayim: 42.00, erev: 22.00, shishi: 46.00, region: "דרום", supplier_id: 4 }
};

function determineCluster(name) {
  const n = name.trim();
  if (n.includes('מכמש')) return "אשכול מכמש (גורמה)";
  if (n.includes('אילת')) return "אשכול אילת (סודקסו)";
  if (['דימונה', 'ערוער', 'ימ"ר נגב', 'ערד', 'רהט', 'עיירות', 'באר שבע', 'חולות', 'צוחר', 'קציעות', 'נגב'].some(k => n.includes(k))) return "אשכול נגב (דרום)";
  if (['אשקלון', 'אשדוד', 'ק.גת', 'קרית גת', 'ק.מלאכי', 'קרית מלאכי', 'שדרות', 'נתיבות', 'אופקים', 'יד מרדכי', 'בית גוברין', 'יבנה', 'לכיש', 'יואב', 'בית נועם'].some(k => n.includes(k))) return "אשכול לכיש (דרום)";
  if (['אייל', 'בסכ"מ', 'בסכם', 'נעורים', 'מכבים', 'מג"ב מרכז', 'מג"ב שרון'].some(k => n.includes(k))) return "אשכול ה (מגב מרכז)";
  if (['בנימין', 'עציון', 'אריאל', 'שומרון', 'מחוז שי', 'אבודיס', 'אדומים', 'מעלה אדומים', 'חריש', 'קדום', 'מודיעין עילית'].some(k => n.includes(k))) return "אשכול ו (שומרון ויהודה)";
  if (['מחסום 300', 'מעבר רחל', 'מעבר זיתים', 'קלנדיה', 'מחסום עופר', 'מג"ב עטרות', 'הר גילה', 'מב"ט גילה', 'מג"ב עוז', 'עוטף'].some(k => n.includes(k))) return "אשכול ח (עוטף ירושלים)";
  if (['דוד', 'שלם', 'שפט', 'מחכמה', 'יהודאי', 'ימ"ס כנפש', 'בית השוטר ים', 'בית הטורקיז', 'מוריה', 'הראל', 'מגרש הרוסים', 'ירושלים', 'אטו"ב'].some(k => n.includes(k))) return "אשכול ז (ירושלים)";
  if (['ירקון', 'לב ת"א', 'ת"א', 'סלמה', 'בת ים', 'חולון', 'איילון', 'מסובים', 'גלילות', 'מוקד 110', 'שרת', 'בית השוטר ת"א'].some(k => n.includes(k))) return "אשכול ד (תל אביב)";
  if (['צפת', 'טבריה', 'עכו', 'נהריה', 'עפולה', 'נצרת', 'כרמיאל', 'שפרעם', 'מגדל העמק', 'בית שאן', 'כפר כנא', 'ראש פינה', 'קצרין', 'קרית שמונה', 'מצודת כוח', 'מלמ"ש', 'כפר מנדא', 'טמרה', 'משגב', 'מעלות', 'גליל', 'צפון'].some(k => n.includes(k))) return "אשכול א (צפון)";
  if (['חוף', 'חדרה', 'חיפה', 'זבולון', 'עירון', 'זיכרון', 'אום אל פאחם', 'אנדרטת מג"ב', 'גן נר', 'נטופה'].some(k => n.includes(k))) return "אשכול ב (חוף)";
  return "אשכול ג (מרכז)";
}

export function runImport() {
  console.log('מתחיל בטעינת 134 התחנות מקובץ האקסל ושיבוץ אשכולות ותעריפים...');

  try {
    db.exec('PRAGMA foreign_keys = OFF;');

    // 1. ווידוא קיום ספקים
    const existingSuppliers = db.prepare('SELECT count(*) as count FROM suppliers').get().count;
    if (existingSuppliers === 0) {
      const stmtSup = db.prepare('INSERT INTO suppliers (id, name, is_active) VALUES (?, ?, 1)');
      stmtSup.run(1, 'קייטרינג גורמה (מכמש וקציעות)');
      stmtSup.run(2, 'מבושלת בע"מ (צפון, חוף, מרכז, ת"א, י-ם, עוטף)');
      stmtSup.run(3, 'קייטרינג ליבר (מג"ב מרכז, ש"י, לכיש, נגב)');
      stmtSup.run(4, 'סודקסו ישראל (מרחב אילת)');
    }

    // 2. ווידוא קיום סוגי ארוחות
    const existingMealTypes = db.prepare('SELECT count(*) as count FROM meal_types').get().count;
    if (existingMealTypes === 0) {
      const stmtMT = db.prepare('INSERT INTO meal_types (id, name, item_type, is_fixed_price, fixed_price_nis) VALUES (?, ?, ?, ?, ?)');
      stmtMT.run(1, "ארוחת בוקר (בימים א' - ו')", 'meal', 0, null);
      stmtMT.run(2, "ארוחת צהריים (בימים א' - ו')", 'meal', 0, null);
      stmtMT.run(3, "ארוחת ערב (בימים א' - ה')", 'meal', 0, null);
      stmtMT.run(4, "ארוחת ערב שישי בשרית פיקס", 'meal', 0, null);
      stmtMT.run(5, "בולים", 'addon', 1, 37.77);
      stmtMT.run(6, "שינוע חם", 'service', 1, 8.31);
      stmtMT.run(7, "חלבון נוסף", 'addon', 1, 6.0);
      stmtMT.run(8, "חמגשית", 'addon', 1, 20.0);
    }

    // 3. קריאת הקובץ
    const fileBuffer = fs.readFileSync(excelFilePath);
    const workbook = XLSX.read(fileBuffer);
    
    const sheetName = 'פילוח לפי תחנות ונקודות'; 
    if (!workbook.SheetNames.includes(sheetName)) {
       console.error(`שגיאה: הגיליון '${sheetName}' לא נמצא בקובץ.`);
       return;
    }
    
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
    
    db.exec(`
      DELETE FROM daily_meal_reports;
      DELETE FROM monthly_kitchen_summaries;
      DELETE FROM kitchen_tariffs;
      DELETE FROM kitchens;
    `);

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
      if (!row || row.length === 0) continue;
      
      const rawStationName = row[0];
      if (!rawStationName || typeof rawStationName !== 'string') continue;
      
      const stationName = rawStationName.trim();
      if (!stationName || stationName.startsWith('סה"כ') || stationName === 'תחנה' || stationName === 'שם תחנה' || stationName === 'הערות') {
        continue;
      }

      addedCount++;
      const kitchenId = addedCount;
      const kitchenCode = `K-${String(kitchenId).padStart(3, '0')}`;
      
      const clusterName = determineCluster(stationName);
      const cInfo = CLUSTER_PRICES[clusterName];

      const isMachmesh = stationName.includes('מכמש') ? 1 : 0;
      const isTzohar = (stationName.includes('צוחר') || stationName.includes('חולות')) ? 1 : 0;
      const hasQuarterlyMin = isMachmesh;
      const qMinMeals = isMachmesh ? 12000 : 0;

      try {
        stmtInsertKitchen.run(
          kitchenId,
          stationName,
          kitchenCode,
          cInfo.supplier_id,
          cInfo.region,
          clusterName,
          1,
          isMachmesh,
          isTzohar,
          hasQuarterlyMin,
          qMinMeals
        );

        // תעריפי מכרז רשמיים לאשכול
        stmtTariff.run(kitchenId, 1, cInfo.boker);
        stmtTariff.run(kitchenId, 2, cInfo.tzoharayim);
        stmtTariff.run(kitchenId, 3, cInfo.erev);
        stmtTariff.run(kitchenId, 4, cInfo.shishi);
      } catch (err) {
        console.error(`שגיאה בהכנסת תחנה ${stationName}:`, err.message);
      }
    }

    db.exec('PRAGMA foreign_keys = ON;');

    console.log('-----------------------------------');
    console.log(`סיום ייבוא! הוכנסו ${addedCount} תחנות עם אשכולות ותעריפי מכרז רשמיים בהצלחה.`);
    
  } catch (error) {
    db.exec('PRAGMA foreign_keys = ON;');
    console.error('שגיאה בתהליך הייבוא:', error);
  }
}

if (process.argv[1] && process.argv[1].endsWith('importData.js')) {
  runImport();
}
