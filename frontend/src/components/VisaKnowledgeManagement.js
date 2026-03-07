import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const VisaKnowledgeManagement = () => {
    const [visas, setVisas] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchVisas = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const res = await fetch('http://localhost:8000/visa', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setVisas(data);
                } else if (res.status === 401) {
                    navigate('/login');
                }
            } catch (err) {
                console.error("Failed to fetch visas", err);
            } finally {
                setLoading(false);
            }
        };

        fetchVisas();
    }, [navigate]);
    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased min-h-screen">
            <div className="flex h-screen overflow-hidden">
                {/* Sidebar */}
                <aside className="w-72 bg-primary/5 backdrop-blur-sm border-r border-slate-800 flex flex-col z-20">
                    <div className="p-6 mb-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-slate-900">
                            <span className="material-symbols-outlined font-bold">travel_explore</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-slate-100">VisaAdmin</h1>
                            <p className="text-xs text-primary font-medium uppercase tracking-widest">Management</p>
                        </div>
                    </div>
                    <nav className="flex-1 px-4 space-y-1">
                        <Link className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white transition-all group" to="/admin-dashboard-overview">
                            <span className="material-symbols-outlined text-xl">dashboard</span>
                            <span className="font-medium">Dashboard</span>
                        </Link>
                        <Link className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-[0_4px_14px_0_rgba(13,204,242,0.1)] transition-all" to="/visa-knowledge-management">
                            <span className="material-symbols-outlined text-xl">database</span>
                            <span className="font-medium text-slate-100">Knowledge Base</span>
                        </Link>
                        <Link className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white transition-all" to="/">
                            <span className="material-symbols-outlined text-xl">group</span>
                            <span className="font-medium">User Management</span>
                        </Link>
                        <Link className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white transition-all" to="/activity-logs">
                            <span className="material-symbols-outlined text-xl">receipt_long</span>
                            <span className="font-medium">Logs & Audits</span>
                        </Link>
                        <div className="pt-4 pb-2 px-4">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System</p>
                        </div>
                        <Link className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white transition-all" to="/">
                            <span className="material-symbols-outlined text-xl">settings</span>
                            <span className="font-medium">Settings</span>
                        </Link>
                        <Link className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white transition-all" to="/">
                            <span className="material-symbols-outlined text-xl">help</span>
                            <span className="font-medium">Support</span>
                        </Link>
                    </nav>
                    <div className="p-6 border-t border-slate-800">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-slate-800">
                                <img alt="User Avatar" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAKrsgcRix7gP94Prz2poYFYjqLVRVjo23gf-F0D1XRJ7OeW2yvY0yJNDctpmzvqohaG3-x_-hmNfkuIU0pBhl4shDoiCvaAsXC1oecmgYzVeP494922ArEcbr5ukP0uUIgLhq5Q6XECsANUabLGYeI7PnqTntnJ22puHPNxCQeOOonLfO1asrt5PrUOvQdl1B1SIZrtZRo-B3SAiD2z-RHSt8ywJ09_jyymYLIgcJ4Y5I4IdMtUZ1P4TbLkC5-Tzeg7npNtOeEnnnS" />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-semibold truncate">Alex Rivera</p>
                                <p className="text-xs text-slate-500 truncate">Super Admin</p>
                            </div>
                            <span onClick={() => console.log('Logout Clicked')} className="material-symbols-outlined text-slate-500 ml-auto cursor-pointer hover:text-primary">logout</span>
                        </div>
                    </div>
                </aside>
                {/* Main Content */}
                <main className="flex-1 flex flex-col overflow-y-auto">
                    {/* Header */}
                    <header className="h-20 border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 bg-background-dark/80 backdrop-blur-md z-10">
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-bold">Knowledge Management</h2>
                            <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20">LIVE DATA</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
                                <span className="material-symbols-outlined text-sm">notifications</span>
                                <span className="text-xs font-semibold">12 Alerts</span>
                            </div>
                            <button onClick={() => console.log('New Requirement Clicked')} className="bg-primary hover:bg-primary/90 text-background-dark font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-primary/20">
                                <span className="material-symbols-outlined text-[20px]">add</span>
                                New Requirement
                            </button>
                        </div>
                    </header>
                    <div className="p-8 space-y-8 max-w-[1400px] mx-auto w-full">
                        {/* Statistics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white/5 backdrop-blur-sm border border-white/5 p-6 rounded-2xl hover:bg-white/10 hover:border-primary/30 transition-all duration-200">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 rounded-xl bg-primary/10 text-primary">
                                        <span className="material-symbols-outlined text-2xl">description</span>
                                    </div>
                                    <span className="text-emerald-500 text-sm font-bold flex items-center">+12%<span className="material-symbols-outlined text-sm">trending_up</span></span>
                                </div>
                                <p className="text-slate-400 text-sm font-medium">Total Requirements</p>
                                <h3 className="text-3xl font-bold mt-1">{loading ? "..." : visas.length}</h3>
                            </div>
                            <div className="bg-white/5 backdrop-blur-sm border border-white/5 p-6 rounded-2xl hover:bg-white/10 hover:border-primary/30 transition-all duration-200">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 rounded-xl bg-primary/10 text-primary">
                                        <span className="material-symbols-outlined text-2xl">public</span>
                                    </div>
                                    <span className="text-slate-400 text-sm font-bold flex items-center">Stable<span className="material-symbols-outlined text-sm ml-1">horizontal_rule</span></span>
                                </div>
                                <p className="text-slate-400 text-sm font-medium">Countries Covered</p>
                                <h3 className="text-3xl font-bold mt-1">195</h3>
                            </div>
                            <div className="bg-white/5 backdrop-blur-sm border border-white/5 p-6 rounded-2xl hover:bg-white/10 hover:border-primary/30 transition-all duration-200">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 rounded-xl bg-primary/10 text-primary">
                                        <span className="material-symbols-outlined text-2xl">history</span>
                                    </div>
                                    <span className="text-emerald-500 text-sm font-bold flex items-center">+5%<span className="material-symbols-outlined text-sm">trending_up</span></span>
                                </div>
                                <p className="text-slate-400 text-sm font-medium">Recent Updates</p>
                                <h3 className="text-3xl font-bold mt-1">24 <span className="text-sm font-normal text-slate-500 uppercase tracking-tight">today</span></h3>
                            </div>
                            <div className="bg-white/5 backdrop-blur-sm border border-white/5 p-6 rounded-2xl border-l-4 border-l-emerald-500/50 hover:bg-white/10 hover:border-primary/30 transition-all duration-200">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 rounded-xl bg-primary/10 text-primary">
                                        <span className="material-symbols-outlined text-2xl">analytics</span>
                                    </div>
                                    <span className="text-rose-500 text-sm font-bold flex items-center">-0.1%<span className="material-symbols-outlined text-sm">trending_down</span></span>
                                </div>
                                <p className="text-slate-400 text-sm font-medium">Data Source Health</p>
                                <h3 className="text-3xl font-bold mt-1">99.9%</h3>
                            </div>
                        </div>
                        {/* Filters & Search */}
                        <div className="bg-primary/5 backdrop-blur-sm border border-white/5 p-4 rounded-2xl flex flex-col lg:flex-row gap-4">
                            <div className="relative flex-1">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                                <input className="w-full bg-slate-900/50 border-slate-700 rounded-xl pl-12 pr-4 py-3 text-slate-100 placeholder:text-slate-500 focus:ring-primary focus:border-primary" placeholder="Search by country, visa type, or keyword..." type="text" />
                            </div>
                            <div className="flex gap-4">
                                <select className="bg-slate-900/50 border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-300 focus:ring-primary min-w-[160px]">
                                    <option>All Visa Types</option>
                                    <option>Tourist (L)</option>
                                    <option>Business (M)</option>
                                    <option>Student (X)</option>
                                    <option>Work (Z)</option>
                                </select>
                                <select className="bg-slate-900/50 border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-300 focus:ring-primary min-w-[160px]">
                                    <option>Region: All</option>
                                    <option>Europe</option>
                                    <option>Asia</option>
                                    <option>North America</option>
                                    <option>Africa</option>
                                </select>
                                <button onClick={() => console.log('More Filters Clicked')} className="bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-100 px-4 py-3 rounded-xl flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[20px]">filter_list</span>
                                    More Filters
                                </button>
                            </div>
                        </div>
                        {/* Requirement Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                            {visas.map((visa, idx) => (
                                <div key={visa.id || idx} className="bg-white/5 backdrop-blur-sm border border-white/5 hover:bg-white/10 hover:border-primary/30 transition-all duration-200 rounded-2xl overflow-hidden flex flex-col">
                                    <div className="h-32 relative bg-gradient-to-br from-primary/20 to-transparent">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-6xl">🌍</span>
                                        </div>
                                        <div className="absolute top-4 right-4 bg-background-dark/80 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-primary uppercase tracking-wider">{visa.country}</div>
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="text-lg font-bold truncate pr-3">{visa.country}</h4>
                                            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 whitespace-nowrap">{visa.visa_type}</span>
                                        </div>
                                        <p className="text-slate-400 text-sm mb-6 line-clamp-2 leading-relaxed">
                                            {visa.documents?.join(', ')}
                                        </p>
                                        <div className="mt-auto space-y-4">
                                            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                                                    {visa.processing_time || "N/A"}
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <button aria-label="Edit Visa" onClick={() => console.log('Edit Visa')} className="bg-slate-800 hover:bg-slate-700 py-2 rounded-lg flex items-center justify-center text-slate-300">
                                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                                </button>
                                                <button aria-label="Delete Visa" onClick={() => console.log('Delete Visa')} className="bg-slate-800 hover:bg-rose-900/40 hover:text-rose-400 py-2 rounded-lg flex items-center justify-center text-slate-300 transition-colors">
                                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {visas.length === 0 && !loading && (
                                <div className="col-span-full text-center py-12 text-slate-500">
                                    <span className="material-symbols-outlined text-4xl mb-4 opacity-50">data_alert</span>
                                    <p>No visa requirements found in the database.</p>
                                </div>
                            )}
                            {/* Add New Placeholder */}
                            <div className="border-2 border-dashed border-slate-800 hover:border-primary/50 hover:bg-primary/5 rounded-2xl flex flex-col items-center justify-center p-8 transition-all group cursor-pointer">
                                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-primary group-hover:text-background-dark transition-all">
                                    <span className="material-symbols-outlined text-3xl">add</span>
                                </div>
                                <p className="mt-4 font-bold text-slate-400 group-hover:text-primary transition-all">Add New Requirement</p>
                            </div>
                        </div>
                    </div>
                </main>
                {/* Right Side Panel (Hidden by default, could be triggered by Add button) */}
                <div className="w-96 bg-primary/5 backdrop-blur-sm border-l border-slate-800 hidden 2xl:flex flex-col z-20">
                    <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                        <h3 className="font-bold text-lg">System Insights</h3>
                        <span onClick={() => console.log('Close Panel Clicked')} className="material-symbols-outlined text-slate-500 hover:text-white cursor-pointer">close</span>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Recent Activity</h4>
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shadow-[0_0_8px_rgba(13,204,242,0.8)]"></div>
                                    <div>
                                        <p className="text-sm font-medium">Brazil Tourist Visa updated</p>
                                        <p className="text-xs text-slate-500">2 minutes ago by Alex</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></div>
                                    <div>
                                        <p className="text-sm font-medium">New Requirement: Kenya E-Visa</p>
                                        <p className="text-xs text-slate-500">1 hour ago by System</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                                    <div>
                                        <p className="text-sm font-medium">US B1/B2 verified</p>
                                        <p className="text-xs text-slate-500">3 hours ago by Sarah</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4 pt-4">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Data Health Index</h4>
                            <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs text-slate-400">Database Consistency</span>
                                    <span className="text-xs font-bold text-primary">98%</span>
                                </div>
                                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-primary h-full rounded-full" style={{ width: "98%" }}></div>
                                </div>
                            </div>
                            <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs text-slate-400">Response Speed</span>
                                    <span className="text-xs font-bold text-emerald-500">240ms</span>
                                </div>
                                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: "85%" }}></div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-auto pt-6">
                            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 text-center">
                                <span className="material-symbols-outlined text-primary text-4xl mb-2">cloud_upload</span>
                                <h4 className="font-bold text-primary">Bulk Update</h4>
                                <p className="text-xs text-slate-400 mt-2 mb-4 leading-relaxed">Need to update multiple visa requirements? Upload a CSV or JSON file here.</p>
                                <button onClick={() => console.log('Upload File Clicked')} className="w-full bg-primary text-background-dark font-bold py-2 rounded-lg text-sm">Upload File</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VisaKnowledgeManagement;
