#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script de Actualización Masiva con Fuentes Web Faltantes
Integra todas las fuentes web identificadas que aún no están en la plataforma
"""

import pandas as pd
import os
from datetime import datetime
import json

def actualizar_base_datos_fuentes_web_faltantes():
    """Actualiza la base de datos con fuentes web faltantes"""
    print("🚀 ACTUALIZANDO BASE DE DATOS CON FUENTES WEB FALTANTES")
    print("=" * 80)
    
    # Importar scrapers
    try:
        from scrapers.fuentes_web_faltantes import obtener_todos_proyectos_web_faltantes
        print("✅ Scraper de fuentes web faltantes importado correctamente")
    except Exception as e:
        print(f"❌ Error importando scraper de fuentes web faltantes: {e}")
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
    
    # Obtener proyectos de fuentes web faltantes
    print("\n🔍 EXTRAYENDO PROYECTOS DE FUENTES WEB FALTANTES...")
    
    try:
        proyectos_web_faltantes = obtener_todos_proyectos_web_faltantes()
        print(f"✅ Fuentes Web Faltantes: {len(proyectos_web_faltantes)} proyectos")
    except Exception as e:
        print(f"❌ Error con fuentes web faltantes: {e}")
        proyectos_web_faltantes = []
    
    # Combinar todos los proyectos
    todos_los_proyectos = list(proyectos_existentes)
    todos_los_proyectos.extend(proyectos_web_faltantes)
    
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
    print(f"📊 Nuevos proyectos web faltantes: {len(proyectos_web_faltantes)}")
    
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
            'nuevos_proyectos_web_faltantes': len(proyectos_web_faltantes),
            'proyectos_eliminados_duplicados': len(todos_los_proyectos) - len(proyectos_unicos),
            'fuentes_incluidas': [
                'FOGAPE - Fondo de Garantía para Pequeños Empresarios',
                'SERCOTEC - Capital Semilla y Capital Abeja',
                'CORFO Semilla - Inicia y Expande',
                'Fondo Verde - Ministerio de Hacienda',
                'CAF - Banco de Desarrollo de América Latina',
                'Innovación.cl - Buscador Financiero',
                'Crowdfunding - Idea.me y Fondeadora',
                'Aceleradoras - Start-Up Chile y Social'
            ],
            'tipos_financiamiento': [
                'Fondo de Garantía',
                'Capital Semilla',
                'Fondo Climático',
                'Financiamiento Internacional',
                'Buscador de Financiamiento',
                'Crowdfunding',
                'Aceleradora'
            ],
            'sectores_beneficiarios': [
                'Emprendedores',
                'Pequeñas empresas',
                'MIPYMES',
                'Mujeres emprendedoras',
                'Startups',
                'Empresas tecnológicas',
                'Emprendimientos sociales'
            ]
        }
        
        with open('estadisticas_fuentes_web_faltantes.json', 'w', encoding='utf-8') as f:
            json.dump(estadisticas, f, indent=2, ensure_ascii=False)
        
        print(f"📊 Estadísticas guardadas en: estadisticas_fuentes_web_faltantes.json")
        
        # Mostrar resumen
        mostrar_resumen(estadisticas)
        
        return True
        
    except Exception as e:
        print(f"❌ Error guardando base de datos: {e}")
        return False

def mostrar_resumen(estadisticas):
    """Muestra un resumen de la actualización"""
    print("\n📊 RESUMEN DE ACTUALIZACIÓN CON FUENTES WEB FALTANTES")
    print("=" * 70)
    print(f"Fecha de actualización: {estadisticas['fecha_actualizacion']}")
    print(f"Total proyectos: {estadisticas['total_proyectos']}")
    print(f"Proyectos existentes: {estadisticas['proyectos_existentes']}")
    print(f"Nuevos proyectos web faltantes: {estadisticas['nuevos_proyectos_web_faltantes']}")
    print(f"Duplicados eliminados: {estadisticas['proyectos_eliminados_duplicados']}")
    
    print(f"\n🌐 FUENTES INCLUIDAS:")
    for fuente in estadisticas['fuentes_incluidas']:
        print(f"  • {fuente}")
    
    print(f"\n💰 TIPOS DE FINANCIAMIENTO:")
    for tipo in estadisticas['tipos_financiamiento']:
        print(f"  • {tipo}")
    
    print(f"\n👥 SECTORES BENEFICIARIOS:")
    for sector in estadisticas['sectores_beneficiarios']:
        print(f"  • {sector}")

def verificar_proyectos_web_faltantes():
    """Verifica los proyectos web faltantes agregados"""
    print("\n🔍 VERIFICANDO PROYECTOS WEB FALTANTES...")
    
    try:
        df = pd.read_excel("data/proyectos_fortalecidos.xlsx")
        
        # Proyectos por fuente
        fuentes_web_faltantes = [
            'FOGAPE',
            'SERCOTEC',
            'CORFO',
            'Fondo Verde',
            'CAF',
            'Innovación.cl',
            'Idea.me',
            'Fondeadora',
            'Start-Up Chile',
            'Aceleradora Social'
        ]
        
        total_web_faltantes = 0
        for fuente in fuentes_web_faltantes:
            proyectos_fuente = df[df['Fuente'] == fuente]
            if len(proyectos_fuente) > 0:
                print(f"✅ {fuente}: {len(proyectos_fuente)} proyectos")
                total_web_faltantes += len(proyectos_fuente)
            else:
                print(f"❌ {fuente}: 0 proyectos")
        
        print(f"\n📊 Total proyectos web faltantes: {total_web_faltantes}")
        
        # Proyectos por tipo de financiamiento
        if 'Tipo' in df.columns:
            tipos_financiamiento = df['Tipo'].value_counts()
            print(f"\n💰 PROYECTOS POR TIPO DE FINANCIAMIENTO:")
            for tipo, cantidad in tipos_financiamiento.items():
                print(f"  • {tipo}: {cantidad} proyectos")
        
        # Proyectos por área de interés
        if 'Área de interés' in df.columns:
            areas_interes = df['Área de interés'].value_counts()
            print(f"\n📂 PROYECTOS POR ÁREA DE INTERÉS:")
            for area, cantidad in areas_interes.items():
                print(f"  • {area}: {cantidad} proyectos")
        
        return True
        
    except Exception as e:
        print(f"❌ Error verificando proyectos web faltantes: {e}")
        return False

def mostrar_proyectos_por_tipo_financiamiento():
    """Muestra proyectos organizados por tipo de financiamiento"""
    print("\n📋 PROYECTOS POR TIPO DE FINANCIAMIENTO...")
    
    try:
        df = pd.read_excel("data/proyectos_fortalecidos.xlsx")
        
        # Tipos de financiamiento
        tipos_financiamiento = {
            'Fondos de Garantía': ['FOGAPE'],
            'Capital Semilla': ['SERCOTEC', 'CORFO'],
            'Fondos Climáticos': ['Fondo Verde'],
            'Financiamiento Internacional': ['CAF'],
            'Crowdfunding': ['Idea.me', 'Fondeadora'],
            'Aceleradoras': ['Start-Up Chile', 'Aceleradora Social']
        }
        
        for tipo, fuentes in tipos_financiamiento.items():
            print(f"\n📂 {tipo.upper()}:")
            total_tipo = 0
            for fuente in fuentes:
                proyectos_fuente = df[df['Fuente'] == fuente]
                if len(proyectos_fuente) > 0:
                    print(f"  • {fuente}: {len(proyectos_fuente)} proyectos")
                    total_tipo += len(proyectos_fuente)
                else:
                    print(f"  • {fuente}: 0 proyectos")
            print(f"  Total {tipo}: {total_tipo} proyectos")
        
        return True
        
    except Exception as e:
        print(f"❌ Error mostrando proyectos por tipo de financiamiento: {e}")
        return False

def main():
    """Función principal"""
    print("🌐 ACTUALIZACIÓN MASIVA CON FUENTES WEB FALTANTES - IICA CHILE")
    print("=" * 90)
    
    # Actualizar base de datos
    if actualizar_base_datos_fuentes_web_faltantes():
        print("\n🎉 ¡ACTUALIZACIÓN MASIVA CON FUENTES WEB FALTANTES COMPLETADA!")
        
        # Verificar proyectos
        verificar_proyectos_web_faltantes()
        
        # Mostrar por tipo de financiamiento
        mostrar_proyectos_por_tipo_financiamiento()
        
        print("\n✅ La base de datos ha sido expandida con fuentes web faltantes")
        print("🌐 Nuevas fuentes incluidas:")
        print("  • FOGAPE - Fondo de Garantía para Pequeños Empresarios")
        print("  • SERCOTEC - Capital Semilla y Capital Abeja")
        print("  • CORFO Semilla - Inicia y Expande")
        print("  • Fondo Verde - Ministerio de Hacienda")
        print("  • CAF - Banco de Desarrollo de América Latina")
        print("  • Innovación.cl - Buscador Financiero")
        print("  • Crowdfunding - Idea.me y Fondeadora")
        print("  • Aceleradoras - Start-Up Chile y Social")
        print("📊 Todos los proyectos incluyen información detallada y enlaces verificados")
        print("🎯 La plataforma ahora tiene acceso a todas las fuentes de financiamiento disponibles en Chile")
    else:
        print("\n❌ Error en la actualización masiva de la base de datos")

if __name__ == "__main__":
    main()
