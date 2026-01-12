"""
Scraper INDAP Mejorado
Obtiene fondos actualizados de INDAP con manejo robusto de errores
"""

import requests
from bs4 import BeautifulSoup
from datetime import datetime
import logging
import re

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class IndapScraperMejorado:
    """Scraper robusto para fondos INDAP"""
    
    BASE_URL = "https://www.indap.gob.cl"
    CONCURSOS_URL = f"{BASE_URL}/concursos"
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'IICA-Chile-Bot/1.0 (https://iica-chile-plataforma.onrender.com)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'es-CL,es;q=0.9',
        })
    
    def scrape_fondos(self):
        """Obtener fondos de INDAP"""
        logger.info("🔄 Iniciando scraping de INDAP...")
        
        try:
            response = self.session.get(self.CONCURSOS_URL, timeout=15)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'lxml')
            fondos = []
            
            # Buscar concursos activos
            # Nota: Ajustar selectores según estructura real del sitio
            concursos = soup.select('.concurso-item, .convocatoria-item, article.concurso')
            
            if not concursos:
                logger.warning("⚠️ No se encontraron concursos con los selectores actuales")
                # Intentar selectores alternativos
                concursos = soup.select('div[class*="concurso"], div[class*="convocatoria"]')
            
            logger.info(f"📊 Encontrados {len(concursos)} elementos potenciales")
            
            for item in concursos:
                try:
                    fondo = self._extraer_fondo(item)
                    if fondo:
                        fondos.append(fondo)
                except Exception as e:
                    logger.error(f"❌ Error procesando item: {e}")
                    continue
            
            logger.info(f"✅ Scraped {len(fondos)} fondos de INDAP")
            return fondos
            
        except requests.RequestException as e:
            logger.error(f"❌ Error de conexión con INDAP: {e}")
            return []
        except Exception as e:
            logger.error(f"❌ Error general scraping INDAP: {e}")
            return []
    
    def _extraer_fondo(self, item):
        """Extraer información de un elemento de concurso"""
        # Intentar múltiples selectores para cada campo
        nombre = self._extraer_texto(item, ['.titulo', '.nombre', 'h2', 'h3', '.title'])
        
        if not nombre:
            return None
        
        descripcion = self._extraer_texto(item, ['.descripcion', '.resumen', 'p', '.content'])
        fecha_cierre_str = self._extraer_texto(item, ['.fecha', '.fecha-cierre', '.deadline', 'time'])
        monto_str = self._extraer_texto(item, ['.monto', '.financiamiento', '.presupuesto'])
        enlace = self._extraer_enlace(item)
        
        return {
            'nombre': nombre,
            'fuente': 'INDAP',
            'descripcion': descripcion or 'Información disponible en el sitio web de INDAP',
            'monto': self._parse_monto(monto_str),
            'monto_texto': monto_str or 'Consultar bases',
            'fecha_cierre': self._parse_fecha(fecha_cierre_str),
            'area_interes': 'Agricultura',
            'estado': 'Abierto',
            'region': 'Nacional',
            'enlace': enlace,
            'palabras_clave': 'INDAP, agricultura familiar, pequeños productores',
            'fecha_scraping': datetime.utcnow()
        }
    
    def _extraer_texto(self, elemento, selectores):
        """Intentar extraer texto con múltiples selectores"""
        for selector in selectores:
            try:
                elem = elemento.select_one(selector)
                if elem:
                    texto = elem.get_text(strip=True)
                    if texto:
                        return texto
            except:
                continue
        return None
    
    def _extraer_enlace(self, elemento):
        """Extraer enlace del elemento"""
        try:
            link = elemento.select_one('a')
            if link and link.get('href'):
                href = link['href']
                if href.startswith('http'):
                    return href
                else:
                    return self.BASE_URL + href
        except:
            pass
        return self.CONCURSOS_URL
    
    def _parse_fecha(self, fecha_str):
        """Convertir fecha chilena a objeto date"""
        if not fecha_str:
            return None
        
        # Limpiar string
        fecha_str = fecha_str.strip().lower()
        
        # Patrones comunes
        patrones = [
            r'(\d{1,2})[/-](\d{1,2})[/-](\d{4})',  # DD/MM/YYYY o DD-MM-YYYY
            r'(\d{4})[/-](\d{1,2})[/-](\d{1,2})',  # YYYY/MM/DD
        ]
        
        for patron in patrones:
            match = re.search(patron, fecha_str)
            if match:
                try:
                    grupos = match.groups()
                    if len(grupos[0]) == 4:  # YYYY-MM-DD
                        return datetime(int(grupos[0]), int(grupos[1]), int(grupos[2])).date()
                    else:  # DD-MM-YYYY
                        return datetime(int(grupos[2]), int(grupos[1]), int(grupos[0])).date()
                except:
                    continue
        
        return None
    
    def _parse_monto(self, monto_str):
        """Extraer monto numérico"""
        if not monto_str:
            return None
        
        # Remover puntos de miles y extraer números
        numeros = re.findall(r'[\d.]+', monto_str.replace('.', ''))
        if numeros:
            try:
                return int(numeros[0])
            except:
                return None
        return None

def obtener_fondos_indap():
    """Función principal para obtener fondos INDAP"""
    scraper = IndapScraperMejorado()
    return scraper.scrape_fondos()

if __name__ == '__main__':
    fondos = obtener_fondos_indap()
    print(f"\n✅ Total fondos obtenidos: {len(fondos)}")
    for fondo in fondos[:3]:
        print(f"\n📋 {fondo['nombre']}")
        print(f"   💰 {fondo['monto_texto']}")
        print(f"   📅 {fondo.get('fecha_cierre', 'Sin fecha')}")
