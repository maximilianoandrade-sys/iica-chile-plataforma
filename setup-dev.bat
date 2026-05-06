@echo off
REM Automate setup for iica-chile-plataforma (Branch: feature/pipeline-proyectos-2026-05-06)

echo ============================
echo Checkout feature branch...
git fetch
git checkout feature/pipeline-proyectos-2026-05-06

echo ============================
echo Installing dependencies...
npm install

echo ============================
echo Copying .env.example to .env if needed...
IF NOT EXIST ".env" (
  copy .env.example .env
  echo Filled .env with defaults -- EDIT IT if needed!
) else (
  echo .env found, skipping copy.
)

echo ============================
echo Running Prisma migrations...
npx prisma db push

echo ============================
echo Running tests...
npm run test

echo ============================
echo Starting dev server!
start "" cmd /k "npm run dev"

echo ============================
echo Ready! Open http://localhost:3000/admin/pipeline-dashboard
pause
