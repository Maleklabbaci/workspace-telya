import { User, Project, Deliverable, Task, TaskComment, Comment, Invoice } from '../types';

export const mockUsers: User[] = [
    { id: 'u-admin', name: 'Admin Telya', role: 'admin', email: 'admin@telya.com', avatar_url: 'https://i.pravatar.cc/150?u=u-admin', status: 'active' },
    { id: 'u1', name: 'Abdelmalek', role: 'project_manager', jobTitle: 'Project Manager', email: 'manager@telya.com', avatar_url: 'https://i.pravatar.cc/150?u=u1', status: 'active' },
    { id: 'u-coord', name: 'Coordinateur', role: 'coordinator', jobTitle: 'Coordinator', email: 'coord@telya.com', avatar_url: 'https://i.pravatar.cc/150?u=u-coord', status: 'active' },
    { id: 'u2', name: 'Videaste', role: 'employee', jobTitle: 'Filmmaker/Photographer', email: 'videaste@telya.com', avatar_url: 'https://i.pravatar.cc/150?u=u2', status: 'active' },
    { id: 'u-editor', name: 'Monteur Vidéo', role: 'employee', jobTitle: 'Video Editor', email: 'editor@telya.com', avatar_url: 'https://i.pravatar.cc/150?u=u3', status: 'active' },
    { id: 'u4', name: 'Sound Designer', role: 'employee', jobTitle: 'Sound Designer', email: 'sound@telya.com', avatar_url: 'https://i.pravatar.cc/150?u=u4', status: 'active' },
    { id: 'u-sara', name: 'Sara Boukhalfa', role: 'employee', jobTitle: 'Designer', email: 'sara.boukhalfa@telya.com', password: 'test1234', avatar_url: 'https://i.pravatar.cc/150?u=u-sara', status: 'active' },
    { id: 'c1', name: 'Client Monaco', role: 'client', email: 'client@monaco.com', company: 'Monaco Luxury Estates', avatar_url: 'https://i.pravatar.cc/150?u=c1', status: 'active' },
    { id: 'c2', name: 'Client Aura', role: 'client', email: 'client@aura.com', company: 'Aura Watches', avatar_url: 'https://i.pravatar.cc/150?u=c2', status: 'active' },
    { id: 'c3', name: 'Client Ecom', role: 'client', email: 'client@ecom.com', company: 'E-commerce Platform', avatar_url: 'https://i.pravatar.cc/150?u=c3', status: 'active' },
    { id: 'c4', name: 'Client Arch', role: 'client', email: 'client@arch.com', company: 'Downtown Arch Inc.', avatar_url: 'https://i.pravatar.cc/150?u=c4', status: 'active' },
    { id: 'p-aurassi-client', name: 'Client Aurassi', role: 'client', email: 'elaurassi@telya.com', company: 'Hotel El Aurassi', avatar_url: 'https://i.pravatar.cc/150?u=p-aurassi-client', status: 'active' },
];

export const mockProjects: Project[] = [
  { id: '1', client_id: 'c1', title: 'Luxury Villa Showcase', description: 'Complete video production for the new villa in Monaco.', pack: 'Diamond', start_date: '2024-06-01', due_date: '2024-08-15', status: 'in_progress', percent_complete: 75 },
  { id: 'p-aurassi', client_id: 'p-aurassi-client', title: 'Hotel El Aurassi – Pack Gold', description: 'Campagne de lancement pour l\'hotel El Aurassi.', pack: 'Gold', start_date: '2024-07-15', due_date: '2024-09-30', status: 'in_progress', percent_complete: 40 },
  { id: '2', client_id: 'c2', title: 'Brand Identity - Aura Watches', description: 'Full brand guideline and logo design for a new watchmaker.', pack: 'Gold', start_date: '2024-07-10', due_date: '2024-09-01', status: 'active', percent_complete: 20 },
  { id: '3', client_id: 'c1', title: 'Social Media Campaign Q3', description: 'Content creation and scheduling for all social platforms.', pack: 'Standard', start_date: '2024-07-01', due_date: '2024-09-30', status: 'completed', percent_complete: 100 },
  { id: '4', client_id: 'c3', title: 'E-commerce Platform Photoshoot', description: 'Product photography for the upcoming online store.', pack: 'Gold', start_date: '2024-07-15', due_date: '2024-10-20', status: 'in_progress', percent_complete: 50 },
  { id: '5', client_id: 'c4', title: 'Architectural Visualization', description: '3D rendering of new downtown skyscraper.', pack: 'Diamond', start_date: '2024-07-20', due_date: '2024-11-15', status: 'active', percent_complete: 10 },
  { id: '6', client_id: 'c2', title: 'Aura Watches - Launch Video', description: 'Promotional video for the product launch event.', pack: 'Gold', start_date: '2024-07-25', due_date: '2024-12-01', status: 'draft', percent_complete: 0 },
];

export const mockDeliverables: Deliverable[] = [
  { id: 'd1', project_id: '1', title: 'Raw Drone Footage', type: 'video', status: 'approved', storage_url: '#', version: 1, uploaded_by: 'u2', uploaded_at: '2024-07-20T10:00:00Z' },
  { id: 'd2', project_id: '1', title: 'First Cut - Promotional Video', type: 'video', status: 'in_review', storage_url: '#', version: 1, uploaded_by: 'u3', uploaded_at: '2024-07-28T15:30:00Z' },
  { id: 'd3', project_id: '1', title: 'Villa Photography Set', type: 'photo', status: 'pending', storage_url: '#', version: 1, uploaded_by: 'u2', uploaded_at: '2024-07-20T11:00:00Z' },
  { id: 'd4', project_id: '2', title: 'Logo Concepts (Round 1)', type: 'design', status: 'in_review', storage_url: '#', version: 1, uploaded_by: 'u1', uploaded_at: '2024-07-29T18:00:00Z' },
];


export const mockTasks: Task[] = [
  { id: 't-aurassi-1', project_id: 'p-aurassi', title: 'Préparer les 3 visuels pour la campagne de lancement', description: 'Créer les visuels en accord avec la charte graphique El Aurassi.', status: 'in_progress', assigned_to: 'u-sara', order_index: 0 },
  { id: 't1', project_id: '1', title: 'Pre-production planning', description: 'Plan all shots, equipment, and schedule.', status: 'done', assigned_to: 'u1', order_index: 0 },
  { id: 't2', project_id: '1', title: 'On-site filming (3 days)', description: 'Capture all video content at the villa.', status: 'done', assigned_to: 'u2', order_index: 1 },
  { id: 't3', project_id: '1', title: 'Drone footage acquisition', description: 'Get aerial shots of the property.', status: 'in_progress', assigned_to: 'u2', due_date: '2024-07-30', order_index: 2 },
  { id: 't4', project_id: '1', title: 'First draft edit', description: 'Assemble the first version of the promotional video.', status: 'in_progress', assigned_to: 'u-editor', order_index: 3 },
  { id: 't5', project_id: '1', title: 'Color grading', description: 'Enhance the color and mood of the footage.', status: 'todo', assigned_to: 'u-editor', order_index: 4 },
  { id: 't6', project_id: '1', title: 'Sound design & mixing', description: 'Add music, sound effects, and balance audio levels.', status: 'todo', assigned_to: 'u4', order_index: 5 },
  { id: 't7', project_id: '1', title: 'Client review session #1', description: 'Present the first cut to the client and gather feedback.', status: 'review', assigned_to: 'u1', due_date: '2024-08-05', order_index: 6 },
];

export const mockComments: Comment[] = [
    { id: 'co1', project_id: '1', user_id: 'c1', user_name: 'Client', user_avatar: 'https://i.pravatar.cc/150?u=client1', content: 'The first cut looks promising! Can we add more shots of the sunset?', created_at: '2024-07-29T09:00:00Z', visibility: 'public' },
    { id: 'co2', project_id: '1', user_id: 'u1', user_name: 'Abdelmalek', user_avatar: 'https://i.pravatar.cc/150?u=u1', content: '@editor Can you check the client feedback and prepare v2?', created_at: '2024-07-29T09:15:00Z', visibility: 'internal' },
];

export const mockTaskComments: TaskComment[] = [
    { id: 'tc1', task_id: 't3', user_id: 'u1', user_name: 'Abdelmalek', user_avatar: 'https://i.pravatar.cc/150?u=u1', content: 'Weather looks good for Tuesday, let\'s schedule the drone shots for then.', created_at: '2024-07-25T14:00:00Z' },
    { id: 'tc2', task_id: 't3', user_id: 'u2', user_name: 'Videaste', user_avatar: 'https://i.pravatar.cc/150?u=u2', content: 'Sounds good, I\'ll have the gear ready.', created_at: '2024-07-25T16:30:00Z' },
    { id: 'tc3', task_id: 't7', user_id: 'c1', user_name: 'Client', user_avatar: 'https://i.pravatar.cc/150?u=client1', content: 'Looking forward to seeing the first cut!', created_at: '2024-07-28T18:00:00Z' },
];

export const mockInvoices: Invoice[] = [
    { id: 'inv-001', project_id: '1', amount: 12500, currency: 'USD', status: 'paid', created_at: '2024-07-15T00:00:00Z', due_date: '2024-07-30T00:00:00Z'},
    { id: 'inv-002', project_id: '3', amount: 3500, currency: 'USD', status: 'paid', created_at: '2024-07-20T00:00:00Z', due_date: '2024-08-05T00:00:00Z'},
    { id: 'inv-003', project_id: '4', amount: 7800, currency: 'USD', status: 'sent', created_at: '2024-07-28T00:00:00Z', due_date: '2024-08-12T00:00:00Z'},
    { id: 'inv-004', project_id: '2', amount: 9200, currency: 'USD', status: 'draft', created_at: '2024-07-30T00:00:00Z', due_date: '2024-08-15T00:00:00Z'},
    { id: 'inv-005', project_id: 'p-aurassi', amount: 15000, currency: 'USD', status: 'overdue', created_at: '2024-07-01T00:00:00Z', due_date: '2024-07-15T00:00:00Z'},
];