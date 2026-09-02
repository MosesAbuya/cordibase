import re
with open('apps/service-crm/src/index.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Add the AI import back at the top
import_statement = "import { GoogleGenAI } from '@google/genai';\nconst ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;\n"

content = import_statement + content

with open('apps/service-crm/src/index.ts', 'w', encoding='utf-8') as f:
    f.write(content)
