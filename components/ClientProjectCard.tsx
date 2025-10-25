import React from 'react';
import { Project } from '../types';
import Button from './ui/Button';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/fr';

dayjs.extend(relativeTime);
dayjs.locale('fr');

interface ClientProjectCardProps {
  project: Project;
  onDetailsClick: () => void;
}

const statusStyles: { [key in Project['status']]?: string } = {
  'en préparation': 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  'en tournage': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  'en montage': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  'livré': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
};

const ClientProjectCard: React.FC<ClientProjectCardProps> = ({ project, onDetailsClick }) => {
  const statusClass = statusStyles[project.status] || 'bg-secondary text-secondary-foreground';

  return (
    <div className="bg-card rounded-2xl shadow-md border border-border p-6 flex flex-col justify-between h-full hover:shadow-lg transition-shadow">
      <div>
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-lg text-card-foreground">{project.title}</h3>
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${statusClass}`}>
            {project.status}
          </span>
        </div>
        <p className="text-muted-foreground text-sm mb-5">
            Dernière mise à jour: {dayjs(project.updated_at).fromNow()}
        </p>

        <div>
            <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-muted-foreground">Progression</span>
                <span className="text-sm font-medium text-primary">{project.percent_complete}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div className="bg-primary h-2 rounded-full" style={{ width: `${project.percent_complete}%` }}></div>
            </div>
        </div>
      </div>
      
      <Button 
        onClick={onDetailsClick} 
        variant="secondary" 
        className="w-full mt-6"
      >
        Voir détails
      </Button>
    </div>
  );
};

export default ClientProjectCard;