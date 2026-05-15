import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Button from './ui/Button';
import { api } from '../services/api';
import { L } from '../config/labels';
import { ROUTES } from '../config/routes';

const EligibilityResultsSuggestions = () => {
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [gaugeScore, setGaugeScore] = useState(0);
    const [searchParams] = useSearchParams();
    const assessmentId = searchParams.get('id');
    const gaugeRef = useRef(null);

    useEffect(() => {
        if (!assessmentId) {
            setError('No assessment ID provided. Complete the eligibility checker first.');
            setLoading(false);
            return;
        }

        const fetchResults = async () => {
            try {
                const data = await api.get(`/assessment/${assessmentId}`);
                if (data.status === 'draft') {
                    setError('This assessment has not been submitted yet. Please complete and submit the form first.');
                } else if (data.result) {
                    setResults(data);
                } else {
                    setError('No eligibility results available for this assessment.');
                }
            } catch (err) {
                if (err.status === 404) {
                    setError('Assessment not found. It may have been deleted or the ID is incorrect.');
                } else {
                    setError('Unable to load your assessment results. The server may be unavailable. Please try again.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [assessmentId]);

    useEffect(() => {
        if (!results || !results.result) return;
        const targetScore = results.result.score || results.eligibility_score || 0;

        const duration = 800;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setGaugeScore(Math.round(eased * targetScore));
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [results]);

    const getHeroHeading = () => {
        if (!results || !results.result) return '';
        const score = results.result.score || results.eligibility_score || 0;
        if (score >= 70) {
            return (
                <>
                    High Probability of <span className="text-primary underline decoration-primary/30 underline-offset-8">Approval</span>
                </>
            );
        } else if (score >= 40) {
            return (
                <>
                    Moderate Eligibility <span className="text-amber-400 underline decoration-amber-400/30 underline-offset-8">Score</span>
                </>
            );
        } else {
            return (
                <>
                    Eligibility Requirements <span className="text-red-400 underline decoration-red-400/30 underline-offset-8">Not Met</span>
                </>
            );
        }
    };

    const getHeroDescription = () => {
        if (!results || !results.result) return '';
        const score = results.result.score || results.eligibility_score || 0;
        const visaType = results.result.visa_type || 'your target';
        if (score >= 70) {
            return `Our AI engine has analyzed your profile against current immigration trends for the ${visaType}. Your documentation and history align perfectly with the requirements.`;
        } else if (score >= 40) {
            return `Our AI engine has identified some gaps in your profile for the ${visaType}. Addressing these requirements will improve your chances of approval.`;
        } else {
            return `Our AI engine has determined that your current profile does not meet the minimum requirements for the ${visaType}. Consider reviewing the suggestions below or exploring alternative visa options.`;
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen">
            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[radial-gradient(circle_at_top_center,rgba(13,204,242,0.15)_0%,transparent_70%)]">
                <header className="flex items-center justify-between border-b border-primary/10 px-6 py-4 lg:px-20 bg-background-dark/50 backdrop-blur-md sticky top-0 z-50">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-3xl">verified_user</span>
                        </div>
                        <h2 className="text-xl font-extrabold tracking-tight text-slate-100 uppercase">{L.APP_NAME}</h2>
                    </div>
                    <nav className="hidden md:flex items-center gap-8">
                        <Link className="text-sm font-medium hover:text-primary transition-colors" to={ROUTES.USER_DASHBOARD}>{L.DASHBOARD}</Link>
                        <Link className="text-sm font-medium hover:text-primary transition-colors" to={ROUTES.DOCUMENT_VAULT}>{L.DOCUMENTS}</Link>
                        <Link className="text-sm font-medium hover:text-primary transition-colors" to={ROUTES.HOME}>{L.SUPPORT}</Link>
                    </nav>
                    <div className="flex items-center gap-4">
                        <Button variant="icon" icon="notifications" />
                        <div className="w-10 h-10 rounded-full border-2 border-primary/30 p-0.5">
                            <img alt="User Avatar" className="rounded-full object-cover w-full h-full" src="https://i.pravatar.cc/150?u=EligibilityResultsSuggestions" />
                        </div>
                    </div>
                </header>

                <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 lg:px-20">
                    {!assessmentId && !loading && !error && (
                        <div className="text-center py-20">
                            <span className="material-symbols-outlined text-6xl text-slate-600 mb-4">search</span>
                            <h2 className="text-2xl font-bold text-slate-100 mb-2">No Assessment Found</h2>
                            <p className="text-slate-400 max-w-md mx-auto mb-8">
                                You haven't completed a visa pre-assessment yet. Our AI engine can help determine your best visa pathway.
                            </p>
                            <Button to={ROUTES.ELIGIBILITY_CHECKER} variant="primary" size="lg">{L.CHECK_ELIGIBILITY}</Button>
                        </div>
                    )}

                    {loading && (
                        <>
                            <section className="flex flex-col lg:flex-row gap-12 items-center mb-16">
                                <div className="flex-1 space-y-6">
                                    <div className="h-6 w-48 bg-primary/10 rounded-full animate-pulse"></div>
                                    <div className="h-12 w-full bg-slate-800/50 rounded-lg animate-pulse"></div>
                                    <div className="h-6 w-3/4 bg-slate-800/30 rounded animate-pulse"></div>
                                </div>
                                <div className="relative flex items-center justify-center p-8 bg-primary/5 rounded-full border border-primary/10 animate-pulse">
                                    <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle className="text-slate-800" cx="50%" cy="50%" fill="transparent"
                                                    r="45%" stroke="currentColor" strokeWidth="12"></circle>
                                            <circle className="text-slate-800" cx="50%" cy="50%" fill="transparent"
                                                    r="45%" stroke="currentColor" strokeDasharray="283"
                                                    strokeDashoffset="0" strokeWidth="14"></circle>
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                            <span className="text-6xl font-black text-slate-800">--%</span>
                                            <span className="text-sm font-medium text-slate-700 tracking-widest uppercase">Analyzing...</span>
                                        </div>
                                    </div>
                                </div>
                            </section>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="rounded-2xl h-32 bg-primary/5 animate-pulse border border-white/5"></div>
                                ))}
                            </div>
                        </>
                    )}

                    {error && !loading && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center max-w-2xl mx-auto my-12">
                            <span className="material-symbols-outlined text-4xl text-red-400 mb-4 block">error_outline</span>
                            <p className="text-red-400 text-lg mb-4">{error}</p>
                            <Button to={ROUTES.ELIGIBILITY_CHECKER} variant="primary" size="lg">{L.CHECK_ELIGIBILITY}</Button>
                        </div>
                    )}

                    {results && results.result && !loading && (
                        <>
                            <section className="flex flex-col lg:flex-row gap-12 items-center mb-16">
                                <div className="flex-1 space-y-6">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase">
                                        <span className="relative flex w-2 h-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                            <span className="relative inline-flex rounded-full w-2 h-2 bg-primary"></span>
                                        </span>
                                        Analysis Complete
                                    </div>
                                    <h1 className="text-5xl font-black text-slate-100 leading-tight">{getHeroHeading()}</h1>
                                    <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">{getHeroDescription()}</p>
                                    <div className="flex flex-wrap gap-4 pt-4">
                                        <Button to={ROUTES.DOCUMENT_VAULT} variant="primary" size="lg">{L.START_APPLICATION}</Button>
                                        <Button to={ROUTES.CHATBOT} variant="secondary" size="lg" icon="smart_toy">{L.BOOK_CONSULTATION}</Button>
                                    </div>
                                </div>
                                <div className="relative flex items-center justify-center p-8 bg-primary/5 rounded-full border border-primary/10 shadow-[0_0_50px_rgba(13,204,242,0.05)]">
                                    <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
                                        <svg className="w-full h-full transform -rotate-90" ref={gaugeRef}>
                                            <circle className="text-slate-800" cx="50%" cy="50%" fill="transparent"
                                                    r="45%" stroke="currentColor" strokeWidth="12"></circle>
                                            <circle className="text-primary" cx="50%" cy="50%" fill="transparent"
                                                    r="45%" stroke="currentColor"
                                                    strokeDasharray="283"
                                                    strokeDashoffset={283 - (283 * gaugeScore / 100)}
                                                    strokeLinecap="round" strokeWidth="14"
                                                    style={{ transition: 'stroke-dashoffset 0.1s ease-out' }}></circle>
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                            <span className="text-6xl font-black text-slate-100">{gaugeScore}%</span>
                                            <span className={`text-sm font-medium tracking-widest uppercase ${
                                                gaugeScore >= 70 ? 'text-emerald-400' : gaugeScore >= 40 ? 'text-amber-400' : 'text-red-400'
                                            }`}>
                                                {gaugeScore >= 70 ? 'Eligible' : gaugeScore >= 40 ? 'Conditional' : 'Not Eligible'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="mb-16">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                                        <span className="material-symbols-outlined text-primary">checklist</span>
                                        Eligibility Analysis
                                    </h2>
                                </div>

                                {results.result.matched_requirements && results.result.matched_requirements.length > 0 && (
                                    <div className="mb-8">
                                        <h3 className="text-lg font-semibold text-emerald-400 mb-4 flex items-center gap-2">
                                            <span className="material-symbols-outlined">check_circle</span>
                                            Requirements Met ({results.result.matched_requirements.length})
                                        </h3>
                                        <div className="space-y-3">
                                            {results.result.matched_requirements.map((req, i) => (
                                                <div key={i} className="bg-emerald-500/5 backdrop-blur-sm p-4 rounded-xl border border-emerald-500/20 flex items-start gap-4">
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                                                        <span className="material-symbols-outlined text-lg">check</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-200 font-medium">{req}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {results.result.missing_requirements && results.result.missing_requirements.length > 0 && (
                                    <div className="mb-8">
                                        <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
                                            <span className="material-symbols-outlined">cancel</span>
                                            Requirements Not Met ({results.result.missing_requirements.length})
                                        </h3>
                                        <div className="space-y-3">
                                            {results.result.missing_requirements.map((req, i) => (
                                                <div key={i} className="bg-red-500/5 backdrop-blur-sm p-4 rounded-xl border border-red-500/20 flex items-start gap-4">
                                                    <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 mt-0.5">
                                                        <span className="material-symbols-outlined text-lg">close</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-slate-200 font-medium">{req}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {results.result.actionable_feedback && results.result.actionable_feedback.length > 0 && (
                                    <div className="bg-primary/5 backdrop-blur-sm p-6 rounded-2xl border border-primary/10">
                                        <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                                            <span className="material-symbols-outlined">tips_and_updates</span>
                                            How to Improve
                                        </h3>
                                        <ul className="space-y-3">
                                            {results.result.actionable_feedback.map((tip, i) => (
                                                <li key={i} className="flex items-start gap-3 text-slate-300">
                                                    <span className="material-symbols-outlined text-primary text-lg mt-0.5">arrow_right</span>
                                                    <span>{tip}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </section>

                            {results.result.alternative_visas && results.result.alternative_visas.length > 0 && (
                                <section className="bg-primary/5 rounded-3xl p-8 lg:p-12 border border-primary/20 relative overflow-hidden mb-16">
                                    <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                                        <span className="material-symbols-outlined text-[160px]">psychology</span>
                                    </div>
                                    <div className="relative z-10">
                                        <div className="max-w-2xl">
                                            <h2 className="text-2xl font-bold text-slate-100 mb-2">Alternative Visa Options</h2>
                                            <p className="text-slate-400 mb-8">Based on your profile, you may be eligible for these alternative visa pathways.</p>
                                            <div className="space-y-4">
                                                {results.result.alternative_visas.map((visa, i) => (
                                                    <div key={i}
                                                         className="flex items-start gap-4 p-5 bg-background-dark/80 rounded-2xl border border-slate-800 group hover:border-primary/50 transition-colors">
                                                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                                            <span className="material-symbols-outlined text-xl">flight</span>
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-semibold text-slate-100">{visa.country} — {visa.visa_type}</h4>
                                                            <p className="text-sm text-slate-400 mt-1">{visa.description || ''}</p>
                                                            {visa.processing_time && (
                                                                <p className="text-xs text-slate-500 mt-1">Processing: {visa.processing_time}</p>
                                                            )}
                                                        </div>
                                                        <Button variant="ghost" size="sm" className="uppercase tracking-wider group-hover:underline shrink-0">Explore</Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            )}
                        </>
                    )}
                </main>

                <footer className="border-t border-slate-800/50 py-10 px-6 lg:px-20 bg-background-dark/30">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-2 opacity-50 grayscale">
                            <div className="w-6 h-6 bg-slate-400 rounded-sm"></div>
                            <span className="text-sm font-bold tracking-tight">{L.APP_NAME} v2.4</span>
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
