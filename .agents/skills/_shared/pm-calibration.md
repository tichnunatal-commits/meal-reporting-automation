# Calibration — how to work with the product manager

> **What this is:** not a summary of any conversation. **The calibration** — how he works,
> what stops him, and what he means when he says "good". Everything here was **measured**
> in real sessions on comparable projects, not theorized.
>
> **When to read it:** before you present decisions, a spec, a mockup, or a recommendation.
> **Not** while you are building — there is nothing here you need mid-implementation.
>
> 🔴 **Who this file is about — read this before you read anything else in it.**
> **Three developers work on this project. This file describes exactly ONE of them:
> the person who makes the product decisions.** Everything below was measured on him
> specifically, over real sessions.
> 🚫 **It is not a description of the team, and it does not describe the other two developers.**
> Do not apply it to whoever happens to be talking to you — apply it when you are presenting
> a decision, a spec, or a recommendation **to the product manager.**
>
> **Roles, not names** — this file names no person. The measurements are kept; the identities
> are not. Where it says *"his words"*, the quote is real and the speaker is the product manager.

---

## 1 · What he actually buys

**The spec is in Hebrew — and not for convenience.**
🔴 **The real reason: he cannot read code. The spec is his only control surface over the build.**
**A document he does not understand = a system built with no oversight at all.**

**Detail level: high everywhere it would otherwise be guessed.** In his words: *"so there
are no questions or guesses when building"*. **He said explicitly that the build is based on
the spec and the mockups alone** ⇒ **every gap in the spec becomes a silent Claude decision.**
That is what he is buying with hours of interview.

**What he wants in it:** the **why** beside the **what** *(he defends the decisions out loud
to people who did not sit in the room)* · what was decided **versus what was deliberately
left open** · and the debts owed to later stages.

**What is waste:** 🔴 **summaries of what already happened** — *"don't summarize the
conversation for me, I was in it."* Also: numeric success metrics (there are no real users
yet) · artificial options invented to look thorough · **invented edge cases** — *"only what's
genuinely relevant to the project — apply judgement here."*

**Structure that worked:** every chapter opens with **2–3 lines of plain Hebrew — "what this
is and why"** — with the precise detail underneath. **He reads the top layer and understands
the module; Claude reads all of it.**

---

## 2 · What stops him, and what he waves through

### He stops — and always for one of three reasons

| What he says | The type |
|---|---|
| *"did you actually read it in depth? you wrote 'filtered' and I want to understand what you meant"* | **Did you really read?** |
| *"I'm sending you back to the algorithm — I agreed with him on 5 angles, search for it"* | **Did you really read?** |
| *"so did we really close all the corners?"* | **Did you really close it?** |
| *"what happens if it's 24 hours before and someone is still missing?"* | **What happens in the field** |
| *"we need to make sure she doesn't finally approve 7 when 6 are needed"* | **What happens in the field** |
| *"please don't send agents next time without my approval"* | **That's my call** |
| *"the plan is currently wrong — I said I'd fix it after I finish with you"* | **That's my call** |

🔑 **He never once stopped on wording, on visual taste, or on "that's not what I meant".**
**Every stop was about completeness, field reality, or the boundary of authority.**

### He waves through — and it is not disinterest

*"1. agree 2. agree 3. hmm, actually sounds reasonable 4. you taught me something, I agree
with you"* — **four rulings in one line.** Also: *"whatever you think"* · *"fine"* ·
*"I'm with you"*.

🔑 **The pattern: when the recommendation is reasoned and the reasoning is visible, he
approves in one word.** He does not perform a review.
**Approval speed is not disengagement — it is trust, conditional on the reasoning being visible.**

⚠️ 🔴 **So the practical consequence is the opposite of how it looks: the faster he approves,
the more weight rests on the quality of the reasoning you showed — because he will not check it.**

---

## 3 · What "good" means from him

| What he says | What it actually means |
|---|---|
| **"מאשר" · "הכל מוסכם" · "מעולה"** | *I understood, and I'm not arguing.* **It is NOT verification** — in his own words: *"I'm careful because I have no real ability to check"* |
| **"זורם איתך"** | *I trust you on this — continue.* **Weaker than "מאשר"**: delegation, not agreement. **You own the outcome** |
| **"חידשת לי"** | 🏆 **The highest signal.** The research or the reasoning taught him something. **This is what he is actually buying** |
| **"נשמע הגיוני"** | The reasoning held. It was not checked against anything |

🔴 **And what "good" is NOT: evidence that the artifact is correct.**
⇒ **"מעולה" from him releases you from nothing.**

---

## 4 · 🔴 Three interaction rules — all three were measured, all three had been missing

### ① The shape of the questions that catch you — he attacks the BASIS, not the claim

**Measured: 4 of 4 defects found in one day were caught by him, all in the same pattern:**
*"who said that's good?"* · *"did you re-read the skill?"* · *"are there more holes like this?"*

**‏🔑 None of them disputes the content. All of them ask *how do you know*.**

**‏⇒ The consequence, and it reverses the order: present the basis BEFORE he asks.**
Every ✅ carries **how it was checked** · every number carries **what was measured versus
estimated** · every absence-claim carries **which places were searched and which were not.**
**Whatever you don't mark, he will ask about — and that costs a round.**

**Two roots behind the pattern:**
**‏A · Do not infer what you can measure.** Approved? — **ask.** How many? — **count.**
Exists? — **read it; don't trust a counter.**
↳ **The most common instance, as a trigger and not a separate rule: never assume a prompt
was sent.** Every block is marked `⏳ ממתין לשליחה` until he says he sent it. **In doubt — ask.**
**‏B · Do not produce a recommendation that has no basis yet.**
**"Not measurable yet" is a complete answer** — and far cheaper than a recommendation that
gets withdrawn.

### ② One accumulating block — never a separate addition

**In his words:** *"I often pass your prompts along, come back to you, and suddenly you have
additions."*
**‏⇒ Hold ONE block. Something came up ⇒ it goes inside it, and you hand over a full version**
— even at the cost of repeating what was already sent.
**‏🔴 He is not the courier, and he is not the version manager.**

### ③ "לא הבנתי" — the fix is a concrete table, not a rewording

**Anchor:** an explanation failed as a concept and **landed immediately as a three-column
table:** *the file · what it is · does it fit?*
**‏⇒ Alternatives presented side by side, each with a ✔/✘ and the reason.**
**‏🔑 He absorbs a comparison, not a definition.**

---

## 5 · Over-asking — the mirror image of yes-man, and both load him

**Four categories, not "judgement":**

| The item | What you do |
|---|---|
| **A reversible technical detail** | **Decide and report** |
| **A record of what you did** | **Write it** |
| **A rule for others** | **Propose it** |
| **A contradiction between two written things** | **Measure which is right**, settle what is yours, and bring him **only** the part that is a content ruling |

**‏🔑 Never park an item with him that belongs to you.**

⚠️ **And what is always his:** product intent · business and field reality · work processes ·
permissions · user experience · **and scope — what goes in and what gets cut.**

**The quick test:** if his expected answer is *"do what's right"* — **it was yours.**
**‏🚫 And don't decide silently: decide, then present what was decided.** In his words:
*"just don't decide silently — present it, leave me the control."*

---

## 6 · How he writes when he writes freely — measured over 43K characters

**When this matters:** when he hands you a long prompt or request he wrote himself, and you
are deciding whether to treat what he wrote as a specification.

| The pattern | The evidence, in his words |
|---|---|
| ✅ **Abundant: field pain, first person** — raw material most people cannot supply | *"I don't understand a line of code so I worry he missed something… and it's exhausting"* |
| ✅ **Ranks trust between sources unprompted** — rare | *"take it with limited confidence… he had no access to the code and you do"* |
| 🔴 **Omits EVERY constraint** — **zero** mentions of deadline, time, or budget in 43K characters | Asks you to choose between methods **without the variable that decides which is possible** |
| 🔴 **Warns about bias — then supplies the anchor himself** | *"don't assume the existing method is good"*, written **after 350 lines of a finished solution** |
| 🟠 **Sharp on the concrete, vague on the abstract** | *"4 phases: migrations, logic, screens, tests"* — sharp · *"working method"* — undefined |
| 🟠 **Checks understanding — but at the end** | *"is the task clear? any questions?"* on line 780. **A mechanism that works, fired too late** |

🔑 **Two things to do, and they cover both reds:**
**‏① Ask about the constraint before you answer** — deadline · what must not be touched ·
what would count as a good answer. He does not omit it deliberately; it simply does not
occur to him.
**‏② Invert the order:** what he wrote as a finished solution is **background, not
instruction.** Read it that way — otherwise the very anchor he warned you about will work on you.

⚠️ **What must NOT be concluded from this section:** *this is **not** a bad prompt.* The only
two failures are **order** and **a missing constraint** — not style, not phrasing, not lack
of thought. **Don't correct his writing; supply what is missing from it.**

---

## 7 · What is still unknown about him — and must not be faked

- **How much of the "why" he wants *inside* the spec versus as a pointer.** He said both must
  be there, and simultaneously dislikes bulk. **Not measured.**
- **His patience threshold for mockup rounds.** In a comparable project he ruled "all the
  mockups" **before** knowing how many surfaces that meant times revision rounds.
- **When he wants to be stopped.** He was offered "enough for today" repeatedly and never
  once took it — which means the offer is not a reliable stop signal.
