import React from 'react';
import { AVATARS } from '../constants/avatars';
import './AvatarSelector.css';

function AvatarSelector({ value, onChange }) {
  return (
    <div className="avatar-selection-wrapper">
      <div className="avatar-grid">
        {AVATARS.map((avatar) => {
          const isSelected = value === avatar.id;
          return (
            <button
              type="button"
              key={avatar.id}
              className={`avatar-btn ${isSelected ? 'selected' : ''}`}
              onClick={() => onChange(avatar.id)}
              aria-label={`Select avatar ${avatar.id}`}
              aria-pressed={isSelected}
            >
              <img src={avatar.src} alt={`Avatar ${avatar.id}`} />
              {isSelected && <div className="active-dot"></div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default AvatarSelector;