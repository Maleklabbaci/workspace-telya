import React, { useState, useEffect } from 'react';
import { User, Project, Task } from '../types';
import Button from '../components/ui/Button';
import ClientProjectCard from '../components/ClientProjectCard';
import ProjectTasksModal from '../components/ProjectTasksModal';
import NewRequestModal from '../components/NewRequestModal';
import { Plus } from 'lucide-react';

// Mock Data for a specific client
const getMockProjectsForClient = (clientId: string): Project[] => [
  { id: 'p1', client_id: clientId, title: 'Shooting Hôtel Martinez', description: '...', pack: 'Gold', start_date: '2024-06-01', due_date: '2024-08-30', status: 'en tournage', percent_complete: 50, updated_at: '2024-07-28T10:00:00Z' },
  { id: 'p2', client_id: clientId, title: 'Reels Promotion Juin', description: '...', pack: 'Standard', start_date: '2024-06-01', due_date: '2024-06-30', status: 'livré', percent_complete: 100, updated_at: '2024-06-29T15:30:00Z' },
  { id: 'p3', client_id: clientId, title: 'Campagne Meta Ads Q3', description: '...', pack: 'Standard', start_date: '2024-07-01', due_date: '2024-09-30', status: 'en préparation', percent_complete: 15, updated_at: '2024-07-25T11:00:00Z' },
];

const mockTasks: Task[] = [
    {id: 't-p1-1', project_id: 'p1', title: 'Jour 1 - Scènes Lobby', status: 'done', order_index: 1},
    {id: 't-p1-2', project_id: 'p1', title: 'Jour 2 - Scènes Piscine & Plage', status: 'in_progress', order_index: 2},
    {id: 't-p1-3', project_id: 'p1', title: 'Prises de vue drone', status: 'todo', order_index: 3},
    {id: 't-p3-1', project_id: 'p3', title: 'Définition des audiences cibles', status: 'done', order_index: 1},
    {id: 't-p3-2', project_id: 'p3', title: 'Création des visuels publicitaires', status: 'in_progress', order_index: 2},
];


const ClientDashboard: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isTasksModalOpen, setIsTasksModalOpen] = useState(false);
    const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);

    useEffect(() => {
        const currentUser: User = JSON.parse(localStorage.getItem('telya_user') || 'null');
        if (currentUser) {
            setUser(currentUser);
            setProjects(getMockProjectsForClient(currentUser.id));
        }
    }, []);

    const handleOpenProjectDetails = (project: Project) => {
        setSelectedProject(project);
        setIsTasksModalOpen(true);
    };
    
    const projectTasks = selectedProject ? mockTasks.filter(t => t.project_id === selectedProject.id) : [];

    if (!user) {
        return <div>Loading client data...</div>;
    }

    return (
        <>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Bienvenue, {user.name} 👋</h1>
                    <p className="mt-1 text-muted-foreground">Consultez vos projets et faites de nouvelles demandes ici.</p>
                </div>
                <Button onClick={() => setIsNewRequestModalOpen(true)}>
                    <Plus className="w-5 h-5 mr-2" />
                    Créer une demande
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map(project => (
                    <ClientProjectCard 
                        key={project.id} 
                        project={project} 
                        onDetailsClick={() => handleOpenProjectDetails(project)}
                    />
                ))}
            </div>

            <ProjectTasksModal 
                isOpen={isTasksModalOpen}
                onClose={() => setIsTasksModalOpen(false)}
                project={selectedProject}
                tasks={projectTasks}
            />

            <NewRequestModal
                isOpen={isNewRequestModalOpen}
                onClose={() => setIsNewRequestModalOpen(false)}
            />
        </>
    );
};

export default ClientDashboard;