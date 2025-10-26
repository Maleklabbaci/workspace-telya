

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

export const saveUsers = async (users: User[]): Promise<User[]> => {
    // Supabase user table should not contain password. Let's remove it if it exists.
    const usersToSave = users.map(({ password, ...rest }) => rest);
    const { data, error } = await supabase.from('profiles').upsert(usersToSave).select();
    if (error) {
        console.error("Error in saveUsers:", error);
        throw error;
    }
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
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    if (error) throw error;
};

// --- Projects API ---
export const getProjects = async (): Promise<Project[]> => {
    const { data, error } = await supabase.from('projects').select('*');
    if (error) throw error;
    return data || [];
};

export const saveProjects = async (projects: Project[]): Promise<Project[]> => {
    const { data, error } = await supabase.from('projects').upsert(projects).select();
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
export const getTasks = async (): Promise<Task[]> => {
    const { data, error } = await supabase.from('tasks').select('*');
    if (error) throw error;
    return data || [];
};

export const saveTasks = async (tasks: Task[]): Promise<Task[]> => {
    const { data, error } = await supabase.from('tasks').upsert(tasks).select();
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
export const getDeliverables = async (): Promise<Deliverable[]> => {
    const { data, error } = await supabase.from('deliverables').select('*');
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


export const saveDeliverables = async (deliverables: Deliverable[]): Promise<Deliverable[]> => {
    const { data, error } = await supabase.from('deliverables').upsert(deliverables).select();
    if (error) throw error;
    return data || [];
};

// Fix: Omit `uploaded_at` as it's auto-generated by the database.
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
export const getComments = async (): Promise<Comment[]> => {
    const { data, error } = await supabase.from('comments').select('*').order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
};

export const saveComments = async (comments: Comment[]): Promise<Comment[]> => {
    const { data, error } = await supabase.from('comments').upsert(comments).select();
    if (error) throw error;
    return data || [];
};

// Fix: Omit `created_at` as it's auto-generated by the database.
export const createComment = async (commentData: Omit<Comment, 'id' | 'created_at'>): Promise<Comment> => {
    const { data, error } = await supabase.from('comments').insert(commentData).select().single();
    if (error) throw error;
    return data;
};

// --- Task Comments API ---
export const getTaskComments = async (): Promise<TaskComment[]> => {
    const { data, error } = await supabase.from('task_comments').select('*').order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
};

export const saveTaskComments = async (taskComments: TaskComment[]): Promise<TaskComment[]> => {
    const { data, error } = await supabase.from('task_comments').upsert(taskComments).select();
    if (error) throw error;
    return data || [];
};

// Fix: Omit `created_at` as it's auto-generated by the database.
export const createTaskComment = async (taskCommentData: Omit<TaskComment, 'id' | 'created_at'>): Promise<TaskComment> => {
    const { data, error } = await supabase.from('task_comments').insert(taskCommentData).select().single();
    if (error) throw error;
    return data;
};

// --- Deliverable Comments API ---
export const getDeliverableComments = async (deliverableId: string): Promise<DeliverableComment[]> => {
    const { data, error } = await supabase.from('deliverable_comments').select('*').eq('deliverable_id', deliverableId).order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
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
    const { data, error } = await supabase
        .from('notifications')
        .select(`
            *,
            actor:actor_id!left(
                name,
                avatar_url
            )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);
        
    if (error) {
        console.error("Error fetching notifications:", error);
        throw error;
    }

    const processedData = (data || []).map(n => ({
        ...n,
        actor: n.actor || { name: 'Utilisateur Supprimé', avatar_url: '' }
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