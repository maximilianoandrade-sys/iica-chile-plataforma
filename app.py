"""
ARCHIVO PRINCIPAL PARA RENDER
Este archivo asegura que Render use siempre app_enhanced.py con template didáctico
FORZADO: Este archivo DEBE ser usado por Render
VERSIÓN: Se actualiza automáticamente en cada deploy para forzar actualización
"""

import os
import sys
from datetime import datetime

# FORZAR: Asegurar que app_enhanced esté en el path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Generar versión única basada en timestamp para forzar actualización
DEPLOY_VERSION = datetime.now().strftime('%Y%m%d_%H%M%S')
BUILD_TIMESTAMP = datetime.now().isoformat()

# Guardar versión en variable de entorno para uso en la app
os.environ['APP_VERSION'] = DEPLOY_VERSION
os.environ['BUILD_TIMESTAMP'] = BUILD_TIMESTAMP

# Importar directamente desde app_enhanced
try:
    from app_enhanced import app
    
    # Agregar headers anti-caché a todas las respuestas
    @app.after_request
    def add_no_cache_headers(response):
        """Agregar headers para evitar caché del navegador"""
        response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate, max-age=0'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
        response.headers['X-App-Version'] = DEPLOY_VERSION
        response.headers['X-Build-Timestamp'] = BUILD_TIMESTAMP
        return response
    
    print("=" * 80)
    print("✅ app_enhanced.py importado correctamente")
except ImportError as e:
    print(f"❌ ERROR: No se pudo importar app_enhanced: {e}")
    print("📂 Archivos en directorio actual:")
    print(os.listdir('.'))
    raise

# Logging para verificar
print("=" * 80)
print("🚀 INICIANDO APLICACIÓN DESDE app.py")
print("✅ Importando desde app_enhanced.py")
print("✅ Template: home_didactico.html (INTERFAZ DIDÁCTICA)")
print(f"✅ Versión de Deploy: {DEPLOY_VERSION}")
print(f"✅ Timestamp de Build: {BUILD_TIMESTAMP}")
print("✅ Headers anti-caché activados")
print("=" * 80)

# Verificar que el template existe
template_path = os.path.join('templates', 'home_didactico.html')
if os.path.exists(template_path):
    print(f"✅ Template encontrado: {template_path}")
else:
    print(f"⚠️ Template NO encontrado: {template_path}")
    print(f"📂 Archivos en templates: {os.listdir('templates') if os.path.exists('templates') else 'No existe'}")
    # Intentar copiar o crear el template si no existe
    print("⚠️ ADVERTENCIA: El template home_didactico.html no está disponible")
    print("⚠️ La aplicación usará un fallback")

# Verificar que app esté definido
if 'app' not in globals():
    raise RuntimeError("❌ ERROR CRÍTICO: 'app' no está definido después de importar app_enhanced")

print(f"✅ Aplicación Flask lista: {app}")
print(f"✅ Nombre de la app: {app.name}")
print("=" * 80)

# Si se ejecuta directamente
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    print(f"🚀 Iniciando servidor en puerto {port}, debug={debug}")
    app.run(debug=debug, host='0.0.0.0', port=port)
