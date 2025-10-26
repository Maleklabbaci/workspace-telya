
import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Invoice, Project, User } from '../types';
import { getInvoices, getProjects, getUsers } from '../data/api';
import { Download, CheckCircle, Send, Plus } from 'lucide-react';
import dayjs from 'dayjs';

const AdminInvoices: React.FC = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        const loadData = async () => {
            setInvoices(await getInvoices());
            setProjects(await getProjects());
            setUsers(await getUsers());
        };
        loadData();
    }, []);

    const getProjectAndClient = (projectId: string): { project: Project | undefined, client: User | undefined } => {
        const project = projects.find(p => p.id === projectId);
        const client = project ? users.find(u => u.id === project.client_id) : undefined;
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
                    <h1 className="text-3xl font-bold text-foreground">Factures & Facturation</h1>
                    <p className="mt-1 text-muted-foreground">Gérer toutes les factures et les dossiers financiers de l'agence.</p>
                </div>
                 <Button>
                    <Plus className="w-5 h-5 mr-2" />
                    Créer une Facture
                 </Button>
            </div>
            
            <Card className="!p-0">
                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="py-3 px-6 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">ID Facture</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Client</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Projet</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Montant</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Statut</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Échéance</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {invoices.map(invoice => {
                                const { project, client } = getProjectAndClient(invoice.project_id);
                                return (
                                <tr key={invoice.id} className="hover:bg-accent">
                                    <td className="py-4 px-6 font-mono text-sm text-muted-foreground">{invoice.id}</td>
                                    <td className="py-4 px-6 font-semibold text-foreground">{client?.company || 'N/A'}</td>
                                    <td className="py-4 px-6 text-muted-foreground">{project?.title || 'N/A'}</td>
                                    <td className="py-4 px-6 font-semibold">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: invoice.currency }).format(invoice.amount)}</td>
                                    <td className="py-4 px-6">
                                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${statusStyles[invoice.status]}`}>
                                            {invoice.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-muted-foreground">{dayjs(invoice.due_date).format('DD MMM YYYY')}</td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center space-x-1">
                                            <Button variant="ghost" className="!p-2" aria-label="Télécharger PDF"><Download className="w-4 h-4" /></Button>
                                            {invoice.status === 'draft' && <Button variant="ghost" className="!p-2" aria-label="Envoyer la facture"><Send className="w-4 h-4" /></Button>}
                                            {invoice.status === 'sent' && <Button variant="ghost" className="!p-2" aria-label="Marquer comme payée"><CheckCircle className="w-4 h-4" /></Button>}
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
