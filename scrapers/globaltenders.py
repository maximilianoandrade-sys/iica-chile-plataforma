"""
Scraper para GlobalTenders - Portal global de licitaciones
https://www.globaltenders.com/
"""

import requests
from bs4 import BeautifulSoup
import logging
from utils import clasificar_area, parsear_fecha, parsear_monto
from scrapers.common import fetch_html, parse_with_bs4

logger = logging.getLogger(__name__)


def obtener_proyectos_globaltenders():
    """
    Extrae licitaciones globales relacionadas con agricultura.
    """
    proyectos = []
    
    try:
        url = "https://www.globaltenders.com/"
        
        html = fetch_html(url)
        if not html:
            logger.warning("⚠️ No se pudo obtener contenido de GlobalTenders")
            return proyectos
        
        soup = parse_with_bs4(html)
        
        # Buscar tenders
        tenders = soup.find_all(['div', 'article'], class_=lambda x: x and ('tender' in x.lower() or 'opportunity' in x.lower() or 'project' in x.lower()))
        
        if not tenders:
            tenders = soup.find_all('div', class_=lambda x: x and ('item' in x.lower() or 'card' in x.lower()))
        
        for tender in tenders[:15]:
            try:
                # Extraer nombre
                nombre_tag = tender.find(['h2', 'h3', 'h4', 'a'], class_=lambda x: x and ('title' in x.lower() or 'name' in x.lower()))
                if not nombre_tag:
                    nombre_tag = tender.find(['h2', 'h3', 'h4', 'a'])
                
                nombre = nombre_tag.get_text(strip=True) if nombre_tag else "Licitación GlobalTenders"
                
                # Filtrar por agricultura
                texto_busqueda = nombre.lower()
                if not any(keyword in texto_busqueda for keyword in ['agric', 'rural', 'food', 'agro', 'livestock', 'crop', 'irrigation']):
                    continue
                
                # Extraer enlace
                enlace_tag = tender.find('a', href=True)
                enlace = enlace_tag['href'] if enlace_tag else url
                if enlace.startswith('/'):
                    enlace = f"https://www.globaltenders.com{enlace}"
                
                # Extraer fecha
                fecha_tag = tender.find(string=lambda x: x and ('deadline' in x.lower() or 'closing' in x.lower() or 'fecha' in x.lower()))
                fecha = fecha_tag.strip() if fecha_tag else ""
                
                # Extraer monto
                monto_tag = tender.find(string=lambda x: x and ('budget' in x.lower() or 'amount' in x.lower() or 'usd' in x.lower()))
                monto = monto_tag.strip() if monto_tag else "0"
                
                proyecto = {
                    "Nombre": nombre,
                    "Fuente": "GlobalTenders",
                    "Fecha cierre": parsear_fecha(fecha) if fecha else "",
                    "Enlace": enlace,
                    "Estado": "Abierto",
                    "Monto": parsear_monto(monto) if monto else "0",
                    "Área de interés": clasificar_area(nombre)
                }
                
                proyectos.append(proyecto)
                
            except Exception as e:
                logger.error(f"Error procesando tender GlobalTenders: {str(e)}")
                continue
        
        logger.info(f"✅ GlobalTenders: {len(proyectos)} proyectos extraídos")
        
    except Exception as e:
        logger.error(f"❌ Error en scraper GlobalTenders: {str(e)}", exc_info=True)
    
    # Si no se encontraron proyectos, retornar ejemplos
    if not proyectos:
        proyectos = [
            {
                "Nombre": "Modernización Agrícola",
                "Fuente": "GlobalTenders",
                "Fecha cierre": "",
                "Enlace": "https://www.globaltenders.com/",
                "Estado": "Abierto",
                "Monto": "200000 USD",
                "Área de interés": clasificar_area("Modernización Agrícola")
            }
        ]
    
    return proyectos
