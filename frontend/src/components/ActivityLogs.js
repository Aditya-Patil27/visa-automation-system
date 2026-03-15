import React from 'react';
import { Link } from 'react-router-dom';

const ActivityLogs = () => {
    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased overflow-x-hidden">
            <div className="flex h-screen w-full overflow-hidden">
                {/* Sidebar Navigation */}
                <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-background-light dark:bg-background-dark flex flex-col shrink-0">
                    <div className="p-6 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800">
                        <div className="bg-primary/20 p-2 rounded-lg">
                            <span className="material-symbols-outlined text-primary text-2xl">verified_user</span>
                        </div>
                        <div>
                            <h1 className="text-sm font-bold uppercase tracking-wider text-primary">Visa Admin</h1>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">Global Controller</p>
                        </div>
                    </div>
                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        <Link className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" to="/admin-dashboard">
                            <span className="material-symbols-outlined text-[20px]">dashboard</span>
                            <span className="text-sm font-medium">Dashboard</span>
                        </Link>
                        <Link className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" to="/visa-knowledge-management">
                            <span className="material-symbols-outlined text-[20px]">database</span>
                            <span className="text-sm font-medium">Knowledge Base</span>
                        </Link>
                        <Link className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" to="/user-dashboard">
                            <span className="material-symbols-outlined text-[20px]">group</span>
                            <span className="text-sm font-medium">Users</span>
                        </Link>
                        <Link className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary" to="/activity-logs">
                            <span className="material-symbols-outlined text-[20px]">history</span>
                            <span className="text-sm font-semibold">Logs & Activity</span>
                        </Link>
                        <Link className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800" to="/">
                            <span className="material-symbols-outlined text-[20px]">settings</span>
                            <span className="text-sm font-medium">Settings (Home)</span>
                        </Link>
                    </nav>
                    <div className="p-4 mt-auto border-t border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-100/50 dark:bg-slate-800/50">
                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAskCM_4JtWQ6eVysoCOgC4iu86_64deczOKZFupX2Qx1tWgS0hZ1GmIlsg7KOvHJqy1Ckl9ThTGI2mI1a0NBIQaSxFjbd-trvAEt6WjtIWwievLZfe-sGSFTSZQPPWw3-LDZS4_9_FIwrncnRxGMs9XBF-H2wVmHktuCpRvvPTXPUPW922IW1QBMLwcH21Hwhd4NG03e6OysLL9kyi3bL76XjsbNAy42pI64omwoHVQa6LtGBpVDSbFpo8W9PeUKLHQM12t3BSlz0S')" }}></div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-xs font-bold truncate">Marcus Thorne</p>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Head Admin</p>
                            </div>
                            <span className="material-symbols-outlined text-slate-400 text-sm">unfold_more</span>
                        </div>
                    </div>
                </aside>
                {/* Main Content Area */}
                <main className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-background-dark/50 overflow-hidden relative">
                    {/* Top Navbar */}
                    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-6 flex items-center justify-between z-10">
                        <div className="flex-1 max-w-md">
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-[20px]">search</span>
                                <input className="w-full bg-slate-100 dark:bg-slate-800/50 border-none rounded-lg py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/30 dark:placeholder:text-slate-500" placeholder="Global search for logs, users or actions..." type="text" />
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
                                <span className="material-symbols-outlined text-[24px]">notifications</span>
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-background-dark"></span>
                            </button>
                            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>
                            <div className="flex items-center gap-3">
                                <div className="text-right hidden sm:block">
                                    <p className="text-xs font-semibold leading-none">System Status</p>
                                    <p className="text-[10px] text-emerald-500 font-medium">All systems active</p>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined text-[18px]">verified</span>
                                </div>
                            </div>
                        </div>
                    </header>
                    {/* Page Content */}
                    <div className="flex-1 flex overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                            {/* Content Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 uppercase">Activity Logs</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Review and audit all platform operations</p>
                                </div>
                                <button className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-bold transition-all border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <span className="material-symbols-outlined text-[20px]">download</span>
                                    Export CSV
                                </button>
                            </div>
                            {/* Sophisticated Filter Bar */}
                            <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex flex-wrap items-center gap-4 shadow-sm">
                                <div className="flex-1 min-w-[200px]">
                                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 ml-1">Search User</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">person</span>
                                        <input className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-lg py-2 pl-9 pr-4 text-xs focus:ring-primary focus:border-primary" placeholder="Filter by admin..." type="text" />
                                    </div>
                                </div>
                                <div className="flex-1 min-w-[180px]">
                                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 ml-1">Event Type</label>
                                    <select className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-lg py-2 text-xs focus:ring-primary focus:border-primary cursor-pointer">
                                        <option>All Events</option>
                                        <option>Knowledge Update</option>
                                        <option>User Action</option>
                                        <option>System</option>
                                        <option>Scraper</option>
                                    </select>
                                </div>
                                <div className="flex-1 min-w-[180px]">
                                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 ml-1">Severity</label>
                                    <select className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-lg py-2 text-xs focus:ring-primary focus:border-primary cursor-pointer">
                                        <option>All Severities</option>
                                        <option>Info</option>
                                        <option>Warning</option>
                                        <option>Error</option>
                                    </select>
                                </div>
                                <div className="flex-1 min-w-[220px]">
                                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1 ml-1">Date Range</label>
                                    <div className="relative">
                                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">calendar_today</span>
                                        <input className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-lg py-2 pl-9 pr-4 text-xs focus:ring-primary focus:border-primary cursor-pointer" type="text" defaultValue="Oct 20, 2023 - Oct 27, 2023" />
                                    </div>
                                </div>
                                <button className="mt-5 bg-primary text-background-dark px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider hover:opacity-90 transition-opacity">Apply</button>
                            </div>
                            {/* Table Container */}
                            <div className="bg-white/10 dark:bg-slate-800/20 border border-slate-200/50 dark:border-slate-800/50 rounded-xl shadow-xl backdrop-blur-sm overflow-hidden flex flex-col">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50">
                                                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Timestamp</th>
                                                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">User</th>
                                                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Event Category</th>
                                                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Action Description</th>
                                                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Impact Level</th>
                                                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                            {/* Row 1 */}
                                            <tr className="hover:bg-primary/5 dark:hover:bg-primary/5 cursor-pointer transition-colors group">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-semibold">2 mins ago</span>
                                                        <span className="text-[10px] text-slate-500">2023-10-27 10:42:15</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAB3OyloNU35sM5yYM-tLn0bikfGlYVV_0QETDlAZ3zOQqIIf5ARoipJ1pCwaM_dU4wnLm-hRyQxuWK-YG_WQcZ3SvfEmTNIreaHWNCeFosG6hLH64n8iEWuA74-vdpPL3GXS6_P2iB2e68MyaogYQkIiu21pX8-YxJBUptFiNMKApkX5n4rVyP93-C17gIoQxMjHMLSuBnev3NdvrcAjsYhLXbtLBIO-G_MW5i3cRKU5sKnkh2succJWRjtYThsAm9lHCAXDW0CbxO')" }}></div>
                                                        <span className="text-sm font-medium">Alex Smith</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                                        <span className="material-symbols-outlined text-[14px]">edit_note</span>
                                                        Knowledge Update
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">Updated visa requirements for Schengen area countries (France & Italy)</p>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">HIGH</span>
                                                </td>
                                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                                    <button className="p-1 hover:text-primary transition-colors text-slate-400">
                                                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                                                    </button>
                                                </td>
                                            </tr>
                                            {/* Row 2 */}
                                            <tr className="hover:bg-primary/5 dark:hover:bg-primary/5 cursor-pointer transition-colors group">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-semibold">15 mins ago</span>
                                                        <span className="text-[10px] text-slate-500">2023-10-27 10:29:40</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <span className="material-symbols-outlined text-primary text-[18px]">memory</span>
                                                        </div>
                                                        <span className="text-sm font-medium italic text-slate-400">System Bot</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                                                        <span className="material-symbols-outlined text-[14px]">sync</span>
                                                        Scraper
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">Automated daily sync with US Embassy portal completed successfully</p>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">INFO</span>
                                                </td>
                                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                                    <button className="p-1 hover:text-primary transition-colors text-slate-400">
                                                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                                                    </button>
                                                </td>
                                            </tr>
                                            {/* Row 3 */}
                                            <tr className="bg-red-500/5 hover:bg-red-500/10 dark:bg-red-500/5 dark:hover:bg-red-500/10 cursor-pointer transition-colors group border-l-4 border-red-500">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-semibold">1 hour ago</span>
                                                        <span className="text-[10px] text-slate-500">2023-10-27 09:12:05</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDovEPTo8pCmrTgS9G2YikRcoz0_kseV-KWLx8c6O45IYYqap6OkwC233xCi7_WKj_biX16pUaC9yQIxNqTDpJpwMkMIjqErXWy6tuJeRD17zfZKlLmxiC9mfyDNNGa5bMTSy6N95reHODE2vo9q3hVy-5-Zm3W-nx-ENWDnbmC1oAJJNJXYZyXlt7NJPVtxGdg8I9pHohfOPXPMsHjtnma5mmfUIC3muOJql68eYmubhljdriLQl3AI1Gh-ncaeByjXu3tWrDcxE1r')" }}></div>
                                                        <span className="text-sm font-medium">Maria Garcia</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                                                        <span className="material-symbols-outlined text-[14px]">person_remove</span>
                                                        User Action
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">Deleted pending application #4492 (Duplicate Entry Error)</p>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">MEDIUM</span>
                                                </td>
                                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                                    <button className="p-1 hover:text-primary transition-colors text-slate-400">
                                                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                                                    </button>
                                                </td>
                                            </tr>
                                            {/* Row 4 */}
                                            <tr className="hover:bg-primary/5 dark:hover:bg-primary/5 cursor-pointer transition-colors group">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-semibold">3 hours ago</span>
                                                        <span className="text-[10px] text-slate-500">2023-10-27 07:30:00</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                                            <span className="material-symbols-outlined text-slate-500 text-[18px]">settings_suggest</span>
                                                        </div>
                                                        <span className="text-sm font-medium text-slate-500">Auto-Backup</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-500">
                                                        <span className="material-symbols-outlined text-[14px]">settings</span>
                                                        System
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">Nightly database backup and optimization completed successfully</p>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">INFO</span>
                                                </td>
                                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                                    <button className="p-1 hover:text-primary transition-colors text-slate-400">
                                                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                {/* Pagination Footer */}
                                <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                                    <span className="text-xs text-slate-500">Showing <span className="font-bold text-slate-900 dark:text-slate-100">1-10</span> of <span className="font-bold text-slate-900 dark:text-slate-100">1,284</span> entries</span>
                                    <div className="flex items-center gap-2">
                                        <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 disabled:opacity-30 text-slate-500" disabled>
                                            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                                        </button>
                                        <button className="w-8 h-8 flex items-center justify-center rounded bg-primary text-background-dark text-xs font-bold">1</button>
                                        <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs">2</button>
                                        <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs">3</button>
                                        <span className="px-1">...</span>
                                        <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs">128</button>
                                        <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                                            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Side Panel: Event Details */}
                        <aside className="w-96 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark shadow-2xl flex flex-col shrink-0 overflow-hidden transform transition-transform translate-x-0">
                            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-[20px]">info</span>
                                    <h3 className="font-bold text-sm uppercase tracking-tight">Event Details</h3>
                                </div>
                                <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors">
                                    <span className="material-symbols-outlined text-[18px]">close</span>
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-5 space-y-6">
                                {/* Event Summary Card */}
                                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <span className="text-[10px] font-black uppercase text-primary px-2 py-0.5 bg-primary/20 rounded">Knowledge Update</span>
                                        <span className="text-[10px] text-slate-500">ID: LOG-992140</span>
                                    </div>
                                    <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">Update Schengen Area Requirements</h4>
                                    <p className="text-xs text-slate-500 leading-relaxed">Changed by Alex Smith on Friday, Oct 27, 2023 at 10:42 AM.</p>
                                </div>
                                {/* Metadata List */}
                                <div className="space-y-4">
                                    <h5 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Metadata</h5>
                                    <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase">User Agent</p>
                                            <p className="text-xs font-medium">Chrome / MacOS 14.1</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase">IP Address</p>
                                            <p className="text-xs font-medium">192.168.1.104</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase">Region</p>
                                            <p className="text-xs font-medium">Global HQ</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase">Source</p>
                                            <p className="text-xs font-medium">Admin Web App</p>
                                        </div>
                                    </div>
                                </div>
                                {/* Knowledge Diff View */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h5 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Knowledge Diff</h5>
                                        <span className="text-[10px] text-emerald-500">+2 additions, -1 removals</span>
                                    </div>
                                    <div className="rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden text-[11px] font-mono leading-relaxed">
                                        <div className="bg-slate-100 dark:bg-slate-900 px-3 py-1 border-b border-slate-200 dark:border-slate-800 text-slate-400">visa_policy_v2.json</div>
                                        <div className="p-3 bg-white dark:bg-black/20">
                                            <p className="text-slate-400">  "country": "France",</p>
                                            <p className="text-red-400 bg-red-400/10">- "min_funds": "3000.00",</p>
                                            <p className="text-emerald-400 bg-emerald-400/10">+ "min_funds": "3500.00",</p>
                                            <p className="text-emerald-400 bg-emerald-400/10">+ "insurance_required": true,</p>
                                            <p className="text-slate-400">  "processing_days": 15</p>
                                        </div>
                                    </div>
                                </div>
                                {/* Raw JSON Tab View */}
                                <div className="space-y-2">
                                    <h5 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Raw JSON Payload</h5>
                                    <pre className="bg-slate-900 p-4 rounded-lg overflow-x-auto text-[11px] text-primary/80 font-mono shadow-inner border border-slate-800">{`{
  "event": "knowledge.updated",
  "actor": {
    "id": "USR_882",
    "name": "Alex Smith"
  },
  "object": "requirement_set_42",
  "severity": "high",
  "timestamp": 1698396135000,
  "changes": {
    "prev": { "funds": 3000 },
    "curr": { "funds": 3500 }
  }
}`}</pre>
                                </div>
                            </div>
                            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex gap-2">
                                <button className="flex-1 bg-primary text-background-dark py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:brightness-110 transition-all">Download Log</button>
                                <button className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">Rollback</button>
                            </div>
                        </aside>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ActivityLogs;
