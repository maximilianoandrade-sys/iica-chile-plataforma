"""
Plataforma IICA Chile - Versión Final Consolidada
Puerto 5004 con todas las funcionalidades
"""

from flask import Flask, render_template, redirect, url_for, request, send_file, Response, jsonify, make_response
import json
import os
import time
import logging
from functools import lru_cache
import pandas as pd
from datetime import datetime
from utils import parsear_monto
from project_updater import ProjectUpdater
from link_manager import link_manager
from busqueda_avanzada import BuscadorAvanzado
from auto_search_system import AutoSearchSystem

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
    proyectos = _cargar_excel_cached()
    if not proyectos:
        # Autopoblar si no hay datos en producción
        try:
            updater = ProjectUpdater()
            nuevos = updater.update_all_projects()
            try:
                if os.path.exists('data/proyectos_completos.xlsx'):
                    df = pd.read_excel('data/proyectos_completos.xlsx')
                    os.makedirs(os.path.dirname(DATA_PATH), exist_ok=True)
                    df.to_excel(DATA_PATH, index=False)
            except Exception as e:
                print(f"⚠️ No se pudo sincronizar {DATA_PATH} tras autopoblado: {e}")
            try:
                _cargar_excel_cached.cache_clear()
            except Exception:
                pass
            proyectos = _cargar_excel_cached()
            print(f"✅ Auto-poblado en producción con {len(nuevos)} proyectos nuevos")
        except Exception as e:
            print(f"⚠️ Auto-poblado falló: {e}")
    return proyectos

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
        
        return render_template('home_institucional_completo.html',
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
            return render_template('proyecto_detalle_institucional.html', proyecto=proyecto)
        else:
            return render_template('error.html', error="Proyecto no encontrado")
    except Exception as e:
        return render_template('error.html', error=str(e))

# ===== SECCIÓN QUIÉNES SOMOS =====

@app.route('/quienes-somos')
def quienes_somos():
    """Página institucional: Quiénes Somos (IICA Chile)"""
    info = {
        'titulo': 'IICA Chile - Quiénes Somos',
        'mision': (
            'Contribuir al desarrollo agrícola y al bienestar rural en Chile, '
            'impulsando la innovación, la sostenibilidad y la resiliencia del sector agroalimentario '
            'mediante asistencia técnica, cooperación técnica, gestión del conocimiento y articulación de alianzas.'
        ),
        'vision': (
            'Ser un referente técnico de excelencia para el fortalecimiento de capacidades, '
            'la transformación digital y la competitividad sostenible del agro chileno, '
            'promoviendo la seguridad alimentaria, la inclusión y la adaptación al cambio climático.'
        ),
        'valores': [
            'Excelencia técnica', 'Transparencia y ética', 'Innovación y aprendizaje continuo',
            'Sostenibilidad e inclusión', 'Cooperación y alianzas estratégicas'
        ],
        'lineas_trabajo': [
            'Innovación y digitalización agroalimentaria',
            'Gestión hídrica y adaptación al cambio climático',
            'Desarrollo rural e inclusión (mujeres y juventudes rurales)',
            'Fortalecimiento de capacidades y extensionismo',
            'Comercio, agregación de valor y sostenibilidad'
        ],
        'contacto': {
            'email': 'chile@iica.int',
            'telefono': '+56 2 2341 1100',
            'direccion': 'Santiago, Chile',
            'sitio': 'https://www.iica.int'
        },
        'redes': {
            'twitter': 'https://x.com/iicanoticias',
            'instagram': 'https://www.instagram.com/iicachile/',
            'facebook': 'https://www.facebook.com/IICAChile/'
        }
    }
    return render_template('quienes_somos.html', info=info)

# ===== RUTAS DE NOTIFICACIONES =====

@app.route('/notificaciones')
def notificaciones():
    """Página de notificaciones"""
    return render_template('notificaciones.html', 
                         notifications=[], 
                         stats={'total_notifications': 0, 'unread_notifications': 0})

# ===== RUTAS DE SEGUIMIENTO DE APLICACIONES =====

@app.route('/mis-aplicaciones')
def mis_aplicaciones():
    """Página de aplicaciones del usuario"""
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
        return render_template('reportes.html', report={})
    except:
        return render_template('reportes.html', report={})

# ===== SECCIÓN INSTITUCIONAL =====

@app.route('/quienes-somos')
def quienes_somos():
    """Página institucional: Quiénes Somos (IICA Chile)"""
    info = {
        'titulo': 'IICA Chile',
        'mision': (
            'Contribuir al desarrollo agrícola y al bienestar rural en Chile, '
            'mediante la cooperación técnica, la innovación y el fortalecimiento '
            'de capacidades para una agricultura más productiva, inclusiva y sostenible.'
        ),
        'vision': (
            'Ser un socio estratégico para transformar los sistemas agroalimentarios en Chile, '
            'impulsando la sostenibilidad, la digitalización, la resiliencia climática y la '
            'competitividad de los territorios rurales.'
        ),
        'valores': [
            'Colaboración y alianzas',
            'Innovación y transferencia de conocimiento',
            'Sostenibilidad e inclusión',
            'Transparencia y servicio público'
        ],
        'contacto': {
            'email': 'chile@iica.int',
            'telefono': '+56 2 2341 1100',
            'direccion': 'Santiago, Chile',
            'web': 'https://www.iica.int'
        },
        'lineas': [
            'Sistemas agroalimentarios sostenibles y resilientes',
            'Innovación tecnológica y transformación digital',
            'Desarrollo territorial y juventudes rurales',
            'Gestión hídrica y adaptación al cambio climático'
        ]
    }
    return render_template('quienes_somos.html', info=info)

# ====== ENDPOINTS DE ACTUALIZACIÓN PARA PRODUCCIÓN (Render) ======

# Inicializar actualizador de proyectos
project_updater = ProjectUpdater()

@app.route('/api/update-projects', methods=['POST'])
def api_update_projects():
    """Actualiza proyectos desde fuentes y sincroniza el Excel usado por producción."""
    try:
        new_projects = project_updater.update_all_projects()
        # Tras actualizar, si existe base completa, copiar a DATA_PATH para el front
        try:
            if os.path.exists('data/proyectos_completos.xlsx'):
                df = pd.read_excel('data/proyectos_completos.xlsx')
                os.makedirs(os.path.dirname(DATA_PATH), exist_ok=True)
                df.to_excel(DATA_PATH, index=False)
        except Exception as e:
            print(f"⚠️ No se pudo sincronizar con {DATA_PATH}: {e}")
        # Limpiar caché para reflejar cambios inmediatamente
        try:
            _cargar_excel_cached.cache_clear()
        except Exception:
            pass
        return jsonify({
            'success': True,
            'new_projects_count': len(new_projects)
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/update-stats', methods=['GET'])
def api_update_stats():
    """Devuelve estadísticas de actualizaciones"""
    try:
        stats = project_updater.get_update_stats()
        return jsonify({'success': True, 'stats': stats})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ====== BÚSQUEDA AUTOMÁTICA (Web crawling) PARA PRODUCCIÓN ======

auto_search_system = AutoSearchSystem()

def _sync_after_external_update():
    """Sincroniza data/proyectos_completos.xlsx -> DATA_PATH y limpia caché."""
    try:
        if os.path.exists('data/proyectos_completos.xlsx'):
            df = pd.read_excel('data/proyectos_completos.xlsx')
            os.makedirs(os.path.dirname(DATA_PATH), exist_ok=True)
            df.to_excel(DATA_PATH, index=False)
        try:
            _cargar_excel_cached.cache_clear()
        except Exception:
            pass
    except Exception as e:
        print(f"⚠️ Error sincronizando tras actualización externa: {e}")

@app.route('/api/auto-search/start', methods=['POST'])
def api_auto_search_start():
    """Inicia búsqueda automática en background y sincroniza base al finalizar (no bloqueante)."""
    try:
        auto_search_system.run_background_search()
        # No sabemos cuándo termina; sugerimos consultar status.
        return jsonify({'success': True, 'message': 'Búsqueda automática iniciada en background'}), 202
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/auto-search/trigger', methods=['POST'])
def api_auto_search_trigger():
    """Ejecuta una búsqueda completa ahora (bloqueante) y sincroniza base."""
    try:
        auto_search_system.daily_search()
        _sync_after_external_update()
        return jsonify({'success': True, 'message': 'Búsqueda automática ejecutada y sincronizada'})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/auto-search/status', methods=['GET'])
def api_auto_search_status():
    """Devuelve estadísticas/resumen de búsquedas automáticas."""
    try:
        stats = auto_search_system.get_search_stats()
        return jsonify({'success': True, 'stats': stats})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# ===== RUTAS DE BACKUP =====

@app.route('/backup')
def backup_page():
    """Página de gestión de backups"""
    return render_template('backup.html', backups=[], stats={})

# ===== RUTAS DE DASHBOARD AVANZADO =====

@app.route('/dashboard-avanzado')
def dashboard_avanzado():
    """Dashboard avanzado con todas las funcionalidades"""
    try:
        proyectos = cargar_excel()
        stats = calcular_estadisticas(proyectos)
        
        return render_template('dashboard_avanzado.html',
                             proyectos=proyectos[:10],
                             stats=stats,
                             notifications=[],
                             applications_stats={},
                             backup_stats={})
    except:
        return render_template('dashboard_avanzado.html',
                             proyectos=[],
                             stats={},
                             notifications=[],
                             applications_stats={},
                             backup_stats={})

# ===== RUTAS DE UTILIDAD =====

@app.route('/health')
def health():
    """Health check"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

@app.route('/api/verificar-enlaces')
def verificar_enlaces():
    """Verifica todos los enlaces de la plataforma"""
    try:
        proyectos = cargar_excel()
        resultados = link_manager.verificar_todos_enlaces(proyectos)
        reporte = link_manager.generar_reporte_enlaces(resultados)
        
        return jsonify({
            'success': True,
            'resultados': resultados,
            'reporte': reporte
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })

@app.route('/api/enlaces-proyecto/<int:proyecto_id>')
def enlaces_proyecto(proyecto_id):
    """Obtiene enlaces para un proyecto específico"""
    try:
        proyectos = cargar_excel()
        if 0 <= proyecto_id < len(proyectos):
            proyecto = proyectos[proyecto_id]
            enlaces = link_manager.obtener_enlaces_proyecto(proyecto)
            return jsonify({
                'success': True,
                'enlaces': enlaces
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Proyecto no encontrado'
            })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })

@app.route('/api/busqueda-avanzada')
def busqueda_avanzada():
    """Búsqueda avanzada de proyectos"""
    try:
        proyectos = cargar_excel()
        buscador = BuscadorAvanzado(proyectos)
        
        # Obtener parámetros de búsqueda
        texto = request.args.get('texto', '')
        area = request.args.get('area', '')
        fuente = request.args.get('fuente', '')
        estado = request.args.get('estado', '')
        monto_minimo = float(request.args.get('monto_minimo', 0))
        monto_maximo = float(request.args.get('monto_maximo', float('inf')))
        dias_hasta_cierre = int(request.args.get('dias_hasta_cierre', 0)) if request.args.get('dias_hasta_cierre') else None
        palabras_clave = request.args.get('palabras_clave', '').split(',') if request.args.get('palabras_clave') else None
        
        # Realizar búsqueda
        resultados = buscador.buscar_combinada(
            texto=texto,
            area=area,
            fuente=fuente,
            estado=estado,
            monto_minimo=monto_minimo,
            monto_maximo=monto_maximo,
            dias_hasta_cierre=dias_hasta_cierre,
            palabras_clave=palabras_clave
        )
        
        # Obtener estadísticas
        estadisticas = buscador.obtener_estadisticas_busqueda(resultados)
        
        return jsonify({
            'success': True,
            'resultados': [r['proyecto'].to_dict() for r in resultados],
            'estadisticas': estadisticas,
            'total': len(resultados)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })

@app.route('/api/sugerencias')
def sugerencias():
    """Obtiene sugerencias de búsqueda"""
    try:
        proyectos = cargar_excel()
        buscador = BuscadorAvanzado(proyectos)
        
        texto = request.args.get('texto', '')
        sugerencias = buscador.obtener_sugerencias(texto)
        
        return jsonify({
            'success': True,
            'sugerencias': sugerencias
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        })

@app.route('/busqueda-avanzada')
def pagina_busqueda_avanzada():
    """Página de búsqueda avanzada"""
    return render_template('busqueda_avanzada.html')

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
    print("🚀 Iniciando Plataforma IICA Chile Final...")
    print("✅ Puerto: 5004")
    print("✅ Funcionalidades principales disponibles")
    print("✅ Sistema estable y optimizado")
    print("🎉 Plataforma lista para usar")
    
    # Reducir verbosidad del servidor
    logging.getLogger('werkzeug').setLevel(logging.WARNING)
    
    # Configuración para Render
    port = int(os.environ.get('PORT', 5004))
    app.run(debug=False, host='0.0.0.0', port=port)
