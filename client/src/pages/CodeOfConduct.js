import React from 'react';
import { Link } from 'react-router-dom';
import './Legal.css';

function CodeOfConduct() {
  return (
    <div className="legal-container">
      <div className="legal-header">
        <h1>CODE OF CONDUCT_</h1>
        <Link to="/" className="back-link">&lt; RETURN TO BASE</Link>
      </div>
      
      <div className="legal-content">
        <p className="last-updated">STATUS: MANDATORY COMPLIANCE</p>
        
        <section>
          <h2>1. BE EXCELLENT TO EACH OTHER</h2>
          <p>We are all students struggling against the system. Harassment, hate speech, and toxicity will result in an immediate permanent ban (IP Level).</p>
        </section>

        <section>
          <h2>2. NO SNITCHING</h2>
          <p>What happens on Krayaa stays on Krayaa. Do not share private forum discussions with faculty or administration.</p>
        </section>

        <section>
          <h2>3. ACADEMIC INTEGRITY (SORT OF)</h2>
          <p>Share notes, share resources, and share knowledge. Do not share direct answers to active exams. We operate in the gray area, not the black market.</p>
        </section>

        <section>
            <h2>4. ENFORCEMENT</h2>
            <p>Moderators have the final say. Appeals can be submitted to the /dev/null endpoint.</p>
        </section>
      </div>
    </div>
  );
}

export default CodeOfConduct;