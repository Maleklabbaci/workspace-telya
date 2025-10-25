import React, { useState } from 'react';
import { Project, ProjectStatus } from '../types';
import ProjectCard from '../components/ProjectCard';
import Button from '../components/ui/Button';
import AddProjectModal from '../components/AddProjectModal'; // Import the modal

const mockProjects: Project[] = [
  { id: '1', client_id: 'c1', title: 'Luxury Villa Showcase', description: 'Complete video production for the new villa in Monaco.', pack: 'Diamond', start_date: '2023-10-01', due_date: '2024-08-15', status: 'in_progress', percent_complete: 75 },
  { id: '2', client_id: 'c2', title: 'Brand Identity - Aura Watches', description: 'Full brand guideline and logo design for a new watchmaker.', pack: 'Gold', start_date: '2024-01-10', due_date: '2024-09-01', status: 'active', percent_complete: 20 },
  { id: '3', client_id: 'c1', title: 'Social Media Campaign Q3', description: 'Content creation and scheduling for all social platforms.', pack: 'Standard', start_date: '2024-02-01', due_date: '2024-09-30', status: 'completed', percent_complete: 100 },
  { id: '4', client_id: 'c3', title: 'E-commerce Platform Photoshoot', description: 'Product photography for the upcoming online store.', pack: 'Gold', start_date: '2024-03-15', due_date: '2024-10-20', status: 'in_progress', percent_complete: 50 },
  { id: '5', client_id: 'c4', title: 'Architectural Visualization', description: '3D rendering of new downtown skyscraper.', pack: 'Diamond', start_date: '2024-04-01', due_date: '2024-11-15', status: 'active', percent_complete: 10 },
  { id: '6', client_id: 'c2', title: 'Aura Watches - Launch Video', description: 'Promotional video for the product launch event.', pack: 'Gold', start_date: '2024-05-20', due_date: '2024-12-01', status: 'draft', percent_complete: 0 },
];

const statuses: ProjectStatus[] = ['draft', 'active', 'in_progress', 'completed', 'archived'];

const ProjectsList: React.FC = () => {
  const [filter, setFilter] = useState<ProjectStatus | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredProjects = mockProjects.filter(p => filter === 'all' || p.status === filter);

  const handleProjectAdded = () => {
    // In a real app, you would refetch the projects list here.
    // For this demo, we can just log it.
    console.log("Project added/modified, list should refresh.");
  };

  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-foreground">Projects</h1>
          <Button onClick={() => setIsModalOpen(true)}>+ New Project</Button>
        </div>
        
        <div className="flex space-x-2 border-b border-border mb-6">
          <button onClick={() => setFilter('all')} className={`py-2 px-4 text-sm font-medium transition-colors ${filter === 'all' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}>All</button>
          {statuses.map(status => (
            <button 
              key={status} 
              onClick={() => setFilter(status)}
              className={`py-2 px-4 text-sm font-medium capitalize transition-colors ${filter === status ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {status.replace('_', ' ')}
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