import re

for file in ['apps/web/src/app/login/page.tsx', 'apps/web/src/app/register/page.tsx']:
    with open(file, 'rb') as f:
        content = f.read()
    
    # Replace non-ascii bytes
    clean_content = b''
    for byte in content:
        if byte < 128:
            clean_content += bytes([byte])
        else:
            clean_content += b'*'
            
    with open(file, 'wb') as f:
        f.write(clean_content)
