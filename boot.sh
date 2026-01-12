#!/bin/bash
# Script de arranque automático para Render (Free Tier Friendly)

# 1. Inicializar la base de datos (crea tablas si no existen)
flask --app app_mvp init-db

# 2. Poblar con datos reales (solo agrega nuevos, no duplica)
flask --app app_mvp seed-db

# 3. Iniciar la aplicación en producción
exec gunicorn app_mvp:app
