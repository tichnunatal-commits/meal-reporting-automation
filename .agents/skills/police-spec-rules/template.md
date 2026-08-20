# police-spec-rules — the full procedure

---

## §1 · Before anything — the source inventory, printed

**Print a table of every input this chapter needs and where it actually came from.**
**This table is presented first, every time, and it is what makes the chapter auditable.**

| The input | Value | Source | Tag |
|---|---|---|---|
| קיזוז מכמש בחד"א פנימי | 10% | ⚠️ מכתב האפיון בלבד — **לא נראה חוזה** | `דווח-לי` |
| תוספת צוחר/חולות | 30% | | |
| מחיר לארוחה, לפי סוג ומטבח | | | |
| המינימום החוזי הרבעוני | | | |
| … | | | |

🔴 **Any row whose Source column is not a contract, a price list, or a dated client answer is
a BLOCKER — not a footnote.** Count them and state the number out loud:
*"‏N מתוך M הקלטים חסרי מקור חוזי."*

---

## §2 · One card per rule

| # | The section | Notes |
|:-:|---|---|
| **1** | **What the rule does, in one plain-Hebrew sentence** | The product manager reads this line and must understand the rule |
| **2** | **When it applies** — the exact condition | *"כל מטבח שמסווג כ-X"* — and **what defines X**, in a named field |
| **3** | **The formula** — literally, with named inputs | Every input traces to §1's table |
| **4** | **The source** — contract, clause, date | 🔴 No source ⇒ the rule is 🔶 and blocked |
| **5** | **What it does NOT apply to** | The exclusion is as load-bearing as the rule *(R1 is 10% on internal and **0% on withdrawals** — one rule, two branches)* |
| **6** | **Where the result is stored** — frozen or recomputed | ⇒ goes to `data-requirements.md` |
| **7** | **What the user sees** — before and after the rule applies | A number that changes with no visible explanation is a support call |

---

## §3 · The three cross-rule decisions — none of them is derivable

🔴 **These three are not in any contract, and every one of them changes the final amount.
They are product rulings and they go to the product manager, batched, recommendation-first.**

**‏① Precedence — what applies to what.**
A kitchen that both is Tzohar (+30%) and has an internal split (−10%): is it
`(base × 1.30) × 0.90` or `(base × 0.90) × 1.30`? *(These differ in general; state the actual
difference on real numbers, do not assert it.)*
⇒ **Produce the ordered list, with the arithmetic shown on a real case.**

**‏② Rounding — where, and to what.**
Per meal · per meal-type · per kitchen · per month? Half-up or half-even?
🔴 **Rounding at a different level changes the total.** Show the delta on a real month —
**that number is what makes the decision real for him.** EC-28 is the anchor.

**‏③ The quarterly minimum (R5) — when it is computed, and against what.**
This is the only rule that spans months. Whether the completion is computed on approved
amounts or paid amounts, and what happens when a month reopens after the quarter closed
(EC-03 · EC-08), is a **process** ruling as much as a calculation one — verify it against
`processes-approved.md` and flag the conflict if there is one.

**🛑 STOP — batched, 3–4 items, recommendation first, one line of background each.**

---

## §4 · The worked example — the deliverable this skill exists for

**Structure, and all five parts are mandatory:**

1. **The case** — a real month, a real kitchen, real quantities. Take them from the supplier
   Excel if it arrived. **If they are invented, say so in the table itself.**
2. **The inputs table** — every number, with where it came from
3. **The computation** — **every intermediate step visible**, not just the result
4. **The final number**
5. 🔴 **"מה המקרה הזה אינו מכסה"** — which rules it does **not** exercise.
   **Without this section the case reads as full coverage and it is not.** Name each
   uncovered rule and say whether adding a case for it is cheap or structurally blocked.

⚠️ **Choose the case so it exercises at least two rules together** — a single-rule case does
not test precedence, which is where the arithmetic actually breaks.

🔒 **And write, in the file, next to the number:**
> **‏🔢 המספר בר-הבדיקה — חושב ביד. שלב הבנייה מעתיק אותו ספרה-בספרה ואינו מחשב אותו מחדש.**

---

## §5 · Edge-case sweep — group ד, all of it, printed

Walk `docs/03-edge-cases.md` **group ד (money and calculation rules) in full** — and produce
a verdict per case, exactly like the processes stage. **The full table, not a summary.**

**Give these four specific attention; each one changes an amount and none is derivable:**
EC-27 (a kitchen under two rules) · EC-28 (rounding) · EC-29 (a retroactive price change) ·
EC-30 (VAT — **and whether it is in scope at all**).

---

## §6 · The vocabulary lock

Every term this chapter uses goes into `docs/data-requirements.md` §vocabulary, **one locked
word each**: *מכמש · חד"א · משיכה החוצה · השלמה רבעונית · הכמות המאושרת* …

🔴 **Before locking a term, grep it across `docs/**`.**
**Internal consistency is not enough — it proves you agree with yourself, not with what
already exists.** A term already defined elsewhere is **adopted, or explicitly retired** —
never given a second name. *(Anchor from a comparable project: the same thing carried three
names in three files, and that was the file the builder read.)*

---

## §7 · Write, verify, close

**‏`docs/spec/rules-approved.md` — Hebrew**, with: the tracking table · the source inventory
(§1) · one card per rule · the three cross-rule rulings with their quoted decisions · the
worked example · the group-ד triage table · and **"נעצרנו ב-…"**.

Then, same session: `data-requirements.md` (grep and report) · `decisions.md` ·
`STATUS.md` · `harvest.md` · commit by explicit pathspec.

---

## §8 · 🛑 The final gate — fresh-context reviewer, two questions

**Only after the product manager approves the dispatch.** It receives `rules-approved.md`,
`processes-approved.md`, **and the contracts** — without this conversation.

> **‏① אילו מספרים כאן חסרי מקור חוזי — אמת כל אחד בעצמך מול החוזים.**
> **‏② מה החישוב הזה לא מכסה, ושתיווצר לו שורה בחשבון בסוף חודש אמיתי?**

➕ **And a third, unique to this skill, because it is the only one whose output is arithmetic:**
> **‏③ חשב את המקרה מ-§4 בעצמך, מהנוסחאות בלבד. האם קיבלת את אותו מספר?**

🔴 **A different result is the single most valuable finding this project can produce at this
stage** — it means the hand-computed anchor is wrong, and everything downstream would have
been tested against it.

---

## §9 · Stop-and-ask triggers

Stop if you are about to: write a coefficient with no contract behind it · rule precedence
or rounding yourself · compute the worked example with a tool instead of by hand · declare an
edge case "לא קורה בשטח" with no source · or list which tests to implement.

**Close every message with the open-items line. Nothing open ⇒ `אין פתוח`.**
