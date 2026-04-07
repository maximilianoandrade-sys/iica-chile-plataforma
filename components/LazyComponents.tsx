'use client';

import dynamic from 'next/dynamic';

export const LazyComparadorModal = dynamic(
  () => import('@/components/ComparadorModal').then(mod => mod.default),
  { 
    loading: () => <div className="animate-pulse bg-gray-100 rounded-xl h-96" />,
    ssr: false 
  }
);

export const LazyProposalGenerator = dynamic(
  () => import('@/components/ProposalGenerator').then(mod => mod.default),
  { 
    loading: () => <div className="animate-pulse bg-gray-100 rounded-xl h-64" />,
    ssr: false 
  }
);

export const LazySmartAssistant = dynamic(
  () => import('@/components/SmartAssistant').then(mod => mod.default),
  { 
    loading: () => <div className="animate-pulse bg-gray-100 rounded-xl h-48" />,
    ssr: false 
  }
);

export const LazyImpactDashboard = dynamic(
  () => import('@/components/ImpactDashboard').then(mod => mod.default),
  { 
    loading: () => <div className="animate-pulse bg-gray-100 rounded-xl h-80" />,
    ssr: false 
  }
);

export const LazyProjectExplorer = dynamic(
  () => import('@/components/ProjectExplorer').then(mod => mod.default),
  { 
    loading: () => <div className="animate-pulse bg-gray-100 rounded-xl h-64" />,
    ssr: true 
  }
);
