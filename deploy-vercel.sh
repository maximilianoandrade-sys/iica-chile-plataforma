#!/bin/bash

# Script de Deploy para Vercel - IICA Chile Plataforma

set -e

echo "========================================="
echo "Deploy IICA Chile Plataforma a Vercel"
echo "========================================="

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "Error: No se encontro package.json"
    exit 1
fi

# Verificar que vercel CLI esta instalado
if ! command -v vercel &> /dev/null; then
    echo "Vercel CLI no encontrado. Instalando..."
    npm install -g vercel
fi

# Verificar variables de entorno necesarias
echo ""
echo "Verificando configuracion..."

if [ -z "$DATABASE_URL" ]; then
    echo "ADVERTENCIA: DATABASE_URL no esta configurada"
    echo "Puedes configurar PostgreSQL en Vercel: vercel.com/dashboard > Storage"
fi

if [ -z "$NEXTAUTH_SECRET" ]; then
    echo "ADVERTENCIA: NEXTAUTH_SECRET no esta configurada"
    echo "Genera una clave: openssl rand -base64 32"
fi

# Generar Prisma Client
echo ""
echo "Generando Prisma Client..."
npx prisma generate

# Instalar dependencias
echo ""
echo "Instalando dependencias..."
npm ci

# Hacer build
echo ""
echo "Haciendo build..."
npm run build

# Deploy a Vercel
echo ""
echo "Iniciando deploy a Vercel..."
vercel --prod

echo ""
echo "========================================="
echo "Deploy completado!"
echo "========================================="
