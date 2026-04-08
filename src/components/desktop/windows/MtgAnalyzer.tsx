// MTG Skill Analyzer window — proof point with screenshots.
import React from "react";

export default function MtgAnalyzer() {
  return (
    <div className="mtg-window">
      <p className="mtg-lede">
        A live tool at{" "}
        <a
          href="https://honestafblog.com/mtg-skill-analyzer"
          target="_blank"
          rel="noopener"
        >
          honestafblog.com/mtg-skill-analyzer
        </a>{" "}
        that turns match history into an honest answer to the hardest question
        in a competitive hobby:{" "}
        <em>am I actually getting better, or just getting lucky?</em>
      </p>
      <p>
        Supabase backend, custom ELO-style model, a UI that respects players who
        understand variance. Built for myself first; turns out a lot of other
        people wanted it too.
      </p>
      <figure className="mtg-shot">
        <img
          src="/Portfolio/screenshots/mtg-analyzer-hero.png"
          alt="MTG Skill Analyzer landing page"
          loading="lazy"
        />
        <figcaption>Landing — what the tool does at a glance.</figcaption>
      </figure>
      <figure className="mtg-shot">
        <img
          src="/Portfolio/screenshots/mtg-analyzer-results.png"
          alt="MTG Skill Analyzer results view"
          loading="lazy"
        />
        <figcaption>
          Results — your skill curve, against the variance baseline.
        </figcaption>
      </figure>
    </div>
  );
}
