'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RefreshCw, Settings, Zap, Coffee, ChevronUp, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

type TimerMode = 'POMODORO' | 'CUSTOM';
type PomoStatus = 'WORK' | 'BREAK';

export default function FocusTimer() {
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<TimerMode>('POMODORO');
    const [pomoStatus, setPomoStatus] = useState<PomoStatus>('WORK');

    // Time in seconds
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [initialTime, setInitialTime] = useState(25 * 60);

    // Custom set input
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [customMinutes, setCustomMinutes] = useState(25);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            handleTimerComplete();
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const handleTimerComplete = () => {
        if (mode === 'POMODORO') {
            if (pomoStatus === 'WORK') {
                setPomoStatus('BREAK');
                setTimeLeft(5 * 60);
                setInitialTime(5 * 60);
            } else {
                setPomoStatus('WORK');
                setTimeLeft(25 * 60);
                setInitialTime(25 * 60);
            }
        } else {
            // Custom mode just resets
            setTimeLeft(initialTime);
        }
    };

    const toggleTimer = () => setIsActive(!isActive);

    const resetTimer = () => {
        setIsActive(false);
        if (mode === 'POMODORO') {
            setPomoStatus('WORK');
            setTimeLeft(25 * 60);
            setInitialTime(25 * 60);
        } else {
            setTimeLeft(customMinutes * 60);
            setInitialTime(customMinutes * 60);
        }
    };

    const handleModeToggle = () => {
        setIsActive(false);
        if (mode === 'POMODORO') {
            setMode('CUSTOM');
            setTimeLeft(customMinutes * 60);
            setInitialTime(customMinutes * 60);
        } else {
            setMode('POMODORO');
            setPomoStatus('WORK');
            setTimeLeft(25 * 60);
            setInitialTime(25 * 60);
        }
    };

    const handleCustomSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setShowCustomInput(false);
        const mins = customMinutes > 0 ? customMinutes : 1;
        setCustomMinutes(mins);
        setTimeLeft(mins * 60);
        setInitialTime(mins * 60);
        setIsActive(false);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const progress = initialTime > 0 ? ((initialTime - timeLeft) / initialTime) * 100 : 0;
    const isWork = pomoStatus === 'WORK';
    const activeColor = isWork ? 'text-blue-500' : 'text-amber-500';
    const activeBg = isWork ? 'bg-blue-500' : 'bg-amber-500';
    const activeBorder = isWork ? 'border-blue-500' : 'border-amber-500';

    return (
        <div className="flex flex-col items-center justify-center p-2 h-full w-full relative group overflow-hidden">

            {/* Background Tech Lines */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-[10%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <div className="absolute bottom-[10%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <svg className="absolute inset-0 w-full h-full opacity-30">
                    <circle cx="50%" cy="50%" r="48%" fill="none" stroke="currentColor" strokeDasharray="4 4" className="text-white/10" />
                </svg>
            </div>

            {/* Main Reactor Core - Pointer Events None */}
            <div className="relative w-32 h-32 flex items-center justify-center pointer-events-none">

                {/* Rotating Outer Ring */}
                <motion.div
                    animate={{ rotate: isActive ? 360 : 0 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border border-dashed border-white/10"
                />

                {/* Counter-Rotating Inner Ring */}
                <motion.div
                    animate={{ rotate: isActive ? -360 : 0 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-2 rounded-full border border-dotted border-white/10"
                />

                {/* Progress SVG - CLEAN, NO GLOW */}
                <svg className="absolute inset-0 w-full h-full -rotate-90 transform">
                    <circle cx="50%" cy="50%" r="40%" fill="transparent" stroke="currentColor" strokeWidth="2" className="text-white/5" />
                    <motion.circle
                        cx="50%" cy="50%" r="40%" fill="transparent" stroke="currentColor" strokeWidth="6" strokeLinecap="round"
                        className={clsx(activeColor)}
                        initial={{ pathLength: 1 }}
                        animate={{ pathLength: 1 - (progress / 100) }}
                        transition={{ duration: 0.5 }}
                    />
                </svg>

                {/* Core Text & Info */}
                <div className="flex flex-col items-center z-10 relative">
                    {/* Label */}
                    <div className="text-[9px] font-mono font-bold tracking-[0.2em] text-white/40 mb-1">
                        {mode === 'POMODORO' ? (isWork ? 'FOCUS' : 'REST') : 'CUSTOM'}
                    </div>

                    {/* Time - CLEAN, NO GLOW */}
                    <div className={clsx(
                        "text-3xl font-black font-mono tracking-tighter tabular-nums leading-none",
                        isWork ? "text-white" : "text-amber-400"
                    )}>
                        {formatTime(timeLeft)}
                    </div>

                    {/* Status Indicator */}
                    <div className="flex items-center gap-1 mt-1">
                        <motion.div
                            animate={{ opacity: isActive ? [1, 0.4, 1] : 0.4 }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className={clsx("w-1 h-1 rounded-full", activeBg)}
                        />
                        <span className="text-[8px] font-mono text-white/30 tracking-widest uppercase">
                            {isActive ? 'ON' : 'OFF'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Compact Controls - CLEAN, NO GLOW */}
            <div className="flex items-center gap-3 z-50 mt-2">
                <button
                    onClick={toggleTimer}
                    className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-all hover:scale-110 active:scale-95 group cursor-pointer relative overflow-hidden"
                >
                    {isActive ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                </button>

                <button
                    onClick={resetTimer}
                    className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all hover:rotate-180 cursor-pointer"
                >
                    <RefreshCw size={12} />
                </button>

                <button
                    onClick={handleModeToggle}
                    className="px-1.5 py-0.5 rounded border border-white/10 text-[9px] font-mono text-white/40 hover:text-white hover:border-white/30 transition-colors uppercase cursor-pointer"
                >
                    {mode === 'POMODORO' ? 'POMO' : 'CSTM'}
                </button>
            </div>

            {/* Custom Input Overlay */}
            <AnimatePresence>
                {showCustomInput && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-50 backdrop-blur-sm"
                    >
                        <form onSubmit={handleCustomSubmit} className="flex flex-col items-center gap-4">
                            <label className="text-xs text-blue-400 font-mono tracking-widest">SET_DURATION</label>
                            <input
                                autoFocus
                                type="number"
                                min="1"
                                max="180"
                                value={customMinutes}
                                onChange={(e) => setCustomMinutes(parseInt(e.target.value) || 0)}
                                className="bg-transparent border-b border-blue-500/50 text-4xl font-mono text-center w-24 focus:outline-none focus:border-blue-400 text-white"
                            />
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setShowCustomInput(false)} className="px-3 py-1 text-xs text-red-400 bg-red-500/10 rounded cursor-pointer">CANCEL</button>
                                <button type="submit" className="px-3 py-1 text-xs text-blue-400 bg-blue-500/10 rounded cursor-pointer">CONFIRM</button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
