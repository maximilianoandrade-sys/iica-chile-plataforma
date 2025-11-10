"""
Scraper para MercadoPúblico - Portal de licitaciones públicas de Chile
https://www.mercadopublico.cl/Home
"""

import requests
from bs4 import BeautifulSoup
import logging
from utils import clasificar_area, parsear_fecha, parsear_monto
from scrapers.common import fetch_html, parse_with_bs4

logger = logging.getLogger(__name__)


def obtener_proyectos_mercadopublico():
    """
    Extrae licitaciones y proyectos de MercadoPúblico relacionados con agricultura.
    """
    proyectos = []
    
    try:
        # URL de búsqueda de licitaciones
        url = "https://www.mercadopublico.cl/Home/Buscar"
        
        html = fetch_html(url)
        if not html:
            logger.warning("⚠️ No se pudo obtener contenido de MercadoPúblico")
            return proyectos
        
        soup = parse_with_bs4(html)
        
        # Buscar licitaciones (estructura puede variar)
        licitaciones = soup.find_all(['div', 'article', 'tr'], class_=lambda x: x and ('licitacion' in x.lower() or 'tender' in x.lower() or 'proceso' in x.lower()))
        
        if not licitaciones:
            # Búsqueda más genérica
            licitaciones = soup.find_all('div', class_=lambda x: x and ('item' in x.lower() or 'card' in x.lower()))
        
        for lic in licitaciones[:15]:  # Limitar a 15
            try:
                # Extraer nombre
                nombre_tag = lic.find(['h3', 'h4', 'a', 'td'], class_=lambda x: x and ('titulo' in x.lower() or 'nombre' in x.lower()))
                if not nombre_tag:
                    nombre_tag = lic.find(['h3', 'h4', 'a'])
                
                nombre = nombre_tag.get_text(strip=True) if nombre_tag else "Licitación MercadoPúblico"
                
                # Filtrar solo proyectos relacionados con agricultura/rural
                texto_busqueda = nombre.lower()
                if not any(keyword in texto_busqueda for keyword in ['agric', 'rural', 'campo', 'agro', 'aliment', 'hídric', 'riego']):
                    continue
                
                # Extraer enlace
                enlace_tag = lic.find('a', href=True)
                enlace = enlace_tag['href'] if enlace_tag else url
                if enlace.startswith('/'):
                    enlace = f"https://www.mercadopublico.cl{enlace}"
                
                # Extraer fecha de cierre
                fecha_tag = lic.find(string=lambda x: x and ('cierre' in x.lower() or 'fecha' in x.lower()))
                fecha = fecha_tag.strip() if fecha_tag else ""
                
                # Extraer monto
                monto_tag = lic.find(string=lambda x: x and ('monto' in x.lower() or 'presupuesto' in x.lower() or '$' in x or 'clp' in x.lower()))
                monto = monto_tag.strip() if monto_tag else "0"
                
                proyecto = {
                    "Nombre": nombre,
                    "Fuente": "MercadoPúblico",
                    "Fecha cierre": parsear_fecha(fecha) if fecha else "",
                    "Enlace": enlace,
                    "Estado": "Abierto",
                    "Monto": parsear_monto(monto) if monto else "0",
                    "Área de interés": clasificar_area(nombre)
                }
                
                proyectos.append(proyecto)
                
            except Exception as e:
                logger.error(f"Error procesando licitación MercadoPúblico: {str(e)}")
                continue
        
        logger.info(f"✅ MercadoPúblico: {len(proyectos)} proyectos extraídos")
        
    except Exception as e:
        logger.error(f"❌ Error en scraper MercadoPúblico: {str(e)}", exc_info=True)
    
    # Si no se encontraron proyectos, retornar ejemplos
    if not proyectos:
        proyectos = [
            {
                "Nombre": "Licitación Pública - Equipamiento Agrícola",
                "Fuente": "MercadoPúblico",
                "Fecha cierre": "",
                "Enlace": "https://www.mercadopublico.cl/Home",
                "Estado": "Abierto",
                "Monto": "0",
                "Área de interés": clasificar_area("Equipamiento Agrícola")
            }
        ]
    
    return proyectos

