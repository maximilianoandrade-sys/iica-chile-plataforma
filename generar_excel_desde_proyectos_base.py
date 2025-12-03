#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para generar archivo Excel desde proyectos_base.py
Este archivo se ejecuta para crear data/proyectos.xlsx con los proyectos reales
"""

import os
from proyectos_base import convertir_proyectos_raw_a_formato
from utils_excel import guardar_excel

def generar_excel_proyectos():
    """Genera el archivo Excel con los proyectos desde proyectos_base.py"""
    print("🚀 Generando archivo Excel desde proyectos_base.py...")
    
    # Asegurar que el directorio data existe
    os.makedirs("data", exist_ok=True)
    
    # Convertir proyectos_raw al formato de la aplicación
    proyectos = convertir_proyectos_raw_a_formato()
    
    if not proyectos:
        print("❌ No se encontraron proyectos para generar Excel")
        return False
    
    # Ruta del archivo Excel
    excel_path = "data/proyectos.xlsx"
    
    # Guardar en Excel
    try:
        guardar_excel(proyectos, excel_path)
        print(f"✅ Excel generado exitosamente: {excel_path}")
        print(f"📊 Total de proyectos: {len(proyectos)}")
        
        # Mostrar resumen
        fuentes = set(p.get('Fuente', 'Sin fuente') for p in proyectos)
        print(f"📋 Fuentes: {', '.join(sorted(fuentes))}")
        
        return True
    except Exception as e:
        print(f"❌ Error generando Excel: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    generar_excel_proyectos()

