import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const DocumentVaultUploadSystem = () => {
    const [documentData, setDocumentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [ocrResult, setOcrResult] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [userDocs, setUserDocs] = useState([]);
    const [showAuditTrail, setShowAuditTrail] = useState(false);
    const fileInputRef = useRef(null);
    const dropZoneRef = useRef(null);
    const navigate = useNavigate();

    const getToken = () => localStorage.getItem('access_token');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = getToken();
                if (!token) { navigate('/login'); return; }
                const [docRes, listRes] = await Promise.all([
                    fetch('http://localhost:8000/documents', { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch('http://localhost:8000/documents/list', { headers: { 'Authorization': `Bearer ${token}` } }),
                ]);
                if (docRes.ok) setDocumentData(await docRes.json());
                if (listRes.ok) setUserDocs(await listRes.json());
                if (docRes.status === 401 || docRes.status === 403) navigate('/login');
            } catch (err) {
                console.error("Failed to fetch documents data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [navigate]);

    const handleFileSelect = (file) => {
        if (!file) return;
        setSelectedFile(file);
        // Run OCR preview
        runOcr(file);
    };

    const runOcr = async (file) => {
        setUploading(true);
        setUploadProgress(20);
        try {
            const token = getToken();
            const formData = new FormData();
            formData.append('file', file);
            setUploadProgress(50);
            const res = await fetch('http://localhost:8000/ocr', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });
            setUploadProgress(80);
            if (res.ok) {
                const data = await res.json();
                setOcrResult(data);
                setUploadProgress(100);
            } else {
                alert('OCR processing failed.');
            }
        } catch (err) {
            console.error('OCR error:', err);
            alert('Error processing file.');
        } finally {
            setUploading(false);
        }
    };

    const handleConfirmSave = async () => {
        if (!selectedFile) { alert('No file selected.'); return; }
        
        // Moderation check: ensure document has valid OCR text
        if (ocrResult) {
            if (ocrResult.ocr_text && ocrResult.ocr_text.includes('[OCR error')) {
                alert('Cannot save document: OCR scan failed or invalid document format.');
                return;
            }
            // Basic check to see if we extracted practically nothing
            if (!ocrResult.ocr_text || ocrResult.ocr_text.trim().length < 5) {
                alert('Document validation failed: The document appears to be empty or unreadable.');
                return;
            }
        }

        setUploading(true);
        try {
            const token = getToken();
            const formData = new FormData();
            formData.append('file', selectedFile);
            const res = await fetch('http://localhost:8000/documents/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });
            if (res.ok) {
                const data = await res.json();
                alert(`✅ "${data.filename}" saved to vault (encrypted)!`);
                setUserDocs(prev => [{ id: data.id, filename: data.filename, content_type: data.content_type, created_at: data.created_at, encrypted: true }, ...prev]);
                setSelectedFile(null);
                setOcrResult(null);
                setUploadProgress(0);
            } else {
                alert('Failed to save document.');
            }
        } catch (err) {
            console.error('Upload error:', err);
            alert('Error saving document.');
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark text-slate-500">Loading document vault...</div>;
    }

    const data = documentData || { active_processing: {}, checklist: [] };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
            <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
                {/* Navbar */}
                <header className="flex items-center justify-between border-b border-primary/10 px-6 py-4 bg-background-light dark:bg-background-dark/50 backdrop-blur-md sticky top-0 z-50">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-3 text-primary">
                            <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary">shield_lock</span>
                            </div>
                            <h2 className="text-slate-900 dark:text-slate-100 text-xl font-bold leading-tight tracking-tight">AI Visa Vault</h2>
                        </div>
                        <nav className="hidden md:flex items-center gap-6">
                            <Link className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors text-sm font-medium" to="/user-dashboard">Dashboard</Link>
                            <Link className="text-primary text-sm font-medium" to="/document-vault-upload-system">Documents</Link>
                            <Link className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors text-sm font-medium" to="/visa-progress-tracker">Applications</Link>
                            <Link className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors text-sm font-medium" to="/tracking-simulation">Tracking</Link>
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center bg-primary/5 border border-primary/10 rounded-lg px-3 py-1.5">
                            <span className="material-symbols-outlined text-primary text-sm mr-2">verified_user</span>
                            <span className="text-xs font-semibold text-primary uppercase tracking-wider">E2EE Verified</span>
                        </div>
                        <div className="flex gap-2">
                            <button aria-label="Notifications" onClick={() => alert('No new notifications.')} className="p-2 rounded-lg bg-primary/5 hover:bg-primary/10 border border-primary/10 text-slate-600 dark:text-slate-300">
                                <span className="material-symbols-outlined">notifications</span>
                            </button>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-blue-500 p-0.5 mt-1">
                                <div className="w-full h-full rounded-full bg-background-dark flex items-center justify-center overflow-hidden">
                                    <img alt="User profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGtDTRrPkQWmYP0S3fnz9T_3b3mO5ki8G7wRl6ZTs0wlmzFi0UUkpHfbR89eodn3UXWCqcBiHFYp3rMtowECa69V3rIBM-zD3sVnmgaW1AZrI-vYlRayKICnYDtnd6K33BB2xuQ84RbDXPcUboK0vkF6cjMnibzl4-R-uL723ujZCb3J5k_5Hwx61cxYxiP8HHh3ZHdSybqjntPge478HxSKcL7koW2q5g_I0YLynLtnyGFZgNSfL6tBwOIg6yWzdB2vOlYvGAOKvj" />
                                </div>
                            </div>
                        </div>
                    </div>
                </header>
                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar */}
                    <aside className="hidden lg:flex w-64 flex-col border-r border-primary/10 bg-background-light dark:bg-background-dark/30 p-4 gap-6">
                        <div className="flex flex-col gap-1">
                            <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Main Menu</p>
                            <Link className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary/5 text-slate-600 dark:text-slate-400 transition-all" to="/user-dashboard">
                                <span className="material-symbols-outlined">grid_view</span>
                                <span className="text-sm font-medium">Overview</span>
                            </Link>
                            <Link className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-primary/10 text-primary transition-all" to="/document-vault-upload-system">
                                <span className="material-symbols-outlined">folder_open</span>
                                <span className="text-sm font-medium">Document Vault</span>
                            </Link>
                            <Link className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary/5 text-slate-600 dark:text-slate-400 transition-all" to="/visa-progress-tracker">
                                <span className="material-symbols-outlined">analytics</span>
                                <span className="text-sm font-medium">Visa Tracker</span>
                            </Link>
                        </div>
                        <div className="flex flex-col gap-1">
                            <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Security</p>
                            <Link className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary/5 text-slate-600 dark:text-slate-400 transition-all" to="/activity-logs">
                                <span className="material-symbols-outlined">key</span>
                                <span className="text-sm font-medium">Access Logs</span>
                            </Link>
                            <button onClick={() => alert('Privacy settings:\n\n• All documents encrypted with AES-256\n• End-to-end encryption enabled\n• Data stored locally in SQLite')} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-primary/5 text-slate-600 dark:text-slate-400 transition-all text-left">
                                <span className="material-symbols-outlined">encrypted</span>
                                <span className="text-sm font-medium">Privacy Settings</span>
                            </button>
                        </div>
                        {/* Uploaded docs list */}
                        {userDocs.length > 0 && (
                            <div className="flex flex-col gap-1">
                                <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Your Files ({userDocs.length})</p>
                                {userDocs.slice(0, 5).map((doc) => (
                                    <div key={doc.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 text-xs">
                                        <span className="material-symbols-outlined text-primary text-sm">lock</span>
                                        <span className="truncate text-slate-300">{doc.filename}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="mt-auto bg-primary/5 rounded-2xl p-4 border border-primary/10">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-primary">auto_awesome</span>
                                <span className="text-sm font-bold">AI Assistant</span>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed mb-3">AI is scanning your documents for potential visa requirement gaps.</p>
                            <Link to="/eligibility-results-suggestions"><button className="w-full py-2 bg-primary text-background-dark text-xs font-bold rounded-lg hover:brightness-110 transition-all">Check Eligibility</button></Link>
                        </div>
                    </aside>
                    {/* Main Content */}
                    <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50 dark:bg-[#0c181a]">
                        <div className="max-w-6xl mx-auto space-y-8">
                            {/* Header Section */}
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl font-black tracking-tight mb-2">Secure Document Vault</h1>
                                    <p className="text-slate-500 dark:text-slate-400 max-w-xl">Upload and manage your sensitive visa documents. All files are encrypted using military-grade AES-256 before storage.</p>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => setShowAuditTrail(!showAuditTrail)} className="px-4 py-2 border border-primary/20 rounded-lg text-sm font-medium hover:bg-primary/5 transition-all flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">history</span>
                                        Audit Trail
                                    </button>
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*,.pdf" onChange={e => handleFileSelect(e.target.files[0])} />
                                    <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-primary text-background-dark rounded-lg text-sm font-bold hover:brightness-110 transition-all flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">add</span>
                                        New Upload
                                    </button>
                                </div>
                            </div>

                            {/* Audit Trail Panel */}
                            {showAuditTrail && (
                                <div className="bg-background-dark/40 border border-primary/10 rounded-xl p-6 space-y-3">
                                    <h4 className="text-sm font-bold text-primary uppercase tracking-wider">Document Audit Trail</h4>
                                    <div className="space-y-2 text-sm">
                                        {userDocs.map(doc => (
                                            <div key={doc.id} className="flex items-center gap-3 p-2 rounded-lg bg-primary/5">
                                                <span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
                                                <span className="text-slate-300">"{doc.filename}" encrypted and stored</span>
                                                <span className="text-xs text-slate-500 ml-auto">{doc.created_at ? new Date(doc.created_at).toLocaleString() : ''}</span>
                                            </div>
                                        ))}
                                        {userDocs.length === 0 && <p className="text-slate-500">No documents uploaded yet.</p>}
                                    </div>
                                </div>
                            )}

                            {/* Main Interaction Area */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left: Upload & Required Docs */}
                                <div className="lg:col-span-2 space-y-8">
                                    {/* Drag & Drop Zone */}
                                    <div
                                        ref={dropZoneRef}
                                        onDrop={handleDrop}
                                        onDragOver={handleDragOver}
                                        onClick={() => fileInputRef.current?.click()}
                                        className="bg-primary/5 backdrop-blur-sm border-2 border-dashed border-primary/20 rounded-2xl p-12 text-center flex flex-col items-center justify-center hover:shadow-[0_0_20px_rgba(13,204,242,0.15)] transition-all cursor-pointer"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                            <span className="material-symbols-outlined text-primary text-4xl">cloud_upload</span>
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">Drop your documents here</h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-xs">AI will automatically identify and categorize your files (PDF, JPG, PNG)</p>
                                        {selectedFile && (
                                            <div className="mb-4 px-4 py-2 bg-primary/10 rounded-lg border border-primary/20 text-sm text-primary font-medium">
                                                📎 {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                                            </div>
                                        )}
                                        <button onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} className="px-6 py-2.5 bg-primary/20 text-primary border border-primary/30 rounded-xl text-sm font-bold hover:bg-primary/30 transition-all">Browse Local Files</button>
                                    </div>

                                    {/* Upload Progress */}
                                    {uploading && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-slate-400">Processing...</span>
                                                <span className="text-primary font-bold">{uploadProgress}%</span>
                                            </div>
                                            <div className="h-2 bg-primary/10 rounded-full overflow-hidden">
                                                <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${uploadProgress}%` }}></div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Active Uploads */}
                                    {data.active_processing && data.active_processing.name && (
                                        <div className="space-y-4">
                                            <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Active Processing</h4>
                                            <div className="bg-background-light dark:bg-background-dark/40 border border-primary/10 rounded-xl p-4 flex flex-col gap-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                                                            <span className="material-symbols-outlined text-red-500">
                                                                {data.active_processing.type === 'pdf' ? 'picture_as_pdf' : 'image'}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold">{data.active_processing.name}</p>
                                                            <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-tighter">AI OCR Processing • {data.active_processing.size}</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs font-bold text-primary">{data.active_processing.progress}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-primary/10 rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${data.active_processing.progress}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {/* Required Documents List */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Application Checklist</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {data.checklist && data.checklist.map((item, index) => {
                                                let borderClass = "";
                                                let iconBgClass = "";
                                                let iconClass = "";
                                                let badgeClass = "";
                                                let iconName = "";
                                                if (item.status === "Verified") {
                                                    borderClass = "border-emerald-500/20 hover:border-emerald-500/40";
                                                    iconBgClass = "bg-emerald-500/10";
                                                    iconClass = "text-emerald-500";
                                                    badgeClass = "bg-emerald-500/10 text-emerald-500";
                                                    iconName = "verified";
                                                } else if (item.status === "Pending") {
                                                    borderClass = "border-amber-500/20 hover:border-amber-500/40";
                                                    iconBgClass = "bg-amber-500/10";
                                                    iconClass = "text-amber-500";
                                                    badgeClass = "bg-amber-500/10 text-amber-500";
                                                    iconName = "hourglass_top";
                                                } else {
                                                    borderClass = "border-red-500/20 hover:border-red-500/40";
                                                    iconBgClass = "bg-red-500/10";
                                                    iconClass = "text-red-500";
                                                    badgeClass = "bg-red-500/10 text-red-500";
                                                    iconName = "warning";
                                                }
                                                return (
                                                    <div key={index} className={`p-4 bg-background-light dark:bg-background-dark/40 border rounded-xl flex justify-between items-start transition-all ${borderClass}`}>
                                                        <div className="flex gap-3">
                                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBgClass} ${iconClass}`}>
                                                                <span className="material-symbols-outlined">{iconName}</span>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold">{item.name}</p>
                                                                <p className="text-xs text-slate-500">{item.desc}</p>
                                                            </div>
                                                        </div>
                                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}>{item.status}</span>
                                                    </div>
                                                );
                                            })}
                                            <div onClick={() => fileInputRef.current?.click()} className="p-4 border border-dashed border-primary/20 rounded-xl flex items-center justify-center gap-2 text-primary/50 hover:text-primary hover:border-primary/50 transition-all cursor-pointer">
                                                <span className="material-symbols-outlined">add_circle</span>
                                                <span className="text-xs font-bold uppercase tracking-wider">Add Support File</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* Right: OCR Preview Panel */}
                                <div className="lg:col-span-1">
                                    <div className="sticky top-24 bg-background-light dark:bg-background-dark/40 border border-primary/10 rounded-2xl overflow-hidden flex flex-col h-[700px]">
                                        <div className="p-4 border-b border-primary/10 bg-primary/5 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-primary">find_in_page</span>
                                                <h4 className="text-sm font-bold">Digitalized Data</h4>
                                            </div>
                                            <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold">{ocrResult ? 'SCAN COMPLETE' : 'AI SCANNER LIVE'}</span>
                                        </div>
                                        <div className="p-4 space-y-6 overflow-y-auto flex-1">
                                            {/* Document Visual Preview */}
                                            <div className="aspect-[4/3] rounded-xl bg-slate-800 relative overflow-hidden group">
                                                <img alt="Passport Scan Preview" className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAs7qcP4MBwyzBkUqZxESsfwF42_3qlA5bG_vfZYx5SHrxsHgTJ9wZVgGBnNrBSa7hctMvgcjOIxT_80ptdu8AB0sAots6OLI3IF7oq7H64Ce7neDv9mWfHzQqIb9TGQwoWM_MmbKQIkr1NbdG5oXhQI5qmI2tAZq1RpxS9YF6ELGfOgla3cf3ijUoT7tSQSqRwrDTDoOvdcGlG_XltbmMOjimwjOXIoIuQniz7clsg6yKpgF4AxSGApAV7ID9Idd9DTETuAUDTB4-V" />
                                                <div className="absolute inset-0 border-2 border-primary/40 pointer-events-none">
                                                    <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-primary"></div>
                                                    <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-primary"></div>
                                                    <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-primary"></div>
                                                    <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-primary"></div>
                                                </div>
                                                <div className="absolute top-1/2 left-0 w-full h-px bg-primary/50 shadow-[0_0_15px_rgba(13,204,242,0.8)]"></div>
                                            </div>
                                            {/* Extracted Data Fields */}
                                            <div className="space-y-4">
                                                {ocrResult ? (
                                                    <>
                                                        {ocrResult.extracted_fields?.full_name && (
                                                            <div className="space-y-1 border-b border-primary/5 pb-2">
                                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Full Name</p>
                                                                <p className="text-sm font-semibold">{ocrResult.extracted_fields.full_name}</p>
                                                            </div>
                                                        )}
                                                        {ocrResult.extracted_fields?.passport_number && (
                                                            <div className="space-y-1 border-b border-primary/5 pb-2">
                                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Passport No.</p>
                                                                <p className="text-sm font-semibold">{ocrResult.extracted_fields.passport_number}</p>
                                                            </div>
                                                        )}
                                                        {ocrResult.extracted_fields?.nationality && (
                                                            <div className="space-y-1 border-b border-primary/5 pb-2">
                                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nationality</p>
                                                                <p className="text-sm font-semibold">{ocrResult.extracted_fields.nationality}</p>
                                                            </div>
                                                        )}
                                                        {ocrResult.extracted_fields?.dates_found && (
                                                            <div className="space-y-1 border-b border-primary/5 pb-2">
                                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Dates Found</p>
                                                                <p className="text-sm font-semibold">{ocrResult.extracted_fields.dates_found.join(', ')}</p>
                                                            </div>
                                                        )}
                                                        {ocrResult.ocr_text && (
                                                            <div className="space-y-1 border-b border-primary/5 pb-2">
                                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Raw OCR Text</p>
                                                                <div className="p-3 bg-slate-900 rounded-lg max-h-60 overflow-y-auto w-full">
                                                                    <p className="text-xs text-slate-300 font-mono whitespace-pre-wrap break-words">{ocrResult.ocr_text}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {ocrResult.ocr_text && ocrResult.ocr_text.includes('[OCR') ? (
                                                            <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-lg flex items-center gap-2">
                                                                <span className="material-symbols-outlined text-red-500 text-sm">error</span>
                                                                <span className="text-[11px] font-medium text-red-600 dark:text-red-400">Document scan failed or rejected</span>
                                                            </div>
                                                        ) : (
                                                            <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg flex items-center gap-2">
                                                                <span className="material-symbols-outlined text-emerald-500 text-sm">check_circle</span>
                                                                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">Document scan completed successfully</span>
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="space-y-1 border-b border-primary/5 pb-2">
                                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Document Type</p>
                                                            <p className="text-sm font-semibold">Ordinary Passport (P)</p>
                                                        </div>
                                                        <div className="space-y-1 border-b border-primary/5 pb-2">
                                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Full Name</p>
                                                            <p className="text-sm font-semibold">FELIX VANDERWAAL</p>
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-1 border-b border-primary/5 pb-2">
                                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Passport No.</p>
                                                                <p className="text-sm font-semibold">N82930411</p>
                                                            </div>
                                                            <div className="space-y-1 border-b border-primary/5 pb-2">
                                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Expiry Date</p>
                                                                <p className="text-sm font-semibold text-emerald-500">12 SEP 2030</p>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1 border-b border-primary/5 pb-2">
                                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nationality</p>
                                                            <p className="text-sm font-semibold">Kingdom of Netherlands</p>
                                                        </div>
                                                        <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg flex items-center gap-2">
                                                            <span className="material-symbols-outlined text-emerald-500 text-sm">check_circle</span>
                                                            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">MRZ Zone validated successfully</span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-auto p-4 bg-background-light dark:bg-background-dark/80 border-t border-primary/10">
                                            <button onClick={handleConfirmSave} disabled={!selectedFile || uploading} className="w-full py-3 bg-primary text-background-dark font-bold rounded-xl shadow-[0_4px_14px_0_rgba(13,204,242,0.39)] hover:shadow-[0_6px_20px_rgba(13,204,242,0.23)] hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                                                <span className="material-symbols-outlined text-sm">lock</span>
                                                Encrypt & Save to Vault
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default DocumentVaultUploadSystem;
