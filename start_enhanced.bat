@echo off
echo ========================================
echo    PLATAFORMA IICA CHILE MEJORADA
echo ========================================
echo.
echo Iniciando plataforma con funcionalidades avanzadas...
echo Puerto: 5004
echo.

REM Activar entorno virtual
call venv\Scripts\activate.bat

REM Instalar dependencias si es necesario
pip install -r requirements.txt --quiet

REM Ejecutar plataforma mejorada
echo Iniciando servidor en puerto 5004...
python app_enhanced.py

pause
