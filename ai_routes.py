"""
Rutas de API para Google Gemini AI
Endpoints para chatbot y funcionalidades de IA
"""

from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from gemini_service import gemini_service
from models import Fondo, db
import json

# Blueprint para rutas de IA
ai_bp = Blueprint('ai', __name__, url_prefix='/api/ai')

@ai_bp.route('/chat', methods=['POST'])
@login_required
def chat():
    """
    Endpoint de chatbot con Gemini
    
    POST /api/ai/chat
    Body: {
        "mensaje": "¿Qué fondos hay para riego?"
    }
    """
    data = request.get_json()
    mensaje = data.get('mensaje', '').strip()
    
    if not mensaje:
        return jsonify({'error': 'Mensaje vacío'}), 400
    
    # Contexto del usuario
    contexto = {
        'region': current_user.region,
        'tipo_predio': current_user.tipo_predio,
        'cultivos': current_user.get_cultivos_list()
    }
    
    # Obtener respuesta de Gemini
    respuesta = gemini_service.chat_asistente_agricola(mensaje, contexto)
    
    return jsonify({
        'respuesta': respuesta,
        'timestamp': datetime.utcnow().isoformat()
    })

@ai_bp.route('/recomendaciones', methods=['GET'])
@login_required
def recomendaciones_ia():
    """
    Obtener recomendaciones de fondos con IA
    
    GET /api/ai/recomendaciones
    """
    # Obtener fondos abiertos
    fondos = Fondo.query.filter_by(
        estado='Abierto',
        activo=True
    ).limit(20).all()
    
    if not fondos:
        return jsonify({'fondos': []})
    
    # Convertir a dict
    fondos_dict = [{
        'id': f.id,
        'nombre': f.nombre,
        'fuente': f.fuente,
        'area_interes': f.area_interes,
        'descripcion': f.descripcion,
        'monto_texto': f.monto_texto
    } for f in fondos]
    
    # Perfil del usuario
    perfil = {
        'region': current_user.region,
        'tipo_predio': current_user.tipo_predio,
        'cultivos': current_user.get_cultivos_list(),
        'necesidades': 'financiamiento agrícola'
    }
    
    # Generar recomendaciones con IA
    fondos_recomendados = gemini_service.generar_recomendaciones_fondos(
        perfil, fondos_dict
    )
    
    return jsonify({
        'fondos': fondos_recomendados[:10],
        'metodo': 'gemini_ai'
    })

@ai_bp.route('/generar-carta/<int:fondo_id>', methods=['POST'])
@login_required
def generar_carta(fondo_id):
    """
    Generar carta de presentación con IA
    
    POST /api/ai/generar-carta/<fondo_id>
    """
    fondo = Fondo.query.get_or_404(fondo_id)
    
    fondo_dict = {
        'nombre': fondo.nombre,
        'fuente': fondo.fuente,
        'descripcion': fondo.descripcion
    }
    
    perfil = {
        'nombre': current_user.nombre or current_user.email,
        'region': current_user.region,
        'tipo_predio': current_user.tipo_predio,
        'cultivos': current_user.get_cultivos_list()
    }
    
    carta = gemini_service.generar_carta_presentacion(fondo_dict, perfil)
    
    return jsonify({
        'carta': carta,
        'fondo_nombre': fondo.nombre
    })

@ai_bp.route('/validar-elegibilidad/<int:fondo_id>', methods=['GET'])
@login_required
def validar_elegibilidad(fondo_id):
    """
    Validar elegibilidad con IA
    
    GET /api/ai/validar-elegibilidad/<fondo_id>
    """
    fondo = Fondo.query.get_or_404(fondo_id)
    
    fondo_dict = {
        'nombre': fondo.nombre,
        'beneficiarios': fondo.beneficiarios,
        'criterios_elegibilidad': fondo.criterios_elegibilidad,
        'region': fondo.region
    }
    
    perfil = {
        'region': current_user.region,
        'tipo_predio': current_user.tipo_predio,
        'hectareas': current_user.hectareas
    }
    
    resultado = gemini_service.validar_elegibilidad(fondo_dict, perfil)
    
    return jsonify(resultado)

# Importar en app_mvp.py:
# from ai_routes import ai_bp
# app.register_blueprint(ai_bp)
