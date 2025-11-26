#!/usr/bin/env python3
"""
Archivo WSGI para Render
Configuración específica para producción

IMPORTANTE: Render usa render.yaml que especifica app_enhanced:app
Este archivo se mantiene por compatibilidad pero render.yaml tiene prioridad
"""

import os
import sys
from app_enhanced import app  # ACTUALIZADO: usar app_enhanced en lugar de app_final

# Configuración para Render
if __name__ == "__main__":
    # Obtener puerto de Render
    port = int(os.environ.get('PORT', 5000))
    
    # Configurar para producción
    print("🚀 Iniciando app_enhanced desde wsgi.py")
    print(f"✅ Puerto: {port}")
    app.run(host='0.0.0.0', port=port, debug=False)
