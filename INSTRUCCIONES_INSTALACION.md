# Instrucciones de Instalación - IICA Plataforma

## Requisitos Previos

Este proyecto requiere **Node.js** (versión 18 o superior) y **npm** (incluido con Node.js).

## Paso 1: Instalar Node.js

### Opción A: Descarga Directa (Recomendado)
1. Visita: https://nodejs.org/
2. Descarga la versión **LTS** (Long Term Support)
3. Ejecuta el instalador y sigue las instrucciones
4. Asegúrate de marcar la opción "Add to PATH" durante la instalación

### Opción B: Usando Chocolatey (Windows)
```powershell
choco install nodejs
```

### Opción C: Usando Winget (Windows 10/11)
```powershell
winget install OpenJS.NodeJS.LTS
```

## Paso 2: Verificar Instalación

Abre una nueva terminal PowerShell y ejecuta:
```powershell
node --version
npm --version
```

Deberías ver las versiones instaladas (ej: v20.10.0 y 10.2.3)

## Paso 3: Instalar Dependencias del Proyecto

Navega a la carpeta del proyecto y ejecuta:
```powershell
npm install
```

Esto instalará todas las dependencias necesarias (Next.js, React, Prisma, Tailwind, etc.)

## Paso 4: Configurar Base de Datos

1. Crea un archivo `.env` en la raíz del proyecto:
```
DATABASE_URL="file:./dev.db"
```

2. Genera el cliente de Prisma:
```powershell
npx prisma generate
```

3. Crea la base de datos:
```powershell
npx prisma db push
```

## Paso 5: Ejecutar el Proyecto

### Modo Desarrollo
```powershell
npm run dev
```

El servidor se iniciará en: http://localhost:3000

### Modo Producción
```powershell
npm run build
npm start
```

## Scripts Disponibles

- `npm run dev` - Inicia servidor de desarrollo
- `npm run build` - Construye para producción
- `npm start` - Inicia servidor de producción
- `npm run scrape` - Ejecuta scrapers de datos
- `npm run db:push` - Actualiza esquema de base de datos

## Solución de Problemas

### Error: "npm no se reconoce"
- Reinicia la terminal después de instalar Node.js
- Verifica que Node.js esté en el PATH del sistema
- Abre una nueva terminal PowerShell

### Error: "Cannot find module"
- Ejecuta `npm install` nuevamente
- Elimina `node_modules` y `package-lock.json` y vuelve a instalar

### Error de Prisma
- Verifica que el archivo `.env` exista con `DATABASE_URL`
- Ejecuta `npx prisma generate` nuevamente

## Deploy en Render

Una vez que el proyecto funcione localmente:

1. Sube el código a GitHub
2. En Render.com:
   - New → Web Service
   - Conecta tu repositorio
   - Build Command: `npm install && npx prisma generate && npx prisma db push && npm run build`
   - Start Command: `npm start`
   - Agrega variable de entorno: `DATABASE_URL` (PostgreSQL para Render)

