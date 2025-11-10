"""
Scraper para Agua y Agricultura IICA - Plataforma de gestión hídrica
https://aguayagricultura.iica.int/
"""

import requests
from bs4 import BeautifulSoup
import logging
from utils import clasificar_area, parsear_fecha, parsear_monto
from scrapers.common import fetch_html, parse_with_bs4

logger = logging.getLogger(__name__)


def obtener_proyectos_iica_agua_agricultura():
    """
    Extrae proyectos y recursos de Agua y Agricultura del IICA.
    """
    proyectos = []
    
    try:
        # URL oficial del portal
        url = "https://aguayagricultura.iica.int/"
        
        html = fetch_html(url)
        if not html:
            logger.warning("⚠️ No se pudo obtener contenido de Agua y Agricultura IICA")
            return proyectos
        
        soup = parse_with_bs4(html)
        
        # Buscar proyectos/recursos
        recursos = soup.find_all(['div', 'article'], class_=lambda x: x and ('project' in x.lower() or 'resource' in x.lower() or 'initiative' in x.lower() or 'card' in x.lower()))
        
        if not recursos:
            recursos = soup.find_all('div', class_=lambda x: x and ('item' in x.lower() or 'entry' in x.lower()))
        
        for recurso in recursos[:15]:
            try:
                # Extraer nombre
                nombre_tag = recurso.find(['h2', 'h3', 'h4', 'a'], class_=lambda x: x and ('title' in x.lower() or 'name' in x.lower()))
                if not nombre_tag:
                    nombre_tag = recurso.find(['h2', 'h3', 'h4', 'a'])
                
                nombre = nombre_tag.get_text(strip=True) if nombre_tag else "Proyecto Agua y Agricultura"
                
                # Extraer enlace
                enlace_tag = recurso.find('a', href=True)
                enlace = enlace_tag['href'] if enlace_tag else url
                if enlace.startswith('/'):
                    enlace = f"https://aguayagricultura.iica.int{enlace}"
                elif not enlace.startswith('http'):
                    enlace = url
                
                proyecto = {
                    "Nombre": nombre,
                    "Fuente": "IICA - Agua y Agricultura",
                    "Fecha cierre": "",
                    "Enlace": enlace,
                    "Estado": "Abierto",
                    "Monto": "0",
                    "Área de interés": clasificar_area(nombre),
                    "Descripción": "Proyectos relacionados con gestión integral de recursos hídricos y agricultura"
                }
                
                proyectos.append(proyecto)
                
            except Exception as e:
                logger.error(f"Error procesando recurso Agua y Agricultura: {str(e)}")
                continue
        
        logger.info(f"✅ IICA Agua y Agricultura: {len(proyectos)} proyectos extraídos")
        
    except Exception as e:
        logger.error(f"❌ Error en scraper IICA Agua y Agricultura: {str(e)}", exc_info=True)
    
    # Si no se encontraron proyectos, retornar ejemplo con enlace oficial
    if not proyectos:
        proyectos = [
            {
                "Nombre": "Agua y Agricultura IICA - Gestión Integral de Recursos Hídricos",
                "Fuente": "IICA - Agua y Agricultura",
                "Fecha cierre": "",
                "Enlace": "https://aguayagricultura.iica.int/",
                "Estado": "Abierto",
                "Monto": "0",
                "Área de interés": "Gestión hídrica",
                "Descripción": "Plataforma que aborda temas relacionados con la gestión integral de los recursos hídricos, acción climática y desarrollo sostenible"
            }
        ]
    
    return proyectos

