import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from './ui/Button';
import SidebarNav from './ui/SidebarNav';
import ProfileIcon from './ui/ProfileIcon';
import { api } from '../services/api';
import { L } from '../config/labels';
import { NAV_ITEMS_ADMIN } from '../config/navigation';

const AdminDashboardOverview = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [scraperLogs, setScraperLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [dataDash, dataLogs] = await Promise.all([
                    api.get('/dashboard/admin'),
                    api.get('/scraper-logs'),
                ]);
                setDashboardData(dataDash);
                setScraperLogs(dataLogs);
            } catch (err) {
                if (err?.status === 401 || err?.status === 403) { return; }
                console.error("Failed to fetch dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark text-slate-500">Loading admin dashboard...</div>;
    }

    const data = dashboardData || {
        admin_name: "Admin",
        total_users: 0,
        active_applications: 0,
        approval_rate: "--%",
        processing_time: "-- Days"
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display min-h-screen flex">
            {/* Sidebar */}
            <aside className="w-72 border-r border-slate-200 dark:border-slate-800 bg-background-light dark:bg-background-dark flex flex-col sticky top-0 h-screen">
                <div className="p-6 flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-primary flex items-center justify-center text-background-dark">
                        <span className="material-symbols-outlined font-bold">flight_takeoff</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight">VisaFlow</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400">SaaS Automation</p>
                    </div>
                </div>
                <SidebarNav items={NAV_ITEMS_ADMIN} activeRoute="/admin-dashboard-overview" />
                <div className="p-6 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <ProfileIcon size="md" />
                        <span className="material-symbols-outlined text-slate-400 text-sm ml-auto cursor-pointer">logout</span>
                    </div>
                </div>
            </aside>
            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {/* Top Navbar */}
                <header className="h-16 border-b border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between sticky top-0 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md z-10">
                    <div className="flex items-center gap-4 flex-1">
                        <label className="relative w-full max-w-md">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                            <input className="w-full bg-slate-100 dark:bg-slate-800/50 border-none rounded-lg pl-11 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 placeholder:text-slate-500" placeholder="Search commands, users or data..." type="text" />
                        </label>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="icon" icon="notifications" />
                        <Button variant="icon" icon="settings" />
                    </div>
                </header>
                <div className="p-8 space-y-8">
                    {/* Title Section */}
                    <div className="flex justify-between items-end">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time system monitoring and automation metrics.</p>
                        </div>
                        <Button icon="download" onClick={() => alert('Export feature coming soon!')}>{L.EXPORT}</Button>
                    </div>
                    {/* Analytics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="glass p-6 rounded-xl flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Users</span>
                                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined text-xl">person</span>
                                </div>
                            </div>
                            <div className="mt-4">
                                <h3 className="text-2xl font-bold">{data.total_users}</h3>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <span className="text-xs text-emerald-500 font-bold flex items-center">
                                        <span className="material-symbols-outlined text-xs">trending_up</span>
                                        12%
                                    </span>
                                    <span className="text-xs text-slate-500 italic">vs last month</span>
                                </div>
                            </div>
                        </div>
                        <div className="glass p-6 rounded-xl flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Apps</span>
                                <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined text-xl">question_answer</span>
                                </div>
                            </div>
                            <div className="mt-4">
                                <h3 className="text-2xl font-bold">{data.active_applications}</h3>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <span className="text-xs text-emerald-500 font-bold flex items-center">
                                        <span className="material-symbols-outlined text-xs">trending_up</span>
                                        8.4%
                                    </span>
                                    <span className="text-xs text-slate-500 italic">vs last month</span>
                                </div>
                            </div>
                        </div>
                        <div className="glass p-6 rounded-xl flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Approval Rate</span>
                                <div className="size-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                                    <span className="material-symbols-outlined text-xl">pending_actions</span>
                                </div>
                            </div>
                            <div className="mt-4">
                                <h3 className="text-2xl font-bold">{data.approval_rate}</h3>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <span className="text-xs text-emerald-500 font-bold flex items-center">
                                        <span className="material-symbols-outlined text-xs">check_circle</span>
                                        High
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="glass p-6 rounded-xl flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Scraper Health</span>
                                <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                    <span className="material-symbols-outlined text-xl">check_circle</span>
                                </div>
                            </div>
                            <div className="mt-4">
                                <h3 className="text-2xl font-bold">99.9%</h3>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <span className="text-xs text-emerald-500 font-bold">Stable</span>
                                    <span className="text-xs text-slate-500 italic">24/24 nodes online</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Trend Area Chart */}
                        <div className="lg:col-span-2 glass rounded-xl p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h4 className="font-bold text-lg">Visa Application Trends</h4>
                                    <p className="text-sm text-slate-500">Monthly breakdown across all regions</p>
                                </div>
                                <select className="bg-background-dark border border-slate-700 text-xs rounded-lg px-2 py-1 outline-none">
                                    <option>Last 6 Months</option>
                                    <option>Last Year</option>
                                </select>
                            </div>
                            <div className="h-64 w-full relative">
                                {/* Abstract Area Chart SVG */}
                                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 200">
                                    <defs>
                                        <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
                                            <stop offset="0%" stopColor="#0dccf2" stopOpacity="0.3"></stop>
                                            <stop offset="100%" stopColor="#0dccf2" stopOpacity="0"></stop>
                                        </linearGradient>
                                    </defs>
                                    <path d="M0 160 C 100 140, 150 180, 200 120 C 300 40, 400 100, 500 60 C 600 20, 700 80, 800 40 L 800 200 L 0 200 Z" fill="url(#areaGradient)"></path>
                                    <path d="M0 160 C 100 140, 150 180, 200 120 C 300 40, 400 100, 500 60 C 600 20, 700 80, 800 40" fill="none" stroke="#0dccf2" strokeWidth="3"></path>
                                </svg>
                                <div className="flex justify-between mt-4 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                                    <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span>
                                </div>
                            </div>
                        </div>
                        {/* Donut Chart */}
                        <div className="glass rounded-xl p-6 flex flex-col">
                            <h4 className="font-bold text-lg mb-1">Chatbot Accuracy</h4>
                            <p className="text-sm text-slate-500 mb-8">AI Resolution Performance</p>
                            <div className="relative flex-1 flex items-center justify-center">
                                <svg className="size-48" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" fill="none" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="8"></circle>
                                    <circle cx="50" cy="50" fill="none" r="40" stroke="#0dccf2" strokeDasharray="210 251" strokeLinecap="round" strokeWidth="8"></circle>
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-black">94%</span>
                                    <span className="text-[10px] text-slate-500 uppercase font-bold">Success</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <div className="text-center">
                                    <p className="text-xs text-slate-500">Resolved</p>
                                    <p className="font-bold text-slate-200">24.1k</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xs text-slate-500">Escalated</p>
                                    <p className="font-bold text-slate-200">1.2k</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Bar Chart */}
                        <div className="glass rounded-xl p-6">
                            <h4 className="font-bold text-lg mb-6">Most Requested Countries</h4>
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-medium">
                                        <span>United States</span>
                                        <span>8,420</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary rounded-full" style={{ width: "85%" }}></div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-medium">
                                        <span>Germany</span>
                                        <span>6,110</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary/80 rounded-full" style={{ width: "65%" }}></div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-medium">
                                        <span>Canada</span>
                                        <span>4,900</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary/60 rounded-full" style={{ width: "50%" }}></div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-medium">
                                        <span>Japan</span>
                                        <span>3,200</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary/40 rounded-full" style={{ width: "35%" }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Recent Activity Table */}
                        <div className="lg:col-span-2 glass rounded-xl overflow-hidden">
                            <div className="p-6 border-b border-white/5 flex justify-between items-center">
                                <h4 className="font-bold text-lg">System Logs & Activity</h4>
                                <Button variant="ghost" size="sm" to="/activity-logs" className="uppercase tracking-widest">{L.VIEW_ALL}</Button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-white/5 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                                        <tr>
                                            <th className="px-6 py-3">Timestamp</th>
                                            <th className="px-6 py-3">Action Type</th>
                                            <th className="px-6 py-3">Entity</th>
                                            <th className="px-6 py-3">Status</th>
                                            <th className="px-6 py-3">Admin</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {scraperLogs && scraperLogs.length > 0 ? scraperLogs.map((log, index) => (
                                            <tr key={index} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 text-xs">{log.timestamp}</td>
                                                <td className="px-6 py-4 text-sm font-medium">{log.action}</td>
                                                <td className="px-6 py-4 text-sm text-slate-400">{log.entity}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${log.status === 'Success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>{log.status}</span>
                                                </td>
                                                <td className="px-6 py-4 text-sm">System</td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan="5" className="px-6 py-4 text-center text-slate-500 text-sm">No recent activity logs.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboardOverview;
