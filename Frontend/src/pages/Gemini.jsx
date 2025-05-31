import { useState } from "react";

const Gemini = () => {
    const [activity, setActivity] = useState("");
    const [time, setTime] = useState("");
    const [query, setQuery] = useState("");
    const [dailyPlan, setDailyPlan] = useState("");
    const [motivation, setMotivation] = useState("");
    const [taskPlan, setTaskPlan] = useState("");
    const [generalResponse, setGeneralResponse] = useState("");
    const [loading, setLoading] = useState(false);

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
        <div className="min-h-screen bg-bg text-text-primary p-6 md:p-10 font-serif">
            <h1 className="text-3xl font-semibold text-primary mb-8 text-center">Hi, I&apos;m Habita!</h1>
            <p className="text-text-muted text-center mb-10 text-lg max-w-xl mx-auto">
                Your personal assistant to guide and motivate you on your self-improvement journey.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">

                {/* --- Daily Plan Section --- */}
                <div className="bg-bg border border-secondary p-6 rounded-xl shadow-md flex flex-col items-center">
                    <h2 className="text-xl font-medium text-primary mb-5 text-center">Get Your Personalized Daily Plan</h2>
                    <button 
                        onClick={fetchDailyPlan} 
                        className="w-full bg-primary text-bg px-6 py-3 rounded-lg hover:bg-accent transition shadow-sm disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? "Loading..." : "Generate Daily Plan"}
                    </button>
                    {dailyPlan && (
                        <div className="mt-6 p-4 bg-primary/5 border border-secondary/30 rounded-lg w-full max-h-60 overflow-y-auto shadow-inner">
                            <h3 className="font-semibold text-text-primary mb-2">Your Daily Plan:</h3>
                            <pre className="whitespace-pre-wrap text-sm text-text-muted break-words">{dailyPlan}</pre>
                        </div>
                    )}
                </div>

                {/* --- Motivation Section --- */}
                <div className="bg-bg border border-secondary p-6 rounded-xl shadow-md flex flex-col items-center">
                    <h2 className="text-xl font-medium text-primary mb-5 text-center">Need a Boost of Motivation?</h2>
                    <button 
                        onClick={fetchMotivation} 
                        className="w-full bg-primary text-bg px-6 py-3 rounded-lg hover:bg-accent transition shadow-sm disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? "Loading..." : "Get Motivated!"}
                    </button>
                    {motivation && (
                        <div className="mt-6 p-4 bg-primary/5 border border-secondary/30 rounded-lg w-full max-h-60 overflow-y-auto shadow-inner">
                            <h3 className="font-semibold text-text-primary mb-2">Your Daily Dose of Motivation:</h3>
                            <p className="text-sm text-text-muted whitespace-pre-wrap break-words">{motivation}</p>
                        </div>
                    )}
                </div>

                {/* --- Task Plan Section --- */}
                <div className="md:col-span-2 bg-bg border border-secondary p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-medium text-primary mb-5 text-center">Break Down a Specific Task</h2>
                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                        <input
                            type="text"
                            placeholder="Enter activity (e.g., Morning Jog)"
                            value={activity}
                            onChange={(e) => setActivity(e.target.value)}
                            className="flex-1 p-3 bg-bg border border-secondary rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent shadow-sm"
                        />
                        <input
                            type="text"
                            placeholder="Time available (e.g., 30 mins)"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="flex-1 p-3 bg-bg border border-secondary rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent shadow-sm"
                        />
                    </div>
                    <button 
                        onClick={fetchTaskPlan} 
                        className="w-full bg-primary text-bg px-6 py-3 rounded-lg hover:bg-accent transition shadow-sm disabled:opacity-50"
                        disabled={loading || !activity}
                    >
                        {loading ? "Loading..." : "Plan This Task"}
                    </button>
                    {taskPlan && (
                        <div className="mt-6 p-4 bg-primary/5 border border-secondary/30 rounded-lg w-full max-h-72 overflow-y-auto shadow-inner">
                            <h3 className="font-semibold text-text-primary mb-2">Your Task Plan:</h3>
                            <pre className="whitespace-pre-wrap text-sm text-text-muted break-words">{taskPlan}</pre>
                        </div>
                    )}
                </div>

                {/* --- General Query Section --- */}
                <div className="md:col-span-2 bg-bg border border-secondary p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-medium text-primary mb-5 text-center">Have a Question for Habita?</h2>
                    <input
                        type="text"
                        placeholder="Ask anything about habits, productivity, or self-improvement..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full p-3 bg-bg border border-secondary rounded-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent shadow-sm mb-4"
                    />
                    <button 
                        onClick={fetchGeneralResponse} 
                        className="w-full bg-primary text-bg px-6 py-3 rounded-lg hover:bg-accent transition shadow-sm disabled:opacity-50"
                        disabled={loading || !query}
                    >
                        {loading ? "Loading..." : "Ask Habita"}
                    </button>
                    {generalResponse && (
                        <div className="mt-6 p-4 bg-primary/5 border border-secondary/30 rounded-lg w-full max-h-72 overflow-y-auto shadow-inner">
                            <h3 className="font-semibold text-text-primary mb-2">Habita Says:</h3>
                            <pre className="whitespace-pre-wrap text-sm text-text-muted break-words">{generalResponse}</pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Gemini;
