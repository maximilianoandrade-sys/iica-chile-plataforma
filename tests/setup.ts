import '@testing-library/jest-dom';

// ponytail: next/link y next/navigation necesitan el App Router montado; en
// tests de componente no existe, así que los mockeamos globalmente para evitar
// el error "invariant expected app router to be mounted".
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...rest }: any) => {
    const React = jest.requireActual('react');
    return React.createElement('a', { href, ...rest }, children);
  },
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

const originalError = console.error;

beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
