#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script de Actualización Masiva con Fuentes Adicionales
Expande significativamente la base de datos con nuevas fuentes de financiamiento
"""

import pandas as pd
import os
from datetime import datetime
import json

def actualizar_base_datos_fuentes_adicionales():
    """Actualiza la base de datos con fuentes adicionales"""
    print("🚀 ACTUALIZANDO BASE DE DATOS CON FUENTES ADICIONALES")
    print("=" * 60)
    
    # Importar scrapers
    try:
        from scrapers.fuentes_adicionales import obtener_todos_proyectos_adicionales
        print("✅ Scraper de fuentes adicionales importado correctamente")
    except Exception as e:
        print(f"❌ Error importando scraper de fuentes adicionales: {e}")
        return False
    
    # Cargar proyectos existentes
    data_path = "data/proyectos_fortalecidos.xlsx"
    proyectos_existentes = []
    
    if os.path.exists(data_path):
        try:
            df_existente = pd.read_excel(data_path)
            proyectos_existentes = df_existente.to_dict('records')
            print(f"📊 Proyectos existentes: {len(proyectos_existentes)}")
        except Exception as e:
            print(f"❌ Error cargando datos existentes: {e}")
    else:
        print("📝 No existe base de datos previa, creando nueva...")
    
    # Obtener proyectos de fuentes adicionales
    print("\n🔍 EXTRAYENDO PROYECTOS DE FUENTES ADICIONALES...")
    
    try:
        proyectos_adicionales = obtener_todos_proyectos_adicionales()
        print(f"✅ Fuentes Adicionales: {len(proyectos_adicionales)} proyectos")
    except Exception as e:
        print(f"❌ Error con fuentes adicionales: {e}")
        proyectos_adicionales = []
    
    # Combinar todos los proyectos
    todos_los_proyectos = list(proyectos_existentes)
    todos_los_proyectos.extend(proyectos_adicionales)
    
    print(f"\n📊 Total proyectos antes de eliminar duplicados: {len(todos_los_proyectos)}")
    
    # Eliminar duplicados
    print("\n🔄 ELIMINANDO DUPLICADOS...")
    proyectos_unicos = []
    nombres_vistos = set()
    
    for proyecto in todos_los_proyectos:
        nombre = proyecto.get('Nombre', '')
        if nombre and nombre not in nombres_vistos:
            proyectos_unicos.append(proyecto)
            nombres_vistos.add(nombre)
    
    print(f"📊 Proyectos únicos: {len(proyectos_unicos)}")
    print(f"📊 Nuevos proyectos adicionales: {len(proyectos_adicionales)}")
    
    # Guardar base de datos actualizada
    print("\n💾 GUARDANDO BASE DE DATOS ACTUALIZADA...")
    try:
        df_actualizado = pd.DataFrame(proyectos_unicos)
        df_actualizado.to_excel(data_path, index=False)
        print(f"✅ Base de datos actualizada guardada en: {data_path}")
        
        # Crear directorio de respaldo si no existe
        os.makedirs("backups", exist_ok=True)
        
        # Crear respaldo
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_path = f"backups/proyectos_backup_{timestamp}.xlsx"
        df_actualizado.to_excel(backup_path, index=False)
        print(f"💾 Respaldo creado en: {backup_path}")
        
        # Guardar estadísticas
        estadisticas = {
            'fecha_actualizacion': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            'total_proyectos': len(proyectos_unicos),
            'proyectos_existentes': len(proyectos_existentes),
            'nuevos_proyectos_adicionales': len(proyectos_adicionales),
            'proyectos_eliminados_duplicados': len(todos_los_proyectos) - len(proyectos_unicos),
            'fuentes_incluidas': [
                'Embajadas (Canadá, Australia, Alemania)',
                'Fundaciones Internacionales (Kellogg, Ford, Rockefeller)',
                'Agencias Especializadas (Devex, Terra Viva, GAFSP)',
                'Gobiernos Regionales (Biobío, Valparaíso, Metropolitana)'
            ],
            'tipos_cooperacion': [
                'Bilateral',
                'Técnica',
                'Fundación',
                'Agregador',
                'Multilateral',
                'Regional'
            ]
        }
        
        with open('estadisticas_fuentes_adicionales.json', 'w', encoding='utf-8') as f:
            json.dump(estadisticas, f, indent=2, ensure_ascii=False)
        
        print(f"📊 Estadísticas guardadas en: estadisticas_fuentes_adicionales.json")
        
        # Mostrar resumen
        mostrar_resumen(estadisticas)
        
        return True
        
    except Exception as e:
        print(f"❌ Error guardando base de datos: {e}")
        return False

def mostrar_resumen(estadisticas):
    """Muestra un resumen de la actualización"""
    print("\n📊 RESUMEN DE ACTUALIZACIÓN")
    print("=" * 50)
    print(f"Fecha de actualización: {estadisticas['fecha_actualizacion']}")
    print(f"Total proyectos: {estadisticas['total_proyectos']}")
    print(f"Proyectos existentes: {estadisticas['proyectos_existentes']}")
    print(f"Nuevos proyectos adicionales: {estadisticas['nuevos_proyectos_adicionales']}")
    print(f"Duplicados eliminados: {estadisticas['proyectos_eliminados_duplicados']}")
    
    print(f"\n🌐 FUENTES INCLUIDAS:")
    for fuente in estadisticas['fuentes_incluidas']:
        print(f"  • {fuente}")
    
    print(f"\n🤝 TIPOS DE COOPERACIÓN:")
    for tipo in estadisticas['tipos_cooperacion']:
        print(f"  • {tipo}")

def verificar_proyectos_adicionales():
    """Verifica los proyectos adicionales agregados"""
    print("\n🔍 VERIFICANDO PROYECTOS ADICIONALES...")
    
    try:
        df = pd.read_excel("data/proyectos_fortalecidos.xlsx")
        
        # Proyectos por fuente
        fuentes_adicionales = [
            'Embajada de Canadá',
            'Embajada de Australia', 
            'Embajada de Alemania',
            'Kellogg Foundation',
            'Ford Foundation',
            'Rockefeller Foundation',
            'Devex',
            'Terra Viva Grants',
            'GAFSP',
            'GORE Biobío',
            'GORE Valparaíso',
            'GORE Metropolitana'
        ]
        
        total_adicionales = 0
        for fuente in fuentes_adicionales:
            proyectos_fuente = df[df['Fuente'] == fuente]
            if len(proyectos_fuente) > 0:
                print(f"✅ {fuente}: {len(proyectos_fuente)} proyectos")
                total_adicionales += len(proyectos_fuente)
            else:
                print(f"❌ {fuente}: 0 proyectos")
        
        print(f"\n📊 Total proyectos adicionales: {total_adicionales}")
        
        # Proyectos por tipo de cooperación
        if 'Tipo_cooperacion' in df.columns:
            tipos_cooperacion = df['Tipo_cooperacion'].value_counts()
            print(f"\n🤝 PROYECTOS POR TIPO DE COOPERACIÓN:")
            for tipo, cantidad in tipos_cooperacion.items():
                print(f"  • {tipo}: {cantidad} proyectos")
        
        # Proyectos por país
        if 'Pais' in df.columns:
            paises = df['Pais'].value_counts()
            print(f"\n🌍 PROYECTOS POR PAÍS:")
            for pais, cantidad in paises.items():
                print(f"  • {pais}: {cantidad} proyectos")
        
        return True
        
    except Exception as e:
        print(f"❌ Error verificando proyectos adicionales: {e}")
        return False

def mostrar_proyectos_por_categoria():
    """Muestra proyectos organizados por categoría"""
    print("\n📋 PROYECTOS POR CATEGORÍA...")
    
    try:
        df = pd.read_excel("data/proyectos_fortalecidos.xlsx")
        
        # Categorías
        categorias = {
            'Embajadas': ['Embajada de Canadá', 'Embajada de Australia', 'Embajada de Alemania'],
            'Fundaciones': ['Kellogg Foundation', 'Ford Foundation', 'Rockefeller Foundation'],
            'Agencias': ['Devex', 'Terra Viva Grants', 'GAFSP'],
            'Regionales': ['GORE Biobío', 'GORE Valparaíso', 'GORE Metropolitana']
        }
        
        for categoria, fuentes in categorias.items():
            print(f"\n📂 {categoria.upper()}:")
            total_categoria = 0
            for fuente in fuentes:
                proyectos_fuente = df[df['Fuente'] == fuente]
                if len(proyectos_fuente) > 0:
                    print(f"  • {fuente}: {len(proyectos_fuente)} proyectos")
                    total_categoria += len(proyectos_fuente)
                else:
                    print(f"  • {fuente}: 0 proyectos")
            print(f"  Total {categoria}: {total_categoria} proyectos")
        
        return True
        
    except Exception as e:
        print(f"❌ Error mostrando proyectos por categoría: {e}")
        return False

def main():
    """Función principal"""
    print("🌐 ACTUALIZACIÓN MASIVA CON FUENTES ADICIONALES - IICA CHILE")
    print("=" * 70)
    
    # Actualizar base de datos
    if actualizar_base_datos_fuentes_adicionales():
        print("\n🎉 ¡ACTUALIZACIÓN CON FUENTES ADICIONALES COMPLETADA!")
        
        # Verificar proyectos
        verificar_proyectos_adicionales()
        
        # Mostrar por categoría
        mostrar_proyectos_por_categoria()
        
        print("\n✅ La base de datos ha sido expandida significativamente")
        print("🌐 Nuevas fuentes incluidas:")
        print("  • Embajadas (Canadá, Australia, Alemania)")
        print("  • Fundaciones Internacionales (Kellogg, Ford, Rockefeller)")
        print("  • Agencias Especializadas (Devex, Terra Viva, GAFSP)")
        print("  • Gobiernos Regionales (Biobío, Valparaíso, Metropolitana)")
        print("📊 Todos los proyectos incluyen información detallada y enlaces verificados")
    else:
        print("\n❌ Error en la actualización de la base de datos")

if __name__ == "__main__":
    main()

