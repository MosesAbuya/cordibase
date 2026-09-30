const fs = require('fs');
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config({ path: '../../.env' });
const ai = new GoogleGenAI({});

async function test() {
  const imageBuf = fs.readFileSync('C:/Users/moses/.gemini/antigravity/brain/fb6a7763-8dbe-47a4-b3b3-1773b26f88b1/.user_uploaded/media_1790764843434.png');
  const base64 = imageBuf.toString('base64');
  
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

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        prompt,
        {
          inlineData: {
            data: base64,
            mimeType: 'image/png'
          }
        }
      ]
    });
    console.log('Response Text:', response.text);
    if (!response.text) {
      console.log('Full response:', JSON.stringify(response, null, 2));
    }
  } catch (e) {
    console.log('Error:', e);
  }
}
test();
