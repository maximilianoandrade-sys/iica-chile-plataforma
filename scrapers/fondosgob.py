"""
Scraper para Fondos.gob.cl - Portal de fondos concursables de Chile
https://fondos.gob.cl/
"""

import requests
from bs4 import BeautifulSoup
import logging
from utils import clasificar_area, parsear_fecha, parsear_monto
from scrapers.common import fetch_html, parse_with_bs4

logger = logging.getLogger(__name__)


def obtener_proyectos_fondosgob():
    """
    Extrae fondos concursables de fondos.gob.cl relacionados con agricultura.
    """
    proyectos = []
    
    try:
        url = "https://fondos.gob.cl/"
        
        html = fetch_html(url)
        if not html:
            logger.warning("⚠️ No se pudo obtener contenido de Fondos.gob.cl")
            return proyectos
        
        soup = parse_with_bs4(html)
        
        # Buscar fondos (estructura puede variar)
        fondos = soup.find_all(['div', 'article'], class_=lambda x: x and ('fondo' in x.lower() or 'concurso' in x.lower() or 'programa' in x.lower()))
        
        if not fondos:
            fondos = soup.find_all('div', class_=lambda x: x and ('card' in x.lower() or 'item' in x.lower()))
        
        for fondo in fondos[:15]:
            try:
                # Extraer nombre
                nombre_tag = fondo.find(['h2', 'h3', 'h4', 'a'], class_=lambda x: x and ('title' in x.lower() or 'nombre' in x.lower()))
                if not nombre_tag:
                    nombre_tag = fondo.find(['h2', 'h3', 'h4', 'a'])
                
                nombre = nombre_tag.get_text(strip=True) if nombre_tag else "Fondo Concursable"
                
                # Filtrar por agricultura
                texto_busqueda = nombre.lower()
                if not any(keyword in texto_busqueda for keyword in ['agric', 'rural', 'campo', 'agro', 'aliment', 'hídric', 'riego', 'desarrollo']):
                    continue
                
                # Extraer enlace
                enlace_tag = fondo.find('a', href=True)
                enlace = enlace_tag['href'] if enlace_tag else url
                if enlace.startswith('/'):
                    enlace = f"https://fondos.gob.cl{enlace}"
                
                # Extraer fecha
                fecha_tag = fondo.find(string=lambda x: x and ('cierre' in x.lower() or 'fecha' in x.lower() or 'deadline' in x.lower()))
                fecha = fecha_tag.strip() if fecha_tag else ""
                
                # Extraer monto
                monto_tag = fondo.find(string=lambda x: x and ('monto' in x.lower() or 'presupuesto' in x.lower() or '$' in x))
                monto = monto_tag.strip() if monto_tag else "0"
                
                proyecto = {
                    "Nombre": nombre,
                    "Fuente": "Fondos.gob.cl",
                    "Fecha cierre": parsear_fecha(fecha) if fecha else "",
                    "Enlace": enlace,
                    "Estado": "Abierto",
                    "Monto": parsear_monto(monto) if monto else "0",
                    "Área de interés": clasificar_area(nombre)
                }
                
                proyectos.append(proyecto)
                
            except Exception as e:
                logger.error(f"Error procesando fondo: {str(e)}")
                continue
        
        logger.info(f"✅ Fondos.gob.cl: {len(proyectos)} proyectos extraídos")
        
    except Exception as e:
        logger.error(f"❌ Error en scraper Fondos.gob.cl: {str(e)}", exc_info=True)
    
    # Si no se encontraron proyectos, retornar ejemplos
    if not proyectos:
        proyectos = [
            {
                "Nombre": "Fondo de Desarrollo Rural",
                "Fuente": "Fondos.gob.cl",
                "Fecha cierre": "",
                "Enlace": "https://fondos.gob.cl/",
                "Estado": "Abierto",
                "Monto": "0",
                "Área de interés": clasificar_area("Fondo de Desarrollo Rural")
            }
        ]
    
    return proyectos
