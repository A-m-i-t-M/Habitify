import React, { useState } from "react";

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
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Hi I am Habita! Your personal assistant to aid you self improvement journey.</h2>

            {/* --- Daily Plan Section --- */}
            <div className="mb-6">
                <button 
                    onClick={fetchDailyPlan} 
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    {loading ? "Loading..." : "Get Daily Plan"}
                </button>
                {dailyPlan && (
                    <div className="mt-4 p-4 bg-gray-100 rounded">
                        <h3 className="font-semibold">Daily Plan:</h3>
                        <pre>{dailyPlan}</pre>
                    </div>
                )}
            </div>

            {/* --- Motivation Section --- */}
            <div className="mb-6">
                <button 
                    onClick={fetchMotivation} 
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                    {loading ? "Loading..." : "Get Motivation"}
                </button>
                {motivation && (
                    <div className="mt-4 p-4 bg-gray-100 rounded">
                        <h3 className="font-semibold">Motivation:</h3>
                        <p>{motivation}</p>
                    </div>
                )}
            </div>

            {/* --- Task Plan Section --- */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Activity"
                    value={activity}
                    onChange={(e) => setActivity(e.target.value)}
                    className="border p-2 mr-2 rounded"
                />
                <input
                    type="text"
                    placeholder="Time (optional)"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="border p-2 mr-2 rounded"
                />
                <button 
                    onClick={fetchTaskPlan} 
                    className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                >
                    {loading ? "Loading..." : "Get Task Plan"}
                </button>
                {taskPlan && (
                    <div className="mt-4 p-4 bg-gray-100 rounded">
                        <h3 className="font-semibold">Task Plan:</h3>
                        <pre>{taskPlan}</pre>
                    </div>
                )}
            </div>

            {/* --- General Query Section --- */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Ask anything..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="border p-2 mr-2 rounded w-1/2"
                />
                <button 
                    onClick={fetchGeneralResponse} 
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                    {loading ? "Loading..." : "Ask Gemini"}
                </button>
                {generalResponse && (
                    <div className="mt-4 p-4 bg-gray-100 rounded">
                        <h3 className="font-semibold">Gemini Says:</h3>
                        <pre>{generalResponse}</pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Gemini;
