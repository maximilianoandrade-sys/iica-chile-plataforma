# Guía rápida para correr en local — feature/pipeline-proyectos-2026-05-06

## 1. Cambia a la rama de desarrollo

```bash
git fetch
git checkout feature/pipeline-proyectos-2026-05-06
```

## 2. Instala dependencias

```bash
npm install
# o si usas yarn
yarn install
```

## 3. Configura archivo `.env`

Copia `.env.example` a `.env` y personalízalo con tus credenciales:

```
cp .env.example .env
# (luego edita .env según tus valores de DB y servicios)
```
Ejemplo:
```
DATABASE_URL=postgresql://usuario:clave@host:puerto/db
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## 4. Aplica migraciones de base de datos

```bash
npx prisma migrate dev
# o mínimamente
npx prisma db push
```

## 5. Corre la app en modo desarrollo

```bash
npm run dev
# o
yarn dev
```
Ir a:
- http://localhost:3000/admin/pipeline-dashboard
- http://localhost:3000/admin/projects/needsReview

## 6. Corre los tests locales (opcional, recomendado)

```bash
npm run test
# o
npx vitest
```

## 7. Simula ingesta/pipeline si lo deseas

```bash
npm run pipeline:ingest
# o ejecuta el script de ingesta/manual
```

---

Para dudas o problemas, consulta el plan en:
`docs/superpowers/plans/2026-05-06-pipeline-proyectos.md`

¡Listo! Sistema funcionando en local sobre la rama de feature 🚀
