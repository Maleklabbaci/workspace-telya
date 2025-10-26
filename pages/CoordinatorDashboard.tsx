import React, { useState, useEffect } from 'react';
import { User, Task, Project } from '../types';
import Card from '../components/ui/Card';
// FIX: Import from API instead of mock data
import { getProjects, getTasks, getUsers, updateTask } from '../data/api';
import { FolderKanban, ClipboardCheck, MessageSquare, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import CoordinatorTaskCard from '../components/CoordinatorTaskCard';

// FIX: Remove localStorage-based task management
const MetricCard: React.FC<{ icon: React.ReactElement<{ className?: string }>; title: string; value: string | number; }> = ({ icon, title, value }) => (
    <Card>
        <div className="flex items-center">
            <div className="p-3 bg-primary/10 rounded-full">
                {React.cloneElement(icon, { className: `w-6 h-6 text-primary`})}
            </div>
            <div className="ml-4">
                <h3 className="text-muted-foreground font-semibold text-sm">{title}</h3>
                <p className="text-2xl font-bold text-foreground">{value}</p>
            </div>
        </div>
    </Card>
);

const CoordinatorDashboard: React.FC = () => {
    const user: User = JSON.parse(localStorage.getItem('telya_user') || '{}');
    // FIX: Add state for all required data
    const [tasks, setTasks] = useState<Task[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [users, setUsers] = useState<User[]>([]);

    // FIX: Load data from API
    const loadData = async () => {
        setTasks(await getTasks());
        setProjects(await getProjects());
        setUsers(await getUsers());
    };
    
    useEffect(() => {
        loadData();
    }, []);
    
    const projectsInProgress = projects.filter(p => p.status === 'in_progress' || p.status === 'en tournage' || p.status === 'en montage').length;
    const tasksToReview = tasks.filter(t => t.status === 'review').length;
    const activeClients = new Set(projects.map(p => p.client_id)).size;

    const teamMembers = users.filter(u => u.role === 'employee');

    const getTasksForUser = (userId: string) => {
        return tasks.filter(t => t.assigned_to === userId && t.status !== 'done');
    }
    
    // FIX: Make handler async and use API to update tasks
    const handleTaskAction = async (taskId: string, action: 'revision' | 'to_editor' | 'approve') => {
        const taskToUpdate = tasks.find(t => t.id === taskId);
        if (!taskToUpdate) return;
        
        let updates: Partial<Task> = {};

        switch (action) {
            case 'revision':
                updates.status = 'in_progress';
                break;
            case 'to_editor':
                const editor = users.find(u => u.jobTitle === 'Video Editor');
                updates = {
                    status: 'todo',
                    title: `Montage: ${taskToUpdate.title}`,
                    assigned_to: editor?.id
                };
                break;
            case 'approve':
                updates.status = 'done';
                break;
        }

        const updatedTask = await updateTask(taskId, updates);
        setTasks(tasks.map(t => (t.id === taskId ? updatedTask : t)));
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-foreground">Bienvenue, Coordinateur {user.name} 👋</h1>
            <p className="mt-1 text-muted-foreground">Voici une vue globale des activités de l'agence.</p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard icon={<FolderKanban />} title="Projets en Cours" value={projectsInProgress} />
                <MetricCard icon={<ClipboardCheck />} title="Tâches à Valider" value={tasksToReview} />
                <MetricCard icon={<MessageSquare />} title="Communications Client" value="5" />
                <MetricCard icon={<Users />} title="Clients Actifs" value={activeClients} />
            </div>

            {tasksToReview > 0 && (
                 <Card className="mt-10">
                    <h2 className="text-xl font-bold text-foreground mb-4">Tâches en Attente de Validation ({tasksToReview})</h2>
                     <div className="space-y-4">
                        {tasks.filter(t => t.status === 'review').map(task => {
                            const project = projects.find(p => p.id === task.project_id);
                            const designer = users.find(u => u.id === task.assigned_to);
                            return (
                                <CoordinatorTaskCard 
                                    key={task.id}
                                    task={task}
                                    project={project}
                                    designer={designer}
                                    onAction={handleTaskAction}
                                />
                            );
                        })}
                     </div>
                 </Card>
            )}

            <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card>
                        <h2 className="text-xl font-bold text-foreground mb-4">Aperçu des Projets</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-xs text-muted-foreground uppercase border-b border-border">
                                        <th className="py-2 px-4 font-semibold">Projet</th>
                                        <th className="py-2 px-4 font-semibold">Statut</th>
                                        <th className="py-2 px-4 font-semibold">Progression</th>
                                        <th className="py-2 px-4 font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {projects.slice(0, 5).map(project => (
                                        <tr key={project.id} className="border-b border-border last:border-b-0 hover:bg-accent">
                                            <td className="py-3 px-4 font-semibold text-foreground">{project.title}</td>
                                            <td className="py-3 px-4 capitalize">{project.status.replace('_', ' ')}</td>
                                            <td className="py-3 px-4">
                                                <div className="w-full bg-secondary rounded-full h-2.5">
                                                    <div className="bg-primary h-2.5 rounded-full" style={{ width: `${project.percent_complete}%` }}></div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <Link to={`/projects/${project.id}`} className="text-primary hover:underline text-sm font-semibold">Voir</Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
                <div>
                    <Card>
                        <h2 className="text-xl font-bold text-foreground mb-4">Tâches des Employés</h2>
                        <ul className="space-y-4">
                            {teamMembers.map(member => {
                                const userTasks = getTasksForUser(member.id);
                                return (
                                    <li key={member.id}>
                                        <div className="flex items-center space-x-3">
                                            <img src={member.avatar_url} alt={member.name} className="w-9 h-9 rounded-full" />
                                            <div>
                                                <p className="font-semibold text-foreground">{member.name}</p>
                                                <p className="text-sm text-muted-foreground">{userTasks.length} tâche(s) active(s)</p>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CoordinatorDashboard;