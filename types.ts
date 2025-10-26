
export type UserRole = 'admin' | 'project_manager' | 'employee' | 'client' | 'coordinator';
export type UserStatus = 'active' | 'pending_validation' | 'rejected';
export type ProjectStatus = 'draft' | 'active' | 'in_progress' | 'completed' | 'archived' | 'en préparation' | 'en tournage' | 'en montage' | 'livré';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type DeliverableStatus = 'pending' | 'in_production' | 'in_review' | 'approved' | 'final' | 'revision_needed';

export interface User {
  id: string;
  email: string;
  password?: string; // Should be hashed in a real app
  role: UserRole;
  name: string;
  company?: string;
  avatar_url?: string;
  logoUrl?: string;
  jobTitle?: string;
  phone?: string;
  sector?: string;
  status?: UserStatus;
  portfolioUrl?: string;
  registeredAt?: string;
}

export interface Project {
  id: string;
  client_id: string;
  title: string;
  description: string;
  pack: 'Essai' | 'Standard' | 'Gold' | 'Diamond';
  start_date: string;
  due_date: string;
  status: ProjectStatus;
  percent_complete: number;
  updated_at?: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  assigned_to?: string;
  due_date?: string;
  order_index: number;
}

export interface Deliverable {
  id: string;
  project_id: string;
  title: string;
  type: 'video' | 'photo' | 'design';
  status: DeliverableStatus;
  storage_url: string;
  version: number;
  uploaded_by: string;
  uploaded_at: string;
}

export interface Comment {
    id: string;
    project_id: string;
    user_id: string;
    user_name: string;
    user_avatar: string;
    content: string;
    visibility: 'public' | 'internal';
    created_at: string;
}

export interface TaskComment {
    id:string;
    task_id: string;
    user_id: string;
    user_name: string;
    user_avatar: string;
    content: string;
    created_at: string;
}

export interface DeliverableComment {
  id: string;
  deliverable_id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  content: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  project_id: string;
  amount: number;
  currency: 'USD' | 'EUR' | 'DZD';
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  created_at: string;
  due_date: string;
}

export interface Notification {
  id: number;
  user_id: string; // The recipient
  actor_id: string; // The person who performed the action
  project_id?: string;
  message: string;
  link_to: string;
  is_read: boolean;
  created_at: string;
  
  // Joined data for UI
  actor?: {
    name: string;
    avatar_url: string;
  };
}