import React, { useState } from 'react';
import axios from 'axios';

const AddResourceModal = ({ close, prefillData, onSuccess }) => {
    // 1. STATE MANAGEMENT
    const [formData, setFormData] = useState({
        title: '',
        faculty: prefillData?.faculty || '',        // Auto-filled (Locked)
        subFaculty: prefillData?.subFaculty || '',  // Auto-filled (Locked)
        resourceType: prefillData?.resourceType || '', // Auto-filled (Locked)
        year: prefillData?.year || '',              // Auto-filled (Editable)
        subject: '',
        examType: 'Mid Sem', // Default
    });
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 2. HANDLERS
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected && selected.type === 'application/pdf') {
            setFile(selected);
            setError(null);
        } else {
            setFile(null);
            setError("Only PDF files are allowed.");
        }
    };

    // 3. THE UPLOAD LOGIC
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !formData.title || !formData.subject) {
            setError("Please fill all required fields and attach a PDF.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token'); 
            const config = { headers: { 'x-auth-token': token } };

            // A. GET SIGNATURE (Secure)
            const signRes = await axios.get('https://krayaaa.onrender.com/resources/sign-upload', config);
            const { timestamp, signature, apiKey, cloudName } = signRes.data;

            // B. UPLOAD TO CLOUDINARY
            const uploadData = new FormData();
            uploadData.append('file', file);
            uploadData.append('api_key', apiKey);
            uploadData.append('timestamp', timestamp);
            uploadData.append('signature', signature);
            uploadData.append('folder', 'academic_resources'); 

            const cloudRes = await axios.post(
                `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, 
                uploadData
            );
            
            // C. SAVE METADATA TO BACKEND
            const backendPayload = {
                ...formData,
                fileUrl: cloudRes.data.secure_url
            };

            await axios.post('https://krayaaa.onrender.com/resources/upload', backendPayload, config);

            // D. SUCCESS & LOCKDOWN
            // Alert parent to disable button immediately
            if (onSuccess) onSuccess(); 
            
            alert("Upload Successful! It is now pending Admin approval.");
            close(); // Close modal

        } catch (err) {
            console.error(err);
            // Handle the specific "Limit Reached" error
            if (err.response && err.response.status === 400) {
                setError(err.response.data.msg); // "You already have a resource under review"
            } else {
                setError("Upload failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Upload Resource</h2>
                    <button onClick={close} className="close-btn">&times;</button>
                </div>
                
                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleSubmit}>
                    {/* READ ONLY FIELDS (Context) */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Faculty</label>
                            <input type="text" value={formData.faculty} disabled className="locked-input"/>
                        </div>
                        <div className="form-group">
                            <label>Branch</label>
                            <input type="text" value={formData.subFaculty} disabled className="locked-input"/>
                        </div>
                    </div>

                    {/* EDITABLE FIELDS */}
                    <div className="form-group">
                        <label>Title <span className="req">*</span></label>
                        <input name="title" placeholder="e.g. Data Structures Unit 1" onChange={handleChange} required />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Subject <span className="req">*</span></label>
                            <input name="subject" placeholder="e.g. CSE 201" onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Year</label>
                            <select name="year" value={formData.year} onChange={handleChange}>
                                <option value="">Select Year</option>
                                <option value="1st Year">1st Year</option>
                                <option value="2nd Year">2nd Year</option>
                                <option value="3rd Year">3rd Year</option>
                                <option value="4th Year">4th Year</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>PDF File <span className="req">*</span></label>
                        <div className="file-input-wrapper">
                            <input type="file" accept=".pdf" onChange={handleFileChange} />
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={close} className="cancel-btn">Cancel</button>
                        <button type="submit" className="submit-btn" disabled={loading}>
                            {loading ? "Uploading..." : "Submit for Approval"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddResourceModal;