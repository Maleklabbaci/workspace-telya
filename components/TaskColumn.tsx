import React from 'react';
import { Task, TaskStatus, User } from '../types';
import TaskCard from './TaskCard';

interface TaskColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  projectMembers: User[];
  onAssignTask: (taskId: string, userId: string | null) => void;
  onSelectTask: (task: Task) => void;
}

const statusColors = {
  todo: 'border-gray-400 dark:border-gray-600',
  in_progress: 'border-blue-500',
  review: 'border-yellow-500',
  done: 'border-green-500',
};

const TaskColumn: React.FC<TaskColumnProps> = ({ title, status, tasks, projectMembers, onAssignTask, onSelectTask }) => {
  return (
    <div className="bg-muted/50 dark:bg-background rounded-lg p-3 flex-shrink-0 w-80">
      <div className={`flex justify-between items-center mb-4 pb-2 border-b-2 ${statusColors[status]}`}>
        <h3 className="font-semibold text-foreground">{title}</h3>
        <span className="bg-secondary text-secondary-foreground text-sm font-bold rounded-full px-2 py-0.5">
          {tasks.length}
        </span>
      </div>
      <div className="space-y-3 overflow-y-auto h-[calc(100vh-20rem)] pr-1">
        {tasks.map((task) => (
          <TaskCard 
            key={task.id} 
            task={task} 
            projectMembers={projectMembers} 
            onAssignTask={onAssignTask}
            onSelectTask={onSelectTask}
          />
        ))}
      </div>
    </div>
  );
};

export default TaskColumn;