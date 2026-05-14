import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

const STEPS = [
    { num: 1, label: 'Personal', icon: 'person' },
    { num: 2, label: 'Travel', icon: 'explore' },
    { num: 3, label: 'Documents', icon: 'description' },
    { num: 4, label: 'Review', icon: 'verified' },
];

const REQUIRED_DOCS = [
    { id: 'passport', label: 'Valid Passport (6+ months validity)', icon: 'passport' },
    { id: 'photo', label: 'Passport-sized photographs', icon: 'photo_camera' },
    { id: 'bank_statement', label: 'Bank statements (last 3 months)', icon: 'account_balance' },
    { id: 'itinerary', label: 'Travel itinerary / Flight booking', icon: 'flight' },
    { id: 'accommodation', label: 'Accommodation proof / Hotel booking', icon: 'hotel' },
    { id: 'insurance', label: 'Travel insurance certificate', icon: 'health_and_safety' },
];

const COUNTRIES = [
    'Select citizenship', 'United States', 'United Kingdom', 'India', 'Canada',
    'Germany', 'France', 'Japan', 'Australia', 'Brazil', 'South Africa',
];

const DESTINATIONS = [
    'Select destination', 'United States', 'United Kingdom', 'Canada',
    'Australia', 'France', 'Japan',
];

const INPUT_CLASS = "w-full bg-background-dark border border-slate-700 rounded-lg py-3 px-4 text-slate-200 focus:shadow-[0_0_15px_rgba(13,204,242,0.3)] focus:border-primary focus:ring-0 outline-none transition-all placeholder:text-slate-500";

const VisaEligibilityChecker = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({ 1: {}, 2: {}, 3: {}, 4: {} });
    const [assessmentId, setAssessmentId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [submitResult, setSubmitResult] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const existingId = searchParams.get('id');
        const token = localStorage.getItem('access_token');
        if (!token) { navigate('/login'); return; }

        if (existingId) {
            fetch(`http://localhost:8000/assessment/${existingId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => { if (!res.ok) throw new Error('Failed to load'); return res.json(); })
                .then(data => {
                    setAssessmentId(data.id);
                    setCurrentStep(data.current_step);
                    if (data.form_data && typeof data.form_data === 'object') {
                        setFormData(prev => ({ ...prev, ...data.form_data }));
                    }
                    if (data.result) setSubmitResult(data.result);
                })
                .catch(() => setError('Could not load your saved assessment. Starting fresh.'))
                .finally(() => setLoading(false));
        } else {
            fetch('http://localhost:8000/assessment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
            })
                .then(res => { if (!res.ok) throw new Error('Failed to create'); return res.json(); })
                .then(data => setAssessmentId(data.id))
                .catch(() => setError('Could not create assessment. Please try again.'))
                .finally(() => setLoading(false));
        }
    }, [searchParams, navigate]);

    const saveProgress = useCallback(async (step, data) => {
        if (!assessmentId) return;
        try {
            const token = localStorage.getItem('access_token');
            if (!token) { navigate('/login'); return; }
            await fetch(`http://localhost:8000/assessment/${assessmentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ step, data })
            });
        } catch (err) {
            console.error('Auto-save failed:', err);
        }
    }, [assessmentId, navigate]);

    const handleFieldChange = (step, field, value) => {
        setFormData(prev => ({ ...prev, [step]: { ...prev[step], [field]: value } }));
        setError('');
    };

    const handleNext = async () => {
        const currentData = formData[currentStep] || {};
        if (currentStep === 1) {
            if (!currentData.nationality || !currentData.date_of_birth || !currentData.passport_number) {
                setError('Please fill in all required fields in Personal Information.');
                return;
            }
        }
        if (currentStep === 2) {
            if (!currentData.destination_country || !currentData.purpose || !currentData.intended_stay_days) {
                setError('Please fill in all required fields in Travel Details.');
                return;
            }
        }
        setError('');
        await saveProgress(currentStep, formData[currentStep] || {});
        setCurrentStep(prev => Math.min(prev + 1, 4));
    };

    const handleBack = async () => {
        setError('');
        await saveProgress(currentStep, formData[currentStep] || {});
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async () => {
        if (!assessmentId) return;
        setIsSubmitting(true);
        setError('');
        await saveProgress(4, formData[4] || {});
        try {
            const token = localStorage.getItem('access_token');
            if (!token) { navigate('/login'); return; }
            const res = await fetch(`http://localhost:8000/assessment/${assessmentId}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setSubmitResult(data.result || data);
            } else if (res.status === 401) {
                navigate('/login');
            } else {
                setError('We couldn\'t process your assessment. Please check your answers and try again.');
            }
        } catch (err) {
            setError('Network error. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStepStyle = (stepNum) => {
        if (stepNum === currentStep) return "w-10 h-10 rounded-full bg-primary text-background-dark flex items-center justify-center ring-4 ring-primary/20";
        if (stepNum < currentStep) return "w-10 h-10 rounded-full bg-primary/70 text-background-dark flex items-center justify-center";
        return "w-10 h-10 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center";
    };

    const renderStepper = () => (
        <div className="relative z-10 flex items-center justify-between mb-12">
            {STEPS.map((step, idx) => (
                <React.Fragment key={step.num}>
                    <div className={`flex flex-col items-center gap-2 ${step.num > currentStep ? 'opacity-50' : ''}`}>
                        <div className={getStepStyle(step.num)}>
                            <span className="material-symbols-outlined text-base">{step.icon}</span>
                        </div>
                        <span className={`text-[10px] uppercase tracking-widest font-bold ${step.num === currentStep ? 'text-primary' : ''}`}>{step.label}</span>
                    </div>
                    {idx < STEPS.length - 1 && (
                        <div className="flex-1 h-[2px] mx-4 bg-primary/20">
                            <div className="h-full bg-primary transition-all" style={{ width: `${(currentStep - 1) / 3 * 100}%` }}></div>
                        </div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );

    const renderStep1Personal = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Full Name</label>
                <input type="text" placeholder="Enter your full name" className={INPUT_CLASS}
                    value={formData[1]?.full_name || ''}
                    onChange={(e) => handleFieldChange(1, 'full_name', e.target.value)} />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Nationality</label>
                <div className="relative">
                    <select className={`${INPUT_CLASS} appearance-none`}
                        value={formData[1]?.nationality || ''}
                        onChange={(e) => handleFieldChange(1, 'nationality', e.target.value)}>
                        {COUNTRIES.map(c => <option key={c} value={c === 'Select citizenship' ? '' : c}>{c}</option>)}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                        <span className="material-symbols-outlined">expand_more</span>
                    </div>
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Date of Birth</label>
                <input type="date" className={INPUT_CLASS}
                    value={formData[1]?.date_of_birth || ''}
                    onChange={(e) => handleFieldChange(1, 'date_of_birth', e.target.value)} />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Passport Number</label>
                <input type="text" placeholder="Enter passport number" className={INPUT_CLASS}
                    value={formData[1]?.passport_number || ''}
                    onChange={(e) => handleFieldChange(1, 'passport_number', e.target.value)} />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Email</label>
                <input type="email" placeholder="your@email.com" className={INPUT_CLASS}
                    value={formData[1]?.email || ''}
                    onChange={(e) => handleFieldChange(1, 'email', e.target.value)} />
            </div>
        </div>
    );

    const renderStep2Travel = () => (
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Destination Country</label>
                <div className="relative">
                    <select className={`${INPUT_CLASS} appearance-none`}
                        value={formData[2]?.destination_country || ''}
                        onChange={(e) => handleFieldChange(2, 'destination_country', e.target.value)}>
                        {DESTINATIONS.map(c => <option key={c} value={c === 'Select destination' ? '' : c}>{c}</option>)}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                        <span className="material-symbols-outlined">expand_more</span>
                    </div>
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Purpose of Travel</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { value: 'tourism', icon: 'beach_access', label: 'Tourism' },
                        { value: 'business', icon: 'work', label: 'Business' },
                        { value: 'study', icon: 'school', label: 'Study' },
                        { value: 'work', icon: 'badge', label: 'Work' },
                    ].map(p => (
                        <label key={p.value} className="relative cursor-pointer group">
                            <input type="radio" name="purpose" className="peer sr-only"
                                checked={formData[2]?.purpose === p.value}
                                onChange={() => handleFieldChange(2, 'purpose', p.value)} />
                            <div className="p-4 rounded-xl border border-slate-700 bg-background-dark/50 hover:bg-primary/5 transition-all flex flex-col items-center gap-2 peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:ring-1 peer-checked:ring-primary">
                                <span className="material-symbols-outlined text-2xl text-slate-400 group-hover:text-primary peer-checked:text-primary">{p.icon}</span>
                                <span className="text-xs font-medium text-slate-300">{p.label}</span>
                            </div>
                        </label>
                    ))}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Intended Stay (days)</label>
                    <input type="number" min="1" placeholder="Number of days" className={INPUT_CLASS}
                        value={formData[2]?.intended_stay_days || ''}
                        onChange={(e) => handleFieldChange(2, 'intended_stay_days', e.target.value)} />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Bank Balance (USD)</label>
                    <input type="number" min="0" step="100" placeholder="Approximate balance" className={INPUT_CLASS}
                        value={formData[2]?.bank_balance || ''}
                        onChange={(e) => handleFieldChange(2, 'bank_balance', e.target.value)} />
                </div>
            </div>
            <div className="flex items-center gap-3">
                <input type="checkbox" id="has_insurance" className="w-4 h-4 rounded border-slate-700 bg-background-dark text-primary focus:ring-primary"
                    checked={formData[2]?.has_travel_insurance || false}
                    onChange={(e) => handleFieldChange(2, 'has_travel_insurance', e.target.checked)} />
                <label htmlFor="has_insurance" className="text-sm text-slate-300">I have travel insurance</label>
            </div>
        </div>
    );

    const renderStep3Documents = () => (
        <div className="space-y-4">
            {REQUIRED_DOCS.map(doc => (
                <div key={doc.id} className="flex items-center gap-4 p-4 rounded-xl border border-slate-800 bg-background-dark/50 hover:bg-primary/5 transition-all">
                    <input type="checkbox" id={`doc_${doc.id}`} className="w-4 h-4 rounded border-slate-700 bg-background-dark text-primary focus:ring-primary"
                        checked={formData[3]?.[doc.id] || false}
                        onChange={(e) => handleFieldChange(3, doc.id, e.target.checked)} />
                    <span className="material-symbols-outlined text-primary">{doc.icon}</span>
                    <label htmlFor={`doc_${doc.id}`} className="flex-1 text-sm text-slate-200">{doc.label}</label>
                    <button className="text-xs font-medium text-primary opacity-60 hover:opacity-100 transition-opacity">
                        <span className="material-symbols-outlined text-lg">cloud_upload</span>
                    </button>
                </div>
            ))}
        </div>
    );

    const renderReviewSection = (title, data, stepToEdit) => (
        <div className="bg-primary/5 backdrop-blur-sm rounded-xl p-5 border border-white/5">
            <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-slate-100">{title}</h4>
                <button onClick={async () => { await saveProgress(4, formData[4] || {}); setCurrentStep(stepToEdit); }}
                    className="text-xs font-bold text-primary uppercase tracking-wider hover:underline">
                    Edit
                </button>
            </div>
            <div className="space-y-1">
                {Object.entries(data || {}).filter(([k, v]) => v && typeof v !== 'object').map(([key, val]) => (
                    <div key={key} className="flex justify-between text-sm">
                        <span className="text-slate-400">{key.replace(/_/g, ' ')}</span>
                        <span className="text-slate-200">{String(val)}</span>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderStep4Review = () => (
        <div className="space-y-4">
            {renderReviewSection('Personal Information', formData[1], 1)}
            {renderReviewSection('Travel Details', formData[2], 2)}
            <div className="bg-primary/5 backdrop-blur-sm rounded-xl p-5 border border-white/5">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-slate-100">Documents Checklist</h4>
                    <button onClick={async () => { await saveProgress(4, formData[4] || {}); setCurrentStep(3); }}
                        className="text-xs font-bold text-primary uppercase tracking-wider hover:underline">
                        Edit
                    </button>
                </div>
                <div className="space-y-1">
                    {REQUIRED_DOCS.filter(d => formData[3]?.[d.id]).map(d => (
                        <div key={d.id} className="flex items-center gap-2 text-sm text-emerald-400">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            {d.label}
                        </div>
                    ))}
                    {(!formData[3] || Object.values(formData[3]).filter(Boolean).length === 0) && (
                        <p className="text-sm text-slate-500">No documents selected yet.</p>
                    )}
                </div>
            </div>
        </div>
    );

    const renderSubmitResult = () => {
        if (!submitResult) return null;
        const score = submitResult.score || 0;
        const tier = score >= 70 ? 'high' : score >= 40 ? 'mid' : 'low';
        const colorMap = { high: 'text-emerald-400', mid: 'text-amber-400', low: 'text-red-400' };
        return (
            <div className="space-y-6">
                <div className="text-center">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${score >= 70 ? 'bg-emerald-500/10 text-emerald-400' : score >= 40 ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'} border border-current/20 text-sm font-bold`}>
                        Score: {score}%
                    </div>
                    <h3 className="text-2xl font-bold text-slate-100 mt-4">Eligibility Results</h3>
                </div>
                {submitResult.matched_requirements?.length > 0 && (
                    <div>
                        <h4 className="text-emerald-400 font-semibold mb-3">Requirements Met ({submitResult.matched_requirements.length})</h4>
                        <div className="space-y-2">
                            {submitResult.matched_requirements.map((r, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                                    <span className="material-symbols-outlined text-emerald-400 text-lg">check_circle</span>
                                    <span className="text-slate-200 text-sm">{r}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {submitResult.missing_requirements?.length > 0 && (
                    <div>
                        <h4 className="text-red-400 font-semibold mb-3">Requirements Not Met ({submitResult.missing_requirements.length})</h4>
                        <div className="space-y-2">
                            {submitResult.missing_requirements.map((r, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/20">
                                    <span className="material-symbols-outlined text-red-400 text-lg">cancel</span>
                                    <span className="text-slate-200 text-sm">{r}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {submitResult.actionable_feedback?.length > 0 && (
                    <div className="bg-primary/5 border border-primary/10 rounded-xl p-5">
                        <h4 className="text-primary font-semibold mb-3">How to Improve</h4>
                        <ul className="space-y-2">
                            {submitResult.actionable_feedback.map((tip, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                                    <span className="material-symbols-outlined text-primary text-lg">arrow_right</span>
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                <div className="flex flex-wrap gap-4 pt-4">
                    <Link to="/document-vault-upload-system">
                        <button className="px-8 py-4 bg-primary text-background-dark font-bold rounded-xl hover:shadow-[0_0_20px_rgba(13,204,242,0.4)] transition-all">Start Application</button>
                    </Link>
                    <Link to="/ai-visa-chatbot">
                        <button className="px-8 py-4 bg-background-dark border border-slate-700 text-slate-100 font-bold rounded-xl hover:border-primary/50 transition-all">Book AI Consultation</button>
                    </Link>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="font-display bg-background-dark text-slate-100 min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-primary">Loading...</div>
            </div>
        );
    }

    return (
        <div className="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen bg-[radial-gradient(at_0%_0%,rgba(13,204,242,0.15)_0px,transparent_50%),radial-gradient(at_100%_100%,rgba(13,204,242,0.1)_0px,transparent_50%)] selection:bg-primary/30">
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
                <div className="mb-10">
                    <h2 className="text-3xl font-bold text-slate-100 mb-2">Visa Eligibility Checker</h2>
                    <p className="text-slate-400 max-w-2xl">Complete this brief assessment to determine which visa pathways are available for your upcoming trip.</p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-8 bg-background-dark/70 backdrop-blur-md border border-primary/10 rounded-xl p-8 shadow-[0_0_20px_rgba(0,0,0,0.5)] relative overflow-hidden">
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>

                        {submitResult ? (
                            renderSubmitResult()
                        ) : (
                            <>
                                {renderStepper()}

                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm flex items-start gap-3 mb-6">
                                        <span className="material-symbols-outlined text-lg shrink-0">error</span>
                                        <span>{error}</span>
                                        <button onClick={() => setError('')} className="ml-auto text-red-400/70 hover:text-red-400">
                                            <span className="material-symbols-outlined text-lg">close</span>
                                        </button>
                                    </div>
                                )}

                                <div className="relative z-10 space-y-8">
                                    {currentStep === 1 && renderStep1Personal()}
                                    {currentStep === 2 && renderStep2Travel()}
                                    {currentStep === 3 && renderStep3Documents()}
                                    {currentStep === 4 && renderStep4Review()}

                                    <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                                        {currentStep > 1 ? (
                                            <button onClick={handleBack}
                                                className="text-slate-400 hover:text-slate-100 text-sm font-medium flex items-center gap-2 px-4 py-2 transition-colors">
                                                <span className="material-symbols-outlined text-lg">arrow_back</span>
                                                Back
                                            </button>
                                        ) : (
                                            <div></div>
                                        )}
                                        {currentStep < 4 ? (
                                            <button onClick={handleNext}
                                                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-background-dark font-bold py-3 px-8 rounded-lg shadow-[0_4px_14px_0_rgba(13,204,242,0.39)] hover:shadow-[0_6px_20px_rgba(13,204,242,0.23)] transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2">
                                                Next Step: {STEPS[currentStep].label}
                                                <span className="material-symbols-outlined">arrow_forward</span>
                                            </button>
                                        ) : (
                                            <button onClick={handleSubmit} disabled={isSubmitting}
                                                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-background-dark font-bold py-3 px-8 rounded-lg shadow-[0_4px_14px_0_rgba(13,204,242,0.39)] hover:shadow-[0_6px_20px_rgba(13,204,242,0.23)] transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                                {isSubmitting ? (
                                                    <><span className="material-symbols-outlined animate-spin">refresh</span> Checking...</>
                                                ) : (
                                                    <><span className="material-symbols-outlined">verified</span> Check Eligibility</>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-background-dark/70 backdrop-blur-md border border-primary/10 rounded-xl p-6 border-l-4 border-l-primary shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="material-symbols-outlined text-primary">info</span>
                                <h3 className="text-lg font-bold text-slate-100">Why we ask this?</h3>
                            </div>
                            <div className="space-y-4 text-sm text-slate-400 leading-relaxed">
                                <p>Your <span className="text-slate-200 font-medium">citizenship</span> and <span className="text-slate-200 font-medium">destination</span> are the primary factors in determining visa eligibility.</p>
                                <p>The <span className="text-slate-200 font-medium">purpose of travel</span> helps our AI filter through 150+ visa types.</p>
                                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex gap-3 items-start">
                                    <span className="material-symbols-outlined text-primary text-lg">security</span>
                                    <p className="text-xs text-slate-300">Your data is encrypted per international standards.</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-background-dark/70 backdrop-blur-md border border-primary/10 rounded-xl p-6 shadow-[0_0_20px_rgba(0,0,0,0.5)] overflow-hidden relative group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="material-symbols-outlined text-6xl">chat_bubble</span>
                            </div>
                            <h3 className="text-sm font-bold text-slate-100 mb-2">Need help?</h3>
                            <p className="text-xs text-slate-400 mb-4">Our AI assistant can guide you through each step.</p>
                            <Link to="/ai-visa-chatbot"><button className="w-full py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-200 transition-colors border border-slate-700">Launch AI Assistant</button></Link>
                        </div>
                        <div className="rounded-xl h-48 bg-slate-800 overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-t from-background-dark to-transparent opacity-60 z-10"></div>
                            <img alt="World Map" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkEU4Ni8lOtlXOCmAB8Al4KQQmys3RCIq6atISInQXhkfSFDaS2F5QY8Pe4AUFNtPvrcbc9RXfR4BFqX7JNXLwG2KTlRHg077_9OdotNcwg2oEAYqc46jJZcng9CbXAnUbjWwmztVuTuvN0mPYnxxPo8Vov7o3jtS7LAd9Fdm8GF4oIh4pEOsNhOciDe9hgu56wnEoqFlXVjTQXJgGV4Nu3UXzJ1jaM_uIHGgwopOcdxhriDJfe44ks-633MQV7t9CrJcwnLt9HnJh" />
                            <div className="absolute bottom-4 left-4 z-20">
                                <span className="text-xs font-bold uppercase tracking-widest text-primary">Global Coverage</span>
                                <p className="text-xs text-slate-300">Tracking 195+ Countries</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        </div>
    );
};

export default VisaEligibilityChecker;
