# Shared discipline — read this FIRST, before anything else in any police-* skill

**Read order, and it is not negotiable:**
1. `~/.claude/CLAUDE.md` — the universal doctrine (loads every session, every project):
   plain-Hebrew communication · the product manager decides · no citation without a
   same-turn check · resume from disk, not from narration.
2. `CLAUDE.md` at the repo root — this project's iron rules, environment mines, and the
   marking tables. **Iron rule 1 (the anchor doctrine) is the one that governs the most.**
3. This file — how those rules become concrete *actions* in this project.
4. When they apply: `pm-calibration.md` (before presenting decisions) ·
   `failure-modes.md` (before a self-review, and at every close).

**Roles, not names.** *The product manager* = decides product, cannot read code.
*The developer* = whoever is in the session. **Three developers work on this repo.**

---

## 1 · Citation-check targets — what verifies which kind of claim, HERE

| The claim | Where to check it, in this repo |
|---|---|
| "it's written in X" / "chapter N says" | Open the file and read the section. **Grep anchor, never a line number** — line numbers rot between writing and executing |
| "already decided" / "still open" | `docs/decisions.md` **read in full**, then `docs/04-open-questions.md`. Not a tail, not a partial offset, not memory |
| "the client answered that" | `docs/05-client-interview-guide-full.md` §appendix — **and it must carry the client's own words.** A paraphrase is not an answer |
| "registered in the DB requirements" | `grep` it in `docs/data-requirements.md` **this turn.** A declaration that something was registered is the single most likely thing in this repo to be false |
| "the mockup shows" | Open the HTML. **It is readable — do not describe it from memory** |
| "the command is" / "the test passes" | `docs/stack.md`. **Empty field ⇒ STOP and say so. Never invent a command** |
| "deferred to milestone N" | `docs/decisions.md` part B, `grep '⏭️ M<N>'` |

🔴 **The highest-risk phrasing in this whole project is "done / registered / moved / covered."**
It reads as a completed action, and **nobody re-checks a completed action.**
⇒ **Grep it in the same turn, or write `טעון בדיקה`. There is no third option.**

⚠️ **An absence-claim is only as wide as the places actually searched — and it is verified
the way the SOURCE writes it, not the way you searched.** If you searched for a term you
learned in another file and got zero hits, **read the target file.** Its own vocabulary may
carry the same fact under a different word. *(Measured elsewhere: two borrowed terms returned
"not registered" for two items that were registered, three lines apart.)*

🔴 **And the source must answer DIRECTLY.** A derivation, a stretch, or "it probably implies"
is a guess wearing a citation. In doubt whether the source truly answers ⇒ **that IS "no
source"**, and it goes to the product manager as a story-question. *(The table above checks
whether a citation is ACCURATE; this checks whether it ANSWERS. A citation can be perfectly
accurate and still not support the claim resting on it.)*

---

## 2 · Adopting a world practice — the fit check and the price tag

Iron rule 1 says: no internal anchor ⇒ go fetch an external one. **This is what "fit"
concretely means here** — decomposed, because "make it fit our system" is a feeling.

| # | The question | Where to check it in THIS project |
|:-:|---|---|
| **① channel** | Does it assume a channel we do not have? | **Suppliers are outside the police network** and the security path is unresolved (`docs/stack.md`). Assume nothing about email, SMS, SSO, or push |
| **② data** | Does it assume data nobody collects? | `docs/data-requirements.md` + the answers file — **read, don't recall.** We do not yet have kitchens, prices, or contracts |
| **③ role** | Does it assume a person who is not in the actor table? | `docs/01-current-state.md §5` — **read the table, do not trust this count.** It lists **U1–U5**: supplier catering inspector · ramatal · food section · system admin · **and a view-only role (את"ל / כספים / הנהלה)** that is easy to drop. Fork 5 may split the admin in two ⇒ **5–6 roles, not 4**. **There is no ops team and no support desk** |
| **④ volume** | Does its rationale rest on a different order of magnitude? | **~95 users · ~3 suppliers · one monthly cycle.** A pattern built for thousands of concurrent writers is solving a problem that is not here |

**Then, and only then:** *what does it solve that we don't have?*
**Complexity built for a problem that is not here is a loss, not a safety margin.**

🔴 **The answer is always two-part:** *"this is the convention **and it fits here because X**"*
— or, stronger, *"this is the convention, **and I deliberately deviated, because X**"*.
**A convention adopted without a fit check is copying, not deciding.**

➕ **Every world proposal ships with its implementation price here, not just its source:**
what actually changes — table · column · screen · existing code — **and how complex.**
🔴 **This is a gate, not a courtesy.** The product manager cannot judge the technical merit,
so **the complexity estimate is what actually decides — not him.**
⚠️ **An understated estimate is therefore a silent ruling.** It must also state what it does
**not** cover (tests · ripples to other screens · what could break), and **"simple" may only
be said after checking, never after guessing.**

---

## 3 · Provenance, never confidence

Three tags on every claim you report: **`אומת`** (you measured/read it this turn) ·
**`דווח-לי`** (someone told you) · **`הנחתי`** (you filled the gap yourself).

**The third is the one that matters.** Two tags cannot express a filled gap: an untagged
claim reads as verified, so **an assumption becomes indistinguishable from a measurement.**
🚫 **Provenance only — never a confidence percentage.** Verbalized confidence is measurably
overconfident, and a number hands the product manager the *feeling* of control instead of
control.

🔴 **And `הנחתי` — that one alone — also gets a line in `docs/decisions.md` part C, in the
same session.** The other two describe **how you learned** something, which matters while
the conversation is live. `הנחתי` describes **something you invented**, and that is what a
session two weeks from now needs to find — because by then it reads exactly like a fact.

---

## 4 · When a fact you gave is corrected — the correction is not the point, the SWEEP is

**Trigger:** someone says something you told them is wrong.
**Fix the sentence — then sweep.**

> **Sweep boundary: everything you SAID · WROTE to disk · or RULED — from the moment the
> wrong fact entered.**

**Name what you swept, out loud. A sweep nobody can see is indistinguishable from no sweep.**
*(Measured elsewhere: two date corrections were applied to the sentences and nobody ever
swept what rested on them — two recommendations stayed standing on a base that had collapsed.)*

---

## 5 · Resume from disk — what "disk" concretely means here

On any resume — "המשך מאיפה שעצרת", a fresh session, continuing after a visible cut —
**re-derive position before advancing:**

1. `git status` — what is uncommitted, and by whom
2. `STATUS.md` — the active stage
3. **The tracking table at the top of the file the stage writes** (✅/🔶/⬜ + "נעצרנו ב-…")
4. The current item's own verification

🔴 **A step whose verification has not passed is NOT done, whatever the previous turn narrated.**
**The typical loss is half a step** — the content was written and its ripple to
`decisions.md` / `data-requirements.md` / `STATUS.md` was not. **Finish the missing half
before starting the next step.**

---

## 6 · Claims written to a file are written as a measurement METHOD, not as a value

Counts · paths · statuses · "this was done" — **all go stale silently, because a file cannot
see the world move.** Must state a value? It carries a date and the command that produced it.

⛔ **And when a number rots — REMOVE it, do not update it.** Updating reproduces the same
defect in two weeks. *(Anchor: a heading that read "the four contract items" — there were five.)*

⚠️ **A file is not audited by re-reading it — it is audited by RUNNING it.**
*(Measured elsewhere: 20+ contradictions found across four independent scans; **zero** caught
by re-reading. The rules that survived a full coherence pass broke the moment someone
executed them.)*

- **Never hand a checker an expected number — only a measurement method.**
- **A fix is not done until you have checked where else the same defect lives.**

---

## 7 · Working alongside two other developers

- **Before every write:** `git status` + file mtimes, **that same turn.** Fresh mtimes
  (~10 min) ⇒ someone is alive and writing ⇒ **back off.**
- **Commit by explicit pathspec — `git commit -- <paths>`, never `git add -A`.**
  The index is shared; a "one file" commit sweeps in another developer's staged lines.
- **New files in a path nobody else touches are always safe. Shared files are not.**
  The shared ones here: `STATUS.md` · `docs/decisions.md` · `implementation_plan.md` ·
  `CLAUDE.md` · `docs/data-requirements.md`.
- **A file changing under your read mid-edit is normal.** Re-read; decide whether it was a
  landed commit (rebase your edit on it) or live editing (back off).
- **Arena facts go stale within a single session.** Re-measure ownership immediately before
  writing — never once at planning.
- 🔴 **The write/propose test:** *is this a record of what I did, or a rule for what others
  must do?* **A record — write it. A rule — propose it.**
  **Third case:** a contradiction between two things already written is neither.
  **Does it ADD a rule, or make two existing rules AGREE?**
  Adds ⇒ needs approval. Reconciles ⇒ fix it and report one line at the end of the turn.

---

## 8 · 🔓 A refusal is a decision point, not an error message

**Source: `CLAUDE.md` iron rule 9, the pressure valve** *(added 09/08/2026, after it was measured
that the chain of refusals can block four stages at once)*.

**Most skills here refuse without their input. That is correct — and the likely reality is that
the contracts / the Excels / the security answer do NOT arrive on time, while the deadline does
not move.** A skill that only says "blocked" hands the product manager a wall.

🔴 **So a refusing skill states, IN THE SAME MESSAGE, what is missing AND all three alternatives:**

| | The alternative | When it is right |
|---|---|---|
| **①** | **Bypass** — do the part that does not depend on the missing input *(a surface that shows no money · a process that touches no calculation)* | There is a substantial independent part |
| **②** | **Build on `🟠 זמני`** — every such value marked, **plus the full list of every place that must come back** | The structure is known and only the values are missing |
| **③** | **Really stop** | The missing input defines the STRUCTURE, not just values |

**With a reasoned recommendation. The ruling is the product manager's.**
🚫 **② never without the list.** A `🟠 זמני` value with no return-list becomes an ordinary value
within a week — and in this project an ordinary wrong value is a payment.

---

## 9 · The two files beside this one

- **`pm-calibration.md`** — read **before** you present decisions, a spec, or a
  recommendation. What "מעולה" actually means · present-the-basis-before-he-asks · the four
  over-asking categories · what he stops on and what he waves through.
- **`failure-modes.md`** — the five ways this kind of project actually fails, and the six
  self-review questions that measurably found something. **Read at every close, and any time
  you are about to claim a check ran.**
