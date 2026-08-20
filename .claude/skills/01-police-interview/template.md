# police-interview — the full procedure

Two modes. Read §0, then jump to A or B.

---

# §0 · Grounding — before either mode

**Read, in this order, and do not work from memory of any of them:**

1. `CLAUDE.md` — iron rules, especially rule 1 (the anchor doctrine) and rule 4 (filter transparency)
2. `STATUS.md` — which stage is active, and whether a meeting already happened
3. `docs/decisions.md` — **in full, every item to its end.** Status tags rot: an item can open
   with "open" and close three lines later
4. `docs/00-index.md` — **the chapter table with its `חסום על` column is the dependency data
   this whole skill runs on**
5. `docs/04-open-questions.md` — the question register
6. `docs/05-client-interview-guide-full.md` — the 42 questions and the answers appendix
7. `docs/02-decision-forks.md` — the 6 forks, and which are already ruled
8. `docs/03-edge-cases.md` — the 42 edge cases

🔴 **Measure, do not inherit.** Every number in this file and in those files is **evidence
that someone counted once**, not a current fact. **Count the open questions yourself and
report how many you found.** If your count differs from what a document says, **your count
wins and you say so.**

---

# §A · Mode A — build the page he carries into the room

## A1 · Rank by unblocking power — a recipe, not a fixed list

🔴 **Do not order the page by topic. Topic order is correct for a document and wrong for a
room where only ten questions will get asked.**

🔴 **And DO NOT rank on the chapter count alone. Measured 09/08/2026 by a fresh-context
reviewer: six questions marked 🔴 חוסם — `Q-01 · Q-10 · Q-27 · Q-28 · Q-29 · Q-39` — are
named by ZERO chapters in the `חסום על` column, while `Q-23` (the order of operations, which
is money) scores 1.** A count-only ranking buries all seven. **Two independent signals, and
the urgency mark is the FIRST of them.**

**The recipe — run it, don't recall it:**

1. **Read the urgency mark of every question in `docs/04-open-questions.md`** — 🔴 חוסם ·
   🟡 משפיע · ⚪ נחמד-לדעת. **Count how many of each you found and report the three numbers.**
2. Open `docs/00-index.md`, the 16-chapter table, and read its **`חסום על`** column.
   For every question and unruled fork, **count how many chapters name it** = its
   **unblocking power**.
3. Cross-check against `docs/02-decision-forks.md` — each fork's own **"מה נחסם עד ההכרעה"**.
   Where the two disagree, **read both and report the disagreement** — do not silently pick one.
4. **Rank: every 🔴 first, ordered among themselves by unblocking power. Then 🟡. Then ⚪.**
   🔴 **A 🔴 with an unblocking power of zero still outranks a 🟡 with three** — the zero means
   nobody wrote it into the chapter table, not that it does not block.
5. **Sanity check against the source's own advice:** `docs/00-index.md` names the questions to
   open with (grep anchor `התחל מהשאלות החוסמות`). **If your top four disagree with it, say so
   and explain which you trust and why** — do not silently override it.
6. **Report the full ranked list with all the numbers** — iron rule 4. **A table, not a summary.**

### 👤 And it is not one room — split the page by respondent

🔴 **`docs/05-client-interview-guide-full.md` carries a `👤 משיב מומלץ` column
and a `⚠️ תנאי דילוג` column. USE BOTH.** *(Measured 09/08/2026: both had zero occurrences
across every skill — one page was being built for one room while the questions route to at
least four.)*

- **Group the ranked questions by their `👤 משיב מומלץ`** — מדור מזון · IT ואבטחת מידע ·
  כספים · חוזים · and whoever the requirements letter came from.
- **Produce one page PER ROOM**, each ranked independently. A single pooled page sends
  questions to a person who cannot answer them, and wastes the meeting.
- 🔴 **The room that unblocks `docs/stack.md` (Q-30, Q-31 — IT ואבטחת מידע) is a DIFFERENT
  room, and its page is the more urgent of the two** — it starts the security-approval clock,
  which is calendar time nobody can shorten *(`CLAUDE.md` סיכון #1)*.
- **Honour `⚠️ תנאי דילוג`** — a question conditioned on another answer goes into the skip
  tree, not the flat list.
- ⚠️ **And `docs/04-open-questions.md` Q-39 asks who the deciding contact even is.** If it is
  unanswered, **say so** — the room list itself is provisional.

⚠️ **Two corrections that the raw count gets wrong, and you apply both consciously:**

- **A cheap question with low unblocking power still goes on the page** — at the bottom, as
  filler for any gap in the conversation. *(Example shape: "how many kitchens are there?" —
  a ten-second answer that unblocks the whole data model.)* **Rank decides the order, not
  the inclusion.**
- **A question whose answer is already in `docs/decisions.md` is removed entirely** — and you
  say so out loud, with the decision quoted and dated. **A question that already has an
  answer is not a question; it is a reading that was not done.**

## A2 · Skip-logic — this is what makes the order "correct and logical"

**The product manager's own framing: one answer opens questions and closes others.**
So the page is a **decision tree, not a flat list.**

**For every high-ranking question, work out — before printing:**

| | |
|---|---|
| **If answer = option א** | which questions **die** · which **are born** |
| **If answer = option ב** | same, for the other branch |

**Printed form — it must be readable at a glance, standing up, mid-conversation:**

```
❶ הזנה יומית או סיכום חודשי?          [צומת 2 · פותח 4 פרקים]

   תשובה מלאה נשמעת כך: "X, כי Y" — ולא רק "X"

   ⮑ ענה "סיכום חודשי"  → דלג על ❹ ❺ · שאל במקום: "על סמך מה
                            הספק מסכם? יש לו רישום יומי, ואיפה?"
   ⮑ ענה "הזנה יומית"   → שאל ❹ ❺ כרגיל
   ⮑ ענה "תלוי בספק"    → 🔴 סמן ושאל: "אצל מי כך ואצל מי אחרת?"
```

🔴 **The third branch is mandatory on every question.** *"It depends"* and *"we do both"*
are the two most common real answers in a field interview, and a two-branch tree makes the
person in the room force a false binary. **Always print the "neither" branch.**

## A3 · What the page contains — six blocks, in this order

| # | The block | Why it is there |
|:-:|---|---|
| **0** | 🔴 **State out loud, at the top of the page, what the Excel decides — not just that we want it.** The supplier's Excel **answers fork 2 (daily versus monthly) from evidence instead of from a guess in the room**, and fork 2 blocks the data model AND `docs/02-decision-forks.md`'s own words: *"המסך המרכזי במערכת"*. ⇒ **Do not push fork 2 to a decision in the meeting if the Excel is coming.** Ask about it, record the answer, and **say explicitly that it is confirmed against the file afterwards** *(ruled 09/08/2026: "אולי ברגע שאראה את האקסל יהיה לנו יותר קל להחליט")* | A fork decided verbally and then contradicted by the real file costs the whole data model |
| **1** | 🎯 **The FIVE physical items to leave with** *(corrected 09/08/2026 — the list said three, and `STATUS.md` + `docs/00-index.md` both register five)*: supplier Excel · ramatal Excel · **contracts and price list** · **the kitchen and price list** · 🔴 **a sample of the payment output the food section produces today**. **Each with one line of why** | A file cannot be paraphrased. 🔴 **And the fifth is the one that was dropped: `EC-40` says outright *"חייבים לראות מה מדור מזון מוציא היום"* — it is the only artifact that defines what the whole system must ultimately produce, and `Q-27` (where does the output even go) is 🔴 חוסם** |
| **2** | ❶–❹ **The four highest-unblocking questions**, with skip-logic | If the meeting collapses to ten minutes, these are the ten minutes |
| **3** | ⏱️ **The cheap fillers** — one-line answers, no context needed | They cost nothing and unblock the data model |
| **4** | ⚠️ **The one item that must be raised even though nobody asked** — the control that decision D-02 removes *(the cross-check between the supplier's list and the ramatal's list)*. **The food section is the party that relies on it today.** Verify it is still live in `docs/decisions.md` before printing it | A conscious decision that the affected party never heard about is a decision that gets reversed later, expensively |
| **5** | 📝 **"מה הוא אמר שלא שאלתי עליו"** — a genuinely blank half-page | **The single most valuable thing from a client meeting is almost always volunteered, not asked.** A 42-question kit structurally cannot capture it |
| **6** | ✍️ **The quoting reminder, one line at the top and one at the bottom** — *"כתוב את מה שהוא אמר, לא את מה שהבנת"* | Cheapest possible defence against the failure this skill's mine names |

## A4 · Form — and this is not cosmetic

- **The page is Hebrew, printable, and fits on as few sheets as possible.** He is standing,
  holding it, in a conversation.
- **Every question is one breath long.** Needs a preamble ⇒ it is the wrong question.
- **Leave real writing room.** A page with no space produces short answers, and short answers
  are paraphrases.
- **Produce both:** `docs/meeting-<DD-MM>-page.md` (the source of truth, editable) **and a
  self-contained printable HTML** beside it. 🚫 **Local file only — never published, never
  uploaded.** This project is classified.

## A5 · 🛑 Stop — he approves the page before it prints

**Present:** the full ranked table (both numbers) · the questions that were **removed because
they are already answered**, each with its quoted decision · and the skip-logic of the top four.
**Then wait.** Only he knows whether a question is askable in that room.

---

# §B · Mode B — ingest what came back

## B1 · Take it raw, all at once

**Ask for everything in one paste** — typed, photographed notes transcribed, voice-memo text,
in any order, in the client's words. 🚫 **Do not ask for it question by question.**
**The ripple can only be computed once everything is on the table**, and sequential intake
means recomputing it after every item — at his cost, in rounds of typing.

**Missing or unreadable ⇒ ask about that item specifically. Never fill it in.**

## B2 · Then go one at a time — and show the ripple

**For each answer, produce one row. This is the deliverable of mode B:**

| The answer, quoted | Which Q/fork | What it **closes** | What it **opens** | What it **contradicts** |
|---|---|---|---|---|

**Rules for the table, and each one had to be learned:**

- 🔴 **The quote column carries his words, not your reading of them.** If what you received
  is already a paraphrase, **say so in the row** and mark it `דווח-לי`, not 🎤.
- **"What it opens" is the column that earns this pass.** An answer that closes a fork almost
  always creates a question nobody wrote — that is exactly why the meeting was worth holding.
- 🔴 **"What it contradicts" is checked against `docs/decisions.md`, not against your memory
  of the conversation.** An answer that contradicts an earlier ruling is **not** yours to
  resolve. Bring both, quoted and dated, and ask which stands. **Never obey the one you found
  first.**
- **An answer you cannot map to any question is not an error — it is block 5 doing its job.**
  It gets its own row and probably its own new question.

## B3 · The declaration pass — before anything is written to disk

For every answer about **how the process actually works**, state it back as an
**understanding-declaration inviting correction**, with a concrete scenario:
a real name, a clock time, a real number, and the honest trap.

> *"כך הבנתי: מפקח ההסעדה במטבח X מזין את הכמויות של כל החודש ב-2 בחודש העוקב, שולח,
> ומאותו רגע הוא לא יכול לערוך. אם הוא גילה טעות ב-3 בחודש — הוא צריך שהרמת"ל יחזיר לו.
> נכון?"*

🔴 **An abstract declaration gets a nod; a concrete one gets corrected in one line — and that
is the whole point.** *(Failure mode 🅱️: nothing else in this project compares the spec to
what he meant.)*

## B4 · Write it to its home — same session, and verify each write

| What | Where | Marking |
|---|---|---|
| Every answer, quoted | `05-client-interview-guide-full.md` §appendix | 🎤 + date |
| A closed fork / a ruling | `docs/decisions.md` part A | quoted, dated, with what it unblocks |
| A newly born question | `docs/04-open-questions.md` | with what it blocks |
| A question that died | `docs/04-open-questions.md` | struck, **with the answer that killed it** |
| A data requirement that surfaced | `docs/data-requirements.md` | the surface it came from |
| Anything you filled yourself | `docs/decisions.md` part C | `הנחתי` |
| Where we stopped, what is still missing | `STATUS.md` | |
| Three harvest lines | `docs/harvest.md` | |

🔴 **After writing, grep each one and report that you did.** *"Registered"* is the single most
likely false statement in this repo — `_shared/discipline.md` §1.

## B5 · Close the round — and the closing line is not decoration

**Report, in Hebrew:**

- ✅ **N מתוך M נענו** — both numbers, counted, not estimated
- 🔴 **What is still blocking, by name** — and which stage each one blocks
- **The FIVE physical items of §A3 block 1, one line each: arrived / did not arrive** —
  supplier Excel · ramatal Excel · contracts and price list · kitchen and price list ·
  **the sample of today's payment output**. 🔴 **All five, including the ones that arrived** —
  a list of only the missing ones cannot be told apart from a list nobody checked.
  🚫 **Never let a full answer sheet hide a missing Excel file or a missing contract.** Say it plainly:
  *"‏40 תשובות חזרו, והחוזים לא — שלב 3 עדיין חסום לגמרי."*
- **Whether another meeting is needed** — and if so, **run mode A again on what is left**,
  re-ranked. It is a different page from the first one, not the same page with strikethroughs.

⚠️ **The blocking line is mandatory even when it is uncomfortable.** *(Measured elsewhere:
three separate times he had to ask "did I answer everything?" — **that check must not be
on him.**)*

---

# §C · Closing rules — both modes

**Stop and ask if you are about to:** invent a question that has no source · fill in an
answer that was not given · rank a question by intuition instead of by the `חסום על` count ·
resolve a contradiction between two rulings yourself · or write anything to disk that was not
approved in chat.

**And when you finish a reply — if something is unclear, say so explicitly.**
**"לא ברור לי" is a good answer.**

**Close every message with the open-items line:** what is running · what waits on him · what
closed. **Nothing open ⇒ write `אין פתוח`. A missing line is not an answer.**
