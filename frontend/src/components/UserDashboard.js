import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from './ui/Button';
import SidebarNav from './ui/SidebarNav';
import NotificationBell from './NotificationBell';
import { api } from '../services/api';
import { L } from '../config/labels';
import { ROUTES } from '../config/routes';
import { NAV_ITEMS_USER } from '../config/navigation';

const UserDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await api.get('/dashboard/user');
                setDashboardData(data);
            } catch (err) {
                if (err?.status === 401) return;
                console.error("Failed to fetch dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <div className="h-screen flex items-center justify-center bg-background-light dark:bg-background-dark text-slate-500">Loading dashboard...</div>;
    }

    const data = dashboardData || {
        user_name: "User",
        email: "user@example.com",
        active_case: { status: "No Active Application", message: "Start a new application today." },
        next_appointment: { date: "TBD", title: "No Appointments", time: "--", location: "--" },
        recent_activities: [],
        documents: []
    };

    const handleDownloadReceipt = () => {
        const receipt = `
═══════════════════════════════════════
        VISAFLOW AI – APPLICATION RECEIPT
═══════════════════════════════════════

  Applicant: ${data.user_name}
  Email: ${data.email}
  Status: ${data.active_case.status}
  
  Next Appointment: ${data.next_appointment.title}
  Date: ${data.next_appointment.date}
  Time: ${data.next_appointment.time}
  Location: ${data.next_appointment.location}

  Generated: ${new Date().toLocaleString()}
  
═══════════════════════════════════════
  This is a system-generated receipt.
═══════════════════════════════════════`;
        const blob = new Blob([receipt], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `VisaFlow_Receipt_${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased">
            <div className="flex h-screen overflow-hidden">
                {/* Sidebar */}
                <aside className="w-64 flex-shrink-0 border-r border-primary/10 bg-background-light dark:bg-background-dark/50 hidden md:flex flex-col">
                    <div className="p-6 flex items-center gap-3">
                        <div className="bg-primary rounded-lg p-1.5">
                            <span className="material-symbols-outlined text-background-dark font-bold">flight_takeoff</span>
                        </div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">VisaApp</h1>
                    </div>
                    <SidebarNav items={NAV_ITEMS_USER} activeRoute="/user-dashboard" />
                    <div className="p-4 mt-auto">
                        <div className="rounded-xl bg-primary/5 p-4 border border-primary/10">
                            <p className="text-xs font-semibold text-primary uppercase tracking-wider">{L.SUPPORT}</p>
                            <p className="text-sm mt-1 text-slate-500 dark:text-slate-400">Need help with your application?</p>
                            <Button variant="primary" size="md" to={ROUTES.CHATBOT} className="w-full mt-3">{L.CONTACT_US}</Button>
                        </div>
                    </div>
                </aside>
                {/* Main Content */}
                <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative">
                    {/* Top Navbar */}
                    <header className="h-16 border-b border-primary/10 flex items-center justify-between px-8 bg-background-light/50 dark:bg-background-dark/50 backdrop-blur-md sticky top-0 z-20">
                        <div className="flex items-center gap-4 flex-1 max-w-xl">
                            <div className="relative w-full">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                                <input className="w-full bg-slate-100 dark:bg-primary/5 border-none rounded-xl pl-10 pr-4 py-2 focus:ring-2 focus:ring-primary/50 text-sm" placeholder="Search applications, docs, updates..." type="text" />
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <NotificationBell />
                            <Button variant="icon" icon="settings" />
                            <div className="flex items-center gap-3 pl-6 border-l border-primary/10">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-semibold">{data.user_name}</p>
                                    <p className="text-xs text-slate-500">{data.email}</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 overflow-hidden flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary">person</span>
                                </div>
                            </div>
                        </div>
                    </header>
                    {/* Dashboard Body */}
                    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full relative z-10">
                        {/* Status Hero Card */}
                        <div className="relative overflow-hidden rounded-2xl bg-primary/5 backdrop-blur-sm border border-primary/20 p-10 shadow-[0_0_15px_rgba(13,204,242,0.1)] group">
                            <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 blur-[100px] rounded-full group-hover:bg-primary/20 transition-all"></div>
                            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div>
                                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold tracking-wide uppercase mb-4">
                                        <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                                        Active Case
                                    </span>
                                    <h2 className="text-3xl font-bold mb-2">Current Visa Status: {data.active_case.status}</h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl">{data.active_case.message}</p>
                                </div>
                                <div className="flex flex-col gap-3 min-w-[200px]">
                                    <Button variant="primary" size="md" to={ROUTES.PROGRESS_TRACKER} className="w-full">{L.VIEW}</Button>
                                    <Button variant="secondary" size="md" onClick={handleDownloadReceipt} className="w-full">{L.DOWNLOAD_RECEIPT}</Button>
                                </div>
                            </div>
                        </div>
                        {/* Widgets Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Widget 1: Next Appointment */}
                            <div className="bg-white dark:bg-background-dark border border-primary/10 rounded-2xl p-6 shadow-xl">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">calendar_today</span>
                                        Next Appointment
                                    </h3>
                                    <Button variant="ghost" size="sm" to={ROUTES.APPOINTMENT_SCHEDULER}>{L.RESCHEDULE}</Button>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="bg-primary/10 rounded-2xl p-4 flex flex-col items-center justify-center min-w-[80px] border border-primary/20">
                                        <span className="text-primary text-xs font-bold uppercase">{data.next_appointment.date.split(' ')[0]}</span>
                                        <span className="text-3xl font-black text-primary">{data.next_appointment.date.split(' ')[1] || ''}</span>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-lg font-bold">{data.next_appointment.title}</p>
                                        <p className="text-sm text-slate-500 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">schedule</span>
                                            {data.next_appointment.time}
                                        </p>
                                        <p className="text-xs text-slate-400 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">location_on</span>
                                            {data.next_appointment.location}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {/* Widget 2: AI Eligibility Result */}
                            <div className="bg-white dark:bg-background-dark border border-primary/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">psychology</span>
                                        AI Eligibility Result
                                    </h3>
                                </div>
                                <div className="flex items-center justify-center py-2">
                                    <div className="relative w-32 h-32">
                                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                            <circle className="stroke-slate-200 dark:stroke-primary/5" cx="18" cy="18" fill="none" r="16" strokeWidth="3"></circle>
                                            <circle className="stroke-primary" cx="18" cy="18" fill="none" r="16" strokeDasharray="85, 100" strokeLinecap="round" strokeWidth="3"></circle>
                                        </svg>
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                                            <span className="text-2xl font-black block">85%</span>
                                            <span className="text-[10px] text-slate-500 font-bold uppercase">Success</span>
                                        </div>
                                    </div>
                                    <div className="ml-6 flex-1">
                                        <p className="text-sm font-bold text-primary">Standard Tourist Visa</p>
                                        <p className="text-xs text-slate-500 mt-1">Based on documents provided, you have a high probability of approval.</p>
                                        <div className="mt-3 h-1 w-full bg-slate-200 dark:bg-primary/10 rounded-full overflow-hidden">
                                            <div className="bg-primary h-full w-[85%]"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Widget 3: Recent Activity */}
                            <div className="bg-white dark:bg-background-dark border border-primary/10 rounded-2xl p-6 shadow-xl">
                                <h3 className="font-bold flex items-center gap-2 mb-6">
                                    <span className="material-symbols-outlined text-primary">history</span>
                                    Recent Activity
                                </h3>
                                <div className="space-y-6 relative before:absolute before:inset-0 before:left-[11px] before:w-px before:bg-primary/10">
                                    {data.recent_activities.length > 0 ? data.recent_activities.map((act, i) => (
                                        <div key={i} className={`relative pl-8 ${act.status === 'pending' ? 'opacity-60' : ''}`}>
                                            <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-background-dark z-10 ${act.status === 'completed' ? 'bg-primary' : act.status === 'in_progress' ? 'bg-primary/30' : 'bg-slate-700'}`}></div>
                                            <p className="text-sm font-bold">{act.title}</p>
                                            <p className="text-xs text-slate-500">{act.desc}</p>
                                            <p className="text-[10px] text-slate-400 mt-1">{act.time}</p>
                                        </div>
                                    )) : (
                                        <div className="text-slate-500 text-sm">No recent activities.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* Documents Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold">Quick Access Documents</h3>
                                <Button variant="ghost" size="sm" to={ROUTES.DOCUMENT_VAULT}>{L.VIEW_ALL}</Button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {data.documents.map((doc, idx) => (
                                    <div key={idx} className="p-4 rounded-xl border border-primary/10 hover:border-primary/40 bg-white dark:bg-primary/5 transition-all group cursor-pointer">
                                        <span className="material-symbols-outlined text-3xl text-primary group-hover:scale-110 transition-transform">{doc.icon}</span>
                                        <p className="mt-2 text-sm font-semibold truncate">{doc.name}</p>
                                        <p className="text-xs text-slate-500">{doc.size}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default UserDashboard;
