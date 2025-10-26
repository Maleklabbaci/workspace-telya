
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
// FIX: Correctly import saveProjects and saveDeliverables
import { getProjects, getTasks, getDeliverables, saveProjects, saveDeliverables } from '../data/api';
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

    // FIX: Make loadClientData async and await API calls
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
    
    // FIX: Make handleNewRequest async
    const handleNewRequest = async ({ requestType, description, deadline }: { requestType: string; description: string; deadline: string }) => {
        if (!user) return;
        
        const newProject: Project = {
            id: `proj-req-${Date.now()}`,
            client_id: user.id,
            title: `Demande: ${requestType}`,
            description: description,
            pack: 'Essai', // Default pack for requests
            start_date: dayjs().format('YYYY-MM-DD'),
            due_date: deadline || dayjs().add(1, 'month').format('YYYY-MM-DD'),
            status: 'draft',
            percent_complete: 0,
            updated_at: new Date().toISOString(),
        };

        const allProjects = await getProjects();
        // FIX: Await saveProjects
        await saveProjects([...allProjects, newProject]);
        
        // Refresh the project list from the source of truth
        await loadClientData(user);

        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };


    const handleOpenProjectDetails = (project: Project) => {
        setSelectedProject(project);
        setIsTasksModalOpen(true);
    };

    // FIX: Make handleApproveDeliverable async
    const handleApproveDeliverable = async (deliverableId: string) => {
        const allDeliverables = await getDeliverables();
        const updatedDeliverables = allDeliverables.map(d => 
            d.id === deliverableId ? { ...d, status: 'approved' as 'approved' } : d
        );
        // FIX: Await saveDeliverables
        await saveDeliverables(updatedDeliverables);
        setDeliverables(prev => 
            prev.map(d => d.id === deliverableId ? { ...d, status: 'approved' } : d)
        );
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