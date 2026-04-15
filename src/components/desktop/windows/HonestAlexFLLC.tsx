import React from "react";
import llc from "../data/llc.json";
import { CompanyIcon } from "../icons";

// 2026-04-14 shrink: the old LLC window had multi-section services +
// contact copy that overstated what the company actually is today.
// Until there's something real to share, it's a minimal placeholder
// that acknowledges the entity without overselling it.
export default function HonestAlexFLLC() {
  return (
    <>
      <div
        style={{
          padding: "18px",
          display: "flex",
          alignItems: "center",
          gap: "14px",
          fontSize: "12px",
          lineHeight: 1.5,
          color: "#1f2a3a",
        }}
      >
        <div aria-hidden="true" style={{ flex: "0 0 auto" }}>
          <CompanyIcon size={48} />
        </div>
        <div>
          <h2 style={{ margin: "0 0 4px", fontSize: "14px" }}>{llc.name}</h2>
          <p style={{ margin: 0 }}>{llc.body}</p>
        </div>
      </div>
      <div className="status-bar">
        <p className="status-bar-field">{llc.name}</p>
        <p className="status-bar-field">Est. 2025</p>
      </div>
    </>
  );
}
