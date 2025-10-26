import React, { useState, useEffect } from 'react';
import { User, Project, ProjectStatus, Invoice, Deliverable } from '../types';
import Card from '../components/ui/Card';
import { Users, FolderKanban, Wallet, ClipboardCheck, PlusCircle, UserPlus, FileText, Filter, Zap } from 'lucide-react';
import Button from '../components/ui/Button';
import { getDeliverables, getProjects, getUsers, getInvoices } from '../data/api';
import dayjs from 'dayjs';
import AddUserModal from '../components/AddUserModal';
import AddProjectModal from '../components/AddProjectModal';
// FIX: Correct import for react-router-dom useNavigate hook.
import { useNavigate } from 'react-router-dom';


const statusStyles: { [key in Project['status']]: string } = {
  draft: 'bg-secondary text-secondary-foreground',
  active: 'bg-blue-500/20 text-blue-300',
  in_progress: 'bg-yellow-500/20 text-yellow-300',
  completed: 'bg-green-500/20 text-green-300',
  archived: 'bg-secondary text-muted-foreground',
  'en préparation': 'bg-purple-500/20 text-purple-300',
  'en tournage': 'bg-blue-500/20 text-blue-300',
  'en montage': 'bg-yellow-500/20 text-yellow-300',
  'livré': 'bg-green-500/20 text-green-300',
};

const MetricCard: React.FC<{ icon: React.ReactElement<{ className?: string }>; title: string; value: string | number; iconBg: string; iconColor: string; }> = ({ icon, title, value, iconBg, iconColor }) => (
    <Card>
        <div className="flex items-center">
            <div className={`p-3 ${iconBg} rounded-lg border border-border`}>
                {React.cloneElement(icon, { className: `w-6 h-6 ${iconColor}`})}
            </div>
            <div className="ml-4">
                <h3 className="text-muted-foreground font-bold text-sm uppercase tracking-wider">{title}</h3>
                <p className="text-3xl font-extrabold text-foreground">{value}</p>
            </div>
        </div>
    </Card>
);

type ActivityItem = (Project & { activityType: 'project', date: string }) | (Deliverable & { activityType: 'deliverable', date: string });

const AdminDashboard: React.FC = () => {
    const user: User = JSON.parse(localStorage.getItem('telya_user') || '{}');
    const navigate = useNavigate();
    const [projectFilter, setProjectFilter] = useState<ProjectStatus | 'all'>('all');
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
    
    // State for all data
    const [stats, setStats] = useState({
        totalClients: 0,
        activeProjects: 0,
        pendingReviews: 0,
        monthlyRevenue: 0,
    });
    const [allProjects, setAllProjects] = useState<Project[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);

    const loadData = async () => {
        const users = await getUsers();
        const projects = await getProjects();
        const deliverables = await getDeliverables();
        const invoices = await getInvoices();

        setAllUsers(users);
        setAllProjects(projects);

        const currentMonthRevenue = invoices
            .filter(invoice => invoice.status === 'paid' && dayjs(invoice.created_at).isSame(dayjs(), 'month'))
            .reduce((sum, inv) => sum + inv.amount, 0);

        setStats({
            totalClients: users.filter(u => u.role === 'client' && u.status === 'active').length,
            activeProjects: projects.filter(p => ['active', 'in_progress', 'en tournage', 'en montage'].includes(p.status)).length,
            pendingReviews: deliverables.filter(d => d.status === 'in_review').length,
            monthlyRevenue: currentMonthRevenue
        });

        // Generate recent activity feed
        const projectActivities = projects.map(p => ({...p, activityType: 'project' as const, date: p.start_date}));
        const deliverableActivities = deliverables.map(d => ({...d, activityType: 'deliverable' as const, date: d.uploaded_at}));
        
        const combinedActivities = [...projectActivities, ...deliverableActivities]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 4);

        setRecentActivity(combinedActivities as ActivityItem[]);
    };

    useEffect(() => {
        loadData();
    }, []);
    
    const recentProjects = [...allProjects]
        .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
        .filter(p => projectFilter === 'all' || p.status === projectFilter)
        .slice(0, 5);

    const getClientName = (clientId: string) => {
        return allUsers.find(u => u.id === clientId)?.company || 'N/A';
    }

  return (
    <>
        <div>
            <h1 className="text-3xl font-bold text-foreground">Tableau de Bord Admin</h1>
            <p className="mt-1 text-muted-foreground">Bienvenue, {user.name}. Voici un aperçu de l'agence.</p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <MetricCard icon={<Users />} title="Clients Actifs" value={stats.totalClients} iconBg="bg-blue-500/20" iconColor="text-blue-300" />
                 <MetricCard icon={<FolderKanban />} title="Projets Actifs" value={stats.activeProjects} iconBg="bg-green-500/20" iconColor="text-green-300" />
                 <MetricCard icon={<ClipboardCheck />} title="Validations" value={stats.pendingReviews} iconBg="bg-yellow-500/20" iconColor="text-yellow-300" />
                 <MetricCard icon={<Wallet />} title="Revenu (Mois)" value={new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(stats.monthlyRevenue)} iconBg="bg-primary/20" iconColor="text-primary" />
            </div>

            <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 !p-0 overflow-hidden">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-foreground">Projets Récents</h2>
                            <div className="flex items-center space-x-2">
                                <Filter className="w-4 h-4 text-muted-foreground" />
                                <select onChange={(e) => setProjectFilter(e.target.value as any)} value={projectFilter} className="bg-transparent text-sm font-semibold text-muted-foreground focus:outline-none appearance-none">
                                    <option value="all">Tous les statuts</option>
                                    <option value="in_progress">En cours</option>
                                    <option value="active">Actif</option>
                                    <option value="completed">Terminé</option>
                                </select>
                            </div>
                        </div>
                    </div>
                     <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[800px]">
                            <thead>
                                <tr className="text-xs text-muted-foreground uppercase border-b border-border">
                                    <th className="py-2 px-6 font-bold">Titre du Projet</th>
                                    <th className="py-2 px-6 font-bold">Client</th>
                                    <th className="py-2 px-6 font-bold">Statut</th>
                                    <th className="py-2 px-6 font-bold">Échéance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentProjects.map(project => (
                                    <tr key={project.id} onClick={() => navigate(`/projects/${project.id}`)} className="border-b border-border last:border-b-0 hover:bg-accent cursor-pointer">
                                        <td className="py-3 px-6 font-bold text-foreground">{project.title}</td>
                                        <td className="py-3 px-6 font-semibold text-muted-foreground">{getClientName(project.client_id)}</td>
                                        <td className="py-3 px-6">
                                            <span className={`px-2 py-1 text-xs font-bold rounded-full capitalize ${statusStyles[project.status]}`}>
                                                {project.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="py-3 px-6 font-semibold text-muted-foreground">{dayjs(project.due_date).format('DD MMM YYYY')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                     </div>
                </Card>

                <div className="space-y-8">
                     <Card>
                        <h2 className="text-xl font-bold text-foreground mb-4">Actions Rapides</h2>
                        <div className="flex flex-col space-y-3">
                            <Button onClick={() => setIsAddUserModalOpen(true)} variant="secondary" className="w-full justify-start !py-3">
                                <UserPlus className="w-5 h-5 mr-3"/> Ajouter un utilisateur
                            </Button>
                            <Button onClick={() => setIsAddProjectModalOpen(true)} variant="secondary" className="w-full justify-start !py-3">
                               <PlusCircle className="w-5 h-5 mr-3"/> Créer un projet
                            </Button>
                            <Button to="/admin/invoices" variant="secondary" className="w-full justify-start !py-3">
                               <FileText className="w-5 h-5 mr-3"/> Voir les finances
                            </Button>
                        </div>
                    </Card>

                     <Card>
                        <h2 className="text-xl font-bold text-foreground mb-4">Activité Récente</h2>
                         <ul className="space-y-4">
                            {recentActivity.map((item, index) => {
                                const isProject = item.activityType === 'project';
                                const project = isProject ? (item as Project) : allProjects.find(p => p.id === (item as Deliverable).project_id);
                                const client = project ? allUsers.find(u => u.id === project.client_id) : null;
                                
                                return (
                                     <li key={index} className="flex items-start text-sm">
                                        <div className="p-2 bg-secondary rounded-lg border border-border mr-3 mt-1">
                                            {isProject ? <PlusCircle className="w-4 h-4 text-primary"/> : <Zap className="w-4 h-4 text-primary"/>}
                                        </div>
                                        <div>
                                            <p className="text-foreground font-semibold">
                                                {isProject ? (
                                                    <>
                                                        Nouveau projet <span className="font-extrabold">{item.title}</span> pour <span className="font-extrabold">{client?.company || 'N/A'}</span>.
                                                    </>
                                                ) : (
                                                    <>
                                                        Nouveau livrable <span className="font-extrabold">{item.title}</span> pour <span className="font-extrabold">{project?.title || 'N/A'}</span>.
                                                    </>
                                                )}
                                            </p>
                                            <p className="text-xs text-muted-foreground font-bold">{dayjs(isProject ? (item as Project).start_date : (item as Deliverable).uploaded_at).fromNow()}</p>
                                        </div>
                                     </li>
                                );
                            })}
                        </ul>
                    </Card>
                </div>
            </div>
        </div>
        <AddUserModal
            isOpen={isAddUserModalOpen}
            onClose={() => setIsAddUserModalOpen(false)}
            onUserModified={loadData}
        />
        <AddProjectModal
            isOpen={isAddProjectModalOpen}
            onClose={() => setIsAddProjectModalOpen(false)}
            onProjectAdded={loadData}
        />
    </>
  );
};

export default AdminDashboard;