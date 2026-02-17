import React from 'react';
import HotTopics from './Dashboard/HotTopics';
import TopReplies from './Dashboard/TopReplies';
import RecentReplies from './Dashboard/RecentReplies';
import './ForumDashboard.css';

function ForumDashboard() {
  return (
    <div className="dashboard-wrapper"> 
      
      {/* --- DESKTOP VIEW (Original Sidebar) --- */}
      {/* Hidden on mobile via CSS */}
      <div className="sidebar-container desktop-only"> 
        <div className="sidebar-header">
          <h2 className="sidebar-title">COMMUNITY PULSE</h2>
        </div>

        <div className="sidebar-content">
          <div className="sidebar-widget">
            <div className="widget-header">
              <h3>Trending Now</h3>
            </div>
            <div className="widget-body">
              <HotTopics />
            </div>
          </div>

          <div className="sidebar-widget">
            <div className="widget-header">
              <h3>High Value</h3>
            </div>
            <div className="widget-body">
              <TopReplies />
            </div>
          </div>

          <div className="sidebar-widget">
            <div className="widget-header">
              <h3>Just In</h3>
            </div>
            <div className="widget-body">
              <RecentReplies />
            </div>
          </div>
        </div>
      </div>

      {/* --- MOBILE TICKER VIEW (The 3 Strips) --- */}
      {/* Hidden on desktop via CSS */}
      <div className="mobile-ticker-container mobile-only">
        
        {/* Strip 1: Hot Topics */}
        <div className="ticker-strip green-strip">
           <div className="marquee-content">
              <HotTopics />
           </div>
        </div>

        {/* Strip 2: High Value */}
        <div className="ticker-strip dark-strip">
           <div className="marquee-content reverse-scroll">
              <TopReplies />
           </div>
        </div>

        {/* Strip 3: Just In */}
        <div className="ticker-strip dim-strip">
           <div className="marquee-content">
              <RecentReplies />
           </div>
        </div>

      </div>
    </div>
  );
}

export default ForumDashboard;