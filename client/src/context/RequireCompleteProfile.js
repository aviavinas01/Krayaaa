// client/src/components/RequireCompleteProfile.js
import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const RequireCompleteProfile = ({ children }) => {
  const { authData, isLoading } = useContext(AuthContext);
  const location = useLocation();

  if (isLoading) return <div>Loading...</div>;

  // 1. If not even logged into Firebase, send to login
  if (!authData.isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. ✅ THE ENFORCER: If Firebase user exists but MongoDB user (dbUser) does not
  // Use optional chaining (?.) to prevent the "undefined" crash you saw in your console
  if (!authData.dbUser?.username) {
    return <Navigate to="/completeProfile" replace />;
  }

  // 3. Only if both exist, allow access to Forum/Marketplace
  return children;
};

export default RequireCompleteProfile;