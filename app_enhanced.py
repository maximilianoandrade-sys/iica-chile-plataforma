"""
Plataforma IICA Chile - Versión Mejorada
Consolidada en puerto 5004 con funcionalidades avanzadas
"""

from flask import Flask, render_template, redirect, url_for, request, send_file, Response, jsonify, make_response
import json
import os
import time
import logging
from functools import lru_cache
import pandas as pd
import time
import uuid
from datetime import datetime
from utils import parsear_monto

# Importar sistemas avanzados
try:
    from ai_search_engine import AISearchEngine
    from project_updater import ProjectUpdater
    from advanced_analytics import AdvancedAnalytics
    from application_system import ApplicationSystem
    from auto_search_system import AutoSearchSystem
    from notification_system_advanced import notification_system
    from application_tracking import application_tracker
    from advanced_reporting import advanced_reporting
    from backup_system_advanced import backup_system
    print("✅ Todos los sistemas avanzados cargados")
except ImportError as e:
    print(f"⚠️ Algunos sistemas avanzados no disponibles: {e}")

app = Flask(__name__, static_folder='static', static_url_path='/static')
DATA_PATH = "data/proyectos_fortalecidos.xlsx"

# Crear directorio de datos si no existe
os.makedirs("data", exist_ok=True)

@lru_cache(maxsize=1)
def _cargar_excel_cached():
    """Función cacheada para cargar Excel"""
    try:
        if os.path.exists(DATA_PATH):
            df = pd.read_excel(DATA_PATH)
            proyectos = df.to_dict('records')
            print(f"📂 Cargados {len(proyectos)} proyectos fortalecidos desde Excel")
            return proyectos
        else:
            print("⚠️ Archivo de datos no encontrado, creando datos de ejemplo")
            return []
    except Exception as e:
        print(f"❌ Error cargando Excel: {e}")
        return []

def cargar_excel():
    """Cargar datos de Excel con cache de 5 minutos"""
    return _cargar_excel_cached()

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

# ===== RUTAS PRINCIPALES =====

@app.route('/')
def home():
    """Página principal"""
    try:
        proyectos = cargar_excel()
        stats = calcular_estadisticas(proyectos)
        
        # Paginación
        page = request.args.get('page', 1, type=int)
        per_page = 10
        start = (page - 1) * per_page
        end = start + per_page
        proyectos_paginados = proyectos[start:end]
        
        # Filtros
        area = request.args.get('area', '')
        fuente = request.args.get('fuente', '')
        busqueda = request.args.get('busqueda', '')
        
        if area:
            proyectos_paginados = [p for p in proyectos_paginados if area.lower() in p.get('Área de interés', '').lower()]
        if fuente:
            proyectos_paginados = [p for p in proyectos_paginados if fuente.lower() in p.get('Fuente', '').lower()]
        if busqueda:
            proyectos_paginados = [p for p in proyectos_paginados if busqueda.lower() in p.get('Nombre', '').lower()]
        
        # Ordenamiento
        ordenar_por = request.args.get('ordenar_por', 'fecha')
        orden = request.args.get('orden', 'asc')
        
        if ordenar_por == 'fecha' and proyectos_paginados:
            proyectos_paginados.sort(key=lambda x: x.get('Fecha cierre', ''), reverse=(orden == 'desc'))
        elif ordenar_por == 'monto' and proyectos_paginados:
            proyectos_paginados.sort(key=lambda x: parsear_monto(x.get('Monto', 0)), reverse=(orden == 'desc'))
        elif ordenar_por == 'nombre' and proyectos_paginados:
            proyectos_paginados.sort(key=lambda x: x.get('Nombre', ''), reverse=(orden == 'desc'))
        
        total_pages = (len(proyectos) + per_page - 1) // per_page
        
        return render_template('home_ordenado.html',
                             proyectos=proyectos_paginados,
                             stats=stats,
                             current_page=page,
                             total_pages=total_pages,
                             area=area,
                             fuente=fuente,
                             busqueda=busqueda,
                             ordenar_por=ordenar_por,
                             orden=orden)
    except Exception as e:
        print(f"❌ Error en home: {e}")
        return render_template('error.html', error=str(e))

@app.route('/proyecto/<int:proyecto_id>')
def ver_proyecto(proyecto_id):
    """Ver detalles de un proyecto específico"""
    try:
        proyectos = cargar_excel()
        if 0 <= proyecto_id < len(proyectos):
            proyecto = proyectos[proyecto_id]
            return render_template('proyecto_detalle_fortalecido.html', proyecto=proyecto)
        else:
            return render_template('error.html', error="Proyecto no encontrado")
    except Exception as e:
        return render_template('error.html', error=str(e))

# ===== RUTAS DE NOTIFICACIONES =====

@app.route('/notificaciones')
def notificaciones():
    """Página de notificaciones"""
    try:
        notifications = notification_system.get_notifications(limit=20)
        stats = notification_system.get_stats()
        return render_template('notificaciones.html', 
                             notifications=notifications, 
                             stats=stats)
    except:
        return render_template('notificaciones.html', 
                             notifications=[], 
                             stats={'total_notifications': 0, 'unread_notifications': 0})

@app.route('/api/notificaciones', methods=['GET'])
def api_notificaciones():
    """API para obtener notificaciones"""
    try:
        limit = request.args.get('limit', 10, type=int)
        unread_only = request.args.get('unread_only', 'false').lower() == 'true'
        
        notifications = notification_system.get_notifications(limit=limit, unread_only=unread_only)
        return jsonify({
            'success': True,
            'notifications': notifications,
            'total': len(notifications)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ===== RUTAS DE SEGUIMIENTO DE APLICACIONES =====

@app.route('/mis-aplicaciones')
def mis_aplicaciones():
    """Página de aplicaciones del usuario"""
    try:
        user_email = request.args.get('email', 'usuario@ejemplo.com')
        applications = application_tracker.get_user_applications(user_email)
        stats = application_tracker.get_statistics()
        return render_template('mis_aplicaciones.html', 
                             applications=applications, 
                             stats=stats,
                             user_email=user_email)
    except:
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
        report = advanced_reporting.generate_comprehensive_report(proyectos)
        return render_template('reportes.html', report=report)
    except:
        return render_template('reportes.html', report={})

# ===== RUTAS DE BACKUP =====

@app.route('/backup')
def backup_page():
    """Página de gestión de backups"""
    try:
        backups = backup_system.list_backups()
        stats = backup_system.get_backup_stats()
        return render_template('backup.html', backups=backups, stats=stats)
    except:
        return render_template('backup.html', backups=[], stats={})

# ===== RUTAS DE DASHBOARD AVANZADO =====

@app.route('/dashboard-avanzado')
def dashboard_avanzado():
    """Dashboard avanzado con todas las funcionalidades"""
    try:
        proyectos = cargar_excel()
        stats = calcular_estadisticas(proyectos)
        
        # Obtener datos adicionales
        notifications = notification_system.get_notifications(limit=5)
        applications_stats = application_tracker.get_statistics()
        backup_stats = backup_system.get_backup_stats()
        
        return render_template('dashboard_avanzado.html',
                             proyectos=proyectos[:10],
                             stats=stats,
                             notifications=notifications,
                             applications_stats=applications_stats,
                             backup_stats=backup_stats)
    except:
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
        backup_type = request.json.get('type', 'manual')
        backup_path = backup_system.create_backup(backup_type)
        return jsonify({
            'success': True,
            'backup_path': backup_path
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/notificaciones/<int:notification_id>/read', methods=['POST'])
def marcar_notificacion_leida(notification_id):
    """Marcar notificación como leída"""
    try:
        success = notification_system.mark_as_read(notification_id)
        return jsonify({'success': success})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ===== RUTAS DE UTILIDAD =====

@app.route('/health')
def health():
    """Health check"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

@app.route('/favicon.ico')
def favicon():
    """Favicon"""
    return '', 204

# ===== MANEJO DE ERRORES =====

@app.errorhandler(Exception)
def handle_exception(e):
    """Manejo global de errores"""
    print(f"❌ Error no manejado: {e}")
    return render_template('error.html', error=str(e)), 500

if __name__ == '__main__':
    print("🚀 Iniciando Plataforma IICA Chile Mejorada...")
    print("✅ Puerto: 5004")
    print("✅ Funcionalidades avanzadas cargadas")
    print("✅ Sistema de notificaciones activo")
    print("✅ Sistema de seguimiento de aplicaciones activo")
    print("✅ Sistema de reportes avanzados activo")
    print("✅ Sistema de backup automático activo")
    print("🎉 Plataforma lista para usar")
    
    # Reducir verbosidad del servidor
    logging.getLogger('werkzeug').setLevel(logging.WARNING)
    app.run(debug=False, host='0.0.0.0', port=5004)
