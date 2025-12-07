'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface TimeContextType {
    timeZone: string;
    setTimeZone: (zone: string) => void;
    is24Hour: boolean;
    toggle24Hour: () => void;
    formattedTime: string;
    currentTime: Date;
}

const TimeContext = createContext<TimeContextType | undefined>(undefined);

export function TimeProvider({ children }: { children: React.ReactNode }) {
    const [timeZone, setTimeZone] = useState('local');
    const [is24Hour, setIs24Hour] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [formattedTime, setFormattedTime] = useState('');

    // Load from localStorage on mount
    useEffect(() => {
        const savedZone = localStorage.getItem('dashboard_timezone');
        const savedFormat = localStorage.getItem('dashboard_is24Hour');
        if (savedZone) setTimeZone(savedZone);
        if (savedFormat) setIs24Hour(savedFormat === 'true');
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        localStorage.setItem('dashboard_timezone', timeZone);
    }, [timeZone]);

    useEffect(() => {
        localStorage.setItem('dashboard_is24Hour', String(is24Hour));
    }, [is24Hour]);

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setCurrentTime(now);

            const options: Intl.DateTimeFormatOptions = {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: !is24Hour
            };

            if (timeZone !== 'local') {
                options.timeZone = timeZone;
            }

            setFormattedTime(now.toLocaleTimeString([], options));
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, [timeZone, is24Hour]);

    const toggle24Hour = () => setIs24Hour(prev => !prev);

    return (
        <TimeContext.Provider value={{ timeZone, setTimeZone, is24Hour, toggle24Hour, formattedTime, currentTime }}>
            {children}
        </TimeContext.Provider>
    );
}

export function useTime() {
    const context = useContext(TimeContext);
    if (context === undefined) {
        throw new Error('useTime must be used within a TimeProvider');
    }
    return context;
}
