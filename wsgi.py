#!/usr/bin/env python3
"""
Archivo WSGI para Render
Configuración específica para producción

IMPORTANTE: Render usa render.yaml que especifica app_enhanced:app
Este archivo se mantiene por compatibilidad pero render.yaml tiene prioridad
"""

import os
import sys
from datetime import datetime

# CRÍTICO: Establecer versiones ANTES de cualquier importación
# Esto garantiza consistencia incluso si se importa directamente app_enhanced
if 'APP_VERSION' not in os.environ:
    os.environ['APP_VERSION'] = datetime.now().strftime('%Y%m%d_%H%M%S')
if 'BUILD_TIMESTAMP' not in os.environ:
    os.environ['BUILD_TIMESTAMP'] = datetime.now().isoformat()

# Importar desde app.py que a su vez importa app_enhanced
# app.py establecerá las versiones correctamente, pero ya las tenemos como fallback
try:
    from app import app
    print("✅ WSGI: Importando desde app.py")
except ImportError:
    # Fallback: importar directamente (las versiones ya están en entorno)
    from app_enhanced import app
    print("✅ WSGI: Importando directamente desde app_enhanced.py (versiones ya establecidas)")

# Configuración para Render
if __name__ == "__main__":
    # Obtener puerto de Render
    port = int(os.environ.get('PORT', 5000))
    
    # Configurar para producción
    print("🚀 Iniciando app_enhanced desde wsgi.py")
    print(f"✅ Puerto: {port}")
    app.run(host='0.0.0.0', port=port, debug=False)
