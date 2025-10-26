import React from 'react';
import { Project } from '../types';
// FIX: Correct import for react-router-dom Link component.
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import Card from './ui/Card';

interface ProjectCardProps {
  project: Project;
}

const statusStyles: { [key in Project['status']]: string } = {
  draft: 'bg-secondary text-secondary-foreground',
  active: 'bg-blue-500/20 text-blue-300',
  in_progress: 'bg-yellow-500/20 text-yellow-300',
  completed: 'bg-green-500/20 text-green-300',
  archived: 'bg-secondary text-muted-foreground',
  'en préparation': 'bg-purple-500/20 text-purple-300',
  'en tournage': 'bg-blue-500/20 text-blue-300',
  'en montage': 'bg-yellow-500/20 text-yellow-300',
  'livré': 'bg-green-500/20 text-green-300',
};

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <Link to={`/projects/${project.id}`} className="block h-full group">
      <Card className="h-full flex flex-col group-hover:border-primary/50 transition-colors duration-200">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-bold text-lg text-card-foreground">{project.title}</h3>
          <span className={`px-2 py-1 text-xs font-bold rounded-full capitalize ${statusStyles[project.status]}`}>
            {project.status.replace('_', ' ')}
          </span>
        </div>
        <p className="text-muted-foreground text-sm mb-4 flex-grow">{project.description}</p>
        
        <div className="w-full bg-white/10 rounded-full h-2.5 border border-border">
          <div className="bg-primary h-full rounded-full" style={{ width: `${project.percent_complete}%` }}></div>
        </div>
        <div className="flex justify-between text-sm text-muted-foreground mt-2">
          <span className="font-semibold">{project.percent_complete}% Terminé</span>
          <span className="font-semibold">Échéance {dayjs(project.due_date).fromNow()}</span>
        </div>
      </Card>
    </Link>
  );
};

export default ProjectCard;