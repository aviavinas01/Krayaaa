import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebaseconfig';
import GhostCursor from '../../utils/GhostCursor';
import './AddRental.css';

function AddRental() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    perHour: '',
    perDay: '',
  });

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [acceptedTerms,setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (e.target.files.length > 3) {
      setError('You can upload up to 3 images only');
      return;
    }
    setImages(Array.from(e.target.files));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.title || !form.description) {
      setError('Title and description are required');
      return;
    }

    if (!form.perHour && !form.perDay) {
      setError('Provide at least one pricing option');
      return;
    }

    if (images.length === 0) {
      setError('Upload at least one image');
      return;
    }

    try {
      setLoading(true);
      const token = await auth.currentUser.getIdToken();

      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });
      images.forEach((img) => formData.append('images', img));

      await axios.post(
        'http://localhost:5000/rentals/add',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      alert('Rental posted successfully');
      setForm({
        title: '',
        description: '',
        perHour: '',
        perDay: '',
      });
      setImages([]);
      navigate('/rentals');
    } catch (err) {
      if (err.response){
        setError(err.response.data?.msg || 'Action not allowed');
      }else{
        setError('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rental-container">

    <h2>Add Item for Rent</h2>

    {error && <p className="error-text">{error}</p>}

    <form onSubmit={handleSubmit} className="rental-form">
      <input
        type="text"
        name="title"
        placeholder="Item name"
        value={form.title}
        onChange={handleChange}
        required
      />

      <textarea
        name="description"
        placeholder="Item description"
        value={form.description}
        onChange={handleChange}
        rows={4}
        required
      />

      <div className="price-grid">
        <input type="number" name="perHour" placeholder="₹ / hour" value={form.perHour} onChange={handleChange} />
        <input type="number" name="perDay" placeholder="₹ / day" value={form.perDay} onChange={handleChange} />
      </div>

      {/* SLEEK CIRCULAR IMAGE SELECTOR */}
      <div className="image-upload-wrapper">
        <div className="circular-upload">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
          />
        </div>
        <span className="upload-label">Add Photos (Max 3)</span>
      </div>

      <div className="terms-box">
        <label className="terms-checkbox">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
          />
          <span>I agree to the Marketplace Terms & Conditions</span>
        </label>
      </div>

      <button type="submit" disabled={loading || !acceptedTerms}>
        {loading ? 'Posting...' : 'Post Rental'}
      </button>
    </form>
  </div>
  
);
}

export default AddRental;
