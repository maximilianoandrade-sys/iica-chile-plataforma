# Procfile - ACTUALIZADO: Render debe usar app:app según render.yaml
# Este archivo se mantiene por compatibilidad pero render.yaml tiene prioridad
# IMPORTANTE: Render.yaml especifica: gunicorn app:app
web: gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 300 --max-requests 50