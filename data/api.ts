import { supabase } from '../lib/supabaseClient';
import {
    User, Project, Deliverable, Task, TaskComment, Comment, Invoice
} from '../types';

// --- Auth API ---
export const getCurrentUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    // Fetch profile from 'users' table
    const { data: profile, error } = await supabase
        .from('users')
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
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw error;
    return data || [];
};

// FIX: Add saveUsers function
export const saveUsers = async (users: User[]): Promise<User[]> => {
    // Supabase user table should not contain password. Let's remove it if it exists.
    const usersToSave = users.map(({ password, ...rest }) => rest);
    const { data, error } = await supabase.from('users').upsert(usersToSave).select();
    if (error) {
        console.error("Error in saveUsers:", error);
        throw error;
    }
    return data || [];
};


export const updateUser = async (userId: string, updates: Partial<User>): Promise<User> => {
    const { data, error } = await supabase.from('users').update(updates).eq('id', userId).select().single();
    if (error) throw error;
    return data;
};

export const createUser = async (userData: Partial<User>): Promise<User> => {
    const { data, error } = await supabase.from('users').insert(userData).select().single();
    if (error) throw error;
    return data;
};

export const deleteUser = async (userId: string): Promise<void> => {
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) throw error;
};

// --- Projects API ---
export const getProjects = async (): Promise<Project[]> => {
    const { data, error } = await supabase.from('projects').select('*');
    if (error) throw error;
    return data || [];
};

// FIX: Add saveProjects function
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

// FIX: Add saveTasks function
export const saveTasks = async (tasks: Task[]): Promise<Task[]> => {
    const { data, error } = await supabase.from('tasks').upsert(tasks).select();
    if (error) throw error;
    return data;
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

// FIX: Add saveDeliverables function
export const saveDeliverables = async (deliverables: Deliverable[]): Promise<Deliverable[]> => {
    const { data, error } = await supabase.from('deliverables').upsert(deliverables).select();
    if (error) throw error;
    return data;
};

export const createDeliverable = async (deliverableData: Omit<Deliverable, 'id'>): Promise<Deliverable> => {
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

// FIX: Add saveComments function
export const saveComments = async (comments: Comment[]): Promise<Comment[]> => {
    const { data, error } = await supabase.from('comments').upsert(comments).select();
    if (error) throw error;
    return data;
};

export const createComment = async (commentData: Omit<Comment, 'id'>): Promise<Comment> => {
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

// FIX: Add saveTaskComments function
export const saveTaskComments = async (taskComments: TaskComment[]): Promise<TaskComment[]> => {
    const { data, error } = await supabase.from('task_comments').upsert(taskComments).select();
    if (error) throw error;
    return data;
};

export const createTaskComment = async (taskCommentData: Omit<TaskComment, 'id'>): Promise<TaskComment> => {
    const { data, error } = await supabase.from('task_comments').insert(taskCommentData).select().single();
    if (error) throw error;
    return data;
};

// --- Invoices API ---
export const getInvoices = async (): Promise<Invoice[]> => {
    const { data, error } = await supabase.from('invoices').select('*');
    if (error) throw error;
    return data || [];
};