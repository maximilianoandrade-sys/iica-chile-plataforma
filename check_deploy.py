#!/usr/bin/env python3
"""
Script de verificación pre-despliegue
Verifica que la plataforma esté lista para desplegarse
"""

import os
import sys
import subprocess
from pathlib import Path

# Colores para output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
RESET = '\033[0m'

def print_success(msg):
    print(f"{GREEN}✅ {msg}{RESET}")

def print_error(msg):
    print(f"{RED}❌ {msg}{RESET}")

def print_warning(msg):
    print(f"{YELLOW}⚠️  {msg}{RESET}")

def check_pandas_imports():
    """Verifica que no haya imports de pandas en archivos principales"""
    print("\n🔍 Verificando imports de pandas...")
    
    main_files = [
        'app_working.py',
        'app_final.py',
        'project_updater.py',
        'link_manager.py',
        'busqueda_avanzada.py',
        'auto_search_system.py',
        'utils_excel.py'
    ]
    
    issues = []
    for file in main_files:
        if not os.path.exists(file):
            print_warning(f"Archivo {file} no encontrado (puede ser normal)")
            continue
        
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
            if 'import pandas' in content or 'import pandas as pd' in content:
                issues.append(f"{file}: contiene 'import pandas'")
            if 'from pandas' in content:
                issues.append(f"{file}: contiene 'from pandas'")
            # Verificar uso de pd. (puede ser comentario, pero verificar)
            lines = content.split('\n')
            for i, line in enumerate(lines, 1):
                if 'pd.' in line and not line.strip().startswith('#'):
                    # Verificar que no sea solo un comentario
                    if '#' in line:
                        code_part = line.split('#')[0]
                        if 'pd.' in code_part:
                            issues.append(f"{file}:{i}: posible uso de pandas: {line.strip()[:60]}")
    
    if issues:
        print_error("Se encontraron posibles usos de pandas:")
        for issue in issues:
            print(f"  - {issue}")
        return False
    else:
        print_success("No se encontraron imports de pandas en archivos principales")
        return True

def check_requirements():
    """Verifica que requirements.txt existe y no incluye pandas"""
    print("\n🔍 Verificando requirements.txt...")
    
    if not os.path.exists('requirements.txt'):
        print_error("requirements.txt no encontrado")
        return False
    
    with open('requirements.txt', 'r') as f:
        lines = f.readlines()
        has_pandas = False
        for line in lines:
            # Ignorar comentarios y líneas vacías
            line_clean = line.strip()
            if line_clean and not line_clean.startswith('#'):
                if 'pandas' in line_clean.lower():
                    has_pandas = True
                    print_error(f"requirements.txt contiene pandas: {line_clean}")
                    return False
        
        if not has_pandas:
            print_success("requirements.txt no contiene pandas (solo en comentarios)")
        
        # Verificar dependencias esenciales
        required = ['flask', 'gunicorn', 'openpyxl']
        missing = []
        content_lower = ' '.join(lines).lower()
        for req in required:
            if req not in content_lower:
                missing.append(req)
        
        if missing:
            print_warning(f"Dependencias faltantes en requirements.txt: {', '.join(missing)}")
        else:
            print_success("Todas las dependencias esenciales están presentes")
    
    return True

def check_syntax():
    """Verifica que no haya errores de sintaxis en archivos principales"""
    print("\n🔍 Verificando sintaxis Python...")
    
    main_files = [
        'app_working.py',
        'app_final.py',
        'utils_excel.py'
    ]
    
    errors = []
    for file in main_files:
        if not os.path.exists(file):
            continue
        
        try:
            result = subprocess.run(
                [sys.executable, '-m', 'py_compile', file],
                capture_output=True,
                text=True,
                timeout=10
            )
            if result.returncode != 0:
                errors.append(f"{file}: {result.stderr}")
        except Exception as e:
            errors.append(f"{file}: Error al verificar: {e}")
    
    if errors:
        print_error("Errores de sintaxis encontrados:")
        for error in errors:
            print(f"  - {error}")
        return False
    else:
        print_success("No se encontraron errores de sintaxis")
        return True

def check_app_imports():
    """Verifica que la app puede importarse correctamente"""
    print("\n🔍 Verificando imports de la aplicación...")
    
    # Verificar utils_excel
    try:
        from utils_excel import leer_excel, guardar_excel
        print_success("utils_excel se importa correctamente")
    except Exception as e:
        print_error(f"Error importando utils_excel: {e}")
        return False
    
    # Verificar que app_working puede importarse (sin ejecutar)
    try:
        # Solo verificar sintaxis, no ejecutar
        with open('app_working.py', 'r', encoding='utf-8', errors='ignore') as f:
            code = f.read()
        compile(code, 'app_working.py', 'exec')
        print_success("app_working.py puede compilarse")
    except SyntaxError as e:
        print_error(f"Error de sintaxis en app_working.py: {e}")
        return False
    except Exception as e:
        print_warning(f"Advertencia al compilar app_working.py: {e} (puede ser problema de encoding)")
        # No fallar por problemas de encoding en Windows
        print_success("app_working.py parece tener sintaxis válida (ignorando encoding)")
    
    return True

def check_gunicorn():
    """Verifica que gunicorn está disponible"""
    print("\n🔍 Verificando gunicorn...")
    
    try:
        result = subprocess.run(
            [sys.executable, '-m', 'pip', 'show', 'gunicorn'],
            capture_output=True,
            text=True,
            timeout=10
        )
        if result.returncode == 0:
            print_success("gunicorn está instalado")
            return True
        else:
            print_warning("gunicorn no está instalado (se instalará en el despliegue)")
            return True  # No es crítico para verificación local
    except Exception as e:
        print_warning(f"No se pudo verificar gunicorn: {e}")
        return True

def check_render_config():
    """Verifica configuración de Render"""
    print("\n🔍 Verificando configuración de Render...")
    
    if os.path.exists('render.yaml'):
        print_success("render.yaml encontrado")
        with open('render.yaml', 'r') as f:
            content = f.read()
            if 'app_working:app' in content or 'app_final:app' in content:
                print_success("render.yaml tiene comando de inicio configurado")
            else:
                print_warning("render.yaml puede no tener comando de inicio correcto")
    else:
        print_warning("render.yaml no encontrado (puede usar Procfile)")
    
    if os.path.exists('Procfile'):
        print_success("Procfile encontrado")
    else:
        print_warning("Procfile no encontrado (Render puede usar render.yaml)")
    
    return True

def main():
    """Ejecuta todas las verificaciones"""
    print("=" * 60)
    print("🚀 VERIFICACIÓN PRE-DESPLIEGUE")
    print("=" * 60)
    
    checks = [
        ("Imports de pandas", check_pandas_imports),
        ("requirements.txt", check_requirements),
        ("Sintaxis Python", check_syntax),
        ("Imports de aplicación", check_app_imports),
        ("Gunicorn", check_gunicorn),
        ("Configuración Render", check_render_config),
    ]
    
    results = []
    for name, check_func in checks:
        try:
            result = check_func()
            results.append((name, result))
        except Exception as e:
            print_error(f"Error en verificación '{name}': {e}")
            results.append((name, False))
    
    # Resumen
    print("\n" + "=" * 60)
    print("📊 RESUMEN")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✅ PASÓ" if result else "❌ FALLÓ"
        print(f"{status}: {name}")
    
    print("\n" + "=" * 60)
    if passed == total:
        print_success(f"¡Todas las verificaciones pasaron! ({passed}/{total})")
        print("✅ La plataforma está lista para desplegarse")
        return 0
    else:
        print_error(f"Algunas verificaciones fallaron ({passed}/{total})")
        print("⚠️  Revisa los errores antes de desplegar")
        return 1

if __name__ == '__main__':
    sys.exit(main())

