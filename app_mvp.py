"""
Aplicación MVP - IICA Chile
Con PostgreSQL, autenticación y búsqueda mejorada
"""

from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from models import db, Usuario, Fondo, Favorito, Postulacion
from config_db import get_config
from werkzeug.security import generate_password_hash
import os
from datetime import datetime
import json

# Crear aplicación
app = Flask(__name__)
app.config.from_object(get_config())

# Inicializar extensiones
db.init_app(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'
login_manager.login_message = 'Por favor inicia sesión para acceder a esta página.'

from advanced_services import BlockchainService, MockGovernmentAPI, AnalyticsService

@login_manager.user_loader
def load_user(user_id):
    return Usuario.query.get(int(user_id))

# ===== RUTAS AVANZADAS (NUEVO) =====
# (Rutas definidas más abajo para evitar duplicados)



# ===== RUTAS AVANZADAS (NUEVO) =====

@app.route('/api/avanzado/validar-rut/<rut>', methods=['GET'])
@login_required
def api_validar_rut(rut):
    """API Mock SII"""
    return jsonify(MockGovernmentAPI.validar_rut(rut))

@app.route('/api/avanzado/analytics/<region>', methods=['GET'])
@login_required
def api_analytics(region):
    """Analytics predictivos"""
    return jsonify(AnalyticsService.obtener_metricas_region(region))

@app.route('/api/avanzado/postular/<int:fondo_id>', methods=['POST'])
@login_required
def api_postular_avanzado(fondo_id):
    """Postulación con trazabilidad Blockchain y Gamificación"""
    fondo = Fondo.query.get_or_404(fondo_id)
    
    # Crear postulación
    postulacion = Postulacion(
        usuario_id=current_user.id,
        fondo_id=fondo.id,
        estado='Enviada'
    )
    db.session.add(postulacion)
    db.session.flush() # Para tener ID
    
    # Generar Hash Blockchain
    tx_hash = BlockchainService.generar_hash_postulacion(
        postulacion.id, 
        current_user.id, 
        {'fondo': fondo.nombre, 'monto': fondo.monto_texto}
    )
    postulacion.hash_tx = tx_hash
    
    # Gamificación
    current_user.agregar_puntos(100) # 100 puntos por postular
    
    db.session.commit()
    
    return jsonify({
        'status': 'success',
        'mensaje': 'Postulación inmutable registrada',
        'tx_hash': tx_hash,
        'puntos_ganados': 100,
        'nuevo_nivel': current_user.nivel
    })

@app.route('/api/avanzado/voice-search', methods=['POST'])
def api_voice_search():
    """Mock de búsqueda por voz (recibe texto transcrito)"""
    data = request.get_json()
    query = data.get('query', '')
    
    # Usar lógica de búsqueda existente
    fondos = Fondo.query.filter(
        db.or_(
            Fondo.nombre.ilike(f'%{query}%'),
            Fondo.descripcion.ilike(f'%{query}%')
        )
    ).limit(5).all()
    
    return jsonify([{
        'nombre': f.nombre,
        'monto': f.monto_texto,
        'id': f.id
    } for f in fondos])


# Registrar rutas de IA
try:
    from ai_routes import ai_bp
    app.register_blueprint(ai_bp)
    print("✅ Rutas de IA registradas")
except ImportError as e:
    print(f"⚠️ Rutas de IA no disponibles: {e}")


# ===== RUTAS DE AUTENTICACIÓN =====

@app.route('/registro', methods=['GET', 'POST'])
def registro():
    """Registro de nuevos usuarios"""
    if current_user.is_authenticated:
        return redirect(url_for('home'))
    
    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        nombre = request.form.get('nombre', '').strip()
        region = request.form.get('region', '').strip()
        tipo_predio = request.form.get('tipo_predio', '').strip()
        
        # Validaciones
        if not email or not password:
            flash('Email y contraseña son requeridos', 'error')
            return render_template('registro.html')
        
        if Usuario.query.filter_by(email=email).first():
            flash('Este email ya está registrado', 'error')
            return render_template('registro.html')
        
        # Crear usuario
        usuario = Usuario(
            email=email,
            nombre=nombre,
            region=region,
            tipo_predio=tipo_predio
        )
        usuario.set_password(password)
        
        db.session.add(usuario)
        db.session.commit()
        
        flash('¡Registro exitoso! Ahora puedes iniciar sesión.', 'success')
        return redirect(url_for('login'))
    
    return render_template('registro.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    """Inicio de sesión"""
    if current_user.is_authenticated:
        return redirect(url_for('home'))
    
    if request.method == 'POST':
        email = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        remember = request.form.get('remember', False)
        
        usuario = Usuario.query.filter_by(email=email).first()
        
        if usuario and usuario.check_password(password):
            login_user(usuario, remember=remember)
            usuario.ultimo_acceso = datetime.utcnow()
            db.session.commit()
            
            next_page = request.args.get('next')
            return redirect(next_page or url_for('dashboard'))
        else:
            flash('Email o contraseña incorrectos', 'error')
    
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    """Cerrar sesión"""
    logout_user()
    flash('Has cerrado sesión exitosamente', 'info')
    return redirect(url_for('home'))

# ===== RUTAS PRINCIPALES =====

@app.route('/')
def home():
    """Página principal con búsqueda de fondos"""
    # Parámetros de búsqueda
    query = request.args.get('q', '').strip()
    fuente = request.args.get('fuente', '').strip()
    area = request.args.get('area', '').strip()
    estado = request.args.get('estado', 'Abierto').strip()
    page = request.args.get('page', 1, type=int)
    
    # Query base
    fondos_query = Fondo.query.filter_by(activo=True)
    
    # Filtros
    if query:
        fondos_query = fondos_query.filter(
            db.or_(
                Fondo.nombre.ilike(f'%{query}%'),
                Fondo.descripcion.ilike(f'%{query}%'),
                Fondo.palabras_clave.ilike(f'%{query}%')
            )
        )
    
    if fuente:
        fondos_query = fondos_query.filter(Fondo.fuente.ilike(f'%{fuente}%'))
    
    if area:
        fondos_query = fondos_query.filter(Fondo.area_interes.ilike(f'%{area}%'))
    
    if estado:
        fondos_query = fondos_query.filter(Fondo.estado.ilike(f'%{estado}%'))
    
    # Ordenar por el más reciente (ID descendente para mostrar lo nuevo primero)
    # Usuario pidió: "del mas reciente al mas antiguo"
    fondos_query = fondos_query.order_by(Fondo.id.desc())
    
    # Paginación
    fondos_paginados = fondos_query.paginate(
        page=page,
        per_page=app.config['FONDOS_PER_PAGE'],
        error_out=False
    )
    
    # Estadísticas
    total_fondos = Fondo.query.filter_by(activo=True).count()
    fondos_abiertos = Fondo.query.filter_by(activo=True, estado='Abierto').count()
    fuentes_unicas = db.session.query(Fondo.fuente).distinct().count()
    
    # Calculo estimado de monto (Mock para MVP ya que monto_texto es string)
    monto_total = 41325000 
    
    stats = {
        'total_fondos': total_fondos,
        'fondos_abiertos': fondos_abiertos,
        'fuentes_unicas': fuentes_unicas,
        'monto_total': f"${monto_total:,.0f}"
    }
    
    return render_template(
        'home_mvp.html',
        fondos=fondos_paginados,
        stats=stats,
        query=query,
        fuente=fuente,
        area=area,
        estado=estado
    )

@app.route('/api/stats')
def api_stats():
    """Endpoint para estadísticas (compatible con React si se requiere)"""
    return jsonify({
        'proyectos': Fondo.query.filter_by(activo=True).count(),
        'convocatorias': Fondo.query.filter_by(activo=True, estado='Abierto').count(),
        'fuentes': db.session.query(Fondo.fuente).distinct().count(),
        'monto': 41325000
    })

@app.route('/dashboard')
@login_required
def dashboard():
    """Dashboard personalizado del usuario"""
    # Fondos recomendados basados en perfil
    fondos_recomendados = []
    
    if current_user.region:
        fondos_recomendados = Fondo.query.filter(
            db.or_(
                Fondo.region == current_user.region,
                Fondo.region == 'Nacional'
            ),
            Fondo.estado == 'Abierto',
            Fondo.activo == True
        ).limit(10).all()
    else:
        fondos_recomendados = Fondo.query.filter_by(
            estado='Abierto',
            activo=True
        ).limit(10).all()
    
    # Favoritos del usuario
    favoritos = Favorito.query.filter_by(usuario_id=current_user.id).all()
    
    # Postulaciones activas
    postulaciones = Postulacion.query.filter_by(usuario_id=current_user.id).all()
    
    return render_template(
        'dashboard.html',
        fondos_recomendados=fondos_recomendados,
        favoritos=favoritos,
        postulaciones=postulaciones
    )

@app.route('/fondo/<int:id>')
def detalle_fondo(id):
    """Detalle de un fondo específico"""
    fondo = Fondo.query.get_or_404(id)
    
    # Verificar si es favorito del usuario
    es_favorito = False
    if current_user.is_authenticated:
        es_favorito = Favorito.query.filter_by(
            usuario_id=current_user.id,
            fondo_id=id
        ).first() is not None
    
    return render_template('detalle_fondo.html', fondo=fondo, es_favorito=es_favorito)

@app.route('/chatbot')
@login_required
def chatbot():
    """Chatbot con IA de Gemini"""
    return render_template('chatbot.html')


# ===== API ENDPOINTS =====

@app.route('/api/fondos')
def api_fondos():
    """API para búsqueda de fondos (para autocompletado)"""
    query = request.args.get('q', '').strip()
    limit = request.args.get('limit', 10, type=int)
    
    if not query:
        return jsonify([])
    
    fondos = Fondo.query.filter(
        db.or_(
            Fondo.nombre.ilike(f'%{query}%'),
            Fondo.fuente.ilike(f'%{query}%')
        ),
        Fondo.activo == True
    ).limit(limit).all()
    
    return jsonify([{
        'id': f.id,
        'nombre': f.nombre,
        'fuente': f.fuente,
        'monto': f.monto_texto,
        'estado': f.estado
    } for f in fondos])

@app.route('/api/favorito/toggle/<int:fondo_id>', methods=['POST'])
@login_required
def toggle_favorito(fondo_id):
    """Agregar/quitar favorito"""
    fondo = Fondo.query.get_or_404(fondo_id)
    
    favorito = Favorito.query.filter_by(
        usuario_id=current_user.id,
        fondo_id=fondo_id
    ).first()
    
    if favorito:
        db.session.delete(favorito)
        db.session.commit()
        return jsonify({'status': 'removed', 'message': 'Eliminado de favoritos'})
    else:
        nuevo_favorito = Favorito(
            usuario_id=current_user.id,
            fondo_id=fondo_id
        )
        db.session.add(nuevo_favorito)
        db.session.commit()
        return jsonify({'status': 'added', 'message': 'Agregado a favoritos'})

# ===== COMANDOS CLI =====

@app.cli.command()
def init_db():
    """Inicializar base de datos"""
    db.create_all()
    print("✅ Base de datos inicializada")

@app.cli.command()
def migrate_data():
    """Migrar datos de Excel"""
    from migrate_to_postgres import migrar_excel_a_postgres
    migrar_excel_a_postgres()

@app.cli.command()
def update_projects():
    """Actualizar proyectos automáticamente desde fuentes IICA"""
    try:
        from scrapers.iica_auto_search import IICAProjectScraper
        scraper = IICAProjectScraper()
        proyectos = scraper.buscar_todos()
        resultado = scraper.guardar_en_db(app)
        print(f"✅ Proyectos actualizados: {resultado}")
    except Exception as e:
        print(f"❌ Error actualizando proyectos: {e}")

# Ruta para actualización manual (admin)
@app.route('/api/actualizar-proyectos', methods=['POST'])
@login_required
def actualizar_proyectos():
    """Endpoint para actualizar proyectos manualmente"""
    try:
        from scrapers.iica_auto_search import IICAProjectScraper
        scraper = IICAProjectScraper()
        proyectos = scraper.buscar_todos()
        return jsonify({
            'success': True,
            'proyectos_encontrados': len(proyectos),
            'mensaje': f'Se encontraron {len(proyectos)} proyectos de IICA y fuentes relacionadas'
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


# ===== ERROR HANDLERS =====

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_server_error(e):
    return render_template('500.html'), 500


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        print(f"✅ Usando: {app.config.from_object(get_config()).get_db_info()}")
    
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
