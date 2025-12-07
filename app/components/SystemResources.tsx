'use client';

import { Activity, Cpu, Terminal, Zap, HardDrive } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function SystemResources() {
    const [cpuUsage, setCpuUsage] = useState(0);
    const [memUsage, setMemUsage] = useState(0);
    const [netUsage, setNetUsage] = useState(0);

    // Static HW Info
    const [coreCount, setCoreCount] = useState<number | string>('8'); // Default/Fallback to 8 as requested
    const [totalMem, setTotalMem] = useState<number | string>('16 GB'); // Default/Fallback to 16GB as requested
    const [netType, setNetType] = useState<string>('5G'); // Default/Fallback to 5G as requested

    useEffect(() => {
        // --- 1. Hardware Detection Override ---
        // Browsers cap deviceMemory at 8GB and connection at 4G for privacy.
        // We prioritizing the user's requested "True Specs" if the browser reports the max cap.
        if (typeof navigator !== 'undefined') {
            // Cores
            if (navigator.hardwareConcurrency) {
                setCoreCount(navigator.hardwareConcurrency);
            }

            // Memory: Override 8GB limit -> 16GB
            // @ts-ignore
            const mem = navigator.deviceMemory;
            if (mem) {
                setTotalMem(mem >= 8 ? '16 GB' : `${mem} GB`);
            }

            // Network: Override 4G limit -> 5G
            // @ts-ignore
            const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            if (conn) {
                const type = conn.effectiveType ? conn.effectiveType.toUpperCase() : '4G';
                setNetType(type === '4G' ? '5G' : type);
            }
        }

        // --- 2. Live Simulation Loop ---
        const interval = setInterval(() => {
            // Simulate CPU: Random walk between 10% and 40% (idle-ish)
            setCpuUsage(prev => {
                const delta = (Math.random() - 0.5) * 10;
                const next = Math.max(10, Math.min(45, prev + delta));
                return Math.round(next);
            });

            // Simulate Memory: High usage (chrome loves RAM) 50-70%
            setMemUsage(prev => {
                const delta = (Math.random() - 0.5) * 4;
                const next = Math.max(50, Math.min(75, prev + delta));
                return Math.round(next);
            });

            // Simulate Network: Bursty traffic
            setNetUsage(prev => {
                if (Math.random() > 0.8) return Math.round(Math.random() * 80); // Burst
                return Math.max(0, prev - 5); // Decay
            });

        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col gap-4 h-full justify-center">
            {/* CPU Module */}
            <div className="space-y-1 group">
                <div className="flex justify-between text-xs font-mono text-blue-400/80 group-hover:text-blue-400 transition-colors">
                    <span className="flex items-center gap-2">
                        <Cpu size={12} />
                        CPU • {coreCount} CORES
                    </span>
                    <span className="tabular-nums">{cpuUsage}%</span>
                </div>
                <div className="h-1.5 w-full bg-blue-900/20 rounded-full overflow-hidden border border-blue-900/30">
                    <motion.div
                        className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                        animate={{ width: `${cpuUsage}%` }}
                        transition={{ duration: 0.5, ease: "linear" }}
                    />
                </div>
            </div>

            {/* RAM Module */}
            <div className="space-y-1 group">
                <div className="flex justify-between text-xs font-mono text-blue-400/80 group-hover:text-blue-400 transition-colors">
                    <span className="flex items-center gap-2">
                        <Activity size={12} />
                        RAM • {totalMem}
                    </span>
                    <span className="tabular-nums">{memUsage}%</span>
                </div>
                <div className="h-1.5 w-full bg-blue-900/20 rounded-full overflow-hidden border border-blue-900/30">
                    <motion.div
                        className="h-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]"
                        animate={{ width: `${memUsage}%` }}
                        transition={{ duration: 0.5, ease: "linear" }}
                    />
                </div>
            </div>

            {/* Network Module */}
            <div className="space-y-1 group">
                <div className="flex justify-between text-xs font-mono text-blue-400/80 group-hover:text-blue-400 transition-colors">
                    <span className="flex items-center gap-2">
                        <Terminal size={12} />
                        NET • {netType}
                    </span>
                    <span className="tabular-nums text-[10px]">{netUsage < 10 ? 'IDLE' : 'ACTV'}</span>
                </div>
                <div className="h-1.5 w-full bg-blue-900/20 rounded-full overflow-hidden border border-blue-900/30">
                    <motion.div
                        className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                        animate={{ width: `${netUsage}%` }}
                        transition={{ duration: 0.5, ease: "linear" }}
                    />
                </div>
            </div>
        </div>
    );
}
