# Configuración para Render - IMPORTANTE

## Pasos después del Deploy

Después de que Render cree el servicio, necesitas ejecutar la migración de base de datos:

1. Ve a tu servicio web en Render Dashboard
2. Click en **Shell** (terminal)
3. Ejecuta:
   ```bash
   npx prisma db push
   ```

O mejor aún, agrega esto como un script de post-deploy.

## Alternativa: Usar Migraciones

Si prefieres usar migraciones de Prisma (recomendado para producción):

1. En tu máquina local, después de hacer cambios al schema:
   ```bash
   npx prisma migrate dev --name init
   ```

2. Esto creará una carpeta `prisma/migrations/`

3. En Render, el build automáticamente aplicará las migraciones si están en el repo

## Build Command Actualizado

El build command en `render.yaml` ahora es:
```
npm install && npx prisma generate && npm run build
```

La base de datos se creará con `prisma db push` la primera vez, o puedes hacerlo manualmente desde el Shell de Render.

