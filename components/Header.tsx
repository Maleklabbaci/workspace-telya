import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, Search, ChevronDown, Folder, CheckSquare } from 'lucide-react';
import { Project, Task, User, Notification } from '../types';
import { supabase, getLocalUser } from '../lib/supabaseClient';
import { getNotifications, markAllNotificationsAsRead, markNotificationAsRead } from '../data/api';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/fr';

dayjs.extend(relativeTime);
dayjs.locale('fr');


const Header: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<{ projects: Project[], tasks: Task[] }>({ projects: [], tasks: [] });
    const [showResults, setShowResults] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const unreadCount = notifications.filter(n => !n.is_read).length;

    const searchRef = useRef<HTMLDivElement>(null);
    const notificationRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setUser(getLocalUser());
    }, []);

    // Fetch initial notifications
    useEffect(() => {
        const fetchNotifications = async () => {
            if (user?.id) {
                const data = await getNotifications(user.id);
                setNotifications(data);
            }
        };
        if (user) {
            fetchNotifications();
        }
    }, [user]);

    // Set up Supabase real-time subscription for new notifications
    useEffect(() => {
        if (!user?.id) return;

        const channel = supabase
            .channel('public:notifications')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
                async (payload) => {
                    const { data: notificationsData, error } = await supabase
                        .from('notifications')
                        .select('*, actor:actor_id!left(name, avatar_url)')
                        .eq('id', payload.new.id)
                        .limit(1);
                    
                    if (error) {
                        console.error("Error fetching new notification:", error);
                    } else if (notificationsData && notificationsData.length > 0) {
                        const newNotification = notificationsData[0];
                        if (!newNotification.actor) {
                            (newNotification as any).actor = { name: 'Utilisateur Supprimé', avatar_url: '' };
                        }
                        setNotifications(prev => [newNotification as Notification, ...prev]);
                    }
                }
            )
            .subscribe();
        
        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id]);

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
    
    const handleMarkAllAsRead = async () => {
        if (!user) return;
        await markAllNotificationsAsRead(user.id);
        setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    };
    
    const handleResultClick = (path: string) => {
        setSearchTerm('');
        setShowResults(false);
        navigate(path);
    };

    const handleNotificationItemClick = async (notification: Notification) => {
        if (!notification.is_read) {
            await markNotificationAsRead(notification.id);
            setNotifications(notifications.map(n => n.id === notification.id ? { ...n, is_read: true } : n));
        }
        navigate(notification.link_to);
        setShowNotifications(false);
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
            <button onClick={() => setShowNotifications(!showNotifications)} className="relative text-muted-foreground hover:text-foreground">
              <Bell className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              )}
            </button>
            {showNotifications && (
                 <div className="absolute right-0 mt-3 w-96 bg-card rounded-md shadow-lg z-50 border border-border">
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
                                <div key={notif.id} onClick={() => handleNotificationItemClick(notif)} className="flex items-start px-4 py-3 hover:bg-accent cursor-pointer">
                                    {!notif.is_read && <div className="w-2 h-2 bg-primary rounded-full mt-1.5 mr-3 flex-shrink-0"></div>}
                                    <div className={`flex-1 ${notif.is_read ? 'pl-5' : ''}`}>
                                        <div className="flex items-center">
                                            <img src={notif.actor?.avatar_url || `https://i.pravatar.cc/150?u=${notif.actor_id}`} alt={notif.actor?.name} className="w-6 h-6 rounded-full mr-2" />
                                            <p className="text-sm text-foreground" dangerouslySetInnerHTML={{ __html: notif.message }}></p>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1 ml-8">{dayjs(notif.created_at).fromNow()}</p>
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