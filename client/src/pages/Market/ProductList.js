import React, { useState, useEffect, useContext } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import {FaPlus } from 'react-icons/fa';
import './ProductList.css';

const categories = [
    "All", "Automobile", "Electrical & Appliances", "Mobiles", "Spare Parts",
    "Furniture", "Fashion", "Pets", "Books", "Sports", "Hobbies"
    ];

function ProductList() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const location = useLocation();
    const { authData } = useContext(AuthContext);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const query = params.get('query') || '';
        setSearchQuery(query);

        
        axios.get('https://krayaaa.onrender.com/products')
            .then(response => {
                setProducts(response.data);
                setIsLoading(false);
            })
            .catch(error => {
                console.error('There was an error fetching the products!', error);
                setError('Failed to load products. Please try again later.');
                setIsLoading(false);
            });
    }, [location.search]); 
     
    const filteredProducts = products
    .filter(product => {

        if (selectedCategory === 'All') {
            return true;  
        }
        return product.category === selectedCategory;
    })
    .filter(product => {
        const searchLower = searchQuery.toLowerCase();
        return (
            product.name.toLowerCase().includes(searchLower) ||
            product.category.toLowerCase().includes(searchLower)
        );
    });

    if (isLoading) return <div className="loading">Loading products...</div>;
    if (error) return <div className="error">{error}</div>;

    const placeholderImage = 'https://placehold.co/600x400/1a1a1a/2fac04?text=No+Image';

    return (
        <div className="product-list-page">
            <div className="filter-controls">
                <div className="search-bar-container">
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                </div>
                <div className="category-filter-bar">
                        {categories.map(category => (
                            <button
                                key ={category}
                                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(category)}>
                                    {category}
                                </button>
                        ))}
                </div>
            </div>
            
            <h2 className="available-items-title">Available Items</h2>
            <div className="product-grid">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map(product => (
                        <Link 
                            to={ authData.isLoggedIn ? `/product/${product._id}`: `/login`}
                            key={product._id}
                            className="product-card-link"
                        >
                            <div className="product-card">
                                <img 
                                src={(product.imageUrls && product.imageUrls[0]) || placeholderImage} 
                                alt={product.name} 
                                onError={(e) => {e.target.onerror = null; e.target.src=placeholderImage}}
                                />
                                <div className="product-card-info">
                                <h3>{product.name}</h3>
                                {product.user && <p className="product-card-seller"> By: {product.user.username}</p>}
                                <p className="product-card-price">₹{product.price}</p>
                            </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="no-products">No products found.</div>
                )}
            </div>
            {authData.isLoggedIn && (
                <Link to ="/add-product" className = "floating-add-btn" title = "Add a new product">
                    <FaPlus /> <span className="add-product-text">Add Product</span>
                </Link>
            )}
        </div>
    );
}

export default ProductList;