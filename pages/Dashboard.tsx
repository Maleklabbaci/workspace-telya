import React, { useState, useEffect } from 'react';
import { Project, User, Task } from '../types';
import ProjectCard from '../components/ProjectCard';
import { motion } from 'framer-motion';
import { Palette, Camera, Film, MessageSquare, Briefcase, Code, UserCheck, Star, CheckCircle } from 'lucide-react';
// FIX: Correctly import saveTasks
import { getProjects, getTasks, saveTasks } from '../data/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const DesignerDashboard: React.FC<{ user: User }> = ({ user }) => {
    const [myTask, setMyTask] = useState<Task | null>(null);
    const [project, setProject] = useState<Project | null>(null);
    
    useEffect(() => {
        // FIX: Make data fetching async
        const fetchData = async () => {
            const tasks = await getTasks();
            const allProjects = await getProjects();
            // FIX: Call .find on the resolved array
            const assignedTask = tasks.find(t => t.assigned_to === user.id && t.status === 'in_progress');
            if (assignedTask) {
                setMyTask(assignedTask);
                // FIX: Call .find on the resolved array
                setProject(allProjects.find(p => p.id === assignedTask.project_id) || null);
            } else {
                 // FIX: Call .find on the resolved array
                 const reviewTask = tasks.find(t => t.assigned_to === user.id && t.status === 'review');
                 if(reviewTask) {
                    setMyTask(reviewTask);
                    // FIX: Call .find on the resolved array
                    setProject(allProjects.find(p => p.id === reviewTask.project_id) || null);
                 }
            }
        };
        fetchData();
    }, [user.id]);

    // FIX: Make handler async
    const handleCompleteTask = async () => {
        if (myTask) {
            const updatedTask = { ...myTask, status: 'review' as 'review' };
            const allTasks = await getTasks();
            // FIX: Call .findIndex on the resolved array
            const taskIndex = allTasks.findIndex(t => t.id === myTask.id);
            if (taskIndex !== -1) {
                allTasks[taskIndex] = updatedTask;
                // FIX: Await saveTasks
                await saveTasks(allTasks);
                setMyTask(updatedTask);
            }
        }
    };
    
    return (
        <Card>
            <div className="flex items-center mb-4">
                 <div className="p-3 bg-primary/10 rounded-full mr-4">
                    <Palette className="w-8 h-8 text-primary" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Tableau de Bord Designer</h2>
                    <p className="text-muted-foreground">Concentrez-vous sur vos tâches de design et soumettez votre meilleur travail.</p>
                </div>
            </div>

            {myTask && project ? (
                 <div className="mt-6 border-t border-border pt-6">
                    <h3 className="text-lg font-semibold text-muted-foreground">Votre Tâche Prioritaire</h3>
                    <div className="mt-2 p-4 border border-border rounded-lg bg-background">
                        <p className="font-semibold text-muted-foreground text-sm">Projet: <span className="text-foreground font-bold">{project.title}</span></p>
                        <p className="text-xl font-bold my-2 text-foreground">{myTask.title}</p>
                        
                        {myTask.status === 'in_progress' && (
                            <div className="flex items-center justify-between mt-4">
                                <p className="text-sm font-semibold text-blue-600 bg-blue-500/10 px-3 py-1 rounded-full">En cours</p>
                                <Button onClick={handleCompleteTask}>
                                    <CheckCircle className="w-5 h-5 mr-2" /> Terminé
                                </Button>
                            </div>
                        )}
                        {myTask.status === 'review' && (
                             <p className="text-sm font-semibold text-yellow-600 bg-yellow-500/10 px-3 py-1 rounded-full inline-block mt-3">
                                En attente de validation Coordinateur
                            </p>
                        )}
                    </div>
                 </div>
            ) : (
                <p className="mt-6 text-center text-muted-foreground">Vous n'avez aucune tâche active assignée. Bravo !</p>
            )}
        </Card>
    )
};


const GenericDashboard: React.FC<{ user: User }> = ({ user }) => {
  // FIX: Fetch projects and store in state
  const [allProjects, setAllProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
        const projects = await getProjects();
        setAllProjects(projects);
    };
    fetchProjects();
  }, []);


  const RoleSpecificContent: React.FC<{ jobTitle?: string }> = ({ jobTitle }) => {
    switch (jobTitle) {
        case 'Filmmaker/Photographer':
            return <DashboardSection icon={<Camera />} title="Coin du Cinéaste" description="Planifiez vos tournages et gérez vos prises de vue." />;
        case 'Video Editor':
            return <DashboardSection icon={<Film />} title="Suite de Montage" description="Vos projets sont prêts pour le montage final." />;
        case 'Community Manager':
            return <DashboardSection icon={<MessageSquare />} title="Pôle d'Engagement" description="Gérez les calendriers sociaux et suivez les performances." />;
        case 'Commercial':
            return <DashboardSection icon={<Briefcase />} title="Tableau de Bord Commercial" description="Suivez vos prospects, contrats et conversions." />;
        case 'Développeur Web':
            return <DashboardSection icon={<Code />} title="Bureau du Développeur" description="Gérez les projets web et résolvez les tickets." />;
        case 'Project Manager':
             return <DashboardSection icon={<UserCheck />} title="Vue d'ensemble Chef de Projet" description="Gérez vos projets, équipes et facturation." />;
        default:
            return <DashboardSection icon={<Star />} title="Portail Employé" description="Voici vos projets et tâches." />;
    }
};

const DashboardSection: React.FC<{ icon: React.ReactElement<{ className?: string }>, title: string, description: string }> = ({ icon, title, description }) => (
    <div className="bg-card p-6 rounded-xl shadow-sm border border-border mb-10">
        <div className="flex items-center">
            <div className="p-3 bg-primary/10 rounded-full">
                {React.cloneElement(icon, { className: 'w-8 h-8 text-primary' })}
            </div>
            <div className="ml-4">
                <h2 className="text-2xl font-bold text-foreground">{title}</h2>
                <p className="text-muted-foreground">{description}</p>
            </div>
        </div>
    </div>
);

    return (
      <>
        <div className="mt-8">
            <RoleSpecificContent jobTitle={user.jobTitle} />
        </div>
        
        <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Vos Projets en Cours</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* FIX: Call .filter on the resolved array from state */}
                {allProjects.filter(p => p.status === 'in_progress').map(project => (
                    <motion.div key={project.id} whileHover={{ y: -5 }}>
                        <ProjectCard project={project} />
                    </motion.div>
                ))}
            </div>
        </div>
      </>
    );
};

const Dashboard: React.FC = () => {
    const user: User = JSON.parse(localStorage.getItem('telya_user') || '{}');

  return (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
    >
        <h1 className="text-3xl font-bold text-foreground">Bon retour, {user.name} ! 👋</h1>
        <p className="mt-1 text-muted-foreground">Voici un aperçu de ce qui se passe aujourd'hui.</p>

        <div className="mt-8">
            {user.jobTitle === 'Designer' ? <DesignerDashboard user={user} /> : <GenericDashboard user={user} />}
        </div>
    </motion.div>
  );
};

export default Dashboard;