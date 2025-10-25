import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { User } from '../types';
import Spinner from '../components/ui/Spinner';
import { mockUsers as defaultUsers } from '../data/mockData';
import TelyaLogo from '../components/TelyaLogo';


// Mock API call that now checks localStorage
const handleAuthentication = (email: string, password: string): Promise<{ accessToken: string; user: User }> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const registeredUsers: User[] = JSON.parse(localStorage.getItem('telya_users') || '[]');
            const allUsers = [...defaultUsers, ...registeredUsers];
            
            const foundUser = allUsers.find(u => u.email === email && (u.password === password || (u.role === 'admin' && password === 'admin')));

            if (foundUser) {
                if (foundUser.status === 'pending_validation') {
                    reject(new Error('Your account is pending admin approval.'));
                    return;
                }
                if (foundUser.status === 'rejected') {
                    reject(new Error('Votre demande d’accès a été refusée par l’administrateur.'));
                    return;
                }

                // In a real app, password shouldn't be part of the user object sent to the client.
                const { password, ...userToStore } = foundUser;
                const accessToken = `fake-jwt-token-for-${userToStore.id}`;
                resolve({ accessToken, user: userToStore as User });
            } else {
                reject(new Error('Invalid credentials'));
            }
        }, 800);
    });
};

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
      const { accessToken, user } = await handleAuthentication(email, password);
      
      localStorage.setItem('telya_token', accessToken);
      localStorage.setItem('telya_user', JSON.stringify(user));

      // Redirect based on role
      switch(user.role) {
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

    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md">
            <div className="text-center mb-8">
                <TelyaLogo className="text-primary mx-auto" />
                <p className="text-muted-foreground mt-2">Where Luxury Meets Digital Precision.</p>
            </div>
            <div className="bg-card p-8 rounded-2xl shadow-lg border border-border">
                <h2 className="text-2xl font-semibold mb-6 text-center text-foreground">Welcome Back</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        id="email"
                        type="email"
                        label="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                    />
                    <Input
                        id="password"
                        type="password"
                        label="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                    />
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <Button type="submit" className="w-full py-3" disabled={loading}>
                        {loading ? <Spinner /> : 'Sign In'}
                    </Button>
                </form>
                <p className="text-center text-sm text-muted-foreground mt-6">
                    Don't have an account? <Link to="/signup" className="font-semibold text-primary hover:underline">Sign up</Link>
                </p>
            </div>
        </div>
    </div>
  );
}