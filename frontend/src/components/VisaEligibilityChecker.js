import React from 'react';
import { Link } from 'react-router-dom';

const VisaEligibilityChecker = () => {
    return (
        <div className="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen bg-[radial-gradient(at_0%_0%,rgba(13,204,242,0.15)_0px,transparent_50%),radial-gradient(at_100%_100%,rgba(13,204,242,0.1)_0px,transparent_50%)] selection:bg-primary/30">
            {/* Top Navigation */}
            <header className="border-b border-primary/10 px-6 py-4 flex items-center justify-between bg-background-dark/70 backdrop-blur-md border border-primary/10 sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-background-dark">
                        <span className="material-symbols-outlined font-bold">flight_takeoff</span>
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-100">VisaFlow <span className="text-primary text-sm font-medium">AI</span></h1>
                </div>
                <nav className="hidden md:flex items-center gap-8">
                    <Link className="text-sm font-medium text-primary border-b-2 border-primary pb-1" to="/visa-eligibility-checker">Eligibility</Link>
                    <Link className="text-sm font-medium text-slate-400 hover:text-slate-100 transition-colors" to="/visa-progress-tracker">My Applications</Link>
                    <Link className="text-sm font-medium text-slate-400 hover:text-slate-100 transition-colors" to="/">Pricing</Link>
                    <Link className="text-sm font-medium text-slate-400 hover:text-slate-100 transition-colors" to="/">Support</Link>
                </nav>
                <div className="flex items-center gap-4">
                    <button className="text-slate-400 hover:text-slate-100">
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-blue-500 p-[2px]">
                        <div className="w-full h-full rounded-full bg-background-dark flex items-center justify-center overflow-hidden">
                            <img alt="User Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBr3NevAIQPtcua62WrMwFAoIZF42Ho5KLz7xwWXnBhXhlhX_G_dSJKf5avKQRKgKHpLuaFx39yT5RJCn3lCAOs8-Y9P-UNMCiFDXpn_R_zoFBjMyEdGIBD2XSQHMU_cyBwcReUY9ds7BQ8VmhkImX2FliCe8Z1R--7bTBG_sqkSh2CcUnNShxqXvbhDcmjkDCJDYhM89RWX007VFO97nVZXfxz9iGrLTIlWUCPDkq-r7_XCDMkBSqxbdKjNzZX67VExUaPFOtal6d5" />
                        </div>
                    </div>
                </div>
            </header>
            <main className="max-w-6xl mx-auto px-6 py-12">
                {/* Page Title */}
                <div className="mb-10">
                    <h2 className="text-3xl font-bold text-slate-100 mb-2">Visa Eligibility Checker</h2>
                    <p className="text-slate-400 max-w-2xl">Complete this brief assessment to determine which visa pathways are available for your upcoming trip. Our AI engine analyzes current global regulations in real-time.</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Main Form Container */}
                    <div className="lg:col-span-8 bg-background-dark/70 backdrop-blur-md border border-primary/10 rounded-xl p-8 shadow-[0_0_20px_rgba(0,0,0,0.5)] relative overflow-hidden">
                        {/* Abstract Geometric Decoration */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
                        {/* Progress Stepper */}
                        <div className="relative z-10 flex items-center justify-between mb-12">
                            <div className="flex flex-col items-center gap-2 group cursor-default">
                                <div className="w-10 h-10 rounded-full bg-primary text-background-dark flex items-center justify-center ring-4 ring-primary/20">
                                    <span className="material-symbols-outlined text-base font-bold">person</span>
                                </div>
                                <span className="text-[10px] uppercase tracking-widest font-bold text-primary">Personal</span>
                            </div>
                            <div className="flex-1 h-[2px] mx-4 bg-primary/20">
                                <div className="h-full bg-primary/20 w-0"></div>
                            </div>
                            <div className="flex flex-col items-center gap-2 opacity-50">
                                <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-base">explore</span>
                                </div>
                                <span className="text-[10px] uppercase tracking-widest font-bold">Travel</span>
                            </div>
                            <div className="flex-1 h-[2px] mx-4 bg-primary/20"></div>
                            <div className="flex flex-col items-center gap-2 opacity-50">
                                <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-base">description</span>
                                </div>
                                <span className="text-[10px] uppercase tracking-widest font-bold">Documents</span>
                            </div>
                            <div className="flex-1 h-[2px] mx-4 bg-primary/20"></div>
                            <div className="flex flex-col items-center gap-2 opacity-50">
                                <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-base">verified</span>
                                </div>
                                <span className="text-[10px] uppercase tracking-widest font-bold">Review</span>
                            </div>
                        </div>
                        {/* Form Content */}
                        <form className="relative z-10 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Origin Country */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary text-lg">public</span>
                                        Where are you from?
                                    </label>
                                    <div className="relative">
                                        <select className="w-full bg-background-dark border border-slate-700 rounded-lg py-3 px-4 text-slate-200 focus:shadow-[0_0_15px_rgba(13,204,242,0.3)] focus:border-primary appearance-none focus:ring-0 outline-none transition-all">
                                            <option>Select citizenship</option>
                                            <option>United States</option>
                                            <option>United Kingdom</option>
                                            <option>India</option>
                                            <option>Canada</option>
                                            <option>Germany</option>
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                            <span className="material-symbols-outlined">expand_more</span>
                                        </div>
                                    </div>
                                </div>
                                {/* Destination Country */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary text-lg">location_on</span>
                                        Where are you going?
                                    </label>
                                    <div className="relative">
                                        <select className="w-full bg-background-dark border border-slate-700 rounded-lg py-3 px-4 text-slate-200 focus:shadow-[0_0_15px_rgba(13,204,242,0.3)] focus:border-primary appearance-none focus:ring-0 outline-none transition-all">
                                            <option>Select destination</option>
                                            <option>France</option>
                                            <option>Japan</option>
                                            <option>Australia</option>
                                            <option>United Arab Emirates</option>
                                            <option>Singapore</option>
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                            <span className="material-symbols-outlined">expand_more</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Purpose of Travel */}
                            <div className="space-y-4">
                                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-lg">category</span>
                                    Purpose of Travel
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <label className="relative cursor-pointer group">
                                        <input defaultChecked className="peer sr-only" name="purpose" type="radio" />
                                        <div className="p-4 rounded-xl border border-slate-700 bg-background-dark/50 hover:bg-primary/5 transition-all flex flex-col items-center gap-2 peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:ring-1 peer-checked:ring-primary">
                                            <span className="material-symbols-outlined text-2xl text-slate-400 group-hover:text-primary peer-checked:text-primary">beach_access</span>
                                            <span className="text-sm font-medium text-slate-300">Tourism</span>
                                        </div>
                                    </label>
                                    <label className="relative cursor-pointer group">
                                        <input className="peer sr-only" name="purpose" type="radio" />
                                        <div className="p-4 rounded-xl border border-slate-700 bg-background-dark/50 hover:bg-primary/5 transition-all flex flex-col items-center gap-2 peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:ring-1 peer-checked:ring-primary">
                                            <span className="material-symbols-outlined text-2xl text-slate-400 group-hover:text-primary peer-checked:text-primary">work</span>
                                            <span className="text-sm font-medium text-slate-300">Business</span>
                                        </div>
                                    </label>
                                    <label className="relative cursor-pointer group">
                                        <input className="peer sr-only" name="purpose" type="radio" />
                                        <div className="p-4 rounded-xl border border-slate-700 bg-background-dark/50 hover:bg-primary/5 transition-all flex flex-col items-center gap-2 peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:ring-1 peer-checked:ring-primary">
                                            <span className="material-symbols-outlined text-2xl text-slate-400 group-hover:text-primary peer-checked:text-primary">school</span>
                                            <span className="text-sm font-medium text-slate-300">Study</span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                            {/* Form Footer Actions */}
                            <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <button className="text-slate-400 hover:text-slate-100 text-sm font-medium flex items-center gap-2 px-4 py-2 transition-colors" type="button">
                                    <span className="material-symbols-outlined text-lg">save</span>
                                    Save Progress
                                </button>
                                <button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-background-dark font-bold py-3 px-8 rounded-lg shadow-[0_4px_14px_0_rgba(13,204,242,0.39)] hover:shadow-[0_6px_20px_rgba(13,204,242,0.23)] transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2" type="button">
                                    Next Step: Travel Details
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </button>
                            </div>
                        </form>
                    </div>
                    {/* Context Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-background-dark/70 backdrop-blur-md border border-primary/10 rounded-xl p-6 border-l-4 border-l-primary shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="material-symbols-outlined text-primary">info</span>
                                <h3 className="text-lg font-bold text-slate-100">Why we ask this?</h3>
                            </div>
                            <div className="space-y-4 text-sm text-slate-400 leading-relaxed">
                                <p>Your <span className="text-slate-200 font-medium">citizenship</span> and <span className="text-slate-200 font-medium">destination</span> are the primary factors in determining visa-free entry or electronic authorization (e-Visa) eligibility.</p>
                                <p>The <span className="text-slate-200 font-medium">purpose of travel</span> helps our AI filter through over 150+ different visa types to find the specific category that fits your needs.</p>
                                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex gap-3 items-start">
                                    <span className="material-symbols-outlined text-primary text-lg">security</span>
                                    <p className="text-xs text-slate-300">Your data is encrypted and handled according to international GDPR standards.</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-background-dark/70 backdrop-blur-md border border-primary/10 rounded-xl p-6 shadow-[0_0_20px_rgba(0,0,0,0.5)] overflow-hidden relative group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="material-symbols-outlined text-6xl">chat_bubble</span>
                            </div>
                            <h3 className="text-sm font-bold text-slate-100 mb-2">Need help?</h3>
                            <p className="text-xs text-slate-400 mb-4">Our AI assistant can guide you through each step of the form in real-time.</p>
                            <Link to="/ai-visa-chatbot"><button className="w-full py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-200 transition-colors border border-slate-700">
                                Launch AI Assistant
                            </button></Link>
                        </div>
                        {/* Simple Map Placeholder */}
                        <div className="rounded-xl h-48 bg-slate-800 overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-t from-background-dark to-transparent opacity-60 z-10"></div>
                            <img alt="World Map Illustration" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkEU4Ni8lOtlXOCmAB8Al4KQQmys3RCIq6atISInQXhkfSFDaS2F5QY8Pe4AUFNtPvrcbc9RXfR4BFqX7JNXLwG2KTlRHg077_9OdotNcwg2oEAYqc46jJZcng9CbXAnUbjWwmztVuTuvN0mPYnxxPo8Vov7o3jtS7LAd9Fdm8GF4oIh4pEOsNhOciDe9hgu56wnEoqFlXVjTQXJgGV4Nu3UXzJ1jaM_uIHGgwopOcdxhriDJfe44ks-633MQV7t9CrJcwnLt9HnJh" />
                            <div className="absolute bottom-4 left-4 z-20">
                                <span className="text-xs font-bold uppercase tracking-widest text-primary">Global Coverage</span>
                                <p className="text-xs text-slate-300">Tracking 195+ Countries</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            {/* Footer Decoration */}
            <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        </div>
    );
};

export default VisaEligibilityChecker;
