// client/src/pages/Forum/Dashboard/RecentReplies.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { auth } from '../../../firebaseconfig';

function RecentReplies() {
  const [replies, setReplies] = useState([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchRecentReplies = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();

        const res = await axios.get(
          'http://localhost:5000/dashboard/recent-replies',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // 🛡️ Defensive check
        if (Array.isArray(res.data)) {
          setReplies(res.data);
        } else {
          setReplies([]);
        }
      } catch (err) {
        console.error('Recent replies fetch failed:', err);
        setError(true);
      }
    };

    fetchRecentReplies();
  }, []);

  if (error) {
    return <p className="dashboard-error">Recent replies unavailable</p>;
  }

  return (
    <section>

      {replies.length === 0 ? (
        <p>No recent replies</p>
      ) : (
        replies.map((r) => (
          <div key={r._id} className="dashboard-item">
            <strong>{r.authorUsername}</strong>
            <p className="dashboard-snippet">
              {r.content.slice(0, 60)}…
            </p>
          </div>
        ))
      )}
    </section>
  );
}

export default RecentReplies;
