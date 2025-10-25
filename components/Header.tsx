import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, Search, ChevronDown } from 'lucide-react';

const Header: React.FC = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('telya_user') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('telya_token');
        localStorage.removeItem('telya_user');
        navigate('/login');
    };

  return (
    <header className="flex items-center justify-between h-20 px-8 bg-card border-b border-border">
      <div className="flex items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects, tasks..."
            className="w-64 pl-10 pr-4 py-2 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>
      <div className="flex items-center space-x-6">
        <button className="relative text-muted-foreground hover:text-foreground">
          <Bell className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </button>
        <div className="relative group">
            <div className="flex items-center space-x-2 cursor-pointer">
                <img
                    src={user.avatar_url || `https://i.pravatar.cc/150?u=${user.id}`}
                    alt="User Avatar"
                    className="h-10 w-10 rounded-full object-cover"
                />
                <div className="hidden md:block">
                    <p className="font-semibold text-sm text-foreground">{user.name || 'Guest User'}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.jobTitle || user.role?.replace('_', ' ') || 'Role'}</p>
                </div>
                <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
            </div>
            <div className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-lg py-1 z-50 hidden group-hover:block border border-border">
                <Link to="/profile" className="block px-4 py-2 text-sm text-foreground hover:bg-accent">Profile</Link>
                <a href="#/settings" className="block px-4 py-2 text-sm text-foreground hover:bg-accent">Settings</a>
                <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm text-foreground hover:bg-accent">Logout</button>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;