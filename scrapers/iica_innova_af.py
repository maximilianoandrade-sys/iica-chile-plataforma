"""
Scraper para INNOVA AF - Iniciativa IICA de Innovación en Agricultura Familiar
https://innova-af.iica.int/
"""

import requests
from bs4 import BeautifulSoup
import logging
from utils import clasificar_area, parsear_fecha, parsear_monto
from scrapers.common import fetch_html, parse_with_bs4

logger = logging.getLogger(__name__)


def obtener_proyectos_iica_innova_af():
    """
    Extrae proyectos y recursos de INNOVA AF del IICA.
    """
    proyectos = []
    
    try:
        # URL oficial de la base de conocimientos
        url = "https://innova-af.iica.int/knowledge-base"
        
        html = fetch_html(url)
        if not html:
            logger.warning("⚠️ No se pudo obtener contenido de INNOVA AF")
            return proyectos
        
        soup = parse_with_bs4(html)
        
        # Buscar proyectos/recursos
        recursos = soup.find_all(['div', 'article'], class_=lambda x: x and ('project' in x.lower() or 'resource' in x.lower() or 'knowledge' in x.lower() or 'card' in x.lower()))
        
        if not recursos:
            recursos = soup.find_all('div', class_=lambda x: x and ('item' in x.lower() or 'entry' in x.lower()))
        
        for recurso in recursos[:15]:
            try:
                # Extraer nombre
                nombre_tag = recurso.find(['h2', 'h3', 'h4', 'a'], class_=lambda x: x and ('title' in x.lower() or 'name' in x.lower()))
                if not nombre_tag:
                    nombre_tag = recurso.find(['h2', 'h3', 'h4', 'a'])
                
                nombre = nombre_tag.get_text(strip=True) if nombre_tag else "Recurso INNOVA AF"
                
                # Extraer enlace
                enlace_tag = recurso.find('a', href=True)
                enlace = enlace_tag['href'] if enlace_tag else url
                if enlace.startswith('/'):
                    enlace = f"https://innova-af.iica.int{enlace}"
                elif not enlace.startswith('http'):
                    enlace = url
                
                proyecto = {
                    "Nombre": nombre,
                    "Fuente": "IICA - INNOVA AF",
                    "Fecha cierre": "",
                    "Enlace": enlace,
                    "Estado": "Abierto",
                    "Monto": "0",
                    "Área de interés": clasificar_area(nombre),
                    "Descripción": "Iniciativa que promueve la innovación en la agricultura familiar"
                }
                
                proyectos.append(proyecto)
                
            except Exception as e:
                logger.error(f"Error procesando recurso INNOVA AF: {str(e)}")
                continue
        
        logger.info(f"✅ IICA INNOVA AF: {len(proyectos)} proyectos extraídos")
        
    except Exception as e:
        logger.error(f"❌ Error en scraper IICA INNOVA AF: {str(e)}", exc_info=True)
    
    # Si no se encontraron proyectos, retornar ejemplo con enlace oficial
    if not proyectos:
        proyectos = [
            {
                "Nombre": "INNOVA AF - Innovación en Agricultura Familiar",
                "Fuente": "IICA - INNOVA AF",
                "Fecha cierre": "",
                "Enlace": "https://innova-af.iica.int/knowledge-base",
                "Estado": "Abierto",
                "Monto": "0",
                "Área de interés": clasificar_area("Innovación agricultura familiar"),
                "Descripción": "Base de conocimientos y recursos para mejorar la productividad y sostenibilidad de la agricultura familiar"
            }
        ]
    
    return proyectos

