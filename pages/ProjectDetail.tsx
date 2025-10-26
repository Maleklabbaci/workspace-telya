
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Project, Task, Deliverable, Comment, User, TaskComment } from '../types';
import Spinner from '../components/ui/Spinner';
import Tabs from '../components/ui/Tabs';
import TaskColumn from '../components/TaskColumn';
import DeliverableCard from '../components/DeliverableCard';
import TaskDetailModal from '../components/TaskDetailModal';
import UploadDeliverableModal from '../components/UploadDeliverableModal';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/fr';
import { Clock, BarChart2, Users } from 'lucide-react';
import Button from '../components/ui/Button';
import { 
  getProjectById,
  getTasks,
  getDeliverables,
  getComments,
  getUsers,
  getTaskComments,
  updateTask,
  createTaskComment,
  createComment,
  createDeliverable,
  createNotification,
  uploadDeliverableFile,
} from '../data/api';


dayjs.extend(relativeTime);
dayjs.locale('fr');

// Tab Components
const OverviewTab: React.FC<{ project: Project; client: User | undefined }> = ({ project, client }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div className="md:col-span-2 bg-card p-6 rounded-xl shadow-sm border border-border">
      <h3 className="font-bold text-lg mb-4 text-card-foreground">Description du Projet</h3>
      <p className="text-muted-foreground">{project.description}</p>
    </div>
    <div className="bg-card p-6 rounded-xl shadow-sm border border-border space-y-4">
      <h3 className="font-bold text-lg mb-2 text-card-foreground">Détails</h3>
      <div className="flex items-center text-foreground">
        <Users className="w-5 h-5 mr-3 text-muted-foreground" />
        <div>
            <p className="text-sm text-muted-foreground">Client</p>
            <p className="font-semibold">{client?.company || 'N/A'}</p>
        </div>
      </div>
       <div className="flex items-center text-foreground">
        <Clock className="w-5 h-5 mr-3 text-muted-foreground" />
         <div>
            <p className="text-sm text-muted-foreground">Date d'échéance</p>
            <p className="font-semibold">{dayjs(project.due_date).format('D MMMM YYYY')}</p>
        </div>
      </div>
       <div className="flex items-center text-foreground">
        <BarChart2 className="w-5 h-5 mr-3 text-muted-foreground" />
        <div>
            <p className="text-sm text-muted-foreground">Progression</p>
            <p className="font-semibold">{project.percent_complete}%</p>
        </div>
      </div>
    </div>
  </div>
);

const TasksTab: React.FC<{ tasks: Task[], projectMembers: User[], onAssignTask: (taskId: string, userId: string | null) => void, onSelectTask: (task: Task) => void }> = ({ tasks, projectMembers, onAssignTask, onSelectTask }) => (
  <div className="flex space-x-4 overflow-x-auto pb-4 -m-6 p-6">
    <TaskColumn title="À Faire" status="todo" tasks={tasks.filter(t => t.status === 'todo')} projectMembers={projectMembers} onAssignTask={onAssignTask} onSelectTask={onSelectTask} />
    <TaskColumn title="En Cours" status="in_progress" tasks={tasks.filter(t => t.status === 'in_progress')} projectMembers={projectMembers} onAssignTask={onAssignTask} onSelectTask={onSelectTask} />
    <TaskColumn title="En Revue" status="review" tasks={tasks.filter(t => t.status === 'review')} projectMembers={projectMembers} onAssignTask={onAssignTask} onSelectTask={onSelectTask} />
    <TaskColumn title="Terminé" status="done" tasks={tasks.filter(t => t.status === 'done')} projectMembers={projectMembers} onAssignTask={onAssignTask} onSelectTask={onSelectTask} />
  </div>
);

const DeliverablesTab: React.FC<{ deliverables: Deliverable[], onUploadClick: () => void }> = ({ deliverables, onUploadClick }) => (
  <div>
    <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-foreground">Fichiers du Projet</h3>
        <Button onClick={onUploadClick}>+ Téléverser une nouvelle version</Button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {deliverables.map(d => <DeliverableCard key={d.id} deliverable={d} />)}
    </div>
  </div>
);

const ChatTab: React.FC<{ comments: Comment[], currentUser: User, onAddComment: (content: string) => void }> = ({ comments, currentUser, onAddComment }) => {
    const [newComment, setNewComment] = useState('');

    const handleSend = () => {
        if (newComment.trim()) {
            onAddComment(newComment.trim());
            setNewComment('');
        }
    };
    
    return (
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
                                    {comment.visibility === 'internal' && <span className="px-2 py-0.5 text-xs bg-yellow-500/10 text-yellow-600 rounded-full">Interne</span>}
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
                        <img src={currentUser.avatar_url || `https://i.pravatar.cc/150?u=${currentUser.id}`} alt="Current User" className="w-10 h-10 rounded-full" />
                        <div className="flex-1">
                            <textarea 
                                rows={3} 
                                placeholder="Écrire un commentaire..." 
                                className="w-full p-2 border border-border bg-background rounded-lg focus:ring-2 focus:ring-ring"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                            ></textarea>
                            <div className="flex justify-end mt-2">
                                 <Button onClick={handleSend}>Envoyer</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [client, setClient] = useState<User | undefined>(undefined);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [projectMembers, setProjectMembers] = useState<User[]>([]);
  const [taskComments, setTaskComments] = useState<TaskComment[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  const currentUser = JSON.parse(localStorage.getItem('telya_user') || '{}');

  const fetchData = useCallback(async () => {
    if (!id) return;

    const projectData = await getProjectById(id);
    if (projectData) {
        setProject(projectData);
        
        const allUsers = await getUsers();
        setClient(allUsers.find(u => u.id === projectData.client_id));
        setProjectMembers(allUsers.filter(u => u.role !== 'client'));

        const allTasks = await getTasks();
        const projectTasks = allTasks.filter(t => t.project_id === id);
        setTasks(projectTasks);
        
        const allDeliverables = await getDeliverables();
        setDeliverables(allDeliverables.filter(d => d.project_id === id));
        
        const allComments = await getComments();
        setComments(allComments.filter(c => c.project_id === id));
        
        const allTaskComments = await getTaskComments();
        const projectTaskIds = new Set(projectTasks.map(t => t.id));
        setTaskComments(allTaskComments.filter(c => projectTaskIds.has(c.task_id)));
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAssignTask = async (taskId: string, userId: string | null) => {
    const taskToUpdate = tasks.find(t => t.id === taskId);
    if (!taskToUpdate) return;
    
    const oldAssigneeId = taskToUpdate.assigned_to;
    const updated = await updateTask(taskId, { assigned_to: userId ?? undefined });
    setTasks(currentTasks => currentTasks.map(t => t.id === taskId ? updated : t));
    
    // Create notification for the new assignee
    if (userId && userId !== oldAssigneeId) {
        const newAssignee = projectMembers.find(member => member.id === userId);
        if (newAssignee) {
            await createNotification({
                user_id: userId,
                actor_id: currentUser.id,
                project_id: project?.id,
                message: `<strong>${currentUser.name}</strong> vous a assigné la tâche "${updated.title}".`,
                link_to: `/projects/${project?.id}`
            });
        }
    }
  };
  
  const handleSelectTask = (task: Task) => {
      setSelectedTask(task);
  }
  
  const handleCloseModal = () => {
      setSelectedTask(null);
  }

  const handleUpdateTask = async (updatedTask: Task) => {
    const updated = await updateTask(updatedTask.id, updatedTask);
    setTasks(currentTasks => currentTasks.map(t => t.id === updatedTask.id ? updated : t));
    
    // Also update the task in the modal if it's open
    if (selectedTask?.id === updated.id) {
        setSelectedTask(updated);
    }
  };
  
  const handleAddTaskComment = async (taskId: string, content: string) => {
      const newCommentData: Omit<TaskComment, 'id' | 'created_at'> = {
          task_id: taskId,
          content,
          user_id: currentUser.id,
          user_name: currentUser.name,
          user_avatar: currentUser.avatar_url || `https://i.pravatar.cc/150?u=${currentUser.id}`,
      };
      const newComment = await createTaskComment(newCommentData);
      setTaskComments(prev => [...prev, newComment]);
  }

  const handleAddProjectComment = async (content: string) => {
    if (!project) return;
    const newCommentData: Omit<Comment, 'id' | 'created_at'> = {
      project_id: project.id,
      user_id: currentUser.id,
      user_name: currentUser.name,
      user_avatar: currentUser.avatar_url || `https://i.pravatar.cc/150?u=${currentUser.id}`,
      content: content,
      visibility: 'public', // Default to public for this example
    };
    const newComment = await createComment(newCommentData);
    setComments(prev => [...prev, newComment]);
  };

  const handleUploadDeliverable = async (title: string, file: File) => {
    if (!project) return;
    try {
        const storageUrl = await uploadDeliverableFile(file, project.id);
        
        const newDeliverableData: Omit<Deliverable, 'id' | 'uploaded_at'> = {
            project_id: project.id,
            title,
            type: file.type.startsWith('video') ? 'video' : (file.type.startsWith('image') ? 'photo' : 'design'),
            status: 'in_review',
            storage_url: storageUrl,
            version: deliverables.filter(d => d.title.startsWith(title)).length + 1,
            uploaded_by: currentUser.id,
        };
        const newDeliverable = await createDeliverable(newDeliverableData);
        setDeliverables(prev => [newDeliverable, ...prev]);
    } catch (error) {
        console.error("Failed to upload deliverable:", error);
        // You could add a user-facing error message here
    }
  };


  if (!project) {
    return <div className="flex justify-center items-center h-full"><Spinner /></div>;
  }

  const tabs = [
    { label: 'Aperçu', content: <OverviewTab project={project} client={client} /> },
    { label: 'Tâches', content: <TasksTab tasks={tasks} projectMembers={projectMembers} onAssignTask={handleAssignTask} onSelectTask={handleSelectTask} /> },
    { label: 'Livrables', content: <DeliverablesTab deliverables={deliverables} onUploadClick={() => setIsUploadModalOpen(true)} /> },
    { label: 'Conversation', content: <ChatTab comments={comments} currentUser={currentUser} onAddComment={handleAddProjectComment} /> },
    { label: 'Facturation', content: <div>Les informations de facturation et les factures seront affichées ici.</div> },
  ];

  return (
    <>
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">{project.title}</h1>
          <div className="flex items-center space-x-4 mt-2 text-muted-foreground">
              <span>Pack: <span className="font-semibold text-foreground">{project.pack}</span></span>
              <span className="text-border">|</span>
              <span>Statut: <span className="font-semibold text-primary capitalize">{project.status.replace('_', ' ')}</span></span>
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

      <UploadDeliverableModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={handleUploadDeliverable}
      />
    </>
  );
};

export default ProjectDetail;