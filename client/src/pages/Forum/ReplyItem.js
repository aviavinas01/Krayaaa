import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ReplyForm from './ReplyForm';
import AvatarRing from '../../components/AvatarRing'; 
import './ReplyItem.css'; 

function ReplyItem({ reply, depth = 0, onReply, onUpvote }) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  
  // Default: show children unless depth is very deep (e.g. > 3)
  const [areChildrenVisible, setAreChildrenVisible] = useState(depth < 3);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const hasChildren = reply.children && reply.children.length > 0;

  return (
    <div className="reply-node-container" style={{ marginLeft: `${depth * 20}px` }}>
      
      {/* Thread Indentation Line (Only for nested items) */}
      {depth > 0 && <div className="reply-thread-line"></div>}

      <div className="reply-item-content">
        
        {/* --- HEADER --- */}
        <div className="reply-header">
          <Link to={`/u/${reply.authorUsername}`} className="user-link">
            <AvatarRing
              avatarId={reply.authorAvatarId}
              reputation={reply.authorReputation}
              size={24}
            />
            <span className="username">{reply.authorUsername}</span>
          </Link>
        </div>

        {/* --- CONTENT (Always Visible) --- */}
        <div className="reply-text">
          {reply.content}
        </div>

        {/* --- FOOTER: ACTIONS & DATE --- */}
        <div className="reply-footer">
          <div className="reply-actions-left">
            {/* UPVOTE */}
            <button
              className={`action-btn upvote-btn ${reply.hasUpvoted ? 'active' : ''}`}
              onClick={() => onUpvote(reply._id)}
            >
              ▲ {reply.upvotesCount}
            </button>

            {/* REPLY BUTTON */}
            <button
              className="action-btn reply-toggle-btn"
              onClick={() => setShowReplyBox(!showReplyBox)}
            >
              💬 Reply
            </button>

            {/* EXPAND/COLLAPSE CHILDREN BUTTON */}
            {hasChildren && (
              <button
                className="action-btn collapse-btn"
                onClick={() => setAreChildrenVisible(!areChildrenVisible)}
              >
                {areChildrenVisible 
                  ? `[-] Hide Replies` 
                  : `[+] Show ${reply.children.length} Replies`}
              </button>
            )}
          </div>

          {/* DATE (Right Aligned) */}
          <span className="reply-date">
            {formatDate(reply.createdAt)}
          </span>
        </div>

        {/* --- REPLY FORM --- */}
        {showReplyBox && (
          <div className="nested-reply-form-wrapper">
            <ReplyForm
              autoFocus
              onSubmit={(content) => {
                onReply(content, reply._id);
                setShowReplyBox(false);
                setAreChildrenVisible(true); // Auto-expand to show new reply
              }}
            />
          </div>
        )}
      </div>

      {/* --- CHILDREN (Conditionally Hidden) --- */}
      {hasChildren && areChildrenVisible && (
        <div className="reply-children-list">
          {reply.children.map((child) => (
            <ReplyItem
              key={child._id}
              reply={child}
              depth={depth + 1}
              onReply={onReply}
              onUpvote={onUpvote}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ReplyItem;