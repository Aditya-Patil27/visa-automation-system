import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = useCallback(async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }
        try {
            const data = await api.get('/dashboard/user');
            const info = {
                name: data.user_name || data.email?.split('@')[0] || 'User',
                email: data.email || '',
                role: localStorage.getItem('user_role') || 'user',
            };
            setUser(info);
            localStorage.setItem('user_profile', JSON.stringify(info));
        } catch (err) {
            console.error('Failed to fetch user:', err);
            const fallback = { name: 'User', email: '', role: 'user' };
            setUser(fallback);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    useEffect(() => {
        const handleStorageChange = () => {
            fetchUser();
        };
        window.addEventListener('auth-change', handleStorageChange);
        return () => window.removeEventListener('auth-change', handleStorageChange);
    }, [fetchUser]);

    const value = { user, loading, refreshUser: fetchUser };

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
