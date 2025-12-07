'use client';

import { Battery, Wifi, LayoutGrid, Settings, Bell, Clock, Globe, ChevronDown, Check, Search, HardDrive, Map, Image, Cloud, Video, Key } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';
import { useTime } from '../context/TimeContext';

const RAW_ZONES = [
    "UTC",
    "America/Los_Angeles", "America/New_York", "America/Chicago", "America/Denver", "America/Phoenix",
    "America/Toronto", "America/Vancouver", "America/Mexico_City", "America/Sao_Paulo", "America/Bogota",
    "America/Argentina/Buenos_Aires",
    "Europe/London", "Europe/Berlin", "Europe/Paris", "Europe/Amsterdam", "Europe/Dublin",
    "Europe/Zurich", "Europe/Madrid", "Europe/Stockholm", "Europe/Kyiv", "Europe/Moscow", "Europe/Istanbul",
    "Asia/Dubai", "Asia/Jerusalem", "Asia/Kolkata", "Asia/Dhaka", "Asia/Bangkok", "Asia/Ho_Chi_Minh",
    "Asia/Jakarta", "Asia/Singapore", "Asia/Shanghai", "Asia/Hong_Kong", "Asia/Taipei", "Asia/Seoul", "Asia/Tokyo",
    "Australia/Sydney", "Australia/Melbourne", "Australia/Perth", "Australia/Brisbane",
    "Pacific/Auckland", "Pacific/Honolulu",
    "Africa/Cairo", "Africa/Lagos", "Africa/Johannesburg"
];

const TIMEZONES = [
    { label: 'Local System Time', value: 'local' },
    ...RAW_ZONES.map(tz => ({
        label: tz.split('/').pop()?.replace(/_/g, ' ') || tz,
        value: tz
    }))
];

export default function SystemNav() {
    const { formattedTime, is24Hour, toggle24Hour, timeZone, setTimeZone } = useTime();
    const [isZoneOpen, setIsZoneOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Close dropdown on click outside
    useEffect(() => {
        const handleClick = () => setIsZoneOpen(false);
        if (isZoneOpen) window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, [isZoneOpen]);

    // Reset search when closing
    useEffect(() => {
        if (!isZoneOpen) setTimeout(() => setSearchQuery(''), 200);
    }, [isZoneOpen]);

    const activeZoneLabel = TIMEZONES.find(z => z.value === timeZone)?.label || 'Unknown';

    const filteredZones = useMemo(() => {
        if (!searchQuery) return TIMEZONES;
        return TIMEZONES.filter(tz =>
            tz.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tz.value.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    return (
        <div className="w-full h-14 flex items-center justify-between px-4 md:px-6 border-b border-white/5 bg-[#050505]/80 backdrop-blur-md z-50 relative shadow-sm">
            {/* Left: Logo/Brand */}
            <div className="flex items-center gap-4 group cursor-pointer">
                <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-blue-500/20 transition-colors">
                    <LayoutGrid size={18} className="text-white/60 group-hover:text-blue-400 transition-colors" />
                </div>
                {/* Hide text on mobile */}
                <span className="hidden md:block text-sm font-mono font-bold text-white/80 tracking-widest group-hover:text-white transition-colors">Core_ME</span>
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-3 md:gap-6">

                {/* Enhanced Clock Module */}
                <div className="flex items-center bg-black/40 rounded-full border border-white/10 p-1 pr-4 shadow-inner relative">

                    {/* Custom Timezone Dropdown Trigger */}
                    <div
                        onClick={(e) => { e.stopPropagation(); setIsZoneOpen(!isZoneOpen); }}
                        className="group/zone flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-white/5 cursor-pointer transition-colors max-w-[120px] md:max-w-none"
                    >
                        <Globe size={12} className="text-blue-400/60 shrink-0" />
                        <span className="text-[10px] font-mono font-medium text-white/50 w-full md:w-[100px] truncate group-hover/zone:text-blue-400 transition-colors">
                            {activeZoneLabel}
                        </span>
                        <ChevronDown size={10} className={twMerge("text-white/20 transition-transform duration-300 shrink-0", isZoneOpen ? "rotate-180" : "")} />
                    </div>

                    {/* Custom Dropdown Menu */}
                    <AnimatePresence>
                        {isZoneOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                onClick={(e) => e.stopPropagation()}
                                className="absolute top-full right-0 md:left-0 mt-2 w-[85vw] md:w-64 max-h-80 flex flex-col bg-[#0A0A0A] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                            >
                                <div className="p-2 border-b border-white/5 bg-black/50 backdrop-blur-sm sticky top-0 z-10">
                                    <div className="relative">
                                        <Search size={10} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="Search timezone..."
                                            className="w-full bg-white/5 border border-white/5 rounded-md py-1.5 pl-7 pr-2 text-[10px] font-mono text-white/80 placeholder:text-white/20 focus:outline-none focus:border-blue-500/30 focus:bg-blue-500/5 transition-all"
                                            autoFocus
                                        />
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent py-1">
                                    {filteredZones.length > 0 ? (
                                        filteredZones.map((tz) => (
                                            <button
                                                key={tz.value}
                                                onClick={() => { setTimeZone(tz.value); setIsZoneOpen(false); }}
                                                className={twMerge(
                                                    "w-full text-left px-4 py-2 text-[10px] font-mono flex items-center justify-between group hover:bg-white/5 transition-colors",
                                                    timeZone === tz.value ? "text-blue-400 bg-blue-500/5" : "text-white/60"
                                                )}
                                            >
                                                <span className="truncate">{tz.label}</span>
                                                {timeZone === tz.value && <Check size={10} className="text-blue-400" />}
                                            </button>
                                        ))
                                    ) : (
                                        <div className="px-4 py-3 text-[10px] text-white/20 text-center italic font-mono">
                                            No zones found
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="w-px h-4 bg-white/10 mx-1" />

                    {/* Format Toggle Pill - Hidden on very small screens if needed, but keeping for now */}
                    <button
                        onClick={toggle24Hour}
                        className="hidden sm:flex items-center bg-white/5 hover:bg-white/10 rounded-full px-2 py-0.5 mx-2 transition-all group/toggle relative overflow-hidden shrink-0"
                    >
                        <div className={twMerge(
                            "absolute inset-0 bg-blue-500/20 transition-transform duration-300 ease-out origin-left",
                            is24Hour ? "scale-x-100" : "scale-x-0"
                        )} />
                        <span className={clsx("text-[10px] font-mono font-bold z-10 transition-colors", is24Hour ? "text-blue-400" : "text-white/40")}>24H</span>
                        <span className="text-[10px] text-white/20 mx-1 z-10">/</span>
                        <span className={clsx("text-[10px] font-mono font-bold z-10 transition-colors", !is24Hour ? "text-blue-400" : "text-white/40")}>12H</span>
                    </button>

                    {/* Time Display */}
                    <div className="flex items-center gap-2 pl-1 min-w-[60px] md:min-w-[70px] justify-end">
                        <span className="text-base md:text-lg font-mono font-bold text-white tabular-nums tracking-tight leading-none text-glow-blue shadow-blue-500/50">
                            {formattedTime}
                        </span>
                    </div>
                </div>

                <div className="hidden md:block h-6 w-px bg-white/10" />

                {/* System Icons - Hidden on Mobile to save space */}
                <div className="hidden md:flex items-center gap-4 text-white/40">
                    <a href="https://drive.google.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" title="Drive">
                        <HardDrive size={18} />
                    </a>
                    <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" title="Maps">
                        <Map size={18} />
                    </a>
                    <a href="https://photos.google.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" title="Photos">
                        <Image size={18} />
                    </a>
                    <a href="https://one.google.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" title="Google One">
                        <Cloud size={18} />
                    </a>
                    <a href="https://meet.google.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" title="Meet">
                        <Video size={18} />
                    </a>
                    <a href="https://passwords.google.com/?utm_source=OGB&utm_medium=AL&pli=1" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" title="Passwords">
                        <Key size={18} />
                    </a>

                    <div className="w-px h-4 bg-white/10 mx-1" />

                    <a
                        href="https://mail.google.com/mail/u/0/?tab=rm&ogbl#inbox"
                        target="_blank"
                        rel="noreferrer"
                        className="relative group block"
                        title="Gmail"
                    >
                        <Bell size={18} className="hover:text-white transition-colors cursor-pointer" />
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-[#050505]" />
                    </a>

                    <a
                        href="chrome://settings/"
                        target="_blank"
                        rel="noreferrer"
                        className="block"
                        title="Settings"
                    >
                        <Settings size={18} className="hover:text-white transition-colors cursor-pointer hover:rotate-90 duration-500" />
                    </a>
                </div>

                {/* Status Indicators - Hidden on Mobile */}
                <div className="hidden md:flex items-center gap-3 pl-4 border-l border-white/10">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-green-500/10 border border-green-500/20 text-green-400 font-mono text-[10px]">
                        <Wifi size={12} />
                        <span>LINKED</span>
                    </div>
                    <Battery size={18} className="text-white/60" />
                </div>
            </div>
        </div>
    );
}
