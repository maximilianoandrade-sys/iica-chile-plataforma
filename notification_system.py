"""
Sistema de Notificaciones Inteligente para la Plataforma IICA
Notifica sobre nuevos proyectos, alertas y actualizaciones
"""

import json
import os
import smtplib
import time
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Dict, Any
import sqlite3
from collections import defaultdict

class NotificationManager:
    def __init__(self, db_path="notifications.db"):
        self.db_path = db_path
        self.init_database()
        self.email_config = self.load_email_config()
    
    def init_database(self):
        """Inicializa la base de datos de notificaciones"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Tabla de suscripciones
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS subscriptions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE,
                areas_interes TEXT,
                fuentes TEXT,
                monto_minimo REAL,
                monto_maximo REAL,
                frecuencia TEXT DEFAULT 'daily',
                activo BOOLEAN DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Tabla de notificaciones enviadas
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS sent_notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT,
                notification_type TEXT,
                subject TEXT,
                content TEXT,
                sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (email) REFERENCES subscriptions (email)
            )
        ''')
        
        # Tabla de proyectos nuevos
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS new_projects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_name TEXT,
                source TEXT,
                area TEXT,
                amount REAL,
                deadline TEXT,
                url TEXT,
                discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                notified BOOLEAN DEFAULT 0
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def load_email_config(self):
        """Carga configuración de email"""
        config_file = "email_config.json"
        if os.path.exists(config_file):
            with open(config_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {
            "smtp_server": "smtp.gmail.com",
            "smtp_port": 587,
            "username": "",
            "password": "",
            "from_email": "noreply@iica-chile.com"
        }
    
    def save_email_config(self, config):
        """Guarda configuración de email"""
        with open("email_config.json", 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=2)
        self.email_config = config
    
    def subscribe_user(self, email: str, areas_interes: List[str], fuentes: List[str] = None, 
                     monto_minimo: float = 0, monto_maximo: float = None, frecuencia: str = "daily"):
        """Suscribe un usuario a notificaciones"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO subscriptions 
            (email, areas_interes, fuentes, monto_minimo, monto_maximo, frecuencia)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (email, json.dumps(areas_interes), json.dumps(fuentes or []), 
              monto_minimo, monto_maximo, frecuencia))
        
        conn.commit()
        conn.close()
    
    def unsubscribe_user(self, email: str):
        """Desuscribe un usuario"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('UPDATE subscriptions SET activo = 0 WHERE email = ?', (email,))
        
        conn.commit()
        conn.close()
    
    def add_new_project(self, project: Dict):
        """Agrega un proyecto nuevo para notificación"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO new_projects 
            (project_name, source, area, amount, deadline, url)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (project.get('Nombre', ''), project.get('Fuente', ''), 
              project.get('Área de interés', ''), project.get('Monto', 0),
              project.get('Fecha cierre', ''), project.get('Enlace', '')))
        
        conn.commit()
        conn.close()
    
    def get_subscribers_for_project(self, project: Dict) -> List[str]:
        """Obtiene suscriptores que podrían estar interesados en un proyecto"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        project_area = project.get('Área de interés', '')
        project_source = project.get('Fuente', '')
        project_amount = self.parse_amount(project.get('Monto', 0))
        
        cursor.execute('''
            SELECT email, areas_interes, fuentes, monto_minimo, monto_maximo
            FROM subscriptions 
            WHERE activo = 1
        ''')
        
        subscribers = []
        for row in cursor.fetchall():
            email, areas_str, fuentes_str, monto_min, monto_max = row
            
            # Verificar área de interés
            areas = json.loads(areas_str) if areas_str else []
            if areas and project_area not in areas:
                continue
            
            # Verificar fuente
            fuentes = json.loads(fuentes_str) if fuentes_str else []
            if fuentes and project_source not in fuentes:
                continue
            
            # Verificar monto
            if monto_min and project_amount < monto_min:
                continue
            if monto_max and project_amount > monto_max:
                continue
            
            subscribers.append(email)
        
        conn.close()
        return subscribers
    
    def parse_amount(self, amount_str):
        """Parsea el monto de un string a float"""
        if not amount_str or amount_str in ['Consultar', 'Variable']:
            return 0
        
        try:
            import re
            numbers = re.findall(r'[\d,]+', str(amount_str))
            if numbers:
                return float(numbers[0].replace(',', ''))
            return 0
        except:
            return 0
    
    def send_notification(self, email: str, subject: str, content: str, notification_type: str = "project"):
        """Envía una notificación por email"""
        if not self.email_config.get("username") or not self.email_config.get("password"):
            print(f"Email no configurado. Notificación para {email}: {subject}")
            return False
        
        try:
            msg = MIMEMultipart()
            msg['From'] = self.email_config["from_email"]
            msg['To'] = email
            msg['Subject'] = subject
            
            msg.attach(MIMEText(content, 'html', 'utf-8'))
            
            server = smtplib.SMTP(self.email_config["smtp_server"], self.email_config["smtp_port"])
            server.starttls()
            server.login(self.email_config["username"], self.email_config["password"])
            server.send_message(msg)
            server.quit()
            
            # Registrar notificación enviada
            self.log_notification(email, notification_type, subject, content)
            return True
            
        except Exception as e:
            print(f"Error enviando email a {email}: {e}")
            return False
    
    def log_notification(self, email: str, notification_type: str, subject: str, content: str):
        """Registra una notificación enviada"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO sent_notifications 
            (email, notification_type, subject, content)
            VALUES (?, ?, ?, ?)
        ''', (email, notification_type, subject, content))
        
        conn.commit()
        conn.close()
    
    def generate_project_notification(self, project: Dict) -> tuple:
        """Genera contenido de notificación para un proyecto"""
        subject = f"🎯 Nuevo Proyecto: {project.get('Nombre', 'Sin nombre')}"
        
        content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #2c5aa0; border-bottom: 2px solid #2c5aa0; padding-bottom: 10px;">
                    🎯 Nuevo Proyecto Disponible
                </h2>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #2c5aa0; margin-top: 0;">{project.get('Nombre', 'Sin nombre')}</h3>
                    
                    <p><strong>📅 Fecha de cierre:</strong> {project.get('Fecha cierre', 'No especificada')}</p>
                    <p><strong>💰 Monto:</strong> {project.get('Monto', 'Consultar')}</p>
                    <p><strong>🏢 Fuente:</strong> {project.get('Fuente', 'No especificada')}</p>
                    <p><strong>🎯 Área de interés:</strong> {project.get('Área de interés', 'No especificada')}</p>
                    <p><strong>📊 Estado:</strong> {project.get('Estado', 'No especificado')}</p>
                    
                    <div style="margin-top: 20px;">
                        <a href="{project.get('Enlace', '#')}" 
                           style="background: #2c5aa0; color: white; padding: 12px 24px; 
                                  text-decoration: none; border-radius: 5px; display: inline-block;">
                            🔗 Ver Proyecto Completo
                        </a>
                    </div>
                </div>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; 
                           font-size: 12px; color: #666;">
                    <p>Esta notificación fue enviada por la Plataforma IICA Chile.</p>
                    <p>Para dejar de recibir estas notificaciones, puedes desuscribirte 
                       <a href="mailto:oficina.chile@iica.int?subject=Desuscribir">aquí</a>.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        return subject, content
    
    def process_new_projects(self):
        """Procesa proyectos nuevos y envía notificaciones"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Obtener proyectos nuevos no notificados
        cursor.execute('''
            SELECT * FROM new_projects 
            WHERE notified = 0
            ORDER BY discovered_at DESC
        ''')
        
        projects = cursor.fetchall()
        
        for project_row in projects:
            project_id, project_name, source, area, amount, deadline, url, discovered_at, notified = project_row
            
            project = {
                'Nombre': project_name,
                'Fuente': source,
                'Área de interés': area,
                'Monto': amount,
                'Fecha cierre': deadline,
                'Enlace': url
            }
            
            # Obtener suscriptores interesados
            subscribers = self.get_subscribers_for_project(project)
            
            if subscribers:
                subject, content = self.generate_project_notification(project)
                
                # Enviar a cada suscriptor
                for email in subscribers:
                    self.send_notification(email, subject, content, "new_project")
                
                # Marcar como notificado
                cursor.execute('UPDATE new_projects SET notified = 1 WHERE id = ?', (project_id,))
        
        conn.commit()
        conn.close()
    
    def send_daily_summary(self):
        """Envía resumen diario a suscriptores"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Obtener proyectos del día
        cursor.execute('''
            SELECT COUNT(*) as total_projects
            FROM new_projects 
            WHERE DATE(discovered_at) = DATE('now')
        ''')
        total_projects = cursor.fetchone()[0]
        
        # Obtener suscriptores con frecuencia diaria
        cursor.execute('''
            SELECT email, areas_interes, fuentes
            FROM subscriptions 
            WHERE activo = 1 AND frecuencia = 'daily'
        ''')
        
        subscribers = cursor.fetchall()
        
        for email, areas_str, fuentes_str in subscribers:
            subject = f"📊 Resumen Diario IICA - {total_projects} nuevos proyectos"
            
            content = f"""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #2c5aa0; border-bottom: 2px solid #2c5aa0; padding-bottom: 10px;">
                        📊 Resumen Diario - Plataforma IICA
                    </h2>
                    
                    <p>Hola,</p>
                    <p>Te enviamos un resumen de la actividad de hoy en la Plataforma IICA:</p>
                    
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #2c5aa0; margin-top: 0;">📈 Estadísticas del Día</h3>
                        <ul>
                            <li><strong>Nuevos proyectos:</strong> {total_projects}</li>
                            <li><strong>Total de fuentes monitoreadas:</strong> 30+</li>
                            <li><strong>Áreas cubiertas:</strong> Agricultura, Desarrollo Rural, Sostenibilidad, Innovación</li>
                        </ul>
                    </div>
                    
                    <div style="margin-top: 30px;">
                        <a href="http://localhost:5000" 
                           style="background: #2c5aa0; color: white; padding: 12px 24px; 
                                  text-decoration: none; border-radius: 5px; display: inline-block;">
                            🔍 Ver Todos los Proyectos
                        </a>
                    </div>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; 
                               font-size: 12px; color: #666;">
                        <p>Esta notificación fue enviada por la Plataforma IICA Chile.</p>
                        <p>Para dejar de recibir estas notificaciones, puedes desuscribirte 
                           <a href="mailto:oficina.chile@iica.int?subject=Desuscribir">aquí</a>.</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            self.send_notification(email, subject, content, "daily_summary")
        
        conn.close()
    
    def get_notification_stats(self) -> Dict:
        """Obtiene estadísticas de notificaciones"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Total de suscriptores
        cursor.execute('SELECT COUNT(*) FROM subscriptions WHERE activo = 1')
        total_subscribers = cursor.fetchone()[0]
        
        # Notificaciones enviadas hoy
        cursor.execute('''
            SELECT COUNT(*) FROM sent_notifications 
            WHERE DATE(sent_at) = DATE('now')
        ''')
        notifications_today = cursor.fetchone()[0]
        
        # Proyectos nuevos hoy
        cursor.execute('''
            SELECT COUNT(*) FROM new_projects 
            WHERE DATE(discovered_at) = DATE('now')
        ''')
        new_projects_today = cursor.fetchone()[0]
        
        conn.close()
        
        return {
            'total_subscribers': total_subscribers,
            'notifications_today': notifications_today,
            'new_projects_today': new_projects_today
        }

# Instancia global del sistema de notificaciones
notification_manager = NotificationManager()
