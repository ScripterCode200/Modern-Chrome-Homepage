'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, Edit2, Check, X } from 'lucide-react';
import { useTime } from '../context/TimeContext';

export default function DayOverview() {
    const { timeZone } = useTime();

    // Navigation State
    const [viewOffset, setViewOffset] = useState(0); // 0 = Today, 1 = Tomorrow, etc.
    const [currentDate, setCurrentDate] = useState(new Date());

    // Data State
    const [customMessages, setCustomMessages] = useState<Record<string, string>>({});
    const [isLoaded, setIsLoaded] = useState(false);

    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState('');

    // --- 1. Date Calculation Helper ---
    const getTargetDate = () => {
        const date = new Date();
        date.setDate(date.getDate() + viewOffset);
        return date;
    };

    // --- 2. Formatters ---
    const getFormattedDateKey = (date: Date) => {
        // Simple YYYY-MM-DD key for storage
        return date.toISOString().split('T')[0];
    };

    const formatDateDisplay = (date: Date) => {
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            timeZone: timeZone === 'local' ? undefined : timeZone
        };
        const dayName = new Intl.DateTimeFormat('en-US', options).format(date).toUpperCase();

        const dateOptions: Intl.DateTimeFormatOptions = {
            day: '2-digit',
            month: 'short',
            timeZone: timeZone === 'local' ? undefined : timeZone
        };
        const dateString = new Intl.DateTimeFormat('en-US', dateOptions).format(date).toUpperCase();

        return { dayName, dateString };
    };

    // --- 3. Effects ---

    // Load data
    useEffect(() => {
        const saved = localStorage.getItem('day_overview_focus');
        if (saved) {
            try {
                setCustomMessages(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to load daily focus", e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save data
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('day_overview_focus', JSON.stringify(customMessages));
        }
    }, [customMessages, isLoaded]);

    // Update current view date when offset changes
    useEffect(() => {
        setCurrentDate(getTargetDate());
        setIsEditing(false); // Cancel edit on nav
    }, [viewOffset]);


    // --- 4. Handlers ---
    const handleSave = () => {
        const key = getFormattedDateKey(currentDate);
        setCustomMessages(prev => ({
            ...prev,
            [key]: editValue.trim()
        }));
        setIsEditing(false);
    };

    const startEditing = () => {
        const key = getFormattedDateKey(currentDate);
        setEditValue(customMessages[key] || '');
        setIsEditing(true);
    };

    const { dayName, dateString } = formatDateDisplay(currentDate);
    const currentKey = getFormattedDateKey(currentDate);
    const displayMessage = customMessages[currentKey] || 'NO_DIRECTIVE';

    // Relative Label (Today/Tomorrow)
    const getRelativeLabel = () => {
        if (viewOffset === 0) return 'TODAY';
        if (viewOffset === 1) return 'TOMORROW';
        if (viewOffset === -1) return 'YESTERDAY';
        return viewOffset > 0 ? `IN ${viewOffset} DAYS` : `${Math.abs(viewOffset)} DAYS AGO`;
    };

    return (
        <div className="h-full flex flex-col p-2 relative group/card">

            {/* Header / Navigation */}
            <div className="flex justify-between items-start mb-1 h-8">
                <div>
                    <div className="flex items-center gap-1.5 opacity-50 mb-0.5">
                        <Calendar size={10} />
                        <span className="text-[8px] font-mono tracking-widest">{getRelativeLabel()}</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <div className="text-xl font-black text-white tracking-tighter text-glow-white leading-none">
                            {dayName}
                        </div>
                        <div className="text-[10px] font-mono text-blue-400 font-bold tracking-widest">
                            {dateString}
                        </div>
                    </div>
                </div>

                <div className="flex gap-0.5">
                    <button
                        onClick={() => setViewOffset(prev => prev - 1)}
                        className="p-1 hover:bg-white/10 rounded text-white/40 hover:text-white transition-colors"
                    >
                        <ChevronLeft size={12} />
                    </button>
                    <button
                        onClick={() => setViewOffset(0)}
                        className="p-1 hover:bg-white/10 rounded text-[10px] font-mono text-white/40 hover:text-blue-400 transition-colors"
                    >
                        •
                    </button>
                    <button
                        onClick={() => setViewOffset(prev => prev + 1)}
                        className="p-1 hover:bg-white/10 rounded text-white/40 hover:text-white transition-colors"
                    >
                        <ChevronRight size={12} />
                    </button>
                </div>
            </div>

            {/* Directive Card */}
            <div className="flex-1 min-h-0 relative flex flex-col justify-end pb-1">
                <AnimatePresence mode='wait'>
                    {isEditing ? (
                        <motion.div
                            key="edit"
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="absolute inset-0 z-20 flex flex-col"
                        >
                            <textarea
                                autoFocus
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSave();
                                    }
                                }}
                                maxLength={60}
                                placeholder="ENTER DIRECTIVE..."
                                className="w-full h-full bg-black/80 border border-blue-500/50 rounded-lg p-2 text-xs text-white font-bold font-mono uppercase tracking-wide resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-white/20"
                            />
                            <div className="flex justify-end gap-1 absolute bottom-1.5 right-1.5">
                                <button onClick={() => setIsEditing(false)} className="p-0.5 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded"><X size={10} /></button>
                                <button onClick={handleSave} className="p-0.5 bg-green-500/20 hover:bg-green-500/40 text-green-400 rounded"><Check size={10} /></button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="view"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={startEditing}
                            className="w-full h-full max-h-[60px] p-2 rounded-lg bg-white/5 border border-white/5 relative overflow-hidden group hover:border-blue-500/30 hover:bg-blue-500/5 transition-all cursor-pointer flex flex-col justify-center"
                        >
                            <div className="absolute top-1.5 left-2 flex items-center gap-1.5 text-white/30 group-hover:text-blue-400 transition-colors">
                                <span className="text-[8px] font-mono font-bold tracking-widest">FOCUS</span>
                                <Edit2 size={8} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            <div className="text-sm font-bold text-white uppercase tracking-tight break-words text-center line-clamp-2 px-1 mt-3">
                                {displayMessage}
                            </div>

                            {/* Decorative Shimmer */}
                            <div className="absolute inset-0 bg-blue-500/10 -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
