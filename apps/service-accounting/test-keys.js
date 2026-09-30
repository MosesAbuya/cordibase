const { GoogleGenAI } = require('@google/genai');
require('dotenv').config({ path: '../../.env' });
const ai = new GoogleGenAI({});

async function test() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'return the text "hello"'
    });
    console.log('response keys:', Object.keys(response));
    console.log('response.text:', response.text);
    console.log('response:', JSON.stringify(response, null, 2));
  } catch (e) {
    console.log('Error:', e);
  }
}
test();
