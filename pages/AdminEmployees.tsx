

import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import AddUserModal from '../components/AddUserModal';
import { User, Task } from '../types';
import { getUsers, getTasks, deleteUser } from '../data/api';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

const AdminEmployees: React.FC = () => {
    const [employees, setEmployees] = useState<User[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const loadData = async () => {
        const allUsers = await getUsers();
        setEmployees(allUsers.filter(u => ['employee', 'project_manager', 'admin', 'coordinator'].includes(u.role)));
        const allTasks = await getTasks();
        setTasks(allTasks);
    };

    useEffect(() => {
        loadData();
    }, []);

    const getTaskCount = (employeeId: string) => {
        return tasks.filter(t => t.assigned_to === employeeId).length;
    };
    
    const handleEdit = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleDelete = async (userId: string) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet employé ? Cette action est irréversible.')) {
            try {
                await deleteUser(userId);
                loadData();
            } catch (error: any) {
                alert(`Erreur lors de la suppression : ${error.message}`);
            }
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


    const roleStyles: { [key: string]: string } = {
        admin: 'bg-primary/10 text-primary',
        project_manager: 'bg-blue-500/10 text-blue-500',
        employee: 'bg-secondary text-secondary-foreground',
        coordinator: 'bg-purple-500/10 text-purple-500'
    };

  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Gérer les Employés</h1>
                <p className="mt-1 text-muted-foreground">Voir, ajouter ou modifier les comptes et les rôles des employés.</p>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>
                <PlusCircle className="w-5 h-5 mr-2" /> Ajouter un employé
            </Button>
        </div>

        <Card>
          <div className="overflow-x-auto">
              <table className="w-full text-left">
                  <thead>
                      <tr className="text-xs text-muted-foreground uppercase border-b border-border">
                          <th className="py-3 px-4 font-semibold">Nom</th>
                          <th className="py-3 px-4 font-semibold">Rôle</th>
                          <th className="py-3 px-4 font-semibold">Email</th>
                          <th className="py-3 px-4 font-semibold text-center">Tâches Actives</th>
                          <th className="py-3 px-4 font-semibold">Actions</th>
                      </tr>
                  </thead>
                  <tbody>
                      {employees.map(employee => (
                          <tr key={employee.id} className="border-b border-border last:border-b-0 hover:bg-accent">
                              <td className="py-3 px-4">
                                  <div className="flex items-center">
                                      <img src={employee.avatar_url} alt={employee.name} className="h-9 w-9 rounded-full object-cover mr-4" />
                                      <div>
                                        <p className="font-semibold text-foreground">{employee.name}</p>
                                        {employee.jobTitle && <p className="text-xs text-muted-foreground">{employee.jobTitle}</p>}
                                      </div>
                                  </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${roleStyles[employee.role] || 'bg-secondary text-secondary-foreground'}`}>
                                    {employee.role.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="py-3 px-4">{employee.email}</td>
                              <td className="py-3 px-4 text-center">{getTaskCount(employee.id)}</td>
                              <td className="py-3 px-4">
                                  <div className="flex items-center space-x-1">
                                      <Button variant="ghost" onClick={() => handleEdit(employee)} className="!p-2" aria-label="Modifier"><Edit className="w-4 h-4" /></Button>
                                      <Button variant="ghost" onClick={() => handleDelete(employee.id)} className="!p-2 text-muted-foreground hover:text-destructive" aria-label="Supprimer"><Trash2 className="w-4 h-4" /></Button>
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
        initialRole="employee"
        userToEdit={editingUser}
      />
    </>
  );
};

export default AdminEmployees;