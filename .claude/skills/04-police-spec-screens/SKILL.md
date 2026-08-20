---
name: police-spec-screens
description: Police meals project — stage 4 of the spec. One approved HTML mockup plus one nine-section card per surface (spec chapters 14–15). Load when the product manager says "בוא נעשה מסכים", "מוקאפ", "תראה לי איך זה ייראה", "המסך של הספק", "מסך הרמת\"ל", or when processes and rules are approved. Draw first, describe second. The full procedure is in template.md beside this file. Not for processes (police-spec-processes), calculation rules (police-spec-rules), or assembly (police-spec-assemble).
---

# police-spec-screens — surface by surface, mockup first

You are designing the surfaces. **A screen is a mockup, not a paragraph.** Your output per
surface is an HTML mockup with real data at real scale, and beside it a card containing only
what a picture cannot show.

---

## 📍 Skill contract

| | |
|---|---|
| **RUNS WHEN** | The surface list is approved and the processes those surfaces serve are ✅ |
| **READS** | `CLAUDE.md` → `_shared/discipline.md` → `docs/decisions.md` → `docs/spec/processes-approved.md` (the surface list + the relevant process cards) → `docs/spec/rules-approved.md` (every displayed number) → `docs/03-edge-cases.md` |
| **WRITES** | `docs/spec/screens-approved.md` (one card per surface, **written the moment that surface is approved — not at the end**) · `docs/mockups/<topic>/` and `docs/mockups/<topic>/approved/` · `docs/data-requirements.md` · `docs/decisions.md` · `STATUS.md` · `docs/harvest.md` |
| **HANDS OFF TO** | `police-spec-assemble` — which audits coverage against the approved surface list |
| **REFUSES WHEN** | A surface's process is not ✅, or a number the screen displays has no rule behind it. **Name it and stop.** 🔓 **A refusal is not the whole message** — present the three alternatives with a recommendation (`_shared/discipline.md` §8). Here ① is the live one: **a surface that displays no money can usually be drawn while the rules are blocked** |

---

## 🔴 Two mines, and they pull in opposite directions

**‏① Draw first. There is no "verbal card and then a mockup".**
A verbal screen description is a format that does not land. **The mockup is your
understanding-declaration** — he corrects a picture in one line, and redrawing HTML is cheap.
🚫 **No separate stage that decides whether a mockup is needed.**

**‏② But a mockup alone hides the rules.** It shows *what it looks like*, never *how it was
counted*. **Beside it goes only what a picture cannot show** — the nine sections in the template.
🚫 **And what is deliberately NOT written: layout · order · density · colour · emphasis.**
The mockup is the source for those, and a card that describes them **bloats itself and may
contradict the picture beside it.**

---

## ⚠️ Mockup rules — each one was learned the expensive way

- **HTML, never PNG** — so a later session can **read** it back instead of guessing from it.
- **Real data at real scale.** Three rows where the real screen has forty teaches the wrong thing.
- 🏷️ **A source line on every card and every mockup:** 🌱 what came from a real source ·
  🎭 what is invented demo data · 📐 what is derived from a model.
  **The reason is structural, not ceremonial:** a mockup with invented data **looks identical**
  to one showing real behaviour, and a build session reads both with the same confidence.
  ⚠️ **Mark against the source, not from memory** *(measured elsewhere: on the first card that
  carried this line, **two of four** items marked "from the database" were not there)*.
  🚫 **And do not change the demo data — mark it.**
- **Any mockup showing times states its own "today"**, and every date on it must agree with that.
- 🚫 **Never published, never uploaded — local files only.** This project is classified.

---

## 🎨 Design language — ruled 09/08/2026, and it has a research step

**The product manager's ruling, in his words:**
> **"משהו בוגר, נקי, אך לא משעמם כמו אקסל. לא צריך להמציא את הגלגל — יש מערכות דומות
> בעולם, אפשר לקבל מהן השראה, רק להתאים את זה אלינו."** *(D-10)*

🔴 **So the FIRST surface is preceded by a reference round — and only the first.**
**Only with approval to dispatch research** *(iron rule: never dispatch unasked)*:

1. **Find 3–5 real comparable systems** — supplier/vendor monthly reporting portals, approval
   workflows with a review-and-return step, government or defence procurement reporting.
   **Cite each one by name and source.** 🚫 No source ⇒ write `מהידע שלי, לא אומת`.
2. **Bring what is worth stealing, item by item** — how the month is presented · how a
   "return for editing" is shown · how a locked state reads · how a quantity table stays
   scannable without looking like a spreadsheet. **A table with a verdict per item:**
   `מאמצים / לא מאמצים ולמה / כבר יש לנו`.
   🔴 **And one non-visual question rides along in this same round** *(merged here 09/08/2026
   by the product manager, so research runs once and not twice)*: **how comparable systems
   handle site/location master data — effective-from and effective-to dating versus a plain
   active flag.** It validates `data-requirements.md` DR-01..DR-04, which were decided on an
   internal anchor (Q-22) plus `הנחתי`. **Report it separately from the visual findings** —
   it feeds the data model, not the mockup.
3. 🔴 **And the fit check for every borrowed pattern** *(`_shared/discipline.md` §2)*:
   channel · data · role · **volume**. **~95 users and ~3 suppliers.** A pattern built for
   thousands of concurrent vendors solves a problem this project does not have — and
   **"this is the convention" is evidence, never a reason.**
4. **Present the references visually, then draw.** He absorbs a comparison, not a description.

⚠️ **"לא משעמם כמו אקסל" is a real constraint, and it is measurable in one way:**
**the current process IS Excel.** A screen that is a grid of numbers and nothing else has
delivered no visible improvement over what people do today — even if it is technically
correct. **What replaces it: state, progress, and what needs attention** — whose month is
open, what is waiting on whom, what looks wrong. 🚫 **But not decoration** — "בוגר ונקי"
rules out dashboards-as-ornament just as firmly as it rules out a bare grid.

⇒ **The first approved mockup then establishes the language, and every later one inherits it.**
🔴 **Read it from the first approved mockup, not from the most recent draft** — copying from
the last draft propagates drift. **And once real code exists, the language is read from the
code**, never from a mockup.

**Hebrew RTL throughout.** Raise the frontend design skill for the visual layer if it helps —
but **do not raise a style/palette library**: an impressive-looking new style is exactly what
must not happen here.

---

## Execute the template

Read **`template.md`** beside this file — the nine-section card, the session budget rule, the
four per-surface checks, and the DB question that closes every surface.

---

## Discipline (mandatory)

Read **`../_shared/discipline.md`** first, then `../_shared/pm-calibration.md` before presenting.
