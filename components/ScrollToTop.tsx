import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
  return (
    <a
      href="#top"
      className="fixed bottom-6 right-6 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      aria-label="Volver arriba"
    >
      <ArrowUp className="h-5 w-5" />
    </a>
  );
}
