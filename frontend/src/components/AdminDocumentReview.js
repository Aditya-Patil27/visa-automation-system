import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './ui/Button';
import { api } from '../services/api';
import { L } from '../config/labels';
import { ROUTES } from '../config/routes';

const FILTERS = ['all', 'uploaded', 'approved', 'rejected'];

const AdminDocumentReview = () => {
    const [documents, setDocuments] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [reviewNotes, setReviewNotes] = useState({});
    const [reviewingId, setReviewingId] = useState(null);
    const navigate = useNavigate();

    const fetchDocs = async () => {
        try {
            const query = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
            const results = await Promise.allSettled([
                api.get(`/admin/documents/pending${query}`),
                api.get('/admin/documents/stats'),
            ]);
            if (results[0].status === 'fulfilled') setDocuments(results[0].value);
            else if (results[0].reason?.status === 403) navigate('/login');
            if (results[1].status === 'fulfilled') setStats(results[1].value);
        } catch (err) {
            setError('Failed to load documents');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDocs(); }, [statusFilter]);

    const handleReview = async (id, status) => {
        const notes = reviewNotes[id] || '';
        if (status === 'rejected' && !notes.trim()) {
            setError('Please provide reviewer notes when rejecting.');
            return;
        }
        setReviewingId(id);
        setError('');
        try {
            await api.post(`/admin/documents/${id}/review`, { status, reviewer_notes: notes });
            setSuccess(`Document ${status}`);
            setReviewNotes(prev => ({ ...prev, [id]: '' }));
            fetchDocs();
        } catch (err) {
            if (err.status === 403) navigate('/login');
            else setError(err.detail || 'Review failed');
        } finally {
            setReviewingId(null);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-background-dark text-slate-500"><div className="animate-pulse space-y-4 w-full max-w-4xl p-8">{Array.from({ length: 5 }, (_, i) => <div key={i} className="h-16 bg-primary/5 rounded-xl"></div>)}</div></div>;
    }

    return (
        <div className="bg-background-dark text-slate-100 min-h-screen font-display">
            <header className="flex items-center justify-between border-b border-slate-800 px-6 py-3 bg-background-dark/80 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-3 text-primary">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center"><span className="material-symbols-outlined text-background-dark">verified</span></div>
                    <h2 className="text-xl font-extrabold">{L.APP_NAME_SHORT} Admin</h2>
                </div>
                <nav className="flex items-center gap-6">
                    <Button variant="ghost" to={ROUTES.ADMIN_DASHBOARD} className="text-sm font-medium">{L.DASHBOARD}</Button>
                    <Button variant="ghost" to={ROUTES.ADMIN_DOC_REVIEW} className="text-sm font-bold border-b-2 border-primary pb-1 text-primary">{L.ADMIN_DOC_REVIEW}</Button>
                </nav>
            </header>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm flex items-start gap-3 mx-6 mt-4">
                    <span className="material-symbols-outlined text-lg shrink-0">error</span><span>{error}</span>
                    <Button variant="icon" onClick={() => setError('')} className="ml-auto"><span className="material-symbols-outlined text-lg">close</span></Button>
                </div>
            )}
            {success && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 text-emerald-400 text-sm flex items-start gap-3 mx-6 mt-4">
                    <span className="material-symbols-outlined text-lg shrink-0">check_circle</span><span>{success}</span>
                    <Button variant="icon" onClick={() => setSuccess('')} className="ml-auto"><span className="material-symbols-outlined text-lg">close</span></Button>
                </div>
            )}

            <main className="p-6 md:p-8 max-w-6xl mx-auto">
                <h1 className="text-3xl font-black mb-2">{L.ADMIN_DOC_REVIEW}</h1>
                <p className="text-slate-400 mb-8">Review and verify user-submitted visa documents.</p>

                <div className="grid grid-cols-4 gap-4 mb-8">
                    <div className="bg-primary/5 p-4 rounded-xl border border-primary/10"><p className="text-2xl font-black">{stats.total}</p><p className="text-xs text-slate-400">Total</p></div>
                    <div className="bg-amber-500/5 p-4 rounded-xl border border-amber-500/10"><p className="text-2xl font-black text-amber-400">{stats.pending}</p><p className="text-xs text-slate-400">Pending</p></div>
                    <div className="bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10"><p className="text-2xl font-black text-emerald-400">{stats.approved}</p><p className="text-xs text-slate-400">Approved</p></div>
                    <div className="bg-red-500/5 p-4 rounded-xl border border-red-500/10"><p className="text-2xl font-black text-red-400">{stats.rejected}</p><p className="text-xs text-slate-400">Rejected</p></div>
                </div>

                <div className="flex gap-2 mb-6">
                    {FILTERS.map(f => (
                        <Button key={f} onClick={() => setStatusFilter(f)} variant="ghost" className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${statusFilter === f ? 'bg-primary text-background-dark' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                        </Button>
                    ))}
                </div>

                {documents.length === 0 ? (
                    <div className="text-center py-16"><span className="material-symbols-outlined text-5xl text-slate-600 mb-4">task_alt</span><p className="text-slate-400">{L.NO_DATA}</p></div>
                ) : (
                    <div className="space-y-4">
                        {documents.map(doc => (
                            <div key={doc.id} className="bg-background-dark/80 border border-slate-800 rounded-xl p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <p className="font-bold">{doc.filename}</p>
                                        <p className="text-sm text-slate-400">{doc.user_email} • {doc.document_type}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${doc.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : doc.status === 'rejected' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>{doc.status}</span>
                                        <Button variant="icon" href={`http://localhost:8000/admin/documents/download/${doc.id}`} target="_blank" rel="noreferrer">
                                            <span className="material-symbols-outlined text-sm">{L.DOWNLOAD}</span>
                                        </Button>
                                    </div>
                                </div>
                                {doc.status === 'uploaded' && (
                                    <div className="space-y-3">
                                        <textarea value={reviewNotes[doc.id] || ''} onChange={(e) => setReviewNotes(prev => ({ ...prev, [doc.id]: e.target.value }))} placeholder="Reviewer notes (required for rejection)..." className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:border-primary focus:ring-0 outline-none" rows={2} />
                                        <div className="flex gap-2">
                                            <Button variant="success" onClick={() => handleReview(doc.id, 'approved')} disabled={reviewingId === doc.id}>{L.APPROVE}</Button>
                                            <Button variant="danger" onClick={() => handleReview(doc.id, 'rejected')} disabled={reviewingId === doc.id}>{L.REJECT}</Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDocumentReview;
