import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const VisaAppointmentScheduler = () => {
    const [appointmentData, setAppointmentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('access_token');
                if (!token) {
                    navigate('/login');
                    return;
                }
                const res = await fetch('http://localhost:8000/appointments', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setAppointmentData(data);
                } else {
                    if (res.status === 401 || res.status === 403) navigate('/login');
                }
            } catch (err) {
                console.error("Failed to fetch appointment data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [navigate]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark text-slate-500">Loading scheduler...</div>;
    }

    const data = appointmentData || { selected: {}, available_slots: [], month: "October 2023" };
    const selectedDay = data.selected?.date ? parseInt(data.selected.date.split(" ")[1], 10) : 7;

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-display">
            {/* Top Navigation */}
            <header className="flex items-center justify-between whitespace-nowrap border-b border-slate-200 dark:border-slate-800 px-6 py-3 bg-white/5 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3 text-primary">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-background-dark">rocket_launch</span>
                        </div>
                        <h2 className="text-slate-900 dark:text-white text-xl font-extrabold tracking-tight">VisaAI</h2>
                    </div>
                    <nav className="hidden md:flex items-center gap-6">
                        <Link className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors" to="/user-dashboard">Dashboard</Link>
                        <Link className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors" to="/visa-progress-tracker">Applications</Link>
                        <Link className="text-primary text-sm font-bold border-b-2 border-primary pb-1" to="/visa-appointment-scheduler">Appointments</Link>
                        <Link className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors" to="/document-vault-upload-system">Documents</Link>
                    </nav>
                </div>
                <div className="flex flex-1 justify-end gap-4 items-center">
                    <label className="hidden lg:flex flex-col min-w-64">
                        <div className="flex w-full items-stretch rounded-lg h-10 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                            <div className="text-slate-400 flex items-center justify-center pl-3">
                                <span className="material-symbols-outlined text-sm">search</span>
                            </div>
                            <input className="form-input w-full border-none bg-transparent focus:ring-0 text-sm placeholder:text-slate-500" placeholder="Search appointments..." type="text" />
                        </div>
                    </label>
                    <div className="flex gap-2">
                        <button aria-label="Notifications" onClick={() => console.log('Notifications Clicked')} className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-primary/10 hover:text-primary transition-all">
                            <span className="material-symbols-outlined">notifications</span>
                        </button>
                        <button aria-label="Settings" onClick={() => console.log('Settings Clicked')} className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-primary/10 hover:text-primary transition-all">
                            <span className="material-symbols-outlined">settings</span>
                        </button>
                    </div>
                    <div className="w-10 h-10 rounded-full border-2 border-primary/20 p-0.5">
                        <div className="w-full h-full rounded-full bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDkiPUCIStRoCylo56eS9PLG42W-9fq-apMVSxt2ltVCJ6ID7ly3NUwuBaPb-2tal7XMD59OHIGHtS_GvLv7YbXuSTMl6XSy7vr25MXKNJR5KAbedLLkn_YWD_HtuV1owZBQjMbJHUwWal9jUHAmi-WAn18fhQpac-gFYXOL83FFTV2OSh5iQlF1IPX2701TmJqY3vRbtD_tiABKNeNYjpAknzwzcFTZry462XJYIf78F0v9bbWfIcBSSYKO_uYSs_TilZ3VHXi9hNM')" }}></div>
                    </div>
                </div>
            </header>
            <main className="flex-1 flex overflow-hidden">
                {/* Sidebar Navigation */}
                <aside className="w-64 hidden xl:flex flex-col border-r border-slate-200 dark:border-slate-800 p-6 gap-8">
                    <div className="flex flex-col gap-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Main Menu</h3>
                        <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all" to="/user-dashboard">
                            <span className="material-symbols-outlined">dashboard</span>
                            <span className="text-sm font-medium">Overview</span>
                        </Link>
                        <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary border border-primary/20" to="/visa-appointment-scheduler">
                            <span className="material-symbols-outlined fill-1">calendar_today</span>
                            <span className="text-sm font-bold">Scheduler</span>
                        </Link>
                        <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all" to="/">
                            <span className="material-symbols-outlined">group</span>
                            <span className="text-sm font-medium">Applicants</span>
                        </Link>
                        <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all" to="/ai-visa-chatbot">
                            <span className="material-symbols-outlined">mail</span>
                            <span className="text-sm font-medium">Messages</span>
                        </Link>
                    </div>
                    <div className="mt-auto bg-primary/5 backdrop-blur-sm p-4 rounded-xl border border-primary/20">
                        <p className="text-xs font-bold text-primary uppercase mb-2">Next Appointment</p>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined">event_available</span>
                            </div>
                            <div>
                                <p className="text-sm font-bold dark:text-white">Visa Interview</p>
                                <p className="text-[10px] text-slate-500">In 2 days, 10:00 AM</p>
                            </div>
                        </div>
                        <button onClick={() => console.log('View Details Clicked')} className="w-full py-2 bg-primary text-background-dark text-xs font-bold rounded-lg hover:opacity-90 transition-opacity">
                            View Details
                        </button>
                    </div>
                </aside>
                {/* Main Content Area */}
                <section className="flex-1 flex flex-col md:flex-row overflow-hidden">
                    {/* Calendar Grid */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-black dark:text-white tracking-tight">Appointment Scheduler</h1>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">Optimize your visa interview timeline with AI-suggested slots.</p>
                            </div>
                            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                                <button onClick={() => console.log('Monthly View')} className="px-4 py-2 rounded-lg bg-white dark:bg-slate-700 shadow-sm text-sm font-bold">Monthly</button>
                                <button onClick={() => console.log('Weekly View')} className="px-4 py-2 rounded-lg text-slate-500 text-sm font-medium">Weekly</button>
                                <button onClick={() => console.log('Daily View')} className="px-4 py-2 rounded-lg text-slate-500 text-sm font-medium">Daily</button>
                            </div>
                        </div>
                        {/* Calendar Header Controls */}
                        <div className="flex items-center justify-between bg-primary/5 backdrop-blur-sm border border-white/5 p-4 rounded-xl">
                            <div className="flex items-center gap-4">
                                <button aria-label="Previous Month" onClick={() => console.log('Prev Month')} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800">
                                    <span className="material-symbols-outlined">chevron_left</span>
                                </button>
                                <h2 className="text-lg font-bold dark:text-white">{data.month}</h2>
                                <button aria-label="Next Month" onClick={() => console.log('Next Month')} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800">
                                    <span className="material-symbols-outlined">chevron_right</span>
                                </button>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-primary/40 border border-primary/60 shadow-[0_0_15px_rgba(13,204,242,0.15)]"></div>
                                    <span className="text-xs text-slate-400 font-medium">Available</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                                    <span className="text-xs text-slate-400 font-medium">Booked</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                                    <span className="text-xs text-slate-400 font-medium">Selected</span>
                                </div>
                            </div>
                        </div>
                        {/* Grid */}
                        <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                            {/* Days of Week */}
                            <div className="bg-slate-50 dark:bg-slate-900 py-3 text-center text-xs font-bold uppercase tracking-widest text-slate-500">Sun</div>
                            <div className="bg-slate-50 dark:bg-slate-900 py-3 text-center text-xs font-bold uppercase tracking-widest text-slate-500">Mon</div>
                            <div className="bg-slate-50 dark:bg-slate-900 py-3 text-center text-xs font-bold uppercase tracking-widest text-slate-500">Tue</div>
                            <div className="bg-slate-50 dark:bg-slate-900 py-3 text-center text-xs font-bold uppercase tracking-widest text-slate-500">Wed</div>
                            <div className="bg-slate-50 dark:bg-slate-900 py-3 text-center text-xs font-bold uppercase tracking-widest text-slate-500">Thu</div>
                            <div className="bg-slate-50 dark:bg-slate-900 py-3 text-center text-xs font-bold uppercase tracking-widest text-slate-500">Fri</div>
                            <div className="bg-slate-50 dark:bg-slate-900 py-3 text-center text-xs font-bold uppercase tracking-widest text-slate-500">Sat</div>
                            {/* Calendar Cells */}
                            {/* Empty days from previous month for October 2023 (starts Sunday) */}
                            {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
                                const isSelected = day === selectedDay;
                                const available = data.available_slots.find(s => s.day === day);
                                
                                return (
                                    <div key={day} className={`bg-white dark:bg-background-dark h-32 p-2 relative transition-colors ${isSelected ? 'border-2 border-primary ring-4 ring-primary/20 z-10' : 'hover:bg-slate-800/40 cursor-pointer'}`}>
                                        <span className={`text-xs ${isSelected ? 'font-bold text-primary' : 'font-medium'}`}>{day}</span>
                                        {isSelected && (
                                            <>
                                                <div className="mt-2 p-1.5 rounded bg-primary text-background-dark text-[10px] font-bold">Selected</div>
                                                <div className="mt-1 p-1.5 rounded bg-primary/20 text-primary text-[10px] font-medium">{data.selected.time?.split(" - ")[0]}</div>
                                            </>
                                        )}
                                        {available && !isSelected && (
                                            <div className="mt-2 p-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary text-[10px] font-bold flex items-center gap-1 shadow-[0_0_15px_rgba(13,204,242,0.15)]">
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                                                {available.ai_optimized ? 'AI Optimized Slot' : `${available.count} Slots Available`}
                                            </div>
                                        )}
                                        {day === 2 && !isSelected && <div className="mt-2 p-1.5 rounded bg-slate-800 text-[10px] text-slate-500 line-through">09:00 AM Full</div>}
                                        {day === 13 && !isSelected && <div className="mt-2 p-1.5 rounded bg-slate-800 text-[10px] text-slate-500 line-through">Holiday</div>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    {/* Detail Overlay / Sidebar */}
                    <div className="w-full md:w-96 border-l border-slate-200 dark:border-slate-800 bg-white/5 backdrop-blur-xl flex flex-col p-6 gap-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold dark:text-white">Appointment Details</h3>
                            <button aria-label="Close Details" onClick={() => console.log('Close Panel')} className="text-slate-500 hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        {/* Selected Slot Card */}
                        <div className="bg-primary/5 backdrop-blur-sm border border-primary/20 p-5 rounded-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3">
                                <span className="material-symbols-outlined text-primary/40 text-4xl">verified</span>
                            </div>
                            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Selected Slot</p>
                            <h4 className="text-2xl font-black dark:text-white mb-4">{data.selected?.date || "Not Selected"}</h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-slate-500 text-sm">schedule</span>
                                    <span className="text-sm font-medium dark:text-slate-200">{data.selected?.time || "--"}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-slate-500 text-sm">location_on</span>
                                    <span className="text-sm font-medium dark:text-slate-200">{data.selected?.location || "--"}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-slate-500 text-sm">person</span>
                                    <span className="text-sm font-medium dark:text-slate-200">{data.selected?.agent || "--"}</span>
                                </div>
                            </div>
                        </div>
                        {/* Actions Interface */}
                        <div className="space-y-3">
                            <button onClick={() => console.log('Confirm Booking Clicked')} className="w-full py-3 bg-primary text-background-dark font-bold rounded-xl hover:shadow-[0_0_20px_rgba(13,204,242,0.4)] transition-all flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined">check_circle</span>
                                Confirm Booking
                            </button>
                            <button onClick={() => console.log('Reschedule Clicked')} className="w-full py-3 bg-slate-800 text-white font-bold rounded-xl border border-slate-700 hover:bg-slate-700 transition-all flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined">history</span>
                                Reschedule
                            </button>
                        </div>
                        <hr className="border-slate-800" />
                        {/* Reminders & Notifications Toggle */}
                        <div className="space-y-4">
                            <h5 className="text-sm font-bold dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">notifications_active</span>
                                Appointment Reminders
                            </h5>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold">Email Notifications</span>
                                    <span className="text-[10px] text-slate-500">24h & 2h before interview</span>
                                </div>
                                <div className="w-10 h-5 bg-primary rounded-full relative">
                                    <div className="absolute right-1 top-1 w-3 h-3 bg-background-dark rounded-full"></div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold">SMS Alerts</span>
                                    <span className="text-[10px] text-slate-500">Emergency updates only</span>
                                </div>
                                <div className="w-10 h-5 bg-slate-700 rounded-full relative">
                                    <div className="absolute left-1 top-1 w-3 h-3 bg-slate-400 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                        {/* Quick Tips AI */}
                        <div className="mt-auto p-4 rounded-xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/10">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-primary text-sm">psychology</span>
                                <span className="text-xs font-bold text-primary uppercase">AI Preparation Tip</span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed">
                                Based on your visa type (H-1B), we recommend bringing your original I-797 and latest three pay stubs. Most successful applicants for this consulate report 10:30 AM slots have the shortest wait times.
                            </p>
                        </div>
                    </div>
                </section>
            </main>
            {/* Floating Action for Quick Add (Mobile Only) */}
            <button aria-label="Add Appointment" onClick={() => console.log('Add Appointment Clicked')} className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-primary rounded-full shadow-[0_4px_14px_0_rgba(13,204,242,0.39)] flex items-center justify-center text-background-dark z-50">
                <span className="material-symbols-outlined text-3xl">add</span>
            </button>
        </div>
    );
};

export default VisaAppointmentScheduler;
