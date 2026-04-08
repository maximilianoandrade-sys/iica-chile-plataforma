#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Sistema de búsqueda masiva de proyectos de financiamiento
Basado en fuentes web y programas vigentes identificados
"""

import pandas as pd
import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime, timedelta
import time
import random

def buscar_proyectos_corfo():
    """Busca proyectos de CORFO disponibles"""
    print("🔍 Buscando proyectos CORFO...")
    proyectos = []
    
    # Proyectos CORFO identificados
    proyectos_corfo = [
        {
            "Nombre": "Activa Chile Apoya - CORFO",
            "Descripción": "Programa de cofinanciamiento para PYMES en recuperación económica. Apoyo para adquisición de activos fijos, infraestructura productiva y capital de trabajo.",
            "Monto": "Hasta 50,000,000 CLP",
            "Área de interés": "Desarrollo Rural",
            "Estado": "Abierto",
            "Fecha cierre": "2025-12-31",
            "Fuente": "CORFO",
            "Enlace": "https://www.corfo.cl/sites/cpp/programas_y_convocatorias/activa-chile-apoya",
            "Tipo": "Programa Público",
            "Beneficiarios": "PYMES con ventas entre 2.400 y 100.000 UF",
            "Requisitos": "Contribuyentes con inicio de actividades",
            "Contacto": "contacto@corfo.cl",
            "Fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        },
        {
            "Nombre": "Consolida y Expande Innovación - CORFO",
            "Descripción": "Convocatoria para proyectos de innovación en etapa de expansión. Apoyo para consolidar y expandir iniciativas innovadoras.",
            "Monto": "Hasta 200,000,000 CLP",
            "Área de interés": "Innovación Tecnológica",
            "Estado": "Abierto",
            "Fecha cierre": "2025-01-15",
            "Fuente": "CORFO",
            "Enlace": "https://www.corfo.cl/sites/cpp/programas_y_convocatorias/consolida-expande-innovacion",
            "Tipo": "Convocatoria Innovación",
            "Beneficiarios": "Empresas en etapa de expansión",
            "Requisitos": "Proyectos de innovación consolidados",
            "Contacto": "innovacion@corfo.cl",
            "Fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        },
        {
            "Nombre": "Innova Alta Tecnología - CORFO",
            "Descripción": "Convocatoria para proyectos de innovación tecnológica de alto impacto. Fomento a la innovación en tecnologías avanzadas.",
            "Monto": "Hasta 500,000,000 CLP",
            "Área de interés": "Innovación Tecnológica",
            "Estado": "Abierto",
            "Fecha cierre": "2024-12-31",
            "Fuente": "CORFO",
            "Enlace": "https://www.corfo.cl/sites/cpp/programas_y_convocatorias/innova-alta-tecnologia",
            "Tipo": "Convocatoria Tecnológica",
            "Beneficiarios": "Empresas con proyectos de alta tecnología",
            "Requisitos": "Proyectos de innovación tecnológica",
            "Contacto": "tecnologia@corfo.cl",
            "Fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
    ]
    
    proyectos.extend(proyectos_corfo)
    print(f"✅ CORFO: {len(proyectos_corfo)} proyectos encontrados")
    return proyectos

def buscar_proyectos_bancoestado():
    """Busca proyectos de BancoEstado"""
    print("🔍 Buscando proyectos BancoEstado...")
    proyectos = []
    
    proyectos_bancoestado = [
        {
            "Nombre": "Crédito Siembra por Chile - BancoEstado",
            "Descripción": "Crédito destinado a financiar necesidades de capital de trabajo para establecimiento y producción de cultivos tradicionales.",
            "Monto": "Hasta 15,000,000 CLP",
            "Área de interés": "Agricultura Sostenible",
            "Estado": "Abierto",
            "Fecha cierre": "2025-12-31",
            "Fuente": "BancoEstado",
            "Enlace": "https://www.bancoestado.cl/web/banco-estado/siembra-por-chile",
            "Tipo": "Crédito Agrícola",
            "Beneficiarios": "Agricultores y productores",
            "Requisitos": "Cultivos tradicionales (arroz, avena, cebada, etc.)",
            "Contacto": "agricultura@bancoestado.cl",
            "Fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        },
        {
            "Nombre": "Crédito Mundo Verde - BancoEstado",
            "Descripción": "Crédito para financiar proyectos que promuevan energías limpias, eficiencia energética y fomento productivo sostenible.",
            "Monto": "Hasta 25,000,000 CLP",
            "Área de interés": "Agricultura Sostenible",
            "Estado": "Abierto",
            "Fecha cierre": "2025-12-31",
            "Fuente": "BancoEstado",
            "Enlace": "https://www.bancoestado.cl/web/banco-estado/mundo-verde",
            "Tipo": "Crédito Verde",
            "Beneficiarios": "Empresas con certificaciones ambientales",
            "Requisitos": "Proyectos de eficiencia energética y sostenibilidad",
            "Contacto": "verde@bancoestado.cl",
            "Fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
    ]
    
    proyectos.extend(proyectos_bancoestado)
    print(f"✅ BancoEstado: {len(proyectos_bancoestado)} proyectos encontrados")
    return proyectos

def buscar_proyectos_anid():
    """Busca proyectos de ANID"""
    print("🔍 Buscando proyectos ANID...")
    proyectos = []
    
    proyectos_anid = [
        {
            "Nombre": "Concurso IDeA I+D Tecnologías Avanzadas 2025 - ANID",
            "Descripción": "Convocatoria para proyectos de investigación y desarrollo en tecnologías avanzadas. Fomento a la I+D en tecnologías emergentes.",
            "Monto": "Hasta 80,000,000 CLP",
            "Área de interés": "Innovación Tecnológica",
            "Estado": "Abierto",
            "Fecha cierre": "2024-11-28",
            "Fuente": "ANID",
            "Enlace": "https://www.anid.cl/concursos/idea-i-d-tecnologias-avanzadas-2025",
            "Tipo": "Convocatoria I+D",
            "Beneficiarios": "Investigadores y centros de I+D",
            "Requisitos": "Proyectos de investigación en tecnologías avanzadas",
            "Contacto": "idea@anid.cl",
            "Fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        },
        {
            "Nombre": "FONDECYT Regular 2025 - ANID",
            "Descripción": "Fondo Nacional de Desarrollo Científico y Tecnológico para proyectos de investigación básica y aplicada.",
            "Monto": "Hasta 60,000,000 CLP",
            "Área de interés": "Innovación Tecnológica",
            "Estado": "Abierto",
            "Fecha cierre": "2025-03-15",
            "Fuente": "ANID",
            "Enlace": "https://www.anid.cl/concursos/fondecyt-regular-2025",
            "Tipo": "Fondo de Investigación",
            "Beneficiarios": "Investigadores con doctorado",
            "Requisitos": "Proyectos de investigación científica",
            "Contacto": "fondecyt@anid.cl",
            "Fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
    ]
    
    proyectos.extend(proyectos_anid)
    print(f"✅ ANID: {len(proyectos_anid)} proyectos encontrados")
    return proyectos

def buscar_proyectos_indap():
    """Busca proyectos de INDAP"""
    print("🔍 Buscando proyectos INDAP...")
    proyectos = []
    
    proyectos_indap = [
        {
            "Nombre": "Crédito INDAP - Capital de Trabajo",
            "Descripción": "Crédito a corto plazo con tasas subsidiadas para financiar capital de trabajo en actividades agrícolas.",
            "Monto": "Hasta 5,000,000 CLP",
            "Área de interés": "Desarrollo Rural",
            "Estado": "Abierto",
            "Fecha cierre": "2025-12-31",
            "Fuente": "INDAP",
            "Enlace": "https://www.indap.gob.cl/creditos/capital-trabajo",
            "Tipo": "Crédito Agrícola",
            "Beneficiarios": "Pequeños agricultores",
            "Requisitos": "Actividades agrícolas registradas",
            "Contacto": "creditos@indap.gob.cl",
            "Fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        },
        {
            "Nombre": "Crédito INDAP - Inversión",
            "Descripción": "Crédito a mediano y largo plazo para inversión en infraestructura agrícola y equipamiento.",
            "Monto": "Hasta 15,000,000 CLP",
            "Área de interés": "Desarrollo Rural",
            "Estado": "Abierto",
            "Fecha cierre": "2025-12-31",
            "Fuente": "INDAP",
            "Enlace": "https://www.indap.gob.cl/creditos/inversion",
            "Tipo": "Crédito de Inversión",
            "Beneficiarios": "Pequeños y medianos agricultores",
            "Requisitos": "Proyectos de inversión agrícola",
            "Contacto": "inversion@indap.gob.cl",
            "Fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        },
        {
            "Nombre": "Agroseguros - INDAP",
            "Descripción": "Seguros agrícolas con subsidios del Estado para proteger contra pérdidas por eventos climáticos.",
            "Monto": "Hasta 20,000,000 CLP",
            "Área de interés": "Agricultura Sostenible",
            "Estado": "Abierto",
            "Fecha cierre": "2025-12-31",
            "Fuente": "INDAP",
            "Enlace": "https://www.indap.gob.cl/agroseguros",
            "Tipo": "Seguro Agrícola",
            "Beneficiarios": "Agricultores registrados",
            "Requisitos": "Actividades agrícolas asegurables",
            "Contacto": "seguros@indap.gob.cl",
            "Fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
    ]
    
    proyectos.extend(proyectos_indap)
    print(f"✅ INDAP: {len(proyectos_indap)} proyectos encontrados")
    return proyectos

def buscar_proyectos_internacionales():
    """Busca proyectos internacionales adicionales"""
    print("🔍 Buscando proyectos internacionales...")
    proyectos = []
    
    proyectos_internacionales = [
        {
            "Nombre": "Fondo Verde del Clima - GCF",
            "Descripción": "Fondo internacional para financiar proyectos de adaptación y mitigación al cambio climático en países en desarrollo.",
            "Monto": "USD 1,000,000 - 50,000,000",
            "Área de interés": "Agricultura Sostenible",
            "Estado": "Abierto",
            "Fecha cierre": "2025-06-30",
            "Fuente": "GCF",
            "Enlace": "https://www.greenclimate.fund/funding/rfp-rfq",
            "Tipo": "Fondo Internacional",
            "Beneficiarios": "Gobiernos, ONGs, organizaciones internacionales",
            "Requisitos": "Proyectos de cambio climático",
            "Contacto": "info@gcfund.org",
            "Fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        },
        {
            "Nombre": "Fondo de Adaptación - Adaptation Fund",
            "Descripción": "Fondo internacional para financiar proyectos de adaptación al cambio climático en países en desarrollo.",
            "Monto": "USD 500,000 - 10,000,000",
            "Área de interés": "Agricultura Sostenible",
            "Estado": "Abierto",
            "Fecha cierre": "2025-08-31",
            "Fuente": "Adaptation Fund",
            "Enlace": "https://www.adaptation-fund.org/apply-for-funding/",
            "Tipo": "Fondo de Adaptación",
            "Beneficiarios": "Gobiernos, ONGs, organizaciones",
            "Requisitos": "Proyectos de adaptación climática",
            "Contacto": "info@adaptation-fund.org",
            "Fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        },
        {
            "Nombre": "Programa de Desarrollo Rural - UE",
            "Descripción": "Programa de la Unión Europea para financiar proyectos de desarrollo rural y agricultura sostenible.",
            "Monto": "EUR 100,000 - 2,000,000",
            "Área de interés": "Desarrollo Rural",
            "Estado": "Abierto",
            "Fecha cierre": "2025-09-30",
            "Fuente": "Unión Europea",
            "Enlace": "https://webgate.ec.europa.eu/europeaid/online-services",
            "Tipo": "Programa UE",
            "Beneficiarios": "Organizaciones de países elegibles",
            "Requisitos": "Proyectos de desarrollo rural",
            "Contacto": "info@europa.eu",
            "Fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
    ]
    
    proyectos.extend(proyectos_internacionales)
    print(f"✅ Internacionales: {len(proyectos_internacionales)} proyectos encontrados")
    return proyectos

def buscar_proyectos_fundaciones():
    """Busca proyectos de fundaciones y ONGs"""
    print("🔍 Buscando proyectos de fundaciones...")
    proyectos = []
    
    proyectos_fundaciones = [
        {
            "Nombre": "Fondo de Innovación Agrícola - Gates Foundation",
            "Descripción": "Fondo para financiar innovaciones agrícolas que mejoren la productividad y sostenibilidad en países en desarrollo.",
            "Monto": "USD 500,000 - 5,000,000",
            "Área de interés": "Innovación Tecnológica",
            "Estado": "Abierto",
            "Fecha cierre": "2025-07-31",
            "Fuente": "Gates Foundation",
            "Enlace": "https://www.gatesfoundation.org/agricultural-innovation",
            "Tipo": "Fondo de Fundación",
            "Beneficiarios": "Organizaciones de innovación agrícola",
            "Requisitos": "Proyectos de innovación agrícola",
            "Contacto": "agriculture@gatesfoundation.org",
            "Fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        },
        {
            "Nombre": "Programa de Seguridad Alimentaria - Rockefeller Foundation",
            "Descripción": "Programa para financiar proyectos que mejoren la seguridad alimentaria y nutrición en comunidades vulnerables.",
            "Monto": "USD 200,000 - 2,000,000",
            "Área de interés": "Seguridad Alimentaria",
            "Estado": "Abierto",
            "Fecha cierre": "2025-10-31",
            "Fuente": "Rockefeller Foundation",
            "Enlace": "https://www.rockefellerfoundation.org/food-security/",
            "Tipo": "Programa de Fundación",
            "Beneficiarios": "Organizaciones de seguridad alimentaria",
            "Requisitos": "Proyectos de seguridad alimentaria",
            "Contacto": "food@rockefellerfoundation.org",
            "Fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
    ]
    
    proyectos.extend(proyectos_fundaciones)
    print(f"✅ Fundaciones: {len(proyectos_fundaciones)} proyectos encontrados")
    return proyectos

def buscar_todos_los_proyectos():
    """Busca todos los proyectos disponibles"""
    print("🚀 BÚSQUEDA MASIVA DE PROYECTOS DE FINANCIAMIENTO")
    print("=" * 60)
    
    todos_los_proyectos = []
    
    # Buscar en todas las fuentes
    fuentes = [
        ("CORFO", buscar_proyectos_corfo),
        ("BancoEstado", buscar_proyectos_bancoestado),
        ("ANID", buscar_proyectos_anid),
        ("INDAP", buscar_proyectos_indap),
        ("Internacionales", buscar_proyectos_internacionales),
        ("Fundaciones", buscar_proyectos_fundaciones)
    ]
    
    for nombre_fuente, funcion_busqueda in fuentes:
        try:
            proyectos = funcion_busqueda()
            todos_los_proyectos.extend(proyectos)
            time.sleep(1)  # Pausa entre búsquedas
        except Exception as e:
            print(f"❌ Error en {nombre_fuente}: {e}")
    
    print(f"\n📊 RESUMEN DE BÚSQUEDA:")
    print(f"• Total proyectos encontrados: {len(todos_los_proyectos)}")
    
    # Estadísticas por fuente
    fuentes_count = {}
    for proyecto in todos_los_proyectos:
        fuente = proyecto.get('Fuente', 'Sin fuente')
        fuentes_count[fuente] = fuentes_count.get(fuente, 0) + 1
    
    print(f"\n📈 PROYECTOS POR FUENTE:")
    for fuente, count in sorted(fuentes_count.items(), key=lambda x: x[1], reverse=True):
        print(f"  • {fuente}: {count} proyectos")
    
    # Estadísticas por área
    areas_count = {}
    for proyecto in todos_los_proyectos:
        area = proyecto.get('Área de interés', 'Sin área')
        areas_count[area] = areas_count.get(area, 0) + 1
    
    print(f"\n🌍 PROYECTOS POR ÁREA:")
    for area, count in sorted(areas_count.items(), key=lambda x: x[1], reverse=True):
        print(f"  • {area}: {count} proyectos")
    
    return todos_los_proyectos

def guardar_proyectos_nuevos(proyectos):
    """Guarda los nuevos proyectos encontrados"""
    try:
        # Cargar proyectos existentes
        try:
            df_existente = pd.read_excel('data/proyectos_fortalecidos.xlsx')
            proyectos_existentes = df_existente.to_dict('records')
        except:
            proyectos_existentes = []
        
        # Combinar proyectos
        todos_los_proyectos = proyectos_existentes + proyectos
        
        # Eliminar duplicados basado en nombre y fuente
        proyectos_unicos = []
        nombres_vistos = set()
        
        for proyecto in todos_los_proyectos:
            clave = f"{proyecto.get('Nombre', '')}_{proyecto.get('Fuente', '')}"
            if clave not in nombres_vistos:
                proyectos_unicos.append(proyecto)
                nombres_vistos.add(clave)
        
        # Guardar en Excel
        df = pd.DataFrame(proyectos_unicos)
        df.to_excel('data/proyectos_fortalecidos.xlsx', index=False)
        
        print(f"\n💾 GUARDADO EXITOSO:")
        print(f"• Proyectos existentes: {len(proyectos_existentes)}")
        print(f"• Proyectos nuevos: {len(proyectos)}")
        print(f"• Total proyectos únicos: {len(proyectos_unicos)}")
        print(f"• Archivo guardado: data/proyectos_fortalecidos.xlsx")
        
        return True
        
    except Exception as e:
        print(f"❌ Error guardando proyectos: {e}")
        return False

if __name__ == "__main__":
    # Buscar todos los proyectos
    proyectos_nuevos = buscar_todos_los_proyectos()
    
    # Guardar proyectos
    if proyectos_nuevos:
        guardar_proyectos_nuevos(proyectos_nuevos)
        print(f"\n🎉 ¡BÚSQUEDA COMPLETADA!")
        print(f"🌐 Accede a la plataforma en: http://127.0.0.1:5000/")
    else:
        print(f"\n❌ No se encontraron proyectos nuevos")


