---
name: police-stack
description: Police meals project — the architecture stage. Decide the technology, fill docs/stack.md, and drive the information-security and hosting approval track. Load when the product manager says "בוא נחליט על הטכנולוגיה", "איפה זה ירוץ", "ארכיטקטורה", "אבטחת מידע", "אישור אבטחה", "מה עם האירוח", or when SPEC-B.md is approved and docs/stack.md is still empty. Runs ONCE, between police-spec-assemble and police-plan-milestone. Also the only skill that owns the security-approval track, which starts long before this stage does.
---

# police-stack — the architecture decision, and the clock nobody else owns

`docs/stack.md` has four readers and, until this skill existed, **zero writers.**
`police-plan-milestone` refuses to run while it is empty. **This skill fills it.**

🔴 **And it owns something more urgent than the technology choice: the information-security
and hosting approval.** That is **calendar time, not work time** — no amount of development
shortens it, and `docs/01-current-state.md §1.4` states outright that the original one-month
estimate excludes it.

---

## 📍 Skill contract

| | |
|---|---|
| **RUNS WHEN** | **Track A (security) — IMMEDIATELY, before the spec is finished.** Track B (technology) — after `SPEC-B.md` is approved |
| **READS** | `CLAUDE.md` → `_shared/discipline.md` → `docs/stack.md` → `docs/spec/SPEC-B.md` (chapters 9 and 16) → `docs/data-requirements.md` → `docs/04-open-questions.md` (Q-30..Q-36) → `docs/05-client-interview-guide-full.md` §appendix → `STATUS.md` |
| **WRITES** | **`docs/stack.md`** — the only writer · `docs/decisions.md` · `STATUS.md` (the security-track row) · `docs/harvest.md` |
| **HANDS OFF TO** | `police-plan-milestone` — which needs every command field filled, or it refuses |
| **REFUSES WHEN** | Track B only: `SPEC-B.md` does not exist. **Track A never refuses — it is the thing that must not wait.** 🔓 **And a refusal is not the whole message** — present the three alternatives with a recommendation (`_shared/discipline.md` §8) |

---

## 🔴 Two tracks, and they do NOT run at the same time

```
TRACK A · security & hosting approval   ← starts NOW. Calendar time.
   ├─ who owns it (a person, not "the team")
   ├─ what they need from us, in writing
   └─ what the answer constrains
                    ↓  its answer is an INPUT to
TRACK B · the technology decision       ← after SPEC-B
   └─ fills docs/stack.md
```

**‏🔴 Running B before A has an answer produces a stack that the approval may forbid.**
Running A late produces finished code waiting on a form. **A starts first and runs in parallel
with the whole spec stage.**

---

## Track A · the security and hosting approval

**Three things, and none of them is technical:**

1. 🔴 **Name the owner.** A person, not a department. **`STATUS.md` currently records
   `❓ טרם נקבע`** — verify that yourself before doing anything else; if it is still empty,
   **that is the single blocking item and it goes to the product manager as one question,
   nothing else attached.**
   *(This is a team-lead decision, not a Claude decision.)*
2. **Produce the ask, in writing, in plain Hebrew** — what we are building · who reaches it
   *(🔴 **external suppliers, from outside the police network — this is the whole issue**)* ·
   what data it holds *(בלמ"ס)* · roughly how many users · and **what we need from them:
   a decision, a timeline, and the constraints.**
   ⇒ **This is exactly `CLAUDE.md` iron rule 10** — plain-Hebrew steps **plus** a
   self-contained handoff block, because nobody here can walk this through a police portal.
3. 🔴 **Carry one more question into the same ask — where the shared code repository may live.**
   Three developers, no remote today, classified content, **and a public `GitHub` is ruled out.**
   ‏`docs/team-model.md` routes this question here explicitly, and options א'/ב' there cannot be
   chosen without its answer. 🚫 **Do not assume a shared network folder either — ask.**
4. **Record the answer's constraints in `docs/stack.md` part ד the moment they arrive** —
   even partial ones. **A constraint that lives in someone's memory of a phone call is not a
   constraint.**

⚠️ **And track the DATE it actually started, in `STATUS.md`.** Elapsed calendar time is the
only measurement that matters here, and it is invisible unless someone writes down day zero.

---

## Track B · the technology decision

**Preconditions:** `SPEC-B.md` approved · Q-30..Q-36 answered *(or explicitly deferred with
their consequence stated)* · track A's constraints known **or explicitly marked unknown.**

**The method — and iron rule 1 governs it end to end:**

1. **Start from the constraints, not from preferences.** Classification · external supplier
   access · ~95 users · the volume in `docs/01-current-state.md §2.3` · Hebrew RTL ·
   whatever track A ruled.
2. **Bring 2–3 real options.** For each: what it costs to build · what it costs to approve ·
   what it forecloses. 🔴 **And the fit check** *(`_shared/discipline.md` §2)* — a stack sized
   for thousands of concurrent users is solving a problem this project does not have.
3. **The three developers matter here.** The stack must be one all three can work in.
   *(That is a real constraint and it is easy to forget while comparing features.)*
4. **Recommendation first, then the alternatives**, each with what actually happens if chosen.
5. 🛑 **The ruling is the team's, not Claude's.** Present, then wait.

**Then fill `docs/stack.md` completely — parts ב AND ג.**
🔴 **Part ג is the commands, and three skills read it literally.** A field left blank means
`police-plan-milestone` cannot plan a verification step and `police-close` cannot run a gate.
**Fill every row or state explicitly why a row does not apply.**

---

## ⚠️ What this skill must not do

- 🚫 **Not choose a stack because it is familiar or fashionable.** *"This is the convention"*
  is evidence, never a reason — the two-part answer is required: *"and it fits here because X"*,
  or *"and I deliberately deviated, because X"*.
- 🚫 **Not write code, not scaffold, not install anything.** It writes a decision to a file.
- 🚫 **Not assume the approval will be granted.** Say what happens if it is refused.

---

## 🔚 Close

`docs/stack.md` filled · `docs/decisions.md` with the ruling quoted · `STATUS.md`
(track A's owner and start date, track B's outcome, and whether the deadline moved) ·
`docs/harvest.md` three lines · commit by explicit pathspec.

**Then say in one line what is now unblocked, and what `police-plan-milestone` can start on.**

---

## Discipline (mandatory)

Read **`../_shared/discipline.md`** first, then `../_shared/pm-calibration.md` before presenting.
