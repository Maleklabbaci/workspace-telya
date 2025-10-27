"use client";

// FIX: Correct casing for Card import
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { Task } from "@/lib/types";
import { useAuth } from "@/lib/hooks";
import { getEmployeeTasks } from "@/data/api";

export default function EmployeeDashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const fetchTasks = async () => {
        setLoading(true);
        const data = await getEmployeeTasks(user.id);
        setTasks(data);
        setLoading(false);
      };
      fetchTasks();
    }
  }, [user]);

  const priorityColor: { [key: string]: string } = {
    "Haute": "bg-red-500",
    "Moyenne": "bg-yellow-500",
    "Basse": "bg-green-500",
  };

  return (
    <div>
      <h1 className="text-3xl font-bold">Mes Tâches</h1>
      <p className="mt-2 text-muted-foreground">
        Voici la liste de vos tâches assignées.
      </p>
      <div className="mt-8">
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <p className="p-4 text-center">Chargement des tâches...</p>
            ) : tasks.length === 0 ? (
              <p className="p-4 text-center">Vous n'avez aucune tâche assignée.</p>
            ) : (
              <div className="divide-y divide-border">
                {tasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-semibold">{task.title}</p>
                      <p className="text-sm text-muted-foreground">{task.project.name}</p>
                    </div>
                    <Badge variant="secondary" className={`${priorityColor[task.priority]}`}>
                      {task.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}