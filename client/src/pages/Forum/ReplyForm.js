import React, { useState } from 'react';
import './ReplyForm.css'; // Import the specific CSS

function ReplyForm({ onSubmit, autoFocus = false }) {
  const [content, setContent] = useState('');

  return (
    <form
      className="krayaa-reply-form"
      onSubmit={(e) => {
        e.preventDefault();
        if (!content.trim()) return;
        onSubmit(content);
        setContent('');
      }}
    >
      <textarea
        className="krayaa-textarea"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a reply..."
        rows={3}
        autoFocus={autoFocus}
        required
      />
      <div className="form-footer">
        <button type="submit" className="krayaa-submit-btn">
          Post Reply_
        </button>
      </div>
    </form>
  );
}

export default ReplyForm;