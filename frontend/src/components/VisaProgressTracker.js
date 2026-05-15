import React, { useState, useEffect } from 'react';
import Button from './ui/Button';
import SidebarNav from './ui/SidebarNav';
import NotificationBell from './NotificationBell';
import { api } from '../services/api';
import { L } from '../config/labels';
import { ROUTES } from '../config/routes';
import { NAV_ITEMS_USER } from '../config/navigation';

const VisaProgressTracker = () => {
    const [progressData, setProgressData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await api.get('/progress');
                setProgressData(data);
            } catch (err) {
                if (err?.status === 401) return;
                console.error("Failed to fetch progress data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark text-slate-500">Loading progress tracker...</div>;
    }

    const data = progressData || { progress_steps: [], stats: {} };

    const handleViewLocation = (step) => {
        const location = step.desc || 'London VFS Global Center';
        window.open(`https://www.google.com/maps/search/${encodeURIComponent(location)}`, '_blank');
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen">
            <div className="flex h-screen overflow-hidden">
                {/* Sidebar */}
                <aside className="w-64 border-r border-primary/10 bg-background-light dark:bg-background-dark/50 hidden lg:flex flex-col">
                    <div className="p-6 flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                            <span className="material-symbols-outlined text-background-dark font-bold">flight_takeoff</span>
                        </div>
                        <h1 className="text-xl font-black tracking-tight text-primary">Visa Flow AI</h1>
                    </div>
                    <SidebarNav items={NAV_ITEMS_USER} activeRoute={ROUTES.PROGRESS_TRACKER} />
                    <div className="p-4">
                        <div className="bg-primary/5 backdrop-blur-sm border border-primary/20 p-4 rounded-xl space-y-3">
                            <p className="text-xs font-bold uppercase tracking-wider text-primary/70">Next Steps</p>
                            <ul className="text-sm space-y-2">
                                <li className="flex items-start gap-2 text-slate-300"><span className="material-symbols-outlined text-xs mt-1 text-primary">circle</span>Complete biometrics</li>
                                <li className="flex items-start gap-2 text-slate-300"><span className="material-symbols-outlined text-xs mt-1 text-primary">circle</span>Print appointment letter</li>
                            </ul>
                        </div>
                        <Button variant="primary" to={ROUTES.CHATBOT} icon="smart_toy" className="w-full mt-4">{L.CONTACT_US}</Button>
                    </div>
                </aside>
                {/* Main Content */}
                <main className="flex-1 flex flex-col overflow-y-auto">
                    {/* Navbar */}
                    <header className="h-16 border-b border-primary/10 flex items-center justify-between px-8 sticky top-0 bg-background-dark/80 backdrop-blur-md z-10">
                        <div className="flex items-center gap-4">
                            <span className="text-slate-400 text-sm">Application ID:</span>
                            <span className="font-mono text-primary bg-primary/10 px-2 py-1 rounded">#VF-9928341</span>
                        </div>
                        <div className="flex items-center gap-6">
                            <NotificationBell />
                            <Button variant="icon" icon="settings" />
                            <div className="flex items-center gap-3 border-l border-primary/10 pl-6">
                                <div className="text-right">
                                    <p className="text-xs font-medium text-slate-100 leading-none">Alex Rivera</p>
                                    <p className="text-[10px] text-slate-500 mt-1">Premium Member</p>
                                </div>
                                <img className="w-9 h-9 rounded-full border-2 border-primary/30" alt="User" src="https://i.pravatar.cc/150?u=VisaProgressTracker" />
                            </div>
                        </div>
                    </header>
                    {/* Content */}
                    <div className="p-8 max-w-5xl mx-auto w-full">
                        <div className="mb-10">
                            <h2 className="text-3xl font-black text-slate-100 mb-2">United Kingdom Visa <span className="text-primary">Journey</span></h2>
                            <p className="text-slate-400">Track your Tier 4 Student Visa progress in real-time. Estimated decision: Nov 15.</p>
                        </div>
                        {/* Vertical Timeline Stepper */}
                         <div className="relative space-y-8">
                            {data.progress_steps.map((step, index) => {
                                const isCompleted = step.status === 'completed';
                                const isCurrent = step.status === 'current';
                                const isUpcoming = step.status === 'upcoming';
                                
                                return (
                                    <div key={index} className={`relative flex gap-6 ${isUpcoming ? 'opacity-50' : ''}`}>
                                        <div className="flex flex-col items-center">
                                            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center z-10 ${isCompleted ? 'bg-green-500/20 border-green-500' : isCurrent ? 'bg-primary/20 border-primary shadow-[0_0_15px_rgba(13,204,242,0.4)] animate-pulse' : 'bg-slate-800 border-slate-700'}`}>
                                                <span className={`material-symbols-outlined text-xl ${isCompleted ? 'text-green-500 font-bold' : isCurrent ? 'text-primary' : 'text-slate-500'}`}>
                                                    {isCompleted ? 'check' : isCurrent ? 'event_available' : 'schedule'}
                                                </span>
                                            </div>
                                            {index < data.progress_steps.length - 1 && (
                                                <div className={`w-1 h-full absolute top-10 ${isCompleted ? 'bg-green-500/50' : isCurrent ? 'bg-slate-700/50' : 'bg-slate-700/50'}`}></div>
                                            )}
                                        </div>
                                        <div className={`flex-1 backdrop-blur-sm border p-6 rounded-xl ${isCurrent ? 'bg-primary/10 border-primary/30 border-l-4 border-l-primary shadow-2xl' : 'bg-primary/5 border-primary/10'}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className={`font-bold text-lg ${isCurrent ? 'text-primary' : isCompleted ? 'text-slate-100' : 'text-slate-400'}`}>{step.title}</h3>
                                                    <p className={`${isCurrent ? 'text-slate-300' : isCompleted ? 'text-slate-400' : 'text-slate-500'} text-sm`}>{step.date}</p>
                                                </div>
                                                <span className={`text-[10px] uppercase font-black px-2 py-1 rounded ${isCompleted ? 'bg-green-500/10 text-green-500' : isCurrent ? 'bg-primary text-background-dark' : 'bg-slate-700/50 text-slate-500'}`}>
                                                    {step.status}
                                                </span>
                                            </div>
                                            <p className={`text-sm ${isCurrent ? 'text-slate-100 font-medium' : isCompleted ? 'text-slate-300' : 'text-slate-500'}`}>{step.desc}</p>
                                            
                                            {isCurrent && (
                                                <div className="mt-6 flex flex-wrap gap-3">
                                                    <Button size="sm" icon="map" onClick={() => handleViewLocation(step)}>{L.VIEW_LOCATION}</Button>
                                                    <Button variant="secondary" size="sm" icon="calendar_month" to={ROUTES.APPOINTMENT_SCHEDULER}>{L.RESCHEDULE}</Button>
                                                    <Button variant="secondary" size="sm" icon="satellite_alt" to={ROUTES.TRACKING_SIM}>Simulate Tracking</Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {/* Footer Stats/Action */}
                        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-primary/5 backdrop-blur-sm border border-primary/10 p-5 rounded-xl border-b-2 border-b-primary/50">
                                <p className="text-slate-500 text-xs font-bold uppercase mb-1">Total Timeline</p>
                                <p className="text-2xl font-black text-slate-100">{data.stats.total_timeline || "--"}</p>
                                <p className="text-xs text-primary mt-2">Ahead of schedule</p>
                            </div>
                            <div className="bg-primary/5 backdrop-blur-sm border border-primary/10 p-5 rounded-xl border-b-2 border-b-primary/50">
                                <p className="text-slate-500 text-xs font-bold uppercase mb-1">Approval Probability</p>
                                <p className="text-2xl font-black text-slate-100">{data.stats.approval_probability ? `${data.stats.approval_probability}%` : "--%"}</p>
                                <p className="text-xs text-green-500 mt-2">Based on document score</p>
                            </div>
                            <div className="bg-primary/5 backdrop-blur-sm border border-primary/10 p-5 rounded-xl border-b-2 border-b-primary/50">
                                <p className="text-slate-500 text-xs font-bold uppercase mb-1">Current Wait Time</p>
                                <p className="text-2xl font-black text-slate-100">{data.stats.wait_time || "--"}</p>
                                <p className="text-xs text-slate-500 mt-2">Embassy processing average</p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            {/* Chat Widget (Floating) */}
            <div className="fixed bottom-6 right-6 z-50">
                <Button variant="primary" to={ROUTES.CHATBOT} icon="chat_bubble" className="w-14 h-14 !p-0 !rounded-full !shadow-[0_0_15px_rgba(13,204,242,0.4)]" />
            </div>
        </div>
    );
};

export default VisaProgressTracker;
