import React, { useContext, useState, useEffect,useRef } from 'react';
import axios from 'axios';
import { NavLink, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaBell } from 'react-icons/fa';
import AvatarRing from '../components/AvatarRing';
import KrayaaLogo from './krayaa.png';
import './Navbar.css';

function Navbar() {
  const { authData } = useContext(AuthContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // --- NOTIFICATION STATE ---
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);

  // --- SCROLL ANIMATION STATE ---
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // 1. Scroll Handler Logic
  const controlNavbar = () => {
    if (typeof window !== 'undefined') {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 800) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    }
  };
  useEffect(() => {
    window.addEventListener('scroll', controlNavbar);
    return () => {
      window.removeEventListener('scroll', controlNavbar);
    };
  }, [lastScrollY]);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 3. Notification Fetching (Existing)
  useEffect(() => {
    if (!authData.isLoggedIn || !authData.hasProfile) return;

    async function fetchNotifications(){
      try {
        const token = await authData.firebaseUser.getIdToken();
        const res = await axios.get(
          'http://localhost:5000/notifications/latest?limit=6',
          {headers: { Authorization: `Bearer ${token}`}}
        );
        setNotifications(res.data);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    }
    fetchNotifications();
  }, [authData.isLoggedIn, authData.hasProfile]);

  useEffect(() => {
    function handleClickOutside(event){
          if(dropdownRef.current && !dropdownRef.current.contains(event.target)){
            setShowNotifications(false);
          }
        }
        document.addEventListener("mousedown",handleClickOutside);
        return() => {
          document.removeEventListener("mousedown",handleClickOutside);
    };
  }, [dropdownRef]);

  // 4. Body Scroll Lock (Existing)
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : 'unset';
  }, [mobileMenuOpen]);

  return (
    <>
      {/* Dynamic Class: Appends 'navbar-hidden' if isVisible is false */}
      <nav className={`navbar ${!isVisible ? 'navbar-hidden' : ''}`}>
        
        {/* 1. Left: Brand */}
        <div className="navbar-left">
          <Link to="/" className="navbar-brand">
            <img src={KrayaaLogo} alt="Krayaa Logo" style={{ width: "50px", height: "50px" }} />

          </Link>
        </div>

        {/* ------------------------------------------------------ */}
        {/* 2. CENTER: Desktop Links (Hidden on Mobile via CSS)    */}
        {/* ------------------------------------------------------ */}
        {authData.isLoggedIn && authData.hasProfile && (
          <div className="navbar-links">
            <NavLink to="/forums">Forums</NavLink>
            <NavLink to="/resources">Resources</NavLink>
            <NavLink to="/buy-sell">Market</NavLink>
            <NavLink to="/rentals">Rentals</NavLink>
          </div>
        )}

        {/* ------------------------------------------------------ */}
        {/* 3. CENTER: MOBILE PS5 CONTROLLER NAV (Existing)        */}
        {/* ------------------------------------------------------ */}
        {authData.isLoggedIn && authData.hasProfile && (
          <div className="mobile-ps5-nav">
            
            {/* TRIANGLE -> FORUMS */}
            <Link to="/forums" className="ps5-btn triangle" aria-label="Forums">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4L4 20H20L12 4Z" />
              </svg>
            </Link>

            {/* SQUARE -> MARKET (buy-sell) */}
            <Link to="/buy-sell" className="ps5-btn square" aria-label="Market">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <rect x="5" y="5" width="14" height="14" />
              </svg>
            </Link>

            {/* CIRCLE -> RESOURCES */}
            <Link to="/resources" className="ps5-btn circle" aria-label="Resources">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="8" />
              </svg>
            </Link>

            {/* CROSS -> RENTALS */}
            <Link to="/rentals" className="ps5-btn cross" aria-label="Rentals">
              <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </Link>

          </div>
        )}

        {/* ------------------------------------------------------ */}
        {/* 4. Right Side: Notifications & Profile                 */}
        {/* ------------------------------------------------------ */}
        <div className="navbar-right-side">
            
            {/* Notification Bell */}
            {authData.isLoggedIn && (
              <div className="notification-wrapper" ref={dropdownRef}>
                <button
                  className={"notification-btn"}
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <FaBell />
                  {notifications.some(n => !n.isRead) && <span className="dot" />}
                </button>

                {showNotifications && (
                  <div className="notification-dropdown">
                    {notifications.length === 0 && (
                      <p className="empty">No notifications</p>
                    )}

                    {notifications.map(n => (
                      <Link
                        key={n._id}
                        to={n.link || '#'}
                        className={`notification-item ${n.isRead ? '' : 'unread'}`}
                        onClick={() => setShowNotifications(false)}
                      >
                        <strong>{n.title}</strong>
                        <p>{n.message}</p>
                        <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Profile or Sign In Button */}
            {authData.isLoggedIn && authData.hasProfile && (
                <NavLink to="/dashboard" className="profile-link">
                  <AvatarRing 
                    avatarId={authData.dbUser.avatarId} 
                    reputation={authData.dbUser.reputation} 
                    size={36} 
                  />
                </NavLink>
            )}
            
        </div>
      </nav>
    </>
  );
}

export default Navbar;