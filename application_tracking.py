"""
Sistema de Seguimiento de Aplicaciones para IICA Chile
Permite a los usuarios hacer seguimiento de sus postulaciones
"""

import json
import os
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import uuid

class ApplicationTracker:
    def __init__(self):
        self.applications_file = 'data/aplicaciones.json'
        self.applications = self._load_applications()
        
    def _load_applications(self) -> List[Dict[str, Any]]:
        """Cargar aplicaciones desde archivo JSON"""
        if os.path.exists(self.applications_file):
            try:
                with open(self.applications_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except:
                return []
        return []
        
    def _save_applications(self):
        """Guardar aplicaciones en archivo JSON"""
        os.makedirs(os.path.dirname(self.applications_file), exist_ok=True)
        with open(self.applications_file, 'w', encoding='utf-8') as f:
            json.dump(self.applications, f, ensure_ascii=False, indent=2)
            
    def create_application(self, user_email: str, project_id: int, project_name: str, 
                          documents: List[str], status: str = 'enviada') -> str:
        """Crear nueva aplicación"""
        application_id = str(uuid.uuid4())
        
        application = {
            'id': application_id,
            'user_email': user_email,
            'project_id': project_id,
            'project_name': project_name,
            'documents': documents,
            'status': status,
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat(),
            'timeline': [
                {
                    'status': 'enviada',
                    'date': datetime.now().isoformat(),
                    'description': 'Aplicación enviada exitosamente'
                }
            ]
        }
        
        self.applications.append(application)
        self._save_applications()
        return application_id
        
    def update_application_status(self, application_id: str, new_status: str, 
                                description: str = None) -> bool:
        """Actualizar estado de aplicación"""
        for application in self.applications:
            if application['id'] == application_id:
                application['status'] = new_status
                application['updated_at'] = datetime.now().isoformat()
                
                # Agregar al timeline
                application['timeline'].append({
                    'status': new_status,
                    'date': datetime.now().isoformat(),
                    'description': description or f"Estado actualizado a: {new_status}"
                })
                
                self._save_applications()
                return True
        return False
        
    def get_user_applications(self, user_email: str) -> List[Dict[str, Any]]:
        """Obtener aplicaciones de un usuario"""
        return [app for app in self.applications if app['user_email'] == user_email]
        
    def get_application(self, application_id: str) -> Optional[Dict[str, Any]]:
        """Obtener aplicación específica"""
        for application in self.applications:
            if application['id'] == application_id:
                return application
        return None
        
    def get_applications_by_status(self, status: str) -> List[Dict[str, Any]]:
        """Obtener aplicaciones por estado"""
        return [app for app in self.applications if app['status'] == status]
        
    def get_statistics(self) -> Dict[str, Any]:
        """Obtener estadísticas de aplicaciones"""
        total = len(self.applications)
        by_status = {}
        by_month = {}
        
        for application in self.applications:
            # Por estado
            status = application['status']
            by_status[status] = by_status.get(status, 0) + 1
            
            # Por mes
            month = application['created_at'][:7]  # YYYY-MM
            by_month[month] = by_month.get(month, 0) + 1
            
        return {
            'total_applications': total,
            'by_status': by_status,
            'by_month': by_month,
            'success_rate': self._calculate_success_rate()
        }
        
    def _calculate_success_rate(self) -> float:
        """Calcular tasa de éxito de aplicaciones"""
        if not self.applications:
            return 0.0
            
        successful = len([app for app in self.applications 
                         if app['status'] in ['aprobada', 'adjudicada']])
        return (successful / len(self.applications)) * 100
        
    def get_recent_applications(self, days: int = 30) -> List[Dict[str, Any]]:
        """Obtener aplicaciones recientes"""
        cutoff_date = datetime.now() - timedelta(days=days)
        recent_apps = []
        
        for application in self.applications:
            app_date = datetime.fromisoformat(application['created_at'])
            if app_date >= cutoff_date:
                recent_apps.append(application)
                
        return sorted(recent_apps, key=lambda x: x['created_at'], reverse=True)

# Instancia global del sistema de seguimiento
application_tracker = ApplicationTracker()

# Crear aplicaciones de ejemplo
application_tracker.create_application(
    user_email="usuario@ejemplo.com",
    project_id=1,
    project_name="Proyecto de Agricultura Sostenible",
    documents=["Cédula de identidad", "Certificado de antecedentes", "Propuesta técnica"],
    status="enviada"
)

application_tracker.create_application(
    user_email="usuario@ejemplo.com",
    project_id=2,
    project_name="Desarrollo Rural Integral",
    documents=["Cédula de identidad", "Certificado de antecedentes", "Propuesta técnica", "Presupuesto detallado"],
    status="en_revision"
)

application_tracker.create_application(
    user_email="otro@ejemplo.com",
    project_id=3,
    project_name="Innovación Tecnológica Agrícola",
    documents=["Cédula de identidad", "Certificado de antecedentes", "Propuesta técnica"],
    status="aprobada"
)
