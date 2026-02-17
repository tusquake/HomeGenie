import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_USER } from '../utils/constants';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem('homegenieUser');
        if (stored) {
            try {
                setUser(JSON.parse(stored));
            } catch {
                localStorage.removeItem('homegenieUser');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const res = await fetch(`${API_BASE_USER}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.message || 'Invalid credentials');
        }

        const data = await res.json();
        localStorage.setItem('homegenieUser', JSON.stringify(data));
        setUser(data);
        return data;
    };

    const register = async (formData) => {
        const res = await fetch(`${API_BASE_USER}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.message || 'Registration failed');
        }

        const data = await res.json();
        localStorage.setItem('homegenieUser', JSON.stringify(data));
        setUser(data);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('homegenieUser');
        setUser(null);
    };

    const authFetch = async (url, options = {}) => {
        const headers = { ...options.headers };
        if (user?.token) {
            headers['Authorization'] = `Bearer ${user.token}`;
        }
        if (user?.userId) {
            headers['X-User-Id'] = user.userId.toString();
        }
        return fetch(url, { ...options, headers });
    };

    if (loading) return null;

    return (
        <AuthContext.Provider value={{ user, login, register, logout, authFetch }}>
            {children}
        </AuthContext.Provider>
    );
};
