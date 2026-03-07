import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const UserDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('access_token');
                if (!token) {
                    navigate('/login');
                    return;
                }
                const res = await fetch('http://localhost:8000/dashboard/user', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setDashboardData(data);
                } else {
                    if (res.status === 401) navigate('/login');
                }
            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [navigate]);

    if (loading) {
        return <div className="h-screen flex items-center justify-center bg-background-light dark:bg-background-dark text-slate-500">Loading dashboard...</div>;
    }

    // fallback when no data is fetched
    const data = dashboardData || {
        user_name: "User",
        email: "user@example.com",
        active_case: { status: "No Active Application", message: "Start a new application today." },
        next_appointment: { date: "TBD", title: "No Appointments", time: "--", location: "--" },
        recent_activities: [],
        documents: []
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
                    <nav className="flex-1 px-4 space-y-2 mt-4">
                        <Link className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary font-medium" to="/user-dashboard">
                            <span className="material-symbols-outlined">dashboard</span>
                            Dashboard
                        </Link>
                        <Link className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-primary/5 transition-colors text-slate-600 dark:text-slate-400" to="/visa-eligibility-checker">
                            <span className="material-symbols-outlined">verified_user</span>
                            Eligibility
                        </Link>
                        <Link className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-primary/5 transition-colors text-slate-600 dark:text-slate-400" to="/ai-visa-chatbot">
                            <span className="material-symbols-outlined">forum</span>
                            Chatbot
                        </Link>
                        <Link className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-primary/5 transition-colors text-slate-600 dark:text-slate-400" to="/document-vault-upload-system">
                            <span className="material-symbols-outlined">description</span>
                            Documents
                        </Link>
                        <Link className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-primary/5 transition-colors text-slate-600 dark:text-slate-400" to="/visa-appointment-scheduler">
                            <span className="material-symbols-outlined">calendar_month</span>
                            Scheduler
                        </Link>
                        <Link className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-primary/5 transition-colors text-slate-600 dark:text-slate-400" to="/visa-progress-tracker">
                            <span className="material-symbols-outlined">analytics</span>
                            Tracker
                        </Link>
                    </nav>
                    <div className="p-4 mt-auto">
                        <div className="rounded-xl bg-primary/5 p-4 border border-primary/10">
                            <p className="text-xs font-semibold text-primary uppercase tracking-wider">Support</p>
                            <p className="text-sm mt-1 text-slate-500 dark:text-slate-400">Need help with your application?</p>
                            <button onClick={() => console.log('Contact Us Clicked')} className="mt-3 w-full py-2 bg-primary text-background-dark rounded-lg text-sm font-bold">Contact Us</button>
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
                            <button aria-label="Notifications" onClick={() => console.log('Notifications Clicked')} className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
                                <span className="material-symbols-outlined">notifications</span>
                                <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-background-dark"></span>
                            </button>
                            <button aria-label="Settings" onClick={() => console.log('Settings Clicked')} className="p-2 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
                                <span className="material-symbols-outlined">settings</span>
                            </button>
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
                        {/* Status Hero Card (Glassmorphism) */}
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
                                    <Link to="/visa-progress-tracker"><button className="w-full bg-primary hover:bg-primary/90 text-background-dark px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-[1.02]">
                                        View Details
                                    </button></Link>
                                    <button onClick={() => console.log('Download Receipt Clicked')} className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-6 py-3 rounded-xl font-bold transition-all">
                                        Download Receipt
                                    </button>
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
                                    <Link to="/visa-appointment-scheduler"><button className="text-xs text-primary font-medium hover:underline">Reschedule</button></Link>
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
                                        <p className="text-sm font-bold text-primary">UK Standard Visitor</p>
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
                        {/* Documents Section (Quick Access) */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold">Quick Access Documents</h3>
                                <Link to="/document-vault-upload-system"><button className="text-sm font-semibold text-primary">View All Files</button></Link>
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
