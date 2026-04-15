import React, { useMemo, useState } from "react";
import index from "../data/research-index.json";
import tools from "../data/tools.json";
import { FolderSmall, FileSmall, FileLockedSmall } from "../icons";

// Discriminated union: published entries have date + readMin, stubs do not.
// JSON's inferred type collapses these into "all optional" which loses the
// narrowing in the preview pane below. Declare explicitly so TS enforces the
// shape we actually wrote in research-index.json.
type PublishedEntry = {
  status: "published";
  slug: string;
  category: string;
  title: string;
  summary: string;
  published: string;
  readMin: number;
};
type StubEntry = {
  status: "stub";
  slug: string;
  category: string;
  title: string;
  summary: string;
};
type Entry = PublishedEntry | StubEntry;
const entries = index as Entry[];

type SectionId = "research" | "tools";

function stars(n: number) {
  return "★★★★★☆☆☆☆☆".slice(5 - n, 10 - n);
}

// 2026-04-14: Tools-I've-Tried was a standalone desktop icon / window;
// CEO review folded it into Research Vault so the desktop isn't cluttered
// with a second content vault. Implementation: a section toggle that swaps
// between the tree/preview explorer (research) and the tools table.
// 2026-04-15: Vault expanded from 4 to 40 entries (8 categories) as a
// curated crash course. Most are stubs — visible in the tree, summary in
// the preview, no published markdown. Stubs render a locked-state preview
// (no "Open full article" link) and a distinct leaf icon so the user can
// scan the rail and instantly see what's actually readable.
// Group flat index by category. Plain <nav> + grouped lists per Cipher punch list #4
// (the "honest" downgrade from full tree ARIA — every leaf is a real <button>).
export default function ResearchVault() {
  const [section, setSection] = useState<SectionId>("research");
  const grouped = useMemo(() => {
    const out: Record<string, Entry[]> = {};
    for (const e of entries) {
      (out[e.category] ||= []).push(e);
    }
    return out;
  }, []);
  const publishedCount = useMemo(
    () => entries.filter((e) => e.status === "published").length,
    [],
  );
  const stubCount = useMemo(
    () => entries.filter((e) => e.status === "stub").length,
    [],
  );
  // D5: guard empty-index crash — null-safe initial state + conditional preview.
  const [selected, setSelected] = useState<Entry | null>(entries[0] ?? null);

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
                {selected.status === "stub" && " (local only)"}
              </>
            )}
          </div>
          <div className="explorer">
            <nav className="tree" aria-label="Research files">
              {Object.entries(grouped).map(([cat, items]) => (
                <div key={cat} className="tree-group">
                  <div className="tree-group-label">
                    <FolderSmall />
                    {cat}
                  </div>
                  <ul>
                    {items.map((e) => {
                      const isSel = selected?.slug === e.slug;
                      const isStub = e.status === "stub";
                      const cls =
                        "tree-item" +
                        (isSel ? " selected" : "") +
                        (isStub ? " tree-item--stub" : "");
                      return (
                        <li key={e.slug}>
                          <button
                            type="button"
                            className={cls}
                            onClick={() => setSelected(e)}
                            aria-label={
                              isStub
                                ? `${e.slug}.md, not yet published`
                                : undefined
                            }
                          >
                            {isStub ? <FileLockedSmall /> : <FileSmall />}
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
                    research/{selected.category}
                    {selected.status === "published" && (
                      <>
                        {" "}
                        · published {selected.published} · {selected.readMin}{" "}
                        min read
                      </>
                    )}
                    {selected.status === "stub" && <> · locked</>}
                  </div>
                  <p>{selected.summary}</p>
                  {selected.status === "published" ? (
                    <p>
                      <a
                        className="preview-open"
                        href={`${import.meta.env.BASE_URL}research/${selected.slug}`}
                        target="_blank"
                        rel="noopener"
                      >
                        Open full article →
                      </a>
                    </p>
                  ) : (
                    <aside
                      className="preview-locked"
                      role="note"
                      aria-label="Locked entry"
                    >
                      <strong>Local only.</strong>
                      <p>
                        This is a note in my working vault that hasn't been
                        polished for publication. Summary above is accurate; the
                        full piece will ship here when it's ready.
                      </p>
                    </aside>
                  )}
                </>
              ) : (
                <p className="empty">No research entries yet.</p>
              )}
            </article>
          </div>
          <div className="status-bar">
            <p className="status-bar-field">
              {publishedCount} published · {stubCount} stubs
            </p>
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
