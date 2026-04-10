# 🚀 Instrucciones para Hacer Push y Corregir Errores en Render

## ⚠️ Problema Actual

Render está usando código antiguo del repositorio de GitHub que tiene:
- `app/search/page.tsx` (archivo antiguo)
- `components/Header.tsx`, `FiltersPanel.tsx`, etc. (componentes antiguos)
- `lib/tenders.ts` (archivo antiguo)
- `package.json` con nombre "tenders-platform" (antiguo)

## ✅ Solución

### Paso 1: Eliminar Archivos Antiguos Localmente

Ejecuta estos comandos en PowerShell:

```powershell
# Eliminar carpeta search si existe
Remove-Item -Path "app\search" -Recurse -Force -ErrorAction SilentlyContinue

# Eliminar componentes antiguos
Remove-Item -Path "components\Header.tsx" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "components\FiltersPanel.tsx" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "components\TenderCard.tsx" -Force -ErrorAction SilentlyContinue
Remove-Item -Path "components\SearchBar.tsx" -Force -ErrorAction SilentlyContinue

# Eliminar lib/tenders.ts si existe
Remove-Item -Path "lib\tenders.ts" -Force -ErrorAction SilentlyContinue
```

### Paso 2: Verificar Archivos Correctos

Asegúrate de que estos archivos existan y estén correctos:

- ✅ `app/page.tsx` - Componente principal
- ✅ `app/layout.tsx` - Sin imports de Header
- ✅ `lib/types.ts` - Con datos de tenders
- ✅ `package.json` - Nombre "iica-plataforma"
- ✅ `prebuild.sh` - Script de limpieza
- ✅ `render.yaml` - Configuración de Render

### Paso 3: Hacer Commit y Push

```bash
# Agregar todos los cambios
git add .

# Commit con mensaje descriptivo
git commit -m "Fix: Eliminar archivos antiguos, corregir imports para Render"

# Push al repositorio
git push origin main
```

### Paso 4: En Render

1. Ve a tu servicio en Render Dashboard
2. Click en **Manual Deploy** → **Deploy latest commit**
3. El script `prebuild.sh` eliminará automáticamente cualquier archivo problemático
4. El build debería completarse sin errores

## 🔍 Verificación

Después del push, verifica en GitHub que:

- [ ] No existe `app/search/page.tsx` en el repositorio
- [ ] No existen `components/Header.tsx`, etc. en el repositorio
- [ ] `package.json` tiene nombre "iica-plataforma"
- [ ] `prebuild.sh` está en el repositorio
- [ ] `render.yaml` está actualizado

## 📝 Nota Importante

El script `prebuild.sh` se ejecutará automáticamente en Render antes del build para eliminar cualquier archivo problemático que pueda quedar en el repositorio.

