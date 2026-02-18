import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {auth as firebaseAuth} from '../../firebaseconfig';
import './ProductDetail.css'; 

function ProductDetail() {
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeImage, setActiveImage] = useState('');
    const [showContact, setShowContact] = useState(false);
    const { id } = useParams(); // Gets the product ID from the URL

    useEffect(() => {
    const fetchProduct = async () => {
        try {
            const user = firebaseAuth.currentUser;
            const token = user ? await user.getIdToken() : null;

            const config = {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            };

            const response = await axios.get(`https://krayaaa.onrender.com/products/${id}`, config);
            setProduct(response.data);
            if (response.data.imageUrls && response.data.imageUrls.length > 0) {
                setActiveImage(response.data.imageUrls[0]);
            }
        } catch (err) {
            console.error("Error fetching product details:", err);
            setError("Could not load product details.");
        } finally {
            setIsLoading(false); // always stop loading
        }
    };
    fetchProduct();
}, [id]);

    if (isLoading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!product) return <div className="no-products">Product not found.</div>;
    const seller = product.user || {};
    return (
        <div className="product-detail-container">
            <div className="product-gallery">
                <div className="main-image-container">
                    <img src={activeImage || 'https://placehold.co/600x400/EEE/31343C?text=No+Image'} alt={product.name} className="main-image" />
                </div>
                <div className="thumbnail-container">
                    {product.imageUrls && product.imageUrls.map((url, index) => (
                        <img 
                            key={index}
                            src={url}
                            alt={`Thumbnail ${index + 1}`}
                            className={`thumbnail-image ${url === activeImage ? 'active' : ''}`}
                            onClick={() => setActiveImage(url)}
                        />
                    ))}
                </div>
            </div>
            <div className="product-detail-info">
                <h1>{product.name}</h1>
                <p className="product-detail-price">₹{product.price}</p>
                <p className="product-detail-seller">
                    Sold by:
                    <Link to={`/u/${product.user?.username}`} className="user-link">
                      <span className="seller-username"> {product.user?.username || 'Unknown Seller'}</span>
                    </Link>
                </p>
                <div className="product-detail-section">
                    <h3>Category</h3>
                    <p>{product.category}</p>
                </div>
                <div className="product-detail-section">
                    <h3>Description</h3>
                    <p>{product.description}</p>
                </div>
                <button
          className="contact-seller-btn"
          onClick={() => setShowContact(!showContact)}
        >
          {showContact ? 'Hide Seller Info' : 'Contact Seller'}
        </button>

        {/* 🔹 Seller info reveal */}
        {showContact && (
          <div className="seller-contact-card">
            <h3>Seller Information</h3>
            <p>
              Name: <strong>{seller.username}</strong>
            </p>

            {seller.email && (
              <p>
                Email:{' '}
                <a href={`mailto:${seller.email}`} className="seller-link">
                  {seller.email}
                </a>
              </p>
            )}
            {seller.phone && (
              <p>
                Phone:{' '}
                <a href={`tel:${seller.phoneNumber}`} className="seller-link">
                  {seller.phone}
                </a>
              </p> 
            )}
            {seller.Address && (
              <p>
                Address:{' '}
                <a href={`tel:${seller.hostelAddress}`} className="seller-link">
                  {seller.hostelAddress}
                </a>
              </p> 
            )}
            </div>
        )}
            </div>
        </div>
    );
}

export default ProductDetail;