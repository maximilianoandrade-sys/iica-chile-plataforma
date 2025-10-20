#!/usr/bin/env python3
"""
Configuración específica para Render
"""

import os

# Configuración de Render
RENDER_CONFIG = {
    'DEBUG': False,
    'HOST': '0.0.0.0',
    'PORT': int(os.environ.get('PORT', 5000)),
    'FLASK_ENV': 'production'
}

# Configuración de base de datos para Render
DATABASE_CONFIG = {
    'DATA_PATH': 'data/proyectos_fortalecidos.xlsx',
    'BACKUP_PATH': 'data/backups/',
    'LOG_PATH': 'logs/'
}

# Configuración de enlaces para Render
LINK_CONFIG = {
    'TIMEOUT': 10,
    'CACHE_DURATION': 24,  # horas
    'RETRY_ATTEMPTS': 3
}
