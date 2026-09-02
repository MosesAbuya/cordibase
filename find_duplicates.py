import re

with open('apps/service-crm/src/index.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

routes_seen = set()
for i, line in enumerate(lines):
    match = re.search(r"fastify\.(get|post|put|delete)\('([^']+)'", line)
    if match:
        route = f"{match.group(1)} {match.group(2)}"
        if route in routes_seen:
            print(f"Duplicate route at line {i+1}: {route}")
        else:
            routes_seen.add(route)
            print(f"Route at line {i+1}: {route}")
