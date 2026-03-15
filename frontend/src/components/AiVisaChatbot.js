import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AiVisaChatbot = () => {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hello! I'm your dedicated VisaAI assistant. I can help you understand travel requirements, eligibility, and documentation for over 180 countries. What's your next destination?" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const handleSend = async (overrideText) => {
        const textToSend = overrideText || input;
        if (!textToSend.trim()) return;
        if (!overrideText) setInput('');
        setMessages(prev => [...prev, { role: 'user', content: textToSend }]);
        setLoading(true);

        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                navigate('/login');
                return;
            }

            const res = await fetch('http://localhost:8000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ question: textToSend })
            });

            if (res.ok) {
                const data = await res.json();
                setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
            } else if (res.status === 401) {
                navigate('/login');
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error while processing your request." }]);
            }
        } catch (err) {
            console.error(err);
             setMessages(prev => [...prev, { role: 'assistant', content: "Network error. Please try again later." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    const handleChipClick = (text) => {
        handleSend(text);
    };

    const handleAttachFile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setMessages(prev => [...prev, { role: 'user', content: `📎 Uploading: ${file.name}` }]);
        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            if (!token) { navigate('/login'); return; }
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('http://localhost:8000/ocr', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });
            if (res.ok) {
                const data = await res.json();
                
                if (data.ocr_text && data.ocr_text.includes('[OCR error')) {
                    setMessages(prev => [...prev, { role: 'assistant', content: `❌ **Document scan failed for ${data.filename}:**\n\n${data.ocr_text}` }]);
                    return;
                }

                let msg = `📄 **OCR Results for ${data.filename}:**\n\n`;
                if (data.extracted_fields && Object.keys(data.extracted_fields).length > 0) {
                    const fields = data.extracted_fields;
                    if (fields.full_name) msg += `• Name: ${fields.full_name}\n`;
                    if (fields.passport_number) msg += `• Passport: ${fields.passport_number}\n`;
                    if (fields.nationality) msg += `• Nationality: ${fields.nationality}\n`;
                    if (fields.dates_found) msg += `• Dates: ${fields.dates_found.join(', ')}\n`;
                }
                if (data.ocr_text) {
                    msg += `\nExtracted Text:\n${data.ocr_text}`;
                }
                setMessages(prev => [...prev, { role: 'assistant', content: msg }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: "Failed to process the uploaded file." }]);
            }
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'assistant', content: "Error uploading file. Please try again." }]);
        } finally {
            setLoading(false);
            e.target.value = '';
        }
    };

    const handleShare = () => {
        const chatText = messages.map(m => `${m.role === 'user' ? 'You' : 'VisaAI'}: ${m.content}`).join('\n\n');
        navigator.clipboard.writeText(chatText).then(() => {
            alert('Chat copied to clipboard!');
        }).catch(() => {
            alert('Failed to copy chat.');
        });
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased overflow-hidden">
            <div className="flex h-screen w-full overflow-hidden">
                {/* Sidebar */}
                <aside className="w-80 border-r border-slate-200 dark:border-primary/10 flex flex-col bg-background-light dark:bg-background-dark/50 z-20">
                    <div className="p-6 flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-background-dark">
                            <span className="material-symbols-outlined font-bold">travel_explore</span>
                        </div>
                        <h1 className="text-xl font-bold tracking-tight">VisaAI</h1>
                    </div>
                    <div className="px-4 mb-4">
                        <button onClick={() => { setMessages([{ role: 'assistant', content: "Hello! I'm your dedicated VisaAI assistant. What's your next destination?" }]); setInput(''); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-all text-primary font-medium">
                            <span className="material-symbols-outlined text-xl">add_circle</span>
                            New Consultation
                        </button>
                    </div>
                    <nav className="flex-1 overflow-y-auto px-4 space-y-6">
                        <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 px-2">History</h3>
                            <div className="space-y-1">
                                <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/5 text-primary border border-primary/10" to="#!">
                                    <span className="material-symbols-outlined text-xl">chat_bubble</span>
                                    <span className="text-sm truncate">General Visa Requirements</span>
                                </Link>
                                <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-200 dark:hover:bg-primary/5 text-slate-600 dark:text-slate-300 transition-colors" to="#!">
                                    <span className="material-symbols-outlined text-xl">chat_bubble</span>
                                    <span className="text-sm truncate">Schengen Eligibility Check</span>
                                </Link>
                                <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-200 dark:hover:bg-primary/5 text-slate-600 dark:text-slate-300 transition-colors" to="#!">
                                    <span className="material-symbols-outlined text-xl">chat_bubble</span>
                                    <span className="text-sm truncate">US B1/B2 Interview Prep</span>
                                </Link>
                                <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-200 dark:hover:bg-primary/5 text-slate-600 dark:text-slate-300 transition-colors" to="#!">
                                    <span className="material-symbols-outlined text-xl">chat_bubble</span>
                                    <span className="text-sm truncate">Digital Nomad Portugal</span>
                                </Link>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 px-2">Saved Documents</h3>
                            <div className="space-y-1">
                                <Link className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-200 dark:hover:bg-primary/5 text-slate-600 dark:text-slate-300 transition-colors" to="#!">
                                    <span className="material-symbols-outlined text-xl">description</span>
                                    <span className="text-sm">Visa Checklist.pdf</span>
                                </Link>
                            </div>
                        </div>
                        <div className="mt-8">
                            <Link to="/user-dashboard" className="text-xs font-medium text-slate-400 hover:text-primary">&larr; Back to Dashboard</Link>
                        </div>
                    </nav>
                    <div className="p-4 border-t border-slate-200 dark:border-primary/10">
                        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-100 dark:bg-primary/5">
                            <img className="w-10 h-10 rounded-full object-cover" alt="User profile avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDRF1GzJnjIbh-lJcyj-OR0a4il3OEdbwczXBJASqvW5kqO0pG404ru_EBtsFGKcipD6cKSCxhlACKGJczifY-Ar_djTMOahe0VAbLjaa8jB1wo6sCuR35J5kkDYzi28umYwBXK3TndSBGKfunjv1a_b7uZOlcwbzr3iOaF3os0XiopbgA-XzccPFZMmMZtv9GPp9MMLfw9wXhu_oVetkO_uN0SLca_xvJoj4W70dm4oYcWm3HYdu3xcGUYL4v19UXYiQ0Ao03s2CHK" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate">Alex Johnson</p>
                                <p className="text-xs text-slate-500 dark:text-primary/60">Premium Member</p>
                            </div>
                            <span className="material-symbols-outlined text-slate-400 cursor-pointer hover:text-primary">settings</span>
                        </div>
                    </div>
                </aside>
                {/* Main Content Area */}
                <main className="flex-1 flex flex-col relative overflow-hidden">
                    {/* Background Image Decor */}
                    <div className="absolute inset-0 z-0 opacity-20 dark:opacity-40">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(13,204,242,0.1),transparent_50%)]"></div>
                    </div>
                    {/* Top Header */}
                    <header className="h-16 border-b border-slate-200 dark:border-primary/10 flex items-center justify-between px-8 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md z-10">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Consultation:</span>
                            <span className="text-sm font-bold">Standard Tourist Visa</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button onClick={handleShare} className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">
                                <span className="material-symbols-outlined text-lg">share</span>
                                Share
                            </button>
                            <div className="h-4 w-[1px] bg-slate-200 dark:bg-primary/20"></div>
                            <button onClick={() => navigate('/register')} className="bg-primary text-background-dark text-sm font-bold px-4 py-1.5 rounded-lg hover:opacity-90 transition-all">
                                Upgrade
                            </button>
                        </div>
                    </header>
                    {/* Chat Window */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-8 relative z-10 custom-scrollbar">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex gap-4 max-w-3xl ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-800 dark:bg-slate-700' : 'bg-primary'}`}>
                                    <span className={`material-symbols-outlined ${msg.role === 'user' ? 'text-white' : 'text-background-dark'}`}>
                                        {msg.role === 'user' ? 'person' : 'smart_toy'}
                                    </span>
                                </div>
                                <div className={`space-y-2 ${msg.role === 'user' ? 'text-right' : ''}`}>
                                    <div className={`px-5 py-4 shadow-sm ${
                                        msg.role === 'user' 
                                            ? 'bg-slate-200 dark:bg-slate-800 rounded-2xl rounded-tr-none' 
                                            : 'bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 rounded-2xl rounded-tl-none'
                                    }`}>
                                        <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* AI Typing Animation */}
                        {loading && (
                            <div className="flex gap-4 max-w-3xl">
                                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-background-dark">smart_toy</span>
                                </div>
                                <div className="bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20 px-4 py-3 rounded-2xl rounded-tl-none flex gap-1 items-center shadow-sm h-[40px] mt-2">
                                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    {/* Footer & Input */}
                    <footer className="p-8 z-10 relative">
                        {/* Suggested Chips */}
                        <div className="flex flex-wrap gap-2 mb-6 max-w-4xl mx-auto justify-center">
                            <button onClick={() => handleChipClick("What documents do I need for France?")} className="px-4 py-2 rounded-full border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-semibold transition-all">
                                What documents do I need for France?
                            </button>
                            <button onClick={() => handleChipClick("Check my eligibility")} className="px-4 py-2 rounded-full border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-semibold transition-all">
                                Check my eligibility
                            </button>
                            <button onClick={() => handleChipClick("Cost of Tourist Visa")} className="px-4 py-2 rounded-full border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-semibold transition-all">
                                Cost of Tourist Visa
                            </button>
                            <button onClick={() => handleChipClick("Interview tips")} className="px-4 py-2 rounded-full border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-semibold transition-all">
                                Interview tips
                            </button>
                        </div>
                        {/* Input Container */}
                        <div className="max-w-4xl mx-auto bg-background-dark/70 backdrop-blur-xl border border-primary/10 p-2 rounded-2xl shadow-2xl flex items-center gap-2">
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*,.pdf" onChange={handleAttachFile} />
                            <button onClick={() => fileInputRef.current?.click()} className="p-3 text-slate-400 hover:text-primary transition-colors" title="Upload document for OCR">
                                <span className="material-symbols-outlined">attach_file</span>
                            </button>
                            <input 
                                className="flex-1 bg-transparent border-none focus:ring-0 text-slate-200 placeholder:text-slate-500 py-3 text-base" 
                                placeholder="Ask about any visa or travel requirement..." 
                                type="text" 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={loading}
                            />
                            <button className="p-3 text-slate-400 hover:text-slate-600 transition-colors cursor-not-allowed opacity-50" title="Voice input coming soon" disabled>
                                <span className="material-symbols-outlined">mic</span>
                            </button>
                            <button onClick={() => handleSend()} disabled={loading || !input.trim()} className="bg-primary text-background-dark p-3 rounded-xl shadow-[0_0_15px_rgba(13,204,242,0.4)] hover:scale-105 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100">
                                <span className="material-symbols-outlined font-bold">send</span>
                            </button>
                        </div>
                        <div className="mt-4 text-center">
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-medium">
                                Disclaimer: AI-generated info, please verify with official government sources before travel.
                            </p>
                        </div>
                    </footer>
                </main>
            </div>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(13, 204, 242, 0.2); border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default AiVisaChatbot;
