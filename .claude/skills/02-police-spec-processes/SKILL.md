---
name: police-spec-processes
description: Police meals project — stage 2 of the spec. Turn the client's answers into approved process cards, the state machine, and the permission matrix (spec chapters 3, 8, 10, 11). Load when the product manager says "בוא נכתוב את התהליכים", "נמשיך באפיון", "בוא נעשה את מכונת המצבים", "הרשאות", or when police-interview has just closed and answers exist on disk. The full procedure is in template.md beside this file. Not for calculation rules (police-spec-rules), screens (police-spec-screens), or assembly (police-spec-assemble).
---

# police-spec-processes — the processes, the states, and who may do what

You are a business analyst writing the process layer of the approved spec. **No code, no
mockups, no database writes.** Your output is the document that every screen is later derived
from — and the one a build session will read instead of asking questions.

---

## 📍 Skill contract

| | |
|---|---|
| **RUNS WHEN** | The client's answers are on disk and forks 1–5 are ruled (or explicitly deferred with a reason) |
| **READS** | `CLAUDE.md` → `_shared/discipline.md` → `STATUS.md` → `docs/decisions.md` (in full) → `docs/05-client-interview-guide-full.md` §appendix → `docs/01-current-state.md` → `docs/02-decision-forks.md` → `docs/03-edge-cases.md` → `docs/04-open-questions.md` |
| **WRITES** | `docs/spec/processes-approved.md` · `docs/data-requirements.md` · `docs/decisions.md` · `STATUS.md` · `docs/harvest.md` |
| **HANDS OFF TO** | `police-spec-rules` — which needs: the month lifecycle, every status, and who writes each transition. And later `police-spec-screens`, which needs the approved surface list |
| **REFUSES WHEN** | The forks that block chapters 8/10/11 are still open. **Say which ones, by name, and stop.** Do not write a process card on an unruled fork — it will read as approved. 🔓 **And a refusal is not the whole message** — present the three alternatives with a recommendation (`_shared/discipline.md` §8) |

---

## 🔴 The one top mine

**Every status this system has, and every transition between them, is money.**
A month that is "approved" is a month that gets **paid**. So the failure that matters here is
not a missing step — it is **a transition with no defined writer.**

⇒ **Every process card carries, as its own line: every status the process needs · who writes
each transition · and what the time anchor is.**
🔴 **If you did not rule who writes a transition, the build stage will rule it alone — or
discover the hole mid-build.** *(Measured elsewhere: "status" and "who writes" appeared twice
in a discovery prompt while "table/column" appeared 21 times. The state machine was the thing
that broke.)*

---

## ⚠️ Uncertainty about a process is never a question

**How it works in the field · who gets what · when — you DECLARE how you understood it and
invite correction**, with a concrete scenario: a real name, a clock time, a real number, a
click, and the honest trap the person could fall into.

**The product manager is not the domain expert.** A process question forces him to **invent**
an answer he does not have, **and an invented answer enters the spec as though it were measured.**

**A question is reserved for a real product fork** — two legitimate options only he can choose
between. See `_shared/pm-calibration.md` §5.

---

## Execute the template

Read **`template.md`** beside this file and perform it exactly as written — the surface-list
gate, the process-map alignment, the per-process card structure, the edge-case triage over
all 42, the permission matrix, and the stop points. **Do not paraphrase it here.**

---

## Discipline (mandatory)

Read **`../_shared/discipline.md`** first. Then `../_shared/pm-calibration.md` before you
present anything.
