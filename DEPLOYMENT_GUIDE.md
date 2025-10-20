# 🚀 GUÍA DE DESPLIEGUE - PLATAFORMA IICA CHILE

## 📋 **OPCIONES DE HOSTING GRATUITO**

### **1. RENDER.COM (Recomendado)**

#### **Pasos para desplegar en Render:**

1. **Crear cuenta en Render.com**
   - Ve a https://render.com
   - Regístrate con GitHub

2. **Conectar repositorio**
   - Conecta tu repositorio de GitHub
   - Selecciona el repositorio del proyecto

3. **Configuración del servicio**
   ```
   Nombre: iica-chile-platform
   Entorno: Python
   Plan: Free
   Comando de build: pip install -r requirements.txt
   Comando de inicio: gunicorn app_working:app
   ```

4. **Variables de entorno**
   ```
   PYTHON_VERSION=3.11.0
   FLASK_ENV=production
   ```

5. **Desplegar**
   - Click en "Create Web Service"
   - Render automáticamente desplegará tu aplicación

#### **URL resultante:**
```
https://iica-chile-platform.onrender.com
```

---

### **2. HEROKU**

#### **Pasos para desplegar en Heroku:**

1. **Instalar Heroku CLI**
   ```bash
   # Windows
   https://devcenter.heroku.com/articles/heroku-cli
   
   # Verificar instalación
   heroku --version
   ```

2. **Login en Heroku**
   ```bash
   heroku login
   ```

3. **Crear aplicación**
   ```bash
   heroku create iica-chile-platform
   ```

4. **Configurar variables de entorno**
   ```bash
   heroku config:set FLASK_ENV=production
   heroku config:set PYTHON_VERSION=3.11.0
   ```

5. **Desplegar**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

#### **URL resultante:**
```
https://iica-chile-platform.herokuapp.com
```

---

### **3. RAILWAY**

#### **Pasos para desplegar en Railway:**

1. **Crear cuenta en Railway**
   - Ve a https://railway.app
   - Conecta con GitHub

2. **Nuevo proyecto**
   - Click en "New Project"
   - Selecciona "Deploy from GitHub repo"
   - Elige tu repositorio

3. **Configuración automática**
   - Railway detectará automáticamente que es una aplicación Python
   - Usará el archivo `requirements.txt`

4. **Variables de entorno**
   ```
   PYTHON_VERSION=3.11.0
   FLASK_ENV=production
   ```

#### **URL resultante:**
```
https://iica-chile-platform-production.up.railway.app
```

---

### **4. VERCEL**

#### **Pasos para desplegar en Vercel:**

1. **Instalar Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Configurar proyecto**
   ```bash
   vercel
   ```

3. **Archivo vercel.json**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "app_working.py",
         "use": "@vercel/python"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "app_working.py"
       }
     ]
   }
   ```

---

## 🔧 **CONFIGURACIÓN ADICIONAL**

### **Archivos necesarios:**

1. **requirements.txt** ✅ (Ya creado)
2. **runtime.txt** ✅ (Ya creado)
3. **render.yaml** ✅ (Ya creado)
4. **Procfile** (Para Heroku)

### **Variables de entorno recomendadas:**

```bash
FLASK_ENV=production
PYTHON_VERSION=3.11.0
FLASK_APP=app_working.py
```

---

## 📊 **COMPARACIÓN DE PLATAFORMAS**

| Plataforma | Gratuito | Fácil | Velocidad | Recomendado |
|------------|----------|-------|-----------|-------------|
| **Render** | ✅ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ✅ |
| **Heroku** | ✅ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ✅ |
| **Railway** | ✅ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ |
| **Vercel** | ✅ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐ |

---

## 🎯 **RECOMENDACIÓN FINAL**

**Para tu proyecto, recomiendo RENDER.COM porque:**

- ✅ **Completamente gratuito**
- ✅ **Muy fácil de configurar**
- ✅ **Soporte nativo para Python/Flask**
- ✅ **Deploy automático desde GitHub**
- ✅ **SSL incluido**
- ✅ **Dominio personalizado disponible**

---

## 🚀 **PASOS RÁPIDOS PARA RENDER**

1. **Sube tu código a GitHub**
2. **Ve a render.com**
3. **Conecta tu repositorio**
4. **Configura:**
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn app_working:app`
5. **Click "Deploy"**
6. **¡Listo! Tu app estará online**

---

## 📞 **SOPORTE**

Si tienes problemas con el despliegue, revisa:
- Los logs de la plataforma
- Que todos los archivos estén en el repositorio
- Que las dependencias estén correctas en requirements.txt
