'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Terminal, Sparkles, Cpu, Zap, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';

// Default skills for first load
const DEFAULT_SKILLS: any[] = [];

const COLOR_VARIANTS = [
    { name: 'CYAN', border: 'border-cyan-500/30', bg: 'bg-cyan-500/5', text: 'text-cyan-400', glow: 'shadow-[0_0_10px_rgba(34,211,238,0.1)]' },
    { name: 'FUCHSIA', border: 'border-fuchsia-500/30', bg: 'bg-fuchsia-500/5', text: 'text-fuchsia-400', glow: 'shadow-[0_0_10px_rgba(232,121,249,0.1)]' },
    { name: 'EMERALD', border: 'border-emerald-500/30', bg: 'bg-emerald-500/5', text: 'text-emerald-400', glow: 'shadow-[0_0_10px_rgba(52,211,153,0.1)]' },
    { name: 'AMBER', border: 'border-amber-500/30', bg: 'bg-amber-500/5', text: 'text-amber-400', glow: 'shadow-[0_0_10px_rgba(251,191,36,0.1)]' },
    { name: 'VIOLET', border: 'border-violet-500/30', bg: 'bg-violet-500/5', text: 'text-violet-400', glow: 'shadow-[0_0_10px_rgba(167,139,250,0.1)]' },
];

export default function LearningPath() {
    const [skills, setSkills] = useState(DEFAULT_SKILLS);
    const [isAdding, setIsAdding] = useState(false);
    const [newSkillName, setNewSkillName] = useState('');
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from LocalStorage
    useEffect(() => {
        const saved = localStorage.getItem('nexus_skills');
        if (saved) {
            try {
                let parsed = JSON.parse(saved);
                // Patch missing IDs or colors for legacy data
                parsed = parsed.map((s: any) => ({
                    ...s,
                    id: s.id || Math.random().toString(36).substr(2, 9),
                    variant: s.variant || COLOR_VARIANTS[Math.floor(Math.random() * COLOR_VARIANTS.length)]
                }));
                setSkills(parsed);
            } catch (e) {
                console.error('Failed to parse skills', e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save to LocalStorage
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('nexus_skills', JSON.stringify(skills));
        }
    }, [skills, isLoaded]);

    const addSkill = () => {
        if (!newSkillName.trim()) {
            setIsAdding(false);
            return;
        }

        const newSkill = {
            id: Date.now().toString(),
            name: newSkillName,
            status: '',
            variant: COLOR_VARIANTS[Math.floor(Math.random() * COLOR_VARIANTS.length)]
        };

        setSkills(prev => [...prev, newSkill]);
        setNewSkillName('');
        setIsAdding(false);
    };

    const removeSkill = (id: string) => {
        setSkills(prev => prev.filter(s => s.id !== id));
    };

    const getVariantStyle = (variant: any) => {
        if (!variant) return COLOR_VARIANTS[0];
        // Handle legacy color strings if they crept in, fallback to random
        if (typeof variant === 'string') return COLOR_VARIANTS[0];
        return variant;
    };

    return (
        <div className="h-full flex flex-col relative group/container overflow-hidden rounded-xl">
            {/* Interstellar Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,1),#06070B)]" />
            <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

            {/* Twinkling Stars (CSS Simulated) */}
            <div className="absolute top-1/4 left-1/4 w-0.5 h-0.5 bg-white rounded-full animate-pulse blur-[0.5px]" />
            <div className="absolute top-3/4 left-1/3 w-1 h-1 bg-cyan-400 rounded-full animate-pulse blur-[1px] delay-75" />
            <div className="absolute top-1/3 right-1/4 w-0.5 h-0.5 bg-purple-400 rounded-full animate-pulse blur-[0.5px] delay-150" />
            <div className="absolute bottom-1/4 right-1/3 w-1 h-1 bg-white rounded-full animate-pulse blur-[1px] delay-300" />

            {/* Header / Stats Line */}
            <div className="relative flex items-center justify-between mb-2 pb-2 border-b border-white/5 z-10">
                <div className="flex items-center gap-1.5 opacity-50">
                    <Cpu size={12} className="text-blue-400" />
                    <span className="text-[10px] font-mono tracking-widest text-blue-200">ACTIVE_MODULES</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                    <Activity size={10} className="animate-pulse" />
                    <span>{skills.length} OK</span>
                </div>
            </div>

            <div className="relative z-10 flex-1 overflow-y-auto pr-1 grid grid-cols-2 gap-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent content-start">
                <AnimatePresence mode='popLayout'>
                    {skills.map((skill, index) => {
                        const style = getVariantStyle(skill.variant);
                        return (
                            <motion.div
                                key={skill.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9, x: -10 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                className={twMerge(
                                    "relative flex flex-col p-2 rounded-lg border backdrop-blur-sm transition-all group/item select-none overflow-hidden hover:scale-[1.02] hover:z-20",
                                    style.border,
                                    style.bg.replace('/5', '/10'), // Slightly darker for contrast
                                    style.glow
                                )}
                            >
                                {/* Holographic Sheen */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity pointer-events-none" />

                                {/* Decorative Corner */}
                                <div className={twMerge("absolute top-0 right-0 w-3 h-3 border-l border-b rounded-bl-lg opacity-50", style.border)} />

                                <div className="flex items-center justify-between mb-1">
                                    <div className={twMerge("p-1 rounded bg-black/40 shadow-inner", style.text)}>
                                        <Terminal size={10} />
                                    </div>
                                    <button
                                        onClick={() => removeSkill(skill.id)}
                                        className="opacity-0 group-hover/item:opacity-100 p-1 hover:bg-white/10 rounded-md text-white/30 hover:text-red-400 transition-all scale-75 hover:scale-100"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between gap-1">
                                    <span className="text-[10px] font-bold font-mono tracking-wide truncate max-w-[80px] text-white/90 drop-shadow-md">
                                        {skill.name}
                                    </span>
                                    {/* Animated decorative bar */}
                                    <div className="flex gap-[1px]">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className={twMerge("w-0.5 h-1.5 rounded-full animate-pulse shadow-[0_0_5px_currentColor]", style.bg.replace('/5', '/80'), style.text)} style={{ animationDelay: `${i * 100}ms` }} />
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Floating Add Button / Input */}
            <div className="relative z-10 pt-2 mt-auto">
                {isAdding ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-1"
                    >
                        <input
                            autoFocus
                            type="text"
                            value={newSkillName}
                            onChange={(e) => setNewSkillName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                            onBlur={() => setTimeout(() => addSkill(), 100)}
                            placeholder="INSTALL_MODULE..."
                            className="flex-1 bg-black/60 border border-blue-500/50 rounded px-2 py-1.5 text-xs text-blue-400 font-mono focus:border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)] outline-none uppercase placeholder:text-blue-500/20 backdrop-blur-md"
                        />
                    </motion.div>
                ) : (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="w-full py-1.5 border border-dashed border-white/10 rounded-lg text-white/30 hover:text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/10 transition-all flex items-center justify-center gap-2 group relative overflow-hidden backdrop-blur-sm"
                    >
                        <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors" />
                        <Plus size={12} className="group-hover:rotate-90 transition-transform" />
                        <span className="text-[10px] font-mono tracking-widest">COMPILE_SKILL</span>
                    </button>
                )}
            </div>
        </div>
    );
}
