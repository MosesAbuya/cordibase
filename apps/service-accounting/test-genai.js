const { GoogleGenAI } = require('@google/genai');
require('dotenv').config({ path: '../../.env' });
const ai = new GoogleGenAI({});
const prompt = 'Return exactly {"status": "ok"}';
ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: [
    prompt,
    {
      inlineData: {
        data: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        mimeType: 'image/png'
      }
    }
  ]
}).then(res => {
  console.log('Success:', res.text);
}).catch(e => {
  console.log('Error caught:', e.message);
});
