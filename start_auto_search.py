#!/usr/bin/env python3
"""
Script para iniciar el sistema de búsqueda automática
"""

import sys
import os
import time
import threading
from auto_search_system import AutoSearchSystem

def main():
    """Función principal para iniciar la búsqueda automática"""
    print("🚀 Iniciando Sistema de Búsqueda Automática IICA Chile...")
    print("=" * 60)
    
    # Crear instancia del sistema
    auto_search = AutoSearchSystem()
    
    try:
        # Iniciar búsqueda automática en segundo plano
        print("🔄 Iniciando búsqueda automática en segundo plano...")
        auto_search.run_background_search()
        
        print("✅ Sistema de búsqueda automática iniciado exitosamente")
        print("📅 Búsqueda diaria programada a las 6:00 AM")
        print("⏰ Búsqueda cada 6 horas activada")
        print("🌐 Monitoreando fuentes: Corfo, INDAP, FIA, Minagri, FAO, Banco Mundial")
        print("=" * 60)
        print("💡 El sistema continuará ejecutándose en segundo plano")
        print("🛑 Presiona Ctrl+C para detener")
        
        # Mantener el script ejecutándose
        while True:
            time.sleep(60)
            
    except KeyboardInterrupt:
        print("\n🛑 Deteniendo sistema de búsqueda automática...")
        print("✅ Sistema detenido exitosamente")
        sys.exit(0)
    except Exception as e:
        print(f"❌ Error en el sistema de búsqueda automática: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

