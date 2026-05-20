import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { L } from '../config/labels';
import { ROUTES } from '../config/routes';
import SidebarNav from './ui/SidebarNav';
import ProfileIcon from './ui/ProfileIcon';
import NotificationBell from './NotificationBell';
import { NAV_ITEMS_USER } from '../config/navigation';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  under_review: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
};

const VisaMarketplace = () => {
  const [visas, setVisas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    country: '',
    visa_type: '',
    min_processing_days: '',
    max_processing_days: '',
  });
  const [countries, setCountries] = useState([]);
  const [visaTypes, setVisaTypes] = useState([]);

  useEffect(() => {
    fetchVisas();
  }, []);

  const fetchVisas = async (params = {}) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v) query.append(k, v);
      });
      const data = await api.get(`/visa/public${query.toString() ? '?' + query.toString() : ''}`);
      setVisas(data);
      const uniqueCountries = [...new Set(data.map(v => v.country))].sort();
      const uniqueTypes = [...new Set(data.map(v => v.visa_type))].sort();
      setCountries(uniqueCountries);
      setVisaTypes(uniqueTypes);
    } catch (err) {
      console.error('Failed to fetch visas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const applyFilters = () => {
    fetchVisas(filters);
  };

  const resetFilters = () => {
    setFilters({ country: '', visa_type: '', min_processing_days: '', max_processing_days: '' });
    fetchVisas();
  };

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
          <SidebarNav items={NAV_ITEMS_USER} activeRoute={ROUTES.VISA_MARKETPLACE} />
        </aside>
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <header className="h-16 border-b border-primary/10 flex items-center justify-between px-8 bg-background-light/50 dark:bg-background-dark/50 backdrop-blur-md sticky top-0 z-20">
            <h2 className="text-lg font-semibold">{L.VISA_MARKETPLACE}</h2>
            <div className="flex items-center gap-4">
              <NotificationBell />
              <ProfileIcon />
            </div>
          </header>
          <div className="flex-1 p-8">
            <div className="flex gap-8">
              <aside className="w-72 flex-shrink-0">
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-primary/10 p-6 sticky top-24">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">filter_list</span>
                      {L.FILTER}
                    </h3>
                    <button onClick={resetFilters} className="text-sm text-primary hover:underline">
                      Reset
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{L.COUNTRY}</label>
                      <select
                        value={filters.country}
                        onChange={(e) => handleFilterChange('country', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm"
                      >
                        <option value="">{L.ALL_COUNTRIES}</option>
                        {countries.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{L.VISA_TYPE}</label>
                      <select
                        value={filters.visa_type}
                        onChange={(e) => handleFilterChange('visa_type', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm"
                      >
                        <option value="">{L.ALL_TYPES}</option>
                        {visaTypes.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{L.PROCESSING_TIME} (days)</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Min"
                          value={filters.min_processing_days}
                          onChange={(e) => handleFilterChange('min_processing_days', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm"
                        />
                        <input
                          type="number"
                          placeholder="Max"
                          value={filters.max_processing_days}
                          onChange={(e) => handleFilterChange('max_processing_days', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                    <button
                      onClick={applyFilters}
                      className="w-full bg-primary text-white rounded-lg py-2.5 font-medium hover:bg-primary/90 transition-colors"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </aside>
              <div className="flex-1">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{visas.length} visa{visas.length !== 1 ? 's' : ''} found</p>
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
                  </div>
                ) : visas.length === 0 ? (
                  <div className="text-center py-20 text-slate-500">
                    <span className="material-symbols-outlined text-6xl mb-4">public_off</span>
                    <p>No visas match your filters</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {visas.map(visa => (
                      <Link
                        key={visa.id}
                        to={`/visa/${visa.id}`}
                        className="bg-white dark:bg-slate-800 rounded-xl border border-primary/10 p-6 hover:shadow-lg hover:border-primary/30 transition-all group"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="bg-primary/10 rounded-lg p-2">
                            <span className="material-symbols-outlined text-primary text-2xl">public</span>
                          </div>
                          {visa.fee && (
                            <span className="text-lg font-bold text-primary">${visa.fee}</span>
                          )}
                        </div>
                        <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">{visa.country}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{visa.visa_type}</p>
                        {visa.description && (
                          <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">{visa.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                          {visa.processing_time && (
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">schedule</span>
                              {visa.processing_time}
                            </span>
                          )}
                          {visa.max_stay_days && (
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">calendar_today</span>
                              {visa.max_stay_days} days
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default VisaMarketplace;
