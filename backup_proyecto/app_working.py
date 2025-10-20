from flask import Flask, render_template, redirect, url_for, request, send_file, Response, jsonify, make_response
import json
import os
import pandas as pd
import time
import uuid
from datetime import datetime
from utils import parsear_monto

app = Flask(__name__)
DATA_PATH = "data/proyectos.xlsx"

# Crear directorio de datos si no existe
os.makedirs("data", exist_ok=True)

def guardar_excel(proyectos):
    """Guarda los proyectos en un archivo Excel"""
    if not proyectos:
        return
    
    df = pd.DataFrame(proyectos)
    df.to_excel(DATA_PATH, index=False)
    print(f"💾 Guardados {len(proyectos)} proyectos en Excel")

def cargar_excel():
    """Carga los proyectos desde el archivo Excel"""
    if os.path.exists(DATA_PATH):
        try:
            df = pd.read_excel(DATA_PATH)
            proyectos = df.to_dict('records')
            print(f"📂 Cargados {len(proyectos)} proyectos desde Excel")
            return proyectos
        except Exception as e:
            print(f"❌ Error cargando Excel: {e}")
            return []
    return []

def recolectar_todos():
    """Recolecta proyectos de fuentes básicas"""
    print("🔄 Iniciando recolección de proyectos...")
    proyectos = []
    
    # Proyectos de ejemplo para demostración
    proyectos_ejemplo = [
        {
            "Nombre": "Desarrollo Agrícola Sostenible",
            "Descripción": "Proyecto para mejorar la productividad agrícola con técnicas sostenibles",
            "Monto": "USD 50,000",
            "Área de interés": "Agricultura",
            "Estado": "Abierto",
            "Fecha cierre": "2024-12-31",
            "Fuente": "IICA Chile"
        },
        {
            "Nombre": "Innovación Tecnológica Rural",
            "Descripción": "Implementación de tecnología en zonas rurales",
            "Monto": "USD 75,000",
            "Área de interés": "Tecnología",
            "Estado": "Abierto",
            "Fecha cierre": "2024-11-30",
            "Fuente": "FIA"
        },
        {
            "Nombre": "Conservación de Recursos Hídricos",
            "Descripción": "Proyecto de conservación y gestión del agua",
            "Monto": "USD 100,000",
            "Área de interés": "Medio Ambiente",
            "Estado": "Abierto",
            "Fecha cierre": "2025-01-15",
            "Fuente": "CNR"
        },
        {
            "Nombre": "Desarrollo Rural Integral",
            "Descripción": "Programa integral de desarrollo rural",
            "Monto": "USD 200,000",
            "Área de interés": "Desarrollo Rural",
            "Estado": "Abierto",
            "Fecha cierre": "2024-10-30",
            "Fuente": "INDAP"
        },
        {
            "Nombre": "Capacitación Agrícola",
            "Descripción": "Programa de capacitación para agricultores",
            "Monto": "USD 30,000",
            "Área de interés": "Educación",
            "Estado": "Cerrado",
            "Fecha cierre": "2024-09-15",
            "Fuente": "Fondos.gob.cl"
        }
    ]
    
    proyectos.extend(proyectos_ejemplo)
    print(f"🎉 Recolección completada: {len(proyectos)} proyectos totales")
    return proyectos

def parse_fecha_sort(fecha_str):
    """Convierte fecha a formato YYYY-MM-DD para ordenamiento"""
    if not fecha_str or fecha_str == 'N/A':
        return '9999-12-31'  # Fechas vacías al final
    
    try:
        # Intentar diferentes formatos
        for fmt in ['%Y-%m-%d', '%d/%m/%Y', '%m/%d/%Y', '%d-%m-%Y']:
            try:
                return datetime.strptime(fecha_str, fmt).strftime('%Y-%m-%d')
            except ValueError:
                continue
        return '9999-12-31'
    except:
        return '9999-12-31'

@app.route('/', methods=['GET'])
def home():
    # Generar o obtener session ID
    session_id = request.cookies.get('session_id')
    if not session_id:
        session_id = str(uuid.uuid4())
    
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
    ordenar_por = request.args.get('ordenar_por', 'fecha')
    orden = request.args.get('orden', 'asc')
    
    # Filtrar proyectos
    proyectos_filtrados = []
    for p in proyectos:
        # Filtro por búsqueda
        if query:
            if query.lower() not in p.get('Nombre', '').lower() and query.lower() not in p.get('Descripción', '').lower():
                continue
        
        # Filtro por área
        if area and p.get('Área de interés', '') != area:
            continue
        
        # Filtro por estado
        if estado and p.get('Estado', '') != estado:
            continue
        
        proyectos_filtrados.append(p)
    
    # Ordenar proyectos
    if ordenar_por == 'fecha':
        proyectos_filtrados.sort(key=lambda x: parse_fecha_sort(x.get('Fecha cierre', '')), reverse=(orden == 'desc'))
    elif ordenar_por == 'monto':
        proyectos_filtrados.sort(key=lambda x: parsear_monto(x.get('Monto', '0')), reverse=(orden == 'desc'))
    elif ordenar_por == 'nombre':
        proyectos_filtrados.sort(key=lambda x: x.get('Nombre', '').lower(), reverse=(orden == 'desc'))
    elif ordenar_por == 'fuente':
        proyectos_filtrados.sort(key=lambda x: x.get('Fuente', '').lower(), reverse=(orden == 'desc'))
    
    # Paginación
    page = int(request.args.get('page', 1))
    per_page = 5
    total_proyectos = len(proyectos_filtrados)
    total_pages = (total_proyectos + per_page - 1) // per_page
    
    start_idx = (page - 1) * per_page
    end_idx = start_idx + per_page
    proyectos_paginados = proyectos_filtrados[start_idx:end_idx]
    
    # Estadísticas básicas
    total = len(proyectos)
    por_area = {}
    por_estado = {}
    por_moneda = {}
    total_monto = {}
    
    for p in proyectos:
        por_area[p.get("Área de interés", "General")] = por_area.get(p.get("Área de interés", "General"), 0) + 1
        por_estado[p.get("Estado", "N/D")] = por_estado.get(p.get("Estado", "N/D"), 0) + 1
        
        # Acumular montos por moneda
        monto_val = str(p.get("Monto", "0"))
        parts = monto_val.split()
        if len(parts) == 2 and parts[0].isalpha():
            moneda = parts[0]
            try:
                numero = float(parts[1].replace(',', '').replace('.', ''))
            except:
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
    
    # Información de contacto IICA
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
    
    # Datos para el template
    adjudicados = []
    documentos = []
    postulaciones = []
    instituciones = []
    
    response = make_response(render_template('home_simple.html',
                         proyectos=proyectos_paginados, 
                         stats=stats, 
                         adjudicados=adjudicados, 
                         documentos=documentos, 
                         postulaciones=postulaciones, 
                         instituciones=instituciones, 
                         info=info,
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

@app.route('/buscar', methods=['POST'])
def buscar():
    proyectos = recolectar_todos()
    guardar_excel(proyectos)
    return redirect(url_for('home'))

@app.route('/quienes-somos', methods=['GET'])
def quienes_somos():
    return render_template('quienes_somos.html')

@app.route('/adjudicados', methods=['GET'])
def adjudicados():
    return render_template('adjudicados.html')

@app.route('/proyecto/<int:proyecto_id>', methods=['GET'])
def ver_proyecto(proyecto_id):
    """Muestra el detalle de un proyecto específico"""
    proyectos = cargar_excel()
    if not proyectos:
        proyectos = recolectar_todos()
    
    # Obtener el proyecto por ID (ajustar índice)
    if 1 <= proyecto_id <= len(proyectos):
        proyecto = proyectos[proyecto_id - 1]
        return render_template('proyecto_detalle.html', proyecto=proyecto)
    else:
        # Si no se encuentra el proyecto, redirigir al inicio
        return redirect(url_for('home'))

if __name__ == '__main__':
    print("🚀 Iniciando Plataforma IICA Chile...")
    print("✅ Sistema básico inicializado")
    print("✅ Funcionalidades principales disponibles")
    print("🎉 Plataforma lista para usar")
    app.run(debug=True, host='0.0.0.0', port=5000)
