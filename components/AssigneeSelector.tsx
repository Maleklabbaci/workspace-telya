import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { User as UserIcon, UserX, Check } from 'lucide-react';

interface AssigneeSelectorProps {
  assignedTo: string | undefined;
  projectMembers: User[];
  onAssign: (userId: string | null) => void;
}

const AssigneeSelector: React.FC<AssigneeSelectorProps> = ({ assignedTo, projectMembers, onAssign }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectorRef = useRef<HTMLDivElement>(null);
  const assignedUser = projectMembers.find(u => u.id === assignedTo);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleAssigneeClick = (userId: string | null) => {
    onAssign(userId);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={selectorRef}>
      <button 
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }} 
        className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring rounded-full"
      >
        {assignedUser ? (
          <img
            src={assignedUser.avatar_url || `https://i.pravatar.cc/150?u=${assignedUser.id}`}
            alt={assignedUser.name}
            className="h-8 w-8 rounded-full"
            title={`Assigned to ${assignedUser.name}`}
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center hover:bg-accent" title="Assign user">
            <UserIcon size={16} className="text-muted-foreground" />
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute z-10 right-0 mt-2 w-56 bg-card rounded-md shadow-lg py-1 ring-1 ring-border">
          <div className="px-4 py-2 text-xs font-semibold text-muted-foreground border-b border-border">Assign to...</div>
          <ul>
            <li>
              <button 
                onClick={() => handleAssigneeClick(null)}
                className="w-full text-left flex items-center px-4 py-2 text-sm text-foreground hover:bg-accent"
              >
                 <div className="h-6 w-6 mr-3 rounded-full bg-secondary flex items-center justify-center">
                    <UserX size={14} className="text-muted-foreground" />
                 </div>
                Unassign
                {!assignedTo && <Check size={16} className="ml-auto text-primary" />}
              </button>
            </li>
            {projectMembers.map(user => (
              <li key={user.id}>
                <button 
                  onClick={() => handleAssigneeClick(user.id)}
                  className="w-full text-left flex items-center px-4 py-2 text-sm text-foreground hover:bg-accent"
                >
                  <img
                    src={user.avatar_url || `https://i.pravatar.cc/150?u=${user.id}`}
                    alt={user.name}
                    className="h-6 w-6 rounded-full mr-3"
                  />
                  <span className="truncate">{user.name}</span>
                  {assignedTo === user.id && <Check size={16} className="ml-auto text-primary flex-shrink-0" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AssigneeSelector;