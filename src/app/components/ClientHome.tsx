"use client";

import dynamic from 'next/dynamic';

// Import your Home component dynamically with no SSR
const HomeComponent = dynamic(
  () => import('./Home'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }
);

export default function ClientHome() {
  return <HomeComponent />;
} 