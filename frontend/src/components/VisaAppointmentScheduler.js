import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from './ui/Button';
import ProfileIcon from './ui/ProfileIcon';
import { api } from '../services/api';
import { L } from '../config/labels';
import { ROUTES } from '../config/routes';

const MONTHS = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const VisaAppointmentScheduler = () => {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [slotsData, setSlotsData] = useState(null);
    const [myAppointments, setMyAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [view, setView] = useState('calendar');
    const [selectedDaySlots, setSelectedDaySlots] = useState(null);
    const [bookingSlot, setBookingSlot] = useState(null);
    const [confirming, setConfirming] = useState(false);
    const [slotPopupDay, setSlotPopupDay] = useState(null);

    const fetchSlots = async () => {
        try {
            const data = await api.get(`/appointments/slots?month=${currentMonth}&year=${currentYear}`);
            setSlotsData(data);
        } catch (err) { console.error('Failed to fetch slots:', err); }
    };

    const fetchMyAppointments = async () => {
        try {
            const data = await api.get('/appointments/my');
            setMyAppointments(data);
        } catch (err) { console.error('Failed to fetch appointments:', err); }
    };

    useEffect(() => {
        setLoading(true);
        fetchSlots();
        fetchMyAppointments();
        setSelectedDaySlots(null);
        setBookingSlot(null);
        setSlotPopupDay(null);
    }, [currentMonth, currentYear]);

    useEffect(() => {
        if (slotsData) setLoading(false);
    }, [slotsData]);

    const prevMonth = () => {
        if (currentMonth === 1) { setCurrentMonth(12); setCurrentYear(y => y - 1); }
        else setCurrentMonth(m => m - 1);
    };

    const nextMonth = () => {
        if (currentMonth === 12) { setCurrentMonth(1); setCurrentYear(y => y + 1); }
        else setCurrentMonth(m => m + 1);
    };

    const handleDayClick = (day) => {
        if (!slotsData || !slotsData.days) return;
        const dayStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayData = slotsData.days.find(d => d.date === dayStr);
        if (dayData && dayData.slots.some(s => s.available)) {
            setSlotPopupDay(slotPopupDay === day ? null : day);
            setSelectedDaySlots(dayData);
            setBookingSlot(null);
            setError('');
        }
    };

    const handleSlotClick = (date, time_slot) => {
        setBookingSlot({ date, time_slot });
        setError('');
        setSuccess('');
    };

    const confirmBooking = async () => {
        if (!bookingSlot) return;
        setConfirming(true);
        setError('');
        try {
            await api.post('/appointments/book', bookingSlot);
            setSuccess(`Appointment booked for ${bookingSlot.date} at ${bookingSlot.time_slot}`);
            fetchSlots();
            fetchMyAppointments();
            setBookingSlot(null);
            setSlotPopupDay(null);
            setSelectedDaySlots(null);
        } catch (err) {
            if (err.status === 409) {
                setError('This slot was just taken. Please choose another.');
                fetchSlots();
            } else {
                setError('Failed to book. Please try again.');
            }
        } finally { setConfirming(false); }
    };

    const cancelBooking = async (id) => {
        try {
            await api.del(`/appointments/${id}`);
            setSuccess('Appointment cancelled');
            fetchMyAppointments();
            fetchSlots();
        } catch (err) {
            setError('Failed to cancel. Please try again.');
        }
    };

    const getDaysInMonth = () => {
        return new Date(currentYear, currentMonth, 0).getDate();
    };

    const getFirstDayOfMonth = () => {
        return new Date(currentYear, currentMonth - 1, 1).getDay();
    };

    const countAvailableSlots = (day) => {
        if (!slotsData || !slotsData.days) return 0;
        const dayStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayData = slotsData.days.find(d => d.date === dayStr);
        if (!dayData) return 0;
        return dayData.slots.filter(s => s.available).length;
    };

    const getDayData = (day) => {
        if (!slotsData || !slotsData.days) return null;
        const dayStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return slotsData.days.find(d => d.date === dayStr);
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col font-display">
            <header className="flex items-center justify-between whitespace-nowrap border-b border-slate-200 dark:border-slate-800 px-6 py-3 bg-white/5 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3 text-primary">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <span className="material-symbols-outlined text-background-dark">rocket_launch</span>
                        </div>
                        <h2 className="text-slate-900 dark:text-white text-xl font-extrabold tracking-tight">{L.APP_NAME_SHORT}</h2>
                    </div>
                    <nav className="hidden md:flex items-center gap-6">
                        <Link className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors" to={ROUTES.USER_DASHBOARD}>{L.DASHBOARD}</Link>
                        <Link className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors" to={ROUTES.PROGRESS_TRACKER}>{L.APPLICATIONS}</Link>
                        <Link className="text-primary text-sm font-bold border-b-2 border-primary pb-1" to={ROUTES.APPOINTMENT_SCHEDULER}>{L.SCHEDULER}</Link>
                        <Link className="text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary text-sm font-medium transition-colors" to={ROUTES.DOCUMENT_VAULT}>{L.DOCUMENTS}</Link>
                    </nav>
                </div>
                <div className="flex gap-2 items-center">
                    <Button variant="icon" icon="notifications" aria-label="Notifications" />
                    <ProfileIcon size="md" />
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
            <main className="flex-1 p-4 md:p-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-black tracking-tight">{L.APPOINTMENT_SCHEDULER}</h1>
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        <Button onClick={() => { setView('calendar'); setError(''); }} className={`px-4 py-2 rounded-lg text-sm font-bold ${view === 'calendar' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500'}`}>Calendar</Button>
                        <Button onClick={() => { setView('my-appointments'); setError(''); }} className={`px-4 py-2 rounded-lg text-sm font-bold ${view === 'my-appointments' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500'}`}>{L.MY_APPOINTMENTS}</Button>
                    </div>
                </div>

                {view === 'calendar' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <div className="flex items-center justify-between bg-primary/5 backdrop-blur-sm border border-white/5 p-4 rounded-xl mb-6">
                                <div className="flex items-center gap-4">
                                    <Button variant="icon" onClick={prevMonth} icon="chevron_left" />
                                    <h2 className="text-lg font-bold">{MONTHS[currentMonth]} {currentYear}</h2>
                                    <Button variant="icon" onClick={nextMonth} icon="chevron_right" />
                                </div>
                            </div>
                            {loading ? (
                                <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden animate-pulse">
                                    {DAY_NAMES.map(d => <div key={d} className="bg-slate-50 dark:bg-slate-900 py-3 text-center text-xs font-bold text-slate-500">{d}</div>)}
                                    {Array.from({ length: 35 }, (_, i) => <div key={i} className="bg-white dark:bg-background-dark h-28"></div>)}
                                </div>
                            ) : (
                                <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                                    {DAY_NAMES.map(d => <div key={d} className="bg-slate-50 dark:bg-slate-900 py-3 text-center text-xs font-bold uppercase tracking-widest text-slate-500">{d}</div>)}
                                    {Array.from({ length: getFirstDayOfMonth() }, (_, i) => <div key={`empty-${i}`} className="bg-white dark:bg-background-dark h-28"></div>)}
                                    {Array.from({ length: getDaysInMonth() }, (_, i) => {
                                        const day = i + 1;
                                        const available = countAvailableSlots(day);
                                        const hasAvailable = available > 0;
                                        const isToday = day === today.getDate() && currentMonth === today.getMonth() + 1 && currentYear === today.getFullYear();
                                        return (
                                            <div key={day} onClick={() => handleDayClick(day)} className={`bg-white dark:bg-background-dark h-28 p-2 relative transition-colors ${hasAvailable ? 'cursor-pointer hover:bg-slate-800/40' : ''} ${slotPopupDay === day ? 'border-2 border-primary' : ''}`}>
                                                <span className={`text-xs ${isToday ? 'font-bold text-primary' : 'font-medium'} ${isToday ? 'bg-primary/20 rounded-full w-6 h-6 inline-flex items-center justify-center' : ''}`}>{day}</span>
                                                {hasAvailable && <div className="mt-3 p-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary text-[10px] font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>{available} slot{available > 1 ? 's' : ''}</div>}
                                                {slotPopupDay === day && selectedDaySlots && (
                                                    <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-background-dark border border-slate-700 rounded-xl p-3 shadow-xl max-h-48 overflow-y-auto" onClick={e => e.stopPropagation()}>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Available Times</p>
                                                        <div className="grid grid-cols-2 gap-1">
                                                            {selectedDaySlots.slots.filter(s => s.available).map((slot, si) => (
                                                                <button key={si} onClick={(e) => { e.stopPropagation(); handleSlotClick(selectedDaySlots.date, slot.time); }} className={`text-xs py-1.5 px-2 rounded-lg font-bold transition-all ${bookingSlot?.time_slot === slot.time && bookingSlot?.date === selectedDaySlots.date ? 'bg-primary text-background-dark' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}>{slot.display}</button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        <div className="space-y-6">
                            {bookingSlot && (
                                <div className="bg-primary/5 backdrop-blur-sm p-6 rounded-2xl border border-primary/20">
                                    <h3 className="text-lg font-semibold mb-2">{L.CONFIRM_BOOKING}</h3>
                                    <p className="text-slate-400 mb-1">Date: <span className="text-slate-200 font-medium">{bookingSlot.date}</span></p>
                                    <p className="text-slate-400 mb-4">Time: <span className="text-slate-200 font-medium">{bookingSlot.time_slot}</span></p>
                                    <div className="flex gap-3">
                                        <Button onClick={confirmBooking} disabled={confirming}>
                                            {confirming ? 'Booking...' : L.CONFIRM_BOOKING}
                                        </Button>
                                        <Button variant="secondary" onClick={() => setBookingSlot(null)}>{L.CANCEL}</Button>
                                    </div>
                                </div>
                            )}
                            <div className="bg-primary/5 backdrop-blur-sm border border-primary/10 p-5 rounded-2xl">
                                <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Quick Info</h4>
                                <div className="space-y-2 text-sm text-slate-400">
                                    <p><span className="text-slate-200 font-medium">Hours:</span> Mon-Fri, 9AM-5PM</p>
                                    <p><span className="text-slate-200 font-medium">Duration:</span> 60 min per slot</p>
                                    <p><span className="text-slate-200 font-medium">Location:</span> VFS Global Center</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {view === 'my-appointments' && (
                    <div>
                        {myAppointments.length === 0 ? (
                            <div className="text-center py-16">
                                <span className="material-symbols-outlined text-5xl text-slate-600 mb-4">calendar_month</span>
                                <p className="text-slate-400 text-lg">No appointments booked yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-4 max-w-2xl">
                                {myAppointments.map(apt => (
                                    <div key={apt.id} className="bg-background-dark/80 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">{apt.date} — {apt.time_slot}</p>
                                            <p className="text-sm text-slate-400">{apt.location}</p>
                                            <span className={`text-xs font-bold uppercase tracking-wider ${apt.status === 'confirmed' ? 'text-emerald-400' : 'text-red-400'}`}>{apt.status}</span>
                                        </div>
                                        {apt.status === 'confirmed' && (
                                            <Button variant="danger" onClick={() => cancelBooking(apt.id)}>{L.CANCEL}</Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default VisaAppointmentScheduler;
