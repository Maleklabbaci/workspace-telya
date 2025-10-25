import React from 'react';
import { Project } from '../types';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface ProjectCardProps {
  project: Project;
}

const statusStyles: { [key in Project['status']]: string } = {
  draft: 'bg-secondary text-secondary-foreground',
  active: 'bg-blue-500/10 text-blue-500',
  in_progress: 'bg-yellow-500/10 text-yellow-500',
  completed: 'bg-green-500/10 text-green-500',
  archived: 'bg-secondary text-muted-foreground',
  'en préparation': 'bg-purple-500/10 text-purple-500',
  'en tournage': 'bg-blue-500/10 text-blue-500',
  'en montage': 'bg-yellow-500/10 text-yellow-500',
  'livré': 'bg-green-500/10 text-green-500',
};

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <Link to={`/projects/${project.id}`}>
      <div className="bg-card rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow duration-300 h-full flex flex-col border border-border">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-bold text-lg text-card-foreground">{project.title}</h3>
          <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${statusStyles[project.status]}`}>
            {project.status.replace('_', ' ')}
          </span>
        </div>
        <p className="text-muted-foreground text-sm mb-4 flex-grow">{project.description}</p>
        
        <div className="w-full bg-secondary rounded-full h-2.5 mb-4">
          <div className="bg-primary h-2.5 rounded-full" style={{ width: `${project.percent_complete}%` }}></div>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{project.percent_complete}% Complete</span>
          <span>Due {dayjs(project.due_date).fromNow()}</span>
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;