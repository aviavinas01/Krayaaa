import React from 'react';
import { Link } from 'react-router-dom';
import './Legal.css'; // We will create this next

function Terms() {
  return (
    <div className="legal-container">
      <div className="legal-header">
        <h1>TERMS OF SERVICE_</h1>
        <Link to="/" className="back-link">&lt; RETURN TO BASE</Link>
      </div>
      
      <div className="legal-content">
        <p className="last-updated">LAST UPDATED: 2026-01-11</p>
        
        <section>
          <h2>1. ACCEPTANCE OF PROTOCOLS</h2>
          <p>By accessing KRAYAA (the "Platform"), you agree to be bound by these Terms. If you do not agree, disconnect immediately.</p>
        </section>

        <section>
          <h2>2. USER CONDUCT</h2>
          <p>Users are responsible for all activity associated with their account. Do not upload malicious payloads, spam the forums, or attempt to destabilize the "Consensus Nodes".</p>
        </section>

        <section>
          <h2>3. ASSET LIQUIDATION</h2>
          <p>Krayaa is a facilitator for peer-to-peer exchange. We are not responsible if the textbook you bought is missing pages 100-150.</p>
        </section>

        <section>
          <h2>4. LIMITATION OF LIABILITY</h2>
          <p>The Platform is provided "as is". We are not liable for lost data, failed exams, or caffeine overdoses resulting from use of this service.</p>
        </section>
      </div>
    </div>
  );
}

export default Terms;