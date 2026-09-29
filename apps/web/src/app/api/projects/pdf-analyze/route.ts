import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "No GEMINI_API_KEY found" }, { status: 500 });
    }

    const ai = new GoogleGenAI({});
    
    const prompt = `You are an expert AI assistant that analyzes project documents, meeting minutes, and specifications.
    
    Analyze the attached document and extract key project deliverables, milestones, and required meetings.
    
    Return EXACTLY a JSON string with the following schema:
    {
      "milestones": [
        { "title": "string", "description": "string" }
      ],
      "meetings": [
        { "title": "string", "purpose": "string" }
      ]
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        prompt,
        {
          inlineData: {
            data: buffer.toString('base64'),
            mimeType: file.type === "application/pdf" ? "application/pdf" : "text/plain"
          }
        }
      ]
    });

    let resultText = response.text || "{}";
    resultText = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
    const extracted = JSON.parse(resultText);

    return NextResponse.json(extracted);
  } catch (error: any) {
    console.error("PDF Analyze error:", error);
    return NextResponse.json({ error: error.message || "Failed to analyze document" }, { status: 500 });
  }
}
