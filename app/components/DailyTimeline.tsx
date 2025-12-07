'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useTime } from '../context/TimeContext';
import { Plus } from 'lucide-react';
import PlannerModal, { DailyTask, COLOR_PRESETS } from './PlannerModal';

export default function DailyTimeline() {
    // Consume global time context
    const { timeZone, is24Hour } = useTime();
    const [timeStr, setTimeStr] = useState('00:00');
    const [progress, setProgress] = useState(0);
    const [isPlannerOpen, setIsPlannerOpen] = useState(false);

    // --- LIFTED STATE FROM MODAL (For Live Preview) ---
    const [draftLabel, setDraftLabel] = useState('');
    const [draftDuration, setDraftDuration] = useState(60);
    const [draftColor, setDraftColor] = useState(COLOR_PRESETS[0].value);

    // Initial Data
    const DEFAULT_TASKS: DailyTask[] = [
        { id: '1', label: 'System Sleep', startTime: '00:00', duration: 360, color: 'from-indigo-950 to-purple-900' },
        { id: '2', label: 'Deep Work', startTime: '06:00', duration: 180, color: 'from-indigo-600 to-blue-600' },
    ];

    const [tasks, setTasks] = useState<DailyTask[]>(DEFAULT_TASKS);

    // Logic to recalculate timeline (Moved here or kept synced)
    // We duplicate this logic or import it helper? For now simple enough to be here.
    const recalculateTimeline = (taskList: DailyTask[]): DailyTask[] => {
        let currentMinutes = 0;
        return taskList.map(task => {
            const h = Math.floor(currentMinutes / 60) % 24;
            const m = currentMinutes % 60;
            const startTime = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
            currentMinutes += task.duration;
            return { ...task, startTime };
        });
    };

    // Initialize with correct times
    useEffect(() => {
        setTasks(prev => recalculateTimeline(prev));
    }, []);

    // Persistence
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('daily_planner_tasks');
        if (saved) {
            try {
                // When loading, ensure we recalculate just in case
                setTasks(recalculateTimeline(JSON.parse(saved)));
            } catch (e) { }
        }
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('daily_planner_tasks', JSON.stringify(tasks));
        }
    }, [tasks, isLoaded]);

    // Time Update Loop (Visual Clock)
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const options: Intl.DateTimeFormatOptions = {
                hour: '2-digit', minute: '2-digit', hour12: !is24Hour
            };
            if (timeZone !== 'local') { options.timeZone = timeZone; }
            setTimeStr(now.toLocaleTimeString([], options));

            const partsOptions: Intl.DateTimeFormatOptions = {
                hour: 'numeric', minute: 'numeric', second: 'numeric',
                hour12: false, timeZone: timeZone === 'local' ? undefined : timeZone
            };
            const parts = new Intl.DateTimeFormat('en-US', partsOptions).formatToParts(now);
            const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
            const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0');
            const totalMinutes = hour * 60 + minute;
            setProgress((totalMinutes / 1440) * 100);
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, [timeZone, is24Hour]);

    // Helper to calculate position
    const getTaskStyle = (startStr: string, duration: number) => {
        const [h, m] = startStr.split(':').map(Number);
        const startMinutes = h * 60 + m;
        const top = (startMinutes / 1440) * 100;
        const height = (duration / 1440) * 100;
        return { top: `${top}%`, height: `${height}%` };
    };

    // Calculations for Ghost Task
    const ghostTask = (() => {
        if (!isPlannerOpen) return null;
        const totalMinutes = tasks.reduce((acc, t) => acc + t.duration, 0);
        const h = Math.floor(totalMinutes / 60) % 24;
        const m = totalMinutes % 60;
        const startTime = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        return {
            startTime,
            duration: draftDuration,
            label: draftLabel || '(New Event)',
            color: draftColor
        };
    })();

    return (
        <>
            <PlannerModal
                isOpen={isPlannerOpen}
                onClose={() => setIsPlannerOpen(false)}
                tasks={tasks}
                setTasks={setTasks}
                recalculateTimeline={recalculateTimeline}
                // Live Props
                draftLabel={draftLabel}
                setDraftLabel={setDraftLabel}
                draftDuration={draftDuration}
                setDraftDuration={setDraftDuration}
                draftColor={draftColor}
                setDraftColor={setDraftColor}
            />

            {/* 
               FOCUS MODE Z-INDEX: 
               If Planner Open -> z-[45] (Above Backdrop z-40, Below Modal z-50)
               Else -> z-0 (Normal)
            */}
            <div className={`h-full w-28 flex flex-col items-center justify-center py-4 relative select-none transition-all duration-500 ${isPlannerOpen ? 'z-[45]' : 'z-0'}`}>

                {/* Tech Border Container */}
                <div className={`w-20 h-full bg-[#030305] border-x border-white/5 relative flex flex-col items-center shadow-[0_0_30px_rgba(0,0,0,0.8)] transition-all ${isPlannerOpen ? 'scale-105 shadow-[0_0_50px_rgba(0,0,0,0.9)] border-white/10' : ''}`}>

                    {/* Background Grid Pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:10px_10px] opacity-50" />

                    {/* Scanning Laser Animation */}
                    <motion.div
                        className="absolute left-0 right-0 h-1 bg-cyan-400/30 blur-[2px] z-10 pointer-events-none"
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{ duration: 10, ease: "linear", repeat: Infinity }}
                    />

                    {/* Dynamic Tasks Rendering */}
                    <div className="absolute inset-0 left-2 right-8 pointer-events-none">
                        {tasks.map((task) => {
                            const style = getTaskStyle(task.startTime, task.duration);
                            return (
                                <div
                                    key={task.id}
                                    className={`absolute w-full group overflow-visible z-20`}
                                    style={style}
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-b ${task.color} opacity-50 group-hover:opacity-80 transition-opacity rounded-sm border-l-2 border-white/10`} />
                                    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                                        <span className="text-[9px] font-mono font-bold text-white/50 tracking-[0.2em] uppercase [writing-mode:vertical-lr] rotate-180 whitespace-nowrap">
                                            {task.label}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}

                        {/* GHOST / LIVE PREVIEW TASK */}
                        {ghostTask && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className={`absolute w-full overflow-visible z-30`}
                                style={getTaskStyle(ghostTask.startTime, ghostTask.duration)}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-b ${ghostTask.color} opacity-30 animate-pulse rounded-sm border-l-2 border-white/30 border-dashed`} />
                                <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                                    <span className="text-[9px] font-mono font-bold text-white/50 tracking-[0.2em] uppercase [writing-mode:vertical-lr] rotate-180 whitespace-nowrap animate-pulse">
                                        {ghostTask.label}
                                    </span>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Digital Ruler (Right Side) */}
                    <div className="absolute top-2 bottom-2 right-0 w-6 flex flex-col justify-between items-end pr-1 py-1">
                        {Array.from({ length: 25 }).map((_, i) => (
                            <div key={i} className={`h-[1px] bg-white/20 ${i % 6 === 0 ? 'w-4 bg-cyan-500/50' : 'w-2'}`} />
                        ))}
                    </div>

                    {/* Time Text Markers */}
                    <div className="absolute top-2 right-1 text-[8px] text-cyan-500/50 font-mono">00</div>
                    <div className="absolute top-1/2 right-1 text-[8px] text-cyan-500/50 font-mono -translate-y-1/2">12</div>
                    <div className="absolute bottom-2 right-1 text-[8px] text-cyan-500/50 font-mono">24</div>

                    {/* Current Time HUD Indicator */}
                    <motion.div
                        className="absolute left-0 right-0 z-40 pointer-events-none"
                        style={{ top: `${progress}%` }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        <div className="absolute left-0 right-0 h-[1px] bg-cyan-400 shadow-[0_0_10px_cyan]" />
                        <div className="absolute top-1/2 -translate-y-1/2 -left-3">
                            <div className="bg-[#050510]/90 border border-cyan-500/30 rounded-l px-2 py-1 shadow-[0_0_15px_rgba(6,182,212,0.15)] backdrop-blur-md flex items-center gap-2">
                                <span className="text-cyan-100 text-[10px] font-mono font-bold tracking-widest leading-none block min-w-[32px] text-center">{timeStr}</span>
                            </div>
                        </div>
                    </motion.div>

                </div>

                {/* Bottom Control */}
                <button
                    onClick={() => setIsPlannerOpen(true)}
                    className="mt-4 w-8 h-8 rounded border border-cyan-500/20 flex items-center justify-center text-cyan-500/50 hover:text-cyan-400 hover:border-cyan-400/50 hover:shadow-[0_0_10px_rgba(6,182,212,0.3)] hover:bg-cyan-900/20 transition-all bg-[#0a0a1a]"
                    title="Plan Protocol"
                >
                    <Plus size={16} />
                </button>
            </div>
        </>
    );
}
