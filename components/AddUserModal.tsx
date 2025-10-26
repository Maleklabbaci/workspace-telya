

import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Select from './ui/Select';
import Button from './ui/Button';
import Toast from './ui/Toast';
import { X } from 'lucide-react';
import { updateUser, createUser } from '../data/api';
import { supabase } from '../lib/supabaseClient';


interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserModified: () => void;
  initialRole?: UserRole;
  userToEdit?: User | null;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onUserModified, initialRole = 'client', userToEdit }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState<UserRole>(initialRole);
  const [jobTitle, setJobTitle] = useState('');
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  
  const isEditing = !!userToEdit;

  useEffect(() => {
    if (isOpen) {
        if (isEditing && userToEdit) {
            setName(userToEdit.name);
            setEmail(userToEdit.email);
            setRole(userToEdit.role);
            setCompany(userToEdit.company || '');
            setJobTitle(userToEdit.jobTitle || '');
        } else {
            resetForm();
            setRole(initialRole);
        }
    }
  }, [userToEdit, isEditing, initialRole, isOpen]);


  const resetForm = () => {
    setName('');
    setEmail('');
    setCompany('');
    setRole(initialRole);
    setJobTitle('');
    setPassword('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
        if (isEditing && userToEdit) {
            // --- Edit existing user profile ---
            const updates: Partial<User> = {
                name,
                role,
                company: role === 'client' ? company : undefined,
                jobTitle: role !== 'client' ? jobTitle : undefined,
            };
            await updateUser(userToEdit.id, updates);
        } else {
            // --- Add new user (auth + profile) ---
            if (!password) {
                setError('Un mot de passe est requis pour les nouveaux utilisateurs.');
                return;
            }
            // 1. Create auth user
            const { data: authData, error: signUpError } = await supabase.auth.signUp({
                email: email,
                password: password,
            });
            if (signUpError) throw signUpError;
            if (!authData.user) throw new Error("La création de l'utilisateur a échoué.");
            
            // 2. Call RPC to confirm email immediately, bypassing email confirmation flow
            const { error: confirmError } = await supabase.rpc('confirm_user_email', { user_id_to_confirm: authData.user.id });
            if (confirmError) {
                console.error("Erreur critique lors de la confirmation de l'e-mail via RPC:", confirmError);
                throw new Error(`La confirmation automatique a échoué: ${confirmError.message}. Assurez-vous que la fonction RPC 'confirm_user_email' est bien configurée.`);
            }

            // 3. Explicitly CREATE the profile in the public.profiles table
            const newUserProfile: Partial<User> = {
              id: authData.user.id,
              email: authData.user.email,
              name,
              role,
              status: 'active',
              company: role === 'client' ? company : undefined,
              jobTitle: role !== 'client' ? jobTitle : undefined,
              avatar_url: `https://i.pravatar.cc/150?u=${email}`
            };

            await createUser(newUserProfile);
        }
        
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        
        onUserModified();
        handleClose();
    } catch (err: any) {
        setError(err.message || 'Une erreur est survenue.');
    }
  };

  return (
    <>
        <Modal isOpen={isOpen} onClose={handleClose} className="w-full max-w-lg">
          <form onSubmit={handleSubmit}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-foreground">{isEditing ? "Modifier l'utilisateur" : 'Ajouter un utilisateur'}</h2>
                   <button type="button" onClick={handleClose} className="p-1 rounded-full hover:bg-accent">
                      <X className="w-6 h-6 text-muted-foreground" />
                  </button>
              </div>
              
              <div className="space-y-4">
                  <Select
                      label="Rôle de l'utilisateur"
                      value={role}
                      onChange={e => setRole(e.target.value as UserRole)}
                  >
                      <option value="client">Client</option>
                      <option value="employee">Employé</option>
                      <option value="project_manager">Chef de projet</option>
                      <option value="coordinator">Coordinateur</option>
                      <option value="admin">Admin</option>
                  </Select>

                  <Input label="Nom complet" value={name} onChange={e => setName(e.target.value)} required />
                  <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required disabled={isEditing} className={`${isEditing ? 'cursor-not-allowed bg-secondary/50' : ''}`}/>
                  
                  {role === 'client' ? (
                      <Input label="Nom de l'entreprise" value={company} onChange={e => setCompany(e.target.value)} required />
                  ) : (
                      <Input label="Poste" value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="ex: Designer, Monteur Vidéo..." />
                  )}

                  {!isEditing && (
                      <Input label="Mot de passe" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Définir un mot de passe temporaire" />
                  )}

                  {error && <p className="text-red-500 text-sm">{error}</p>}
              </div>
            </div>
            <div className="flex justify-end p-6 border-t border-border space-x-3 bg-secondary/50 rounded-b-2xl">
                <Button type="button" variant="secondary" onClick={handleClose}>Annuler</Button>
                <Button type="submit">{isEditing ? 'Enregistrer' : 'Ajouter l’utilisateur'}</Button>
            </div>
          </form>
        </Modal>
        <Toast message={`Utilisateur ${isEditing ? 'mis à jour' : 'ajouté'} avec succès !`} show={showToast} type="success" />
    </>
  );
};

export default AddUserModal;