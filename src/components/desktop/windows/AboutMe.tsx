import React, { useState, useId } from "react";
import about from "../data/about.json";

const TABS = [
  { id: "general", label: "General" },
  { id: "philosophy", label: "Philosophy" },
  { id: "background", label: "Background" },
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

      {/* General panel */}
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

      {/* Philosophy panel — folded in from index.astro Movement I */}
      <div
        role="tabpanel"
        id={panelId("philosophy")}
        aria-labelledby={tabId("philosophy")}
        hidden={tab !== "philosophy"}
        className="about-simple"
      >
        <h2 className="philosophy-triptych">
          <span>Grow with friends.</span>
          <span>Find joy in hard problems.</span>
          <span>Build things that help people.</span>
        </h2>
        {(about as { philosophy?: string[] }).philosophy?.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      {/* Background panel */}
      <div
        role="tabpanel"
        id={panelId("background")}
        aria-labelledby={tabId("background")}
        hidden={tab !== "background"}
        className="about-simple"
      >
        {about.background.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      {/* Contact panel */}
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
