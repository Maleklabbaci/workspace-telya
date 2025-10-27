export type Role = "admin" | "employee" | "client";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
}

export interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | undefined;
  role: Role;
  avatar_url: string | null;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  client: { id: string; name: string };
  status: "À venir" | "En cours" | "Terminé" | "En attente";
  progress: number;
  members: User[];
}

export interface Task {
  id: string;
  title: string;
  status: "À faire" | "En cours" | "En revue" | "Terminé";
  priority: "Basse" | "Moyenne" | "Haute";
  assignee?: User;
  project: { id: string; name: string };
}