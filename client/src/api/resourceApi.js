import axios from 'axios';
import { auth} from '../firebaseconfig';
import { getAuth } from 'firebase/auth';

// Ensure this matches your backend URL
const API_URL = 'http://localhost:5000/api/resources';

// Helper to get the token from localStorage (assuming you store it there)
const getAuthHeaders = async () => {
    const user = auth.currentUser;
    if (!user) {
        console.error("❌ No user logged in (Firebase)");
        return {};
    }
    // Force refresh token if needed
    const token = await user.getIdToken(); 
    
    // IMPORTANT: Matching your AuthContext pattern (Bearer Token)
    return { 
        headers: { 
            'Authorization': `Bearer ${token}` 
        } 
    };
};

export const resourceApi = {
    // 1. Fetch Live Resources (Public)
    getAll: async (filters = {}) => {
        try {
            const res = await axios.get(`${API_URL}/`, { params: filters });
            return res.data;
        } catch (err) {
            console.error("API Error (Get All):", err.response?.data || err.message);
            throw err;
        }
    },

    // 2. Fetch Pending Resources (Admin Only)
    getPending: async () => {
        try {
            const headers = await getAuthHeaders();
            const res = await axios.get(`${API_URL}/pending`, headers);
            return res.data;
        } catch (err) {
            console.error("API Error (Get Pending):", err.response?.data || err.message);
            throw err;
        }
    },

    // 3. Upload Resource (Metadata to MongoDB)
    upload: async (data) => {
        try {
            const headers = await getAuthHeaders();
            const res = await axios.post(`${API_URL}/upload`, data, headers);
            return res.data;
        } catch (err) {
            console.error("API Error (Upload):", err.response?.data || err.message);
            throw err;
        }
    },

    // 4. Approve Resource (Admin Only)
    approve: async (id) => {
        try {
            const headers = await getAuthHeaders();
            const res = await axios.put(`${API_URL}/approve/${id}`, {},headers);
            return res.data;
        } catch (err) {
            console.error("API Error (Approve):", err.response?.data || err.message);
            throw err;
        }
    },

    // 5. Delete/Reject Resource
    delete: async (id) => {
        try {
            const headers = await getAuthHeaders();
            const res = await axios.delete(`${API_URL}/${id}`, headers);
            return res.data;
        } catch (err) {
            console.error("API Error (Delete):", err.response?.data || err.message);
            throw err;
        }
    },

    getUploadSignature: async () => {
        try {
            const headers = await getAuthHeaders();
            const res = await axios.get(`${API_URL}/sign-upload`, headers);
            return res.data;
        } catch(err){
            console.error("API Error (Sign):", err.response?.data || err.message);
            throw err;
        }
    }
};