import React, { useState } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Input from './ui/Input';
import { X, UploadCloud } from 'lucide-react';

interface UploadDeliverableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (title: string, fileName: string) => void;
}

const UploadDeliverableModal: React.FC<UploadDeliverableModalProps> = ({ isOpen, onClose, onUpload }) => {
    const [title, setTitle] = useState('');
    const [fileName, setFileName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title && fileName) {
            onUpload(title, fileName);
            handleClose();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFileName(e.target.files[0].name);
        }
    }

    const handleClose = () => {
        setTitle('');
        setFileName('');
        onClose();
    };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="w-full max-w-lg">
        <form onSubmit={handleSubmit}>
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-foreground">Téléverser un livrable</h2>
                    <button type="button" onClick={handleClose} className="p-1 rounded-full hover:bg-accent">
                        <X className="w-6 h-6 text-muted-foreground" />
                    </button>
                </div>
                
                <div className="space-y-4">
                    <Input
                        label="Titre du livrable"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="Ex: Version Finale - Vidéo Promotionnelle"
                        required
                    />
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Fichier</label>
                        <label htmlFor="file-upload" className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent">
                            <UploadCloud className="w-6 h-6 text-muted-foreground mr-3" />
                            {fileName ? (
                                <span className="text-sm text-foreground font-semibold">{fileName}</span>
                            ) : (
                                <span className="text-sm text-muted-foreground">Cliquez pour sélectionner un fichier</span>
                            )}
                        </label>
                        <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} required />
                    </div>
                </div>
            </div>
             <div className="flex justify-end p-6 border-t border-border space-x-3 bg-secondary/50 rounded-b-2xl">
                <Button type="button" variant="secondary" onClick={handleClose}>Annuler</Button>
                <Button type="submit">Téléverser</Button>
            </div>
        </form>
    </Modal>
  );
};

export default UploadDeliverableModal;