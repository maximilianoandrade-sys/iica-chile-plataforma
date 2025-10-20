#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Plataforma IICA Chile - Sistema de Detección de Oportunidades de Financiamiento
Versión mejorada con funcionalidades avanzadas para IICA Chile
"""

from flask import Flask, render_template, request, jsonify, redirect, url_for, flash, send_file, get_flashed_messages
import pandas as pd
import json
import os
from datetime import datetime, timedelta
import requests
from werkzeug.utils import secure_filename
import schedule
import time
import threading
from urllib.parse import urljoin
import logging

# Configuración de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = 'iica_chile_2025_secret_key'

# Configuración de archivos
UPLOAD_FOLDER = 'uploads'
EXPORT_FOLDER = 'exports'
DATA_FOLDER = 'data'
ALLOWED_EXTENSIONS = {'xlsx', 'xls', 'csv'}

# Crear directorios si no existen
for folder in [UPLOAD_FOLDER, EXPORT_FOLDER, DATA_FOLDER]:
    os.makedirs(folder, exist_ok=True)

# Archivos de datos
FONDOS_FILE = os.path.join(DATA_FOLDER, 'fondos_iica_chile.json')
PROYECTOS_FILE = os.path.join(DATA_FOLDER, 'proyectos_iica_chile.json')
CONFIG_FILE = os.path.join(DATA_FOLDER, 'config_iica_chile.json')

class IICAChilePlatform:
    def __init__(self):
        self.fondos_data = []
        self.proyectos_data = []
        self.config = self.cargar_configuracion()
        self.cargar_datos()
        
    def cargar_configuracion(self):
        """Cargar configuración de la plataforma"""
        default_config = {
            "nombre_plataforma": "IICA Chile - Portal de Financiamiento",
            "version": "2.0",
            "ultima_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "fuentes_automaticas": [
                "DEx", "Tenders Global", "BID", "ONU", 
                "Fondo Verde", "Fondo de Adaptación", "GEF", "UE", "FAO", "FIDA"
            ],
            "categorias": [
                "Agricultura", "Desarrollo Rural", "Cambio Climático",
                "Innovación", "Seguridad Alimentaria", "Biodiversidad",
                "Tecnología", "Sostenibilidad"
            ],
            "estados": ["Abierto", "Cerrado", "Ventanilla Abierta", "Próximo a Abrir"],
            "recordatorios_dias": 30
        }
        
        if os.path.exists(CONFIG_FILE):
            try:
                with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except:
                pass
        
        self.guardar_configuracion(default_config)
        return default_config
    
    def guardar_configuracion(self, config):
        """Guardar configuración"""
        with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
            json.dump(config, f, ensure_ascii=False, indent=2)
    
    def cargar_datos(self):
        """Cargar datos de fondos y proyectos"""
        # Cargar fondos
        if os.path.exists(FONDOS_FILE):
            try:
                with open(FONDOS_FILE, 'r', encoding='utf-8') as f:
                    self.fondos_data = json.load(f)
            except:
                self.fondos_data = []
        
        # Cargar proyectos
        if os.path.exists(PROYECTOS_FILE):
            try:
                with open(PROYECTOS_FILE, 'r', encoding='utf-8') as f:
                    self.proyectos_data = json.load(f)
            except:
                self.proyectos_data = []
    
    def guardar_datos(self):
        """Guardar todos los datos"""
        with open(FONDOS_FILE, 'w', encoding='utf-8') as f:
            json.dump(self.fondos_data, f, ensure_ascii=False, indent=2)
        
        with open(PROYECTOS_FILE, 'w', encoding='utf-8') as f:
            json.dump(self.proyectos_data, f, ensure_ascii=False, indent=2)
    
    def obtener_fondos_nacionales(self):
        """Obtener fondos nacionales de Chile"""
        return [
            {
                "id": "CORFO-001",
                "nombre": "Programa de Innovación Agraria CORFO",
                "organizacion": "CORFO",
                "tipo": "Nacional",
                "pais": "Chile",
                "monto": "CLP 500,000,000",
                "fecha_cierre": "2025-03-31",
                "estado": "Abierto",
                "area": "Innovación",
                "descripcion": "Programa de apoyo a la innovación en el sector agrario chileno",
                "requisitos": "Empresas agrícolas, cooperativas, centros de investigación",
                "enlace": "https://www.corfo.cl/sites/cpp/innovacion/innovacion-agraria",
                "contacto": "innovacion@corfo.cl",
                "tipo_financiamiento": "Subsidio",
                "duracion": "24 meses",
                "beneficiarios": "Sector agrícola chileno",
                "prioridad": "Alta",
                "documentos": [
                    "Formulario de postulación",
                    "Plan de negocio",
                    "Presupuesto detallado"
                ]
            },
            {
                "id": "INDAP-002",
                "nombre": "Fondo de Desarrollo Rural INDAP",
                "organizacion": "INDAP",
                "tipo": "Nacional",
                "pais": "Chile",
                "monto": "CLP 200,000,000",
                "fecha_cierre": "2025-04-15",
                "estado": "Abierto",
                "area": "Desarrollo Rural",
                "descripcion": "Fondo para el desarrollo de proyectos rurales sostenibles",
                "requisitos": "Organizaciones rurales, cooperativas, pequeños productores",
                "enlace": "https://www.indap.gob.cl/desarrollo-rural",
                "contacto": "desarrollo@indap.gob.cl",
                "tipo_financiamiento": "Subsidio",
                "duracion": "18 meses",
                "beneficiarios": "Comunidades rurales",
                "prioridad": "Media",
                "documentos": [
                    "Proyecto técnico",
                    "Estudio de mercado",
                    "Plan de sostenibilidad"
                ]
            },
            {
                "id": "FIA-003",
                "nombre": "Programa de Innovación FIA",
                "organizacion": "FIA",
                "tipo": "Nacional",
                "pais": "Chile",
                "monto": "CLP 300,000,000",
                "fecha_cierre": "2025-05-30",
                "estado": "Abierto",
                "area": "Innovación",
                "descripcion": "Programa de innovación para el sector agroalimentario",
                "requisitos": "Empresas, centros de investigación, universidades",
                "enlace": "https://www.fia.cl/programas/innovacion",
                "contacto": "innovacion@fia.cl",
                "tipo_financiamiento": "Subsidio",
                "duracion": "36 meses",
                "beneficiarios": "Sector agroalimentario",
                "prioridad": "Alta",
                "documentos": [
                    "Propuesta técnica",
                    "Plan de trabajo",
                    "Presupuesto"
                ]
            }
        ]
    
    def obtener_fondos_internacionales(self):
        """Obtener fondos internacionales"""
        return [
            {
                "id": "BID-001",
                "nombre": "Programa de Desarrollo Rural BID",
                "organizacion": "Banco Interamericano de Desarrollo",
                "tipo": "Internacional",
                "pais": "Internacional",
                "monto": "USD 5,000,000",
                "fecha_cierre": "2025-06-30",
                "estado": "Abierto",
                "area": "Desarrollo Rural",
                "descripcion": "Programa de desarrollo rural sostenible en América Latina",
                "requisitos": "Gobiernos, ONGs, organizaciones internacionales",
                "enlace": "https://www.iadb.org/es/desarrollo-rural",
                "contacto": "rural@iadb.org",
                "tipo_financiamiento": "Préstamo",
                "duracion": "48 meses",
                "beneficiarios": "Países de América Latina",
                "prioridad": "Alta",
                "documentos": [
                    "Propuesta de proyecto",
                    "Estudio de factibilidad",
                    "Plan de implementación"
                ]
            },
            {
                "id": "FAO-002",
                "nombre": "Programa de Seguridad Alimentaria FAO",
                "organizacion": "FAO",
                "tipo": "Internacional",
                "pais": "Internacional",
                "monto": "USD 2,500,000",
                "fecha_cierre": "2025-04-30",
                "estado": "Abierto",
                "area": "Seguridad Alimentaria",
                "descripcion": "Programa para mejorar la seguridad alimentaria en la región",
                "requisitos": "Organizaciones gubernamentales, ONGs",
                "enlace": "https://www.fao.org/seguridad-alimentaria",
                "contacto": "seguridad@fao.org",
                "tipo_financiamiento": "Grant",
                "duracion": "24 meses",
                "beneficiarios": "Países de la región",
                "prioridad": "Media",
                "documentos": [
                    "Propuesta técnica",
                    "Presupuesto detallado",
                    "Cronograma"
                ]
            },
            {
                "id": "UE-003",
                "nombre": "Horizonte Europa - Agricultura",
                "organizacion": "Unión Europea",
                "tipo": "Internacional",
                "pais": "Internacional",
                "monto": "EUR 8,000,000",
                "fecha_cierre": "2025-03-15",
                "estado": "Abierto",
                "area": "Innovación",
                "descripcion": "Programa de investigación e innovación en agricultura",
                "requisitos": "Consorcios internacionales, universidades",
                "enlace": "https://ec.europa.eu/horizon-europe",
                "contacto": "research@ec.europa.eu",
                "tipo_financiamiento": "Grant",
                "duracion": "36 meses",
                "beneficiarios": "Consorcios internacionales",
                "prioridad": "Alta",
                "documentos": [
                    "Propuesta de investigación",
                    "Plan de trabajo",
                    "Presupuesto"
                ]
            }
        ]
    
    def actualizar_fondos_automaticamente(self):
        """Actualizar fondos desde fuentes automáticas"""
        logger.info("🔄 Iniciando actualización automática de fondos...")
        
        fondos_nuevos = []
        
        # Agregar fondos nacionales
        fondos_nuevos.extend(self.obtener_fondos_nacionales())
        
        # Agregar fondos internacionales
        fondos_nuevos.extend(self.obtener_fondos_internacionales())
        
        # Agregar fecha de actualización
        for fondo in fondos_nuevos:
            fondo['fecha_actualizacion'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            fondo['fuente'] = 'Actualización Automática'
        
        # Combinar con datos existentes
        fondos_existentes = {f['id']: f for f in self.fondos_data}
        
        for fondo in fondos_nuevos:
            if fondo['id'] not in fondos_existentes:
                self.fondos_data.append(fondo)
            else:
                # Actualizar datos existentes
                fondos_existentes[fondo['id']] = fondo
        
        # Guardar datos
        self.guardar_datos()
        
        logger.info(f"✅ {len(fondos_nuevos)} fondos actualizados")
        return len(fondos_nuevos)
    
    def obtener_fondos_abiertos(self):
        """Obtener fondos abiertos (prioritarios)"""
        hoy = datetime.now().date()
        fondos_abiertos = []
        
        for fondo in self.fondos_data:
            if fondo.get('estado') == 'Abierto':
                fecha_cierre = datetime.strptime(fondo.get('fecha_cierre', '2025-12-31'), '%Y-%m-%d').date()
                if fecha_cierre >= hoy:
                    fondos_abiertos.append(fondo)
        
        # Ordenar por prioridad y fecha de cierre
        fondos_abiertos.sort(key=lambda x: (
            x.get('prioridad', 'Media') == 'Alta',
            x.get('fecha_cierre', '2025-12-31')
        ))
        
        return fondos_abiertos
    
    def buscar_fondos(self, query="", tipo="", area="", estado="", prioridad=""):
        """Buscar fondos con filtros"""
        resultados = self.fondos_data.copy()
        
        if query:
            resultados = [f for f in resultados if 
                         query.lower() in f.get('nombre', '').lower() or
                         query.lower() in f.get('descripcion', '').lower() or
                         query.lower() in f.get('organizacion', '').lower()]
        
        if tipo:
            resultados = [f for f in resultados if f.get('tipo') == tipo]
        
        if area:
            resultados = [f for f in resultados if f.get('area') == area]
        
        if estado:
            resultados = [f for f in resultados if f.get('estado') == estado]
        
        if prioridad:
            resultados = [f for f in resultados if f.get('prioridad') == prioridad]
        
        return resultados
    
    def exportar_excel(self):
        """Exportar datos a Excel"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"fondos_iica_chile_{timestamp}.xlsx"
        filepath = os.path.join(EXPORT_FOLDER, filename)
        
        # Crear DataFrame con fondos
        df_fondos = pd.DataFrame(self.fondos_data)
        
        # Crear Excel con múltiples hojas
        with pd.ExcelWriter(filepath, engine='openpyxl') as writer:
            # Hoja 1: Todos los fondos
            df_fondos.to_excel(writer, sheet_name='Todos los Fondos', index=False)
            
            # Hoja 2: Fondos abiertos
            fondos_abiertos = self.obtener_fondos_abiertos()
            if fondos_abiertos:
                df_abiertos = pd.DataFrame(fondos_abiertos)
                df_abiertos.to_excel(writer, sheet_name='Fondos Abiertos', index=False)
            
            # Hoja 3: Fondos nacionales
            fondos_nacionales = [f for f in self.fondos_data if f.get('tipo') == 'Nacional']
            if fondos_nacionales:
                df_nacionales = pd.DataFrame(fondos_nacionales)
                df_nacionales.to_excel(writer, sheet_name='Fondos Nacionales', index=False)
            
            # Hoja 4: Fondos internacionales
            fondos_internacionales = [f for f in self.fondos_data if f.get('tipo') == 'Internacional']
            if fondos_internacionales:
                df_internacionales = pd.DataFrame(fondos_internacionales)
                df_internacionales.to_excel(writer, sheet_name='Fondos Internacionales', index=False)
        
        return filepath, filename
    
    def obtener_recordatorios(self):
        """Obtener recordatorios de plazos próximos"""
        hoy = datetime.now().date()
        recordatorios = []
        
        for fondo in self.fondos_data:
            if fondo.get('estado') == 'Abierto':
                try:
                    fecha_cierre = datetime.strptime(fondo.get('fecha_cierre', ''), '%Y-%m-%d').date()
                    dias_restantes = (fecha_cierre - hoy).days
                    
                    if 0 <= dias_restantes <= self.config.get('recordatorios_dias', 30):
                        recordatorios.append({
                            'fondo': fondo,
                            'dias_restantes': dias_restantes,
                            'urgente': dias_restantes <= 7
                        })
                except:
                    continue
        
        return sorted(recordatorios, key=lambda x: x['dias_restantes'])

# Inicializar plataforma
platform = IICAChilePlatform()

# Context processor para datos globales
@app.context_processor
def inject_global_data():
    return dict(
        flash_messages=get_flashed_messages(),
        config=platform.config,
        fondos_abiertos=platform.obtener_fondos_abiertos(),
        recordatorios=platform.obtener_recordatorios()
    )

# Rutas principales
@app.route('/')
def index():
    """Página principal con fondos abiertos prioritarios"""
    fondos_abiertos = platform.obtener_fondos_abiertos()
    recordatorios = platform.obtener_recordatorios()
    
    return render_template('index.html', 
                         fondos_abiertos=fondos_abiertos[:6],  # Mostrar solo los 6 más importantes
                         recordatorios=recordatorios[:3])  # Mostrar solo los 3 más urgentes

@app.route('/fondos')
def fondos():
    """Página de todos los fondos disponibles"""
    query = request.args.get('q', '')
    tipo = request.args.get('tipo', '')
    area = request.args.get('area', '')
    estado = request.args.get('estado', '')
    prioridad = request.args.get('prioridad', '')
    
    fondos_filtrados = platform.buscar_fondos(query, tipo, area, estado, prioridad)
    
    return render_template('fondos.html', 
                         fondos=fondos_filtrados,
                         query=query,
                         tipo=tipo,
                         area=area,
                         estado=estado,
                         prioridad=prioridad)

@app.route('/fondo/<fondo_id>')
def detalle_fondo(fondo_id):
    """Detalle de un fondo específico"""
    fondo = next((f for f in platform.fondos_data if f['id'] == fondo_id), None)
    
    if not fondo:
        flash('Fondo no encontrado', 'error')
        return redirect(url_for('fondos'))
    
    return render_template('detalle_fondo.html', fondo=fondo)

@app.route('/postular/<fondo_id>')
def postular(fondo_id):
    """Formulario de postulación"""
    fondo = next((f for f in platform.fondos_data if f['id'] == fondo_id), None)
    
    if not fondo:
        flash('Fondo no encontrado', 'error')
        return redirect(url_for('fondos'))
    
    return render_template('postular.html', fondo=fondo)

@app.route('/exportar')
def exportar():
    """Exportar datos a Excel"""
    try:
        filepath, filename = platform.exportar_excel()
        return send_file(filepath, as_attachment=True, download_name=filename)
    except Exception as e:
        flash(f'Error al exportar: {str(e)}', 'error')
        return redirect(url_for('fondos'))

@app.route('/actualizar', methods=['POST'])
def actualizar_fondos():
    """Actualizar fondos manualmente"""
    try:
        fondos_actualizados = platform.actualizar_fondos_automaticamente()
        flash(f'✅ {fondos_actualizados} fondos actualizados correctamente', 'success')
    except Exception as e:
        flash(f'❌ Error actualizando fondos: {str(e)}', 'error')
    
    return redirect(url_for('fondos'))

# APIs
@app.route('/api/fondos')
def api_fondos():
    """API para obtener fondos"""
    query = request.args.get('q', '')
    tipo = request.args.get('tipo', '')
    area = request.args.get('area', '')
    estado = request.args.get('estado', '')
    prioridad = request.args.get('prioridad', '')
    
    fondos_filtrados = platform.buscar_fondos(query, tipo, area, estado, prioridad)
    
    return jsonify({
        'total': len(fondos_filtrados),
        'fondos': fondos_filtrados
    })

@app.route('/api/estadisticas')
def api_estadisticas():
    """API para estadísticas"""
    fondos_abiertos = len([f for f in platform.fondos_data if f.get('estado') == 'Abierto'])
    fondos_nacionales = len([f for f in platform.fondos_data if f.get('tipo') == 'Nacional'])
    fondos_internacionales = len([f for f in platform.fondos_data if f.get('tipo') == 'Internacional'])
    recordatorios = len(platform.obtener_recordatorios())
    
    return jsonify({
        'fondos_abiertos': fondos_abiertos,
        'fondos_nacionales': fondos_nacionales,
        'fondos_internacionales': fondos_internacionales,
        'recordatorios': recordatorios,
        'total_fondos': len(platform.fondos_data)
    })

# Función para actualización automática
def actualizacion_automatica():
    """Función para actualización automática en segundo plano"""
    while True:
        try:
            platform.actualizar_fondos_automaticamente()
            logger.info("✅ Actualización automática completada")
        except Exception as e:
            logger.error(f"❌ Error en actualización automática: {e}")
        
        # Esperar 6 horas antes de la próxima actualización
        time.sleep(6 * 60 * 60)

if __name__ == '__main__':
    # Iniciar actualización automática en segundo plano
    thread_actualizacion = threading.Thread(target=actualizacion_automatica, daemon=True)
    thread_actualizacion.start()
    
    # Actualizar fondos al iniciar
    platform.actualizar_fondos_automaticamente()
    
    print("🚀 Iniciando Plataforma IICA Chile...")
    print("✅ Sistema de financiamiento cargado")
    print("🌐 Accede a: http://127.0.0.1:5002")
    
    app.run(debug=True, host='0.0.0.0', port=5002)
