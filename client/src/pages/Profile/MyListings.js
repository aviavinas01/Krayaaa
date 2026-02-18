// client/src/pages/Profile/MyListings.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { auth } from '../../firebaseconfig';
import { Link, useNavigate } from 'react-router-dom';
import './MyListings.css';

function MyListings() {
  const [products, setProducts] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const fetchListings = async () => {
      try {
        if (!auth.currentUser) return;

        const token = await auth.currentUser.getIdToken();
        const headers = { Authorization: `Bearer ${token}` };

        const [productsRes, rentalsRes] = await Promise.all([
          axios.get('https://krayaaa.onrender.com/products/mine', { headers }),
          axios.get('https://krayaaa.onrender.com/rentals/mine', { headers }),
        ]);

        if (!mounted) return;

        setProducts(productsRes.data || []);
        setRentals(rentalsRes.data || []);
      } catch (err) {
        console.error('Fetch listings error:', err);
        setError('Failed to load your listings');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchListings();
    return () => (mounted = false);
  }, []);

  /* ---------------- DELETE HANDLERS ---------------- */

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product permanently?')) return;
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.delete(`https://krayaaa.onrender.com/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch {
      alert('Failed to delete product');
    }
  };

  const deleteRental = async (id) => {
    if (!window.confirm('Delete this rental permanently?')) return;
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.delete(`https://krayaaa.onrender.com/rentals/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRentals((prev) => prev.filter((r) => r._id !== id));
    } catch {
      alert('Failed to delete rental');
    }
  };

  /* ---------------- RENDER ---------------- */

  if (loading) return <p>Loading your listings...</p>;
  if (error) return <p className="error">{error}</p>;

  const hasNoListings = products.length === 0 && rentals.length === 0;

  return (
    <div className="my-listings">
      <h2>My Listings</h2>

      {hasNoListings && (
        <p>You have not listed any products or rentals yet.</p>
      )}
      
      <span>
        
        <button onClick={() =>
          navigate(`/handshake`)
        }> digital handshake</button>
      </span>

      {/* PRODUCTS */}
      {products.length > 0 && (
        <>
          <h3>Marketplace Products</h3>
          <div className="listings-grid">
            {products.map((product) => (
              <div key={product._id} className="listing-card">
                <img
                  src={product.imageUrls?.[0] || '/placeholder.png'}
                  alt={product.name}
                />

                <div className="listing-info">
                  <h4>{product.name}</h4>
                  <p>₹{product.price}</p>

                  <div className="listing-actions">
                    <Link to={`/product/${product._id}`} className="btn view">
                      View
                    </Link>
                    <button
                      className="btn edit"
                      onClick={() =>
                        navigate(`/product/edit/${product._id}`)
                      }
                    >
                      Edit
                    </button>
                    <button
                      className="btn delete"
                      onClick={() => deleteProduct(product._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* RENTALS */}
      {rentals.length > 0 && (
        <>
          <h3>Rental Listings</h3>
          <div className="listings-grid">
            {rentals.map((rental) => (
              <div key={rental._id} className="listing-card">
                <img
                  src={rental.images?.[0] || '/placeholder.png'}
                  alt={rental.title}
                />

                <div className="listing-info">
                  <h4>{rental.title}</h4>
                  <p>
                    {rental.pricing?.perHour && `₹${rental.pricing.perHour}/hr `}
                    {rental.pricing?.perDay && `₹${rental.pricing.perDay}/day`}
                  </p>

                  <div className="listing-actions">
                    <Link to={`/rentals/${rental._id}`} className="btn view">
                      View
                    </Link>
                    <button
                      className="btn edit"
                      onClick={() =>
                        navigate(`/rentals/edit/${rental._id}`)
                      }
                    >
                      Edit
                    </button>
                    <button
                      className="btn delete"
                      onClick={() => deleteRental(rental._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default MyListings;
