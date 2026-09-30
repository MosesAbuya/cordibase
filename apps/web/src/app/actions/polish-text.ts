"use server";

import { GoogleGenAI } from "@google/genai";

export async function polishTextWithAI(text: string, context: 'description' | 'notes') {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return { success: false, error: "AI requires GEMINI_API_KEY" };
    }

    const ai = new GoogleGenAI({});
    
    let prompt = "";
    if (context === 'description') {
      prompt = `
You are an expert accountant. Please polish the following rough transaction description into a concise, professional title for an accounting ledger.
Keep it extremely short, professional, and clear. Do not include markdown or quotes.
Original Text: "${text}"
`;
    } else {
      prompt = `
You are an expert accountant. Please polish the following rough notes into a professional, detailed accounting report or justification.
Correct grammar, structure the information clearly, and maintain all facts. Do not include markdown formatting if unnecessary, just clean text.
Original Text: "${text}"
`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    let polished = response.text || text;
    polished = polished.replace(/^["']|["']$/g, '').trim(); // Remove leading/trailing quotes

    return { success: true, polished };
  } catch (error: any) {
    console.error("Server Action Polish Error:", error);
    return { success: false, error: error.message || "Failed to polish text" };
  }
}
