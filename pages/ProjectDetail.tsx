import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Project, Task, Deliverable, Comment, User, TaskComment } from '../types';
import Spinner from '../components/ui/Spinner';
import Tabs from '../components/ui/Tabs';
import TaskColumn from '../components/TaskColumn';
import DeliverableCard from '../components/DeliverableCard';
import TaskDetailModal from '../components/TaskDetailModal'; // New Import
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Clock, CheckCircle, BarChart2, Users } from 'lucide-react';
import Button from '../components/ui/Button';

dayjs.extend(relativeTime);

// Mock Data
const mockProject: Project = { id: '1', client_id: 'c1', title: 'Luxury Villa Showcase', description: 'Complete video production for the new villa in Monaco. This project involves on-site filming, drone shots, interior and exterior photography, and a final 3-minute promotional video.', pack: 'Diamond', start_date: '2023-10-01', due_date: '2024-08-15', status: 'in_progress', percent_complete: 75 };
const mockTasks: Task[] = [
  { id: 't1', project_id: '1', title: 'Pre-production planning', description: 'Plan all shots, equipment, and schedule.', status: 'done', assigned_to: 'u1', order_index: 0 },
  { id: 't2', project_id: '1', title: 'On-site filming (3 days)', description: 'Capture all video content at the villa.', status: 'done', assigned_to: 'u2', order_index: 1 },
  { id: 't3', project_id: '1', title: 'Drone footage acquisition', description: 'Get aerial shots of the property.', status: 'in_progress', assigned_to: 'u2', due_date: '2024-07-30', order_index: 2 },
  { id: 't4', project_id: '1', title: 'First draft edit', description: 'Assemble the first version of the promotional video.', status: 'in_progress', assigned_to: 'u3', order_index: 3 },
  { id: 't5', project_id: '1', title: 'Color grading', description: 'Enhance the color and mood of the footage.', status: 'todo', assigned_to: 'u3', order_index: 4 },
  { id: 't6', project_id: '1', title: 'Sound design & mixing', description: 'Add music, sound effects, and balance audio levels.', status: 'todo', assigned_to: 'u4', order_index: 5 },
  { id: 't7', project_id: '1', title: 'Client review session #1', description: 'Present the first cut to the client and gather feedback.', status: 'review', assigned_to: 'u1', due_date: '2024-08-05', order_index: 6 },
];
const mockDeliverables: Deliverable[] = [
  { id: 'd1', project_id: '1', title: 'Raw Drone Footage', type: 'video', status: 'approved', storage_url: '#', version: 1, uploaded_by: 'u2', uploaded_at: '2024-07-20T10:00:00Z' },
  { id: 'd2', project_id: '1', title: 'First Cut - Promotional Video', type: 'video', status: 'in_review', storage_url: '#', version: 1, uploaded_by: 'u3', uploaded_at: '2024-07-28T15:30:00Z' },
  { id: 'd3', project_id: '1', title: 'Villa Photography Set', type: 'photo', status: 'pending', storage_url: '#', version: 1, uploaded_by: 'u2', uploaded_at: '2024-07-20T11:00:00Z' },
];

const mockComments: Comment[] = [
    { id: 'co1', project_id: '1', user_id: 'c1', user_name: 'Client', user_avatar: 'https://i.pravatar.cc/150?u=client1', content: 'The first cut looks promising! Can we add more shots of the sunset?', created_at: '2024-07-29T09:00:00Z', visibility: 'public' },
    { id: 'co2', project_id: '1', user_id: 'u1', user_name: 'Abdelmalek', user_avatar: 'https://i.pravatar.cc/150?u=u1', content: '@editor Can you check the client feedback and prepare v2?', created_at: '2024-07-29T09:15:00Z', visibility: 'internal' },
];

const mockUsers: User[] = [
    { id: 'u1', name: 'Abdelmalek', role: 'project_manager', email: 'abdelmalek@telya.com', avatar_url: 'https://i.pravatar.cc/150?u=u1' },
    { id: 'u2', name: 'Videaste', role: 'employee', email: 'videaste@telya.com', avatar_url: 'https://i.pravatar.cc/150?u=u2' },
    { id: 'u3', name: 'Editor', role: 'employee', email: 'editor@telya.com', avatar_url: 'https://i.pravatar.cc/150?u=u3' },
    { id: 'u4', name: 'Sound Designer', role: 'employee', email: 'sound@telya.com', avatar_url: 'https://i.pravatar.cc/150?u=u4' },
    { id: 'c1', name: 'Client', role: 'client', email: 'client@telya.com', avatar_url: 'https://i.pravatar.cc/150?u=client1' },
];

const mockTaskComments: TaskComment[] = [
    { id: 'tc1', task_id: 't3', user_id: 'u1', user_name: 'Abdelmalek', user_avatar: 'https://i.pravatar.cc/150?u=u1', content: 'Weather looks good for Tuesday, let\'s schedule the drone shots for then.', created_at: '2024-07-25T14:00:00Z' },
    { id: 'tc2', task_id: 't3', user_id: 'u2', user_name: 'Videaste', user_avatar: 'https://i.pravatar.cc/150?u=u2', content: 'Sounds good, I\'ll have the gear ready.', created_at: '2024-07-25T16:30:00Z' },
    { id: 'tc3', task_id: 't7', user_id: 'c1', user_name: 'Client', user_avatar: 'https://i.pravatar.cc/150?u=client1', content: 'Looking forward to seeing the first cut!', created_at: '2024-07-28T18:00:00Z' },
];


// Tab Components
const OverviewTab: React.FC<{ project: Project }> = ({ project }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div className="md:col-span-2 bg-card p-6 rounded-xl shadow-sm border border-border">
      <h3 className="font-bold text-lg mb-4 text-card-foreground">Project Description</h3>
      <p className="text-muted-foreground">{project.description}</p>
    </div>
    <div className="bg-card p-6 rounded-xl shadow-sm border border-border space-y-4">
      <h3 className="font-bold text-lg mb-2 text-card-foreground">Details</h3>
      <div className="flex items-center text-foreground">
        <Users className="w-5 h-5 mr-3 text-muted-foreground" />
        <div>
            <p className="text-sm text-muted-foreground">Client</p>
            <p className="font-semibold">Monaco Luxury Estates</p>
        </div>
      </div>
       <div className="flex items-center text-foreground">
        <Clock className="w-5 h-5 mr-3 text-muted-foreground" />
         <div>
            <p className="text-sm text-muted-foreground">Due Date</p>
            <p className="font-semibold">{dayjs(project.due_date).format('MMMM D, YYYY')}</p>
        </div>
      </div>
       <div className="flex items-center text-foreground">
        <BarChart2 className="w-5 h-5 mr-3 text-muted-foreground" />
        <div>
            <p className="text-sm text-muted-foreground">Progress</p>
            <p className="font-semibold">{project.percent_complete}%</p>
        </div>
      </div>
    </div>
  </div>
);

const TasksTab: React.FC<{ tasks: Task[], projectMembers: User[], onAssignTask: (taskId: string, userId: string | null) => void, onSelectTask: (task: Task) => void }> = ({ tasks, projectMembers, onAssignTask, onSelectTask }) => (
  <div className="flex space-x-4 overflow-x-auto pb-4 -m-6 p-6">
    <TaskColumn title="To Do" status="todo" tasks={tasks.filter(t => t.status === 'todo')} projectMembers={projectMembers} onAssignTask={onAssignTask} onSelectTask={onSelectTask} />
    <TaskColumn title="In Progress" status="in_progress" tasks={tasks.filter(t => t.status === 'in_progress')} projectMembers={projectMembers} onAssignTask={onAssignTask} onSelectTask={onSelectTask} />
    <TaskColumn title="In Review" status="review" tasks={tasks.filter(t => t.status === 'review')} projectMembers={projectMembers} onAssignTask={onAssignTask} onSelectTask={onSelectTask} />
    <TaskColumn title="Done" status="done" tasks={tasks.filter(t => t.status === 'done')} projectMembers={projectMembers} onAssignTask={onAssignTask} onSelectTask={onSelectTask} />
  </div>
);

const DeliverablesTab: React.FC<{ deliverables: Deliverable[] }> = ({ deliverables }) => (
  <div>
    <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-foreground">Project Files</h3>
        <Button>+ Upload New Version</Button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {deliverables.map(d => <DeliverableCard key={d.id} deliverable={d} />)}
    </div>
  </div>
);

const ChatTab: React.FC<{ comments: Comment[] }> = ({ comments }) => (
    <div className="max-w-3xl mx-auto">
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
            <h3 className="font-bold text-lg mb-4 text-card-foreground">Conversation</h3>
            <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-4">
                {comments.map(comment => (
                    <div key={comment.id} className="flex items-start space-x-4">
                        <img src={comment.user_avatar} alt={comment.user_name} className="w-10 h-10 rounded-full" />
                        <div className="flex-1">
                            <div className="flex items-baseline space-x-2">
                                <p className="font-semibold text-foreground">{comment.user_name}</p>
                                <p className="text-xs text-muted-foreground">{dayjs(comment.created_at).fromNow()}</p>
                                {comment.visibility === 'internal' && <span className="px-2 py-0.5 text-xs bg-yellow-500/10 text-yellow-600 rounded-full">Internal</span>}
                            </div>
                            <div className="mt-1 bg-secondary p-3 rounded-lg rounded-tl-none">
                                <p className="text-secondary-foreground">{comment.content}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-6 border-t border-border pt-4">
                 <div className="flex items-start space-x-4">
                    <img src="https://i.pravatar.cc/150?u=123e4567-e89b-12d3-a456-426614174000" alt="Current User" className="w-10 h-10 rounded-full" />
                    <div className="flex-1">
                        <textarea rows={3} placeholder="Write a comment..." className="w-full p-2 border border-border bg-background rounded-lg focus:ring-2 focus:ring-ring"></textarea>
                        <div className="flex justify-end mt-2">
                             <Button>Send</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const ProjectDetail: React.FC = () => {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [projectMembers, setProjectMembers] = useState<User[]>([]);
  const [taskComments, setTaskComments] = useState<TaskComment[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  const currentUser = JSON.parse(localStorage.getItem('telya_user') || '{}');

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProject(mockProject);
      setTasks(mockTasks);
      setDeliverables(mockDeliverables);
      setTaskComments(mockTaskComments);
      setProjectMembers(mockUsers.filter(u => u.role !== 'client'));
    }, 1000);
  }, [id]);

  const handleAssignTask = (taskId: string, userId: string | null) => {
    setTasks(prevTasks =>
        prevTasks.map(task =>
            task.id === taskId ? { ...task, assigned_to: userId ?? undefined } : task
        )
    );
  };
  
  const handleSelectTask = (task: Task) => {
      setSelectedTask(task);
  }
  
  const handleCloseModal = () => {
      setSelectedTask(null);
  }

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prevTasks => prevTasks.map(task => task.id === updatedTask.id ? updatedTask : task));
    // If the task being updated is the one that was assigned, update the main task list too
    if (updatedTask.id === selectedTask?.id) {
        handleAssignTask(updatedTask.id, updatedTask.assigned_to || null);
    }
  };
  
  const handleAddTaskComment = (taskId: string, content: string) => {
      const newComment: TaskComment = {
          id: `tc${Date.now()}`,
          task_id: taskId,
          content,
          user_id: currentUser.id,
          user_name: currentUser.name,
          user_avatar: currentUser.avatar_url || `https://i.pravatar.cc/150?u=${currentUser.id}`,
          created_at: new Date().toISOString(),
      };
      setTaskComments(prev => [...prev, newComment]);
  }


  if (!project) {
    return <div className="flex justify-center items-center h-full"><Spinner /></div>;
  }

  const tabs = [
    { label: 'Overview', content: <OverviewTab project={project} /> },
    { label: 'Tasks', content: <TasksTab tasks={tasks} projectMembers={projectMembers} onAssignTask={handleAssignTask} onSelectTask={handleSelectTask} /> },
    { label: 'Deliverables', content: <DeliverablesTab deliverables={deliverables} /> },
    { label: 'Chat', content: <ChatTab comments={mockComments} /> },
    { label: 'Billing', content: <div>Billing information and invoices will be shown here.</div> },
  ];

  return (
    <>
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">{project.title}</h1>
          <div className="flex items-center space-x-4 mt-2 text-muted-foreground">
              <span>Pack: <span className="font-semibold text-foreground">{project.pack}</span></span>
              <span className="text-border">|</span>
              <span>Status: <span className="font-semibold text-primary capitalize">{project.status.replace('_', ' ')}</span></span>
          </div>
        </div>
        
        <Tabs tabs={tabs} />
      </div>

      <TaskDetailModal
        isOpen={!!selectedTask}
        onClose={handleCloseModal}
        task={selectedTask}
        onUpdateTask={handleUpdateTask}
        onAddTaskComment={handleAddTaskComment}
        taskComments={taskComments.filter(c => c.task_id === selectedTask?.id)}
        projectMembers={projectMembers}
        currentUser={currentUser}
      />
    </>
  );
};

export default ProjectDetail;