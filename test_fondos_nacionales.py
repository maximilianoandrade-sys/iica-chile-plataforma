#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script de prueba para verificar la carga de fondos nacionales de Chile
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app_iica_chile_optimized import IICAChilePlatformOptimized
import json

def test_fondos_nacionales():
    """Probar la carga de fondos nacionales"""
    print("🧪 Probando carga de fondos nacionales de Chile...")
    
    # Inicializar plataforma
    platform = IICAChilePlatformOptimized()
    
    # Obtener fondos nacionales
    fondos_nacionales = platform.obtener_fondos_nacionales_chile()
    
    print(f"✅ Total de fondos nacionales cargados: {len(fondos_nacionales)}")
    
    # Mostrar estadísticas por organización
    organizaciones = {}
    for fondo in fondos_nacionales:
        org = fondo['organizacion']
        if org not in organizaciones:
            organizaciones[org] = 0
        organizaciones[org] += 1
    
    print("\n📊 Fondos por organización:")
    for org, count in organizaciones.items():
        print(f"  • {org}: {count} fondos")
    
    # Mostrar estadísticas por área
    areas = {}
    for fondo in fondos_nacionales:
        area = fondo['area']
        if area not in areas:
            areas[area] = 0
        areas[area] += 1
    
    print("\n📊 Fondos por área:")
    for area, count in areas.items():
        print(f"  • {area}: {count} fondos")
    
    # Mostrar estadísticas por prioridad
    prioridades = {}
    for fondo in fondos_nacionales:
        prioridad = fondo['prioridad']
        if prioridad not in prioridades:
            prioridades[prioridad] = 0
        prioridades[prioridad] += 1
    
    print("\n📊 Fondos por prioridad:")
    for prioridad, count in prioridades.items():
        print(f"  • {prioridad}: {count} fondos")
    
    # Mostrar algunos fondos de ejemplo
    print("\n🔍 Ejemplos de fondos nacionales:")
    for i, fondo in enumerate(fondos_nacionales[:5]):
        print(f"\n{i+1}. {fondo['nombre']}")
        print(f"   Organización: {fondo['organizacion']}")
        print(f"   Monto: {fondo['monto']}")
        print(f"   Área: {fondo['area']}")
        print(f"   Prioridad: {fondo['prioridad']}")
        print(f"   Estado: {fondo['estado']}")
        print(f"   Fecha de cierre: {fondo['fecha_cierre']}")
    
    # Guardar datos en archivo JSON para verificación
    with open('fondos_nacionales_test.json', 'w', encoding='utf-8') as f:
        json.dump(fondos_nacionales, f, ensure_ascii=False, indent=2)
    
    print(f"\n💾 Datos guardados en: fondos_nacionales_test.json")
    
    return len(fondos_nacionales)

if __name__ == "__main__":
    try:
        total_fondos = test_fondos_nacionales()
        print(f"\n✅ Prueba completada exitosamente: {total_fondos} fondos nacionales cargados")
    except Exception as e:
        print(f"❌ Error en la prueba: {e}")
        import traceback
        traceback.print_exc()

