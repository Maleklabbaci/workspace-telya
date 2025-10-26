



import React, { useState, useEffect, useMemo } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import AddProjectModal from '../components/AddProjectModal';
import { Project, User } from '../types';
import { getProjects, getUsers, deleteProject } from '../data/api';
import { PlusCircle, Edit, Trash2, Search } from 'lucide-react';
import dayjs from 'dayjs';
// FIX: Correct import for react-router-dom Link component.
import { Link } from 'react-router-dom';

const AdminAllProjects: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const loadData = async () => {
        setProjects(await getProjects());
        setUsers(await getUsers());
    };

    useEffect(() => {
        loadData();
    }, []);

    const clientMap = useMemo(() => {
        const map = new Map<string, string>();
        users.forEach(user => {
            if (user.role === 'client') {
                map.set(user.id, user.company || user.name);
            }
        });
        return map;
    }, [users]);

    const handleEdit = (project: Project) => {
        setEditingProject(project);
        setIsModalOpen(true);
    };

    const handleDelete = async (projectId: string) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ? Cela supprimera également les tâches associées et est irréversible.')) {
            try {
                await deleteProject(projectId);
                loadData();
            } catch (error: any) {
                alert(`Erreur lors de la suppression du projet : ${error.message}`);
            }
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

    const filteredProjects = projects.filter(p => {
        const clientName = clientMap.get(p.client_id) || '';
        return p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
               clientName.toLowerCase().includes(searchTerm.toLowerCase());
    });

  return (
    <>
      <div>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Tous les Projets</h1>
                <p className="mt-1 text-muted-foreground">Un aperçu complet de chaque projet de l'agence.</p>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>
                <PlusCircle className="w-5 h-5 mr-2" /> Nouveau Projet
            </Button>
        </div>
        
        <Card className="!p-0 overflow-hidden">
            <div className="p-4 sm:p-6 flex justify-start sm:justify-end">
                <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input 
                        type="text"
                        placeholder="Rechercher par titre ou client..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full sm:w-64 pl-10 pr-4 py-2 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[900px]">
                    <thead>
                        <tr className="text-xs text-muted-foreground uppercase border-b border-t border-border bg-secondary/50">
                            <th className="py-3 px-4 font-semibold">Titre du Projet</th>
                            <th className="py-3 px-4 font-semibold">Client</th>
                            <th className="py-3 px-4 font-semibold">Statut</th>
                            <th className="py-3 px-4 font-semibold">Échéance</th>
                            <th className="py-3 px-4 font-semibold">Progression</th>
                            <th className="py-3 px-4 font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProjects.map(project => (
                            <tr key={project.id} className="border-b border-border last:border-b-0 hover:bg-accent">
                                <td className="py-3 px-4 font-semibold text-foreground">
                                    <Link to={`/projects/${project.id}`} className="hover:text-primary">{project.title}</Link>
                                </td>
                                <td className="py-3 px-4">{clientMap.get(project.client_id) || 'N/A'}</td>
                                <td className="py-3 px-4 capitalize">{project.status.replace('_', ' ')}</td>
                                <td className="py-3 px-4">{dayjs(project.due_date).format('DD MMM YYYY')}</td>
                                <td className="py-3 px-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-full bg-secondary rounded-full h-2.5">
                                            <div className="bg-primary h-2.5 rounded-full" style={{ width: `${project.percent_complete}%` }}></div>
                                        </div>
                                        <span className="text-sm font-semibold text-muted-foreground w-12 text-right">{project.percent_complete}%</span>
                                    </div>
                                </td>
                                <td className="py-3 px-4">
                                    <div className="flex items-center space-x-1">
                                        <Button variant="ghost" onClick={() => handleEdit(project)} className="!p-2" aria-label="Modifier"><Edit className="w-4 h-4" /></Button>
                                        <Button variant="ghost" onClick={() => handleDelete(project.id)} className="!p-2 text-muted-foreground hover:text-destructive" aria-label="Supprimer"><Trash2 className="w-4 h-4" /></Button>
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