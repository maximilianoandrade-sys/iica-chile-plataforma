import { getEnv, _resetEnvCache } from '@/lib/utils/env';

describe('módulo env', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    _resetEnvCache();
    process.env = { ...OLD_ENV };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('exporta env vars validadas cuando todas las requeridas están seteadas', () => {
    process.env.DATABASE_URL = 'postgresql://localhost/test';
    process.env.ADMIN_SESSION_SECRET = 'secret12345678';
    const env = getEnv();
    expect(env.DATABASE_URL).toBe('postgresql://localhost/test');
    expect(env.ADMIN_SESSION_SECRET).toBe('secret12345678');
  });

  it('lanza error cuando DATABASE_URL falta', () => {
    delete process.env.DATABASE_URL;
    process.env.ADMIN_SESSION_SECRET = 'secret12345678';
    expect(() => getEnv()).toThrow(/DATABASE_URL/);
  });

  it('lanza error cuando ADMIN_SESSION_SECRET es muy corto', () => {
    process.env.DATABASE_URL = 'postgresql://localhost/test';
    process.env.ADMIN_SESSION_SECRET = 'short';
    expect(() => getEnv()).toThrow();
  });

  it('provee undefined para vars opcionales no seteadas', () => {
    process.env.DATABASE_URL = 'postgresql://localhost/test';
    process.env.ADMIN_SESSION_SECRET = 'secret12345678';
    delete process.env.GEMINI_API_KEY;
    const env = getEnv();
    expect(env.GEMINI_API_KEY).toBeUndefined();
  });

  it('cachea el resultado después de la primera llamada', () => {
    process.env.DATABASE_URL = 'postgresql://localhost/test';
    process.env.ADMIN_SESSION_SECRET = 'secret12345678';
    const env1 = getEnv();
    process.env.DATABASE_URL = 'changed';
    const env2 = getEnv();
    expect(env2.DATABASE_URL).toBe('postgresql://localhost/test'); // cached
  });
});
