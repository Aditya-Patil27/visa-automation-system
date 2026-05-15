import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from './ui/Button';
import { api } from '../services/api';
import { L } from '../config/labels';
import { ROUTES } from '../config/routes';

const ApprovalWorkflow = () => {
    const [workflows, setWorkflows] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await api.get('/workflow');
                setWorkflows(data);
            } catch (err) {
                console.error("Failed to fetch workflow data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark text-slate-500">Loading pending workflows...</div>;
    }

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased">
            <div className="flex h-screen overflow-hidden">
                {/* Sidebar */}
                <aside className="w-64 flex-shrink-0 border-r border-slate-800 bg-background-dark flex flex-col">
                    <div className="p-6 flex items-center gap-3">
                        <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                            <span className="material-symbols-outlined text-primary">verified_user</span>
                        </div>
                        <div>
                            <h1 className="text-sm font-bold text-slate-100">VisaFlow Admin</h1>
                            <p className="text-xs text-slate-500">Global Operations</p>
                        </div>
                    </div>
                    <nav className="flex-1 px-4 space-y-1">
                        <Link className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors" to={ROUTES.ADMIN_DASHBOARD}>
                            <span className="material-symbols-outlined">dashboard</span>
                            <span className="text-sm font-medium">{L.DASHBOARD}</span>
                        </Link>
                        <Link className="flex items-center gap-3 px-3 py-2 text-white bg-primary/10 border border-primary/20 rounded-lg transition-colors" to={ROUTES.APPROVAL_WORKFLOW}>
                            <span className="material-symbols-outlined text-primary">pending_actions</span>
                            <span className="text-sm font-medium">Pending Approvals</span>
                        </Link>
                        <Link className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors" to={ROUTES.SCRAPER_MONITOR}>
                            <span className="material-symbols-outlined">data_exploration</span>
                            <span className="text-sm font-medium">Automation Logs</span>
                        </Link>
                        <Link className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors" to={ROUTES.ACTIVITY_LOGS}>
                            <span className="material-symbols-outlined">history</span>
                            <span className="text-sm font-medium">Audit Reports</span>
                        </Link>
                        <Link className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors" to="/">
                            <span className="material-symbols-outlined">settings</span>
                            <span className="text-sm font-medium">{L.SETTINGS}</span>
                        </Link>
                    </nav>
                    <div className="p-4 border-t border-slate-800">
                        <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                            <div className="size-8 rounded bg-primary/40 flex items-center justify-center text-xs font-bold">JD</div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold truncate">Jane Doe</p>
                                <p className="text-[10px] text-slate-500 truncate">Senior Manager</p>
                            </div>
                        </div>
                    </div>
                </aside>
                {/* Main Content */}
                <main className="flex-1 flex flex-col overflow-hidden bg-background-dark">
                    {/* Header */}
                    <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-background-dark/50 backdrop-blur-md sticky top-0 z-10">
                        <div className="flex items-center gap-4">
                            <h2 className="text-xl font-bold tracking-tight">Review Updates</h2>
                            <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider">12 Pending</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">search</span>
                                <input className="bg-slate-900 border-slate-700 rounded-lg pl-9 pr-4 py-1.5 text-xs w-64 focus:ring-primary focus:border-primary" placeholder="Search updates..." type="text" />
                            </div>
                            <Button variant="ghost" icon="filter_list">Filters</Button>
                        </div>
                    </header>
                    <div className="flex-1 flex overflow-hidden">
                        {/* Left Column: Pending Queue */}
                        <section className="w-[400px] border-r border-slate-800 flex flex-col overflow-hidden">
                            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pending Queue</h3>
                                <div className="flex gap-1">
                                    <Button variant="ghost" icon="sort" className="p-1" />
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {workflows.length > 0 ? workflows.map((wf, idx) => {
                                    const isUrgent = wf.priority === 'High' || wf.priority === 'Breaking';
                                    const isMedium = wf.priority === 'Medium';
                                    return (
                                        <div key={idx} className={`bg-white/5 backdrop-blur-md border p-4 rounded-xl cursor-pointer hover:bg-white/10 transition-all ${isUrgent ? 'border-l-4 border-l-red-500 border-white/10' : isMedium ? 'border-l-4 border-l-primary bg-primary/5 ring-1 ring-primary/30 border-white/10' : 'border-l-4 border-l-slate-600 border-white/10'}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-sm font-bold">{wf.type}</span>
                                                <span className={`${isUrgent ? 'bg-red-500/20 text-red-400' : isMedium ? 'bg-orange-500/20 text-orange-400' : 'bg-slate-700 text-slate-300'} text-[10px] px-2 py-0.5 rounded font-bold uppercase`}>
                                                    {wf.priority}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400 mb-3">{wf.user}</p>
                                            <div className="flex items-center justify-between text-[11px]">
                                                <span className="flex items-center gap-1 text-slate-500">
                                                    <span className="material-symbols-outlined text-sm">settings</span> {wf.id}
                                                </span>
                                                <span className="text-slate-500">{wf.time}</span>
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <div className="text-center text-slate-500 p-4 text-sm">No pending workflows.</div>
                                )}
                            </div>
                        </section>
                        {/* Center Column: Comparison View */}
                        <section className="flex-1 flex flex-col overflow-y-auto bg-background-dark/40">
                            <div className="p-8 max-w-4xl mx-auto w-full mb-32">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <h2 className="text-2xl font-bold flex items-center gap-3">
                                            Germany: Digital Nomad Visa
                                            <span className="text-xs font-normal text-slate-500 bg-slate-800 px-2 py-1 rounded">Update ID: #V-90210</span>
                                        </h2>
                                        <p className="text-slate-400 mt-1">Proposed changes to fee structure and processing timeline</p>
                                    </div>
                                </div>
                                {/* Comparison Cards */}
                                <div className="grid grid-cols-2 gap-6">
                                    {/* Current */}
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                            <span className="size-2 rounded-full bg-slate-500"></span> Current Version
                                        </h4>
                                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 min-h-[400px]">
                                            <div className="space-y-6">
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Visa Fee</label>
                                                    <p className="text-lg font-medium text-slate-300 mt-1">€75.00</p>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Processing Time</label>
                                                    <p className="text-lg font-medium text-slate-300 mt-1">15 - 30 Working Days</p>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Requirements</label>
                                                    <ul className="text-sm text-slate-400 mt-2 space-y-2 list-disc list-inside">
                                                        <li>Valid Passport</li>
                                                        <li>Proof of income (€2,500+)</li>
                                                        <li>Travel insurance</li>
                                                        <li>Proof of freelance work</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Proposed */}
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                                            <span className="size-2 rounded-full bg-primary shadow-[0_0_8px_rgba(13,204,242,0.6)]"></span> Proposed Version
                                        </h4>
                                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 min-h-[400px] border-primary/20 bg-primary/[0.02]">
                                            <div className="space-y-6">
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Visa Fee</label>
                                                    <div className="flex items-baseline gap-2 mt-1">
                                                        <p className="text-lg font-bold text-slate-100">€110.00</p>
                                                        <span className="text-[10px] bg-red-500/20 text-red-400 px-1 rounded">+46%</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Processing Time</label>
                                                    <p className="text-lg font-bold text-primary mt-1 bg-primary/10 px-2 rounded -mx-2 inline-block">45 - 60 Working Days</p>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Requirements</label>
                                                    <ul className="text-sm text-slate-400 mt-2 space-y-2 list-disc list-inside">
                                                        <li>Valid Passport</li>
                                                        <li><span className="bg-primary/20 text-slate-100 px-1 rounded">Proof of income (€3,500+)</span></li>
                                                        <li>Travel insurance</li>
                                                        <li>Proof of freelance work</li>
                                                        <li className="text-primary font-medium">+ Biometric Enrollment</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Notes Section */}
                                <div className="mt-8">
                                    <label className="text-xs font-bold text-slate-500 uppercase mb-3 block">Change Justification</label>
                                    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-lg bg-slate-900/50">
                                        <p className="text-sm text-slate-300 leading-relaxed italic">
                                            "New fee structure announced by the German Federal Foreign Office effective next month. Processing times increased due to peak season and biometric requirement implementation."
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {/* Floating Action Bar */}
                            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-900/90 border border-slate-700 backdrop-blur-xl p-3 rounded-2xl shadow-2xl z-20">
                                <Button variant="danger" icon="close">{L.REJECT}</Button>
                                <Button variant="ghost" icon="question_mark">Clarify</Button>
                                <div className="w-px h-8 bg-slate-700 mx-1"></div>
                                <Button variant="primary" icon="done_all">{L.APPROVE}</Button>
                            </div>
                        </section>
                        {/* Right Column: Audit Trail */}
                        <section className="w-80 border-l border-slate-800 flex flex-col overflow-hidden bg-background-dark/95">
                            <div className="p-4 border-b border-slate-800">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Update History</h3>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 relative">
                                <div className="absolute left-6 top-8 bottom-8 w-px bg-slate-800"></div>
                                {/* Timeline Items */}
                                <div className="space-y-8">
                                    <div className="relative flex gap-4">
                                        <div className="z-10 size-4 rounded-full bg-primary border-4 border-background-dark mt-1"></div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-200">Manual Update Initiated</p>
                                            <p className="text-[10px] text-slate-500 mt-0.5">by Marc Schmidt (Admin)</p>
                                            <p className="text-[10px] text-slate-400 mt-1 italic">"Adjusting based on official embassy newsletter."</p>
                                            <p className="text-[10px] text-primary mt-2">Today, 10:45 AM</p>
                                        </div>
                                    </div>
                                    <div className="relative flex gap-4">
                                        <div className="z-10 size-4 rounded-full bg-slate-700 border-4 border-background-dark mt-1"></div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-300">Web Scraper Check</p>
                                            <p className="text-[10px] text-slate-500 mt-0.5">Source: auswaertiges-amt.de</p>
                                            <p className="text-[10px] text-green-500/70 mt-1 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[10px]">check_circle</span> Verified data source
                                            </p>
                                            <p className="text-[10px] text-slate-600 mt-2">Yesterday, 02:15 PM</p>
                                        </div>
                                    </div>
                                    <div className="relative flex gap-4">
                                        <div className="z-10 size-4 rounded-full bg-slate-700 border-4 border-background-dark mt-1"></div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-300">System Alert</p>
                                            <p className="text-[10px] text-slate-500 mt-0.5">Status: Flagged for Review</p>
                                            <p className="text-[10px] text-orange-400 mt-1">Change threshold exceeded (30%+)</p>
                                            <p className="text-[10px] text-slate-600 mt-2">Yesterday, 02:15 PM</p>
                                        </div>
                                    </div>
                                    <div className="relative flex gap-4">
                                        <div className="z-10 size-4 rounded-full bg-slate-700 border-4 border-background-dark mt-1"></div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-300">Workflow Created</p>
                                            <p className="text-[10px] text-slate-500 mt-0.5">Type: Priority 1 (High)</p>
                                            <p className="text-[10px] text-slate-600 mt-2">Yesterday, 02:15 PM</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 bg-white/5 border-t border-slate-800">
                                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Reviewer Comment</label>
                                <textarea className="w-full bg-slate-900 border-slate-700 rounded-lg text-xs focus:ring-primary focus:border-primary placeholder:text-slate-700" placeholder="Add a comment before taking action..." rows={3}></textarea>
                            </div>
                        </section>
                    </div>
                </main>
            </div>
            <style>{`
                .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
            `}</style>
        </div>
    );
};

export default ApprovalWorkflow;
