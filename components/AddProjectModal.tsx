import React, { useState, useEffect } from 'react';
import { Project, User, ProjectStatus } from '../types';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Select from './ui/Select';
import Button from './ui/Button';
import Toast from './ui/Toast';
import Textarea from './ui/Textarea';
import { X } from 'lucide-react';
// FIX: Correctly import saveProjects
import { getUsers, getProjects, saveProjects } from '../data/api';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectAdded: () => void;
  projectToEdit?: Project | null;
}

const AddProjectModal: React.FC<AddProjectModalProps> = ({ isOpen, onClose, onProjectAdded, projectToEdit }) => {
    const isEditing = !!projectToEdit;
    const [clients, setClients] = useState<User[]>([]);
    const [showToast, setShowToast] = useState(false);
    const [error, setError] = useState('');
    const [formState, setFormState] = useState({
        title: '',
        description: '',
        client_id: '',
        pack: 'Standard' as Project['pack'],
        start_date: '',
        due_date: '',
        status: 'draft' as ProjectStatus,
    });
    
    useEffect(() => {
        // FIX: Fetch clients asynchronously
        const fetchClients = async () => {
            const allUsers = await getUsers();
            setClients(allUsers.filter(u => u.role === 'client'));
        }
        
        if (isOpen) {
            fetchClients();
        }

        if (isEditing && projectToEdit) {
            setFormState({
                title: projectToEdit.title,
                description: projectToEdit.description,
                client_id: projectToEdit.client_id,
                pack: projectToEdit.pack,
                start_date: projectToEdit.start_date,
                due_date: projectToEdit.due_date,
                status: projectToEdit.status,
            });
        } else {
             resetForm();
        }
    }, [projectToEdit, isEditing, isOpen]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormState({
            title: '',
            description: '',
            client_id: '',
            pack: 'Standard',
            start_date: '',
            due_date: '',
            status: 'draft',
        });
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
        
        if (!formState.client_id) {
            setError('Veuillez sélectionner un client.');
            return;
        }

        // FIX: Await project data
        const storedProjects = await getProjects();
        
        if (isEditing && projectToEdit) {
            const updatedProject: Project = { ...projectToEdit, ...formState };
            const projectIndex = storedProjects.findIndex(p => p.id === projectToEdit.id);
            if (projectIndex !== -1) {
                storedProjects[projectIndex] = updatedProject;
            } else {
                 storedProjects.push(updatedProject);
            }
            // FIX: Await saving projects
            await saveProjects(storedProjects);

        } else {
            const newProject: Project = {
                id: `proj-${Date.now()}`,
                ...formState,
                percent_complete: 0,
                updated_at: new Date().toISOString(),
            };
            // FIX: Await saving projects
            await saveProjects([...storedProjects, newProject]);
        }
        
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        
        onProjectAdded();
        handleClose();
    };

  return (
    <>
        <Modal isOpen={isOpen} onClose={handleClose} className="w-full max-w-2xl">
          <form onSubmit={handleSubmit}>
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-foreground">{isEditing ? 'Modifier le Projet' : 'Créer un Nouveau Projet'}</h2>
                    <button type="button" onClick={handleClose} className="p-1 rounded-full hover:bg-accent">
                        <X className="w-6 h-6 text-muted-foreground" />
                    </button>
                </div>
              
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <Input label="Titre du Projet" name="title" value={formState.title} onChange={handleInputChange} required />
                    <Textarea label="Description" name="description" value={formState.description} onChange={handleInputChange} rows={3} required />
                    <Select label="Client" name="client_id" value={formState.client_id} onChange={handleInputChange} required>
                        <option value="" disabled>Sélectionner un client...</option>
                        {clients.map(client => (
                            <option key={client.id} value={client.id}>{client.company}</option>
                        ))}
                    </Select>
                    <div className="grid grid-cols-2 gap-4">
                        <Select label="Pack" name="pack" value={formState.pack} onChange={handleInputChange}>
                            <option value="Essai">Essai</option>
                            <option value="Standard">Standard</option>
                            <option value="Gold">Gold</option>
                            <option value="Diamond">Diamond</option>
                        </Select>
                         <Select label="Statut" name="status" value={formState.status} onChange={handleInputChange}>
                            <option value="draft">Brouillon</option>
                            <option value="active">Actif</option>
                            <option value="in_progress">En cours</option>
                            <option value="completed">Terminé</option>
                            <option value="archived">Archivé</option>
                        </Select>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <Input type="date" label="Date de début" name="start_date" value={formState.start_date} onChange={handleInputChange} required />
                        <Input type="date" label="Date de fin" name="due_date" value={formState.due_date} onChange={handleInputChange} required />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
            </div>
            <div className="flex justify-end p-6 border-t border-border space-x-3 bg-secondary/50 rounded-b-2xl">
                <Button type="button" variant="secondary" onClick={handleClose}>Annuler</Button>
                <Button type="submit">{isEditing ? 'Enregistrer' : 'Créer le Projet'}</Button>
            </div>
          </form>
        </Modal>
        <Toast message={`Projet ${isEditing ? 'mis à jour' : 'créé'} avec succès !`} show={showToast} type="success" />
    </>
  );
};

export default AddProjectModal;