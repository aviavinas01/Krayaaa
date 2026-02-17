import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { FACULTIES, RESOURCE_TYPES, YEARS } from '../../constants/resourceOptions';
import ResourceCard from '../../components/ResourceCard'; // Assuming you have this
import AddResourceModal from '../../components/AddResourceModal'; // We will tweak this
import { auth } from '../../firebaseconfig';
import './Resources.css'; 

const Resources = () => {
    
    const [selectedFaculty, setSelectedFaculty] = useState(null);
    const [selectedSubFaculty, setSelectedSubFaculty] = useState(null);
    const [selectedType, setSelectedType] = useState(null); 
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterYear, setFilterYear] = useState('');
    const [filterSubject, setFilterSubject] = useState('');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [canUpload,setCanUpload] = useState(false);
    const [checkingStatus, setCheckingStatus] = useState(true);

    // --- EFFECT: Fetch when main filters change ---
    useEffect(() => {
        if (selectedFaculty && selectedSubFaculty && selectedType) {
            fetchResources();
        }
    }, [selectedFaculty, selectedSubFaculty, selectedType, filterYear]); 
    // We re-fetch when these change. (Subject filtering is usually done client-side or separate API)

    const fetchResources = async () => {
        setLoading(true);
        try {
            // Build Query String
            const query = new URLSearchParams({
                faculty: selectedFaculty,
                subFaculty: selectedSubFaculty,
                resourceType: selectedType,
                year: filterYear, // Optional
            }).toString();

            const res = await axios.get(`http://localhost:5000/resources?${query}`);
            setResources(res.data);
        } catch (err) {
            console.error("Failed to fetch resources", err);
        } finally {
            setLoading(false);
        }
    };

    // --- RESET FUNCTION (To go back to start) ---
    const handleReset = () => {
        setSelectedFaculty(null);
        setSelectedSubFaculty(null);
        setSelectedType(null);
        setResources([]);
        setFilterYear('');
        setFilterSubject('');
    };

    useEffect(() => {
        checkUploadPermission();
    }, []);

    const checkUploadPermission = async () => {
        try {
            const token = await auth.currentUser.getIdToken();
            const res = await axios.get('http://localhost:5000/resouces/upload-status', {
                headers: { 'x-auth-tojen': token}
            });
            setCanUpload(res.data.canUpload);
        }catch (err) {
            console.error("Error checking permission", err);
        }finally{
            setCheckingStatus(false);
        }
    };

    // --- RENDER HELPERS ---
    
    // VIEW 1: Faculty Selection
    if (!selectedFaculty) {
        return (
            <div className="selection-container fade-in">
                <h2>Select Your School</h2>
                <div className="card-grid">
                    {Object.keys(FACULTIES).map(faculty => (
                        <div key={faculty} className="selection-card" onClick={() => setSelectedFaculty(faculty)}>
                            <h3>{faculty}</h3>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // VIEW 2: Sub-Faculty (Branch) Selection
    if (!selectedSubFaculty) {
        return (
            <div className="selection-container fade-in">
                <button className="back-btn" onClick={() => setSelectedFaculty(null)}>← Back</button>
                <h2>Select Your Branch / Department</h2>
                <div className="card-grid">
                    {FACULTIES[selectedFaculty].map(sub => (
                        <div key={sub} className="selection-card" onClick={() => setSelectedSubFaculty(sub)}>
                            <h3>{sub}</h3>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // VIEW 3: Type Selection (Notes vs PYQs)
    if (!selectedType) {
        return (
            <div className="selection-container fade-in">
                <button className="back-btn" onClick={() => setSelectedSubFaculty(null)}>← Back</button>
                <h2>What are you looking for?</h2>
                <div className="card-grid">
                    {RESOURCE_TYPES.map(type => (
                        <div key={type} className="selection-card type-card" onClick={() => setSelectedType(type)}>
                            <h3>{type}</h3>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // --- VIEW 4: THE DASHBOARD (Final View) ---
    return (
        <div className="resource-dashboard">
            {/* Header / Breadcrumb */}
            <div className="dashboard-header">
                <div className="breadcrumbs">
                    <span onClick={handleReset} className="crumb-link">Home</span> &gt; 
                    <span onClick={() => setSelectedSubFaculty(null)} className="crumb-link"> {selectedFaculty} </span> &gt; 
                    <span onClick={() => setSelectedType(null)} className="crumb-link"> {selectedSubFaculty} </span> &gt;
                    <span className="current-crumb"> {selectedType} </span>
                </div>
                {checkingStatus ? (
                    <span> checking permission.... </span>
                ) : (
                    <div className='upload-btn-wrapper'>
                        <button className={`upload-btn-primary ${!canUpload ? 'disabled' : ''}`} 
                        onClick={() => canUpload && setIsUploadModalOpen(true)}
                        disabled={!canUpload}
                        title={!canUpload ? "you already have a resouce pending approval": "Upload New Resource"}>
                            { canUpload? "+ Add Resource Here" : "⚠ Approval Pending"}
                        </button>
                        {!canUpload && (
                            <small className = "status-note">
                                (you can upload again once your previous file is approved)
                            </small>
                        )}
                    </div>
                )}
            </div>

            {/* Secondary Filters Bar */}
            <div className="filters-bar">
                <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
                    <option value="">All Years</option>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>

                <input 
                    type="text" 
                    placeholder="Search Subject..." 
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                />
            </div>

            {/* Resource Grid */}
            <div className="resources-grid">
                {loading ? <p>Loading...</p> : (
                    resources
                        .filter(res => !filterSubject || res.subject.toLowerCase().includes(filterSubject.toLowerCase()))
                        .map(res => (
                            <ResourceCard key={res._id} data={res} />
                        ))
                )}
                {!loading && resources.length === 0 && (
                    <div className="empty-state">
                        <p>No resources found here yet.</p>
                        <button onClick={() => setIsUploadModalOpen(true)}>Be the first to upload!</button>
                    </div>
                )}
            </div>

            {/* Upload Modal - We pass the selected filters so the user doesn't have to fill them again! */}
            {isUploadModalOpen && (
                <AddResourceModal 
                    close={() => setIsUploadModalOpen(false)}
                    prefillData={{
                        faculty: selectedFaculty,
                        subFaculty: selectedSubFaculty,
                        resourceType: selectedType,
                        year: filterYear
                    }}

                    onSuccess={() => {
                        setCanUpload(false);
                        setIsUploadModalOpen(false);
                    }}
                />
            )}
        </div>
    );
};

export default Resources;