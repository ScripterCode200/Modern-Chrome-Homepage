import DailyTimeline from "./components/DailyTimeline";
import TodoList from "./components/TodoList";
import FocusTimer from "./components/FocusTimer";
import TechCard from "./components/TechCard";
import WeatherWidget from "./components/WeatherWidget";
import SystemNav from "./components/SystemNav";
import Sidebar from "./components/Sidebar";
import LearningPath from "./components/LearningPath";
import ControlRoomHeader from "./components/ControlRoomHeader";
import SystemResources from "./components/SystemResources";
import DayOverview from "./components/DayOverview";

export default function Home() {
    return (
        <div className="flex flex-col h-screen bg-[#050505] text-white selection:bg-purple-500/30 overflow-hidden">
            {/* Top Status Bar */}
            <SystemNav />

            <main className="flex-1 flex overflow-hidden relative">
                {/* Left Sidebar Overlay */}
                <Sidebar />
                {/* Main Dashboard Grid */}
                <div className="flex-1 p-4 md:p-8 md:pl-20 overflow-y-auto w-full">
                    <div className="max-w-7xl mx-auto h-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 grid-rows-auto md:grid-rows-3 gap-6 pb-20 md:pb-0">

                        {/* Header / Welcome Area - Spans full width on mobile, 2 on tablet, 3 on desktop */}
                        <div className="col-span-1 md:col-span-2 lg:col-span-3 row-span-1">
                            <ControlRoomHeader />
                        </div>

                        {/* Weather / Quick Info - Compact */}
                        <TechCard title="LocalEnv" className="col-span-1 row-span-1 min-h-[150px] md:min-h-0 bg-[#06070B]">
                            <WeatherWidget />
                        </TechCard>

                        {/* Todo List - Narrower now (1 col wide, 2 rows tall) to look like a list */}
                        <TechCard title="Tasks_Module" className="col-span-1 row-span-2 min-h-[300px] md:min-h-0 bg-[#06070B]">
                            <TodoList />
                        </TechCard>

                        {/* Focus Timer - Squared */}
                        <TechCard title="Focus_Core" className="col-span-1 row-span-1 min-h-[250px] md:min-h-0 bg-[#06070B]">
                            <FocusTimer />
                        </TechCard>

                        {/* Day Overview - New Component */}
                        <TechCard title="Day_Log" className="col-span-1 row-span-1 min-h-[200px] md:min-h-0 bg-[#06070B]">
                            <DayOverview />
                        </TechCard>

                        {/* Learning Path - Tall & Narrow */}
                        <TechCard title="Skill_Matrix" className="col-span-1 row-span-2 min-h-[180px] md:min-h-0 bg-[#06070B]">
                            <LearningPath />
                        </TechCard>

                        {/* System Resources - Wide (2 cols) to fill the gap under Focus Timer */}
                        <TechCard title="Sys_Resources" className="col-span-1 lg:col-span-2 row-span-1 min-h-[180px] md:min-h-0 bg-[#06070B]">
                            <SystemResources />
                        </TechCard>

                    </div>
                </div>

                {/* Right Rail - Timeline (Hidden on mobile) */}
                <div className="w-24 border-l border-white/5 bg-[#0a0a0a] z-20 hidden md:block relative">
                    <DailyTimeline />
                </div>
            </main>
        </div>
    );
}
