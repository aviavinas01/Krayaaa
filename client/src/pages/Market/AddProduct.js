import React, { useState, useEffect} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {auth} from '../../firebaseconfig';
import GhostCursor from '../../utils/GhostCursor';
import './AddProduct.css';

const categories = [
    "Automobile",
    "Electrical & Appliances",
    "Mobiles",
    "Spare Parts",
    "Furniture",
    "Fashion",
    "Pets",
    "Books",
    "Sports",
    "Hobbies"
];

function AddProduct() {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
    });
    const [image1, setImage1] = useState(null);
    const [image2, setImage2] = useState(null);
    const [image3, setImage3] = useState(null);

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [descriptionCharCount, setDescriptionCharCount] = useState(0);
    const navigate = useNavigate();

    const { name, description, price, category } = formData;

    const onChange = e => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if(name === 'description'){
            setDescriptionCharCount(value.length);
        }
    };
    const onFileChange1 = e => setImage1(e.target.files[0]);
    const onFileChange2 = e => setImage2(e.target.files[0]);
    const onFileChange3 = e => setImage3(e.target.files[0]);

    const onSubmit = async e => {
        e.preventDefault();

        if (descriptionCharCount < 69){
            setError('Description must be at least 69 letters.');
            return;
        }

        if (!image1 || !image2 || !image3){
            setError('Please upload at least 3 images for the product.');
            return;
        }

        setIsSubmitting(true);
        setError('');
        const productData = new FormData();

        Object.keys(formData).forEach(key => productData.append(key, formData[key]));

        // 4. Append all images with the same key
        productData.append('images', image1);
        productData.append('images', image2);
        productData.append('images', image3);


        try {
            setLoading(true);
            const idToken = await auth.currentUser.getIdToken();
            const config = { headers: {'x-auth-token': idToken }};
            await axios.post('http://localhost:5000/products/add', productData, config);
            navigate('/buy-sell');
        } catch (err) {
            setError(err.response?.data?.msg || 'Could not add product. Please try again.');
            console.error(err.response?.data);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="add-product-page">
            <GhostCursor 
                            bloomStrength={0.00000000000002} 
                            bloomRadius={0.000001} 
                            grainIntensity={0.00008}
                        />
            <div className="add-product-container">
                <div className="form-doodle-panel">
                    <h1 className="doodle-header">Turn Your Clutter into Cash</h1>
                    <p className="doodle-text">
                        You're just a few steps away from listing your item. Fill out the details, and let's find it a new home on campus!
                    </p>
                </div>
            <div className="form-container">
                <h2>Sell an Item</h2>
                {error && <p className="error-text">{error}</p>}
                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label>Item Name</label>
                        <input type="text" name="name" value={name} onChange={onChange} required />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea name="description" value={description} onChange={onChange} rows="4" required />
                        <small style={{color: descriptionCharCount < 69 ? '#e74c3c' : 'var(--primary-color)', textAlign: 'right', display: 'block'}}>
                            {descriptionCharCount}/69 letters
                        </small>
                    </div>
                    <div className="form-group">
                        <label>Price (₹)</label>
                        <input type="number" name="price" value={price} onChange={onChange} required />
                    </div>
                    <div className="form-group">
                            <label>Category</label>
                            <select name="category" value={category} onChange={onChange} required>
                                <option value="" disabled>Select a category...</option>
                                {categories.map((cat, index) => (
                                    <option key={index} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    <div className="form-group">
                            <label>Main Image</label>
                            <input type="file" name="images" onChange={onFileChange1} required accept="image/*" />
                        </div>
                        <div className="form-group">
                            <label>Second Image</label>
                            <input type="file" name="images" onChange={onFileChange2} required accept="image/*" />
                        </div>
                        <div className="form-group">
                            <label>Third Image</label>
                            <input type="file" name="images" onChange={onFileChange3} required accept="image/*" />
                        </div>
                    <div className="terms-box">
                        <label className="terms-checkbox">
                            <input
                            type="checkbox"
                            checked={acceptedTerms}
                            onChange={(e) => setAcceptedTerms(e.target.checked)}
                            />
                            <span>
                            I agree to the Marketplace Terms & Conditions
                            </span>
                        </label>
                     </div>

                    <button type="submit" disabled={loading || !acceptedTerms}>
                        {isSubmitting? 'Listing Item...' : 'List Item'}
                    </button>
                </form>
            </div>
            </div>
        </div>
    );
}

export default AddProduct;