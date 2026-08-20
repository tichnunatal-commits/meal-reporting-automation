# police-plan-milestone — the full procedure

---

## §A · First run only — the roadmap

**Write `implementation_plan.md` zone 1. Three lines per milestone, no steps.**

### The five milestones — verify them against `SPEC-B.md`, do not copy them from here

| # | The milestone | What it delivers |
|:-:|---|---|
| **M0** | Setup, database and authentication | Project skeleton · login · users and permissions · base tables (kitchens, price lists, suppliers) |
| **M1** | The supplier's reporting flow, end to end | Entry of quantities by the catering inspector · attaching a reference file · submitting a month |
| **M2** | Ramatal review and correction | Review · reasoned corrections · approve or return for editing · notifications |
| **M3** | The calculation engine (R1–R5) | The rules · precedence · rounding · the quarterly minimum · **the unit test built from the hand-computed case** |
| **M4** | Food-section approval, output and audit | The national screen · export · the audit log |

**Each milestone's three lines:** what it delivers *(plain Hebrew, what a user can do)* ·
what it depends on · **a target date measured against the deadline in `CLAUDE.md`.**

### 🔴 And the row that goes FIRST, above M0

| The track | Why it is not a milestone | Owner |
|---|---|---|
| **אישור אבטחת מידע + סביבת אירוח** | **Calendar time, not work time.** No amount of development shortens it, and it does not depend on any milestone. `docs/01-current-state.md §1.4` states the original estimate excludes it | ❓ — **and an unowned track does not advance** |

⚠️ **If this row is still ⬜ when M0 is planned, say so in the presentation.**
**Not as a footnote — as the first thing.** The most likely way this project misses its
deadline is finished code waiting for an approval that was never started.

### 👥 Who builds what — ruled 09/08/2026, model א' *(D-17 · `docs/team-model.md`)*

**The team is TWO full developers plus a part-time team lead — not three equals.**
**Work is split BY LAYER, not by milestone:**

| | The layer | Closes |
|---|---|:-:|
| **מפתח 1** | data structure · permissions · business logic + unit tests | what **מפתח 2** built |
| **מפתח 2** | screens · wiring · UX | what **מפתח 1** built |
| **ראש צוות** | rulings · the security-approval track · partial development | **not on the critical path** |

⇒ **Every step in this file carries a "מי" column.** Fill it as you write the step, not after.

🔴 **The cross-close rule, and it is the reason this model was chosen:** `police-close` runs in
the session of **whoever did NOT build that milestone.** The layer split makes that automatic —
**but if both touched the same layer, name the closer in the plan, in advance.** Otherwise the
project is back to the auditor auditing himself *(failure mode 🅰️)*.

⚠️ **Phase 1 blocks phase 3 at the start of every milestone.** ⇒ **Sequence מפתח 2's first steps
onto the mockups and screen cards**, which need no tables to exist. A plan that leaves him
waiting for migrations is the serial plan wearing two names.

⬜ **And one input is still open, from `docs/team-model.md`: where the shared repository lives**
*(no remote today · classified · public `GitHub` ruled out)*. **Routed to `police-stack` track A —
not yours to rule.** Still open when M0 is planned ⇒ **say so beside the security track**, because
without a shared place there is no branch per developer and this model collapses back to serial.

---

## §B · Every run — plan the active milestone

### B1 · Before a single step — the debt sweep

**‏`grep '⏭️ M<N>'` in `docs/decisions.md`** for **this** milestone's number.
**Every hit becomes an explicit step, or is re-deferred with a reason and a new target.**
🔴 **A deferral that is not scheduled at the milestone that owns it is a debt that will never
be paid** — that register is the only place it lives.

**Then sweep `docs/data-requirements.md`** for every row targeted at this milestone.

### B2 · 📦 The context packet — what a zero-memory session needs to start without exploring

**Written once per milestone, at the top of its zone.** The build session reads this and
rarely goes looking further ⇒ **whatever is missing here gets guessed.**

| The section | What goes in it |
|---|---|
| **The milestone in ≤3 lines** | What a user can do at the end of it |
| **Product source** | The exact pointers: `SPEC-B.md` + which screen cards, which process cards, which rules, which approved mockups. **By path** |
| **Files to create** | The new paths this milestone authors |
| **Existing files to touch or reuse** | Paths + what changes in each |
| **Data structures** it reads and writes | From `docs/data-requirements.md` |
| **What it depends on** from earlier milestones | |
| **Environment facts** | The commands from `docs/stack.md`, the local run, anything a session would otherwise have to discover |
| 🔑 **Test identities** | **MANDATORY whenever the milestone touches permissions or role-based screens — see below** |

#### 🔑 Test identities — and this is the load-bearing one

**Name the test users this milestone needs:** one supplier catering inspector · **a second
one, from a DIFFERENT supplier** · a ramatal · a food-section user · an admin.

🔴 **And a POSITIVE CONTROL beside every negative test.** A user who **should** see rows must
return **≥1 row.**
**Why this is not ceremony:** the whole risk of this project is one supplier seeing another
supplier's data (EC-24). **A misconfigured test identity makes every query return zero rows —
and that looks exactly like perfect permissions.** Zero rows on the negative test proves
nothing unless the positive control returned rows in the same run.

🔴 **Verify which test users ACTUALLY exist before naming any of them. Count them; do not
assume the set is complete.** *(In a comparable project this exact failure was caught three
separate times, because a plan named identities that were never created — and a plan naming a
non-existent identity does not fail loudly.)*

### B3 · Sequence and integration check — state the conclusion first

- **Is building this now sound**, given what already exists?
- **What existing files will this milestone modify?** List them, with what changes.
- **Prove the rest is additive** — new files and tables only.
- **Name what could plausibly break, and which step guards it.**

### B4 · The step format — every step, no exceptions

```
Step N.M — <title>
  מי            מפתח 1 / מפתח 2  ← the layer split, D-17. Never blank
  Goal          what this step achieves, one line
  Files         exactly what is created / touched
  What to do    the instructions
  Verify        🔴 a concrete mechanism with an EXPECTED RESULT.
                Never "make sure it works". The command comes from
                docs/stack.md — empty field ⇒ this step cannot be planned
  מה ייחשב עובד  3–5 Hebrew sentences, HARVESTED from SPEC-B, each tagged
                with its source, each with a real number or string
  Gate          🤖 (I verify and continue) or 🛑 (human approval)
  🛑 אושר —      ← left EMPTY. Filled with DD/MM HH:MM at approval
```

🔴 **The empty approval slot is not bookkeeping.** A session resuming into a half-built unit
reads that line to decide whether the unit was ever approved. **No line ⇒ it re-asks from
scratch.** *(Re-asking something already approved is the cheap error. Code he never saw,
reported as gated, is the expensive one.)*

### B5 · Where the 🛑 gates go — and only here

- **End of every phase**
- **A product or design decision**
- **Before any change to the database structure** — 🔴 **and this gate is a typed echo:**
  he types the name of the change, not "yes". A plain approval is not sufficient
- **Anything touching secrets, accounts, or external access**
- **The experience brief before each significant build unit** *(owned by `police-build`)*
- **Final sign-off at close** *(owned by `police-close`)*

**Everything else is 🤖:** verify yourself, show the evidence, continue.
**Mid-phase visual evidence is 🤖-with-screenshot, never a human wait.**

### B6 · Phase order inside a milestone

**Data structure → business logic + its unit tests → screens → wiring → QA and handoff.**
🔴 **The last step of every milestone is always a 🛑 closing-audit step that runs
`police-close` IN A FRESH SESSION, and its "מי" names the developer who did NOT build it**
*(D-17, the cross-close)*. A plan without it is incomplete — **an audit run by the session that
built the code is the builder checking himself.**

⚠️ **For M3 specifically:** the tests are written **before** the logic, and the expected value
is **the hand-computed number from `rules-approved.md`, copied**. Watch the test fail for the
right reason first.

### B7 · Two sections the milestone zone also carries — and `police-close` reads both

**‏① 📊 QA matrix — planned now, filled at close.**
One row per test type — unit · integration · end-to-end · **the product manager's own
acceptance walk** · security and permissions · usability — with **an empty "as-run" column.**
🔴 **‏`police-close` §6 fills this column. Without the table existing here, it has nothing to
fill** — and a close that invents its own matrix measures whatever it happens to think of.

**‏② 📝 Deviations log — append-only, dated, and it is the ONE thing never compacted.**
🔴 **This is the home that `police-build` and `police-close` both write to.** Every line:
what was planned · what was actually built · why · and what it means going forward.
**Everything `הנחתי` that touches this milestone gets a line here too**, on top of its entry
in `docs/decisions.md` part C.

**Why append-only and never compacted:** a finished milestone's steps are spent and get
collapsed. **The deviations are the only record of where reality diverged from the plan** —
and that is exactly what the next milestone needs and cannot re-derive.

### B8 · Model and effort per phase — a small table at the top of the zone

One row per phase: which model, how much effort, and why.
**Data structure and permissions ⇒ high effort.** Routine screens ⇒ lower.
**The closing audit ⇒ high effort, always, and a fresh session.**
*(Cheap to write, and it stops a session from doing the highest-risk phase on the lightest
setting without noticing.)*

---

## §C · 🛑 The approval gate

**Present in Hebrew:** what this milestone delivers *(what a user can do at the end of it)* ·
the sequence conclusion · what could break · the debts being paid · **and the "מה ייחשב עובד"
of every step, since those are what he is really approving.**

**Then wait.** Write to disk only after approval.

**➕ And a separate blind-spot block:** *what would a senior engineer check about this build
plan that nobody thought to ask?* Then: **"על מה לא שאלתי ושווה שתספר לי?"**
⚠️ It must name something checkable — a file, a mechanism, a scenario. `אין` is a legitimate
and preferred answer over an invented one.

---

## §D · When a milestone closes — compaction

`police-close` runs the audit **and does the compaction itself** *(`police-close` §10.6 —
it holds the evidence)*. **This skill then:**
1. **Verifies the compaction landed** — the finished milestone is a summary table with the
   evidence that proved it, plus a carry-forward note. 🚫 **Do not redo it, and do not write a
   second summary.** Missing ⇒ say so and write it, in one dated line
2. Sets the next milestone as active and plans it
3. Updates the roadmap's dates **against reality**, and says out loud if the deadline moved

🚫 **Never compact the active milestone or the deviations log.**

---

## §E · Stop-and-ask triggers

Stop if you are about to: plan a step whose verification command is empty in `docs/stack.md` ·
author a "מה ייחשב עובד" sentence instead of harvesting it · recompute a hand-computed number ·
plan more than the active milestone in detail · or skip the debt sweep.

**Close every message with the open-items line. Nothing open ⇒ `אין פתוח`.**
