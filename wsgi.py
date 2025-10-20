#!/usr/bin/env python3
"""
Archivo WSGI para Render
Configuración específica para producción
"""

import os
import sys
from app_final import app

# Configuración para Render
if __name__ == "__main__":
    # Obtener puerto de Render
    port = int(os.environ.get('PORT', 5000))
    
    # Configurar para producción
    app.run(host='0.0.0.0', port=port, debug=False)
