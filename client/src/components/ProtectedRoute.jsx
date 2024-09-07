import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ isAuthenticated, isAllowed, children }) => {
    if (!isAuthenticated || !isAllowed) {
        return <Navigate to="/" replace />;
    }
    return children;
};

export default ProtectedRoute;
