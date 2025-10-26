


import React, { useState, useEffect } from 'react';
// FIX: Correct import for react-router-dom Link component.
import { Link } from 'react-router-dom';
import { Task, User, Project, TaskStatus } from '../types';
import Card from '../components/ui/Card';
import dayjs from 'dayjs';
import { Calendar, Folder } from 'lucide-react';
import { getProjects, getTasks } from '../data/api';

const statusStyles: { [key in TaskStatus]: { bg: string; text: string; border: string } } = {
  todo: { bg: 'bg-secondary', text: 'text-secondary-foreground', border: 'border-muted' },
  in_progress: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500' },
  review: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', border: 'border-yellow-500' },
  done: { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500' },
};

const TaskItem: React.FC<{ task: Task; project?: Project }> = ({ task, project }) => {
    const statusStyle = statusStyles[task.status];
    return (
        <Card className="mb-4 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start">
                <p className="font-semibold text-card-foreground">{task.title}</p>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${statusStyle.bg} ${statusStyle.text}`}>
                    {task.status.replace('_', ' ')}
                </span>
            </div>
            <div className="mt-4 flex justify-between items-center text-sm text-muted-foreground">
                {project ? (
                    <Link to={`/projects/${project.id}`} className="flex items-center hover:text-primary transition-colors">
                        <Folder size={16} className="mr-2" />
                        <span>{project.title}</span>
                    </Link>
                ) : <div />}
                {task.due_date && (
                    <div className="flex items-center">
                        <Calendar size={16} className="mr-2" />
                        <span>{dayjs(task.due_date).format('D MMM YYYY')}</span>
                    </div>
                )}
            </div>
        </Card>
    );
};

const MyTasks: React.FC = () => {
    const currentUser: User | null = JSON.parse(localStorage.getItem('telya_user') || 'null');
    const [myTasks, setMyTasks] = useState<Task[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [projectMap, setProjectMap] = useState<Map<string, Project>>(new Map());

    useEffect(() => {
        const fetchData = async () => {
            if (currentUser) {
                const assignedTasks = await getTasks({ assigneeId: currentUser.id });
                setMyTasks(assignedTasks);
                
                if (assignedTasks.length > 0) {
                    const projectIds = [...new Set(assignedTasks.map(task => task.project_id))];
                    const relevantProjects = await getProjects({ projectIds });
                    setProjects(relevantProjects);
                    setProjectMap(new Map(relevantProjects.map(p => [p.id, p])));
                }
            }
        };
        fetchData();
    }, [currentUser]);


    if (!currentUser) {
        return <div className="p-6">Erreur : Impossible de charger les données de l'utilisateur. Veuillez vous reconnecter.</div>;
    }

    const getProjectForTask = (projectId: string) => {
        return projectMap.get(projectId);
    };
    
    const taskGroups: { [key in TaskStatus]?: Task[] } = {
        todo: myTasks.filter(t => t.status === 'todo'),
        in_progress: myTasks.filter(t => t.status === 'in_progress'),
        review: myTasks.filter(t => t.status === 'review'),
        done: myTasks.filter(t => t.status === 'done'),
    };

    const groupOrder: TaskStatus[] = ['in_progress', 'review', 'todo', 'done'];
    const groupTitles: { [key in TaskStatus]: string } = {
        todo: "À Faire",
        in_progress: "En Cours",
        review: "En Revue",
        done: "Terminé"
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Mes Tâches</h1>
            <p className="text-muted-foreground mb-8">Vous avez {myTasks.length} tâches au total qui vous sont assignées sur l'ensemble des projets.</p>

            <div className="space-y-8">
                {groupOrder.map(status => (
                    taskGroups[status] && taskGroups[status]!.length > 0 && (
                        <div key={status}>
                            <h2 className={`text-xl font-bold mb-4 pb-2 border-b-2 capitalize ${statusStyles[status].border} ${statusStyles[status].text}`}>{groupTitles[status]} ({taskGroups[status]!.length})</h2>
                            {taskGroups[status]!.map(task => (
                                <TaskItem key={task.id} task={task} project={getProjectForTask(task.project_id)} />
                            ))}
                        </div>
                    )
                ))}
            </div>
        </div>
    );
};

export default MyTasks;