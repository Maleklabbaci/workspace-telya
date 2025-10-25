import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import AddUserModal from '../components/AddUserModal';
import { User } from '../types';
import { mockUsers, mockTasks } from '../data/mockData';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

const AdminEmployees: React.FC = () => {
    const [employees, setEmployees] = useState<User[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const loadEmployees = () => {
        const allStoredUsers: User[] = JSON.parse(localStorage.getItem('telya_users') || '[]');
        const allUsers = [...mockUsers, ...allStoredUsers];
        const uniqueUsers = allUsers.filter((v,i,a)=>a.findIndex(t=>(t.email === v.email))===i);
        setEmployees(uniqueUsers.filter(u => ['employee', 'project_manager', 'admin', 'coordinator'].includes(u.role)));
    };

    useEffect(() => {
        loadEmployees();
    }, []);

    const getTaskCount = (employeeId: string) => {
        return mockTasks.filter(t => t.assigned_to === employeeId).length;
    };
    
    const handleEdit = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleDelete = (userId: string) => {
        if (window.confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
            const allStoredUsers: User[] = JSON.parse(localStorage.getItem('telya_users') || '[]');
            const updatedUsers = allStoredUsers.filter(u => u.id !== userId);
            localStorage.setItem('telya_users', JSON.stringify(updatedUsers));
            loadEmployees();
        }
    };
    
    const handleModalClose = () => {
        setEditingUser(null);
        setIsModalOpen(false);
    };
    
    const handleModalSuccess = () => {
        loadEmployees();
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
                <h1 className="text-3xl font-bold text-foreground">Manage Employees</h1>
                <p className="mt-1 text-muted-foreground">View, add, or edit employee accounts and roles.</p>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>
                <PlusCircle className="w-5 h-5 mr-2" /> Add New Employee
            </Button>
        </div>

        <Card>
          <div className="overflow-x-auto">
              <table className="w-full text-left">
                  <thead>
                      <tr className="text-xs text-muted-foreground uppercase border-b border-border">
                          <th className="py-3 px-4 font-semibold">Name</th>
                          <th className="py-3 px-4 font-semibold">Role</th>
                          <th className="py-3 px-4 font-semibold">Email</th>
                          <th className="py-3 px-4 font-semibold text-center">Active Tasks</th>
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
                                      {/* FIX: Removed unsupported 'size' prop. Sizing is handled by className. */}
                                      <Button variant="ghost" onClick={() => handleEdit(employee)} className="!p-2"><Edit className="w-4 h-4" /></Button>
                                      {/* FIX: Removed unsupported 'size' prop. Sizing is handled by className. */}
                                      <Button variant="ghost" onClick={() => handleDelete(employee.id)} className="!p-2 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
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