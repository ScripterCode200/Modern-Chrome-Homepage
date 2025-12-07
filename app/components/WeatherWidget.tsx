'use client';

import { Cloud, CloudRain, Sun, Wind, CloudLightning, CloudSnow, CloudFog, MapPin, Loader2, Droplets, Thermometer, SunDim, Gauge } from 'lucide-react';
import { useTime } from '../context/TimeContext';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Coordinate Mapping for Supported Timezones ---
const TIMEZONE_COORDS: Record<string, { lat: number, lon: number, name: string }> = {
    "America/Los_Angeles": { lat: 34.0522, lon: -118.2437, name: "LOS ANGELES" },
    "America/New_York": { lat: 40.7128, lon: -74.0060, name: "NEW YORK" },
    "America/Chicago": { lat: 41.8781, lon: -87.6298, name: "CHICAGO" },
    "America/Denver": { lat: 39.7392, lon: -104.9903, name: "DENVER" },
    "America/Phoenix": { lat: 33.4484, lon: -112.0740, name: "PHOENIX" },
    "America/Toronto": { lat: 43.6532, lon: -79.3832, name: "TORONTO" },
    "America/Vancouver": { lat: 49.2827, lon: -123.1207, name: "VANCOUVER" },
    "America/Mexico_City": { lat: 19.4326, lon: -99.1332, name: "MEXICO CITY" },
    "America/Sao_Paulo": { lat: -23.5505, lon: -46.6333, name: "SAO PAULO" },
    "America/Bogota": { lat: 4.7110, lon: -74.0721, name: "BOGOTA" },
    "America/Argentina/Buenos_Aires": { lat: -34.6037, lon: -58.3816, name: "BUENOS AIRES" },
    "Europe/London": { lat: 51.5074, lon: -0.1278, name: "LONDON" },
    "Europe/Berlin": { lat: 52.5200, lon: 13.4050, name: "BERLIN" },
    "Europe/Paris": { lat: 48.8566, lon: 2.3522, name: "PARIS" },
    "Europe/Amsterdam": { lat: 52.3676, lon: 4.9041, name: "AMSTERDAM" },
    "Europe/Dublin": { lat: 53.3498, lon: -6.2603, name: "DUBLIN" },
    "Europe/Zurich": { lat: 47.3769, lon: 8.5417, name: "ZURICH" },
    "Europe/Madrid": { lat: 40.4168, lon: -3.7038, name: "MADRID" },
    "Europe/Stockholm": { lat: 59.3293, lon: 18.0686, name: "STOCKHOLM" },
    "Europe/Kyiv": { lat: 50.4501, lon: 30.5234, name: "KYIV" },
    "Europe/Moscow": { lat: 55.7558, lon: 37.6173, name: "MOSCOW" },
    "Europe/Istanbul": { lat: 41.0082, lon: 28.9784, name: "ISTANBUL" },
    "Asia/Dubai": { lat: 25.2048, lon: 55.2708, name: "DUBAI" },
    "Asia/Jerusalem": { lat: 31.7683, lon: 35.2137, name: "JERUSALEM" },
    "Asia/Kolkata": { lat: 22.5726, lon: 88.3639, name: "KOLKATA" },
    "Asia/Dhaka": { lat: 23.8103, lon: 90.4125, name: "DHAKA" },
    "Asia/Bangkok": { lat: 13.7563, lon: 100.5018, name: "BANGKOK" },
    "Asia/Ho_Chi_Minh": { lat: 10.8231, lon: 106.6297, name: "HO CHI MINH" },
    "Asia/Jakarta": { lat: -6.2088, lon: 106.8456, name: "JAKARTA" },
    "Asia/Singapore": { lat: 1.3521, lon: 103.8198, name: "SINGAPORE" },
    "Asia/Shanghai": { lat: 31.2304, lon: 121.4737, name: "SHANGHAI" },
    "Asia/Hong_Kong": { lat: 22.3193, lon: 114.1694, name: "HONG KONG" },
    "Asia/Taipei": { lat: 25.0330, lon: 121.5654, name: "TAIPEI" },
    "Asia/Seoul": { lat: 37.5665, lon: 126.9780, name: "SEOUL" },
    "Asia/Tokyo": { lat: 35.6762, lon: 139.6503, name: "TOKYO" },
    "Australia/Sydney": { lat: -33.8688, lon: 151.2093, name: "SYDNEY" },
    "Australia/Melbourne": { lat: -37.8136, lon: 144.9631, name: "MELBOURNE" },
    "Australia/Perth": { lat: -31.9505, lon: 115.8605, name: "PERTH" },
    "Australia/Brisbane": { lat: -27.4698, lon: 153.0251, name: "BRISBANE" },
    "Pacific/Auckland": { lat: -36.8485, lon: 174.7633, name: "AUCKLAND" },
    "Pacific/Honolulu": { lat: 21.3069, lon: -157.8583, name: "HONOLULU" },
    "Africa/Cairo": { lat: 30.0444, lon: 31.2357, name: "CAIRO" },
    "Africa/Lagos": { lat: 6.5244, lon: 3.3792, name: "LAGOS" },
    "Africa/Johannesburg": { lat: -26.2041, lon: 28.0473, name: "JOHANNESBURG" },
    "UTC": { lat: 51.4769, lon: 0.0005, name: "GREENWICH" }
};

interface WeatherData {
    temperature: number;
    apparentTemp: number;
    windSpeed: number;
    humidity: number;
    uvIndex: number;
    pressure: number;
    weatherCode: number;
    cityName: string;
}

export default function WeatherWidget() {
    const { timeZone } = useTime();
    const [data, setData] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const getWeatherIcon = (code: number, size = 48) => {
        // WMO Weather interpretation codes
        if (code === 0) return <Sun className="text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" size={size} />;
        if (code === 1 || code === 2 || code === 3) return <Cloud className="text-gray-400 drop-shadow-[0_0_10px_rgba(156,163,175,0.5)]" size={size} />;
        if (code >= 45 && code <= 48) return <CloudFog className="text-blue-300" size={size} />;
        if (code >= 51 && code <= 67) return <CloudRain className="text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]" size={size} />;
        if (code >= 71 && code <= 77) return <CloudSnow className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" size={size} />;
        if (code >= 80 && code <= 82) return <CloudRain className="text-blue-500" size={size} />;
        if (code >= 95 && code <= 99) return <CloudLightning className="text-yellow-400 animate-pulse" size={size} />;
        return <Sun className="text-yellow-500" size={size} />;
    };

    const fetchWeather = async (lat: number, lon: number, name: string) => {
        try {
            setLoading(true);
            const res = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,surface_pressure,wind_speed_10m&daily=uv_index_max&timezone=auto`
            );
            const json = await res.json();

            if (!json.current) throw new Error("No data");

            setData({
                temperature: Math.round(json.current.temperature_2m),
                apparentTemp: Math.round(json.current.apparent_temperature),
                windSpeed: Math.round(json.current.wind_speed_10m),
                humidity: Math.round(json.current.relative_humidity_2m),
                uvIndex: json.daily?.uv_index_max?.[0] || 0,
                pressure: Math.round(json.current.surface_pressure),
                weatherCode: json.current.weather_code,
                cityName: name
            });
            setError('');
        } catch (err) {
            console.error(err);
            setError('System Offline');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (timeZone === 'local') {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        fetchWeather(
                            position.coords.latitude,
                            position.coords.longitude,
                            "LOCAL_SECTOR"
                        );
                    },
                    (err) => {
                        fetchWeather(51.5074, -0.1278, "LONDON_BACKUP");
                    }
                );
            } else {
                fetchWeather(51.5074, -0.1278, "LONDON_BACKUP");
            }
        } else {
            const coords = TIMEZONE_COORDS[timeZone];
            if (coords) {
                fetchWeather(coords.lat, coords.lon, coords.name.replace(' ', '_'));
            } else {
                fetchWeather(0, 0, "UNKNOWN_SECTOR");
            }
        }
    }, [timeZone]);

    if (loading && !data) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-4">
                <Loader2 className="animate-spin text-blue-400" size={24} />
                <span className="text-[10px] font-mono text-blue-400/50 mt-2 animate-pulse">SCANNING_ATMOSPHERE...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full flex items-center justify-center text-xs text-red-500 font-mono border border-red-900/20 bg-red-900/5">
                {error}
            </div>
        );
    }

    return (
        <AnimatePresence mode='wait'>
            {data && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col relative overflow-hidden"
                >
                    {/* Background Scanner Effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent animate-[scan_3s_linear_infinite]" />

                    {/* Main Display */}
                    <div className="flex items-center justify-between p-1 z-10">
                        <div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl lg:text-5xl font-black text-white tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                                    {data.temperature}°
                                </span>
                                <span className="text-[10px] text-blue-400 font-mono tracking-widest uppercase">
                                    {data.cityName}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 flex items-center gap-1.5">
                                    <Thermometer size={10} className="text-white/40" />
                                    <span className="text-[9px] text-white/60 font-mono">FEELS {data.apparentTemp}°</span>
                                </div>
                                <div className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 flex items-center gap-1.5">
                                    <SunDim size={10} className="text-amber-400/60" />
                                    <span className="text-[9px] text-white/60 font-mono">UV {data.uvIndex}</span>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
                            {getWeatherIcon(data.weatherCode, 42)}
                        </div>
                    </div>

                    {/* Grid Info */}
                    <div className="grid grid-cols-3 gap-1.5 mt-auto pt-2 border-t border-white/5 z-10">
                        <div className="bg-black/20 rounded p-1.5 border border-white/5 hover:border-blue-500/30 transition-colors group">
                            <div className="flex items-center justify-between mb-1">
                                <Wind size={10} className="text-blue-400 group-hover:animate-wing-wiggle" />
                                <span className="text-[8px] text-white/30 font-mono">WIND</span>
                            </div>
                            <div className="text-xs font-bold text-white group-hover:text-blue-200 transition-colors">
                                {data.windSpeed}<span className="text-[8px] opacity-50 ml-0.5">KM/H</span>
                            </div>
                        </div>

                        <div className="bg-black/20 rounded p-1.5 border border-white/5 hover:border-cyan-500/30 transition-colors group">
                            <div className="flex items-center justify-between mb-1">
                                <Droplets size={10} className="text-cyan-400 group-hover:animate-bounce" />
                                <span className="text-[8px] text-white/30 font-mono">HUM</span>
                            </div>
                            <div className="text-xs font-bold text-white group-hover:text-cyan-200 transition-colors">
                                {data.humidity}<span className="text-[8px] opacity-50 ml-0.5">%</span>
                            </div>
                        </div>

                        <div className="bg-black/20 rounded p-1.5 border border-white/5 hover:border-purple-500/30 transition-colors group">
                            <div className="flex items-center justify-between mb-1">
                                <Gauge size={10} className="text-purple-400 group-hover:rotate-45 transition-transform" />
                                <span className="text-[8px] text-white/30 font-mono">PRS</span>
                            </div>
                            <div className="text-xs font-bold text-white group-hover:text-purple-200 transition-colors">
                                {data.pressure}<span className="text-[8px] opacity-50 ml-0.5">hPa</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
