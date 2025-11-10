"""
Scraper para Perplexity - Búsqueda inteligente (limitado)
https://www.perplexity.ai/
Nota: Perplexity es principalmente una herramienta de búsqueda, no un portal de proyectos.
Este scraper es limitado y puede no funcionar completamente.
"""

import requests
from bs4 import BeautifulSoup
import logging
from utils import clasificar_area, parsear_fecha, parsear_monto
from scrapers.common import fetch_html, parse_with_bs4

logger = logging.getLogger(__name__)


def obtener_proyectos_perplexity(query="agriculture funding"):
    """
    Intenta extraer información de búsquedas en Perplexity.
    Nota: Esta funcionalidad es limitada ya que Perplexity no es un portal de proyectos.
    """
    proyectos = []
    
    try:
        # Perplexity no es ideal para scraping, pero intentamos buscar información
        # Nota: Esto puede no funcionar debido a la naturaleza dinámica del sitio
        url = f"https://www.perplexity.ai/search?q={query.replace(' ', '%20')}"
        
        html = fetch_html(url)
        if not html:
            logger.warning("⚠️ No se pudo obtener contenido de Perplexity (esperado, es un motor de búsqueda)")
            return proyectos
        
        soup = parse_with_bs4(html)
        
        # Buscar enlaces relevantes
        links = soup.find_all('a', href=True)
        
        for link in links[:10]:  # Limitar a 10
            try:
                nombre = link.get_text(strip=True)
                enlace = link.get('href', '')
                
                if not nombre or len(nombre) < 10:
                    continue
                
                # Filtrar por agricultura
                if not any(keyword in nombre.lower() for keyword in ['agric', 'rural', 'food', 'agro', 'funding', 'grant']):
                    continue
                
                if not enlace.startswith('http'):
                    continue
                
                proyecto = {
                    "Nombre": nombre[:150],
                    "Fuente": "Perplexity",
                    "Fecha cierre": "",
                    "Enlace": enlace,
                    "Estado": "Desconocido",
                    "Monto": "0",
                    "Área de interés": clasificar_area(nombre)
                }
                
                proyectos.append(proyecto)
                
            except Exception as e:
                logger.error(f"Error procesando link Perplexity: {str(e)}")
                continue
        
        logger.info(f"✅ Perplexity: {len(proyectos)} proyectos extraídos")
        
    except Exception as e:
        logger.warning(f"⚠️ Perplexity no disponible para scraping (esperado): {str(e)}")
    
    # Retornar lista vacía ya que Perplexity no es un portal de proyectos
    return proyectos[:5]  # Limitar a 5 resultados
