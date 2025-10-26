
import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import AddUserModal from '../components/AddUserModal';
import { User, Project } from '../types';
// FIX: Correctly import saveUsers
import { getUsers, getProjects, saveUsers } from '../data/api';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

const AdminClients: React.FC = () => {
    const [clients, setClients] = useState<User[]>([]);
    // FIX: Add state for projects to use in getProjectCount
    const [projects, setProjects] = useState<Project[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // FIX: Load both clients and projects asynchronously
    const loadData = async () => {
        const allUsers = await getUsers();
        setClients(allUsers.filter(u => u.role === 'client'));
        const allProjects = await getProjects();
        setProjects(allProjects);
    };

    useEffect(() => {
        loadData();
    }, []);

    const getProjectCount = (clientId: string) => {
        // FIX: Use projects from state
        return projects.filter(p => p.client_id === clientId).length;
    };
    
    const handleEdit = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    // FIX: Make handleDelete async
    const handleDelete = async (userId: string) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible.')) {
            const allUsers = await getUsers();
            const updatedUsers = allUsers.filter(u => u.id !== userId);
            // FIX: Await saveUsers
            await saveUsers(updatedUsers);
            loadData();
        }
    };
    
    const handleModalClose = () => {
        setEditingUser(null);
        setIsModalOpen(false);
    };
    
    const handleModalSuccess = () => {
        loadData();
        handleModalClose();
    };

  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Gérer les Clients</h1>
                <p className="mt-1 text-muted-foreground">Voir, ajouter ou modifier les comptes clients.</p>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>
                <PlusCircle className="w-5 h-5 mr-2" /> Ajouter un client
            </Button>
        </div>
        
        <Card>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-xs text-muted-foreground uppercase border-b border-border">
                            <th className="py-3 px-4 font-semibold">Entreprise</th>
                            <th className="py-3 px-4 font-semibold">Nom du contact</th>
                            <th className="py-3 px-4 font-semibold">Email</th>
                            <th className="py-3 px-4 font-semibold text-center">Projets</th>
                            <th className="py-3 px-4 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clients.map(client => (
                            <tr key={client.id} className="border-b border-border last:border-b-0 hover:bg-accent">
                                <td className="py-3 px-4">
                                    <div className="flex items-center">
                                        <img src={client.avatar_url} alt={client.name} className="h-9 w-9 rounded-full object-cover mr-4" />
                                        <span className="font-semibold text-foreground">{client.company}</span>
                                    </div>
                                </td>
                                <td className="py-3 px-4">{client.name}</td>
                                <td className="py-3 px-4">{client.email}</td>
                                <td className="py-3 px-4 text-center">{getProjectCount(client.id)}</td>
                                <td className="py-3 px-4">
                                    <div className="flex items-center space-x-1">
                                        <Button variant="ghost" onClick={() => handleEdit(client)} className="!p-2" aria-label="Modifier"><Edit className="w-4 h-4" /></Button>
                                        <Button variant="ghost" onClick={() => handleDelete(client.id)} className="!p-2 text-muted-foreground hover:text-destructive" aria-label="Supprimer"><Trash2 className="w-4 h-4" /></Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
      </div>
      <AddUserModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onUserModified={handleModalSuccess}
        initialRole="client"
        userToEdit={editingUser}
      />
    </>
  );
};

export default AdminClients;