import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { auth } from '../../firebaseconfig';
import './Handshake.css';

function HandshakePage() {
  const { authData } = useContext(AuthContext);

  const [handshakes, setHandshakes] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRental, setSelectedRental] = useState('');
  const [renterUsername, setRenterUsername] = useState('');
  const [images, setImages] = useState([]);
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [conditionNotes, setConditionNotes] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [ showReviewModal, setShowReviewModal] = useState(false);
  const [ reviewTargetId, setReviewTargetId] = useState(null);
  const [ activeTab, setActiveTab] = useState('active');

  /* ----------------------------------
     Fetch my handshakes + rentals
  ---------------------------------- */
  useEffect(() => {
    async function load() {
      try {
        const token = await auth.currentUser.getIdToken();

        const [hsRes, rentalsRes] = await Promise.all([
          axios.get('http://localhost:5000/rentals/handshake/mine', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5000/rentals/mine', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setHandshakes(hsRes.data);
        setRentals(rentalsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  /* ----------------------------------
     Create handshake
  ---------------------------------- */
  const submitHandshake = async () => {
      if (!selectedRental || images.length < 3) {
        alert('Select rental and upload at least 3 images');
        return;
      }

      const form = new FormData();
      form.append('renterUsername', renterUsername);
      form.append('agreedReturnDate', expectedReturnDate);
      form.append('conditionNotes', conditionNotes);
      images.forEach(img => form.append('images', img));
      form.append('paymentConfirmed', true);
      form.append('idCardSubmitted', true);

      const token = await auth.currentUser.getIdToken();
      try{
      await axios.post(
        `http://localhost:5000/rentals/handshake/initiate/${selectedRental}`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      window.location.reload();
    } catch(error){
      console.error("Handshake failed", error);
      alert(error.response?.data?.msg || "Failed to initiate");
    }
  };
    /* ----------------------------------
     Handle Accepting the Handshake
    ---------------------------------- */
  const handleAcceptHandshake = async (handshakeId) => {
    try {
      const token = await auth.currentUser.getIdToken();
      
      await axios.post(
        `http://localhost:5000/rentals/handshake/${handshakeId}/accept`,
        {}, // Empty body
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert("You have successfully accepted the item! The rental is now ACTIVE.");
      window.location.reload(); // Refresh to update status
    } catch (err) {
      console.error("Acceptance failed:", err);
      alert(err.response?.data?.msg || "Failed to accept handshake.");
    }
  };

  /* MArk as returned */
  const handleMarkReturned = async (txId) => {
    if(!window.confirm("Are you sure you have physically returned the item?"))return;

    try{
      const token = await auth.currentUser.getIdToken();
      await axios.put(`http://localhost:5000/rentals/handshake/${txId}/return`, {}, {
        headers: { Authorization: `Bearer ${token}`}
      });
      window.location.reload();
    }catch (err){
      alert(err.response?.data?.msg || "Action Failed");
    }
  };

  /* Connfirm Return */

  const handleConfirmReturn = async (txId) => {
    if(!window.confirm(" Do you confirm the item is back in your possession safe and sound?")) return;

    try{
      const token = await auth.currentUser.getIdToken();
      await axios.post(`http://localhost:5000/rentals/handshake/${txId}/confirm`, {} , {
        headers: { Authorization: `Bearer ${token}`}
      });
      window.location.reload();
    }catch (err){
      alert(err.response?.data?.msg || "Action failed");
    }
  };

  /* Submit Review*/
  const submitReview = async (e) => {
    e.preventDefault();
    try{
      const token = await auth.currentUser.getIdToken();
      await axios.post(`http://localhost:5000/rentals/handshake/${reviewTargetId}/review`,
        { rating: reviewRating, comment: reviewComment },
        { headers: { Authorization: `Bearer ${token}`}}
      );
      alert("Review submitted! Thank you.");
      window.location.reload();
    }catch (err) {
      alert(err.response?.data?.msg || "Review failed");
    }
  };

  if (loading) return <p>Loading handshakes…</p>;

  return (
  <div className="handshake-page">
    
    {/* --- HEADER & TABS --- */}
    <div className="page-header">
      <h1>Rental Handshakes</h1>
      
      {/* Tab Switcher Logic */}
      <div className="tab-switcher">
        <button 
          className={activeTab === 'active' ? 'active-tab' : ''} 
          onClick={() => setActiveTab('active')}
        >
          My Handshakes
        </button>
        {rentals.length > 0 && (
          <button 
            className={activeTab === 'create' ? 'active-tab' : ''} 
            onClick={() => setActiveTab('create')}
          >
            + Initiate New
          </button>
        )}
      </div>
    </div>

    {/* =========================================================
        TAB 1: ACTIVE HANDSHAKES LIST
       ========================================================= */}
    {activeTab === 'active' && (
      <section className="handshake-list">
        {handshakes.length === 0 && (
          <div className="empty-state">
            <p className="muted">No active handshakes found.</p>
          </div>
        )}

        {handshakes.map(hs => (
          <div key={hs._id} className="handshake-card">
            
            {/* --- CARD HEADER: STATUS & ID --- */}
            <div className="card-header">
              <span className={`status-badge ${hs.status.toLowerCase()}`}>
                {hs.status.replace(/_/g, ' ')}
              </span>
              <small>ID: {hs._id.slice(-6)}</small>
            </div>

            {/* --- MAIN INFO --- */}
            <div className="card-info">
              <h3>{hs.rentalId?.title || "Unknown Item"}</h3>
              <p><strong>Owner:</strong> @{hs.ownerUsername?.username || "Unknown"}</p>
              <p className="date-text">
                <strong>Return by:</strong>{' '}
                {hs.handoverDetails?.agreedReturnDate 
                  ? new Date(hs.handoverDetails.agreedReturnDate).toLocaleDateString() 
                  : "N/A"}
              </p>
            </div>

            {/* --- TRUST INDICATORS (ID & Payment) --- */}
            <div className="trust-indicators">
              <div className={`trust-badge ${hs.handoverDetails?.idCardSubmitted ? 'verified' : 'pending'}`}>
                <span className="icon">🪪</span>
                <span>
                  {hs.handoverDetails?.idCardSubmitted ? "Owner ID Verified" : "ID Not Submitted"}
                </span>
              </div>
              <div className={`trust-badge ${hs.handoverDetails?.paymentConfirmed ? 'verified' : 'pending'}`}>
                <span className="icon">💳</span>
                <span>
                  {hs.handoverDetails?.paymentConfirmed ? "Payment Secured" : "Payment Pending"}
                </span>
              </div>
            </div>

            {/* --- CONDITION & PROOF --- */}
            <div className="condition-section">
              <h4>Owner's Condition Report:</h4>
              <p className="notes-box">
                "{hs.handoverDetails?.conditionNotes || "No notes provided."}"
              </p>
              
              <div className="proof-gallery">
                {hs.handoverDetails?.proofImages?.length > 0 ? (
                  hs.handoverDetails.proofImages.map((img, i) => (
                    <a key={i} href={img} target="_blank" rel="noopener noreferrer">
                      <img src={img} alt={`Proof ${i+1}`} />
                    </a>
                  ))
                ) : (
                  <span className="muted-text">No images provided</span>
                )}
              </div>
            </div>

            {/* =========================================================
                DYNAMIC ACTION BUTTONS (The Logic Core)
               ========================================================= */}
            
            {/* 1. PENDING ACCEPTANCE (Renter Action) */}
            {hs.status === 'PENDING_RENTER_ACCEPTANCE' &&
              hs.renterUid?._id === authData.firebaseUser.uid && (
                <div className="action-area">
                  <p className="legal-text">
                    By accepting, you confirm the item matches the photos and agree to the return date.
                  </p>
                  <button
                    className="accept-btn"
                    onClick={() => handleAcceptHandshake(hs._id)}
                  >
                    ✅ Confirm & Accept Possession
                  </button>
                </div>
            )}

            {/* 2. ACTIVE RENTAL (Renter Return Action) */}
            {hs.status === 'ACTIVE' && 
             hs.renterUid?._id === authData.firebaseUser.uid && (
              <div className="action-area">
                <p className="status-text">Rental is currently active.</p>
                <button 
                  className="return-btn"
                  onClick={() => handleMarkReturned(hs._id)}
                >
                  🔄 I have Returned the Item
                </button>
              </div>
            )}

            {/* 3. RETURN PENDING (Owner Confirm Action) */}
            {hs.status === 'PENDING_OWNER_CONFIRMATION' && (
              <div className="action-area warning">
                {hs.ownerUid?._id === authData.firebaseUser.uid ? (
                  <>
                    <p>Renter has marked this as returned. Do you have it?</p>
                    <button 
                      className="confirm-btn"
                      onClick={() => handleConfirmReturn(hs._id)}
                    >
                      ✅ Confirm Safe Return
                    </button>
                  </>
                ) : (
                  <p>Waiting for owner to confirm receipt...</p>
                )}
              </div>
            )}

            {/* 4. COMPLETED (Renter Review Action) */}
            {hs.status === 'COMPLETED' && 
             hs.renterUid?._id === authData.firebaseUser.uid && 
             !hs.review?.rating && (
              <div className="action-area success">
                <p>Rental Completed Successfully!</p>
                <button 
                  className="review-btn"
                  onClick={() => {
                    setReviewTargetId(hs._id);
                    setShowReviewModal(true);
                  }}
                >
                  ⭐ Leave a Review
                </button>
              </div>
            )}

            {/* 5. REVIEW DISPLAY (If exists) */}
            {hs.review?.rating && (
              <div className="review-display">
                <p><strong>Your Review:</strong> {hs.review.rating}/5 ⭐</p>
                <p>"{hs.review.comment}"</p>
              </div>
            )}

          </div>
        ))}
      </section>
    )}

    {/* =========================================================
        TAB 2: CREATE HANDSHAKE FORM
       ========================================================= */}
    {activeTab === 'create' && rentals.length > 0 && (
      <section className="create-handshake">
        <h2>Initiate New Handshake</h2>
        <div className="form-group">
          <label>Select Your Item:</label>
          <select onChange={e => setSelectedRental(e.target.value)}>
            <option value="">-- Choose Item --</option>
            {rentals.map(r => (
              <option key={r._id} value={r._id}>{r.title}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Renter Username:</label>
          <input
            type="text"
            placeholder="e.g. john_doe"
            value={renterUsername}
            onChange={e => setRenterUsername(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Condition Notes:</label>
          <textarea
            placeholder="Describe scratches, marks, or current state..."
            value={conditionNotes}
            onChange={e => setConditionNotes(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Agreed Return Date:</label>
          <input
            type="date"
            value={expectedReturnDate}
            onChange={e => setExpectedReturnDate(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Upload Proof Images:</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={e => setImages([...e.target.files])}
          />
        </div>

        <button className="submit-btn" onClick={submitHandshake}>
          Send Handshake Request
        </button>
      </section>
    )}

    {/* =========================================================
        GLOBAL REVIEW MODAL (Hidden by default)
       ========================================================= */}
    {showReviewModal && (
      <div className="modal-overlay">
        <div className="modal-content">
          <h3>Rate your experience</h3>
          <form onSubmit={submitReview}>
            <div className="star-select">
              <label>Rating:</label>
              <select 
                value={reviewRating} 
                onChange={(e) => setReviewRating(e.target.value)}
              >
                <option value="5">⭐⭐⭐⭐⭐ (Excellent)</option>
                <option value="4">⭐⭐⭐⭐ (Good)</option>
                <option value="3">⭐⭐⭐ (Average)</option>
                <option value="2">⭐⭐ (Poor)</option>
                <option value="1">⭐ (Terrible)</option>
              </select>
            </div>
            
            <textarea 
              placeholder="How was the item? Was the owner helpful?"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              required
            />
            
            <div className="modal-actions">
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => setShowReviewModal(false)}
              >
                Cancel
              </button>
              <button type="submit" className="submit-btn">
                Submit Review
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

  </div>
);

}

export default HandshakePage;
