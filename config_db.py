"""
Configuración de Base de Datos
Soporta PostgreSQL (producción) y SQLite (desarrollo)
"""

import os
from urllib.parse import urlparse

class Config:
    """Configuración base"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    
    # Base de datos
    DATABASE_URL = os.environ.get('DATABASE_URL')
    
    # Fix para Render.com (postgres:// → postgresql://)
    if DATABASE_URL and DATABASE_URL.startswith('postgres://'):
        DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)
    
    # Fallback a SQLite para desarrollo local
    if not DATABASE_URL:
        basedir = os.path.abspath(os.path.dirname(__file__))
        DATABASE_URL = f'sqlite:///{os.path.join(basedir, "iica_chile.db")}'
    
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_pre_ping': True,  # Verificar conexiones antes de usar
        'pool_recycle': 300,    # Reciclar conexiones cada 5 minutos
    }
    
    # Flask-Login
    REMEMBER_COOKIE_DURATION = 86400 * 30  # 30 días
    
    # Paginación
    FONDOS_PER_PAGE = 20
    
    # Scraping
    SCRAPING_USER_AGENT = 'IICA-Chile-Bot/1.0 (https://iica-chile-plataforma.onrender.com)'
    SCRAPING_TIMEOUT = 15
    
    @staticmethod
    def is_postgresql():
        """Verificar si estamos usando PostgreSQL"""
        return 'postgresql' in Config.SQLALCHEMY_DATABASE_URI
    
    @staticmethod
    def get_db_info():
        """Obtener información de la BD"""
        url = urlparse(Config.SQLALCHEMY_DATABASE_URI)
        return {
            'type': 'PostgreSQL' if 'postgresql' in url.scheme else 'SQLite',
            'host': url.hostname or 'local',
            'database': url.path.lstrip('/') or 'iica_chile.db'
        }


class DevelopmentConfig(Config):
    """Configuración para desarrollo"""
    DEBUG = True
    TESTING = False


class ProductionConfig(Config):
    """Configuración para producción"""
    DEBUG = False
    TESTING = False
    
    # Forzar HTTPS en producción
    SESSION_COOKIE_SECURE = True
    REMEMBER_COOKIE_SECURE = True


# Seleccionar configuración según entorno
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}

def get_config():
    """Obtener configuración según entorno"""
    env = os.environ.get('FLASK_ENV', 'development')
    return config.get(env, config['default'])
