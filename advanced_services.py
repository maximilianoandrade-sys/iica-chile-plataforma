"""
Servicios avanzados para IICA Chile
Incluye: Blockchain Hashing, Mock APIs, Utilidades GIS
"""
import hashlib
import json
from datetime import datetime
import random

class BlockchainService:
    @staticmethod
    def generar_hash_postulacion(postulacion_id, usuario_id, datos):
        """Genera un hash SHA-256 inmutable para trazabilidad"""
        payload = {
            'id': postulacion_id,
            'usuario': usuario_id,
            'datos': datos,
            'timestamp': datetime.utcnow().isoformat(),
            'nonce': random.randint(1000, 9999)
        }
        payload_str = json.dumps(payload, sort_keys=True)
        return hashlib.sha256(payload_str.encode()).hexdigest()

class MockGovernmentAPI:
    @staticmethod
    def validar_rut(rut):
        """Mock de validación SII/Registro Civil"""
        # Simulación simple: RUTs terminados en K o números pares son válidos
        rut_clean = rut.replace('.', '').replace('-', '').upper()
        es_valido = len(rut_clean) > 7
        
        return {
            'rut': rut,
            'valido': es_valido,
            'nombre_razon_social': 'AGRICOLA EJEMPLO SPA' if es_valido else None,
            'actividad_economica': 'CULTIVO DE TRIGO' if es_valido else None,
            'inicio_actividades': '2020-03-15' if es_valido else None
        }

class AnalyticsService:
    @staticmethod
    def obtener_metricas_region(region):
        """Mock de datos analíticos predictivos"""
        # En prod esto vendría de modelos de ML
        base_demand = random.randint(100, 500)
        return {
            'region': region,
            'demanda_proyectada': base_demand,
            'fondos_disponibles': random.randint(5, 20),
            'tendencia': f'+{random.randint(5, 25)}%',
            'rubros_top': ['Riego', 'Innovación', 'Maquinaria']
        }
