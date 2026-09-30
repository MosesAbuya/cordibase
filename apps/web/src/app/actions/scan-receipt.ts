"use server";

import { GoogleGenAI } from "@google/genai";

export async function scanReceiptWithAI(base64Image: string, mimeType: string) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return { success: false, error: "AI scanning requires GEMINI_API_KEY" };
    }

    const ai = new GoogleGenAI({});
    
    // We explicitly tell Gemini to return a specific JSON schema
    const prompt = `
You are an expert accountant scanning a receipt.
Extract the info from this receipt image.
Return EXACTLY a JSON object with this schema and NO markdown formatting:
{
  "vendor_name": "string (name of the store/vendor)",
  "total_amount": "number (the final total amount, numbers only)",
  "currency": "string (3 letter code, guess from symbol, default USD)",
  "date": "string (YYYY-MM-DD)",
  "description": "string (brief summary of items)",
  "suggested_category": "string (e.g. 'Office Supplies', 'Software Subscriptions', 'Travel & Transport', 'Meals & Entertainment', 'Utilities', 'Marketing & Advertising', 'Professional Services', 'Rent & Lease', 'Other')"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        prompt,
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType || 'image/jpeg'
          }
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
             vendor_name: { type: "STRING" },
             total_amount: { type: "NUMBER" },
             currency: { type: "STRING" },
             date: { type: "STRING" },
             description: { type: "STRING" },
             suggested_category: { type: "STRING" }
          },
          required: ["vendor_name", "total_amount", "currency", "date", "description", "suggested_category"]
        }
      }
    });

    let text = response.text;
    if (!text) {
      console.error("Gemini returned empty text! Full response:", JSON.stringify(response, null, 2));
      return { success: false, error: "AI could not read the receipt. It may be too blurry." };
    }
    
    // Clean up any potential markdown formatting if the model disobeys responseMimeType
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let extracted: any = {};
    try {
      extracted = JSON.parse(text);
    } catch (parseError) {
      console.error("Failed to parse Gemini output:", text);
      return { success: false, error: "AI returned invalid data format." };
    }
    
    // Fill in missing fields with fallbacks
    if (!extracted.vendor_name || extracted.vendor_name === "unknown") extracted.vendor_name = "N/A";
    if (extracted.total_amount === undefined || extracted.total_amount === null) extracted.total_amount = 0;
    if (!extracted.currency) extracted.currency = "USD";
    if (!extracted.date) extracted.date = new Date().toISOString().split('T')[0];

    return { success: true, extracted };
  } catch (error: any) {
    console.error("Server Action Scan Error:", error);
    return { success: false, error: error.message || "Failed to scan receipt" };
  }
}
