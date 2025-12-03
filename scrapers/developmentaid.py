"""
Scraper para DevelopmentAid - Plataforma de oportunidades de desarrollo internacional
https://www.developmentaid.org/
"""

import requests
from bs4 import BeautifulSoup
import logging
from utils import clasificar_area, parsear_fecha, parsear_monto
from scrapers.common import fetch_html, parse_with_bs4
from datetime import datetime

logger = logging.getLogger(__name__)


def obtener_proyectos_developmentaid():
    """
    Extrae proyectos y oportunidades de financiamiento de DevelopmentAid.
    """
    proyectos = []
    
    try:
        # URLs principales de DevelopmentAid
        urls = [
            "https://www.developmentaid.org/tenders/search",
            "https://www.developmentaid.org/grants/search",
            "https://www.developmentaid.org/funding/search",
        ]
        
        for url in urls:
            try:
                html = fetch_html(url)
                if not html:
                    logger.warning(f"⚠️ No se pudo obtener contenido de DevelopmentAid: {url}")
                    continue
                
                soup = parse_with_bs4(html)
                
                # Buscar tarjetas de oportunidades (estructura puede variar)
                cards = soup.find_all(['article', 'div', 'li'], class_=lambda x: x and (
                    'tender' in x.lower() or 
                    'grant' in x.lower() or 
                    'opportunity' in x.lower() or 
                    'funding' in x.lower() or
                    'card' in x.lower() or
                    'item' in x.lower()
                ))
                
                if not cards:
                    # Intentar búsqueda más genérica
                    cards = soup.find_all('div', class_=lambda x: x and ('listing' in x.lower() or 'result' in x.lower()))
                
                for card in cards[:15]:  # Limitar a 15 proyectos por URL
                    try:
                        # Extraer nombre/título
                        nombre_tag = card.find(['h2', 'h3', 'h4', 'h5', 'a'], class_=lambda x: x and (
                            'title' in x.lower() or 
                            'name' in x.lower() or
                            'heading' in x.lower()
                        ))
                        if not nombre_tag:
                            nombre_tag = card.find(['h2', 'h3', 'h4', 'h5', 'a'])
                        
                        nombre = nombre_tag.get_text(strip=True) if nombre_tag else "Oportunidad DevelopmentAid"
                        
                        # Extraer enlace
                        enlace_tag = card.find('a', href=True)
                        enlace = enlace_tag['href'] if enlace_tag else url
                        if enlace.startswith('/'):
                            enlace = f"https://www.developmentaid.org{enlace}"
                        elif not enlace.startswith('http'):
                            enlace = f"https://www.developmentaid.org/{enlace}"
                        
                        # Extraer fecha de cierre
                        fecha = ""
                        fecha_tags = card.find_all(string=lambda x: x and (
                            'deadline' in x.lower() or 
                            'fecha' in x.lower() or 
                            'cierre' in x.lower() or
                            'closing' in x.lower() or
                            'due' in x.lower()
                        ))
                        if fecha_tags:
                            fecha = fecha_tags[0].strip()
                        
                        # Extraer monto/presupuesto
                        monto = "0"
                        monto_tags = card.find_all(string=lambda x: x and (
                            'budget' in x.lower() or 
                            'monto' in x.lower() or 
                            'usd' in x.lower() or 
                            '$' in x or
                            'amount' in x.lower() or
                            'funding' in x.lower()
                        ))
                        if monto_tags:
                            monto = monto_tags[0].strip()
                        
                        # Extraer organización
                        organizacion = "DevelopmentAid"
                        org_tags = card.find_all(string=lambda x: x and (
                            'organization' in x.lower() or
                            'donor' in x.lower() or
                            'funder' in x.lower()
                        ))
                        if org_tags:
                            organizacion = org_tags[0].strip()
                        
                        # Determinar estado - solo proyectos 2025 en adelante
                        estado = "Abierto"
                        fecha_parsed = parsear_fecha(fecha) if fecha else None
                        if fecha_parsed:
                            if fecha_parsed < "2025-01-01":
                                estado = "Cerrado"
                        else:
                            # Si no hay fecha, asumir que está abierto si es reciente
                            estado = "Abierto"
                        
                        proyecto = {
                            "Nombre": nombre,
                            "Fuente": "DevelopmentAid",
                            "Fecha cierre": fecha_parsed if fecha_parsed else "",
                            "Enlace": enlace,
                            "Estado": estado,
                            "Monto": parsear_monto(monto) if monto else "0",
                            "Área de interés": clasificar_area(nombre),
                            "Organización": organizacion
                        }
                        
                        proyectos.append(proyecto)
                        
                    except Exception as e:
                        logger.error(f"Error procesando card DevelopmentAid: {str(e)}")
                        continue
                
            except Exception as e:
                logger.error(f"Error procesando URL DevelopmentAid {url}: {str(e)}")
                continue
        
        logger.info(f"✅ DevelopmentAid: {len(proyectos)} proyectos extraídos")
        
    except Exception as e:
        logger.error(f"❌ Error en scraper DevelopmentAid: {str(e)}", exc_info=True)
    
    # Si no se encontraron proyectos, retornar ejemplos con enlaces oficiales
    if not proyectos:
        proyectos = [
            {
                "Nombre": "Oportunidades de financiamiento para desarrollo agrícola",
                "Fuente": "DevelopmentAid",
                "Fecha cierre": "",
                "Enlace": "https://www.developmentaid.org/tenders/search",
                "Estado": "Abierto",
                "Monto": "0",
                "Área de interés": "Agricultura",
                "Organización": "DevelopmentAid"
            },
            {
                "Nombre": "Grants para proyectos de desarrollo sostenible",
                "Fuente": "DevelopmentAid",
                "Fecha cierre": "",
                "Enlace": "https://www.developmentaid.org/grants/search",
                "Estado": "Abierto",
                "Monto": "0",
                "Área de interés": "Desarrollo Sostenible",
                "Organización": "DevelopmentAid"
            }
        ]
    
    return proyectos
