"""
Sistema de caché avanzado para la plataforma IICA
Optimiza el rendimiento y reduce la carga del servidor
"""

import json
import os
import time
from datetime import datetime, timedelta
from functools import wraps
import hashlib
import pickle

class CacheManager:
    def __init__(self, cache_dir="cache"):
        self.cache_dir = cache_dir
        if not os.path.exists(cache_dir):
            os.makedirs(cache_dir, exist_ok=True)
    
    def _get_cache_key(self, *args, **kwargs):
        """Genera una clave única para el caché"""
        key_data = str(args) + str(sorted(kwargs.items()))
        return hashlib.md5(key_data.encode()).hexdigest()
    
    def _get_cache_path(self, key):
        """Obtiene la ruta del archivo de caché"""
        return os.path.join(self.cache_dir, f"{key}.cache")
    
    def get(self, key, max_age=3600):
        """Obtiene datos del caché si no han expirado"""
        cache_path = self._get_cache_path(key)
        
        if not os.path.exists(cache_path):
            return None
        
        try:
            with open(cache_path, 'rb') as f:
                cache_data = pickle.load(f)
            
            # Verificar si el caché ha expirado
            if time.time() - cache_data['timestamp'] > max_age:
                os.remove(cache_path)
                return None
            
            return cache_data['data']
        except:
            return None
    
    def set(self, key, data, max_age=3600):
        """Guarda datos en el caché"""
        cache_path = self._get_cache_path(key)
        
        try:
            cache_data = {
                'data': data,
                'timestamp': time.time(),
                'max_age': max_age
            }
            
            with open(cache_path, 'wb') as f:
                pickle.dump(cache_data, f)
        except:
            pass
    
    def clear(self, pattern=None):
        """Limpia el caché"""
        if pattern:
            for filename in os.listdir(self.cache_dir):
                if pattern in filename:
                    os.remove(os.path.join(self.cache_dir, filename))
        else:
            for filename in os.listdir(self.cache_dir):
                if filename.endswith('.cache'):
                    os.remove(os.path.join(self.cache_dir, filename))
    
    def cleanup_expired(self):
        """Limpia archivos de caché expirados"""
        current_time = time.time()
        
        for filename in os.listdir(self.cache_dir):
            if filename.endswith('.cache'):
                cache_path = os.path.join(self.cache_dir, filename)
                try:
                    with open(cache_path, 'rb') as f:
                        cache_data = pickle.load(f)
                    
                    if current_time - cache_data['timestamp'] > cache_data.get('max_age', 3600):
                        os.remove(cache_path)
                except:
                    os.remove(cache_path)

# Instancia global del caché
cache_manager = CacheManager()

def cached(max_age=3600):
    """Decorador para cachear funciones"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generar clave de caché
            cache_key = cache_manager._get_cache_key(func.__name__, *args, **kwargs)
            
            # Intentar obtener del caché
            cached_result = cache_manager.get(cache_key, max_age)
            if cached_result is not None:
                return cached_result
            
            # Ejecutar función y guardar resultado
            result = func(*args, **kwargs)
            cache_manager.set(cache_key, result, max_age)
            
            return result
        return wrapper
    return decorator

def cache_proyectos(max_age=1800):  # 30 minutos
    """Decorador específico para cachear proyectos"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            cache_key = f"proyectos_{func.__name__}_{hash(str(args) + str(kwargs))}"
            
            cached_result = cache_manager.get(cache_key, max_age)
            if cached_result is not None:
                return cached_result
            
            result = func(*args, **kwargs)
            cache_manager.set(cache_key, result, max_age)
            
            return result
        return wrapper
    return decorator

def cache_estadisticas(max_age=3600):  # 1 hora
    """Decorador específico para cachear estadísticas"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            cache_key = f"stats_{func.__name__}_{hash(str(args) + str(kwargs))}"
            
            cached_result = cache_manager.get(cache_key, max_age)
            if cached_result is not None:
                return cached_result
            
            result = func(*args, **kwargs)
            cache_manager.set(cache_key, result, max_age)
            
            return result
        return wrapper
    return decorator

def invalidate_cache(pattern):
    """Invalida caché específico"""
    cache_manager.clear(pattern)

def cleanup_cache():
    """Limpia caché expirado"""
    cache_manager.cleanup_expired()

# Configuración de caché por tipo de datos
CACHE_CONFIG = {
    'proyectos': 1800,      # 30 minutos
    'estadisticas': 3600,   # 1 hora
    'instituciones': 7200,  # 2 horas
    'documentos': 7200,     # 2 horas
    'postulaciones': 3600,  # 1 hora
    'scraping': 900,        # 15 minutos
}
