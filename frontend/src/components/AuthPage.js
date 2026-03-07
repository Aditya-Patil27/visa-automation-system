import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login Request
        const res = await fetch('http://localhost:8000/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
        });

        const data = await res.json();
        
        if (!res.ok) {
           throw new Error(data.detail || 'Login failed');
        }

        if (data.access_token) {
          const payload = JSON.parse(atob(data.access_token.split('.')[1]));
          onLogin(data.access_token, payload.role);
          if (payload.role === 'admin') {
            navigate('/admin-dashboard-overview');
          } else {
            navigate('/user-dashboard');
          }
        }
      } else {
        // Register Request
        const res = await fetch('http://localhost:8000/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email, password: password }),
        });

        const data = await res.json();
        
        if (!res.ok) {
           throw new Error(data.detail || 'Registration failed');
        }

        if (data.access_token) {
          const payload = JSON.parse(atob(data.access_token.split('.')[1]));
          onLogin(data.access_token, payload.role);
          navigate('/user-dashboard'); // New users default to user dashboard
        }
      }
    } catch (err) {
      setError(err.message);
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

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-4 rounded-xl font-bold text-background-dark bg-primary hover:bg-primary/90 flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(13,204,242,0.2)] hover:shadow-[0_0_30px_rgba(13,204,242,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="material-symbols-outlined animate-spin">refresh</span>
                        ) : (
                            <>
                                {isLogin ? 'Sign In' : 'Sign Up'}
                                <span className="material-symbols-outlined text-lg mt-0.5">arrow_forward</span>
                            </>
                        )}
                    </button>
                </form>

                {/* Footer toggle */}
                <div className="mt-8 text-center">
                    <button 
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-sm text-slate-400 hover:text-white transition-colors"
                        type="button"
                    >
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <span className="text-primary font-bold hover:underline">
                            {isLogin ? 'Register' : 'Log In'}
                        </span>
                    </button>
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
