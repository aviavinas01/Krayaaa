import React from 'react';
import { Outlet, useLocation } from 'react-router-dom'; // Import useLocation
import ForumDashboard from './ForumDashboard';
import './ForumLayout.css';

function ForumLayout() {
  const location = useLocation();
  
  // Check if we are strictly on the main forums page
  const isForumHome = location.pathname === '/forums';

  return (
    <div className="forum-layout">
      {/* Pass the isForumHome prop to dashboard so it knows 
        if it should show the ticker or standard view on mobile 
      */}
      <aside className={`forum-sidebar ${isForumHome ? 'mobile-visible' : 'mobile-hidden'}`}>
        <ForumDashboard isMobileView={isForumHome} />
      </aside>

      <main className="forum-main">
        <Outlet />
      </main>
    </div>
  );
}

export default ForumLayout;