import React, { useState, useEffect } from 'react';
// FIX: Correct import for react-router-dom components and hooks.
import { Navigate, useLocation } from 'react-router-dom';
import { User, UserRole } from '../types';
import { supabase, getLocalUser } from '../lib/supabaseClient';
import Spinner from './ui/Spinner';

interface ProtectedRouteProps {
  children: React.ReactElement;
  roles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
  const [sessionChecked, setSessionChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setSessionChecked(true);
    };
    
    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (!sessionChecked) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  const user: User | null = getLocalUser();

  if (!user) {
    // This can happen briefly during a redirect after login
    return (
        <div className="flex h-screen items-center justify-center">
            <Spinner />
        </div>
    );
  }
  
  if (roles && roles.length > 0 && !roles.includes(user.role)) {
     let defaultPath = '/dashboard'; 
     if (user.role === 'client') {
        defaultPath = '/client/dashboard';
     } else if (user.role === 'admin') {
        defaultPath = '/admin/dashboard';
     } else if (user.role === 'coordinator') {
        defaultPath = '/coordinator/dashboard';
     }
     
     if (location.pathname === defaultPath) {
        return children;
     }

     return <Navigate to={defaultPath} replace />;
  }

  return children;
};

export default ProtectedRoute;