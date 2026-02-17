import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_ROUTES = {
    ADMIN: '/admin',
    RESIDENT: '/resident',
    TECHNICIAN: '/technician'
};

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user } = useAuth();

    if (!user) return <Navigate to="/login" replace />;

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to={ROLE_ROUTES[user.role] || '/login'} replace />;
    }

    return children;
};

export default ProtectedRoute;
