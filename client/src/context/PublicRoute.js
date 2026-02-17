import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const PublicRoute = ({ children }) => {
    const { authData } = useContext(AuthContext);

    if (authData.isLoggedIn) {
        return <Navigate to="/" />;
    }

    return children;
};

export default PublicRoute;
