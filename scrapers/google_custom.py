"""
Scraper para Google Custom Search API
Permite buscar proyectos de financiamiento usando la API de Google
"""

import requests
import logging
from utils import clasificar_area

logger = logging.getLogger(__name__)


def buscar_google_custom(query, api_key, cx):
    """
    Busca proyectos usando Google Custom Search API.
    - query: texto de búsqueda
    - api_key: Google API Key
    - cx: Custom Search Engine ID
    """
    if not api_key or not cx:
        logger.warning("⚠️ Google Custom Search: Faltan credenciales (API_KEY o CX)")
        return []
    
    url = "https://www.googleapis.com/customsearch/v1"
    params = {
        "q": query,
        "cx": cx,
        "key": api_key,
        "num": 10
    }
    
    try:
        logger.info(f"🔍 Buscando en Google Custom Search: {query}")
        resp = requests.get(url, params=params, timeout=15)
        resp.raise_for_status()
        data = resp.json()
        
        proyectos = []
        items = data.get('items', [])
        
        if not items:
            logger.info("ℹ️ Google Custom Search: No se encontraron resultados")
            return proyectos
        
        for item in items:
            try:
                nombre = item.get('title', 'Sin título')
                enlace = item.get('link', '')
                snippet = item.get('snippet', '')
                
                # Validar que tenga datos mínimos
                if not nombre or nombre == 'Sin título':
                    continue
                
                proyecto = {
                    "Nombre": nombre,
                    "Fuente": "Google Custom Search",
                    "Fecha cierre": "",
                    "Enlace": enlace if enlace else "",
                    "Estado": "Abierto",
                    "Monto": "",
                    "Área de interés": clasificar_area(nombre + " " + snippet),
                    "Descripción": snippet[:200] if snippet else ""
                }
                proyectos.append(proyecto)
            except Exception as e:
                logger.error(f"❌ Error procesando item de Google: {str(e)}")
                continue
        
        logger.info(f"✅ Google Custom Search: {len(proyectos)} proyectos encontrados")
        return proyectos
        
    except requests.exceptions.RequestException as e:
        logger.error(f"❌ Error de conexión Google Custom Search: {str(e)}")
        return []
    except KeyError as e:
        logger.error(f"❌ Error en respuesta Google Custom Search: {str(e)}")
        return []
    except Exception as e:
        logger.error(f"❌ Error inesperado Google Custom Search: {str(e)}", exc_info=True)
        return []

