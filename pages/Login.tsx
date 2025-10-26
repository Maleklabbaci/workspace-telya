
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import TelyaLogo from '../components/TelyaLogo';
import { supabase } from '../lib/supabaseClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;

      if (data.user) {
        // Fetch profile from 'profiles' table
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

        if (profileError) throw profileError;

        if (profile.status === 'pending_validation') {
            await supabase.auth.signOut();
            throw new Error("Votre compte est en attente de validation par l'administrateur.");
        }
        if (profile.status === 'rejected') {
            await supabase.auth.signOut();
            throw new Error('Votre demande d’accès a été refusée par l’administrateur.');
        }

        // The 'profiles' table is the single source of truth for user data.
        localStorage.setItem('telya_user', JSON.stringify(profile));

        // Redirect based on role
        switch(profile.role) {
            case 'admin':
              navigate('/admin/dashboard');
              break;
            case 'client':
              navigate('/client/dashboard');
              break;
            case 'coordinator':
              navigate('/coordinator/dashboard');
              break;
            case 'project_manager':
            case 'employee':
              navigate('/dashboard');
              break;
            default:
              navigate('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Email ou mot de passe invalide. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md">
            <div className="text-center mb-8">
                <TelyaLogo className="text-primary mx-auto" />
                <p className="text-muted-foreground mt-2">Quand le Luxe rencontre la Précision Numérique.</p>
            </div>
            <div className="bg-card p-8 rounded-2xl shadow-lg border border-border">
                <h2 className="text-2xl font-semibold mb-6 text-center text-foreground">Bon retour</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        id="email"
                        type="email"
                        label="Adresse e-mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="vous@exemple.com"
                        required
                    />
                    <Input
                        id="password"
                        type="password"
                        label="Mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                    />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <Button type="submit" className="w-full py-3" disabled={loading}>
                        {loading ? <Spinner /> : 'Se connecter'}
                    </Button>
                </form>
                <p className="text-center text-sm text-muted-foreground mt-6">
                    Pour tout nouvel accès, veuillez contacter votre administrateur.
                </p>
            </div>
        </div>
    </div>
  );
}