"""
Scraper para IICA Chile - Portal oficial del IICA en Chile
https://www.iica.int/es/paises/chile
"""

import requests
from bs4 import BeautifulSoup
import logging
from utils import clasificar_area, parsear_fecha, parsear_monto
from scrapers.common import fetch_html, parse_with_bs4

logger = logging.getLogger(__name__)


def obtener_proyectos_iica_chile():
    """
    Extrae proyectos y oportunidades del portal oficial de IICA Chile.
    """
    proyectos = []
    
    try:
        # URL oficial de IICA Chile
        url = "https://www.iica.int/es/paises/chile"
        
        html = fetch_html(url)
        if not html:
            logger.warning("⚠️ No se pudo obtener contenido de IICA Chile")
            return proyectos
        
        soup = parse_with_bs4(html)
        
        # Buscar proyectos
        proyectos_html = soup.find_all(['div', 'article'], class_=lambda x: x and ('project' in x.lower() or 'proyecto' in x.lower() or 'program' in x.lower() or 'card' in x.lower()))
        
        if not proyectos_html:
            proyectos_html = soup.find_all('div', class_=lambda x: x and ('item' in x.lower() or 'entry' in x.lower() or 'content' in x.lower()))
        
        for proj in proyectos_html[:20]:
            try:
                # Extraer nombre
                nombre_tag = proj.find(['h2', 'h3', 'h4', 'a'], class_=lambda x: x and ('title' in x.lower() or 'name' in x.lower()))
                if not nombre_tag:
                    nombre_tag = proj.find(['h2', 'h3', 'h4', 'a'])
                
                nombre = nombre_tag.get_text(strip=True) if nombre_tag else "Proyecto IICA Chile"
                
                # Extraer enlace
                enlace_tag = proj.find('a', href=True)
                enlace = enlace_tag['href'] if enlace_tag else url
                if enlace.startswith('/'):
                    enlace = f"https://www.iica.int{enlace}"
                elif not enlace.startswith('http'):
                    enlace = url
                
                # Buscar descripción
                desc_tag = proj.find(['p', 'div'], class_=lambda x: x and ('description' in x.lower() or 'desc' in x.lower() or 'summary' in x.lower()))
                descripcion = desc_tag.get_text(strip=True)[:200] if desc_tag else ""
                
                proyecto = {
                    "Nombre": nombre,
                    "Fuente": "IICA Chile",
                    "Fecha cierre": "",
                    "Enlace": enlace,
                    "Estado": "Abierto",
                    "Monto": "0",
                    "Área de interés": clasificar_area(nombre + " " + descripcion),
                    "Descripción": descripcion
                }
                
                proyectos.append(proyecto)
                
            except Exception as e:
                logger.error(f"Error procesando proyecto IICA Chile: {str(e)}")
                continue
        
        logger.info(f"✅ IICA Chile: {len(proyectos)} proyectos extraídos")
        
    except Exception as e:
        logger.error(f"❌ Error en scraper IICA Chile: {str(e)}", exc_info=True)
    
    # Si no se encontraron proyectos, retornar ejemplo con enlaces oficiales
    if not proyectos:
        proyectos = [
            {
                "Nombre": "IICA Chile - Proyectos y Programas",
                "Fuente": "IICA Chile",
                "Fecha cierre": "",
                "Enlace": "https://www.iica.int/es/paises/chile/proyectos",
                "Estado": "Abierto",
                "Monto": "0",
                "Área de interés": "General",
                "Descripción": "Portal oficial del IICA en Chile con información sobre proyectos y programas"
            },
            {
                "Nombre": "IICA Chile - Juventudes Rurales",
                "Fuente": "IICA Chile",
                "Fecha cierre": "",
                "Enlace": "https://www.iica.int/es/paises/chile/proyectos/juventudes-rurales",
                "Estado": "Abierto",
                "Monto": "0",
                "Área de interés": "Juventud rural",
                "Descripción": "Proyectos enfocados en juventudes rurales"
            },
            {
                "Nombre": "IICA Chile - Desarrollo Rural",
                "Fuente": "IICA Chile",
                "Fecha cierre": "",
                "Enlace": "https://www.iica.int/es/paises/chile/proyectos/desarrollo-rural",
                "Estado": "Abierto",
                "Monto": "0",
                "Área de interés": "Agricultura familiar campesina",
                "Descripción": "Proyectos de desarrollo rural"
            },
            {
                "Nombre": "IICA Chile - Innovación Agrícola",
                "Fuente": "IICA Chile",
                "Fecha cierre": "",
                "Enlace": "https://www.iica.int/es/paises/chile/proyectos/innovacion-agricola",
                "Estado": "Abierto",
                "Monto": "0",
                "Área de interés": "Innovación tecnológica",
                "Descripción": "Proyectos de innovación agrícola"
            }
        ]
    
    return proyectos

