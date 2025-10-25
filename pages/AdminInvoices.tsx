import React from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Invoice, Project, User } from '../types';
import { mockInvoices, mockProjects, mockUsers } from '../data/mockData';
import { Download, CheckCircle, Send, Plus } from 'lucide-react';
import dayjs from 'dayjs';

const AdminInvoices: React.FC = () => {

    const getProjectAndClient = (projectId: string): { project: Project | undefined, client: User | undefined } => {
        const allProjects = [...mockProjects, ...JSON.parse(localStorage.getItem('telya_projects') || '[]')];
        const allUsers = [...mockUsers, ...JSON.parse(localStorage.getItem('telya_users') || '[]')];

        const project = allProjects.find(p => p.id === projectId);
        const client = project ? allUsers.find(u => u.id === project.client_id) : undefined;
        return { project, client };
    };

    const statusStyles: { [key in Invoice['status']]: string } = {
        draft: 'bg-secondary text-secondary-foreground',
        sent: 'bg-blue-500/10 text-blue-500',
        paid: 'bg-green-500/10 text-green-500',
        overdue: 'bg-red-500/10 text-red-500',
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Invoices & Billing</h1>
                    <p className="mt-1 text-muted-foreground">Manage all agency invoices and financial records.</p>
                </div>
                 <Button>
                    <Plus className="w-5 h-5 mr-2" />
                    Create Invoice
                 </Button>
            </div>
            
            <Card className="!p-0">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="py-3 px-6 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Invoice ID</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Client</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Project</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Due Date</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {mockInvoices.map(invoice => {
                                const { project, client } = getProjectAndClient(invoice.project_id);
                                return (
                                <tr key={invoice.id} className="hover:bg-accent">
                                    <td className="py-4 px-6 font-mono text-sm text-muted-foreground">{invoice.id}</td>
                                    <td className="py-4 px-6 font-semibold text-foreground">{client?.company || 'N/A'}</td>
                                    <td className="py-4 px-6 text-muted-foreground">{project?.title || 'N/A'}</td>
                                    <td className="py-4 px-6 font-semibold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: invoice.currency }).format(invoice.amount)}</td>
                                    <td className="py-4 px-6">
                                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${statusStyles[invoice.status]}`}>
                                            {invoice.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-muted-foreground">{dayjs(invoice.due_date).format('MMM DD, YYYY')}</td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center space-x-1">
                                            {/* FIX: Removed unsupported 'size' prop. Sizing is handled by className. */}
                                            <Button variant="ghost" className="!p-2" title="Download PDF"><Download className="w-4 h-4" /></Button>
                                            {/* FIX: Removed unsupported 'size' prop. Sizing is handled by className. */}
                                            {invoice.status === 'draft' && <Button variant="ghost" className="!p-2" title="Send Invoice"><Send className="w-4 h-4" /></Button>}
                                            {/* FIX: Removed unsupported 'size' prop. Sizing is handled by className. */}
                                            {invoice.status === 'sent' && <Button variant="ghost" className="!p-2" title="Mark as Paid"><CheckCircle className="w-4 h-4" /></Button>}
                                        </div>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default AdminInvoices;