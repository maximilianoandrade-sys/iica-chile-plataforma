# 🌐 Guía de Despliegue con Dominio Personalizado

## Opciones de Dominio Recomendadas

### Para IICA Chile:
- `proyectos-iica.cl` ⭐ (Recomendado)
- `fondos-iica.cl`
- `iica-proyectos.cl`
- `iica-chile.cl`
- `cooperacion-iica.cl`

### Dominios Internacionales:
- `iica-projects.com`
- `iica-funding.org`
- `iica-chile.org`
- `agricultural-funding.com`

## 🚀 Opción 1: Render.com (GRATIS)

### Pasos:
1. **Registrar dominio** en:
   - [Namecheap](https://www.namecheap.com/) - $8.88/año
   - [GoDaddy](https://www.godaddy.com/) - $12.99/año
   - [Hostinger](https://www.hostinger.com/) - $0.99/año

2. **Configurar en Render:**
   ```bash
   # 1. Conecta tu repositorio GitHub
   # 2. Build Command: pip install -r requirements.txt
   # 3. Start Command: python app.py
   # 4. Environment: Python 3
   ```

3. **Configurar DNS:**
   ```
   Tipo: CNAME
   Nombre: www
   Valor: tu-app.onrender.com
   
   Tipo: A
   Nombre: @
   Valor: 76.76.19.61
   ```

4. **Agregar dominio en Render:**
   - Dashboard → Settings → Custom Domains
   - Agregar: `proyectos-iica.cl`
   - Agregar: `www.proyectos-iica.cl`

## 🚀 Opción 2: Railway.app (GRATIS)

### Pasos:
1. **Conectar repositorio** a Railway
2. **Configurar variables de entorno:**
   ```
   PORT=5000
   PYTHON_VERSION=3.11
   ```
3. **Agregar dominio personalizado:**
   - Settings → Domains
   - Agregar dominio personalizado
4. **Configurar DNS** (igual que Render)

## 🚀 Opción 3: Heroku (PAGO - $7/mes)

### Pasos:
```bash
# 1. Instalar Heroku CLI
# 2. Login
heroku login

# 3. Crear app
heroku create proyectos-iica

# 4. Configurar variables
heroku config:set PORT=5000

# 5. Deploy
git push heroku main

# 6. Agregar dominio
heroku domains:add proyectos-iica.cl
heroku domains:add www.proyectos-iica.cl
```

## 🔧 Configuración DNS Detallada

### Para Render.com:
```
Tipo: CNAME
Nombre: www
Valor: tu-app.onrender.com
TTL: 3600

Tipo: A
Nombre: @
Valor: 76.76.19.61
TTL: 3600
```

### Para Railway.app:
```
Tipo: CNAME
Nombre: www
Valor: tu-app.railway.app
TTL: 3600

Tipo: CNAME
Nombre: @
Valor: tu-app.railway.app
TTL: 3600
```

## 📋 Checklist de Despliegue

### Antes del Despliegue:
- [ ] Repositorio en GitHub
- [ ] Archivo `requirements.txt` actualizado
- [ ] Archivo `Procfile` configurado
- [ ] Variables de entorno definidas

### Después del Despliegue:
- [ ] Dominio configurado
- [ ] SSL/HTTPS funcionando
- [ ] Redirección www configurada
- [ ] Favicon funcionando
- [ ] Aplicación accesible

## 💰 Costos Estimados

### Dominio:
- **.cl**: $15-25/año
- **.com**: $8-12/año
- **.org**: $10-15/año

### Hosting:
- **Render**: GRATIS (con límites)
- **Railway**: GRATIS (con límites)
- **Heroku**: $7/mes
- **DigitalOcean**: $5/mes

## 🎯 Recomendación Final

**Para IICA Chile, recomiendo:**
1. **Dominio**: `proyectos-iica.cl` ($20/año)
2. **Hosting**: Render.com (GRATIS)
3. **SSL**: Automático con Render
4. **Costo total**: $20/año

## 📞 Soporte Técnico

Si necesitas ayuda con la configuración:
1. Revisa la documentación de Render/Railway
2. Contacta al soporte del registrador de dominios
3. Verifica la propagación DNS en: https://dnschecker.org/
