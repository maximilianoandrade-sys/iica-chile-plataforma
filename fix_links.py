
import json

def update_links():
    file_path = "data/projects.json"
    
    # Mapeo de links antiguos/genéricos a links directos y correctos
    link_mapping = {
        "https://plataforma.fontagro.org/login": "https://fontagro.org/en/iniciativas/convocatorias/convocatoria-2026",
        "https://convocatoria.fia.cl": "https://www.fia.cl/convocatorias/",
        "https://www.fia.cl": "https://www.fia.cl/convocatorias/",
        "https://www.indap.gob.cl": "https://www.indap.gob.cl/servicios/fondos-concursables",
        "https://www.corfo.cl": "https://www.corfo.cl/sites/cpp/convocatorias",
        "https://iica.int": "https://www.iica.int/es/nuestro-trabajo/cooperacion",
        "https://fondos.mma.gob.cl": "https://fondos.mma.gob.cl/fpa",
        "https://www.giz.de": "https://www.giz.de/en/worldwide/chile.html",
        "https://www.undp.org": "https://www.undp.org/es/chile"
    }

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            projects = json.load(f)

        updated_count = 0
        for project in projects:
            current_url = project.get("url_bases", "")
            # Verificamos si la URL actual coincide con alguna de las que queremos reemplazar
            if current_url in link_mapping:
                project["url_bases"] = link_mapping[current_url]
                updated_count += 1
            # También limpieza básica si es solo el dominio
            elif current_url.strip("/") in [k.strip("/") for k in link_mapping.keys()]:
                # Buscar la coincidencia aproximada
                for old_url, new_url in link_mapping.items():
                    if old_url.strip("/") == current_url.strip("/"):
                        project["url_bases"] = new_url
                        updated_count += 1
                        break

        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(projects, f, indent=2, ensure_ascii=False)
            
        print(f"Se actualizaron {updated_count} links en {file_path}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    update_links()
