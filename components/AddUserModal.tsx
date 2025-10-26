import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Select from './ui/Select';
import Button from './ui/Button';
import Toast from './ui/Toast';
import { X } from 'lucide-react';
// FIX: Correctly import saveUsers
import { getUsers, saveUsers } from '../data/api';

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
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [role, setRole] = useState<UserRole>(initialRole);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);
  
  const isEditing = !!userToEdit;

  useEffect(() => {
    if (isEditing && userToEdit) {
        setName(userToEdit.name);
        setEmail(userToEdit.email);
        setRole(userToEdit.role);
        setCompany(userToEdit.company || '');
        setJobTitle(userToEdit.jobTitle || '');
    } else {
        setRole(initialRole);
    }
  }, [userToEdit, isEditing, initialRole, isOpen]);


  const resetForm = () => {
    setName('');
    setEmail('');
    setCompany('');
    setJobTitle('');
    setRole(initialRole);
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // FIX: Make handleSubmit async to handle API calls
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // FIX: Await user data
    const existingUsers = await getUsers();
    
    // FIX: Call .some on the resolved array
    if (!isEditing && existingUsers.some(u => u.email === email)) {
      setError('Un utilisateur avec cet e-mail existe déjà.');
      return;
    }

    if (isEditing && userToEdit) {
        // Edit logic
        // FIX: Call .findIndex on the resolved array
        const userIndex = existingUsers.findIndex(u => u.id === userToEdit.id);
        if (userIndex !== -1) {
            existingUsers[userIndex] = {
                ...existingUsers[userIndex],
                name,
                email,
                role,
                company: role === 'client' ? company : undefined,
                jobTitle: ['employee', 'project_manager', 'admin', 'coordinator'].includes(role) ? jobTitle : undefined,
            };
            // FIX: Await saving users
            await saveUsers(existingUsers);
        }
    } else {
        // Add new user logic
        const newUser: User = {
          id: `${role}-${Date.now()}`,
          name,
          email,
          role,
          password: 'password123', // Default password for new users
          status: 'active',
          company: role === 'client' ? company : undefined,
          jobTitle: ['employee', 'project_manager', 'admin', 'coordinator'].includes(role) ? jobTitle : undefined,
          avatar_url: `https://i.pravatar.cc/150?u=${email}`
        };
        // FIX: Await saving users
        await saveUsers([...existingUsers, newUser]);
    }
    
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
    
    onUserModified();
    handleClose();
  };

  return (
    <>
        <Modal isOpen={isOpen} onClose={handleClose} className="w-full max-w-lg">
          <form onSubmit={handleSubmit}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-foreground">{isEditing ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}</h2>
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
                  
                  {role === 'client' && (
                      <Input label="Nom de l'entreprise" value={company} onChange={e => setCompany(e.target.value)} required />
                  )}

                  {['employee', 'project_manager', 'coordinator'].includes(role) && (
                      <Input label="Poste" value={jobTitle} onChange={e => setJobTitle(e.target.value)} required placeholder="ex: Vidéaste" />
                  )}

                  {error && <p className="text-red-500 text-sm">{error}</p>}
              </div>
            </div>
            <div className="flex justify-end p-6 border-t border-border space-x-3 bg-secondary/50 rounded-b-2xl">
                <Button type="button" variant="secondary" onClick={handleClose}>Annuler</Button>
                <Button type="submit">{isEditing ? 'Enregistrer' : 'Ajouter'}</Button>
            </div>
          </form>
        </Modal>
        <Toast message={`Utilisateur ${isEditing ? 'mis à jour' : 'ajouté'} avec succès !`} show={showToast} type="success" />
    </>
  );
};

export default AddUserModal;