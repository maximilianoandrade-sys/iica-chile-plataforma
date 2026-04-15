'use client';

import dynamic from 'next/dynamic';

// ComparadorModal → usa export nombrado (ComparadorProvider)
export const LazyComparadorModal = dynamic(
  () => import('@/components/ComparadorModal').then(mod => mod.ComparadorProvider),
  {
    loading: () => <div className="animate-pulse bg-gray-100 rounded-xl h-96" />,
    ssr: false
  }
);

// ProposalGenerator → usa export nombrado (ProposalGenerator)
export const LazyProposalGenerator = dynamic(
  () => import('@/components/ProposalGenerator').then(mod => mod.ProposalGenerator),
  {
    loading: () => <div className="animate-pulse bg-gray-100 rounded-xl h-64" />,
    ssr: false
  }
);

// SmartAssistant → usa export default
export const LazySmartAssistant = dynamic(
  () => import('@/components/SmartAssistant'),
  {
    loading: () => <div className="animate-pulse bg-gray-100 rounded-xl h-48" />,
    ssr: false
  }
);

// ImpactDashboard → usa export default
export const LazyImpactDashboard = dynamic(
  () => import('@/components/ImpactDashboard'),
  {
    loading: () => <div className="animate-pulse bg-gray-100 rounded-xl h-80" />,
    ssr: false
  }
);

// ProjectExplorer → usa export default
export const LazyProjectExplorer = dynamic(
  () => import('@/components/ProjectExplorer'),
  {
    loading: () => <div className="animate-pulse bg-gray-100 rounded-xl h-64" />,
    ssr: true
  }
);
