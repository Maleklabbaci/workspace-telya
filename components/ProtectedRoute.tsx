
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { User, UserRole } from '../types';

interface ProtectedRouteProps {
  children: React.ReactElement;
  roles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
  const token = localStorage.getItem('telya_token');
  const userString = localStorage.getItem('telya_user');
  const location = useLocation();

  if (!token || !userString) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  const user: User = JSON.parse(userString);

  if (roles && roles.length > 0 && !roles.includes(user.role)) {
     // User has wrong role, redirect to their default dashboard
     let defaultPath = '/dashboard'; // Default for employee/pm
     if (user.role === 'client') {
        defaultPath = '/client/dashboard';
     } else if (user.role === 'admin') {
        defaultPath = '/admin/dashboard';
     } else if (user.role === 'coordinator') {
        defaultPath = '/coordinator/dashboard';
     }
     
     // Prevent redirect loops if they are already at their dashboard
     if (location.pathname === defaultPath) {
        return children;
     }

     return <Navigate to={defaultPath} replace />;
  }


  return children;
};

export default ProtectedRoute;