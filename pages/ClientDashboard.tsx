
import React, { useState, useEffect } from 'react';
import { User, Project, Task, Deliverable } from '../types';
import Button from '../components/ui/Button';
import ClientProjectCard from '../components/ClientProjectCard';
import ProjectTasksModal from '../components/ProjectTasksModal';
import NewRequestModal from '../components/NewRequestModal';
import ClientDeliverableCard from '../components/ClientDeliverableCard';
import Tabs from '../components/ui/Tabs';
import Toast from '../components/ui/Toast';
import { Plus } from 'lucide-react';
import { getProjects, getTasks, getDeliverables, createProject, updateDeliverable, getUsers, createNotification } from '../data/api';
import dayjs from 'dayjs';

const ClientDashboard: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isTasksModalOpen, setIsTasksModalOpen] = useState(false);
    const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
    const [showToast, setShowToast] = useState(false);

    const loadClientData = async (currentUser: User) => {
        const allProjects = await getProjects();
        const clientProjects = allProjects.filter(p => p.client_id === currentUser.id);
        setProjects(clientProjects);
        
        const clientProjectIds = new Set(clientProjects.map(p => p.id));
        const allTasks = await getTasks();
        setTasks(allTasks.filter(t => clientProjectIds.has(t.project_id)));
        const allDeliverables = await getDeliverables();
        setDeliverables(allDeliverables.filter(d => clientProjectIds.has(d.project_id)));
    };

    useEffect(() => {
        const currentUser: User | null = JSON.parse(localStorage.getItem('telya_user') || 'null');
        if (currentUser) {
            setUser(currentUser);
            loadClientData(currentUser);
        }
    }, []);
    
    const handleNewRequest = async ({ requestType, description, deadline }: { requestType: string; description: string; deadline: string }) => {
        if (!user) return;
        
        const newProjectData = {
            client_id: user.id,
            title: `Demande: ${requestType}`,
            description: description,
            pack: 'Essai' as Project['pack'],
            start_date: dayjs().format('YYYY-MM-DD'),
            due_date: deadline || dayjs().add(1, 'month').format('YYYY-MM-DD'),
            status: 'draft' as Project['status'],
        };

        await createProject(newProjectData);
        
        // Refresh the project list from the source of truth
        await loadClientData(user);

        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };


    const handleOpenProjectDetails = (project: Project) => {
        setSelectedProject(project);
        setIsTasksModalOpen(true);
    };

    const handleApproveDeliverable = async (deliverableId: string) => {
        const updatedDeliverable = await updateDeliverable(deliverableId, { status: 'approved' });
        setDeliverables(prev => 
            prev.map(d => d.id === deliverableId ? updatedDeliverable : d)
        );

        // Notify relevant internal team members
        const relevantProject = projects.find(p => p.id === updatedDeliverable.project_id);
        if (relevantProject && user) {
            // In a real app, projects would have assigned managers. For now, we notify the first admin/PM.
            const allUsers = await getUsers();
            const adminOrPM = allUsers.find(u => ['admin', 'project_manager'].includes(u.role));

            if (adminOrPM) {
                await createNotification({
                    user_id: adminOrPM.id,
                    actor_id: user.id,
                    project_id: relevantProject.id,
                    message: `Le client <strong>${user.company || user.name}</strong> a approuvé le livrable "${updatedDeliverable.title}".`,
                    link_to: `/projects/${relevantProject.id}`
                });
            }
        }
    };
    
    const projectTasks = selectedProject ? tasks.filter(t => t.project_id === selectedProject.id) : [];

    if (!user) {
        return <div>Chargement des données client...</div>;
    }

    const projectsTab = (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map(project => (
                <ClientProjectCard 
                    key={project.id} 
                    project={project} 
                    onDetailsClick={() => handleOpenProjectDetails(project)}
                />
            ))}
        </div>
    );

    const deliverablesTab = (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {deliverables.length > 0 ? deliverables.map(deliverable => (
                <ClientDeliverableCard 
                    key={deliverable.id}
                    deliverable={deliverable}
                    onApprove={handleApproveDeliverable}
                />
            )) : <p className="text-muted-foreground col-span-full text-center py-8">Aucun livrable n'a encore été téléversé pour vos projets.</p>}
        </div>
    );

    const TABS = [
        { label: 'Projets', content: projectsTab },
        { label: `Livrables (${deliverables.length})`, content: deliverablesTab },
    ];

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

            <Tabs tabs={TABS} />

            <ProjectTasksModal 
                isOpen={isTasksModalOpen}
                onClose={() => setIsTasksModalOpen(false)}
                project={selectedProject}
                tasks={projectTasks}
            />

            <NewRequestModal
                isOpen={isNewRequestModalOpen}
                onClose={() => setIsNewRequestModalOpen(false)}
                onNewRequestSubmit={handleNewRequest}
            />
            
            <Toast message="Votre demande a été envoyée avec succès !" show={showToast} />
        </>
    );
};

export default ClientDashboard;