"""
Sistema de Seguridad Avanzado para la Plataforma IICA
Protección contra ataques, validación de datos y monitoreo de seguridad
"""

import os
import hashlib
import hmac
import time
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from functools import wraps
from flask import request, jsonify, current_app
import sqlite3
from collections import defaultdict, deque

class SecurityManager:
    def __init__(self, db_path="security.db"):
        self.db_path = db_path
        self.init_database()
        self.rate_limits = defaultdict(lambda: deque())
        self.blocked_ips = set()
        self.suspicious_activities = defaultdict(int)
        
        # Configuración de seguridad
        self.max_requests_per_minute = 60
        self.max_requests_per_hour = 1000
        self.block_duration = 3600  # 1 hora
        self.suspicious_threshold = 10
    
    def init_database(self):
        """Inicializa la base de datos de seguridad"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Tabla de intentos de acceso
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS access_attempts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ip_address TEXT,
                user_agent TEXT,
                endpoint TEXT,
                method TEXT,
                status_code INTEGER,
                response_time REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Tabla de IPs bloqueadas
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS blocked_ips (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ip_address TEXT UNIQUE,
                reason TEXT,
                blocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP,
                is_active BOOLEAN DEFAULT 1
            )
        ''')
        
        # Tabla de actividades sospechosas
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS suspicious_activities (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ip_address TEXT,
                activity_type TEXT,
                description TEXT,
                severity INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Tabla de tokens de API
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS api_tokens (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                token_hash TEXT UNIQUE,
                user_id TEXT,
                permissions TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP,
                is_active BOOLEAN DEFAULT 1
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def generate_api_token(self, user_id: str, permissions: List[str], expires_hours: int = 24) -> str:
        """Genera un token de API seguro"""
        token_data = {
            'user_id': user_id,
            'permissions': permissions,
            'created_at': time.time(),
            'expires_at': time.time() + (expires_hours * 3600)
        }
        
        token_string = json.dumps(token_data, sort_keys=True)
        token_hash = hashlib.sha256(token_string.encode()).hexdigest()
        
        # Guardar token en base de datos
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO api_tokens 
            (token_hash, user_id, permissions, expires_at)
            VALUES (?, ?, ?, ?)
        ''', (token_hash, user_id, json.dumps(permissions), 
              datetime.fromtimestamp(token_data['expires_at'])))
        
        conn.commit()
        conn.close()
        
        return token_hash
    
    def validate_api_token(self, token: str) -> Optional[Dict]:
        """Valida un token de API"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT user_id, permissions, expires_at, is_active
            FROM api_tokens 
            WHERE token_hash = ? AND is_active = 1
        ''', (token,))
        
        result = cursor.fetchone()
        conn.close()
        
        if not result:
            return None
        
        user_id, permissions, expires_at, is_active = result
        
        # Verificar si el token ha expirado
        if datetime.now() > datetime.fromisoformat(expires_at):
            return None
        
        return {
            'user_id': user_id,
            'permissions': json.loads(permissions),
            'is_active': bool(is_active)
        }
    
    def check_rate_limit(self, ip_address: str) -> bool:
        """Verifica si una IP ha excedido el límite de velocidad"""
        current_time = time.time()
        
        # Limpiar requests antiguos
        while (self.rate_limits[ip_address] and 
               current_time - self.rate_limits[ip_address][0] > 3600):  # 1 hora
            self.rate_limits[ip_address].popleft()
        
        # Verificar límite por minuto
        minute_requests = [req_time for req_time in self.rate_limits[ip_address] 
                          if current_time - req_time < 60]
        
        if len(minute_requests) > self.max_requests_per_minute:
            return False
        
        # Verificar límite por hora
        if len(self.rate_limits[ip_address]) > self.max_requests_per_hour:
            return False
        
        # Agregar request actual
        self.rate_limits[ip_address].append(current_time)
        
        return True
    
    def log_access_attempt(self, ip_address: str, user_agent: str, endpoint: str, 
                          method: str, status_code: int, response_time: float):
        """Registra un intento de acceso"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO access_attempts 
            (ip_address, user_agent, endpoint, method, status_code, response_time)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (ip_address, user_agent, endpoint, method, status_code, response_time))
        
        conn.commit()
        conn.close()
    
    def block_ip(self, ip_address: str, reason: str, duration_hours: int = 24):
        """Bloquea una IP"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        expires_at = datetime.now() + timedelta(hours=duration_hours)
        
        cursor.execute('''
            INSERT OR REPLACE INTO blocked_ips 
            (ip_address, reason, expires_at)
            VALUES (?, ?, ?)
        ''', (ip_address, reason, expires_at))
        
        conn.commit()
        conn.close()
        
        self.blocked_ips.add(ip_address)
    
    def is_ip_blocked(self, ip_address: str) -> bool:
        """Verifica si una IP está bloqueada"""
        if ip_address in self.blocked_ips:
            return True
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT COUNT(*) FROM blocked_ips 
            WHERE ip_address = ? AND is_active = 1 AND expires_at > CURRENT_TIMESTAMP
        ''', (ip_address,))
        
        is_blocked = cursor.fetchone()[0] > 0
        conn.close()
        
        if is_blocked:
            self.blocked_ips.add(ip_address)
        
        return is_blocked
    
    def log_suspicious_activity(self, ip_address: str, activity_type: str, 
                               description: str, severity: int = 1):
        """Registra actividad sospechosa"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO suspicious_activities 
            (ip_address, activity_type, description, severity)
            VALUES (?, ?, ?, ?)
        ''', (ip_address, activity_type, description, severity))
        
        conn.commit()
        conn.close()
        
        # Incrementar contador de actividades sospechosas
        self.suspicious_activities[ip_address] += 1
        
        # Bloquear IP si excede el umbral
        if self.suspicious_activities[ip_address] >= self.suspicious_threshold:
            self.block_ip(ip_address, f"Actividad sospechosa excesiva: {activity_type}")
    
    def detect_attack_patterns(self, ip_address: str, endpoint: str, 
                              user_agent: str) -> List[str]:
        """Detecta patrones de ataque"""
        attacks = []
        
        # Detectar SQL injection
        sql_patterns = ["'", '"', ';', '--', '/*', '*/', 'union', 'select', 'drop', 'insert']
        if any(pattern in endpoint.lower() for pattern in sql_patterns):
            attacks.append("SQL_INJECTION")
        
        # Detectar XSS
        xss_patterns = ['<script>', '</script>', 'javascript:', 'onload=', 'onerror=']
        if any(pattern in endpoint.lower() for pattern in xss_patterns):
            attacks.append("XSS")
        
        # Detectar path traversal
        if '../' in endpoint or '..\\' in endpoint:
            attacks.append("PATH_TRAVERSAL")
        
        # Detectar user agent sospechoso
        suspicious_agents = ['sqlmap', 'nikto', 'nmap', 'masscan', 'zap']
        if any(agent in user_agent.lower() for agent in suspicious_agents):
            attacks.append("SCANNING_TOOL")
        
        return attacks
    
    def get_security_stats(self, days: int = 7) -> Dict:
        """Obtiene estadísticas de seguridad"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Total de requests
        cursor.execute('''
            SELECT COUNT(*) FROM access_attempts 
            WHERE created_at >= datetime('now', '-{} days')
        '''.format(days))
        total_requests = cursor.fetchone()[0]
        
        # Requests por status code
        cursor.execute('''
            SELECT status_code, COUNT(*) as count
            FROM access_attempts 
            WHERE created_at >= datetime('now', '-{} days')
            GROUP BY status_code
            ORDER BY count DESC
        '''.format(days))
        status_codes = cursor.fetchall()
        
        # IPs más activas
        cursor.execute('''
            SELECT ip_address, COUNT(*) as requests
            FROM access_attempts 
            WHERE created_at >= datetime('now', '-{} days')
            GROUP BY ip_address 
            ORDER BY requests DESC 
            LIMIT 10
        '''.format(days))
        top_ips = cursor.fetchall()
        
        # Actividades sospechosas
        cursor.execute('''
            SELECT activity_type, COUNT(*) as count
            FROM suspicious_activities 
            WHERE created_at >= datetime('now', '-{} days')
            GROUP BY activity_type
            ORDER BY count DESC
        '''.format(days))
        suspicious_activities = cursor.fetchall()
        
        # IPs bloqueadas
        cursor.execute('''
            SELECT COUNT(*) FROM blocked_ips 
            WHERE is_active = 1 AND expires_at > CURRENT_TIMESTAMP
        ''')
        blocked_ips_count = cursor.fetchone()[0]
        
        conn.close()
        
        return {
            'total_requests': total_requests,
            'status_codes': dict(status_codes),
            'top_ips': top_ips,
            'suspicious_activities': dict(suspicious_activities),
            'blocked_ips_count': blocked_ips_count
        }
    
    def cleanup_old_data(self, days: int = 30):
        """Limpia datos antiguos de seguridad"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('DELETE FROM access_attempts WHERE created_at < datetime("now", "-{} days")'.format(days))
        cursor.execute('DELETE FROM suspicious_activities WHERE created_at < datetime("now", "-{} days")'.format(days))
        cursor.execute('DELETE FROM blocked_ips WHERE expires_at < CURRENT_TIMESTAMP')
        cursor.execute('DELETE FROM api_tokens WHERE expires_at < CURRENT_TIMESTAMP')
        
        conn.commit()
        conn.close()

# Instancia global del sistema de seguridad
security_manager = SecurityManager()

def require_api_token(f):
    """Decorador para requerir token de API"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        
        if not token:
            return jsonify({'error': 'Token de API requerido'}), 401
        
        token_data = security_manager.validate_api_token(token)
        if not token_data:
            return jsonify({'error': 'Token inválido o expirado'}), 401
        
        # Agregar información del token al request
        request.token_data = token_data
        
        return f(*args, **kwargs)
    return decorated_function

def rate_limit(max_requests_per_minute=60):
    """Decorador para limitar velocidad de requests"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            ip_address = request.remote_addr
            
            if not security_manager.check_rate_limit(ip_address):
                security_manager.log_suspicious_activity(
                    ip_address, "RATE_LIMIT_EXCEEDED", 
                    f"Excedido límite de {max_requests_per_minute} requests por minuto"
                )
                return jsonify({'error': 'Límite de velocidad excedido'}), 429
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def security_monitor(f):
    """Decorador para monitoreo de seguridad"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        start_time = time.time()
        ip_address = request.remote_addr
        user_agent = request.headers.get('User-Agent', '')
        endpoint = request.endpoint
        method = request.method
        
        # Verificar si la IP está bloqueada
        if security_manager.is_ip_blocked(ip_address):
            return jsonify({'error': 'IP bloqueada'}), 403
        
        # Detectar patrones de ataque
        attacks = security_manager.detect_attack_patterns(
            ip_address, request.url, user_agent
        )
        
        if attacks:
            for attack in attacks:
                security_manager.log_suspicious_activity(
                    ip_address, attack, f"Patrón de ataque detectado: {attack}"
                )
            return jsonify({'error': 'Actividad sospechosa detectada'}), 403
        
        # Ejecutar función
        try:
            response = f(*args, **kwargs)
            status_code = response[1] if isinstance(response, tuple) else 200
        except Exception as e:
            status_code = 500
            response = jsonify({'error': 'Error interno del servidor'}), 500
        
        # Registrar intento de acceso
        response_time = time.time() - start_time
        security_manager.log_access_attempt(
            ip_address, user_agent, endpoint, method, status_code, response_time
        )
        
        return response
    return decorated_function

def validate_input(data: Dict, required_fields: List[str], 
                  field_types: Dict[str, type] = None) -> List[str]:
    """Valida datos de entrada"""
    errors = []
    
    # Verificar campos requeridos
    for field in required_fields:
        if field not in data or not data[field]:
            errors.append(f"Campo requerido: {field}")
    
    # Verificar tipos de datos
    if field_types:
        for field, expected_type in field_types.items():
            if field in data and not isinstance(data[field], expected_type):
                errors.append(f"Tipo incorrecto para {field}: esperado {expected_type.__name__}")
    
    return errors

def sanitize_input(text: str) -> str:
    """Sanitiza entrada de texto"""
    if not text:
        return ""
    
    # Remover caracteres peligrosos
    dangerous_chars = ['<', '>', '"', "'", '&', ';', '(', ')', '{', '}']
    for char in dangerous_chars:
        text = text.replace(char, '')
    
    # Limitar longitud
    return text[:1000] if len(text) > 1000 else text
