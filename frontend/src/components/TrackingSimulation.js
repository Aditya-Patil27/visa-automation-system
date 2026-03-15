import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const TrackingSimulation = () => {
    const [simData, setSimData] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('access_token');
                if (!token) { navigate('/login'); return; }
                const res = await fetch('http://localhost:8000/tracking/simulate', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                });
                if (res.ok) {
                    const data = await res.json();
                    setSimData(data);
                } else if (res.status === 401) {
                    navigate('/login');
                }
            } catch (err) {
                console.error("Failed to fetch simulation data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [navigate]);

    const advanceStep = useCallback(() => {
        if (!simData) return;
        setCurrentStep(prev => {
            if (prev >= simData.simulation_steps.length - 1) {
                setIsRunning(false);
                return prev;
            }
            return prev + 1;
        });
    }, [simData]);

    useEffect(() => {
        if (!isRunning || !simData) return;
        const step = simData.simulation_steps[currentStep];
        const delay = (step?.duration_seconds || 3) * 1000;
        const timer = setTimeout(advanceStep, delay);
        return () => clearTimeout(timer);
    }, [isRunning, currentStep, simData, advanceStep]);

    const handleStart = () => {
        setCurrentStep(0);
        setIsRunning(true);
    };

    const handleReset = () => {
        setIsRunning(false);
        setCurrentStep(0);
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark text-slate-500">Loading tracking simulation...</div>;
    }

    const steps = simData?.simulation_steps || [];

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen">
            <div className="flex h-screen overflow-hidden">
                {/* Sidebar */}
                <aside className="w-64 border-r border-primary/10 bg-background-light dark:bg-background-dark/50 hidden lg:flex flex-col">
                    <div className="p-6 flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                            <span className="material-symbols-outlined text-background-dark font-bold">flight_takeoff</span>
                        </div>
                        <h1 className="text-xl font-black tracking-tight text-primary">Visa Flow AI</h1>
                    </div>
                    <nav className="flex-1 px-4 space-y-2 mt-4">
                        <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-primary transition-colors" to="/user-dashboard">
                            <span className="material-symbols-outlined">dashboard</span>
                            <span className="font-medium">Dashboard</span>
                        </Link>
                        <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-primary transition-colors" to="/visa-progress-tracker">
                            <span className="material-symbols-outlined">assignment</span>
                            <span className="font-medium">Applications</span>
                        </Link>
                        <Link className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary transition-colors border border-primary/20" to="/tracking-simulation">
                            <span className="material-symbols-outlined">location_on</span>
                            <span className="font-medium">Tracking Sim</span>
                        </Link>
                        <Link className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-primary transition-colors" to="/document-vault-upload-system">
                            <span className="material-symbols-outlined">description</span>
                            <span className="font-medium">Documents</span>
                        </Link>
                    </nav>
                    <div className="p-4">
                        <Link to="/ai-visa-chatbot"><button className="mt-4 w-full flex items-center justify-center gap-2 bg-primary text-background-dark font-bold py-3 rounded-lg hover:opacity-90 transition-opacity">
                            <span className="material-symbols-outlined">smart_toy</span>
                            Need Help?
                        </button></Link>
                    </div>
                </aside>

                {/* Main */}
                <main className="flex-1 flex flex-col overflow-y-auto">
                    <header className="h-16 border-b border-primary/10 flex items-center justify-between px-8 sticky top-0 bg-background-dark/80 backdrop-blur-md z-10">
                        <div className="flex items-center gap-4">
                            <span className="material-symbols-outlined text-primary text-2xl">satellite_alt</span>
                            <h2 className="text-lg font-bold">Live Tracking Simulation</h2>
                        </div>
                        <div className="flex items-center gap-3">
                            {!isRunning ? (
                                <button onClick={handleStart} className="bg-primary text-background-dark text-sm font-bold px-5 py-2 rounded-lg flex items-center gap-2 hover:brightness-110 transition-all">
                                    <span className="material-symbols-outlined text-sm">play_arrow</span>
                                    {currentStep > 0 ? 'Resume' : 'Start Simulation'}
                                </button>
                            ) : (
                                <button onClick={() => setIsRunning(false)} className="bg-amber-500 text-background-dark text-sm font-bold px-5 py-2 rounded-lg flex items-center gap-2 hover:brightness-110 transition-all">
                                    <span className="material-symbols-outlined text-sm">pause</span>
                                    Pause
                                </button>
                            )}
                            <button onClick={handleReset} className="bg-primary/20 text-primary border border-primary/30 text-sm font-bold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/30 transition-all">
                                <span className="material-symbols-outlined text-sm">refresh</span>
                                Reset
                            </button>
                        </div>
                    </header>

                    <div className="p-8 max-w-5xl mx-auto w-full">
                        {/* App Info */}
                        <div className="mb-8 p-6 bg-primary/5 backdrop-blur-sm border border-primary/20 rounded-2xl">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Application ID</p>
                                    <p className="font-mono text-lg text-slate-100">#{simData?.application_id || 'VF-0000000'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Destination</p>
                                    <p className="text-lg font-bold text-slate-100">{simData?.country || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Visa Type</p>
                                    <p className="text-lg font-bold text-slate-100">{simData?.visa_type || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Progress</p>
                                    <p className="text-lg font-bold text-primary">{Math.round(((currentStep + 1) / Math.max(steps.length, 1)) * 100)}%</p>
                                </div>
                            </div>
                            {/* Progress bar */}
                            <div className="mt-4 h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_#0dccf2]"
                                    style={{ width: `${((currentStep + 1) / Math.max(steps.length, 1)) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Map placeholder + current location */}
                        {steps[currentStep] && (
                            <div className="mb-8 p-6 bg-slate-900/60 border border-primary/10 rounded-2xl relative overflow-hidden">
                                <div className="absolute inset-0 opacity-20">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(13,204,242,0.3),transparent_70%)]" />
                                </div>
                                <div className="relative z-10 flex items-center gap-6">
                                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center animate-pulse">
                                        <span className="material-symbols-outlined text-primary text-3xl">location_on</span>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-primary uppercase tracking-wider">Current Location</p>
                                        <p className="text-xl font-bold text-slate-100 mt-1">{steps[currentStep].location}</p>
                                        <p className="text-sm text-slate-400 mt-1">
                                            Lat: {steps[currentStep].coordinates?.lat} • Lng: {steps[currentStep].coordinates?.lng}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => window.open(`https://www.google.com/maps?q=${steps[currentStep].coordinates?.lat},${steps[currentStep].coordinates?.lng}`, '_blank')}
                                        className="ml-auto bg-primary/20 text-primary border border-primary/30 text-sm font-bold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/30 transition-all"
                                    >
                                        <span className="material-symbols-outlined text-sm">map</span>
                                        Open in Maps
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Timeline */}
                        <div className="relative space-y-6">
                            {steps.map((step, index) => {
                                const isCompleted = index < currentStep;
                                const isCurrent = index === currentStep;
                                const isUpcoming = index > currentStep;

                                return (
                                    <div key={index} className={`relative flex gap-6 transition-all duration-500 ${isUpcoming ? 'opacity-30' : 'opacity-100'}`}>
                                        <div className="flex flex-col items-center">
                                            <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center z-10 transition-all duration-500 ${
                                                isCompleted ? 'bg-green-500/20 border-green-500 scale-100' :
                                                isCurrent ? 'bg-primary/20 border-primary shadow-[0_0_20px_rgba(13,204,242,0.6)] scale-110' :
                                                'bg-slate-800 border-slate-700 scale-90'
                                            }`}>
                                                <span className={`material-symbols-outlined text-xl transition-all ${
                                                    isCompleted ? 'text-green-500 font-bold' :
                                                    isCurrent ? 'text-primary animate-pulse' :
                                                    'text-slate-500'
                                                }`}>
                                                    {isCompleted ? 'check_circle' : isCurrent ? 'radio_button_checked' : 'circle'}
                                                </span>
                                            </div>
                                            {index < steps.length - 1 && (
                                                <div className={`w-0.5 flex-1 min-h-[20px] transition-all duration-500 ${
                                                    isCompleted ? 'bg-green-500/50' : 'bg-slate-700/50'
                                                }`} />
                                            )}
                                        </div>
                                        <div className={`flex-1 p-6 rounded-xl border transition-all duration-500 ${
                                            isCurrent ? 'bg-primary/10 border-primary/30 border-l-4 border-l-primary shadow-2xl shadow-primary/10 transform scale-[1.02]' :
                                            isCompleted ? 'bg-green-500/5 border-green-500/20' :
                                            'bg-slate-900/30 border-slate-700/30'
                                        }`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-slate-500">STEP {step.step}</span>
                                                        {isCurrent && (
                                                            <span className="px-2 py-0.5 bg-primary text-background-dark text-[10px] font-black rounded-full uppercase animate-pulse">
                                                                Live
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h3 className={`font-bold text-lg mt-1 ${
                                                        isCurrent ? 'text-primary' : isCompleted ? 'text-green-400' : 'text-slate-400'
                                                    }`}>{step.title}</h3>
                                                </div>
                                                <span className={`text-[10px] uppercase font-black px-2 py-1 rounded ${
                                                    isCompleted ? 'bg-green-500/10 text-green-500' :
                                                    isCurrent ? 'bg-primary/20 text-primary' :
                                                    'bg-slate-700/50 text-slate-500'
                                                }`}>
                                                    {isCompleted ? 'Completed' : isCurrent ? 'In Progress' : 'Pending'}
                                                </span>
                                            </div>
                                            <p className={`text-sm ${isCurrent ? 'text-slate-200' : 'text-slate-400'}`}>{step.description}</p>
                                            <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-xs">location_on</span>
                                                    {step.location}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-xs">schedule</span>
                                                    {new Date(step.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Completion message */}
                        {currentStep >= steps.length - 1 && !isRunning && currentStep > 0 && (
                            <div className="mt-8 p-6 bg-green-500/10 border border-green-500/30 rounded-2xl text-center">
                                <span className="material-symbols-outlined text-green-500 text-5xl mb-2">celebration</span>
                                <h3 className="text-xl font-bold text-green-400 mt-2">Simulation Complete!</h3>
                                <p className="text-slate-400 mt-1">Your visa application has been tracked through all stages successfully.</p>
                                <button onClick={handleReset} className="mt-4 bg-primary text-background-dark font-bold px-6 py-2 rounded-lg hover:brightness-110 transition-all">
                                    Run Again
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default TrackingSimulation;
