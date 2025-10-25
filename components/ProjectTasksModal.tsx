import React from 'react';
import Modal from './ui/Modal';
import { Project, Task } from '../types';
import { CheckCircle, Clock, Loader } from 'lucide-react';

interface ProjectTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  tasks: Task[];
}

const statusIcons = {
    todo: <Clock className="w-5 h-5 text-muted-foreground" />,
    in_progress: <Loader className="w-5 h-5 text-blue-500 animate-spin" />,
    review: <Clock className="w-5 h-5 text-yellow-500" />,
    done: <CheckCircle className="w-5 h-5 text-green-500" />,
};

const ProjectTasksModal: React.FC<ProjectTasksModalProps> = ({ isOpen, onClose, project, tasks }) => {
  if (!project) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-2xl">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-foreground">{project.title}</h2>
        <p className="text-muted-foreground mt-1">Liste des tâches</p>
        
        <div className="mt-6 border-t border-border pt-4">
            {tasks.length > 0 ? (
                <ul className="space-y-3">
                    {tasks.map(task => (
                        <li key={task.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                           <div className="flex items-center">
                                {statusIcons[task.status]}
                                <span className={`ml-3 text-foreground ${task.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>
                                    {task.title}
                                </span>
                           </div>
                            <span className="text-xs font-semibold px-2 py-1 bg-card border border-border rounded-full capitalize">
                                {task.status.replace('_', ' ')}
                            </span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-muted-foreground text-center py-8">Aucune tâche définie pour ce projet pour le moment.</p>
            )}
        </div>
      </div>
    </Modal>
  );
};

export default ProjectTasksModal;