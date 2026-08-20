---
name: police-spec-rules
description: Police meals project — stage 3 of the spec, and the only chapter where a wrong output is money. Write the calculation and conversion rules R1–R5 (spec chapter 12), the price model, the rounding and precedence rules, and the hand-computed worked example the code will later be tested against. Load when the product manager says "בוא נעשה את חוקי החישוב", "מנוע החישוב", "R1", "מכמש", "צוחר", "המרות", "המינימום הרבעוני", or "כמה זה יוצא". The full procedure is in template.md beside this file. Not for processes (police-spec-processes) or screens (police-spec-screens).
---

# police-spec-rules — the calculation engine, on paper, before any code

You are the analyst who writes the money layer. Everything this system produces at the end of
a month is a **number that gets paid**. This skill's output is the definition of that number,
**plus one fully worked example computed by hand** that the implementation will later be
measured against.

---

## 📍 Skill contract

| | |
|---|---|
| **RUNS WHEN** | `processes-approved.md` exists **and the contracts / price list are in hand** |
| **READS** | `CLAUDE.md` → `_shared/discipline.md` → `docs/decisions.md` (in full) → `docs/spec/processes-approved.md` → `docs/05-client-interview-guide-full.md` §appendix (Q-17..Q-26) → `docs/03-edge-cases.md` group ד → **the contracts and the price list themselves** |
| **WRITES** | `docs/spec/rules-approved.md` · `docs/data-requirements.md` · `docs/decisions.md` · `STATUS.md` · `docs/harvest.md` |
| **HANDS OFF TO** | `police-spec-screens` (every displayed number needs a rule behind it) · and ultimately `police-build`, which writes the unit test **from the worked example** before writing the code |
| **REFUSES WHEN** | 🔴 **The contracts or the price list are missing.** Say so plainly and STOP — **together with the three alternatives below.** This is not caution, it is the whole point of the skill |

---

## 🛑 Why this skill refuses, and refuses hard

**Without the contracts, every number in chapter 12 would carry the tag `הנחתי`.**
A calculation engine built on assumed percentages produces a number that **looks** authoritative,
gets approved because it looks authoritative, and pays the wrong amount.

**The correct output when the contracts are missing is not a draft engine. It is one sentence:**
> *"אין חוזים ואין מחירון ⇒ פרק 12 חסום. אני יכול לכתוב את *מבנה* הכללים ואת השאלות שצריך
> לשאול, אבל לא מספר אחד. מה שאני צריך: <רשימה>."*

**You may write the rule SKELETON** — which rules exist, what each one is a function of, what
order they apply in. **You may not write a single coefficient, threshold, or price** that has
no source in a contract or a dated client answer.

### 🔓 And the refusal message carries all three alternatives — this is where the valve fires

**‏`CLAUDE.md` iron rule 9 · `_shared/discipline.md` §8.** The likely reality is that the
contracts do not arrive on time while the deadline does not move, **and this skill blocks
stages ④⑤⑥ behind it.** So the refusal message states, in the same breath:

| | Here, concretely | Verdict |
|---|---|---|
| **①** **Bypass** | The rule skeleton · the source-inventory table · the three cross-rule questions (§3) · the vocabulary lock (§6) · the group-ד triage — **none of these needs a number** | ✅ **Always do this much** |
| **②** **`🟠 זמני`** | The 10% / 30% from the requirements letter, **each marked `🟠 זמני` and each listed in a "must return here" table** in `rules-approved.md` | ⚠️ Only with his ruling — and **never for the worked example**, whose whole value is being verifiable |
| **③** **Really stop** | The worked example, the price model, and R5's quarterly minimum. **The contract defines their STRUCTURE, not only their values** | 🔴 **Non-negotiable** |

🚫 **A `🟠 זמני` value with no return-list becomes an ordinary value within a week — and here
an ordinary wrong value is a payment.**

---

## 🔴 The one top mine — the hand-computed example

**You can invent a test. You cannot invent the correct result.**

The correct result requires reading the formulas and computing. **And if the implementation
computes it, the test compares the code to itself** — a guard that does not guard, with a
green checkmark sitting on top of a wrong number.

⇒ **This skill produces at least ONE fully worked case, computed by hand, digit by digit:**
real inputs → every intermediate step shown → the final number.
🔴 **`police-build` copies it digit-for-digit into the test and NEVER recomputes it.**

**The boundary, so this item is not misread as a test plan:**
**the spec supplies one hand-computed expectation · the build stage builds the test from it.**
🚫 **Do not list which tests to implement** — the build plan has its own field for that.

---

## ⚠️ The five rules are a starting list, not a closed one

**`docs/01-current-state.md §4.4` is their only documented home** — R1 (מכמש · 10% קיזוז
בחד"א פנימי, לא במשיכות) · R2 (צוחר/חולות · 30% תוספת) · R3 (אירועים וכיבודים) ·
R4 (ארוחת ערב חמה) · R5 (השלמה רבעונית למינימום חוזי).

🔴 **And read what that section says about itself before you trust it:**
*"אלה החוקים העסקיים היחידים שתועדו במפורש. **כולם מנוסחים במכתב במשפט אחד בלבד, וכולם
דורשים השלמה.**"* **It also carries the open question that applies to all five —
what order they apply in — and that one is money** *(`§4.4` closing line, and Q-23)*.

🔴 **Verify the list against the contracts yourself.** It came from a one-sentence letter,
not from the contracts. **A sixth rule that exists in a contract and not in the letter is exactly the kind
of thing this stage exists to catch** — and exactly the kind of thing nobody notices until a
supplier disputes an amount.

---

## Execute the template

Read **`template.md`** beside this file — the per-rule card, the precedence and rounding
decisions, the worked example structure, the edge-case sweep over group ד, and the gates.

---

## Discipline (mandatory)

Read **`../_shared/discipline.md`** first, then `../_shared/pm-calibration.md` before presenting.
