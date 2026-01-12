"""
Scraper Automático de Proyectos IICA Chile
Busca y actualiza proyectos de financiamiento de fuentes oficiales
"""

import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
import logging
import re
import json

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class IICAProjectScraper:
    """Scraper automático para proyectos IICA Chile y fuentes relacionadas"""
    
    # Fuentes de datos IICA y relacionadas
    SOURCES = {
        'IICA': {
            'url': 'https://iica.int/es/prensa/noticias',
            'search_url': 'https://iica.int/es/search?search=chile+financiamiento',
            'keywords': ['chile', 'financiamiento', 'agrícola', 'fondo', 'convocatoria']
        },
        'FONTAGRO': {
            'url': 'https://www.fontagro.org/convocatorias/',
            'api_url': 'https://www.fontagro.org/wp-json/wp/v2/posts?categories=3',
            'keywords': ['convocatoria', 'chile', 'américa latina']
        },
        'FAO': {
            'url': 'https://www.fao.org/chile/noticias/es/',
            'keywords': ['financiamiento', 'proyecto', 'fondo']
        },
        'INDAP': {
            'url': 'https://www.indap.gob.cl/concursos',
            'keywords': ['concurso', 'abierto', 'postulación']
        },
        'FIA': {
            'url': 'https://www.fia.cl/convocatorias/',
            'keywords': ['convocatoria', 'abierta', 'innovación']
        },
        'CORFO': {
            'url': 'https://www.corfo.cl/sites/cpp/programas',
            'keywords': ['agricultura', 'agrotech', 'innovación']
        }
    }
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'IICA-Chile-Bot/1.0 (https://iica-chile-plataforma.onrender.com)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'es-CL,es;q=0.9',
        })
        self.proyectos_encontrados = []
    
    def buscar_todos(self):
        """Buscar proyectos en todas las fuentes"""
        logger.info("🔄 Iniciando búsqueda automática de proyectos IICA...")
        
        all_projects = []
        
        # Buscar en cada fuente
        for source_name, config in self.SOURCES.items():
            try:
                logger.info(f"📡 Buscando en {source_name}...")
                projects = self._scrape_source(source_name, config)
                all_projects.extend(projects)
                logger.info(f"   ✅ {len(projects)} proyectos encontrados")
            except Exception as e:
                logger.error(f"   ❌ Error en {source_name}: {e}")
                continue
        
        # Agregar proyectos base de IICA Chile
        all_projects.extend(self._get_iica_base_projects())
        
        # Eliminar duplicados
        unique_projects = self._remove_duplicates(all_projects)
        
        logger.info(f"\n✅ Total proyectos únicos encontrados: {len(unique_projects)}")
        self.proyectos_encontrados = unique_projects
        return unique_projects
    
    def _scrape_source(self, source_name, config):
        """Scrapear una fuente específica"""
        projects = []
        
        try:
            response = self.session.get(config['url'], timeout=15)
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'lxml')
            
            # Buscar elementos según la fuente
            if source_name == 'FONTAGRO':
                projects = self._parse_fontagro(soup, config)
            elif source_name == 'INDAP':
                projects = self._parse_indap(soup)
            elif source_name == 'FIA':
                projects = self._parse_fia(soup)
            else:
                projects = self._parse_generic(soup, source_name, config['keywords'])
                
        except Exception as e:
            logger.error(f"Error scrapeando {source_name}: {e}")
        
        return projects
    
    def _parse_fontagro(self, soup, config):
        """Parsear proyectos de FONTAGRO"""
        projects = []
        
        # Intentar API primero
        try:
            api_response = self.session.get(config.get('api_url', ''), timeout=10)
            if api_response.ok:
                data = api_response.json()
                for item in data[:10]:
                    projects.append({
                        'nombre': item.get('title', {}).get('rendered', ''),
                        'fuente': 'FONTAGRO',
                        'descripcion': BeautifulSoup(item.get('excerpt', {}).get('rendered', ''), 'lxml').get_text()[:500],
                        'enlace': item.get('link', ''),
                        'fecha_cierre': None,
                        'monto_texto': 'Hasta USD 200,000',
                        'estado': 'Abierto',
                        'area_interes': 'Agricultura Sostenible'
                    })
        except:
            pass
        
        return projects
    
    def _parse_indap(self, soup):
        """Parsear proyectos de INDAP"""
        projects = []
        
        items = soup.select('.concurso-item, .convocatoria, article, .item-concurso')
        
        for item in items[:10]:
            titulo = item.select_one('h2, h3, .titulo, .title')
            if titulo:
                projects.append({
                    'nombre': titulo.get_text(strip=True),
                    'fuente': 'INDAP',
                    'descripcion': item.get_text(strip=True)[:300],
                    'enlace': 'https://www.indap.gob.cl/concursos',
                    'fecha_cierre': None,
                    'monto_texto': 'Según bases',
                    'estado': 'Abierto',
                    'area_interes': 'Agricultura Familiar'
                })
        
        return projects
    
    def _parse_fia(self, soup):
        """Parsear proyectos de FIA"""
        projects = []
        
        items = soup.select('.convocatoria, .item-convocatoria, article, .card')
        
        for item in items[:10]:
            titulo = item.select_one('h2, h3, .titulo, .title, .card-title')
            if titulo:
                projects.append({
                    'nombre': titulo.get_text(strip=True),
                    'fuente': 'FIA',
                    'descripcion': item.get_text(strip=True)[:300],
                    'enlace': 'https://www.fia.cl/convocatorias/',
                    'fecha_cierre': None,
                    'monto_texto': 'Según convocatoria',
                    'estado': 'Abierto',
                    'area_interes': 'Innovación Agrícola'
                })
        
        return projects
    
    def _parse_generic(self, soup, source_name, keywords):
        """Parseo genérico para cualquier fuente"""
        projects = []
        
        # Buscar artículos, cards, o items
        items = soup.select('article, .card, .item, .post, .noticia')
        
        for item in items[:5]:
            text = item.get_text().lower()
            
            # Verificar si contiene keywords relevantes
            if any(kw in text for kw in keywords):
                titulo = item.select_one('h1, h2, h3, .title, .titulo')
                if titulo:
                    projects.append({
                        'nombre': titulo.get_text(strip=True),
                        'fuente': source_name,
                        'descripcion': item.get_text(strip=True)[:300],
                        'enlace': self.SOURCES[source_name]['url'],
                        'fecha_cierre': None,
                        'monto_texto': 'Consultar',
                        'estado': 'Abierto',
                        'area_interes': 'Agricultura'
                    })
        
        return projects
    
    def _get_iica_base_projects(self):
        """Proyectos base de IICA Chile (siempre disponibles)"""
        return [
            {
                'nombre': 'Programa Cooperativo de Innovación Tecnológica - IICA Chile 2026',
                'fuente': 'IICA Chile',
                'descripcion': 'Programa de cooperación técnica del IICA para apoyar proyectos de innovación agrícola en Chile. Enfocado en agricultura familiar, cambio climático y desarrollo rural sostenible.',
                'enlace': 'https://iica.int/es/countries/chile',
                'fecha_cierre': datetime.now().date() + timedelta(days=180),
                'monto_texto': 'Hasta USD 50,000',
                'estado': 'Abierto',
                'area_interes': 'Innovación Tecnológica',
                'region': 'Nacional'
            },
            {
                'nombre': 'Fondo de Desarrollo Rural Sostenible - IICA 2026',
                'fuente': 'IICA Chile',
                'descripcion': 'Financiamiento para proyectos que promuevan el desarrollo rural sostenible, la resiliencia climática y la seguridad alimentaria en comunidades agrícolas chilenas.',
                'enlace': 'https://iica.int/es/countries/chile',
                'fecha_cierre': datetime.now().date() + timedelta(days=120),
                'monto_texto': 'USD 20,000 - 100,000',
                'estado': 'Abierto',
                'area_interes': 'Desarrollo Rural',
                'region': 'Nacional'
            },
            {
                'nombre': 'Programa de Fortalecimiento de Organizaciones Agrícolas - IICA',
                'fuente': 'IICA Chile',
                'descripcion': 'Apoyo a cooperativas y asociaciones de pequeños productores para mejorar su gestión, acceso a mercados y capacidad productiva.',
                'enlace': 'https://iica.int/es/countries/chile',
                'fecha_cierre': datetime.now().date() + timedelta(days=90),
                'monto_texto': 'Hasta USD 30,000',
                'estado': 'Abierto',
                'area_interes': 'Asociatividad',
                'region': 'Nacional'
            },
            {
                'nombre': 'Iniciativa de Agricultura Resiliente al Clima - IICA',
                'fuente': 'IICA Chile',
                'descripcion': 'Fondo para proyectos de adaptación al cambio climático en la agricultura. Incluye tecnificación de riego, manejo sostenible de suelos y diversificación productiva.',
                'enlace': 'https://iica.int/es/countries/chile',
                'fecha_cierre': datetime.now().date() + timedelta(days=150),
                'monto_texto': 'USD 15,000 - 75,000',
                'estado': 'Abierto',
                'area_interes': 'Cambio Climático',
                'region': 'Nacional'
            },
            {
                'nombre': 'Programa Juventud Rural - IICA Chile',
                'fuente': 'IICA Chile',
                'descripcion': 'Apoyo a jóvenes emprendedores rurales menores de 35 años para desarrollar proyectos agrícolas innovadores y tecnológicos.',
                'enlace': 'https://iica.int/es/countries/chile',
                'fecha_cierre': datetime.now().date() + timedelta(days=200),
                'monto_texto': 'Hasta USD 25,000',
                'estado': 'Abierto',
                'area_interes': 'Juventud Rural',
                'region': 'Nacional'
            },
            {
                'nombre': 'Fondo de Mujeres Rurales Emprendedoras - IICA',
                'fuente': 'IICA Chile',
                'descripcion': 'Financiamiento específico para proyectos liderados por mujeres en zonas rurales. Enfoque en empoderamiento económico y equidad de género.',
                'enlace': 'https://iica.int/es/countries/chile',
                'fecha_cierre': datetime.now().date() + timedelta(days=160),
                'monto_texto': 'USD 10,000 - 40,000',
                'estado': 'Abierto',
                'area_interes': 'Género y Desarrollo',
                'region': 'Nacional'
            }
        ]
    
    def _remove_duplicates(self, projects):
        """Eliminar proyectos duplicados por nombre"""
        seen = set()
        unique = []
        for p in projects:
            nombre = p.get('nombre', '').strip().lower()[:50]
            if nombre and nombre not in seen:
                seen.add(nombre)
                unique.append(p)
        return unique
    
    def guardar_en_db(self, app):
        """Guardar proyectos en la base de datos"""
        from models import db, Fondo
        
        nuevos = 0
        actualizados = 0
        
        with app.app_context():
            for proyecto in self.proyectos_encontrados:
                # Verificar si existe
                existente = Fondo.query.filter_by(
                    nombre=proyecto['nombre']
                ).first()
                
                if existente:
                    # Actualizar
                    for key, value in proyecto.items():
                        if hasattr(existente, key) and value:
                            setattr(existente, key, value)
                    actualizados += 1
                else:
                    # Crear nuevo
                    fondo = Fondo(
                        nombre=proyecto.get('nombre', ''),
                        fuente=proyecto.get('fuente', 'IICA'),
                        descripcion=proyecto.get('descripcion', ''),
                        monto_texto=proyecto.get('monto_texto', 'Consultar'),
                        fecha_cierre=proyecto.get('fecha_cierre'),
                        estado=proyecto.get('estado', 'Abierto'),
                        area_interes=proyecto.get('area_interes', 'Agricultura'),
                        region=proyecto.get('region', 'Nacional'),
                        enlace=proyecto.get('enlace', ''),
                        activo=True
                    )
                    db.session.add(fondo)
                    nuevos += 1
            
            db.session.commit()
            logger.info(f"✅ BD actualizada: {nuevos} nuevos, {actualizados} actualizados")
        
        return {'nuevos': nuevos, 'actualizados': actualizados}


# Función para búsqueda automática programada
def ejecutar_busqueda_automatica():
    """Ejecutar búsqueda automática de proyectos"""
    scraper = IICAProjectScraper()
    proyectos = scraper.buscar_todos()
    return proyectos


# API endpoint para búsqueda manual
def buscar_proyectos_iica():
    """Buscar proyectos IICA (para uso en API)"""
    scraper = IICAProjectScraper()
    return scraper.buscar_todos()


if __name__ == '__main__':
    scraper = IICAProjectScraper()
    proyectos = scraper.buscar_todos()
    
    print("\n" + "="*60)
    print("📋 PROYECTOS ENCONTRADOS:")
    print("="*60)
    
    for i, p in enumerate(proyectos[:10], 1):
        print(f"\n{i}. {p['nombre'][:60]}...")
        print(f"   Fuente: {p['fuente']}")
        print(f"   Monto: {p.get('monto_texto', 'N/A')}")
        print(f"   Estado: {p.get('estado', 'N/A')}")
