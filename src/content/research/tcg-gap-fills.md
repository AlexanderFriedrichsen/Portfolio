---
title: "TCG Gap Fills & Adjacent Opportunities"
category: "high-ev-competitions"
summary: "High-EV competitions where the supply side is thin and the prize pool is real."
published: "2026-03-20"
readMin: 4
---

I've played Magic competitively for long enough to notice that the tooling around trading card games is mostly built by hobbyists for hobbyists. That's not an insult — it means the ceiling is low, not because the problem is easy, but because nobody with real modeling chops has bothered. Where a small studio with domain expertise plus actual ML can produce value:

## 1. Metagame analysis that isn't a spreadsheet

Current tools: aggregated win rates by archetype, pulled from tournament results. Useful, shallow.

What's missing: **conditional metagame.** What's a deck's win rate _given_ the expected field at a specific event, weighted by tournament level and recency? What does the matrix look like when you remove the top-three decks because a ban just happened? The math isn't hard — eigenvector-style archetype weighting, Bayesian updating on sparse recent data — it just isn't being done. Players make these calls by feel and get it wrong.

## 2. Deck winrate simulation with honest confidence intervals

Current tools: "goldfish" simulators that play the deck against nothing, reporting turn-X kill percentages. Pretty animations, no signal.

What's missing: Monte Carlo simulation against a _distribution_ of realistic opposing decks, with **confidence intervals that acknowledge sample size**. Most sim tools report point estimates like "62% win rate" off 1,000 iterations, which is roughly `±3%` at best and nobody says so. A tool that reports "62% ±3%, and here are the three matchups driving the variance" would be immediately more useful than anything currently on the market.

## 3. Nash-equilibrium-aware sideboarding

Current tools: sideboard guides as static lists ("-2 X, +2 Y vs archetype Z").

What's missing: sideboarding is a game-theory problem. Your opponent's sideboard plan is a function of what they expect you to do, which is a function of what you expect them to expect. There's a small literature on Nash equilibria in imperfect-information games that maps onto this cleanly, and zero consumer tools that use it. The hard part isn't the math — it's getting data on opposing sideboard plans. That's a data collection problem with an obvious crowdsourced answer.

## 4. Draft signal analysis

Current tools: pick-order ratings, average pick position, tier lists.

What's missing: **signal strength models.** In draft, the information value of a pick depends on what's _missing_ from the pack, not just what's in it. A late-pack card that "should" have gone earlier is a signal about what colors are open upstream. Quantifying that properly — as a likelihood ratio on seat-relative color openness — would beat every pick-order tier list on the market.

## Why these haven't been built

Each of these requires two things in the same person: deep game knowledge and real statistical chops. The Venn overlap is small, and the people in it mostly have day jobs that pay better. That's the opportunity. Prize pools in MTG alone are north of a million annually; a tool that measurably improves a competitive player's edge has real willingness to pay.

My [MTG Skill Analyzer](https://honestafblog.com/mtgmetaanalyzer) is the first swing at the simulation + confidence interval piece. The rest of the list is the roadmap.
