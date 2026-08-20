/**
 * מנוע חישוב חוקי המרות ובקרה R1-R5
 * משטרת ישראל - מדור מזון
 */
export class MealCalculationEngine {
    /**
     * הרצת צנרת החישוב המלאה על דיווחי חודש של מטבח
     */
    static calculateMonthlySummary(kitchen, rows, tariffs, quarterlyContext) {
        const auditTrail = [];
        // 1. חישוב סך כמויות גולמיות וכמויות מאושרות ע"י רמת"ל
        let rawReportedTotal = 0;
        let ramtalApprovedTotal = 0;
        let diningHallSum = 0;
        let takeawaySum = 0;
        if (rows && rows.length > 0) {
            for (const row of rows) {
                const reportedQty = row.rawReportedQty || (row.diningHallQty + row.takeawayQty);
                const effectiveApprovedQty = row.ramtalAdjustedQty !== undefined ? row.ramtalAdjustedQty : reportedQty;
                rawReportedTotal += reportedQty;
                ramtalApprovedTotal += effectiveApprovedQty;
                diningHallSum += row.diningHallQty || 0;
                takeawaySum += row.takeawayQty || 0;
            }
        }
        else if (kitchen.initialTotalApproved) {
            rawReportedTotal = kitchen.initialTotalReported || kitchen.initialTotalApproved;
            ramtalApprovedTotal = kitchen.initialTotalApproved;
            diningHallSum = ramtalApprovedTotal;
        }
        let currentMeals = ramtalApprovedTotal;
        // 2. כלל R1: קיצוץ מכמש (10% מחד"א פנימי בלבד)
        if (kitchen.appliesR1Machmesh) {
            // קיצוץ 10% מחד"א בלבד, משיכות החוצה ללא שינוי
            const diningHallDeduction = Math.round(diningHallSum * 0.10);
            const afterR1Meals = currentMeals - diningHallDeduction;
            auditTrail.push({
                ruleCode: 'R1_MACHMESH',
                ruleNameHebrew: 'קיצוץ מכמש (10% מחד"א פנימי)',
                inputQuantity: currentMeals,
                calculationDescription: `קיצוץ 10% מסך ${diningHallSum} מנות חד"א פנימי (-${diningHallDeduction} מנות). משיכות החוצה (${takeawaySum}) ללא שינוי.`,
                adjustmentMeals: -diningHallDeduction,
                outputQuantity: afterR1Meals
            });
            currentMeals = afterR1Meals;
        }
        // 3. כלל R2: תוספת צוחר / חולות (30% כשרות מהודרת)
        if (kitchen.appliesR2Tzohar) {
            const addition30 = Math.round(currentMeals * 0.30);
            const afterR2Meals = currentMeals + addition30;
            auditTrail.push({
                ruleCode: 'R2_TZOHAR',
                ruleNameHebrew: 'תוספת צוחר/חולות (30% כשרות מהודרת)',
                inputQuantity: currentMeals,
                calculationDescription: `תוספת 30% בגין המרה לכשרות מהודרת (+${addition30} מנות מתוך ${currentMeals}).`,
                adjustmentMeals: addition30,
                outputQuantity: afterR2Meals
            });
            currentMeals = afterR2Meals;
        }
        // 4. כלל R3: המרת אירועים וכיבודים (מש"ח לכמות מנות)
        const baseLunchTariff = tariffs.find(t => t.mealTypeId === 2)?.priceNis || 25.0; // ברירת מחדל ארוחת צהריים
        let totalEventCostNis = 0;
        for (const row of rows) {
            if (row.isSpecialEvent && row.eventCostNis && row.eventCostNis > 0) {
                totalEventCostNis += row.eventCostNis;
            }
        }
        if (totalEventCostNis > 0) {
            const eventConvertedMeals = Math.round(totalEventCostNis / baseLunchTariff);
            const afterR3Meals = currentMeals + eventConvertedMeals;
            auditTrail.push({
                ruleCode: 'R3_EVENT',
                ruleNameHebrew: 'המרת אירועים וכיבודים',
                inputQuantity: currentMeals,
                calculationDescription: `המרת סכום חשבוניות אירועים בסך ₪${totalEventCostNis.toLocaleString()} חלקי תעריף מנת ייחוס (₪${baseLunchTariff}) = +${eventConvertedMeals} מנות.`,
                adjustmentMeals: eventConvertedMeals,
                outputQuantity: afterR3Meals
            });
            currentMeals = afterR3Meals;
        }
        // 5. כלל R5: השלמה למינימום רבעוני (בסוף רבעון)
        if (kitchen.hasQuarterlyMinimum && kitchen.quarterlyMinimumMeals && quarterlyContext?.isQuarterClosingMonth) {
            const quarterTotalSoFar = (quarterlyContext.priorMonthsActualMeals || 0) + currentMeals;
            const deficit = kitchen.quarterlyMinimumMeals - quarterTotalSoFar;
            if (deficit > 0) {
                const afterR5Meals = currentMeals + deficit;
                auditTrail.push({
                    ruleCode: 'R5_MINIMUM',
                    ruleNameHebrew: 'השלמה למינימום חוזי רבעוני',
                    inputQuantity: currentMeals,
                    calculationDescription: `השלמת מינימום רבעון ${quarterlyContext.quarterNumber}: מינימום חוזי=${kitchen.quarterlyMinimumMeals}, בפועל ברבעון=${quarterTotalSoFar}. חסר=${deficit} מנות.`,
                    adjustmentMeals: deficit,
                    outputQuantity: afterR5Meals
                });
                currentMeals = afterR5Meals;
            }
        }
        // 6. חישוב עלות כספית סופית לפי מחירונים
        const defaultRate = tariffs[0]?.priceNis || 25.0;
        const finalTotalAmountNis = currentMeals * defaultRate;
        const breakdownByMealType = {
            total: {
                qty: currentMeals,
                rate: defaultRate,
                totalNis: finalTotalAmountNis
            }
        };
        return {
            rawReportedTotal,
            ramtalApprovedTotal,
            finalCalculatedMeals: currentMeals,
            finalTotalAmountNis,
            auditTrail,
            breakdownByMealType
        };
    }
}
