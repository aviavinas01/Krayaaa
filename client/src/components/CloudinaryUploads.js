import React, { useState } from 'react';
import { resourceApi } from '../api/resourceApi'; // Import your API helper

const CloudinaryUpload = ({ setFileUrl, setFileName }) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setError(null);

        try {
            // 1. GET SIGNATURE from your Backend
            const { timestamp, signature, apiKey, cloudName } = await resourceApi.getUploadSignature();

            // 2. Prepare Form Data
            const formData = new FormData();
            formData.append('file', file);
            formData.append('api_key', apiKey); 
            formData.append('timestamp', timestamp);
            formData.append('signature', signature);
            // formData.append('folder', 'academic_resources'); // Optional: Must match backend signing params if used

            // 3. Upload to Cloudinary
            const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (data.error) throw new Error(data.error.message);

            console.log("✅ Secure Upload Success:", data.secure_url);
            let finalUrl = data.secure_url;
            if( file.type == 'application/pdf' && !finalUrl.endsWith('.pdf')){
                finalUrl = finalUrl + '.pdf';
            }
            setFileUrl(finalUrl);
            if(setFileName) setFileName(file.name);

        } catch (err) {
            console.error("❌ Upload Fail:", err);
            setError(err.message || "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{border: '1px dashed #ccc', padding: '10px', margin: '10px 0'}}>
            <input type="file" accept=".pdf" onChange={handleUpload} disabled={uploading} />
            {uploading && <span style={{color: 'blue'}}> Verifying & Uploading...</span>}
            {error && <div style={{color: 'red'}}>Error: {error}</div>}
        </div>
    );
};

export default CloudinaryUpload;