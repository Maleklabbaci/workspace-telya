import React from 'react';
import { Deliverable } from '../types';
import { Paperclip, Download, MessageSquare, CheckCircle, Clock } from 'lucide-react';
import dayjs from 'dayjs';
import Button from './ui/Button';

interface DeliverableCardProps {
  deliverable: Deliverable;
}

const statusInfo = {
  pending: { icon: Clock, color: 'text-muted-foreground', label: 'Pending' },
  in_production: { icon: Clock, color: 'text-yellow-500', label: 'In Production' },
  in_review: { icon: MessageSquare, color: 'text-blue-500', label: 'In Review' },
  approved: { icon: CheckCircle, color: 'text-green-500', label: 'Approved' },
  final: { icon: CheckCircle, color: 'text-primary', label: 'Final' },
};

const DeliverableCard: React.FC<DeliverableCardProps> = ({ deliverable }) => {
  const Icon = statusInfo[deliverable.status].icon;

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
            <div className={`flex items-center text-sm font-semibold ${statusInfo[deliverable.status].color}`}>
                <Icon className="h-4 w-4 mr-1.5" />
                <span>{statusInfo[deliverable.status].label}</span>
            </div>
        </div>

        <p className="text-xs text-muted-foreground/80 mt-4">
          Uploaded {dayjs(deliverable.uploaded_at).format('MMM D, YYYY')}
        </p>

        <div className="mt-6 flex space-x-3">
          <Button variant="primary" className="flex-1">
            <MessageSquare className="h-4 w-4 mr-2" />
            Review
          </Button>
          <Button variant="secondary" className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DeliverableCard;