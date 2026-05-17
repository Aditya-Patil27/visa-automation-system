import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './ui/Button';
import { GoogleLogin } from '@react-oauth/google';

import { api } from '../services/api';
import { L } from '../config/labels';
import { ROUTES } from '../config/routes';

const AuthPage = ({ onLogin }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        const token = localStorage.getItem('access_token');
        const base = process.env.REACT_APP_API_URL || 'http://localhost:8000';
        const res = await fetch(`${base}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
        });
        const data = await res.json();
        if (!res.ok) throw data;
        if (data.access_token) {
          const payload = JSON.parse(atob(data.access_token.split('.')[1]));
          onLogin(data.access_token, payload.role);
          navigate(payload.role === 'admin' ? ROUTES.ADMIN_DASHBOARD : ROUTES.USER_DASHBOARD);
        }
      } else {
        const data = await api.post('/register', { email, password });
        if (data.access_token) {
          const payload = JSON.parse(atob(data.access_token.split('.')[1]));
          onLogin(data.access_token, payload.role);
          navigate(ROUTES.USER_DASHBOARD);
        }
      }
    } catch (err) {
      setError(err.detail || err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      const base = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const res = await fetch(`${base}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      const data = await res.json();
      if (!res.ok) throw data;
      if (data.access_token) {
        const payload = JSON.parse(atob(data.access_token.split('.')[1]));
        onLogin(data.access_token, payload.role);
        navigate(payload.role === 'admin' ? ROUTES.ADMIN_DASHBOARD : ROUTES.USER_DASHBOARD);
      }
    } catch (err) {
      setError(err.detail || err.message || 'Google Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display flex items-center justify-center p-6 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[150px] rounded-full -z-10"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/20 blur-[150px] rounded-full -z-10"></div>
        
        <div className="w-full max-w-md">
            <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 p-8 rounded-[2rem] shadow-2xl relative">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex bg-primary/10 p-4 rounded-2xl text-primary mb-6 shadow-[0_0_30px_rgba(13,204,242,0.15)] ring-1 ring-primary/20">
                        <span className="material-symbols-outlined text-4xl font-bold">flight_takeoff</span>
                    </div>
                    <h2 className="text-3xl font-black tracking-tight text-white mb-2">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-sm text-slate-400">
                        {isLogin ? 'Enter your credentials to access your dashboard' : 'Sign up to automate your global journey'}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm p-4 rounded-xl flex items-center gap-3">
                            <span className="material-symbols-outlined text-lg">error</span>
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg">email</span>
                            <input 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-slate-200 placeholder:text-slate-600 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all"
                                placeholder="name@example.com"
                            />
                        </div>

                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-lg">lock</span>
                            <input 
                                type="password" 
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required
                                minLength={8}
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-slate-200 placeholder:text-slate-600 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <Button type="submit" disabled={loading} size="lg" className="w-full" icon={loading ? 'refresh' : 'arrow_forward'}>
                        {loading ? '' : isLogin ? L.SIGN_IN : L.SIGNUP}
                    </Button>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-800"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-slate-900 px-4 text-slate-500 font-medium tracking-widest">Or continue with</span>
                        </div>
                    </div>

                    <div className="flex justify-center w-full">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError('Google Login Failed')}
                            useOneTap
                            theme="filled_black"
                            shape="pill"
                            width="100%"
                        />
                    </div>

                </form>

                {/* Footer toggle */}
                <div className="mt-8 text-center">
                    <Button variant="ghost" size="md" onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <span className="text-primary font-bold">{isLogin ? L.REGISTER : L.LOGIN}</span>
                    </Button>
                </div>
            </div>
            
            <div className="mt-8 text-center flex items-center justify-center gap-2">
                 <span className="material-symbols-outlined text-sm text-slate-600">lock</span>
                 <p className="text-[11px] font-medium text-slate-600 uppercase tracking-widest">Secure 256-bit encryption</p>
            </div>
        </div>
    </div>
  );
};

export default AuthPage;
