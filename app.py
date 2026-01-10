"""
Plataforma IICA Chile - Versión Mejorada
Consolidada en puerto 5004 con funcionalidades avanzadas
"""

from flask import Flask, render_template, redirect, url_for, request, send_file, Response, jsonify, make_response
from werkzeug.exceptions import NotFound
import json
import os
import logging
from functools import lru_cache
import pandas as pd
import csv
import uuid
from datetime import datetime
from utils import parsear_monto

# Configuración de Rutas ABSOLUTAS para evitar errores en Render
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
TEMPLATE_DIR = os.path.join(BASE_DIR, "templates")

# Archivo principal de datos (PRIORIDAD 1)
DATA_PATH = os.path.join(DATA_DIR, "proyectos_reales_2026.xlsx")

# CORS para permitir requests desde Next.js
try:
    from flask_cors import CORS
    CORS_AVAILABLE = True
except ImportError:
    CORS_AVAILABLE = False
    print("⚠️ flask-cors no disponible, usando headers manuales")

# Importar sistemas avanzados con fallbacks seguros
notification_system = None
application_tracker = None
advanced_reporting = None
backup_system = None

try:
    from notification_system_advanced import notification_system
    print("✅ Sistema de notificaciones cargado")
except ImportError as e:
    print(f"⚠️ Sistema de notificaciones no disponible: {e}")
    # Crear objeto mock básico
    class MockNotificationSystem:
        def get_notifications(self, limit=10, unread_only=False):
            return []
        def get_stats(self):
            return {'total_notifications': 0, 'unread_notifications': 0}
        def mark_as_read(self, notification_id):
            return False
    notification_system = MockNotificationSystem()

try:
    from application_tracking import application_tracker
    print("✅ Sistema de seguimiento de aplicaciones cargado")
except ImportError as e:
    print(f"⚠️ Sistema de seguimiento no disponible: {e}")
    class MockApplicationTracker:
        def get_user_applications(self, email):
            return []
        def get_statistics(self):
            return {}
    application_tracker = MockApplicationTracker()

try:
    from advanced_reporting import advanced_reporting
    print("✅ Sistema de reportes avanzados cargado")
except ImportError as e:
    print(f"⚠️ Sistema de reportes no disponible: {e}")
    class MockAdvancedReporting:
        def generate_comprehensive_report(self, proyectos):
            return {}
    advanced_reporting = MockAdvancedReporting()

try:
    from backup_system_advanced import backup_system
    print("✅ Sistema de backup cargado")
except ImportError as e:
    print(f"⚠️ Sistema de backup no disponible: {e}")
    class MockBackupSystem:
        def list_backups(self):
            return []
        def get_backup_stats(self):
            return {}
        def create_backup(self, backup_type='manual'):
            return None
    backup_system = MockBackupSystem()

app = Flask(__name__, static_folder='static', static_url_path='/static', template_folder=TEMPLATE_DIR)

# Configurar CORS para permitir requests desde Next.js
if CORS_AVAILABLE:
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    print("✅ CORS configurado para /api/*")
else:
    # Headers CORS manuales si flask-cors no está disponible
    @app.after_request
    def add_cors_headers(response):
        if request.path.startswith('/api/'):
            response.headers['Access-Control-Allow-Origin'] = '*'
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        return response
    print("✅ Headers CORS manuales configurados para /api/*")

# FORZAR: Deshabilitar TODOS los cachés de Jinja2 desde el inicio
app.config['TEMPLATES_AUTO_RELOAD'] = True
app.jinja_env.auto_reload = True
app.jinja_env.cache = None  # Deshabilitar caché de templates completamente

# Obtener versión de deploy desde variable de entorno (establecida en app.py)
# IMPORTANTE: app.py establece estas variables ANTES de importar app_enhanced.py
# Si las variables no existen, significa que app_enhanced.py se está importando
# directamente (no a través de app.py). En ese caso, generamos valores consistentes
# UNA SOLA VEZ al cargar el módulo para evitar inconsistencias.

# Verificar si las variables ya están establecidas (por app.py)
if 'APP_VERSION' in os.environ and 'BUILD_TIMESTAMP' in os.environ:
    # Usar las variables establecidas por app.py (caso normal)
    APP_VERSION = os.environ['APP_VERSION']
    BUILD_TIMESTAMP = os.environ['BUILD_TIMESTAMP']
else:
    # Caso excepcional: app_enhanced.py importado directamente
    # Generar valores UNA VEZ y establecerlos en el entorno para consistencia
    _INIT_TIMESTAMP = datetime.now()
    APP_VERSION = _INIT_TIMESTAMP.strftime('%Y%m%d_%H%M%S')
    BUILD_TIMESTAMP = _INIT_TIMESTAMP.isoformat()
    # Establecer en entorno para que cualquier importación posterior use los mismos valores
    os.environ['APP_VERSION'] = APP_VERSION
    os.environ['BUILD_TIMESTAMP'] = BUILD_TIMESTAMP

# Logging de inicio
print("=" * 80)
print("🎨 PLATAFORMA IICA CHILE")
print(f"✅ Versión: {APP_VERSION}")
print(f"✅ Timestamp: {BUILD_TIMESTAMP}")
print("=" * 80)
# Configuración de Rutas ABSOLUTAS movida al inicio del archivo

# Crear directorios necesarios si no existen

# Crear directorios necesarios si no existen
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs("exports", exist_ok=True)

# CACHÉ DESHABILITADO TEMPORALMENTE PARA FORZAR ACTUALIZACIONES
# @lru_cache(maxsize=1)
def _cargar_excel_cached():
    """Función para cargar Excel - SIN límites, con múltiples fuentes - CACHÉ DESHABILITADO"""
    proyectos_totales = []
    
    try:
        # Intentar cargar desde proyectos_reales_2026.xlsx primero
        print(f"📂 Intentando cargar desde: {DATA_PATH}")
        if os.path.exists(DATA_PATH):
            try:
                df = pd.read_excel(DATA_PATH)
                # Normalizar columnas si es necesario (limpiar espacios)
                df.columns = df.columns.str.strip()
                proyectos = df.to_dict('records')
                print(f"✅ Cargados {len(proyectos)} proyectos REALES desde {DATA_PATH}")
                if proyectos:
                    proyectos_totales.extend(proyectos)
            except Exception as e:
                print(f"⚠️ Error leyendo {DATA_PATH}: {e}")
        else:
             print(f"⚠️ Archivo principal no encontrado: {DATA_PATH}")
             # GENERAR DATOS EN VIVO SI NO EXISTEN
             print("🔄 Generando datos reales on-the-fly...")
             try:
                 proyectos_reales = [
                    {
                        "Nombre": "Convocatoria Nacional de Proyectos de Innovación: Bienes Públicos 2025-2026",
                        "Fuente": "FIA",
                        "Fecha cierre": "2025-07-22",
                        "Monto": "150000000",
                        "Estado": "Abierto",
                        "Área de interés": "Agricultura",
                        "Descripción": "Apoya el desarrollo de innovaciones de libre disposición y uso para solucionar problemas comunes del sector silvoagropecuario. Financiamiento máximo de $150.000.000 (90% del costo).",
                        "Enlace": "https://www.fia.cl"
                    },
                    {
                        "Nombre": "Convocatoria Nacional de Proyectos de Innovación: Interés Privado 2025-2026",
                        "Fuente": "FIA",
                        "Fecha cierre": "2025-07-08",
                        "Monto": "120000000",
                        "Estado": "Abierto",
                        "Área de interés": "Agricultura",
                        "Descripción": "Apoya innovaciones en productos y/o procesos con potencial de comercialización. Financiamiento máximo de $120.000.000 (80% del costo). Para personas jurídicas.",
                        "Enlace": "https://www.fia.cl"
                    },
                    {
                        "Nombre": "Giras Nacionales de Innovación para Mujeres Agroinnovadoras 2025",
                        "Fuente": "FIA",
                        "Fecha cierre": "2025-10-07",
                        "Monto": "Valorizable",
                        "Estado": "Abierto",
                        "Área de interés": "Agricultura",
                        "Descripción": "Instrumento de ventanilla abierta para difundir información y experiencias innovadoras, enfocado en mujeres agroinnovadoras.",
                        "Enlace": "https://www.fia.cl"
                    },
                    {
                        "Nombre": "Sistema de Incentivos para la Sustentabilidad Agroambiental (SIRSD-S) 2025",
                        "Fuente": "INDAP",
                        "Fecha cierre": "2025-07-25",
                        "Monto": "Variado",
                        "Estado": "Abierto",
                        "Área de interés": "Medio Ambiente",
                        "Descripción": "Incentivos para prácticas sustentables en suelos agropecuarios. Concurso abierto para recuperación de suelos degradados.",
                        "Enlace": "https://www.indap.gob.cl"
                    },
                    {
                        "Nombre": "Programa de Desarrollo de Inversiones (PDI) - GORE O'Higgins 2025",
                        "Fuente": "INDAP",
                        "Fecha cierre": "2025-12-31",
                        "Monto": "50000000",
                        "Estado": "Abierto",
                        "Área de interés": "Infraestructura",
                        "Descripción": "Cofinaciamiento de inversiones para mejorar procesos productivos. Hasta $7.5M para individuales y $50M para asociativos.",
                        "Enlace": "https://www.indap.gob.cl"
                    },
                    {
                        "Nombre": "Call for Proposals 2026: Sustainable Agricultural Productivity",
                        "Fuente": "FONTAGRO",
                        "Fecha cierre": "2026-03-30",
                        "Monto": "180000000",
                        "Estado": "Próximamente",
                        "Área de interés": "Innovación",
                        "Descripción": "Financiamiento para innovaciones en productividad agrícola sostenible y cambio climático en América Latina. Hasta US$200,000.",
                        "Enlace": "https://www.fontagro.org"
                    },
                    {
                        "Nombre": "Fondo de Investigación en Agricultura – Escasez Hídrica 2025",
                        "Fuente": "ANID",
                        "Fecha cierre": "2025-11-12",
                        "Monto": "Variado",
                        "Estado": "Abierto",
                        "Área de interés": "Recursos Hídricos",
                        "Descripción": "Fondo destinado a la investigación aplicada para enfrentar la escasez hídrica en la agricultura.",
                        "Enlace": "https://www.anid.cl"
                    },
                    {
                        "Nombre": "Uso y adopción de IA en la industria chilena (Programas Tecnológicos)",
                        "Fuente": "CORFO",
                        "Fecha cierre": "2025-07-24",
                        "Monto": "Variado",
                        "Estado": "Abierto",
                        "Área de interés": "ICT & Telecom",
                        "Descripción": "Programa para fomentar la adopción de IA en la industria, con potencial aplicación en agrotech.",
                        "Enlace": "https://www.corfo.cl"
                    },
                    {
                        "Nombre": "FO4IMPACT: Fortalecimiento de Organizaciones de Agricultores",
                        "Fuente": "IFAD",
                        "Fecha cierre": "2025-11-14",
                        "Monto": "Variado",
                        "Estado": "Abierto",
                        "Área de interés": "Agricultura",
                        "Descripción": "Llamado para el fortalecimiento institucional, acceso a mercados y transformación política de organizaciones de agricultores.",
                        "Enlace": "https://www.ifad.org"
                    }
                 ]
                 proyectos_totales.extend(proyectos_reales)
                 # Intentar guardar para la próxima
                 try:
                     pd.DataFrame(proyectos_reales).to_excel(DATA_PATH, index=False)
                     print(f"✅ Datos reales generados y guardados en {DATA_PATH}")
                 except Exception as save_err:
                     print(f"⚠️ No se pudo guardar archivo cache: {save_err}")
             except Exception as gen_err:
                 print(f"❌ Error generando datos fallo respaldo: {gen_err}")

        # Intentar otros archivos como respaldo (Legacy)
        archivos_alternativos = [
            os.path.join(DATA_DIR, 'proyectos_fortalecidos.xlsx'),
            os.path.join(DATA_DIR, 'proyectos_completos.xlsx'),
            os.path.join(DATA_DIR, 'proyectos_actualizados.xlsx')
        ]
        
        for archivo_alt in archivos_alternativos:
            if os.path.exists(archivo_alt) and len(proyectos_totales) == 0:
                try:
                    df = pd.read_excel(archivo_alt)
                    proyectos = df.to_dict('records')
                    print(f"📂 Cargados {len(proyectos)} proyectos desde {archivo_alt}")
                    if proyectos:
                        proyectos_totales.extend(proyectos)
                        # Guardar en el archivo principal para futuras cargas
                        try:
                            df.to_excel(DATA_PATH, index=False)
                            print(f"💾 Datos sincronizados a {DATA_PATH}")
                        except:
                            pass
                        break
                except Exception as e:
                    print(f"⚠️ Error cargando {archivo_alt}: {e}")
                    continue
        
        # Si aún no hay proyectos, intentar desde proyectos_raw
        if len(proyectos_totales) == 0:
            print("🔄 No se encontraron archivos Excel, intentando cargar desde proyectos_raw...")
            try:
                from proyectos_base import proyectos_raw, convertir_proyectos_raw_a_formato
                proyectos_desde_raw = convertir_proyectos_raw_a_formato()
                if proyectos_desde_raw:
                    print(f"📊 Cargados {len(proyectos_desde_raw)} proyectos desde proyectos_raw")
                    proyectos_totales.extend(proyectos_desde_raw)
            except Exception as e:
                print(f"⚠️ Error cargando desde proyectos_raw: {e}")
        
        # Si aún no hay proyectos, intentar desde scrapers
        if len(proyectos_totales) == 0:
            print("🔄 Intentando cargar desde scrapers...")
            try:
                # Intentar múltiples scrapers
                scrapers_a_intentar = [
                    ("International Funding", "scrapers.international_funding", "obtener_proyectos_internacionales"),
                    ("DevelopmentAid", "scrapers.developmentaid", "obtener_proyectos_developmentaid"),
                    ("Devex", "scrapers.devex", "obtener_proyectos_devex"),
                    ("CORFO Real", "scrapers.corfo_real", "obtener_proyectos_corfo_real"),
                    ("Fuentes Agrícolas", "scrapers.fuentes_agricolas", "obtener_proyectos_fia"),
                ]
                
                for nombre, modulo, funcion in scrapers_a_intentar:
                    try:
                        modulo_obj = __import__(modulo, fromlist=[funcion])
                        scraper_func = getattr(modulo_obj, funcion)
                        proyectos_scrapers = scraper_func()
                        if proyectos_scrapers:
                            print(f"📊 Cargados {len(proyectos_scrapers)} proyectos desde {nombre}")
                            proyectos_totales.extend(proyectos_scrapers)
                            break  # Si encontramos proyectos, no intentar más
                    except Exception as e:
                        print(f"⚠️ Error con {nombre}: {e}")
                        continue
            except Exception as e:
                print(f"⚠️ Error cargando desde scrapers: {e}")
        
        if not proyectos_totales:
            print("⚠️ No se encontraron proyectos en ninguna fuente")
        
        return proyectos_totales
        
    except Exception as e:
        print(f"❌ Error general cargando Excel: {e}")
        import traceback
        traceback.print_exc()
        return []

def cargar_excel():
    """Cargar datos de Excel - SIN límites, con fallbacks y sin duplicados"""
    try:
        proyectos = _cargar_excel_cached()
        
        # Si no hay proyectos, crear datos de ejemplo
        if not proyectos:
            print("⚠️ No se encontraron proyectos, creando datos de ejemplo")
            proyectos = crear_datos_ejemplo()
        
        # Limpiar duplicados por nombre
        if proyectos:
            proyectos_unicos = []
            nombres_vistos = set()
            for p in proyectos:
                nombre = str(p.get('Nombre', '')).strip()
                if nombre and nombre not in nombres_vistos:
                    nombres_vistos.add(nombre)
                    proyectos_unicos.append(p)
            
            if len(proyectos_unicos) != len(proyectos):
                print(f"🧹 Eliminados {len(proyectos) - len(proyectos_unicos)} duplicados")
                proyectos = proyectos_unicos
        
        print(f"✅ Retornando {len(proyectos)} proyectos únicos (SIN límites)")
        return proyectos
    except Exception as e:
        print(f"❌ Error cargando Excel: {e}")
        import traceback
        traceback.print_exc()
        # Retornar datos de ejemplo en caso de error
        return crear_datos_ejemplo()

def crear_datos_ejemplo():
    """Crear datos de ejemplo si no hay proyectos disponibles - Usa proyectos_raw reales"""
    print("📝 Creando datos desde proyectos_raw...")
    
    try:
        # Intentar importar proyectos_raw
        from proyectos_base import proyectos_raw, convertir_proyectos_raw_a_formato
        proyectos_ejemplo = convertir_proyectos_raw_a_formato()
        print(f"✅ Cargados {len(proyectos_ejemplo)} proyectos desde proyectos_raw")
        return proyectos_ejemplo
    except ImportError:
        print("⚠️ No se pudo importar proyectos_base, usando datos básicos...")
        # Fallback a datos básicos
        proyectos_ejemplo = [
            {
                'Nombre': 'Programa de Desarrollo Rural Sostenible',
                'Fuente': 'IICA Chile',
                'Área de interés': 'Desarrollo Rural',
                'Monto': 'USD 500,000',
                'Fecha cierre': '2025-12-31',
                'Estado': 'Abierto',
                'Descripción': 'Programa para apoyar el desarrollo rural sostenible en comunidades agrícolas.',
                'Enlace': '#',
                'Enlace Postulación': '#'
            },
            {
                'Nombre': 'Fondo de Innovación Agrícola',
                'Fuente': 'CORFO',
                'Área de interés': 'Innovación Tecnológica',
                'Monto': 'USD 1,000,000',
                'Fecha cierre': '2025-12-15',
                'Estado': 'Abierto',
                'Descripción': 'Fondo para proyectos de innovación en el sector agrícola.',
                'Enlace': '#',
                'Enlace Postulación': '#'
            },
            {
                'Nombre': 'Programa Juventud Rural',
                'Fuente': 'INDAP',
                'Área de interés': 'Juventudes Rurales',
                'Monto': 'USD 300,000',
                'Fecha cierre': '2025-12-20',
                'Estado': 'Abierto',
                'Descripción': 'Programa dirigido a jóvenes emprendedores del sector rural.',
                'Enlace': '#',
                'Enlace Postulación': '#'
            }
        ]
        print(f"✅ Creados {len(proyectos_ejemplo)} proyectos básicos")
        return proyectos_ejemplo

def calcular_estadisticas(proyectos):
    """Calcular estadísticas de proyectos"""
    if not proyectos:
        return {
            'total_proyectos': 0,
            'proyectos_abiertos': 0,
            'fuentes_unicas': 0,
            'monto_total': 0
        }
    
    total = len(proyectos)
    abiertos = len([p for p in proyectos if p.get('Estado', '').lower() in ['abierto', 'activo', 'disponible']])
    fuentes = len(set(p.get('Fuente', '') for p in proyectos))
    
    montos = []
    for p in proyectos:
        monto = p.get('Monto', 0)
        if isinstance(monto, (int, float)) and monto > 0:
            montos.append(monto)
        elif isinstance(monto, str):
            try:
                monto_num = float(monto.replace('$', '').replace(',', '').replace('USD', '').strip())
                montos.append(monto_num)
            except:
                pass
    
    monto_total = sum(montos) if montos else 0
    
    return {
        'total_proyectos': total,
        'proyectos_abiertos': abiertos,
        'fuentes_unicas': fuentes,
        'monto_total': monto_total
    }

def filtrar_proyectos(proyectos, query='', area='', fuente='', estado='', monto_min=None, monto_max=None):
    """
    Función mejorada para filtrar proyectos con múltiples criterios
    
    Args:
        proyectos: Lista de proyectos a filtrar
        query: Búsqueda general por palabras clave
        area: Filtro por área de interés
        fuente: Filtro por fuente de financiamiento
        estado: Filtro por estado del proyecto
        monto_min: Monto mínimo (opcional)
        monto_max: Monto máximo (opcional)
    
    Returns:
        Lista de proyectos filtrados
    """
    if not proyectos:
        return []
    
    proyectos_filtrados = proyectos.copy()
    
    # Búsqueda general por palabras clave
    if query:
        query_lower = query.lower().strip()
        proyectos_filtrados = [p for p in proyectos_filtrados if 
                             query_lower in str(p.get('Nombre', '')).lower() or
                             query_lower in str(p.get('Descripción', '')).lower() or
                             query_lower in str(p.get('Fuente', '')).lower() or
                             query_lower in str(p.get('Área de interés', '')).lower() or
                             query_lower in str(p.get('Palabras Clave', '')).lower()]
    
    # Filtro por área de interés
    if area:
        area_lower = area.lower().strip()
        proyectos_filtrados = [p for p in proyectos_filtrados 
                             if area_lower in str(p.get('Área de interés', '')).lower()]
    
    # Filtro por fuente
    if fuente:
        fuente_lower = fuente.lower().strip()
        proyectos_filtrados = [p for p in proyectos_filtrados 
                             if fuente_lower in str(p.get('Fuente', '')).lower()]
    
    # Filtro por estado
    if estado:
        estado_lower = estado.lower().strip()
        proyectos_filtrados = [p for p in proyectos_filtrados 
                             if estado_lower in str(p.get('Estado', '')).lower()]
    
    # Filtro por monto (si se proporciona)
    if monto_min is not None or monto_max is not None:
        proyectos_con_monto = []
        for p in proyectos_filtrados:
            monto = p.get('Monto', 0)
            monto_num = 0
            
            if isinstance(monto, (int, float)) and monto > 0:
                monto_num = float(monto)
            elif isinstance(monto, str):
                try:
                    monto_num = float(monto.replace('$', '').replace(',', '').replace('USD', '').strip())
                except:
                    monto_num = 0
            
            # Aplicar filtros de monto
            if monto_min is not None and monto_num < monto_min:
                continue
            if monto_max is not None and monto_num > monto_max:
                continue
            
            proyectos_con_monto.append(p)
        
        proyectos_filtrados = proyectos_con_monto
    
    return proyectos_filtrados

def exportar_csv(proyectos, filename='proyectos_iica.csv'):
    """
    Exportar proyectos a CSV sin usar pandas
    
    Args:
        proyectos: Lista de diccionarios con los proyectos
        filename: Nombre del archivo CSV a crear
    
    Returns:
        Ruta del archivo creado
    """
    if not proyectos:
        raise ValueError("No hay proyectos para exportar")
    
    # Obtener todas las claves únicas de todos los proyectos
    fieldnames = set()
    for proyecto in proyectos:
        fieldnames.update(proyecto.keys())
    
    # Ordenar las columnas para consistencia
    fieldnames = sorted(list(fieldnames))
    
    # Crear directorio de exports si no existe
    export_dir = 'exports'
    os.makedirs(export_dir, exist_ok=True)
    
    filepath = os.path.join(export_dir, filename)
    
    # Escribir CSV
    with open(filepath, 'w', newline='', encoding='utf-8-sig') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction='ignore')
        writer.writeheader()
        
        for proyecto in proyectos:
            # Limpiar valores None y convertirlos a strings vacíos
            row = {}
            for key in fieldnames:
                value = proyecto.get(key, '')
                if value is None:
                    value = ''
                elif not isinstance(value, str):
                    value = str(value)
                row[key] = value
            writer.writerow(row)
    
    print(f"✅ CSV exportado exitosamente: {filepath}")
    return filepath

# ===== RUTAS PRINCIPALES =====

@app.route('/', methods=['GET', 'POST'])
def home():
    """Página principal con todos los proyectos y filtros mejorados"""
    print(f"🏠 RUTA HOME - Versión: {APP_VERSION}")
    
    try:
        # Cargar proyectos con manejo robusto de errores
        try:
            proyectos = cargar_excel()
            if not proyectos:
                print("⚠️ No hay proyectos, usando datos de ejemplo")
                proyectos = crear_datos_ejemplo()
        except Exception as e:
            print(f"❌ Error cargando proyectos: {e}")
            proyectos = crear_datos_ejemplo()
        
        print(f"📊 Total de proyectos cargados: {len(proyectos)}")
        
        # Obtener parámetros de filtro (soporta GET y POST)
        if request.method == 'POST':
            query = request.form.get('query', '').strip()
            busqueda = request.form.get('busqueda', query).strip()  # Compatibilidad con nombre anterior
            area = request.form.get('area', '').strip()
            fuente = request.form.get('fuente', '').strip()
            estado = request.form.get('estado', '').strip()
            monto_min = request.form.get('monto_min', '')
            monto_max = request.form.get('monto_max', '')
            
            # Convertir montos a float si están presentes
            monto_min = float(monto_min) if monto_min and monto_min.replace('.', '').isdigit() else None
            monto_max = float(monto_max) if monto_max and monto_max.replace('.', '').isdigit() else None
        else:
            # Método GET
            query = request.args.get('query', '').strip()
            busqueda = request.args.get('busqueda', query).strip()  # Compatibilidad
            area = request.args.get('area', '').strip()
            fuente = request.args.get('fuente', '').strip()
            estado = request.args.get('estado', '').strip()
            monto_min = request.args.get('monto_min', '')
            monto_max = request.args.get('monto_max', '')
            
            # Convertir montos a float si están presentes
            monto_min = float(monto_min) if monto_min and monto_min.replace('.', '').isdigit() else None
            monto_max = float(monto_max) if monto_max and monto_max.replace('.', '').isdigit() else None
        
        # Usar función mejorada de filtrado
        query_final = busqueda if busqueda else query
        proyectos_filtrados = filtrar_proyectos(
            proyectos, 
            query=query_final,
            area=area,
            fuente=fuente,
            estado=estado,
            monto_min=monto_min,
            monto_max=monto_max
        )
        
        print(f"📊 Proyectos después de filtros: {len(proyectos_filtrados)}")
        
        # Ordenamiento ANTES de paginación
        ordenar_por = request.args.get('ordenar_por', 'fecha')
        orden = request.args.get('orden', 'asc')
        
        if ordenar_por == 'fecha' and proyectos_filtrados:
            proyectos_filtrados.sort(key=lambda x: str(x.get('Fecha cierre', '')), reverse=(orden == 'desc'))
        elif ordenar_por == 'monto' and proyectos_filtrados:
            proyectos_filtrados.sort(key=lambda x: parsear_monto(x.get('Monto', 0)), reverse=(orden == 'desc'))
        elif ordenar_por == 'nombre' and proyectos_filtrados:
            proyectos_filtrados.sort(key=lambda x: str(x.get('Nombre', '')), reverse=(orden == 'desc'))
        elif ordenar_por == 'fuente' and proyectos_filtrados:
            proyectos_filtrados.sort(key=lambda x: str(x.get('Fuente', '')), reverse=(orden == 'desc'))
        
        # Calcular estadísticas con proyectos filtrados
        stats = calcular_estadisticas(proyectos_filtrados)
        
        # Paginación DESPUÉS de filtros y ordenamiento
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)  # Aumentado a 20 por defecto
        if per_page > 100:  # Límite máximo de seguridad
            per_page = 100
        
        start = (page - 1) * per_page
        end = start + per_page
        proyectos_paginados = proyectos_filtrados[start:end]
        
        # Agregar índice global a cada proyecto para enlaces correctos
        # IMPORTANTE: El índice debe ser en la lista COMPLETA de proyectos (sin filtros)
        # para que funcione correctamente con la ruta /proyecto/<id>
        for idx, proyecto in enumerate(proyectos_paginados):
            # Buscar el proyecto en la lista completa original
            nombre_proyecto = str(proyecto.get('Nombre', '')).strip()
            indice_global = None
            
            # Buscar por nombre en la lista completa
            for i, p_orig in enumerate(proyectos):
                if str(p_orig.get('Nombre', '')).strip() == nombre_proyecto:
                    indice_global = i
                    break
            
            # Si no se encuentra por nombre, usar el índice calculado
            # Esto puede pasar si hay proyectos duplicados o nombres similares
            if indice_global is None:
                # Intentar encontrar por otros campos únicos
                for i, p_orig in enumerate(proyectos):
                    if (p_orig.get('Fuente') == proyecto.get('Fuente') and 
                        p_orig.get('Fecha cierre') == proyecto.get('Fecha cierre')):
                        indice_global = i
                        break
                
                # Si aún no se encuentra, usar posición estimada
                if indice_global is None:
                    indice_global = min(start + idx, len(proyectos) - 1)
            
            proyecto['_indice_global'] = indice_global
            proyecto['_indice_pagina'] = idx
            proyecto['_indice_en_filtrados'] = start + idx
        
        total_pages = (len(proyectos_filtrados) + per_page - 1) // per_page if proyectos_filtrados else 1
        
        print(f"📊 Mostrando página {page} de {total_pages}")
        print(f"📊 Proyectos en esta página: {len(proyectos_paginados)}")
        print(f"📊 Total filtrados: {len(proyectos_filtrados)}")
        print(f"📊 Total sin filtros: {len(proyectos)}")
        # Try templates in order of preference
        templates_fallback = ['home_institucional.html', 'home_didactico.html', 'home_ordenado_mejorado.html', 'home.html']
        
        print(f"🎯 Intentando renderizar templates en orden: {templates_fallback}")
        
        template_a_usar = templates_fallback[0] # Default for logging
        
        # Preparar datos para el template (asegurar que todos los campos existan)
        datos_template = {
            'proyectos': proyectos_paginados,
            'stats': stats,
            'current_page': page,
            'total_pages': total_pages,
            'total_proyectos': len(proyectos_filtrados),
            'total_todos': len(proyectos),
            'per_page': per_page,
            'area': area or '',
            'fuente': fuente or '',
            'busqueda': busqueda or query_final or '',
            'query': query_final or '',
            'estado': estado or '',
            'ordenar_por': ordenar_por or 'fecha',
            'orden': orden or 'asc',
            'monto_min': monto_min,
            'monto_max': monto_max,
            'app_version': APP_VERSION,  # Para cache busting en el template
            'build_timestamp': BUILD_TIMESTAMP
        }
        
        for template_intento in templates_fallback:
            try:
                # Invalidar caché ANTES de renderizar
                app.jinja_env.cache = None
                resultado = render_template(template_intento, **datos_template)
                print(f"✅ Template {template_intento} renderizado exitosamente")
                return resultado
            except Exception as template_error:
                print(f"⚠️ Error con template {template_intento}: {template_error}")
                if template_intento == templates_fallback[-1]:
                    # Si es el último fallback, mostrar error
                    import traceback
                    traceback.print_exc()
                    return f"""
                    <html>
                    <head><title>Error de Template</title></head>
                    <body style="font-family: Arial; padding: 40px; background: #f5f5f5;">
                        <h1 style="color: #d32f2f;">⚠️ Error de Template</h1>
                        <p><strong>Error:</strong> {str(template_error)}</p>
                        <p><strong>Versión:</strong> {APP_VERSION}</p>
                        <hr>
                        <p>La aplicación está funcionando. El endpoint <a href="/api/proyectos">/api/proyectos</a> debería funcionar correctamente.</p>
                    </body>
                    </html>
                    """, 500
                # Continuar con el siguiente fallback
                continue
    except Exception as e:
        print(f"❌ Error en home: {e}")
        import traceback
        traceback.print_exc()
        # Intentar mostrar página con datos básicos aunque haya error
        try:
            proyectos_basicos = cargar_excel()
            stats_basicos = calcular_estadisticas(proyectos_basicos if proyectos_basicos else [])
            proyectos_mostrar = proyectos_basicos[:20] if proyectos_basicos else []
            # Agregar índices
            for idx, p in enumerate(proyectos_mostrar):
                p['_indice_global'] = idx
                p['_indice_pagina'] = idx
            # Intentar usar template didáctico, sino usar alternativo
            import os
            # Verificar qué template está disponible
            templates_disponibles = ['home_didactico.html', 'home_ordenado_mejorado.html', 'home.html']
            template_a_usar = None
            
            for template in templates_disponibles:
                template_path = os.path.join('templates', template)
                if os.path.exists(template_path):
                    template_a_usar = template
                    break
            
            if not template_a_usar:
                template_a_usar = 'home.html'
            
            return render_template(template_a_usar,  # TEMPLATE DIDÁCTICO Y AMIGABLE
                                 proyectos=proyectos_mostrar,
                                 stats=stats_basicos,
                                 current_page=1,
                                 total_pages=1,
                                 total_proyectos=len(proyectos_basicos) if proyectos_basicos else 0,
                                 total_todos=len(proyectos_basicos) if proyectos_basicos else 0,
                                 per_page=20,
                                 area='',
                                 fuente='',
                                 busqueda='',
                                 estado='',
                                 ordenar_por='fecha',
                                 orden='asc',
                                 error_message=f"Error: {str(e)}")
        except Exception as e2:
            print(f"❌ Error incluso en fallback: {e2}")
            import traceback
            traceback.print_exc()
            # Crear respuesta HTML básica como último recurso
            return crear_respuesta_html_basica({
                'proyectos': [],
                'stats': {'total_proyectos': 0, 'proyectos_abiertos': 0, 'fuentes_unicas': 0, 'monto_total': 0},
                'error': f"Error: {str(e)}"
            })

def crear_respuesta_html_basica(datos):
    """Crear respuesta HTML básica cuando los templates fallan"""
    proyectos = datos.get('proyectos', [])
    stats = datos.get('stats', {})
    
    html = f"""
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>IICA Chile - Plataforma de Financiamiento</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>
            body {{ font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }}
            .container {{ max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
            h1 {{ color: #2E7D32; margin-bottom: 30px; }}
            .stat-card {{ background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 10px 0; }}
            .project-card {{ border: 1px solid #ddd; padding: 15px; margin: 15px 0; border-radius: 8px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🌱 IICA Chile - Plataforma de Financiamiento Agrícola</h1>
            
            <div class="row mb-4">
                <div class="col-md-3">
                    <div class="stat-card">
                        <h3>{stats.get('total_proyectos', 0)}</h3>
                        <p>Proyectos Totales</p>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card">
                        <h3>{stats.get('proyectos_abiertos', 0)}</h3>
                        <p>Proyectos Abiertos</p>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card">
                        <h3>{stats.get('fuentes_unicas', 0)}</h3>
                        <p>Fuentes</p>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card">
                        <h3>${stats.get('monto_total', 0):,.0f}</h3>
                        <p>Monto Total</p>
                    </div>
                </div>
            </div>
            
            <h2>Proyectos Disponibles</h2>
    """
    
    if proyectos:
        for proyecto in proyectos:
            nombre = proyecto.get('Nombre', 'Sin nombre')
            fuente = proyecto.get('Fuente', 'No especificada')
            monto = proyecto.get('Monto', 'Consultar')
            estado = proyecto.get('Estado', 'No especificado')
            
            html += f"""
            <div class="project-card">
                <h4>{nombre}</h4>
                <p><strong>Fuente:</strong> {fuente}</p>
                <p><strong>Monto:</strong> {monto}</p>
                <p><strong>Estado:</strong> {estado}</p>
            </div>
            """
    else:
        html += "<p>No hay proyectos disponibles en este momento.</p>"
    
    html += """
            <hr>
            <p class="text-muted">© 2025 IICA Chile. Instituto Interamericano de Cooperación para la Agricultura</p>
        </div>
    </body>
    </html>
    """
    
    return html, 200

@app.route('/proyecto/<int:proyecto_id>')
@app.route('/proyecto/<proyecto_id>')  # También aceptar string por si acaso
def ver_proyecto(proyecto_id):
    """Ver detalles de un proyecto específico - MEJORADO CON DOCUMENTOS"""
    try:
        # Convertir a int si es string
        if isinstance(proyecto_id, str):
            try:
                proyecto_id = int(proyecto_id)
            except ValueError:
                return render_template('error.html', 
                                     error=f"ID de proyecto inválido: {proyecto_id}",
                                     error_code=400), 400
        
        proyectos = cargar_excel()
        print(f"🔍 Buscando proyecto con ID: {proyecto_id} de {len(proyectos)} proyectos totales")
        print(f"🔍 Tipo de ID: {type(proyecto_id)}")
        
        if 0 <= proyecto_id < len(proyectos):
            proyecto = proyectos[proyecto_id]
            print(f"✅ Proyecto encontrado: {proyecto.get('Nombre', 'Sin nombre')}")
            
            # Generar lista de documentos necesarios para postular
            documentos_necesarios = generar_documentos_postulacion(proyecto)
            
            # Asegurar que el proyecto tenga enlaces
            if 'Enlace' not in proyecto or not proyecto.get('Enlace'):
                proyecto['Enlace'] = proyecto.get('Enlace Postulación', proyecto.get('Enlace', '#'))
            if 'Enlace Postulación' not in proyecto or not proyecto.get('Enlace Postulación'):
                proyecto['Enlace Postulación'] = proyecto.get('Enlace', '#')
            
            return render_template('proyecto_detalle_fortalecido.html', 
                                 proyecto=proyecto,
                                 proyecto_id=proyecto_id,
                                 total_proyectos=len(proyectos),
                                 documentos=documentos_necesarios)
        else:
            print(f"❌ Proyecto ID {proyecto_id} fuera de rango (0-{len(proyectos)-1})")
            # Intentar buscar por nombre si el ID no funciona
            nombre_buscado = request.args.get('nombre', '')
            if nombre_buscado:
                for i, p in enumerate(proyectos):
                    if nombre_buscado.lower() in str(p.get('Nombre', '')).lower():
                        return redirect(url_for('ver_proyecto', proyecto_id=i))
            
            return render_template('error.html', 
                                 error=f"Proyecto no encontrado. ID {proyecto_id} fuera de rango (0-{len(proyectos)-1})",
                                 total_proyectos=len(proyectos),
                                 error_code=404), 404
    except Exception as e:
        print(f"❌ Error en ver_proyecto: {e}")
        import traceback
        traceback.print_exc()
        return render_template('error.html', 
                             error=f"Error al cargar proyecto: {str(e)}",
                             error_code=500), 500

def generar_documentos_postulacion(proyecto):
    """Generar lista de documentos necesarios para postular"""
    documentos = []
    
    # Documentos básicos siempre requeridos
    documentos_basicos = [
        {
            'nombre': 'Carta de Presentación',
            'descripcion': 'Carta formal presentando la organización y el proyecto',
            'requerido': True,
            'tipo': 'documento'
        },
        {
            'nombre': 'Formulario de Postulación',
            'descripcion': 'Formulario oficial del fondo o programa',
            'requerido': True,
            'tipo': 'formulario'
        },
        {
            'nombre': 'Presupuesto Detallado',
            'descripcion': 'Desglose completo de costos del proyecto',
            'requerido': True,
            'tipo': 'financiero'
        },
        {
            'nombre': 'Cronograma de Actividades',
            'descripcion': 'Plan de trabajo con fechas y actividades',
            'requerido': True,
            'tipo': 'planificacion'
        }
    ]
    
    # Documentos según área de interés
    area = str(proyecto.get('Área de interés', '')).lower()
    
    if 'desarrollo rural' in area or 'rural' in area:
        documentos.extend([
            {
                'nombre': 'Estudio Socioeconómico del Área',
                'descripcion': 'Análisis de la situación socioeconómica de la zona',
                'requerido': True,
                'tipo': 'estudio'
            },
            {
                'nombre': 'Plan de Desarrollo Comunitario',
                'descripcion': 'Estrategia de desarrollo para la comunidad',
                'requerido': True,
                'tipo': 'planificacion'
            }
        ])
    
    if 'tecnología' in area or 'innovación' in area:
        documentos.extend([
            {
                'nombre': 'Propuesta Técnica de Innovación',
                'descripcion': 'Detalle técnico de la innovación propuesta',
                'requerido': True,
                'tipo': 'tecnico'
            },
            {
                'nombre': 'Plan de Transferencia Tecnológica',
                'descripcion': 'Estrategia para transferir la tecnología',
                'requerido': False,
                'tipo': 'planificacion'
            }
        ])
    
    if 'sostenibilidad' in area or 'ambiental' in area:
        documentos.extend([
            {
                'nombre': 'Estudio de Impacto Ambiental',
                'descripcion': 'Evaluación del impacto ambiental del proyecto',
                'requerido': True,
                'tipo': 'ambiental'
            },
            {
                'nombre': 'Plan de Sostenibilidad',
                'descripcion': 'Estrategia de sostenibilidad a largo plazo',
                'requerido': True,
                'tipo': 'planificacion'
            }
        ])
    
    # Documentos financieros adicionales
    monto = proyecto.get('Monto', 0)
    if isinstance(monto, str):
        try:
            monto = float(str(monto).replace('USD', '').replace('$', '').replace(',', '').strip())
        except:
            monto = 0
    
    if monto > 100000:  # Proyectos grandes requieren más documentación
        documentos.extend([
            {
                'nombre': 'Estados Financieros Auditados',
                'descripcion': 'Estados financieros de los últimos 2 años',
                'requerido': True,
                'tipo': 'financiero'
            },
            {
                'nombre': 'Garantías Bancarias',
                'descripcion': 'Documentación de garantías si aplica',
                'requerido': False,
                'tipo': 'financiero'
            }
        ])
    
    # Combinar documentos básicos con específicos
    todos_documentos = documentos_basicos + documentos
    
    # Eliminar duplicados
    documentos_unicos = []
    nombres_vistos = set()
    for doc in todos_documentos:
        if doc['nombre'] not in nombres_vistos:
            nombres_vistos.add(doc['nombre'])
            documentos_unicos.append(doc)
    
    return documentos_unicos

# ===== RUTAS DE NOTIFICACIONES =====

@app.route('/notificaciones')
def notificaciones():
    """Página de notificaciones"""
    try:
        if notification_system:
            notifications = notification_system.get_notifications(limit=20)
            stats = notification_system.get_stats()
        else:
            notifications = []
            stats = {'total_notifications': 0, 'unread_notifications': 0}
        return render_template('notificaciones.html', 
                             notifications=notifications, 
                             stats=stats)
    except Exception as e:
        print(f"❌ Error en notificaciones: {e}")
        return render_template('notificaciones.html', 
                             notifications=[], 
                             stats={'total_notifications': 0, 'unread_notifications': 0})



@app.route('/api/notificaciones', methods=['GET'])
def api_notificaciones():
    """API para obtener notificaciones"""
    try:
        if not notification_system:
            return jsonify({
                'success': True,
                'notifications': [],
                'total': 0,
                'message': 'Sistema de notificaciones no disponible'
            })
        
        limit = request.args.get('limit', 10, type=int)
        unread_only = request.args.get('unread_only', 'false').lower() == 'true'
        
        notifications = notification_system.get_notifications(limit=limit, unread_only=unread_only)
        return jsonify({
            'success': True,
            'notifications': notifications,
            'total': len(notifications)
        })
    except Exception as e:
        print(f"❌ Error en API notificaciones: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# ===== RUTAS DE SEGUIMIENTO DE APLICACIONES =====

@app.route('/mis-aplicaciones')
def mis_aplicaciones():
    """Página de aplicaciones del usuario"""
    try:
        user_email = request.args.get('email', 'usuario@ejemplo.com')
        if application_tracker:
            applications = application_tracker.get_user_applications(user_email)
            stats = application_tracker.get_statistics()
        else:
            applications = []
            stats = {}
        return render_template('mis_aplicaciones.html', 
                             applications=applications, 
                             stats=stats,
                             user_email=user_email)
    except Exception as e:
        print(f"❌ Error en mis-aplicaciones: {e}")
        return render_template('mis_aplicaciones.html', 
                             applications=[], 
                             stats={},
                             user_email='usuario@ejemplo.com')

# ===== RUTAS DE REPORTES =====

@app.route('/reportes')
def reportes():
    """Página de reportes"""
    try:
        proyectos = cargar_excel()
        if advanced_reporting:
            report = advanced_reporting.generate_comprehensive_report(proyectos)
        else:
            # Reporte básico si el sistema avanzado no está disponible
            stats = calcular_estadisticas(proyectos)
            report = {
                'stats': stats,
                'proyectos': proyectos[:10],
                'message': 'Sistema de reportes avanzados no disponible, mostrando reporte básico'
            }
        return render_template('reportes.html', report=report)
    except Exception as e:
        print(f"❌ Error en reportes: {e}")
        return render_template('reportes.html', report={})

# ===== RUTAS DE BACKUP =====

@app.route('/backup')
def backup_page():
    """Página de gestión de backups"""
    try:
        if backup_system:
            backups = backup_system.list_backups()
            stats = backup_system.get_backup_stats()
        else:
            backups = []
            stats = {'message': 'Sistema de backup no disponible'}
        return render_template('backup.html', backups=backups, stats=stats)
    except Exception as e:
        print(f"❌ Error en backup: {e}")
        return render_template('backup.html', backups=[], stats={})

# ===== RUTAS ADICIONALES =====

@app.route('/dashboard')
def dashboard():
    """Dashboard principal - redirige a dashboard avanzado o muestra dashboard simple"""
    try:
        proyectos = cargar_excel()
        stats = calcular_estadisticas(proyectos)
        
        # Intentar usar dashboard avanzado si existe, sino usar simple
        try:
            return render_template('dashboard.html',
                                 proyectos=proyectos[:20],
                                 stats=stats)
        except:
            return render_template('dashboard_simple.html',
                                 proyectos=proyectos[:20],
                                 stats=stats)
    except Exception as e:
        print(f"❌ Error en dashboard: {e}")
        return redirect(url_for('home'))

@app.route('/ai-search', methods=['GET', 'POST'])
def ai_search():
    """Página de búsqueda con IA"""
    try:
            query = request.args.get('query', '') or request.form.get('query', '')
            # Intentar renderizar directament, Flask sabra donde buscar
            return render_template('ai_search.html', query=query)
    except Exception as e:
        print(f"❌ Error en ai-search: {e}")
        import traceback
        traceback.print_exc()
        # Redirigir a home en lugar de mostrar error
        return redirect(url_for('home'))

@app.route('/todos-los-proyectos', methods=['GET', 'POST'])
def todos_los_proyectos():
    """Muestra todos los proyectos disponibles con filtros"""
    try:
        proyectos = cargar_excel()
        
        if not proyectos:
            print("⚠️ No hay proyectos cargados - Mostrando mensaje pero NO 404")
            # Continuar con lista vacía en lugar de error 404
            proyectos = []
        
        # Filtros de búsqueda
        query = request.args.get('query', '') or request.form.get('query', '')
        busqueda = request.args.get('busqueda', '') or request.form.get('busqueda', query)
        area = request.args.get('area', '') or request.form.get('area', '')
        fuente = request.args.get('fuente', '') or request.form.get('fuente', '')
        estado = request.args.get('estado', '') or request.form.get('estado', '')
        
        # Limpiar espacios
        query = query.strip() if query else ''
        busqueda = busqueda.strip() if busqueda else ''
        area = area.strip() if area else ''
        fuente = fuente.strip() if fuente else ''
        estado = estado.strip() if estado else ''
        
        # Usar función de filtrado mejorada
        query_final = busqueda if busqueda else query
        proyectos_filtrados = filtrar_proyectos(
            proyectos,
            query=query_final,
            area=area,
            fuente=fuente,
            estado=estado
        )
        
        # Obtener listas únicas para filtros
        areas_unicas = sorted(list(set(p.get('Área de interés', '') for p in proyectos if p.get('Área de interés'))))
        fuentes_unicas = sorted(list(set(p.get('Fuente', '') for p in proyectos if p.get('Fuente'))))
        estados_unicos = sorted(list(set(p.get('Estado', '') for p in proyectos if p.get('Estado'))))
        
        # CATEGORIZAR PROYECTOS (requerido por el template)
        fuentes_nacionales = ['FIA', 'INDAP', 'CORFO', 'ANID', 'SAG', 'ODEPA', 'MINAGRI']
        fuentes_iica = ['IICA', 'BID', 'FONTAGRO', 'IFAD']
        
        proyectos_nacionales = [p for p in proyectos_filtrados if p.get('Fuente', '') in fuentes_nacionales]
        proyectos_iica = [p for p in proyectos_filtrados if p.get('Fuente', '') in fuentes_iica]
        proyectos_internacionales = [p for p in proyectos_filtrados if p.get('Fuente', '') not in fuentes_nacionales and p.get('Fuente', '') not in fuentes_iica]
        
        # Intentar usar template mejorado, sino usar el básico
        # Usar template mejorado preferentemente
        try:
             return render_template('todos_los_proyectos_mejorado.html',
                                 proyectos=proyectos_filtrados,
                                 proyectos_nacionales=proyectos_nacionales,
                                 proyectos_internacionales=proyectos_internacionales,
                                 proyectos_iica=proyectos_iica,
                                 total_proyectos=len(proyectos_filtrados),
                                 total_todos=len(proyectos),
                                 areas_unicas=areas_unicas,
                                 fuentes_unicas=fuentes_unicas,
                                 estados_unicos=estados_unicos,
                                 query=query_final,
                                 area=area,
                                 fuente=fuente,
                                 estado=estado)
        except:
             # Fallback al basico
             return render_template('todos_los_proyectos.html',
                                 proyectos=proyectos_filtrados,
                                 total_proyectos=len(proyectos_filtrados),
                                 total_todos=len(proyectos),
                                 areas_unicas=areas_unicas,
                                 fuentes_unicas=fuentes_unicas,
                                 estados_unicos=estados_unicos,
                                 query=query_final,
                                 area=area,
                                 fuente=fuente,
                                 estado=estado)
    except Exception as e:
        print(f"❌ Error en todos-los-proyectos: {e}")
        import traceback
        traceback.print_exc()
        # Redirigir a home en lugar de mostrar error
        return redirect(url_for('home'))

@app.route('/quienes-somos')
def quienes_somos():
    """Pagina sobre IICA Chile - Rediseñada 2026"""
    try:
        # Intentar usar template institucional nuevo
        return render_template('iica_quienes_somos.html')
    except:
        # Fallback al template anterior
        try:
            return render_template('quienes_somos.html')
        except Exception as e:
            print(f"Error en quienes-somos: {e}")
            return render_template('error.html',
                                 error="Pagina no disponible",
                                 error_code=500), 500

# ===== RUTAS DE DASHBOARD AVANZADO =====

@app.route('/dashboard-avanzado')
def dashboard_avanzado():
    """Dashboard avanzado con todas las funcionalidades"""
    try:
        proyectos = cargar_excel()
        stats = calcular_estadisticas(proyectos)
        
        # Obtener datos adicionales con fallbacks
        notifications = notification_system.get_notifications(limit=5) if notification_system else []
        applications_stats = application_tracker.get_statistics() if application_tracker else {}
        backup_stats = backup_system.get_backup_stats() if backup_system else {}
        
        return render_template('dashboard_avanzado.html',
                             proyectos=proyectos[:10],
                             stats=stats,
                             notifications=notifications,
                             applications_stats=applications_stats,
                             backup_stats=backup_stats)
    except Exception as e:
        print(f"❌ Error en dashboard-avanzado: {e}")
        return render_template('dashboard_avanzado.html',
                             proyectos=[],
                             stats={},
                             notifications=[],
                             applications_stats={},
                             backup_stats={})

# ===== RUTAS DE API =====

@app.route('/api/backup/create', methods=['POST'])
def crear_backup():
    """Crear backup manual"""
    try:
        if not backup_system:
            return jsonify({
                'success': False,
                'error': 'Sistema de backup no disponible'
            }), 503
        
        backup_type = request.json.get('type', 'manual') if request.json else 'manual'
        backup_path = backup_system.create_backup(backup_type)
        return jsonify({
            'success': True,
            'backup_path': backup_path
        })
    except Exception as e:
        print(f"❌ Error creando backup: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/notificaciones/<int:notification_id>/read', methods=['POST'])
def marcar_notificacion_leida(notification_id):
    """Marcar notificación como leída"""
    try:
        if not notification_system:
            return jsonify({
                'success': False,
                'error': 'Sistema de notificaciones no disponible'
            }), 503
        
        success = notification_system.mark_as_read(notification_id)
        return jsonify({'success': success})
    except Exception as e:
        print(f"❌ Error marcando notificación: {e}")
        return jsonify({'success': False, 'error': str(e)}), 500

# ===== RUTAS DE UTILIDAD =====

@app.route('/exportar-csv')
def exportar_csv_route():
    """Ruta para exportar proyectos a CSV"""
    try:
        # Obtener filtros opcionales
        query = request.args.get('query', '').strip()
        busqueda = request.args.get('busqueda', query).strip()
        area = request.args.get('area', '').strip()
        fuente = request.args.get('fuente', '').strip()
        estado = request.args.get('estado', '').strip()
        
        # Cargar proyectos
        proyectos = cargar_excel()
        
        # Aplicar filtros si existen
        if query or busqueda or area or fuente or estado:
            query_final = busqueda if busqueda else query
            proyectos = filtrar_proyectos(
                proyectos,
                query=query_final,
                area=area,
                fuente=fuente,
                estado=estado
            )
        
        # Generar nombre de archivo con timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'proyectos_iica_{timestamp}.csv'
        
        # Exportar a CSV
        filepath = exportar_csv(proyectos, filename)
        
        # Enviar archivo
        return send_file(
            filepath,
            mimetype='text/csv',
            as_attachment=True,
            download_name=filename
        )
    except Exception as e:
        print(f"❌ Error exportando CSV: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/exportar-csv', methods=['POST'])
def api_exportar_csv():
    """API para exportar proyectos a CSV con filtros"""
    try:
        data = request.get_json() if request.is_json else {}
        
        # Obtener filtros del JSON
        query = data.get('query', '').strip()
        area = data.get('area', '').strip()
        fuente = data.get('fuente', '').strip()
        estado = data.get('estado', '').strip()
        monto_min = data.get('monto_min')
        monto_max = data.get('monto_max')
        
        # Cargar proyectos
        proyectos = cargar_excel()
        
        # Aplicar filtros
        proyectos = filtrar_proyectos(
            proyectos,
            query=query,
            area=area,
            fuente=fuente,
            estado=estado,
            monto_min=monto_min,
            monto_max=monto_max
        )
        
        # Generar nombre de archivo
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'proyectos_iica_{timestamp}.csv'
        
        # Exportar
        filepath = exportar_csv(proyectos, filename)
        
        return jsonify({
            'success': True,
            'filename': filename,
            'filepath': filepath,
            'total_proyectos': len(proyectos),
            'download_url': f'/download-csv/{filename}'
        })
    except Exception as e:
        print(f"❌ Error en API exportar CSV: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/download-csv/<filename>')
def download_csv(filename):
    """Descargar archivo CSV exportado"""
    try:
        filepath = os.path.join('exports', filename)
        if os.path.exists(filepath):
            return send_file(
                filepath,
                mimetype='text/csv',
                as_attachment=True,
                download_name=filename
            )
        else:
            return jsonify({'error': 'Archivo no encontrado'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/proyectos', methods=['GET', 'OPTIONS'])
def api_proyectos():
    """API para obtener proyectos en formato JSON - Compatible con Next.js"""
    # Manejar preflight CORS
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        return response
    
    try:
        # Obtener parámetros de filtro
        query = request.args.get('q', '').strip()
        locations = request.args.get('locations', '').strip()
        sectors = request.args.get('sectors', '').strip()
        status = request.args.get('status', '').strip()
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 9, type=int)
        
        # Cargar proyectos
        proyectos = cargar_excel()
        
        # Convertir locations y sectors a listas si vienen como strings separados por comas
        locations_list = [loc.strip() for loc in locations.split(',')] if locations else []
        sectors_list = [sec.strip() for sec in sectors.split(',')] if sectors else []
        
        # Mapear filtros de Next.js a filtros de Flask
        # Mapear IDs de sectores a nombres de áreas
        sector_id_to_area = {
            '70': 'ICT & Telecom',
            '25': 'Energía',
            '16': 'Infraestructura',
            '10': 'Agricultura',
            '15': 'Educación',
            '20': 'Salud',
            '30': 'Medio Ambiente'
        }
        
        area_filter = None
        if sectors_list:
            # Convertir IDs de sectores a nombres de áreas
            areas = [sector_id_to_area.get(sid, '') for sid in sectors_list if sid in sector_id_to_area]
            area_filter = areas[0] if areas else None
        
        # Mapear ubicaciones (IDs a nombres)
        location_id_to_name = {
            '84': 'Chile',
            '75': 'Argentina',
            '85': 'Colombia',
            '86': 'Perú',
            '87': 'Ecuador',
            '88': 'Bolivia'
        }
        
        fuente_filter = None
        if locations_list:
            # Convertir IDs de ubicaciones a nombres de fuentes
            fuentes = [location_id_to_name.get(lid, '') for lid in locations_list if lid in location_id_to_name]
            fuente_filter = fuentes[0] if fuentes else None
        
        # Estado
        estado_filter = None
        if status:
            if status == 'open':
                estado_filter = 'Abierto'
            elif status == 'closed':
                estado_filter = 'Cerrado'
            elif status == 'draft':
                estado_filter = 'Borrador'
        
        # Aplicar filtros
        proyectos_filtrados = filtrar_proyectos(
            proyectos,
            query=query,
            area=area_filter if area_filter else '',
            fuente=fuente_filter if fuente_filter else '',
            estado=estado_filter if estado_filter else ''
        )
        
        # Paginación
        total = len(proyectos_filtrados)
        start = (page - 1) * per_page
        end = start + per_page
        proyectos_paginados = proyectos_filtrados[start:end]
        
        # Transformar proyectos al formato esperado por Next.js
        tenders = []
        for idx, proyecto in enumerate(proyectos_paginados):
            # Mapear ubicación (usar Fuente como ubicación temporalmente)
            location_map = {
                'Chile': '84',
                'Argentina': '75',
                'Colombia': '85',
                'Perú': '86',
                'Ecuador': '87',
                'Bolivia': '88'
            }
            location = proyecto.get('Fuente', 'Chile')
            location_id = location_map.get(location, '84')
            
            # Mapear sectores desde Área de interés
            sector_map = {
                'ICT & Telecom': '70',
                'Energía': '25',
                'Infraestructura': '16',
                'Agricultura': '10',
                'Educación': '15',
                'Salud': '20',
                'Medio Ambiente': '30'
            }
            area = proyecto.get('Área de interés', '')
            sectors_mapped = [sector_map.get(area, '10')] if area in sector_map else ['10']
            
            # Mapear estado
            estado = proyecto.get('Estado', 'Abierto').lower()
            status_mapped = 'open' if 'abierto' in estado or 'activo' in estado else 'closed' if 'cerrado' in estado else 'draft'
            
            # Parsear monto
            monto_str = str(proyecto.get('Monto', '0'))
            try:
                budget = float(monto_str.replace('USD', '').replace('$', '').replace(',', '').strip())
            except:
                budget = 0
            
            # Parsear fecha
            fecha_cierre = proyecto.get('Fecha cierre', '')
            deadline = fecha_cierre if fecha_cierre else '2025-12-31'
            
            tender = {
                'id': start + idx + 1,
                'title': proyecto.get('Nombre', 'Sin título'),
                'organization': proyecto.get('Fuente', 'Desconocida'),
                'location': location,
                'locationId': location_id,
                'sectors': sectors_mapped,
                'status': status_mapped,
                'budget': int(budget),
                'deadline': deadline,
                'description': proyecto.get('Descripción', ''),
                'link': proyecto.get('Enlace', '#'),
                'applicationLink': proyecto.get('Enlace Postulación', proyecto.get('Enlace', '#'))
            }
            tenders.append(tender)
        
        response = jsonify({
            'success': True,
            'data': tenders,
            'count': total,
            'page': page,
            'per_page': per_page,
            'total_pages': (total + per_page - 1) // per_page
        })
        # Asegurar headers CORS si no se usa flask-cors
        if not CORS_AVAILABLE:
            response.headers['Access-Control-Allow-Origin'] = '*'
        return response
    except Exception as e:
        print(f"❌ Error en API proyectos: {e}")
        import traceback
        traceback.print_exc()
        response = jsonify({
            'success': False,
            'error': str(e),
            'data': [],
            'count': 0
        })
        # Asegurar headers CORS si no se usa flask-cors
        if not CORS_AVAILABLE:
            response.headers['Access-Control-Allow-Origin'] = '*'
        return response, 500

@app.route('/health')
def health():
    """Health check"""
    return jsonify({
        'status': 'healthy', 
        'timestamp': datetime.now().isoformat(),
        'version': APP_VERSION,
        'build_timestamp': BUILD_TIMESTAMP
    })

@app.route('/version')
def version():
    """Endpoint para verificar la versión actual del deploy"""
    return jsonify({
        'version': APP_VERSION,
        'build_timestamp': BUILD_TIMESTAMP,
        'template': 'home_didactico.html',
        'app_name': app.name,
        'status': 'active',
        'cache_disabled': True,
        'gunicorn_preload': False
    })

@app.route('/force-refresh')
def force_refresh():
    """Endpoint para forzar actualización - invalida todos los cachés"""
    # Invalidar caché de Jinja2
    app.jinja_env.cache = None
    
    # El caché de proyectos ya está deshabilitado, pero forzamos recarga
    print("🔄 Force refresh llamado - invalidando todos los cachés")
    
    return jsonify({
        'status': 'success',
        'message': 'Cachés invalidados - la próxima carga será fresca',
        'version': APP_VERSION,
        'timestamp': datetime.now().isoformat(),
        'cache_disabled': True
    })

@app.route('/test-routes')
def test_routes():
    """Ruta de prueba para verificar que todas las rutas funcionan"""
    routes = []
    for rule in app.url_map.iter_rules():
        routes.append({
            'endpoint': rule.endpoint,
            'methods': list(rule.methods),
            'path': str(rule)
        })
    return jsonify({
        'total_routes': len(routes),
        'routes': routes
    })

@app.route('/favicon.ico')
def favicon():
    """Favicon"""
    return '', 204

# ===== MANEJO DE ERRORES =====

@app.errorhandler(404)
def not_found(error):
    """Manejo de errores 404 - Página no encontrada"""
    print(f"❌ 404 - Página no encontrada: {request.url}")
    print(f"🔍 Path solicitado: {request.path}")
    print(f"🔍 Método: {request.method}")
    
    # Intentar redirigir a home si es una ruta común mal escrita
    if request.path in ['/home', '/index', '/index.html']:
        return redirect(url_for('home'))
    
    # Para rutas conocidas que pueden no estar disponibles, redirigir a home
    rutas_redirigir = ['/ai-search', '/dashboard', '/todos-los-proyectos', '/quienes-somos']
    if any(request.path.startswith(ruta) for ruta in rutas_redirigir):
        print(f"⚠️ Ruta {request.path} no disponible, redirigiendo a home")
        return redirect(url_for('home'))
    
    # Para rutas de proyecto inválidas, redirigir a home
    if request.path.startswith('/proyecto/'):
        print(f"⚠️ Proyecto no encontrado, redirigiendo a home")
        return redirect(url_for('home'))
    
    # Mostrar página de error con información útil
    try:
        import os
        error_template = os.path.join('templates', 'error.html')
        if os.path.exists(error_template):
            return render_template('error.html', 
                                 error=f"Página no encontrada: {request.path}",
                                 error_code=404,
                                 suggestion="Verifica la URL o regresa a la página principal."), 404
        else:
            # Si no hay template de error, redirigir a home
            return redirect(url_for('home'))
    except Exception as e:
        # Si todo falla, redirigir a home
        print(f"❌ Error en handler 404: {e}")
        return redirect(url_for('home'))

@app.errorhandler(500)
def internal_error(error):
    """Manejo de errores 500 - Error interno"""
    print(f"❌ 500 - Error interno: {error}")
    import traceback
    traceback.print_exc()
    
    try:
        import os
        error_template = os.path.join('templates', 'error.html')
        if os.path.exists(error_template):
            return render_template('error.html', 
                                 error="Error interno del servidor. Por favor, intenta nuevamente en unos momentos.",
                                 error_code=500), 500
        else:
            # Si no hay template, redirigir a home
            return redirect(url_for('home'))
    except:
        # Si todo falla, redirigir a home
        return redirect(url_for('home'))

@app.errorhandler(Exception)
def handle_exception(e):
    """Manejo global de errores"""
    print(f"❌ Error no manejado: {e}")
    import traceback
    traceback.print_exc()
    
    # Si es un error 404 de Flask, manejarlo específicamente
    if hasattr(e, 'code') and e.code == 404:
        print(f"🔍 Error 404 detectado: {request.path}")
        # Intentar redirigir rutas conocidas a home
        rutas_redirigir = ['/ai-search', '/dashboard', '/todos-los-proyectos', '/quienes-somos']
        if any(request.path.startswith(ruta) for ruta in rutas_redirigir):
            return redirect(url_for('home'))
    
    try:
        return render_template('error.html', 
                             error=f"Error: {str(e)}",
                             error_code=500), 500
    except:
        # Si el template de error falla, retornar respuesta básica
        return f"""
        <html>
        <head><title>Error</title></head>
        <body>
            <h1>Error</h1>
            <p>{str(e)}</p>
            <p><a href="/">Volver a la página principal</a></p>
        </body>
        </html>
        """, 500

if __name__ == '__main__':
    print("🚀 Iniciando Plataforma IICA Chile Mejorada...")
    
    # Obtener puerto de variable de entorno (para Render) o usar 5004 por defecto
    port = int(os.environ.get('PORT', 5004))
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    
    print(f"✅ Puerto: {port}")
    print(f"✅ Modo debug: {debug}")
    print("✅ Funcionalidades avanzadas cargadas")
    print("✅ Sistema de notificaciones: " + ("activo" if notification_system else "mock"))
    print("✅ Sistema de seguimiento: " + ("activo" if application_tracker else "mock"))
    print("✅ Sistema de reportes: " + ("activo" if advanced_reporting else "mock"))
    print("✅ Sistema de backup: " + ("activo" if backup_system else "mock"))
    print("🎉 Plataforma lista para usar")
    
    # Reducir verbosidad del servidor
    logging.getLogger('werkzeug').setLevel(logging.WARNING)
    app.run(debug=debug, host='0.0.0.0', port=port)
