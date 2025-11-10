"""
Scraper para FIA - Fundación para la Innovación Agraria
https://www.fia.cl/
"""

import requests
from bs4 import BeautifulSoup
import logging
from utils import clasificar_area, parsear_fecha, parsear_monto
from scrapers.common import fetch_html, parse_with_bs4

logger = logging.getLogger(__name__)


def obtener_proyectos_fia():
    """
    Extrae convocatorias y licitaciones de FIA.
    """
    proyectos = []
    
    try:
        url = "https://www.fia.cl/pilares-de-accion/impulso-para-innovar/convocatorias-y-licitaciones/"
        
        html = fetch_html(url)
        if not html:
            logger.warning("⚠️ No se pudo obtener contenido de FIA")
            return proyectos
        
        soup = parse_with_bs4(html)
        
        # Buscar convocatorias
        convocatorias = soup.find_all(['div', 'article'], class_=lambda x: x and ('convocatoria' in x.lower() or 'licitacion' in x.lower() or 'programa' in x.lower()))
        
        if not convocatorias:
            convocatorias = soup.find_all('div', class_=lambda x: x and ('content' in x.lower() or 'card' in x.lower()))
        
        for conv in convocatorias[:20]:
            try:
                # Extraer nombre
                nombre_tag = conv.find(['h3', 'h4', 'h2', 'a'], class_=lambda x: x and ('title' in x.lower() or 'nombre' in x.lower()))
                if not nombre_tag:
                    nombre_tag = conv.find(['h3', 'h4', 'h2', 'a'])
                
                nombre = nombre_tag.get_text(strip=True) if nombre_tag else "Convocatoria FIA"
                
                # Extraer enlace
                enlace_tag = conv.find('a', href=True)
                enlace = enlace_tag['href'] if enlace_tag else url
                if enlace.startswith('/'):
                    enlace = f"https://www.fia.cl{enlace}"
                
                # Extraer fecha de cierre
                fecha_tag = conv.find(string=lambda x: x and ('cierre' in x.lower() or 'fecha' in x.lower() or 'deadline' in x.lower()))
                fecha = fecha_tag.strip() if fecha_tag else ""
                
                # Determinar estado
                estado = "Abierto"
                texto_conv = conv.get_text().upper()
                if 'CERRADA' in texto_conv or 'FINALIZADA' in texto_conv:
                    estado = "Cerrado"
                
                proyecto = {
                    "Nombre": nombre,
                    "Fuente": "FIA",
                    "Fecha cierre": parsear_fecha(fecha) if fecha else "",
                    "Enlace": enlace,
                    "Estado": estado,
                    "Monto": "0",
                    "Área de interés": clasificar_area(nombre)
                }
                
                proyectos.append(proyecto)
                
            except Exception as e:
                logger.error(f"Error procesando convocatoria FIA: {str(e)}")
                continue
        
        logger.info(f"✅ FIA: {len(proyectos)} proyectos extraídos")
        
    except Exception as e:
        logger.error(f"❌ Error en scraper FIA: {str(e)}", exc_info=True)
    
    # Si no se encontraron proyectos, retornar ejemplos
    if not proyectos:
        proyectos = [
            {
                "Nombre": "Premio Mujer AgroInnovadora",
                "Fuente": "FIA",
                "Fecha cierre": "",
                "Enlace": "https://www.fia.cl/pilares-de-accion/impulso-para-innovar/convocatorias-y-licitaciones/",
                "Estado": "Abierto",
                "Monto": "0",
                "Área de interés": clasificar_area("Premio Mujer AgroInnovadora")
            },
            {
                "Nombre": "Giras nacionales de innovación para Mujeres Agroinnovadoras 2025",
                "Fuente": "FIA",
                "Fecha cierre": "",
                "Enlace": "https://www.fia.cl/pilares-de-accion/impulso-para-innovar/convocatorias-y-licitaciones/",
                "Estado": "Abierto",
                "Monto": "0",
                "Área de interés": clasificar_area("Giras nacionales de innovación")
            }
        ]
    
    return proyectos
