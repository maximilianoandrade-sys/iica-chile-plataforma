"""
Sistema Avanzado de Notificaciones para IICA Chile
Notificaciones en tiempo real, alertas por email, y seguimiento de proyectos
"""

import smtplib
import json
import os
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Dict, Any
import threading
import time

class NotificationSystem:
    def __init__(self):
        self.notifications = []
        self.subscribers = []
        self.email_config = {
            'smtp_server': 'smtp.gmail.com',
            'smtp_port': 587,
            'email': 'iica.chile@example.com',
            'password': 'password_example'
        }
        
    def add_subscriber(self, email: str, areas: List[str], notification_types: List[str]):
        """Agregar suscriptor a notificaciones"""
        subscriber = {
            'email': email,
            'areas': areas,
            'notification_types': notification_types,
            'subscribed_at': datetime.now().isoformat(),
            'active': True
        }
        self.subscribers.append(subscriber)
        return True
        
    def create_notification(self, title: str, message: str, notification_type: str, 
                          priority: str = 'medium', areas: List[str] = None):
        """Crear nueva notificación"""
        notification = {
            'id': len(self.notifications) + 1,
            'title': title,
            'message': message,
            'type': notification_type,
            'priority': priority,
            'areas': areas or [],
            'created_at': datetime.now().isoformat(),
            'read': False,
            'sent': False
        }
        self.notifications.append(notification)
        
        # Enviar a suscriptores relevantes
        self._send_to_subscribers(notification)
        return notification
        
    def _send_to_subscribers(self, notification: Dict[str, Any]):
        """Enviar notificación a suscriptores relevantes"""
        for subscriber in self.subscribers:
            if not subscriber['active']:
                continue
                
            # Verificar si el suscriptor está interesado en esta notificación
            if (notification['type'] in subscriber['notification_types'] and 
                (not notification['areas'] or 
                 any(area in subscriber['areas'] for area in notification['areas']))):
                
                self._send_email(subscriber['email'], notification)
                
    def _send_email(self, email: str, notification: Dict[str, Any]):
        """Enviar email de notificación"""
        try:
            msg = MIMEMultipart()
            msg['From'] = self.email_config['email']
            msg['To'] = email
            msg['Subject'] = f"🔔 IICA Chile - {notification['title']}"
            
            body = f"""
            <h2>🔔 Nueva Notificación IICA Chile</h2>
            <h3>{notification['title']}</h3>
            <p>{notification['message']}</p>
            <p><strong>Tipo:</strong> {notification['type']}</p>
            <p><strong>Prioridad:</strong> {notification['priority']}</p>
            <p><strong>Fecha:</strong> {notification['created_at']}</p>
            <hr>
            <p><small>IICA Chile - Plataforma de Proyectos</small></p>
            """
            
            msg.attach(MIMEText(body, 'html'))
            
            # En un entorno real, aquí se enviaría el email
            print(f"📧 Notificación enviada a {email}: {notification['title']}")
            
        except Exception as e:
            print(f"❌ Error enviando email a {email}: {e}")
            
    def get_notifications(self, limit: int = 10, unread_only: bool = False):
        """Obtener notificaciones"""
        notifications = self.notifications.copy()
        
        if unread_only:
            notifications = [n for n in notifications if not n['read']]
            
        notifications.sort(key=lambda x: x['created_at'], reverse=True)
        return notifications[:limit]
        
    def mark_as_read(self, notification_id: int):
        """Marcar notificación como leída"""
        for notification in self.notifications:
            if notification['id'] == notification_id:
                notification['read'] = True
                return True
        return False
        
    def get_stats(self):
        """Obtener estadísticas de notificaciones"""
        total = len(self.notifications)
        unread = len([n for n in self.notifications if not n['read']])
        by_type = {}
        by_priority = {}
        
        for notification in self.notifications:
            n_type = notification['type']
            priority = notification['priority']
            
            by_type[n_type] = by_type.get(n_type, 0) + 1
            by_priority[priority] = by_priority.get(priority, 0) + 1
            
        return {
            'total_notifications': total,
            'unread_notifications': unread,
            'by_type': by_type,
            'by_priority': by_priority,
            'subscribers': len(self.subscribers)
        }

# Instancia global del sistema de notificaciones
notification_system = NotificationSystem()

# Configurar notificaciones de ejemplo
notification_system.add_subscriber(
    email="admin@iica.cl",
    areas=["Agricultura Sostenible", "Desarrollo Rural", "Innovación Tecnológica"],
    notification_types=["nuevo_proyecto", "cierre_proximo", "oportunidad"]
)

# Crear notificaciones de ejemplo
notification_system.create_notification(
    title="Nuevo Proyecto Disponible",
    message="Se ha agregado un nuevo proyecto de Agricultura Sostenible con financiamiento de $50,000 USD",
    notification_type="nuevo_proyecto",
    priority="high",
    areas=["Agricultura Sostenible"]
)

notification_system.create_notification(
    title="Cierre Próximo",
    message="3 proyectos cerrarán sus postulaciones en los próximos 7 días",
    notification_type="cierre_proximo",
    priority="medium"
)

notification_system.create_notification(
    message="Nueva funcionalidad: Sistema de notificaciones en tiempo real",
    title="Actualización de Plataforma",
    notification_type="sistema",
    priority="low"
)
