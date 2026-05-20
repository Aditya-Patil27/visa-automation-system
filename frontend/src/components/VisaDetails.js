import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { L } from '../config/labels';
import { ROUTES } from '../config/routes';
import SidebarNav from './ui/SidebarNav';
import ProfileIcon from './ui/ProfileIcon';
import NotificationBell from './NotificationBell';
import { NAV_ITEMS_USER } from '../config/navigation';

const VisaDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [visa, setVisa] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVisa = async () => {
      try {
        const data = await api.get(`/visa/${id}`);
        setVisa(data);
      } catch (err) {
        console.error('Failed to fetch visa:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVisa();
  }, [id]);

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
          <Link to={ROUTES.VISA_MARKETPLACE} className="text-primary hover:underline mt-2 inline-block">
            Back to Marketplace
          </Link>
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
            <Link to={ROUTES.VISA_MARKETPLACE} className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
              Back to Marketplace
            </Link>
            <div className="flex items-center gap-4">
              <NotificationBell />
              <ProfileIcon />
            </div>
          </header>
          <div className="flex-1 p-8 max-w-4xl mx-auto w-full">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-primary/10 p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold mb-1">{visa.country}</h1>
                  <p className="text-lg text-slate-500 dark:text-slate-400">{visa.visa_type}</p>
                </div>
                <button
                  onClick={() => navigate(`/apply/${id}`)}
                  className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined">edit_note</span>
                  {L.APPLY_NOW}
                </button>
              </div>

              {visa.description && (
                <p className="text-slate-600 dark:text-slate-300 mb-6">{visa.description}</p>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {visa.processing_time && (
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                    <span className="material-symbols-outlined text-primary mb-1">schedule</span>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{L.PROCESSING_TIME}</p>
                    <p className="font-semibold">{visa.processing_time}</p>
                  </div>
                )}
                {visa.max_stay_days && (
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                    <span className="material-symbols-outlined text-primary mb-1">calendar_today</span>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Max Stay</p>
                    <p className="font-semibold">{visa.max_stay_days} days</p>
                  </div>
                )}
                {visa.fee !== null && visa.fee !== undefined && (
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                    <span className="material-symbols-outlined text-primary mb-1">payments</span>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Fee</p>
                    <p className="font-semibold">${visa.fee}</p>
                  </div>
                )}
                {visa.validity && (
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                    <span className="material-symbols-outlined text-primary mb-1">verified</span>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Validity</p>
                    <p className="font-semibold">{visa.validity}</p>
                  </div>
                )}
              </div>

              {visa.allowed_purposes && visa.allowed_purposes.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Allowed Purposes</h3>
                  <div className="flex flex-wrap gap-2">
                    {visa.allowed_purposes.map(p => (
                      <span key={p} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">{p}</span>
                    ))}
                  </div>
                </div>
              )}

              {visa.documents && visa.documents.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Required Documents</h3>
                  <ul className="space-y-2">
                    {visa.documents.map((doc, i) => (
                      <li key={i} className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                        {doc}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default VisaDetails;
