import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SideBar from "../../components/SideBar";
import FormattedPlan from "../components/FormattedPlan";

const Gemini = () => {
    const [activity, setActivity] = useState("");
    const [time, setTime] = useState("");
    const [query, setQuery] = useState("");
    const [dailyPlan, setDailyPlan] = useState("");
    const [motivation, setMotivation] = useState("");
    const [taskPlan, setTaskPlan] = useState("");
    const [generalResponse, setGeneralResponse] = useState("");
    const [loading, setLoading] = useState(false);
    const [activeSection, setActiveSection] = useState("daily");

    // --- Fetch Handlers ---

    const fetchDailyPlan = async () => {
        setLoading(true);
        try {
            // Step 1: Fetch goals
            const goalsResponse = await fetch("/backend/goals/");
            const goalsData = await goalsResponse.json();
            const goals = goalsData.goals || [];

            // Step 2: Call Gemini Daily Plan API
            const response = await fetch("/backend/gemini/getplan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ goals }),
            });
            const data = await response.json();
            setDailyPlan(data.reply);
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    const fetchMotivation = async () => {
        setLoading(true);
        try {
            const response = await fetch("/backend/gemini/motivation");
            const data = await response.json();
            setMotivation(data.reply);
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    const fetchTaskPlan = async () => {
        setLoading(true);
        try {
            const response = await fetch("/backend/gemini/task", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ activity, time }),
            });
            const data = await response.json();
            setTaskPlan(data.reply);
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    const fetchGeneralResponse = async () => {
        setLoading(true);
        try {
            const response = await fetch("/backend/gemini/general", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query }),
            });
            const data = await response.json();
            setGeneralResponse(data.reply);
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    return (
        <div className="flex min-h-screen bg-black text-white">
            <SideBar />
            <div className="flex-1 px-8 py-6 overflow-y-auto">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-2xl font-light tracking-widest uppercase mb-6">
                        Ask Habita
                    </h1>
                    <p className="text-white/70 mb-8">
                        Your personal AI assistant to guide your self-improvement journey.
                    </p>

                    {/* Navigation Tabs */}
                    <div className="flex gap-6 border-b border-white/10 mb-10 overflow-x-auto pb-1">
                        <button 
                            className={`pb-4 px-1 text-xs uppercase tracking-wider font-light relative whitespace-nowrap ${
                                activeSection === "daily" ? "text-white" : "text-white/50"
                            }`}
                            onClick={() => setActiveSection("daily")}
                        >
                            Daily Plan
                            {activeSection === "daily" && (
                                <motion.div 
                                    className="absolute bottom-0 left-0 w-full h-[1px] bg-white"
                                    layoutId="activeTab"
                                />
                            )}
                        </button>
                        <button 
                            className={`pb-4 px-1 text-xs uppercase tracking-wider font-light relative whitespace-nowrap ${
                                activeSection === "motivation" ? "text-white" : "text-white/50"
                            }`}
                            onClick={() => setActiveSection("motivation")}
                        >
                            Motivation
                            {activeSection === "motivation" && (
                                <motion.div 
                                    className="absolute bottom-0 left-0 w-full h-[1px] bg-white"
                                    layoutId="activeTab"
                                />
                            )}
                        </button>
                        <button 
                            className={`pb-4 px-1 text-xs uppercase tracking-wider font-light relative whitespace-nowrap ${
                                activeSection === "task" ? "text-white" : "text-white/50"
                            }`}
                            onClick={() => setActiveSection("task")}
                        >
                            Task Plan
                            {activeSection === "task" && (
                                <motion.div 
                                    className="absolute bottom-0 left-0 w-full h-[1px] bg-white"
                                    layoutId="activeTab"
                                />
                            )}
                        </button>
                        <button 
                            className={`pb-4 px-1 text-xs uppercase tracking-wider font-light relative whitespace-nowrap ${
                                activeSection === "ask" ? "text-white" : "text-white/50"
                            }`}
                            onClick={() => setActiveSection("ask")}
                        >
                            Ask Anything
                            {activeSection === "ask" && (
                                <motion.div 
                                    className="absolute bottom-0 left-0 w-full h-[1px] bg-white"
                                    layoutId="activeTab"
                                />
                            )}
                        </button>
                    </div>

                    {/* Content Sections */}
                    <AnimatePresence mode="wait">
                        {/* Daily Plan Section */}
                        {activeSection === "daily" && (
                            <motion.div
                                key="daily"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-6"
                            >
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-light">Your Daily Plan</h2>
                                    <button 
                                        onClick={fetchDailyPlan} 
                                        disabled={loading}
                                        className="px-6 py-3 bg-white text-black hover:bg-gray-200 transition-colors duration-300 text-xs uppercase tracking-wider font-light disabled:opacity-50"
                                    >
                                        {loading ? "Generating..." : "Generate Plan"}
                                    </button>
                                </div>
                                
                                {dailyPlan && (
                                    <FormattedPlan planData={dailyPlan} />
                                )}
                            </motion.div>
                        )}

                        {/* Motivation Section */}
                        {activeSection === "motivation" && (
                            <motion.div
                                key="motivation"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-6"
                            >
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-light">Daily Motivation</h2>
                                    <button 
                                        onClick={fetchMotivation} 
                                        disabled={loading}
                                        className="px-6 py-3 bg-white text-black hover:bg-gray-200 transition-colors duration-300 text-xs uppercase tracking-wider font-light disabled:opacity-50"
                                    >
                                        {loading ? "Generating..." : "Get Motivated"}
                                    </button>
                                </div>
                                
                                {motivation && (
                                    <div className="p-6 border border-white/10 whitespace-pre-line">
                                        {motivation}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Task Plan Section */}
                        {activeSection === "task" && (
                            <motion.div
                                key="task"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-6"
                            >
                                <h2 className="text-lg font-light">Plan a Specific Task</h2>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="activity" className="text-white/50 text-xs tracking-wider uppercase font-light mb-2 block">
                                            Activity
                                        </label>
                                        <input
                                            id="activity"
                                            type="text"
                                            placeholder="e.g., Learn JavaScript"
                                            value={activity}
                                            onChange={(e) => setActivity(e.target.value)}
                                            className="w-full p-3 bg-transparent border border-white/30 text-white focus:outline-none focus:border-white transition-colors duration-300 text-sm"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="time" className="text-white/50 text-xs tracking-wider uppercase font-light mb-2 block">
                                            Time Available (optional)
                                        </label>
                                        <input
                                            id="time"
                                            type="text"
                                            placeholder="e.g., 2 hours"
                                            value={time}
                                            onChange={(e) => setTime(e.target.value)}
                                            className="w-full p-3 bg-transparent border border-white/30 text-white focus:outline-none focus:border-white transition-colors duration-300 text-sm"
                                        />
                                    </div>
                                    
                                    <button 
                                        onClick={fetchTaskPlan} 
                                        disabled={loading || !activity}
                                        className="w-full px-6 py-3 bg-white text-black hover:bg-gray-200 transition-colors duration-300 text-xs uppercase tracking-wider font-light disabled:opacity-50"
                                    >
                                        {loading ? "Generating..." : "Create Task Plan"}
                                    </button>
                                </div>
                                
                                {taskPlan && (
                                    <div className="p-6 border border-white/10 whitespace-pre-line mt-4">
                                        {taskPlan}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Ask Anything Section */}
                        {activeSection === "ask" && (
                            <motion.div
                                key="ask"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-6"
                            >
                                <h2 className="text-lg font-light">Ask Anything</h2>
                                
                                <div className="flex items-center gap-4">
                                    <input
                                        type="text"
                                        placeholder="Ask me anything about habits, productivity, or self-improvement..."
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        className="flex-1 p-3 bg-transparent border border-white/30 text-white focus:outline-none focus:border-white transition-colors duration-300 text-sm"
                                    />
                                    <button 
                                        onClick={fetchGeneralResponse} 
                                        disabled={loading || !query}
                                        className="px-6 py-3 bg-white text-black hover:bg-gray-200 transition-colors duration-300 text-xs uppercase tracking-wider font-light disabled:opacity-50 whitespace-nowrap"
                                    >
                                        {loading ? "Thinking..." : "Ask"}
                                    </button>
                                </div>
                                
                                {generalResponse && (
                                    <div className="p-6 border border-white/10 whitespace-pre-line mt-4">
                                        {generalResponse}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Gemini;
