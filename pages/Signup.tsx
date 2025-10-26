import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import { User, UserRole } from '../types';
import { Building, Users, ArrowLeft } from 'lucide-react';
import TelyaLogo from '../components/TelyaLogo';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { getUsers } from '../data/api';

const teamRoles = [
    { value: 'Designer', label: '🎨 Designer', role: 'employee' },
    { value: 'Filmmaker', label: '🎥 Réalisateur', role: 'employee' },
    { value: 'Video Editor', label: '🎬 Monteur Vidéo', role: 'employee' },
    { value: 'Developpeur', label: '💻 Développeur', role: 'employee' },
    { value: 'Commercial', label: '💼 Commercial', role: 'employee' },
    { value: 'Coordinateur', label: '🧠 Coordinateur', role: 'coordinator' },
    { value: 'Admin', label: '👑 Admin', role: 'admin' },
];


export default function Signup() {
    const [userType, setUserType] = useState<'client' | 'team' | null>(null);
    const [form, setForm] = useState({
        fullName: '',
        companyName: '',
        contactEmail: '', // user's own email for client OR team
        email: '', // sign-in email for both
        phone: '',
        sector: '',
        password: '',
        confirmPassword: '',
        role: 'Designer', // Default role for team
        portfolioUrl: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    
    useEffect(() => {
        if (userType === 'team') {
            const generatedEmail = form.fullName
                .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
                .toLowerCase()
                .trim()
                .replace(/\s+/g, '.') // replace spaces with dots
                .replace(/[^a-z0-9.]/g, ''); // remove special characters except dot
            
            if (generatedEmail) {
                setForm(f => ({ ...f, email: `${generatedEmail}@telya.com` }));
            } else {
                setForm(f => ({...f, email: ''}));
            }
        }
    }, [form.fullName, userType]);

    const resetFormState = () => {
        setForm({
            fullName: '',
            companyName: '',
            contactEmail: '',
            email: '',
            phone: '',
            sector: '',
            password: '',
            confirmPassword: '',
            role: 'Designer',
            portfolioUrl: '',
        });
        setError('');
        setSuccessMessage('');
    };

    const selectUserType = (type: 'client' | 'team') => {
        setUserType(type);
        resetFormState();
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const companyName = e.target.value;
        const prefixes = ['hotel', 'hôtel'];
        let slug = companyName.toLowerCase().trim();
        for (const prefix of prefixes) {
            if (slug.startsWith(prefix + ' ')) {
                slug = slug.substring(prefix.length + 1);
            }
        }
        slug = slug.replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
        const signInEmail = slug ? `${slug}@telya.com` : '';

        setForm(f => ({ ...f, companyName, email: signInEmail }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');

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
            // Check if email already exists in users table (not auth table)
            const { data: existingUsers, error: fetchError } = await supabase
                .from('users')
                .select('email')
                .eq('email', form.email);

            if (fetchError) throw fetchError;

            if (existingUsers && existingUsers.length > 0) {
                setError('Un compte avec cet e-mail de connexion existe déjà.');
                setLoading(false);
                return;
            }

            // Step 1: Sign up the user in Supabase Auth
            const { data: authData, error: signUpError } = await supabase.auth.signUp({
                email: form.email,
                password: form.password,
            });

            if (signUpError) throw signUpError;
            if (!authData.user) throw new Error("L'inscription a échoué, aucun utilisateur retourné.");

            // Step 2: Insert user profile into the public 'users' table
            let profileData: Omit<User, 'password'>;
            const registrationDate = new Date().toISOString();
            const userId = authData.user.id;

            if (userType === 'client') {
                 profileData = {
                    id: userId,
                    name: form.fullName,
                    email: form.email,
                    role: 'client',
                    company: form.companyName,
                    avatar_url: `https://i.pravatar.cc/150?u=${form.email}`,
                    contactEmail: form.contactEmail,
                    phone: form.phone,
                    sector: form.sector,
                    status: 'pending_validation',
                    registeredAt: registrationDate,
                };
            } else { // Team member
                const selectedRoleInfo = teamRoles.find(r => r.value === form.role);
                profileData = {
                    id: userId,
                    name: form.fullName,
                    email: form.email,
                    role: selectedRoleInfo?.role as UserRole || 'employee',
                    jobTitle: selectedRoleInfo?.value,
                    contactEmail: form.contactEmail,
                    phone: form.phone,
                    avatar_url: `https://i.pravatar.cc/150?u=${form.email}`,
                    portfolioUrl: form.portfolioUrl,
                    status: 'pending_validation',
                    registeredAt: registrationDate,
                };
            }
            
            const { error: insertError } = await supabase.from('users').insert(profileData);

            if (insertError) {
                // Optional: handle profile insertion failure (e.g., delete the auth user)
                throw insertError;
            }
            
            setSuccessMessage("Votre inscription est terminée ! Votre compte est maintenant en attente de validation par l'administrateur.");

        } catch (err: any) {
            setError(err.message || "Une erreur s'est produite lors de l'inscription.");
        } finally {
            setLoading(false);
        }
    };
    
    const SelectionScreen = () => (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
        >
            <h2 className="text-2xl font-semibold mb-6 text-foreground">Rejoindre Telya</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button onClick={() => selectUserType('client')} className="p-8 border-2 border-transparent rounded-2xl bg-secondary/50 hover:border-primary/50 transition-all text-left">
                    <Building className="w-10 h-10 mb-3 text-primary" />
                    <h3 className="font-bold text-lg text-foreground">Je suis un Client</h3>
                    <p className="text-muted-foreground">Enregistrez votre entreprise pour gérer vos projets.</p>
                </button>
                <button onClick={() => selectUserType('team')} className="p-8 border-2 border-transparent rounded-2xl bg-secondary/50 hover:border-primary/50 transition-all text-left">
                    <Users className="w-10 h-10 mb-3 text-primary" />
                    <h3 className="font-bold text-lg text-foreground">Je fais partie de l'équipe Telya</h3>
                    <p className="text-muted-foreground">Accédez à votre tableau de bord et à vos tâches.</p>
                </button>
            </div>
        </motion.div>
    );

    const RegistrationForm = () => (
         <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
         >
            <button onClick={() => setUserType(null)} className="flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" /> Retour à la sélection
            </button>
            
            {successMessage ? (
                 <div className="text-center p-6 bg-green-500/10 rounded-lg">
                    <h3 className="text-xl font-semibold text-green-500">Merci !</h3>
                    <p className="text-green-500/80 mt-2">{successMessage}</p>
                 </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <h2 className="text-2xl font-semibold text-center text-foreground">
                        {userType === 'client' ? 'Inscription Client' : "Inscription Membre de l'équipe"}
                    </h2>
                    
                    <Input id="fullName" name="fullName" type="text" label="Nom complet" value={form.fullName} onChange={handleFormChange} placeholder="John Doe" required />

                    {userType === 'client' ? (
                        <>
                            <Input id="companyName" name="companyName" type="text" label="Nom de l’entreprise ou hôtel" value={form.companyName} onChange={handleCompanyNameChange} placeholder="Hotel El Aurassi" required />
                            <Input id="contactEmail" name="contactEmail" type="email" label="Adresse e-mail" value={form.contactEmail} onChange={handleFormChange} placeholder="vous@entreprise.com" required />
                            <div>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    label="E-mail de connexion"
                                    value={form.email}
                                    readOnly
                                    required
                                    placeholder="Généré depuis le nom de l'entreprise..."
                                    className="bg-secondary/50 cursor-not-allowed focus:ring-0 focus:border-border"
                                />
                                <p className="text-xs text-muted-foreground mt-1.5 px-1">
                                    Cet identifiant est généré automatiquement.
                                </p>
                            </div>
                            <Input id="phone" name="phone" type="tel" label="Téléphone / WhatsApp" value={form.phone} onChange={handleFormChange} required />
                            <Select id="sector" name="sector" label="Secteur d’activité" value={form.sector} onChange={handleFormChange} required>
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
                            <Input id="contactEmail" name="contactEmail" type="email" label="Adresse e-mail" value={form.contactEmail} onChange={handleFormChange} placeholder="votre.email@personnel.com" required />
                            <div>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    label="E-mail de connexion"
                                    value={form.email}
                                    readOnly
                                    required
                                    placeholder="Généré depuis votre nom..."
                                    className="bg-secondary/50 cursor-not-allowed focus:ring-0 focus:border-border"
                                />
                                <p className="text-xs text-muted-foreground mt-1.5 px-1">
                                    Cet e-mail est généré automatiquement à partir de votre nom complet.
                                </p>
                            </div>
                            <Select id="role" name="role" label="Rôle dans l’agence" value={form.role} onChange={handleFormChange} required>
                                 {teamRoles.map(role => (
                                    <option key={role.value} value={role.value}>{role.label}</option>
                                ))}
                            </Select>
                            <Input id="phone" name="phone" type="tel" label="Téléphone professionnel (WhatsApp)" value={form.phone} onChange={handleFormChange} required />
                            <Input id="portfolioUrl" name="portfolioUrl" type="url" label="Lien Portfolio (Optionnel)" value={form.portfolioUrl} onChange={handleFormChange} placeholder="https://votreportfolio.com" />
                        </>
                    )}
                    
                    <Input id="password" name="password" type="password" label="Mot de passe" value={form.password} onChange={handleFormChange} placeholder="Au moins 6 caractères" required />
                    <Input id="confirmPassword" name="confirmPassword" type="password" label="Confirmer le mot de passe" value={form.confirmPassword} onChange={handleFormChange} placeholder="••••••••" required />
                    
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    
                    <Button type="submit" className="w-full py-3 !mt-6" disabled={loading}>
                        {loading ? 'Création du compte...' : (userType === 'client' ? 'Créer mon compte client' : 'Créer le compte')}
                    </Button>
                </form>
            )}
         </motion.div>
    );

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
            <div className="w-full max-w-lg">
                <div className="text-center mb-8">
                    <TelyaLogo className="text-primary mx-auto" />
                    <p className="text-muted-foreground mt-2">Quand le Luxe rencontre la Précision Numérique.</p>
                </div>
                <div className="bg-card p-8 rounded-2xl shadow-lg border border-border">
                    { !userType ? <SelectionScreen /> : <RegistrationForm /> }
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