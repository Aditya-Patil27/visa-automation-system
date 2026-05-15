import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Button from './ui/Button';
import { api } from '../services/api';
import { L } from '../config/labels';
import { ROUTES } from '../config/routes';

const VisaKnowledgeManagement = () => {
    const [visas, setVisas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCountry, setFilterCountry] = useState('all');
    const [filterVisaType, setFilterVisaType] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit' | 'delete'
    const [selectedVisa, setSelectedVisa] = useState(null);
    const [formData, setFormData] = useState({
        country: '',
        visa_type: '',
        documents: '',
        processing_time: ''
    });
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchVisas = async () => {
        try {
            const data = await api.get('/visa');
            setVisas(data);
        } catch (err) {
            console.error("Failed to fetch visas", err);
            showToast('Failed to fetch visa requirements', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVisas();
    }, []);

    const countries = useMemo(() => {
        const unique = [...new Set(visas.map(v => v.country))];
        return unique.sort();
    }, [visas]);

    const visaTypes = useMemo(() => {
        const unique = [...new Set(visas.map(v => v.visa_type))];
        return unique.sort();
    }, [visas]);

    const filteredVisas = useMemo(() => {
        return visas.filter(visa => {
            const matchesSearch = searchQuery === '' ||
                visa.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
                visa.visa_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                visa.documents?.some(d => d.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesCountry = filterCountry === 'all' || visa.country === filterCountry;
            const matchesType = filterVisaType === 'all' || visa.visa_type === filterVisaType;

            return matchesSearch && matchesCountry && matchesType;
        });
    }, [visas, searchQuery, filterCountry, filterVisaType]);

    const clearFilters = () => {
        setSearchQuery('');
        setFilterCountry('all');
        setFilterVisaType('all');
    };

    const hasActiveFilters = searchQuery !== '' || filterCountry !== 'all' || filterVisaType !== 'all';

    const openAddModal = () => {
        setModalMode('add');
        setFormData({ country: '', visa_type: '', documents: '', processing_time: '' });
        setShowModal(true);
    };

    const openEditModal = (visa) => {
        setModalMode('edit');
        setSelectedVisa(visa);
        setFormData({
            country: visa.country,
            visa_type: visa.visa_type,
            documents: visa.documents?.join(', ') || '',
            processing_time: visa.processing_time || ''
        });
        setShowModal(true);
    };

    const openDeleteModal = (visa) => {
        setModalMode('delete');
        setSelectedVisa(visa);
        setShowModal(true);
    };

    const handleSubmit = async () => {
        const documentsArray = formData.documents.split(',').map(d => d.trim()).filter(d => d);

        if (!formData.country || !formData.visa_type || documentsArray.length === 0) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        const body = {
            country: formData.country,
            visa_type: formData.visa_type,
            documents: documentsArray,
            processing_time: formData.processing_time || undefined
        };

        try {
            if (modalMode === 'add') {
                await api.post('/visa', body);
            } else {
                await api.put(`/visa/${selectedVisa._id}`, body);
            }
            showToast(modalMode === 'add' ? 'Visa requirement added successfully' : 'Visa requirement updated successfully');
            setShowModal(false);
            fetchVisas();
        } catch (err) {
            showToast('Failed to save visa requirement', 'error');
        }
    };

    const handleDelete = async () => {
        try {
            await api.del(`/visa/${selectedVisa._id}`);
            showToast('Visa requirement deleted successfully');
            setShowModal(false);
            fetchVisas();
        } catch (err) {
            showToast('Failed to delete visa requirement', 'error');
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased min-h-screen">
            {toast && (
                <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
                    toast.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'
                } text-white font-medium`}>
                    {toast.message}
                </div>
            )}

            <div className="flex h-screen overflow-hidden">
                <aside className="w-72 bg-primary/5 backdrop-blur-sm border-r border-slate-800 flex flex-col z-20">
                    <div className="p-6 mb-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-slate-900">
                            <span className="material-symbols-outlined font-bold">travel_explore</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-slate-100">VisaAdmin</h1>
                            <p className="text-xs text-primary font-medium uppercase tracking-widest">Management</p>
                        </div>
                    </div>
                    <nav className="flex-1 px-4 space-y-1">
                        <Link className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white transition-all group" to={ROUTES.ADMIN_DASHBOARD}>
                            <span className="material-symbols-outlined text-xl">dashboard</span>
                            <span className="font-medium">{L.DASHBOARD}</span>
                        </Link>
                        <Link className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-[0_4px_14px_0_rgba(13,204,242,0.1)] transition-all" to={ROUTES.KNOWLEDGE_MGMT}>
                            <span className="material-symbols-outlined text-xl">database</span>
                            <span className="font-medium text-slate-100">Knowledge Base</span>
                        </Link>
                        <Link className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white transition-all" to="/">
                            <span className="material-symbols-outlined text-xl">group</span>
                            <span className="font-medium">User Management</span>
                        </Link>
                        <Link className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white transition-all" to={ROUTES.ACTIVITY_LOGS}>
                            <span className="material-symbols-outlined text-xl">receipt_long</span>
                            <span className="font-medium">Logs & Audits</span>
                        </Link>
                        <div className="pt-4 pb-2 px-4">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System</p>
                        </div>
                        <Link className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white transition-all" to="/">
                            <span className="material-symbols-outlined text-xl">settings</span>
                            <span className="font-medium">{L.SETTINGS}</span>
                        </Link>
                        <Link className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white transition-all" to="/">
                            <span className="material-symbols-outlined text-xl">help</span>
                            <span className="font-medium">{L.SUPPORT}</span>
                        </Link>
                    </nav>
                    <div className="p-6 border-t border-slate-800">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-slate-800">
                                <img alt="User Avatar" className="w-full h-full object-cover" src="https://i.pravatar.cc/150?u=VisaKnowledgeManagement" />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-semibold truncate">Admin User</p>
                                <p className="text-xs text-slate-500 truncate">Administrator</p>
                            </div>
                            <span onClick={() => { localStorage.removeItem('access_token'); window.location.href = '/login'; }} className="material-symbols-outlined text-slate-500 ml-auto cursor-pointer hover:text-primary">logout</span>
                        </div>
                    </div>
                </aside>
                <main className="flex-1 flex flex-col overflow-y-auto">
                    <header className="h-20 border-b border-slate-800 flex items-center justify-between px-8 sticky top-0 bg-background-dark/80 backdrop-blur-md z-10">
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-bold">Knowledge Management</h2>
                            <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20">LIVE DATA</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
                                <span className="material-symbols-outlined text-sm">notifications</span>
                                <span className="text-xs font-semibold">{visas.length} Requirements</span>
                            </div>
                            <Button variant="primary" icon="add" onClick={openAddModal}>New Requirement</Button>
                        </div>
                    </header>
                    <div className="p-8 space-y-8 max-w-[1600px] mx-auto w-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white/5 backdrop-blur-sm border border-white/5 p-6 rounded-2xl hover:bg-white/10 hover:border-primary/30 transition-all duration-200">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 rounded-xl bg-primary/10 text-primary">
                                        <span className="material-symbols-outlined text-2xl">description</span>
                                    </div>
                                </div>
                                <p className="text-slate-400 text-sm font-medium">Total Requirements</p>
                                <h3 className="text-3xl font-bold mt-1">{loading ? "..." : visas.length}</h3>
                            </div>
                            <div className="bg-white/5 backdrop-blur-sm border border-white/5 p-6 rounded-2xl hover:bg-white/10 hover:border-primary/30 transition-all duration-200">
                                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                                    <span className="material-symbols-outlined text-2xl">public</span>
                                </div>
                                <p className="text-slate-400 text-sm font-medium mt-4">Countries Covered</p>
                                <h3 className="text-3xl font-bold mt-1">{loading ? "..." : countries.length}</h3>
                            </div>
                            <div className="bg-white/5 backdrop-blur-sm border border-white/5 p-6 rounded-2xl hover:bg-white/10 hover:border-primary/30 transition-all duration-200">
                                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                                    <span className="material-symbols-outlined text-2xl">category</span>
                                </div>
                                <p className="text-slate-400 text-sm font-medium mt-4">Visa Types</p>
                                <h3 className="text-3xl font-bold mt-1">{loading ? "..." : visaTypes.length}</h3>
                            </div>
                            <div className="bg-white/5 backdrop-blur-sm border border-white/5 p-6 rounded-2xl border-l-4 border-l-emerald-500/50 hover:bg-white/10 hover:border-primary/30 transition-all duration-200">
                                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                                    <span className="material-symbols-outlined text-2xl">analytics</span>
                                </div>
                                <p className="text-slate-400 text-sm font-medium mt-4">Data Source Health</p>
                                <h3 className="text-3xl font-bold mt-1">99.9%</h3>
                            </div>
                        </div>
                        <div className="bg-primary/5 backdrop-blur-sm border border-white/5 p-4 rounded-2xl flex flex-col lg:flex-row gap-4">
                            <div className="relative flex-1">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                                <input
                                    className="w-full bg-slate-900/50 border-slate-700 rounded-xl pl-12 pr-4 py-3 text-slate-100 placeholder:text-slate-500 focus:ring-primary focus:border-primary"
                                    placeholder="Search by country, visa type, or keyword..."
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-4 flex-wrap">
                                <select className="bg-slate-900/50 border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-300 focus:ring-primary min-w-[160px]" value={filterCountry} onChange={(e) => setFilterCountry(e.target.value)}>
                                    <option value="all">All Countries</option>
                                    {countries.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <select className="bg-slate-900/50 border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-300 focus:ring-primary min-w-[160px]" value={filterVisaType} onChange={(e) => setFilterVisaType(e.target.value)}>
                                    <option value="all">All Visa Types</option>
                                    {visaTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                {hasActiveFilters && (
                                    <Button variant="ghost" icon="clear" onClick={clearFilters} className="bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-100 px-4 py-3 rounded-xl">
                                        Clear Filters
                                    </Button>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                            {filteredVisas.map((visa, idx) => (
                                <div key={visa._id || idx} className="bg-white/5 backdrop-blur-sm border border-white/5 hover:bg-white/10 hover:border-primary/30 transition-all duration-200 rounded-2xl overflow-hidden flex flex-col">
                                    <div className="h-24 relative bg-gradient-to-br from-primary/20 to-transparent flex items-center justify-center">
                                        <span className="text-5xl">{visa.country === 'USA' ? '🇺🇸' : visa.country === 'UK' ? '🇬🇧' : '🌍'}</span>
                                        <div className="absolute top-4 right-4 bg-background-dark/80 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-primary uppercase tracking-wider">{visa.country}</div>
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="text-lg font-bold truncate pr-3">{visa.country}</h4>
                                            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 whitespace-nowrap">{visa.visa_type}</span>
                                        </div>
                                        <p className="text-slate-400 text-sm mb-4 line-clamp-2 leading-relaxed">
                                            {visa.documents?.join(', ')}
                                        </p>
                                        <div className="mt-auto space-y-3">
                                            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                                                    {visa.processing_time || "N/A"}
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Button variant="ghost" icon="edit" onClick={() => openEditModal(visa)} className="bg-slate-800 hover:bg-slate-700 text-slate-300">
                                                    {L.EDIT}
                                                </Button>
                                                <Button variant="danger" icon="delete" onClick={() => openDeleteModal(visa)} className="bg-slate-800 hover:bg-rose-900/40 hover:text-rose-400 text-slate-300">
                                                    {L.DELETE}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {filteredVisas.length === 0 && !loading && (
                                <div className="col-span-full text-center py-12 text-slate-500">
                                    <span className="material-symbols-outlined text-4xl mb-4 opacity-50">search_off</span>
                                    <p className="text-lg">No visa requirements found</p>
                                    {hasActiveFilters && <p className="text-sm mt-2">Try adjusting your search or filters</p>}
                                </div>
                            )}
                            <div onClick={openAddModal} className="border-2 border-dashed border-slate-800 hover:border-primary/50 hover:bg-primary/5 rounded-2xl flex flex-col items-center justify-center p-8 transition-all group cursor-pointer min-h-[280px]">
                                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-primary group-hover:text-background-dark transition-all">
                                    <span className="material-symbols-outlined text-3xl">add</span>
                                </div>
                                <p className="mt-4 font-bold text-slate-400 group-hover:text-primary transition-all">Add New Requirement</p>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                            <h3 className="text-xl font-bold">
                                {modalMode === 'add' && 'Add New Visa Requirement'}
                                {modalMode === 'edit' && 'Edit Visa Requirement'}
                                {modalMode === 'delete' && 'Delete Visa Requirement'}
                            </h3>
                            <Button variant="icon" icon="close" onClick={() => setShowModal(false)} />
                        </div>
                        <div className="p-6">
                            {modalMode === 'delete' ? (
                                <div className="text-center">
                                    <p className="text-slate-300 mb-6">Are you sure you want to delete <strong className="text-white">{selectedVisa?.country} - {selectedVisa?.visa_type}</strong>? This action cannot be undone.</p>
                                    <div className="flex gap-4 justify-center">
                                        <Button variant="ghost" onClick={() => setShowModal(false)} className="px-6 py-2 rounded-lg bg-slate-700 hover:bg-slate-600">{L.CANCEL}</Button>
                                        <Button variant="danger" onClick={handleDelete} className="px-6 py-2 rounded-lg">{L.DELETE}</Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">Country *</label>
                                        <input type="text" value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500" placeholder="e.g., USA" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">Visa Type *</label>
                                        <input type="text" value={formData.visa_type} onChange={(e) => setFormData({...formData, visa_type: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500" placeholder="e.g., tourist" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">Required Documents * (comma-separated)</label>
                                        <input type="text" value={formData.documents} onChange={(e) => setFormData({...formData, documents: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500" placeholder="passport, photo, application" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">Processing Time</label>
                                        <input type="text" value={formData.processing_time} onChange={(e) => setFormData({...formData, processing_time: e.target.value})} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder:text-slate-500" placeholder="e.g., 3-5 weeks" />
                                    </div>
                                    <div className="flex gap-4 justify-end pt-4">
                                        <Button variant="ghost" onClick={() => setShowModal(false)} className="px-6 py-2 rounded-lg bg-slate-700 hover:bg-slate-600">{L.CANCEL}</Button>
                                        <Button variant="primary" onClick={handleSubmit} className="px-6 py-2 rounded-lg">
                                            {modalMode === 'add' ? 'Add Requirement' : L.SAVE}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VisaKnowledgeManagement;
