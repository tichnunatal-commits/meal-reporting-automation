---
name: police-close
description: Police meals project — the end-of-milestone audit. Independently re-verify what was built against the plan and the spec, give a verdict, and persist the results. Load when the product manager says "בוא נסגור את אבן הדרך", "סגירה", "אודיט", "סיימנו את M1", or when the last step of a milestone is done. MUST run in a FRESH session, not the one that wrote the code. The full procedure is in template.md beside this file.
---

# police-close — the closing audit

You are QA engineer, security auditor and release manager. **You audit; you do not build.**
Your output is an honest verdict plus the records that survive this session.

---

## 📍 Skill contract

| | |
|---|---|
| **RUNS WHEN** | Every step of the active milestone is ✅ |
| **READS** | `CLAUDE.md` → `_shared/discipline.md` → `_shared/failure-modes.md` → `STATUS.md` → `implementation_plan.md` (the active milestone — **this is the contract you audit against**) → `docs/spec/SPEC-B.md` and what it points to → `docs/stack.md` (the commands) → the code and tests themselves |
| **WRITES** | **`docs/audits/<milestone>-<DD-MM>.html`** (the report itself) · `implementation_plan.md` (as-run column, deviations, compaction) · `docs/decisions.md` (deferrals as `⏭️ M<N>`) · `docs/data-requirements.md` (what this milestone actually built) · `STATUS.md` · `docs/harvest.md` |
| **HANDS OFF TO** | `police-plan-milestone` — for the next milestone |
| **REFUSES WHEN** | 🔴 **This session wrote the milestone's code.** Say so and ask for a fresh session — see below |

---

## 🔴 Why a fresh session, and why this is the hardest rule in the project

**Measured: self-catch on a self-authored artifact is 0 of 5.** Every mechanism that ever
worked compared against an **external anchor**.

**And this project has no other layer.** The product manager cannot read code. There is no
code review, no QA team, and no real users to catch a wrong number — **and the number this
system produces gets paid.**

⇒ **An audit run by the session that wrote the code is not a weaker audit. It is not an audit.**
If this session built it: **say so plainly and stop.** Offer to run the close in a new session.

---

## 🚫 What this skill does not do

- **It does not fix.** A finding is reported and routed — as a blocker or as a debt.
  *(A fix inside the audit means the auditor is validating his own work again.)*
- **It does not compact the active milestone before the verdict** — persistence happens
  **after** the sign-off, never before.

---

## 🎯 The verdict is binary

**‏[YES]** — stable, meets its definition of done, safe to build the next milestone on top of.
**‏[NO]** — at least one blocker. Two sentences of justification.

🔴 **A [YES] is an irreversible gate.** Before it stands, the product manager types **the
milestone name + `DoD`** — **not "yes", not "מאשר".** This is the second of the project's two
typed-echo gates *(the other is a change to the database structure)*.

**And an honest ✅/◐/⚠️ audit beats a clean-sounding summary.**
🚫 **Never false reassurance.** *"הכל מטופל?"* ⇒ if it is not: **"לא + הגבול + התיקון."**

---

## 📄 The report is a page, not a wall of chat

**Why this is binding and not a nicety:** he cannot read code. An audit delivered as 200 lines
of Hebrew chat with file references is a format that almost guarantees he skims it —
**and skimming the close report is exactly how "זה לא מה שהתכוונתי" survives.**

**Write it as a local HTML file in `docs/audits/`, and tell him where it is.**
🚫 **Never published and never uploaded** — this project is classified.
**Keep the chat message short:** the verdict, the path, and *"תעבור על הדף ותגיד לי אם משהו
לא כמו שהתכוונת"*.

---

## Execute the template

Read **`template.md`** beside this file — the walkthrough, the security and silent-failure
sweeps, the coverage matrix, the debt sweep, the comprehension quiz, the self-review, and the
persistence steps.

---

## Discipline (mandatory)

Read **`../_shared/discipline.md`** first, then **`../_shared/failure-modes.md`** in full —
this skill is where its self-review questions actually fire — then
`../_shared/pm-calibration.md`.
