/**
 * SCRIPT DE VERIFICACIÓN PRE-DEPLOY (PRE-FLIGHT GATE)
 * Ejecuta validaciones estrictas de TypeScript, Linting y Tests Unitarios
 * antes de desplegar en Vercel para garantizar cero tiempo de inactividad.
 *
 * Uso: npm run pre-deploy
 */

import { execSync } from 'child_process';

interface Step {
  name: string;
  command: string;
}

const steps: Step[] = [
  { name: '1. Verificación de Tipos TypeScript (tsc --noEmit)', command: 'npm run typecheck' },
  { name: '2. Auditoría Estática de Código (ESLint)', command: 'npm run lint' },
  { name: '3. Ejecución de Tests Unitarios (Jest)', command: 'npm test -- --passWithNoTests --silent --runInBand' },
];

console.log('\n============================================================');
console.log('🌾 RADAR IICA CHILE — VERIFICACIÓN PRE-DEPLOY (OCTUBRE 2026)');
console.log('============================================================\n');

let allPassed = true;

for (const step of steps) {
  process.stdout.write(`⏳ Ejecutando: ${step.name}... `);
  const startTime = Date.now();
  try {
    execSync(step.command, { stdio: 'pipe', encoding: 'utf-8' });
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\x1b[32m✓ EXITOSO (${elapsed}s)\x1b[0m`);
  } catch (err: unknown) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\x1b[31m✗ FALLÓ (${elapsed}s)\x1b[0m`);
    if (err && typeof err === 'object' && 'stdout' in err) {
      console.error('\n' + String((err as { stdout?: string }).stdout || (err as { stderr?: string }).stderr));
    }
    allPassed = false;
    break;
  }
}

console.log('\n------------------------------------------------------------');
if (allPassed) {
  console.log('\x1b[32m✔ TODOS LOS CHEQUEOS PASARON: Repositorio listo para deploy en Vercel.\x1b[0m\n');
  process.exit(0);
} else {
  console.log('\x1b[31m✖ PRE-DEPLOY FALLÓ: Corrige los errores antes de hacer push o deploy.\x1b[0m\n');
  process.exit(1);
}
