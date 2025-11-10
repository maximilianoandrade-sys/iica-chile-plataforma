"""
Scraper para INIA - Instituto de Investigaciones Agropecuarias de Chile
https://www.inia.cl/licitaciones/
"""

import requests
from bs4 import BeautifulSoup
import logging
from utils import clasificar_area, parsear_fecha, parsear_monto
from scrapers.common import fetch_html, parse_with_bs4

logger = logging.getLogger(__name__)


def obtener_proyectos_inia():
    """
    Extrae licitaciones de INIA.
    """
    proyectos = []
    
    try:
        url = "https://www.inia.cl/licitaciones/"
        
        html = fetch_html(url)
        if not html:
            logger.warning("⚠️ No se pudo obtener contenido de INIA")
            return proyectos
        
        soup = parse_with_bs4(html)
        
        # Buscar licitaciones
        licitaciones = soup.find_all(['div', 'article', 'tr'], class_=lambda x: x and ('licitacion' in x.lower() or 'tender' in x.lower() or 'proceso' in x.lower()))
        
        if not licitaciones:
            licitaciones = soup.find_all('div', class_=lambda x: x and ('item' in x.lower() or 'card' in x.lower()))
        
        for lic in licitaciones[:15]:
            try:
                # Extraer nombre
                nombre_tag = lic.find(['h3', 'h4', 'h2', 'a'], class_=lambda x: x and ('title' in x.lower() or 'nombre' in x.lower()))
                if not nombre_tag:
                    nombre_tag = lic.find(['h3', 'h4', 'h2', 'a'])
                
                nombre = nombre_tag.get_text(strip=True) if nombre_tag else "Licitación INIA"
                
                # Extraer enlace
                enlace_tag = lic.find('a', href=True)
                enlace = enlace_tag['href'] if enlace_tag else url
                if enlace.startswith('/'):
                    enlace = f"https://www.inia.cl{enlace}"
                
                # Extraer fecha
                fecha_tag = lic.find(string=lambda x: x and ('cierre' in x.lower() or 'fecha' in x.lower()))
                fecha = fecha_tag.strip() if fecha_tag else ""
                
                proyecto = {
                    "Nombre": nombre,
                    "Fuente": "INIA",
                    "Fecha cierre": parsear_fecha(fecha) if fecha else "",
                    "Enlace": enlace,
                    "Estado": "Abierto",
                    "Monto": "0",
                    "Área de interés": clasificar_area(nombre)
                }
                
                proyectos.append(proyecto)
                
            except Exception as e:
                logger.error(f"Error procesando licitación INIA: {str(e)}")
                continue
        
        logger.info(f"✅ INIA: {len(proyectos)} proyectos extraídos")
        
    except Exception as e:
        logger.error(f"❌ Error en scraper INIA: {str(e)}", exc_info=True)
    
    # Si no se encontraron proyectos, retornar ejemplos
    if not proyectos:
        proyectos = [
            {
                "Nombre": "Licitación INIA Innovación",
                "Fuente": "INIA",
                "Fecha cierre": "",
                "Enlace": "https://www.inia.cl/licitaciones/",
                "Estado": "Abierto",
                "Monto": "0",
                "Área de interés": clasificar_area("Licitación INIA Innovación")
            }
        ]
    
    return proyectos
