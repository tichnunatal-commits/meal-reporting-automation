---
name: police-plan-milestone
description: Police meals project — turn the approved spec into the work plan, one milestone at a time. On its first run it also writes the whole-project roadmap. Load when the product manager says "בוא נתכנן", "תוכנית עבודה", "מה בונים עכשיו", "בוא נפתח אבן דרך", "סיימנו אבן דרך, מה הלאה", or when SPEC-B.md was just approved. The full procedure is in template.md beside this file. Not for building (police-build) or closing a milestone (police-close).
---

# police-plan-milestone — the roadmap once, the milestone plan five times

You are planning the build. **Everything lives in one file, `implementation_plan.md`, with
three zones of different depth.** You write the roadmap on the first run and one milestone
plan on every run after that.

---

## 📍 Skill contract

| | |
|---|---|
| **RUNS WHEN** | `SPEC-B.md` is approved (first run) · or a milestone just closed and the next opens |
| **READS** | `CLAUDE.md` → `_shared/discipline.md` → `STATUS.md` → `implementation_plan.md` → **`docs/spec/SPEC-B.md` and everything its pointer list names** → `docs/data-requirements.md` → **`docs/decisions.md`, and specifically `grep '⏭️ M<N>'` for this milestone** → `docs/stack.md` → **`docs/team-model.md`** |
| **WRITES** | `implementation_plan.md` · `docs/decisions.md` · `STATUS.md` · `docs/harvest.md` |
| **HANDS OFF TO** | `police-build` — which needs: the active milestone's steps, each with **"מה ייחשב עובד"** and an empty **`🛑 אושר —`** slot |
| **REFUSES WHEN** | `SPEC-B.md` does not exist · **or `docs/stack.md` is still empty and this milestone needs commands.** Say which fields are empty and stop. 🔓 **A refusal is not the whole message** — present the three alternatives with a recommendation (`_shared/discipline.md` §8) |

---

## 🔴 Why the whole project is NOT planned up front

A step-by-step plan for milestone 4, written today, would be written from what the spec
**intends** — but by the time it runs it depends on what milestones 0–3 **actually built**.
It gets rewritten either way; the only question is whether it was paid for twice.

**And it costs the product manager directly:** approval of 60 steps most of which happen in
two months is an approval he cannot meaningfully give. **Approving one milestone a week
before it is built is an approval that is real.**

---

## 📐 The one file, three zones

```
🗺️ מפת הדרכים        — all 5 milestones, 3 lines each. NO steps.
                        what it delivers · what it depends on · target date
                        vs the deadline. ➕ AND the security-approval track.
                        Written ONCE, updated when reality moves.

🔨 אבן הדרך הפעילה    — rewritten 5 times, once per milestone. Contains:
                        📦 context packet (incl. 🔑 test identities)
                        ⚙️ model & effort per phase
                        🏗️ the steps, in full
                        📊 QA matrix, with an empty "as-run" column
                        📝 deviations log — append-only

✅ מה שהסתיים         — a short summary table: what landed + the evidence.
                        The detailed steps are DELETED after approval.
```

🔴 **Why the third zone shrinks, and it is not cosmetic:** this file is read **in full on every
build turn** for three months. Five fully-expanded milestones tax every one of them.
🚫 **Never compact the active milestone or the deviations log.** Those are the memory.

📌 **And two of those sections exist because another skill reads them:**
`police-close` fills the QA matrix's as-run column, and both `police-build` and `police-close`
write to the deviations log. **A section with no reader is debt; these two have named readers.**

---

## 🔴 The mine: "מה ייחשב עובד" is harvested, never authored

**Every step carries 3–5 Hebrew acceptance sentences — quoted from `SPEC-B.md` chapter
"מה ייחשב עובד", each tagged with where it came from.**

**Why authoring them is dangerous and not merely wasteful:** the list is written into the test
**before** the code, so an invented expectation silently becomes the target the implementation
is tuned to pass. **The bug then survives with a green test on top of it**, and the one
independent check the project had is gone.

⚠️ **And any hand-computed number in the spec is copied digit-for-digit and never recomputed.**

**Two failure shapes, and the second is likelier:**
**‏(a) naming a control instead of an outcome** — *"יש כפתור שליחה"* passes while the feature
is broken.
**‏(b) vague sentences that satisfy the rule on paper** — *"המסך עובד"*, *"הסינון תקין"*.
**A list like that is worse than no list, because it looks done.**
**The real-values requirement is what prevents it: a sentence with no concrete number or
string is not finished.**

---

## Execute the template

Read **`template.md`** beside this file — the roadmap structure, the five milestones, the step
format, the debt sweep, and the approval gate.

---

## Discipline (mandatory)

Read **`../_shared/discipline.md`** first, then `../_shared/pm-calibration.md` before presenting.
