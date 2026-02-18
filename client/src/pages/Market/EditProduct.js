 import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth } from '../../firebaseconfig';
import './EditProduct.css'; 

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      const token = await auth.currentUser.getIdToken();
      const res = await axios.get(
        `https://krayaaa.onrender.com/products/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setForm({
        name: res.data.name,
        description: res.data.description,
        price: res.data.price,
        category: res.data.category,
      });

      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submitUpdate = async (e) => {
    e.preventDefault();

    const token = await auth.currentUser.getIdToken();

    await axios.patch(
      `https://krayaaa.onrender.com/products/${id}`,
      form,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    navigate('/dashboard/listings');
  };

  if (loading) return <p>Loading...</p>;

  return (
    <form onSubmit={submitUpdate} className="edit-form">
      <h2>Edit Product</h2>

      <input name="name" value={form.name} onChange={handleChange} required />
      <textarea name="description" value={form.description} onChange={handleChange} />
      <input name="price" value={form.price} onChange={handleChange} />
      <input name="category" value={form.category} onChange={handleChange} />

      <button type="submit">Update Product</button>
    </form>
  );
}

export default EditProduct;
