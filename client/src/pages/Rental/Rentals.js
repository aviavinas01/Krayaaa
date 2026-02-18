// client/src/pages/Rentals/Rentals.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { auth } from '../../firebaseconfig';
import { Link, useNavigate } from 'react-router-dom';
import AvatarRing from '../../components/AvatarRing';
import './Rentals.css';

const PLACEHOLDER = 'https://placehold.co/600x400/1a1a1a/2fac04?text=No+Image';

const calculateRating = (reviews) => {
  if(!reviews || reviews.length ===0) return null;
  const total = reviews.reduce((acc,rev) => acc + (rev.rating || 0), 0);
  return (total /reviews.length).toFixed(1);
};

function Rentals() {
  const [rentals, setRentals] = useState([]); // always an array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true; // avoid setting state after unmount

    const fetchRentals = async () => {
      setLoading(true);
      setError('');

      try {
        // If user is logged in include token, otherwise attempt unauth fetch
        const user = auth.currentUser;
        const headers = {};

        if (user) {
          try {
            const token = await user.getIdToken();
            headers.Authorization = `Bearer ${token}`;
          } catch (tokenErr) {
            // token retrieval failed — still attempt fetch without it
            console.warn('Could not get idToken:', tokenErr);
          }
        }

        const res = await axios.get('https://krayaaa.onrender.com/rentals', { headers });
        // Ensure we always set an array
        if (mounted) setRentals(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to load rentals', err);
        if (mounted) setError('Failed to load rentals. Please try again later.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchRentals();

    return () => {
      mounted = false;
    };
  }, []);

  // Defensive render guards
  if (loading) return <p className="center-text">Loading rentals...</p>;
  if (error) return <p className="center-text error">{error}</p>;

  return (
    <div className="rentals-page">
      <div className="rentals-header">
        <h2>Available Rentals</h2>
      </div>

      {rentals.length === 0 ? (
        <p className="center-text">No rentals available</p>
      ) : (
        <div className="rentals-grid">
          {rentals.map((item = {}) => {
            // defensive extraction with fallbacks
            const id = item._id || item.id || '';
            const title = item.title || 'Untitled item';
            const owner = item.ownerUsername || 'owner';
            const perHour = item.perHour ?? null;
            const perDay = item.perDay ?? null;
            const images = Array.isArray(item.imageUrls) && item.imageUrls.length > 0 ? item.imageUrls : [PLACEHOLDER];
            const rating = calculateRating(item.reviews);
            return (
              <div className="rental-card" key={id || Math.random()}>
                <img src={images[0]} alt={title} className="rental-image" />

                <div className="rental-content">
                  <div className="title-row">
                    <h3>{title}</h3>
                    {rating && (
                      <div className="gold-star-badge" title={`${item.reviews.length} reviews`}>
                          <span className="star-icon">★</span>
                          <span className="rating-num">{rating}</span>
                        </div>
                    )}
                  </div>
                  <div className="rental-prices">
                    {perHour !== null && <span>₹{perHour}/hr</span>}
                    {perDay !== null && <span>₹{perDay}/day</span>}
                  </div>

                  <div className="rental-footer">
                    <span className="owner">
                      <AvatarRing 
                        avatarId={item.ownerAvatarId} 
                        reputation={item.ownerReputation} 
                        size={32} 
                      /> {owner}
                    </span>

                    {/* Use Link to a details page; fallback to navigation if id missing */}
                    {id ? (
                      <Link to={`/rentals/${id}`} className="view-btn">
                        View
                      </Link>
                    ) : (
                      <button
                        className="view-btn"
                        onClick={() => navigate('/rentals')}
                        aria-disabled
                      >
                        View Details
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div>
          <Link to="/rentals/add" className="add-rental-btn">
            + Add Rental
          </Link>
        </div>
       
    </div>
  );
}

export default Rentals;
