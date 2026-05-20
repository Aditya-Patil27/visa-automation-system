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

const statusIcons = {
  pending: 'hourglass_top',
  submitted: 'upload_file',
  under_review: 'visibility',
  approved: 'check_circle',
  rejected: 'cancel',
  cancelled: 'block',
};

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminStatus, setAdminStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const role = localStorage.getItem('user_role');
  useEffect(() => { setIsAdmin(role === 'admin'); }, [role]);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async (searchTerm = '') => {
    setLoading(true);
    try {
      const query = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
      const data = await api.get(`/applications/my${query}`);
      setApplications(data);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchApplications(search);
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this application?')) return;
    try {
      await api.post(`/applications/${id}/cancel`);
      fetchApplications(search);
      if (selectedApp && selectedApp.id === id) setSelectedApp(null);
    } catch (err) {
      alert(err.detail || 'Failed to cancel application');
    }
  };

  const fetchDetail = async (id) => {
    setDetailLoading(true);
    try {
      const data = await api.get(`/applications/${id}`);
      setSelectedApp(data);
      setAdminStatus(data.status);
      setAdminNotes('');
    } catch (err) {
      console.error('Failed to fetch application detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleAdminStatusUpdate = async () => {
    if (!selectedApp) return;
    try {
      await api.post(`/admin/applications/${selectedApp.id}/status`, {
        status: adminStatus,
        notes: adminNotes,
      });
      fetchApplications(search);
      fetchDetail(selectedApp.id);
    } catch (err) {
      alert(err.detail || 'Failed to update status');
    }
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
          <SidebarNav items={NAV_ITEMS_USER} activeRoute={ROUTES.MY_APPLICATIONS} />
        </aside>
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <header className="h-16 border-b border-primary/10 flex items-center justify-between px-8 bg-background-light/50 dark:bg-background-dark/50 backdrop-blur-md sticky top-0 z-20">
            <h2 className="text-lg font-semibold">{L.MY_APPLICATIONS}</h2>
            <div className="flex items-center gap-4">
              <NotificationBell />
              <ProfileIcon />
            </div>
          </header>
          <div className="flex-1 p-8">
            <div className="flex gap-8">
              <div className="flex-1">
                <form onSubmit={handleSearch} className="mb-6">
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder={L.SEARCH_COUNTRY}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700"
                    />
                    <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-primary text-sm font-medium px-3 py-1">
                      {L.SEARCH}
                    </button>
                  </div>
                </form>

                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
                  </div>
                ) : applications.length === 0 ? (
                  <div className="text-center py-20">
                    <span className="material-symbols-outlined text-6xl text-slate-400 mb-4">folder_open</span>
                    <p className="text-slate-500 mb-4">No applications found</p>
                    <Link to={ROUTES.VISA_MARKETPLACE} className="text-primary hover:underline">
                      Browse available visas
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map(app => (
                      <div
                        key={app.id}
                        onClick={() => fetchDetail(app.id)}
                        className="bg-white dark:bg-slate-800 rounded-xl border border-primary/10 p-6 cursor-pointer hover:shadow-md hover:border-primary/30 transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">{app.visa_country}</h3>
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${statusColors[app.status]}`}>
                                <span className="material-symbols-outlined text-sm">{statusIcons[app.status]}</span>
                                {app.status.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{app.visa_type}</p>
                            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">person</span>
                                {app.applicant_name}
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">calendar_today</span>
                                Applied: {new Date(app.created_at).toLocaleDateString()}
                              </span>
                              {app.travel_date && (
                                <span className="flex items-center gap-1">
                                  <span className="material-symbols-outlined text-sm">flight</span>
                                  Travel: {app.travel_date}
                                </span>
                              )}
                            </div>
                          </div>
                          {(app.status === 'pending' || app.status === 'submitted') && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleCancel(app.id); }}
                              className="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1 rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              {L.CANCEL}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedApp && (
                <aside className="w-96 flex-shrink-0">
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-primary/10 p-6 sticky top-24">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Application Details</h3>
                      <button onClick={() => setSelectedApp(null)} className="text-slate-400 hover:text-slate-600">
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </div>
                    {detailLoading ? (
                      <div className="flex justify-center py-8">
                        <span className="material-symbols-outlined animate-spin text-primary">progress_activity</span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[selectedApp.status]}`}>
                          <span className="material-symbols-outlined text-sm">{statusIcons[selectedApp.status]}</span>
                          {selectedApp.status.replace('_', ' ')}
                        </div>
                        <div className="space-y-3 text-sm">
                          <div>
                            <p className="text-slate-500 dark:text-slate-400">Visa</p>
                            <p className="font-medium">{selectedApp.visa_country} - {selectedApp.visa_type_label || selectedApp.visa_type}</p>
                          </div>
                          <div>
                            <p className="text-slate-500 dark:text-slate-400">{L.FULL_NAME}</p>
                            <p className="font-medium">{selectedApp.applicant_name}</p>
                          </div>
                          <div>
                            <p className="text-slate-500 dark:text-slate-400">{L.PASSPORT_NUMBER}</p>
                            <p className="font-medium">{selectedApp.applicant_passport}</p>
                          </div>
                          <div>
                            <p className="text-slate-500 dark:text-slate-400">{L.NATIONALITY}</p>
                            <p className="font-medium">{selectedApp.applicant_nationality}</p>
                          </div>
                          <div>
                            <p className="text-slate-500 dark:text-slate-400">{L.PURPOSE_OF_TRAVEL}</p>
                            <p className="font-medium">{selectedApp.purpose}</p>
                          </div>
                          <div>
                            <p className="text-slate-500 dark:text-slate-400">{L.INTENDED_STAY}</p>
                            <p className="font-medium">{selectedApp.intended_stay_days} days</p>
                          </div>
                          <div>
                            <p className="text-slate-500 dark:text-slate-400">{L.TRAVEL_DATE}</p>
                            <p className="font-medium">{selectedApp.travel_date}</p>
                          </div>
                          {selectedApp.documents_submitted && selectedApp.documents_submitted.length > 0 && (
                            <div>
                              <p className="text-slate-500 dark:text-slate-400 mb-1">Documents Submitted</p>
                              <ul className="space-y-1">
                                {selectedApp.documents_submitted.map((d, i) => (
                                  <li key={i} className="flex items-center gap-1 text-xs">
                                    <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                                    {d}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {selectedApp.notes && (
                            <div>
                              <p className="text-slate-500 dark:text-slate-400">Notes</p>
                              <p className="text-sm">{selectedApp.notes}</p>
                            </div>
                          )}
                          <div className="pt-3 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500">
                            <p>Created: {new Date(selectedApp.created_at).toLocaleString()}</p>
                            <p>Updated: {new Date(selectedApp.updated_at).toLocaleString()}</p>
                          </div>
                        </div>

                        {isAdmin && (
                          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <h4 className="font-medium text-sm mb-3 text-primary">Admin Actions</h4>
                            <div className="space-y-3">
                              <div>
                                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Update Status</label>
                                <select
                                  value={adminStatus}
                                  onChange={(e) => setAdminStatus(e.target.value)}
                                  className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="submitted">Submitted</option>
                                  <option value="under_review">Under Review</option>
                                  <option value="approved">Approved</option>
                                  <option value="rejected">Rejected</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">Admin Notes</label>
                                <textarea
                                  value={adminNotes}
                                  onChange={(e) => setAdminNotes(e.target.value)}
                                  rows="2"
                                  className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm"
                                />
                              </div>
                              <button
                                onClick={handleAdminStatusUpdate}
                                className="w-full bg-primary text-white rounded-lg py-2 text-sm font-medium hover:bg-primary/90"
                              >
                                Update Status
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </aside>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MyApplications;
