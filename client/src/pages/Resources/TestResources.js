import React, { useState, useEffect } from 'react';
import { resourceApi } from '../../api/resourceApi';
import CloudinaryUpload from '../../components/CloudinaryUploads';

const TestResource = () => {
    // 1. Data State
    const [resources, setResources] = useState([]);
    const [fileUrl, setFileUrl] = useState('');
    
    // 2. Form State
    const [form, setForm] = useState({
        title: '', faculty: 'Engineering', subFaculty: 'CSE',
        semester: 'Semester-1', subject: 'Physics', year: 2025,
        resourceType: 'NOTES', examType: 'Mid-Sem'
    });

    // 3. Fetch Data on Load
    useEffect(() => {
        loadResources();
    }, []);

    const loadResources = async () => {
        try {
            // Fetch everything (Live)
            const data = await resourceApi.getAll(); 
            setResources(data);
        } catch (err) {
            alert("Failed to load data. Check console.");
        }
    };

    // 4. Handle Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!fileUrl) return alert("Please upload PDF to Cloudinary first!");

        try {
            const payload = { ...form, fileUrl };
            const res = await resourceApi.upload(payload);
            
            alert(`Upload Success! Status: ${res.status}`); // Should say 'LIVE' if you are admin
            setFileUrl(''); // Reset file
            loadResources(); // Refresh list
        } catch (err) {
            alert("Upload Failed");
        }
    };

    // 5. Handle Delete
    const handleDelete = async (id) => {
        if(!window.confirm("Delete this?")) return;
        try {
            await resourceApi.delete(id);
            loadResources();
        } catch (err) {
            alert("Delete Failed (Are you Admin?)");
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <h1>🛠 Resource Debug Dashboard</h1>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* LEFT: UPLOAD FORM */}
                <div style={{ border: '1px solid #ddd', padding: '20px' }}>
                    <h3>1. Upload Resource</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <input placeholder="Title" onChange={e => setForm({...form, title: e.target.value})} />
                        
                        <CloudinaryUpload 
                            setFileUrl={setFileUrl} 
                            // PASS YOUR *NEW* KEYS HERE
                            cloudName={process.env.REACT_APP_CLOUD_NAME} 
                            uploadPreset={process.env.REACT_APP_RESOURCE_PRESET} 
                        />
                        
                        {fileUrl && <div style={{color:'green'}}>Link Ready: {fileUrl.slice(0,30)}...</div>}

                        <button type="submit" style={{ padding: '10px', background: 'black', color: 'white' }}>
                            Save to Database
                        </button>
                    </form>
                </div>

                {/* RIGHT: LIST VIEW */}
                <div style={{ border: '1px solid #ddd', padding: '20px', background: '#f9f9f9' }}>
                    <h3>2. Live Database View</h3>
                    <button onClick={loadResources}>Refresh List</button>
                    <ul>
                        {resources.map(r => (
                            <li key={r._id} style={{ marginBottom: '10px', borderBottom: '1px solid #ccc' }}>
                                <strong>{r.title}</strong> ({r.status}) <br/>
                                <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" style={{ 
        color: 'white', 
        backgroundColor: '#007bff', // Blue background
        padding: '5px 10px', 
        borderRadius: '5px',
        textDecoration: 'none' 
    }}>Open PDF</a>
                                <button onClick={() => handleDelete(r._id)} style={{marginLeft: '10px', color: 'red'}}>Delete</button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default TestResource;