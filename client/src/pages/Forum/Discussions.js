// client/src/pages/Forums/Discussion.js
import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { auth } from '../../firebaseconfig';
import AvatarRing from '../../components/AvatarRing';
import ReplyItem from './ReplyItem';
import InlineReplyForm from './ReplyForm';
import './Discussions.css';

/* -------------------------------
   UTIL: Build reply tree (SAFE)
-------------------------------- */
function buildReplyTree(flatReplies) {
  const map = {};
  const roots = [];

  flatReplies.forEach((r) => {
    map[r._id] = { ...r, children: [] };
  });

  flatReplies.forEach((r) => {
    if (r.parentReplyId && map[r.parentReplyId]) {
      map[r.parentReplyId].children.push(map[r._id]);
    } else {
      roots.push(map[r._id]);
    }
  });

  return roots;
}

function Discussion() {
  const { id } = useParams();
  const { authData } = useContext(AuthContext);

  const [discussion, setDiscussion] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /* -------------------------------
     Fetch discussion + replies
  -------------------------------- */
  useEffect(() => {
    async function fetchDiscussion() {
      try {
        const token = await auth.currentUser.getIdToken();
        const res = await axios.get(
          `http://localhost:5000/discussions/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setDiscussion(res.data);
        setReplies(res.data.replies || []);
      } catch (err) {
        console.error(err);
        setError('Failed to load discussion');
      } finally {
        setLoading(false);
      }
    }

    fetchDiscussion();
  }, [id]);

  /* -------------------------------
     🔑 CRITICAL FIX: Stable ordering
  -------------------------------- */
  const orderedReplies = useMemo(() => {
    return [...replies].sort((a, b) => {
      // Parents first
      if (!a.parentReplyId && b.parentReplyId) return -1;
      if (a.parentReplyId && !b.parentReplyId) return 1;

      // Otherwise chronological
      return new Date(a.createdAt) - new Date(b.createdAt);
    });
  }, [replies]);

  const replyTree = useMemo(
    () => buildReplyTree(orderedReplies),
    [orderedReplies]
  );

  /* -------------------------------
     Submit reply (top or nested)
  -------------------------------- */
  const handleReplySubmit = async (content, parentReplyId = null) => {
    if (!content.trim()) return;

    const token = await auth.currentUser.getIdToken();
    const res = await axios.post(
      `http://localhost:5000/discussions/${id}/reply`,
      { content, parentReplyId },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Immutable append
    setReplies((prev) => [...prev, res.data]);
  };

  /* -------------------------------
     Upvote reply (immutable)
  -------------------------------- */
  const handleReplyUpvote = async (replyId) => {
    const token = await auth.currentUser.getIdToken();
    const res = await axios.post(
      `https://krayaaa.onrender.com/discussions/replies/${replyId}/upvote`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setReplies((prev) =>
      prev.map((r) =>
        r._id === replyId
          ? {
              ...r,
              upvotesCount: res.data.upvotesCount,
              hasUpvoted: res.data.hasUpvoted,
            }
          : r
      )
    );
  };

  if (loading) return <div className="forum-loading">Loading…</div>;
  if (error) return <div className="forum-error">{error}</div>;

  return (
    <div className="discussion-page-container">
      {/* ---------------- Main Post ---------------- */}
      <div className="main-post-container">
        <h1>{discussion.title}</h1>

        <div className="main-post-author">
          <span className="meta-label">Posted by</span>
          
          <Link to={`/u/${discussion.authorUsername}`} className="user-link">
            <AvatarRing
              avatarId={discussion.authorAvatarId}
              reputation={discussion.authorReputation}
              size={30}
            />
            <strong className="username">{discussion.authorUsername}</strong>
          </Link>
        </div>

        <p className="main-post-content">{discussion.content}</p>
      </div>

      {/* ---------------- Replies ---------------- */}
      <div className="replies-container">
        <h2>{replies.length} Replies</h2>

        {authData.isLoggedIn && (
          <InlineReplyForm
            onSubmit={(content) => handleReplySubmit(content, null)}
          />
        )}

        {replyTree.map((reply) => (
          <ReplyItem
            key={reply._id}
            reply={reply}
            depth={0}
            onReply={handleReplySubmit}
            onUpvote={handleReplyUpvote}
          />
        ))}
      </div>
    </div>
  );
}

export default Discussion;
