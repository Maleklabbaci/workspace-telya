import React from 'react';
import { Task, User } from '../types';
import dayjs from 'dayjs';
import { Calendar } from 'lucide-react';
import AssigneeSelector from './AssigneeSelector';

interface TaskCardProps {
  task: Task;
  projectMembers: User[];
  onAssignTask: (taskId: string, userId: string | null) => void;
  onSelectTask: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, projectMembers, onAssignTask, onSelectTask }) => {
  return (
    <button
      onClick={() => onSelectTask(task)}
      className="bg-card rounded-md shadow p-4 cursor-pointer hover:shadow-lg transition-shadow w-full text-left border border-border"
    >
      <h4 className="font-semibold text-card-foreground mb-2">{task.title}</h4>
      {task.description && (
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {task.description}
        </p>
      )}
      <div className="flex justify-between items-center text-xs text-muted-foreground">
        {task.due_date ? (
          <div className="flex items-center space-x-1">
            <Calendar size={14} />
            <span>{dayjs(task.due_date).format('MMM D')}</span>
          </div>
        ) : <div />}
        
        <div onClick={(e) => e.stopPropagation()}>
             <AssigneeSelector
                assignedTo={task.assigned_to}
                projectMembers={projectMembers}
                onAssign={(userId) => onAssignTask(task.id, userId)}
             />
        </div>
      </div>
    </button>
  );
};

export default TaskCard;