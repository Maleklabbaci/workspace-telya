

import React from 'react';
import { Deliverable } from '../types';
import { Paperclip, Download, CheckCircle, Clock, MessageSquare, Edit } from 'lucide-react';
import dayjs from 'dayjs';
import Button from './ui/Button';
// FIX: Correct import for react-router-dom Link component.
import { Link } from 'react-router-dom';

interface ClientDeliverableCardProps {
  deliverable: Deliverable;
  onApprove: (deliverableId: string) => void;
}

const statusInfo = {
  pending: { icon: Clock, color: 'text-muted-foreground', label: 'En attente' },
  in_production: { icon: Clock, color: 'text-yellow-500', label: 'En Production' },
  in_review: { icon: Clock, color: 'text-blue-500', label: 'En Revue' },
  revision_needed: { icon: Edit, color: 'text-orange-500', label: 'Révision demandée' },
  approved: { icon: CheckCircle, color: 'text-green-500', label: 'Approuvé' },
  final: { icon: CheckCircle, color: 'text-primary', label: 'Final' },
};

const ClientDeliverableCard: React.FC<ClientDeliverableCardProps> = ({ deliverable, onApprove }) => {
  const currentStatusInfo = statusInfo[deliverable.status] || statusInfo.pending;
  const Icon = currentStatusInfo.icon;
  const reviewLink = `/client/projects/${deliverable.project_id}/deliverables/${deliverable.id}`;

  return (
    <div className="bg-card rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-border">
      <div className="p-6">
        <div className="flex justify-between items-start">
            <div>
                <div className="flex items-center text-sm font-semibold text-muted-foreground">
                    <Paperclip className="h-4 w-4 mr-2" />
                    <span className="uppercase">{deliverable.type}</span>
                </div>
                <h3 className="font-bold text-lg text-card-foreground mt-1">{deliverable.title}</h3>
                <p className="text-sm text-muted-foreground">Version {deliverable.version}</p>
            </div>
            <div className={`flex items-center text-sm font-semibold ${currentStatusInfo.color}`}>
                <Icon className="h-4 w-4 mr-1.5" />
                <span>{currentStatusInfo.label}</span>
            </div>
        </div>

        <p className="text-xs text-muted-foreground/80 mt-4">
          Téléversé le {dayjs(deliverable.uploaded_at).format('D MMM YYYY')}
        </p>

        <div className="mt-6 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <Link to={reviewLink} className="flex-1">
             <Button variant="secondary" className="w-full">
                <MessageSquare className="h-4 w-4 mr-2" />
                Voir & Commenter
            </Button>
          </Link>
          {deliverable.status === 'in_review' && (
             <Button variant="primary" className="flex-1 w-full" onClick={() => onApprove(deliverable.id)}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Approuver
            </Button>
          )}
           {deliverable.status !== 'in_review' && (
             <a href={deliverable.storage_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button variant="secondary" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger
                </Button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDeliverableCard;
