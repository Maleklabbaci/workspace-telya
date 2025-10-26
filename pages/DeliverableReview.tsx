



import React, { useState, useEffect, useRef } from 'react';
// FIX: Correct import for react-router-dom hooks and components.
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Deliverable, DeliverableComment, User, Project } from '../types';
import { getLocalUser, supabase } from '../lib/supabaseClient';
import { getDeliverableById, getDeliverableComments, createDeliverableComment, getProjectById, updateDeliverable, getUsers, createNotification } from '../data/api';
import Spinner from '../components/ui/Spinner';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Textarea from '../components/ui/Textarea';
import { ArrowLeft, Send, Download, Edit, CheckCircle } from 'lucide-react';
import dayjs from 'dayjs';

const DeliverableReview: React.FC = () => {
    const { projectId, deliverableId } = useParams<{ projectId: string, deliverableId: string }>();
    const navigate = useNavigate();
    const currentUser = getLocalUser();

    const [deliverable, setDeliverable] = useState<Deliverable | null>(null);
    const [project, setProject] = useState<Project | null>(null);
    const [comments, setComments] = useState<DeliverableComment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    
    const commentsEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [comments]);

    useEffect(() => {
        if (!deliverableId || !projectId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const [deliverableData, projectData, commentsData] = await Promise.all([
                    getDeliverableById(deliverableId),
                    getProjectById(projectId),
                    getDeliverableComments(deliverableId)
                ]);

                if (!deliverableData || !projectData) {
                    setError("Livrable ou projet non trouvé.");
                    return;
                }
                
                if (currentUser?.role === 'client' && projectData.client_id !== currentUser.id) {
                    setError("Accès non autorisé.");
                    navigate('/client/dashboard');
                    return;
                }

                setDeliverable(deliverableData);
                setProject(projectData);
                setComments(commentsData);
            } catch (err) {
                setError("Erreur lors du chargement des données.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [deliverableId, projectId, currentUser, navigate]);

     useEffect(() => {
        if (!deliverableId) return;

        const channel = supabase
            .channel(`deliverable-comments:${deliverableId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'deliverable_comments', filter: `deliverable_id=eq.${deliverableId}` },
                (payload) => {
                    setComments(prev => [...prev, payload.new as DeliverableComment]);
                }
            )
            .subscribe();
        
        return () => {
            supabase.removeChannel(channel);
        };
    }, [deliverableId]);

    const handleAddComment = async () => {
        if (!newComment.trim() || !currentUser || !deliverable) return;
        await createDeliverableComment({
            deliverable_id: deliverable.id,
            user_id: currentUser.id,
            user_name: currentUser.name,
            user_avatar: currentUser.avatar_url || `https://i.pravatar.cc/150?u=${currentUser.id}`,
            content: newComment.trim(),
        });
        setNewComment('');
    };

    const notifyTeam = async (message: string) => {
        if (!currentUser || !project || !deliverable) return;
        const allUsers = await getUsers();
        const adminOrPM = allUsers.find(u => ['admin', 'project_manager', 'coordinator'].includes(u.role));

        if (adminOrPM) {
            await createNotification({
                user_id: adminOrPM.id,
                actor_id: currentUser.id,
                project_id: project.id,
                message: message,
                link_to: `/projects/${project.id}/deliverables/${deliverable.id}`
            });
        }
    };

    const handleApprove = async () => {
        if (!deliverable) return;
        setIsSubmitting(true);
        try {
            const updated = await updateDeliverable(deliverable.id, { status: 'approved' });
            setDeliverable(updated);
            await notifyTeam(`Le client <strong>${currentUser?.company || currentUser?.name}</strong> a approuvé le livrable "${deliverable.title}".`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRequestRevision = async () => {
        if (!deliverable) return;
        setIsSubmitting(true);
        try {
            const updated = await updateDeliverable(deliverable.id, { status: 'revision_needed' });
            setDeliverable(updated);
            await notifyTeam(`Le client <strong>${currentUser?.company || currentUser?.name}</strong> a demandé une révision pour "${deliverable.title}".`);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const backLink = currentUser?.role === 'client' ? '/client/dashboard' : `/projects/${projectId}`;

    if (loading) return <div className="flex h-screen items-center justify-center"><Spinner /></div>;
    if (error) return <div className="flex h-screen items-center justify-center text-red-500">{error}</div>;
    if (!deliverable || !project) return null;

    const isImage = /\.(jpe?g|png|gif|webp)$/i.test(deliverable.storage_url);

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <Link to={backLink} className="flex items-center text-sm font-semibold text-muted-foreground hover:text-foreground mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" /> Retour
            </Link>

            <header className="mb-6 flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">{deliverable.title}</h1>
                    <p className="text-muted-foreground">Version {deliverable.version} pour le projet "{project.title}"</p>
                </div>
                {currentUser?.role === 'client' && ['in_review', 'revision_needed'].includes(deliverable.status) && (
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                        <Button onClick={handleRequestRevision} disabled={isSubmitting} variant="secondary" className="w-full sm:w-auto">
                            <Edit className="w-4 h-4 mr-2"/> Demander une révision
                        </Button>
                        <Button onClick={handleApprove} disabled={isSubmitting} variant="primary" className="!bg-green-600 hover:!bg-green-700 w-full sm:w-auto">
                            <CheckCircle className="w-4 h-4 mr-2"/> Approuver
                        </Button>
                    </div>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card className="aspect-video w-full flex items-center justify-center bg-secondary/30 p-2">
                        {isImage ? (
                            <img src={deliverable.storage_url} alt={deliverable.title} className="max-w-full max-h-full object-contain rounded-md" />
                        ) : (
                            <div className="text-center">
                                <p className="text-muted-foreground text-xl font-semibold">Aperçu non disponible</p>
                                <p className="text-muted-foreground text-sm">Le type de fichier n'est pas supporté pour un aperçu direct.</p>
                                <a href={deliverable.storage_url} target="_blank" rel="noopener noreferrer">
                                    <Button className="mt-4">
                                        <Download className="w-4 h-4 mr-2" />
                                        Télécharger le fichier
                                    </Button>
                                </a>
                            </div>
                        )}
                    </Card>
                </div>

                <div className="lg:col-span-1">
                    <Card className="flex flex-col h-[70vh]">
                        <h2 className="text-xl font-bold text-foreground border-b border-border pb-3 mb-4">Commentaires</h2>
                        <div className="flex-1 overflow-y-auto space-y-5 pr-2">
                            {comments.map(comment => (
                                <div key={comment.id} className="flex items-start space-x-3">
                                    <img src={comment.user_avatar} alt={comment.user_name} className="w-9 h-9 rounded-full" />
                                    <div className="flex-1">
                                        <div className="flex items-baseline space-x-2">
                                            <p className="font-semibold text-sm text-foreground">{comment.user_name}</p>
                                            <p className="text-xs text-muted-foreground">{dayjs(comment.created_at).fromNow()}</p>
                                        </div>
                                        <div className="mt-1 bg-secondary p-2.5 rounded-lg rounded-tl-none">
                                            <p className="text-sm text-secondary-foreground whitespace-pre-wrap">{comment.content}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                             {comments.length === 0 && (
                                <p className="text-center text-muted-foreground pt-10">Aucun commentaire pour le moment.</p>
                            )}
                            <div ref={commentsEndRef} />
                        </div>
                         <div className="mt-4 pt-4 border-t border-border">
                             <div className="flex items-start space-x-3">
                                <img src={currentUser?.avatar_url} alt={currentUser?.name} className="w-9 h-9 rounded-full" />
                                <div className="flex-1">
                                    <Textarea 
                                        placeholder="Ajouter un commentaire..."
                                        rows={3}
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                    />
                                    <div className="flex justify-end mt-2">
                                        <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                                            <Send className="w-4 h-4 mr-2" /> Envoyer
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default DeliverableReview;