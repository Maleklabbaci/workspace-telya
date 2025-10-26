
import React, { useState, useEffect } from 'react';
import { Project, ProjectStatus } from '../types';
import ProjectCard from '../components/ProjectCard';
import Button from '../components/ui/Button';
import AddProjectModal from '../components/AddProjectModal';
import { getProjects } from '../data/api';

const statuses: ProjectStatus[] = ['draft', 'active', 'in_progress', 'completed', 'archived', 'en préparation', 'en tournage', 'en montage', 'livré'];

const ProjectsList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState<ProjectStatus | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProjects = async () => {
    const data = await getProjects();
    setProjects(data);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(p => filter === 'all' || p.status === filter);

  const handleProjectAdded = () => {
    fetchProjects();
  };

  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-foreground">Projets</h1>
          <Button onClick={() => setIsModalOpen(true)}>+ Nouveau Projet</Button>
        </div>
        
        <div className="flex space-x-2 border-b border-border mb-6 overflow-x-auto">
          <button onClick={() => setFilter('all')} className={`py-2 px-4 text-sm font-medium transition-colors whitespace-nowrap ${filter === 'all' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}>Tous</button>
          {statuses.map(status => (
            <button 
              key={status} 
              onClick={() => setFilter(status)}
              className={`py-2 px-4 text-sm font-medium capitalize transition-colors whitespace-nowrap ${filter === status ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {status.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
      <AddProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectAdded={handleProjectAdded}
      />
    </>
  );
};

export default ProjectsList;
