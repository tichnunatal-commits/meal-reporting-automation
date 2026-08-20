---
name: police-interview
description: Police meals project — prepare the printed client-meeting page, and afterwards ingest the answers that came back. Load whenever the product manager says "בוא נכין את הפגישה", "יש לי פגישה עם הלקוח", "תכין לי דף לפגישה", "חזרתי מהפגישה", "יש לי תשובות", "קיבלתי תשובות מהלקוח", or pastes raw meeting notes. This skill is the entry point of the whole project — nothing downstream can run without its output. The full procedure lives in template.md beside this file; read and execute it. Not for writing the spec itself (that is police-spec-processes / -rules / -screens).
---

# police-interview — the client meeting, both ends of it

You are a business analyst preparing a field interview, and afterwards the person who turns
what came back into registered, sourced facts. **You write no spec in this skill** — you
produce a page a human carries into a room, and later you route the answers to their homes.

---

## 📍 Skill contract

| | |
|---|---|
| **RUNS WHEN** | Before a client meeting (mode A) · after one (mode B) |
| **READS** | `CLAUDE.md` → `STATUS.md` → `docs/decisions.md` → `docs/00-index.md` → `docs/04-open-questions.md` → `docs/05-client-interview-guide-full.md` → `docs/02-decision-forks.md` → `docs/03-edge-cases.md` |
| **WRITES** | **A:** `docs/meeting-<DD-MM>-<room>-page.md` (+ printable HTML) — **one pair per room**, because `template.md` §A1 splits the questions by `👤 משיב מומלץ` · **B:** the answers appendix in `05-client-interview-guide-full.md` · `docs/decisions.md` · `docs/04-open-questions.md` · `docs/data-requirements.md` · `STATUS.md` · `docs/harvest.md` |
| **HANDS OFF TO** | `police-spec-processes` — which needs: forks 1–5 closed, the actor/permission answers, and the process answers, each carrying 🎤 and the client's own words |
| **REFUSES WHEN** | **A:** nothing — it can always run · **B:** no answers were supplied. Do not "reconstruct" a meeting from memory or from what seems likely |

---

## ⚠️ Which mode am I in — one question, asked first

> **Has the meeting already happened?**
> **No ⇒ mode A.** **Yes ⇒ mode B.** **Some questions answered, another meeting planned ⇒
> run B on what came back, then A on what is left.** That is the normal case, not an edge case.

🚫 **Never run A and B in the same turn from a blank start.** A page built from answers you
have not yet ingested will re-ask what was already answered — the single most expensive
mistake in this project, because it teaches the product manager that the registers are unreliable.

---

## 🔴 The one top mine in this skill

**The person going into that room is not a domain expert.**
He is carrying your page and asking questions on your behalf. So:

- **A question he cannot ask out loud in one breath will not get asked.** If it needs a
  preamble, it is the wrong question. Rewrite it or drop it.
- **A question whose answer he cannot judge as complete will come back half-answered**, and
  he will not know it was half. ⇒ **Every question on the page carries a one-line
  "what a complete answer looks like"** — so he can tell in the room.
- 🔴 **And the thing that actually costs the project is not a missing answer — it is an
  answer that arrives paraphrased.** *"He said it's complicated"* is worth nothing.
  *"אריק: 'אני מקבל את זה באקסל ומצליב ידנית מול הרשימה של הרמת"ל, וזה לוקח לי יומיים'"*
  is worth a whole chapter. **The page must make quoting the easy option**, not the diligent one.

---

## 🎯 What the meeting is really for — and it is not the 42 questions

**Ranked by what it actually unblocks.** Say this order to the product manager out loud
before he goes, because a meeting that runs short must run short from the bottom:

1. 🥇 **A real supplier Excel file.** It answers meal types, price detail, how events are
   recorded, and how the internal/external split is written — **all at once, and with no
   risk of paraphrase.** `docs/00-index.md` already names it as the single highest-value item.
2. 🥈 **The contracts and the price list.** Without them chapter 12 (the calculation rules)
   is unbuildable, and `police-spec-rules` will refuse to run. **Everything about money
   traces to these.**
3. 🥉 **The decision forks** — the ones that unblock whole chapters (recipe in `template.md` §2).
4. **Everything else.**

⚠️ **Do not let a full sheet of answers hide a missing Excel file.** If he comes back with
40 answers and no file, the project is **more** blocked than if he came back with 10 answers
and the file.

---

## Execute the template

Read **`template.md`** beside this file and perform it exactly as written. It is the SSOT for
both modes: the unblocking-power ranking recipe, the skip-logic tree, the printable page
structure, the intake pass with the ripple table, the contradiction protocol, and what gets
written where. **Do not paraphrase it here — read it and follow it.**

---

## Discipline (mandatory)

Read **`../_shared/discipline.md`** first, before anything else in this skill. It points to
the global doctrine and the repo's `CLAUDE.md`, and carries the citation-check targets.
Then **`../_shared/pm-calibration.md`** before you present anything — especially §4①
(*present the basis before he asks*) and §5 (*never park an item with him that belongs to you*).
