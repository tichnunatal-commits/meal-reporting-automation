# police-spec-screens — the full procedure

---

## §1 · The session budget — this is a rule, not advice

🔴 **The problem is never the length of the instructions. It is the amount of work in one session.**
**One surface consumes a large share of a context window.**

⇒ **2–3 surfaces per session. Not eight.**
⇒ **Stop at a clean card boundary — never mid-surface and never at a stage transition.**
⇒ **Write to disk after every approved surface**, not at the end of the stage.
⇒ **Rotate to a fresh session before 60% of the window.** 🚫 Not a compact — a compact
**does not filter errors, it reproduces them faithfully.**

**At the end of every round, one line:**
> *"סגרנו N מ-M · הבא בתור: X · 'מספיק להיום' לגיטימי · ומה שעדיין פתוח: …"*

⚠️ **The last clause is not decoration.** *(Measured elsewhere: three separate times the
product manager had to ask "did I answer everything?" — **that check must not be on him.**)*

---

## §2 · Per surface — draw, then card, then stop

**Order: mockup → the nine sections → 🛑 approval → write to disk → next surface.**

### The nine sections — and only these

| # | The section | Why a picture is not enough |
|:-:|---|---|
| **1** | 🔴 **Click map** — what is clickable · what it does · where it leads. **A table, one row per interactive element** | **A button, a link and bold text look alike — and the difference between "acts" and "navigates" is a product decision** |
| **2** | **The one decision this screen serves, and who makes it** ⇒ anything not serving it gets justified or removed | A picture shows **what is there**, not **what for**. This is the only answer that beats *"isn't this too much information?"* |
| **3** | **A source for every number** — named column · explicit computation · **and the time window** | A picture shows `47`, not *"ארוחות מחוץ לשעון בחודש הנוכחי, מ-`X`, לפני כלל R2"*. 🔴 **A number with no home is a blocking finding** |
| **4** | **States that are not on the screen** — loading · **truly-empty versus empty-after-filter** · error · blocked action · success | **A mockup draws the successful state only** |
| **5** | **Permissions** — who sees · who edits · **and what disappears for whom** | Cannot be drawn |
| **6** | **Definitions behind a word on screen** — *"מאושר = אושר ע"י רמת"ל, טרם ע"י מדור מזון"* | **A word on screen does not reveal the rule behind it — and the build stage will build the rule** |
| **7** | **Validations, per field** — what must be valid · what happens when it is not · **and the exact text shown** | A missing validation surfaces at module close, expensively |
| **8** | **Every detail whose only source is the mockup, or that the spec is silent on** — marked *"מהמוקאפ / אפיון-שותק — לאישורך"* | Mockups are limited-liability reference: **not reproduced blindly, and not dropped silently** |
| **9** | 🔴 **Conditional — only if this surface writes to the database without a normal login or role:** a dedicated security section — who writes · to which rows · to which fields · under what conditions | **This project's entire risk is external suppliers reaching in.** Such a surface is usually the one path that escapes the normal permission model, and it has no home in the other eight sections |

⚠️ **`אפיון-שותק` is a claim you must earn, scoped by the kind of detail, and stated:**
a **screen** detail ⇒ that surface's card + the mockup · a **process or timing** detail ⇒
`processes-approved.md` · a **number or formula** ⇒ `rules-approved.md`.
**Then write which sources you actually checked, beside the flag.**
**Unverified silence is a gap you did not look for, wearing the label of one you did.**

**🛑 STOP per surface.**

---

## §3 · Four checks per surface — each one has caught real findings

Run all four **in the same turn as the card**, and output a findings table:

1. **Every column name in the card** against `docs/data-requirements.md` — exists? spelled the
   same? on the right entity?
2. **Every label** against the mockup, **word for word**
3. **Every displayed number** has a named column or an explicit computation *(section 3)*
4. **Every clickable element in the mockup** — including navigation, tabs and filters, not
   only action buttons — appears in the click map *(section 1)*

**Report the findings. 🚫 Fix only with approval — never silently.**
*(Measured elsewhere: a round run over four surfaces at once found 5 findings that the
original per-surface approval had missed. **Running it per surface catches them cheaper.**)*

---

## §4 · 🗄️ And at the end of every surface, before the next one

**One question: "מה המשטח הזה דורש מהמסד שעדיין לא רשום?"**
→ `docs/data-requirements.md`, **same turn**.

🔴 **If the mechanism is reachable without login, or by an external supplier — read
`data-requirements.md` IN FULL, not a targeted grep, and look for a precedent of the same risk
shape before writing the line.** *(In a comparable project this exact mechanism found that a
new public function needed rate limiting — because an exact precedent sat a few lines above in
the same file. A targeted grep at the insertion point would not have revealed it.)*

🚫 **You do not write to a database and you do not write a migration.**
⚠️ **And do not write "נרשם" without grepping that it is there.**

---

## §5 · Where files go

- **Card:** `docs/spec/screens-approved.md` — **and the tracking table at the top of that file
  is updated in the same turn** (⬜→🔶/✅ + mockup pointer). **This is not a separate action;
  it is part of "the surface was approved."**
- **Mockup:** draft in `docs/mockups/<topic>/` · **approved in `docs/mockups/<topic>/approved/`**,
  named `NN_<name>_approved.html`.
- 🔄 **This stage may correct `processes-approved.md`** when a screen exposes a process error —
  **in a dated line, out loud, never silently.** Without this rule you get either a frozen
  wrong document or an invisible correction.

---

## §6 · 🛑 Stage gate — fresh-context reviewer

**After the last surface, and only with approval to dispatch.** It receives
`screens-approved.md` + the approved mockups + `processes-approved.md` — without the conversation.

> **‏① אילו טענות כאן חסרות מקור — אמת כל אחת בעצמך.**
> **‏② מה חסר כאן שהבנייה תצטרך?**

---

## §7 · Stop-and-ask triggers

Stop if you are about to: draw a mockup without an approved process behind it · display a
number with no rule · describe layout/colour/order in a card · change demo data instead of
marking it · publish or upload a mockup · or approve a surface without its four checks.

**Close every message with the open-items line. Nothing open ⇒ `אין פתוח`.**
