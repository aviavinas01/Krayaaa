import React from 'react';
// Simple PDF icon (or use an <img> if you have an icon file)
const PdfIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: '#e74c3c'}}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const ResourceCard = ({ data }) => {
  return (
    <div className="resource-card">
      <div className="card-icon">
        <PdfIcon />
      </div>
      
      <div className="card-content">
        <div className="card-header">
          <span className={`badge ${data.resourceType === 'Notes' ? 'badge-blue' : 'badge-orange'}`}>
            {data.resourceType}
          </span>
          <span className="card-date">{new Date(data.createdAt).toLocaleDateString()}</span>
        </div>

        <h3 className="card-title">{data.title}</h3>
        
        <p className="card-meta">
          <strong>Subject:</strong> {data.subject} <br/>
          <strong>Year:</strong> {data.year}
        </p>

        <div className="card-footer">
            <small>By: {data.contributedBy}</small>
            <a 
                href={data.fileUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="view-btn"
            >
                View PDF
            </a>
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;