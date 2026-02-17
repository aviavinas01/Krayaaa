import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { auth } from '../firebaseconfig';
import './Notifications.css';

function Notifications() {
  const { authData } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async (isBackgroundRefresh = false) => {
    try{
      if(!auth.currentUser) return;
      const token = await auth.currentUser.getIdToken();

      const res = await axios.get(
        'http://localhost:5000/notifications',
        {headers:{Authorization: `Bearer ${token}`}}
      );
      setNotifications(res.data);
      if (!isBackgroundRefresh) {
        setLoading(false);
      }
    }catch (err){
      if(!isBackgroundRefresh) setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(false);

    const intervalId = setInterval(() => {
      fetchNotifications(true);
    }, 15000);
    return () => clearInterval(intervalId);
  }, []);

  const markAsRead = async (id) => {
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.patch(
        `http://localhost:5000/notifications/${id}/isread`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotifications((prev) =>
        prev.map((n) =>
          n._id === id ? { ...n, isread: true } : n
        )
      );
    } catch (err) {
      console.error('Failed to mark notification read');
    }
  };

  if (loading) return <div className="notifications-loading">Loading…</div>;

  return (
    <div className="notifications-page">
      <h1>Notifications</h1>

      {notifications.length === 0 ? (
        <p className="muted">No notifications yet.</p>
      ) : (
        <div className="notification-list">
          {notifications.map((n) => (
            <Link
              key={n._id}
              to={n.link || '#'}
              className={`notification-card ${!n.isread ? 'unread' : ''}`}
              onClick={() => markAsRead(n._id)}
            >
              <div className="notification-text">
                <strong>{n.title}</strong>
                <p>{n.message}</p>
              </div>

              <span className="notification-time">
                {new Date(n.createdAt).toLocaleString()}
              </span>
            </Link>
          ))}
        </div>
        
      )}
       
    </div>
  );
}

export default Notifications;
