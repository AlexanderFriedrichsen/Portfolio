---
title: "Failure Modes in Multi-Agent Systems"
category: "agent-teams"
summary: "Where agent teams quietly break: context drift, mock divergence, and unowned escalations."
published: "2026-03-28"
readMin: 8
---

Three failure modes I keep hitting:

1. **Context drift** — each agent re-summarizes the previous handoff in its own words, and over four hops the original intent is unrecognizable.
2. **Mock divergence** — the QA agent mocks a dependency that the build agent later changes, and nobody notices until prod.
3. **Unowned escalations** — an agent surfaces a scope question, no agent owns the answer, the parent assumes the child handled it.

_(Placeholder content for D2. Quill replaces in D3.)_
