import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ScraperMonitoringDashboard = () => {
    const [logs, setLogs] = useState([]);
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
                const res = await fetch('http://localhost:8000/scraper-logs', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setLogs(data);
                } else {
                    if (res.status === 401 || res.status === 403) navigate('/login');
                }
            } catch (err) {
                console.error("Failed to fetch logs data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [navigate]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark text-slate-500">Loading monitoring dashboard...</div>;
    }

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display selection:bg-primary/30">
            <div className="flex h-screen overflow-hidden">
                {/* Side Navigation */}
                <aside className="w-64 border-r border-slate-200 dark:border-primary/10 bg-background-light dark:bg-background-dark flex flex-col z-20">
                    <div className="p-6 flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-background-dark">
                            <span className="material-symbols-outlined font-bold">query_stats</span>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-sm font-bold tracking-tight uppercase">VisaFlow AI</h1>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Admin Engine</p>
                        </div>
                    </div>
                    <nav className="flex-1 px-4 space-y-1">
                        <Link className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-primary transition-colors rounded-lg group" to="/admin-dashboard">
                            <span className="material-symbols-outlined text-[20px]">dashboard</span>
                            <span className="text-sm font-medium">Dashboard</span>
                        </Link>
                        <Link className="flex items-center gap-3 px-3 py-2 bg-primary/10 text-primary rounded-lg border border-primary/20" to="/scraper-monitoring-dashboard">
                            <span className="material-symbols-outlined text-[20px]">monitoring</span>
                            <span className="text-sm font-medium">Scraper Monitoring</span>
                        </Link>
                        <Link className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-primary transition-colors rounded-lg" to="/">
                            <span className="material-symbols-outlined text-[20px]">rule</span>
                            <span className="text-sm font-medium">Automation Rules</span>
                        </Link>
                        <Link className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-primary transition-colors rounded-lg" to="/visa-progress-tracker">
                            <span className="material-symbols-outlined text-[20px]">database</span>
                            <span className="text-sm font-medium">Visa Database</span>
                        </Link>
                        <div className="pt-4 pb-2 px-3">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">System</p>
                        </div>
                        <Link className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-primary transition-colors rounded-lg" to="/">
                            <span className="material-symbols-outlined text-[20px]">settings</span>
                            <span className="text-sm font-medium">Settings</span>
                        </Link>
                        <Link className="flex items-center gap-3 px-3 py-2 text-slate-400 hover:text-primary transition-colors rounded-lg" to="/">
                            <span className="material-symbols-outlined text-[20px]">shield</span>
                            <span className="text-sm font-medium">Node Security</span>
                        </Link>
                    </nav>
                    <div className="p-4 border-t border-slate-200 dark:border-primary/10">
                        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-100 dark:bg-primary/5">
                            <div className="w-9 h-9 rounded-full bg-cover bg-center border border-primary/20" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAT0Vq6b8_6PU3NZ8uyc-0X_k_ATMqeujfRzDMyX4FUrqzeD6TAw2fggNCQamDBjIGNWrM0Ei7Qxj22rJiI5pQHyH86sUfcGpY0ttxpoOsmcb6y7ICBulVX_WBskpDIF-IbJEMWn-L2a7HaVm4kncmPxcWVoN9iba2ranDgcVGORtoca-1fS1rPEbua684mWqII5UL1QEO0V1eXOzXb5UTvk0-kEK-9-10L_-Tfo6nn6p-k1qLORCzcKIQyGZmfrFzs5SpqIfDOwkE9')" }}></div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold">Alex Rivera</span>
                                <span className="text-[10px] text-primary">System Admin</span>
                            </div>
                            <button aria-label="Logout" onClick={() => console.log('Logout')} className="ml-auto text-slate-400 hover:text-white">
                                <span className="material-symbols-outlined text-[18px]">logout</span>
                            </button>
                        </div>
                    </div>
                </aside>
                {/* Main Content Area */}
                <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                    {/* Header */}
                    <header className="h-16 border-b border-slate-200 dark:border-primary/10 flex items-center justify-between px-8 bg-background-light/50 dark:bg-background-dark/50 backdrop-blur-md sticky top-0 z-10">
                        <div className="flex items-center gap-4">
                            <h2 className="text-lg font-semibold tracking-tight">Scraper Operations</h2>
                            <div className="flex items-center gap-2 px-2 py-1 bg-emerald-500/10 rounded text-emerald-500 text-[10px] font-bold uppercase tracking-wider">
                                <span className="relative flex w-2 h-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full w-2 h-2 bg-emerald-500"></span>
                                </span>
                                System Operational
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                                <input className="pl-10 pr-4 py-1.5 rounded-lg bg-slate-100 dark:bg-primary/5 border border-slate-200 dark:border-primary/10 text-sm focus:outline-none focus:ring-1 focus:ring-primary w-64 transition-all" placeholder="Search nodes or targets..." type="text" />
                            </div>
                            <button aria-label="Notifications" onClick={() => console.log('Notifications Clicked')} className="p-2 text-slate-400 hover:text-primary transition-colors relative">
                                <span className="material-symbols-outlined text-[24px]">notifications</span>
                                <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background-dark"></span>
                            </button>
                            <button aria-label="Help" onClick={() => console.log('Help Clicked')} className="p-2 text-slate-400 hover:text-primary transition-colors">
                                <span className="material-symbols-outlined text-[24px]">help_outline</span>
                            </button>
                        </div>
                    </header>
                    <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                        {/* KPI Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-primary/5 backdrop-blur-sm border border-white/5 p-5 rounded-xl flex flex-col gap-2">
                                <div className="flex justify-between items-start">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Scrapers</span>
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                        <span className="material-symbols-outlined text-[20px]">hub</span>
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-2 mt-2">
                                    <span className="text-3xl font-bold">1,284</span>
                                    <span className="text-xs font-medium text-emerald-500">+12.4%</span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-primary/10 h-1 rounded-full overflow-hidden mt-3">
                                    <div className="bg-primary h-full w-[78%]"></div>
                                </div>
                            </div>
                            <div className="bg-primary/5 backdrop-blur-sm border border-white/5 p-5 rounded-xl flex flex-col gap-2">
                                <div className="flex justify-between items-start">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Success Rate</span>
                                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                                        <span className="material-symbols-outlined text-[20px]">check_circle</span>
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-2 mt-2">
                                    <span className="text-3xl font-bold">99.8<span className="text-lg font-medium opacity-50">%</span></span>
                                    <span className="text-xs font-medium text-emerald-500">+0.2%</span>
                                </div>
                                <div className="flex gap-1 items-end h-6 mt-3">
                                    <div className="w-full bg-emerald-500/40 h-2 rounded-t-sm"></div>
                                    <div className="w-full bg-emerald-500/60 h-4 rounded-t-sm"></div>
                                    <div className="w-full bg-emerald-500/40 h-3 rounded-t-sm"></div>
                                    <div className="w-full bg-emerald-500/80 h-5 rounded-t-sm"></div>
                                    <div className="w-full bg-emerald-500 h-6 rounded-t-sm"></div>
                                </div>
                            </div>
                            <div className="bg-primary/5 backdrop-blur-sm border border-white/5 p-5 rounded-xl flex flex-col gap-2">
                                <div className="flex justify-between items-start">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Data Points</span>
                                    <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                                        <span className="material-symbols-outlined text-[20px]">dataset</span>
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-2 mt-2">
                                    <span className="text-3xl font-bold">42.5<span className="text-lg font-medium opacity-50">M</span></span>
                                    <span className="text-xs font-medium text-emerald-500">+5.4%</span>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-3 font-medium italic">Across 48 Target Regions</p>
                            </div>
                            <div className="bg-primary/5 backdrop-blur-sm p-5 rounded-xl flex flex-col gap-2 border border-red-500/20">
                                <div className="flex justify-between items-start">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Alerts</span>
                                    <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                                        <span className="material-symbols-outlined text-[20px]">warning</span>
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-2 mt-2">
                                    <span className="text-3xl font-bold">03</span>
                                    <span className="text-xs font-medium text-emerald-500">-2%</span>
                                </div>
                                <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide">
                                    <span className="text-[10px] whitespace-nowrap px-2 py-1 rounded bg-red-500/10 text-red-500 font-bold border border-red-500/20">Node_Berlin_04 Offline</span>
                                    <span className="text-[10px] whitespace-nowrap px-2 py-1 rounded bg-red-500/10 text-red-500 font-bold border border-red-500/20">Latency Spike JP</span>
                                </div>
                            </div>
                        </div>
                        {/* Visualization Middle Layer */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Global Node Map */}
                            <div className="lg:col-span-2 bg-primary/5 backdrop-blur-sm border border-white/5 rounded-xl overflow-hidden flex flex-col h-[400px]">
                                <div className="p-6 border-b border-primary/10 flex items-center justify-between">
                                    <h3 className="text-sm font-bold flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">public</span>
                                        Global Node Distribution
                                    </h3>
                                    <div className="flex gap-2">
                                        <span className="text-[10px] flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active</span>
                                        <span className="text-[10px] flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Error</span>
                                        <span className="text-[10px] flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-500"></span> Standby</span>
                                    </div>
                                </div>
                                <div className="flex-1 bg-slate-100 dark:bg-primary/5 relative group cursor-crosshair">
                                    {/* Placeholder for World Map Visualization */}
                                    <div className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay" style={{ backgroundImage: "url('https://placeholder.pics/svg/300')" }}></div>
                                    {/* Map UI Overlay Simulation */}
                                    <div className="absolute top-10 left-1/4 group-hover:scale-110 transition-transform cursor-pointer">
                                        <div className="w-3 h-3 bg-primary rounded-full relative after:absolute after:w-2 after:h-2 after:bg-current after:rounded-full after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:animate-[pulse_2s_infinite] text-primary"></div>
                                        <div className="absolute -top-12 -left-8 bg-primary/5 backdrop-blur-sm border border-white/5 px-2 py-1 rounded text-[10px] whitespace-nowrap hidden group-hover:block">Node-US-East-01: 99.9%</div>
                                    </div>
                                    <div className="absolute bottom-20 left-1/3">
                                        <div className="w-3 h-3 bg-primary rounded-full relative after:absolute after:w-2 after:h-2 after:bg-current after:rounded-full after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:animate-[pulse_2s_infinite] text-primary"></div>
                                    </div>
                                    <div className="absolute top-1/3 right-1/4">
                                        <div className="w-3 h-3 bg-red-500 rounded-full relative after:absolute after:w-2 after:h-2 after:bg-current after:rounded-full after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:animate-[pulse_2s_infinite] text-red-500"></div>
                                    </div>
                                    <div className="absolute bottom-1/4 right-1/3">
                                        <div className="w-3 h-3 bg-primary rounded-full relative after:absolute after:w-2 after:h-2 after:bg-current after:rounded-full after:top-1/2 after:left-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:animate-[pulse_2s_infinite] text-primary"></div>
                                    </div>
                                    <div className="absolute inset-0 p-4 pointer-events-none">
                                        <div className="h-full border border-primary/10 border-dashed rounded-lg"></div>
                                    </div>
                                </div>
                            </div>
                            {/* Real-time Log Stream */}
                            <div className="bg-primary/5 backdrop-blur-sm border border-white/5 rounded-xl flex flex-col h-[400px]">
                                <div className="p-6 border-b border-primary/10 flex items-center justify-between">
                                    <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider">
                                        <span className="material-symbols-outlined text-primary">history_edu</span>
                                        Live Log Feed
                                    </h3>
                                    <span className="text-[10px] font-mono text-primary/60">32 EPS</span>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide font-mono text-[11px]">
                                    {logs.map((log, index) => {
                                        const isOk = log.status === 'Success';
                                        return (
                                            <div key={index} className="flex gap-3">
                                                <span className="text-slate-500">{log.timestamp}</span>
                                                <span className={isOk ? "text-emerald-500" : "text-amber-500"}>[{isOk ? 'OK' : log.status}]</span>
                                                <span className="text-slate-300">{log.action}: {log.entity}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="p-3 bg-primary/5 text-center border-t border-primary/10">
                                    <button onClick={() => console.log('Toggle Stream Status Clicked')} className="text-[10px] text-primary font-bold hover:underline">PAUSE STREAM</button>
                                </div>
                            </div>
                        </div>
                        {/* Table and Chart Lower Layer */}
                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 relative z-10">
                            {/* Node Status Table */}
                            <div className="xl:col-span-2 bg-primary/5 backdrop-blur-sm border border-white/5 rounded-xl overflow-hidden">
                                <div className="p-6 border-b border-primary/10 flex items-center justify-between">
                                    <h3 className="text-sm font-bold">Node Registry Status</h3>
                                    <button onClick={() => console.log('Refresh All Clicked')} className="text-xs text-primary font-medium flex items-center gap-1 border border-primary/20 px-3 py-1 rounded hover:bg-primary/10 transition-colors">
                                        <span className="material-symbols-outlined text-sm">refresh</span> Refresh All
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-slate-100 dark:bg-primary/5 text-slate-400 uppercase tracking-widest font-bold border-b border-primary/5">
                                            <tr>
                                                <th className="px-6 py-4">Node Name</th>
                                                <th className="px-6 py-4">Target Region</th>
                                                <th className="px-6 py-4 text-center">Latency</th>
                                                <th className="px-6 py-4 text-center">Success Rate</th>
                                                <th className="px-6 py-4 text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-primary/5">
                                            <tr className="hover:bg-primary/5 transition-colors cursor-pointer">
                                                <td className="px-6 py-4 font-semibold">Node_NY_001</td>
                                                <td className="px-6 py-4 text-slate-400">United States / CA</td>
                                                <td className="px-6 py-4 text-center font-mono">124ms</td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <span className="font-bold">99.9%</span>
                                                        <div className="w-12 bg-primary/10 h-1.5 rounded-full overflow-hidden">
                                                            <div className="bg-primary h-full w-full"></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">ONLINE</span>
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-primary/5 transition-colors cursor-pointer">
                                                <td className="px-6 py-4 font-semibold">Node_LDN_012</td>
                                                <td className="px-6 py-4 text-slate-400">United Kingdom / EU</td>
                                                <td className="px-6 py-4 text-center font-mono">210ms</td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <span className="font-bold">98.2%</span>
                                                        <div className="w-12 bg-primary/10 h-1.5 rounded-full overflow-hidden">
                                                            <div className="bg-primary h-full w-[95%]"></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">ONLINE</span>
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-primary/5 transition-colors cursor-pointer">
                                                <td className="px-6 py-4 font-semibold">Node_BER_004</td>
                                                <td className="px-6 py-4 text-slate-400">Germany / Schengen</td>
                                                <td className="px-6 py-4 text-center font-mono">--</td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <span className="font-bold">0.0%</span>
                                                        <div className="w-12 bg-primary/10 h-1.5 rounded-full overflow-hidden">
                                                            <div className="bg-red-500 h-full w-0"></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="px-2 py-1 rounded bg-red-500/10 text-red-500 font-bold border border-red-500/20">OFFLINE</span>
                                                </td>
                                            </tr>
                                            <tr className="hover:bg-primary/5 transition-colors cursor-pointer">
                                                <td className="px-6 py-4 font-semibold">Node_TKO_009</td>
                                                <td className="px-6 py-4 text-slate-400">Japan / East Asia</td>
                                                <td className="px-6 py-4 text-center font-mono">480ms</td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <span className="font-bold">88.5%</span>
                                                        <div className="w-12 bg-primary/10 h-1.5 rounded-full overflow-hidden">
                                                            <div className="bg-amber-500 h-full w-[88%]"></div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-500 font-bold border border-amber-500/20">WARNING</span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            {/* Performance Chart */}
                            <div className="bg-primary/5 backdrop-blur-sm border border-white/5 rounded-xl p-6 flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold">24h Performance</h3>
                                    <select className="text-[10px] bg-transparent border border-primary/20 rounded px-2 py-1 focus:ring-0 text-slate-300">
                                        <option>Last 24 Hours</option>
                                        <option>Last 7 Days</option>
                                    </select>
                                </div>
                                <div className="flex-1 flex items-end gap-2 px-2 pb-2 min-h-[150px]">
                                    {/* Mockup Chart */}
                                    <div className="flex-1 bg-primary/40 h-[60%] rounded-t-sm relative group">
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary/5 backdrop-blur-sm px-1.5 py-0.5 rounded text-[8px] opacity-0 group-hover:opacity-100 transition-opacity border border-primary/20">94%</div>
                                    </div>
                                    <div className="flex-1 bg-primary/60 h-[75%] rounded-t-sm relative group"></div>
                                    <div className="flex-1 bg-primary h-[90%] rounded-t-sm relative group"></div>
                                    <div className="flex-1 bg-primary/50 h-[65%] rounded-t-sm relative group"></div>
                                    <div className="flex-1 bg-primary/70 h-[80%] rounded-t-sm relative group"></div>
                                    <div className="flex-1 bg-primary/90 h-[95%] rounded-t-sm relative group"></div>
                                    <div className="flex-1 bg-primary h-[100%] rounded-t-sm relative group"></div>
                                    <div className="flex-1 bg-primary/30 h-[40%] rounded-t-sm relative group"></div>
                                    <div className="flex-1 bg-primary/50 h-[60%] rounded-t-sm relative group"></div>
                                    <div className="flex-1 bg-primary/80 h-[85%] rounded-t-sm relative group"></div>
                                    <div className="flex-1 bg-primary h-[92%] rounded-t-sm relative group"></div>
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-500 font-mono border-t border-primary/10 pt-4">
                                    <span>00:00</span>
                                    <span>06:00</span>
                                    <span>12:00</span>
                                    <span>18:00</span>
                                    <span>23:59</span>
                                </div>
                                <div className="flex items-center gap-4 pt-2">
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 bg-primary rounded-full"></span>
                                        <span className="text-[10px] text-slate-400">Success Rate</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 opacity-40">
                                        <span className="w-2 h-2 bg-slate-400 rounded-full"></span>
                                        <span className="text-[10px] text-slate-400">Total Requests</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Absolute decorative elements */}
                    <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none z-0"></div>
                    <div className="absolute top-1/2 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
                </main>
            </div>
        </div>
    );
};

export default ScraperMonitoringDashboard;
