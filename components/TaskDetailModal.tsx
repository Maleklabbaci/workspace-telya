import React, { useState, useEffect } from 'react';
import { Task, TaskComment, User, TaskStatus } from '../types';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
import Button from './ui/Button';
import AssigneeSelector from './AssigneeSelector';
import Select from './ui/Select';
import dayjs from 'dayjs';
import { X } from 'lucide-react';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (updatedTask: Task) => void;
  onAddTaskComment: (taskId: string, content: string) => void;
  taskComments: TaskComment[];
  projectMembers: User[];
  currentUser: User;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onUpdateTask,
  onAddTaskComment,
  taskComments,
  projectMembers,
  currentUser,
}) => {
  const [editableTask, setEditableTask] = useState<Task | null>(task);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    setEditableTask(task);
  }, [task]);

  if (!isOpen || !editableTask) return null;

  const handleInputChange = (field: keyof Task, value: any) => {
    setEditableTask(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleSave = () => {
    if (editableTask) {
      onUpdateTask(editableTask);
      onClose();
    }
  };
  
  const handleAddComment = () => {
      if (newComment.trim() && editableTask) {
          onAddTaskComment(editableTask.id, newComment.trim());
          setNewComment('');
      }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-4xl max-h-[90vh] flex flex-col">
      <div className="flex justify-between items-center p-6 border-b border-border">
          <h2 className="text-2xl font-bold text-foreground">Task Details</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-accent">
              <X className="w-6 h-6 text-muted-foreground" />
          </button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 grid grid-cols-3 gap-8">
        {/* Right Column for Content */}
        <div className="col-span-3 md:col-span-2 space-y-6">
          <Input 
            value={editableTask.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="text-2xl font-bold !p-2 !border-transparent hover:!border-border focus:!border-ring"
          />
          <Textarea
            label="Description"
            value={editableTask.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Add a more detailed description..."
          />
          
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Activity</h3>
            <div className="space-y-4">
               {taskComments.map(comment => (
                   <div key={comment.id} className="flex items-start space-x-3">
                       <img src={comment.user_avatar} alt={comment.user_name} className="w-8 h-8 rounded-full" />
                       <div className="flex-1">
                           <div className="flex items-baseline space-x-2">
                               <p className="font-semibold text-sm text-foreground">{comment.user_name}</p>
                               <p className="text-xs text-muted-foreground">{dayjs(comment.created_at).fromNow()}</p>
                           </div>
                           <div className="mt-1 bg-secondary p-2.5 rounded-lg">
                               <p className="text-sm text-secondary-foreground">{comment.content}</p>
                           </div>
                       </div>
                   </div>
               ))}
            </div>
             <div className="mt-6 flex items-start space-x-3">
                <img src={currentUser.avatar_url || `https://i.pravatar.cc/150?u=${currentUser.id}`} alt={currentUser.name} className="w-8 h-8 rounded-full" />
                <div className="flex-1">
                    <Textarea 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        rows={2}
                    />
                    <div className="flex justify-end mt-2">
                         <Button onClick={handleAddComment} disabled={!newComment.trim()}>Comment</Button>
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* Left Column for Metadata */}
        <div className="col-span-3 md:col-span-1 space-y-6">
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-2">Status</h4>
              <Select 
                value={editableTask.status} 
                onChange={(e) => handleInputChange('status', e.target.value as TaskStatus)}
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">In Review</option>
                <option value="done">Done</option>
              </Select>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-2">Assignee</h4>
              <AssigneeSelector
                assignedTo={editableTask.assigned_to}
                projectMembers={projectMembers}
                onAssign={(userId) => handleInputChange('assigned_to', userId)}
              />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-2">Due Date</h4>
              <Input
                type="date"
                value={editableTask.due_date ? dayjs(editableTask.due_date).format('YYYY-MM-DD') : ''}
                onChange={(e) => handleInputChange('due_date', e.target.value)}
              />
            </div>
        </div>
      </div>
      <div className="flex justify-end p-6 border-t border-border space-x-3 bg-secondary/50 rounded-b-2xl">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>Save Changes</Button>
      </div>
    </Modal>
  );
};

export default TaskDetailModal;