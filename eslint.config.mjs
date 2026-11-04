import { defineConfig, globalIgnores } from 'eslint/config';
import nextConfig from 'eslint-config-next/core-web-vitals';

export default defineConfig([
  ...nextConfig,
  {
    rules: {
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  globalIgnores([
    '**/.next/**',
    '**/node_modules/**',
    '**/coverage/**',
    '**/.worktrees/**',
    '**/iica-chile-plataforma/**',
  ]),
]);
