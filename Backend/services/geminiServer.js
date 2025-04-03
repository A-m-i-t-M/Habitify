import dotenv from 'dotenv'
import {GoogleGenerativeAI} from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const getGeminiResponse = async (userMessage) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const response = await model.generateContent(userMessage);
        return response.response.text(); 
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "Sorry, I couldn't process your request at the moment.";
    }
};

