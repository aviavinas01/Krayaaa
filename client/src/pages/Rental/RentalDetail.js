// client/src/pages/Rentals/RentalDetail.js
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { auth } from '../../firebaseconfig';
import AvatarRing from '../../components/AvatarRing';
import './RentalDetail.css';

const PLACEHOLDER ='https://placehold.co/800x500/EEE/31343C?text=No+Image';

const renderStars = (rating) => {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 :0);

  return (
    <span className="star-display">
      {[...Array(fullStars)].map((_, i) => <span key={`f${i}`} className="star full">★</span>)}
      {hasHalf && <span className="star half">★</span>}
      {[...Array(emptyStars)].map((_, i) => <span key={`e${i}`} className="star empty">★</span>)}
    </span>
  );
};

function RentalDetail() {
  const { id } = useParams();
  const [rental, setRental] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const fetchRental = async () => {
      try {
        const headers = {};
        if (auth.currentUser) {
          const token = await auth.currentUser.getIdToken();
          headers.Authorization = `Bearer ${token}`;
        }
        const res = await axios.get(`http://localhost:5000/rentals/${id}`,  { headers });
        if (mounted) setRental(res.data);
      } catch (err) {
        console.error('Failed to load rental', err);
        if (mounted) setError('Rental not found.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchRental();
    return () => (mounted = false);
  }, [id]);

  if (loading) return <p className="center-text">Loading rental...</p>;
  if (error) return <p className="center-text error">{error}</p>;
  if (!rental) return null;

  const images = Array.isArray(rental.imageUrls) && rental.imageUrls.length > 0 ? rental.imageUrls: [PLACEHOLDER];
  const reviews = rental.reviews || [];
  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc,r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="rental-detail-page">
      <Link to="/rentals" className="back-link">← BACK TO RENTALS</Link>

      <div className="rental-detail-card">
        {/* Slider Image gallery */}
        <div className="image-slider-container">
          <div className="image-slider">
            {images.map((img, idx) => (
              <div className="slider-item" key={idx}>
                <img
                  src={img}
                  alt={`Rental ${idx + 1}`}
                  onError={(e) => (e.target.src = PLACEHOLDER)}
                />
                <span className="image-counter">{idx + 1} / {images.length}</span>
              </div>
            ))}
          </div>
          {images.length > 1 && <p className="slider-hint">SCROLL HORIZONTALLY →</p>}
        </div>

        <div className="detail-content">
          <h1 className="detail-title">{rental.title}</h1>

          <div className="owner-section">
            <span className="posted-by">POSTED BY</span>
            <div className="owner-pill">
              <AvatarRing 
                avatarId={rental.ownerAvatarId} 
                reputation={rental.ownerReputation} 
                size={32}
              />
              <strong className="owner-name">{rental.ownerUsername}</strong>
            </div>
          </div>

          <p className="description">{rental.description}</p>

          <div className="pricing-box">
            {rental.perHour && <div className="price-tag">₹{rental.perHour} <small>/ HOUR</small></div>}
            {rental.perDay && <div className="price-tag">₹{rental.perDay} <small>/ DAY</small></div>}
          </div>

          {rental.rules && (
            <div className="rules-box">
              <h3>OPERATING RULES</h3>
              <p>{rental.rules}</p>
            </div>
          )}

          <div className="contact-box">
            <button className="contact-btn">INITIATE CONTACT</button>
            <p className="contact-note">Secure communication enabled via platform encryption.</p>
          </div>
        </div>
      </div>
      <div className="reviews-container">
        <div className="reviews-header">
            <h3>Rental Reputation</h3>
            <div className="big-rating">
                {avgRating ? (
                    <>
                        <span className="score">{avgRating}</span>
                        {renderStars(Number(avgRating))}
                        <span className="count">({reviews.length} Reviews)</span>
                    </>
                ) : (
                    <>
                        <span className="score empty">---</span>
                        {renderStars(5)} {/* Show 5 empty stars */}
                        <span className="count">(No Reviews Yet)</span>
                    </>
                )}
            </div>
        </div>

        <div className="reviews-list">
            {reviews.length > 0 ? (
                reviews.map((rev, i) => (
                    <div className="review-card" key={i}>
                        <div className="review-top">
                            <span className="reviewer-name">@{rev.reviewerUsername || 'user'}</span>
                            <span className="review-date">{new Date(rev.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="mini-stars">{renderStars(rev.rating)}</div>
                        <p className="review-text">{rev.comment}</p>
                    </div>
                ))
            ) : (
                <p className="no-reviews-text">This item hasn't been reviewed yet. Be the first to rent it!</p>
            )}
        </div>
      </div>
      
    </div>
);
}

export default RentalDetail;
