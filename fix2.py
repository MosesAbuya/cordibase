import re
with open('apps/service-crm/src/index.ts', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r"import \{ GoogleGenAI \} from '@google/genai';\r?\nconst ai = process\.env\.GEMINI_API_KEY \? new GoogleGenAI\(\{ apiKey: process\.env\.GEMINI_API_KEY \}\) : null;\r?\n\r?\nfastify\.get\('/api/crm/tickets/:id/messages', async \(request, reply\) => \{"

replacement = "fastify.get('/api/crm/tickets/:id/messages', async (request, reply) => {"

new_content = re.sub(pattern, replacement, content)

with open('apps/service-crm/src/index.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)
