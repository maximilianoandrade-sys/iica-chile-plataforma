import { redirect } from 'next/navigation'

/**
 * Página de inicio que redirige a /search
 * 
 * En Next.js 15, redirect() puede ser llamado directamente en Server Components.
 * Next.js maneja internamente la excepción que redirect() lanza para realizar la redirección.
 * 
 * IMPORTANTE: redirect() NO debe estar dentro de bloques try/catch
 */
export default function Home() {
  redirect('/search')
}

