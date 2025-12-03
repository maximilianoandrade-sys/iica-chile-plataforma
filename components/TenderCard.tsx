interface Tender {
  id: number;
  title: string;
  organization: string;
  location: string;
  locationId: string;
  sectors: string[];
  status: string;
  budget: number;
  deadline: string;
  description?: string;
  link?: string;
  applicationLink?: string;
}

interface TenderCardProps {
  tender: Tender;
}

export default function TenderCard({ tender }: TenderCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'closed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open':
        return 'ABIERTO';
      case 'closed':
        return 'CERRADO';
      case 'draft':
        return 'BORRADOR';
      default:
        return status.toUpperCase();
    }
  };

  return (
    <article className="bg-white p-6 rounded-lg shadow border hover:shadow-lg transition-shadow duration-200 h-full flex flex-col">
      <div className="flex justify-between items-start mb-3">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(tender.status)}`}>
          {getStatusLabel(tender.status)}
        </span>
        <span className="font-bold text-lg text-gray-900">${tender.budget.toLocaleString('es-CL')}</span>
      </div>
      
      <h3 className="font-semibold text-lg mb-3 text-gray-900 line-clamp-2">{tender.title}</h3>
      
      {tender.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{tender.description}</p>
      )}
      
      <div className="text-sm text-gray-700 space-y-2 flex-grow">
        <p>
          <strong className="text-gray-900">Organización:</strong> {tender.organization}
        </p>
        <p>
          <strong className="text-gray-900">Ubicación:</strong> {tender.location}
        </p>
        <p>
          <strong className="text-gray-900">Fecha límite:</strong> {new Date(tender.deadline).toLocaleDateString('es-CL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>
      
      {(tender.link || tender.applicationLink) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {tender.applicationLink && tender.applicationLink !== '#' && (
            <a
              href={tender.applicationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
            >
              Ver Detalles y Postular
            </a>
          )}
          {(!tender.applicationLink || tender.applicationLink === '#') && tender.link && tender.link !== '#' && (
            <a
              href={tender.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
            >
              Ver Más Información
            </a>
          )}
        </div>
      )}
    </article>
  );
}
