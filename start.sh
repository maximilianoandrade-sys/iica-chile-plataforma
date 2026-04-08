#!/bin/bash
# Script para ejecutar Next.js y Flask en el mismo servicio
# Next.js se ejecuta en el puerto $PORT (requerido por Render)
# Flask se ejecuta en el puerto 5000 (interno)

# Iniciar Flask en segundo plano
echo "🚀 Iniciando Flask API en puerto 5000..."
gunicorn app:app --bind 0.0.0.0:5000 --workers 2 --timeout 300 --max-requests 50 --preload &
FLASK_PID=$!

# Esperar a que Flask esté listo
sleep 5

# Iniciar Next.js en el puerto principal (Render usa $PORT)
echo "🚀 Iniciando Next.js en puerto $PORT..."
npm start

# Si Next.js se detiene, matar Flask también
trap "kill $FLASK_PID" EXIT

