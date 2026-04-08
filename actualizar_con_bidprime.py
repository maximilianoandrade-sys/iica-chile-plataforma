#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Script para actualizar la base de datos con proyectos de BIDPrime
"""

import pandas as pd
import os
from scrapers.bidprime import obtener_proyectos_bidprime, obtener_proyectos_bidprime_avanzado

def actualizar_base_datos_bidprime():
    """Actualiza la base de datos con proyectos de BIDPrime"""
    print("🚀 Actualizando base de datos con BIDPrime...")
    
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
    
    # Obtener proyectos de BIDPrime
    print("\n🔍 Obteniendo proyectos de BIDPrime...")
    proyectos_bidprime = obtener_proyectos_bidprime()
    proyectos_bidprime_avanzado = obtener_proyectos_bidprime_avanzado()
    
    # Combinar todos los proyectos
    todos_los_proyectos = proyectos_existentes + proyectos_bidprime + proyectos_bidprime_avanzado
    
    # Eliminar duplicados basados en el nombre
    proyectos_unicos = []
    nombres_vistos = set()
    
    for proyecto in todos_los_proyectos:
        nombre = proyecto.get('Nombre', '')
        if nombre and nombre not in nombres_vistos:
            proyectos_unicos.append(proyecto)
            nombres_vistos.add(nombre)
    
    print(f"✅ Proyectos únicos: {len(proyectos_unicos)}")
    print(f"📈 Nuevos proyectos BIDPrime: {len(proyectos_bidprime) + len(proyectos_bidprime_avanzado)}")
    
    # Guardar en Excel
    try:
        df_actualizado = pd.DataFrame(proyectos_unicos)
        df_actualizado.to_excel(data_path, index=False)
        print(f"💾 Base de datos actualizada guardada en: {data_path}")
        
        # Estadísticas por fuente
        fuentes = df_actualizado['Fuente'].value_counts()
        print("\n📊 Distribución por fuente:")
        for fuente, cantidad in fuentes.items():
            print(f"   {fuente}: {cantidad} proyectos")
        
        # Estadísticas por área
        areas = df_actualizado['Área de interés'].value_counts()
        print("\n🎯 Distribución por área de interés:")
        for area, cantidad in areas.items():
            print(f"   {area}: {cantidad} proyectos")
        
        return True
        
    except Exception as e:
        print(f"❌ Error guardando base de datos: {e}")
        return False

def mostrar_proyectos_bidprime():
    """Muestra los proyectos de BIDPrime encontrados"""
    print("\n🔍 Proyectos de BIDPrime encontrados:")
    print("=" * 60)
    
    proyectos = obtener_proyectos_bidprime()
    proyectos_avanzados = obtener_proyectos_bidprime_avanzado()
    
    todos_proyectos = proyectos + proyectos_avanzados
    
    for i, proyecto in enumerate(todos_proyectos, 1):
        print(f"\n{i}. {proyecto['Nombre']}")
        print(f"   Fuente: {proyecto['Fuente']}")
        print(f"   Monto: {proyecto['Monto']}")
        print(f"   Área: {proyecto['Área de interés']}")
        print(f"   Estado: {proyecto['Estado']}")
        print(f"   Cierre: {proyecto['Fecha cierre']}")
        print(f"   Enlace: {proyecto['Enlace']}")
        if 'Requisitos' in proyecto:
            print(f"   Requisitos: {proyecto['Requisitos']}")
        if 'Beneficiarios' in proyecto:
            print(f"   Beneficiarios: {proyecto['Beneficiarios']}")

def verificar_enlaces_bidprime():
    """Verifica que los enlaces de BIDPrime sean válidos"""
    print("\n🔗 Verificando enlaces de BIDPrime...")
    
    proyectos = obtener_proyectos_bidprime()
    proyectos_avanzados = obtener_proyectos_bidprime_avanzado()
    
    todos_proyectos = proyectos + proyectos_avanzados
    
    enlaces_validos = 0
    enlaces_invalidos = 0
    
    for proyecto in todos_proyectos:
        enlace = proyecto.get('Enlace', '')
        if enlace and enlace.startswith('https://www.bidprime.com/'):
            enlaces_validos += 1
        else:
            enlaces_invalidos += 1
    
    print(f"✅ Enlaces válidos: {enlaces_validos}")
    print(f"❌ Enlaces inválidos: {enlaces_invalidos}")
    print(f"📊 Total enlaces: {enlaces_validos + enlaces_invalidos}")

if __name__ == "__main__":
    print("🌐 BIDPRIME INTEGRATION - IICA CHILE")
    print("=" * 50)
    
    # Mostrar proyectos encontrados
    mostrar_proyectos_bidprime()
    
    # Verificar enlaces
    verificar_enlaces_bidprime()
    
    # Actualizar base de datos
    print("\n" + "=" * 50)
    if actualizar_base_datos_bidprime():
        print("\n🎉 ¡BIDPrime integrado exitosamente!")
        print("📊 La plataforma ahora incluye proyectos de BIDPrime")
        print("🌐 Accede a: https://www.bidprime.com/")
    else:
        print("\n❌ Error en la integración de BIDPrime")
