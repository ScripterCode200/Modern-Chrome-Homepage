'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Activity, Wifi, Database, Terminal, GitBranch, Shield, Zap, RefreshCw, Gauge, ArrowDown, ArrowUp } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export default function ControlRoomHeader({ className }: { className?: string }) {
    const [logs, setLogs] = useState<string[]>([]);
    const logContainerRef = useRef<HTMLDivElement>(null);

    // Speed Test State
    const [isp, setIsp] = useState<string>('Unknown Provider');
    const [downloadSpeed, setDownloadSpeed] = useState<number | null>(null);
    const [uploadSpeed, setUploadSpeed] = useState<number | null>(null);
    const [isTesting, setIsTesting] = useState(false);
    const [testPhase, setTestPhase] = useState<'IDLE' | 'DOWNLOAD' | 'UPLOAD'>('IDLE');
    const [testProgress, setTestProgress] = useState(0);

    // System Info & ISP Gathering
    useEffect(() => {
        const addLog = (msg: string) => {
            setLogs(prev => {
                const updated = [...prev, `> ${msg}`];
                return updated.slice(-20);
            });
        };

        const fetchSystemInfo = async () => {
            addLog("Initializing diagnostics...");
            await new Promise(r => setTimeout(r, 600));

            const ua = navigator.userAgent;
            let browser = "Unknown";
            if (ua.includes("Firefox")) browser = "Firefox";
            else if (ua.includes("Chrome")) browser = "Chrome";
            else if (ua.includes("Safari")) browser = "Safari";

            addLog(`Env: ${browser} / ${navigator.platform}`);
            await new Promise(r => setTimeout(r, 400));

            addLog(`Res: ${window.innerWidth}x${window.innerHeight}px`);
            await new Promise(r => setTimeout(r, 400));

            addLog("Scanning Network...");
            try {
                const response = await fetch('https://ipapi.co/json/');
                const data = await response.json();
                setIsp(data.org || data.isp || 'Unknown Provider');
                addLog(`IP: ${data.ip}`);
                addLog(`ISP: ${data.org || data.isp}`);
            } catch (error) {
                addLog("ISP Scan Failed.");
            }
        };

        fetchSystemInfo();
    }, []);

    // Auto-scroll logs
    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs]);

    // Robust Speed Test Logic (Duration Based)
    const runSpeedTest = async () => {
        if (isTesting) return;
        setIsTesting(true);
        setDownloadSpeed(null);
        setUploadSpeed(null);
        setTestProgress(0);

        const PHASE_DURATION = 4000;

        // --- PHASE 1: DOWNLOAD ---
        setTestPhase('DOWNLOAD');
        let dlTotalBits = 0;
        let dlStartTime = Date.now();
        let dlEndTime = dlStartTime;

        try {
            const start = Date.now();
            while (Date.now() - start < PHASE_DURATION) {
                const iterStart = Date.now();
                const response = await fetch(`https://upload.wikimedia.org/wikipedia/commons/2/2d/Snake_River_%285mb%29.jpg?t=${iterStart}`);
                const blob = await response.blob();
                const iterEnd = Date.now();

                dlTotalBits += blob.size * 8;
                dlEndTime = iterEnd;
                const progress = Math.min(((iterEnd - start) / PHASE_DURATION) * 100, 100);
                setTestProgress(progress);
            }

            const totalDuration = (dlEndTime - dlStartTime) / 1000;
            const dlMbps = (dlTotalBits / totalDuration) / (1024 * 1024);
            setDownloadSpeed(parseFloat(dlMbps.toFixed(1)));

        } catch (e) {
            setDownloadSpeed(0);
        }

        setTestProgress(100);
        await new Promise(r => setTimeout(r, 500));

        // --- PHASE 2: UPLOAD ---
        setTestPhase('UPLOAD');
        setTestProgress(0);
        let ulTotalBits = 0;
        let ulStartTime = Date.now();
        let ulEndTime = ulStartTime;

        try {
            const start = Date.now();
            const randomData = new Uint8Array(1024 * 1024);
            const ulBlob = new Blob([randomData]);

            while (Date.now() - start < PHASE_DURATION) {
                const iterStart = Date.now();
                await fetch('https://httpbin.org/post', {
                    method: 'POST',
                    body: ulBlob
                });
                const iterEnd = Date.now();
                ulTotalBits += ulBlob.size * 8;
                ulEndTime = iterEnd;
                const progress = Math.min(((iterEnd - start) / PHASE_DURATION) * 100, 100);
                setTestProgress(progress);
            }

            const totalDuration = (ulEndTime - ulStartTime) / 1000;
            const ulMbps = (ulTotalBits / totalDuration) / (1024 * 1024);
            setUploadSpeed(parseFloat(ulMbps.toFixed(1)));

        } catch (e) {
            setUploadSpeed(0);
        }

        setTestProgress(100);
        setIsTesting(false);
        setTestPhase('IDLE');
    };

    const getGaugeValue = () => {
        if (testPhase === 'DOWNLOAD') return testProgress;
        if (testPhase === 'UPLOAD') return testProgress;
        if (downloadSpeed) return Math.min(downloadSpeed, 100);
        return 0;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={twMerge(
                "relative rounded-xl overflow-hidden group h-full min-h-[200px] flex flex-col",
                "border border-white/10 bg-[#0A0A0A]",
                "shadow-[0_0_30px_rgba(59,130,246,0.1)]",
                className
            )}
        >
            {/* Background Grid & Effects */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293720_1px,transparent_1px),linear-gradient(to_bottom,#1f293720_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,#3b82f610,transparent_50%)]" />
            <motion.div
                animate={{ left: ['0%', '100%', '0%'] }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute h-full w-[1px] bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.3)] z-0"
            />

            {/* Corners */}
            <div className="absolute top-0 left-0 w-8 h-8 border-l border-t border-blue-500/30 rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-8 h-8 border-r border-t border-blue-500/30 rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-l border-b border-blue-500/30 rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-r border-b border-blue-500/30 rounded-br-lg" />

            <div className="relative z-10 p-4 sm:p-5 flex flex-col md:flex-row h-full gap-4 sm:gap-6">

                {/* Left Section */}
                <div className="flex-1 flex flex-col justify-between min-h-[140px]">
                    <div>
                        <div className="flex items-center gap-2 text-blue-400/80 font-mono text-[10px] tracking-widest mb-2">
                            <Shield size={12} />
                            SECURE_ENVIRONMENT
                        </div>

                        <h1 className="text-3xl md:text-5xl font-bold font-mono text-white tracking-tight uppercase">
                            READY, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">DEV</span>
                        </h1>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-3 mt-auto">
                        <div className="flex items-center gap-2 sm:gap-3 bg-white/5 p-2 rounded-lg border border-white/5">
                            <div className="p-1.5 rounded-md bg-blue-500/20 text-blue-400"><GitBranch size={14} /></div>
                            <div className="flex flex-col">
                                <span className="text-[9px] text-white/40 font-mono uppercase">Branch</span>
                                <span className="text-[10px] font-mono font-bold text-white/90">main</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 bg-white/5 p-2 rounded-lg border border-white/5">
                            <div className="p-1.5 rounded-md bg-emerald-500/20 text-emerald-400"><Zap size={14} /></div>
                            <div className="flex flex-col">
                                <span className="text-[9px] text-white/40 font-mono uppercase">Power</span>
                                <span className="text-[10px] font-mono font-bold text-white/90">OPTIMAL</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Section: Speed Test + Terminal */}
                <div className="flex flex-col md:flex-row flex-1 gap-3 h-full w-full md:max-h-[220px]">

                    {/* Terminal Log */}
                    <div className="flex-1 bg-black/40 border border-white/10 rounded-lg p-2.5 font-mono text-[10px] text-blue-400/80 flex flex-col overflow-hidden relative">
                        <div className="absolute top-2 right-2 text-white/20"><Terminal size={12} /></div>
                        <div className="text-white/30 border-b border-white/10 pb-1 mb-1.5">SYSTEM_LOG</div>
                        <div ref={logContainerRef} className="flex-1 overflow-y-auto scrollbar-hide space-y-0.5">
                            {logs.map((log, i) => (
                                <div key={i} className="opacity-80 hover:opacity-100 whitespace-pre-wrap break-words leading-tight">{log}</div>
                            ))}
                        </div>
                    </div>

                    {/* Compact Speed Test Module */}
                    <div className="w-1/3 min-w-[130px] bg-black/40 border border-white/10 rounded-lg p-2 flex flex-col relative overflow-hidden group/speed justify-between">
                        <div className="text-[9px] text-white/30 border-b border-white/10 pb-1 flex justify-between items-center shrink-0">
                            <span>SPEED_TEST</span>
                            <Wifi size={10} />
                        </div>

                        {/* Gauge Area */}
                        <div className="flex-1 flex flex-col items-center justify-center relative min-h-[60px]">
                            <svg className="w-14 h-14 rotate-[135deg] transform">
                                <circle cx="28" cy="28" r="24" fill="transparent" stroke="currentColor" strokeWidth="2.5" className="text-white/5" strokeDasharray="115" strokeDashoffset="25" strokeLinecap="round" />
                                <motion.circle
                                    cx="28" cy="28" r="24" fill="transparent" stroke="currentColor" strokeWidth="2.5"
                                    className={twMerge("shadow-[0_0_10px_currentColor]", testPhase === 'UPLOAD' ? "text-purple-500" : "text-blue-500")}
                                    strokeDasharray="115"
                                    strokeDashoffset="115"
                                    animate={{ strokeDashoffset: 115 - (90 * (getGaugeValue() / 100)) }}
                                    strokeLinecap="round"
                                    transition={{ duration: 0.3 }}
                                />
                            </svg>

                            <div className="absolute inset-0 flex flex-col items-center justify-center pt-0.5">
                                {testPhase === 'UPLOAD' && <ArrowUp size={8} className="text-purple-500 animate-bounce" />}
                                {testPhase === 'DOWNLOAD' && <ArrowDown size={8} className="text-blue-500 animate-bounce" />}

                                <span className={twMerge("text-base font-mono font-bold tabular-nums tracking-tighter leading-none", isTesting ? "animate-pulse" : "")}>
                                    {testPhase === 'UPLOAD' && uploadSpeed !== null ? uploadSpeed : (downloadSpeed !== null ? downloadSpeed : '--')}
                                </span>
                                <span className="text-[6px] text-white/40 font-mono">Mbps</span>
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="flex justify-between items-end border-b border-white/5 pb-0.5 mb-1 shrink-0">
                            <div className="flex flex-col leading-none">
                                <span className="text-[6px] text-white/30">DL</span>
                                <span className="text-[8px] text-blue-400 font-bold">{downloadSpeed || '--'}</span>
                            </div>
                            <div className="flex flex-col items-end leading-none">
                                <span className="text-[6px] text-white/30">UL</span>
                                <span className="text-[8px] text-purple-400 font-bold">{uploadSpeed || '--'}</span>
                            </div>
                        </div>

                        {/* Button Area */}
                        <div className="shrink-0">
                            <div className="text-[7px] text-white/30 text-center truncate px-1 mb-1">{isp}</div>
                            <button
                                onClick={runSpeedTest}
                                disabled={isTesting}
                                className="w-full bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-sm py-0.5 text-[8px] font-bold uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-1"
                            >
                                {isTesting ? <RefreshCw size={8} className="animate-spin" /> : <Gauge size={8} />}
                                {isTesting ? (testPhase === 'UPLOAD' ? 'UL...' : 'DL...') : 'START'}
                            </button>
                        </div>
                    </div>

                </div>

            </div>
        </motion.div>
    );
}
