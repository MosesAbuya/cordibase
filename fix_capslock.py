with open('apps/web/src/app/login/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('''  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setCapsLockActive(e.getModifierState("CapsLock"));
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);''', '''  // Caps Lock detection is now handled directly on the inputs''')

# Now add onKeyUp to the inputs
content = content.replace('''onChange={(e) => setEmail(e.target.value)}
                required''', '''onChange={(e) => setEmail(e.target.value)}
                onKeyUp={(e) => setCapsLockActive(e.getModifierState("CapsLock"))}
                required''')
content = content.replace('''onChange={(e) => setPassword(e.target.value)}
                  required''', '''onChange={(e) => setPassword(e.target.value)}
                  onKeyUp={(e) => setCapsLockActive(e.getModifierState("CapsLock"))}
                  required''')

with open('apps/web/src/app/login/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

with open('apps/web/src/app/register/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('''  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setCapsLockActive(e.getModifierState("CapsLock"));
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);''', '''  // Caps Lock detection is now handled directly on the inputs''')

content = content.replace('''onChange={(e) => setName(e.target.value)}
                required''', '''onChange={(e) => setName(e.target.value)}
                onKeyUp={(e) => setCapsLockActive(e.getModifierState("CapsLock"))}
                required''')
content = content.replace('''onChange={(e) => setEmail(e.target.value)}
                required''', '''onChange={(e) => setEmail(e.target.value)}
                onKeyUp={(e) => setCapsLockActive(e.getModifierState("CapsLock"))}
                required''')
content = content.replace('''onChange={(e) => setPassword(e.target.value)}
                  required''', '''onChange={(e) => setPassword(e.target.value)}
                  onKeyUp={(e) => setCapsLockActive(e.getModifierState("CapsLock"))}
                  required''')

with open('apps/web/src/app/register/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

