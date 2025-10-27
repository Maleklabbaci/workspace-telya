"use client";

// FIX: Correct casing for Card import
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { Project } from "@/lib/types";
import { useAuth } from "@/lib/hooks";
import { getClientProjects } from "@/data/api";

export default function ClientDashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const fetchProjects = async () => {
        setLoading(true);
        const data = await getClientProjects(user.id);
        setProjects(data);
        setLoading(false);
      };
      fetchProjects();
    }
  }, [user]);

  return (
    <div>
      <h1 className="text-3xl font-bold">Aperçu de vos projets</h1>
      <p className="mt-2 text-muted-foreground">
        Suivez l'avancement de vos projets en temps réel.
      </p>
      <div className="mt-8 space-y-4">
        {loading ? (
          <p>Chargement des projets...</p>
        ) : projects.length === 0 ? (
          <p>Vous n'avez aucun projet pour le moment.</p>
        ) : (
          projects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{project.name}</span>
                  <Badge variant={project.status === 'Terminé' ? 'default' : 'secondary'}>{project.status}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <div className="mb-1 flex justify-between text-sm text-muted-foreground">
                    <span>Progression</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-secondary">
                    <div className="h-2.5 rounded-full bg-primary" style={{ width: `${project.progress}%` }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}