import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Folder, CheckSquare, DollarSign, Users, Shield, Briefcase, Settings, LayoutGrid, ClipboardCheck, User as UserIcon } from 'lucide-react';
import { User } from '../types';
import TelyaLogo from './TelyaLogo';
import { getLocalUser } from '../lib/supabaseClient';

const icons = { Home, Folder, CheckSquare, DollarSign, Users, Shield, Briefcase, Settings, LayoutGrid, ClipboardCheck, User: UserIcon };

const Sidebar: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getLocalUser());
  }, []);

  const mainNavItems = [
    // Employee & PM
    { to: '/dashboard', label: 'Tableau de bord', icon: 'Home', roles: ['employee', 'project_manager'] },
    { to: '/projects', label: 'Projets', icon: 'Folder', roles: ['employee', 'project_manager'] },
    { to: '/tasks', label: 'Mes Tâches', icon: 'CheckSquare', roles: ['employee', 'project_manager'] },
    
    // PM Only
    { to: '/billing', label: 'Facturation', icon: 'DollarSign', roles: ['project_manager'] },
    { to: '/team', label: 'Équipe', icon: 'Users', roles: ['project_manager'] },
    
    // Coordinator Only
    { to: '/coordinator/dashboard', label: 'Tableau de bord Coord.', icon: 'Home', roles: ['coordinator'] },
    { to: '/coordinator/projects', label: 'Vue Globale', icon: 'LayoutGrid', roles: ['coordinator'] },
    { to: '/coordinator/team-tasks', label: 'Tâches Équipe', icon: 'ClipboardCheck', roles: ['coordinator'] },
    
    // Admin Only
    { to: '/admin/dashboard', label: 'Tableau de bord', icon: 'Home', roles: ['admin'] },
    { to: '/admin/clients', label: 'Clients', icon: 'Users', roles: ['admin'] },
    { to: '/admin/employees', label: 'Employés', icon: 'Briefcase', roles: ['admin'] },
    { to: '/admin/projects', label: 'Tous les Projets', icon: 'Folder', roles: ['admin'] },
    { to: '/admin/invoices', label: 'Factures', icon: 'DollarSign', roles: ['admin'] },
  ];
  
  const bottomNavItems = [
      { to: '/profile', label: 'Mon Profil', icon: 'User', roles: ['admin', 'project_manager', 'employee', 'coordinator'] },
      { to: '/admin/settings', label: 'Paramètres', icon: 'Settings', roles: ['admin'] },
  ];
  
  const accessibleMainItems = mainNavItems.filter(item => user && item.roles.includes(user.role));
  const accessibleBottomItems = bottomNavItems.filter(item => user && item.roles.includes(user.role));

  if (!user) {
    return null; // or a loading skeleton
  }

  return (
    <div className="hidden md:flex flex-col w-64 bg-card text-card-foreground border-r border-border">
      <div className="flex items-center justify-center h-20 border-b border-border px-6">
        <TelyaLogo className="text-primary" />
      </div>
      <div className="flex-1 flex flex-col justify-between px-4 py-6">
        <nav>
            {accessibleMainItems.map((item) => {
              const Icon = icons[item.icon as keyof typeof icons] || Home;
              return (
              <NavLink
                key={item.label + item.to}
                to={item.to}
                end={item.to.endsWith('dashboard')}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 my-1 rounded-lg transition-colors duration-200 ${
                    isActive ? 'bg-primary text-primary-foreground font-semibold' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`
                }
              >
                <Icon className="h-5 w-5 mr-3" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            )})}
        </nav>
        <nav>
            {accessibleBottomItems.map((item) => {
              const Icon = icons[item.icon as keyof typeof icons] || Home;
              return (
              <NavLink
                key={item.label + item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 my-1 rounded-lg transition-colors duration-200 ${
                    isActive ? 'bg-primary text-primary-foreground font-semibold' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`
                }
              >
                <Icon className="h-5 w-5 mr-3" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            )})}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
