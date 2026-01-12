"""
Modelos de Base de Datos - PostgreSQL
Sistema de fondos, usuarios y matching
"""

from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

db = SQLAlchemy()

class Usuario(UserMixin, db.Model):
    """Modelo de usuario con perfil agrícola"""
    __tablename__ = 'usuarios'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    nombre = db.Column(db.String(100))
    telefono = db.Column(db.String(20))
    
    # Perfil agrícola
    region = db.Column(db.String(50))
    comuna = db.Column(db.String(100))
    tipo_predio = db.Column(db.String(50))  # pequeño, mediano, grande
    hectareas = db.Column(db.Float)
    cultivos = db.Column(db.Text)  # JSON array como string
    necesidades = db.Column(db.Text)  # riego, maquinaria, capacitación, etc.
    
    # Metadata
    fecha_registro = db.Column(db.DateTime, default=datetime.utcnow)
    ultimo_acceso = db.Column(db.DateTime, default=datetime.utcnow)
    activo = db.Column(db.Boolean, default=True)
    
    # Relaciones
    favoritos = db.relationship('Favorito', backref='usuario', lazy='dynamic', cascade='all, delete-orphan')
    postulaciones = db.relationship('Postulacion', backref='usuario', lazy='dynamic', cascade='all, delete-orphan')
    
    def set_password(self, password):
        """Hashear contraseña"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Verificar contraseña"""
        return check_password_hash(self.password_hash, password)
    
    def get_cultivos_list(self):
        """Obtener cultivos como lista"""
        import json
        try:
            return json.loads(self.cultivos) if self.cultivos else []
        except:
            return []
    
    def set_cultivos_list(self, cultivos_list):
        """Guardar cultivos como JSON"""
        import json
        self.cultivos = json.dumps(cultivos_list)
    
    def __repr__(self):
        return f'<Usuario {self.email}>'


class Fondo(db.Model):
    """Modelo de fondo de financiamiento"""
    __tablename__ = 'fondos'
    
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(500), nullable=False, index=True)
    fuente = db.Column(db.String(100), nullable=False, index=True)
    descripcion = db.Column(db.Text)
    
    # Detalles financieros
    monto = db.Column(db.BigInteger)  # Monto en pesos chilenos
    monto_texto = db.Column(db.String(100))  # "Hasta $5.000.000"
    
    # Fechas
    fecha_apertura = db.Column(db.Date)
    fecha_cierre = db.Column(db.Date, index=True)
    
    # Clasificación
    area_interes = db.Column(db.String(100), index=True)
    estado = db.Column(db.String(50), default='Abierto', index=True)  # Abierto, Cerrado, Próximamente
    region = db.Column(db.String(50))  # Nacional o región específica
    
    # Requisitos
    beneficiarios = db.Column(db.Text)  # Quiénes pueden postular
    documentos_requeridos = db.Column(db.Text)  # JSON array
    criterios_elegibilidad = db.Column(db.Text)
    
    # Enlaces
    enlace = db.Column(db.String(500))
    enlace_postulacion = db.Column(db.String(500))
    enlace_bases = db.Column(db.String(500))
    
    # Metadata
    palabras_clave = db.Column(db.Text)  # Para búsqueda
    fecha_scraping = db.Column(db.DateTime, default=datetime.utcnow)
    activo = db.Column(db.Boolean, default=True)
    
    # Relaciones
    favoritos = db.relationship('Favorito', backref='fondo', lazy='dynamic', cascade='all, delete-orphan')
    postulaciones = db.relationship('Postulacion', backref='fondo', lazy='dynamic', cascade='all, delete-orphan')
    
    def get_documentos_list(self):
        """Obtener documentos como lista"""
        import json
        try:
            return json.loads(self.documentos_requeridos) if self.documentos_requeridos else []
        except:
            return []
    
    def esta_abierto(self):
        """Verificar si el fondo está abierto"""
        if self.estado.lower() != 'abierto':
            return False
        if self.fecha_cierre and self.fecha_cierre < datetime.now().date():
            return False
        return True
    
    def dias_restantes(self):
        """Calcular días restantes para cierre"""
        if not self.fecha_cierre:
            return None
        delta = self.fecha_cierre - datetime.now().date()
        return delta.days if delta.days > 0 else 0
    
    def __repr__(self):
        return f'<Fondo {self.nombre[:50]}...>'


class Favorito(db.Model):
    """Relación usuario-fondo favorito"""
    __tablename__ = 'favoritos'
    
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    fondo_id = db.Column(db.Integer, db.ForeignKey('fondos.id'), nullable=False)
    fecha_agregado = db.Column(db.DateTime, default=datetime.utcnow)
    notas = db.Column(db.Text)  # Notas personales del usuario
    
    # Índice único para evitar duplicados
    __table_args__ = (db.UniqueConstraint('usuario_id', 'fondo_id', name='_usuario_fondo_uc'),)
    
    def __repr__(self):
        return f'<Favorito U:{self.usuario_id} F:{self.fondo_id}>'


class Postulacion(db.Model):
    """Seguimiento de postulaciones de usuarios"""
    __tablename__ = 'postulaciones'
    
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    fondo_id = db.Column(db.Integer, db.ForeignKey('fondos.id'), nullable=False)
    
    # Estado de la postulación
    estado = db.Column(db.String(50), default='En preparación')  
    # Estados: En preparación, Enviada, En revisión, Aprobada, Rechazada
    
    fecha_inicio = db.Column(db.DateTime, default=datetime.utcnow)
    fecha_envio = db.Column(db.DateTime)
    fecha_resultado = db.Column(db.DateTime)
    
    # Detalles
    monto_solicitado = db.Column(db.BigInteger)
    notas = db.Column(db.Text)
    documentos_completados = db.Column(db.Text)  # JSON array de documentos listos
    
    def __repr__(self):
        return f'<Postulacion U:{self.usuario_id} F:{self.fondo_id} {self.estado}>'


class ActualizacionFondo(db.Model):
    """Log de actualizaciones de scrapers"""
    __tablename__ = 'actualizaciones_fondos'
    
    id = db.Column(db.Integer, primary_key=True)
    fuente = db.Column(db.String(100), nullable=False, index=True)
    fecha = db.Column(db.DateTime, default=datetime.utcnow)
    fondos_nuevos = db.Column(db.Integer, default=0)
    fondos_actualizados = db.Column(db.Integer, default=0)
    errores = db.Column(db.Text)
    exitoso = db.Column(db.Boolean, default=True)
    
    def __repr__(self):
        return f'<Actualización {self.fuente} - {self.fecha}>'
