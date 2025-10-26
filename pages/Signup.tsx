
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import { User, UserRole } from '../types';
import { Building, Users, ArrowLeft } from 'lucide-react';
import TelyaLogo from '../components/TelyaLogo';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';

const teamRoles = [
    { value: 'Designer', label: '🎨 Designer', role: 'employee' },
    { value: 'Filmmaker/Photographer', label: '🎥 Réalisateur/Photographe', role: 'employee' },
    { value: 'Video Editor', label: '🎬 Monteur Vidéo', role: 'employee' },
    { value: 'Développeur Web', label: '💻 Développeur Web', role: 'employee' },
    { value: 'Community Manager', label: '📱 Community Manager', role: 'employee' },
    { value: 'Commercial', label: '💼 Commercial', role: 'employee' },
    { value: 'Coordinateur', label: '🧠 Coordinateur', role: 'coordinator' },
    { value: 'Project Manager', label: '📋 Chef de Projet', role: 'project_manager' },
    { value: 'Admin', label: '👑 Admin', role: 'admin' },
];


interface SelectionScreenProps {
  onSelectUserType: (type: 'client' | 'team') => void;
}

const SelectionScreen: React.FC<SelectionScreenProps> = ({ onSelectUserType }) => (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center"
    >
        <h2 className="text-2xl font-semibold mb-6 text-foreground">Rejoindre Telya</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button onClick={() => onSelectUserType('client')} className="p-8 border-2 border-transparent rounded-2xl bg-secondary/50 hover:border-primary/50 transition-all text-left">
                <Building className="w-10 h-10 mb-3 text-primary" />
                <h3 className="font-bold text-lg text-foreground">Je suis un Client</h3>
                <p className="text-muted-foreground">Enregistrez votre entreprise pour gérer vos projets.</p>
            </button>
            <button onClick={() => onSelectUserType('team')} className="p-8 border-2 border-transparent rounded-2xl bg-secondary/50 hover:border-primary/50 transition-all text-left">
                <Users className="w-10 h-10 mb-3 text-primary" />
                <h3 className="font-bold text-lg text-foreground">Je fais partie de l'équipe Telya</h3>
                <p className="text-muted-foreground">Accédez à votre tableau de bord et à vos tâches.</p>
            </button>
        </div>
    </motion.div>
);


interface RegistrationFormProps {
    userType: 'client' | 'team';
    onBack: () => void;
    form: any;
    onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    onSubmit: (e: React.FormEvent) => Promise<void>;
    loading: boolean;
    error: string;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ 
    userType, 
    onBack, 
    form, 
    onFormChange, 
    onSubmit, 
    loading, 
    error
}) => (
     <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
     >
        <button onClick={onBack} className="flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Retour à la sélection
        </button>
        
        <form onSubmit={onSubmit} className="space-y-4">
            <h2 className="text-2xl font-semibold text-center text-foreground">
                {userType === 'client' ? 'Inscription Client' : "Inscription Membre de l'équipe"}
            </h2>
            
            <Input id="fullName" name="fullName" type="text" label="Nom complet" value={form.fullName} onChange={onFormChange} placeholder="John Doe" required />

            {userType === 'client' ? (
                <>
                    <Input id="companyName" name="companyName" type="text" label="Nom de l’entreprise ou hôtel" value={form.companyName} onChange={onFormChange} placeholder="Hotel El Aurassi" required />
                    <Input id="email" name="email" type="email" label="Adresse e-mail" value={form.email} onChange={onFormChange} placeholder="vous@entreprise.com" required />
                    <Input id="phone" name="phone" type="tel" label="Téléphone / WhatsApp" value={form.phone} onChange={onFormChange} required />
                    <Select id="sector" name="sector" label="Secteur d’activité" value={form.sector} onChange={onFormChange} required>
                        <option value="" disabled>Choisissez un secteur...</option>
                        <option value="Hôtellerie">Hôtellerie</option>
                        <option value="Tourisme">Tourisme</option>
                        <option value="Restauration">Restauration</option>
                        <option value="Loisir & Spa">Loisir & Spa</option>
                        <option value="Autre">Autre</option>
                    </Select>
                </>
            ) : (
                <>
                    <Input id="email" name="email" type="email" label="Adresse e-mail" value={form.email} onChange={onFormChange} placeholder="prenom.nom@telya.com" required />
                    <Select id="role" name="role" label="Poste dans l’agence" value={form.role} onChange={onFormChange} required>
                         {teamRoles.map(role => (
                            <option key={role.value} value={role.value}>{role.label}</option>
                        ))}
                    </Select>
                    <Input id="phone" name="phone" type="tel" label="Téléphone professionnel (WhatsApp)" value={form.phone} onChange={onFormChange} required />
                    <Input id="portfolioUrl" name="portfolioUrl" type="url" label="Lien Portfolio (Optionnel)" value={form.portfolioUrl} onChange={onFormChange} placeholder="https://votreportfolio.com" />
                </>
            )}
            
            <Input id="password" name="password" type="password" label="Mot de passe" value={form.password} onChange={onFormChange} placeholder="Au moins 6 caractères" required />
            <Input id="confirmPassword" name="confirmPassword" type="password" label="Confirmer le mot de passe" value={form.confirmPassword} onChange={onFormChange} placeholder="••••••••" required />
            
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            
            <Button type="submit" className="w-full py-3 !mt-6" disabled={loading}>
                {loading ? 'Création du compte...' : (userType === 'client' ? 'Créer mon compte client' : 'Créer le compte')}
            </Button>
        </form>
     </motion.div>
);


export default function Signup() {
    const navigate = useNavigate();
    const [userType, setUserType] = useState<'client' | 'team' | null>(null);
    const [form, setForm] = useState({
        fullName: '',
        companyName: '',
        email: '',
        phone: '',
        sector: '',
        password: '',
        confirmPassword: '',
        role: 'Designer', // Default role for team
        portfolioUrl: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    

    const resetFormState = () => {
        setForm({
            fullName: '',
            companyName: '',
            email: '',
            phone: '',
            sector: '',
            password: '',
            confirmPassword: '',
            role: 'Designer',
            portfolioUrl: '',
        });
        setError('');
    };

    const selectUserType = (type: 'client' | 'team') => {
        setUserType(type);
        resetFormState();
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (form.password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères.');
            setLoading(false);
            return;
        }

        if (form.password !== form.confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            setLoading(false);
            return;
        }

        try {
            const selectedRoleInfo = teamRoles.find(r => r.value === form.role);

            // Step 1: Sign up the user in Supabase Auth.
            // This will trigger the `handle_new_user` function in Supabase to create a basic profile.
            const { data: authData, error: signUpError } = await supabase.auth.signUp({
                email: form.email,
                password: form.password,
                options: {
                    data: {
                        name: form.fullName, // Use 'name' to match the trigger's expectation (raw_user_meta_data->>'name')
                        avatar_url: `https://i.pravatar.cc/150?u=${form.email}`
                    }
                }
            });

            if (signUpError) throw signUpError;
            if (!authData.user) throw new Error("L'inscription a échoué, aucun utilisateur retourné.");

            // Step 2: Update the profile created by the trigger with the full details from the form.
            const userId = authData.user.id;
            let profileData: Partial<User>;

            if (userType === 'client') {
                 profileData = {
                    name: form.fullName,
                    role: 'client',
                    company: form.companyName,
                    phone: form.phone,
                    sector: form.sector,
                    status: 'active',
                };
            } else { // Team member
                profileData = {
                    name: form.fullName,
                    role: selectedRoleInfo?.role as UserRole || 'employee',
                    jobTitle: selectedRoleInfo?.value, // Store jobTitle in the profiles table
                    phone: form.phone,
                    portfolioUrl: form.portfolioUrl,
                    status: 'active',
                };
            }
            
            const { data: updatedProfile, error: updateError } = await supabase
                .from('profiles')
                .update(profileData)
                .eq('id', userId)
                .select()
                .single();

            if (updateError) throw updateError;
            if (!updatedProfile) throw new Error("La mise à jour du profil a échoué.");

            // Step 3: Store complete user data in local storage and redirect.
            localStorage.setItem('telya_user', JSON.stringify(updatedProfile));

            switch(updatedProfile.role) {
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
            setError(err.message || "Une erreur s'est produite lors de l'inscription.");
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
            <div className="w-full max-w-lg">
                <div className="text-center mb-8">
                    <TelyaLogo className="text-primary mx-auto" />
                    <p className="text-muted-foreground mt-2">Quand le Luxe rencontre la Précision Numérique.</p>
                </div>
                <div className="bg-card p-8 rounded-2xl shadow-lg border border-border">
                    { !userType ? (
                        <SelectionScreen onSelectUserType={selectUserType} /> 
                    ) : (
                        <RegistrationForm 
                            userType={userType}
                            onBack={() => setUserType(null)}
                            form={form}
                            onFormChange={handleFormChange}
                            onSubmit={handleSubmit}
                            loading={loading}
                            error={error}
                        /> 
                    )}
                </div>
                 <p className="text-center text-sm text-muted-foreground mt-6">
                    Vous avez déjà un compte ?{' '} 
                    <Link to="/login" className="font-semibold text-primary hover:underline">
                        Se connecter
                    </Link>
                </p>
            </div>
        </div>
    );
}