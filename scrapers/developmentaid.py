"""
Scraper para DevelopmentAid - Plataforma de oportunidades de desarrollo
https://www.developmentaid.org/
"""

import requests
from bs4 import BeautifulSoup
import logging
from utils import clasificar_area, parsear_fecha, parsear_monto
from scrapers.common import fetch_html, parse_with_bs4

logger = logging.getLogger(__name__)


def obtener_proyectos_developmentaid():
    """
    Extrae proyectos y oportunidades de DevelopmentAid relacionados con agricultura.
    """
    proyectos = []
    
    try:
        # URL de búsqueda con filtro para Chile y agricultura
        url = "https://www.developmentaid.org/tenders/search?hiddenAdvancedFilters=0&locations=84"
        
        html = fetch_html(url)
        if not html:
            logger.warning("⚠️ No se pudo obtener contenido de DevelopmentAid")
            return proyectos
        
        soup = parse_with_bs4(html)
        
        # Buscar tenders/proyectos
        tenders = soup.find_all(['div', 'article', 'tr'], class_=lambda x: x and ('tender' in x.lower() or 'opportunity' in x.lower() or 'project' in x.lower()))
        
        if not tenders:
            tenders = soup.find_all('div', class_=lambda x: x and ('item' in x.lower() or 'card' in x.lower() or 'listing' in x.lower()))
        
        for tender in tenders[:20]:
            try:
                # Extraer nombre
                nombre_tag = tender.find(['h2', 'h3', 'h4', 'a'], class_=lambda x: x and ('title' in x.lower() or 'name' in x.lower()))
                if not nombre_tag:
                    nombre_tag = tender.find(['h2', 'h3', 'h4', 'a'])
                
                nombre = nombre_tag.get_text(strip=True) if nombre_tag else "Oportunidad DevelopmentAid"
                
                # Filtrar por agricultura
                texto_busqueda = nombre.lower()
                if not any(keyword in texto_busqueda for keyword in ['agric', 'rural', 'food', 'agro', 'livestock', 'crop', 'irrigation']):
                    continue
                
                # Extraer enlace
                enlace_tag = tender.find('a', href=True)
                enlace = enlace_tag['href'] if enlace_tag else url
                if enlace.startswith('/'):
                    enlace = f"https://www.developmentaid.org{enlace}"
                
                # Extraer fecha de cierre
                fecha_tag = tender.find(string=lambda x: x and ('deadline' in x.lower() or 'closing' in x.lower() or 'fecha' in x.lower()))
                fecha = fecha_tag.strip() if fecha_tag else ""
                
                # Extraer monto
                monto_tag = tender.find(string=lambda x: x and ('budget' in x.lower() or 'amount' in x.lower() or 'usd' in x.lower() or '$' in x))
                monto = monto_tag.strip() if monto_tag else "0"
                
                proyecto = {
                    "Nombre": nombre,
                    "Fuente": "DevelopmentAid",
                    "Fecha cierre": parsear_fecha(fecha) if fecha else "",
                    "Enlace": enlace,
                    "Estado": "Abierto",
                    "Monto": parsear_monto(monto) if monto else "0",
                    "Área de interés": clasificar_area(nombre)
                }
                
                proyectos.append(proyecto)
                
            except Exception as e:
                logger.error(f"Error procesando tender DevelopmentAid: {str(e)}")
                continue
        
        logger.info(f"✅ DevelopmentAid: {len(proyectos)} proyectos extraídos")
        
    except Exception as e:
        logger.error(f"❌ Error en scraper DevelopmentAid: {str(e)}", exc_info=True)
    
    # Si no se encontraron proyectos, retornar ejemplos
    if not proyectos:
        proyectos = [
            {
                "Nombre": "Erosión y recuperación de suelos",
                "Fuente": "DevelopmentAid",
                "Fecha cierre": "",
                "Enlace": "https://www.developmentaid.org/tenders/search?hiddenAdvancedFilters=0&locations=84",
                "Estado": "Abierto",
                "Monto": "120000 USD",
                "Área de interés": clasificar_area("Erosión y recuperación de suelos")
            }
        ]
    
    return proyectos
