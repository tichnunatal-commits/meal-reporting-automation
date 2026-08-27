import { db } from './db.js';
import { runImport } from './importData.js';

export function seedDatabase() {
  // בדיקה אם קיימות 124 התחנות הסופיות
  const kitchenCount = db.prepare('SELECT count(*) as count FROM kitchens').get().count;
  if (kitchenCount !== 124) {
    console.log('מסד הנתונים מתעדכן ל-124 התחנות הסופיות מקובץ האקסל...');
    runImport();
  } else {
    console.log(`מסד הנתונים מכיל ${kitchenCount} תחנות מעודכנות בסדר מופתי.`);
  }

  // ווידוא משתמשים (RBAC)
  const userCount = db.prepare('SELECT count(*) as count FROM users').get().count;
  if (userCount === 0) {
    const stmtUser = db.prepare('INSERT INTO users (personal_number, full_name, role, kitchen_id, supplier_id) VALUES (?, ?, ?, ?, ?)');
    stmtUser.run('1111111', 'פקד ישראל ישראלי', 'food_dept', null, null);
    stmtUser.run('2222222', 'רס"ר דוד כהן', 'ramtal', 1, null);
    stmtUser.run('3333333', 'רס"מ משה לוי', 'ramtal', 2, null);
    stmtUser.run('4444444', 'דוד מלכה (נציג קייטרינג גורמה)', 'supplier', null, 1);
    stmtUser.run('5555555', 'רונית (נציגת מבושלת)', 'supplier', null, 2);
  }
}
