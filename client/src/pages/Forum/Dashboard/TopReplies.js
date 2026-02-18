// client/src/pages/Forum/Dashboard/TopReplies.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { auth } from '../../../firebaseconfig';


function TopReplies() {
  const [replies, setReplies] = useState([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchTopReplies = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();

        const res = await axios.get(
          'https://krayaaa.onrender.com/dashboard/top-replies',
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
        console.error('Top replies fetch failed:', err);
        setError(true);
      }
    };

    fetchTopReplies();
  }, []);

  if (error) {
    return <p className="dashboard-error">Top replies unavailable</p>;
  }

  return (
    <section>

      {replies.length === 0 ? (
        <p>No top replies yet</p>
      ) : (
        replies.map((r) => (
          <div key={r._id} className="dashboard-item">
            <strong>{r.authorUsername}</strong>
            <span className="upvotes">▲ {r.upvotesCount}</span>
          </div>
        ))
      )}
    </section>
  );
}

export default TopReplies;
