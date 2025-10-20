"""
Sistema de Analytics Avanzado para la Plataforma IICA
Rastrea comportamiento de usuarios, búsquedas y rendimiento
"""

import json
import os
import time
from datetime import datetime, timedelta
from collections import defaultdict, Counter
import sqlite3
from typing import Dict, List, Any

class AnalyticsManager:
    def __init__(self, db_path="analytics.db"):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Inicializa la base de datos de analytics"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Tabla de sesiones de usuario
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT UNIQUE,
                ip_address TEXT,
                user_agent TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                total_requests INTEGER DEFAULT 0
            )
        ''')
        
        # Tabla de búsquedas
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS searches (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT,
                query TEXT,
                filters TEXT,
                results_count INTEGER,
                search_time REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (session_id) REFERENCES user_sessions (session_id)
            )
        ''')
        
        # Tabla de clics en proyectos
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS project_clicks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT,
                project_name TEXT,
                project_source TEXT,
                project_url TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (session_id) REFERENCES user_sessions (session_id)
            )
        ''')
        
        # Tabla de exportaciones
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS exports (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT,
                export_type TEXT,
                record_count INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (session_id) REFERENCES user_sessions (session_id)
            )
        ''')
        
        # Tabla de rendimiento
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS performance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                endpoint TEXT,
                response_time REAL,
                memory_usage REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def track_session(self, session_id: str, ip_address: str, user_agent: str):
        """Rastrea una sesión de usuario"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO user_sessions 
            (session_id, ip_address, user_agent, last_activity, total_requests)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP, 
                    COALESCE((SELECT total_requests FROM user_sessions WHERE session_id = ?), 0) + 1)
        ''', (session_id, ip_address, user_agent, session_id))
        
        conn.commit()
        conn.close()
    
    def track_search(self, session_id: str, query: str, filters: Dict, results_count: int, search_time: float):
        """Rastrea una búsqueda"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO searches 
            (session_id, query, filters, results_count, search_time)
            VALUES (?, ?, ?, ?, ?)
        ''', (session_id, query, json.dumps(filters), results_count, search_time))
        
        conn.commit()
        conn.close()
    
    def track_project_click(self, session_id: str, project_name: str, project_source: str, project_url: str):
        """Rastrea un clic en un proyecto"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO project_clicks 
            (session_id, project_name, project_source, project_url)
            VALUES (?, ?, ?, ?)
        ''', (session_id, project_name, project_source, project_url))
        
        conn.commit()
        conn.close()
    
    def track_export(self, session_id: str, export_type: str, record_count: int):
        """Rastrea una exportación"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO exports 
            (session_id, export_type, record_count)
            VALUES (?, ?, ?)
        ''', (session_id, export_type, record_count))
        
        conn.commit()
        conn.close()
    
    def track_performance(self, endpoint: str, response_time: float, memory_usage: float = 0):
        """Rastrea el rendimiento"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO performance 
            (endpoint, response_time, memory_usage)
            VALUES (?, ?, ?)
        ''', (endpoint, response_time, memory_usage))
        
        conn.commit()
        conn.close()
    
    def get_search_analytics(self, days: int = 30) -> Dict:
        """Obtiene analytics de búsquedas"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Búsquedas más populares
        cursor.execute('''
            SELECT query, COUNT(*) as count 
            FROM searches 
            WHERE created_at >= datetime('now', '-{} days')
            AND query != ''
            GROUP BY query 
            ORDER BY count DESC 
            LIMIT 10
        '''.format(days))
        popular_searches = cursor.fetchall()
        
        # Filtros más utilizados
        cursor.execute('''
            SELECT filters, COUNT(*) as count 
            FROM searches 
            WHERE created_at >= datetime('now', '-{} days')
            AND filters != '{}'
            GROUP BY filters 
            ORDER BY count DESC 
            LIMIT 10
        '''.format(days, days))
        popular_filters = cursor.fetchall()
        
        # Tiempo promedio de búsqueda
        cursor.execute('''
            SELECT AVG(search_time) as avg_time 
            FROM searches 
            WHERE created_at >= datetime('now', '-{} days')
        '''.format(days))
        avg_search_time = cursor.fetchone()[0] or 0
        
        # Total de búsquedas
        cursor.execute('''
            SELECT COUNT(*) as total 
            FROM searches 
            WHERE created_at >= datetime('now', '-{} days')
        '''.format(days))
        total_searches = cursor.fetchone()[0]
        
        conn.close()
        
        return {
            'popular_searches': popular_searches,
            'popular_filters': popular_filters,
            'avg_search_time': round(avg_search_time, 3),
            'total_searches': total_searches
        }
    
    def get_project_analytics(self, days: int = 30) -> Dict:
        """Obtiene analytics de proyectos"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Proyectos más clicados
        cursor.execute('''
            SELECT project_name, project_source, COUNT(*) as clicks 
            FROM project_clicks 
            WHERE created_at >= datetime('now', '-{} days')
            GROUP BY project_name, project_source 
            ORDER BY clicks DESC 
            LIMIT 10
        '''.format(days))
        popular_projects = cursor.fetchall()
        
        # Fuentes más populares
        cursor.execute('''
            SELECT project_source, COUNT(*) as clicks 
            FROM project_clicks 
            WHERE created_at >= datetime('now', '-{} days')
            GROUP BY project_source 
            ORDER BY clicks DESC 
            LIMIT 10
        '''.format(days))
        popular_sources = cursor.fetchall()
        
        # Total de clics
        cursor.execute('''
            SELECT COUNT(*) as total 
            FROM project_clicks 
            WHERE created_at >= datetime('now', '-{} days')
        '''.format(days))
        total_clicks = cursor.fetchone()[0]
        
        conn.close()
        
        return {
            'popular_projects': popular_projects,
            'popular_sources': popular_sources,
            'total_clicks': total_clicks
        }
    
    def get_performance_analytics(self, days: int = 7) -> Dict:
        """Obtiene analytics de rendimiento"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Tiempo promedio de respuesta por endpoint
        cursor.execute('''
            SELECT endpoint, AVG(response_time) as avg_time, COUNT(*) as requests
            FROM performance 
            WHERE created_at >= datetime('now', '-{} days')
            GROUP BY endpoint 
            ORDER BY avg_time DESC
        '''.format(days))
        endpoint_performance = cursor.fetchall()
        
        # Rendimiento general
        cursor.execute('''
            SELECT AVG(response_time) as avg_time, MAX(response_time) as max_time, MIN(response_time) as min_time
            FROM performance 
            WHERE created_at >= datetime('now', '-{} days')
        '''.format(days))
        general_performance = cursor.fetchone()
        
        conn.close()
        
        return {
            'endpoint_performance': endpoint_performance,
            'general_performance': {
                'avg_time': round(general_performance[0] or 0, 3),
                'max_time': round(general_performance[1] or 0, 3),
                'min_time': round(general_performance[2] or 0, 3)
            }
        }
    
    def get_user_analytics(self, days: int = 30) -> Dict:
        """Obtiene analytics de usuarios"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Sesiones activas
        cursor.execute('''
            SELECT COUNT(DISTINCT session_id) as unique_sessions
            FROM user_sessions 
            WHERE last_activity >= datetime('now', '-{} days')
        '''.format(days))
        unique_sessions = cursor.fetchone()[0]
        
        # Total de requests
        cursor.execute('''
            SELECT SUM(total_requests) as total_requests
            FROM user_sessions 
            WHERE last_activity >= datetime('now', '-{} days')
        '''.format(days))
        total_requests = cursor.fetchone()[0] or 0
        
        # Exportaciones
        cursor.execute('''
            SELECT export_type, COUNT(*) as count, SUM(record_count) as total_records
            FROM exports 
            WHERE created_at >= datetime('now', '-{} days')
            GROUP BY export_type
        '''.format(days))
        export_stats = cursor.fetchall()
        
        conn.close()
        
        return {
            'unique_sessions': unique_sessions,
            'total_requests': total_requests,
            'export_stats': export_stats
        }
    
    def cleanup_old_data(self, days: int = 90):
        """Limpia datos antiguos"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM searches WHERE created_at < datetime("now", "-{} days")'.format(days))
        cursor.execute('DELETE FROM project_clicks WHERE created_at < datetime("now", "-{} days")'.format(days))
        cursor.execute('DELETE FROM exports WHERE created_at < datetime("now", "-{} days")'.format(days))
        cursor.execute('DELETE FROM performance WHERE created_at < datetime("now", "-{} days")'.format(days))
        cursor.execute('DELETE FROM user_sessions WHERE last_activity < datetime("now", "-{} days")'.format(days))
        
        conn.commit()
        conn.close()

# Instancia global de analytics
analytics_manager = AnalyticsManager()

def track_request(func):
    """Decorador para rastrear requests"""
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        
        # Rastrear rendimiento
        analytics_manager.track_performance(
            endpoint=func.__name__,
            response_time=end_time - start_time
        )
        
        return result
    return wrapper
