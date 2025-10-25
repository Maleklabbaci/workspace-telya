import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import AddUserModal from '../components/AddUserModal';
import { User } from '../types';
import { mockUsers, mockProjects } from '../data/mockData';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

const AdminClients: React.FC = () => {
    const [clients, setClients] = useState<User[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const loadClients = () => {
        const allStoredUsers: User[] = JSON.parse(localStorage.getItem('telya_users') || '[]');
        const allUsers = [...mockUsers, ...allStoredUsers];
        const uniqueUsers = allUsers.filter((v,i,a)=>a.findIndex(t=>(t.email === v.email))===i);
        setClients(uniqueUsers.filter(u => u.role === 'client'));
    };

    useEffect(() => {
        loadClients();
    }, []);

    const getProjectCount = (clientId: string) => {
        return mockProjects.filter(p => p.client_id === clientId).length;
    };
    
    const handleEdit = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleDelete = (userId: string) => {
        if (window.confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
            const allStoredUsers: User[] = JSON.parse(localStorage.getItem('telya_users') || '[]');
            const updatedUsers = allStoredUsers.filter(u => u.id !== userId);
            localStorage.setItem('telya_users', JSON.stringify(updatedUsers));
            loadClients();
        }
    };
    
    const handleModalClose = () => {
        setEditingUser(null);
        setIsModalOpen(false);
    };
    
    const handleModalSuccess = () => {
        loadClients();
        handleModalClose();
    };

  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Manage Clients</h1>
                <p className="mt-1 text-muted-foreground">View, add, or edit client accounts.</p>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>
                <PlusCircle className="w-5 h-5 mr-2" /> Add New Client
            </Button>
        </div>
        
        <Card>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-xs text-muted-foreground uppercase border-b border-border">
                            <th className="py-3 px-4 font-semibold">Company</th>
                            <th className="py-3 px-4 font-semibold">Contact Name</th>
                            <th className="py-3 px-4 font-semibold">Email</th>
                            <th className="py-3 px-4 font-semibold text-center">Projects</th>
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
                                        {/* FIX: Removed unsupported 'size' prop from Button component. Sizing is handled by className. */}
                                        <Button variant="ghost" onClick={() => handleEdit(client)} className="!p-2"><Edit className="w-4 h-4" /></Button>
                                        {/* FIX: Removed unsupported 'size' prop from Button component. Sizing is handled by className. */}
                                        <Button variant="ghost" onClick={() => handleDelete(client.id)} className="!p-2 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
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