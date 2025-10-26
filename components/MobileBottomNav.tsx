import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Folder, CheckSquare, User as UserIcon, LayoutGrid, Briefcase } from 'lucide-react';
import { User } from '../types';
import { getLocalUser } from '../lib/supabaseClient';

const icons = { Home, Folder, CheckSquare, User: UserIcon, LayoutGrid, Briefcase };

const MobileBottomNav = () => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        setUser(getLocalUser());
    }, []);
    
    const navItems = [
        // Employee, PM
        { to: '/dashboard', label: 'Accueil', icon: 'Home', roles: ['employee', 'project_manager'] },
        // Coordinator
        { to: '/coordinator/dashboard', label: 'Accueil', icon: 'Home', roles: ['coordinator'] },
        // Admin
        { to: '/admin/dashboard', label: 'Accueil', icon: 'LayoutGrid', roles: ['admin'] },
        
        // Employee, PM
        { to: '/projects', label: 'Projets', icon: 'Folder', roles: ['employee', 'project_manager'] },
        // Admin
        { to: '/admin/projects', label: 'Projets', icon: 'Folder', roles: ['admin'] },

        // Employee, PM
        { to: '/tasks', label: 'Tâches', icon: 'CheckSquare', roles: ['employee', 'project_manager'] },
        // Admin
        { to: '/admin/employees', label: 'Employés', icon: 'Briefcase', roles: ['admin'] },
        
        // All internal
        { to: '/profile', label: 'Profil', icon: 'User', roles: ['admin', 'project_manager', 'employee', 'coordinator'] },
    ];
    
    if (!user || user.role === 'client') {
        return null;
    }
    
    const accessibleItems = navItems.filter(item => user && item.roles.includes(user.role));

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-card/80 backdrop-blur-lg border-t border-border z-30">
            <nav className="flex justify-around items-center h-full">
                {accessibleItems.map((item) => {
                    const Icon = icons[item.icon as keyof typeof icons] || Home;
                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to.endsWith('dashboard') || item.to === '/'}
                            className={({ isActive }) =>
                                `flex flex-col items-center justify-center w-full h-full text-xs font-bold transition-colors duration-200 ${
                                    isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                                }`
                            }
                        >
                            <Icon className="h-6 w-6 mb-1" />
                            <span>{item.label}</span>
                        </NavLink>
                    );
                })}
            </nav>
        </div>
    );
};
export default MobileBottomNav;
