import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { L } from '../config/labels';
import { ROUTES } from '../config/routes';

const STATUS_CONFIG = {
    not_uploaded: { label: 'Not Uploaded', color: 'text-slate-500 bg-slate-500/10 border-slate-500/20' },
    uploaded: { label: 'Uploaded', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    pending_review: { label: 'Pending Review', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    approved: { label: 'Approved', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    rejected: { label: 'Rejected', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
};

const DocumentVaultUploadSystem = () => {
    const [docTypes, setDocTypes] = useState([]);
    const [myDocs, setMyDocs] = useState([]);
    const [statusSummary, setStatusSummary] = useState({});
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedDocType, setSelectedDocType] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [ocrResult, setOcrResult] = useState(null);
    const fileInputRef = useRef(null);

    const fetchData = async () => {
        try {
            const [typesRes, mydocsRes] = await Promise.all([
                api.get('/documents/types'),
                api.get('/documents/mydocs'),
            ]);
            setDocTypes(typesRes.document_types || []);
            setMyDocs(mydocsRes.documents || []);
            setStatusSummary(mydocsRes.status_summary || {});
        } catch (err) {
            console.error('Failed to load document data:', err);
            setError('Failed to load document data. Please ensure the backend server is running.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleFileSelect = (file) => {
        console.log('File selected:', file?.name, file?.type, file?.size);
        if (!file) return;
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
        const ext = '.' + file.name.split('.').pop().toLowerCase();
        
        if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(ext)) {
            setError('Only PDF, JPG, and PNG files are accepted.');
            return;
        }
        
        if (file.size > 20 * 1024 * 1024) {
            setError('File size must be less than 20MB.');
            return;
        }
        
        setSelectedFile(file);
        setOcrResult(null);
        setError('');
    };

    const triggerFileInput = () => {
        console.log('Browse Files clicked');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
            fileInputRef.current.click();
        }
    };

    const handleConfirmSave = async () => {
        if (!selectedFile || !selectedDocType) {
            setError(selectedDocType ? 'No file selected.' : 'Please select a document type.');
            return;
        }
        setUploading(true);
        setError('');
        setSuccess('');
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('document_type', selectedDocType);
            const response = await api.upload('/documents/upload', formData);
            setSuccess(`${selectedFile.name} uploaded successfully`);
            setOcrResult(response);
            fetchData();
        } catch (err) {
            console.error('Upload error:', err);
            const message = err.detail || err.message || 'Upload failed. Please try again.';
            setError(`Upload failed: ${message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteDoc = async (id) => {
        if (!window.confirm('Delete this document?')) return;
        try {
            await api.del(`/documents/${id}`);
            setSuccess('Document deleted');
            fetchData();
        } catch (err) {
            setError('Network error.');
        }
    };

    const clearSelection = () => {
        setSelectedFile(null);
        setOcrResult(null);
        setSelectedDocType('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const getStatusBadge = (docType) => {
        const s = statusSummary[docType]?.status || 'not_uploaded';
        const cfg = STATUS_CONFIG[s] || STATUS_CONFIG.not_uploaded;
        return <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${cfg.color}`}>{cfg.label}</span>;
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark text-slate-500 animate-pulse">Loading document vault...</div>;
    }

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display min-h-screen">
            <header className="flex items-center justify-between border-b border-primary/10 px-6 py-4 bg-background-light dark:bg-background-dark/50 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3 text-primary">
                        <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center"><span className="material-symbols-outlined text-primary">shield_lock</span></div>
                        <h2 className="text-slate-900 dark:text-slate-100 text-xl font-bold">AI Visa Vault</h2>
                    </div>
                    <nav className="hidden md:flex items-center gap-6">
                        <Link className="text-slate-600 dark:text-slate-400 hover:text-primary text-sm font-medium transition-colors" to={ROUTES.USER_DASHBOARD}>{L.DASHBOARD}</Link>
                        <Link className="text-primary text-sm font-medium" to={ROUTES.DOCUMENT_VAULT}>{L.DOCUMENTS}</Link>
                        <Link className="text-slate-600 dark:text-slate-400 hover:text-primary text-sm font-medium transition-colors" to={ROUTES.PROGRESS_TRACKER}>{L.APPLICATIONS}</Link>
                    </nav>
                </div>
            </header>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm flex items-start gap-3 mx-6 mt-4">
                    <span className="material-symbols-outlined text-lg shrink-0">error</span><span>{error}</span>
                    <button onClick={() => setError('')} className="ml-auto text-red-400/70 hover:text-red-400"><span className="material-symbols-outlined text-lg">close</span></button>
                </div>
            )}
            {success && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 text-emerald-400 text-sm flex items-start gap-3 mx-6 mt-4">
                    <span className="material-symbols-outlined text-lg shrink-0">check_circle</span><span>{success}</span>
                    <button onClick={() => setSuccess('')} className="ml-auto text-emerald-400/70 hover:text-emerald-400"><span className="material-symbols-outlined text-lg">close</span></button>
                </div>
            )}

            <main className="p-6 md:p-8 max-w-6xl mx-auto">
                <h1 className="text-3xl font-black mb-2">{L.DOCUMENT_VAULT}</h1>
                <p className="text-slate-400 mb-8">Upload and manage your visa documents. All files are encrypted with AES-256.</p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-primary/5 border-2 border-dashed border-primary/20 rounded-2xl p-8 text-center hover:shadow-[0_0_20px_rgba(13,204,242,0.15)] transition-all">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4"><span className="material-symbols-outlined text-primary text-4xl">cloud_upload</span></div>
                            <h3 className="text-xl font-bold mb-2">Drop your documents here</h3>
                            <p className="text-slate-500 text-sm mb-4">PDF, JPG, PNG accepted</p>
                            {selectedFile && <p className="text-sm text-primary font-medium mb-4">Selected: {selectedFile.name}</p>}
                            <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.jpg,.jpeg,.png,image/*" onChange={(e) => { console.log('File input changed', e.target.files); if (e.target.files && e.target.files[0]) handleFileSelect(e.target.files[0]); }} />
                            <button type="button" onClick={triggerFileInput} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 cursor-pointer transition-all">
                                Browse Files
                            </button>
                        </div>

                        <div className="bg-background-dark/40 rounded-2xl border border-primary/10 p-6">
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Upload Document</h4>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <select value={selectedDocType} onChange={(e) => setSelectedDocType(e.target.value)} className="flex-1 bg-background-dark border border-slate-700 rounded-lg py-3 px-4 text-slate-200 focus:border-primary focus:ring-0 outline-none transition-all">
                                    <option value="">Select document type...</option>
                                    {docTypes.map((dt) => (
                                        <option key={dt.name} value={dt.name}>{dt.label}</option>
                                    ))}
                                </select>
                                <button type="button" onClick={handleConfirmSave} disabled={!selectedFile || !selectedDocType || uploading} className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm rounded-xl font-bold cursor-pointer transition-all ${(!selectedFile || !selectedDocType || uploading) ? 'bg-primary/20 text-primary/50 cursor-not-allowed' : 'bg-primary text-background-dark hover:shadow-[0_6px_20px_rgba(13,204,242,0.23)]'}`}>
                                    <span className="material-symbols-outlined">lock</span>
                                    {uploading ? 'Uploading...' : 'Encrypt & Upload'}
                                </button>
                            </div>
                            {selectedFile && (
                                <button type="button" onClick={clearSelection} className="mt-3 text-xs text-slate-500 hover:text-red-400 transition-colors">Clear selection</button>
                            )}
                        </div>

                        <div>
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Required Documents</h4>
                            {docTypes.length === 0 ? (
                                <p className="text-slate-500 text-sm">No document types found. Select a visa type to see requirements.</p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {docTypes.map((dt) => (
                                        <div key={dt.name} className="p-4 bg-background-dark/40 border border-slate-700/50 rounded-xl flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="material-symbols-outlined text-primary">description</span>
                                                <div>
                                                    <p className="text-sm font-bold">{dt.label}</p>
                                                    {dt.description && <p className="text-[10px] text-slate-500">{dt.description}</p>}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">{getStatusBadge(dt.name)}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {myDocs.length > 0 && (
                            <div>
                                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Uploaded Documents ({myDocs.length})</h4>
                                <div className="space-y-3">
                                    {myDocs.filter(d => d.status !== 'deleted').map((doc) => {
                                        const s = statusSummary[doc.document_type]?.status || doc.status;
                                        const isVerified = s === 'approved';
                                        const isRejected = s === 'rejected';
                                        return (
                                            <div key={doc.id} className="p-4 bg-background-dark/40 border border-slate-700/50 rounded-xl flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className={`material-symbols-outlined ${isVerified ? 'text-emerald-400' : isRejected ? 'text-red-400' : 'text-primary'}`}>{isVerified ? 'check_circle' : isRejected ? 'cancel' : 'lock'}</span>
                                                    <div>
                                                        <p className="text-sm font-bold">{doc.filename}</p>
                                                        <p className="text-[10px] text-slate-500">{doc.document_type} • {new Date(doc.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {getStatusBadge(doc.document_type)}
                                                    <button type="button" onClick={() => handleDeleteDoc(doc.id)} className="p-2 text-slate-400 hover:text-red-400 transition-colors cursor-pointer" title="Delete">
                                                        <span className="material-symbols-outlined text-lg">delete</span>
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-background-dark/40 border border-primary/10 rounded-2xl overflow-hidden flex flex-col h-[700px]">
                        <div className="p-4 border-b border-primary/10 bg-primary/5 flex items-center justify-between">
                            <h4 className="text-sm font-bold">Digitalized Data</h4>
                            <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold">AI SCANNER</span>
                        </div>
                        <div className="p-4 space-y-4 overflow-y-auto flex-1">
                            {ocrResult && (
                                <>
                                    {ocrResult.extracted_fields?.full_name && <Field label="Full Name" value={ocrResult.extracted_fields.full_name} />}
                                    {ocrResult.extracted_fields?.passport_number && <Field label="Passport No." value={ocrResult.extracted_fields.passport_number} />}
                                    {ocrResult.extracted_fields?.nationality && <Field label="Nationality" value={ocrResult.extracted_fields.nationality} />}
                                    {ocrResult.ocr_text && (
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Raw OCR Text</p>
                                            <div className="p-3 bg-slate-900 rounded-lg max-h-40 overflow-y-auto"><p className="text-xs text-slate-300 font-mono whitespace-pre-wrap break-words">{ocrResult.ocr_text}</p></div>
                                        </div>
                                    )}
                                    {!ocrResult.extracted_fields?.full_name && !ocrResult.extracted_fields?.passport_number && !ocrResult.extracted_fields?.nationality && !ocrResult.ocr_text && (
                                        <div className="text-center py-8 text-slate-500">
                                            <p className="text-sm">Document uploaded but no text was extracted.</p>
                                            <p className="text-xs mt-1">This may be a scanned image PDF. Try uploading a text-based PDF or an image file.</p>
                                        </div>
                                    )}
                                </>
                            )}
                            {!ocrResult && (
                                <div className="text-center py-12 text-slate-500">
                                    <span className="material-symbols-outlined text-4xl mb-2 block">find_in_page</span>
                                    <p className="text-sm">Upload a file to preview OCR data</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

const Field = ({ label, value }) => (
    <div className="space-y-1 border-b border-primary/5 pb-2">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
    </div>
);

export default DocumentVaultUploadSystem;
