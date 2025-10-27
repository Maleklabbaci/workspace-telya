import { supabase } from "@/lib/supabaseClient";
import { Project, Task, UserProfile, User } from "@/lib/types";

// --- USER MANAGEMENT ---

export const getUsers = async (): Promise<UserProfile[]> => {
    const response = await fetch('/api/admin/users');
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error fetching users");
    }
    const data = await response.json();
    return data.users;
}

export const getClients = async (): Promise<User[]> => {
    const response = await fetch('/api/admin/clients');
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error fetching clients");
    }
    const data = await response.json();
    return data.clients;
}


// --- PROJECT MANAGEMENT ---

export const getProjects = async (): Promise<Project[]> => {
    const response = await fetch('/api/admin/projects');
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error fetching projects");
    }
    const data = await response.json();
    return data.projects;
}

export const addProject = async (projectData: { name: string, client_id: string }): Promise<Project> => {
    const response = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error adding project");
    }
    const data = await response.json();
    return data.project;
}


// --- DASHBOARD DATA ---

export const getClientProjects = async (clientId: string): Promise<Project[]> => {
    const { data, error } = await supabase
        .from('projects')
        .select(`
            id,
            name,
            status,
            progress
        `)
        .eq('client_id', clientId);

    if (error) {
        console.error("Error fetching client projects:", error);
        return [];
    }
    return data.map(p => ({ ...p, client: {id: clientId, name: ''}, members: [] }));
};

export const getEmployeeTasks = async (employeeId: string): Promise<Task[]> => {
    const { data, error } = await supabase
        .from('tasks')
        .select(`
            id,
            title,
            priority,
            project:projects (id, name)
        `)
        .eq('assignee_id', employeeId);

    if (error) {
        console.error("Error fetching employee tasks:", error);
        return [];
    }
    
    return data as unknown as Task[];
};

export const getAdminDashboardStats = async () => {
    // Utilise Promise.all pour exécuter les requêtes en parallèle pour de meilleures performances
    const [projectsRes, clientsRes, tasksRes] = await Promise.all([
        supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'En cours'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'client'),
        supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'Terminé')
    ]);

    const { count: ongoingProjects, error: projectError } = projectsRes;
    const { count: clientCount, error: clientError } = clientsRes;
    const { count: completedTasks, error: tasksError } = tasksRes;
    
    if(projectError || clientError || tasksError) {
        console.error("Error fetching admin stats:", { projectError, clientError, tasksError });
    }

    return {
        totalRevenue: 45231.89, // Placeholder
        activeClients: clientCount ?? 0,
        ongoingProjects: ongoingProjects ?? 0,
        completedTasks: completedTasks ?? 0,
    };
}
