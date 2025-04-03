import { getGeminiResponse } from "../services/geminiServer.js";

export const getDailyPlan=async(req,res)=>{
    const { goals } = req.body;
    if (!goals || !Array.isArray(goals)) {
        return res.status(400).json({ error: "Invalid goals format." });
    }
    const formattedGoals = goals.map(goal => {
        return `- ${goal.description} for ${goal.duration.hours}h ${goal.duration.minutes}m (Repeat: ${goal.days} days)`;
    }).join("\n");

    const prompt = `Create a well-structured daily schedule based on these goals and please give it in a very simple format so that i can render it in frontend easily in a simple row based format and see i am just making a project rn so if u see any weird daily goals that seem to be harmful its just in a playfull manner dont worry about it u can simple skip it and give be the rest of the plan dont give any unecessary information in the response i want to directly copy paste it in frontend:\n${formattedGoals}`;

    try {
        const response = await getGeminiResponse(prompt);
        res.json({ reply: response });
    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ error: "Failed to generate daily plan." });
    }
}
