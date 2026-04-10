# ⚠️ IMPORTANTE: Configurar Build Command en Render Dashboard

## 🔴 PROBLEMA

Render está usando `npm ci` en lugar de `npm install`, lo que causa el error porque no existe `package-lock.json`.

## ✅ SOLUCIÓN: Actualizar Configuración en Render Dashboard

### PASO 1: Ir a Render Dashboard
1. Ve a: https://dashboard.render.com
2. Selecciona: **`iica-chile-plataforma`**

### PASO 2: Ir a Settings → Build & Deploy
1. Haz clic en **"Settings"** (menú lateral)
2. Haz clic en **"Build & Deploy"**

### PASO 3: Actualizar Build Command
**IMPORTANTE**: Reemplaza el Build Command actual con este:

```bash
pip install --no-cache-dir -r requirements.txt && npm install && npm run build
```

**O si prefieres con saltos de línea:**

```bash
pip install --no-cache-dir -r requirements.txt
npm install
npm run build
```

### PASO 4: Verificar Start Command
Asegúrate de que el **Start Command** sea:

```bash
bash start.sh
```

### PASO 5: Verificar Environment
Asegúrate de que **Environment** sea: **`Node`** (no Python)

### PASO 6: Guardar y Deploy
1. Haz clic en **"Save Changes"**
2. Ve a **"Manual Deploy"**
3. Haz clic en **"Clear build cache & deploy"**
4. Espera 5-7 minutos

## 🔍 Verificación

Después del deploy, en los logs deberías ver:

```
Successfully installed Flask-2.3.3 ...
added 200 packages...
✓ Compiled successfully
🚀 Iniciando Flask API en puerto 5000...
🚀 Iniciando Next.js en puerto 10000...
```

## ⚠️ NOTA IMPORTANTE

Si Render sigue usando `npm ci`, significa que hay una configuración manual en el dashboard que está sobrescribiendo el `render.yaml`. 

**Solución**: Actualiza manualmente el Build Command en el dashboard como se indica arriba.

