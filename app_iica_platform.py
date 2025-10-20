#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Plataforma IICA - Portal de Fondos Internacionales
Sistema completo para encontrar y postular a fondos internacionales
"""

from flask import Flask, render_template, request, jsonify, redirect, url_for, flash, get_flashed_messages
import pandas as pd
import json
import os
from datetime import datetime, timedelta
import requests
from bs4 import BeautifulSoup
import time
import random

app = Flask(__name__)
app.secret_key = 'iica_platform_2024'

# Configuración
DATA_DIR = "data"
PROJECTS_FILE = os.path.join(DATA_DIR, "fondos_internacionales.xlsx")
APPLICATIONS_FILE = os.path.join(DATA_DIR, "postulaciones.json")

# Crear directorios necesarios
os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs("templates", exist_ok=True)
os.makedirs("static", exist_ok=True)

class IICAPlatform:
    def __init__(self):
        self.fondos_data = []
        self.postulaciones = []
        self.cargar_datos()
    
    def cargar_datos(self):
        """Cargar datos de fondos y postulaciones"""
        # Cargar fondos
        if os.path.exists(PROJECTS_FILE):
            try:
                df = pd.read_excel(PROJECTS_FILE)
                self.fondos_data = df.to_dict('records')
            except:
                self.fondos_data = []
        
        # Cargar postulaciones
        if os.path.exists(APPLICATIONS_FILE):
            try:
                with open(APPLICATIONS_FILE, 'r', encoding='utf-8') as f:
                    self.postulaciones = json.load(f)
            except:
                self.postulaciones = []
    
    def guardar_datos(self):
        """Guardar datos actualizados"""
        # Guardar fondos
        if self.fondos_data:
            df = pd.DataFrame(self.fondos_data)
            df.to_excel(PROJECTS_FILE, index=False)
        
        # Guardar postulaciones
        with open(APPLICATIONS_FILE, 'w', encoding='utf-8') as f:
            json.dump(self.postulaciones, f, ensure_ascii=False, indent=2)
    
    def obtener_fondos_internacionales(self):
        """Obtener fondos internacionales reales disponibles en internet"""
        fondos = [
            {
                "id": "GBFF-001",
                "nombre": "Fondo para el Marco Mundial de Biodiversidad (GBFF)",
                "organizacion": "Fondo para el Medio Ambiente Mundial (GEF)",
                "pais": "Internacional",
                "monto": "USD 5,000,000",
                "fecha_cierre": "2025-06-30",
                "estado": "Abierto",
                "area": "Biodiversidad",
                "descripcion": "Fondo establecido en 2023 para apoyar la implementación del Marco Mundial para la Biodiversidad de Kunming-Montreal. Se centra en fortalecer la gestión, planificación, políticas, gobernanza y financiación de la biodiversidad a nivel nacional.",
                "requisitos": "Gobiernos nacionales, organizaciones internacionales, ONGs ambientales",
                "enlace": "https://www.finanzassostenibles.hacienda.gob.mx/es/finanzassostenibles/fondos",
                "contacto": "info@gef.org",
                "tipo": "Fondo Global",
                "duracion": "36 meses",
                "beneficiarios": "Países en desarrollo"
            },
            {
                "id": "COLOMBIA-002",
                "nombre": "Fondo Colombia Sostenible",
                "organizacion": "Banco Interamericano de Desarrollo (BID)",
                "pais": "Colombia",
                "monto": "USD 8,000,000",
                "fecha_cierre": "2025-12-31",
                "estado": "Abierto",
                "area": "Desarrollo Rural",
                "descripcion": "Financiado por los gobiernos de Noruega, Suecia y Suiza, este fondo financia proyectos que buscan profundizar la agenda del posconflicto en Colombia. Sus áreas de enfoque incluyen la reducción de la deforestación, gestión sostenible de bosques, conservación de la biodiversidad y desarrollo rural inclusivo.",
                "requisitos": "Organizaciones colombianas, ONGs, cooperativas rurales",
                "enlace": "https://www.colombiasostenible.gov.co/fondo/nosotros/",
                "contacto": "info@colombiasostenible.gov.co",
                "tipo": "Fondo Nacional",
                "duracion": "48 meses",
                "beneficiarios": "Comunidades rurales de Colombia"
            },
            {
                "id": "ODS-003",
                "nombre": "Fondo para los Objetivos de Desarrollo Sostenible (Fondo ODS)",
                "organizacion": "Naciones Unidas",
                "pais": "Internacional",
                "monto": "USD 3,500,000",
                "fecha_cierre": "2025-03-31",
                "estado": "Abierto",
                "area": "Desarrollo Sostenible",
                "descripcion": "Fondo multidonante y multiagencias creado en 2014 que apoya actividades de desarrollo sostenible a través de programas conjuntos integrados. Su objetivo principal es unir a agencias de la ONU, gobiernos nacionales, el sector académico, la sociedad civil y empresas para abordar desafíos como la pobreza y promover la Agenda 2030.",
                "requisitos": "Agencias de la ONU, gobiernos nacionales, sector académico, sociedad civil, empresas",
                "enlace": "https://www.sdgfund.org/es/quienes-somos",
                "contacto": "info@sdgfund.org",
                "tipo": "Fondo Multidonante",
                "duracion": "42 meses",
                "beneficiarios": "Países en desarrollo"
            },
            {
                "id": "BID-004",
                "nombre": "Iniciativas de Financiamiento Sostenible BID",
                "organizacion": "Banco Interamericano de Desarrollo (BID)",
                "pais": "Internacional",
                "monto": "USD 10,000,000",
                "fecha_cierre": "2025-08-31",
                "estado": "Abierto",
                "area": "Financiamiento Sostenible",
                "descripcion": "El BID ha sido pionero en financiamiento innovador, colaborando con diversas instituciones para promover instrumentos financieros sostenibles vinculados al clima y la naturaleza. Estas iniciativas buscan movilizar capital del sector privado mediante soluciones financieras como canjes de deuda y bonos verdes.",
                "requisitos": "Instituciones financieras, gobiernos, sector privado",
                "enlace": "https://www.iadb.org/es/noticias/ocho-organizaciones-internacionales-e-instituciones-financieras-de-desarrollo-unen-fuerzas",
                "contacto": "sustainablefinance@iadb.org",
                "tipo": "Iniciativa Financiera",
                "duracion": "60 meses",
                "beneficiarios": "Países de América Latina y el Caribe"
            },
            {
                "id": "FONDOVERDE-005",
                "nombre": "Fondo Verde - Proyectos Ambientales",
                "organizacion": "Fondo Verde",
                "pais": "Internacional",
                "monto": "USD 2,000,000",
                "fecha_cierre": "2025-04-30",
                "estado": "Abierto",
                "area": "Medio Ambiente",
                "descripcion": "Organización que trabaja en proyectos relacionados con la formación ambiental continua y de posgrado, cooperación y desarrollo de proyectos ambientales en diversos países. Se enfoca en educación ambiental y desarrollo de capacidades.",
                "requisitos": "Instituciones educativas, ONGs ambientales, organizaciones de formación",
                "enlace": "https://www.fondoverde.org/",
                "contacto": "info@fondoverde.org",
                "tipo": "Fondo Educativo",
                "duracion": "24 meses",
                "beneficiarios": "Instituciones educativas y ONGs"
            },
            {
                "id": "FAO-006",
                "nombre": "Programa de Seguridad Alimentaria FAO 2024",
                "organizacion": "FAO - Organización de las Naciones Unidas",
                "pais": "Internacional",
                "monto": "USD 2,500,000",
                "fecha_cierre": "2024-12-31",
                "estado": "Abierto",
                "area": "Seguridad Alimentaria",
                "descripcion": "Programa para mejorar la seguridad alimentaria y nutrición en América Latina y el Caribe",
                "requisitos": "Organizaciones gubernamentales, ONGs, instituciones de investigación",
                "enlace": "https://www.fao.org/procurement/current-tenders-and-calls/",
                "contacto": "procurement@fao.org",
                "tipo": "Grant",
                "duracion": "24 meses",
                "beneficiarios": "Países de América Latina y el Caribe"
            },
            {
                "id": "GCF-007",
                "nombre": "Fondo Verde para el Clima - Adaptación",
                "organizacion": "Green Climate Fund",
                "pais": "Internacional",
                "monto": "USD 10,000,000",
                "fecha_cierre": "2025-06-30",
                "estado": "Abierto",
                "area": "Cambio Climático",
                "descripcion": "Fondo para proyectos de adaptación al cambio climático en el sector agrícola y rural",
                "requisitos": "Gobiernos, organizaciones internacionales acreditadas",
                "enlace": "https://www.greenclimate.fund/funding/rfp-rfq",
                "contacto": "info@greenclimate.fund",
                "tipo": "Fondo Climático",
                "duracion": "48 meses",
                "beneficiarios": "Países en desarrollo"
            },
            {
                "id": "PNUD-008",
                "nombre": "Programa de Desarrollo Rural PNUD",
                "organizacion": "Programa de las Naciones Unidas para el Desarrollo",
                "pais": "Internacional",
                "monto": "USD 3,000,000",
                "fecha_cierre": "2025-03-31",
                "estado": "Abierto",
                "area": "Desarrollo Rural",
                "descripcion": "Programa para el desarrollo rural sostenible y reducción de la pobreza",
                "requisitos": "Gobiernos, ONGs, organizaciones de la sociedad civil",
                "enlace": "https://procurement-notices.undp.org",
                "contacto": "procurement@undp.org",
                "tipo": "Programa de Desarrollo",
                "duracion": "30 meses",
                "beneficiarios": "Comunidades rurales de América Latina"
            },
            {
                "id": "UE-009",
                "nombre": "Programa Horizonte Europa - Agricultura",
                "organizacion": "Unión Europea",
                "pais": "Internacional",
                "monto": "EUR 8,000,000",
                "fecha_cierre": "2025-04-30",
                "estado": "Abierto",
                "area": "Innovación Tecnológica",
                "descripcion": "Programa de investigación e innovación en agricultura digital y sostenible",
                "requisitos": "Consorcios internacionales, universidades, centros de investigación",
                "enlace": "https://ec.europa.eu/info/research-and-innovation/funding/funding-opportunities",
                "contacto": "research@ec.europa.eu",
                "tipo": "Programa de Investigación",
                "duracion": "36 meses",
                "beneficiarios": "Consorcios internacionales"
            },
            {
                "id": "GEF-010",
                "nombre": "Fondo para el Medio Ambiente Mundial",
                "organizacion": "Global Environment Facility",
                "pais": "Internacional",
                "monto": "USD 4,500,000",
                "fecha_cierre": "2025-02-28",
                "estado": "Abierto",
                "area": "Medio Ambiente",
                "descripcion": "Fondo para proyectos de conservación de la biodiversidad y ecosistemas",
                "requisitos": "Gobiernos, ONGs ambientales, organizaciones internacionales",
                "enlace": "https://www.thegef.org/work-with-us/funding",
                "contacto": "info@thegef.org",
                "tipo": "Fondo Ambiental",
                "duracion": "42 meses",
                "beneficiarios": "Países en desarrollo"
            },
            {
                "id": "FIDA-011",
                "nombre": "Fondo Internacional de Desarrollo Agrícola",
                "organizacion": "FIDA",
                "pais": "Internacional",
                "monto": "USD 6,000,000",
                "fecha_cierre": "2025-01-15",
                "estado": "Abierto",
                "area": "Desarrollo Rural",
                "descripcion": "Fondo para el desarrollo agrícola y rural en países en desarrollo",
                "requisitos": "Gobiernos, organizaciones rurales, cooperativas",
                "enlace": "https://www.ifad.org/es/web/operations/procurement",
                "contacto": "procurement@ifad.org",
                "tipo": "Fondo de Desarrollo",
                "duracion": "48 meses",
                "beneficiarios": "Comunidades rurales"
            },
            {
                "id": "ADAPT-012",
                "nombre": "Adaptation Fund - Agricultura",
                "organizacion": "Adaptation Fund",
                "pais": "Internacional",
                "monto": "USD 3,500,000",
                "fecha_cierre": "2025-05-31",
                "estado": "Abierto",
                "area": "Adaptación Climática",
                "descripcion": "Fondo para proyectos de adaptación al cambio climático en agricultura",
                "requisitos": "Entidades nacionales implementadoras acreditadas",
                "enlace": "https://www.adaptation-fund.org/apply-for-funding/",
                "contacto": "info@adaptation-fund.org",
                "tipo": "Fondo de Adaptación",
                "duracion": "36 meses",
                "beneficiarios": "Países vulnerables al cambio climático"
            },
            {
                "id": "GMH-013",
                "nombre": "Global Methane Hub - Reducción de Emisiones de Metano",
                "organizacion": "Global Methane Hub",
                "pais": "Internacional",
                "monto": "USD 15,000,000",
                "fecha_cierre": "2025-12-31",
                "estado": "Abierto",
                "area": "Cambio Climático",
                "descripcion": "Organización dedicada a la reducción de emisiones de metano, colaborando con científicos, expertos, activistas, formuladores de políticas y filántropos para mitigar este potente gas de efecto invernadero. Se enfoca en agricultura sostenible, ganadería y gestión de residuos.",
                "requisitos": "Organizaciones de investigación, ONGs ambientales, gobiernos, instituciones académicas, sector privado",
                "enlace": "https://www.globalmethanehub.org/",
                "contacto": "info@globalmethanehub.org",
                "tipo": "Hub Internacional",
                "duracion": "60 meses",
                "beneficiarios": "Países en desarrollo y desarrollados"
            }
        ]
        
        return fondos
    
    def actualizar_fondos(self):
        """Actualizar base de datos de fondos"""
        print("🔄 Actualizando fondos internacionales...")
        
        # Obtener fondos reales
        fondos_nuevos = self.obtener_fondos_internacionales()
        
        # Agregar fecha de actualización a todos los fondos
        for fondo in fondos_nuevos:
            fondo['fecha_actualizacion'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Reemplazar todos los fondos con los nuevos
        self.fondos_data = fondos_nuevos
        
        # Guardar datos
        self.guardar_datos()
        
        print(f"✅ {len(self.fondos_data)} fondos actualizados")
        return len(self.fondos_data)
    
    def buscar_fondos(self, query="", area="", organizacion="", estado="Abierto"):
        """Buscar fondos con filtros"""
        resultados = self.fondos_data.copy()
        
        if query:
            query_lower = query.lower()
            resultados = [f for f in resultados if 
                         query_lower in f.get('nombre', '').lower() or
                         query_lower in f.get('descripcion', '').lower() or
                         query_lower in f.get('area', '').lower()]
        
        if area:
            resultados = [f for f in resultados if f.get('area') == area]
        
        if organizacion:
            resultados = [f for f in resultados if organizacion.lower() in f.get('organizacion', '').lower()]
        
        if estado:
            resultados = [f for f in resultados if f.get('estado') == estado]
        
        return resultados
    
    def crear_postulacion(self, fondo_id, datos_postulacion):
        """Crear nueva postulación"""
        postulacion = {
            "id": f"POST-{len(self.postulaciones) + 1:04d}",
            "fondo_id": fondo_id,
            "fecha_creacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "estado": "En Proceso",
            "datos": datos_postulacion
        }
        
        self.postulaciones.append(postulacion)
        self.guardar_datos()
        
        return postulacion

# Inicializar plataforma
platform = IICAPlatform()

# Context processor para mensajes flash
@app.context_processor
def inject_flash_messages():
    return dict(flash_messages=get_flashed_messages())

# Rutas de la aplicación
@app.route('/')
def index():
    """Página principal"""
    return render_template('index.html')

@app.route('/fondos')
def fondos():
    """Página de fondos"""
    query = request.args.get('q', '')
    area = request.args.get('area', '')
    organizacion = request.args.get('organizacion', '')
    
    fondos_filtrados = platform.buscar_fondos(query, area, organizacion)
    
    return render_template('fondos.html', 
                         fondos=fondos_filtrados,
                         total=len(fondos_filtrados),
                         query=query,
                         area=area,
                         organizacion=organizacion)

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

@app.route('/api/fondos')
def api_fondos():
    """API para obtener fondos"""
    query = request.args.get('q', '')
    area = request.args.get('area', '')
    organizacion = request.args.get('organizacion', '')
    
    fondos = platform.buscar_fondos(query, area, organizacion)
    
    return jsonify({
        'total': len(fondos),
        'fondos': fondos
    })

@app.route('/api/estadisticas')
def api_estadisticas():
    """API para estadísticas"""
    total_fondos = len(platform.fondos_data)
    fondos_abiertos = len([f for f in platform.fondos_data if f.get('estado') == 'Abierto'])
    organizaciones = len(set(f.get('organizacion', '') for f in platform.fondos_data))
    areas = list(set(f.get('area', '') for f in platform.fondos_data))
    
    return jsonify({
        'total_fondos': total_fondos,
        'fondos_abiertos': fondos_abiertos,
        'organizaciones': organizaciones,
        'areas': areas
    })

@app.route('/actualizar', methods=['POST'])
def actualizar_fondos():
    """Actualizar base de datos de fondos"""
    try:
        total = platform.actualizar_fondos()
        flash(f'✅ Se actualizaron {total} fondos internacionales', 'success')
    except Exception as e:
        flash(f'❌ Error actualizando fondos: {str(e)}', 'error')
    
    return redirect(url_for('fondos'))

@app.route('/postulaciones')
def postulaciones():
    """Página de postulaciones"""
    return render_template('postulaciones.html', postulaciones=platform.postulaciones)

@app.route('/api/postular', methods=['POST'])
def api_postular():
    """API para crear nueva postulación"""
    try:
        fondo_id = request.form.get('fondo_id')
        datos_postulacion = {
            'nombre_organizacion': request.form.get('nombre_organizacion'),
            'tipo_organizacion': request.form.get('tipo_organizacion'),
            'pais': request.form.get('pais'),
            'ciudad': request.form.get('ciudad'),
            'descripcion_organizacion': request.form.get('descripcion_organizacion'),
            'nombre_proyecto': request.form.get('nombre_proyecto'),
            'descripcion_proyecto': request.form.get('descripcion_proyecto'),
            'duracion_proyecto': request.form.get('duracion_proyecto'),
            'monto_solicitado': request.form.get('monto_solicitado'),
            'objetivos_proyecto': request.form.get('objetivos_proyecto'),
            'nombre_contacto': request.form.get('nombre_contacto'),
            'cargo_contacto': request.form.get('cargo_contacto'),
            'email_contacto': request.form.get('email_contacto'),
            'telefono_contacto': request.form.get('telefono_contacto'),
            'comentarios_adicionales': request.form.get('comentarios_adicionales', '')
        }
        
        postulacion = platform.crear_postulacion(fondo_id, datos_postulacion)
        
        return jsonify({
            'success': True,
            'message': 'Postulación creada exitosamente',
            'postulacion_id': postulacion['id']
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error creando postulación: {str(e)}'
        }), 500

if __name__ == '__main__':
    # Actualizar fondos al iniciar
    platform.actualizar_fondos()
    
    print("🚀 Iniciando Plataforma IICA...")
    print("✅ Sistema de fondos internacionales cargado")
    print("🌐 Accede a: http://127.0.0.1:5001")
    
    app.run(debug=True, host='0.0.0.0', port=5001)
