import React, { useState } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
import Select from './ui/Select';
import { X } from 'lucide-react';

interface NewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewRequestModal: React.FC<NewRequestModalProps> = ({ isOpen, onClose }) => {
    const [requestType, setRequestType] = useState('');
    const [description, setDescription] = useState('');
    const [deadline, setDeadline] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would typically send the data to an API
        console.log({ requestType, description, deadline });
        alert('Votre demande a été envoyée ! Notre équipe vous contactera bientôt.');
        onClose();
        // Reset form
        setRequestType('');
        setDescription('');
        setDeadline('');
    };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-lg">
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-foreground">Créer une nouvelle demande</h2>
                 <button onClick={onClose} className="p-1 rounded-full hover:bg-accent">
                    <X className="w-6 h-6 text-muted-foreground" />
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <Select
                    label="Type de service"
                    value={requestType}
                    onChange={e => setRequestType(e.target.value)}
                    required
                >
                    <option value="" disabled>Choisissez un service...</option>
                    <option value="shooting">Nouveau Shooting</option>
                    <option value="reels">Reels / Contenu vidéo</option>
                    <option value="website">Site Web</option>
                    <option value="visual">Visuel (Design graphique)</option>
                    <option value="other">Autre...</option>
                </Select>
                <Textarea 
                    label="Description de votre besoin"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    rows={5}
                    placeholder="Donnez-nous un maximum de détails sur votre demande..."
                    required
                />
                <Input 
                    label="Date de livraison souhaitée (optionnel)"
                    type="date"
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                />
                <div className="flex justify-end pt-4 space-x-3">
                    <Button type="button" variant="secondary" onClick={onClose}>Annuler</Button>
                    <Button type="submit">Envoyer la demande</Button>
                </div>
            </form>
        </div>
    </Modal>
  );
};

export default NewRequestModal;