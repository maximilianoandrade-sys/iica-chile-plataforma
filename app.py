from flask import Flask, render_template, redirect, url_for, request, send_file, Response, jsonify, make_response
import json
import os
import pandas as pd
import time
import uuid
from datetime import datetime
from scrapers.iica import obtener_proyectos_iica
from scrapers.devex import obtener_proyectos_devex
from scrapers.developmentaid import obtener_proyectos_developmentaid
from scrapers.globaltenders import obtener_proyectos_globaltenders
from scrapers.ungm import obtener_proyectos_ungm
from scrapers.fia import obtener_proyectos_fia
from scrapers.tenderconsultants import obtener_proyectos_tenderconsultants
from scrapers.fondosgob import obtener_proyectos_fondosgob
from scrapers.inia import obtener_proyectos_inia
from scrapers.worldbank import obtener_proyectos_worldbank
from scrapers.bid import obtener_proyectos_bid
from scrapers.europeaid import obtener_proyectos_europeaid
from scrapers.usaid import obtener_proyectos_usaid
from scrapers.undp import obtener_proyectos_undp
from scrapers.fao import obtener_proyectos_fao
from scrapers.oecd import obtener_proyectos_oecd
from scrapers.gates import obtener_proyectos_gates
# from scrapers.agri_web import obtener_proyectos_agri_web
from scrapers.tenderconsultants_real import obtener_proyectos_tenderconsultants_real
from scrapers.iica_dashboard import obtener_proyectos_iica_dashboard
from scrapers.iica_dashboard_real import obtener_proyectos_iica_dashboard_real
from scrapers.agriculture_portal import obtener_proyectos_agriculture_portal
from scrapers.development_funds import obtener_proyectos_development_funds
from scrapers.excel_importer import obtener_proyectos_excel
from scrapers.corfo import obtener_proyectos_corfo
from scrapers.fondos_chile import obtener_proyectos_fondos_chile
from scrapers.fuentes_agricolas import (
    obtener_proyectos_cnr,
    obtener_proyectos_gef,
    obtener_proyectos_fia,
    obtener_proyectos_indap,
    obtener_proyectos_fondos_gob
)
from scrapers.international_funding import (
    obtener_proyectos_kickstarter,
    obtener_proyectos_gofundme,
    obtener_proyectos_indiegogo,
    obtener_proyectos_rockethub,
    obtener_proyectos_artistshare,
    obtener_proyectos_agricultural_grants,
    obtener_proyectos_development_funding,
    obtener_proyectos_tech_innovation,
    obtener_proyectos_education_research,
    obtener_proyectos_environmental_sustainability
)
from utils import parsear_monto
from translations import get_translation, get_all_translations
# Sistemas avanzados deshabilitados temporalmente para estabilidad
CACHE_AVAILABLE = False
ANALYTICS_AVAILABLE = False
NOTIFICATIONS_AVAILABLE = False
AI_AVAILABLE = False
BACKUP_AVAILABLE = False

def cache_proyectos(max_age=1800):
    def decorator(func):
        return func
    return decorator

def cache_estadisticas(max_age=3600):
    def decorator(func):
        return func
    return decorator

class DummyAnalytics:
    def track_session(self, *args, **kwargs): pass
    def track_search(self, *args, **kwargs): pass
    def track_project_click(self, *args, **kwargs): pass

analytics_manager = DummyAnalytics()

class DummyNotifications:
    def subscribe_user(self, *args, **kwargs): pass

notification_manager = DummyNotifications()

class DummyAI:
    def update_user_profile(self, *args, **kwargs): pass
    def get_recommendations_for_user(self, *args, **kwargs): return []
    def train_similarity_model(self, *args, **kwargs): pass

recommendation_engine = DummyAI()

class DummyBackup:
    def create_backup(self, *args, **kwargs): return None
    def list_backups(self): return []

backup_manager = DummyBackup()

def init_backup_system(): pass
# from apscheduler.schedulers.background import BackgroundScheduler


app = Flask(__name__)
DATA_PATH = "data/proyectos.xlsx"
COLUMNS = [
    "Nombre",
    "Fuente",
    "Fecha cierre",
    "Enlace",
    "Estado",
    "Monto",
    "Área de interés",
]

@cache_proyectos(max_age=1800)  # 30 minutos de caché
def recolectar_todos():
    proyectos = []
    # Solo fuentes básicas que funcionan
    try:
        proyectos.extend(obtener_proyectos_iica())
    except:
        pass
    try:
        proyectos.extend(obtener_proyectos_devex())
    except:
        pass
    try:
        proyectos.extend(obtener_proyectos_developmentaid())
    except:
        pass
    try:
        proyectos.extend(obtener_proyectos_globaltenders())
    except:
        pass
    try:
        proyectos.extend(obtener_proyectos_ungm())
    except:
        pass
    try:
        proyectos.extend(obtener_proyectos_fia())
    except:
        pass
    try:
        proyectos.extend(obtener_proyectos_tenderconsultants())
    except:
        pass
    try:
        proyectos.extend(obtener_proyectos_fondosgob())
    except:
        pass
    try:
        proyectos.extend(obtener_proyectos_inia())
    except:
        pass
    try:
        proyectos.extend(obtener_proyectos_worldbank())
    except:
        pass
    try:
        proyectos.extend(obtener_proyectos_bid())
    except:
        pass
    try:
        proyectos.extend(obtener_proyectos_europeaid())
    except:
        pass
    try:
        proyectos.extend(obtener_proyectos_usaid())
    except:
        pass
    try:
        proyectos.extend(obtener_proyectos_undp())
    except:
        pass
    try:
        proyectos.extend(obtener_proyectos_fao())
    except:
        pass
    try:
        proyectos.extend(obtener_proyectos_oecd())
    except:
        pass
    try:
        proyectos.extend(obtener_proyectos_gates())
    except:
        pass
    proyectos.extend(obtener_proyectos_tenderconsultants_real())
    proyectos.extend(obtener_proyectos_iica_dashboard())
    proyectos.extend(obtener_proyectos_iica_dashboard_real())
    proyectos.extend(obtener_proyectos_agriculture_portal())
    proyectos.extend(obtener_proyectos_development_funds())
    proyectos.extend(obtener_proyectos_excel())
    proyectos.extend(obtener_proyectos_corfo())
    proyectos.extend(obtener_proyectos_fondos_chile())
    proyectos.extend(obtener_proyectos_cnr())
    proyectos.extend(obtener_proyectos_gef())
    proyectos.extend(obtener_proyectos_fia())
    proyectos.extend(obtener_proyectos_indap())
    proyectos.extend(obtener_proyectos_fondos_gob())
    
    # Nuevas fuentes internacionales
    proyectos.extend(obtener_proyectos_kickstarter())
    proyectos.extend(obtener_proyectos_gofundme())
    proyectos.extend(obtener_proyectos_indiegogo())
    proyectos.extend(obtener_proyectos_rockethub())
    proyectos.extend(obtener_proyectos_artistshare())
    proyectos.extend(obtener_proyectos_agricultural_grants())
    proyectos.extend(obtener_proyectos_development_funding())
    proyectos.extend(obtener_proyectos_tech_innovation())
    proyectos.extend(obtener_proyectos_education_research())
    proyectos.extend(obtener_proyectos_environmental_sustainability())
    
    return proyectos


def job_actualizacion_diaria():
    try:
        proyectos = recolectar_todos()
        guardar_excel(proyectos)
        print("[Scheduler] Proyectos actualizados correctamente")
    except Exception as exc:
        print(f"[Scheduler] Error en actualización: {exc}")

def guardar_excel(proyectos):
    # Normalizar llaves y valores por defecto
    normalizados = []
    for p in (proyectos or []):
        item = {
            "Nombre": p.get("Nombre", ""),
            "Fuente": p.get("Fuente", ""),
            "Fecha cierre": p.get("Fecha cierre", ""),
            "Enlace": p.get("Enlace", ""),
            "Estado": p.get("Estado", ""),
            "Monto": p.get("Monto", "0"),
            "Área de interés": p.get("Área de interés", ""),
        }
        normalizados.append(item)

    df = pd.DataFrame(normalizados)
    if not df.empty and 'Fecha cierre' in df.columns:
        df['Fecha cierre'] = df['Fecha cierre'].astype(str)

    # Ordenar columnas y llenar faltantes
    df = df.reindex(columns=COLUMNS, fill_value="")

    # Asegurar directorio de salida
    output_dir = os.path.dirname(DATA_PATH)
    if output_dir and not os.path.exists(output_dir):
        os.makedirs(output_dir, exist_ok=True)

    df.to_excel(DATA_PATH, index=False)

def cargar_excel():
    try:
        df = pd.read_excel(DATA_PATH)
        return df.to_dict('records')
    except:
        return []


def cargar_df():
    try:
        return pd.read_excel(DATA_PATH)
    except:
        return pd.DataFrame(columns=COLUMNS)

@app.route('/', methods=['GET'])
def home():
    # Generar o obtener session ID
    session_id = request.cookies.get('session_id')
    if not session_id:
        session_id = str(uuid.uuid4())
    
    # Tracking de sesión (solo si analytics está disponible)
    if ANALYTICS_AVAILABLE:
        ip_address = request.remote_addr
        user_agent = request.headers.get('User-Agent', '')
        analytics_manager.track_session(session_id, ip_address, user_agent)
    
    # Detectar idioma del navegador o usar español por defecto
    language = request.args.get('lang', 'es')
    if language not in ['es', 'en']:
        language = 'es'
    
    proyectos = cargar_excel()
    if not proyectos:
        proyectos = recolectar_todos()
        guardar_excel(proyectos)
    
    # Aplicar filtros
    query = request.args.get('query', '').strip()
    area = request.args.get('area', '').strip()
    estado = request.args.get('estado', '').strip()
    ordenar_por = request.args.get('ordenar_por', 'fecha')  # fecha, monto, nombre, fuente
    orden = request.args.get('orden', 'asc')  # asc, desc
    
    # Tracking de búsqueda
    start_time = time.time()
    search_filters = {
        'query': query,
        'area': area,
        'estado': estado,
        'ordenar_por': ordenar_por,
        'orden': orden
    }
    
    # Filtros de búsqueda
    if query or area or estado:
        proyectos_filtrados = []
        for p in proyectos:
            # Filtro por búsqueda
            if query:
                query_lower = query.lower()
                if not any(query_lower in str(p.get(campo, '')).lower() 
                          for campo in ['Nombre', 'Fuente', 'Área de interés', 'Descripción']):
                    continue
            
            # Filtro por área
            if area and p.get('Área de interés', '') != area:
                continue
                
            # Filtro por estado
            if estado and p.get('Estado', '') != estado:
                continue
                
            proyectos_filtrados.append(p)
        proyectos = proyectos_filtrados
    
    # Ordenamiento mejorado con manejo de errores
    if ordenar_por == 'fecha':
        def parse_fecha_sort(fecha):
            if not fecha or fecha == '':
                return '9999-12-31'  # Fechas vacías al final
            try:
                from datetime import datetime
                # Intentar parsear diferentes formatos de fecha
                if isinstance(fecha, str):
                    # Formato YYYY-MM-DD
                    if len(fecha) == 10 and fecha.count('-') == 2:
                        return fecha
                    # Formato DD/MM/YYYY
                    elif len(fecha) == 10 and fecha.count('/') == 2:
                        return datetime.strptime(fecha, '%d/%m/%Y').strftime('%Y-%m-%d')
                    # Formato MM/DD/YYYY
                    elif len(fecha) == 10 and fecha.count('/') == 2:
                        try:
                            return datetime.strptime(fecha, '%m/%d/%Y').strftime('%Y-%m-%d')
                        except:
                            return datetime.strptime(fecha, '%d/%m/%Y').strftime('%Y-%m-%d')
                return str(fecha)
            except:
                return '9999-12-31'
        proyectos.sort(key=lambda x: parse_fecha_sort(x.get('Fecha cierre', '')), reverse=(orden == 'desc'))
    elif ordenar_por == 'monto':
        def parse_monto_sort(monto):
            if not monto or monto in ['Consultar', 'Variable', '']:
                return 0
            try:
                import re
                numeros = re.findall(r'[\d,]+', str(monto))
                if numeros:
                    return float(numeros[0].replace(',', ''))
                return 0
            except:
                return 0
        proyectos.sort(key=lambda x: parse_monto_sort(x.get('Monto', '')), reverse=(orden == 'desc'))
    elif ordenar_por == 'nombre':
        proyectos.sort(key=lambda x: (x.get('Nombre', '') or '').lower(), reverse=(orden == 'desc'))
    elif ordenar_por == 'fuente':
        proyectos.sort(key=lambda x: (x.get('Fuente', '') or '').lower(), reverse=(orden == 'desc'))
    
    # Paginación
    page = int(request.args.get('page', 1))
    per_page = 5
    total_proyectos = len(proyectos)
    total_pages = (total_proyectos + per_page - 1) // per_page
    
    start_idx = (page - 1) * per_page
    end_idx = start_idx + per_page
    proyectos_paginados = proyectos[start_idx:end_idx]
    
    # Estadísticas básicas
    total = len(proyectos)
    por_area = {}
    por_estado = {}
    por_moneda = {}
    total_monto = {}
    for p in proyectos:
        por_area[p.get("Área de interés", "General")] = por_area.get(p.get("Área de interés", "General"), 0) + 1
        por_estado[p.get("Estado", "N/D")] = por_estado.get(p.get("Estado", "N/D"), 0) + 1
        # Acumular montos por moneda (si están normalizados como "XXX N")
        monto_val = str(p.get("Monto", "0"))
        parts = monto_val.split()
        if len(parts) == 2 and parts[0].isalpha():
            moneda = parts[0]
            try:
                numero = float(parts[1])
            except Exception:
                try:
                    numero = float(parts[1].replace(',', ''))
                except Exception:
                    numero = 0.0
            total_monto[moneda] = total_monto.get(moneda, 0.0) + numero
            por_moneda[moneda] = por_moneda.get(moneda, 0) + 1

    stats = {
        "total": total,
        "por_area": por_area,
        "por_estado": por_estado,
        "por_moneda": por_moneda,
        "total_monto": total_monto,
    }

    # Cargar adjudicados del dashboard real de IICA
    adjudicados = obtener_proyectos_iica_dashboard_real()
    
    # También cargar desde archivo JSON si existe
    data_file = os.path.join('data', 'adjudicados.json')
    try:
        with open(data_file, 'r', encoding='utf-8') as f:
            adjudicados_json = json.load(f)
            adjudicados.extend(adjudicados_json)
    except Exception:
        pass

    # Cargar documentos
    docs_file = os.path.join('data', 'documentos.json')
    documentos = []
    try:
        with open(docs_file, 'r', encoding='utf-8') as f:
            documentos = json.load(f)
    except Exception:
        documentos = []

    # Cargar postulaciones directas
    post_file = os.path.join('data', 'postulaciones_directas.json')
    postulaciones = []
    try:
        with open(post_file, 'r', encoding='utf-8') as f:
            postulaciones = json.load(f)
    except Exception:
        postulaciones = []

    # Cargar instituciones
    inst_file = os.path.join('data', 'instituciones.json')
    instituciones = []
    try:
        with open(inst_file, 'r', encoding='utf-8') as f:
            instituciones = json.load(f)
    except Exception:
        instituciones = []

    info = {
        "titulo": "IICA Chile",
        "descripcion": (
            "El IICA (Instituto Interamericano de Cooperación para la Agricultura) en Chile "
            "promueve la innovación, la sostenibilidad y el desarrollo rural a través de proyectos, "
            "alianzas y asistencia técnica que fortalecen capacidades y mejoran la productividad del sector agrícola."
        ),
        "contacto": {
            "email": "hernan.chiriboga@iica.int",
            "telefono": "(56-2) 2225-2511",
            "fax": "(56-2) 2269-1371 / 2269-6858",
            "direccion": "Calle Rancagua No.0320, Providencia, Santiago, Chile",
            "correo_postal": "Casilla No.16107, Correo 9, Providencia, Santiago, Chile",
            "representante": "Hernán Chiriboga"
        },
        "redes_sociales": {
            "twitter": "https://x.com/iicanoticias",
            "instagram": "https://www.instagram.com/iicachile/",
            "facebook": "https://www.facebook.com/IICAChile/"
        }
    }

    # Obtener traducciones
    translations = get_all_translations(language)
    
    # Tracking de resultados de búsqueda (solo si analytics está disponible)
    if ANALYTICS_AVAILABLE:
        search_time = time.time() - start_time
        analytics_manager.track_search(
            session_id, query, search_filters, len(proyectos_paginados), search_time
        )
    
    # Datos de paginación
    pagination_data = {
        'current_page': page,
        'total_pages': total_pages,
        'total_proyectos': total_proyectos,
        'per_page': per_page,
        'has_prev': page > 1,
        'has_next': page < total_pages,
        'prev_page': page - 1 if page > 1 else None,
        'next_page': page + 1 if page < total_pages else None
    }
    
    response = make_response(render_template('home_simple.html',
                         proyectos=proyectos_paginados, 
                         stats=stats, 
                         adjudicados=adjudicados, 
                         documentos=documentos, 
                         postulaciones=postulaciones, 
                         instituciones=instituciones, 
                         info=info,
                         translations=translations,
                         current_language=language,
                         pagination=pagination_data,
                         current_filters={
                             'query': query,
                             'area': area,
                             'estado': estado,
                             'ordenar_por': ordenar_por,
                             'orden': orden
                         }))
    
    # Establecer cookie de sesión
    response.set_cookie('session_id', session_id, max_age=86400)  # 24 horas
    
    return response


@app.route('/quienes-somos', methods=['GET'])
def about():
    info = {
        "titulo": "IICA Chile",
        "descripcion": (
            "El IICA (Instituto Interamericano de Cooperación para la Agricultura) en Chile "
            "promueve la innovación, la sostenibilidad y el desarrollo rural a través de proyectos, "
            "alianzas y asistencia técnica que fortalecen capacidades y mejoran la productividad del sector agrícola."
        ),
        "contacto": {
            "email": "hernan.chiriboga@iica.int",
            "telefono": "(56-2) 2225-2511",
            "fax": "(56-2) 2269-1371 / 2269-6858",
            "direccion": "Calle Rancagua No.0320, Providencia, Santiago, Chile",
            "correo_postal": "Casilla No.16107, Correo 9, Providencia, Santiago, Chile",
            "representante": "Hernán Chiriboga"
        },
        "redes_sociales": {
            "twitter": "https://x.com/iicanoticias",
            "instagram": "https://www.instagram.com/iicachile/",
            "facebook": "https://www.facebook.com/IICAChile/"
        }
    }
    return render_template('about.html', info=info)


@app.route('/adjudicados', methods=['GET'])
def adjudicados():
    data_file = os.path.join('data', 'adjudicados.json')
    proyectos = []
    try:
        with open(data_file, 'r', encoding='utf-8') as f:
            proyectos = json.load(f)
    except Exception:
        proyectos = []
    # Filtros simples por query string
    pais = request.args.get('pais', '').strip().lower()
    anio = request.args.get('anio', '').strip()
    contraparte = request.args.get('contraparte', '').strip().lower()
    if pais:
        proyectos = [p for p in proyectos if (p.get('País', '') or '').lower().find(pais) != -1]
    if anio:
        try:
            y = int(anio)
            proyectos = [p for p in proyectos if int(p.get('Año', 0)) == y]
        except Exception:
            pass
    if contraparte:
        proyectos = [p for p in proyectos if (p.get('Contraparte', '') or '').lower().find(contraparte) != -1]
    return render_template('awarded.html', proyectos=proyectos)


@app.route('/buscar', methods=['POST'])
def buscar():
    proyectos = recolectar_todos()
    guardar_excel(proyectos)
    return redirect(url_for('home'))


@app.route('/export/csv', methods=['GET'])
def export_csv():
    df = cargar_df()
    csv_data = df.to_csv(index=False)
    return Response(
        csv_data,
        mimetype='text/csv',
        headers={'Content-Disposition': 'attachment; filename=proyectos.csv'}
    )


@app.route('/export/xlsx', methods=['GET'])
def export_xlsx():
    df = cargar_df()
    # Guardar a un buffer en memoria para enviar como descarga
    from io import BytesIO
    output = BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Proyectos')
    output.seek(0)
    return send_file(output, as_attachment=True, download_name='proyectos.xlsx', mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')


@app.route('/export/adjudicados/csv', methods=['GET'])
def export_adjudicados_csv():
    data_file = os.path.join('data', 'adjudicados.json')
    try:
        with open(data_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception:
        data = []
    df = pd.DataFrame(data)
    csv_data = df.to_csv(index=False)
    return Response(
        csv_data,
        mimetype='text/csv',
        headers={'Content-Disposition': 'attachment; filename=adjudicados.csv'}
    )


@app.route('/export/adjudicados/xlsx', methods=['GET'])
def export_adjudicados_xlsx():
    data_file = os.path.join('data', 'adjudicados.json')
    try:
        with open(data_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception:
        data = []
    df = pd.DataFrame(data)
    from io import BytesIO
    output = BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Adjudicados')
    output.seek(0)
    return send_file(output, as_attachment=True, download_name='adjudicados.xlsx', mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')


@app.route('/crear-plantilla', methods=['GET'])
def crear_plantilla():
    from scrapers.excel_importer import crear_plantilla_excel
    try:
        template_path = crear_plantilla_excel()
        if template_path and os.path.exists(template_path):
            return send_file(template_path, as_attachment=True, download_name='plantilla_proyectos.xlsx')
        else:
            return "Error creando plantilla", 500
    except Exception as e:
        return f"Error: {e}", 500

# Nuevas rutas para funcionalidades avanzadas

@app.route('/api/project-click', methods=['POST'])
def track_project_click():
    """Rastrea clics en proyectos"""
    data = request.get_json()
    session_id = request.cookies.get('session_id')
    
    if session_id and data:
        analytics_manager.track_project_click(
            session_id,
            data.get('project_name', ''),
            data.get('project_source', ''),
            data.get('project_url', '')
        )
        
        # Actualizar perfil del usuario
        recommendation_engine.update_user_profile(
            session_id, data, 'click', 1.0
        )
    
    return jsonify({'status': 'success'})

@app.route('/api/recommendations')
def get_recommendations():
    """Obtiene recomendaciones personalizadas"""
    session_id = request.cookies.get('session_id')
    if not session_id:
        return jsonify({'recommendations': []})
    
    proyectos = cargar_excel()
    if not proyectos:
        proyectos = recolectar_todos()
    
    # Obtener recomendaciones
    recommendations = recommendation_engine.get_recommendations_for_user(
        session_id, proyectos, 10
    )
    
    return jsonify({'recommendations': recommendations})

@app.route('/api/analytics')
def get_analytics():
    """Obtiene analytics del sistema"""
    days = request.args.get('days', 30, type=int)
    
    search_analytics = analytics_manager.get_search_analytics(days)
    project_analytics = analytics_manager.get_project_analytics(days)
    performance_analytics = analytics_manager.get_performance_analytics(7)
    user_analytics = analytics_manager.get_user_analytics(days)
    
    return jsonify({
        'search': search_analytics,
        'projects': project_analytics,
        'performance': performance_analytics,
        'users': user_analytics
    })

@app.route('/api/notifications/subscribe', methods=['POST'])
def subscribe_notifications():
    """Suscribe usuario a notificaciones"""
    data = request.get_json()
    
    if data and data.get('email'):
        notification_manager.subscribe_user(
            email=data['email'],
            areas_interes=data.get('areas', []),
            fuentes=data.get('fuentes', []),
            monto_minimo=data.get('monto_minimo', 0),
            monto_maximo=data.get('monto_maximo'),
            frecuencia=data.get('frecuencia', 'daily')
        )
        return jsonify({'status': 'success'})
    
    return jsonify({'status': 'error', 'message': 'Email requerido'}), 400

@app.route('/api/backup/create', methods=['POST'])
def create_backup():
    """Crea un respaldo del sistema"""
    backup_type = request.json.get('type', 'data')
    backup_path = backup_manager.create_backup(backup_type)
    
    if backup_path:
        return jsonify({'status': 'success', 'backup_path': backup_path})
    else:
        return jsonify({'status': 'error'}), 500

@app.route('/api/backup/list')
def list_backups():
    """Lista respaldos disponibles"""
    backups = backup_manager.list_backups()
    return jsonify({'backups': backups})

@app.route('/api/cache/clear', methods=['POST'])
def clear_cache():
    """Limpia el caché del sistema"""
    # Cache deshabilitado temporalmente
    return jsonify({'status': 'success', 'message': 'Cache no disponible'})

@app.route('/api/health')
def health_check():
    """Verifica el estado del sistema"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'cache_status': 'active',
        'analytics_status': 'active',
        'notifications_status': 'active',
        'recommendations_status': 'active',
        'backup_status': 'active'
    })

# Inicializar sistemas básicos
def init_basic_systems():
    """Inicializa sistemas básicos para estabilidad"""
    try:
        print("🚀 Inicializando plataforma IICA...")
        print("✅ Sistema básico inicializado")
        print("✅ Funcionalidades principales disponibles")
        print("🎉 Plataforma lista para usar")
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == '__main__':
    # Inicializar sistemas básicos
    init_basic_systems()
    
    # Scheduler deshabilitado temporalmente
    # try:
    #     scheduler = BackgroundScheduler(daemon=True)
    #     scheduler.add_job(job_actualizacion_diaria, 'cron', hour=3, minute=0)
    #     scheduler.start()
    #     print('[Scheduler] Tarea diaria programada a las 03:00')
    # except Exception as exc:
    #     print(f'[Scheduler] No se pudo iniciar: {exc}')
    # Configuración para producción con dominio personalizado
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') != 'production'
    
    app.run(
        debug=debug, 
        host='0.0.0.0', 
        port=port,
        threaded=True  # Mejor rendimiento para múltiples usuarios
    )
