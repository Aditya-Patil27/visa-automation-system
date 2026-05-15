import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { L } from '../config/labels';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [open, setOpen] = useState(false);
    const [unread, setUnread] = useState(0);
    const ref = useRef(null);

    const fetchNotifs = async () => {
        try {
            const data = await api.get('/notifications');
            setNotifications(data);
            setUnread(data.filter(n => !n.read).length);
        } catch (e) {
            console.warn('Failed to fetch notifications:', e);
        }
    };

    useEffect(() => { fetchNotifs(); const i = setInterval(fetchNotifs, 30000); return () => clearInterval(i); }, []);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const markRead = async (id) => {
        try {
            const token = localStorage.getItem('access_token');
            const base = process.env.REACT_APP_API_URL || 'http://localhost:8000';
            await fetch(`${base}/notifications/${id}/read`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } });
            fetchNotifs();
        } catch (e) {
            console.warn('Failed to mark notification read:', e);
        }
    };

    return (
        <div ref={ref} className="relative">
            <button onClick={() => setOpen(!open)} className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-primary/10 hover:text-primary transition-all relative">
                <span className="material-symbols-outlined">notifications</span>
                {unread > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unread}</span>}
            </button>
            {open && (
                <div className="absolute right-0 top-12 w-80 bg-background-dark border border-slate-700 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto">
                    <div className="p-3 border-b border-slate-700"><p className="text-sm font-bold">Notifications ({unread} new)</p></div>
                    {notifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-500 text-sm">No notifications</div>
                    ) : (
                        notifications.map(n => (
                            <div key={n.id} onClick={() => { if (!n.read) markRead(n.id); }} className={`p-3 border-b border-slate-800 cursor-pointer hover:bg-slate-800/50 transition-colors ${!n.read ? 'bg-primary/5' : ''}`}>
                                <p className="text-sm font-bold">{n.title}</p>
                                <p className="text-xs text-slate-400 truncate">{n.message}</p>
                                <p className="text-[10px] text-slate-500 mt-1">{new Date(n.created_at).toLocaleString()}</p>
                            </div>
                        ))
                    )}
                    <button onClick={() => { setOpen(false); fetchNotifs(); }} className="w-full p-2 text-xs text-primary font-bold hover:bg-slate-800">Refresh</button>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
