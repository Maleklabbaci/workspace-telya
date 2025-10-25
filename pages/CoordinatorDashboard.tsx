import React, { useState, useEffect } from 'react';
import { User, Task, Project } from '../types';
import Card from '../components/ui/Card';
import { mockProjects, mockTasks, mockUsers } from '../data/mockData';
import { FolderKanban, ClipboardCheck, MessageSquare, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import CoordinatorTaskCard from '../components/CoordinatorTaskCard';

const getStoredTasks = (): Task[] => {
    const stored = localStorage.getItem('telya_tasks');
    return stored ? JSON.parse(stored) : mockTasks;
};

const updateStoredTasks = (tasks: Task[]) => {
    localStorage.setItem('telya_tasks', JSON.stringify(tasks));
};


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
    const [tasks, setTasks] = useState<Task[]>(getStoredTasks);
    
    const projectsInProgress = mockProjects.filter(p => p.status === 'in_progress' || p.status === 'en tournage' || p.status === 'en montage').length;
    const tasksToReview = tasks.filter(t => t.status === 'review').length;
    const activeClients = new Set(mockProjects.map(p => p.client_id)).size;

    const teamMembers = mockUsers.filter(u => u.role === 'employee');

    const getTasksForUser = (userId: string) => {
        return tasks.filter(t => t.assigned_to === userId && t.status !== 'done');
    }
    
    const handleTaskAction = (taskId: string, action: 'revision' | 'to_editor' | 'approve') => {
        const newTasks = [...tasks];
        const taskIndex = newTasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return;

        const task = newTasks[taskIndex];

        switch (action) {
            case 'revision':
                task.status = 'in_progress';
                break;
            case 'to_editor':
                const editor = mockUsers.find(u => u.jobTitle === 'Video Editor');
                task.status = 'todo';
                task.title = `Montage: ${task.title}`;
                task.assigned_to = editor?.id;
                break;
            case 'approve':
                task.status = 'done';
                break;
        }

        setTasks(newTasks);
        updateStoredTasks(newTasks);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-foreground">Welcome, Coordinator {user.name} 👋</h1>
            <p className="mt-1 text-muted-foreground">Here's a global view of the agency's activities.</p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard icon={<FolderKanban />} title="Projects In Progress" value={projectsInProgress} />
                <MetricCard icon={<ClipboardCheck />} title="Tasks to Review" value={tasksToReview} />
                <MetricCard icon={<MessageSquare />} title="Client Communications" value="5" />
                <MetricCard icon={<Users />} title="Active Clients" value={activeClients} />
            </div>

            {tasksToReview > 0 && (
                 <Card className="mt-10">
                    <h2 className="text-xl font-bold text-foreground mb-4">Tasks Awaiting Validation ({tasksToReview})</h2>
                     <div className="space-y-4">
                        {tasks.filter(t => t.status === 'review').map(task => {
                            const project = mockProjects.find(p => p.id === task.project_id);
                            const designer = mockUsers.find(u => u.id === task.assigned_to);
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
                        <h2 className="text-xl font-bold text-foreground mb-4">Projects Overview</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-xs text-muted-foreground uppercase border-b border-border">
                                        <th className="py-2 px-4 font-semibold">Project</th>
                                        <th className="py-2 px-4 font-semibold">Status</th>
                                        <th className="py-2 px-4 font-semibold">Progress</th>
                                        <th className="py-2 px-4 font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mockProjects.slice(0, 5).map(project => (
                                        <tr key={project.id} className="border-b border-border last:border-b-0 hover:bg-accent">
                                            <td className="py-3 px-4 font-semibold text-foreground">{project.title}</td>
                                            <td className="py-3 px-4 capitalize">{project.status.replace('_', ' ')}</td>
                                            <td className="py-3 px-4">
                                                <div className="w-full bg-secondary rounded-full h-2.5">
                                                    <div className="bg-primary h-2.5 rounded-full" style={{ width: `${project.percent_complete}%` }}></div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <Link to={`/projects/${project.id}`} className="text-primary hover:underline text-sm font-semibold">View</Link>
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
                        <h2 className="text-xl font-bold text-foreground mb-4">Employee Tasks</h2>
                        <ul className="space-y-4">
                            {teamMembers.map(member => {
                                const userTasks = getTasksForUser(member.id);
                                return (
                                    <li key={member.id}>
                                        <div className="flex items-center space-x-3">
                                            <img src={member.avatar_url} alt={member.name} className="w-9 h-9 rounded-full" />
                                            <div>
                                                <p className="font-semibold text-foreground">{member.name}</p>
                                                <p className="text-sm text-muted-foreground">{userTasks.length} active task(s)</p>
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