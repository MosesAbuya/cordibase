with open('apps/web/src/app/select-organization/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("window.location.href = /onboarding/payment;", 'window.location.href = "/onboarding/payment";')

with open('apps/web/src/app/select-organization/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
