import React from 'react';
import { Navigate } from 'react-router-dom';
import Auth from './Auth';

const ProtectedRoute = ({ children }) => {
    return (
        <Auth>
            {children}
        </Auth>
    );
};

export default ProtectedRoute;
