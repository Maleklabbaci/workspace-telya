import React from 'react';
import { Link } from 'react-router-dom';
import { Task, User, Project, TaskStatus } from '../types';
import Card from '../components/ui/Card';
import dayjs from 'dayjs';
import { Calendar, Folder } from 'lucide-react';

// Mock data: This should ideally come from a shared service/context in a real app
const mockProjects: Project[] = [
  { id: '1', client_id: 'c1', title: 'Luxury Villa Showcase', description: 'Complete video production for the new villa in Monaco.', pack: 'Diamond', start_date: '2023-10-01', due_date: '2024-08-15', status: 'in_progress', percent_complete: 75 },
  { id: '2', client_id: 'c2', title: 'Brand Identity - Aura Watches', description: 'Full brand guideline and logo design for a new watchmaker.', pack: 'Gold', start_date: '2024-01-10', due_date: '2024-09-01', status: 'active', percent_complete: 20 },
];

const mockAllTasks: Task[] = [
  // Project 1 Tasks for user 'u1' (Abdelmalek)
  { id: 't1', project_id: '1', title: 'Pre-production planning', status: 'done', assigned_to: 'u1', order_index: 0 },
  { id: 't7', project_id: '1', title: 'Client review session #1', status: 'review', assigned_to: 'u1', due_date: '2024-08-05', order_index: 6 },
  
  // Project 2 Tasks for user 'u1' (Abdelmalek)
  { id: 't8', project_id: '2', title: 'Logo concept sketches', status: 'in_progress', assigned_to: 'u1', due_date: '2024-08-02', order_index: 0 },
  { id: 't10', project_id: '2', title: 'Prepare brand presentation', status: 'todo', assigned_to: 'u1', due_date: '2024-08-15', order_index: 2 },
  
  // Tasks for other users
  { id: 't3', project_id: '1', title: 'Drone footage acquisition', status: 'in_progress', assigned_to: 'u2', due_date: '2024-07-30', order_index: 2 },
  { id: 't4', project_id: '1', title: 'First draft edit', status: 'in_progress', assigned_to: 'u3', order_index: 3 },
  { id: 't5', project_id: '1', title: 'Color grading', status: 'todo', assigned_to: 'u3', due_date: '2024-08-10', order_index: 4 },
  { id: 't9', project_id: '2', title: 'Competitor analysis report', status: 'done', assigned_to: 'u4', order_index: 1 },
];

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
                        <span>{dayjs(task.due_date).format('MMM D, YYYY')}</span>
                    </div>
                )}
            </div>
        </Card>
    );
};

const MyTasks: React.FC = () => {
    const currentUser: User | null = JSON.parse(localStorage.getItem('telya_user') || 'null');

    if (!currentUser) {
        return <div className="p-6">Error: Could not load user data. Please log in again.</div>;
    }

    const myTasks = mockAllTasks.filter(task => task.assigned_to === currentUser.id);

    const getProjectForTask = (projectId: string) => {
        return mockProjects.find(p => p.id === projectId);
    };
    
    const taskGroups: { [key in TaskStatus]?: Task[] } = {
        todo: myTasks.filter(t => t.status === 'todo'),
        in_progress: myTasks.filter(t => t.status === 'in_progress'),
        review: myTasks.filter(t => t.status === 'review'),
        done: myTasks.filter(t => t.status === 'done'),
    };

    const groupOrder: TaskStatus[] = ['in_progress', 'review', 'todo', 'done'];
    const groupTitles: { [key in TaskStatus]: string } = {
        todo: "To Do",
        in_progress: "In Progress",
        review: "In Review",
        done: "Completed"
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">My Tasks</h1>
            <p className="text-muted-foreground mb-8">You have {myTasks.length} total tasks assigned to you across all projects.</p>

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