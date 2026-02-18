import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth } from '../../firebaseconfig';
import './EditRental.css'

function EditRental() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    rules: '',
    perHour: '',
    perDay: '',
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRental = async () => {
      const token = await auth.currentUser.getIdToken();
      const res = await axios.get(
        `https://krayaaa.onrender.com/rentals/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setForm({
        title: res.data.title,
        description: res.data.description,
        rules: res.data.rules || '',
        perHour: res.data.pricing?.perHour || '',
        perDay: res.data.pricing?.perDay || '',
      });

      setLoading(false);
    };

    fetchRental();
  }, [id]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submitUpdate = async (e) => {
    e.preventDefault();

    const token = await auth.currentUser.getIdToken();

    await axios.put(
      `https://krayaaa.onrender.com/rentals/${id}`,
      {
        title: form.title,
        description: form.description,
        rules: form.rules,
        pricing: {
          perHour: form.perHour || undefined,
          perDay: form.perDay || undefined,
        },
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    navigate('/dashboard/listings');
  };

  if (loading) return <p>Loading...</p>;

  return (
    <form onSubmit={submitUpdate} className="edit-form">
      <h2>Edit Rental</h2>

      <input name="title" value={form.title} onChange={handleChange} required />
      <textarea name="description" value={form.description} onChange={handleChange} />
      <textarea name="rules" value={form.rules} onChange={handleChange} />
    <div classname="price-row"> 
      <input name="perHour" value={form.perHour} onChange={handleChange} placeholder="₹/hour" />
      <input name="perDay" value={form.perDay} onChange={handleChange} placeholder="₹/day" />
    </div>
      <button type="submit">Update Rental</button>
    </form>
  );
}

export default EditRental;
