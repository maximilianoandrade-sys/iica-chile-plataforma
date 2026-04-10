#!/bin/bash
# Script de limpieza antes del build en Render

echo "🧹 Limpiando archivos antiguos..."

# Eliminar carpeta search si existe
if [ -d "app/search" ]; then
  echo "❌ Eliminando app/search/"
  rm -rf app/search
fi

# Eliminar componentes antiguos si existen
if [ -f "components/FiltersPanel.tsx" ]; then
  echo "❌ Eliminando components/FiltersPanel.tsx"
  rm -f components/FiltersPanel.tsx
fi

if [ -f "components/TenderCard.tsx" ]; then
  echo "❌ Eliminando components/TenderCard.tsx"
  rm -f components/TenderCard.tsx
fi

if [ -f "components/SearchBar.tsx" ]; then
  echo "❌ Eliminando components/SearchBar.tsx"
  rm -f components/SearchBar.tsx
fi

if [ -f "components/Header.tsx" ]; then
  echo "❌ Eliminando components/Header.tsx"
  rm -f components/Header.tsx
fi

if [ -f "lib/tenders.ts" ]; then
  echo "❌ Eliminando lib/tenders.ts"
  rm -f lib/tenders.ts
fi

echo "✅ Limpieza completada"

