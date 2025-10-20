#!/usr/bin/env python3
"""
Archivo de inicio específico para Render
"""

import os
import sys
from app_final import app

# Configuración específica para Render
if __name__ == "__main__":
    # Obtener puerto de Render
    port = int(os.environ.get('PORT', 5000))
    
    print(f"🚀 Iniciando en Render - Puerto: {port}")
    print("✅ Configuración optimizada para producción")
    
    # Ejecutar aplicación
    app.run(host='0.0.0.0', port=port, debug=False)
