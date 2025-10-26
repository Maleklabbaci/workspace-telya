import React, { useState, useEffect } from 'react';
// FIX: Correct import for react-router-dom useNavigate hook.
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { LogOut } from 'lucide-react';
import Button from './ui/Button';
import TelyaLogo from './TelyaLogo';
import { supabase, getLocalUser } from '../lib/supabaseClient';

const ClientHeader: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getLocalUser());
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('telya_user');
    navigate('/login');
  };
  
  return (
    <header className="flex items-center justify-between h-20 px-4 sm:px-6 md:px-10 bg-card border-b border-border">
      <div className="flex items-center space-x-4">
        <TelyaLogo className="text-3xl text-primary" />
      </div>
      <div className="flex items-center space-x-6">
        {user && (
           <div className="flex items-center space-x-3">
             {user.logoUrl ? (
                <img src={user.logoUrl} alt={`${user.company} logo`} className="h-10 w-10 object-contain rounded-full" />
             ) : (
                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-primary font-bold">
                    {user.company?.charAt(0)}
                </div>
             )}
            <div>
                 <p className="font-semibold text-sm text-foreground hidden sm:block">
                    {user.company || user.name}
                 </p>
                 <p className="text-xs text-muted-foreground">Client Portal</p>
            </div>
           </div>
        )}
        <Button onClick={handleLogout} variant="secondary" className="!px-3">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};

export default ClientHeader;
