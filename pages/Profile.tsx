import React, { useState, useEffect } from 'react';
import { User } from '../types';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Toast from '../components/ui/Toast';
import { Camera, Save } from 'lucide-react';

const Profile: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [name, setName] = useState('');
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [currentPassword, setCurrentPassword] = useState('');
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

    const handleSave = () => {
        setError('');
        if (newPassword && newPassword !== confirmPassword) {
            setError('New passwords do not match.');
            return;
        }

        if (user) {
            // In a real app, you'd verify the currentPassword against the server/hashed password
            const allUsers: User[] = JSON.parse(localStorage.getItem('telya_users') || '[]');
            const defaultUsers: User[] = JSON.parse(localStorage.getItem('telya_default_users') || '[]');
            const combinedUsers = [...defaultUsers, ...allUsers];

            const userIndex = combinedUsers.findIndex(u => u.id === user.id);

            const updatedUser: User = {
                ...user,
                name: name,
                avatar_url: avatarPreview || user.avatar_url,
                password: newPassword ? newPassword : user.password,
            };
            
            if (userIndex !== -1) {
                // We must separate the default users from the localstorage users before saving
                const registeredUsers = combinedUsers.filter(u => !defaultUsers.some(du => du.id === u.id));
                const updatedRegisteredUserIndex = registeredUsers.findIndex(u => u.id === user.id);
                if(updatedRegisteredUserIndex !== -1){
                    registeredUsers[updatedRegisteredUserIndex] = updatedUser;
                } else {
                    // This case handles when a default user is modified
                    registeredUsers.push(updatedUser)
                }
                localStorage.setItem('telya_users', JSON.stringify(registeredUsers));
            }

            localStorage.setItem('telya_user', JSON.stringify(updatedUser));
            setUser(updatedUser);

            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        }
    };
    
    if (!user) {
        return <div>Loading profile...</div>
    }

    return (
        <>
            <div>
                <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
                <p className="mt-1 text-muted-foreground">Manage your personal information and password.</p>
                
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1">
                        <Card className="text-center p-8">
                            <div className="relative w-32 h-32 mx-auto group">
                                <img src={avatarPreview || ''} alt="User Avatar" className="w-32 h-32 rounded-full object-cover ring-4 ring-card" />
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
                                    <h3 className="text-lg font-semibold border-b border-border pb-2 mb-4">Personal Information</h3>
                                    <div className="space-y-4">
                                        <Input label="Full Name" value={name} onChange={e => setName(e.target.value)} />
                                        <Input label="Email Address" value={user.email} disabled className="bg-secondary/50 cursor-not-allowed" />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold border-b border-border pb-2 mb-4">Change Password</h3>
                                    <div className="space-y-4">
                                        <Input label="Current Password" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••••" />
                                        <Input label="New Password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" />
                                        <Input label="Confirm New Password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" />
                                    </div>
                                </div>
                                {error && <p className="text-red-500 text-sm">{error}</p>}
                                <div className="flex justify-end pt-4">
                                    <Button onClick={handleSave}>
                                        <Save className="w-5 h-5 mr-2" /> Save Changes
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
            <Toast message="Profile updated successfully!" show={showToast} />
        </>
    );
};

export default Profile;