import React, { useContext } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { auth } from '../../firebaseconfig';
import { signOut } from 'firebase/auth';
import { FaUser, FaShoppingBag, FaCog, FaSignOutAlt, FaShieldAlt } from 'react-icons/fa'; // Import Icons
import ProfileOverview from './Overview';
import MyListings from './MyListings';
import ProfileSettings from './Settings';
import AdminDashboard from './AdminDashboard';

import './ProfileDashboard.css';

function ProfileDashboard() {
  const { logoutUser, authData } = useContext(AuthContext);
  const navigate = useNavigate();
  const isAdmin = authData.firebaseUser?.email?.startsWith("22054401");

  const handleLogout = async () => {
    await signOut(auth);
    logoutUser();
    navigate('/login');
  };

  return (
    <div className="profile-dashboard">
      {/* Sidebar */}
      <aside className="profile-sidebar">
        <div className="sidebar-links">
          
          <NavLink end to="/dashboard" title="Overview">
            <FaUser className="sidebar-icon" />
            <span className="sidebar-text">Overview</span>
          </NavLink>

          <NavLink to="/dashboard/listings" title="My Listings">
            <FaShoppingBag className="sidebar-icon" />
            <span className="sidebar-text">My Listings</span>
          </NavLink>

          <NavLink to="/dashboard/settings" title="Settings">
            <FaCog className="sidebar-icon" />
            <span className="sidebar-text">Settings</span>
          </NavLink>
          {isAdmin && (
            <NavLink to="/dashboard/admin" title="Administration" className="admin-link">
              <FaShieldAlt className="sidebar-icon" />
              <span className="sidebar-text"> Administration</span>
            </NavLink>
          )}

        </div>

        {/* Logout fixed at bottom */}
        <button className="sidebar-logout" onClick={handleLogout} title="Logout">
          <FaSignOutAlt className="sidebar-icon" />
          <span className="sidebar-text">Logout</span>
        </button>
      </aside>

      {/* Content */}
      <main className="profile-content">
        <Routes>
          <Route index element={<ProfileOverview />} />
          <Route path="listings" element={<MyListings />} />
          <Route path="settings" element={<ProfileSettings />} />
          {isAdmin && (
            <Route path="admin" element={<AdminDashboard/>} />
          )}
        </Routes>
      </main>
    </div>
  );
}

export default ProfileDashboard;