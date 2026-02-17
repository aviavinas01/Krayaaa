import React, { useState, useContext } from 'react';
import { auth } from '../../firebaseconfig';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import AvatarSelector from '../../components/AvatarSelector';
import './CompleteProfile.css';

function CompleteProfile() {
  const [form, setForm] = useState({
    username: '',
    phoneNumber: '',
    hostelAddress: '',
    avatarId: ''
  });

  const { completeProfile } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'username') {
      // REGEX: Only allow letters, numbers, and underscores. No spaces or symbols.
      const sanitizedValue = value.replace(/[^a-zA-Z0-9_]/g, '');
      setForm((prev) => ({ ...prev, [name]: sanitizedValue }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const submitProfile = async (e) => {
    e.preventDefault();

    if (!form.avatarId) {
      alert('Please select an avatar to initialize your profile.');
      return;
    }

    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return;

      const token = await firebaseUser.getIdToken(true);

      // 1️⃣ Create profile in backend
      await axios.post(
        'http://localhost:5000/users/create-user',
        form,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // 2️⃣ Re-sync AuthContext (Re-fetches user data from DB)
      await completeProfile();

      // 3️⃣ Finalize
      navigate('/', { replace: true });

    } catch (err) {
      console.error('Initialization error:', err);
      alert(err.response?.data?.msg || 'Failed to initialize profile.');
    }
  };

  return (
    <div className="profile-setup-page">
      <div className="profile-setup-container">
        <header className="setup-header">
          <h1>INITIALIZE PROFILE</h1>
          <p>Assign credentials to your university uplink.</p>
        </header>

        <form onSubmit={submitProfile} className="setup-form">
          <section className="setup-section">
            <label className="setup-label">Select Avatar</label>
            <AvatarSelector
              value={form.avatarId}
              onChange={(id) => setForm({ ...form, avatarId: id })}
            />
          </section>

          <section className="setup-section">
            <label className="setup-label" htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              className="setup-input"
              placeholder="username_no_spaces"
              value={form.username}
              onChange={handleChange}
              required
              autoComplete="off"
            />
            <small className="input-hint">Only alphanumeric and underscores allowed.</small>
          </section>

          <section className="setup-section">
            <label className="setup-label" htmlFor="phoneNumber"> Phone Number</label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              className="setup-input"
              placeholder="Phone Number"
              value={form.phoneNumber}
              onChange={handleChange}
              required
            />
          </section>

          <section className="setup-section">
            <label className="setup-label" htmlFor="hostelAddress"> Hostel Address</label>
            <input
              id="hostelAddress"
              name="hostelAddress"
              className="setup-input"
              placeholder="Hostel / Room No"
              value={form.hostelAddress}
              onChange={handleChange}
              required
            />
          </section>

          <button type="submit" className="setup-submit-btn">
            CONFIRM_REGISTRATION
          </button>
        </form>
      </div>
    </div>
  );
}

export default CompleteProfile;