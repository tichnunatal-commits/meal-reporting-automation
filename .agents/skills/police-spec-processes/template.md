# police-spec-processes — the full procedure

Three sub-stages, each ending in a disk write. **The conversation is longer than one session**
— so nothing waits for the end.

---

## §1 · Read and map — then STOP on the surface list

**Read everything in the contract's READS list.** Then present, in Hebrew:

- **The purpose of the system in three lines** — not a summary of the documents, the purpose.
- **The process map** — every process and sub-process, named.
- 🔴 **Every SURFACE** — and "surface" is not only a screen: **tabs · pop-ups · reports ·
  exports · emails · any page reachable without logging in.**
- **What is already known versus still open**, each with its source marking.

**🛑 STOP — he approves the surface list.**
**Without approval there is no `M`.** The round line says *"סגרנו N מתוך M"*, the screens
stage builds one card per surface, and the assembly stage audits coverage against **this list**.
**An unapproved list is a denominator nobody agreed to.**

➕ **The approved list goes straight into `docs/spec/processes-approved.md` as a tracking
table** — פריט · מצב (✅/🔶/⬜) · מצביע. **Without it, a fresh session sees three cards and
cannot tell whether one remains or five.**
⚠️ **Then grep it and confirm it is actually there.** Do not assume it was written because
this file says to write it.

---

## §2 · Align the process map — before describing a single process

**Agree on the list before describing anything in it.**

Bring the processes and sub-processes that are **missing** — including ones you found in
comparable systems that we do not have — **each with a verdict:**
`נכנס` / `לא נכנס, ולמה` / `נדחה ל-M<N>`.

**🛑 STOP — he approves the list.**

🔴 **Every `נדחה ל-M<N>` he approved is registered in `docs/decisions.md` part B as an
`⏭️ M<N>` line, in the same turn.** That is the only register `police-plan-milestone` reads
when it opens milestone N. **A deferral with no line is a silent debt** — it lives only in
your draft, and milestone N will never find it.

---

## §3 · Process by process — one card each

**For every process, a full story from beginning to end.** 🚫 Not an arrow diagram — a diagram
gets a nod. **A story gets corrected.**

### The card structure

| # | The section | Why |
|:-:|---|---|
| **1** | **Name and purpose** | |
| **2** | **Who starts it and when** | |
| **3** | **The flow, as a story** — with a real name, a clock time, a real number | An abstract declaration gets a nod; a concrete one gets refuted in one line — **and that is the goal** |
| **4** | 🔴 **Statuses · who writes each transition · the time anchor of each** | **This is the mine.** A transition with no writer is a hole the build stage will fill alone |
| **5** | **What gets saved** | |
| **6** | **Permissions** — who may do this, and what happens if someone who may not, tries | |
| **7** | **What can go wrong, and what the user sees then** | **Real edge cases from the business process — not invented ones to look thorough** |
| **8** | **How it connects to the other processes** | |
| **9** | **One world-anchor line** — *"in comparable systems it looks like X (source), and here it is Y"*. Identical ⇒ write `זהה למקובל`. No actual search ⇒ write `מהידע שלי, לא אומת` | The gap section only lights up from Claude's own doubt. A process that looks reasonable to you gets no comparison — **and he will not know there was something to compare** |

**🛑 STOP per process:** *"כך הבנתי את התהליך: …"* — and wait. **Do not move on without
explicit approval.**

### 🗄️ And at the end of each process, before moving on

**One question: "מה התהליך הזה דורש מהמסד שעדיין לא רשום?"**
New table · new column · permission rule · constraint.
**What comes up goes into `docs/data-requirements.md` in the same turn, not at the end.**
🚫 **You do not write to a database and you do not write a migration** — you register what
will be needed, so the planning stage can rule on it. **It cannot rule on what was not registered.**

---

## §4 · The 42 edge cases — triaged, and all 42 printed

🔴 **Iron rule 4 applies here more than anywhere else in the project.**

Walk `docs/03-edge-cases.md` **in full** and produce a table of **all 42**, each with:

| EC | The case | Verdict | Where it landed |
|---|---|---|---|
| EC-NN | | `נכנס לאפיון` / `נדחה — לא קורה בשטח (מי אמר, מתי)` / `כבר מכוסה בכלל X` / `⏭️ M<N>` | the process card / the rule / the deferral line |

⚠️ **`נדחה — לא קורה בשטח` requires a source.** It is a ruling, and it is his — not yours.
**A reality filter is only valid if someone with field knowledge said "לא קורה".**
No source ⇒ it stays 🔶 and goes to him as a batched question.

---

## §5 · The permission matrix

**A hard table: role × authority.** The roles come from `docs/01-current-state.md §5` —
**open the table and count them yourself; it lists U1–U5 and the fifth is a view-only role
that is routinely dropped (EC-26 · Q-16 keep it alive), and fork 5 may split the admin in
two.** 🚫 **Do not copy a role count from any skill file.**

- **Every cell filled** — ✅ allowed / 🚫 blocked / 👁️ view only.
- **A cell you could not fill from a source is `❓` and goes to him** — never guessed.
- 🔴 **And beside the matrix, one line per role: what DISAPPEARS from their screen**, not
  only what is blocked. Hiding and blocking are different decisions and the mockup cannot show either.

---

## §6 · Write, verify, close

**‏`docs/spec/processes-approved.md` — Hebrew** *(the reader is a human)* with:
the tracking table at the top · one card per process · the permission matrix · the 42-case
triage table · and the **"נעצרנו ב-…"** line.

**Then, in the same session:**

1. `docs/data-requirements.md` — grep each requirement you claim you registered, and **report
   that you grepped**
2. `docs/decisions.md` — every ruling, quoted and dated · every deferral as `⏭️ M<N>` ·
   every gap you filled yourself as `הנחתי`
3. `STATUS.md` — stage state, and what is still blocking
4. `docs/harvest.md` — **the three lines**, and line ② by name
5. `git commit -- <explicit paths>`

---

## §7 · 🛑 The final gate — a fresh-context reviewer, and it is mandatory

**Before you present the file as finished**, dispatch a fresh-context reader — **only after
the product manager approves the dispatch** (iron rule: never dispatch an agent unasked).

**It gets:** `processes-approved.md` and the answers file — **without this conversation and
without the reasoning that produced them.**
**And exactly two questions, because "review this" returns "looks fine":**

> **‏① אילו טענות כאן חסרות מקור — אמת כל אחת בעצמך מול הקבצים.**
> **‏② מה המסמך הזה לא מזכיר, ושהשלב הבא (חוקי החישוב, ואז המסכים) יצטרך?**

🔑 **‏② is the one that finds omissions, and it only works if the reviewer goes and searches —
not if it reads the document.**
⚠️ **Do not substitute your own re-read.** Self-catch on a self-authored artifact was measured
at **0 of 5**; every mechanism that did work compared against an **external anchor**.

**Fix its findings before presenting. Report both the findings and what you did with each.**

---

## §8 · Stop-and-ask triggers

Stop if you are about to: fill a product detail that was not approved · ask a question you
could rule yourself · describe a process on an unruled fork · invent an edge case · extend
the scope beyond what was approved · or write to disk without approval.

**Close every message with the open-items line. Nothing open ⇒ `אין פתוח`.**
