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
import uuid
from datetime import datetime
from utils import parsear_monto

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

app = Flask(__name__, static_folder='static', static_url_path='/static')
DATA_PATH = "data/proyectos_fortalecidos.xlsx"

# Crear directorio de datos si no existe
os.makedirs("data", exist_ok=True)

@lru_cache(maxsize=1)
def _cargar_excel_cached():
    """Función cacheada para cargar Excel - SIN límites, con múltiples fuentes"""
    proyectos_totales = []
    
    try:
        # Intentar cargar desde proyectos_fortalecidos.xlsx primero
        if os.path.exists(DATA_PATH):
            try:
                df = pd.read_excel(DATA_PATH)
                proyectos = df.to_dict('records')
                print(f"📂 Cargados {len(proyectos)} proyectos desde {DATA_PATH}")
                if proyectos:
                    proyectos_totales.extend(proyectos)
            except Exception as e:
                print(f"⚠️ Error leyendo {DATA_PATH}: {e}")
        
        # Intentar otros archivos como respaldo
        archivos_alternativos = [
            'data/proyectos_completos.xlsx',
            'data/proyectos.xlsx',
            'data/proyectos_actualizados.xlsx'
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
        
        # Si aún no hay proyectos, intentar desde scrapers
        if len(proyectos_totales) == 0:
            print("🔄 No se encontraron archivos Excel, intentando cargar desde scrapers...")
            try:
                from scrapers.international_funding import obtener_proyectos_internacionales
                proyectos_scrapers = obtener_proyectos_internacionales()
                if proyectos_scrapers:
                    print(f"📊 Cargados {len(proyectos_scrapers)} proyectos desde scrapers")
                    proyectos_totales.extend(proyectos_scrapers)
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
    proyectos = _cargar_excel_cached()
    
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
    """Página principal - VERSIÓN MEJORADA CON TODOS LOS PROYECTOS"""
    try:
        proyectos = cargar_excel()
        print(f"📊 Total de proyectos cargados: {len(proyectos)}")
        
        # Filtros PRIMERO (antes de paginación) - CORREGIDO
        area = request.args.get('area', '')
        fuente = request.args.get('fuente', '')
        busqueda = request.args.get('busqueda', '')
        estado = request.args.get('estado', '')
        
        # Aplicar filtros a TODOS los proyectos
        proyectos_filtrados = proyectos.copy()
        
        if area:
            proyectos_filtrados = [p for p in proyectos_filtrados if area.lower() in str(p.get('Área de interés', '')).lower()]
        if fuente:
            proyectos_filtrados = [p for p in proyectos_filtrados if fuente.lower() in str(p.get('Fuente', '')).lower()]
        if estado:
            proyectos_filtrados = [p for p in proyectos_filtrados if estado.lower() in str(p.get('Estado', '')).lower()]
        if busqueda:
            busqueda_lower = busqueda.lower()
            proyectos_filtrados = [p for p in proyectos_filtrados if 
                                 busqueda_lower in str(p.get('Nombre', '')).lower() or
                                 busqueda_lower in str(p.get('Descripción', '')).lower() or
                                 busqueda_lower in str(p.get('Fuente', '')).lower() or
                                 busqueda_lower in str(p.get('Área de interés', '')).lower()]
        
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
        
        return render_template('home_ordenado_mejorado.html',  # TEMPLATE MEJORADO
                             proyectos=proyectos_paginados,  # Proyectos paginados para mostrar
                             stats=stats,
                             current_page=page,
                             total_pages=total_pages,
                             total_proyectos=len(proyectos_filtrados),  # Total después de filtros
                             total_todos=len(proyectos),  # Total sin filtros
                             per_page=per_page,
                             area=area,
                             fuente=fuente,
                             busqueda=busqueda,
                             estado=estado,
                             ordenar_por=ordenar_por,
                             orden=orden,
                             todos_los_proyectos_filtrados=proyectos_filtrados)  # Para referencia
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
            return render_template('home_ordenado_mejorado.html',
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
            return render_template('error.html', error=f"Error principal: {str(e)}\nError fallback: {str(e2)}")

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

@app.route('/health')
def health():
    """Health check"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

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
    
    # Mostrar página de error con información útil
    try:
        return render_template('error.html', 
                             error=f"Página no encontrada: {request.path}",
                             error_code=404,
                             suggestion="Verifica la URL o regresa a la página principal."), 404
    except Exception as e:
        # Si el template de error falla, retornar respuesta básica
        return f"""
        <html>
        <head><title>404 - Página no encontrada</title></head>
        <body>
            <h1>404 - Página no encontrada</h1>
            <p>La página que buscas no existe: {request.path}</p>
            <p><a href="/">Volver a la página principal</a></p>
        </body>
        </html>
        """, 404

@app.errorhandler(500)
def internal_error(error):
    """Manejo de errores 500 - Error interno"""
    print(f"❌ 500 - Error interno: {error}")
    return render_template('error.html', 
                         error="Error interno del servidor. Por favor, intenta nuevamente en unos momentos.",
                         error_code=500), 500

@app.errorhandler(Exception)
def handle_exception(e):
    """Manejo global de errores"""
    print(f"❌ Error no manejado: {e}")
    import traceback
    traceback.print_exc()
    return render_template('error.html', 
                         error=f"Error: {str(e)}",
                         error_code=500), 500

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
