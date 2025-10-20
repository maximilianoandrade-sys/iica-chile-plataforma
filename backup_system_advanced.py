"""
Sistema Avanzado de Backup para IICA Chile
Backup automático, versionado y recuperación de datos
"""

import os
import shutil
import json
import zipfile
from datetime import datetime, timedelta
from typing import List, Dict, Any
import schedule
import time
import threading

class AdvancedBackupSystem:
    def __init__(self):
        self.backup_dir = 'backups'
        self.data_dir = 'data'
        self.max_backups = 30  # Mantener últimos 30 backups
        self.backup_interval = 24  # Horas entre backups
        
        # Crear directorio de backups
        os.makedirs(self.backup_dir, exist_ok=True)
        
    def create_backup(self, backup_type: str = 'full') -> str:
        """Crear backup del sistema"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_name = f"backup_{backup_type}_{timestamp}"
        backup_path = os.path.join(self.backup_dir, backup_name)
        
        try:
            # Crear directorio de backup
            os.makedirs(backup_path, exist_ok=True)
            
            # Backup de datos
            self._backup_data(backup_path)
            
            # Backup de configuraciones
            self._backup_configs(backup_path)
            
            # Backup de templates
            self._backup_templates(backup_path)
            
            # Backup de static files
            self._backup_static(backup_path)
            
            # Crear archivo de metadatos
            self._create_metadata(backup_path, backup_type)
            
            # Comprimir backup
            zip_path = f"{backup_path}.zip"
            self._compress_backup(backup_path, zip_path)
            
            # Limpiar directorio temporal
            shutil.rmtree(backup_path)
            
            # Limpiar backups antiguos
            self._cleanup_old_backups()
            
            print(f"✅ Backup creado exitosamente: {zip_path}")
            return zip_path
            
        except Exception as e:
            print(f"❌ Error creando backup: {e}")
            return None
            
    def _backup_data(self, backup_path: str):
        """Backup de archivos de datos"""
        data_backup_path = os.path.join(backup_path, 'data')
        os.makedirs(data_backup_path, exist_ok=True)
        
        if os.path.exists(self.data_dir):
            for file in os.listdir(self.data_dir):
                if file.endswith(('.xlsx', '.json', '.csv')):
                    src = os.path.join(self.data_dir, file)
                    dst = os.path.join(data_backup_path, file)
                    shutil.copy2(src, dst)
                    
    def _backup_configs(self, backup_path: str):
        """Backup de archivos de configuración"""
        config_files = [
            'app_working.py',
            'requirements.txt',
            'Procfile',
            'runtime.txt'
        ]
        
        for file in config_files:
            if os.path.exists(file):
                shutil.copy2(file, backup_path)
                
    def _backup_templates(self, backup_path: str):
        """Backup de templates"""
        templates_backup_path = os.path.join(backup_path, 'templates')
        if os.path.exists('templates'):
            shutil.copytree('templates', templates_backup_path)
            
    def _backup_static(self, backup_path: str):
        """Backup de archivos estáticos"""
        static_backup_path = os.path.join(backup_path, 'static')
        if os.path.exists('static'):
            shutil.copytree('static', static_backup_path)
            
    def _create_metadata(self, backup_path: str, backup_type: str):
        """Crear archivo de metadatos del backup"""
        metadata = {
            'backup_type': backup_type,
            'created_at': datetime.now().isoformat(),
            'version': '1.0',
            'files_included': self._list_backup_files(backup_path),
            'size_mb': self._calculate_backup_size(backup_path)
        }
        
        metadata_path = os.path.join(backup_path, 'metadata.json')
        with open(metadata_path, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, ensure_ascii=False, indent=2)
            
    def _list_backup_files(self, backup_path: str) -> List[str]:
        """Listar archivos incluidos en el backup"""
        files = []
        for root, dirs, filenames in os.walk(backup_path):
            for filename in filenames:
                rel_path = os.path.relpath(os.path.join(root, filename), backup_path)
                files.append(rel_path)
        return files
        
    def _calculate_backup_size(self, backup_path: str) -> float:
        """Calcular tamaño del backup en MB"""
        total_size = 0
        for root, dirs, files in os.walk(backup_path):
            for file in files:
                file_path = os.path.join(root, file)
                total_size += os.path.getsize(file_path)
        return round(total_size / (1024 * 1024), 2)
        
    def _compress_backup(self, source_path: str, zip_path: str):
        """Comprimir backup en archivo ZIP"""
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk(source_path):
                for file in files:
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, source_path)
                    zipf.write(file_path, arcname)
                    
    def _cleanup_old_backups(self):
        """Limpiar backups antiguos"""
        backup_files = []
        for file in os.listdir(self.backup_dir):
            if file.startswith('backup_') and file.endswith('.zip'):
                file_path = os.path.join(self.backup_dir, file)
                backup_files.append((file_path, os.path.getctime(file_path)))
                
        # Ordenar por fecha de creación (más recientes primero)
        backup_files.sort(key=lambda x: x[1], reverse=True)
        
        # Eliminar backups excedentes
        if len(backup_files) > self.max_backups:
            for file_path, _ in backup_files[self.max_backups:]:
                try:
                    os.remove(file_path)
                    print(f"🗑️ Backup antiguo eliminado: {file_path}")
                except Exception as e:
                    print(f"❌ Error eliminando backup {file_path}: {e}")
                    
    def restore_backup(self, backup_path: str) -> bool:
        """Restaurar desde backup"""
        try:
            if not os.path.exists(backup_path):
                print(f"❌ Archivo de backup no encontrado: {backup_path}")
                return False
                
            # Crear directorio temporal para extraer
            temp_dir = f"temp_restore_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            os.makedirs(temp_dir, exist_ok=True)
            
            # Extraer backup
            with zipfile.ZipFile(backup_path, 'r') as zipf:
                zipf.extractall(temp_dir)
                
            # Restaurar archivos
            self._restore_files(temp_dir)
            
            # Limpiar directorio temporal
            shutil.rmtree(temp_dir)
            
            print(f"✅ Backup restaurado exitosamente desde: {backup_path}")
            return True
            
        except Exception as e:
            print(f"❌ Error restaurando backup: {e}")
            return False
            
    def _restore_files(self, temp_dir: str):
        """Restaurar archivos desde directorio temporal"""
        # Restaurar datos
        data_src = os.path.join(temp_dir, 'data')
        if os.path.exists(data_src):
            if os.path.exists(self.data_dir):
                shutil.rmtree(self.data_dir)
            shutil.copytree(data_src, self.data_dir)
            
        # Restaurar templates
        templates_src = os.path.join(temp_dir, 'templates')
        if os.path.exists(templates_src):
            if os.path.exists('templates'):
                shutil.rmtree('templates')
            shutil.copytree(templates_src, 'templates')
            
        # Restaurar static
        static_src = os.path.join(temp_dir, 'static')
        if os.path.exists(static_src):
            if os.path.exists('static'):
                shutil.rmtree('static')
            shutil.copytree(static_src, 'static')
            
    def list_backups(self) -> List[Dict[str, Any]]:
        """Listar backups disponibles"""
        backups = []
        for file in os.listdir(self.backup_dir):
            if file.startswith('backup_') and file.endswith('.zip'):
                file_path = os.path.join(self.backup_dir, file)
                file_stat = os.stat(file_path)
                
                backup_info = {
                    'filename': file,
                    'path': file_path,
                    'size_mb': round(file_stat.st_size / (1024 * 1024), 2),
                    'created_at': datetime.fromtimestamp(file_stat.st_ctime).isoformat(),
                    'modified_at': datetime.fromtimestamp(file_stat.st_mtime).isoformat()
                }
                backups.append(backup_info)
                
        return sorted(backups, key=lambda x: x['created_at'], reverse=True)
        
    def start_automatic_backups(self):
        """Iniciar backups automáticos"""
        schedule.every(self.backup_interval).hours.do(self.create_backup, 'automatic')
        
        def run_scheduler():
            while True:
                schedule.run_pending()
                time.sleep(3600)  # Verificar cada hora
                
        # Ejecutar en hilo separado
        backup_thread = threading.Thread(target=run_scheduler, daemon=True)
        backup_thread.start()
        print(f"🔄 Backups automáticos iniciados (cada {self.backup_interval} horas)")
        
    def get_backup_stats(self) -> Dict[str, Any]:
        """Obtener estadísticas de backups"""
        backups = self.list_backups()
        
        if not backups:
            return {'total_backups': 0, 'total_size_mb': 0}
            
        total_size = sum(backup['size_mb'] for backup in backups)
        
        return {
            'total_backups': len(backups),
            'total_size_mb': round(total_size, 2),
            'latest_backup': backups[0]['created_at'] if backups else None,
            'oldest_backup': backups[-1]['created_at'] if backups else None
        }

# Instancia global del sistema de backup
backup_system = AdvancedBackupSystem()

# Crear backup inicial
print("🔄 Creando backup inicial...")
backup_system.create_backup('initial')
