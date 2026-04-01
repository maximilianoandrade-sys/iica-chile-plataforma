import json
from datetime import datetime

# 1. Nuevos proyectos para inyectar
nuevos_proyectos = [
    {
        "id": 1201,
        "nombre": "CNR – Concurso N°07-2026: Riego para Mujeres Agricultoras (Nivel Nacional)",
        "institucion": "CNR",
        "monto": 2600000000,
        "fecha_cierre": "2026-04-21",
        "estado": "Abierto",
        "categoria": "Nacional",
        "url_bases": "https://www.cnr.gob.cl/agricultores/concursos-de-riego-y-drenaje/bases-de-concurso/",
        "ambito": "Nacional",
        "viabilidadIICA": "Alta",
        "porcentajeViabilidad": 90,
        "rolIICA": "Asesor",
        "responsableIICA": "Equipo Riego IICA Chile",
        "objetivo": "Fortalecer el acceso equitativo al fomento del riego para mujeres rurales.",
        "ejeIICA": "Inclusión y Género"
    },
    {
        "id": 1202,
        "nombre": "INDAP – SIRSD-S 2026: Recuperación de Suelos Degradados (Zona Sur)",
        "institucion": "INDAP",
        "monto": 150000000,
        "fecha_cierre": "2026-04-13",
        "estado": "Abierto",
        "categoria": "Nacional",
        "url_bases": "https://www.indap.gob.cl/servicios/fondos-concursables",
        "ambito": "Nacional",
        "viabilidadIICA": "Baja",
        "porcentajeViabilidad": 30,
        "rolIICA": "Indirecto",
        "objetivo": "Incentivos para prácticas sustentables de manejo de suelos.",
        "ejeIICA": "Suelo y Agua"
    },
    {
        "id": 1203,
        "nombre": "Fomento Biobío – Desarrolla Inversión 2026: Activo Fijo e Infraestructura",
        "institucion": "GORE Biobío",
        "monto": 50000000,
        "fecha_cierre": "2026-04-17",
        "estado": "Abierto",
        "categoria": "Nacional",
        "url_bases": "https://www.fomentobiobio.cl",
        "ambito": "Regional",
        "viabilidadIICA": "Media",
        "porcentajeViabilidad": 60,
        "rolIICA": "Asesor",
        "ejeIICA": "Desarrollo Territorial"
    },
    {
        "id": 1204,
        "nombre": "BID – Iniciativa de Bienes Públicos Regionales (BPR) 2026",
        "institucion": "BID",
        "monto": 400000000,
        "fecha_cierre": "2026-06-01",
        "estado": "Abierto",
        "categoria": "Internacional",
        "url_bases": "https://www.iadb.org",
        "ambito": "Internacional",
        "viabilidadIICA": "Alta",
        "porcentajeViabilidad": 85,
        "rolIICA": "Implementador",
        "objetivo": "Soluciones transfronterizas para el desarrollo de ALC.",
        "ejeIICA": "Cooperación Internacional"
    },
    {
        "id": 1205,
        "nombre": "Horizonte Europa – Clúster 6: Sistemas Agroalimentarios Sostenibles 2026",
        "institucion": "Unión Europea",
        "monto": 1200000000,
        "fecha_cierre": "2026-09-15",
        "estado": "Próxima",
        "categoria": "Internacional",
        "url_bases": "https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/home",
        "ambito": "Internacional",
        "viabilidadIICA": "Alta",
        "porcentajeViabilidad": 75,
        "rolIICA": "Ejecutor",
        "ejeIICA": "Innovación y Cambio Climático"
    },
    {
        "id": 1206,
        "nombre": "AGCID Chile – Fondo Chile de Cooperación Técnica para el Desarrollo 2026",
        "institucion": "AGCID",
        "monto": 120000000,
        "fecha_cierre": "2026-04-30",
        "estado": "Abierto",
        "categoria": "Internacional",
        "url_bases": "https://www.agcid.gob.cl",
        "ambito": "Regional",
        "viabilidadIICA": "Alta",
        "porcentajeViabilidad": 90,
        "rolIICA": "Ejecutor",
        "ejeIICA": "Cooperación Sur-Sur"
    },
    {
        "id": 1207,
        "nombre": "AECID – Subvenciones para Proyectos de Innovación y Desarrollo Agrosostenible",
        "institucion": "AECID",
        "monto": 250000000,
        "fecha_cierre": "2026-05-31",
        "estado": "Próxima",
        "categoria": "Internacional",
        "url_bases": "https://www.aecid.es/es/Paginas/Convocatorias.aspx",
        "ambito": "Regional",
        "viabilidadIICA": "Media",
        "porcentajeViabilidad": 65,
        "rolIICA": "Implementador"
    },
    {
        "id": 1208,
        "nombre": "USAID – Feed the Future: Resiliencia en Cadenas de Valor Agrícolas",
        "institucion": "USAID",
        "monto": 800000000,
        "fecha_cierre": "2026-11-15",
        "estado": "Próxima",
        "categoria": "Internacional",
        "url_bases": "https://www.usaid.gov",
        "ambito": "Internacional",
        "viabilidadIICA": "Media",
        "porcentajeViabilidad": 55,
        "rolIICA": "Implementador"
    },
    {
        "id": 1209,
        "nombre": "GIZ – Programa de Transformación hacia la Economía Circular Agrícola Chile",
        "institucion": "GIZ",
        "monto": 300000000,
        "fecha_cierre": "2026-10-30",
        "estado": "Próxima",
        "categoria": "Internacional",
        "url_bases": "https://www.giz.de/en/worldwide/chile.html",
        "ambito": "Regional",
        "viabilidadIICA": "Alta",
        "porcentajeViabilidad": 80,
        "rolIICA": "Ejecutor"
    },
    {
        "id": 1210,
        "nombre": "FONDECYT / ANID – Postdoctorado en Ciencias Agrícolas y Rurales 2026",
        "institucion": "ANID",
        "monto": 90000000,
        "fecha_cierre": "2026-04-20",
        "estado": "Abierto",
        "categoria": "Nacional",
        "url_bases": "https://www.anid.cl",
        "ambito": "Nacional",
        "viabilidadIICA": "Baja",
        "porcentajeViabilidad": 40,
        "rolIICA": "Indirecto"
    }
]

file_path = "data/projects.json"

with open(file_path, "r", encoding="utf-8") as f:
    current_projects = json.load(f)

# 2. Filtrar solo proyectos de 2026 en adelante
cleaned_projects = [p for p in current_projects if p["fecha_cierre"].startswith("2026")]

# 3. Evitar duplicados por ID
existing_ids = {p["id"] for p in cleaned_projects}
for np in nuevos_proyectos:
    if np["id"] not in existing_ids:
        cleaned_projects.append(np)

# 4. Guardar
with open(file_path, "w", encoding="utf-8") as f:
    json.dump(cleaned_projects, f, indent=2, ensure_ascii=False)

print(f"Limpieza completada. Total proyectos 2026+: {len(cleaned_projects)}")
