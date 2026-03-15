import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const VisaProgressTracker = () => {
    const [progressData, setProgressData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showNotifications, setShowNotifications] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('access_token');
                if (!token) {
                    navigate('/login');
                    return;
                }
                const res = await fetch('http://localhost:8000/progress', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setProgressData(data);
                } else {
                    if (res.status === 401 || res.status === 403) navigate('/login');
                }
            } catch (err) {
                console.error("Failed to fetch progress data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [navigate]);

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
                    <nav className="flex-1 px-4 space-y-2 mt-4">
                        <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-primary transition-colors" to="/user-dashboard">
                            <span className="material-symbols-outlined">dashboard</span>
                            <span className="font-medium">Dashboard</span>
                        </Link>
                        <Link className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary transition-colors border border-primary/20" to="/visa-progress-tracker">
                            <span className="material-symbols-outlined">assignment</span>
                            <span className="font-medium">Applications</span>
                        </Link>
                        <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-primary transition-colors" to="/document-vault-upload-system">
                            <span className="material-symbols-outlined">description</span>
                            <span className="font-medium">Documents</span>
                        </Link>
                        <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-primary transition-colors" to="/tracking-simulation">
                            <span className="material-symbols-outlined">satellite_alt</span>
                            <span className="font-medium">Tracking Sim</span>
                        </Link>
                        <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-primary transition-colors" to="/visa-appointment-scheduler">
                            <span className="material-symbols-outlined">payments</span>
                            <span className="font-medium">Payments</span>
                        </Link>
                    </nav>
                    <div className="p-4">
                        <div className="bg-primary/5 backdrop-blur-sm border border-primary/20 p-4 rounded-xl space-y-3">
                            <p className="text-xs font-bold uppercase tracking-wider text-primary/70">Next Steps</p>
                            <ul className="text-sm space-y-2">
                                <li className="flex items-start gap-2 text-slate-300">
                                    <span className="material-symbols-outlined text-xs mt-1 text-primary">circle</span>
                                    Complete biometrics
                                </li>
                                <li className="flex items-start gap-2 text-slate-300">
                                    <span className="material-symbols-outlined text-xs mt-1 text-primary">circle</span>
                                    Print appointment letter
                                </li>
                            </ul>
                        </div>
                        <Link to="/ai-visa-chatbot"><button className="mt-4 w-full flex items-center justify-center gap-2 bg-primary text-background-dark font-bold py-3 rounded-lg hover:opacity-90 transition-opacity">
                            <span className="material-symbols-outlined">smart_toy</span>
                            Need Help?
                        </button></Link>
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
                            <div className="relative">
                                <button aria-label="Notifications" onClick={() => setShowNotifications(!showNotifications)} className="text-slate-400 hover:text-primary relative">
                                    <span className="material-symbols-outlined">notifications</span>
                                    <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full ring-2 ring-background-dark"></span>
                                </button>
                                {showNotifications && (
                                    <div className="absolute right-0 top-10 w-72 bg-background-dark border border-primary/20 rounded-xl shadow-2xl p-4 z-50">
                                        <h4 className="text-sm font-bold text-white mb-3">Notifications</h4>
                                        <div className="space-y-3">
                                            <div className="flex items-start gap-2 p-2 rounded-lg bg-primary/5">
                                                <span className="material-symbols-outlined text-primary text-sm mt-0.5">info</span>
                                                <div>
                                                    <p className="text-xs font-semibold">Appointment Confirmed</p>
                                                    <p className="text-[10px] text-slate-500">Oct 28 – VFS Global Center</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2 p-2 rounded-lg bg-primary/5">
                                                <span className="material-symbols-outlined text-green-500 text-sm mt-0.5">check_circle</span>
                                                <div>
                                                    <p className="text-xs font-semibold">Documents Verified</p>
                                                    <p className="text-[10px] text-slate-500">All documents passed validation</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button aria-label="Settings" onClick={() => alert('Settings page coming soon!\n\nManage notifications, language, and display preferences.')} className="text-slate-400 hover:text-primary">
                                <span className="material-symbols-outlined">settings</span>
                            </button>
                            <div className="flex items-center gap-3 border-l border-primary/10 pl-6">
                                <div className="text-right">
                                    <p className="text-xs font-medium text-slate-100 leading-none">Alex Rivera</p>
                                    <p className="text-[10px] text-slate-500 mt-1">Premium Member</p>
                                </div>
                                <img className="w-9 h-9 rounded-full border-2 border-primary/30" alt="User" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC1QF8eYc2MGuLwPuhq-Xm47qIx9hE9yPtLCNtWIVTTFHp6UaBH_G0rHm-Engsv99HCQTLm2q08yhqFDS_yVx-WyFs9bM8pay7PxYzdjHxAzolVeob8WSehbW2qM1HZ-AC2sDhhLnDFkNNk6EVp_23-_JIPqbAAAOelMqSzuvdLRSruxQDCPzk4YM0h8T6adss94tDUvmk9lXOGe07pBubjZLMSg_3n6jjJ-a_4F2W8iN_QKOsXQzOVg3ErHtk7umyFZd7cgBafGpo3" />
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
                                                    <button onClick={() => handleViewLocation(step)} className="bg-primary text-background-dark text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:brightness-110 transition-all">
                                                        <span className="material-symbols-outlined text-sm">map</span> View Location
                                                    </button>
                                                    <Link to="/visa-appointment-scheduler"><button className="bg-primary/20 text-primary border border-primary/30 text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-sm">calendar_month</span> Reschedule
                                                    </button></Link>
                                                    <Link to="/tracking-simulation"><button className="bg-primary/20 text-primary border border-primary/30 text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-sm">satellite_alt</span> Simulate Tracking
                                                    </button></Link>
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
                <Link to="/ai-visa-chatbot"><button className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(13,204,242,0.4)]">
                    <span className="material-symbols-outlined text-background-dark text-3xl font-bold">chat_bubble</span>
                </button></Link>
            </div>
        </div>
    );
};

export default VisaProgressTracker;
