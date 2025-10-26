

import { supabase } from '../lib/supabaseClient';
import {
    User, Project, Deliverable, Task, TaskComment, Comment, Invoice, Notification, DeliverableComment
} from '../types';

// --- Auth API ---
export const getCurrentUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    // Fetch profile from 'profiles' table
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
    
    if (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }

    return profile;
}

// --- Users API (Profiles) ---
export const getUsers = async (): Promise<User[]> => {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) throw error;
    return data || [];
};

export const updateUser = async (userId: string, updates: Partial<User>): Promise<User> => {
    const { data, error } = await supabase.from('profiles').update(updates).eq('id', userId).select().single();
    if (error) throw error;
    return data;
};

export const createUser = async (userData: Partial<User>): Promise<User> => {
    const { data, error } = await supabase.from('profiles').insert(userData).select().single();
    if (error) throw error;
    return data;
};

export const deleteUser = async (userId: string): Promise<void> => {
    // This calls a Supabase RPC function that must be created in the SQL Editor.
    // This function uses elevated privileges to delete from auth.users.
    // The profile in public.profiles is deleted automatically via "ON DELETE CASCADE".
    const { error } = await supabase.rpc('delete_user_auth', { user_id_to_delete: userId });
    if (error) {
        console.error('Error deleting user via RPC:', error);
        throw new Error("La suppression de l'utilisateur a échoué. Assurez-vous que la fonction 'delete_user_auth' existe dans votre base de données Supabase.");
    }
};


// --- Projects API ---
export const getProjects = async (filters: { clientId?: string, projectIds?: string[] } = {}): Promise<Project[]> => {
    let query = supabase.from('projects').select('*');
    if (filters.clientId) {
        query = query.eq('client_id', filters.clientId);
    }
    if (filters.projectIds && filters.projectIds.length > 0) {
        query = query.in('id', filters.projectIds);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
};

export const getProjectById = async (id: string): Promise<Project | null> => {
    const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();
    if (error) throw error;
    return data;
};

export const createProject = async (projectData: Omit<Project, 'id' | 'percent_complete' | 'updated_at'>): Promise<Project> => {
    const { data, error } = await supabase.from('projects').insert(projectData).select().single();
    if (error) throw error;
    return data;
};

export const updateProject = async (projectId: string, updates: Partial<Project>): Promise<Project> => {
    const { data, error } = await supabase.from('projects').update(updates).eq('id', projectId).select().single();
    if (error) throw error;
    return data;
};

export const deleteProject = async (projectId: string): Promise<void> => {
    const { error } = await supabase.from('projects').delete().eq('id', projectId);
    if (error) throw error;
};

// --- Tasks API ---
export const getTasks = async (filters: { projectId?: string, assigneeId?: string, projectIds?: string[] } = {}): Promise<Task[]> => {
    let query = supabase.from('tasks').select('*');
    if (filters.projectId) {
        query = query.eq('project_id', filters.projectId);
    }
    if (filters.assigneeId) {
        query = query.eq('assigned_to', filters.assigneeId);
    }
    if (filters.projectIds && filters.projectIds.length > 0) {
        query = query.in('project_id', filters.projectIds);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
};

export const createTask = async (taskData: Omit<Task, 'id'>): Promise<Task> => {
    const { data, error } = await supabase.from('tasks').insert(taskData).select().single();
    if (error) throw error;
    return data;
}

export const updateTask = async (taskId: string, updates: Partial<Task>): Promise<Task> => {
    const { data, error } = await supabase.from('tasks').update(updates).eq('id', taskId).select().single();
    if (error) throw error;
    return data;
};

// --- Deliverables API ---
export const getDeliverables = async (filters: { projectId?: string, projectIds?: string[] } = {}): Promise<Deliverable[]> => {
    let query = supabase.from('deliverables').select('*');
    if (filters.projectId) {
        query = query.eq('project_id', filters.projectId);
    }
    if (filters.projectIds && filters.projectIds.length > 0) {
        query = query.in('project_id', filters.projectIds);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
};

export const getDeliverableById = async (deliverableId: string): Promise<Deliverable | null> => {
    const { data, error } = await supabase.from('deliverables').select('*').eq('id', deliverableId).single();
    if (error) {
        console.error('Error fetching deliverable:', error);
        return null;
    }
    return data;
};

export const uploadDeliverableFile = async (file: File, projectId: string): Promise<string> => {
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const filePath = `${projectId}/${Date.now()}-${cleanFileName}`;

    const { error: uploadError } = await supabase.storage
        .from('deliverables')
        .upload(filePath, file);

    if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw uploadError;
    }

    const { data } = supabase.storage
        .from('deliverables')
        .getPublicUrl(filePath);

    return data.publicUrl;
};

export const createDeliverable = async (deliverableData: Omit<Deliverable, 'id' | 'uploaded_at'>): Promise<Deliverable> => {
    const { data, error } = await supabase.from('deliverables').insert(deliverableData).select().single();
    if (error) throw error;
    return data;
};

export const updateDeliverable = async (deliverableId: string, updates: Partial<Deliverable>): Promise<Deliverable> => {
    const { data, error } = await supabase.from('deliverables').update(updates).eq('id', deliverableId).select().single();
    if (error) throw error;
    return data;
}

// --- Comments API ---
export const getComments = async (projectId: string): Promise<Comment[]> => {
    const { data, error } = await supabase.from('comments').select('*').eq('project_id', projectId).order('created_at', { ascending: true });
    if (error) throw error;
    return (data || []);
};

export const createComment = async (commentData: Omit<Comment, 'id' | 'created_at'>): Promise<Comment> => {
    const { data, error } = await supabase.from('comments').insert(commentData).select().single();
    if (error) throw error;
    return data;
};

// --- Task Comments API ---
export const getTaskComments = async (taskIds: string[]): Promise<TaskComment[]> => {
    if (taskIds.length === 0) return [];
    const { data, error } = await supabase.from('task_comments').select('*').in('task_id', taskIds).order('created_at', { ascending: true });
    if (error) throw error;
    return (data || []);
};

export const createTaskComment = async (taskCommentData: Omit<TaskComment, 'id' | 'created_at'>): Promise<TaskComment> => {
    const { data, error } = await supabase.from('task_comments').insert(taskCommentData).select().single();
    if (error) throw error;
    return data;
};

// --- Deliverable Comments API ---
export const getDeliverableComments = async (deliverableId: string): Promise<DeliverableComment[]> => {
    const { data, error } = await supabase.from('deliverable_comments').select('*').eq('deliverable_id', deliverableId).order('created_at', { ascending: true });
    if (error) throw error;
    return (data || []);
};

export const createDeliverableComment = async (commentData: Omit<DeliverableComment, 'id'|'created_at'>): Promise<DeliverableComment> => {
    const { data, error } = await supabase.from('deliverable_comments').insert(commentData).select().single();
    if (error) throw error;
    return data;
};


// --- Invoices API ---
export const getInvoices = async (): Promise<Invoice[]> => {
    const { data, error } = await supabase.from('invoices').select('*');
    if (error) throw error;
    return data || [];
};

// --- Notifications API ---
export const getNotifications = async (userId: string): Promise<Notification[]> => {
    // Step 1: Fetch notifications without the join
    const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select('id, user_id, actor_id, project_id, message, link_to, is_read, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

    if (notificationsError) {
        console.error("Error fetching notifications:", notificationsError);
        throw notificationsError;
    }
    
    if (!notificationsData || notificationsData.length === 0) {
        return [];
    }

    // Step 2: Collect unique actor IDs
    const actorIds = [...new Set(notificationsData.map(n => n.actor_id).filter(id => id))];
    if (actorIds.length === 0) {
        return (notificationsData as any[]).map(n => ({ ...n, actor: { name: 'Système', avatar_url: '' } }));
    }

    // Step 3: Fetch actor profiles in a separate query
    const { data: actorsData, error: actorsError } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .in('id', actorIds);

    if (actorsError) {
        console.error("Error fetching actors for notifications:", actorsError);
        // Return notifications without full actor data to avoid breaking the UI
        return (notificationsData as any[]).map(n => ({
            ...n,
            actor: { name: 'Utilisateur Inconnu', avatar_url: '' }
        }));
    }

    const actorsMap = new Map(actorsData.map(a => [a.id, a]));

    // Step 4: Merge the data on the client-side
    const processedData = notificationsData.map(n => ({
        ...n,
        actor: actorsMap.get(n.actor_id) || { name: 'Utilisateur Supprimé', avatar_url: '' }
    }));

    return processedData as Notification[];
};


type NewNotification = Omit<Notification, 'id' | 'created_at' | 'is_read' | 'actor'>;
export const createNotification = async (notificationData: NewNotification): Promise<void> => {
    const { error } = await supabase.from('notifications').insert(notificationData);
    if (error) {
        console.error("Error creating notification:", error);
        // Don't throw error, as the primary action (e.g., assigning task) might have succeeded
    }
};

export const markNotificationAsRead = async (notificationId: number): Promise<void> => {
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
    if (error) throw error;
};

export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);
    if (error) throw error;
};