import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, Search, ChevronDown, Folder, CheckSquare } from 'lucide-react';
import { Project, Task, User } from '../types';
import { supabase, getLocalUser } from '../lib/supabaseClient';

// Mock notifications, in a real app this would come from an API
const mockNotifications = [
  { id: 1, text: 'Client Aura a approuvé un livrable.', time: 'il y a 2h', read: false },
  { id: 2, text: 'Nouvelle tâche assignée dans Luxury Villa Showcase.', time: 'il y a 5h', read: false },
  { id: 3, text: 'Le projet Hotel El Aurassi est passé en "en montage".', time: 'il y a 1j', read: true },
];

const Header: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<{ projects: Project[], tasks: Task[] }>({ projects: [], tasks: [] });
    const [showResults, setShowResults] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const [notifications, setNotifications] = useState(mockNotifications);
    const [showNotifications, setShowNotifications] = useState(false);
    const unreadCount = notifications.filter(n => !n.read).length;

    const searchRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setUser(getLocalUser());
    }, []);

    useEffect(() => {
        const fetchResults = async () => {
            if (searchTerm.length > 1) {
                setIsSearching(true);
                const { data: projectsData } = await supabase.from('projects').select('*').ilike('title', `%${searchTerm}%`).limit(3);
                const { data: tasksData } = await supabase.from('tasks').select('*').ilike('title', `%${searchTerm}%`).limit(3);
                
                setSearchResults({ projects: projectsData || [], tasks: tasksData || [] });
                setShowResults(true);
                setIsSearching(false);
            } else {
                setShowResults(false);
            }
        };

        const debounce = setTimeout(fetchResults, 300);
        return () => clearTimeout(debounce);
        
    }, [searchTerm]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('telya_user');
        navigate('/login');
    };

    const handleNotificationClick = () => {
        setShowNotifications(!showNotifications);
    };
    
    const handleMarkAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };
    
    const handleResultClick = (path: string) => {
        setSearchTerm('');
        setShowResults(false);
        navigate(path);
    };

    if (!user) return null;

  return (
    <header className="flex items-center justify-between h-20 px-8 bg-card border-b border-border">
      <div className="flex items-center">
        <div className="relative" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher projets, tâches..."
            className="w-64 pl-10 pr-4 py-2 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => searchTerm.length > 1 && setShowResults(true)}
          />
          {showResults && (
             <div className="absolute mt-2 w-full max-w-md bg-card rounded-md shadow-lg py-2 z-50 border border-border">
                {isSearching && <p className="px-4 py-2 text-sm text-muted-foreground">Recherche...</p>}
                {!isSearching && searchResults.projects.length === 0 && searchResults.tasks.length === 0 && (
                     <p className="px-4 py-2 text-sm text-muted-foreground">Aucun résultat trouvé.</p>
                )}
                {searchResults.projects.length > 0 && <h3 className="px-4 py-1 text-xs font-semibold text-muted-foreground">PROJETS</h3>}
                {searchResults.projects.map(project => (
                    <button key={project.id} onClick={() => handleResultClick(`/projects/${project.id}`)} className="w-full text-left flex items-center px-4 py-2 text-sm text-foreground hover:bg-accent">
                        <Folder className="w-4 h-4 mr-3 text-muted-foreground" />
                        {project.title}
                    </button>
                ))}
                {searchResults.tasks.length > 0 && <h3 className="px-4 pt-2 pb-1 text-xs font-semibold text-muted-foreground">TÂCHES</h3>}
                {searchResults.tasks.map(task => (
                     <button key={task.id} onClick={() => handleResultClick(`/projects/${task.project_id}`)} className="w-full text-left flex items-center px-4 py-2 text-sm text-foreground hover:bg-accent">
                        <CheckSquare className="w-4 h-4 mr-3 text-muted-foreground" />
                        {task.title}
                    </button>
                ))}
             </div>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-6">
        <div className="relative" ref={notificationRef}>
            <button onClick={handleNotificationClick} className="relative text-muted-foreground hover:text-foreground">
              <Bell className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              )}
            </button>
            {showNotifications && (
                 <div className="absolute right-0 mt-3 w-80 bg-card rounded-md shadow-lg z-50 border border-border">
                    <div className="p-3 border-b border-border flex justify-between items-center">
                        <h3 className="font-semibold text-sm text-foreground">Notifications</h3>
                        {unreadCount > 0 && (
                            <button onClick={handleMarkAllAsRead} className="text-xs text-primary font-semibold hover:underline focus:outline-none">
                                Tout marquer comme lu
                            </button>
                        )}
                    </div>
                    <div className="py-1 max-h-80 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map(notif => (
                                <div key={notif.id} className="flex items-start px-4 py-3 hover:bg-accent">
                                    {!notif.read && <div className="w-2 h-2 bg-primary rounded-full mt-1.5 mr-3 flex-shrink-0"></div>}
                                    <div className={notif.read ? 'ml-5' : ''}>
                                        <p className="text-sm text-foreground">{notif.text}</p>
                                        <p className="text-xs text-muted-foreground">{notif.time}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                           <p className="text-center text-sm text-muted-foreground py-4">Vous n'avez aucune notification.</p>
                        )}
                    </div>
                 </div>
            )}
        </div>
        <div className="relative group">
            <div className="flex items-center space-x-2 cursor-pointer">
                <img
                    src={user.avatar_url || `https://i.pravatar.cc/150?u=${user.id}`}
                    alt="User Avatar"
                    className="h-10 w-10 rounded-full object-cover"
                />
                <div className="hidden md:block">
                    <p className="font-semibold text-sm text-foreground">{user.name || 'Invité'}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.jobTitle || user.role?.replace('_', ' ') || 'Rôle'}</p>
                </div>
                <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
            </div>
            <div className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-lg py-1 z-50 hidden group-hover:block border border-border">
                <Link to="/profile" className="block px-4 py-2 text-sm text-foreground hover:bg-accent">Profil</Link>
                {user.role === 'admin' && (
                  <Link to="/admin/settings" className="block px-4 py-2 text-sm text-foreground hover:bg-accent">Paramètres</Link>
                )}
                <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm text-foreground hover:bg-accent">Déconnexion</button>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
