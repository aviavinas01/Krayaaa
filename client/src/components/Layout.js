// components/Layout.js
import React from 'react';
import { Outlet, Link } from 'react-router-dom';
// import Navbar from './Navbar'; // If you have a navbar, import it here

const Layout = () => {
  return (
    <div className="app-layout">
      {/* <Navbar />  <-- Your Navbar goes here if you have one */}

      <main className="main-content">
        {/* The Outlet renders whatever child route is currently active */}
        <Outlet />
      </main>

      <footer className="footer-bar">
        <div className="footer-left">KRAYAA. © 2026</div>
        <div className="footer-links">
          <Link to="/terms">Terms & Conditions</Link>
          <span className="separator">/</span>
          <Link to="/code-of-conduct">Code of Conduct</Link>
        </div>
        <div className="footer-right">
          <span>STAY CURIOUS • STAY HIDDEN</span>
        </div>
      </footer>
    </div>
  );
};

export default Layout;