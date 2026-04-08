import requests
import json
import os
from datetime import datetime, timedelta
import time
import schedule
from bs4 import BeautifulSoup
import re
from urllib.parse import urljoin, urlparse
import random
from utils_excel import leer_excel, guardar_excel

class AutoSearchSystem:
    """Sistema de búsqueda automática diaria en páginas web"""
    
    def __init__(self):
        self.search_sources = {
            'adaptation_fund': {
                'url': 'https://www.adaptation-fund.org/apply-for-funding/',
                'selectors': {
                    'title': 'h3, h4, .title',
                    'description': 'p, .description, .content',
                    'date': '.date, .fecha',
                    'link': 'a'
                },
                'keywords': ['adaptation', 'climate', 'agriculture', 'rural', 'water', 'innovation', 'food security']
            },
            'corfo': {
                'url': 'https://www.corfo.cl/sites/cpp/convocatorias',
                'selectors': {
                    'title': 'h3, h4, .title',
                    'description': 'p, .description, .content',
                    'date': '.date, .fecha',
                    'link': 'a'
                },
                'keywords': ['financiamiento', 'convocatoria', 'proyecto', 'agricultura', 'rural']
            },
            'indap': {
                'url': 'https://www.indap.gob.cl/convocatorias',
                'selectors': {
                    'title': 'h3, h4, .title',
                    'description': 'p, .description, .content',
                    'date': '.date, .fecha',
                    'link': 'a'
                },
                'keywords': ['financiamiento', 'convocatoria', 'proyecto', 'agricultura', 'rural', 'joven']
            },
            'fia': {
                'url': 'https://www.fia.cl/convocatorias',
                'selectors': {
                    'title': 'h3, h4, .title',
                    'description': 'p, .description, .content',
                    'date': '.date, .fecha',
                    'link': 'a'
                },
                'keywords': ['financiamiento', 'convocatoria', 'proyecto', 'innovación', 'tecnología']
            },
            'minagri': {
                'url': 'https://minagri.gob.cl/convocatorias',
                'selectors': {
                    'title': 'h3, h4, .title',
                    'description': 'p, .description, .content',
                    'date': '.date, .fecha',
                    'link': 'a'
                },
                'keywords': ['financiamiento', 'convocatoria', 'proyecto', 'agricultura', 'sostenible']
            },
            'fao': {
                'url': 'https://www.fao.org/calls-for-proposals',
                'selectors': {
                    'title': 'h3, h4, .title',
                    'description': 'p, .description, .content',
                    'date': '.date, .fecha',
                    'link': 'a'
                },
                'keywords': ['financiamiento', 'convocatoria', 'proyecto', 'agricultura', 'alimentación']
            },
            'worldbank': {
                'url': 'https://www.worldbank.org/en/programs-and-projects',
                'selectors': {
                    'title': 'h3, h4, .title',
                    'description': 'p, .description, .content',
                    'date': '.date, .fecha',
                    'link': 'a'
                },
                'keywords': ['financiamiento', 'proyecto', 'agricultura', 'desarrollo', 'sostenible']
            },
            'green_climate_fund': {
                'url': 'https://www.greenclimate.fund/',
                'selectors': {
                    'title': 'h3, h4, .title',
                    'description': 'p, .description, .content',
                    'date': '.date, .fecha',
                    'link': 'a'
                },
                'keywords': ['climate', 'adaptation', 'agriculture', 'resilience', 'green']
            },
            'ifad': {
                'url': 'https://www.ifad.org/',
                'selectors': {
                    'title': 'h3, h4, .title',
                    'description': 'p, .description, .content',
                    'date': '.date, .fecha',
                    'link': 'a'
                },
                'keywords': ['rural', 'agriculture', 'development', 'farmers', 'food']
            },
            'gef': {
                'url': 'https://www.thegef.org/',
                'selectors': {
                    'title': 'h3, h4, .title',
                    'description': 'p, .description, .content',
                    'date': '.date, .fecha',
                    'link': 'a'
                },
                'keywords': ['environment', 'biodiversity', 'climate', 'agriculture', 'sustainable']
            }
        }
        
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        self.log_file = 'data/auto_search_log.json'
        self.results_file = 'data/auto_search_results.json'
        
        # Crear directorio si no existe
        os.makedirs('data', exist_ok=True)
    
    def start_auto_search(self):
        """Inicia el sistema de búsqueda automática"""
        print("🔄 Iniciando sistema de búsqueda automática...")
        
        # Programar búsqueda diaria a las 6:00 AM
        schedule.every().day.at("06:00").do(self.daily_search)
        
        # Programar búsqueda cada 6 horas
        schedule.every(6).hours.do(self.hourly_search)
        
        # Ejecutar búsqueda inicial
        self.daily_search()
        
        print("✅ Sistema de búsqueda automática iniciado")
        print("📅 Búsqueda diaria programada a las 6:00 AM")
        print("⏰ Búsqueda cada 6 horas activada")
        
        # Mantener el sistema corriendo
        while True:
            schedule.run_pending()
            time.sleep(60)  # Verificar cada minuto
    
    def daily_search(self):
        """Búsqueda diaria completa en todas las fuentes"""
        print(f"🔍 Iniciando búsqueda diaria - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        all_results = []
        
        for source_name, source_config in self.search_sources.items():
            try:
                print(f"🔍 Buscando en {source_name}...")
                results = self.search_source(source_name, source_config)
                all_results.extend(results)
                print(f"✅ Encontrados {len(results)} proyectos en {source_name}")
                
                # Pausa entre búsquedas para no sobrecargar los servidores
                time.sleep(2)
                
            except Exception as e:
                print(f"❌ Error buscando en {source_name}: {e}")
                continue
        
        # Procesar y guardar resultados
        if all_results:
            self.process_results(all_results)
            self.save_results(all_results)
            print(f"✅ Búsqueda diaria completada - {len(all_results)} proyectos encontrados")
        else:
            print("ℹ️ No se encontraron nuevos proyectos en la búsqueda diaria")
    
    def hourly_search(self):
        """Búsqueda rápida cada 6 horas"""
        print(f"🔍 Búsqueda rápida - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Buscar solo en fuentes principales
        main_sources = ['corfo', 'indap', 'fia']
        all_results = []
        
        for source_name in main_sources:
            if source_name in self.search_sources:
                try:
                    results = self.search_source(source_name, self.search_sources[source_name])
                    all_results.extend(results)
                except Exception as e:
                    print(f"❌ Error en búsqueda rápida {source_name}: {e}")
                    continue
        
        if all_results:
            self.process_results(all_results)
            print(f"✅ Búsqueda rápida completada - {len(all_results)} proyectos encontrados")
    
    def search_source(self, source_name, source_config):
        """Busca proyectos en una fuente específica"""
        try:
            response = requests.get(source_config['url'], headers=self.headers, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            results = []
            
            # Buscar elementos que contengan las palabras clave
            for keyword in source_config['keywords']:
                elements = soup.find_all(text=re.compile(keyword, re.IGNORECASE))
                
                for element in elements:
                    # Encontrar el contenedor padre
                    container = element.find_parent()
                    if container:
                        result = self.extract_project_info(container, source_name, source_config)
                        if result:
                            results.append(result)
            
            # También buscar por selectores específicos
            for selector_type, selector in source_config['selectors'].items():
                elements = soup.select(selector)
                for element in elements:
                    result = self.extract_project_info(element, source_name, source_config)
                    if result:
                        results.append(result)
            
            # Eliminar duplicados
            unique_results = []
            seen_titles = set()
            for result in results:
                if result['title'] not in seen_titles:
                    unique_results.append(result)
                    seen_titles.add(result['title'])
            
            return unique_results
            
        except Exception as e:
            print(f"❌ Error buscando en {source_name}: {e}")
            return []
    
    def extract_project_info(self, element, source_name, source_config):
        """Extrae información de un elemento HTML"""
        try:
            # Buscar título
            title_elem = element.find(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
            title = title_elem.get_text(strip=True) if title_elem else ""
            
            if not title:
                title = element.get_text(strip=True)[:100]
            
            # Buscar descripción
            desc_elem = element.find('p')
            description = desc_elem.get_text(strip=True) if desc_elem else ""
            
            # Buscar enlace
            link_elem = element.find('a')
            link = link_elem.get('href') if link_elem else ""
            
            if link and not link.startswith('http'):
                link = urljoin(source_config['url'], link)
            
            # Buscar fecha
            date_elem = element.find(class_=re.compile(r'date|fecha', re.IGNORECASE))
            date = date_elem.get_text(strip=True) if date_elem else ""
            
            if not date:
                date = datetime.now().strftime('%Y-%m-%d')
            
            # Determinar área de interés basada en palabras clave
            area = self.determine_area(title + " " + description)
            
            # Determinar monto estimado
            monto = self.estimate_amount(title + " " + description)
            
            if title and len(title) > 10:  # Solo proyectos con títulos válidos
                return {
                    'Nombre': title,
                    'Fuente': source_name.upper(),
                    'Fecha cierre': date,
                    'Enlace': link,
                    'Estado': 'Abierto',
                    'Monto': monto,
                    'Área de interés': area,
                    'Descripción': description[:200] + "..." if len(description) > 200 else description,
                    'source': source_name,
                    'discovered_at': datetime.now().isoformat()
                }
            
            return None
            
        except Exception as e:
            print(f"❌ Error extrayendo información: {e}")
            return None
    
    def determine_area(self, text):
        """Determina el área de interés basada en el texto"""
        text_lower = text.lower()
        
        if any(word in text_lower for word in ['joven', 'juventud', 'estudiante', 'emprendimiento']):
            return 'Juventudes Rurales'
        elif any(word in text_lower for word in ['sostenible', 'orgánico', 'agroecología', 'verde']):
            return 'Agricultura Sostenible'
        elif any(word in text_lower for word in ['tecnología', 'digital', 'innovación', 'IoT', 'drones']):
            return 'Innovación Tecnológica'
        elif any(word in text_lower for word in ['agua', 'riego', 'hidroponía', 'hídrico']):
            return 'Gestión Hídrica'
        elif any(word in text_lower for word in ['rural', 'comunidad', 'campesino']):
            return 'Desarrollo Rural'
        elif any(word in text_lower for word in ['alimentario', 'nutrición', 'hambre']):
            return 'Seguridad Alimentaria'
        elif any(word in text_lower for word in ['comercio', 'exportación', 'mercado']):
            return 'Comercio Agrícola'
        else:
            return 'Agricultura Sostenible'  # Por defecto
    
    def estimate_amount(self, text):
        """Estima el monto basado en el texto"""
        text_lower = text.lower()
        
        # Buscar patrones de montos
        amount_patterns = [
            r'(\d+(?:\.\d+)?)\s*millones?',
            r'(\d+(?:\.\d+)?)\s*M',
            r'USD\s*(\d+(?:\.\d+)?)',
            r'\$(\d+(?:\.\d+)?)'
        ]
        
        for pattern in amount_patterns:
            match = re.search(pattern, text_lower)
            if match:
                amount = float(match.group(1))
                if 'millones' in text_lower or 'M' in text_lower:
                    return f"USD {amount:,.0f},000,000"
                else:
                    return f"USD {amount:,.0f},000"
        
        # Montos estimados por palabras clave
        if any(word in text_lower for word in ['gran', 'mayor', 'importante']):
            return "USD 10,000,000"
        elif any(word in text_lower for word in ['pequeño', 'menor', 'básico']):
            return "USD 1,000,000"
        else:
            return "USD 5,000,000"
    
    def process_results(self, results):
        """Procesa y filtra los resultados"""
        # Filtrar resultados duplicados
        unique_results = []
        seen_titles = set()
        
        for result in results:
            title_key = result['Nombre'].lower().strip()
            if title_key not in seen_titles:
                unique_results.append(result)
                seen_titles.add(title_key)
        
        # Agregar a la base de datos principal
        self.add_to_database(unique_results)
        
        return unique_results
    
    def add_to_database(self, new_projects):
        """Agrega nuevos proyectos a la base de datos principal"""
        try:
            # Cargar proyectos existentes
            existing_projects = []
            if os.path.exists('data/proyectos_completos.xlsx'):
                existing_projects = leer_excel('data/proyectos_completos.xlsx')
            
            # Agregar nuevos proyectos
            all_projects = existing_projects + new_projects
            
            # Guardar en Excel
            os.makedirs('data', exist_ok=True)
            guardar_excel(all_projects, 'data/proyectos_completos.xlsx')
            
            print(f"✅ Agregados {len(new_projects)} nuevos proyectos a la base de datos")
            
        except Exception as e:
            print(f"❌ Error agregando a la base de datos: {e}")
    
    def save_results(self, results):
        """Guarda los resultados de la búsqueda"""
        try:
            search_log = {
                'timestamp': datetime.now().isoformat(),
                'total_found': len(results),
                'results': results
            }
            
            # Cargar log existente
            logs = []
            if os.path.exists(self.log_file):
                with open(self.log_file, 'r', encoding='utf-8') as f:
                    logs = json.load(f)
            
            logs.append(search_log)
            
            # Mantener solo los últimos 30 logs
            if len(logs) > 30:
                logs = logs[-30:]
            
            # Guardar log
            with open(self.log_file, 'w', encoding='utf-8') as f:
                json.dump(logs, f, ensure_ascii=False, indent=2)
            
            print(f"✅ Log de búsqueda guardado - {len(results)} proyectos")
            
        except Exception as e:
            print(f"❌ Error guardando log: {e}")
    
    def get_search_stats(self):
        """Obtiene estadísticas de las búsquedas automáticas"""
        try:
            if not os.path.exists(self.log_file):
                return {"message": "No hay búsquedas registradas"}
            
            with open(self.log_file, 'r', encoding='utf-8') as f:
                logs = json.load(f)
            
            total_searches = len(logs)
            total_projects = sum(log['total_found'] for log in logs)
            last_search = logs[-1]['timestamp'] if logs else None
            
            return {
                'total_searches': total_searches,
                'total_projects_found': total_projects,
                'last_search': last_search,
                'recent_searches': logs[-5:] if len(logs) >= 5 else logs
            }
            
        except Exception as e:
            return {"error": str(e)}
    
    def run_background_search(self):
        """Ejecuta búsqueda en segundo plano"""
        import threading
        
        def background_task():
            while True:
                try:
                    schedule.run_pending()
                    time.sleep(60)  # Verificar cada minuto
                except Exception as e:
                    print(f"❌ Error en búsqueda en segundo plano: {e}")
                    time.sleep(300)  # Esperar 5 minutos antes de reintentar
        
        thread = threading.Thread(target=background_task, daemon=True)
        thread.start()
        print("🔄 Búsqueda automática iniciada en segundo plano")

