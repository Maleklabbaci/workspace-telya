
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Toast from '../components/ui/Toast';
import { Camera, Save } from 'lucide-react';
import { updateUser } from '../data/api';
import { supabase } from '../lib/supabaseClient';

const Profile: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [name, setName] = useState('');
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [showToast, setShowToast] = useState(false);
    
    useEffect(() => {
        const currentUser = JSON.parse(localStorage.getItem('telya_user') || 'null');
        if (currentUser) {
            setUser(currentUser);
            setName(currentUser.name);
            setAvatarPreview(currentUser.avatar_url || `https://i.pravatar.cc/150?u=${currentUser.id}`);
        }
    }, []);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setError('');
        if (!user) return;

        try {
             // --- Update Password ---
            if (newPassword) {
                if (newPassword.length < 6) {
                    throw new Error("Le nouveau mot de passe doit contenir au moins 6 caractères.");
                }
                if (newPassword !== confirmPassword) {
                    throw new Error('Les nouveaux mots de passe ne correspondent pas.');
                }
                const { error: authError } = await supabase.auth.updateUser({ password: newPassword });
                if (authError) throw authError;
            }

            // --- Update Profile Info ---
            const profileUpdates: Partial<User> = {};
            if (name !== user.name) profileUpdates.name = name;
            if (avatarPreview !== user.avatar_url) profileUpdates.avatar_url = avatarPreview || user.avatar_url;

            if (Object.keys(profileUpdates).length > 0) {
                 const updatedProfile = await updateUser(user.id, profileUpdates);
                 localStorage.setItem('telya_user', JSON.stringify(updatedProfile));
                 setUser(updatedProfile);
            }
           
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            
            setNewPassword('');
            setConfirmPassword('');

        } catch (e: any) {
            setError(e.message);
        }
    };
    
    if (!user) {
        return <div>Chargement du profil...</div>
    }

    return (
        <>
            <div>
                <h1 className="text-3xl font-bold text-foreground">Mon Profil</h1>
                <p className="mt-1 text-muted-foreground">Gérez vos informations personnelles et votre mot de passe.</p>
                
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1">
                        <Card className="text-center p-8">
                            <div className="relative w-32 h-32 mx-auto group">
                                <img src={avatarPreview || ''} alt="Avatar de l'utilisateur" className="w-32 h-32 rounded-full object-cover ring-4 ring-card" />
                                <label htmlFor="avatar-upload" className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <Camera className="w-8 h-8"/>
                                </label>
                                <input id="avatar-upload" type="file" className="hidden" onChange={handleAvatarChange} accept="image/*" />
                            </div>
                            <h2 className="mt-4 text-xl font-bold text-foreground">{user.name}</h2>
                            <p className="text-muted-foreground capitalize">{user.jobTitle || user.role.replace('_', ' ')}</p>
                        </Card>
                    </div>

                    <div className="md:col-span-2">
                        <Card>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold border-b border-border pb-2 mb-4">Informations Personnelles</h3>
                                    <div className="space-y-4">
                                        <Input label="Nom complet" value={name} onChange={e => setName(e.target.value)} />
                                        <Input label="Adresse e-mail" value={user.email} disabled className="bg-secondary/50 cursor-not-allowed" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold border-b border-border pb-2 mb-4">Changer le mot de passe</h3>
                                    <div className="space-y-4">
                                        <Input label="Nouveau mot de passe" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Laisser vide pour ne pas changer" />
                                        <Input label="Confirmer le nouveau mot de passe" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" />
                                    </div>
                                </div>
                                {error && <p className="text-red-500 text-sm">{error}</p>}
                                <div className="flex justify-end pt-4">
                                    <Button onClick={handleSave}>
                                        <Save className="w-5 h-5 mr-2" /> Enregistrer les modifications
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
            <Toast message="Profil mis à jour avec succès !" show={showToast} />
        </>
    );
};

export default Profile;
