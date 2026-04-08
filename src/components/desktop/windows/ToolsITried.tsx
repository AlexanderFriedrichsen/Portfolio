import React from "react";
import tools from "../data/tools.json";

function stars(n: number) {
  return "★★★★★☆☆☆☆☆".slice(5 - n, 10 - n);
}

export default function ToolsITried() {
  return (
    <>
      <div className="crumb">
        My Computer › About Me › Tools I've Tried · sorted by Verdict
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
  );
}
