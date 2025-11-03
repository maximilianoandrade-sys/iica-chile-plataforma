#!/usr/bin/env python3
"""
Pruebas básicas para la aplicación Flask
"""

import pytest
import sys
import os

# Agregar el directorio raíz al path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app_final import app

@pytest.fixture
def client():
    """Cliente de prueba para la aplicación"""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_home_page(client):
    """Prueba que la página principal carga correctamente"""
    response = client.get('/')
    assert response.status_code == 200
    assert b'IICA Chile' in response.data

def test_health_endpoint(client):
    """Prueba que el endpoint de salud funciona"""
    response = client.get('/health')
    assert response.status_code == 200
    data = response.get_json()
    assert data['status'] == 'healthy'

def test_busqueda_avanzada_page(client):
    """Prueba que la página de búsqueda avanzada carga"""
    response = client.get('/busqueda-avanzada')
    assert response.status_code == 200
    assert b'Busqueda Avanzada' in response.data

def test_api_verificar_enlaces(client):
    """Prueba que la API de verificación de enlaces funciona"""
    response = client.get('/api/verificar-enlaces')
    assert response.status_code == 200
    data = response.get_json()
    assert 'success' in data

def test_api_busqueda_avanzada(client):
    """Prueba que la API de búsqueda avanzada funciona"""
    response = client.get('/api/busqueda-avanzada')
    assert response.status_code == 200
    data = response.get_json()
    assert 'success' in data
    assert 'resultados' in data

def test_api_sugerencias(client):
    """Prueba que la API de sugerencias funciona"""
    response = client.get('/api/sugerencias?texto=agricultura')
    assert response.status_code == 200
    data = response.get_json()
    assert 'success' in data
    assert 'sugerencias' in data

def test_proyecto_detalle(client):
    """Prueba que la página de detalle de proyecto funciona"""
    response = client.get('/proyecto/0')
    assert response.status_code == 200
    assert b'Proyecto' in response.data

def test_favicon(client):
    """Prueba que el favicon responde correctamente"""
    response = client.get('/favicon.ico')
    assert response.status_code == 204

def test_404_error(client):
    """Prueba que las páginas no encontradas devuelven 404"""
    response = client.get('/pagina-inexistente')
    assert response.status_code == 404

def test_static_files(client):
    """Prueba que los archivos estáticos se sirven correctamente"""
    response = client.get('/static/css/institucional.css')
    assert response.status_code == 200

if __name__ == '__main__':
    pytest.main([__file__])
