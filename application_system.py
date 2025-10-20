import json
import os
from datetime import datetime
from typing import Dict, List, Any
import uuid

class ApplicationSystem:
    """Sistema completo de postulación a proyectos"""
    
    def __init__(self):
        self.applications_file = 'data/applications.json'
        self.templates_file = 'data/application_templates.json'
        self.requirements_file = 'data/project_requirements.json'
        
        # Crear directorio si no existe
        os.makedirs('data', exist_ok=True)
        
        # Inicializar archivos si no existen
        self._initialize_files()
    
    def _initialize_files(self):
        """Inicializa los archivos del sistema de postulación"""
        if not os.path.exists(self.applications_file):
            with open(self.applications_file, 'w', encoding='utf-8') as f:
                json.dump([], f)
        
        if not os.path.exists(self.templates_file):
            self._create_application_templates()
        
        if not os.path.exists(self.requirements_file):
            self._create_project_requirements()
    
    def _create_application_templates(self):
        """Crea plantillas de postulación para diferentes tipos de proyectos"""
        templates = {
            'agricultura_sostenible': {
                'name': 'Postulación Agricultura Sostenible',
                'description': 'Formulario para proyectos de agricultura sostenible',
                'sections': [
                    {
                        'title': 'Información del Proyecto',
                        'fields': [
                            {'name': 'nombre_proyecto', 'label': 'Nombre del Proyecto', 'type': 'text', 'required': True},
                            {'name': 'descripcion', 'label': 'Descripción del Proyecto', 'type': 'textarea', 'required': True},
                            {'name': 'objetivos', 'label': 'Objetivos Específicos', 'type': 'textarea', 'required': True},
                            {'name': 'metodologia', 'label': 'Metodología', 'type': 'textarea', 'required': True}
                        ]
                    },
                    {
                        'title': 'Información Financiera',
                        'fields': [
                            {'name': 'presupuesto_total', 'label': 'Presupuesto Total (USD)', 'type': 'number', 'required': True},
                            {'name': 'financiamiento_solicitado', 'label': 'Financiamiento Solicitado (USD)', 'type': 'number', 'required': True},
                            {'name': 'contraparte', 'label': 'Contraparte (USD)', 'type': 'number', 'required': True},
                            {'name': 'fuentes_adicionales', 'label': 'Otras Fuentes de Financiamiento', 'type': 'textarea', 'required': False}
                        ]
                    },
                    {
                        'title': 'Información del Postulante',
                        'fields': [
                            {'name': 'nombre_organizacion', 'label': 'Nombre de la Organización', 'type': 'text', 'required': True},
                            {'name': 'rut', 'label': 'RUT', 'type': 'text', 'required': True},
                            {'name': 'direccion', 'label': 'Dirección', 'type': 'text', 'required': True},
                            {'name': 'telefono', 'label': 'Teléfono', 'type': 'tel', 'required': True},
                            {'name': 'email', 'label': 'Email', 'type': 'email', 'required': True},
                            {'name': 'representante_legal', 'label': 'Representante Legal', 'type': 'text', 'required': True}
                        ]
                    }
                ]
            },
            'juventudes_rurales': {
                'name': 'Postulación Juventudes Rurales',
                'description': 'Formulario para proyectos de juventudes rurales',
                'sections': [
                    {
                        'title': 'Información del Proyecto',
                        'fields': [
                            {'name': 'nombre_proyecto', 'label': 'Nombre del Proyecto', 'type': 'text', 'required': True},
                            {'name': 'descripcion', 'label': 'Descripción del Proyecto', 'type': 'textarea', 'required': True},
                            {'name': 'beneficiarios', 'label': 'Número de Jóvenes Beneficiarios', 'type': 'number', 'required': True},
                            {'name': 'edad_promedio', 'label': 'Edad Promedio de Beneficiarios', 'type': 'number', 'required': True}
                        ]
                    },
                    {
                        'title': 'Impacto Social',
                        'fields': [
                            {'name': 'impacto_comunidad', 'label': 'Impacto en la Comunidad', 'type': 'textarea', 'required': True},
                            {'name': 'sostenibilidad', 'label': 'Sostenibilidad del Proyecto', 'type': 'textarea', 'required': True},
                            {'name': 'innovacion', 'label': 'Elementos de Innovación', 'type': 'textarea', 'required': True}
                        ]
                    }
                ]
            },
            'innovacion_tecnologica': {
                'name': 'Postulación Innovación Tecnológica',
                'description': 'Formulario para proyectos de innovación tecnológica',
                'sections': [
                    {
                        'title': 'Información Técnica',
                        'fields': [
                            {'name': 'nombre_proyecto', 'label': 'Nombre del Proyecto', 'type': 'text', 'required': True},
                            {'name': 'tecnologia', 'label': 'Tecnología a Implementar', 'type': 'textarea', 'required': True},
                            {'name': 'innovacion', 'label': 'Elementos de Innovación', 'type': 'textarea', 'required': True},
                            {'name': 'viabilidad_tecnica', 'label': 'Viabilidad Técnica', 'type': 'textarea', 'required': True}
                        ]
                    },
                    {
                        'title': 'Recursos Humanos',
                        'fields': [
                            {'name': 'equipo_tecnico', 'label': 'Equipo Técnico', 'type': 'textarea', 'required': True},
                            {'name': 'experiencia', 'label': 'Experiencia del Equipo', 'type': 'textarea', 'required': True},
                            {'name': 'capacitacion', 'label': 'Plan de Capacitación', 'type': 'textarea', 'required': True}
                        ]
                    }
                ]
            }
        }
        
        with open(self.templates_file, 'w', encoding='utf-8') as f:
            json.dump(templates, f, ensure_ascii=False, indent=2)
    
    def _create_project_requirements(self):
        """Crea requisitos específicos para cada proyecto"""
        requirements = {
            'documentos_generales': [
                'Cédula de Identidad del Representante Legal',
                'RUT de la Organización',
                'Constitución de la Organización',
                'Certificado de Vigencia',
                'Certificado de Antecedentes',
                'Declaración de Interés Público'
            ],
            'documentos_tecnicos': [
                'Perfil del Proyecto',
                'Cronograma de Actividades',
                'Presupuesto Detallado',
                'Plan de Monitoreo y Evaluación',
                'Análisis de Riesgos',
                'Plan de Sostenibilidad'
            ],
            'documentos_financieros': [
                'Estados Financieros (2 años)',
                'Certificado Bancario',
                'Declaración de Ingresos',
                'Presupuesto de Contraparte',
                'Carta de Compromiso Financiero'
            ],
            'documentos_especificos': {
                'agricultura_sostenible': [
                    'Certificado de Buenas Prácticas Agrícolas',
                    'Plan de Manejo Ambiental',
                    'Certificado de Origen de Semillas',
                    'Plan de Gestión de Residuos'
                ],
                'juventudes_rurales': [
                    'Registro de Jóvenes Beneficiarios',
                    'Plan de Capacitación',
                    'Certificado de Organización Juvenil',
                    'Plan de Participación Comunitaria'
                ],
                'innovacion_tecnologica': [
                    'Especificaciones Técnicas',
                    'Plan de Implementación Tecnológica',
                    'Certificado de Capacitación Técnica',
                    'Plan de Transferencia Tecnológica'
                ]
            }
        }
        
        with open(self.requirements_file, 'w', encoding='utf-8') as f:
            json.dump(requirements, f, ensure_ascii=False, indent=2)
    
    def get_application_template(self, project_type: str) -> Dict[str, Any]:
        """Obtiene la plantilla de postulación para un tipo de proyecto"""
        with open(self.templates_file, 'r', encoding='utf-8') as f:
            templates = json.load(f)
        
        return templates.get(project_type, templates['agricultura_sostenible'])
    
    def get_project_requirements(self, project_type: str = None) -> Dict[str, Any]:
        """Obtiene los requisitos para un tipo de proyecto"""
        with open(self.requirements_file, 'r', encoding='utf-8') as f:
            requirements = json.load(f)
        
        if project_type:
            requirements['documentos_especificos'] = requirements['documentos_especificos'].get(project_type, [])
        
        return requirements
    
    def submit_application(self, project_id: str, application_data: Dict[str, Any]) -> Dict[str, Any]:
        """Envía una postulación a un proyecto"""
        application_id = str(uuid.uuid4())
        
        application = {
            'id': application_id,
            'project_id': project_id,
            'submission_date': datetime.now().isoformat(),
            'status': 'pending',
            'data': application_data,
            'review_notes': [],
            'documents_uploaded': [],
            'evaluation_score': None
        }
        
        # Cargar aplicaciones existentes
        applications = []
        if os.path.exists(self.applications_file):
            with open(self.applications_file, 'r', encoding='utf-8') as f:
                applications = json.load(f)
        
        # Agregar nueva aplicación
        applications.append(application)
        
        # Guardar
        with open(self.applications_file, 'w', encoding='utf-8') as f:
            json.dump(applications, f, ensure_ascii=False, indent=2)
        
        return {
            'success': True,
            'application_id': application_id,
            'message': 'Postulación enviada exitosamente'
        }
    
    def get_applications_by_project(self, project_id: str) -> List[Dict[str, Any]]:
        """Obtiene todas las postulaciones para un proyecto"""
        with open(self.applications_file, 'r', encoding='utf-8') as f:
            applications = json.load(f)
        
        return [app for app in applications if app['project_id'] == project_id]
    
    def get_application_by_id(self, application_id: str) -> Dict[str, Any]:
        """Obtiene una postulación específica por ID"""
        with open(self.applications_file, 'r', encoding='utf-8') as f:
            applications = json.load(f)
        
        for app in applications:
            if app['id'] == application_id:
                return app
        
        return None
    
    def update_application_status(self, application_id: str, status: str, notes: str = None) -> bool:
        """Actualiza el estado de una postulación"""
        with open(self.applications_file, 'r', encoding='utf-8') as f:
            applications = json.load(f)
        
        for app in applications:
            if app['id'] == application_id:
                app['status'] = status
                if notes:
                    app['review_notes'].append({
                        'date': datetime.now().isoformat(),
                        'note': notes
                    })
                
                with open(self.applications_file, 'w', encoding='utf-8') as f:
                    json.dump(applications, f, ensure_ascii=False, indent=2)
                return True
        
        return False
    
    def get_application_stats(self) -> Dict[str, Any]:
        """Obtiene estadísticas de postulaciones"""
        with open(self.applications_file, 'r', encoding='utf-8') as f:
            applications = json.load(f)
        
        total = len(applications)
        pending = len([app for app in applications if app['status'] == 'pending'])
        approved = len([app for app in applications if app['status'] == 'approved'])
        rejected = len([app for app in applications if app['status'] == 'rejected'])
        
        return {
            'total_applications': total,
            'pending': pending,
            'approved': approved,
            'rejected': rejected,
            'approval_rate': f"{(approved/total)*100:.1f}%" if total > 0 else "0%"
        }
    
    def get_project_type_from_area(self, area: str) -> str:
        """Determina el tipo de proyecto basado en el área de interés"""
        area_mapping = {
            'Agricultura Sostenible': 'agricultura_sostenible',
            'Juventudes Rurales': 'juventudes_rurales',
            'Innovación Tecnológica': 'innovacion_tecnologica',
            'Gestión Hídrica': 'agricultura_sostenible',
            'Desarrollo Rural': 'juventudes_rurales',
            'Seguridad Alimentaria': 'agricultura_sostenible',
            'Comercio Agrícola': 'agricultura_sostenible'
        }
        
        return area_mapping.get(area, 'agricultura_sostenible')

