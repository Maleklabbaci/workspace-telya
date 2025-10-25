import React, { useState, useEffect } from 'react';
import { Project, User, Task } from '../types';
import ProjectCard from '../components/ProjectCard';
import { motion } from 'framer-motion';
import { Palette, Camera, Film, MessageSquare, Briefcase, Code, UserCheck, Star, CheckCircle } from 'lucide-react';
import { mockProjects as allProjects, mockTasks as allTasks } from '../data/mockData';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const getStoredTasks = (): Task[] => {
    const stored = localStorage.getItem('telya_tasks');
    return stored ? JSON.parse(stored) : allTasks;
};

const updateStoredTask = (updatedTask: Task) => {
    const tasks = getStoredTasks();
    const taskIndex = tasks.findIndex(t => t.id === updatedTask.id);
    if (taskIndex !== -1) {
        tasks[taskIndex] = updatedTask;
        localStorage.setItem('telya_tasks', JSON.stringify(tasks));
    }
};


const DesignerDashboard: React.FC<{ user: User }> = ({ user }) => {
    const [myTask, setMyTask] = useState<Task | null>(null);
    const [project, setProject] = useState<Project | null>(null);
    
    useEffect(() => {
        const tasks = getStoredTasks();
        const assignedTask = tasks.find(t => t.assigned_to === user.id && t.status === 'in_progress');
        if (assignedTask) {
            setMyTask(assignedTask);
            setProject(allProjects.find(p => p.id === assignedTask.project_id) || null);
        } else {
             const reviewTask = tasks.find(t => t.assigned_to === user.id && t.status === 'review');
             if(reviewTask) {
                setMyTask(reviewTask);
                setProject(allProjects.find(p => p.id === reviewTask.project_id) || null);
             }
        }
    }, [user.id]);

    const handleCompleteTask = () => {
        if (myTask) {
            const updatedTask = { ...myTask, status: 'review' as 'review' };
            updateStoredTask(updatedTask);
            setMyTask(updatedTask);
        }
    };
    
    return (
        <Card>
            <div className="flex items-center mb-4">
                 <div className="p-3 bg-primary/10 rounded-full mr-4">
                    <Palette className="w-8 h-8 text-primary" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Designer Dashboard</h2>
                    <p className="text-muted-foreground">Focus on your design tasks and submit your best work.</p>
                </div>
            </div>

            {myTask && project ? (
                 <div className="mt-6 border-t border-border pt-6">
                    <h3 className="text-lg font-semibold text-muted-foreground">Your Priority Task</h3>
                    <div className="mt-2 p-4 border border-border rounded-lg bg-background">
                        <p className="font-semibold text-muted-foreground text-sm">Project: <span className="text-foreground font-bold">{project.title}</span></p>
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
                <p className="mt-6 text-center text-muted-foreground">You have no active tasks assigned. Well done!</p>
            )}
        </Card>
    )
};


const GenericDashboard: React.FC<{ user: User }> = ({ user }) => {
  const RoleSpecificContent: React.FC<{ jobTitle?: string }> = ({ jobTitle }) => {
    switch (jobTitle) {
        case 'Filmmaker/Photographer':
            return <DashboardSection icon={<Camera />} title="Filmmaker's Corner" description="Plan your shoots and manage your captures." />;
        case 'Video Editor':
            return <DashboardSection icon={<Film />} title="Editing Suite" description="Your projects are ready for the final cut." />;
        case 'Community Manager':
            return <DashboardSection icon={<MessageSquare />} title="Engagement Central" description="Manage social calendars and track performance." />;
        case 'Commercial':
            return <DashboardSection icon={<Briefcase />} title="Sales Dashboard" description="Track your prospects, deals, and conversions." />;
        case 'Développeur Web':
            return <DashboardSection icon={<Code />} title="Developer Desk" description="Manage web projects and resolve tickets." />;
        case 'Project Manager':
             return <DashboardSection icon={<UserCheck />} title="PM Overview" description="Manage your projects, teams, and billing." />;
        default:
            return <DashboardSection icon={<Star />} title="Employee Hub" description="Here are your projects and tasks." />;
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
            <h2 className="text-2xl font-bold text-foreground mb-4">Your In-Progress Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <h1 className="text-3xl font-bold text-foreground">Welcome back, {user.name}! 👋</h1>
        <p className="mt-1 text-muted-foreground">Here's a look at what's happening today.</p>

        <div className="mt-8">
            {user.jobTitle === 'Designer' ? <DesignerDashboard user={user} /> : <GenericDashboard user={user} />}
        </div>
    </motion.div>
  );
};

export default Dashboard;