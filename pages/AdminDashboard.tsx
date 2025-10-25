import React, { useState, useEffect } from 'react';
import { User, Project, ProjectStatus } from '../types';
import Card from '../components/ui/Card';
import { Users, FolderKanban, Wallet, ClipboardCheck, PlusCircle, UserPlus, FileText, Filter, Zap, Check, X } from 'lucide-react';
import Button from '../components/ui/Button';
import { mockUsers, mockProjects as defaultProjects, mockDeliverables } from '../data/mockData';
import dayjs from 'dayjs';
import AddUserModal from '../components/AddUserModal';
import AddProjectModal from '../components/AddProjectModal'; // New Import
import { useNavigate } from 'react-router-dom';

const statusStyles: { [key in Project['status']]: string } = {
  draft: 'bg-secondary text-secondary-foreground',
  active: 'bg-blue-500/10 text-blue-500',
  in_progress: 'bg-yellow-500/10 text-yellow-500',
  completed: 'bg-green-500/10 text-green-500',
  archived: 'bg-secondary text-muted-foreground',
  'en préparation': 'bg-purple-500/10 text-purple-500',
  'en tournage': 'bg-blue-500/10 text-blue-500',
  'en montage': 'bg-yellow-500/10 text-yellow-500',
  'livré': 'bg-green-500/10 text-green-500',
};

const mockActivity = [
    { id: 1, user: 'Videaste', action: 'uploaded a new deliverable for', target: 'Luxury Villa Showcase', time: '2h ago' },
    { id: 2, user: 'Client Aura', action: 'approved the deliverable', target: 'Logo Concepts (Round 1)', time: '5h ago' },
    { id: 3, user: 'Abdelmalek', action: 'assigned a new task to Editor in', target: 'Brand Identity - Aura Watches', time: '1d ago' },
    { id: 4, user: 'Admin Telya', action: 'added a new client', target: 'Downtown Arch Inc.', time: '2d ago' },
];

const MetricCard: React.FC<{ icon: React.ReactElement<{ className?: string }>; title: string; value: string | number; iconBg: string; iconColor: string; }> = ({ icon, title, value, iconBg, iconColor }) => (
    <Card>
        <div className="flex items-center">
            <div className={`p-3 ${iconBg} rounded-full`}>
                {React.cloneElement(icon, { className: `w-6 h-6 ${iconColor}`})}
            </div>
            <div className="ml-4">
                <h3 className="text-muted-foreground font-semibold text-sm">{title}</h3>
                <p className="text-2xl font-bold text-foreground">{value}</p>
            </div>
        </div>
    </Card>
);

const AdminDashboard: React.FC = () => {
    const user: User = JSON.parse(localStorage.getItem('telya_user') || '{}');
    const navigate = useNavigate();
    const [projectFilter, setProjectFilter] = useState<ProjectStatus | 'all'>('all');
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
    
    const [totalClients, setTotalClients] = useState(0);
    const [activeProjects, setActiveProjects] = useState(0);
    const [pendingReviews, setPendingReviews] = useState(0);
    const [pendingEmployees, setPendingEmployees] = useState<User[]>([]);
    const [pendingClients, setPendingClients] = useState<User[]>([]);
    const [allProjects, setAllProjects] = useState<Project[]>([]);

    const loadData = () => {
        const allStoredUsers: User[] = JSON.parse(localStorage.getItem('telya_users') || '[]');
        const allUsers = [...mockUsers, ...allStoredUsers];
        const uniqueUsers = allUsers.filter((v,i,a)=>a.findIndex(t=>(t.email === v.email))===i);
        
        const allStoredProjects: Project[] = JSON.parse(localStorage.getItem('telya_projects') || '[]');
        const combinedProjects = [...defaultProjects, ...allStoredProjects];
        const uniqueProjects = combinedProjects.filter((v,i,a)=>a.findIndex(t=>(t.id === v.id))===i);
        setAllProjects(uniqueProjects);

        setTotalClients(uniqueUsers.filter(u => u.role === 'client' && u.status === 'active').length);
        setActiveProjects(uniqueProjects.filter(p => ['active', 'in_progress', 'en tournage', 'en montage'].includes(p.status)).length);
        setPendingReviews(mockDeliverables.filter(d => d.status === 'in_review').length);
        setPendingEmployees(uniqueUsers.filter(u => u.role !== 'client' && u.status === 'pending_validation'));
        setPendingClients(uniqueUsers.filter(u => u.role === 'client' && u.status === 'pending_validation'));
    };

    useEffect(() => {
        loadData();
    }, []);
    
    const handleApprovalAction = (userId: string, newStatus: 'active' | 'rejected') => {
        const allStoredUsers: User[] = JSON.parse(localStorage.getItem('telya_users') || '[]');
        const userIndex = allStoredUsers.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            allStoredUsers[userIndex].status = newStatus;
            localStorage.setItem('telya_users', JSON.stringify(allStoredUsers));
            loadData();
        }
    };

    const monthlyRevenue = '$25,600'; // Hardcoded for demo

    const recentProjects = [...allProjects]
        .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
        .filter(p => projectFilter === 'all' || p.status === projectFilter)
        .slice(0, 5);

    const getClientName = (clientId: string) => {
        const allStoredUsers: User[] = JSON.parse(localStorage.getItem('telya_users') || '[]');
        const allUsers = [...mockUsers, ...allStoredUsers];
        return allUsers.find(u => u.id === clientId)?.company || 'N/A';
    }

  return (
    <>
        <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="mt-1 text-muted-foreground">Welcome, {user.name}. Here's the agency overview.</p>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 <MetricCard icon={<Users />} title="Total Clients" value={totalClients} iconBg="bg-blue-500/10" iconColor="text-blue-500" />
                 <MetricCard icon={<FolderKanban />} title="Active Projects" value={activeProjects} iconBg="bg-green-500/10" iconColor="text-green-500" />
                 <MetricCard icon={<ClipboardCheck />} title="Pending Reviews" value={pendingReviews} iconBg="bg-yellow-500/10" iconColor="text-yellow-500" />
                 <MetricCard icon={<Wallet />} title="Revenue (Month)" value={monthlyRevenue} iconBg="bg-primary/10" iconColor="text-primary" />
            </div>

            {pendingClients.length > 0 && (
                 <Card className="mt-10">
                    <h2 className="text-xl font-bold text-foreground mb-4">Pending Client Approvals ({pendingClients.length})</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-xs text-muted-foreground uppercase border-b border-border">
                                    <th className="py-2 px-4 font-semibold">Company</th>
                                    <th className="py-2 px-4 font-semibold">Contact Name</th>
                                    <th className="py-2 px-4 font-semibold">Contact Details</th>
                                    <th className="py-2 px-4 font-semibold">Sector</th>
                                    <th className="py-2 px-4 font-semibold">Registered</th>
                                    <th className="py-2 px-4 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {pendingClients.map(u => (
                                    <tr key={u.id} className="hover:bg-accent">
                                        <td className="py-3 px-4 font-semibold">{u.company}</td>
                                        <td className="py-3 px-4">{u.name}</td>
                                        <td className="py-3 px-4 text-sm">{u.contactEmail}<br/>{u.phone}</td>
                                        <td className="py-3 px-4 text-sm">{u.sector}</td>
                                        <td className="py-3 px-4 text-sm">{dayjs(u.registeredAt).format('MMM DD, YYYY')}</td>
                                        <td className="py-3 px-4">
                                            <div className="flex space-x-2">
                                                <Button onClick={() => handleApprovalAction(u.id, 'active')} variant="primary" className="!px-3 !py-1 text-sm flex items-center"><Check className="w-4 h-4 mr-1"/> Validate</Button>
                                                <Button onClick={() => handleApprovalAction(u.id, 'rejected')} variant="danger" className="!px-3 !py-1 text-sm flex items-center"><X className="w-4 h-4 mr-1"/> Refuse</Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                 </Card>
            )}

            {pendingEmployees.length > 0 && (
                 <Card className="mt-10">
                    <h2 className="text-xl font-bold text-foreground mb-4">Pending Employee Approvals ({pendingEmployees.length})</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-xs text-muted-foreground uppercase border-b border-border">
                                    <th className="py-2 px-4 font-semibold">Name</th>
                                    <th className="py-2 px-4 font-semibold">Role</th>
                                    <th className="py-2 px-4 font-semibold">Contact</th>
                                    <th className="py-2 px-4 font-semibold">Registered</th>
                                    <th className="py-2 px-4 font-semibold">Portfolio</th>
                                    <th className="py-2 px-4 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {pendingEmployees.map(u => (
                                    <tr key={u.id} className="hover:bg-accent">
                                        <td className="py-3 px-4 font-semibold">{u.name}</td>
                                        <td className="py-3 px-4">{u.jobTitle}</td>
                                        <td className="py-3 px-4 text-sm">{u.contactEmail}<br/>{u.phone}</td>
                                        <td className="py-3 px-4 text-sm">{dayjs(u.registeredAt).format('MMM DD, YYYY')}</td>
                                        <td className="py-3 px-4">
                                            {u.portfolioUrl ? <a href={u.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm font-semibold">View</a> : 'N/A'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex space-x-2">
                                                <Button onClick={() => handleApprovalAction(u.id, 'active')} variant="primary" className="!px-3 !py-1 text-sm flex items-center"><Check className="w-4 h-4 mr-1"/> Validate</Button>
                                                <Button onClick={() => handleApprovalAction(u.id, 'rejected')} variant="danger" className="!px-3 !py-1 text-sm flex items-center"><X className="w-4 h-4 mr-1"/> Refuse</Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                 </Card>
            )}
            
            <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-foreground">Recent Projects</h2>
                        <div className="flex items-center space-x-2">
                            <Filter className="w-4 h-4 text-muted-foreground" />
                            <select onChange={(e) => setProjectFilter(e.target.value as any)} value={projectFilter} className="bg-transparent text-sm font-semibold text-muted-foreground focus:outline-none appearance-none">
                                <option value="all">All Statuses</option>
                                <option value="in_progress">In Progress</option>
                                <option value="active">Active</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    </div>
                     <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-xs text-muted-foreground uppercase border-b border-border">
                                    <th className="py-2 px-4 font-semibold">Project Title</th>
                                    <th className="py-2 px-4 font-semibold">Client</th>
                                    <th className="py-2 px-4 font-semibold">Status</th>
                                    <th className="py-2 px-4 font-semibold">Due Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentProjects.map(project => (
                                    <tr key={project.id} onClick={() => navigate(`/projects/${project.id}`)} className="border-b border-border last:border-b-0 hover:bg-accent cursor-pointer">
                                        <td className="py-3 px-4 font-semibold text-foreground">{project.title}</td>
                                        <td className="py-3 px-4">{getClientName(project.client_id)}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${statusStyles[project.status]}`}>
                                                {project.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">{dayjs(project.due_date).format('MMM DD, YYYY')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                     </div>
                </Card>

                <div className="space-y-8">
                     <Card>
                        <h2 className="text-xl font-bold text-foreground mb-4">Quick Actions</h2>
                        <div className="flex flex-col space-y-3">
                            <Button onClick={() => setIsAddUserModalOpen(true)} variant="secondary" className="w-full justify-start !py-3">
                                <UserPlus className="w-5 h-5 mr-3"/> Add New User
                            </Button>
                            <Button onClick={() => setIsAddProjectModalOpen(true)} variant="secondary" className="w-full justify-start !py-3">
                               <PlusCircle className="w-5 h-5 mr-3"/> Create Project
                            </Button>
                            <Button to="/admin/invoices" variant="secondary" className="w-full justify-start !py-3">
                               <FileText className="w-5 h-5 mr-3"/> View Financials
                            </Button>
                        </div>
                    </Card>

                     <Card>
                        <h2 className="text-xl font-bold text-foreground mb-4">Recent Activity</h2>
                         <ul className="space-y-4">
                            {mockActivity.map(item => (
                                 <li key={item.id} className="flex items-start text-sm">
                                    <div className="p-2 bg-secondary rounded-full mr-3 mt-1">
                                        <Zap className="w-4 h-4 text-primary"/>
                                    </div>
                                    <div>
                                        <p className="text-foreground">
                                            <span className="font-semibold">{item.user}</span> {item.action} <span className="font-semibold">{item.target}</span>.
                                        </p>
                                        <p className="text-xs text-muted-foreground">{item.time}</p>
                                    </div>
                                 </li>
                            ))}
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