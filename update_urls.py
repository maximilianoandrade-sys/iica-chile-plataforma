import json
import re

def slugify(s):
    s = s.lower().strip()
    s = re.sub(r'[^\w\s-]', '', s)
    s = re.sub(r'[\s_-]+', '-', s)
    s = re.sub(r'^-+|-+$', '', s)
    return s

with open("data/projects.json", "r", encoding="utf-8") as f:
    data = json.load(f)

for p in data:
    url = p.get("url_bases", "https://fondos.gob.cl")
    if url.endswith('/'): url = url[:-1]
    
    # Generate a specific slug
    slug = f"{p['id']}-{slugify(p['nombre'][:50])}"
    
    # If the URL does not contain the project id, let's append our specific slug.
    if str(p['id']) not in url:
        p["url_bases"] = f"{url}/{slug}"

with open("data/projects.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
print("URLs actualizadas exitosamente.")
