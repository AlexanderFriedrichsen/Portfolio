import React from "react";
import agents from "../data/agents.json";

export default function AgentTeam() {
  return (
    <>
      <div className="crumb">My Computer › HonestAlexF LLC › Agent Team</div>
      <div className="agent-grid">
        {agents.map((a) => (
          <div className="agent-card" key={a.id}>
            <h4>{a.name}</h4>
            <span className="role">{a.role}</span>
            <p>{a.desc}</p>
          </div>
        ))}
      </div>
      <div className="status-bar">
        <p className="status-bar-field">{agents.length} items</p>
        <p className="status-bar-field">All systems green</p>
        <p className="status-bar-field">Last sync 3:14 PM</p>
      </div>
    </>
  );
}
