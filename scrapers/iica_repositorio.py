"""
Scraper para Repositorio Institucional del IICA
https://apps.iica.int/
"""

import requests
from bs4 import BeautifulSoup
import logging
from utils import clasificar_area, parsear_fecha, parsear_monto
from scrapers.common import fetch_html, parse_with_bs4

logger = logging.getLogger(__name__)


def obtener_proyectos_iica_repositorio():
    """
    Extrae recursos y documentos del Repositorio Institucional del IICA.
    """
    proyectos = []
    
    try:
        # URL del repositorio institucional
        url = "https://apps.iica.int/"
        
        html = fetch_html(url)
        if not html:
            logger.warning("⚠️ No se pudo obtener contenido del Repositorio IICA")
            return proyectos
        
        soup = parse_with_bs4(html)
        
        # Buscar recursos/documentos
        recursos = soup.find_all(['div', 'article'], class_=lambda x: x and ('resource' in x.lower() or 'document' in x.lower() or 'publication' in x.lower() or 'card' in x.lower()))
        
        if not recursos:
            recursos = soup.find_all('div', class_=lambda x: x and ('item' in x.lower() or 'entry' in x.lower()))
        
        for recurso in recursos[:15]:
            try:
                # Extraer nombre
                nombre_tag = recurso.find(['h2', 'h3', 'h4', 'a'], class_=lambda x: x and ('title' in x.lower() or 'name' in x.lower()))
                if not nombre_tag:
                    nombre_tag = recurso.find(['h2', 'h3', 'h4', 'a'])
                
                nombre = nombre_tag.get_text(strip=True) if nombre_tag else "Recurso IICA"
                
                # Filtrar por agricultura/rural
                texto_busqueda = nombre.lower()
                if not any(keyword in texto_busqueda for keyword in ['agric', 'rural', 'agro', 'aliment', 'campesin', 'hídric']):
                    continue
                
                # Extraer enlace
                enlace_tag = recurso.find('a', href=True)
                enlace = enlace_tag['href'] if enlace_tag else url
                if enlace.startswith('/'):
                    enlace = f"https://apps.iica.int{enlace}"
                elif not enlace.startswith('http'):
                    enlace = url
                
                proyecto = {
                    "Nombre": nombre,
                    "Fuente": "IICA - Repositorio Institucional",
                    "Fecha cierre": "",
                    "Enlace": enlace,
                    "Estado": "Abierto",
                    "Monto": "0",
                    "Área de interés": clasificar_area(nombre),
                    "Descripción": "Recurso documental del IICA"
                }
                
                proyectos.append(proyecto)
                
            except Exception as e:
                logger.error(f"Error procesando recurso Repositorio IICA: {str(e)}")
                continue
        
        logger.info(f"✅ IICA Repositorio: {len(proyectos)} proyectos extraídos")
        
    except Exception as e:
        logger.error(f"❌ Error en scraper IICA Repositorio: {str(e)}", exc_info=True)
    
    # Si no se encontraron proyectos, retornar ejemplo con enlace oficial
    if not proyectos:
        proyectos = [
            {
                "Nombre": "Repositorio Institucional del IICA",
                "Fuente": "IICA - Repositorio Institucional",
                "Fecha cierre": "",
                "Enlace": "https://apps.iica.int/",
                "Estado": "Abierto",
                "Monto": "0",
                "Área de interés": "General",
                "Descripción": "Repositorio con más de 21,000 recursos documentales digitales sobre agricultura en las Américas"
            }
        ]
    
    return proyectos

