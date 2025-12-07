'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Clock, Trash2, Calendar, ChevronRight, Hash, ArrowRight, ChevronDown, Minus, ArrowUp, ArrowDown } from 'lucide-react';
import { useState, useMemo, useEffect, useRef } from 'react';
import { twMerge } from 'tailwind-merge';

// Re-export shared types/constants if needed, or keep them here if no circular dep issues
export interface DailyTask {
    id: string;
    label: string;
    startTime: string; // "HH:MM" - Computed
    duration: number; // minutes
    color: string;
}

export const COLOR_PRESETS = [
    { label: 'Deep Work', value: 'from-indigo-600 to-blue-600', ring: 'ring-indigo-500' },
    { label: 'Learning', value: 'from-purple-600 to-pink-600', ring: 'ring-purple-500' },
    { label: 'System', value: 'from-blue-900 to-cyan-800', ring: 'ring-cyan-500' },
    { label: 'Bio/Health', value: 'from-emerald-600 to-teal-600', ring: 'ring-emerald-500' },
    { label: 'Rest Mode', value: 'from-indigo-950 to-purple-900', ring: 'ring-indigo-400' },
    { label: 'Creative', value: 'from-orange-500 to-amber-500', ring: 'ring-orange-500' },
    { label: 'Critical', value: 'from-red-600 to-rose-600', ring: 'ring-red-500' },
    { label: 'Social', value: 'from-yellow-500 to-orange-400', ring: 'ring-yellow-500' },
    { label: 'Maint.', value: 'from-slate-600 to-slate-500', ring: 'ring-slate-500' },
    { label: 'Admin', value: 'from-zinc-800 to-zinc-700', ring: 'ring-zinc-600' },
];

const DURATION_CHIPS = [
    { label: '15m', val: 15 },
    { label: '30m', val: 30 },
    { label: '1h', val: 60 },
    { label: '2h', val: 120 },
    { label: '4h', val: 240 },
];

const CyberDurationPicker = ({ value, onChange, max }: { value: number, onChange: (val: number) => void, max: number }) => {
    return (
        <div className="flex items-center gap-3 w-full">
            <button
                onClick={() => onChange(Math.max(15, value - 15))}
                className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 hover:border-white/30 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all active:scale-95 group shadow-lg"
            >
                <Minus size={20} className="group-hover:text-blue-400 transition-colors" />
            </button>

            <div className="flex-1 h-12 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center relative overflow-hidden group hover:border-blue-500/30 transition-colors">
                <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className={twMerge("text-xl font-mono font-bold z-10 tabular-nums tracking-widest text-shadow-glow", value >= max && value < 1440 ? "text-amber-400" : "text-white")}>
                    {value}
                </span>
                <span className="text-[10px] text-white/30 font-mono absolute bottom-1 right-2">MIN</span>
                {value >= max && (
                    <span className="text-[8px] text-red-500 font-mono absolute top-1 right-2 font-bold tracking-wider">MAX</span>
                )}
            </div>

            <button
                disabled={value >= max}
                onClick={() => onChange(Math.min(max, value + 15))} // Ensure we don't go over max, but also snap to max if close? Logic below handles it better.
                className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 hover:border-white/30 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all active:scale-95 group shadow-lg disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100"
            >
                <Plus size={20} className="group-hover:text-blue-400 transition-colors" />
            </button>
        </div>
    );
};

interface PlannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    tasks: DailyTask[];
    setTasks: (tasks: DailyTask[]) => void;

    // Lifted State for Live Preview
    draftLabel: string;
    setDraftLabel: (v: string) => void;
    draftDuration: number;
    setDraftDuration: (v: number) => void;
    draftColor: string;
    setDraftColor: (v: string) => void;

    recalculateTimeline: (t: DailyTask[]) => DailyTask[];
}

export default function PlannerModal({
    isOpen, onClose, tasks, setTasks,
    draftLabel, setDraftLabel,
    draftDuration, setDraftDuration,
    draftColor, setDraftColor,
    recalculateTimeline
}: PlannerModalProps) {

    // --- Derived Values from Props ---

    // Calculate where the NEXT task will start
    const nextStartTime = useMemo(() => {
        const totalMinutes = tasks.reduce((acc, t) => acc + t.duration, 0);
        const h = Math.floor(totalMinutes / 60) % 24;
        const m = totalMinutes % 60;

        const time24 = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        const time12 = `${(h % 12 || 12).toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;

        return `${time24} • ${time12}`;
    }, [tasks]);

    // Calculate when the NEW task would end
    const newEndTime = useMemo(() => {
        const totalMinutes = tasks.reduce((acc, t) => acc + t.duration, 0) + draftDuration;
        const h = Math.floor(totalMinutes / 60) % 24;
        const m = totalMinutes % 60;

        const time24 = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        const time12 = `${(h % 12 || 12).toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;

        return `${time24} • ${time12}`;
    }, [tasks, draftDuration]);

    // Remaining time in the day
    const remainingTime = useMemo(() => {
        const totalMinutes = tasks.reduce((acc, t) => acc + t.duration, 0);
        const left = 1440 - totalMinutes;
        return left > 0 ? left : 0;
    }, [tasks]);


    const addTask = () => {
        if (!draftLabel) return;

        const rawTask: DailyTask = {
            id: Date.now().toString(),
            label: draftLabel,
            startTime: '',
            duration: draftDuration,
            color: draftColor
        };

        const newSequence = recalculateTimeline([...tasks, rawTask]);
        setTasks(newSequence);
        setDraftLabel(''); // Reset only label, maybe keep duration/color preference? or reset all.
    };

    const removeTask = (id: string) => {
        const filtered = tasks.filter(t => t.id !== id);
        setTasks(recalculateTimeline(filtered));
    };

    const moveTask = (index: number, direction: -1 | 1) => {
        if (index + direction < 0 || index + direction >= tasks.length) return;

        const newTasks = [...tasks];
        const temp = newTasks[index];
        newTasks[index] = newTasks[index + direction];
        newTasks[index + direction] = temp;

        setTasks(recalculateTimeline(newTasks));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop - DARKER and lower Z than timeline rail (which will be z-50 in parent) */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/95 backdrop-blur-md z-[40]"
                    />

                    {/* Modal - ABOVE Backdrop, offset to left to show rail? */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, x: '-50%', y: '50%' }} // Center initially
                        animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
                        exit={{ opacity: 0, scale: 0.95, x: '-50%', y: '50%' }}
                        // Shifted slightly left on large screens to give breathing room to rail?
                        // Actually, centered is fine if rail is just visibly ON TOP.
                        className="fixed top-1/2 left-1/2 w-full md:w-[500px] h-full md:h-[700px] bg-[#050505] border border-white/10 md:rounded-2xl z-[50] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 opacity-50" />

                        {/* Valid Header */}
                        <div className="flex items-center justify-between p-5 border-b border-white/5 bg-white/[0.02]">
                            <div className="flex flex-col">
                                <span className="font-mono font-bold text-lg text-white tracking-widest flex items-center gap-2">
                                    <Calendar size={18} className="text-blue-400" />
                                    SEQUENTIAL_PLANNER
                                </span>
                                <span className="text-[10px] text-white/30 font-mono">NO GAPS ALLOWED • CHAINED EVENTS</span>
                            </div>
                            <button
                                onClick={onClose}
                                className="group p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                            >
                                <X size={18} className="text-white/40 group-hover:text-white transition-colors" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 space-y-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">

                            {/* Input Form */}
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl opacity-75 blur group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
                                <div className="relative bg-[#0A0A0A] rounded-xl p-5 border border-white/10 space-y-5">

                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-blue-400 font-mono font-bold tracking-widest">NEXT EVENT</label>
                                            <div className="flex items-center gap-2 text-white/60 text-xs font-mono">
                                                <span>Starts automatically at</span>
                                                <span className="bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20 font-bold">{nextStartTime}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Label Input */}
                                    <div className="relative">
                                        <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                                        <input
                                            type="text"
                                            value={draftLabel}
                                            onChange={e => setDraftLabel(e.target.value)}
                                            placeholder="Enter Event Name..."
                                            maxLength={40}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-9 pr-4 text-sm text-white focus:border-blue-500/50 focus:bg-blue-500/5 outline-none transition-all placeholder:text-white/20 font-medium"
                                            autoFocus
                                        />
                                    </div>
                                    {/* Duration Control */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-end">
                                            <label className="text-[10px] text-blue-400 font-mono font-bold tracking-widest">DURATION</label>
                                            <span className={twMerge("text-[10px] font-mono", remainingTime - draftDuration < 0 ? "text-red-400 animate-pulse" : "text-white/30")}>
                                                Ends at {newEndTime}
                                            </span>
                                        </div>

                                        <CyberDurationPicker value={draftDuration} onChange={(v) => setDraftDuration(Math.min(v, remainingTime))} max={remainingTime} />

                                        <div className="flex gap-2 flex-wrap justify-center sm:justify-start">
                                            {DURATION_CHIPS.map((chip) => (
                                                <button
                                                    key={chip.val}
                                                    disabled={chip.val > remainingTime}
                                                    onClick={() => setDraftDuration(chip.val)}
                                                    className={twMerge(
                                                        "px-3 py-1.5 rounded-full text-[10px] font-mono font-bold border transition-all disabled:opacity-20 disabled:cursor-not-allowed",
                                                        draftDuration === chip.val
                                                            ? "bg-blue-500 text-white border-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)] scale-105"
                                                            : "bg-white/5 text-white/30 border-white/5 hover:bg-white/10 hover:border-white/20 hover:text-white/60"
                                                    )}
                                                >
                                                    {chip.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Color / Type */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-blue-400 font-mono font-bold tracking-widest">TYPE</label>
                                        <div className="grid grid-cols-5 gap-2">
                                            {COLOR_PRESETS.map((c) => (
                                                <button
                                                    key={c.value}
                                                    onClick={() => setDraftColor(c.value)}
                                                    className={twMerge(
                                                        "h-8 rounded-lg bg-gradient-to-br ring-2 ring-offset-2 ring-offset-[#0A0A0A] transition-all relative overflow-hidden group/color",
                                                        c.value,
                                                        c.ring,
                                                        draftColor === c.value ? "ring-opacity-100 scale-105" : "ring-opacity-0 opacity-60 hover:opacity-100 hover:scale-105"
                                                    )}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={addTask}
                                        disabled={!draftLabel}
                                        className="w-full relative overflow-hidden group bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-[0_4px_20px_rgba(37,99,235,0.2)]"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]" />
                                        <span className="tracking-widest font-mono text-xs">APPEND TO CHAIN</span>
                                    </button>
                                </div>
                            </div>

                            {/* Sequential List */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between px-1">
                                    <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-white/30 uppercase tracking-widest">
                                        <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                                        Event Chain
                                    </div>
                                    <div className="text-[10px] font-mono text-white/30">
                                        {remainingTime > 0 ? `${Math.floor(remainingTime / 60)}h ${remainingTime % 60}m Left` : 'Full Capacity'}
                                    </div>
                                </div>

                                <div className="relative border-l border-white/10 ml-3 pl-6 space-y-4">
                                    {tasks.map((task, idx) => (
                                        <motion.div
                                            key={task.id}
                                            layout
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="relative bg-white/5 hover:bg-white/[0.07] border border-white/5 hover:border-white/10 rounded-lg p-3 group transition-all"
                                        >
                                            {/* Connector Dot */}
                                            <div className="absolute -left-[31px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[#050505] border border-white/20 group-hover:border-blue-500 group-hover:bg-blue-500/20 transition-colors z-10" />

                                            {/* Content */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-1 h-10 rounded-full bg-gradient-to-b ${task.color} shadow-[0_0_8px_rgba(0,0,0,0.5)]`} />
                                                    <div>
                                                        <div className="font-bold text-sm text-white/90 group-hover:text-white">{task.label}</div>
                                                        <div className="text-[10px] text-white/40 font-mono flex items-center gap-2 mt-0.5">
                                                            <span className="bg-white/5 px-1.5 rounded text-white/60">{task.startTime}</span>
                                                            <ChevronRight size={10} className="text-white/20" />
                                                            <span>{task.duration}m</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div className="flex flex-col gap-0.5 mr-2">
                                                        <button disabled={idx === 0} onClick={() => moveTask(idx, -1)} className="p-1 hover:bg-white/10 rounded disabled:opacity-0 text-white/40 hover:text-white">
                                                            <ArrowUp size={12} />
                                                        </button>
                                                        <button disabled={idx === tasks.length - 1} onClick={() => moveTask(idx, 1)} className="p-1 hover:bg-white/10 rounded disabled:opacity-0 text-white/40 hover:text-white">
                                                            <ArrowDown size={12} />
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => removeTask(task.id)}
                                                        className="p-2 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </motion.div>
                </>
            )
            }
        </AnimatePresence >
    );
}
