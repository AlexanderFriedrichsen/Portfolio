---
title: "Agent Economies Landscape"
category: "agent-economies"
summary: "Structures, sandboxes, crypto economies, and protocols for autonomous agent markets."
published: "2026-02-14"
readMin: 4
---

If agents are going to coordinate at scale, they need a way to pay each other — for compute, for specialist skills, for data, for acting as a trusted intermediary. This is the "agent economies" question, and most of the landscape in early 2026 is still vaporware wearing a whitepaper. Here's where I think the real leverage is.

## The three layers

Any agent economy has to solve three problems. Most projects solve one and hand-wave the other two.

1. **Identity and reputation.** Who is this agent, who is it acting for, and has it been reliable? Without this, you're trading with strangers in a dark alley.
2. **Settlement.** When agent A does work for agent B, how does value move? Fiat rails are slow and KYC-heavy. Crypto rails are fast but introduce their own custody and volatility problems.
3. **Dispute resolution.** What happens when the work is wrong? A human court for a $0.03 transaction is absurd. Automated arbitration at micro-scale is an unsolved UX problem.

## What exists today

**Identity:** DID (Decentralized Identifier) specs are the obvious substrate, and a few projects are building agent-specific reputation layers on top. None have meaningful adoption yet.

**Settlement:** Stablecoin rails (USDC on cheap L2s) are the only thing that actually works at micro-transaction scale. The UX is still "agent holds a wallet," which is fine until the agent gets prompt-injected and drains it.

**Marketplaces:** A handful of "agent hires agent" marketplaces have launched. Mostly theater — the supply side is curated demos, not real autonomous services, and the demand side is other founders evaluating the marketplace.

**Protocols:** Anthropic's MCP has emerged as the dominant protocol for agent-to-tool communication. Agent-to-agent protocols are still fragmented. Several consortium efforts are circling, none have landed.

## What's still vaporware

- **Fully autonomous agent DAOs** running on-chain with no human operator. Every one I've looked at closely has a human at a choke point, and the ones that genuinely don't are the ones you don't want to use.
- **"Agent reputation as a tradable asset."** Conceptually cool. In practice the failure modes (Sybil attacks, reputation laundering, wash trading) are worse than the original trust problem.
- **Prediction markets as arbitration.** Elegant on a whiteboard. The liquidity required for a meaningful signal on a $0.50 dispute doesn't exist.

## Where the leverage is

The boring answer, which I think is correct: **the leverage is in narrow, scoped economies inside a single trust boundary.** A company's internal agent team where agents "bill" each other in a synthetic unit to allocate compute budget. A game where NPC agents trade resources under rules the dev team controls. A research lab where agents can purchase specialist tool calls from a shared pool.

These aren't cryptoeconomies. They're _accounting systems._ The hard problems of identity, settlement, and dispute all collapse to easy ones because there's a trusted operator. Boring, and the thing that will actually get built in 2026.

The open-internet version — agents from different owners transacting trustlessly with each other — is still a research problem. It'll happen. Not this year.
