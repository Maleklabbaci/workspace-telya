// NEW: Admin page for project management
"use client";

import { useEffect, useState, useCallback } from "react";
import { PlusCircle } from "lucide-react";

// FIX: Corrected import path casing.
import { Button } from "@/components/ui/Button";
// FIX: Corrected import path casing.
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import AddProjectModal from "@/components/AddProjectModal";
import { getProjects } from "@/data/api";
import { Project } from "@/lib/types";

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const fetchedProjects = await getProjects();
      setProjects(fetchedProjects);
    } catch (err) {
      setError("Impossible de charger les projets.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);
  
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "En cours":
        return "default";
      case "Terminé":
        return "secondary";
      case "En attente":
          return "destructive"
      default:
        return "outline";
    }
  };


  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold">Gestion des projets</h1>
            <p className="mt-2 text-muted-foreground">
                Ajoutez, visualisez et gérez tous les projets de la plateforme.
            </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un projet
        </Button>
      </div>

      <Card className="mt-8">
        <CardContent>
          {loading && <p className="p-4 text-center">Chargement...</p>}
          {error && <p className="p-4 text-center text-destructive">{error}</p>}
          {!loading && !error && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom du Projet</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Progression</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell>{project.client.name}</TableCell>
                    <TableCell>
                        <Badge variant={getStatusVariant(project.status)}>{project.status}</Badge>
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2">
                            <div className="h-2.5 w-full rounded-full bg-secondary">
                                <div className="h-2.5 rounded-full bg-primary" style={{ width: `${project.progress}%` }}></div>
                            </div>
                            <span className="text-xs text-muted-foreground">{project.progress}%</span>
                        </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AddProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectAdded={() => {
            fetchProjects();
        }}
      />
    </div>
  );
}