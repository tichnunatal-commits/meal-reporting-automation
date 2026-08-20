import test from 'node:test';
import assert from 'node:assert/strict';
import { MealCalculationEngine } from '../calculator.js';

test('R1: Machmesh 10% cut applies strictly to dining hall and leaves takeaway intact', () => {
  const kitchen = {
    id: 1,
    kitchenCode: 'MCH',
    name: 'מטבח מכמש',
    supplierId: 1,
    defaultRamtalUserId: 2,
    region: 'מחוז ש"י',
    isActive: true,
    activeStartDate: '2026-01-01',
    hasQuarterlyMinimum: false,
    appliesR1Machmesh: true,
    appliesR2Tzohar: false
  };

  const rows = [
    {
      id: 1,
      monthlySummaryId: 1,
      kitchenId: 1,
      reportDate: '2026-08-01',
      mealTypeId: 2,
      mealTypeName: 'צהריים',
      diningHallQty: 1000,
      takeawayQty: 500,
      rawReportedQty: 1500,
      ramtalAdjustedQty: 1500,
      isSpecialEvent: false
    }
  ];

  const tariffs = [{ id: 1, kitchenId: 1, mealTypeId: 2, priceNis: 25.0, effectiveFrom: '2026-01-01', isActive: true }];

  const result = MealCalculationEngine.calculateMonthlySummary(kitchen, rows, tariffs);

  // 1000 dining * 10% = 100 cut -> 900 + 500 = 1400 net meals
  assert.equal(result.rawReportedTotal, 1500);
  assert.equal(result.ramtalApprovedTotal, 1500);
  assert.equal(result.finalCalculatedMeals, 1400);
  assert.equal(result.auditTrail.length, 1);
  assert.equal(result.auditTrail[0].ruleCode, 'R1_MACHMESH');
  assert.equal(result.auditTrail[0].adjustmentMeals, -100);
});

test('R2: Tzohar / Cholot 30% addition converts meals to glatt kosher standard', () => {
  const kitchen = {
    id: 2,
    kitchenCode: 'TZH',
    name: 'מטבח צוחר',
    supplierId: 1,
    defaultRamtalUserId: 2,
    region: 'מחוז דרום',
    isActive: true,
    activeStartDate: '2026-01-01',
    hasQuarterlyMinimum: false,
    appliesR1Machmesh: false,
    appliesR2Tzohar: true
  };

  const rows = [
    {
      id: 2,
      monthlySummaryId: 2,
      kitchenId: 2,
      reportDate: '2026-08-01',
      mealTypeId: 2,
      mealTypeName: 'צהריים',
      diningHallQty: 1000,
      takeawayQty: 0,
      rawReportedQty: 1000,
      ramtalAdjustedQty: 1000,
      isSpecialEvent: false
    }
  ];

  const tariffs = [{ id: 2, kitchenId: 2, mealTypeId: 2, priceNis: 25.0, effectiveFrom: '2026-01-01', isActive: true }];

  const result = MealCalculationEngine.calculateMonthlySummary(kitchen, rows, tariffs);

  // 1000 * 1.30 = 1300 meals (+300)
  assert.equal(result.finalCalculatedMeals, 1300);
  assert.equal(result.auditTrail[0].ruleCode, 'R2_TZOHAR');
  assert.equal(result.auditTrail[0].adjustmentMeals, 300);
});

test('R3: Special events and hospitality invoices converted to equivalent meals', () => {
  const kitchen = {
    id: 3,
    kitchenCode: 'HQ',
    name: 'מטבח מטה ארצי',
    supplierId: 2,
    defaultRamtalUserId: 3,
    region: 'ירושלים',
    isActive: true,
    activeStartDate: '2026-01-01',
    hasQuarterlyMinimum: false,
    appliesR1Machmesh: false,
    appliesR2Tzohar: false
  };

  const rows = [
    {
      id: 3,
      monthlySummaryId: 3,
      kitchenId: 3,
      reportDate: '2026-08-01',
      mealTypeId: 2,
      mealTypeName: 'צהריים',
      diningHallQty: 200,
      takeawayQty: 0,
      rawReportedQty: 200,
      ramtalAdjustedQty: 200,
      isSpecialEvent: false
    },
    {
      id: 4,
      monthlySummaryId: 3,
      kitchenId: 3,
      reportDate: '2026-08-15',
      mealTypeId: 5,
      mealTypeName: 'כיבוד אירוע מיוחד',
      diningHallQty: 0,
      takeawayQty: 0,
      rawReportedQty: 0,
      ramtalAdjustedQty: 0,
      isSpecialEvent: true,
      eventCostNis: 5000 // ₪5000 / ₪25 = 200 meals
    }
  ];

  const tariffs = [{ id: 3, kitchenId: 3, mealTypeId: 2, priceNis: 25.0, effectiveFrom: '2026-01-01', isActive: true }];

  const result = MealCalculationEngine.calculateMonthlySummary(kitchen, rows, tariffs);

  // 200 regular + 200 converted = 400 meals
  assert.equal(result.finalCalculatedMeals, 400);
  assert.equal(result.auditTrail.some(a => a.ruleCode === 'R3_EVENT'), true);
});

test('R5: Quarterly minimum reconciliation adds deficit in closing month', () => {
  const kitchen = {
    id: 4,
    kitchenCode: 'BSH',
    name: 'מטבח בית שמש',
    supplierId: 3,
    defaultRamtalUserId: 4,
    region: 'מרכז',
    isActive: true,
    activeStartDate: '2026-01-01',
    hasQuarterlyMinimum: true,
    quarterlyMinimumMeals: 3000,
    appliesR1Machmesh: false,
    appliesR2Tzohar: false
  };

  const rows = [
    {
      id: 5,
      monthlySummaryId: 4,
      kitchenId: 4,
      reportDate: '2026-09-01',
      mealTypeId: 2,
      mealTypeName: 'צהריים',
      diningHallQty: 800,
      takeawayQty: 0,
      rawReportedQty: 800,
      ramtalAdjustedQty: 800,
      isSpecialEvent: false
    }
  ];

  const tariffs = [{ id: 4, kitchenId: 4, mealTypeId: 2, priceNis: 25.0, effectiveFrom: '2026-01-01', isActive: true }];

  // Prior months of Q3 had 800 + 800 = 1600. Current month has 800 -> total 2400. Deficit = 3000 - 2400 = 600
  const quarterlyContext = {
    isQuarterClosingMonth: true,
    quarterNumber: 3,
    priorMonthsActualMeals: 1600
  };

  const result = MealCalculationEngine.calculateMonthlySummary(kitchen, rows, tariffs, quarterlyContext);

  // 800 + 600 deficit = 1400 meals in September summary
  assert.equal(result.finalCalculatedMeals, 1400);
  assert.equal(result.auditTrail.some(a => a.ruleCode === 'R5_MINIMUM'), true);
});
