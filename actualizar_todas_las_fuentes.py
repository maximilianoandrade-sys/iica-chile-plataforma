#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script para actualizar la base de datos con todas las fuentes de financiamiento
Incluye: BIDPrime, TodoLicitaciones.cl, fuentes gubernamentales, internacionales y fundaciones
"""

import pandas as pd
import os
from scrapers.bidprime import obtener_proyectos_bidprime, obtener_proyectos_bidprime_avanzado
from scrapers.todolicitaciones import obtener_proyectos_todolicitaciones
from scrapers.fuentes_gubernamentales import obtener_todos_proyectos_gubernamentales
from scrapers.fuentes_internacionales import obtener_todos_proyectos_internacionales
from scrapers.fundaciones_ongs import obtener_todos_proyectos_fundaciones

def actualizar_base_datos_completa():
    """Actualiza la base de datos con todas las fuentes de financiamiento"""
    print("🚀 ACTUALIZACIÓN MASIVA DE BASE DE DATOS")
    print("=" * 60)
    
    # Cargar proyectos existentes
    data_path = "data/proyectos_fortalecidos.xlsx"
    if os.path.exists(data_path):
        try:
            df_existente = pd.read_excel(data_path)
            proyectos_existentes = df_existente.to_dict('records')
            print(f"📊 Proyectos existentes: {len(proyectos_existentes)}")
        except Exception as e:
            print(f"❌ Error cargando datos existentes: {e}")
            proyectos_existentes = []
    else:
        print("📝 No existe base de datos previa, creando nueva...")
        proyectos_existentes = []
    
    # Recolectar proyectos de todas las fuentes
    print("\n🔍 RECOLECTANDO PROYECTOS DE TODAS LAS FUENTES...")
    print("-" * 50)
    
    todos_los_proyectos = list(proyectos_existentes)
    
    # 1. BIDPrime
    print("\n1️⃣ BIDPrime...")
    try:
        proyectos_bidprime = obtener_proyectos_bidprime()
        proyectos_bidprime_avanzado = obtener_proyectos_bidprime_avanzado()
        todos_los_proyectos.extend(proyectos_bidprime)
        todos_los_proyectos.extend(proyectos_bidprime_avanzado)
        print(f"   ✅ BIDPrime: {len(proyectos_bidprime) + len(proyectos_bidprime_avanzado)} proyectos")
    except Exception as e:
        print(f"   ❌ Error con BIDPrime: {e}")
    
    # 2. TodoLicitaciones.cl
    print("\n2️⃣ TodoLicitaciones.cl...")
    try:
        proyectos_todolicitaciones = obtener_proyectos_todolicitaciones()
        todos_los_proyectos.extend(proyectos_todolicitaciones)
        print(f"   ✅ TodoLicitaciones.cl: {len(proyectos_todolicitaciones)} proyectos")
    except Exception as e:
        print(f"   ❌ Error con TodoLicitaciones.cl: {e}")
    
    # 3. Fuentes Gubernamentales
    print("\n3️⃣ Fuentes Gubernamentales...")
    try:
        proyectos_gubernamentales = obtener_todos_proyectos_gubernamentales()
        todos_los_proyectos.extend(proyectos_gubernamentales)
        print(f"   ✅ Fuentes Gubernamentales: {len(proyectos_gubernamentales)} proyectos")
    except Exception as e:
        print(f"   ❌ Error con fuentes gubernamentales: {e}")
    
    # 4. Fuentes Internacionales
    print("\n4️⃣ Fuentes Internacionales...")
    try:
        proyectos_internacionales = obtener_todos_proyectos_internacionales()
        todos_los_proyectos.extend(proyectos_internacionales)
        print(f"   ✅ Fuentes Internacionales: {len(proyectos_internacionales)} proyectos")
    except Exception as e:
        print(f"   ❌ Error con fuentes internacionales: {e}")
    
    # 5. Fundaciones y ONGs
    print("\n5️⃣ Fundaciones y ONGs...")
    try:
        proyectos_fundaciones = obtener_todos_proyectos_fundaciones()
        todos_los_proyectos.extend(proyectos_fundaciones)
        print(f"   ✅ Fundaciones y ONGs: {len(proyectos_fundaciones)} proyectos")
    except Exception as e:
        print(f"   ❌ Error con fundaciones y ONGs: {e}")
    
    # Eliminar duplicados
    print("\n🔄 ELIMINANDO DUPLICADOS...")
    proyectos_unicos = []
    nombres_vistos = set()
    
    for proyecto in todos_los_proyectos:
        nombre = proyecto.get('Nombre', '')
        if nombre and nombre not in nombres_vistos:
            proyectos_unicos.append(proyecto)
            nombres_vistos.add(nombre)
    
    print(f"✅ Proyectos únicos: {len(proyectos_unicos)}")
    print(f"📊 Duplicados eliminados: {len(todos_los_proyectos) - len(proyectos_unicos)}")
    
    # Guardar en Excel
    print("\n💾 GUARDANDO BASE DE DATOS...")
    try:
        df_actualizado = pd.DataFrame(proyectos_unicos)
        df_actualizado.to_excel(data_path, index=False)
        print(f"✅ Base de datos actualizada guardada en: {data_path}")
        
        # Estadísticas por fuente
        print("\n📊 ESTADÍSTICAS POR FUENTE:")
        print("-" * 40)
        fuentes = df_actualizado['Fuente'].value_counts()
        for fuente, cantidad in fuentes.items():
            print(f"   {fuente}: {cantidad} proyectos")
        
        # Estadísticas por área
        print("\n🎯 ESTADÍSTICAS POR ÁREA DE INTERÉS:")
        print("-" * 40)
        areas = df_actualizado['Área de interés'].value_counts()
        for area, cantidad in areas.items():
            print(f"   {area}: {cantidad} proyectos")
        
        # Estadísticas por estado
        print("\n📈 ESTADÍSTICAS POR ESTADO:")
        print("-" * 40)
        estados = df_actualizado['Estado'].value_counts()
        for estado, cantidad in estados.items():
            print(f"   {estado}: {cantidad} proyectos")
        
        return True
        
    except Exception as e:
        print(f"❌ Error guardando base de datos: {e}")
        return False

def mostrar_resumen_fuentes():
    """Muestra un resumen de todas las fuentes integradas"""
    print("\n🌐 RESUMEN DE FUENTES INTEGRADAS")
    print("=" * 50)
    
    fuentes = {
        "BIDPrime": "https://www.bidprime.com/",
        "TodoLicitaciones.cl": "https://www.todolicitaciones.cl/",
        "fondos.gob.cl": "Portal Único de Fondos Concursables del Estado",
        "CORFO": "www.corfo.cl/sites/cpp/programas_y_convocatorias",
        "FIA": "www.fia.cl/convocatorias/",
        "ANID": "www.anid.cl/concursos/",
        "BID": "beo-procurement.iadb.org/",
        "FIDA": "www.ifad.org/es/web/operations/procurement",
        "FAO": "www.fao.org/procurement/current-tenders-and-calls/es/",
        "GCF": "www.greenclimate.fund/funding/rfp-rfq",
        "INDAP": "www.indap.gob.cl",
        "CNR": "www.cnr.gob.cl",
        "AGCID": "www.agcid.gob.cl/fondo-chile/",
        "GEF": "www.thegef.org/work-with-us/funding",
        "PNUD": "procurement-notices.undp.org",
        "UE": "webgate.ec.europa.eu/europeaid/online-services",
        "GAFSP": "www.gafspfund.org/call-proposals",
        "MMA": "fondos.mma.gob.cl",
        "MINENERGIA": "www.energia.gob.cl/fondos-y-concursos",
        "Adaptation Fund": "www.adaptation-fund.org/apply-for-funding/",
        "Embajada de Canadá": "www.canadainternational.gc.ca/chile-chili/",
        "Embajada de Australia": "chile.embassy.gov.au/sclecastellano/DAPhome.html",
        "Devex": "www.devex.com/funding",
        "Terra Viva Grants": "www.terravivagrants.org",
        "Kellogg Foundation": "www.wkkf.org/what-we-do/chile",
        "Ford Foundation": "www.fordfoundation.org/work/our-grants/",
        "Rockefeller Foundation": "www.rockefellerfoundation.org/our-work/"
    }
    
    print(f"📊 Total de fuentes integradas: {len(fuentes)}")
    print("\n🔗 FUENTES POR CATEGORÍA:")
    
    print("\n🏛️ FUENTES GUBERNAMENTALES CHILENAS:")
    gubernamentales = ["fondos.gob.cl", "CORFO", "FIA", "ANID", "INDAP", "CNR", "AGCID", "MMA", "MINENERGIA"]
    for fuente in gubernamentales:
        if fuente in fuentes:
            print(f"   • {fuente}: {fuentes[fuente]}")
    
    print("\n🌍 FUENTES INTERNACIONALES:")
    internacionales = ["BID", "FIDA", "FAO", "GCF", "GEF", "PNUD", "UE", "GAFSP", "Adaptation Fund"]
    for fuente in internacionales:
        if fuente in fuentes:
            print(f"   • {fuente}: {fuentes[fuente]}")
    
    print("\n🏛️ FUNDACIONES Y ONGs:")
    fundaciones = ["Kellogg Foundation", "Ford Foundation", "Rockefeller Foundation", "Devex", "Terra Viva Grants"]
    for fuente in fundaciones:
        if fuente in fuentes:
            print(f"   • {fuente}: {fuentes[fuente]}")
    
    print("\n🌐 PLATAFORMAS DE AGGREGACIÓN:")
    agregadores = ["BIDPrime", "TodoLicitaciones.cl", "Embajada de Canadá", "Embajada de Australia"]
    for fuente in agregadores:
        if fuente in fuentes:
            print(f"   • {fuente}: {fuentes[fuente]}")

if __name__ == "__main__":
    print("🌐 FORTALECIMIENTO MASIVO DE BASE DE DATOS - IICA CHILE")
    print("=" * 70)
    
    # Mostrar resumen de fuentes
    mostrar_resumen_fuentes()
    
    # Actualizar base de datos
    print("\n" + "=" * 70)
    if actualizar_base_datos_completa():
        print("\n🎉 ¡BASE DE DATOS FORTALECIDA EXITOSAMENTE!")
        print("📊 La plataforma ahora incluye múltiples fuentes de financiamiento")
        print("🌐 Accede a la plataforma en: http://127.0.0.1:5000/")
        print("\n✨ FUNCIONALIDADES DISPONIBLES:")
        print("   • Búsqueda avanzada con filtros múltiples")
        print("   • Sistema de favoritos y notificaciones")
        print("   • Seguimiento de postulaciones")
        print("   • APIs REST para integración")
        print("   • Dashboard con estadísticas en tiempo real")
    else:
        print("\n❌ Error en la actualización de la base de datos")
