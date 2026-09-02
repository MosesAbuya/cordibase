import re

with open('apps/service-crm/src/index.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# delete lines 852 to 1034 (indices 852 to 1034)
# Wait, index 852 is line 853. 
# Let's find exactly the range based on content.
start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if i >= 800 and i < 900 and line.strip() == '// Service - Knowledge Base':
        start_idx = i
        break

for i in range(start_idx, len(lines)):
    if line.strip() == '// === Reports & Dashboards ===':
        # wait, let's search from start_idx downwards
        pass

for i in range(start_idx, len(lines)):
    if lines[i].strip() == '// === Reports & Dashboards ===':
        end_idx = i
        break

if start_idx != -1 and end_idx != -1:
    new_lines = lines[:start_idx] + lines[end_idx:]
    with open('apps/service-crm/src/index.ts', 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    print(f"Deleted from {start_idx} to {end_idx}")
else:
    print("Could not find boundaries")
