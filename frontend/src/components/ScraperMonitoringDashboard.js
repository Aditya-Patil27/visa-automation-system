import React, { useState, useEffect, useCallback } from 'react';
import Button from './ui/Button';
import { api } from '../services/api';
import { L } from '../config/labels';
import { ROUTES } from '../config/routes';

const ScraperMonitoringDashboard = () => {
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState({
        total_scrapes_today: 0,
        success_rate: 0,
        last_successful_scrape: null,
        active_errors: 0,
        by_level: {},
        by_target: {}
    });
    const [targetStatus, setTargetStatus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    // Filter states
    const [targetFilter, setTargetFilter] = useState('');
    const [levelFilter, setLevelFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalLogs, setTotalLogs] = useState(0);
    const limit = 20;
    
    // Expanded log
    const [expandedLog, setExpandedLog] = useState(null);
    
    // Toast notification
    const [toast, setToast] = useState(null);

    const fetchData = useCallback(async (showRefreshing = false) => {
        if (showRefreshing) setRefreshing(true);
        try {
            const logsParams = new URLSearchParams({
                limit: limit.toString(),
                skip: ((page - 1) * limit).toString()
            });
            if (targetFilter) logsParams.append('target', targetFilter);
            if (levelFilter) logsParams.append('level', levelFilter);
            
            await Promise.allSettled([
                (async () => {
                    try {
                        const logsData = await api.get(`/scraper-logs?${logsParams}`);
                        setLogs(logsData.logs || []);
                        setTotalLogs(logsData.total || 0);
                        setTotalPages(Math.ceil((logsData.total || 0) / limit));
                    } catch (e) {}
                })(),
                (async () => {
                    try {
                        setStats(await api.get('/scraper-stats'));
                    } catch (e) {}
                })(),
                (async () => {
                    try {
                        const statusData = await api.get('/scraper-status');
                        setTargetStatus(statusData.targets || []);
                    } catch (e) {}
                })()
            ]);
        } catch (err) {
            console.error("Failed to fetch monitoring data:", err);
        } finally {
            setLoading(false);
            if (showRefreshing) setRefreshing(false);
        }
    }, [page, targetFilter, levelFilter]);

    useEffect(() => {
        fetchData();
        
        // Auto-refresh every 30 seconds
        const interval = setInterval(() => fetchData(true), 30000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const handleRunNow = async (target) => {
        try {
            await api.post('/scraper/run', { target });
            showToast(`Scraper started for ${target}`, 'success');
            setTimeout(() => fetchData(true), 1000);
        } catch (err) {
            showToast('Failed to trigger scraper', 'error');
        }
    };

    const handleRunAll = () => {
        handleRunNow(null);
    };

    const handleClearLogs = async () => {
        if (!window.confirm('Are you sure you want to clear logs older than 30 days?')) return;
        try {
            await api.post('/scraper-logs/clear?older_than_days=30');
            showToast('Old logs cleared successfully', 'success');
            fetchData();
        } catch (err) {
            showToast('Failed to clear logs', 'error');
        }
    };

    const exportToCSV = () => {
        const filteredLogs = logs.filter(log => 
            (!searchTerm || log.message?.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        
        const headers = ['Timestamp', 'Target', 'Level', 'Status', 'Message'];
        const rows = filteredLogs.map(log => [
            log.timestamp || '',
            log.target || '',
            log.level || '',
            log.status || '',
            log.message || ''
        ]);
        
        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `scraper-logs-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const showToast = (message, type = 'info') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'healthy': return 'bg-emerald-500';
            case 'warning': return 'bg-amber-500';
            case 'error': return 'bg-red-500';
            case 'never_run': return 'bg-slate-400';
            default: return 'bg-slate-400';
        }
    };

    const getLevelBadge = (level) => {
        switch (level) {
            case 'INFO': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'WARNING': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            case 'ERROR': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        }
    };

    // Filter logs by search term
    const filteredLogs = logs.filter(log => 
        !searchTerm || 
        log.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.target?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark text-slate-500">{L.LOADING}</div>;
    }

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display selection:bg-primary/30">
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg ${
                    toast.type === 'success' ? 'bg-emerald-500' : 
                    toast.type === 'error' ? 'bg-red-500' : 'bg-primary'
                } text-white`}>
                    {toast.message}
                </div>
            )}
            
            <div className="flex h-screen overflow-hidden">
                {/* Side Navigation */}
                <aside className="w-64 border-r border-slate-200 dark:border-primary/10 bg-background-light dark:bg-background-dark flex flex-col z-20">
                    <div className="p-6 flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-background-dark">
                            <span className="material-symbols-outlined font-bold">query_stats</span>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-sm font-bold tracking-tight uppercase">{L.APP_NAME}</h1>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Admin Engine</p>
                        </div>
                    </div>
                    <nav className="flex-1 px-4 space-y-1">
                        <Button variant="nav" to={ROUTES.ADMIN_DASHBOARD} className="px-3 py-2 rounded-lg">
                            <span className="material-symbols-outlined text-[20px]">dashboard</span>
                            <span className="text-sm font-medium">{L.DASHBOARD}</span>
                        </Button>
                        <Button variant="nav" to={ROUTES.SCRAPER_MONITOR} active className="px-3 py-2 rounded-lg border border-primary/20">
                            <span className="material-symbols-outlined text-[20px]">monitoring</span>
                            <span className="text-sm font-medium">Scraper Monitoring</span>
                        </Button>
                        <Button variant="nav" to={ROUTES.HOME} className="px-3 py-2 rounded-lg">
                            <span className="material-symbols-outlined text-[20px]">rule</span>
                            <span className="text-sm font-medium">Automation Rules</span>
                        </Button>
                        <Button variant="nav" to={ROUTES.PROGRESS_TRACKER} className="px-3 py-2 rounded-lg">
                            <span className="material-symbols-outlined text-[20px]">database</span>
                            <span className="text-sm font-medium">Visa Database</span>
                        </Button>
                        <div className="pt-4 pb-2 px-3">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">System</p>
                        </div>
                        <Button variant="nav" to={ROUTES.HOME} className="px-3 py-2 rounded-lg">
                            <span className="material-symbols-outlined text-[20px]">settings</span>
                            <span className="text-sm font-medium">{L.SETTINGS}</span>
                        </Button>
                        <Button variant="nav" to={ROUTES.HOME} className="px-3 py-2 rounded-lg">
                            <span className="material-symbols-outlined text-[20px]">shield</span>
                            <span className="text-sm font-medium">Node Security</span>
                        </Button>
                    </nav>
                    <div className="p-4 border-t border-slate-200 dark:border-primary/10">
                        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-100 dark:bg-primary/5">
                            <div className="w-9 h-9 rounded-full bg-cover bg-center border border-primary/20" style={{ backgroundImage: "url('https://i.pravatar.cc/150?u=ScraperMonitoringDashboard')" }}></div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold">Alex Rivera</span>
                                <span className="text-[10px] text-primary">System Admin</span>
                            </div>
                            <Button variant="icon" aria-label="Logout" onClick={() => console.log('Logout')}>
                                <span className="material-symbols-outlined text-[18px]">logout</span>
                            </Button>
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
                                <input 
                                    className="pl-10 pr-4 py-1.5 rounded-lg bg-slate-100 dark:bg-primary/5 border border-slate-200 dark:border-primary/10 text-sm focus:outline-none focus:ring-1 focus:ring-primary w-64 transition-all" 
                                    placeholder={L.SEARCH}
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button 
                                variant="icon"
                                aria-label={L.REFRESH}
                                onClick={() => fetchData(true)}
                                disabled={refreshing}
                            >
                                <span className={`material-symbols-outlined text-[24px] ${refreshing ? 'animate-spin' : ''}`}>refresh</span>
                            </Button>
                            <Button variant="icon" aria-label="Help" onClick={() => console.log('Help Clicked')}>
                                <span className="material-symbols-outlined text-[24px]">help_outline</span>
                            </Button>
                        </div>
                    </header>
                    
                    <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                        {/* Overview Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-primary/5 backdrop-blur-sm border border-white/5 p-5 rounded-xl flex flex-col gap-2">
                                <div className="flex justify-between items-start">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Scrapes Today</span>
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                        <span className="material-symbols-outlined text-[20px]">hub</span>
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-2 mt-2">
                                    <span className="text-3xl font-bold">{stats.total_scrapes_today || 0}</span>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-3 font-medium italic">Automated + Manual runs</p>
                            </div>
                            
                            <div className="bg-primary/5 backdrop-blur-sm border border-white/5 p-5 rounded-xl flex flex-col gap-2">
                                <div className="flex justify-between items-start">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Success Rate</span>
                                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                                        <span className="material-symbols-outlined text-[20px]">check_circle</span>
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-2 mt-2">
                                    <span className="text-3xl font-bold">{stats.success_rate || 0}<span className="text-lg font-medium opacity-50">%</span></span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-primary/10 h-1 rounded-full overflow-hidden mt-3">
                                    <div className={`h-full ${stats.success_rate >= 90 ? 'bg-emerald-500' : stats.success_rate >= 70 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${stats.success_rate || 0}%` }}></div>
                                </div>
                            </div>
                            
                            <div className="bg-primary/5 backdrop-blur-sm border border-white/5 p-5 rounded-xl flex flex-col gap-2">
                                <div className="flex justify-between items-start">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Last Successful</span>
                                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                        <span className="material-symbols-outlined text-[20px]">schedule</span>
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-2 mt-2">
                                    <span className="text-lg font-bold truncate">{stats.last_successful_scrape ? new Date(stats.last_successful_scrape).toLocaleString() : 'Never'}</span>
                                </div>
                                <p className="text-[10px] text-slate-500 mt-3 font-medium italic">Most recent successful scrape</p>
                            </div>
                            
                            <div className={`bg-primary/5 backdrop-blur-sm p-5 rounded-xl flex flex-col gap-2 border ${stats.active_errors > 0 ? 'border-red-500/20' : 'border-white/5'}`}>
                                <div className="flex justify-between items-start">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Errors</span>
                                    <div className={`p-2 rounded-lg ${stats.active_errors > 0 ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                        <span className="material-symbols-outlined text-[20px]">{stats.active_errors > 0 ? 'warning' : 'check_circle'}</span>
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-2 mt-2">
                                    <span className={`text-3xl font-bold ${stats.active_errors > 0 ? 'text-red-500' : ''}`}>{stats.active_errors}</span>
                                </div>
                                {stats.active_errors > 0 && (
                                    <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide">
                                        <span className="text-[10px] whitespace-nowrap px-2 py-1 rounded bg-red-500/10 text-red-500 font-bold border border-red-500/20">Requires attention</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Target Status Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Target Embassy List */}
                            <div className="bg-primary/5 backdrop-blur-sm border border-white/5 rounded-xl overflow-hidden">
                                <div className="p-6 border-b border-primary/10 flex items-center justify-between">
                                    <h3 className="text-sm font-bold flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">public</span>
                                        Target Embassy Status
                                    </h3>
                                    <Button 
                                        variant="secondary" size="sm"
                                        onClick={handleRunAll}
                                        className="min-h-[44px] min-w-[80px]"
                                        icon="play_arrow"
                                    >
                                        Run All
                                    </Button>
                                </div>
                                <div className="divide-y divide-primary/5">
                                    {targetStatus.map((target) => (
                                        <div key={target.target} className="p-4 flex items-center justify-between hover:bg-primary/5 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-3 h-3 rounded-full ${getStatusColor(target.status)}`}></div>
                                                <div>
                                                    <span className="text-sm font-semibold">{target.target}</span>
                                                    {target.consecutive_failures >= 3 && (
                                                        <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 font-bold">ALERT</span>
                                                    )}
                                                    <p className="text-[10px] text-slate-500">
                                                        {target.last_run ? `Last: ${new Date(target.last_run).toLocaleString()}` : 'Never run'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] px-2 py-1 rounded font-medium ${
                                                    target.status === 'healthy' ? 'bg-emerald-500/20 text-emerald-400' :
                                                    target.status === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                                                    target.status === 'error' ? 'bg-red-500/20 text-red-400' :
                                                    'bg-slate-500/20 text-slate-400'
                                                }`}>
                                                    {target.status.toUpperCase()}
                                                </span>
                                                <Button 
                                                    variant="icon"
                                                    onClick={() => handleRunNow(target.target)}
                                                    title="Run Now"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {targetStatus.length === 0 && (
                                        <div className="p-6 text-center text-slate-500 text-sm">
                                            No target status available. Run a scrape to see status.
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Schedule Management */}
                            <div className="bg-primary/5 backdrop-blur-sm border border-white/5 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">schedule</span>
                                        Schedule Configuration
                                    </h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-slate-100/50 dark:bg-primary/5 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium">Daily Update</p>
                                            <p className="text-[10px] text-slate-500">Every day at 2:00 AM</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" defaultChecked className="sr-only peer" />
                                            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-primary/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-slate-100/50 dark:bg-primary/5 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium">Weekly Full Scan</p>
                                            <p className="text-[10px] text-slate-500">Every Sunday at 3:00 AM</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" defaultChecked className="sr-only peer" />
                                            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-primary/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>
                                    <div className="pt-2">
                                        <p className="text-[10px] text-slate-500 mb-2">Schedule Type</p>
                                        <select className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-primary/5 border border-slate-200 dark:border-primary/10 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                                            <option>Daily (2:00 AM)</option>
                                            <option>Weekly (Sunday 3:00 AM)</option>
                                            <option>Custom...</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Alert Configuration */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Email Alert Configuration */}
                            <div className="bg-primary/5 backdrop-blur-sm border border-white/5 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">email</span>
                                        Email Alert Configuration
                                    </h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-slate-100/50 dark:bg-primary/5 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium">Email on Failure</p>
                                            <p className="text-[10px] text-slate-500">Send alert when 3+ consecutive failures</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" defaultChecked className="sr-only peer" />
                                            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-primary/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-500 mb-2 block">Email Recipient</label>
                                        <input 
                                            type="email" 
                                            placeholder="admin@example.com"
                                            className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-primary/5 border border-slate-200 dark:border-primary/10 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="secondary" className="flex-1 min-h-[44px]">
                                            Test Email
                                        </Button>
                                        <Button variant="primary" className="flex-1 min-h-[44px]">
                                            {L.SAVE} Settings
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Error Alert Summary */}
                            <div className="bg-primary/5 backdrop-blur-sm border border-white/5 rounded-xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">notification_important</span>
                                        Error Alert Summary
                                    </h3>
                                </div>
                                <div className="space-y-3">
                                    {targetStatus.filter(t => t.consecutive_failures > 0).map(target => (
                                        <div key={target.target} className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                                            <div>
                                                <p className="text-sm font-medium text-red-400">{target.target}</p>
                                                <p className="text-[10px] text-slate-500">{target.consecutive_failures} consecutive failure(s)</p>
                                            </div>
                                            <span className={`text-[10px] px-2 py-1 rounded font-bold ${
                                                target.consecutive_failures >= 3 ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                                            }`}>
                                                {target.consecutive_failures >= 3 ? 'CRITICAL' : 'WARNING'}
                                            </span>
                                        </div>
                                    ))}
                                    {targetStatus.filter(t => t.consecutive_failures > 0).length === 0 && (
                                        <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                            <span className="material-symbols-outlined text-emerald-500">check_circle</span>
                                            <span className="text-sm text-emerald-400">No active errors - all targets healthy</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        {/* Log Viewer */}
                        <div className="bg-primary/5 backdrop-blur-sm border border-white/5 rounded-xl overflow-hidden">
                            <div className="p-6 border-b border-primary/10 flex flex-wrap items-center justify-between gap-4">
                                <h3 className="text-sm font-bold flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">history_edu</span>
                                    Log Viewer
                                    <span className="text-xs font-normal text-slate-500">({totalLogs} total)</span>
                                </h3>
                                <div className="flex flex-wrap items-center gap-3">
                                    {/* Filter dropdowns */}
                                    <select 
                                        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-primary/5 border border-slate-200 dark:border-primary/10 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                                        value={targetFilter}
                                        onChange={(e) => { setTargetFilter(e.target.value); setPage(1); }}
                                    >
                                        <option value="">All Targets</option>
                                        <option value="UK">UK</option>
                                        <option value="Germany">Germany</option>
                                        <option value="France">France</option>
                                        <option value="Spain">Spain</option>
                                        <option value="USA">USA</option>
                                    </select>
                                    <select 
                                        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-primary/5 border border-slate-200 dark:border-primary/10 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                                        value={levelFilter}
                                        onChange={(e) => { setLevelFilter(e.target.value); setPage(1); }}
                                    >
                                        <option value="">All Levels</option>
                                        <option value="INFO">INFO</option>
                                        <option value="WARNING">WARNING</option>
                                        <option value="ERROR">ERROR</option>
                                    </select>
                                    <Button 
                                        variant="secondary" size="sm"
                                        onClick={exportToCSV}
                                        icon="download"
                                        className="min-h-[44px]"
                                    >
                                        Export CSV
                                    </Button>
                                    <Button 
                                        variant="danger" size="sm"
                                        onClick={handleClearLogs}
                                        icon="delete"
                                        className="min-h-[44px]"
                                    >
                                        Clear Old
                                    </Button>
                                </div>
                            </div>
                            
                            {/* Log Table - Desktop */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-slate-100 dark:bg-primary/5 text-slate-400 uppercase tracking-widest font-bold border-b border-primary/5">
                                        <tr>
                                            <th className="px-6 py-4">Timestamp</th>
                                            <th className="px-6 py-4">Target</th>
                                            <th className="px-6 py-4">Level</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Message</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-primary/5">
                                        {filteredLogs.map((log, index) => (
                                            <React.Fragment key={index}>
                                                <tr 
                                                    className="hover:bg-primary/5 transition-colors cursor-pointer"
                                                    onClick={() => setExpandedLog(expandedLog === index ? null : index)}
                                                >
                                                    <td className="px-6 py-4 font-mono text-slate-500">
                                                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 font-medium">{log.target || '-'}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getLevelBadge(log.level)}`}>
                                                            {log.level || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                            log.status === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                                                            log.status === 'started' ? 'bg-blue-500/20 text-blue-400' :
                                                            'bg-amber-500/20 text-amber-400'
                                                        }`}>
                                                            {log.status || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 max-w-xs truncate">{log.message || '-'}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Button variant="icon" onClick={() => setExpandedLog(expandedLog === index ? null : index)}>
                                                            <span className="material-symbols-outlined text-[16px]">
                                                                {expandedLog === index ? 'expand_less' : 'expand_more'}
                                                            </span>
                                                        </Button>
                                                    </td>
                                                </tr>
                                                {expandedLog === index && (
                                                    <tr>
                                                        <td colSpan={6} className="px-6 py-4 bg-slate-50 dark:bg-primary/10">
                                                            <div className="text-xs space-y-2">
                                                                <div><span className="font-bold">Action:</span> {log.action || '-'}</div>
                                                                <div><span className="font-bold">Details:</span> {JSON.stringify(log.details || {}, null, 2)}</div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Log Cards - Mobile */}
                            <div className="md:hidden p-4 space-y-3">
                                {filteredLogs.map((log, index) => (
                                    <div 
                                        key={index} 
                                        className="bg-slate-100 dark:bg-primary/5 rounded-lg p-4"
                                        onClick={() => setExpandedLog(expandedLog === index ? null : index)}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <span className="font-medium text-sm">{log.target || 'N/A'}</span>
                                                <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-bold ${getLevelBadge(log.level)}`}>
                                                    {log.level || 'N/A'}
                                                </span>
                                            </div>
                                            <span className="text-[10px] text-slate-500">
                                                {log.timestamp ? new Date(log.timestamp).toLocaleDateString() : ''}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-slate-400">{log.message || '-'}</p>
                                        {expandedLog === index && (
                                            <div className="mt-3 pt-3 border-t border-primary/10 text-xs">
                                                <div><span className="font-bold">Action:</span> {log.action || '-'}</div>
                                                <div><span className="font-bold">Status:</span> {log.status || '-'}</div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            
                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="p-4 border-t border-primary/10 flex items-center justify-between">
                                    <Button 
                                        variant="secondary" size="sm"
                                        onClick={() => setPage(Math.max(1, page - 1))}
                                        disabled={page === 1}
                                    >
                                        Previous
                                    </Button>
                                    <span className="text-xs text-slate-500">
                                        Page {page} of {totalPages}
                                    </span>
                                    <Button 
                                        variant="secondary" size="sm"
                                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                                        disabled={page === totalPages}
                                    >
                                        {L.NEXT}
                                    </Button>
                                </div>
                            )}
                            
                            {filteredLogs.length === 0 && (
                                <div className="p-8 text-center text-slate-500 text-sm">
                                    {L.NO_DATA}. Try adjusting your filters or run a scrape.
                                </div>
                            )}
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
