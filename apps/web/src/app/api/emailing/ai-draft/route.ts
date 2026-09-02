import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { prompt, currentBody, subject } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

    const systemContext = `You are an expert email writer. Your job is to draft or rewrite professional HTML email content based on instructions.
Always return ONLY the HTML body content of the email (no <html>, <head>, or <body> tags — just the inner content).
Use clean, professional formatting. Use <p> tags for paragraphs, <strong> for emphasis, and <br> for line breaks.
Make the tone warm, professional, and concise.`;

    let fullPrompt = systemContext + "\n\n";

    if (subject) {
      fullPrompt += `Email Subject: ${subject}\n\n`;
    }

    if (currentBody && currentBody.trim() && currentBody !== "<p><br></p>") {
      fullPrompt += `Current email draft:\n${currentBody}\n\n`;
      fullPrompt += `User instruction: ${prompt}\n\nPlease revise the email according to the instruction above.`;
    } else {
      fullPrompt += `User instruction: ${prompt}\n\nPlease draft a complete email based on the instruction above.`;
    }

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    // Clean up any markdown code fences the model might add
    const cleaned = text
      .replace(/```html\n?/gi, "")
      .replace(/```\n?/gi, "")
      .trim();

    return NextResponse.json({ html: cleaned });
  } catch (error: any) {
    console.error("AI Draft error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
