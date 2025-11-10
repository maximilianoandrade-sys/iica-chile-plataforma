"""
Script de actualización automática de proyectos
Para ejecutar periódicamente con cron o Render cronjobs
"""

import os
import sys
import logging
from datetime import datetime

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/update.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Importar funciones de app
sys.path.insert(0, os.path.dirname(__file__))
from app import recolectar_todos, guardar_excel


def main():
    """
    Función principal para actualización automática.
    """
    try:
        logger.info("=" * 60)
        logger.info("🔄 Iniciando actualización automática de proyectos")
        logger.info(f"📅 Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        logger.info("=" * 60)
        
        # Recolectar proyectos
        proyectos = recolectar_todos()
        
        # Guardar en Excel
        guardar_excel(proyectos)
        
        logger.info("=" * 60)
        logger.info(f"✅ Actualización completada: {len(proyectos)} proyectos")
        logger.info("=" * 60)
        
        return 0
        
    except Exception as e:
        logger.error(f"❌ Error en actualización automática: {str(e)}", exc_info=True)
        return 1


if __name__ == '__main__':
    exit(main())

