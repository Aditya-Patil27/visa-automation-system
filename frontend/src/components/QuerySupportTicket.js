import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from './ui/Button';
import { api } from '../services/api';
import { L } from '../config/labels';
import { ROUTES } from '../config/routes';

const QuerySupportTicket = () => {
    const [queries, setQueries] = useState([]);
    const [selectedQuery, setSelectedQuery] = useState(null);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [view, setView] = useState('list');

    const fetchQueries = async () => {
        try {
            const data = await api.get('/queries');
            setQueries(data);
        } catch (e) {
            if (e?.status !== 401) setError('Failed to load queries');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchQueries(); }, []);

    const fetchQueryDetail = async (id) => {
        try {
            const data = await api.get(`/queries/${id}`);
            setSelectedQuery(data);
        } catch (e) { setError('Failed to load query details'); }
    };

    const handleSubmit = async () => {
        if (!subject.trim() || !message.trim()) { setError('Subject and message are required.'); return; }
        setSubmitting(true);
        setError('');
        try {
            await api.post('/queries', { subject, message });
            setSuccess('Query submitted successfully');
            setSubject(''); setMessage(''); setView('list');
            fetchQueries();
        } catch (e) { setError('Failed to submit query'); }
        finally { setSubmitting(false); }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-background-dark text-slate-500 animate-pulse">{L.LOADING}</div>;

    return (
        <div className="bg-background-dark text-slate-100 min-h-screen font-display">
            <header className="flex items-center justify-between border-b border-slate-800 px-6 py-3 bg-background-dark/80 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-3 text-primary">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center"><span className="material-symbols-outlined text-background-dark">support</span></div>
                    <h2 className="text-xl font-extrabold">{L.SUPPORT}</h2>
                </div>
                <nav className="flex items-center gap-6">
                    <Button variant="ghost" to={ROUTES.USER_DASHBOARD}>{L.DASHBOARD}</Button>
                </nav>
            </header>
            {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm mx-6 mt-4">{error}<button onClick={() => setError('')} className="float-right"><span className="material-symbols-outlined text-lg">close</span></button></div>}
            {success && <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 text-emerald-400 text-sm mx-6 mt-4">{success}<button onClick={() => setSuccess('')} className="float-right"><span className="material-symbols-outlined text-lg">close</span></button></div>}
            <main className="p-6 md:p-8 max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-black">{L.SUPPORT_TICKETS}</h1>
                    <div className="flex gap-2">
                        <Button variant={view === 'list' ? 'primary' : 'ghost'} size="sm" onClick={() => { setView('list'); setSelectedQuery(null); }}>{L.MY_TICKETS}</Button>
                        <Button variant={view === 'new' ? 'primary' : 'ghost'} size="sm" onClick={() => { setView('new'); setSelectedQuery(null); }}>{L.NEW_TICKET}</Button>
                    </div>
                </div>
                {view === 'new' && (
                    <div className="bg-background-dark/80 border border-slate-800 rounded-2xl p-6 space-y-4">
                        <h2 className="text-xl font-bold">{L.SUBMIT_TICKET}</h2>
                        <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-slate-200 focus:border-primary focus:ring-0 outline-none" />
                        <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Describe your issue..." rows={6} className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-slate-200 focus:border-primary focus:ring-0 outline-none" />
                        <Button onClick={handleSubmit} disabled={submitting}>{submitting ? L.LOADING : L.SUBMIT_TICKET}</Button>
                    </div>
                )}
                {view === 'list' && !selectedQuery && (queries.length === 0 ? (
                    <div className="text-center py-16"><span className="material-symbols-outlined text-5xl text-slate-600 mb-4">support</span><p className="text-slate-400">{L.NO_DATA}</p></div>
                ) : (
                    <div className="space-y-3">{queries.map(q => (
                        <div key={q.id} onClick={() => { fetchQueryDetail(q.id); setView('detail'); }} className="bg-background-dark/80 border border-slate-800 rounded-xl p-5 cursor-pointer hover:border-primary/50 transition-colors">
                            <div className="flex items-center justify-between"><p className="font-bold">{q.subject}</p><span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${q.status === 'open' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>{q.status}</span></div>
                            <p className="text-xs text-slate-500 mt-1">{new Date(q.created_at).toLocaleString()}</p>
                        </div>
                    ))}</div>
                ))}
                {view === 'detail' && selectedQuery && (
                    <div className="space-y-6">
                        <Button variant="ghost" size="sm" onClick={() => { setView('list'); setSelectedQuery(null); }}>&larr; {L.BACK}</Button>
                        <div className="bg-background-dark/80 border border-slate-800 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-bold">{selectedQuery.subject}</h2><span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${selectedQuery.status === 'open' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>{selectedQuery.status}</span></div>
                            <div className="bg-slate-900 rounded-xl p-4 mb-6"><p className="text-sm text-slate-300 whitespace-pre-wrap">{selectedQuery.message}</p></div>
                            {selectedQuery.responses?.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Responses</h3>
                                    {selectedQuery.responses.map((r, i) => (
                                        <div key={i} className="bg-primary/5 border border-primary/10 rounded-xl p-4">
                                            <p className="text-sm text-slate-200 whitespace-pre-wrap">{r.message}</p>
                                            <p className="text-[10px] text-slate-500 mt-1">{r.responder} — {new Date(r.created_at).toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default QuerySupportTicket;
