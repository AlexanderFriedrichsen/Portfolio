import React from "react";
import llc from "../data/llc.json";
import { CompanyIcon } from "../icons";

export default function HonestAlexFLLC() {
  return (
    <>
      <div className="llc-body">
        <header>
          <div className="logo-mark" aria-hidden="true">
            <CompanyIcon size={56} />
          </div>
          <div>
            <h2>{llc.name}</h2>
            <p className="sub">{llc.tagline}</p>
          </div>
        </header>

        <h3>What it is</h3>
        <p>{llc.what}</p>

        <h3>Services</h3>
        <div className="services">
          {llc.services.map((s) => (
            <div className="svc" key={s.title}>
              <b>{s.title}</b>
              <span>{s.desc}</span>
            </div>
          ))}
        </div>

        <h3>Contact</h3>
        <dl className="contact-grid">
          {llc.contact.map((c) => (
            <React.Fragment key={c.k}>
              <dt>{c.k}</dt>
              <dd>{c.v}</dd>
            </React.Fragment>
          ))}
        </dl>
      </div>
      <div className="status-bar">
        <p className="status-bar-field">{llc.name}</p>
        <p className="status-bar-field">Est. 2025</p>
        <p className="status-bar-field">Status: Open for work</p>
      </div>
    </>
  );
}
