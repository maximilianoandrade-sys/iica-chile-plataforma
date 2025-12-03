"""
ARCHIVO PRINCIPAL PARA RENDER
Importa app_enhanced y configura headers anti-caché
"""

import os
from datetime import datetime

# Generar versión única para cache busting
# IMPORTANTE: Generar UNA SOLA VEZ y establecer en entorno ANTES de importar app_enhanced
# Esto garantiza que app_enhanced.py use las mismas versiones
DEPLOY_VERSION = datetime.now().strftime('%Y%m%d_%H%M%S')
BUILD_TIMESTAMP = datetime.now().isoformat()

# Guardar versión en variable de entorno ANTES de importar app_enhanced
# Esto asegura consistencia de versiones en todos los contextos
os.environ['APP_VERSION'] = DEPLOY_VERSION
os.environ['BUILD_TIMESTAMP'] = BUILD_TIMESTAMP

# Importar app desde app_enhanced (después de establecer variables de entorno)
from app_enhanced import app

# Agregar headers anti-caché a todas las respuestas
@app.after_request
def add_no_cache_headers(response):
    """Headers para evitar caché del navegador"""
    # Usar variables del entorno para garantizar consistencia
    version = os.environ.get('APP_VERSION', DEPLOY_VERSION)
    timestamp = os.environ.get('BUILD_TIMESTAMP', BUILD_TIMESTAMP)
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate, max-age=0'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    response.headers['X-App-Version'] = version
    response.headers['X-Build-Timestamp'] = timestamp
    return response

# Logging de inicio
print("=" * 80)
print("🚀 INICIANDO APLICACIÓN DESDE app.py")
print("✅ Importando desde app_enhanced.py")
print(f"✅ Versión: {DEPLOY_VERSION}")
print(f"✅ Timestamp: {BUILD_TIMESTAMP}")
print("=" * 80)

# Si se ejecuta directamente (desarrollo local)
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    print(f"🚀 Iniciando servidor en puerto {port}, debug={debug}")
    app.run(debug=debug, host='0.0.0.0', port=port)
