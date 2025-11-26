"""
ARCHIVO PRINCIPAL PARA RENDER
Este archivo asegura que Render use siempre app_enhanced.py con template didáctico
"""

# Importar directamente desde app_enhanced
from app_enhanced import app

# Logging para verificar
print("=" * 80)
print("🚀 INICIANDO APLICACIÓN DESDE app.py")
print("✅ Importando desde app_enhanced.py")
print("✅ Template: home_didactico.html (INTERFAZ DIDÁCTICA)")
print("✅ Versión: DIDACTICA_V1.0")
print("=" * 80)

# Verificar que el template existe
import os
template_path = os.path.join('templates', 'home_didactico.html')
if os.path.exists(template_path):
    print(f"✅ Template encontrado: {template_path}")
else:
    print(f"❌ Template NO encontrado: {template_path}")
    print(f"📂 Archivos en templates: {os.listdir('templates') if os.path.exists('templates') else 'No existe'}")

# Si se ejecuta directamente
if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    app.run(debug=debug, host='0.0.0.0', port=port)
