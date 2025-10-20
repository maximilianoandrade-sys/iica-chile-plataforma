#!/usr/bin/env python3
"""
Script para ejecutar la Plataforma IICA Chile
"""

import os
import sys
import subprocess

def verificar_dependencias():
    """Verifica que las dependencias estén instaladas"""
    try:
        import flask
        import pandas
        import openpyxl
        print("✅ Todas las dependencias están instaladas")
        return True
    except ImportError as e:
        print(f"❌ Faltan dependencias: {e}")
        print("💡 Ejecuta: pip install -r requirements.txt")
        return False

def instalar_dependencias():
    """Instala las dependencias si no están disponibles"""
    print("📦 Instalando dependencias...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Dependencias instaladas correctamente")
        return True
    except subprocess.CalledProcessError:
        print("❌ Error instalando dependencias")
        return False

def crear_directorios():
    """Crea los directorios necesarios"""
    directorios = ["data", "templates"]
    for directorio in directorios:
        os.makedirs(directorio, exist_ok=True)
        print(f"📁 Directorio '{directorio}' creado/verificado")

def main():
    """Función principal para ejecutar la aplicación"""
    print("🚀 Iniciando Plataforma IICA Chile...")
    
    # Crear directorios necesarios
    crear_directorios()
    
    # Verificar dependencias
    if not verificar_dependencias():
        print("🔧 Intentando instalar dependencias automáticamente...")
        if not instalar_dependencias():
            print("❌ No se pudieron instalar las dependencias automáticamente")
            print("💡 Instala manualmente con: pip install -r requirements.txt")
            return
    
    # Ejecutar la aplicación
    print("🎉 Iniciando servidor web...")
    print("🌐 La aplicación estará disponible en: http://localhost:5000")
    print("⏹️  Presiona Ctrl+C para detener el servidor")
    
    try:
        from app_working import app
        app.run(debug=True, host='0.0.0.0', port=5000)
    except KeyboardInterrupt:
        print("\n👋 Servidor detenido por el usuario")
    except Exception as e:
        print(f"❌ Error ejecutando la aplicación: {e}")

if __name__ == "__main__":
    main()
