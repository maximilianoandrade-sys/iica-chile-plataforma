import json
from proyectos_base import proyectos_raw, convertir_proyectos_raw_a_formato

def rebuild():
    formatted = convertir_proyectos_raw_a_formato()
    
    # Map to Prisma schema Project model
    projects = []
    for i, p in enumerate(formatted):
        projects.append({
            "id": i + 1,
            "nombre": p['Nombre'],
            "institucion": p['Fuente'],
            "monto": 0.0, # Placeholder
            "fecha_cierre": p['Fecha cierre'] if p['Fecha cierre'] != 'Continuo' and p['Fecha cierre'] != 'Ventanilla Abierta' else "2026-12-31",
            "estado": p['Estado'],
            "categoria": "Nacional" if p['Fuente'] in ['FIA', 'INDAP', 'CORFO', 'Sercotec', 'CNR', 'ANID'] else "Internacional",
            "url_bases": p['Enlace'],
            "ambito": "Nacional",
            "viabilidadIICA": "Media",
            "rolIICA": "Indirecto"
        })
        
    with open("data/projects.json", "w", encoding="utf-8") as f:
        json.dump(projects, f, indent=2, ensure_ascii=False)
        
    print(f"Rebuilt data/projects.json with {len(projects)} projects")

if __name__ == "__main__":
    rebuild()
