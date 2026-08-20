---
name: police-spec-assemble
description: Police meals project — stage 5, the last control before anything becomes code. Assemble SPEC-B.md, write the remaining chapters (9 NFR, 13 data model, 16 security), run the five cross-checks, and produce the contract items the build stage checks itself against. Load when the product manager says "בוא נרכיב את האפיון", "לסגור את שלב ב'", "האפיון המלא", "בוא נעבור על הכל", or when processes, rules and screens are all ✅. The full procedure is in template.md beside this file.
---

# police-spec-assemble — the last gate before code

You are assembling, not writing from scratch. Most of the content already exists in the three
approved files. **Here you verify that every chapter has a home, fill only what has none, and
run the checks that decide whether this spec can be built from without guessing.**

🔴 **What stays contradictory or missing here becomes code.**

---

## 📍 Skill contract

| | |
|---|---|
| **RUNS WHEN** | `processes-approved.md`, `rules-approved.md` and `screens-approved.md` are all ✅ complete |
| **READS** | `CLAUDE.md` → `_shared/discipline.md` → `_shared/failure-modes.md` → the three approved files **in full** → the approved mockups → `docs/data-requirements.md` → `docs/decisions.md` → `docs/00-index.md` (the 16-chapter table) → `docs/stack.md` |
| **WRITES** | `docs/spec/SPEC-B.md` · `docs/data-requirements.md` · `docs/decisions.md` · `docs/00-index.md` (chapter statuses) · `STATUS.md` · `docs/harvest.md` |
| **HANDS OFF TO** | 🔴 **`police-stack` (track B)** — the technology decision runs BETWEEN this stage and the plan, and `docs/stack.md` is the input `police-plan-milestone` refuses without. **Do not hand straight to the plan** |
| **REFUSES WHEN** | Any of the three files still carries 🔶 or ⬜ rows in its tracking table. **Name them and stop.** Assembling over a half-approved input produces a document that reads finished. 🔓 **A refusal is not the whole message** — present the three alternatives with a recommendation (`_shared/discipline.md` §8) |

---

## 🔴 SPEC-B.md is not a 16-chapter PRD — it is six things

**The three approved files are not copied into it. They are pointed at.**
Duplication drifts, and the copy is the one that gets read.

| # | What is in `SPEC-B.md` | Why it has no other home |
|:-:|---|---|
| **①** | **Pointers** to the three approved files, the mockups, and the registers — **without duplicating a line** | |
| **②** | **A three-line opening** — what the system is and for whom | |
| **③** | **The contract items** — locked vocabulary · decided order · the testable number · the cross-entity line | The build stage **checks itself against these**, rather than "understanding" the spec |
| **④** | **"מה ייחשב עובד"** and **"מה הוכרע מול מה נשאר פתוח בכוונה"** | 🔴 **These two have no other file, and they are what the product manager personally approves at the end of this stage** |
| **⑤** | 🔴 **"מה אסור לבלופרינט לנחש"** — in full | The single most valuable chapter for the reader that follows |
| **⑥** | **Chapters 9 (NFR), 13 (data model) and 16 (security)** — the only ones actually written here | They derive from all three earlier stages and could not be written before |

⚠️ **Chapter 9 (NFR) and much of 16 depend on `docs/stack.md`, which may still be empty.**
**Write what is decidable without a stack, mark the rest ⬜ with what it waits on, and say so.**
🚫 **Do not invent a hosting model, an authentication method, or a retention period.**

---

## ⚠️ No numeric success metrics

There are no real users. **An invented KPI is what someone will have to defend out loud.**
In its place: **"מה ייחשב עובד"**, in words, with real values.

---

## Execute the template

Read **`template.md`** beside this file — the chapter-home map, the five cross-checks (a
closed list, deliberately), the contract items, the two-turn submission, and the blind-spot block.

---

## Discipline (mandatory)

Read **`../_shared/discipline.md`** first, then `../_shared/failure-modes.md` (this skill is a
control stage — its six questions apply directly), then `../_shared/pm-calibration.md`.
