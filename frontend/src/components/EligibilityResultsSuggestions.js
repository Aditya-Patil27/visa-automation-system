import React from 'react';
import { Link } from 'react-router-dom';

const EligibilityResultsSuggestions = () => {
    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen">
            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[radial-gradient(circle_at_top_center,rgba(13,204,242,0.15)_0%,transparent_70%)]">
                {/* Navigation Bar */}
                <header className="flex items-center justify-between border-b border-primary/10 px-6 py-4 lg:px-20 bg-background-dark/50 backdrop-blur-md sticky top-0 z-50">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-3xl">verified_user</span>
                        </div>
                        <h2 className="text-xl font-extrabold tracking-tight text-slate-100 uppercase">VisaFlow <span className="text-primary">AI</span></h2>
                    </div>
                    <nav className="hidden md:flex items-center gap-8">
                        <Link className="text-sm font-medium hover:text-primary transition-colors" to="/user-dashboard">Dashboard</Link>
                        <Link className="text-sm font-medium hover:text-primary transition-colors" to="/document-vault-upload-system">Documents</Link>
                        <Link className="text-sm font-medium hover:text-primary transition-colors" to="/">Support</Link>
                    </nav>
                    <div className="flex items-center gap-4">
                        <button className="p-2 rounded-full hover:bg-primary/10 text-slate-400 hover:text-primary transition-colors">
                            <span className="material-symbols-outlined">notifications</span>
                        </button>
                        <div className="w-10 h-10 rounded-full border-2 border-primary/30 p-0.5">
                            <img alt="User Avatar" className="rounded-full object-cover w-full h-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOsEDDfOszPaXVPlu9a7MJj6GeO9SN262FmAKSUkx46g6u_FWPZ6h_zNIfE1HA1Fnktr4HRKRIV_w3l2qNF3H0SD63lQVO6pAOHhmEiKPHgLXK6pvGWqOpURRH8yZJmIvGSIlrfifyIzQD7A9rESjt_8D3JyaabybuDadN_1EUtcUDULgnepI82P1jzuH9I_cqk1UwWJ-6CzJclm5ZNIOES8Milg7Ce1Rqe-yCzSDQiqHmUukTrcQNUo7i4tbI2gikfWg7V_5sUN-1" />
                        </div>
                    </div>
                </header>
                <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 lg:px-20">
                    {/* Hero Results Section */}
                    <section className="flex flex-col lg:flex-row gap-12 items-center mb-16">
                        <div className="flex-1 space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase">
                                <span className="relative flex w-2 h-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                    <span className="relative inline-flex rounded-full w-2 h-2 bg-primary"></span>
                                </span>
                                Analysis Complete
                            </div>
                            <h1 className="text-5xl font-black text-slate-100 leading-tight">High Probability of <span className="text-primary underline decoration-primary/30 underline-offset-8">Approval</span></h1>
                            <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
                                Our AI engine has analyzed your profile against current immigration trends for the <strong>Tier 1 Skilled Worker Visa</strong>. Your documentation and history align perfectly with the requirements.
                            </p>
                            <div className="flex flex-wrap gap-4 pt-4">
                                <Link to="/document-vault-upload-system"><button className="px-8 py-4 bg-primary text-background-dark font-bold rounded-xl hover:shadow-[0_0_20px_rgba(13,204,242,0.4)] transition-all">Start Application</button></Link>
                                <Link to="/ai-visa-chatbot"><button className="px-8 py-4 bg-background-dark border border-slate-700 text-slate-100 font-bold rounded-xl hover:border-primary/50 transition-all flex items-center gap-2">
                                    <span className="material-symbols-outlined">smart_toy</span>
                                    Book AI Consultation
                                </button></Link>
                            </div>
                        </div>
                        {/* Gauge Container */}
                        <div className="relative flex items-center justify-center p-8 bg-primary/5 rounded-full border border-primary/10 shadow-[0_0_50px_rgba(13,204,242,0.05)]">
                            <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
                                {/* Progress Ring SVG */}
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle className="text-slate-800" cx="50%" cy="50%" fill="transparent" r="45%" stroke="currentColor" strokeWidth="12"></circle>
                                    <circle className="text-primary" cx="50%" cy="50%" fill="transparent" r="45%" stroke="currentColor" strokeDasharray="283" strokeDashoffset="22" strokeLinecap="round" strokeWidth="14"></circle>
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                    <span className="text-6xl font-black text-slate-100">92%</span>
                                    <span className="text-sm font-medium text-primary tracking-widest uppercase">Eligible</span>
                                </div>
                            </div>
                        </div>
                    </section>
                    {/* Key Findings Cards */}
                    <section className="mb-16">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">analytics</span>
                                Key Success Indicators
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-primary/5 backdrop-blur-sm p-6 rounded-2xl border border-white/5 space-y-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                                    <span className="material-symbols-outlined">payments</span>
                                </div>
                                <h3 className="font-bold text-slate-100">Strong Financials</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">Savings exceed the minimum requirement by 140%, showing sustainable self-sufficiency.</p>
                            </div>
                            <div className="bg-primary/5 backdrop-blur-sm p-6 rounded-2xl border border-white/5 space-y-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                                    <span className="material-symbols-outlined">public</span>
                                </div>
                                <h3 className="font-bold text-slate-100">Travel History</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">Consistent travel to OECD countries with zero overstays recorded in the last 10 years.</p>
                            </div>
                            <div className="bg-primary/5 backdrop-blur-sm p-6 rounded-2xl border border-white/5 space-y-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                                    <span className="material-symbols-outlined">school</span>
                                </div>
                                <h3 className="font-bold text-slate-100">Verified Credentials</h3>
                                <p className="text-sm text-slate-400 leading-relaxed">Academic certificates and employment history are fully authenticated via global standards.</p>
                            </div>
                        </div>
                    </section>
                    {/* AI-Powered Suggestions */}
                    <section className="bg-primary/5 rounded-3xl p-8 lg:p-12 border border-primary/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                            <span className="material-symbols-outlined text-[160px]">psychology</span>
                        </div>
                        <div className="relative z-10">
                            <div className="max-w-2xl">
                                <h2 className="text-3xl font-bold text-slate-100 mb-2">AI-Powered Suggestions</h2>
                                <p className="text-slate-400 mb-8">Maximize your success rate by addressing these minor optimization points identified by our neural engine.</p>
                                <div className="space-y-4">
                                    {/* Suggestion 1 */}
                                    <div className="flex items-start gap-4 p-5 bg-background-dark/80 rounded-2xl border border-slate-800 group hover:border-primary/50 transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-xl">camera_enhance</span>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-slate-100">Update Passport Photo</h4>
                                            <p className="text-sm text-slate-400 mt-1">Current photo may be rejected due to low lighting. Provide a high-res photo with neutral background.</p>
                                        </div>
                                        <button className="text-xs font-bold text-primary uppercase tracking-wider group-hover:underline">Fix Now</button>
                                    </div>
                                    {/* Suggestion 2 */}
                                    <div className="flex items-start gap-4 p-5 bg-background-dark/80 rounded-2xl border border-slate-800 group hover:border-primary/50 transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-xl">account_balance</span>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-slate-100">Extended Bank Statements</h4>
                                            <p className="text-sm text-slate-400 mt-1">Provide 3 additional months of statements to demonstrate long-term financial stability.</p>
                                        </div>
                                        <button className="text-xs font-bold text-primary uppercase tracking-wider group-hover:underline">Upload</button>
                                    </div>
                                    {/* Suggestion 3 */}
                                    <div className="flex items-start gap-4 p-5 bg-background-dark/80 rounded-2xl border border-slate-800 group hover:border-primary/50 transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-xl">description</span>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-slate-100">Letter of Intent</h4>
                                            <p className="text-sm text-slate-400 mt-1">The AI detected generic phrasing. Use our generator to create a more personalized cover letter.</p>
                                        </div>
                                        <button className="text-xs font-bold text-primary uppercase tracking-wider group-hover:underline">Generate</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
                {/* Footer */}
                <footer className="border-t border-slate-800/50 py-10 px-6 lg:px-20 bg-background-dark/30">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-2 opacity-50 grayscale">
                            <div className="w-6 h-6 bg-slate-400 rounded-sm"></div>
                            <span className="text-sm font-bold tracking-tight">VisaFlow AI v2.4</span>
                        </div>
                        <div className="flex gap-8 text-sm text-slate-500">
                            <a className="hover:text-primary transition-colors" href="/">Privacy Policy</a>
                            <a className="hover:text-primary transition-colors" href="/">Terms of Service</a>
                            <a className="hover:text-primary transition-colors" href="/">Help Center</a>
                        </div>
                        <p className="text-xs text-slate-600">© 2024 VisaFlow Systems Inc. All rights reserved.</p>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default EligibilityResultsSuggestions;
