"""
Script para compartir la aplicación IICA con ngrok
"""

from pyngrok import ngrok
import subprocess
import time
import webbrowser
import os

def share_app():
    print("🚀 Iniciando aplicación IICA...")
    
    # Iniciar la aplicación Flask en segundo plano
    app_process = subprocess.Popen(['python', 'app.py'], 
                                 stdout=subprocess.PIPE, 
                                 stderr=subprocess.PIPE)
    
    # Esperar a que la aplicación se inicie
    print("⏳ Esperando que la aplicación se inicie...")
    time.sleep(5)
    
    try:
        # Crear túnel ngrok
        print("🌐 Creando túnel público con ngrok...")
        public_url = ngrok.connect(5000)
        
        print(f"""
🎉 ¡Tu aplicación IICA está disponible públicamente!

📱 URL Pública: {public_url}
🌍 Comparte este enlace con cualquier persona en el mundo
⏰ El túnel permanecerá activo mientras este script esté ejecutándose

📋 Para compartir:
- Copia y pega este enlace: {public_url}
- Envíalo por WhatsApp, email, o cualquier medio
- Cualquier persona podrá acceder a tu plataforma

⚠️  IMPORTANTE:
- Mantén esta ventana abierta
- Para detener, presiona Ctrl+C
- El enlace cambiará cada vez que reinicies
        """)
        
        # Abrir en el navegador
        webbrowser.open(public_url)
        
        # Mantener el script ejecutándose
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n🛑 Deteniendo aplicación...")
            ngrok.disconnect(public_url)
            app_process.terminate()
            print("✅ Aplicación detenida correctamente")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        print("💡 Asegúrate de que la aplicación esté funcionando en http://localhost:5000")

if __name__ == "__main__":
    share_app()



