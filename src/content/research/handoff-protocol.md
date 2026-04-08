---
title: "Handoff Protocol Between Agents"
category: "agent-teams"
summary: "Most multi-agent failure I've seen comes from sloppy handoff. Here's the four-block contract."
published: "2026-04-04"
readMin: 3
---

Most multi-agent failure I've seen in practice doesn't come from the models being dumb. It comes from the seam between them. Agent A finishes its slice, dumps a wall of prose into the parent, and the parent now has to re-derive what was actually decided versus what was speculation. Multiply that across four hops and the original task is a rumor.

The fix isn't smarter models. It's a contract.

## The four-block handoff

Every agent in my pipeline ends its turn with exactly four blocks:

1. **What I completed** — concrete, verifiable, past tense.
2. **What needs to happen next** — the specific next agent or gate, not "someone should."
3. **Blockers or open questions** — anything the agent punted on, explicitly named.
4. **Review state** — whether Cipher (the reviewer agent) needs to see this before it ships.

No summaries of the conversation. No restating the task back. No "I hope this helps." The parent orchestrator reads four blocks and routes.

> The cost of a structured handoff is maybe sixty tokens. The cost of an unstructured one is the next agent burning half its context window reconstructing state.

## Verification hooks close the loop

Structure alone isn't enough — agents will happily lie in structured format if you let them. The second half of the protocol is a `SubagentStop` hook: a shell script that runs deterministic checks (grep for the file the agent claimed to create, run the test it claimed to write, diff the output against expected) before the agent is allowed to terminate. Fail a check, you don't get to mark yourself done.

This is the part people skip. Verification is boring to build and it feels like distrust, but without it the handoff contract is a suggestion. With it, "done" means something.

## What this doesn't solve

Handoffs don't fix misaligned goals — if Atlas plans the wrong thing, a beautiful handoff ships the wrong thing on time. They don't fix context window pressure on long tasks. And they don't replace a human gate on anything load-bearing.

What they do fix is the single biggest source of wasted work I've measured: the next agent starting from scratch because the last one forgot to tell it what happened.
