#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script de prueba para la plataforma IICA Chile mejorada
Verifica todas las funcionalidades implementadas
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app_iica_chile_mejorado import IICAChilePlatformMejorado
import json

def test_plataforma_mejorada():
    """Probar todas las funcionalidades de la plataforma mejorada"""
    print("🧪 Probando Plataforma IICA Chile Mejorada...")
    
    # Inicializar plataforma
    platform = IICAChilePlatformMejorado()
    
    print(f"✅ Plataforma inicializada correctamente")
    print(f"📊 Total de fondos cargados: {len(platform.fondos_data)}")
    
    # Probar obtención de fondos abiertos
    fondos_abiertos = platform.obtener_fondos_abiertos()
    print(f"🔓 Fondos abiertos: {len(fondos_abiertos)}")
    
    # Probar obtención por tipo
    fondos_nacionales = platform.obtener_fondos_por_tipo('Nacional')
    fondos_internacionales = platform.obtener_fondos_por_tipo('Internacional')
    print(f"🇨🇱 Fondos nacionales: {len(fondos_nacionales)}")
    print(f"🌍 Fondos internacionales: {len(fondos_internacionales)}")
    
    # Probar obtención de fondos abiertos por tipo
    fondos_abiertos_nacionales = platform.obtener_fondos_abiertos_por_tipo('Nacional')
    fondos_abiertos_internacionales = platform.obtener_fondos_abiertos_por_tipo('Internacional')
    print(f"🔓🇨🇱 Fondos abiertos nacionales: {len(fondos_abiertos_nacionales)}")
    print(f"🔓🌍 Fondos abiertos internacionales: {len(fondos_abiertos_internacionales)}")
    
    # Probar búsqueda
    resultados_busqueda = platform.buscar_fondos(query="innovación", tipo="Nacional", estado="Abierto")
    print(f"🔍 Resultados de búsqueda 'innovación': {len(resultados_busqueda)}")
    
    # Probar agregar nuevo fondo
    print("\n📝 Probando agregar nuevo fondo...")
    datos_nuevo_fondo = {
        'nombre': 'Programa de Prueba IICA',
        'organizacion': 'IICA Chile - Prueba',
        'tipo': 'Nacional',
        'monto': 'CLP 100,000,000',
        'fecha_cierre': '2025-12-31',
        'estado': 'Abierto',
        'area': 'Innovación Tecnológica',
        'descripcion': 'Programa de prueba para verificar funcionalidad',
        'requisitos': 'Organizaciones de prueba',
        'enlace': 'https://iica.int',
        'contacto': 'prueba@iica.cl',
        'tipo_financiamiento': 'Subsidio',
        'duracion': '12 meses',
        'beneficiarios': 'Sector de prueba',
        'prioridad': 'Media',
        'fuente': 'IICA Chile Prueba'
    }
    
    success, message = platform.agregar_fondo(datos_nuevo_fondo)
    if success:
        print(f"✅ {message}")
    else:
        print(f"❌ {message}")
    
    # Probar exportación Excel
    print("\n📊 Probando exportación Excel...")
    try:
        filepath, filename = platform.exportar_excel()
        print(f"✅ Excel exportado: {filename}")
    except Exception as e:
        print(f"❌ Error exportando Excel: {e}")
    
    # Mostrar estadísticas finales
    print("\n📈 Estadísticas Finales:")
    print(f"  • Total de fondos: {len(platform.fondos_data)}")
    print(f"  • Fondos abiertos: {len(platform.obtener_fondos_abiertos())}")
    print(f"  • Fondos nacionales: {len(platform.obtener_fondos_por_tipo('Nacional'))}")
    print(f"  • Fondos internacionales: {len(platform.obtener_fondos_por_tipo('Internacional'))}")
    
    # Mostrar algunos fondos de ejemplo
    print("\n🔍 Ejemplos de fondos:")
    for i, fondo in enumerate(platform.fondos_data[:3]):
        print(f"\n{i+1}. {fondo['nombre']}")
        print(f"   Organización: {fondo['organizacion']}")
        print(f"   Tipo: {fondo['tipo']}")
        print(f"   Estado: {fondo['estado']}")
        print(f"   Monto: {fondo['monto']}")
        print(f"   Área: {fondo['area']}")
        print(f"   Prioridad: {fondo['prioridad']}")
    
    # Guardar datos de prueba
    with open('plataforma_mejorada_test.json', 'w', encoding='utf-8') as f:
        json.dump(platform.fondos_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n💾 Datos guardados en: plataforma_mejorada_test.json")
    
    return len(platform.fondos_data)

if __name__ == "__main__":
    try:
        total_fondos = test_plataforma_mejorada()
        print(f"\n✅ Prueba completada exitosamente: {total_fondos} fondos en la plataforma")
        print("\n🚀 Plataforma IICA Chile Mejorada lista para usar!")
        print("🌐 Accede a: http://127.0.0.1:5004")
    except Exception as e:
        print(f"❌ Error en la prueba: {e}")
        import traceback
        traceback.print_exc()

