import React, { useMemo, useState } from "react";
import index from "../data/research-index.json";
import tools from "../data/tools.json";
import { FolderSmall, FileSmall } from "../icons";

type Entry = (typeof index)[number];
type SectionId = "research" | "tools";

function stars(n: number) {
  return "★★★★★☆☆☆☆☆".slice(5 - n, 10 - n);
}

// 2026-04-14: Tools-I've-Tried was a standalone desktop icon / window;
// CEO review folded it into Research Vault so the desktop isn't cluttered
// with a second content vault. Implementation: a section toggle that swaps
// between the tree/preview explorer (research) and the tools table.
// Group flat index by category. Plain <nav> + grouped lists per Cipher punch list #4
// (the "honest" downgrade from full tree ARIA — every leaf is a real <button>).
export default function ResearchVault() {
  const [section, setSection] = useState<SectionId>("research");
  const grouped = useMemo(() => {
    const out: Record<string, Entry[]> = {};
    for (const e of index) {
      (out[e.category] ||= []).push(e);
    }
    return out;
  }, []);
  // D5: guard empty-index crash — null-safe initial state + conditional preview.
  const [selected, setSelected] = useState<Entry | null>(index[0] ?? null);

  return (
    <>
      {/* Section toggle: Research ↔ Tools. XP-native tab strip via xp.css. */}
      <menu role="tablist" aria-label="Vault sections" style={{ margin: 0 }}>
        <li>
          <button
            type="button"
            role="tab"
            aria-selected={section === "research"}
            tabIndex={section === "research" ? 0 : -1}
            onClick={() => setSection("research")}
          >
            Research
          </button>
        </li>
        <li>
          <button
            type="button"
            role="tab"
            aria-selected={section === "tools"}
            tabIndex={section === "tools" ? 0 : -1}
            onClick={() => setSection("tools")}
          >
            Tools I've Tried
          </button>
        </li>
      </menu>

      {section === "research" && (
        <>
          <div className="crumb">
            My Computer › Research Vault
            {selected && (
              <>
                {" "}
                › {selected.category} › {selected.slug}.md
              </>
            )}
          </div>
          <div className="explorer">
            <nav className="tree" aria-label="Research files">
              {Object.entries(grouped).map(([cat, entries]) => (
                <div key={cat} className="tree-group">
                  <div className="tree-group-label">
                    <FolderSmall />
                    {cat}
                  </div>
                  <ul>
                    {entries.map((e) => {
                      const isSel = selected?.slug === e.slug;
                      return (
                        <li key={e.slug}>
                          <button
                            type="button"
                            className={"tree-item" + (isSel ? " selected" : "")}
                            onClick={() => setSelected(e)}
                          >
                            <FileSmall />
                            {e.slug}.md
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
            <article className="preview">
              {selected ? (
                <>
                  <h2>{selected.title}</h2>
                  <div className="meta">
                    research/{selected.category} · published{" "}
                    {selected.published} · {selected.readMin} min read
                  </div>
                  <p>{selected.summary}</p>
                  <p>
                    Full content lives in{" "}
                    <code>src/content/research/{selected.slug}.md</code>.
                  </p>
                </>
              ) : (
                <p className="empty">No research entries yet.</p>
              )}
            </article>
          </div>
          <div className="status-bar">
            <p className="status-bar-field">{index.length} items</p>
            <p className="status-bar-field">
              {selected ? "1 selected" : "0 selected"}
            </p>
            <p className="status-bar-field">12 KB</p>
          </div>
        </>
      )}

      {section === "tools" && (
        <>
          <div className="crumb">
            My Computer › Research Vault › Tools I've Tried · sorted by Verdict
          </div>
          <table className="tools">
            <thead>
              <tr>
                <th style={{ width: 140 }}>Tool</th>
                <th style={{ width: 80 }}>Category</th>
                <th style={{ width: 90 }}>Verdict</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {tools.map((t) => (
                <tr key={t.tool}>
                  <td>
                    <b>{t.tool}</b>
                  </td>
                  <td>
                    <span className="cat">{t.category}</span>
                  </td>
                  <td className="rating" aria-label={`${t.rating} out of 5`}>
                    {stars(t.rating)}
                  </td>
                  <td>{t.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="status-bar">
            <p className="status-bar-field">{tools.length} items</p>
            <p className="status-bar-field">Sorted: Verdict ↓</p>
          </div>
        </>
      )}
    </>
  );
}
