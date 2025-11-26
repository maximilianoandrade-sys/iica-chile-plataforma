"""
Plataforma IICA Chile - Versión Final Consolidada
IMPORTANTE: Este archivo ahora redirige a app_enhanced.py para evitar conflictos
"""

import os

# SOLUCIÓN DEFINITIVA: Importar app desde app_enhanced
# Esto asegura que sin importar qué archivo use Render, funcionará correctamente
try:
    from app_enhanced import app
    print("✅ app_final.py: Importando app desde app_enhanced.py")
    print("✅ Todas las rutas y funcionalidades de app_enhanced están disponibles")
except ImportError as e:
    print(f"❌ Error importando app_enhanced: {e}")
    print("⚠️ Intentando crear app básico como fallback...")
    
    # Fallback básico si app_enhanced no está disponible
    from flask import Flask, render_template
    app = Flask(__name__, static_folder='static', static_url_path='/static')
    
    @app.route('/')
    def home():
        return render_template('error.html', 
                             error="app_enhanced.py no está disponible. Por favor, verifica la instalación.",
                             error_code=500), 500

# Si se ejecuta directamente, usar app_enhanced
if __name__ == '__main__':
    print("🚀 Iniciando desde app_final.py (redirigiendo a app_enhanced)")
    port = int(os.environ.get('PORT', 5004))
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    app.run(debug=debug, host='0.0.0.0', port=port)
