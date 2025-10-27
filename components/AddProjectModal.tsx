// NEW: Modal form to add a new project
"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
// FIX: Corrected import path casing.
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { User } from "@/lib/types";
import { getClients, addProject } from "@/data/api";

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectAdded: () => void;
}

export default function AddProjectModal({ isOpen, onClose, onProjectAdded }: AddProjectModalProps) {
  const [name, setName] = useState("");
  const [clientId, setClientId] = useState("");
  const [clients, setClients] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setName("");
      setClientId("");
      setError("");
      
      const fetchClients = async () => {
        try {
          const clientUsers = await getClients();
          setClients(clientUsers);
        } catch (err) {
          setError("Impossible de charger la liste des clients.");
        }
      };
      fetchClients();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
        setError("Veuillez sélectionner un client.");
        return;
    }
    setLoading(true);
    setError("");

    try {
      await addProject({ name, client_id: clientId });
      onProjectAdded();
      onClose();
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de la création du projet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Créer un nouveau projet</DialogTitle>
          <DialogDescription>
            Remplissez les détails ci-dessous pour démarrer un nouveau projet.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                Nom du projet
                </Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="client" className="text-right">
                Client
                </Label>
                <Select onValueChange={setClientId} value={clientId}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Sélectionner un client" />
                    </SelectTrigger>
                    <SelectContent>
                        {clients.map(client => (
                            <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            {error && <p className="col-span-4 text-center text-sm text-destructive">{error}</p>}
            </div>
            <DialogFooter>
                <Button type="button" variant="ghost" onClick={onClose}>Annuler</Button>
                <Button type="submit" disabled={loading}>
                    {loading ? "Création..." : "Créer le projet"}
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}