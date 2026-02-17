import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { auth } from '../../firebaseconfig';
import AvatarRing from '../../components/AvatarRing';
import './Overview.css';

// --- ICONS (Simple Inline SVGs for Professional Look) ---
// (Kept the same SVG object as it was fine)
const SocialIcons = {
  github: (
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
  ),
  twitter: (
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
  ),
  website: (
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm1 16.057v-3.057h2.994c-.059 1.143-.212 2.183-.442 3.057h-2.552zm-6.123-4.057h2.123v3.057c-1.23-.292-2.046-.864-2.428-1.611-.237-.463-.306-1.026-.207-1.446zm4.123-5.057v3.057h-2.994c.059-1.143.212-2.183.442-3.057h2.552zm6.123 4.057h-2.123v-3.057c1.23.292 2.046.864 2.428 1.611.237.463.306 1.026.207 1.446z"/></svg>
  ),
  cv: (
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
  )
};

function ProfileOverview() {
  // ... (Keep all your state and useEffect logic exactly the same) ...
  const { authData } = useContext(AuthContext);
  const user = authData.dbUser;

  const [profile, setProfile] = useState({ bio: '', socials: {} });
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioTemp, setBioTemp] = useState('');
  const [isAddingSocial, setIsAddingSocial] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('github');
  const [socialLinkTemp, setSocialLinkTemp] = useState('');
  const [replies, setReplies] = useState([]);
  const [loadingReplies, setLoadingReplies] = useState(true);
  const [showAllReplies, setShowAllReplies] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchAllData = async () => {
      try {
        const token = await auth.currentUser.getIdToken();
        const headers = { Authorization: `Bearer ${token}` };
        const profileRes = await axios.get('http://localhost:5000/profile/me', { headers });
        if (profileRes.data) {
          setProfile(profileRes.data);
          setBioTemp(profileRes.data.bio || '');
        }
        const repliesRes = await axios.get('http://localhost:5000/discussions/mine/replies', { headers });
        setReplies(repliesRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoadingReplies(false);
      }
    };
    fetchAllData();
  }, [user]);

  const handleSaveBio = async () => {
    setSaving(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const updatedProfile = { ...profile, bio: bioTemp };
      await axios.post('http://localhost:5000/profile/me', updatedProfile, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(updatedProfile);
      setIsEditingBio(false);
    } catch (err) {
      console.error(err);
      alert('Failed to save bio');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSocial = async () => {
    if (!socialLinkTemp) return;
    setSaving(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const updatedSocials = { ...profile.socials, [selectedPlatform]: socialLinkTemp };
      const updatedProfile = { ...profile, socials: updatedSocials };
      await axios.post('http://localhost:5000/profile/me', updatedProfile, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(updatedProfile);
      setIsAddingSocial(false);
      setSocialLinkTemp('');
    } catch (err) {
      console.error(err);
      alert('Failed to save social link');
    } finally {
      setSaving(false);
    }
  };
  
  if (!user) return null;
  const displayedReplies = showAllReplies ? replies : replies.slice(0, 3);
  const hasBio = profile.bio && profile.bio.length > 0;

  return (
    <div className="profile-overview-container">
      
      {/* --- TOP SECTION: 2-COLUMN GRID --- */}
      <div className="profile-main-grid">
        
        {/* --- LEFT COLUMN: BIO --- */}
        <div className="profile-bio-card">
          <h1 className="profile-name">{user.username}</h1>

          <div className="bio-wrapper">
            {!isEditingBio ? (
              <>
                {hasBio ? (
                  <>
                    <p className="profile-bio-text">{profile.bio}</p>
                    <button className="btn-text-only" onClick={() => setIsEditingBio(true)}>
                      EDIT_BIO //
                    </button>
                  </>
                ) : (
                  <div className="empty-bio-state">
                    <p>No bio yet. Tell the world who you are.</p>
                    <button className="btn-primary" onClick={() => setIsEditingBio(true)}>
                      + ADD BIO
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bio-edit-mode">
                <textarea
                  className="bio-textarea"
                  value={bioTemp}
                  onChange={(e) => setBioTemp(e.target.value)}
                  placeholder="Tell the community who you are..."
                  maxLength={500}
                />
                <div className="form-actions">
                  <button className="btn-cancel" onClick={() => setIsEditingBio(false)}>CANCEL</button>
                  <button className="btn-primary" onClick={handleSaveBio} disabled={saving}>
                    {saving ? 'SAVING...' : 'SAVE BIO'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- RIGHT COLUMN: ID CARD + SOCIALS --- */}
        <div className="profile-sidebar-col">
          
          {/* ID CARD BLOCK */}
          <div className="profile-id-block">
            <div className="avatar-wrapper">
              <AvatarRing 
                avatarId={user.avatarId} 
                reputation={user.reputation} 
                size={100} 
              />
            </div>
            <div className="id-details">
              <div className="id-row">
                <span className="id-label">REP:</span>
                <span className="id-value highlight">{user.reputation || 0} XP</span>
              </div>
              <div className="id-row">
                <span className="id-label">HOSTEL:</span>
                <span className="id-value">{user.hostelAddress}</span>
              </div>
              <div className="id-row email-row">
                <span className="id-value email">{user.email}</span>
              </div>
            </div>
          </div>

          {/* SOCIAL LINKS BLOCK */}
          <div className="social-block">
            <div className="social-icons-row">
              {profile.socials && Object.entries(profile.socials).map(([key, url]) => {
                if (!url) return null;
                return (
                  <a 
                    key={key} href={url} target="_blank" rel="noreferrer" 
                    className={`social-circle-icon ${key}`}
                    title={key.toUpperCase()}
                  >
                    {SocialIcons[key] || SocialIcons.website}
                  </a>
                );
              })}

              <button 
                className={`add-social-btn ${isAddingSocial ? 'active' : ''}`}
                onClick={() => setIsAddingSocial(!isAddingSocial)}
                title="Add Link"
              >
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
              </button>
            </div>

            {isAddingSocial && (
              <div className="add-social-form-inline">
                <select 
                  value={selectedPlatform} 
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="social-select"
                >
                  <option value="github">GitHub</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="twitter">X / Twitter</option>
                  <option value="website">Portfolio</option>
                  <option value="cv">CV / Resume</option>
                </select>
                <input 
                  type="url" 
                  placeholder="https://..."
                  className="social-url-input"
                  value={socialLinkTemp}
                  onChange={(e) => setSocialLinkTemp(e.target.value)}
                />
                <button className="btn-icon-save" onClick={handleAddSocial} disabled={saving}>
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* --- BOTTOM SECTION: RECENT ACTIVITY --- */}
      <div className="profile-activity-section">
        <h3 className="section-heading">RECENT TRANSMISSIONS</h3>
        
        {loadingReplies ? (
          <div className="loading-state">Scanning records...</div>
        ) : replies.length === 0 ? (
          <div className="empty-state">No recent community activity detected.</div>
        ) : (
          <>
            <div className="replies-grid">
              {displayedReplies.map((reply) => (
                <div key={reply._id} className="reply-card">
                  <div className="reply-card-header">
                    <span className="reply-meta">RE: {reply.threadTitle}</span>
                  </div>
                  <p className="reply-content">"{reply.text}"</p>
                </div>
              ))}
            </div>
            
            {replies.length > 3 && (
              <button 
                className="btn-view-more" 
                onClick={() => setShowAllReplies(!showAllReplies)}
              >
                {showAllReplies ? "COLLAPSE LOG" : `VIEW ALL (${replies.length})`}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ProfileOverview;