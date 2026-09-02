with open('apps/web/src/app/login/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()
    
content = content.replace("console.log(Logging in with );", 'console.log("Logging in with " + provider);')

with open('apps/web/src/app/login/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

with open('apps/web/src/app/register/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("console.log(Signing up with );", 'console.log("Signing up with " + provider);')

with open('apps/web/src/app/register/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
