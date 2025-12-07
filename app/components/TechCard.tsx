'use client';

import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface TechCardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
}

export default function TechCard({ children, className, title }: TechCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={twMerge(
                "relative rounded-xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden",
                "shadow-[0_0_15px_rgba(0,0,0,0.5)]",
                className
            )}
        >
            {/* Hi-tech decorative corners */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/30 rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/30 rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-white/30 rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white/30 rounded-br-lg" />

            {title && (
                <div className="absolute top-0 left-0 right-0 h-8 bg-white/5 border-b border-white/10 flex items-center px-4">
                    <span className="text-[10px] uppercase tracking-widest text-white/40 font-mono">{title}</span>
                </div>
            )}

            <div className={clsx("p-4 h-full", title ? "pt-10" : "")}>
                {children}
            </div>
        </motion.div>
    );
}
