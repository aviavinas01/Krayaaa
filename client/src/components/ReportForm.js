import React, { useState } from 'react';
import axios from 'axios';
import { auth } from '../firebaseconfig';
import './ReportForm.css';

function ReportForm({ targetType, targetRef, onClose }) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const submitReport = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const token = await auth.currentUser.getIdToken();

      await axios.post(
        'https://krayaaa.onrender.com/reports',
        {
          targetType,
          targetRef,
          reason,
          description,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onClose();
      alert('Report submitted. Thank you for helping keep the community safe.');
    } catch (err) {
      setError('Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="report-form" onSubmit={submitReport}>
      <h3>Report Profile</h3>

      <label>Reason</label>
      <select value={reason} onChange={(e) => setReason(e.target.value)} required>
        <option value="">Select reason</option>
        <option value="SPAM">Spam</option>
        <option value="HARASSMENT">Harassment</option>
        <option value="HATE_SPEECH">Hate speech</option>
        <option value="IMPERSONATION">Impersonation</option>
        <option value="SCAM">Scam</option>
        <option value="INAPPROPRIATE_CONTENT">Inappropriate content</option>
        <option value="OTHER">Other</option>
      </select>

      <label>Description (optional)</label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={4}
        placeholder="Provide additional context"
      />

      {error && <p className="error">{error}</p>}

      <div className="report-actions">
        <button type="submit" disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit Report'}
        </button>
        <button type="button" onClick={onClose} className="cancel">
          Cancel
        </button>
      </div>
    </form>
  );
}

export default ReportForm;
