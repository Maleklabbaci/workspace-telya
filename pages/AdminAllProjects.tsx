import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import AddProjectModal from '../components/AddProjectModal';
import { Project, User } from '../types';
import { mockUsers, mockProjects as defaultProjects } from '../data/mockData';
import { PlusCircle, Edit, Trash2, Search } from 'lucide-react';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';

const AdminAllProjects: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const loadData = () => {
        const storedProjects: Project[] = JSON.parse(localStorage.getItem('telya_projects') || '[]');
        const combinedProjects = [...defaultProjects, ...storedProjects];
        setProjects(combinedProjects.filter((v,i,a)=>a.findIndex(t=>(t.id === v.id))===i));
        
        const storedUsers: User[] = JSON.parse(localStorage.getItem('telya_users') || '[]');
        const combinedUsers = [...mockUsers, ...storedUsers];
        setUsers(combinedUsers.filter((v,i,a)=>a.findIndex(t=>(t.email === v.email))===i));
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleEdit = (project: Project) => {
        setEditingProject(project);
        setIsModalOpen(true);
    };

    const handleDelete = (projectId: string) => {
        if (window.confirm('Are you sure you want to delete this project? This will also delete associated tasks and cannot be undone.')) {
            const storedProjects: Project[] = JSON.parse(localStorage.getItem('telya_projects') || '[]');
            const updatedProjects = storedProjects.filter(p => p.id !== projectId);
            localStorage.setItem('telya_projects', JSON.stringify(updatedProjects));
            loadData();
        }
    };
    
    const handleModalClose = () => {
        setEditingProject(null);
        setIsModalOpen(false);
    };
    
    const handleModalSuccess = () => {
        loadData();
        handleModalClose();
    };

    const getClientName = (clientId: string) => users.find(u => u.id === clientId)?.company || 'N/A';

    const filteredProjects = projects.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getClientName(p.client_id).toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">All Projects</h1>
                <p className="mt-1 text-muted-foreground">A complete overview of every project in the agency.</p>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>
                <PlusCircle className="w-5 h-5 mr-2" /> New Project
            </Button>
        </div>
        
        <Card>
            <div className="flex justify-end mb-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input 
                        type="text"
                        placeholder="Search by title or client..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-64 pl-10 pr-4 py-2 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-xs text-muted-foreground uppercase border-b border-border">
                            <th className="py-3 px-4 font-semibold">Project Title</th>
                            <th className="py-3 px-4 font-semibold">Client</th>
                            <th className="py-3 px-4 font-semibold">Status</th>
                            <th className="py-3 px-4 font-semibold">Due Date</th>
                            <th className="py-3 px-4 font-semibold">Progress</th>
                            <th className="py-3 px-4 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProjects.map(project => (
                            <tr key={project.id} className="border-b border-border last:border-b-0 hover:bg-accent">
                                <td className="py-3 px-4 font-semibold text-foreground">
                                    <Link to={`/projects/${project.id}`} className="hover:text-primary">{project.title}</Link>
                                </td>
                                <td className="py-3 px-4">{getClientName(project.client_id)}</td>
                                <td className="py-3 px-4 capitalize">{project.status.replace('_', ' ')}</td>
                                <td className="py-3 px-4">{dayjs(project.due_date).format('MMM DD, YYYY')}</td>
                                <td className="py-3 px-4">
                                    <div className="w-full bg-secondary rounded-full h-2.5">
                                        <div className="bg-primary h-2.5 rounded-full" style={{ width: `${project.percent_complete}%` }}></div>
                                    </div>
                                </td>
                                <td className="py-3 px-4">
                                    <div className="flex items-center space-x-1">
                                        {/* FIX: Removed unsupported 'size' prop. Sizing is handled by className. */}
                                        <Button variant="ghost" onClick={() => handleEdit(project)} className="!p-2"><Edit className="w-4 h-4" /></Button>
                                        {/* FIX: Removed unsupported 'size' prop. Sizing is handled by className. */}
                                        <Button variant="ghost" onClick={() => handleDelete(project.id)} className="!p-2 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
      </div>
      <AddProjectModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onProjectAdded={handleModalSuccess}
        projectToEdit={editingProject}
      />
    </>
  );
};

export default AdminAllProjects;