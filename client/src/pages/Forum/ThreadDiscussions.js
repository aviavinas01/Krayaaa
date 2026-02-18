import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { auth } from '../../firebaseconfig';
import AvatarRing from '../../components/AvatarRing';
import './ForumThreads.css'; // reuse forum styles

function ThreadDiscussions() {
  const { threadKey } = useParams();
  const navigate = useNavigate();
  const { authData } = useContext(AuthContext);

  const [thread, setThread] = useState(null);
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // new discussion form
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* -----------------------------
     Fetch thread + discussions
  ----------------------------- */
  useEffect(() => {
    async function fetchData() {
      try {
       const Token = await auth.currentUser.getIdToken();
        const config = { headers: { Authorization: `Bearer ${Token}` } };

        const threadRes = await axios.get(
          `https://krayaaa.onrender.com/forums/threads/${threadKey}`,
          config
        );

        const discussionsRes = await axios.get(
          `https://krayaaa.onrender.com/discussions/threads/${threadKey}`,
          config
        );

        setThread(threadRes.data);
        setDiscussions(discussionsRes.data);
        setLoading(false);
      } catch (err) {
        console.error('Error loading thread discussions:', err);
        setError('Thread not found or failed to load.');
        setLoading(false);
      }
    }

    fetchData();
  }, [threadKey]);

  /* -----------------------------
     Create discussion
  ----------------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      const idToken = await auth.currentUser.getIdToken();
      const config = { headers: { Authorization: `Bearer ${idToken}` } };
      const res = await axios.post(
        `https://krayaaa.onrender.com/discussions/threads/${threadKey}`,
        { title, content },
        config
      );

      setDiscussions([res.data, ...discussions]);
      setTitle('');
      setContent('');
      setIsFormVisible(false);
    } catch (err) {
      console.error('Error creating discussion:', err);
      setError('Failed to create discussion.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="forum-loading">Loading...</div>;
  if (error) return <div className="forum-error">{error}</div>;

  return (
    <div className="forum-page">
      <div className="forum-container">
        {/* Thread Header */}
        <header className="forum-header">
          <div>
            <h1>{thread.title}</h1>
            <p>{thread.description}</p>
          </div>
          {authData.isLoggedIn && (
            <button
              className="new-discussion-btn"
              onClick={() => setIsFormVisible(!isFormVisible)}
            >
              {isFormVisible ? 'Cancel' : 'Start Discussion'}
            </button>
          )}
        </header>

        {/* New Discussion Form */}
        {isFormVisible && (
          <form className="create-discussion-form" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Discussion title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <textarea
              placeholder="Write your discussion content..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows="5"
              required
            />
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </form>
        )}

        {/* Discussion List */}
      <div className="discussion-list">
        {discussions.length > 0 ? (
          discussions.map((d) => (
            <div
              key={d._id}
              className="discussion-card"
              onClick={() => navigate(`/forums/discussions/${d._id}`)}
            >
              <h3>{d.title}</h3>
              
              <div className="discussion-author-line">
                <span>Started by </span>
                {/* FIX 1: Use 'd' instead of 'discussions' */}
                {/* FIX 2: Use the exact names from your backend 'enriched' map */}
                <Link to={`/u/${d.authorUsername}`} className="user-link">
                  <AvatarRing 
                    avatarId={d.authorAvatarId} 
                    reputation={d.authorReputation} 
                    size={32} 
                  />
                  <strong className="author-name">
                    {d.authorUsername || 'User'}
                  </strong>
                </Link>
              </div>

              <span className="discussion-meta">
                {new Date(d.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))
        ) : (
          <p>No discussions yet. Be the first to start one!</p>
        )}
      </div>
      </div>
    </div>
  );
}

export default ThreadDiscussions;
