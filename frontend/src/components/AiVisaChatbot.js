import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './ui/Button';
import ProfileIcon from './ui/ProfileIcon';
import { api } from '../services/api';
import { L } from '../config/labels';
import { ROUTES } from '../config/routes';

const stripMarkdown = (text) => {
    return text
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/__(.*?)__/g, '$1')
        .replace(/_(.*?)_/g, '$1')
        .replace(/`(.*?)`/g, '$1')
        .replace(/#{1,6}\s?/g, '')
        .replace(/\[(.*?)\]\(.*?\)/g, '$1');
};

const AiVisaChatbot = () => {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hello! I'm your dedicated VisaAI assistant. I can help you understand travel requirements, eligibility, and documentation for over 180 countries. What's your next destination?" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [suggestionChips, setSuggestionChips] = useState([
        "What documents do I need for France?",
        "Check my eligibility",
        "Cost of Tourist Visa",
        "Interview tips",
    ]);
    const [eligibilityMode, setEligibilityMode] = useState(false);
    const [eligibilityData, setEligibilityData] = useState({
        travel_purpose: '', duration_days: '', country: '',
        nationality: '', has_passport: true, has_prior_visa: false,
        criminal_record: false, has_ties: true
    });
    const [chatSessions, setChatSessions] = useState([]);
    const [activeSessionId, setActiveSessionId] = useState(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    useEffect(() => {
        fetchChatSessions();
        setActiveSessionId(generateSessionId());
    }, []);

    const generateSessionId = () => {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    };

    const fetchChatSessions = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) return;
            const res = await fetch('http://localhost:8000/chat/sessions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setChatSessions(data.sessions || []);
            }
        } catch (err) {
            console.error('Failed to fetch chat sessions:', err);
        }
    };

    const loadChatSession = async (sessionId) => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) return;
            const res = await fetch(`http://localhost:8000/chat/sessions/${sessionId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (data.messages && data.messages.length > 0) {
                    setMessages(data.messages);
                    setActiveSessionId(sessionId);
                    setEligibilityMode(false);
                }
            }
        } catch (err) {
            console.error('Failed to load chat session:', err);
        }
    };

    const startNewChat = () => {
        setMessages([{ role: 'assistant', content: "Hello! I'm your dedicated VisaAI assistant. What's your next destination?" }]);
        setActiveSessionId(generateSessionId());
        setEligibilityMode(false);
        setInput('');
    };

    const handleSend = async (overrideText) => {
        const textToSend = overrideText || input;
        if (!textToSend.trim()) return;
        if (!overrideText) setInput('');

        if (eligibilityMode) {
            const key = Object.keys(eligibilityData).find(k => !eligibilityData[k] && k !== 'has_passport' && k !== 'has_prior_visa' && k !== 'criminal_record' && k !== 'has_ties');
            if (key && textToSend.trim()) {
                const newData = { ...eligibilityData, [key]: textToSend.trim() };
                setEligibilityData(newData);
                if (newData.country && newData.travel_purpose) {
                    setLoading(true);
                    try {
                        const token = localStorage.getItem('access_token');
                        const res = await fetch('http://localhost:8000/eligibility', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({
                                travel_purpose: newData.travel_purpose,
                                duration_days: newData.duration_days ? parseInt(newData.duration_days) : null,
                                country: newData.country,
                                nationality: newData.nationality || null,
                                has_passport: newData.has_passport,
                                has_prior_visa: newData.has_prior_visa,
                                criminal_record: newData.criminal_record,
                                has_ties: newData.has_ties
                            })
                        });
                        if (res.ok) {
                            const data = await res.json();
                            const status = data.eligible ? "✅ PRELIMINARY ELIGIBLE" : "⚠️ PRELIMINARY NOT ELIGIBLE";
                            const response = `${status}\n\nVisa Type: ${data.visa_type}\nConfidence: ${Math.round(data.confidence * 100)}%\n\nRequirements Met:\n${data.requirements_met?.join('\n') || 'None listed'}\n\nRequirements Missing:\n${data.requirements_missing?.join('\n') || 'None'}\n\n${data.notes ? `Notes: ${data.notes}` : ''}`;
                            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
                        } else {
                            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error while checking your eligibility." }]);
                        }
                    } catch (err) {
                        setMessages(prev => [...prev, { role: 'assistant', content: "Network error. Please try again later." }]);
                    } finally {
                        setLoading(false);
                        setEligibilityMode(false);
                        setEligibilityData({ travel_purpose: '', duration_days: '', country: '', nationality: '', has_passport: true, has_prior_visa: false, criminal_record: false, has_ties: true });
                    }
                    return;
                }
                const nextQuestion = key === 'travel_purpose' ? "What is your destination country?" : key === 'country' ? "How long do you plan to stay (in days)?" : key === 'duration_days' ? "What is your nationality?" : "";
                setMessages(prev => [...prev, { role: 'assistant', content: nextQuestion }]);
                return;
            }
        }

        if (textToSend.toLowerCase().includes('check my eligibility') || textToSend.toLowerCase().includes('eligibility')) {
            setEligibilityMode(true);
            setEligibilityData({ travel_purpose: '', duration_days: '', country: '', nationality: '', has_passport: true, has_prior_visa: false, criminal_record: false, has_ties: true });
            setMessages(prev => [...prev, { role: 'user', content: textToSend }]);
            setMessages(prev => [...prev, { role: 'assistant', content: "I'll help you check your visa eligibility. What is your travel purpose? (tourism, business, work, study, or transit)" }]);
            return;
        }

        setMessages(prev => [...prev, { role: 'user', content: textToSend }]);
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
        setLoading(true);

        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                navigate('/login');
                return;
            }

            let fullResponse = '';
            let res;
            try {
                res = await fetch('http://localhost:8000/chat/stream', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ question: textToSend, session_id: activeSessionId })
                });
            } catch (streamErr) {
                console.warn('Stream connection failed, falling back to non-streaming:', streamErr);
                res = null;
            }

            if (res && res.ok) {
                const reader = res.body.getReader();
                const decoder = new TextDecoder();
                let buffer = '';
                let streamDone = false;

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || '';

                    for (const line of lines) {
                        const trimmed = line.trim();
                        if (!trimmed) continue;
                        if (trimmed.startsWith('data: ')) {
                            const dataStr = trimmed.slice(6);
                            if (dataStr === '[DONE]') {
                                streamDone = true;
                                break;
                            }
                            try {
                                const parsed = JSON.parse(dataStr);
                                if (parsed.token) {
                                    fullResponse += parsed.token;
                                    setMessages(prev => {
                                        const msgs = [...prev];
                                        const last = { ...msgs[msgs.length - 1] };
                                        last.content += parsed.token;
                                        msgs[msgs.length - 1] = last;
                                        return msgs;
                                    });
                                } else if (parsed.error) {
                                    setMessages(prev => {
                                        const msgs = [...prev];
                                        msgs[msgs.length - 1] = { role: 'assistant', content: `Error: ${parsed.error}` };
                                        return msgs;
                                    });
                                    streamDone = true;
                                    break;
                                }
                            } catch (_) {
                                // Skip malformed JSON lines
                            }
                        }
                    }
                    if (streamDone) break;
                }

                if (!fullResponse) {
                    setMessages(prev => {
                        const msgs = [...prev];
                        msgs[msgs.length - 1] = { role: 'assistant', content: "Sorry, I received an empty response. Please try again." };
                        return msgs;
                    });
                }
            } else if (res && res.status === 401) {
                navigate('/login');
                return;
            } else {
                console.warn('Stream failed with status:', res?.status, 'falling back to non-streaming');
                const fallbackRes = await fetch('http://localhost:8000/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ question: textToSend, session_id: activeSessionId })
                });
                if (fallbackRes.ok) {
                    const data = await fallbackRes.json();
                    setMessages(prev => {
                        const msgs = [...prev];
                        msgs[msgs.length - 1] = { role: 'assistant', content: data.answer || "No response received." };
                        return msgs;
                    });
                    fullResponse = data.answer || '';
                } else {
                    setMessages(prev => {
                        const msgs = [...prev];
                        msgs[msgs.length - 1] = { role: 'assistant', content: "Sorry, I encountered an error while processing your request. Please try again later." };
                        return msgs;
                    });
                }
            }

            // Dynamic suggestion chips update based on response context
            const lower = (fullResponse || '').toLowerCase();
            if (lower.includes('france') || lower.includes('schengen') || lower.includes('europe')) {
                setSuggestionChips([
                    "What documents do I need for Schengen?",
                    "Schengen visa fees",
                    "Processing time for France visa",
                    "Travel insurance requirements",
                ]);
            } else if (lower.includes('eligibility') || lower.includes('check') || lower.includes('qualify')) {
                setSuggestionChips([
                    "Check my eligibility for UK visa",
                    "Am I eligible for US visa?",
                    "Eligibility criteria for Schengen",
                    "Work visa eligibility check",
                ]);
            } else {
                setSuggestionChips([
                    "What documents do I need for France?",
                    "Check my eligibility",
                    "Cost of Tourist Visa",
                    "Interview tips",
                ]);
            }
        } catch (err) {
            console.error('Chat error:', err);
            setMessages(prev => {
                const msgs = [...prev];
                msgs[msgs.length - 1] = { role: 'assistant', content: "Network error. Please check if the backend server is running on port 8000 and try again." };
                return msgs;
            });
        } finally {
            setLoading(false);
            fetchChatSessions();
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
        const fileName = file.name;
        e.target.value = '';

        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        const ext = '.' + fileName.split('.').pop().toLowerCase();
        const allowedExts = ['.jpg', '.jpeg', '.png', '.pdf'];
        if (!allowedTypes.includes(file.type) && !allowedExts.includes(ext)) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Only JPG, PNG, and PDF files are accepted.' }]);
            return;
        }
        if (file.size > 20 * 1024 * 1024) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'File size must be less than 20MB.' }]);
            return;
        }

        setMessages(prev => [...prev, { role: 'user', content: `📎 Uploaded: ${fileName}` }]);
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
                const fields = data.extracted_fields || {};
                let lines = [`📄 OCR Results for ${fileName}:`];
                if (fields.full_name) lines.push(`• Name: ${fields.full_name}`);
                if (fields.passport_number) lines.push(`• Passport: ${fields.passport_number}`);
                if (fields.nationality) lines.push(`• Nationality: ${fields.nationality}`);
                if (fields.dates_found) lines.push(`• Dates: ${fields.dates_found.join(', ')}`);
                if (data.ocr_text) lines.push(`\nExtracted Text:\n${data.ocr_text}`);
                setMessages(prev => [...prev, { role: 'assistant', content: lines.join('\n') }]);
            } else {
                let errMsg = 'Failed to process file.';
                try {
                    const errData = await res.json();
                    errMsg = errData.detail || errMsg;
                } catch {}
                setMessages(prev => [...prev, { role: 'assistant', content: errMsg }]);
            }
        } catch (err) {
            console.error('Upload error:', err);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Error uploading file. Check that the backend is running on port 8000.' }]);
        } finally {
            setLoading(false);
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
                        <Button variant="secondary" className="w-full justify-start" icon="add_circle"
                            onClick={startNewChat}>
                            {L.NEW_CONSULTATION}
                        </Button>
                    </div>
                    <nav className="flex-1 overflow-y-auto px-4 space-y-6">
                        <div>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 px-2">History</h3>
                            <div className="space-y-1">
                                {chatSessions.length === 0 ? (
                                    <p className="text-xs text-slate-500 px-2">No conversations yet</p>
                                ) : (
                                    chatSessions.map((session) => (
                                        <button
                                            key={session.session_id}
                                            onClick={() => loadChatSession(session.session_id)}
                                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all ${
                                                activeSessionId === session.session_id
                                                    ? 'bg-primary/5 text-primary border border-primary/10'
                                                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                                            }`}
                                        >
                                            <span className="material-symbols-outlined text-xl shrink-0">chat_bubble</span>
                                            <span className="text-sm truncate flex-1">{session.title}</span>
                                            <span className="text-[10px] text-slate-600 shrink-0">{session.message_count}</span>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                        <div className="mt-8">
                            <Button variant="ghost" size="sm" to={ROUTES.USER_DASHBOARD}>&larr; {L.DASHBOARD}</Button>
                        </div>
                    </nav>
                    <div className="p-4 border-t border-slate-200 dark:border-primary/10">
                        <ProfileIcon showName className="p-2 rounded-xl bg-slate-100 dark:bg-primary/5 w-full" />
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
                            {eligibilityMode ? (
                                <span className="text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                    <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                                    Eligibility Check
                                </span>
                            ) : (
                                <span className="text-sm font-bold">Standard Tourist Visa</span>
                            )}
                        </div>
                        <div className="flex items-center gap-4">
                            {eligibilityMode && (
                                <button onClick={() => { setEligibilityMode(false); setMessages(prev => [...prev, { role: 'assistant', content: "Eligibility check cancelled. How else can I help you?" }]); }} className="text-xs text-red-500 hover:text-red-600 font-medium">Cancel</button>
                            )}
                            <button className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">
                                <span className="material-symbols-outlined text-lg">share</span>
                                Share
                            </button>
                            <div className="h-4 w-[1px] bg-slate-200 dark:bg-primary/20"></div>
                            <Button size="sm" to={ROUTES.REGISTER}>{L.UPGRADE}</Button>
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
                        <p className="leading-relaxed whitespace-pre-wrap">{stripMarkdown(msg.content)}{loading && idx === messages.length - 1 && msg.role === 'assistant' && <span className="inline-block w-2 h-4 bg-primary ml-0.5 animate-pulse">|</span>}</p>
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
                            <button onClick={() => setInput('What documents do I need for France?')} className="px-4 py-2 rounded-full border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-semibold transition-all">What documents do I need for France?</button>
                            <button onClick={() => { setEligibilityMode(true); setEligibilityData({ travel_purpose: '', duration_days: '', country: '', nationality: '', has_passport: true, has_prior_visa: false, criminal_record: false, has_ties: true }); setMessages(prev => [...prev, { role: 'assistant', content: "I'll help you check your visa eligibility. What is your travel purpose? (tourism, business, work, study, or transit)" }]); }} className="px-4 py-2 rounded-full border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-semibold transition-all">Check my eligibility</button>
                            <button onClick={() => setInput('Cost of UK Visa')} className="px-4 py-2 rounded-full border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-semibold transition-all">Cost of UK Visa</button>
                            <button onClick={() => setInput('Interview tips')} className="px-4 py-2 rounded-full border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary text-xs font-semibold transition-all">Interview tips</button>
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
