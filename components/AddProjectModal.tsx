import React, { useState, useEffect } from 'react';
import { Project, User, ProjectStatus } from '../types';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Select from './ui/Select';
import Button from './ui/Button';
import Toast from './ui/Toast';
import Textarea from './ui/Textarea';
import { X } from 'lucide-react';
import { mockUsers } from '../data/mockData';

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
        // Load clients for dropdown
        const allStoredUsers: User[] = JSON.parse(localStorage.getItem('telya_users') || '[]');
        const allUsers = [...mockUsers, ...allStoredUsers];
        const uniqueUsers = allUsers.filter((v,i,a)=>a.findIndex(t=>(t.email === v.email))===i);
        setClients(uniqueUsers.filter(u => u.role === 'client'));

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (!formState.client_id) {
            setError('Please select a client.');
            return;
        }

        const storedProjects: Project[] = JSON.parse(localStorage.getItem('telya_projects') || '[]');
        
        if (isEditing && projectToEdit) {
            const updatedProject: Project = { ...projectToEdit, ...formState };
            const projectIndex = storedProjects.findIndex(p => p.id === projectToEdit.id);
            if (projectIndex !== -1) {
                storedProjects[projectIndex] = updatedProject;
            } else {
                // This handles editing a default mock project
                 storedProjects.push(updatedProject);
            }
            localStorage.setItem('telya_projects', JSON.stringify(storedProjects));

        } else {
            const newProject: Project = {
                id: `proj-${Date.now()}`,
                ...formState,
                percent_complete: 0,
                updated_at: new Date().toISOString(),
            };
            const updatedProjects = [...storedProjects, newProject];
            localStorage.setItem('telya_projects', JSON.stringify(updatedProjects));
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
                    <h2 className="text-2xl font-bold text-foreground">{isEditing ? 'Edit Project' : 'Create New Project'}</h2>
                    <button type="button" onClick={handleClose} className="p-1 rounded-full hover:bg-accent">
                        <X className="w-6 h-6 text-muted-foreground" />
                    </button>
                </div>
              
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <Input label="Project Title" name="title" value={formState.title} onChange={handleInputChange} required />
                    <Textarea label="Description" name="description" value={formState.description} onChange={handleInputChange} rows={3} required />
                    <Select label="Client" name="client_id" value={formState.client_id} onChange={handleInputChange} required>
                        <option value="" disabled>Select a client...</option>
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
                         <Select label="Status" name="status" value={formState.status} onChange={handleInputChange}>
                            <option value="draft">Draft</option>
                            <option value="active">Active</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                             <option value="archived">Archived</option>
                        </Select>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <Input type="date" label="Start Date" name="start_date" value={formState.start_date} onChange={handleInputChange} required />
                        <Input type="date" label="Due Date" name="due_date" value={formState.due_date} onChange={handleInputChange} required />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
            </div>
            <div className="flex justify-end p-6 border-t border-border space-x-3 bg-secondary/50 rounded-b-2xl">
                <Button type="button" variant="secondary" onClick={handleClose}>Cancel</Button>
                <Button type="submit">{isEditing ? 'Save Changes' : 'Create Project'}</Button>
            </div>
          </form>
        </Modal>
        <Toast message={`Project ${isEditing ? 'updated' : 'created'} successfully!`} show={showToast} type="success" />
    </>
  );
};

export default AddProjectModal;