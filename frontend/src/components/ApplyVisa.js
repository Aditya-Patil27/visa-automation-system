import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { L } from '../config/labels';
import { ROUTES } from '../config/routes';
import SidebarNav from './ui/SidebarNav';
import ProfileIcon from './ui/ProfileIcon';
import NotificationBell from './NotificationBell';
import { NAV_ITEMS_USER } from '../config/navigation';

const steps = [L.APPLICANT_INFO, L.TRAVEL_DETAILS, L.DOCUMENT_CHECKLIST, L.REVIEW_SUBMIT];

const ApplyVisa = () => {
  const { visa_id } = useParams();
  const navigate = useNavigate();
  const [visa, setVisa] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    applicant_name: '',
    applicant_email: '',
    applicant_passport: '',
    applicant_nationality: '',
    purpose: '',
    intended_stay_days: '',
    travel_date: '',
    documents_submitted: [],
    notes: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchVisa = async () => {
      try {
        const data = await api.get(`/visa/${visa_id}`);
        setVisa(data);
        const profile = localStorage.getItem('user_profile');
        if (profile) {
          try {
            const p = JSON.parse(profile);
            if (p.email) setFormData(prev => ({ ...prev, applicant_email: p.email }));
          } catch {}
        }
      } catch (err) {
        console.error('Failed to fetch visa:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVisa();
  }, [visa_id]);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const toggleDocument = (doc) => {
    setFormData(prev => ({
      ...prev,
      documents_submitted: prev.documents_submitted.includes(doc)
        ? prev.documents_submitted.filter(d => d !== doc)
        : [...prev.documents_submitted, doc],
    }));
  };

  const validateStep = () => {
    const newErrors = {};
    if (currentStep === 0) {
      if (!formData.applicant_name.trim()) newErrors.applicant_name = 'Name is required';
      if (!formData.applicant_email.trim()) newErrors.applicant_email = 'Email is required';
      if (!formData.applicant_passport.trim()) newErrors.applicant_passport = 'Passport number is required';
      if (!formData.applicant_nationality.trim()) newErrors.applicant_nationality = 'Nationality is required';
    }
    if (currentStep === 1) {
      if (!formData.purpose.trim()) newErrors.purpose = 'Purpose is required';
      if (!formData.intended_stay_days || formData.intended_stay_days < 1) newErrors.intended_stay_days = 'Valid stay days required';
      if (!formData.travel_date) newErrors.travel_date = 'Travel date is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setSubmitting(true);
    try {
      await api.post('/applications', { ...formData, visa_id });
      navigate(ROUTES.MY_APPLICATIONS);
    } catch (err) {
      console.error('Failed to submit application:', err);
      alert(err.detail || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background-light dark:bg-background-dark text-slate-500">
        <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
      </div>
    );
  }

  if (!visa) {
    return (
      <div className="h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-slate-400 mb-4">error</span>
          <p className="text-slate-500">Visa not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased">
      <div className="flex h-screen overflow-hidden">
        <aside className="w-64 flex-shrink-0 border-r border-primary/10 bg-background-light dark:bg-background-dark/50 hidden md:flex flex-col">
          <div className="p-6 flex items-center gap-3">
            <div className="bg-primary rounded-lg p-1.5">
              <span className="material-symbols-outlined text-background-dark font-bold">flight_takeoff</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">VisaApp</h1>
          </div>
          <SidebarNav items={NAV_ITEMS_USER} activeRoute="" />
        </aside>
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <header className="h-16 border-b border-primary/10 flex items-center justify-between px-8 bg-background-light/50 dark:bg-background-dark/50 backdrop-blur-md sticky top-0 z-20">
            <h2 className="text-lg font-semibold">Apply for {visa.country} - {visa.visa_type}</h2>
            <div className="flex items-center gap-4">
              <NotificationBell />
              <ProfileIcon />
            </div>
          </header>
          <div className="flex-1 p-8 max-w-3xl mx-auto w-full">
            <div className="flex items-center justify-center mb-8">
              {steps.map((step, i) => (
                <React.Fragment key={i}>
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      i < currentStep ? 'bg-primary text-white' :
                      i === currentStep ? 'bg-primary/20 text-primary border-2 border-primary' :
                      'bg-slate-200 dark:bg-slate-700 text-slate-500'
                    }`}>
                      {i < currentStep ? <span className="material-symbols-outlined text-sm">check</span> : i + 1}
                    </div>
                    <span className={`text-sm hidden md:inline ${i === currentStep ? 'text-primary font-medium' : 'text-slate-500'}`}>
                      {step}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`w-8 md:w-16 h-0.5 mx-2 ${i < currentStep ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-primary/10 p-8">
              {currentStep === 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">{L.APPLICANT_INFO}</h3>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{L.FULL_NAME} *</label>
                    <input
                      type="text"
                      value={formData.applicant_name}
                      onChange={(e) => updateField('applicant_name', e.target.value)}
                      className={`w-full rounded-lg border ${errors.applicant_name ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'} bg-white dark:bg-slate-700 px-3 py-2`}
                    />
                    {errors.applicant_name && <p className="text-red-500 text-xs mt-1">{errors.applicant_name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Email *</label>
                    <input
                      type="email"
                      value={formData.applicant_email}
                      onChange={(e) => updateField('applicant_email', e.target.value)}
                      className={`w-full rounded-lg border ${errors.applicant_email ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'} bg-white dark:bg-slate-700 px-3 py-2`}
                    />
                    {errors.applicant_email && <p className="text-red-500 text-xs mt-1">{errors.applicant_email}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{L.PASSPORT_NUMBER} *</label>
                      <input
                        type="text"
                        value={formData.applicant_passport}
                        onChange={(e) => updateField('applicant_passport', e.target.value)}
                        className={`w-full rounded-lg border ${errors.applicant_passport ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'} bg-white dark:bg-slate-700 px-3 py-2`}
                      />
                      {errors.applicant_passport && <p className="text-red-500 text-xs mt-1">{errors.applicant_passport}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{L.NATIONALITY} *</label>
                      <input
                        type="text"
                        value={formData.applicant_nationality}
                        onChange={(e) => updateField('applicant_nationality', e.target.value)}
                        className={`w-full rounded-lg border ${errors.applicant_nationality ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'} bg-white dark:bg-slate-700 px-3 py-2`}
                      />
                      {errors.applicant_nationality && <p className="text-red-500 text-xs mt-1">{errors.applicant_nationality}</p>}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">{L.TRAVEL_DETAILS}</h3>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{L.PURPOSE_OF_TRAVEL} *</label>
                    <select
                      value={formData.purpose}
                      onChange={(e) => updateField('purpose', e.target.value)}
                      className={`w-full rounded-lg border ${errors.purpose ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'} bg-white dark:bg-slate-700 px-3 py-2`}
                    >
                      <option value="">Select purpose</option>
                      {(visa.allowed_purposes || ['tourism', 'business', 'study', 'work']).map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    {errors.purpose && <p className="text-red-500 text-xs mt-1">{errors.purpose}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{L.INTENDED_STAY} *</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.intended_stay_days}
                        onChange={(e) => updateField('intended_stay_days', e.target.value)}
                        className={`w-full rounded-lg border ${errors.intended_stay_days ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'} bg-white dark:bg-slate-700 px-3 py-2`}
                      />
                      {errors.intended_stay_days && <p className="text-red-500 text-xs mt-1">{errors.intended_stay_days}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{L.TRAVEL_DATE} *</label>
                      <input
                        type="date"
                        value={formData.travel_date}
                        onChange={(e) => updateField('travel_date', e.target.value)}
                        className={`w-full rounded-lg border ${errors.travel_date ? 'border-red-500' : 'border-slate-200 dark:border-slate-600'} bg-white dark:bg-slate-700 px-3 py-2`}
                      />
                      {errors.travel_date && <p className="text-red-500 text-xs mt-1">{errors.travel_date}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Additional Notes</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => updateField('notes', e.target.value)}
                      rows="3"
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2"
                    />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">{L.DOCUMENT_CHECKLIST}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Select the documents you are submitting with this application:</p>
                  {visa.documents && visa.documents.length > 0 ? (
                    <div className="space-y-2">
                      {visa.documents.map(doc => (
                        <label key={doc} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-600 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50">
                          <input
                            type="checkbox"
                            checked={formData.documents_submitted.includes(doc)}
                            onChange={() => toggleDocument(doc)}
                            className="w-4 h-4 text-primary rounded"
                          />
                          <span className="material-symbols-outlined text-primary text-sm">description</span>
                          <span>{doc}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm">No specific documents required for this visa type.</p>
                  )}
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">{L.REVIEW_SUBMIT}</h3>
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-6 space-y-3">
                    <h4 className="font-medium text-primary">{visa.country} - {visa.visa_type}</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">{L.FULL_NAME}</p>
                        <p className="font-medium">{formData.applicant_name}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Email</p>
                        <p className="font-medium">{formData.applicant_email}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">{L.PASSPORT_NUMBER}</p>
                        <p className="font-medium">{formData.applicant_passport}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">{L.NATIONALITY}</p>
                        <p className="font-medium">{formData.applicant_nationality}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">{L.PURPOSE_OF_TRAVEL}</p>
                        <p className="font-medium">{formData.purpose}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">{L.INTENDED_STAY}</p>
                        <p className="font-medium">{formData.intended_stay_days} days</p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">{L.TRAVEL_DATE}</p>
                        <p className="font-medium">{formData.travel_date}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Documents</p>
                        <p className="font-medium">{formData.documents_submitted.length} selected</p>
                      </div>
                    </div>
                    {formData.notes && (
                      <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Notes</p>
                        <p className="text-sm">{formData.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className="px-6 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Back
                </button>
                {currentStep < steps.length - 1 ? (
                  <button onClick={handleNext} className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary/90">
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm">send</span>
                        {L.SUBMIT_APPLICATION}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ApplyVisa;
