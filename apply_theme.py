import os
import re

replacements = [
    (r"bg-\[\#F4F6FA\]", "bg-linen"),
    (r"bg-\[\#F8FAFC\]", "bg-linen"),
    (r"bg-\[\#0B1120\]", "bg-ink"),
    (r"bg-\[\#FFFFFF\]", "bg-white"),
    (r"bg-\[\#0F172A\]", "bg-ink"),
    (r"border-\[\#EAECF0\]", "border-ink/10"),
    (r"border-\[\#E2E8F0\]", "border-ink/10"),
    (r"dark:border-slate-800", "dark:border-white/10"),
    (r"text-\[\#1D2939\]", "text-ink"),
    (r"text-\[\#0F172A\]", "text-ink"),
    (r"text-\[\#667085\]", "text-ink/60"),
    (r"text-\[\#64748B\]", "text-ink/60"),
    (r"text-\[\#A83C2E\]", "text-thread"),
    (r"bg-\[\#A83C2E\]", "bg-thread"),
    (r"border-\[\#A83C2E\]", "border-thread"),
    (r"selection:bg-\[\#A83C2E\]", "selection:bg-thread"),
    (r"bg-\[\#1B4FD8\]", "bg-thread"), # replace the old blue
    (r"text-\[\#1B4FD8\]", "text-thread"),
    (r"border-\[\#1B4FD8\]", "border-thread"),
    (r"ring-\[\#1B4FD8\]", "ring-thread"),
    (r"focus:ring-\[\#1B4FD8\]", "focus:ring-thread"),
]

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    original = content
    for pattern, replacement in replacements:
        content = re.sub(pattern, replacement, content)
        
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('apps/web/src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            process_file(os.path.join(root, file))
