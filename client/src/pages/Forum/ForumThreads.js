import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import './Forums.css';

function ForumThreads() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  const { authData, isLoading: isAuthLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!isAuthLoading && !authData.isLoggedIn) {
      navigate('/login');
    }
  }, [authData.isLoggedIn, isAuthLoading, navigate]);

  // Fetch threads
  useEffect(() => {
    if (authData.isLoggedIn) {
      axios
        .get('http://localhost:5000/forums/threads')
        .then((res) => {
          setThreads(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error fetching threads:', err);
          setLoading(false);
        });
    }
  }, [authData.isLoggedIn]);

  if (isAuthLoading || loading) {
    return (
      <div className="forum-loading-container">
        <div className="loading-bar"></div>
        <p>ACCESSING MAINFRAME...</p>
      </div>
    );
  }

  return (
    <div className="forum-page">
      <div className="forum-container">
        
        <header className="forum-header">
          <div className="header-decoration"></div>
          <h1>Community Forum</h1>
          <p>Select a stream to connect</p>
        </header>

        <div className="thread-stack">
          {threads.map((thread) => (
            <div
              key={thread.key}
              className="thread-row-card"
              onClick={() => navigate(`/forums/thread/${thread.key}`)}
            >
              {/* Left Side: The 'Status' Strip */}
              <div className="card-status-strip"></div>

              {/* Middle: Content */}
              <div className="card-content">
                <h2>{thread.title}</h2>
                <p>{thread.description}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default ForumThreads;