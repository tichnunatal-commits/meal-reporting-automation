---
name: police-build
description: Police meals project — build the active milestone from implementation_plan.md, unit by unit, with an experience brief before code and evidence after it. Load when the product manager says "תמשיך לבנות", "המשך בנייה", "בוא נבנה", "בוא נעשה את הצעד הבא", "ממשיכים". There is no template file — implementation_plan.md IS the plan. Not for planning (police-plan-milestone) or closing a milestone (police-close).
---

# police-build — build the active milestone

`implementation_plan.md` is the approved plan and your memory. **Continue from its active step.**
This is normal build flow — the plan already IS the approved plan, and its 🛑/🤖 gates are the
control.

---

## 📍 Skill contract

| | |
|---|---|
| **RUNS WHEN** | A milestone is planned and approved, and steps remain |
| **READS** | `CLAUDE.md` → `_shared/discipline.md` → `STATUS.md` → `implementation_plan.md` (the whole active zone) → **`docs/spec/SPEC-B.md` and what its pointers name** → `docs/stack.md` (the commands) |
| **WRITES** | Code · tests · `implementation_plan.md` (step status + `↳ as-built` notes) · `docs/decisions.md` (every `הנחתי`) · `STATUS.md` · `docs/harvest.md` |
| **HANDS OFF TO** | `police-close` — **in a fresh session**, when the last step of the milestone is done |
| **REFUSES WHEN** | The step's verification command is empty in `docs/stack.md` · or the step has no "מה ייחשב עובד" · or the unit in progress has no `🛑 אושר —` line **(see below)**. 🔓 **A refusal is not the whole message** — present the three alternatives with a recommendation (`_shared/discipline.md` §8) |

---

## 🔴 Mine #1 — resuming into a half-built unit: check the approval, do not inherit it

The 🛑 gate is enforced **within** a session, and a session boundary dissolves it: a fresh
session is simply not in a gate, and **nothing on disk says whether the unit in progress was
ever approved.**

⇒ **Before writing a line of code for a unit already underway, find its `🛑 אושר DD/MM HH:MM`
line in `implementation_plan.md`. No line ⇒ treat the unit as UNAPPROVED and put the brief
again.**
*(Yes, that may re-ask something already approved. That is the cheap error. The expensive one
is code he never saw, reported as gated.)*

🔑 **And the other half of the same fix: when he approves, write that line to disk before you
start coding.** An approval that lives only in chat is one the next session cannot find.

---

## 🗣️ The experience brief — before code, for every significant build unit

A unit is a screen, a table, a component, the calculation engine — **coarser than a single
step; per-step would be noise.**

**Post, in simple Hebrew, and WAIT for explicit approval:**

**‏(א) הצהרת-הבנה של הזרימה העסקית** — how you understood the flow, **explicitly invited for
correction**, with a concrete scenario: a real name, a clock time, a real number, and the
honest trap. *(Only he knows how it really works in the field.)*
**‏(ב) The validations planned for this unit.**
**‏(ג) The screen or mockup** — 🔴 **for anything visual, show a live HTML mockup with real
data, not a verbal description.** And **the mockup shows the STATES, not the state**: empty ·
error · unknown · long text · no permission.
**‏(ד) Every mockup-only or spec-silent detail**, flagged *"מהמוקאפ / אפיון-שותק — לאישורך"*.
⚠️ **This applies to an UNAPPROVED mockup only.** If `SPEC-B.md` names the mockup as approved,
**do not re-approve it** — appearance follows the drawing, behaviour and data follow the spec,
and anything in neither is 🛑 *(`CLAUDE.md`, the truth hierarchy)*.

🚫 **Never say "an agent checked it, looks fine."** That accelerates approval, which is the
exact opposite of the gate's purpose. **Say instead:** *"בדקתי כיווניות וצבעים; מה שלא נבדק
הוא אם זה המסך שאתה רוצה."*
**His approval is trust, not verification — it never closes your own verification duty.**

---

## 🔴 Mine #2 — the gap protocol: never silent-fill

The plan is not always detailed enough, and the failure mode is guessing quietly.

**Before you classify anything as a gap — look in `SPEC-B.md` and what its pointers name.**
It is tier 1 and routinely answers exactly what the plan left out. **It is a gap only after
you looked and the spec was silent** — and "the spec is silent" is a claim you earn by having
opened the files, **scoped to the kind of detail:**
a **screen** detail ⇒ the screen card + its mockup · a **process or timing** detail ⇒
`processes-approved.md` · a **number or formula** ⇒ `rules-approved.md`.
**Write which sources you actually checked, beside the flag.**

**Then, and only then:**
**A technical gap** ⇒ decide, mark `הכרעתי, הפיך`, report it.
**A gap with any product flavour** ⇒ a question, with a recommendation.
🚫 **Filling it silently is the one unacceptable option** — it turns a guess into an
unreviewable fact.

➕ **And a clearly-written instruction is not a confirmed one.** An instruction that encodes
process or product — timing · who is notified · what is permitted · what a status means —
**and traces only to `implementation_plan.md`, with no source in `SPEC-B.md` or the approved
files ⇒ nobody ruled it; it was written by Claude. Ask before building.**
**And the check leaves a line either way**, in the same brief:
*"הוראות שמקורן בתוכנית בלבד: … / אין"* — **without it, a session that ran the check and one
that skipped it produce identical output.**

---

## ⚙️ The build loop

1. **Read the active step.** Post the 🗣️ brief. **Wait.** Write the `🛑 אושר` line to disk.
2. **Build in order:** data structure → business logic + unit tests → screens.
   🔴 **For the calculation engine: the test is written FIRST**, its expected value copied
   digit-for-digit from `rules-approved.md`, and you watch it fail for the right reason.
3. **Verify with a concrete mechanism and show the evidence** — command output, a test count,
   a screenshot of the named screen state. **Never "it works".**
   🔴 **And for a UI unit the self-verification is functional AND visual** — drive the flow in
   the live preview, and **the screenshot is the evidence.** Do not send him to check manually.
4. **Verify against "מה ייחשב עובד"** — the list from the plan, **not against your memory of
   what you built.** A test written by the same mind that wrote the code inherits its blind spots.
5. **Update `implementation_plan.md` in the same session** — step status, and any deviation
   as a `↳ as-built` note plus a line in the deviations log.
6. **Tag every claim** `אומת` / `דווח-לי` / `הנחתי` — **and every `הנחתי` also gets a line in
   `docs/decisions.md` part C, same session.**

---

## 🛑 Three hard stops

- **‏3-attempt cap.** A verification fails ⇒ 3 fix attempts, then **STOP** and report: what
  fails · what you tried · your best hypothesis. **A fourth blind attempt has never been the
  one that worked.**
- **Any change to the database structure** — typed echo, and it is not pre-granted by an
  earlier approval.
- **A non-trivial change request arriving mid-build** — classify **out loud** before building:
  `בנה-עכשיו` / `דחה-ל-M<N>` / `לא-נדרש-כי-Y`, with a reasoned recommendation.
  **He should not have to estimate size himself.** Behind schedule ⇒ default is `דחה`.

---

## 🔚 End of session

`implementation_plan.md` → `docs/harvest.md` → `STATUS.md` → commit by explicit pathspec.
Then explain **in plain Hebrew** where you stopped and what is next.

**And two standing questions you owe him, aimed at the plan you were handed — not at your work:**
> **‏① אילו מוקשים התוכנית הזאת לא זיהתה?**
> **‏② מה לא נבדק לפני שהתוכנית הזאת נכתבה?**

These force you to investigate the plan instead of receiving it. **"הכל בסדר" without having
looked is the failure they exist to prevent** — the plan rests substantially on your own
earlier reports, so its blind spots are yours too.

---

## Discipline (mandatory)

Read **`../_shared/discipline.md`** first, then `../_shared/pm-calibration.md` before presenting.
