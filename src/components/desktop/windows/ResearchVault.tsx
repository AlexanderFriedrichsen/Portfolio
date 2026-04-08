import React, { useMemo, useState } from "react";
import index from "../data/research-index.json";
import { FolderSmall, FileSmall } from "../icons";

type Entry = (typeof index)[number];

// Group flat index by category. Plain <nav> + grouped lists per Cipher punch list #4
// (the "honest" downgrade from full tree ARIA — every leaf is a real <button>).
export default function ResearchVault() {
  const grouped = useMemo(() => {
    const out: Record<string, Entry[]> = {};
    for (const e of index) {
      (out[e.category] ||= []).push(e);
    }
    return out;
  }, []);
  const [selected, setSelected] = useState<Entry>(index[0]);

  return (
    <>
      <div className="crumb">
        My Computer › Research Vault › {selected.category} › {selected.slug}.md
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
                  const isSel = e.slug === selected.slug;
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
          <h2>{selected.title}</h2>
          <div className="meta">
            research/{selected.category} · updated {selected.updated} ·{" "}
            {selected.readMin} min read
          </div>
          <p>{selected.summary}</p>
          <p>
            Full content lives in{" "}
            <code>src/content/research/{selected.slug}.md</code>. Quill drafts
            the long-form copy in D3; this D2 stub renders the index summary so
            the window shape and selection flow are real.
          </p>
        </article>
      </div>
      <div className="status-bar">
        <p className="status-bar-field">{index.length} items</p>
        <p className="status-bar-field">1 selected</p>
        <p className="status-bar-field">12 KB</p>
      </div>
    </>
  );
}
