// client/src/components/AvatarRing.js
import React from 'react';
import { AVATAR_MAP} from '../constants/avatars';
import './AvatarRing.css';

function getRingClass(reputation = 0) {
  if (reputation >= 100) return 'ring-gold';
  if (reputation >= 50) return 'ring-silver';
  if (reputation >= 20) return 'ring-bronze';
  return 'ring-green';
}

function AvatarRing({ avatarId, reputation = 0, size = 36 }) {
  const avatarSrc = AVATAR_MAP[avatarId] || AVATAR_MAP[1];

  return (
    <span
      className={`avatar-ring ${getRingClass(reputation)}`}
      style={{ width: size, height: size }}
    >
      <img
        src={avatarSrc}
        alt="User avatar"
        className="avatar-image"
      />
    </span>
  );
}

export default AvatarRing;
