import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const cached = localStorage.getItem('user_profile');
        if (cached) {
            try { return JSON.parse(cached); } catch {}
        }
        return null;
    });
    const [loading, setLoading] = useState(!user);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await api.get('/dashboard/user');
                const info = {
                    name: data.user_name || 'User',
                    email: data.email || '',
                };
                setUser(info);
                localStorage.setItem('user_profile', JSON.stringify(info));
            } catch (err) {
                const fallback = { name: 'User', email: '' };
                setUser(fallback);
                localStorage.setItem('user_profile', JSON.stringify(fallback));
            } finally {
                setLoading(false);
            }
        };
        if (!user) fetchUser();
    }, []);

    const value = useMemo(() => ({ user, loading }), [user, loading]);

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error('useUser must be used within UserProvider');
    return context;
};
