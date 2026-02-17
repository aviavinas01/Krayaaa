import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import './AdminDashboard.css'; // Add the CSS below
import { auth } from '../../firebaseconfig';

const AdminDashboard = () => {
  const { authData } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('events'); // Tabs: 'events' or 'reports'
  
  // State for Data
  const [events, setEvents] = useState([]);
  const [reports, setReports] = useState([]);
  
  // State for New Event Form
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    imageUrl: '',
    registrationLink: '',
    eventDate: ''
  });

  // Fetch Data on Component Load
  useEffect(() => {
    if(!authData.isLoggedIn) return;
    fetchEvents();
    fetchReports();
  }, [authData.isLoggedIn]);

  const fetchEvents = async () => {
    try {
        const token = await auth.currentUser.getIdToken();
        const res = await axios.get('http://localhost:5000/admin/events', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        setEvents(res.data);
    } catch (err) {
        console.error("Failed to fetch events", err);
    }
  };

  const fetchReports = async () => {
    try {
        const token = await auth.currentUser.getIdToken();
        const res = await axios.get('http://localhost:5000/admin/reports', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        setReports(res.data);
    } catch (err) {
        console.error("Failed to fetch reports", err);
    }
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    try {  
        const token = await auth.currentUser.getIdToken();
        await axios.post('http://localhost:5000/admin/events', 
            {  ...newEvent},
            {
                headers: { 'Authorization': `Bearer ${token}` }
            }
        );
        alert('✅ Event Created Successfully!');
        setNewEvent({ title: '', description: '', imageUrl: '', registrationLink: '', eventDate: '' });
        fetchEvents(); // Refresh list
    } catch (err) {
        alert(' Error creating event');
    }
  };

  const handleDeleteEvent = async (id) => {
      if(!window.confirm("Are you sure you want to delete this event?")) return;
      try {
        const token = await auth.currentUser.getIdToken();
        await axios.delete(`http://localhost:5000/admin/events/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchEvents();
      } catch (err) {
          alert('Error deleting event');
      }
  };

  const handleReportAction = async (id, status) => {
      try {
        const token = await auth.currentUser.getIdToken();
        await axios.put(`http://localhost:5000/admin/reports/${id}`, { status }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchReports(); // Refresh list to remove resolved items
      } catch (err) {
          alert('Error updating report');
      }
  };

  return (
    <div className="admin-dashboard-container">
      <header className="admin-header">
        <h2> Admin Control Center</h2>
        <p>Welcome, Super Admin ({authData.firebaseUser?.email})</p>
      </header>
      
      {/* Navigation Tabs */}
      <div className="admin-tabs">
        <button 
            className={activeTab === 'events' ? 'active' : ''} 
            onClick={() => setActiveTab('events')}
        >
             Event Management
        </button>
        <button 
            className={activeTab === 'reports' ? 'active' : ''} 
            onClick={() => setActiveTab('reports')}
        >
            🚩 User Reports
        </button>
      </div>

      <div className="admin-content">
        {/* --- EVENTS SECTION --- */}
        {activeTab === 'events' && (
            <div className="events-section">
                <div className="event-form-card">
                    <h3>Add New Campus Event</h3>
                    <form onSubmit={handleEventSubmit} className="admin-form">
                        <input type="text" placeholder="Event Title" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} required />
                        <input type="text" placeholder="Image URL (http://...)" value={newEvent.imageUrl} onChange={e => setNewEvent({...newEvent, imageUrl: e.target.value})} required />
                        <input type="text" placeholder="Google Form / Reg Link" value={newEvent.registrationLink} onChange={e => setNewEvent({...newEvent, registrationLink: e.target.value})} required />
                        <input type="date" value={newEvent.eventDate} onChange={e => setNewEvent({...newEvent, eventDate: e.target.value})} />
                        <textarea placeholder="Event Description" value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} required />
                        <button type="submit" className="btn-create">Create Event</button>
                    </form>
                </div>

                <h3>Active Events</h3>
                <div className="admin-list">
                    {events.map(ev => (
                        <div key={ev._id} className="admin-list-item">
                            <img src={ev.imageUrl} alt="Event" className="event-thumb"/>
                            <div className="event-info">
                                <h4>{ev.title}</h4>
                                <small>{new Date(ev.eventDate).toDateString()}</small>
                            </div>
                            <button onClick={() => handleDeleteEvent(ev._id)} className="btn-delete">Delete</button>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* --- REPORTS SECTION (Updated) --- */}
        {activeTab === 'reports' && (
            <div className="reports-section">
                <h3>Pending Reports</h3>
                {reports.length === 0 ? <p className="empty-state">No pending reports.</p> : (
                    <div className="admin-list">
                        {reports.map(rep => (
                            <div key={rep._id} className="report-item">
                                <div className="report-header">
                                    {/* Display target type (e.g., DISCUSSION, USER) */}
                                    <span className={`badge ${rep.targetType}`}>{rep.targetType}</span>
                                    <span className="report-date">{new Date(rep.createdAt).toLocaleDateString()}</span>
                                </div>
                                
                                <p><strong>Reason:</strong> {rep.reason}</p>
                                
                                {/* Display Description if it exists */}
                                {rep.description && (
                                    <p className="report-desc">"{rep.description}"</p>
                                )}
                                
                                <p><small>Reported by: {rep.reporterUid?.email || rep.reporterUid?.username || 'Unknown'}</small></p>
                                
                                <div className="report-actions">
                                    {/* Use your exact Schema ENUMs here */}
                                    <button 
                                        onClick={() => handleReportAction(rep._id, 'ACTION_TAKEN')} 
                                        className="btn-resolve"
                                    >
                                        Take Action
                                    </button>
                                    <button 
                                        onClick={() => handleReportAction(rep._id, 'DISMISSED')} 
                                        className="btn-dismiss"
                                    >
                                        Dismiss
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;