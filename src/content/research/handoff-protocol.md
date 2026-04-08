---
title: "Handoff Protocol Between Agents"
category: "agent-teams"
summary: "Most multi-agent failure I've seen comes from sloppy handoff. Here's the four-block contract."
published: "2026-04-04"
readMin: 6
---

Most multi-agent failure I've seen comes from sloppy handoff. The agent finishes its slice, dumps a wall of text into the parent, and the parent has to re-read everything to figure out what was actually decided.

The protocol I landed on: every agent ends with four blocks — what was completed, what needs to happen next, blockers, and whether Cipher review is required. No exceptions.

> The cost of a structured handoff is one minute of agent time. The cost of an unstructured one is the entire next session re-deriving context.

Pairing this with deterministic verification hooks (a SubagentStop script that runs grep/test commands) means an agent literally cannot mark itself done if its output doesn't pass the contract.

_(Placeholder content authored for D2 stub. Quill replaces with real long-form copy in D3.)_
