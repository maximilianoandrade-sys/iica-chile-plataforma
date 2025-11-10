"""
Scraper para Devex - Plataforma de proyectos de desarrollo internacional
https://www.devex.com/
"""

import requests
from bs4 import BeautifulSoup
import logging
from utils import clasificar_area, parsear_fecha, parsear_monto
from scrapers.common import fetch_html, parse_with_bs4

logger = logging.getLogger(__name__)


def obtener_proyectos_devex():
    """
    Extrae proyectos y oportunidades de financiamiento de Devex.
    """
    proyectos = []
    
    try:
        # URL principal de búsqueda de oportunidades
        url = "https://www.devex.com/jobs?page=1&filters[primary_category][]=Agriculture"
        
        html = fetch_html(url)
        if not html:
            logger.warning("⚠️ No se pudo obtener contenido de Devex")
            return proyectos
        
        soup = parse_with_bs4(html)
        
        # Buscar tarjetas de proyectos (estructura puede variar)
        # Selectores comunes en Devex
        cards = soup.find_all(['article', 'div'], class_=lambda x: x and ('job' in x.lower() or 'opportunity' in x.lower() or 'card' in x.lower()))
        
        if not cards:
            # Intentar búsqueda más genérica
            cards = soup.find_all('div', class_=lambda x: x and ('listing' in x.lower() or 'item' in x.lower()))
        
        for card in cards[:20]:  # Limitar a 20 proyectos
            try:
                # Extraer nombre/título
                nombre_tag = card.find(['h2', 'h3', 'h4', 'a'], class_=lambda x: x and ('title' in x.lower() or 'name' in x.lower()))
                if not nombre_tag:
                    nombre_tag = card.find(['h2', 'h3', 'h4', 'a'])
                
                nombre = nombre_tag.get_text(strip=True) if nombre_tag else "Oportunidad Devex"
                
                # Extraer enlace
                enlace_tag = card.find('a', href=True)
                enlace = enlace_tag['href'] if enlace_tag else url
                if enlace.startswith('/'):
                    enlace = f"https://www.devex.com{enlace}"
                
                # Extraer fecha (si está disponible)
                fecha_tag = card.find(string=lambda x: x and ('deadline' in x.lower() or 'fecha' in x.lower() or 'cierre' in x.lower()))
                fecha = fecha_tag.strip() if fecha_tag else ""
                
                # Extraer monto (si está disponible)
                monto_tag = card.find(string=lambda x: x and ('budget' in x.lower() or 'monto' in x.lower() or 'usd' in x.lower() or '$' in x))
                monto = monto_tag.strip() if monto_tag else "0"
                
                # Determinar estado
                estado = "Abierto"
                if fecha:
                    # Verificar si la fecha ya pasó
                    fecha_parsed = parsear_fecha(fecha)
                    if fecha_parsed and fecha_parsed < "2024-01-01":  # Ajustar según necesidad
                        estado = "Cerrado"
                
                proyecto = {
                    "Nombre": nombre,
                    "Fuente": "Devex",
                    "Fecha cierre": parsear_fecha(fecha) if fecha else "",
                    "Enlace": enlace,
                    "Estado": estado,
                    "Monto": parsear_monto(monto) if monto else "0",
                    "Área de interés": clasificar_area(nombre)
                }
                
                proyectos.append(proyecto)
                
            except Exception as e:
                logger.error(f"Error procesando card Devex: {str(e)}")
                continue
        
        logger.info(f"✅ Devex: {len(proyectos)} proyectos extraídos")
        
    except Exception as e:
        logger.error(f"❌ Error en scraper Devex: {str(e)}", exc_info=True)
    
    # Si no se encontraron proyectos, retornar ejemplos con enlaces oficiales
    if not proyectos:
        proyectos = [
            {
                "Nombre": "Seguridad alimentaria y desarrollo rural",
                "Fuente": "Devex",
                "Fecha cierre": "",
                "Enlace": "https://www.devex.com/jobs?page=1&filters[primary_category][]=Agriculture",
                "Estado": "Abierto",
                "Monto": "0",
                "Área de interés": clasificar_area("Seguridad alimentaria y desarrollo rural")
            }
        ]
    
    return proyectos
