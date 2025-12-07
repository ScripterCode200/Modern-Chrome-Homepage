'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Settings, Plus, X, Globe, Link as LinkIcon, Edit2, Check, Trash2, FolderPlus, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';

// --- Waterfall Favicon Component ---
const Favicon = ({ url, label }: { url: string, label: string }) => {
    // 0 = Unavatar (Strict 404), 1 = DuckDuckGo, 2 = Text Fallback
    const [fallbackLevel, setFallbackLevel] = useState(0);

    useEffect(() => {
        setFallbackLevel(0);
    }, [url]);

    const getIconSource = () => {
        try {
            const domain = new URL(url).hostname;
            if (fallbackLevel === 0) {
                return `https://unavatar.io/${domain}?fallback=false`;
            } else if (fallbackLevel === 1) {
                return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
            }
        } catch (e) {
            return '';
        }
        return '';
    };

    const handleError = () => {
        setFallbackLevel(prev => prev + 1);
    };

    if (fallbackLevel >= 2) {
        return (
            <span className="text-white/90 font-bold text-sm font-mono select-none">
                {(label[0] || '?').toUpperCase()}
            </span>
        );
    }

    return (
        <img
            src={getIconSource()}
            alt={label}
            className="w-5 h-5 object-contain opacity-80 group-hover:opacity-100"
            onError={handleError}
        />
    );
};
// -------------------------

interface LinkItem {
    id: string;
    label: string;
    url: string;
    isCustom?: boolean;
}

interface Section {
    id: string;
    title: string;
    items: LinkItem[];
}

const DEFAULT_SECTIONS: Section[] = [
    {
        id: 'quick',
        title: 'Quick Access',
        items: [
            { id: 'chrome', label: 'Chrome', url: 'https://www.google.com', isCustom: true },
            { id: 'github', label: 'GitHub', url: 'https://github.com', isCustom: true },
            { id: 'gmail', label: 'Gmail', url: 'https://mail.google.com', isCustom: true },
            { id: 'youtube', label: 'YouTube', url: 'https://youtube.com', isCustom: true },
            { id: 'chatgpt', label: 'ChatGPT', url: 'https://chat.openai.com', isCustom: true },
        ]
    },
    {
        id: 'prod',
        title: 'Productivity',
        items: [
            { id: 'tasks', label: 'Tasks', url: 'https://todoist.com', isCustom: true },
            { id: 'calendar', label: 'Calendar', url: 'https://calendar.google.com', isCustom: true },
            { id: 'notes', label: 'Notion', url: 'https://notion.so', isCustom: true },
            { id: 'spotify', label: 'Spotify', url: 'https://open.spotify.com', isCustom: true },
        ]
    },
    {
        id: 'campus',
        title: 'Campus',
        items: [
            { id: 'portal', label: 'Portal', url: 'https://example.edu', isCustom: true },
            { id: 'teams', label: 'Teams', url: 'https://teams.microsoft.com', isCustom: true },
        ]
    }
];

export default function Sidebar() {
    const [isHovered, setIsHovered] = useState(false);
    const [sections, setSections] = useState<Section[]>(DEFAULT_SECTIONS);
    const [isEditMode, setIsEditMode] = useState(false);

    // Add Link State
    const [isAddingTo, setIsAddingTo] = useState<string | null>(null); // section ID
    const [newLinkName, setNewLinkName] = useState('');
    const [newLinkUrl, setNewLinkUrl] = useState('');

    // Add Section State
    const [isAddingSection, setIsAddingSection] = useState(false);
    const [newSectionTitle, setNewSectionTitle] = useState('');

    // Load from localStorage
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('dashboard_sidebar_links');
        if (saved) {
            try {
                setSections(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to load sidebar links", e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save to localStorage
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('dashboard_sidebar_links', JSON.stringify(sections));
        }
    }, [sections, isLoaded]);

    const handleAddLink = () => {
        if (!isAddingTo || !newLinkName || !newLinkUrl) return;

        let url = newLinkUrl;
        if (!/^https?:\/\//i.test(url)) {
            url = 'https://' + url;
        }

        const newLink: LinkItem = {
            id: Date.now().toString(),
            label: newLinkName,
            url: url,
            isCustom: true
        };

        setSections(prev => prev.map(section => {
            if (section.id === isAddingTo) {
                return { ...section, items: [...section.items, newLink] };
            }
            return section;
        }));

        setIsAddingTo(null);
        setNewLinkName('');
        setNewLinkUrl('');
    };

    const handleRemoveLink = (sectionId: string, linkId: string) => {
        setSections(prev => prev.map(section => {
            if (section.id === sectionId) {
                return { ...section, items: section.items.filter(item => item.id !== linkId) };
            }
            return section;
        }));
    };

    const handleAddSection = () => {
        if (!newSectionTitle) return;
        setSections(prev => [...prev, {
            id: Date.now().toString(),
            title: newSectionTitle,
            items: []
        }]);
        setNewSectionTitle('');
        setIsAddingSection(false);
    };

    const handleDeleteSection = (sectionId: string) => {
        setSections(prev => prev.filter(s => s.id !== sectionId));
    };

    // Mobile Toggle Handler
    const toggleSidebar = () => {
        // Toggle on click/tap, mainly for touch devices avoiding hover
        setIsHovered(prev => !prev);
    };

    return (
        <>
            {/* Backdrop for Mobile when open */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsHovered(false)}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden block"
                    />
                )}
            </AnimatePresence>

            <motion.div
                className="fixed top-0 left-0 bottom-0 z-50 h-full bg-black/80 md:bg-black/60 backdrop-blur-2xl border-r border-white/10 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                initial={{ width: '4rem' }}
                animate={{ width: isHovered ? '20rem' : '3.5rem' }} // Slightly thinner collapsed on mobile
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                // Desktop Hover
                onMouseEnter={() => { if (window.innerWidth > 768) setIsHovered(true); }}
                onMouseLeave={() => {
                    if (window.innerWidth > 768) {
                        setIsHovered(false);
                        setIsAddingTo(null);
                        setIsAddingSection(false);
                    }
                }}
            >
                {/* Header */}
                <div
                    className="h-16 md:h-20 flex items-center px-4 md:px-5 border-b border-white/5 whitespace-nowrap overflow-hidden bg-black/40 relative z-20 justify-between cursor-pointer md:cursor-default"
                    onClick={toggleSidebar} // Tap header to toggle on mobile
                >
                    <div className="flex items-center">
                        <div className="min-w-[2rem] md:min-w-[2.5rem] flex justify-center">
                            <Terminal size={24} className="text-cyan-400" />
                        </div>
                        <motion.div
                            className="ml-4 font-mono font-bold text-xl text-white tracking-widest"
                            animate={{ opacity: isHovered ? 1 : 0 }}
                        >
                            App_Drawer
                        </motion.div>
                    </div>

                    {isHovered && (
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onClick={(e) => { e.stopPropagation(); setIsEditMode(!isEditMode); }}
                            className={twMerge(
                                "p-2 rounded-lg transition-colors",
                                isEditMode ? "bg-blue-500/20 text-blue-400" : "hover:bg-white/10 text-white/40"
                            )}
                            title={isEditMode ? "Done Editing" : "Edit Links & Sections"}
                        >
                            {isEditMode ? <Check size={16} /> : <Edit2 size={16} />}
                        </motion.button>
                    )}
                </div>

                {/* Collapsed State Decorations */}
                <AnimatePresence>
                    {!isHovered && (
                        <motion.div
                            className="absolute inset-0 flex flex-col items-center py-20 pointer-events-none z-10"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="flex-1 flex items-center justify-center">
                                <span className="text-[10px] font-mono font-bold text-white/20 tracking-[0.4em] [writing-mode:vertical-lr] rotate-180 whitespace-nowrap">
                                    SYS // ON
                                </span>
                            </div>
                            <div className="flex flex-col gap-2 mt-auto pb-8">
                                <div className="w-1 h-1 rounded-full bg-cyan-500/50 shadow-[0_0_5px_cyan]" />
                                <div className="w-1 h-1 rounded-full bg-cyan-500/30" />
                                <div className="w-1 h-1 rounded-full bg-cyan-500/10" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Content - App Grid */}
                <div className="flex-1 overflow-y-auto p-4 space-y-8 no-scrollbar pb-24 h-[calc(100vh-5rem)] relative z-10">
                    {isHovered && sections.map((section, idx) => (
                        <motion.div
                            key={section.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + idx * 0.1 }}
                        >
                            <div className="flex items-center justify-between mb-4 px-2 group/header">
                                <div className="text-xs font-bold text-white/40 uppercase tracking-wider whitespace-nowrap flex items-center gap-2">
                                    {section.title}
                                </div>
                                {isEditMode && (
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleDeleteSection(section.id)}
                                            className="p-1 text-white/20 hover:text-red-500 transition-colors opacity-100 md:opacity-0 md:group-hover/header:opacity-100"
                                            title="Delete Section"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                        <button
                                            onClick={() => setIsAddingTo(isAddingTo === section.id ? null : section.id)}
                                            className={twMerge(
                                                "p-1 transition-colors",
                                                isAddingTo === section.id ? "text-blue-400" : "text-white/20 hover:text-blue-400"
                                            )}
                                            title="Add Link"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Add Link Form */}
                            <AnimatePresence>
                                {isAddingTo === section.id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden mb-4"
                                    >
                                        <div className="bg-black/40 border border-blue-500/30 rounded-xl p-3 backdrop-blur-sm relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-8 h-8 bg-blue-500/10 blur-xl rounded-full pointer-events-none" />
                                            <div className="flex items-center gap-2 mb-3 text-[10px] font-mono font-bold text-blue-400">
                                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
                                                NEW UPLINK
                                            </div>
                                            <div className="space-y-2">
                                                <input
                                                    type="text"
                                                    placeholder="NAME"
                                                    value={newLinkName}
                                                    onChange={(e) => setNewLinkName(e.target.value)}
                                                    className="w-full bg-[#050510] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50"
                                                    autoFocus
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="URL"
                                                    value={newLinkUrl}
                                                    onChange={(e) => setNewLinkUrl(e.target.value)}
                                                    className="w-full bg-[#050510] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50"
                                                />
                                            </div>
                                            <div className="flex gap-2 mt-3">
                                                <button
                                                    onClick={handleAddLink}
                                                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold py-1.5 rounded-lg"
                                                >
                                                    SAVE
                                                </button>
                                                <button
                                                    onClick={() => setIsAddingTo(null)}
                                                    className="px-3 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white text-[10px] font-bold py-1.5 rounded-lg"
                                                >
                                                    CANCEL
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {section.items.map((item) => (
                                    <div key={item.id} className="relative group">
                                        <a
                                            href={item.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex flex-col items-center justify-center gap-2 p-2 rounded-xl hover:bg-white/10 transition-all active:scale-95 cursor-pointer block h-full"
                                            onClick={(e) => isEditMode && e.preventDefault()}
                                        >
                                            <div className={`w-10 h-10 bg-[#050505] border border-white/10 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 overflow-hidden`}>
                                                <Favicon url={item.url} label={item.label} />
                                            </div>
                                            <span className="text-[10px] font-medium text-white/60 group-hover:text-white/90 whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
                                                {item.label}
                                            </span>
                                        </a>
                                        {isEditMode && (
                                            <button
                                                onClick={() => handleRemoveLink(section.id, item.id)}
                                                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white shadow-md z-20"
                                            >
                                                <X size={10} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}

                    {isEditMode && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-6 border-t border-white/5 pt-4"
                        >
                            {!isAddingSection ? (
                                <button
                                    onClick={() => setIsAddingSection(true)}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-white/20 text-white/40 hover:text-white transition-all text-xs font-medium"
                                >
                                    <FolderPlus size={14} />
                                    New Sector
                                </button>
                            ) : (
                                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                                    <input
                                        type="text"
                                        placeholder="SECTOR NAME"
                                        value={newSectionTitle}
                                        onChange={(e) => setNewSectionTitle(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs text-white mb-2 focus:outline-none"
                                        autoFocus
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddSection()}
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleAddSection}
                                            className="flex-1 bg-blue-500/20 text-blue-400 text-[10px] font-bold py-1 rounded"
                                        >
                                            OK
                                        </button>
                                        <button
                                            onClick={() => setIsAddingSection(false)}
                                            className="flex-1 bg-white/5 text-white/40 text-[10px] font-bold py-1 rounded"
                                        >
                                            X
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </>
    );
}
