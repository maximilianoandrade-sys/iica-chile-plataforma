# 🚀 DEPLOY PASO A PASO - IICA Chile

## ✅ PASO 1: Obtener Google Gemini API Key (5 minutos)

### Opción A: Navegador Manual
1. Abre: **https://aistudio.google.com/app/apikey**
2. Inicia sesión con tu cuenta Google
3. Click en **"Create API key"**
4. Selecciona proyecto (o crea uno nuevo: "IICA Chile")
5. **COPIA** la API key (empieza con `AIza...`)
6. Guárdala en un lugar seguro

### Opción B: Usar sin IA (temporal)
Si prefieres deployar primero y agregar IA después, puedes omitir este paso.
El chatbot simplemente no estará disponible hasta que configures la key.

---

## ✅ PASO 2: Preparar Git (2 minutos)

Ejecuta estos comandos en PowerShell:

```powershell
# Navegar al proyecto
cd "C:\Users\Pasante\OneDrive - IICA (1)\Documentos\mi-plataforma2\iica-chile-plataforma"

# Ver estado
git status

# Agregar todos los archivos nuevos
git add .

# Hacer commit
git commit -m "MVP completo con Gemini AI - listo para deploy"

# Ver si hay remote configurado
git remote -v
```

**Si NO tienes remote configurado:**
1. Ve a https://github.com/new
2. Nombre: `iica-chile-plataforma`
3. Público o Privado (tu elección)
4. NO inicialices con README
5. Copia la URL del repo
6. Ejecuta:
```powershell
git remote add origin https://github.com/TU-USUARIO/iica-chile-plataforma.git
git branch -M main
git push -u origin main
```

---

## ✅ PASO 3: Crear PostgreSQL en Render (3 minutos)

1. Ve a: **https://dashboard.render.com**
2. Sign up/Login (usa GitHub para más fácil)
3. Click **"New +"** → **"PostgreSQL"**
4. Configurar:
   - Name: `iica-chile-db`
   - Database: `iica_chile`
   - Region: **Oregon (US West)**
   - Plan: **Free**
5. Click **"Create Database"**
6. Espera 1-2 minutos
7. En la pestaña **"Info"**, copia **"Internal Database URL"**
   - Ejemplo: `postgresql://user:pass@host/database`

---

## ✅ PASO 4: Crear Web Service en Render (5 minutos)

1. En Render Dashboard → **"New +"** → **"Web Service"**
2. Click **"Connect a repository"**
3. Autoriza GitHub si es primera vez
4. Selecciona: `iica-chile-plataforma`
5. Configurar:

```yaml
Name: iica-chile-plataforma
Environment: Python 3
Region: Oregon (US West)
Branch: main
Root Directory: (dejar vacío)
Build Command: pip install -r requirements.txt
Start Command: gunicorn app_mvp:app
```

6. Click **"Advanced"** para agregar variables de entorno

---

## ✅ PASO 5: Configurar Variables de Entorno

Click **"Add Environment Variable"** y agrega:

### Variable 1: DATABASE_URL
```
Key: DATABASE_URL
Value: <pega aquí el Internal Database URL del Paso 3>
```

### Variable 2: SECRET_KEY
```
Key: SECRET_KEY
Value: <genera una clave aleatoria>
```

**Generar SECRET_KEY:**
```powershell
# En PowerShell local
python -c "import secrets; print(secrets.token_hex(32))"
# Copia el resultado
```

### Variable 3: FLASK_ENV
```
Key: FLASK_ENV
Value: production
```

### Variable 4: GEMINI_API_KEY (opcional)
```
Key: GEMINI_API_KEY
Value: <tu API key de Gemini del Paso 1>
```
*Si no tienes la key aún, omite esta variable. Puedes agregarla después.*

---

## ✅ PASO 6: Deploy

1. Click **"Create Web Service"**
2. Render comenzará a:
   - Clonar tu repositorio
   - Instalar dependencias (5-7 min)
   - Iniciar la aplicación
3. **Espera** a que el estado sea **"Live"** (verde)
4. Verás la URL: `https://iica-chile-plataforma.onrender.com`

---

## ✅ PASO 7: Inicializar Base de Datos

Una vez que esté **Live**:

1. En Render → Tu servicio → Pestaña **"Shell"**
2. Ejecuta estos comandos uno por uno:

```bash
# Inicializar tablas
flask --app app_mvp init-db

# Migrar datos
flask --app app_mvp migrate-data

# Verificar
python -c "from models import Fondo; from app_mvp import app; app.app_context().push(); print(f'✅ Fondos: {Fondo.query.count()}')"
```

---

## ✅ PASO 8: Verificar Funcionamiento

Abre tu navegador en: `https://iica-chile-plataforma.onrender.com`

**Checklist:**
- [ ] Página principal carga
- [ ] Se ven fondos en la lista
- [ ] Puedes registrarte
- [ ] Puedes iniciar sesión
- [ ] Dashboard funciona
- [ ] Búsqueda funciona
- [ ] Chatbot responde (si configuraste Gemini)

---

## 🎉 ¡DEPLOY COMPLETADO!

Tu plataforma está en línea en:
```
https://iica-chile-plataforma.onrender.com
```

### Próximos Pasos:
1. Compartir URL con equipo IICA
2. Crear usuarios de prueba
3. Recopilar feedback
4. Iterar mejoras

---

## ⚠️ Troubleshooting

### "Application failed to start"
- Revisa logs en Render
- Verifica que `requirements.txt` esté completo
- Asegúrate que `Start Command` sea: `gunicorn app_mvp:app`

### "No fondos en la base de datos"
```bash
# En Shell de Render
flask --app app_mvp migrate-data
```

### Chatbot no funciona
- Verifica que `GEMINI_API_KEY` esté configurada
- Prueba la API key localmente primero

---

**¿Necesitas ayuda?** Revisa los logs en Render o consulta `GEMINI_AI_GUIDE.md`
