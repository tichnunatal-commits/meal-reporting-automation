# Five failure modes — how a project like this actually fails

Measured across real sessions in two comparable arenas. Twelve symptoms collapsed into five
causes. **Every failure recorded there was one of these wearing a costume** — which is why
patching symptoms one at a time never reduced the rate.

**Read this at every close, and any time you are about to claim that a check ran.**

---

## 🅰️ No layer can audit the layer above it

The product manager cannot read code · the session that writes it is the same one that
reviews it · **nobody comes after.**

**‏🔴 This project is the extreme case:** there is no QA team, no code review, and no real
users to catch a wrong number. The monthly amount this system produces goes to a **payment**.

**Counter — not more trust, but outputs shaped so a SKIP IS VISIBLE:**
**one line per check performed, including an explicit `אין הערות`.**
**A missing line is the only audit available to someone who cannot read the work itself.**

---

## 🅱️ Intent degrades at every handoff, and only the last link is measured

Tests compare code to spec. **Nothing compares the spec to what he meant.**
*(Anchor from a comparable project: a save-versus-send gap was not a bug — it was the
architecture working exactly as designed. It was found only by sending a real email.)*

**Counter: close both ends** — an **understanding-declaration before building** (a concrete
scenario in his world, with a real name, a clock time and a real number, explicitly invited
for correction), **and a real user walk before "done".**

---

## 🅲 A mechanism that fires when "someone notices" never fires

And whoever should notice is precisely the one whose attention is already on the next thing.
*(Four consecutive shifts in a comparable project had the same headline: the mechanism
existed; nobody ran it.)*

**Counter: hang the trigger on an artifact** — a required output shape · a file that must be
written · an outside reader. **Never on memory.**

**‏🔑 The concrete instance in this project:** every rule in the skills that produces **no
output line** is a rule nobody can tell was skipped. If a pass has no trace, a session that
ran it and a session that skipped it produce **identical output** — and the product manager
cannot read code to tell them apart.

---

## 🅳 The system slows down as it learns

Every lesson becomes text, and text is read every session. **Nothing here removes anything.**

**Counter: subtraction is a job, not a side effect.**
**Before adding: what does this make unnecessary?**
**A mistake earns a rule only on its second or third occurrence; the first lives as a dated note.**
*(This is what `docs/harvest.md` line ② exists to enforce — name the section that did not
fire, so it can be removed.)*

---

## 🅴 The instruments lie, and nothing checks the instruments

Five occurrences in one shift elsewhere: a growth metric measured **before** the data it
measures was written · a velocity formula that counted inherited history (24 instead of 8) ·
"zero of six exist" that was a measurement of one file · a claim about a module made without
opening its guide.

**Counter: before quoting a measurement, state in one line what it measures and what would
make it wrong.**
**And an absence-claim is only as wide as the set of places searched** — name the places
first, and **search the way the SOURCE writes it**, not the way you remember writing it.

---

# Six self-review questions — the ones that measurably found something

**Run them against a real, named event. An answer with no anchor is a vibe — and a vibe here
is worse than skipping the question, because it manufactures the feeling that the check ran.**

**`אין` is a complete answer where it is true.**

1. **Who caught the mistakes — me, or someone else?**
   *(Measured across five shifts in two arenas: the self-catch count was **0 every time**.
   Treat 0 as the expected answer, and as proof that an outside reader is not optional.
   If you report catching your own, say exactly how — it would be the first time.)*
2. **What is the general shape of these misses — how many are really the same one?**
   *(This question produced the five modes above; it collapsed ~12 symptoms into 5.
   Run it **before** writing the deferred-items section — it changes what gets registered.)*
3. **Which of my actions got no check at all this round?**
   Not "what did I find" — **what did I never look at.** Recorded misses are only the caught ones.
4. **Where did I look for confirmation instead of refutation?**
   Including: did I verify the way the *reporter* searched, or the way the **source** writes it?
5. **Did I hand a checker the expected answer?**
   An expected number bends a count toward confirmation instead of measurement.
6. **How many rules were born this round versus how many incidents?**
   A ratio near 1:1 is a patch factory. For each new rule, the inverse test:
   **would it have been HARMFUL in some earlier round?**
