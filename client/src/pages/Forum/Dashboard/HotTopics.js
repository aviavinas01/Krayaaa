import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { auth } from '../../../firebaseconfig';


function HotTopics() {
  const [topics, setTopics] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        const res = await axios.get(
          'https://krayaaa.onrender.com/dashboard/hot-topics',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (Array.isArray(res.data)) {
          setTopics(res.data);
        } else {
          setTopics([]);
        }
      } catch (err) {
        console.error('Hot topics fetch failed:', err);
        setError(true);
      }
    };

    load();
  }, []);

  if (error) {
    return <p className="dashboard-error">Hot topics unavailable</p>;
  }

  return (
    <section>

      {topics.length === 0 ? (
        <p>No hot topics</p>
      ) : (
        topics.map((t) => (
          <div key={t._id}>
            <strong>{t.title}</strong>
            <span>{t.repliesCount} replies</span>
          </div>
        ))
      )}
    </section>
  );
}

export default HotTopics;
