"""
ARCHIVO PRINCIPAL PARA RENDER
Este archivo asegura que Render use siempre app_enhanced.py
"""

# Importar directamente desde app_enhanced
from app_enhanced import app

# Logging para verificar
print("=" * 60)
print("🚀 INICIANDO APLICACIÓN DESDE app.py")
print("✅ Importando desde app_enhanced.py")
print("✅ Template: home_didactico.html")
print("✅ Versión: DIDACTICA_V1.0")
print("=" * 60)

# Si se ejecuta directamente
if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    app.run(debug=debug, host='0.0.0.0', port=port)
