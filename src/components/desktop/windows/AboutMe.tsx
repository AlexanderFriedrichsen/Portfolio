import React, { useState, useId } from "react";
import about from "../data/about.json";

// 2026-04-14 rewrite: replaced Philosophy + Background tabs with
// "Why this site" + "Off the keyboard" per CEO brief. Data-driven — all
// copy lives in ../data/about.json.
const TABS = [
  { id: "general", label: "About" },
  { id: "why-site", label: "Why this site" },
  { id: "off-keyboard", label: "Off the keyboard" },
  { id: "contact", label: "Contact" },
] as const;
type TabId = (typeof TABS)[number]["id"];

export default function AboutMe({
  initialTab = "general",
}: { initialTab?: TabId } = {}) {
  const [tab, setTab] = useState<TabId>(initialTab);
  const baseId = useId();
  const tabId = (id: string) => `${baseId}-tab-${id}`;
  const panelId = (id: string) => `${baseId}-panel-${id}`;

  return (
    <>
      <menu role="tablist" aria-label="About sections" style={{ margin: 0 }}>
        {TABS.map((t) => (
          <li key={t.id}>
            <button
              type="button"
              role="tab"
              id={tabId(t.id)}
              aria-selected={tab === t.id}
              aria-controls={panelId(t.id)}
              tabIndex={tab === t.id ? 0 : -1}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          </li>
        ))}
      </menu>

      {/* About panel — photo + general prose + facts. */}
      <div
        role="tabpanel"
        id={panelId("general")}
        aria-labelledby={tabId("general")}
        hidden={tab !== "general"}
        className="about"
      >
        <div className="photo-frame">
          <img src={about.photo} alt={`Portrait of ${about.name}`} />
        </div>
        <div className="about-body">
          <h2>{about.name}</h2>
          <p className="tagline">{about.tagline}</p>
          {about.general.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <dl className="quick-facts">
            {about.facts.map((f, i) => (
              <div key={i}>
                <dt>{f.k}</dt>
                <dd>{f.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Why this site — the XP-desktop framing. */}
      <div
        role="tabpanel"
        id={panelId("why-site")}
        aria-labelledby={tabId("why-site")}
        hidden={tab !== "why-site"}
        className="about-simple"
      >
        {about.why_this_site.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      {/* Off the keyboard — the "not just a resume" context. */}
      <div
        role="tabpanel"
        id={panelId("off-keyboard")}
        aria-labelledby={tabId("off-keyboard")}
        hidden={tab !== "off-keyboard"}
        className="about-simple"
      >
        {about.off_keyboard.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      {/* Contact — links + facts as a last resort for hiring managers. */}
      <div
        role="tabpanel"
        id={panelId("contact")}
        aria-labelledby={tabId("contact")}
        hidden={tab !== "contact"}
        className="about-simple"
      >
        {about.contact.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      <div className="status-bar">
        <p className="status-bar-field">Type: Person</p>
        <p className="status-bar-field">Status: Available</p>
      </div>
    </>
  );
}
