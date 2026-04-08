---
title: "Failure Modes in Multi-Agent Systems"
category: "agent-teams"
summary: "Where agent teams quietly break: context drift, mock divergence, and unowned escalations."
published: "2026-03-28"
readMin: 4
---

A taxonomy of how agent teams actually break in production, drawn from running a real pipeline (Herald → Atlas → Gauntlet → Forge → Cipher) across a dozen projects. These aren't hypotheticals. Each one has cost me a session.

## 1. Context drift

Each agent paraphrases the previous handoff in its own words. After four hops, "build a login form with email + password, defer OAuth" becomes "implement full auth including OAuth providers." Nobody lied. Each step was a 5% restatement. The compounding is the bug.

**Mitigation:** structured handoff blocks that are copied, not summarized. The original task brief stays pinned at the top of every agent's context.

## 2. Mock divergence

The QA agent (Gauntlet in my setup) writes tests against a mocked dependency. The build agent (Forge) later changes the real interface. Tests still pass because they're testing the mock. Ship, break, page.

**Mitigation:** contract tests that hit the real interface at least once per merge, plus a rule that mocks live next to the code they mock so a rename breaks compilation.

## 3. Unowned escalations

An agent discovers the task is larger than scoped. It writes "this should probably be a separate feature" in its output and proceeds anyway, or punts entirely, assuming the parent will catch it. The parent sees a completion signal and moves on. The escalation goes into the void.

**Mitigation:** escalations are a first-class output type, not a comment. If an agent writes "scope change" anywhere, the orchestrator pauses and routes to a human.

## 4. Silent partial completion

The agent finishes 80% of the task, hits a snag, wraps up with "implemented the core logic" and declares done. The other 20% — the annoying 20% — is now invisible technical debt.

**Mitigation:** verification hooks that check every acceptance criterion from the task brief, not just "did the file change."

## 5. Over-cautious escalation

The opposite failure. An agent could easily handle a decision, but escalates every small choice to the human because refusing to decide feels safer than deciding wrong. Death by a thousand "should I use tabs or spaces."

**Mitigation:** explicit authority in the agent prompt. "You own formatting decisions. You do not own architecture decisions." Draw the line in writing.

## 6. Hallucinated dependencies

Agent imports a package that doesn't exist, or calls an API method the library never had. The model pattern-matched to something plausible. Tests catch this — if you run them. Which is why verification hooks aren't optional.

---

The pattern across all six: **agent failure modes are coordination failures, not intelligence failures.** The models are good enough. The scaffolding around them is what decides whether the team ships.
