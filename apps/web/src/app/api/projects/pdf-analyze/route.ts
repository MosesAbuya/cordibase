import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
const pdfParse = require("pdf-parse");

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let text = "";
    
    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      const pdfData = await pdfParse(buffer);
      text = pdfData.text;
    } else {
      text = buffer.toString("utf-8"); // fallback for txt
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `You are an AI assistant analyzing a project document. 
The document is as follows:
${text.substring(0, 8000)}

Please extract updates for the project. Output ONLY valid JSON in this exact structure:
{
  "proposedMilestones": [
    { "title": "...", "description": "...", "status": "todo", "dueDate": "YYYY-MM-DD" }
  ],
  "proposedMeetings": [
    { "title": "...", "minutesText": "...", "startTime": "YYYY-MM-DDTHH:mm:ssZ" }
  ],
  "summary": "A 2 sentence summary of the extracted changes"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    let aiText = response.text || "{}";
    aiText = aiText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const data = JSON.parse(aiText);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
