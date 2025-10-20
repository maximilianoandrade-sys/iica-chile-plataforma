"""
Sistema de Respaldo Automático para la Plataforma IICA
Mantiene copias de seguridad de datos críticos y permite recuperación
"""

import os
import json
import shutil
import zipfile
import sqlite3
from datetime import datetime, timedelta
from typing import List, Dict, Any
import schedule
import time
import threading
from pathlib import Path

class BackupManager:
    def __init__(self, backup_dir="backups", max_backups=30):
        self.backup_dir = backup_dir
        self.max_backups = max_backups
        self.data_dir = "data"
        self.cache_dir = "cache"
        self.analytics_db = "analytics.db"
        self.notifications_db = "notifications.db"
        self.recommendations_db = "recommendations.db"
        
        # Crear directorio de respaldos si no existe
        if not os.path.exists(backup_dir):
            os.makedirs(backup_dir, exist_ok=True)
    
    def create_backup(self, backup_type: str = "full") -> str:
        """Crea un respaldo del sistema"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_name = f"backup_{backup_type}_{timestamp}"
        backup_path = os.path.join(self.backup_dir, backup_name)
        
        try:
            # Crear directorio de respaldo
            os.makedirs(backup_path, exist_ok=True)
            
            if backup_type == "full":
                self._backup_full_system(backup_path)
            elif backup_type == "data":
                self._backup_data_only(backup_path)
            elif backup_type == "databases":
                self._backup_databases_only(backup_path)
            elif backup_type == "config":
                self._backup_config_only(backup_path)
            
            # Comprimir respaldo
            zip_path = f"{backup_path}.zip"
            self._compress_backup(backup_path, zip_path)
            
            # Limpiar directorio temporal
            shutil.rmtree(backup_path)
            
            # Limpiar respaldos antiguos
            self._cleanup_old_backups()
            
            return zip_path
            
        except Exception as e:
            print(f"Error creando respaldo: {e}")
            return None
    
    def _backup_full_system(self, backup_path: str):
        """Respaldo completo del sistema"""
        # Respaldar directorio de datos
        if os.path.exists(self.data_dir):
            shutil.copytree(self.data_dir, os.path.join(backup_path, "data"))
        
        # Respaldar caché
        if os.path.exists(self.cache_dir):
            shutil.copytree(self.cache_dir, os.path.join(backup_path, "cache"))
        
        # Respaldar bases de datos
        self._backup_databases(backup_path)
        
        # Respaldar archivos de configuración
        self._backup_config_files(backup_path)
        
        # Respaldar código fuente
        self._backup_source_code(backup_path)
    
    def _backup_data_only(self, backup_path: str):
        """Respaldo solo de datos"""
        if os.path.exists(self.data_dir):
            shutil.copytree(self.data_dir, os.path.join(backup_path, "data"))
        
        # Respaldar bases de datos
        self._backup_databases(backup_path)
    
    def _backup_databases_only(self, backup_path: str):
        """Respaldo solo de bases de datos"""
        self._backup_databases(backup_path)
    
    def _backup_config_only(self, backup_path: str):
        """Respaldo solo de configuración"""
        self._backup_config_files(backup_path)
    
    def _backup_databases(self, backup_path: str):
        """Respaldar bases de datos"""
        databases = [
            self.analytics_db,
            self.notifications_db,
            self.recommendations_db
        ]
        
        for db_file in databases:
            if os.path.exists(db_file):
                shutil.copy2(db_file, os.path.join(backup_path, db_file))
    
    def _backup_config_files(self, backup_path: str):
        """Respaldar archivos de configuración"""
        config_files = [
            "config.py",
            "email_config.json",
            "requirements.txt",
            "Dockerfile",
            "docker-compose.yml",
            "nginx.conf",
            "Procfile"
        ]
        
        for config_file in config_files:
            if os.path.exists(config_file):
                shutil.copy2(config_file, os.path.join(backup_path, config_file))
    
    def _backup_source_code(self, backup_path: str):
        """Respaldar código fuente"""
        source_files = [
            "app.py",
            "utils.py",
            "cache_manager.py",
            "analytics.py",
            "notification_system.py",
            "ai_recommendations.py",
            "backup_system.py",
            "translations.py"
        ]
        
        for source_file in source_files:
            if os.path.exists(source_file):
                shutil.copy2(source_file, os.path.join(backup_path, source_file))
        
        # Respaldar directorio de scrapers
        if os.path.exists("scrapers"):
            shutil.copytree("scrapers", os.path.join(backup_path, "scrapers"))
        
        # Respaldar templates
        if os.path.exists("templates"):
            shutil.copytree("templates", os.path.join(backup_path, "templates"))
    
    def _compress_backup(self, source_path: str, zip_path: str):
        """Comprime el respaldo en un archivo ZIP"""
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk(source_path):
                for file in files:
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, source_path)
                    zipf.write(file_path, arcname)
    
    def _cleanup_old_backups(self):
        """Limpia respaldos antiguos"""
        if not os.path.exists(self.backup_dir):
            return
        
        # Obtener todos los archivos de respaldo
        backup_files = []
        for filename in os.listdir(self.backup_dir):
            if filename.startswith("backup_") and filename.endswith(".zip"):
                file_path = os.path.join(self.backup_dir, filename)
                file_time = os.path.getmtime(file_path)
                backup_files.append((file_path, file_time))
        
        # Ordenar por fecha (más recientes primero)
        backup_files.sort(key=lambda x: x[1], reverse=True)
        
        # Eliminar respaldos excedentes
        if len(backup_files) > self.max_backups:
            for file_path, _ in backup_files[self.max_backups:]:
                try:
                    os.remove(file_path)
                    print(f"Respaldo antiguo eliminado: {file_path}")
                except Exception as e:
                    print(f"Error eliminando respaldo {file_path}: {e}")
    
    def restore_backup(self, backup_path: str) -> bool:
        """Restaura un respaldo"""
        try:
            if not os.path.exists(backup_path):
                print(f"Archivo de respaldo no encontrado: {backup_path}")
                return False
            
            # Crear directorio temporal para extraer
            temp_dir = f"temp_restore_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            os.makedirs(temp_dir, exist_ok=True)
            
            # Extraer respaldo
            with zipfile.ZipFile(backup_path, 'r') as zipf:
                zipf.extractall(temp_dir)
            
            # Restaurar archivos
            self._restore_files(temp_dir)
            
            # Limpiar directorio temporal
            shutil.rmtree(temp_dir)
            
            print(f"Respaldo restaurado exitosamente desde: {backup_path}")
            return True
            
        except Exception as e:
            print(f"Error restaurando respaldo: {e}")
            return False
    
    def _restore_files(self, temp_dir: str):
        """Restaura archivos desde el directorio temporal"""
        # Restaurar datos
        data_backup = os.path.join(temp_dir, "data")
        if os.path.exists(data_backup):
            if os.path.exists(self.data_dir):
                shutil.rmtree(self.data_dir)
            shutil.copytree(data_backup, self.data_dir)
        
        # Restaurar caché
        cache_backup = os.path.join(temp_dir, "cache")
        if os.path.exists(cache_backup):
            if os.path.exists(self.cache_dir):
                shutil.rmtree(self.cache_dir)
            shutil.copytree(cache_backup, self.cache_dir)
        
        # Restaurar bases de datos
        for db_file in [self.analytics_db, self.notifications_db, self.recommendations_db]:
            db_backup = os.path.join(temp_dir, db_file)
            if os.path.exists(db_backup):
                shutil.copy2(db_backup, db_file)
        
        # Restaurar archivos de configuración
        config_files = ["config.py", "email_config.json"]
        for config_file in config_files:
            config_backup = os.path.join(temp_dir, config_file)
            if os.path.exists(config_backup):
                shutil.copy2(config_backup, config_file)
    
    def list_backups(self) -> List[Dict[str, Any]]:
        """Lista todos los respaldos disponibles"""
        if not os.path.exists(self.backup_dir):
            return []
        
        backups = []
        for filename in os.listdir(self.backup_dir):
            if filename.startswith("backup_") and filename.endswith(".zip"):
                file_path = os.path.join(self.backup_dir, filename)
                file_stat = os.stat(file_path)
                
                backup_info = {
                    'filename': filename,
                    'path': file_path,
                    'size': file_stat.st_size,
                    'created': datetime.fromtimestamp(file_stat.st_ctime),
                    'modified': datetime.fromtimestamp(file_stat.st_mtime)
                }
                backups.append(backup_info)
        
        # Ordenar por fecha de creación (más recientes primero)
        backups.sort(key=lambda x: x['created'], reverse=True)
        return backups
    
    def get_backup_info(self, backup_path: str) -> Dict[str, Any]:
        """Obtiene información detallada de un respaldo"""
        if not os.path.exists(backup_path):
            return {}
        
        try:
            file_stat = os.stat(backup_path)
            
            # Obtener contenido del respaldo
            contents = []
            with zipfile.ZipFile(backup_path, 'r') as zipf:
                for file_info in zipf.filelist:
                    contents.append({
                        'filename': file_info.filename,
                        'size': file_info.file_size,
                        'compressed_size': file_info.compress_size,
                        'date': datetime(*file_info.date_time)
                    })
            
            return {
                'path': backup_path,
                'size': file_stat.st_size,
                'created': datetime.fromtimestamp(file_stat.st_ctime),
                'modified': datetime.fromtimestamp(file_stat.st_mtime),
                'contents': contents,
                'file_count': len(contents)
            }
            
        except Exception as e:
            print(f"Error obteniendo información del respaldo: {e}")
            return {}
    
    def schedule_automatic_backups(self):
        """Programa respaldos automáticos"""
        # Respaldo diario a las 2:00 AM
        schedule.every().day.at("02:00").do(self.create_backup, "data")
        
        # Respaldo semanal completo los domingos a las 3:00 AM
        schedule.every().sunday.at("03:00").do(self.create_backup, "full")
        
        # Respaldo de bases de datos cada 6 horas
        schedule.every(6).hours.do(self.create_backup, "databases")
        
        print("Respaldos automáticos programados:")
        print("- Respaldo diario de datos: 02:00 AM")
        print("- Respaldo semanal completo: Domingos 03:00 AM")
        print("- Respaldo de bases de datos: Cada 6 horas")
    
    def start_backup_scheduler(self):
        """Inicia el programador de respaldos en un hilo separado"""
        def run_scheduler():
            while True:
                schedule.run_pending()
                time.sleep(60)  # Verificar cada minuto
        
        scheduler_thread = threading.Thread(target=run_scheduler, daemon=True)
        scheduler_thread.start()
        print("Programador de respaldos iniciado")
    
    def create_emergency_backup(self) -> str:
        """Crea un respaldo de emergencia rápido"""
        return self.create_backup("data")
    
    def verify_backup_integrity(self, backup_path: str) -> bool:
        """Verifica la integridad de un respaldo"""
        try:
            with zipfile.ZipFile(backup_path, 'r') as zipf:
                # Verificar que el archivo ZIP no esté corrupto
                bad_file = zipf.testzip()
                if bad_file:
                    print(f"Archivo corrupto en respaldo: {bad_file}")
                    return False
                
                # Verificar archivos críticos
                critical_files = [
                    "data/proyectos.xlsx",
                    "analytics.db",
                    "notifications.db"
                ]
                
                for critical_file in critical_files:
                    if critical_file not in zipf.namelist():
                        print(f"Archivo crítico faltante en respaldo: {critical_file}")
                        return False
                
                return True
                
        except Exception as e:
            print(f"Error verificando integridad del respaldo: {e}")
            return False
    
    def get_backup_statistics(self) -> Dict[str, Any]:
        """Obtiene estadísticas de respaldos"""
        backups = self.list_backups()
        
        if not backups:
            return {
                'total_backups': 0,
                'total_size': 0,
                'oldest_backup': None,
                'newest_backup': None,
                'average_size': 0
            }
        
        total_size = sum(backup['size'] for backup in backups)
        sizes = [backup['size'] for backup in backups]
        
        return {
            'total_backups': len(backups),
            'total_size': total_size,
            'oldest_backup': min(backup['created'] for backup in backups),
            'newest_backup': max(backup['created'] for backup in backups),
            'average_size': total_size / len(backups) if backups else 0,
            'size_by_type': self._get_size_by_type(backups)
        }
    
    def _get_size_by_type(self, backups: List[Dict]) -> Dict[str, int]:
        """Obtiene tamaño por tipo de respaldo"""
        size_by_type = {}
        
        for backup in backups:
            filename = backup['filename']
            if 'full' in filename:
                backup_type = 'full'
            elif 'data' in filename:
                backup_type = 'data'
            elif 'databases' in filename:
                backup_type = 'databases'
            elif 'config' in filename:
                backup_type = 'config'
            else:
                backup_type = 'unknown'
            
            size_by_type[backup_type] = size_by_type.get(backup_type, 0) + backup['size']
        
        return size_by_type

# Instancia global del sistema de respaldo
backup_manager = BackupManager()

def init_backup_system():
    """Inicializa el sistema de respaldo"""
    backup_manager.schedule_automatic_backups()
    backup_manager.start_backup_scheduler()
    print("Sistema de respaldo automático inicializado")
