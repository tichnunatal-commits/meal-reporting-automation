# police-spec-assemble — the full procedure

---

## §1 · Every chapter has a home — otherwise it is written, approved, and lost

**Verify each row against reality before writing anything.**

| The chapter | Its home | Written at |
|---|---|---|
| 1–4 background · glossary · actors · current state | `docs/01-current-state.md` *(stage A — still valid)* | before |
| **5** decision forks | `docs/02-decision-forks.md` + rulings in `docs/decisions.md` | throughout |
| **6** edge cases — **all 42, all six groups** | `docs/03-edge-cases.md` → triaged into the approved files | throughout |
| **7** open questions | `docs/04-open-questions.md` | throughout |
| **8 functional requirements · 10 processes and state machine · 11 permissions** | `docs/spec/processes-approved.md` | stage 2 |
| **12 calculation rules** | `docs/spec/rules-approved.md` | stage 3 |
| **14 screens · 15 design and accessibility** | `docs/spec/screens-approved.md` + the mockups | stage 4 |
| **13 data model** | `docs/data-requirements.md` → **assembled into a real model here** | **here** |
| **9 NFR · 16 security and audit** | **`SPEC-B.md`** | **here** |
| **The contract items · "מה ייחשב עובד" · "מה אסור לנחש"** | **`SPEC-B.md`** | **here** |

**Then update the status column of `docs/00-index.md`'s 16-chapter table** — it is the map
everyone reads, and a chapter still marked ⚠️ חסום after it was written is a lie in the most
visible place in the project.

---

## §2 · Chapter 13 — the data model, and the audit that produces it

**‏`data-requirements.md` is a list of requirements. Chapter 13 is a model.** Building one from
the other is this stage's real work.

**Run all seven checks and write one line for EACH — including the ones that found nothing:**

| The check | What to examine |
|---|---|
| **Keys and mutability** | What is the primary key of each entity? What happens if it changes? Is there identifying personal data inside a key? |
| **Relationships and lineage** | Can every derived row be traced back to its source row? A monthly amount — back to which entries? |
| **Lifecycle** | Does every status the processes need exist? **Does every transition have a defined writer and a time anchor?** Is a locked state actually enforced, or only hidden in the UI? |
| 🔴 **Screen-to-column audit** | **Walk EVERY surface in `screens-approved.md` and every approved mockup. A displayed figure with no data home is a blocking finding** |
| **Derived versus stored** | What freezes and when — the price at the moment of approval? the rule coefficients? — and what stays live. **A retroactive price change (EC-29) is decided here or discovered in production** |
| **Permissions ↔ enforcement** | Does the model let a supplier reach another supplier's rows? **EC-24 is the anchor, and this project's whole risk** |
| **History and audit** | Chapter 16 requires an audit log. **What is written, by whom, and can it be altered?** A month that was approved and then changed must be reconstructible |

🔴 **The one-line-per-check output is mandatory, including `אין ממצאים`.**
**Without it, a session that ran all seven and found nothing produces output identical to a
session that skipped every one** — and the product manager cannot read code to tell them apart.

---

## §3 · The contract items — what the spec must produce so the build stage does not guess

**The reasoning, and it is not stylistic:** the next stage should not need to *understand* the
spec — **it needs to check itself against it.** Prose can be read several ways; these either
match or they do not.

**‏1. 🔒 Locked vocabulary** — one table: every status · every entity · **every label on a
screen**, word for word.
🔴 **Before locking a term, grep it across `docs/**`.** Internal consistency only proves you
agree with yourself.

**‏2. ➡️ Decided order** — who starts · what gets saved · what happens before what.
*(This is what lets a screen be derived rather than invented.)*

**‏3. 🔢 At least one checkable number** — **the hand-computed case from `rules-approved.md`,
quoted, not recomputed.**
🔴 **The spec supplies one hand-computed expectation; the build stage builds the test from it.**
🚫 **Do not list which tests to implement** — the plan has its own field for that, and a list
here is both duplication and something that will rot.

**‏4. 🔗 The cross-entity line** — what each part reads and writes in the others' data,
**by exact field name**, verified against `data-requirements.md`.

---

## §4 · 🛡️ The five cross-checks — a closed list, on purpose

🔴 **Without a fixed list every session invents a different kind of review, and things fall
between the versions.** For each check, output **"נמצא / לא נמצא"** — not an impression.

| # | The check | Notes |
|:-:|---|---|
| **1** | **Label versus label** — a term appearing in two files with different wording *(processes vs screens vs mockups)* | Feeds contract item 1 |
| **2** | **Number versus number** — the same figure in two places with different values *(counts, thresholds, percentages, quotas)* | |
| **3** | 🔑 **A ruling with no expression** — a process decision with no trace in any screen card | *(In a comparable project this check alone returned **nine** findings, all of them "already decided elsewhere" — meaning **none was visible to ordinary reading**)* |
| **4** | **Field name versus `data-requirements.md`** — exists? spelled right? on the right entity? | Feeds contract item 4 |
| **5** | **A data requirement the spec assumes exists** — **verify by grep, not by declaration** | ⚠️ **A declaration lies:** in a comparable project a file stated it had registered two fields; **both were absent** |

🚫 **What you do with a finding: report it and fix it with approval. Never fix silently and
never rule alone.**
⚠️ **"Zero findings" is a legitimate output — but only after all five actually ran, and after
you say they ran.**

---

## §5 · 🛑 The fresh-context reviewer — before submission, mandatory

**Only with approval to dispatch.** It receives the three approved files, the mockups and the
draft `SPEC-B.md` — **without the conversation and without the reasoning that produced them.**

> **‏① אילו טענות כאן חסרות מקור — אמת כל אחת בעצמך מול הקבצים.**
> **‏② מה האפיון הזה לא מזכיר, ושהבנייה תצטרך?**

🔑 **‏② is the one that finds omissions, and only if it goes and searches.**
⚠️ **Do not substitute your own re-read.** Self-catch on a self-authored artifact: **0 of 5.**

**Fix its findings before submitting.**

---

## §6 · 🛑 Submission — two turns, and the split matters

**Turn one — the key list.** One line per chapter: *what is inside, and what differs from what
was approved.*

**Turn two — three separate rulings, and only these three:**
1. **Scope boundaries** — what is in, what is out, and every reasoned rejection
2. **"מה ייחשב עובד"** — in words, with real values from the real data
3. **"מה אסור לנחש"**

**Why exactly these three:** they are **born inside this document and were never approved**,
while everything else was approved item by item along the way.
🔴 **‏16 chapters submitted for one approval at the end of a long session turn "מאשר" into the
path of least resistance.**

**➕ And before all of it — a separate blind-spot block:**
> *"הנה מה שאני לא בטוח לגביו / מה שיכול להפתיע אותנו כאן"* — **what a senior engineer would
> think to check that nobody thought to ask.**
> Then: **"על מה לא שאלתי ושווה שתספר לי?"**
⚠️ **A separate block, not folded into the last question** — folded, it disappears.
**And it must name something checkable** — a file, a mechanism, a scenario. A generic hedge
that would fit any project is decoration, not a finding.

---

## §7 · Coverage — both directions, and both get printed

**‏① Forward:** print every surface and every process from the approved list with
`כוסה / לא כוסה / לא נדרש`.
**Without it a session that covered half looks exactly like one that covered everything.**

**‏② Reverse:** extract from `docs/01-current-state.md` and the client's answers the **required list** —
field · action · number · validation · process rule — and check that every item maps to
**a chapter or a registered deferral**. **An item with neither is a silent omission.**

---

## §8 · Close

`SPEC-B.md` written · `00-index.md` statuses updated · `decisions.md` (including every
`הנחתי`) · `data-requirements.md` · `STATUS.md` flipped to **stage 6 — `police-stack` track B,
NOT the plan** · `harvest.md` three lines · commit by explicit pathspec.

⚠️ **And say in the same line where track A (the security approval) stands.** If it has still
not started when the spec closes, **that — not the technology — is the project's critical path**
*(`CLAUDE.md` סיכון #1)*.

**Then state in one line what was saved and where — 🚫 without asking approval for the path.**
*(He has no way to prefer one folder over another, and he will approve blind — which teaches
him that his approval is not understanding.)*

**Close every message with the open-items line. Nothing open ⇒ `אין פתוח`.**
