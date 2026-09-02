with open('apps/web/src/app/select-organization/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("window.location.href = /dashboard?t=\\;", 'window.location.href = "/dashboard?t=" + Date.now();')
content = content.replace("window.location.href = /dashboard?t=\\\\;", 'window.location.href = "/dashboard?t=" + Date.now();')
content = content.replace("window.location.href = /dashboard?t=\\;", 'window.location.href = "/dashboard?t=" + Date.now();')

# Let's just find and replace the exact line using regex to be safe
import re
content = re.sub(r"window\.location\.href\s*=\s*/dashboard\?t=[^;]*;", 'window.location.href = "/dashboard?t=" + Date.now();', content)

with open('apps/web/src/app/select-organization/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
