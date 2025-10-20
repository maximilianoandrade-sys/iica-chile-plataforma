from flask import Flask, render_template, redirect, url_for, request, send_file, Response, jsonify, session, flash
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
import pandas as pd
import json
import os
from datetime import datetime, timedelta
import requests
from bs4 import BeautifulSoup
import re
from functools import wraps
import logging
from flask_caching import Cache
from flask_mail import Mail, Message
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Importar scrapers
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
from scrapers.agri_web import obtener_proyectos_agri_web
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
from utils import parsear_monto, parsear_fecha, clasificar_area, formatear_monto_visual

app = Flask(__name__)
app.config['SECRET_KEY'] = 'tu-clave-secreta-super-segura-2024'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///plataforma.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['CACHE_TYPE'] = 'simple'
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'tu-email@gmail.com'
app.config['MAIL_PASSWORD'] = 'tu-password'

# Inicializar extensiones
db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'
cache = Cache(app)
mail = Mail(app)

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Modelos de base de datos
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)

class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(200), nullable=False)
    fuente = db.Column(db.String(100), nullable=False)
    fecha_cierre = db.Column(db.Date)
    enlace = db.Column(db.String(500))
    estado = db.Column(db.String(50))
    monto = db.Column(db.String(100))
    area_interes = db.Column(db.String(100))
    descripcion = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Analytics(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    action = db.Column(db.String(100))
    details = db.Column(db.Text)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Configuración de datos
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

def guardar_excel(proyectos):
    """Guarda los proyectos en Excel con manejo robusto de errores"""
    if not proyectos:
        logger.warning("No hay proyectos para guardar")
        return
    
    # Normalizar datos
    normalizados = []
    for p in proyectos:
        item = {
            "Nombre": p.get("Nombre", ""),
            "Fuente": p.get("Fuente", ""),
            "Fecha cierre": p.get("Fecha cierre", ""),
            "Enlace": p.get("Enlace", ""),
            "Estado": p.get("Estado", ""),
            "Monto": p.get("Monto", ""),
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
    logger.info(f"Guardados {len(proyectos)} proyectos en Excel")

def cargar_excel():
    """Carga proyectos desde Excel"""
    try:
        if os.path.exists(DATA_PATH):
            df = pd.read_excel(DATA_PATH)
            return df.to_dict('records')
        return []
    except Exception as e:
        logger.error(f"Error cargando Excel: {e}")
        return []

def recolectar_todos():
    """Recolecta proyectos de todas las fuentes con manejo de errores"""
    proyectos = []
    scrapers = [
        ("IICA", obtener_proyectos_iica),
        ("Devex", obtener_proyectos_devex),
        ("DevelopmentAid", obtener_proyectos_developmentaid),
        ("GlobalTenders", obtener_proyectos_globaltenders),
        ("UNGM", obtener_proyectos_ungm),
        ("FIA", obtener_proyectos_fia),
        ("TenderConsultants", obtener_proyectos_tenderconsultants),
        ("FondosGob", obtener_proyectos_fondosgob),
        ("INIA", obtener_proyectos_inia),
        ("WorldBank", obtener_proyectos_worldbank),
        ("BID", obtener_proyectos_bid),
        ("EuropeAid", obtener_proyectos_europeaid),
        ("USAID", obtener_proyectos_usaid),
        ("UNDP", obtener_proyectos_undp),
        ("FAO", obtener_proyectos_fao),
        ("OECD", obtener_proyectos_oecd),
        ("Gates", obtener_proyectos_gates),
        ("AgriWeb", obtener_proyectos_agri_web),
        ("TenderConsultants Real", obtener_proyectos_tenderconsultants_real),
        ("IICA Dashboard", obtener_proyectos_iica_dashboard),
        ("IICA Dashboard Real", obtener_proyectos_iica_dashboard_real),
        ("Agriculture Portal", obtener_proyectos_agriculture_portal),
        ("Development Funds", obtener_proyectos_development_funds),
        ("Excel", obtener_proyectos_excel),
        ("CORFO", obtener_proyectos_corfo),
        ("Fondos Chile", obtener_proyectos_fondos_chile),
        ("CNR", obtener_proyectos_cnr),
        ("GEF", obtener_proyectos_gef),
        ("FIA Agricola", obtener_proyectos_fia),
        ("INDAP", obtener_proyectos_indap),
        ("Fondos Gob", obtener_proyectos_fondos_gob),
    ]
    
    for nombre, scraper_func in scrapers:
        try:
            proyectos_scraped = scraper_func()
            proyectos.extend(proyectos_scraped)
            logger.info(f"Scraper {nombre}: {len(proyectos_scraped)} proyectos")
        except Exception as e:
            logger.error(f"Error en scraper {nombre}: {e}")
            continue
    
    return proyectos

def calcular_estadisticas(proyectos):
    """Calcula estadísticas avanzadas"""
    if not proyectos:
        return {
            "total": 0,
            "por_fuente": {},
            "por_area": {},
            "por_estado": {},
            "monto_total": 0,
            "fechas": {"proximos": 0, "vencidos": 0}
        }
    
    stats = {
        "total": len(proyectos),
        "por_fuente": {},
        "por_area": {},
        "por_estado": {},
        "monto_total": 0,
        "fechas": {"proximos": 0, "vencidos": 0}
    }
    
    hoy = datetime.now().date()
    
    for p in proyectos:
        # Por fuente
        fuente = p.get("Fuente", "Desconocida")
        stats["por_fuente"][fuente] = stats["por_fuente"].get(fuente, 0) + 1
        
        # Por área
        area = p.get("Área de interés", "Sin especificar")
        stats["por_area"][area] = stats["por_area"].get(area, 0) + 1
        
        # Por estado
        estado = p.get("Estado", "Sin especificar")
        stats["por_estado"][estado] = stats["por_estado"].get(estado, 0) + 1
        
        # Monto
        monto = p.get("Monto", "")
        if monto and monto not in ["Consultar", "Variable"]:
            try:
                valor = float(re.findall(r'[\d,]+', str(monto))[0].replace(',', ''))
                stats["monto_total"] += valor
            except:
                pass
        
        # Fechas
        fecha_str = p.get("Fecha cierre", "")
        if fecha_str:
            try:
                fecha = datetime.strptime(fecha_str, "%Y-%m-%d").date()
                if fecha > hoy:
                    stats["fechas"]["proximos"] += 1
                else:
                    stats["fechas"]["vencidos"] += 1
            except:
                pass
    
    return stats

# Rutas principales
@app.route('/')
@cache.cached(timeout=300)  # Cache por 5 minutos
def home():
    """Página principal con todas las funcionalidades"""
    try:
        # Cargar datos
        proyectos = cargar_excel()
        if not proyectos:
            proyectos = recolectar_todos()
            guardar_excel(proyectos)
        
        # Aplicar filtros
        query = request.args.get('q', '').strip()
        area = request.args.get('area', '').strip()
        estado = request.args.get('estado', '').strip()
        
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
        
        # Estadísticas
        stats = calcular_estadisticas(proyectos)
        
        # Proyectos adjudicados (ejemplo)
        adjudicados = [
            {
                "Nombre": "Proyecto de Innovación Agrícola IICA",
                "Fuente": "IICA Chile",
                "Fecha adjudicación": "2024-01-15",
                "Monto": "50000000 CLP",
                "Estado": "Adjudicado",
                "Área de interés": "Innovación"
            }
        ]
        
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
                "promueve el desarrollo agrícola sostenible y la cooperación técnica en el sector agropecuario."
            ),
            "mision": "Fortalecer la agricultura y el desarrollo rural en las Américas",
            "vision": "Una agricultura próspera, inclusiva y sostenible",
            "contacto": {
                "email": "chile@iica.int",
                "telefono": "+56 2 0000 0000",
                "direccion": "Santiago de Chile"
            }
        }

        return render_template('home.html', 
                             proyectos=proyectos, 
                             stats=stats, 
                             adjudicados=adjudicados,
                             documentos=documentos, 
                             postulaciones=postulaciones, 
                             instituciones=instituciones, 
                             info=info)
    except Exception as e:
        logger.error(f"Error en home: {e}")
        return render_template('error.html', error=str(e))

@app.route('/buscar', methods=['POST'])
@login_required
def buscar():
    """Actualizar datos de proyectos"""
    try:
        proyectos = recolectar_todos()
        guardar_excel(proyectos)
        
        # Registrar analytics
        if current_user.is_authenticated:
            analytics = Analytics(
                user_id=current_user.id,
                action='buscar_proyectos',
                details=f'Actualizó {len(proyectos)} proyectos'
            )
            db.session.add(analytics)
            db.session.commit()
        
        flash(f'Se actualizaron {len(proyectos)} proyectos exitosamente', 'success')
        return redirect(url_for('home'))
    except Exception as e:
        logger.error(f"Error en buscar: {e}")
        flash('Error al actualizar proyectos', 'error')
        return redirect(url_for('home'))

@app.route('/export/csv')
def export_csv():
    """Exportar a CSV"""
    try:
        proyectos = cargar_excel()
        df = pd.DataFrame(proyectos)
        
        output = df.to_csv(index=False)
        return Response(
            output,
            mimetype="text/csv",
            headers={"Content-disposition": "attachment; filename=proyectos.csv"}
        )
    except Exception as e:
        logger.error(f"Error exportando CSV: {e}")
        return redirect(url_for('home'))

@app.route('/export/xlsx')
def export_xlsx():
    """Exportar a Excel"""
    try:
        return send_file(DATA_PATH, as_attachment=True, download_name='proyectos.xlsx')
    except Exception as e:
        logger.error(f"Error exportando Excel: {e}")
        return redirect(url_for('home'))

# Rutas de autenticación
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = User.query.filter_by(username=username).first()
        
        if user and check_password_hash(user.password_hash, password):
            login_user(user)
            user.last_login = datetime.utcnow()
            db.session.commit()
            flash('Inicio de sesión exitoso', 'success')
            return redirect(url_for('home'))
        else:
            flash('Credenciales inválidas', 'error')
    
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        
        if User.query.filter_by(username=username).first():
            flash('Usuario ya existe', 'error')
            return render_template('register.html')
        
        user = User(
            username=username,
            email=email,
            password_hash=generate_password_hash(password)
        )
        db.session.add(user)
        db.session.commit()
        
        flash('Usuario creado exitosamente', 'success')
        return redirect(url_for('login'))
    
    return render_template('register.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('Sesión cerrada', 'info')
    return redirect(url_for('home'))

# API REST
@app.route('/api/proyectos')
def api_proyectos():
    """API para obtener proyectos"""
    proyectos = cargar_excel()
    return jsonify(proyectos)

@app.route('/api/estadisticas')
def api_estadisticas():
    """API para obtener estadísticas"""
    proyectos = cargar_excel()
    stats = calcular_estadisticas(proyectos)
    return jsonify(stats)

# Dashboard administrativo
@app.route('/admin')
@login_required
def admin():
    if not current_user.is_admin:
        flash('Acceso denegado', 'error')
        return redirect(url_for('home'))
    
    # Estadísticas del sistema
    total_users = User.query.count()
    total_projects = Project.query.count()
    recent_analytics = Analytics.query.order_by(Analytics.timestamp.desc()).limit(10).all()
    
    return render_template('admin.html', 
                         total_users=total_users,
                         total_projects=total_projects,
                         recent_analytics=recent_analytics)

# Inicializar base de datos
def init_db():
    with app.app_context():
        db.create_all()
        
        # Crear usuario admin por defecto
        if not User.query.filter_by(username='admin').first():
            admin_user = User(
                username='admin',
                email='admin@iica.cl',
                password_hash=generate_password_hash('admin123'),
                is_admin=True
            )
            db.session.add(admin_user)
            db.session.commit()
            logger.info("Usuario admin creado: admin/admin123")

if __name__ == '__main__':
    init_db()
    
    # Configuración para producción
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') != 'production'
    
    app.run(
        debug=debug, 
        host='0.0.0.0', 
        port=port,
        threaded=True
    )
