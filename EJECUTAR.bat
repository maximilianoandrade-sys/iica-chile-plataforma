@echo off
echo ========================================
echo   IICA Plataforma - Inicio Rapido
echo ========================================
echo.

REM Verificar si Node.js esta instalado
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js no esta instalado.
    echo.
    echo Por favor instala Node.js desde: https://nodejs.org/
    echo O revisa INSTRUCCIONES_INSTALACION.md
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js encontrado
node --version
echo.

REM Verificar si npm esta instalado
where npm >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm no esta instalado.
    pause
    exit /b 1
)

echo [OK] npm encontrado
npm --version
echo.

REM Verificar si node_modules existe
if not exist "node_modules" (
    echo [INFO] Instalando dependencias...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Error al instalar dependencias
        pause
        exit /b 1
    )
    echo [OK] Dependencias instaladas
    echo.
)

REM Verificar si .env existe
if not exist ".env" (
    echo [INFO] Creando archivo .env...
    echo DATABASE_URL="file:./dev.db" > .env
    echo [OK] Archivo .env creado
    echo.
)

REM Generar cliente de Prisma
echo [INFO] Generando cliente de Prisma...
call npx prisma generate
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Error al generar cliente de Prisma
    pause
    exit /b 1
)
echo [OK] Cliente de Prisma generado
echo.

REM Crear base de datos
echo [INFO] Creando base de datos...
call npx prisma db push
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Error al crear base de datos
    pause
    exit /b 1
)
echo [OK] Base de datos creada
echo.

REM Iniciar servidor de desarrollo
echo ========================================
echo   Iniciando servidor de desarrollo...
echo ========================================
echo.
echo El servidor estara disponible en: http://localhost:3000
echo Presiona Ctrl+C para detener el servidor
echo.

call npm run dev

pause

