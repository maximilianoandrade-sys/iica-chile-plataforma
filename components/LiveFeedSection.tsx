import { getLiveFeeds, LiveFund } from '@/lib/liveFeed';
import Link from 'next/link';

function UrgencyBadge({ dias }: { dias: number }) {
    if (dias <= 7) return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
            🔴 Cierra en {dias}d
        </span>
    );
    if (dias <= 21) return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
            🟡 {dias} días
        </span>
    );
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
            🟢 {dias} días
        </span>
    );
}

function RelevanceBadge({ nivel }: { nivel: 'Alta' | 'Media' | 'Baja' }) {
    if (nivel === 'Alta') return (
        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[var(--iica-blue)] text-white uppercase tracking-wide">
            ⭐ Relevancia IICA
        </span>
    );
    return (
        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-gray-100 text-gray-500 uppercase tracking-wide">
            Conexo
        </span>
    );
}

function FundCard({ fund }: { fund: LiveFund }) {
    return (
        <div className={`
            group relative flex flex-col gap-2 p-4 rounded-xl border transition-all duration-200
            hover:shadow-md hover:-translate-y-0.5 cursor-pointer
            ${fund.relevanciaIICA === 'Alta'
                ? 'border-blue-200 bg-blue-50/40 hover:border-blue-300'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }
        `}>
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex flex-wrap gap-1.5">
                    <RelevanceBadge nivel={fund.relevanciaIICA} />
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-gray-100 text-gray-500">
                        {fund.ambito}
                    </span>
                </div>
                <UrgencyBadge dias={fund.diasRestantes} />
            </div>

            {/* Nombre */}
            <h3 className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2 group-hover:text-[var(--iica-blue)] transition-colors">
                {fund.nombre}
            </h3>

            {/* Institución */}
            <p className="text-xs text-gray-500 font-medium">{fund.institucion}</p>

            {/* Detalles */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] mt-auto">
                <div className="flex items-center gap-1 text-gray-600">
                    <span className="text-gray-400">💰</span>
                    <span className="truncate">{fund.monto}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                    <span className="text-gray-400">📅</span>
                    <span>Cierre: {fund.fechaCierre}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600 col-span-2">
                    <span className="text-gray-400">👥</span>
                    <span className="truncate">{fund.beneficiarios}</span>
                </div>
            </div>

            {/* CTA */}
            <Link
                href={fund.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--iica-blue)] hover:text-[var(--iica-navy)] transition-colors"
                onClick={e => e.stopPropagation()}
            >
                Ver bases oficiales →
            </Link>
        </div>
    );
}

export default async function LiveFeedSection() {
    const { feeds, lastUpdated, source } = await getLiveFeeds();

    if (feeds.length === 0) return null;

    const altaRelevancia = feeds.filter(f => f.relevanciaIICA === 'Alta');
    const mediaRelevancia = feeds.filter(f => f.relevanciaIICA === 'Media');
    const allShown = [...altaRelevancia, ...mediaRelevancia].slice(0, 12);

    const updateTime = new Date(lastUpdated).toLocaleString('es-CL', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });

    return (
        <section className="mt-8 mb-4" aria-label="Fondos concursables abiertos en tiempo real">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                        <h2 className="text-base font-bold text-gray-800">
                            Fondos Abiertos Ahora
                        </h2>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                            {allShown.length} fondos
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Datos en tiempo real de{' '}
                        <Link
                            href="https://fondos.gob.cl"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-[var(--iica-blue)]"
                        >
                            fondos.gob.cl
                        </Link>
                        {' '}+ fuentes verificadas · Relevantes para sector agropecuario/rural
                    </p>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-gray-400">
                    <span>{source === 'live' ? '🌐 En vivo' : '📋 Datos verificados'}</span>
                    <span>·</span>
                    <span>Actualizado: {updateTime}</span>
                </div>
            </div>

            {/* Grid de fondos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {allShown.map((fund, i) => (
                    <FundCard key={`${fund.url}-${i}`} fund={fund} />
                ))}
            </div>

            {/* Footer */}
            <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <p className="text-[10px] text-gray-400">
                    ⚠️ Verifica siempre las bases oficiales antes de postular. Las fechas y montos pueden cambiar sin previo aviso.
                </p>
                <Link
                    href="https://fondos.gob.cl"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-medium text-[var(--iica-blue)] hover:underline whitespace-nowrap"
                >
                    Ver todos los fondos del Estado →
                </Link>
            </div>
        </section>
    );
}
