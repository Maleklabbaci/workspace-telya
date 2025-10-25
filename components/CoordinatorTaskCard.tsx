import React from 'react';
import { Task, Project, User } from '../types';
import Button from './ui/Button';
import { Send, CornerUpLeft, CheckCircle } from 'lucide-react';

interface CoordinatorTaskCardProps {
    task: Task;
    project?: Project;
    designer?: User;
    onAction: (taskId: string, action: 'revision' | 'to_editor' | 'approve') => void;
}

const CoordinatorTaskCard: React.FC<CoordinatorTaskCardProps> = ({ task, project, designer, onAction }) => {
    return (
        <div className="p-4 bg-secondary/50 rounded-lg border border-border flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
                <p className="font-bold text-foreground">{task.title}</p>
                <div className="flex items-center text-sm text-muted-foreground mt-1 space-x-4">
                    <span>Projet: <span className="font-semibold">{project?.title || 'N/A'}</span></span>
                    {designer && (
                        <div className="flex items-center">
                            <span>Soumis par:</span>
                            <img src={designer.avatar_url} alt={designer.name} className="w-5 h-5 rounded-full ml-2 mr-1" />
                            <span className="font-semibold">{designer.name}</span>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex space-x-2 mt-4 sm:mt-0 sm:ml-4 flex-shrink-0">
                <Button onClick={() => onAction(task.id, 'revision')} variant="secondary" className="!px-3 !py-1.5 text-xs flex items-center" title="Retour Designer (révision)">
                    <CornerUpLeft className="w-4 h-4 mr-1.5 text-red-500" />
                    Retour Designer
                </Button>
                <Button onClick={() => onAction(task.id, 'to_editor')} variant="secondary" className="!px-3 !py-1.5 text-xs flex items-center" title="Envoyer au Monteur Vidéo">
                    <Send className="w-4 h-4 mr-1.5 text-blue-500" />
                    Envoyer au Monteur
                </Button>
                 <Button onClick={() => onAction(task.id, 'approve')} variant="primary" className="!px-3 !py-1.5 text-xs flex items-center !bg-primary" title="Approve & Finalize">
                    <CheckCircle className="w-4 h-4 mr-1.5" />
                    Approve
                </Button>
            </div>
        </div>
    );
};

export default CoordinatorTaskCard;