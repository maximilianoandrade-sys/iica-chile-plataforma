"""
Plataforma de Fondos y Convocatorias IICA Chile
Sistema modular para recolección, clasificación y visualización de proyectos
de financiamiento agrícola y desarrollo rural.
"""

from flask import Flask, render_template, request, redirect, url_for, jsonify
import os
import pandas as pd
import logging
from datetime import datetime
from functools import wraps
import time

# Importar scrapers
from scrapers.devex import obtener_proyectos_devex
from scrapers.developmentaid import obtener_proyectos_developmentaid
from scrapers.ungm import obtener_proyectos_ungm
from scrapers.mercadopublico import obtener_proyectos_mercadopublico
from scrapers.fia import obtener_proyectos_fia
from scrapers.globaltenders import obtener_proyectos_globaltenders
from scrapers.fondosgob import obtener_proyectos_fondosgob
from scrapers.inia import obtener_proyectos_inia
from scrapers.fao import obtener_proyectos_fao
from scrapers.worldbank import obtener_proyectos_worldbank
from scrapers.perplexity import obtener_proyectos_perplexity
from scrapers import google_custom

# Importar scrapers especializados IICA
from scrapers.iica_agroemprende import obtener_proyectos_iica_agroemprende
from scrapers.iica_innova_af import obtener_proyectos_iica_innova_af
from scrapers.iica_agua_agricultura import obtener_proyectos_iica_agua_agricultura
from scrapers.iica_chile import obtener_proyectos_iica_chile
from scrapers.iica_repositorio import obtener_proyectos_iica_repositorio

from utils import clasificar_area, parsear_fecha, parsear_monto

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Crear directorios necesarios
os.makedirs('data', exist_ok=True)
os.makedirs('logs', exist_ok=True)

app = Flask(__name__, static_folder='static', static_url_path='/static')
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')

DATA_PATH = "data/proyectos.xlsx"
HISTORICO_PATH = "data/proyectos_historico.xlsx"

# Google Custom Search API configuration
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY", "")
GOOGLE_CX = os.environ.get("GOOGLE_CX", "")


def tiempo_respuesta(func):
    """Decorador para medir tiempo de respuesta"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        inicio = time.time()
        resultado = func(*args, **kwargs)
        tiempo = time.time() - inicio
        logger.info(f"{func.__name__} ejecutado en {tiempo:.2f}s")
        return resultado
    return wrapper


def recolectar_todos():
    """
    Recolecta proyectos de todas las fuentes configuradas.
    Retorna lista de diccionarios con estructura estándar.
    """
    logger.info("🔄 Iniciando recolección de proyectos de todas las fuentes...")
    proyectos = []
    
    # Mapeo de fuentes con sus funciones de scraping
    # Prioridad a fuentes especializadas IICA
    fuentes = [
        # Fuentes especializadas IICA
        ("IICA Chile", obtener_proyectos_iica_chile),
        ("IICA - Agro América Emprende", obtener_proyectos_iica_agroemprende),
        ("IICA - INNOVA AF", obtener_proyectos_iica_innova_af),
        ("IICA - Agua y Agricultura", obtener_proyectos_iica_agua_agricultura),
        ("IICA - Repositorio", obtener_proyectos_iica_repositorio),
        # Otras fuentes
        ("Devex", obtener_proyectos_devex),
        ("DevelopmentAid", obtener_proyectos_developmentaid),
        ("UNGM", obtener_proyectos_ungm),
        ("MercadoPúblico", obtener_proyectos_mercadopublico),
        ("FIA", obtener_proyectos_fia),
        ("GlobalTenders", obtener_proyectos_globaltenders),
        ("Fondos.gob.cl", obtener_proyectos_fondosgob),
        ("INIA", obtener_proyectos_inia),
        ("FAO", obtener_proyectos_fao),
        ("Banco Mundial", obtener_proyectos_worldbank),
        ("Perplexity", lambda: obtener_proyectos_perplexity(query="agriculture")[:5]),
    ]
    
    # Google Custom Search (solo si hay credenciales)
    if GOOGLE_API_KEY and GOOGLE_CX:
        logger.info("🔑 Credenciales de Google Custom Search detectadas")
        fuentes.append(("Google Custom Search", lambda: google_custom.buscar_google_custom(
            "financiamiento agricultura chile", GOOGLE_API_KEY, GOOGLE_CX
        )))
    else:
        logger.warning("⚠️ Google Custom Search no disponible: Faltan credenciales")
    
    for nombre_fuente, funcion_scraper in fuentes:
        try:
            logger.info(f"📡 Recolectando desde {nombre_fuente}...")
            proyectos_fuente = funcion_scraper()
            
            # Validar que sea una lista
            if not isinstance(proyectos_fuente, list):
                logger.warning(f"⚠️ {nombre_fuente}: No retornó una lista, se omite")
                continue
            
            # Validar estructura de proyectos
            proyectos_validos = []
            for proyecto in proyectos_fuente:
                if isinstance(proyecto, dict) and 'Nombre' in proyecto:
                    # Asegurar campos obligatorios
                    proyecto.setdefault('Fuente', nombre_fuente)
                    proyecto.setdefault('Estado', 'Abierto')
                    proyecto.setdefault('Fecha cierre', '')
                    proyecto.setdefault('Monto', '0')
                    proyecto.setdefault('Enlace', '')
                    proyecto.setdefault('Descripción', '')
                    
                    # Clasificar área temática si no existe
                    if 'Área de interés' not in proyecto or not proyecto['Área de interés']:
                        proyecto['Área de interés'] = clasificar_area(
                            proyecto.get('Nombre', '') + ' ' + proyecto.get('Descripción', '')
                        )
                    
                    proyectos_validos.append(proyecto)
                else:
                    logger.debug(f"⚠️ {nombre_fuente}: Proyecto inválido omitido: {type(proyecto)}")
            
            proyectos.extend(proyectos_validos)
            logger.info(f"✅ {nombre_fuente}: {len(proyectos_validos)} proyectos agregados (de {len(proyectos_fuente)} obtenidos)")
            
        except Exception as e:
            logger.error(f"❌ Error recolectando desde {nombre_fuente}: {str(e)}", exc_info=True)
            continue
    
    logger.info(f"🎉 Recolección completada: {len(proyectos)} proyectos totales")
    return proyectos


def guardar_excel(proyectos, path=None):
    """
    Guarda proyectos en Excel con histórico.
    """
    if not proyectos:
        logger.warning("⚠️ No hay proyectos para guardar")
        return
    
    path = path or DATA_PATH
    
    try:
        # Asegurar que el directorio existe
        os.makedirs(os.path.dirname(path) if os.path.dirname(path) else 'data', exist_ok=True)
        
        # Preparar DataFrame
        df = pd.DataFrame(proyectos)
        
        # Normalizar columnas
        columnas_requeridas = ['Nombre', 'Fuente', 'Fecha cierre', 'Enlace', 
                             'Estado', 'Monto', 'Área de interés', 'Descripción']
        for col in columnas_requeridas:
            if col not in df.columns:
                df[col] = ''
        
        # Eliminar duplicados basados en Nombre + Fuente
        df_sin_duplicados = df.drop_duplicates(subset=['Nombre', 'Fuente'], keep='last')
        logger.info(f"📊 Eliminados {len(df) - len(df_sin_duplicados)} duplicados")
        
        # Guardar archivo principal
        df_sin_duplicados.to_excel(path, index=False, engine='openpyxl')
        logger.info(f"💾 Guardados {len(df_sin_duplicados)} proyectos únicos en {path}")
        
        # Actualizar histórico
        actualizar_historico(df_sin_duplicados)
        
    except Exception as e:
        logger.error(f"❌ Error guardando Excel: {str(e)}", exc_info=True)
        raise


def actualizar_historico(df_actual):
    """
    Actualiza el archivo histórico con nuevos proyectos detectados.
    """
    try:
        # Cargar histórico existente
        if os.path.exists(HISTORICO_PATH):
            df_historico = pd.read_excel(HISTORICO_PATH, engine='openpyxl')
        else:
            df_historico = pd.DataFrame()
        
        # Agregar fecha de detección
        df_actual['Fecha_deteccion'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        # Combinar y eliminar duplicados (basado en Nombre + Fuente)
        if not df_historico.empty:
            df_combinado = pd.concat([df_historico, df_actual], ignore_index=True)
            df_combinado = df_combinado.drop_duplicates(
                subset=['Nombre', 'Fuente'], 
                keep='last'
            )
        else:
            df_combinado = df_actual
        
        # Guardar histórico
        df_combinado.to_excel(HISTORICO_PATH, index=False, engine='openpyxl')
        logger.info(f"📚 Histórico actualizado: {len(df_combinado)} proyectos")
        
    except Exception as e:
        logger.error(f"❌ Error actualizando histórico: {str(e)}", exc_info=True)


def cargar_excel():
    """
    Carga proyectos desde Excel. Busca en múltiples archivos posibles.
    Retorna lista de diccionarios.
    """
    proyectos = []
    
    # Lista de archivos Excel a buscar (en orden de prioridad)
    archivos_excel = [
        'data/proyectos_fortalecidos.xlsx',
        'data/proyectos_completos.xlsx',
        'data/proyectos_actualizados.xlsx',
        DATA_PATH,
        'data/proyectos.xlsx'
    ]
    
    for archivo in archivos_excel:
        if os.path.exists(archivo):
            try:
                df = pd.read_excel(archivo, engine='openpyxl')
                proyectos_temp = df.to_dict('records')
                
                # Validar que los proyectos tienen estructura correcta
                proyectos_validos = []
                for p in proyectos_temp:
                    if isinstance(p, dict) and 'Nombre' in p:
                        # Asegurar campos obligatorios
                        p.setdefault('Enlace', '')
                        p.setdefault('Fuente', '')
                        p.setdefault('Estado', 'Abierto')
                        p.setdefault('Fecha cierre', '')
                        p.setdefault('Monto', '0')
                        p.setdefault('Área de interés', 'General')
                        
                        # Validar y corregir enlace
                        enlace = p.get('Enlace', '')
                        if not enlace or not enlace.startswith('http'):
                            # Si no hay enlace válido, usar enlace de la fuente
                            fuente = p.get('Fuente', '')
                            if 'IICA' in fuente:
                                p['Enlace'] = 'https://www.iica.int/es/paises/chile'
                            elif 'FIA' in fuente:
                                p['Enlace'] = 'https://www.fia.cl/'
                            elif 'CORFO' in fuente:
                                p['Enlace'] = 'https://www.corfo.cl/'
                            elif 'INDAP' in fuente:
                                p['Enlace'] = 'https://www.indap.gob.cl/'
                            elif 'FAO' in fuente:
                                p['Enlace'] = 'https://www.fao.org/'
                            elif 'Banco Mundial' in fuente or 'World Bank' in fuente:
                                p['Enlace'] = 'https://www.worldbank.org/'
                            else:
                                p['Enlace'] = 'https://www.iica.int/es/paises/chile'
                        
                        proyectos_validos.append(p)
                
                proyectos.extend(proyectos_validos)
                logger.info(f"📂 Cargados {len(proyectos_validos)} proyectos desde {archivo}")
                
                # Si encontramos proyectos, usar este archivo
                if proyectos_validos:
                    break
                    
            except Exception as e:
                logger.error(f"❌ Error cargando {archivo}: {str(e)}")
                continue
    
    if proyectos:
        logger.info(f"✅ Total cargados: {len(proyectos)} proyectos")
        # Eliminar duplicados basado en Nombre + Fuente
        proyectos_unicos = []
        vistos = set()
        for p in proyectos:
            key = (p.get('Nombre', ''), p.get('Fuente', ''))
            if key not in vistos:
                vistos.add(key)
                proyectos_unicos.append(p)
        logger.info(f"✅ Después de eliminar duplicados: {len(proyectos_unicos)} proyectos")
        return proyectos_unicos
    else:
        logger.warning("⚠️ No se encontraron proyectos en ningún archivo Excel")
        return []


@app.route('/', methods=['GET'])
@tiempo_respuesta
def home():
    """
    Página principal con búsqueda y filtros.
    """
    # Cargar proyectos
    proyectos = cargar_excel()
    
    # Si no hay datos, recolectar
    if not proyectos:
        logger.info("📊 No hay proyectos en BD, iniciando recolección...")
        proyectos = recolectar_todos()
        guardar_excel(proyectos)
    
    # Aplicar filtros
    query = request.args.get('query', '').strip().lower()
    area = request.args.get('area', '').strip()
    estado = request.args.get('estado', '').strip()
    fuente = request.args.get('fuente', '').strip()
    ordenar_por = request.args.get('ordenar_por', 'fecha')
    orden = request.args.get('orden', 'desc')
    
    # Filtrar proyectos
    proyectos_filtrados = []
    for p in proyectos:
        # Filtro por búsqueda
        if query:
            texto_busqueda = (
                p.get('Nombre', '') + ' ' +
                p.get('Área de interés', '') + ' ' +
                p.get('Fuente', '') + ' ' +
                p.get('Descripción', '')
            ).lower()
            if query not in texto_busqueda:
                continue
        
        # Filtro por área
        if area and p.get('Área de interés', '') != area:
            continue
        
        # Filtro por estado
        if estado and p.get('Estado', '') != estado:
            continue
        
        # Filtro por fuente
        if fuente and p.get('Fuente', '') != fuente:
            continue
        
        proyectos_filtrados.append(p)
    
    # Ordenar
    if ordenar_por == 'fecha':
        proyectos_filtrados.sort(
            key=lambda x: parsear_fecha(x.get('Fecha cierre', '9999-12-31')),
            reverse=(orden == 'desc')
        )
    elif ordenar_por == 'monto':
        proyectos_filtrados.sort(
            key=lambda x: float(parsear_monto(x.get('Monto', '0')).replace('USD ', '').replace('CLP ', '').replace(',', '').split()[0] if len(parsear_monto(x.get('Monto', '0')).split()) > 1 else 0),
            reverse=(orden == 'desc')
        )
    elif ordenar_por == 'nombre':
        proyectos_filtrados.sort(
            key=lambda x: x.get('Nombre', '').lower(),
            reverse=(orden == 'desc')
        )
    
    # Paginación - Mostrar más proyectos por página (50 en lugar de 10)
    page = int(request.args.get('page', 1))
    per_page = 50  # Aumentado de 10 a 50 para mostrar más proyectos
    total_proyectos = len(proyectos_filtrados)
    total_pages = (total_proyectos + per_page - 1) // per_page
    
    start_idx = (page - 1) * per_page
    end_idx = start_idx + per_page
    proyectos_paginados = proyectos_filtrados[start_idx:end_idx]
    
    # Obtener valores únicos para filtros
    areas_unicas = sorted(set(p.get('Área de interés', '') for p in proyectos if p.get('Área de interés')))
    fuentes_unicas = sorted(set(p.get('Fuente', '') for p in proyectos if p.get('Fuente')))
    estados_unicos = sorted(set(p.get('Estado', '') for p in proyectos if p.get('Estado')))
    
    # Estadísticas
    stats = {
        'total': len(proyectos),
        'filtrados': len(proyectos_filtrados),
        'abiertos': len([p for p in proyectos if p.get('Estado') == 'Abierto']),
        'por_area': {area: len([p for p in proyectos if p.get('Área de interés') == area]) 
                     for area in areas_unicas},
        'por_fuente': {fuente: len([p for p in proyectos if p.get('Fuente') == fuente]) 
                       for fuente in fuentes_unicas}
    }
    
    # Datos de paginación
    pagination = {
        'current_page': page,
        'total_pages': total_pages,
        'total_proyectos': total_proyectos,
        'per_page': per_page,
        'has_prev': page > 1,
        'has_next': page < total_pages,
        'prev_page': page - 1 if page > 1 else None,
        'next_page': page + 1 if page < total_pages else None
    }
    
    return render_template(
        'home.html',  # Usar template con búsqueda y filtros
        proyectos=proyectos_paginados,
        stats=stats,
        areas_unicas=areas_unicas,
        fuentes_unicas=fuentes_unicas,
        estados_unicos=estados_unicos,
        pagination=pagination,
        current_filters={
            'query': query,
            'area': area,
            'estado': estado,
            'fuente': fuente,
            'ordenar_por': ordenar_por,
            'orden': orden
        }
    )


@app.route('/buscar', methods=['POST'])
@tiempo_respuesta
def buscar():
    """
    Endpoint para actualización manual de proyectos.
    Recolecta desde todas las fuentes y actualiza la base de datos.
    """
    try:
        logger.info("🔄 Iniciando actualización manual de proyectos...")
        proyectos = recolectar_todos()
        guardar_excel(proyectos)
        logger.info("✅ Actualización completada exitosamente")
        return redirect(url_for('home') + '?actualizado=1')
    except Exception as e:
        logger.error(f"❌ Error en actualización: {str(e)}", exc_info=True)
        return redirect(url_for('home') + '?error=1')


@app.route('/api/proyectos', methods=['GET'])
def api_proyectos():
    """
    API REST para obtener proyectos en formato JSON.
    """
    proyectos = cargar_excel()
    if not proyectos:
        proyectos = []
    
    # Aplicar filtros si existen
    query = request.args.get('query', '').strip().lower()
    area = request.args.get('area', '').strip()
    estado = request.args.get('estado', '').strip()
    fuente = request.args.get('fuente', '').strip()
    
    proyectos_filtrados = proyectos
    if query or area or estado or fuente:
        proyectos_filtrados = []
        for p in proyectos:
            if query and query not in (p.get('Nombre', '') + ' ' + p.get('Área de interés', '')).lower():
                continue
            if area and p.get('Área de interés') != area:
                continue
            if estado and p.get('Estado') != estado:
                continue
            if fuente and p.get('Fuente') != fuente:
                continue
            proyectos_filtrados.append(p)
    
    return jsonify({
        'total': len(proyectos_filtrados),
        'proyectos': proyectos_filtrados
    })


@app.route('/proyecto/<int:proyecto_id>', methods=['GET'])
def detalle_proyecto(proyecto_id):
    """
    Página de detalle de un proyecto con opción de postular.
    """
    proyectos = cargar_excel()
    
    if proyecto_id < 1 or proyecto_id > len(proyectos):
        return redirect(url_for('home'))
    
    proyecto = proyectos[proyecto_id - 1]
    proyecto['id'] = proyecto_id
    
    return render_template('detalle_proyecto.html', proyecto=proyecto)


@app.route('/postular/<int:proyecto_id>', methods=['GET', 'POST'])
def postular_proyecto(proyecto_id):
    """
    Formulario de postulación a un proyecto.
    """
    proyectos = cargar_excel()
    
    if proyecto_id < 1 or proyecto_id > len(proyectos):
        return redirect(url_for('home'))
    
    proyecto = proyectos[proyecto_id - 1]
    
    if request.method == 'POST':
        # Guardar postulación
        postulacion = {
            'proyecto_id': proyecto_id,
            'proyecto_nombre': proyecto.get('Nombre', ''),
            'fecha_postulacion': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'nombre_postulante': request.form.get('nombre', ''),
            'email': request.form.get('email', ''),
            'telefono': request.form.get('telefono', ''),
            'organizacion': request.form.get('organizacion', ''),
            'descripcion': request.form.get('descripcion', ''),
            'estado': 'Enviada'
        }
        
        # Guardar en archivo de postulaciones
        postulaciones_path = 'data/postulaciones.json'
        postulaciones = []
        if os.path.exists(postulaciones_path):
            try:
                import json
                with open(postulaciones_path, 'r', encoding='utf-8') as f:
                    postulaciones = json.load(f)
            except:
                postulaciones = []
        
        postulaciones.append(postulacion)
        
        try:
            import json
            with open(postulaciones_path, 'w', encoding='utf-8') as f:
                json.dump(postulaciones, f, ensure_ascii=False, indent=2)
            logger.info(f"✅ Postulación guardada para proyecto {proyecto_id}")
            return render_template('postulacion_exitosa.html', proyecto=proyecto, postulacion=postulacion)
        except Exception as e:
            logger.error(f"❌ Error guardando postulación: {str(e)}")
            return render_template('postulacion_error.html', proyecto=proyecto)
    
    return render_template('formulario_postulacion.html', proyecto=proyecto, proyecto_id=proyecto_id)


@app.route('/mis-postulaciones', methods=['GET'])
def mis_postulaciones():
    """
    Ver todas las postulaciones realizadas.
    """
    postulaciones_path = 'data/postulaciones.json'
    postulaciones = []
    
    if os.path.exists(postulaciones_path):
        try:
            import json
            with open(postulaciones_path, 'r', encoding='utf-8') as f:
                postulaciones = json.load(f)
        except:
            postulaciones = []
    
    return render_template('mis_postulaciones.html', postulaciones=postulaciones)


@app.route('/health', methods=['GET'])
def health():
    """
    Health check endpoint para monitoreo.
    """
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'data_file_exists': os.path.exists(DATA_PATH)
    }), 200


@app.errorhandler(404)
def not_found(error):
    return render_template('error.html', error='Página no encontrada'), 404


@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Error interno: {str(error)}", exc_info=True)
    return render_template('error.html', error='Error interno del servidor'), 500


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("DEBUG", "False").lower() == "true"
    
    logger.info("🚀 Iniciando Plataforma IICA Chile...")
    logger.info(f"📊 Puerto: {port}")
    logger.info(f"🔧 Debug: {debug}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
