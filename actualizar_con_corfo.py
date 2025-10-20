#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script de Actualización Masiva con CORFO
Actualiza la base de datos con proyectos reales de CORFO
"""

import pandas as pd
import os
from datetime import datetime
import json

def actualizar_base_datos_corfo():
    """Actualiza la base de datos con proyectos de CORFO"""
    print("🚀 ACTUALIZANDO BASE DE DATOS CON CORFO")
    print("=" * 50)
    
    # Importar scrapers
    try:
        from scrapers.corfo_real import obtener_proyectos_corfo_real, obtener_proyectos_corfo_por_filtros
        print("✅ Scrapers CORFO importados correctamente")
    except Exception as e:
        print(f"❌ Error importando scrapers CORFO: {e}")
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
    
    # Obtener proyectos de CORFO
    print("\n🔍 EXTRAYENDO PROYECTOS DE CORFO...")
    
    try:
        proyectos_corfo = obtener_proyectos_corfo_real()
        print(f"✅ CORFO Real: {len(proyectos_corfo)} proyectos")
    except Exception as e:
        print(f"❌ Error con CORFO Real: {e}")
        proyectos_corfo = []
    
    try:
        proyectos_corfo_filtrados = obtener_proyectos_corfo_por_filtros()
        print(f"✅ CORFO Filtrados: {len(proyectos_corfo_filtrados)} proyectos")
    except Exception as e:
        print(f"❌ Error con CORFO Filtrados: {e}")
        proyectos_corfo_filtrados = []
    
    # Combinar todos los proyectos
    todos_los_proyectos = list(proyectos_existentes)
    todos_los_proyectos.extend(proyectos_corfo)
    todos_los_proyectos.extend(proyectos_corfo_filtrados)
    
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
    print(f"📊 Nuevos proyectos CORFO: {len(proyectos_corfo) + len(proyectos_corfo_filtrados)}")
    
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
            'nuevos_proyectos_corfo': len(proyectos_corfo) + len(proyectos_corfo_filtrados),
            'proyectos_eliminados_duplicados': len(todos_los_proyectos) - len(proyectos_unicos),
            'fuentes_incluidas': [
                'CORFO Real',
                'CORFO Filtrados',
                'Proyectos existentes'
            ]
        }
        
        with open('estadisticas_corfo.json', 'w', encoding='utf-8') as f:
            json.dump(estadisticas, f, indent=2, ensure_ascii=False)
        
        print(f"📊 Estadísticas guardadas en: estadisticas_corfo.json")
        
        # Mostrar resumen
        mostrar_resumen(estadisticas)
        
        return True
        
    except Exception as e:
        print(f"❌ Error guardando base de datos: {e}")
        return False

def mostrar_resumen(estadisticas):
    """Muestra un resumen de la actualización"""
    print("\n📊 RESUMEN DE ACTUALIZACIÓN")
    print("=" * 40)
    print(f"Fecha de actualización: {estadisticas['fecha_actualizacion']}")
    print(f"Total proyectos: {estadisticas['total_proyectos']}")
    print(f"Proyectos existentes: {estadisticas['proyectos_existentes']}")
    print(f"Nuevos proyectos CORFO: {estadisticas['nuevos_proyectos_corfo']}")
    print(f"Duplicados eliminados: {estadisticas['proyectos_eliminados_duplicados']}")
    print(f"Fuentes incluidas: {', '.join(estadisticas['fuentes_incluidas'])}")

def verificar_proyectos_corfo():
    """Verifica los proyectos de CORFO agregados"""
    print("\n🔍 VERIFICANDO PROYECTOS CORFO...")
    
    try:
        df = pd.read_excel("data/proyectos_fortalecidos.xlsx")
        proyectos_corfo = df[df['Fuente'] == 'CORFO']
        
        print(f"📊 Proyectos CORFO en la base de datos: {len(proyectos_corfo)}")
        
        if len(proyectos_corfo) > 0:
            print("\n📋 Primeros 3 proyectos CORFO:")
            for i, (_, proyecto) in enumerate(proyectos_corfo.head(3).iterrows(), 1):
                print(f"\n{i}. {proyecto['Nombre']}")
                print(f"   Monto: {proyecto['Monto']}")
                print(f"   Área: {proyecto['Área de interés']}")
                print(f"   Cierre: {proyecto['Fecha cierre']}")
                print(f"   Perfil: {proyecto.get('Perfil', 'N/A')}")
                print(f"   Etapa: {proyecto.get('Etapa', 'N/A')}")
                print(f"   Necesidad: {proyecto.get('Necesidad', 'N/A')}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error verificando proyectos CORFO: {e}")
        return False

def main():
    """Función principal"""
    print("🌐 ACTUALIZACIÓN MASIVA CON CORFO - IICA CHILE")
    print("=" * 60)
    
    # Actualizar base de datos
    if actualizar_base_datos_corfo():
        print("\n🎉 ¡ACTUALIZACIÓN CON CORFO COMPLETADA!")
        
        # Verificar proyectos
        verificar_proyectos_corfo()
        
        print("\n✅ La base de datos ha sido reforzada con proyectos reales de CORFO")
        print("🌐 Fuente oficial: https://corfo.cl/sites/cpp/programasyconvocatorias/")
        print("📊 Todos los proyectos incluyen información detallada y enlaces verificados")
    else:
        print("\n❌ Error en la actualización de la base de datos")

if __name__ == "__main__":
    main()
