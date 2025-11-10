"""
Scraper para Agro América Emprende - Portal IICA de emprendimientos agropecuarios
https://agroemprende.iica.int/
"""

import requests
from bs4 import BeautifulSoup
import logging
from utils import clasificar_area, parsear_fecha, parsear_monto
from scrapers.common import fetch_html, parse_with_bs4

logger = logging.getLogger(__name__)


def obtener_proyectos_iica_agroemprende():
    """
    Extrae proyectos y oportunidades de Agro América Emprende del IICA.
    """
    proyectos = []
    
    try:
        # URL oficial del portal
        url = "https://agroemprende.iica.int/"
        
        html = fetch_html(url)
        if not html:
            logger.warning("⚠️ No se pudo obtener contenido de Agro América Emprende")
            return proyectos
        
        soup = parse_with_bs4(html)
        
        # Buscar proyectos/emprendimientos
        proyectos_html = soup.find_all(['div', 'article', 'section'], class_=lambda x: x and ('project' in x.lower() or 'emprendimiento' in x.lower() or 'proposal' in x.lower() or 'card' in x.lower()))
        
        if not proyectos_html:
            proyectos_html = soup.find_all('div', class_=lambda x: x and ('item' in x.lower() or 'listing' in x.lower()))
        
        for proj in proyectos_html[:15]:
            try:
                # Extraer nombre
                nombre_tag = proj.find(['h2', 'h3', 'h4', 'a'], class_=lambda x: x and ('title' in x.lower() or 'name' in x.lower()))
                if not nombre_tag:
                    nombre_tag = proj.find(['h2', 'h3', 'h4', 'a'])
                
                nombre = nombre_tag.get_text(strip=True) if nombre_tag else "Proyecto Agro América Emprende"
                
                # Extraer enlace
                enlace_tag = proj.find('a', href=True)
                enlace = enlace_tag['href'] if enlace_tag else url
                if enlace.startswith('/'):
                    enlace = f"https://agroemprende.iica.int{enlace}"
                elif not enlace.startswith('http'):
                    enlace = url
                
                # Extraer descripción
                desc_tag = proj.find(['p', 'div'], class_=lambda x: x and ('description' in x.lower() or 'desc' in x.lower()))
                descripcion = desc_tag.get_text(strip=True)[:200] if desc_tag else ""
                
                proyecto = {
                    "Nombre": nombre,
                    "Fuente": "IICA - Agro América Emprende",
                    "Fecha cierre": "",
                    "Enlace": enlace,
                    "Estado": "Abierto",
                    "Monto": "0",
                    "Área de interés": clasificar_area(nombre + " " + descripcion),
                    "Descripción": descripcion
                }
                
                proyectos.append(proyecto)
                
            except Exception as e:
                logger.error(f"Error procesando proyecto Agro América Emprende: {str(e)}")
                continue
        
        logger.info(f"✅ IICA Agro América Emprende: {len(proyectos)} proyectos extraídos")
        
    except Exception as e:
        logger.error(f"❌ Error en scraper IICA Agro América Emprende: {str(e)}", exc_info=True)
    
    # Si no se encontraron proyectos, retornar ejemplo con enlace oficial
    if not proyectos:
        proyectos = [
            {
                "Nombre": "Agro América Emprende - Portal de Emprendimientos Agropecuarios",
                "Fuente": "IICA - Agro América Emprende",
                "Fecha cierre": "",
                "Enlace": "https://agroemprende.iica.int/",
                "Estado": "Abierto",
                "Monto": "0",
                "Área de interés": clasificar_area("Emprendimientos agropecuarios innovación"),
                "Descripción": "Portal interactivo que permite a emprendedores del sector agropecuario presentar propuestas innovadoras"
            }
        ]
    
    return proyectos

