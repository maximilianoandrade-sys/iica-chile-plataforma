#!/usr/bin/env python3
"""
Script para verificar que todas las rutas funcionan
"""

from app_final import app

def test_routes():
    """Verifica todas las rutas de la aplicación"""
    print("🔍 Verificando rutas de la aplicación...")
    
    with app.test_client() as client:
        # Rutas principales
        routes_to_test = [
            '/',
            '/health',
            '/api/verificar-enlaces',
            '/proyecto/0',
            '/proyecto/1',
            '/proyecto/2'
        ]
        
        for route in routes_to_test:
            try:
                response = client.get(route)
                status = response.status_code
                if status == 200:
                    print(f"✅ {route} - OK")
                else:
                    print(f"❌ {route} - Status: {status}")
            except Exception as e:
                print(f"❌ {route} - Error: {e}")
    
    print("\n🎯 Verificación completada")

if __name__ == "__main__":
    test_routes()
