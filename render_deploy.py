#!/usr/bin/env python3
"""
Script de despliegue específico para Render
"""

import os
import sys

def setup_render():
    """Configuración específica para Render"""
    print("🚀 Configurando para Render...")
    
    # Variables de entorno para Render
    os.environ.setdefault('FLASK_ENV', 'production')
    os.environ.setdefault('PYTHON_VERSION', '3.11.9')
    
    # Configuración de logging
    import logging
    logging.basicConfig(level=logging.INFO)
    
    print("✅ Configuración de Render aplicada")

def start_app():
    """Inicia la aplicación para Render"""
    from app_final import app
    
    # Obtener puerto de Render
    port = int(os.environ.get('PORT', 5000))
    
    print(f"🌐 Iniciando en puerto {port}")
    print("✅ Aplicación lista para Render")
    
    # Ejecutar aplicación
    app.run(host='0.0.0.0', port=port, debug=False)

if __name__ == "__main__":
    setup_render()
    start_app()
