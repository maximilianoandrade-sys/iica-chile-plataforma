# 👇 LISTA REAL DE PROYECTOS PARA LA PLATAFORMA IICA CHILE

proyectos_raw = [
    {
        "titulo": "Dashboard Proyectos IICA",
        "descripcion": "Plataforma oficial de proyectos IICA",
        "estado": "Abierto",
        "monto": "",
        "fecha": "Continuo",
        "fuente": "IICA",
        "link": "https://apps.iica.int/dashboardproyectos/"
    },
    {
        "titulo": "Licitaciones IICA",
        "descripcion": "Convocatorias y licitaciones abiertas IICA",
        "estado": "Abierto",
        "monto": "",
        "fecha": "2025-12-31",
        "fuente": "IICA",
        "link": "https://iica.int/es/licitaciones/"
    },
    {
        "titulo": "Convocatorias FIA Innovar",
        "descripcion": "Fondos para innovación agrícola Chile",
        "estado": "Abierto",
        "monto": "CLP 250M",
        "fecha": "2025-12-15",
        "fuente": "FIA",
        "link": "https://www.fia.cl/pilares-de-accion/impulso-para-innovar/convocatorias-y-licitaciones/"
    },
    {
        "titulo": "Mi Primer Negocio Rural INDAP",
        "descripcion": "Apoyo a emprendimientos rurales",
        "estado": "Abierto",
        "monto": "Hasta CLP 8M",
        "fecha": "Continuo",
        "fuente": "INDAP",
        "link": "http://www.indap.gob.cl/plataforma-de-servicios/mi-primer-negocio-rural"
    },
    {
        "titulo": "Licitaciones INIA",
        "descripcion": "Convocatorias Instituto Investigación Agropecuaria",
        "estado": "Abierto",
        "monto": "",
        "fecha": "2025-11-30",
        "fuente": "INIA",
        "link": "https://www.inia.cl/licitaciones/"
    },
    {
        "titulo": "Portal Fondos.gob.cl",
        "descripcion": "Todos los fondos públicos Chile",
        "estado": "Abierto",
        "monto": "Varios",
        "fecha": "Continuo",
        "fuente": "Fondos Públicos",
        "link": "https://www.fondos.gob.cl/"
    },
    {
        "titulo": "Devex Funding",
        "descripcion": "Oportunidades financiamiento internacional",
        "estado": "Abierto",
        "monto": "USD 1M+",
        "fecha": "2026-01-15",
        "fuente": "Devex",
        "link": "https://www.devex.com/funding"
    },
    {
        "titulo": "DevelopmentAid Projects",
        "descripcion": "Proyectos desarrollo internacional",
        "estado": "Abierto",
        "monto": "USD 500K+",
        "fecha": "2025-12-20",
        "fuente": "DevelopmentAid",
        "link": "https://www.developmentaid.org/"
    },
    {
        "titulo": "BID Projects Search",
        "descripcion": "Proyectos Banco Interamericano Desarrollo",
        "estado": "Abierto",
        "monto": "USD 10M+",
        "fecha": "Continuo",
        "fuente": "BID",
        "link": "https://www.iadb.org/es/project-search"
    },
    {
        "titulo": "Banco Mundial Projects",
        "descripcion": "Proyectos agricultura y desarrollo rural",
        "estado": "Abierto",
        "monto": "USD 50M+",
        "fecha": "Continuo",
        "fuente": "Banco Mundial",
        "link": "https://projects.worldbank.org/en/projects-operations/projects-list"
    },    
    {
        "titulo": "UNGM Tenders",
        "descripcion": "Licitaciones Naciones Unidas",
        "estado": "Abierto",
        "monto": "USD 100K+",
        "fecha": "Continuo",
        "fuente": "UNGM",
        "link": "https://www.ungm.org/Public/Notice"
    },
    {
        "titulo": "Global Tenders",
        "descripcion": "Tenders internacionales agricultura",
        "estado": "Abierto",
        "monto": "",
        "fecha": "Continuo",
        "fuente": "GlobalTenders",
        "link": "https://www.globaltenders.com/"
    },
    {
        "titulo": "Bio-emprender IICA",
        "descripcion": "Plataforma emprendimiento bioeconomía",
        "estado": "Abierto",
        "monto": "",
        "fecha": "Continuo",
        "fuente": "IICA",
        "link": "https://bio-emprender.iica.int/"
    }
]


def convertir_proyectos_raw_a_formato():
    """Convierte proyectos_raw al formato usado por la aplicación"""
    proyectos_convertidos = []
    
    # Mapeo de áreas de interés basado en palabras clave
    def clasificar_area(titulo, descripcion):
        texto = (titulo + ' ' + descripcion).lower()
        if 'rural' in texto or 'campesino' in texto:
            return 'Desarrollo Rural'
        elif 'innovación' in texto or 'innovar' in texto or 'tecnología' in texto:
            return 'Innovación Tecnológica'
        elif 'joven' in texto or 'juventud' in texto:
            return 'Juventudes Rurales'
        elif 'internacional' in texto or 'global' in texto:
            return 'Cooperación Internacional'
        elif 'bio' in texto or 'sostenible' in texto:
            return 'Sostenibilidad'
        else:
            return 'General'
    
    for proyecto in proyectos_raw:
        titulo = proyecto.get('titulo', 'Sin nombre')
        descripcion = proyecto.get('descripcion', '')
        
        proyecto_convertido = {
            'Nombre': titulo,
            'Descripción': descripcion,
            'Estado': proyecto.get('estado', 'Disponible'),
            'Monto': proyecto.get('monto', 'Consultar') if proyecto.get('monto') else 'Consultar',
            'Fecha cierre': proyecto.get('fecha', ''),
            'Fuente': proyecto.get('fuente', 'IICA'),
            'Enlace': proyecto.get('link', '#'),
            'Enlace Postulación': proyecto.get('link', '#'),
            'Área de interés': clasificar_area(titulo, descripcion)
        }
        proyectos_convertidos.append(proyecto_convertido)
    
    return proyectos_convertidos

